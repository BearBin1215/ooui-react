import { describe, expect, it } from "vitest";
import {
  advancePrefixSearch,
  findRelativeSelectableItem,
  getFirstFocusable,
  getFocusableElements,
  getSelectableValues,
  getVisibleBounds,
  isComposingKeyEvent,
  resolveElement,
  resolveOptionDisabled,
  resolveSelectableValue,
  sanitizeUrl,
  scrollOptionIntoView,
} from "./utils";

/**
 * utils.ts纯函数的契约测试：相对导航（键盘导航公共口径，对齐原版SelectWidget）、
 * 选择集的判定与派生、非法受控值回退、选项禁用的组继承（以上为Select/Dropdown/
 * DropdownInput/ComboBoxInput/RadioSelect系/TabSelect/CheckboxMultiselect等选择族
 * 组件共用）、浮层锚点解析。
 */
describe("findRelativeSelectableItem", () => {
  // 边界规则对齐原版SelectWidget.findRelativeSelectableItem：start不在集合内时
  // 正向自首项、反向自末项起步；wrap时端点环绕（最多扫一整圈）；filter用于前缀跳转。

  const values = ["a", "b", "c", "d"];

  it("空集合返回undefined", () => {
    expect(findRelativeSelectableItem([], "a", 1)).toBeUndefined();
  });

  it("从start不含自身正向移动一步", () => {
    expect(findRelativeSelectableItem(values, "a", 1)).toBe("b");
    expect(findRelativeSelectableItem(values, "c", 1)).toBe("d");
  });

  it("反向移动一步", () => {
    expect(findRelativeSelectableItem(values, "d", -1)).toBe("c");
  });

  it("端点环绕（wrap缺省为true）", () => {
    expect(findRelativeSelectableItem(values, "d", 1)).toBe("a");
    expect(findRelativeSelectableItem(values, "a", -1)).toBe("d");
  });

  it("wrap=false时越界钳制在端点（对齐原版返回沿途最后有效项）", () => {
    expect(findRelativeSelectableItem(values, "d", 1, undefined, false)).toBe("d");
    expect(findRelativeSelectableItem(values, "a", -1, undefined, false)).toBe("a");
    expect(findRelativeSelectableItem(values, "b", -10, undefined, false)).toBe("a");
    expect(findRelativeSelectableItem(values, "c", 10, undefined, false)).toBe("d");
  });

  it("多步offset按方向跳过对应步数", () => {
    expect(findRelativeSelectableItem(values, "a", 2)).toBe("c");
    expect(findRelativeSelectableItem(values, "b", -2)).toBe("d");
  });

  it("start不在集合内时正向自首项、反向自末项起步", () => {
    expect(findRelativeSelectableItem(values, "z", 1)).toBe("a");
    expect(findRelativeSelectableItem(values, "z", -1)).toBe("d");
  });

  it("start为undefined时正向自首项、反向自末项起步", () => {
    expect(findRelativeSelectableItem(values, undefined, 1)).toBe("a");
    expect(findRelativeSelectableItem(values, undefined, -1)).toBe("d");
  });

  it("filter跳过不匹配项", () => {
    expect(findRelativeSelectableItem(values, "a", 1, (value) => value === "c")).toBe(
      "c",
    );
    expect(findRelativeSelectableItem(values, "a", -1, (value) => value === "c")).toBe(
      "c",
    );
  });

  it("filter无匹配项时环绕一整圈后返回undefined", () => {
    expect(findRelativeSelectableItem(values, "a", 1, () => false)).toBeUndefined();
  });

  it("数值型值同样按集合顺序导航", () => {
    expect(findRelativeSelectableItem([10, 20, 30], 10, 1)).toBe(20);
    expect(findRelativeSelectableItem([10, 20, 30], 30, 1)).toBe(10);
  });
});

describe("advancePrefixSearch（前缀跳转单字符推进）", () => {
  /** 文本口径直接用值本身（值即选项label的替身） */
  const values = ["apple", "banana", "avocado"];
  const identity = (value: string) => value;

  it("首字符命中首个前缀匹配项", () => {
    const state = { buffer: "" };
    expect(advancePrefixSearch(state, "a", values, identity, undefined)).toBe("apple");
    expect(state.buffer).toBe("a");
  });

  it("后续字符并入缓冲收窄匹配", () => {
    const state = { buffer: "a" };
    expect(advancePrefixSearch(state, "p", values, identity, "apple")).toBe("apple");
    expect(state.buffer).toBe("ap");
  });

  it("连打同一字符在同前缀项间循环", () => {
    const state = { buffer: "a" };
    expect(advancePrefixSearch(state, "a", values, identity, "apple")).toBe("avocado");
    // 末项再连打回绕到首个同前缀项
    expect(advancePrefixSearch(state, "a", values, identity, "avocado")).toBe("apple");
    // 缓冲保持单字符（连打不并入）
    expect(state.buffer).toBe("a");
  });

  it("当前项不匹配新缓冲时自其后向后找", () => {
    const state = { buffer: "" };
    // 起点在banana上，输入'a'自其后找首个a开头项即avocado
    expect(advancePrefixSearch(state, "a", values, identity, "banana")).toBe("avocado");
  });

  it("无任何前缀匹配时返回undefined且缓冲已并入该字符", () => {
    const state = { buffer: "" };
    expect(advancePrefixSearch(state, "z", values, identity, undefined)).toBeUndefined();
    expect(state.buffer).toBe("z");
  });

  it("连打同一字符且无导航起点时直接扫描", () => {
    const state = { buffer: "a" };
    // 原版连打分支先判断item是否存在：无起点时跳过步进，直接按缓冲扫描
    expect(advancePrefixSearch(state, "a", values, identity, undefined)).toBe("apple");
    expect(state.buffer).toBe("a");
  });

  it("匹配按原版normalizeForMatching归一化：大小写、两侧trim、连续空白折叠与NFC", () => {
    const texts: Record<string, string> = { apple: "  Apple  " };
    expect(
      advancePrefixSearch(
        { buffer: "" },
        "A",
        ["apple"],
        (value) => texts[value],
        undefined,
      ),
    ).toBe("apple");
    // 选项文本含nbsp（\s覆盖）与NFD形式的é，归一化后仍可命中
    const nbspTexts: Record<string, string> = {
      café: "caf\u00A0\u00E9".normalize("NFD"),
    };
    expect(
      advancePrefixSearch(
        { buffer: "" },
        "c",
        ["café"],
        (value) => nbspTexts[value],
        undefined,
      ),
    ).toBe("café");
  });

  // 缓冲时长的行为后果由hooks/prefixSearch.test.tsx的超时用例看住，
  // 此处不再断言常量本身（那只会随常量改动而红，检不出行为回归）
});

describe("getSelectableValues（可选值序列）", () => {
  /** 分组标题在选项集中即"没有value的项"（本函数只读value/disabled） */
  const groupTitle = { label: "分组" } as { value?: string | number; disabled?: boolean };

  it("跳过无value的分组标题与禁用项，保持展示顺序", () => {
    expect(
      getSelectableValues([
        { value: "a" },
        groupTitle,
        { value: "b", disabled: true },
        { value: "c" },
      ]),
    ).toEqual(["a", "c"]);
  });

  it("无可选项时返回空数组", () => {
    expect(getSelectableValues([groupTitle, { value: "b", disabled: true }])).toEqual([]);
    expect(getSelectableValues([])).toEqual([]);
  });

  it("数值型value原样保留（不做String归一化）", () => {
    expect(getSelectableValues([{ value: 1 }, { value: 2 }])).toEqual([1, 2]);
  });

  it("仅undefined视为无value：0与空串都是合法可选值（按!== undefined判定，不走真值）", () => {
    expect(getSelectableValues([{ value: 0 }, { value: "" }])).toEqual([0, ""]);
  });
});

describe("resolveSelectableValue（非法受控值回退）", () => {
  it("值在可选值集合内则原样返回", () => {
    expect(resolveSelectableValue("b", ["a", "b", "c"])).toBe("b");
  });

  it("值非法（不在集合内）时回退首个可选值", () => {
    expect(resolveSelectableValue("z", ["a", "b", "c"])).toBe("a");
  });

  it("值缺失时取首个可选值，无可选值时为undefined", () => {
    expect(resolveSelectableValue(undefined, ["a", "b"])).toBe("a");
    expect(resolveSelectableValue("a", [])).toBeUndefined();
  });
});

describe("resolveOptionDisabled（选项禁用态的组继承）", () => {
  it("选项自身disabled为真时禁用", () => {
    expect(resolveOptionDisabled({ disabled: true })).toBe(true);
  });

  it("组禁用时选项一律禁用（原版语义：选项无法在禁用组内单独启用）", () => {
    expect(resolveOptionDisabled({}, true)).toBe(true);
    expect(resolveOptionDisabled({ disabled: false }, true)).toBe(true);
  });

  it("两者皆否时为否（未声明disabled时透传undefined）", () => {
    expect(resolveOptionDisabled({ disabled: false }, false)).toBe(false);
    expect(resolveOptionDisabled({})).toBeUndefined();
  });
});

describe("resolveElement（ref与真实元素的统一解析）", () => {
  const element = { id: "anchor" } as unknown as HTMLElement;

  it("RefObject取其current", () => {
    expect(resolveElement({ current: element })).toBe(element);
  });

  it("current为null时返回null（ref已挂载但尚未赋值）", () => {
    expect(resolveElement({ current: null })).toBeNull();
  });

  it("真实元素原样返回（以current为判别特征，无需依赖instanceof HTMLElement）", () => {
    expect(resolveElement(element)).toBe(element);
  });

  it("null/undefined返回null（浮层锚点未就绪）", () => {
    expect(resolveElement(null)).toBeNull();
    expect(resolveElement(undefined)).toBeNull();
  });
});

describe("getVisibleBounds（滚动容器可视区边界）", () => {
  // 本组跑在browser环境（真实DOM）：useAnchoredPanelLayout与Popup的裁剪/滚出判定共用。
  // 滚动条沟槽在classic/overlay滚动条下宽度不同，断言按自洽关系写，不假定具体沟槽宽度

  it("视口为documentElement的clientWidth/Height矩形（不含滚动条沟槽，对齐原版clip口径）", () => {
    expect(getVisibleBounds(document.documentElement)).toEqual({
      top: 0,
      left: 0,
      right: document.documentElement.clientWidth,
      bottom: document.documentElement.clientHeight,
    });
  });

  it("无滚动条（overflow:visible）的元素容器可视区即其rect", () => {
    const el = document.createElement("div");
    el.style.cssText = "position:absolute;top:0;left:0;width:100px;height:80px;";
    document.body.appendChild(el);
    try {
      const rect = el.getBoundingClientRect();
      expect(getVisibleBounds(el)).toEqual({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
      });
    } finally {
      el.remove();
    }
  });

  it("overflow:scroll的元素容器右/下缘扣除滚动条沟槽，上/左缘保持rect值", () => {
    const el = document.createElement("div");
    el.style.cssText =
      "position:absolute;top:0;left:0;width:100px;height:80px;overflow:scroll;";
    el.innerHTML = '<div style="width:300px;height:300px;"></div>';
    document.body.appendChild(el);
    try {
      const rect = el.getBoundingClientRect();
      const bounds = getVisibleBounds(el);
      expect(bounds.top).toBe(rect.top);
      expect(bounds.left).toBe(rect.left);
      expect(bounds.right).toBe(rect.right - (el.offsetWidth - el.clientWidth));
      expect(bounds.bottom).toBe(rect.bottom - (el.offsetHeight - el.clientHeight));
      // 沟槽扣除不得扩大可视区
      expect(bounds.right).toBeLessThanOrEqual(rect.right);
      expect(bounds.bottom).toBeLessThanOrEqual(rect.bottom);
    } finally {
      el.remove();
    }
  });
});

describe("scrollOptionIntoView（选项滚入就近可滚动容器，不触达window）", () => {
  // browser环境（真实布局）：菜单高亮滚动的落点。核心回归——收起菜单停到屏外哨兵位时
  // 不得把整页拽到顶部（就近容器为文档根即不滚，见函数注释与DEVIATIONS dev-select-scroll-into-view）

  /** 造一个可纵向滚动的容器（60px高）内含6个30px选项（内容180px、可滚） */
  const makeScrollList = () => {
    const container = document.createElement("div");
    container.style.cssText =
      "position:absolute;top:0;left:0;width:120px;height:60px;overflow-y:auto;";
    for (let i = 0; i < 6; i++) {
      const opt = document.createElement("div");
      opt.style.cssText = "height:30px;";
      container.appendChild(opt);
    }
    document.body.appendChild(container);
    return container;
  };

  it("溢出容器内向下滚动露出视口外的选项，且不动页面", () => {
    const container = makeScrollList();
    try {
      const winY = window.scrollY;
      const target = container.children[5] as HTMLElement; // 末项，在60px视口下方
      scrollOptionIntoView(target);
      expect(container.scrollTop).toBeGreaterThan(0);
      const cr = container.getBoundingClientRect();
      const tr = target.getBoundingClientRect();
      expect(tr.bottom).toBeLessThanOrEqual(cr.bottom + 0.5); // 下缘齐平进入可视区
      expect(window.scrollY).toBe(winY); // 页面未被滚动
    } finally {
      container.remove();
    }
  });

  it("选项已在视口内则不滚动", () => {
    const container = makeScrollList();
    try {
      scrollOptionIntoView(container.children[0] as HTMLElement);
      expect(container.scrollTop).toBe(0);
    } finally {
      container.remove();
    }
  });

  it("已滚到底时回滚露出首项（block:nearest上滚至上缘齐平）", () => {
    const container = makeScrollList();
    try {
      container.scrollTop = 120; // 滚到底（scrollHeight180 - client60）
      scrollOptionIntoView(container.children[0] as HTMLElement);
      expect(container.scrollTop).toBe(0);
    } finally {
      container.remove();
    }
  });

  it("就近可滚动容器为文档根时不滚页面（收起菜单停屏外哨兵位的回归）", () => {
    const spacer = document.createElement("div");
    spacer.style.cssText = "height:5000px;";
    document.body.appendChild(spacer);
    // 非滚动列表（overflow visible），停在屏外哨兵位：就近容器回落documentElement
    const list = document.createElement("div");
    list.style.cssText = "position:absolute;top:-9999px;left:-9999px;width:120px;";
    const opt = document.createElement("div");
    opt.style.cssText = "height:30px;";
    list.appendChild(opt);
    document.body.appendChild(list);
    window.scrollTo(0, 400);
    try {
      const before = window.scrollY;
      scrollOptionIntoView(opt);
      expect(window.scrollY).toBe(before); // 页面纹丝不动，不跳顶
    } finally {
      spacer.remove();
      list.remove();
      window.scrollTo(0, 0);
    }
  });
});

describe("isComposingKeyEvent（IME合成判据）", () => {
  it("原生键盘事件：isComposing或keyCode 229任一命中即判为合成期", () => {
    expect(isComposingKeyEvent({ isComposing: true, keyCode: 13 })).toBe(true);
    expect(isComposingKeyEvent({ isComposing: false, keyCode: 229 })).toBe(true);
    expect(isComposingKeyEvent({ isComposing: false, keyCode: 13 })).toBe(false);
  });

  it("React合成事件：经nativeEvent读取同判据", () => {
    expect(isComposingKeyEvent({ nativeEvent: { isComposing: true, keyCode: 13 } })).toBe(
      true,
    );
    expect(
      isComposingKeyEvent({ nativeEvent: { isComposing: false, keyCode: 229 } }),
    ).toBe(true);
    expect(
      isComposingKeyEvent({ nativeEvent: { isComposing: false, keyCode: 13 } }),
    ).toBe(false);
  });
});

describe("sanitizeUrl（URL协议白名单净化）", () => {
  // 对齐原版OO.ui.isSafeUrl：白名单协议与相对/查询/片段前缀原样返回，其余加`./`前缀中和
  it("白名单协议原样返回", () => {
    expect(sanitizeUrl("https://example.com/a?b=1")).toBe("https://example.com/a?b=1");
    expect(sanitizeUrl("mailto:someone@example.com")).toBe("mailto:someone@example.com");
    expect(sanitizeUrl("tel:+123456")).toBe("tel:+123456");
  });

  it("相对/绝对路径、查询与片段前缀原样返回（'//'协议相对URL亦命中'/'分支）", () => {
    expect(sanitizeUrl("/a/b")).toBe("/a/b");
    expect(sanitizeUrl("./a")).toBe("./a");
    expect(sanitizeUrl("?q=1")).toBe("?q=1");
    expect(sanitizeUrl("#frag")).toBe("#frag");
    expect(sanitizeUrl("//example.com/a")).toBe("//example.com/a");
  });

  it("危险协议加'./'前缀中和成相对路径", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("./javascript:alert(1)");
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe(
      "./data:text/html,<script>alert(1)</script>",
    );
    expect(sanitizeUrl("vbscript:msgbox(1)")).toBe("./vbscript:msgbox(1)");
  });

  it("空串视为安全（对齐原版）", () => {
    expect(sanitizeUrl("")).toBe("");
  });
});

describe("getFocusableElements / getFirstFocusable（可聚焦元素判定）", () => {
  // 跑在browser环境（真实DOM）：CSS选择器之外的「可见 + 未禁用」运行期兜底，
  // 对齐原版OO.ui.isFocusableElement。Dialog焦点陷阱、Popup的Tab边界与布局自动聚焦共用
  const mount = (html: string): HTMLElement => {
    const host = document.createElement("div");
    host.innerHTML = html;
    document.body.appendChild(host);
    return host;
  };

  it("按文档顺序取可聚焦元素", () => {
    const host = mount('<a href="#a">甲</a><input><button>乙</button>');
    try {
      expect(getFocusableElements(host).map((el) => el.tagName)).toEqual([
        "A",
        "INPUT",
        "BUTTON",
      ]);
    } finally {
      host.remove();
    }
  });

  it("排除tabIndex=-1，但仅对非天然可聚焦元素生效（对齐原版）", () => {
    const host = mount(
      '<div tabindex="-1">甲</div><div tabindex="0">乙</div><button tabindex="-1">丙</button>',
    );
    try {
      // div靠tabindex入选、-1即排除；button属原版「天然可聚焦」清单，tabindex=-1不使其退出
      expect(getFocusableElements(host).map((el) => el.textContent)).toEqual([
        "乙",
        "丙",
      ]);
    } finally {
      host.remove();
    }
  });

  it("排除display:none子树（选择器照常命中，由运行期可见性判定排除）", () => {
    const host = mount('<button style="display:none">甲</button><button>乙</button>');
    try {
      expect(getFocusableElements(host).map((el) => el.textContent)).toEqual(["乙"]);
    } finally {
      host.remove();
    }
  });

  it("排除祖先visibility:hidden", () => {
    const host = mount(
      '<div style="visibility:hidden"><button>甲</button></div><button>乙</button>',
    );
    try {
      expect(getFocusableElements(host).map((el) => el.textContent)).toEqual(["乙"]);
    } finally {
      host.remove();
    }
  });

  it("排除content-visibility:hidden子树（IndexLayout未激活面板的hidden='until-found'形态）", () => {
    const host = mount(
      '<div style="content-visibility:hidden"><button>甲</button></div><button>乙</button>',
    );
    try {
      expect(getFocusableElements(host).map((el) => el.textContent)).toEqual(["乙"]);
    } finally {
      host.remove();
    }
  });

  it("checkVisibility不可用时回退rects与祖先visibility遍历", () => {
    const host = mount(
      '<button style="display:none">甲</button>' +
        '<div style="visibility:hidden"><button>乙</button></div>' +
        "<button>丙</button>",
    );
    // 以自有属性遮蔽原型上的checkVisibility，模拟不支持该API的浏览器
    const proto = HTMLElement.prototype as unknown as { checkVisibility?: unknown };
    const original = proto.checkVisibility;
    proto.checkVisibility = undefined;
    try {
      expect(getFocusableElements(host).map((el) => el.textContent)).toEqual(["丙"]);
    } finally {
      proto.checkVisibility = original;
      host.remove();
    }
  });

  it("getFirstFocusable取首个可聚焦者（跳过不可见项），根为空时为undefined", () => {
    const host = mount('<button style="display:none">甲</button><button>乙</button>');
    try {
      expect(getFirstFocusable(host)?.textContent).toBe("乙");
      expect(getFirstFocusable(null)).toBeUndefined();
    } finally {
      host.remove();
    }
  });
});

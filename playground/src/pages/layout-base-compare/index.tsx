import { useEffect, useRef, useState } from "react";
import { Layout, TabPanelLayout } from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import { appendValueOutput, useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

type LayoutBaseUi = {
  Layout: new (config?: Record<string, unknown>) => {
    $element: {
      append: (content: string | Node) => unknown;
      hasClass: (cls: string) => boolean;
      attr: (name: string, value: string) => unknown;
    };
    toggle: (show?: boolean) => unknown;
  };
  TabPanelLayout: new (
    name: string,
    config?: Record<string, unknown>,
  ) => {
    $element: { append: (content: string | Node) => unknown };
    setActive: (active: boolean) => void;
  };
};

/** 两侧同款内容盒样式：Layout/TabPanelLayout根类自身无视觉规则，加边框便于观察隐藏前后的占位变化 */
const BOX_STYLE = { border: "1px solid #a2a9b1", padding: 4 };

const readHiddenClass = (hasClass: (cls: string) => boolean) =>
  `隐藏类=${hasClass("oo-ui-element-hidden") ? "有" : "无"}`;

/** 原版侧：Layout的隐藏通道只有Element#toggle的类隐藏（命令式）；属性隐藏手动attr模拟，仅示意属性落点 */
function OriginalLayouts() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as LayoutBaseUi;
    const append = (name: string, node: Node) => {
      const el = document.createElement("div");
      el.textContent = name;
      el.appendChild(node);
      container.appendChild(el);
    };

    const visible = new ui.Layout();
    visible.$element.append("<p>可见：无隐藏。</p>");
    visible.$element.attr("style", "border:1px solid #a2a9b1;padding:4px");
    append("可见", unwrapJQuery(visible.$element));
    register(visible);

    // 原版无hidden声明式通道：类隐藏由Element#toggle命令式切换（React为hidden prop的类与属性输出）
    const classHidden = new ui.Layout();
    classHidden.$element.append("<p>toggle(false)：oo-ui-element-hidden类隐藏。</p>");
    classHidden.$element.attr("style", "border:1px solid #a2a9b1;padding:4px");
    classHidden.toggle(false);
    append("toggle(false)（类隐藏）", unwrapJQuery(classHidden.$element));
    register(classHidden);

    // 原版无hidden属性通道，手动attr模拟本工程hidden=true的属性落点（类与aria-hidden为本工程补齐）
    const attrHidden = new ui.Layout();
    attrHidden.$element.append("<p>hidden属性隐藏（手动attr模拟）。</p>");
    attrHidden.$element.attr("style", "border:1px solid #a2a9b1;padding:4px");
    attrHidden.$element.attr("hidden", "");
    append("hidden属性（手动attr模拟）", unwrapJQuery(attrHidden.$element));
    register(attrHidden);

    // 交互：toggle()翻转类隐藏，行尾读数
    const toggled = new ui.Layout();
    toggled.$element.append("<p>toggle()翻转类隐藏。</p>");
    toggled.$element.attr("style", "border:1px solid #a2a9b1;padding:4px");
    append("toggle()交互翻转", unwrapJQuery(toggled.$element));
    register(toggled);
    const writeStatus = appendValueOutput(toggled);
    writeStatus(readHiddenClass((cls) => toggled.$element.hasClass(cls)));
    const switchBar = document.createElement("div");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "toggle()翻转";
    button.addEventListener("click", () => {
      toggled.toggle();
      writeStatus(readHiddenClass((cls) => toggled.$element.hasClass(cls)));
    });
    switchBar.appendChild(button);
    container.appendChild(switchBar);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

/** hidden prop三态：可见 / true / 'until-found' */
type HiddenState = "visible" | "hidden" | "until-found";

const HIDDEN_STATES: HiddenState[] = ["visible", "hidden", "until-found"];

const HIDDEN_STATE_LABELS: Record<HiddenState, string> = {
  visible: "可见",
  hidden: "hidden=true",
  "until-found": "hidden='until-found'",
};

/** HiddenState映射为Layout的hidden prop：三态直传，可见时不输出属性 */
function resolveHiddenProp(state: HiddenState) {
  if (state === "hidden") {
    return true;
  }
  return state === "until-found" ? ("until-found" as const) : undefined;
}

function ReactLayouts() {
  return (
    <div>
      <div>
        可见
        <Layout style={BOX_STYLE}>
          <p>可见：无隐藏。</p>
        </Layout>
      </div>
      <div>
        hidden=true（属性+隐藏类+aria-hidden）
        <Layout hidden style={BOX_STYLE}>
          <p>hidden=true：整块不可见。</p>
        </Layout>
      </div>
      <div>
        hidden=&#39;until-found&#39;（仅属性，对浏览器查找可见）
        <Layout hidden="until-found" style={BOX_STYLE}>
          <p>until-found：不可见，但Ctrl+F可定位命中。</p>
        </Layout>
      </div>
      <ReactLayoutToggle />
    </div>
  );
}

/** 交互行：循环切换hidden三态，读实际DOM落点（属性值/aria-hidden/隐藏类） */
function ReactLayoutToggle() {
  const [state, setState] = useState<HiddenState>("visible");
  const ref = useRef<HTMLDivElement>(null);
  const [readout, setReadout] = useState("");

  // 读数在提交后取实际DOM：hidden='until-found'的属性由Layout的effect补写，父级effect时序在其后
  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const hiddenAttr = el.hasAttribute("hidden")
      ? JSON.stringify(el.getAttribute("hidden"))
      : "无";
    const ariaHidden = el.getAttribute("aria-hidden") ?? "无";
    setReadout(
      `hidden属性=${hiddenAttr} / aria-hidden=${ariaHidden} / ` +
        `隐藏类=${el.classList.contains("oo-ui-element-hidden") ? "有" : "无"}`,
    );
  }, [state]);

  const hidden = resolveHiddenProp(state);

  return (
    <div>
      交互切换三态
      <button
        type="button"
        onClick={() =>
          setState(
            HIDDEN_STATES[(HIDDEN_STATES.indexOf(state) + 1) % HIDDEN_STATES.length],
          )
        }
      >
        切到{HIDDEN_STATE_LABELS[HIDDEN_STATES[(HIDDEN_STATES.indexOf(state) + 1) % 3]]}
      </button>
      <Layout ref={ref} hidden={hidden} style={BOX_STYLE}>
        <p>内容区（当前：{HIDDEN_STATE_LABELS[state]}）。</p>
      </Layout>
      <span className="cmp-value">{readout}</span>
    </div>
  );
}

/** 原版侧：TabPanelLayout独立使用（active类；label仅经setupTabItem写入tab item，独立使用不落DOM） */
function OriginalTabPanels() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as LayoutBaseUi;
    const append = (name: string, node: Node) => {
      const el = document.createElement("div");
      el.textContent = name;
      el.appendChild(node);
      container.appendChild(el);
    };

    const active = new ui.TabPanelLayout("active", {
      label: "页签一",
      padded: true,
      framed: true,
      expanded: false,
    });
    active.setActive(true);
    active.$element.append("<p>active面板（oo-ui-tabPanelLayout-active类）。</p>");
    append("active（setActive(true)）", unwrapJQuery(active.$element));
    register(active);

    const inactive = new ui.TabPanelLayout("inactive", {
      padded: true,
      framed: true,
      expanded: false,
    });
    inactive.$element.append("<p>非active面板。</p>");
    append("非active", unwrapJQuery(inactive.$element));
    register(inactive);

    // scrollable为TabPanelLayout缺省，需外层限高才见滚动
    const scrollable = new ui.TabPanelLayout("scrollable", {
      padded: true,
      framed: true,
      expanded: false,
    });
    scrollable.$element.append(`<p>${"滚动内容行。<br>".repeat(10)}</p>`);
    const scrollBox = document.createElement("div");
    scrollBox.style.maxHeight = "100px";
    scrollBox.appendChild(unwrapJQuery(scrollable.$element));
    append("scrollable（外层限高100px）", scrollBox);
    register(scrollable);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactTabPanels() {
  return (
    <div>
      <div>
        active
        {/* label/value随页签集对象透入、组件吞掉不落DOM；独立使用传与不传均无DOM痕迹 */}
        <TabPanelLayout
          active
          label="页签一"
          value="active"
          disabled
          padded
          framed
          expanded={false}
        >
          <p>active面板（oo-ui-tabPanelLayout-active类）。</p>
        </TabPanelLayout>
      </div>
      <div>
        非active
        <TabPanelLayout padded framed expanded={false}>
          <p>非active面板。</p>
        </TabPanelLayout>
      </div>
      <div>
        scrollable（外层限高100px，缺省true）
        <div style={{ maxHeight: 100 }}>
          <TabPanelLayout padded framed expanded={false}>
            <p>
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i}>
                  滚动内容行。
                  <br />
                </span>
              ))}
            </p>
          </TabPanelLayout>
        </div>
      </div>
    </div>
  );
}

function LayoutBaseComparePage() {
  return (
    <CompareLayout
      title="Layout / TabPanelLayout 对照"
      description={
        <>
          对照点：Layout基础布局（oo-ui-layout根类）的hidden三态——true输出hidden属性+隐藏类
          +aria-hidden、&#39;until-found&#39;仅输出hidden属性（对浏览器查找可见，不声明
          aria-hidden）、不隐藏则均无；原版仅有Element#toggle的类隐藏通道（命令式），
          hidden属性与until-found为本工程增强，属性侧以手动attr模拟示意。TabPanelLayout独立使用：
          active类与PanelLayout配置继承（padded/framed/scrollable/expanded）；label/value/disabled
          为随页签集对象透入的属性、本工程吞掉不落DOM（原版独立使用时label同样不生效，
          页签的aria-labelledby/aria-controls关联见IndexLayout对照页）。
        </>
      }
    >
      <h2>Layout（hidden三态）</h2>
      <CompareColumns original={<OriginalLayouts />}>
        <ReactLayouts />
      </CompareColumns>

      <h2>TabPanelLayout</h2>
      <CompareColumns original={<OriginalTabPanels />}>
        <ReactTabPanels />
      </CompareColumns>
    </CompareLayout>
  );
}

LayoutBaseComparePage.displayName = "LayoutBaseComparePage";

export default LayoutBaseComparePage;

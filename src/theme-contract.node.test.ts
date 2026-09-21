import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { ICON_FLAGS } from "./Element";
import { SCROLL_LOCK_CLASSES } from "./dialogs/scrollLock";
import { DIALOG_FLOAT_Z_INDEX } from "./hooks";
import {
  buttonElementClasses,
  elementHiddenClasses,
  flaggedElementClasses,
  getButtonIconClasses,
  getOptionIconClasses,
  getTextInputClassName,
  iconElementClasses,
  imageVariantClasses,
  indicatorElementClasses,
  labelElementClasses,
  labelElementLabelClasses,
  optionWidgetClasses,
  pendingElementClasses,
  selectWidgetStateClasses,
  widgetClasses,
} from "./mixins";

/**
 * 主题 CSS 契约守卫（node 组）：本库不自带样式，`oo-ui-*` 类名即与原版 oojs-ui 主题 CSS
 * 选择器的契约（见 mixins.ts 顶部注释）。上游若重命名类名，本库会静默失效——本测试从已装的
 * 原版主题 CSS 抽取类 token，核对本库贡献器产出的类仍存在于契约中，把「人工对照」升级为
 * 「测试断言」。
 *
 * 【范围】mixins.ts 各贡献器产出的「元素级状态/变体类」加输入框折叠层 `getTextInputClassName`
 * 的 labelPosition/type 落位类（跨组件共享、上游改名会一次性击穿多组件的高价值目标）。经调用
 * 真实贡献器构造「使用集」，故本守卫随 mixins.ts 变化自动跟随。另有两项不含类名、但同样以主题
 * 声明为准的契约：`dialogs/scrollLock.ts` 写在 body/html 上的模块级状态类（不经理贡献器），
 * 与 `hooks/portal.ts` 的 `DIALOG_FLOAT_Z_INDEX`（取自主题给弹窗的层值，上游改数值无类名变化）。
 * 【不覆盖】widget 名类（`oo-ui-{name}Widget`）与组件内散落的结构类：名类在两主题的规则覆盖不均
 * （实测 `oo-ui-selectWidget`/`oo-ui-multiselectWidget` 是纯后代选择器钩子、0 条独立规则，而
 * `oo-ui-optionWidget`/`oo-ui-inputWidget`/`oo-ui-buttonWidget` 等各有多条独立规则），整类纳入
 * 需先逐条裁定，暂不覆盖。需要时可另建「经逐条裁定的 widget 名类清单」扩展。
 * 【白名单】贡献器确实产出、但主题 CSS 无对应规则者在此登记并写明理由（见 {@link ALLOWLIST}）。
 * 【固有盲区】①类 token 取两主题并集，只在一侧删除某类时不会报（已知不对称：`oo-ui-selectWidget-
 * pressed`/`-unpressed` 仅 apex 有规则）；②交集/差集法只能发现「类名消失」，无法发现「选择器
 * 语义漂移」（token 仍在，但从单类变复合、或新增了后代约束），也无法区分「独立规则」与「仅出现在
 * `:not()`/后代位」。这两类变化须靠对照页人工核验。
 */

/** 支持的原版主题（两主题类覆盖不同：apex 的 image 变体仅 invert，且无 flaggedElement-primary） */
const THEMES = ["wikimediaui", "apex"] as const;

const require = createRequire(import.meta.url);

/** 从一个主题的全量 CSS 抽取去重的 `.oo-ui-*` 类 token（逐 token，不抽整条选择器：复合/后代选择器逐 token 即命中） */
function cssTokens(theme: string): Set<string> {
  const cssPath = require.resolve(`oojs-ui/dist/oojs-ui-${theme}.css`);
  const css = readFileSync(cssPath, "utf8");
  const matches = css.match(/\.oo-ui-[A-Za-z0-9_-]+/g) ?? [];
  return new Set(matches.map((token) => token.slice(1)));
}

/** 两主题类 token 的并集：一个类只要在任一支持主题里有规则即视为「契约内」（主题间覆盖不同，见 {@link THEMES} 注释） */
const contractTokens = new Set<string>(THEMES.flatMap((theme) => [...cssTokens(theme)]));

/** 把贡献器返回的空格分隔类串拆成 token 收进使用集 */
function collect(used: Set<string>, classString: string): void {
  for (const token of classString.split(/\s+/)) {
    if (token) {
      used.add(token);
    }
  }
}

/**
 * 本库贡献器可能产出的元素级状态/变体类全集：经调用真实贡献器构造，随 mixins.ts 变化自动跟随。
 * 名类与结构类不在此集（见文件头范围说明）
 */
function contributorClasses(): Set<string> {
  const used = new Set<string>();
  // Widget 基类：禁用/启用两态
  collect(used, widgetClasses({ disabled: true }));
  collect(used, widgetClasses({ disabled: false }));
  // 三个元素 mixin 的存在类
  collect(used, iconElementClasses({ icon: "x" }));
  collect(used, indicatorElementClasses({ indicator: "down" }));
  collect(used, labelElementClasses({ label: "x" }));
  // LabelElement 的 label 元素类（-label 根类与 invisible 裁剪类）
  collect(used, labelElementLabelClasses(true));
  collect(used, labelElementLabelClasses(false));
  // ButtonElement：framed/frameless、active、pressed
  collect(used, buttonElementClasses({ framed: true, active: true, pressed: true }));
  collect(used, buttonElementClasses({ framed: false }));
  // OptionWidget：selected/highlighted/pressed
  collect(
    used,
    optionWidgetClasses({ selected: true, highlighted: true, pressed: true }),
  );
  // PendingElement、Element#toggle 隐藏类、SelectWidget 按压态
  collect(used, pendingElementClasses(true));
  collect(used, elementHiddenClasses(true));
  collect(used, selectWidgetStateClasses(true));
  collect(used, selectWidgetStateClasses(false));
  // 输入框折叠层：type 三态与 labelPosition 两态（type-text/type-number在两个主题中均无规则，经 ALLOWLIST 登记）。
  // 不传 widgetNames——名类不在守卫范围，这里只取折叠层自身产出的 labelPosition/type 位
  for (const type of ["text", "number", "search"] as const) {
    collect(used, getTextInputClassName({ label: "标签", type }, []));
  }
  for (const labelPosition of ["before", "after"] as const) {
    collect(
      used,
      getTextInputClassName({ label: "标签", labelPosition, type: "text" }, []),
    );
  }
  // 图标/指示器 image 变体（ICON_FLAGS 全集）
  for (const flag of ICON_FLAGS) {
    collect(used, imageVariantClasses([flag]));
  }
  // 两个组合贡献器：直调锁定其输出仍在 image 变体空间内（日后若产出新类即触发差集）
  collect(used, getButtonIconClasses({ framed: true, disabled: true, flags: [] }));
  collect(used, getOptionIconClasses({ selected: true }));
  // FlaggedElement：ButtonFlag 全集 + 软校验 invalid + Message 的 notice（MessageType 全集）
  const flaggedFlags = [
    ...ICON_FLAGS,
    "primary",
    "safe",
    "back",
    "close",
    "invalid",
    "notice",
  ];
  for (const flag of flaggedFlags) {
    collect(used, flaggedElementClasses(flag));
  }
  return used;
}

/**
 * 白名单：本库确实产出、但主题 CSS 无对应规则的类，均属有意——登记在此避免断言失败，理由如下：
 * - type-text/type-number：输入框的 type 落位类，两主题只给 type-search 写了规则，另两态无规则
 * - invert：经 `oo-ui-image-invert` 反色（有 image 规则），无 flaggedElement 色规则
 * - safe/back/close：ProcessDialog 动作的语义标志，经按钮结构/位置着色，无独立 flaggedElement 规则
 */
const ALLOWLIST = new Set<string>([
  "oo-ui-textInputWidget-type-text",
  "oo-ui-textInputWidget-type-number",
  "oo-ui-flaggedElement-invert",
  "oo-ui-flaggedElement-safe",
  "oo-ui-flaggedElement-back",
  "oo-ui-flaggedElement-close",
]);

describe("主题 CSS 契约守卫（贡献器与输入框折叠层类名）", () => {
  it("原版两主题 CSS 均可定位，且抽出的 token 含锚点类", () => {
    // 断言锚点类而非 token 数量：抽 token 的链路一旦失效（如 CSS 被预处理吞成空串），
    // 「数量 > 阈值」这类宽松守卫可能照样通过，锚点类缺失则立即红
    const anchors = ["oo-ui-widget-enabled", "oo-ui-windowManager-modal-active"];
    for (const theme of THEMES) {
      const tokens = cssTokens(theme);
      for (const anchor of anchors) {
        expect(tokens.has(anchor), `${theme} 主题缺少锚点类 ${anchor}`).toBe(true);
      }
    }
  });

  it("贡献器产出的每个状态/变体类都存在于主题契约（并集，白名单除外）", () => {
    const missing = [...contributorClasses()].filter(
      (token) => !contractTokens.has(token) && !ALLOWLIST.has(token),
    );
    // 断言为空：非空即上游可能已重命名对应类，需核对原版对应 mixin 并更新贡献器或白名单
    expect(missing, "以下类不在任一支持主题的 CSS 契约内").toEqual([]);
  });

  it("白名单条目确实不在契约内（否则应从白名单移除，避免掩盖真实回归）", () => {
    // 白名单是「已知无规则」的记录；一旦上游补上规则，白名单即成噪音，应清理
    for (const token of ALLOWLIST) {
      expect(contractTokens.has(token), `${token} 已进入契约，应移出白名单`).toBe(false);
    }
  });
});

/**
 * 弹窗写在 body/html 上的模块级状态类守卫：`dialogs/scrollLock.ts` 的类表是普通字面量、
 * 不经理 mixins.ts 的贡献器，上面的使用集覆盖不到。这些类的规则同样由主题CSS承接，
 * 上游改名会让滚动锁与iOS触摸滚动兜底**双双静默失效**（页面上没有任何可见线索），
 * 故把类表的实际取值一并纳入契约核对（直取类表，不在测试里另抄字面量）。
 */
describe("主题 CSS 契约守卫（弹窗的模块级状态类）", () => {
  it("scrollLock 写入 body/html 的类都在主题契约内", () => {
    for (const token of Object.values(SCROLL_LOCK_CLASSES)) {
      expect(contractTokens.has(token), `${token} 不在主题CSS契约内`).toBe(true);
    }
  });
});

/**
 * 弹窗浮层的层值守卫：弹窗子树内的浮层须与所属弹窗同层（`hooks/portal.ts` 的
 * {@link DIALOG_FLOAT_Z_INDEX}），该值取自主题给 `.oo-ui-windowManager-modal > .oo-ui-dialog`
 * 的声明——浮层portal到管理器根后是弹窗的兄弟节点，两者的层值直接比较，不再像原版那样
 * 位于窗口的层叠上下文内。
 *
 * 这是类 token 守卫的固有盲区之外的一项：上游改这个数值不会有任何类名变化，上面那条类
 * 集合断言发现不了，而后果是弹层被压到弹窗之下（`.oo-ui-popupWidget` 的主题层值只有 1），
 * 故按数值直接锁定。
 */
describe("主题 CSS 契约守卫（弹窗层值）", () => {
  /** 从主题 CSS 抽 `.oo-ui-windowManager-modal > .oo-ui-dialog` 规则内的 z-index 声明 */
  function dialogZIndex(theme: string): string | undefined {
    const cssPath = require.resolve(`oojs-ui/dist/oojs-ui-${theme}.css`);
    const css = readFileSync(cssPath, "utf8");
    const rule = css.match(
      /\.oo-ui-windowManager-modal\s*>\s*\.oo-ui-dialog\s*\{([^}]*)\}/,
    );
    return rule?.[1].match(/z-index:\s*([^;\s]+)/)?.[1];
  }

  it("两主题的弹窗层值与本库的 DIALOG_FLOAT_Z_INDEX 一致", () => {
    for (const theme of THEMES) {
      expect(dialogZIndex(theme), `${theme} 主题的弹窗层值`).toBe(
        String(DIALOG_FLOAT_Z_INDEX),
      );
    }
  });
});

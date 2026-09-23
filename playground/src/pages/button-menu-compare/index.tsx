import { useRef, useState } from "react";
import { ButtonMenuSelectWidget } from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import { createRowAppender, useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

type MenuSelectUi = {
  ButtonMenuSelectWidget: new (config?: Record<string, unknown>) => {
    $element: unknown;
    getMenu: () => {
      on: (event: string, handler: (arg?: { getData?: () => string }) => void) => void;
      toggle: (show?: boolean) => void;
    };
  };
  MenuOptionWidget: new (config?: Record<string, unknown>) => unknown;
};

/** 选项集（两侧同一组，含禁用项） */
const OPTION_DEFS: [string, string, boolean?][] = [
  ["alpha", "选项一"],
  ["beta", "选项二"],
  ["gamma", "选项三（禁用）", true],
];

/** 原版侧各行配置（React侧逐条对应） */
const ROWS: [string, Record<string, unknown>][] = [
  ["默认（选定后清除选中态）", {}],
  ["带图标", { icon: "ellipsis" }],
  ["clearOnSelect=false（保留选中态）", { clearOnSelect: false }],
  ["禁用", { disabled: true }],
];

/** 原版侧：按钮触发菜单（menu.items传入选项） */
function OriginalButtonMenus({ addLog }: { addLog: (msg: string) => void }) {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as MenuSelectUi;
    const row = createRowAppender(container, register);
    ROWS.forEach(([name, config], index) => {
      const widget = row(ui.ButtonMenuSelectWidget, name, {
        label: name,
        menu: {
          items: OPTION_DEFS.map(
            ([data, label, disabled]) =>
              new ui.MenuOptionWidget({ data, label, disabled }),
          ),
        },
        ...config,
      });
      const menu = widget.getMenu();
      menu.on("choose", (item) => addLog(`原版${index} choose=${item?.getData?.()}`));
      menu.on("toggle", () => addLog(`原版${index} toggle`));
    });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：与左侧逐行同配置 */
function ReactButtonMenus({ addLog }: { addLog: (msg: string) => void }) {
  const options = OPTION_DEFS.map(([value, label, disabled]) => ({
    value,
    children: label,
    disabled,
  }));

  return (
    <div>
      <div>
        默认（选定后清除选中态）
        <ButtonMenuSelectWidget
          options={options}
          onChoose={(value) => addLog(`react0 choose=${value}`)}
          onOpenChange={(open) => addLog(`react0 toggle=${open}`)}
        >
          默认（选定后清除选中态）
        </ButtonMenuSelectWidget>
      </div>
      <div>
        带图标
        <ButtonMenuSelectWidget
          icon="ellipsis"
          options={options}
          onChoose={(value) => addLog(`react1 choose=${value}`)}
        >
          带图标
        </ButtonMenuSelectWidget>
      </div>
      <div>
        clearOnSelect=false（保留选中态）
        <ButtonMenuSelectWidget
          clearOnSelect={false}
          options={options}
          onChoose={(value) => addLog(`react2 choose=${value}`)}
        >
          clearOnSelect=false（保留选中态）
        </ButtonMenuSelectWidget>
      </div>
      <div>
        禁用
        <ButtonMenuSelectWidget disabled options={options}>
          禁用
        </ButtonMenuSelectWidget>
      </div>
    </div>
  );
}

/** 原版侧：受控展开（getMenu().toggle）、初始展开与flags/framed变体 */
function OriginalVariants({ addLog }: { addLog: (msg: string) => void }) {
  const menuRef = useRef<{ toggle: (show?: boolean) => void } | null>(null);
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as MenuSelectUi;
    const row = createRowAppender(container, register);
    // 各行共用的menu选项集
    const menu = () => ({
      menu: {
        items: OPTION_DEFS.map(
          ([data, label, disabled]) => new ui.MenuOptionWidget({ data, label, disabled }),
        ),
      },
    });

    // 受控展开：外部按钮toggle菜单（React为open受控prop）
    const controlled = row(ui.ButtonMenuSelectWidget, "受控open", {
      label: "受控open",
      menu: {
        items: OPTION_DEFS.map(
          ([data, label, disabled]) => new ui.MenuOptionWidget({ data, label, disabled }),
        ),
      },
    });
    register(controlled);
    menuRef.current = controlled.getMenu();
    controlled
      .getMenu()
      .on("choose", (item) => addLog(`原版受控 choose=${item?.getData?.()}`));

    // 初始展开：构造后toggle(true)（React为defaultOpen）
    const initial = row(ui.ButtonMenuSelectWidget, "初始展开", {
      label: "初始展开",
      menu: {
        items: OPTION_DEFS.map(
          ([data, label, disabled]) => new ui.MenuOptionWidget({ data, label, disabled }),
        ),
      },
    });
    initial.getMenu().toggle(true);

    row(ui.ButtonMenuSelectWidget, "flags+无边框", {
      label: "primary无边框",
      flags: "primary",
      framed: false,
      menu: {
        items: OPTION_DEFS.map(
          ([data, label, disabled]) => new ui.MenuOptionWidget({ data, label, disabled }),
        ),
      },
    });

    // 链接形态：href/target/rel（继承ButtonWidget的锚点能力）
    row(ui.ButtonMenuSelectWidget, "href+target+rel（继承Button的锚点能力）", {
      label: "链接菜单按钮",
      href: "https://www.example.com",
      target: "_blank",
      rel: ["noopener", "noreferrer"],
      ...menu(),
    });
    // active：激活态类（受控语义由应用状态驱动）
    row(ui.ButtonMenuSelectWidget, "active", {
      label: "激活态",
      active: true,
      ...menu(),
    });
    // invisibleLabel：标签转title，仅图标/指示器可见
    row(ui.ButtonMenuSelectWidget, "invisibleLabel+indicator", {
      label: "图标菜单按钮",
      invisibleLabel: true,
      icon: "menu",
      indicator: "down",
      ...menu(),
    });
    // pressed为瞬时按压类，原版无声明式通道：静态加类模拟（React为pressed prop）
    const pressedBms = row(ui.ButtonMenuSelectWidget, "pressed（按压态）", {
      label: "Pressing",
      ...menu(),
    });
    (unwrapJQuery(pressedBms.$element) as HTMLElement).classList.add(
      "oo-ui-buttonElement-pressed",
    );
  });

  return (
    <div>
      <div>
        <div ref={containerRef} />
        <button type="button" onClick={() => menuRef.current?.toggle()}>
          程序化开合菜单
        </button>
        <p>
          menuSpacing：原版按钮与菜单间距固定4px（FloatableElement
          spacing），无可调通道；React侧menuSpacing可调。
        </p>
      </div>
    </div>
  );
}

/** React侧：受控open/defaultOpen/flags+framed/menuSpacing */
function ReactVariants({ addLog }: { addLog: (msg: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div>
        受控open
        <ButtonMenuSelectWidget
          open={open}
          onClick={() => setOpen((v) => !v)}
          onOpenChange={setOpen}
          onChoose={(value) => addLog(`react受控 choose=${value}`)}
          options={OPTION_DEFS.map(([value, label, disabled]) => ({
            value,
            children: label,
            disabled,
          }))}
        >
          受控open
        </ButtonMenuSelectWidget>
        <button type="button" onClick={() => setOpen((v) => !v)}>
          程序化开合菜单
        </button>
      </div>
      <div>
        初始展开
        <ButtonMenuSelectWidget
          defaultOpen
          onChoose={(value) => addLog(`react初始 choose=${value}`)}
          options={OPTION_DEFS.map(([value, label, disabled]) => ({
            value,
            children: label,
            disabled,
          }))}
        >
          初始展开
        </ButtonMenuSelectWidget>
      </div>
      <div>
        flags+无边框
        <ButtonMenuSelectWidget
          flags="primary"
          framed={false}
          options={OPTION_DEFS.map(([value, label, disabled]) => ({
            value,
            children: label,
            disabled,
          }))}
        >
          primary无边框
        </ButtonMenuSelectWidget>
      </div>
      <div>
        href+target+rel（继承Button的锚点能力）
        <ButtonMenuSelectWidget
          href="https://www.example.com"
          target="_blank"
          rel={["noopener", "noreferrer"]}
          options={OPTION_DEFS.map(([value, label, disabled]) => ({
            value,
            children: label,
            disabled,
          }))}
        >
          链接菜单按钮
        </ButtonMenuSelectWidget>
      </div>
      <div>
        active
        <ButtonMenuSelectWidget
          active
          options={OPTION_DEFS.map(([value, label, disabled]) => ({
            value,
            children: label,
            disabled,
          }))}
        >
          激活态
        </ButtonMenuSelectWidget>
      </div>
      <div>
        invisibleLabel+indicator
        <ButtonMenuSelectWidget
          invisibleLabel
          icon="menu"
          indicator="down"
          title="图标菜单按钮"
          options={OPTION_DEFS.map(([value, label, disabled]) => ({
            value,
            children: label,
            disabled,
          }))}
        />
      </div>
      {/* pressed为瞬时按压态prop，静态演示（原版侧以加类模拟同一机制） */}
      <div>
        pressed（按压态）
        <ButtonMenuSelectWidget
          pressed
          options={OPTION_DEFS.map(([value, label, disabled]) => ({
            value,
            children: label,
            disabled,
          }))}
        >
          Pressing
        </ButtonMenuSelectWidget>
      </div>
      {/* menuSpacing为React增强通道：原版按钮与菜单间距固定4px（FloatableElement spacing），
          无可调config；仅React侧演示，置区块末尾 */}
      <div>
        menuSpacing=20
        <ButtonMenuSelectWidget
          menuSpacing={20}
          options={OPTION_DEFS.map(([value, label, disabled]) => ({
            value,
            children: label,
            disabled,
          }))}
        >
          menuSpacing=20
        </ButtonMenuSelectWidget>
      </div>
    </div>
  );
}

function ButtonMenuComparePage() {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => setLog((prev) => [...prev.slice(-11), message]);

  return (
    <CompareLayout
      title="ButtonMenuSelectWidget 对照"
      description={
        <>
          对照点：根类oo-ui-buttonMenuSelectWidget、锚点上的aria-haspopup=true/aria-expanded/aria-owns（互相关联菜单id）、
          菜单浮动于按钮下方且间距4px、菜单不是Tab停靠点、展开期间按钮呈pressed态、
          选定后收起并回调（clearOnSelect缺省清除菜单选中态，置false则保留）、
          键盘：收起时Enter/空格/↑↓展开，展开后↑↓移动高亮、Enter选定。
          「受控/初值/变体」区块验证open受控与defaultOpen、flags+framed变体、
          menuSpacing间距调整（原版固定4px无可调通道，仅React侧演示）。
        </>
      }
    >
      <CompareColumns original={<OriginalButtonMenus addLog={addLog} />}>
        <ReactButtonMenus addLog={addLog} />
      </CompareColumns>

      <h2>受控 / 初值 / 变体 / menuSpacing</h2>
      <CompareColumns original={<OriginalVariants addLog={addLog} />}>
        <ReactVariants addLog={addLog} />
      </CompareColumns>

      <h2>事件日志（两侧）</h2>
      <ul>
        {log.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </CompareLayout>
  );
}

ButtonMenuComparePage.displayName = "ButtonMenuComparePage";

export default ButtonMenuComparePage;

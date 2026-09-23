import { useState } from "react";
import { FieldLayout, ToggleButton, ToggleSwitch } from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import { createRowAppender, useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

type ToggleUi = {
  ToggleSwitchWidget: new (config?: Record<string, unknown>) => {
    $element: { attr: (name: string, value: string) => unknown };
  };
  ToggleButtonWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  FieldLayout: new (
    field: unknown,
    config?: Record<string, unknown>,
  ) => { $element: unknown };
};

/** 原版侧：ToggleSwitch形态样本（与React侧逐行对照） */
function OriginalSwitches() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as ToggleUi;
    const row = createRowAppender(container, register);
    row(ui.ToggleSwitchWidget, "关（默认）", {});
    row(ui.ToggleSwitchWidget, "开", { value: true });
    row(ui.ToggleSwitchWidget, "禁用·关", { disabled: true });
    row(ui.ToggleSwitchWidget, "禁用·开", { disabled: true, value: true });

    // 原版无声明式aria通道：role=switch落在根元素，经attr关联外部说明（React为aria-labelledby prop）
    const named = new ui.ToggleSwitchWidget();
    named.$element.attr("aria-labelledby", "pg-switch-label-orig");
    register(named);
    const namedRow = document.createElement("div");
    namedRow.textContent = "aria-labelledby命名";
    namedRow.appendChild(unwrapJQuery(named.$element));
    const switchLabel = document.createElement("span");
    switchLabel.id = "pg-switch-label-orig";
    switchLabel.textContent = "自动保存";
    namedRow.appendChild(switchLabel);
    container.appendChild(namedRow);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactSwitches({ addLog }: { addLog: (msg: string) => void }) {
  const [controlled, setControlled] = useState(false);

  return (
    <div>
      {/* 名称与控件同行，与原版row()的div行结构一致，保证两侧逐行对照 */}
      <div>
        关（默认）
        <ToggleSwitch onChange={(checked) => addLog(`change 常规=${checked}`)} />
      </div>
      <div>
        开
        <ToggleSwitch
          defaultChecked
          onChange={(checked) => addLog(`change 开=${checked}`)}
        />
      </div>
      <div>
        禁用·关
        <ToggleSwitch disabled />
      </div>
      <div>
        禁用·开
        <ToggleSwitch disabled defaultChecked />
      </div>
      <div>
        aria-labelledby命名
        <ToggleSwitch aria-labelledby="pg-switch-label-react" />
        <span id="pg-switch-label-react">自动保存</span>
      </div>
      {/* 受控演示为React增强，原版侧无对应形态，置于尾部避免挤占逐行对照 */}
      <div>
        受控（当前：{controlled ? "开" : "关"}）
        <ToggleSwitch checked={controlled} onChange={setControlled} />
      </div>
    </div>
  );
}

/** 原版侧：ToggleButton形态样本 */
function OriginalToggleButtons() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as ToggleUi;
    const row = createRowAppender(container, register);
    row(ui.ToggleButtonWidget, "关（默认）", { label: "Toggle off" });
    row(ui.ToggleButtonWidget, "开", { label: "Toggle on", value: true });
    row(ui.ToggleButtonWidget, "图标+flags", {
      label: "Icon",
      icon: "image",
      flags: "progressive",
    });
    row(ui.ToggleButtonWidget, "禁用·开", {
      label: "Disabled",
      disabled: true,
      value: true,
    });
    row(ui.ToggleButtonWidget, "framed=false", { label: "Frameless", framed: false });
    row(ui.ToggleButtonWidget, "invisibleLabel+indicator", {
      label: "Invisible",
      invisibleLabel: true,
      icon: "bookmark",
      indicator: "down",
    });
    // pressed为瞬时按压类，原版无声明式通道：静态加类模拟（React为pressed prop）
    const pressedToggle = row(ui.ToggleButtonWidget, "pressed（按压态）", {
      label: "Pressing",
    });
    (unwrapJQuery(pressedToggle.$element) as HTMLElement).classList.add(
      "oo-ui-buttonElement-pressed",
    );
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactToggleButtons({ addLog }: { addLog: (msg: string) => void }) {
  const [controlled, setControlled] = useState(true);

  return (
    <div>
      <div>
        关（默认）
        <ToggleButton onChange={(checked) => addLog(`change 常规=${checked}`)}>
          Toggle off
        </ToggleButton>
      </div>
      <div>
        开<ToggleButton defaultChecked>Toggle on</ToggleButton>
      </div>
      <div>
        图标+flags
        <ToggleButton icon="image" flags="progressive">
          Icon
        </ToggleButton>
      </div>
      <div>
        禁用·开
        <ToggleButton disabled defaultChecked>
          Disabled
        </ToggleButton>
      </div>
      <div>
        framed=false
        <ToggleButton framed={false}>Frameless</ToggleButton>
      </div>
      <div>
        invisibleLabel+indicator
        <ToggleButton invisibleLabel icon="bookmark" indicator="down">
          Invisible
        </ToggleButton>
      </div>
      {/* pressed为瞬时按压态prop，静态演示（原版侧以加类模拟同一机制） */}
      <div>
        pressed（按压态）
        <ToggleButton pressed>Pressing</ToggleButton>
      </div>
      {/* 受控演示为React增强，原版侧无对应形态，置于尾部避免挤占逐行对照 */}
      <div>
        受控（当前：{controlled ? "开" : "关"}）
        <ToggleButton checked={controlled} onChange={setControlled}>
          Controlled
        </ToggleButton>
      </div>
    </div>
  );
}

/** 原版侧：FieldLayout标签联动样本（点击标签翻转开关/聚焦按钮，对齐原版simulateLabelClick） */
function OriginalFieldLink() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as ToggleUi;
    const layout = new ui.FieldLayout(new ui.ToggleSwitchWidget(), {
      label: "点击标签翻转开关",
      align: "left",
    });
    const disabledLayout = new ui.FieldLayout(
      new ui.ToggleSwitchWidget({ disabled: true }),
      {
        label: "禁用（点击标签不翻转不聚焦）",
        align: "left",
      },
    );
    // ToggleButton行：可聚焦按钮的字段标签点击走TabIndexedElement.simulateLabelClick的
    // 基线focus()，只聚焦锚点不触发toggle（React为FieldLayout+ToggleButton通道B）
    const buttonLayout = new ui.FieldLayout(
      new ui.ToggleButtonWidget({ label: "切换按钮" }),
      {
        label: "点击标签聚焦切换按钮",
        align: "left",
      },
    );
    register(layout, disabledLayout, buttonLayout);
    container.appendChild(unwrapJQuery(layout.$element));
    container.appendChild(unwrapJQuery(disabledLayout.$element));
    container.appendChild(unwrapJQuery(buttonLayout.$element));
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactFieldLink() {
  return (
    <div>
      <FieldLayout label="点击标签翻转开关" align="left">
        <ToggleSwitch />
      </FieldLayout>
      <FieldLayout label="禁用（点击标签不翻转不聚焦）" align="left">
        <ToggleSwitch disabled />
      </FieldLayout>
      <FieldLayout label="点击标签聚焦切换按钮" align="left">
        <ToggleButton>切换按钮</ToggleButton>
      </FieldLayout>
    </div>
  );
}

function ToggleComparePage() {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);

  return (
    <CompareLayout
      title="ToggleSwitch / ToggleButton 对照"
      description={
        <>
          对照点：ToggleSwitch的glow/grip结构与开合类（oo-ui-toggleWidget-on/off）、
          role=switch + aria-checked、左键点击与Space/Enter切换（Space不滚动页面）、
          禁用态；ToggleButton的buttonElement-active与aria-pressed随开合输出、
          受控/非受控两种用法、aria-labelledby命名开关（role=switch无名称为读屏硬伤，
          原版靠FieldLayout或attr关联）、framed=false无边框切换按钮（变更记录见日志）。
        </>
      }
    >
      <h2>ToggleSwitch</h2>
      <CompareColumns original={<OriginalSwitches />}>
        <ReactSwitches addLog={addLog} />
      </CompareColumns>

      <h2>ToggleButton</h2>
      <CompareColumns original={<OriginalToggleButtons />}>
        <ReactToggleButtons addLog={addLog} />
      </CompareColumns>

      <h2>FieldLayout标签联动</h2>
      <CompareColumns original={<OriginalFieldLink />}>
        <ReactFieldLink />
      </CompareColumns>

      <h2>事件日志（React侧）</h2>
      <ul>
        {log.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </CompareLayout>
  );
}

ToggleComparePage.displayName = "ToggleComparePage";

export default ToggleComparePage;

import { Icon, Indicator, Label } from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import { createRowAppender, useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

type BaseElementUi = {
  LabelWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  IconWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  IndicatorWidget: new (config?: Record<string, unknown>) => { $element: unknown };
};

/** 行输出器：名称+控件一行（与createRowAppender的行结构一致，供手工构建的行复用） */
function makeRowAppender(container: HTMLElement, register: (widget: object) => void) {
  return (name: string, widget: { $element: unknown } | Node) => {
    const node = widget instanceof Node ? widget : unwrapJQuery(widget.$element);
    register(widget instanceof Node ? {} : widget);
    const el = document.createElement("div");
    el.textContent = name;
    el.appendChild(node);
    container.appendChild(el);
  };
}

/** 原版侧：LabelWidget（title落在根元素，invisibleLabel视觉隐藏保留可访问文本） */
function OriginalLabels() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as BaseElementUi;
    const row = createRowAppender(container, register);
    row(ui.LabelWidget, "常规", { label: "标签文本" });
    row(ui.LabelWidget, "title提示", { label: "悬浮查看title", title: "标签title" });
    row(ui.LabelWidget, "invisibleLabel", {
      label: "视觉隐藏的标签",
      invisibleLabel: true,
      title: "隐藏标签",
    });
    row(ui.LabelWidget, "disabled", { label: "禁用标签", disabled: true });
    row(ui.LabelWidget, "过长裁剪", {
      label: "很长很长的标签文本会被裁剪省略（max-width生效于label元素）",
    });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactLabels() {
  return (
    <div>
      <div>
        常规
        <Label>标签文本</Label>
      </div>
      <div>
        title提示
        <Label title="标签title">悬浮查看title</Label>
      </div>
      <div>
        invisibleLabel
        <Label invisibleLabel title="隐藏标签">
          视觉隐藏的标签
        </Label>
      </div>
      <div>
        disabled
        <Label disabled>禁用标签</Label>
      </div>
      <div>
        过长裁剪
        <Label>很长很长的标签文本会被裁剪省略（max-width生效于label元素）</Label>
      </div>
    </div>
  );
}

/** 原版侧：IconWidget（flags经image-{flag}变体类着色，invert需深色底） */
function OriginalIcons() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as BaseElementUi;
    const row = createRowAppender(container, register);
    const append = makeRowAppender(container, register);
    row(ui.IconWidget, "常规", { icon: "image" });
    row(ui.IconWidget, "title提示", { icon: "image", title: "图标title" });
    row(ui.IconWidget, "disabled", { icon: "image", disabled: true });

    // flags变体逐个横排（progressive/destructive/invert/error/warning/success）
    const flagRow = document.createElement("div");
    flagRow.textContent = "flags变体";
    const flags = ["progressive", "destructive", "invert", "error", "warning", "success"];
    for (const flag of flags) {
      const icon = new ui.IconWidget({ icon: "alert", flags: flag });
      register(icon);
      const wrap = document.createElement("span");
      wrap.title = flag;
      wrap.style.marginRight = "4px";
      wrap.appendChild(unwrapJQuery(icon.$element));
      flagRow.appendChild(wrap);
    }
    container.appendChild(flagRow);

    const invert = new ui.IconWidget({ icon: "alert", flags: "invert" });
    register(invert);
    const darkBox = document.createElement("span");
    darkBox.style.cssText = "display:inline-block;background:#222;padding:4px 8px;";
    darkBox.appendChild(unwrapJQuery(invert.$element));
    append("invert深色底", darkBox);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactIcons() {
  return (
    <div>
      <div>
        常规
        <Icon icon="image" />
      </div>
      <div>
        title提示
        <Icon icon="image" title="图标title" />
      </div>
      <div>
        disabled
        <Icon icon="image" disabled />
      </div>
      <div>
        flags变体
        <Icon icon="alert" flags="progressive" title="progressive" />
        <Icon icon="alert" flags="destructive" title="destructive" />
        <Icon icon="alert" flags="invert" title="invert" />
        <Icon icon="alert" flags="error" title="error" />
        <Icon icon="alert" flags="warning" title="warning" />
        <Icon icon="alert" flags="success" title="success" />
      </div>
      <div>
        invert深色底
        <span style={{ display: "inline-block", background: "#222", padding: "4px 8px" }}>
          <Icon icon="alert" flags="invert" />
        </span>
      </div>
    </div>
  );
}

/** 原版侧：IndicatorWidget（clear/up/down/required四种） */
function OriginalIndicators() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as BaseElementUi;
    const row = createRowAppender(container, register);
    row(ui.IndicatorWidget, "clear", { indicator: "clear" });
    row(ui.IndicatorWidget, "up", { indicator: "up" });
    row(ui.IndicatorWidget, "down", { indicator: "down" });
    row(ui.IndicatorWidget, "required", { indicator: "required" });
    row(ui.IndicatorWidget, "title提示", { indicator: "down", title: "指示器title" });
    row(ui.IndicatorWidget, "disabled", { indicator: "down", disabled: true });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactIndicators() {
  return (
    <div>
      <div>
        clear
        <Indicator indicator="clear" />
      </div>
      <div>
        up
        <Indicator indicator="up" />
      </div>
      <div>
        down
        <Indicator indicator="down" />
      </div>
      <div>
        required
        <Indicator indicator="required" />
      </div>
      <div>
        title提示
        <Indicator indicator="down" title="指示器title" />
      </div>
      <div>
        disabled
        <Indicator indicator="down" disabled />
      </div>
    </div>
  );
}

function LabelIconComparePage() {
  return (
    <CompareLayout
      title="Label / Icon / Indicator 对照"
      description={
        <>
          对照点：LabelWidget的title落点（根元素）与invisibleLabel（视觉隐藏保留可访问文本，
          title兜底）、disabled态；IconWidget的flags变体着色（image-变体类，invert需深色底）；
          IndicatorWidget四种指示器（clear/up/down/required）与title/disabled。
        </>
      }
    >
      <h2>Label</h2>
      <CompareColumns original={<OriginalLabels />}>
        <ReactLabels />
      </CompareColumns>

      <h2>Icon</h2>
      <CompareColumns original={<OriginalIcons />}>
        <ReactIcons />
      </CompareColumns>

      <h2>Indicator</h2>
      <CompareColumns original={<OriginalIndicators />}>
        <ReactIndicators />
      </CompareColumns>
    </CompareLayout>
  );
}

LabelIconComparePage.displayName = "LabelIconComparePage";

export default LabelIconComparePage;

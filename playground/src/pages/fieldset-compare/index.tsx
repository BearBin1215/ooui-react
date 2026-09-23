import { CheckboxInput, FieldLayout, FieldsetLayout, TextInput } from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import { createRowAppender, useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

type FieldsetUi = {
  FieldsetLayout: new (config?: Record<string, unknown>) => {
    $element: unknown;
    addItems: (items: unknown[]) => void;
  };
  FieldLayout: new (
    field: unknown,
    config?: Record<string, unknown>,
  ) => { $element: unknown };
  TextInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  CheckboxInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
};

/** 原版侧：FieldsetLayout（label/icon/弹出help） */
function OriginalFieldsets() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as FieldsetUi;
    const fieldset = new ui.FieldsetLayout({
      label: "原版字段集",
      icon: "settings",
      help: "这是原版弹出帮助文本。",
    });
    register(fieldset);
    fieldset.addItems([
      new ui.FieldLayout(new ui.TextInputWidget(), {
        label: "用户名",
        align: "top",
      }),
      new ui.FieldLayout(new ui.CheckboxInputWidget(), {
        label: "记住我",
        align: "inline",
      }),
      new ui.FieldLayout(new ui.TextInputWidget(), {
        label: "标签在右",
        align: "right",
      }),
    ]);
    container.appendChild(unwrapJQuery(fieldset.$element));
  });

  return (
    <div style={{ position: "relative" }}>
      <div ref={containerRef} />
    </div>
  );
}

/** 原版侧：helpInline内联帮助、FieldLayout的title/disabled、invisibleLabel与fieldset原生disabled */
function OriginalVariants() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as FieldsetUi;
    const row = createRowAppender(container, register);
    // FieldLayout构造首参是field控件而非config（原版对无field的构造直接抛错），
    // row()的config-only签名不适用，FieldLayout行走手工append
    const append = (name: string, widget: { $element: unknown }) => {
      register(widget);
      const el = document.createElement("div");
      el.textContent = name;
      el.appendChild(unwrapJQuery(widget.$element));
      container.appendChild(el);
    };

    const inlineHelp = new ui.FieldsetLayout({
      label: "内联帮助字段集",
      help: "这是内联帮助文本（helpInline）。",
      helpInline: true,
    });
    register(inlineHelp);
    inlineHelp.addItems([
      new ui.FieldLayout(new ui.TextInputWidget(), { label: "字段一", align: "top" }),
    ]);
    container.appendChild(unwrapJQuery(inlineHelp.$element));

    const invisibleLegend = new ui.FieldsetLayout({
      label: "视觉隐藏的字段集标题",
      invisibleLabel: true,
    });
    register(invisibleLegend);
    invisibleLegend.addItems([
      new ui.FieldLayout(new ui.TextInputWidget(), { label: "字段一", align: "top" }),
    ]);
    container.appendChild(unwrapJQuery(invisibleLegend.$element));

    const titledField = new ui.FieldLayout(new ui.TextInputWidget(), {
      label: "悬浮标签看title",
      align: "top",
      title: "字段title提示",
    });
    append("FieldLayout title", titledField);

    const disabledField = new ui.FieldLayout(new ui.TextInputWidget(), {
      label: "禁用字段",
      align: "top",
      disabled: true,
    });
    append("FieldLayout disabled", disabledField);

    // FieldsetLayout根为原生fieldset且无disabled config通道（Widget#setDisabled只切类与
    // aria-disabled）：直接置DOM的disabled属性，浏览器原生禁用组内全部输入控件
    const disabledFieldset = row(
      ui.FieldsetLayout,
      "disabled（原生fieldset禁用，组内控件一并禁用）",
      { label: "禁用字段集" },
    );
    (unwrapJQuery(disabledFieldset.$element) as HTMLFieldSetElement).disabled = true;
    disabledFieldset.addItems([
      new ui.FieldLayout(new ui.TextInputWidget(), { label: "组内输入框", align: "top" }),
    ]);

    const invisibleLabelField = new ui.FieldLayout(new ui.TextInputWidget(), {
      label: "用户名",
      align: "top",
      invisibleLabel: true,
    });
    append("invisibleLabel（标签视觉隐藏，保留for关联与可访问名）", invisibleLabelField);
  });

  return (
    <div style={{ position: "relative" }}>
      <div ref={containerRef} />
    </div>
  );
}

function FieldsetComparePage() {
  return (
    <CompareLayout
      title="FieldsetLayout 对照"
      description={
        <>
          左侧为本地安装的原版oojs-ui，右侧为本组件库实现。
          两者行为对照点：fieldset/legend元素结构、label与icon渲染、弹出帮助（点击info图标弹出说明层）、
          帮助弹层宽度（默认320）、与FieldLayout配合的排布（对齐变体top/inline/right）。
          「变体」区块验证helpInline内联帮助（不弹层改为字段集尾部说明文本）、FieldLayout的title（落label元素的tooltip）
          与disabled（字段整体禁用类）、FieldLayout的invisibleLabel（标签视觉隐藏但保留for关联与可访问名）、
          FieldsetLayout根fieldset的原生disabled（组内控件一并禁用）。
        </>
      }
    >
      <CompareColumns original={<OriginalFieldsets />}>
        <div style={{ position: "relative" }}>
          <FieldsetLayout
            label="React字段集"
            icon="settings"
            help="这是React弹出帮助文本。"
          >
            <FieldLayout label="用户名" align="top">
              <TextInput />
            </FieldLayout>
            <FieldLayout label="记住我" align="inline">
              <CheckboxInput />
            </FieldLayout>
            <FieldLayout label="标签在右" align="right">
              <TextInput />
            </FieldLayout>
          </FieldsetLayout>
        </div>
      </CompareColumns>

      <h2>helpInline / FieldLayout title与disabled / invisibleLabel</h2>
      <CompareColumns original={<OriginalVariants />}>
        <div style={{ position: "relative" }}>
          <FieldsetLayout
            label="内联帮助字段集"
            help="这是内联帮助文本（helpInline）。"
            helpInline
          >
            <FieldLayout label="字段一" align="top">
              <TextInput />
            </FieldLayout>
          </FieldsetLayout>
          <FieldsetLayout label="视觉隐藏的字段集标题" invisibleLabel>
            <FieldLayout label="字段一" align="top">
              <TextInput />
            </FieldLayout>
          </FieldsetLayout>
          <div>
            FieldLayout title
            <FieldLayout label="悬浮标签看title" align="top" title="字段title提示">
              <TextInput />
            </FieldLayout>
          </div>
          <div>
            FieldLayout disabled
            <FieldLayout label="禁用字段" align="top" disabled>
              <TextInput />
            </FieldLayout>
          </div>
          <div>
            disabled（原生fieldset禁用，组内控件一并禁用）
            <FieldsetLayout label="禁用字段集" disabled>
              <FieldLayout label="组内输入框" align="top">
                <TextInput />
              </FieldLayout>
            </FieldsetLayout>
          </div>
          <div>
            invisibleLabel（标签视觉隐藏，保留for关联与可访问名）
            <FieldLayout label="用户名" align="top" invisibleLabel>
              <TextInput />
            </FieldLayout>
          </div>
        </div>
      </CompareColumns>
    </CompareLayout>
  );
}

FieldsetComparePage.displayName = "FieldsetComparePage";

export default FieldsetComparePage;

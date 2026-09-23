import { useEffect, useRef, useState } from "react";
import {
  Button,
  ButtonSelect,
  Dropdown,
  FieldLayout,
  Label,
  TextInput,
  ToggleSwitch,
} from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import { createRowAppender, useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

type CommonPropsUi = {
  ButtonWidget: new (config?: Record<string, unknown>) => {
    $element: unknown;
    $button: { attr: (name: string, value: string) => unknown };
  };
  TextInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  ToggleSwitchWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  DropdownWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  ButtonSelectWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  FieldLayout: new (
    field: unknown,
    config?: Record<string, unknown>,
  ) => { $element: unknown };
};

/** 原版侧：Button的flags全集（invert配深色底） */
function OriginalFlagButtons() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as CommonPropsUi;
    const row = createRowAppender(container, register);
    row(ui.ButtonWidget, "warning", { label: "Warning", flags: "warning" });
    row(ui.ButtonWidget, "success", { label: "Success", flags: "success" });
    // 无边框按钮才能看到invert反色：配置无边框并置于深色底
    row(ui.ButtonWidget, "invert", {
      label: "Invert",
      framed: false,
      flags: "invert",
      icon: "help",
    });
    row(ui.ButtonWidget, "数组形态", { label: "Array", flags: ["progressive"] });
    // 输入框同样有FlaggedElement：progressive标志输出在根类（oo-ui-flaggedElement-progressive）
    row(ui.TextInputWidget, "TextInput progressive", { flags: "progressive" });
    // 手工行：深色底上的invert按钮（row()不携带样式，需自建容器）
    const invertButton = new ui.ButtonWidget({
      label: "Invert",
      framed: false,
      flags: "invert",
      icon: "help",
    });
    register(invertButton);
    const darkRow = document.createElement("div");
    darkRow.textContent = "invert深色底";
    const darkBox = document.createElement("div");
    darkBox.style.cssText = "display:inline-block;background:#222;padding:0 8px;";
    darkBox.appendChild(unwrapJQuery(invertButton.$element));
    darkRow.appendChild(darkBox);
    container.appendChild(darkRow);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactFlagButtons() {
  return (
    <div>
      <div>
        warning
        <Button flags="warning">Warning</Button>
      </div>
      <div>
        success
        <Button flags="success">Success</Button>
      </div>
      <div>
        invert
        <Button framed={false} flags="invert" icon="help">
          Invert
        </Button>
      </div>
      <div>
        数组形态
        <Button flags={["progressive"]}>Array</Button>
      </div>
      <div>
        TextInput progressive
        <TextInput flags="progressive" />
      </div>
      <div>
        invert深色底
        <span style={{ display: "inline-block", background: "#222", padding: "0 8px" }}>
          <Button framed={false} flags="invert" icon="help">
            Invert
          </Button>
        </span>
      </div>
    </div>
  );
}

/** 原版侧：invisibleLabel/accessKey/tabIndex的元素级参数 */
function OriginalElementProps() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as CommonPropsUi;
    const row = createRowAppender(container, register);
    // invisibleLabel：标签视觉隐藏但保留可访问名称（读屏读"帮助"），title作悬浮提示
    row(ui.ButtonWidget, "仅图标invisibleLabel", {
      icon: "help",
      label: "帮助",
      invisibleLabel: true,
      title: "帮助",
    });
    row(ui.ButtonWidget, "accessKey", {
      label: "AccessKey",
      accessKey: "b",
      title: "带键位的按钮",
    });
    row(ui.TextInputWidget, "accessKey", {
      placeholder: "accessKey=t",
      accessKey: "t",
      title: "带键位的输入框",
    });
    row(ui.ButtonWidget, "tabIndex=5", { label: "Tab 5", tabIndex: 5 });
    row(ui.ButtonWidget, "禁用覆盖tabIndex", {
      label: "Disabled Tab",
      tabIndex: 5,
      disabled: true,
    });
    // dir落在内部input而非根元素（InputWidget#setDir写$input），可在DOM中核对
    row(ui.TextInputWidget, "dir=rtl", { dir: "rtl", label: "标签" });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactElementProps() {
  const buttonRef = useRef<HTMLSpanElement>(null);
  const [refInfo, setRefInfo] = useState("—");

  useEffect(() => {
    const el = buttonRef.current;
    setRefInfo(el ? `${el.tagName}.${el.className.split(" ")[0]}` : "—");
  }, []);

  return (
    <div>
      <div>
        仅图标invisibleLabel
        <Button icon="help" invisibleLabel title="帮助">
          帮助
        </Button>
      </div>
      <div>
        accessKey
        <Button accessKey="b" title="带键位的按钮" onClick={() => {}}>
          AccessKey
        </Button>
      </div>
      <div>
        accessKey
        <TextInput accessKey="t" title="带键位的输入框" placeholder="accessKey=t" />
      </div>
      <div>
        tabIndex=5
        <Button tabIndex={5}>Tab 5</Button>
      </div>
      <div>
        禁用覆盖tabIndex
        <Button tabIndex={5} disabled>
          Disabled Tab
        </Button>
      </div>
      <div>
        dir=rtl
        <TextInput dir="rtl" label="标签" />
      </div>
      <div>
        ref 转发
        <Button ref={buttonRef}>Ref</Button>
        <span className="cmp-value">{refInfo}</span>
      </div>
    </div>
  );
}

/** 原版侧：aria命名。原版无声明式aria通道，经$button.attr写入（与React的aria落点同为锚点） */
function OriginalAriaNaming() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as CommonPropsUi;
    // aria属性写入$button而非$element，与原版可访问名落点一致
    const append = (name: string, widget: { $element: unknown }) => {
      register(widget);
      const el = document.createElement("div");
      el.textContent = name;
      el.appendChild(unwrapJQuery(widget.$element));
      container.appendChild(el);
    };

    const iconButton = new ui.ButtonWidget({ icon: "check" });
    iconButton.$button.attr("aria-label", "确认");
    append("aria-label", iconButton);

    // aria-labelledby指向行外说明span（id避免与React侧重复）
    const labelledButton = new ui.ButtonWidget({ label: "删除" });
    labelledButton.$button.attr("aria-labelledby", "ext-label-orig");
    append("aria-labelledby", labelledButton);
    const extLabel = document.createElement("span");
    extLabel.id = "ext-label-orig";
    extLabel.textContent = "（删除所选条目）";
    container.appendChild(extLabel);

    // 原版开关命名靠FieldLayout包裹（label经for/aria关联），无直接aria-label通道
    const toggle = new ui.ToggleSwitchWidget({});
    register(toggle);
    const field = new ui.FieldLayout(toggle, { label: "自动保存", align: "left" });
    append("FieldLayout命名开关", field);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactAriaNaming() {
  return (
    <div>
      <div>
        aria-label
        <Button icon="check" aria-label="确认" />
      </div>
      <div>
        aria-labelledby
        <Button aria-labelledby="ext-label-react">删除</Button>
        <span id="ext-label-react">（删除所选条目）</span>
      </div>
      <div>
        aria-labelledby命名开关
        <span id="switch-label-react">自动保存</span>
        <ToggleSwitch aria-labelledby="switch-label-react" />
      </div>
    </div>
  );
}

/** 原版侧：FieldLayout标签联动（通道A：输入类；通道B：点击聚焦无input控件） */
function OriginalFieldLink() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as CommonPropsUi;
    const append = (name: string, widget: { $element: unknown }) => {
      register(widget);
      const el = document.createElement("div");
      el.textContent = name;
      el.appendChild(unwrapJQuery(widget.$element));
      container.appendChild(el);
    };

    append(
      "通道A：TextInput",
      new ui.FieldLayout(new ui.TextInputWidget({}), {
        label: "点击标签聚焦输入框",
        align: "left",
      }),
    );
    // label为无选中项时handle内的占位文本（与React侧Dropdown的label prop对称）；
    // menu项对齐React侧options（data对应value、label对应children）
    const menuOption = new (
      oo.ui as unknown as {
        MenuOptionWidget: new (config?: Record<string, unknown>) => unknown;
      }
    ).MenuOptionWidget({ data: "a", label: "选项A" });
    const dropdown = new ui.DropdownWidget({
      label: "选择",
      menu: { items: [menuOption] },
    });
    register(dropdown);
    append(
      "通道B：Dropdown",
      new ui.FieldLayout(dropdown, { label: "点击标签聚焦handle", align: "left" }),
    );
    const buttonOption = new (
      oo.ui as unknown as {
        ButtonOptionWidget: new (config?: Record<string, unknown>) => unknown;
      }
    ).ButtonOptionWidget({ data: "a", label: "选项A" });
    const select = new ui.ButtonSelectWidget({ items: [buttonOption] });
    register(select);
    append(
      "通道B：ButtonSelect",
      new ui.FieldLayout(select, { label: "点击标签选中选项", align: "left" }),
    );
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
      <div>
        通道A：TextInput
        <FieldLayout label="点击标签聚焦输入框" align="left">
          <TextInput />
        </FieldLayout>
      </div>
      <div>
        通道B：Dropdown
        <FieldLayout label="点击标签聚焦handle" align="left">
          <Dropdown label="选择" options={[{ value: "a", children: "选项A" }]} />
        </FieldLayout>
      </div>
      <div>
        通道B：ButtonSelect
        <FieldLayout label="点击标签选中选项" align="left">
          <ButtonSelect options={[{ value: "a", children: "选项A" }]} />
        </FieldLayout>
      </div>
    </div>
  );
}

/** 原版侧：classes/id透传（Element config的classes/id）与Label的disabled */
function OriginalPassthrough() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as CommonPropsUi;
    const row = createRowAppender(container, register);
    const append = (name: string, node: Node) => {
      const el = document.createElement("div");
      el.textContent = name;
      el.appendChild(node);
      container.appendChild(el);
    };

    row(ui.ButtonWidget, "classes数组", {
      label: "Custom Class",
      classes: ["pg-custom-class"],
    });
    row(ui.ButtonWidget, "id", { label: "With Id", id: "pg-btn-orig" });

    // style无声明式通道：原版经$element命令式设置（React侧为style prop透传）
    const styled = new ui.ButtonWidget({ label: "Custom Style" });
    (unwrapJQuery(styled.$element) as HTMLElement).style.outline = "2px dashed #36c";
    append("style", unwrapJQuery(styled.$element));
    register(styled);

    row(ui.ButtonWidget, "disabled", { label: "Disabled", disabled: true });

    const label = new (
      oo.ui as unknown as {
        LabelWidget: new (config?: Record<string, unknown>) => { $element: unknown };
      }
    ).LabelWidget({ label: "禁用标签", disabled: true });
    append("Label disabled", unwrapJQuery(label.$element));
    register(label);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactPassthrough() {
  return (
    <div>
      <div>
        classes数组
        <Button className="pg-custom-class">Custom Class</Button>
      </div>
      <div>
        id
        <Button id="pg-btn-react">With Id</Button>
      </div>
      <div>
        style
        <Button style={{ outline: "2px dashed #36c" }}>Custom Style</Button>
      </div>
      <div>
        disabled
        <Button disabled>Disabled</Button>
      </div>
      <div>
        Label disabled
        <Label disabled>禁用标签</Label>
      </div>
    </div>
  );
}

function CommonPropsComparePage() {
  return (
    <CompareLayout
      title="通用属性（Element级）对照"
      description={
        <>
          对照点：flags全集（warning/success/invert图标变体、数组形态与TextInput的
          progressive）、invisibleLabel
          （仅图标按钮保留可访问名）、accessKey（title附键位后缀）、tabIndex
          （禁用时覆盖为-1）、dir（TextInput的dir落在内部input而非根元素）、
          aria-label/aria-labelledby命名（含role=switch开关的命名，
          原版开关靠FieldLayout关联）、FieldLayout标签联动双通道（通道A
          htmlFor聚焦输入框、
          通道B点击标签激活无input控件）、classes/id/style/ref透传。全局dir/RTL用页面顶部的
          方向开关整体切换，元素级dir落点在本页accessKey/dir所在区块演示。
        </>
      }
    >
      <h2>Button flags全集</h2>
      <CompareColumns original={<OriginalFlagButtons />}>
        <ReactFlagButtons />
      </CompareColumns>

      <h2>invisibleLabel / accessKey / tabIndex / dir / ref</h2>
      <CompareColumns original={<OriginalElementProps />}>
        <ReactElementProps />
      </CompareColumns>

      <h2>aria命名</h2>
      <CompareColumns original={<OriginalAriaNaming />}>
        <ReactAriaNaming />
      </CompareColumns>

      <h2>FieldLayout标签联动</h2>
      <CompareColumns original={<OriginalFieldLink />}>
        <ReactFieldLink />
      </CompareColumns>

      <h2>透传通道</h2>
      <CompareColumns original={<OriginalPassthrough />}>
        <ReactPassthrough />
      </CompareColumns>
    </CompareLayout>
  );
}

CommonPropsComparePage.displayName = "CommonPropsComparePage";

export default CommonPropsComparePage;

import { useState } from "react";
import {
  ActionFieldLayout,
  Button,
  ButtonInput,
  CheckboxMultiselectInput,
  Dropdown,
  DropdownInput,
  FieldLayout,
  FieldsetLayout,
  FormLayout,
  HiddenInputWidget,
  RadioSelectInput,
  sanitizeUrl,
  TextInput,
} from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import {
  appendValueOutput,
  createRowAppender,
  useOriginalWidgets,
} from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

const serialize = (form: HTMLFormElement) => {
  const data: Record<string, string> = {};
  for (const [key, value] of new FormData(form).entries()) {
    data[key] = data[key] ? `${data[key]},${String(value)}` : String(value);
  }
  return JSON.stringify(data);
};

const dropdownOptions = [
  { optgroup: "分组一" },
  { data: "a", label: "Option A" },
  { data: "b", label: "Option B", disabled: true },
  { optgroup: "分组二" },
  { data: "c", label: "Option C" },
];
const radioOptions = [
  { data: "r1", label: "单选一" },
  { data: "r2", label: "单选二" },
  { data: "r3", label: "单选禁用", disabled: true },
];
const checkboxOptions = [
  { data: "c1", label: "多选一" },
  { data: "c2", label: "多选二" },
  { data: "c3", label: "多选禁用", disabled: true },
];

/** 原版侧：完整表单（提交后FormData序列化结果与React侧对照） */
function OriginalForm() {
  const [result, setResult] = useState("（尚未提交）");
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as {
      TextInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
      DropdownInputWidget: new (config?: Record<string, unknown>) => {
        $element: unknown;
      };
      RadioSelectInputWidget: new (config?: Record<string, unknown>) => {
        $element: unknown;
      };
      CheckboxMultiselectInputWidget: new (config?: Record<string, unknown>) => {
        $element: unknown;
      };
      ButtonInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
      ButtonWidget: new (config?: Record<string, unknown>) => { $element: unknown };
      DropdownWidget: new (config?: Record<string, unknown>) => { $element: unknown };
      HiddenInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
      MenuOptionWidget: new (config?: Record<string, unknown>) => { $element: unknown };
      FieldLayout: new (
        field: unknown,
        config?: Record<string, unknown>,
      ) => { $element: unknown };
      FieldsetLayout: new (config?: Record<string, unknown>) => {
        $element: unknown;
        addItems: (items: unknown[]) => void;
      };
      ActionFieldLayout: new (
        field: unknown,
        button: unknown,
        config?: Record<string, unknown>,
      ) => { $element: unknown };
      FormLayout: new (config?: Record<string, unknown>) => {
        $element: unknown;
        addItems: (items: unknown[]) => void;
        on: (event: string, handler: () => boolean) => void;
      };
    };

    const username = new ui.TextInputWidget({ placeholder: "用户名", name: "username" });
    const dropdown = new ui.DropdownInputWidget({
      name: "dropdown",
      options: dropdownOptions,
      value: "c",
    });
    const radio = new ui.RadioSelectInputWidget({
      name: "radio",
      options: radioOptions,
      value: "r2",
    });
    const checks = new ui.CheckboxMultiselectInputWidget({
      name: "checks",
      options: checkboxOptions,
      value: ["c1"],
    });
    const button = new ui.ButtonWidget({ label: "按钮" });
    const hidden = new ui.HiddenInputWidget({ name: "hidden", value: "hidden-value" });
    // 按钮作为表单字段提交：name/value进FormData（提交读数应出现btnField=btnValue）
    const buttonField = new ui.ButtonInputWidget({
      label: "提交按钮",
      type: "submit",
      name: "btnField",
      value: "btnValue",
    });
    const dropdownWidget = new ui.DropdownWidget({
      label: "选择",
      menu: {
        items: [
          new ui.MenuOptionWidget({ data: "a", label: "Option A" }),
          new ui.MenuOptionWidget({ data: "b", label: "Option B", disabled: true }),
        ],
      },
    });

    const searchInput = new ui.TextInputWidget({ placeholder: "搜索", name: "search" });
    const searchButton = new ui.ButtonInputWidget({
      label: "搜索",
      type: "submit",
      flags: "primary",
      useInputTag: true,
    });
    const searchField = new ui.ActionFieldLayout(searchInput, searchButton, {
      label: "ActionField（input标签按钮）",
      align: "top",
    });

    const searchInput2 = new ui.TextInputWidget({ placeholder: "搜索", name: "search2" });
    const searchButton2 = new ui.ButtonInputWidget({
      label: "搜索",
      type: "submit",
      flags: "primary",
    });
    const searchField2 = new ui.ActionFieldLayout(searchInput2, searchButton2, {
      label: "ActionField（button标签按钮）",
      align: "top",
    });

    const fieldset = new ui.FieldsetLayout({ label: "表单对照" });
    const fieldLayouts = [
      new ui.FieldLayout(username, { label: "用户名", align: "top" }),
      new ui.FieldLayout(dropdown, { label: "下拉（含分组与禁用项）", align: "top" }),
      new ui.FieldLayout(radio, { label: "单选组", align: "top" }),
      new ui.FieldLayout(checks, { label: "多选组", align: "top" }),
      new ui.FieldLayout(button, { label: "按钮（标签点击聚焦）", align: "top" }),
      new ui.FieldLayout(dropdownWidget, { label: "下拉（标签点击聚焦）", align: "top" }),
      new ui.FieldLayout(hidden, { label: "隐藏值（提交结果应含hidden）", align: "top" }),
      new ui.FieldLayout(buttonField, {
        label: "提交按钮（name/value字段）",
        align: "top",
      }),
    ];
    register(
      username,
      dropdown,
      radio,
      checks,
      button,
      hidden,
      buttonField,
      dropdownWidget,
      searchInput,
      searchButton,
      searchField,
      searchInput2,
      searchButton2,
      searchField2,
      fieldset,
      ...fieldLayouts,
    );
    fieldset.addItems([...fieldLayouts, searchField, searchField2]);

    const form = new ui.FormLayout({ items: [fieldset], method: "post" });
    register(form);
    form.on("submit", () => {
      const formEl = unwrapJQuery(form.$element) as HTMLFormElement;
      setResult(serialize(formEl));
      // 返回false阻止默认提交（对齐原版FormLayout.onFormSubmit）
      return false;
    });

    container.appendChild(unwrapJQuery(form.$element));
  });

  return (
    <div>
      <div ref={containerRef} />
      <p style={{ wordBreak: "break-all" }}>提交结果：{result}</p>
    </div>
  );
}

function ReactForm() {
  const [result, setResult] = useState("（尚未提交）");

  return (
    <div>
      <FormLayout
        method="post"
        onSubmit={(event) => {
          event.preventDefault();
          setResult(serialize(event.currentTarget));
        }}
      >
        <FieldsetLayout label="表单对照">
          <FieldLayout label="用户名" align="top">
            <TextInput placeholder="用户名" name="username" />
          </FieldLayout>
          <FieldLayout label="下拉（含分组与禁用项）" align="top">
            <DropdownInput
              name="dropdown"
              options={[
                { children: "分组一" },
                { value: "a", children: "Option A" },
                { value: "b", children: "Option B", disabled: true },
                { children: "分组二" },
                { value: "c", children: "Option C" },
              ]}
              defaultValue="c"
            />
          </FieldLayout>
          <FieldLayout label="单选组" align="top">
            <RadioSelectInput
              name="radio"
              options={[
                { value: "r1", children: "单选一" },
                { value: "r2", children: "单选二" },
                { value: "r3", children: "单选禁用", disabled: true },
              ]}
              defaultValue="r2"
            />
          </FieldLayout>
          <FieldLayout label="多选组" align="top">
            <CheckboxMultiselectInput
              name="checks"
              options={[
                { value: "c1", children: "多选一" },
                { value: "c2", children: "多选二" },
                { value: "c3", children: "多选禁用", disabled: true },
              ]}
              defaultValue={["c1"]}
            />
          </FieldLayout>
          <FieldLayout label="按钮（标签点击聚焦）" align="top">
            <Button>按钮</Button>
          </FieldLayout>
          <FieldLayout label="下拉（标签点击聚焦）" align="top">
            <Dropdown
              label="选择"
              options={[
                { value: "a", children: "Option A" },
                { value: "b", children: "Option B", disabled: true },
              ]}
            />
          </FieldLayout>
          <FieldLayout label="隐藏值（提交结果应含hidden）" align="top">
            <HiddenInputWidget name="hidden" value="hidden-value" />
          </FieldLayout>
          <FieldLayout label="提交按钮（name/value字段）" align="top">
            {/* name/value作为表单字段随提交进FormData；useInputTag时<input>的value即标签文本，value会被其取代 */}
            <ButtonInput type="submit" name="btnField" value="btnValue">
              提交按钮
            </ButtonInput>
          </FieldLayout>
          <ActionFieldLayout
            label="ActionField（input标签按钮）"
            align="top"
            button={
              <ButtonInput type="submit" flags="primary" useInputTag>
                搜索
              </ButtonInput>
            }
          >
            <TextInput placeholder="搜索" name="search" />
          </ActionFieldLayout>
          <ActionFieldLayout
            label="ActionField（button标签按钮）"
            align="top"
            button={
              <ButtonInput type="submit" flags="primary">
                搜索
              </ButtonInput>
            }
          >
            <TextInput placeholder="搜索" name="search2" />
          </ActionFieldLayout>
        </FieldsetLayout>
      </FormLayout>
      <p style={{ wordBreak: "break-all" }}>提交结果：{result}</p>
    </div>
  );
}

/** 原版侧：TextInput的label位置/图标/maxLength/禁用变体 */
function OriginalTextInputVariants() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const TextInputWidget = oo.ui.TextInputWidget as unknown as new (
      config?: Record<string, unknown>,
    ) => { $element: unknown };
    const row = createRowAppender(container, register);
    row(TextInputWidget, "label after（默认）", {
      placeholder: "after (default)",
      label: "after (default)",
    });
    row(TextInputWidget, "label before", {
      placeholder: "before",
      label: "before",
      labelPosition: "before",
    });
    row(TextInputWidget, "图标+指示器", { icon: "search", indicator: "required" });
    row(TextInputWidget, "maxLength=10", { maxLength: 10 });
    row(TextInputWidget, "validate=integer", {
      placeholder: "整数",
      validate: "integer",
    });
    row(TextInputWidget, "禁用", { disabled: true });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：与原版逐行对应的TextInput变体 */
function ReactTextInputVariants() {
  const [length, setLength] = useState(0);

  return (
    <div>
      <div>
        label after（默认）
        <TextInput placeholder="after (default)" label="after (default)" />
      </div>
      <div>
        label before
        <TextInput placeholder="before" label="before" labelPosition="before" />
      </div>
      <div>
        图标+指示器
        <TextInput icon="search" indicator="required" />
      </div>
      <div>
        maxLength=10（label配合onChange显示剩余长度）
        <TextInput
          maxLength={10}
          label={10 - length}
          onChange={(value) => setLength(value.length)}
        />
      </div>
      <div>
        validate=integer（键入非整数或失焦时标红，聚焦清除）
        <TextInput placeholder="整数" validate="integer" />
      </div>
      <div>
        禁用
        <TextInput disabled />
      </div>
    </div>
  );
}

/** 原版侧：受控Inputs（setValue程序化改选）、禁用形态、form属性与fieldInline */
function OriginalControlledInputs() {
  const [readout, setReadout] = useState("（尚未提交）");
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as {
      DropdownInputWidget: new (config?: Record<string, unknown>) => {
        $element: unknown;
        setValue: (value: string) => void;
        getValue: () => string;
        on: (event: string, handler: () => void) => void;
      };
      RadioSelectInputWidget: new (config?: Record<string, unknown>) => {
        $element: unknown;
        setValue: (value: string) => void;
        getValue: () => string;
        on: (event: string, handler: () => void) => void;
      };
      CheckboxMultiselectInputWidget: new (config?: Record<string, unknown>) => {
        $element: unknown;
        setValue: (value: string[]) => void;
        getValue: () => string[];
        on: (event: string, handler: () => void) => void;
      };
      HiddenInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
      TextInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
      FieldsetLayout: new (config?: Record<string, unknown>) => {
        $element: unknown;
        addItems: (items: unknown[]) => void;
      };
      FieldLayout: new (
        field: unknown,
        config?: Record<string, unknown>,
      ) => { $element: unknown };
      ButtonInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
      ButtonWidget: new (config?: Record<string, unknown>) => { $element: unknown };
      FormLayout: new (config?: Record<string, unknown>) => {
        $element: { append: (content: string | Node) => unknown };
        on: (event: string, handler: () => boolean) => void;
      };
      ActionFieldLayout: new (
        field: unknown,
        button: unknown,
        config?: Record<string, unknown>,
      ) => { $element: unknown };
    };
    const row = createRowAppender(container, register);

    // 受控演示：外部按钮setValue（React为受控value+按钮写回），行尾cmp-value实时读值
    const dropdown = new ui.DropdownInputWidget({
      name: "cd-dropdown",
      options: dropdownOptions,
      value: "c",
    });
    register(dropdown);
    const dropdownRow = document.createElement("div");
    dropdownRow.textContent = "受控DropdownInput（初始c）";
    dropdownRow.appendChild(unwrapJQuery(dropdown.$element));
    const dropdownButton = document.createElement("button");
    dropdownButton.type = "button";
    dropdownButton.textContent = "程序化选中b";
    dropdownButton.addEventListener("click", () => dropdown.setValue("b"));
    dropdownRow.appendChild(dropdownButton);
    container.appendChild(dropdownRow);
    // 行尾读数监听change事件（程序化setValue与点击均派发），与React侧行尾读数对称
    const writeDropdownValue = appendValueOutput(dropdown);
    const syncDropdown = () => writeDropdownValue(dropdown.getValue());
    dropdown.on("change", syncDropdown);
    syncDropdown();

    const radio = new ui.RadioSelectInputWidget({
      name: "cd-radio",
      options: radioOptions,
      value: "r1",
    });
    register(radio);
    const radioRow = document.createElement("div");
    radioRow.textContent = "受控RadioSelectInput（初始r1）";
    radioRow.appendChild(unwrapJQuery(radio.$element));
    const radioButton = document.createElement("button");
    radioButton.type = "button";
    radioButton.textContent = "程序化选中r2";
    radioButton.addEventListener("click", () => radio.setValue("r2"));
    radioRow.appendChild(radioButton);
    container.appendChild(radioRow);
    const writeRadioValue = appendValueOutput(radio);
    const syncRadio = () => writeRadioValue(radio.getValue());
    radio.on("change", syncRadio);
    syncRadio();

    const checks = new ui.CheckboxMultiselectInputWidget({
      name: "cd-checks",
      options: checkboxOptions,
      value: ["c1"],
    });
    register(checks);
    const checksRow = document.createElement("div");
    checksRow.textContent = "受控CheckboxMultiselectInput（初始c1）";
    checksRow.appendChild(unwrapJQuery(checks.$element));
    const checksButton = document.createElement("button");
    checksButton.type = "button";
    checksButton.textContent = "程序化勾选c1/c2";
    checksButton.addEventListener("click", () => checks.setValue(["c1", "c2"]));
    checksRow.appendChild(checksButton);
    container.appendChild(checksRow);
    const writeChecksValue = appendValueOutput(checks);
    const syncChecks = () => writeChecksValue(JSON.stringify(checks.getValue()));
    checks.on("change", syncChecks);
    syncChecks();

    // 原版的disabled只切换类，不阻断表单提交
    row(ui.DropdownInputWidget, "禁用DropdownInput", {
      options: dropdownOptions,
      disabled: true,
    });
    row(ui.RadioSelectInputWidget, "禁用RadioSelectInput", {
      options: radioOptions,
      disabled: true,
    });
    row(ui.CheckboxMultiselectInputWidget, "禁用CheckboxMultiselectInput", {
      options: checkboxOptions,
      disabled: true,
    });

    // required：必填指示器（InputWidget系的required缺省指示器）
    row(ui.DropdownInputWidget, "required（必填指示器）", {
      options: dropdownOptions,
      required: true,
    });
    // ButtonInput的按钮形态与提交属性
    row(ui.ButtonInputWidget, "framed=false", {
      label: "无边框按钮",
      type: "button",
      framed: false,
    });
    row(ui.ButtonInputWidget, "active", {
      label: "激活态按钮",
      type: "button",
      active: true,
    });
    row(ui.ButtonInputWidget, "formNoValidate", {
      label: "提交（formnovalidate）",
      type: "submit",
      formNoValidate: true,
    });

    // 禁用hidden：原版disabled只切类仍提交（DEVIATIONS「增强」记录的差异点）
    const disabledHiddenForm = new ui.FormLayout({ method: "post" });
    const disabledHidden = new ui.HiddenInputWidget({
      name: "hd",
      value: "hidden-value",
      disabled: true,
    });
    const disabledHiddenButton = new ui.ButtonInputWidget({
      label: "提交禁用hidden",
      type: "submit",
    });
    register(disabledHiddenForm, disabledHidden, disabledHiddenButton);
    disabledHiddenForm.$element.append(unwrapJQuery(disabledHidden.$element));
    disabledHiddenForm.$element.append(unwrapJQuery(disabledHiddenButton.$element));
    disabledHiddenForm.on("submit", () => {
      const formEl = unwrapJQuery(disabledHiddenForm.$element) as HTMLFormElement;
      setReadout(
        `原版禁用hidden提交结果：${JSON.stringify(new FormData(formEl).get("hd"))}`,
      );
      return false;
    });
    const disabledHiddenRow = document.createElement("div");
    disabledHiddenRow.textContent = "HiddenInputWidget disabled（原版仍提交）";
    disabledHiddenRow.appendChild(unwrapJQuery(disabledHiddenForm.$element));
    container.appendChild(disabledHiddenRow);

    // FieldsetLayout disabled：原生<fieldset disabled>禁用组内输入控件并使其退出提交。
    // 原版Widget#setDisabled只切类与aria（oojs-ui.js:1848），原生禁用须直接设DOM属性
    const fieldsetForm = new ui.FormLayout({ method: "post" });
    const disabledFieldset = new ui.FieldsetLayout({ label: "禁用字段集" });
    const fieldsetInput = new ui.TextInputWidget({ name: "fs-input", value: "fs-value" });
    disabledFieldset.addItems([
      new ui.FieldLayout(fieldsetInput, { label: "组内输入", align: "top" }),
    ]);
    (unwrapJQuery(disabledFieldset.$element) as HTMLFieldSetElement).disabled = true;
    const fieldsetButton = new ui.ButtonInputWidget({
      label: "提交字段集",
      type: "submit",
    });
    register(fieldsetForm, disabledFieldset, fieldsetInput, fieldsetButton);
    fieldsetForm.$element.append(unwrapJQuery(disabledFieldset.$element));
    fieldsetForm.$element.append(unwrapJQuery(fieldsetButton.$element));
    fieldsetForm.on("submit", () => {
      const formEl = unwrapJQuery(fieldsetForm.$element) as HTMLFormElement;
      setReadout(
        `原版字段集提交结果：${JSON.stringify(new FormData(formEl).get("fs-input"))}`,
      );
      return false;
    });
    const fieldsetRow = document.createElement("div");
    fieldsetRow.textContent = "FieldsetLayout disabled（组内输入退出提交）";
    fieldsetRow.appendChild(unwrapJQuery(fieldsetForm.$element));
    container.appendChild(fieldsetRow);

    // action/enctype
    const attrForm = new ui.FormLayout({
      action: "./pg-submit",
      enctype: "multipart/form-data",
      method: "post",
    });
    register(attrForm);
    const attrRow = document.createElement("div");
    attrRow.textContent = "FormLayout action/enctype";
    attrRow.appendChild(unwrapJQuery(attrForm.$element));
    const formEl = unwrapJQuery(attrForm.$element) as HTMLFormElement;
    const attrReadout = document.createElement("p");
    attrReadout.textContent = `action=${formEl.getAttribute("action")} enctype=${formEl.getAttribute("enctype")}`;
    attrRow.appendChild(attrReadout);
    container.appendChild(attrRow);

    // fieldInline：span根字段（原版按字段根tagName自动判定，React显式声明）
    const inlineField = new ui.ActionFieldLayout(
      new ui.ButtonWidget({ label: "内联按钮" }),
      new ui.ButtonInputWidget({ label: "提交", type: "button" }),
      { label: "ActionField（span根字段，fieldInline）", align: "top" },
    );
    const inlineRow = document.createElement("div");
    inlineRow.textContent = "ActionField（span根字段，fieldInline）";
    inlineRow.appendChild(unwrapJQuery(inlineField.$element));
    container.appendChild(inlineRow);
    register(inlineField);

    // FieldLayout align变体：inline（label在字段之后、非换行排布）与right（仅类切换
    // oo-ui-fieldLayout-align-right）。原版inline要求字段根为span（isFieldInline），
    // div根字段静默回退top，故字段用span根的ButtonWidget
    const inlineAlignField = new ui.ButtonWidget({ label: "字段" });
    const inlineAlign = new ui.FieldLayout(inlineAlignField, {
      label: "align=inline",
      align: "inline",
    });
    const inlineAlignRow = document.createElement("div");
    inlineAlignRow.textContent = "FieldLayout align=inline";
    inlineAlignRow.appendChild(unwrapJQuery(inlineAlign.$element));
    container.appendChild(inlineAlignRow);
    register(inlineAlignField, inlineAlign);

    const rightAlignField = new ui.ButtonWidget({ label: "字段" });
    const rightAlign = new ui.FieldLayout(rightAlignField, {
      label: "align=right",
      align: "right",
    });
    const rightAlignRow = document.createElement("div");
    rightAlignRow.textContent = "FieldLayout align=right";
    rightAlignRow.appendChild(unwrapJQuery(rightAlign.$element));
    container.appendChild(rightAlignRow);
    register(rightAlignField, rightAlign);
  });

  return (
    <div>
      <div ref={containerRef} />
      <p style={{ wordBreak: "break-all" }}>读数：{readout}</p>
    </div>
  );
}

const reactDropdownOptions = [
  { children: "分组一" },
  { value: "a", children: "Option A" },
  { value: "b", children: "Option B", disabled: true },
  { children: "分组二" },
  { value: "c", children: "Option C" },
];
const reactRadioOptions = [
  { value: "r1", children: "单选一" },
  { value: "r2", children: "单选二" },
  { value: "r3", children: "单选禁用", disabled: true },
];
const reactCheckboxOptions = [
  { value: "c1", children: "多选一" },
  { value: "c2", children: "多选二" },
  { value: "c3", children: "多选禁用", disabled: true },
];

/** React侧：受控value+程序化写回、禁用形态、HiddenInputWidget disabled退出提交、form属性、fieldInline */
function ReactControlledInputs() {
  const [dropdownValue, setDropdownValue] = useState<string | number>("c");
  const [radioValue, setRadioValue] = useState<string | number>("r1");
  const [checkValue, setCheckValue] = useState<(string | number)[]>(["c1"]);
  const [readout, setReadout] = useState("（尚未提交）");

  return (
    <div>
      <div>
        受控DropdownInput（初始c）
        <DropdownInput
          name="cd-dropdown"
          options={reactDropdownOptions}
          value={dropdownValue}
          onChange={setDropdownValue}
        />
        <button type="button" onClick={() => setDropdownValue("b")}>
          程序化选中b
        </button>
        <span className="cmp-value">{String(dropdownValue)}</span>
      </div>
      <div>
        受控RadioSelectInput（初始r1）
        <RadioSelectInput
          name="cd-radio"
          options={reactRadioOptions}
          value={radioValue}
          onChange={setRadioValue}
        />
        <button type="button" onClick={() => setRadioValue("r2")}>
          程序化选中r2
        </button>
        <span className="cmp-value">{String(radioValue)}</span>
      </div>
      <div>
        受控CheckboxMultiselectInput（初始c1）
        <CheckboxMultiselectInput
          name="cd-checks"
          options={reactCheckboxOptions}
          value={checkValue}
          onChange={setCheckValue}
        />
        <button type="button" onClick={() => setCheckValue(["c1", "c2"])}>
          程序化勾选c1/c2
        </button>
        <span className="cmp-value">{JSON.stringify(checkValue)}</span>
      </div>
      <div>
        禁用DropdownInput
        <DropdownInput options={reactDropdownOptions} disabled />
      </div>
      <div>
        禁用RadioSelectInput
        <RadioSelectInput options={reactRadioOptions} disabled />
      </div>
      <div>
        禁用CheckboxMultiselectInput
        <CheckboxMultiselectInput options={reactCheckboxOptions} disabled />
      </div>
      <div>
        required（必填指示器）
        <DropdownInput options={reactDropdownOptions} required />
      </div>
      <div>
        framed=false
        <ButtonInput type="button" framed={false}>
          无边框按钮
        </ButtonInput>
      </div>
      <div>
        active
        <ButtonInput type="button" active>
          激活态按钮
        </ButtonInput>
      </div>
      <div>
        {/* 行名后缀为React侧行为补充说明，原版侧无此说明 */}
        formNoValidate（提交属性落在DOM，无视觉差异）
        <ButtonInput type="submit" formNoValidate>
          提交（formnovalidate）
        </ButtonInput>
      </div>
      <div>
        {/* 行名后缀为React侧行为补充说明，原版侧无此说明 */}
        HiddenInputWidget disabled（本工程退出提交）
        <FormLayout
          method="post"
          onSubmit={(event) => {
            event.preventDefault();
            setReadout(
              `React禁用hidden提交结果：${JSON.stringify(new FormData(event.currentTarget).get("hd"))}`,
            );
          }}
        >
          <HiddenInputWidget name="hd" value="hidden-value" disabled />
          <ButtonInput type="submit">提交禁用hidden</ButtonInput>
        </FormLayout>
      </div>
      <div>
        FieldsetLayout disabled（组内输入退出提交）
        <FormLayout
          method="post"
          onSubmit={(event) => {
            event.preventDefault();
            setReadout(
              `React字段集提交结果：${JSON.stringify(new FormData(event.currentTarget).get("fs-input"))}`,
            );
          }}
        >
          {/* 根为原生fieldset，disabled原生禁用组内输入并使其退出提交（原版侧须直接设DOM属性） */}
          <FieldsetLayout label="禁用字段集" disabled>
            <FieldLayout label="组内输入" align="top">
              <TextInput name="fs-input" defaultValue="fs-value" />
            </FieldLayout>
          </FieldsetLayout>
          <ButtonInput type="submit">提交字段集</ButtonInput>
        </FormLayout>
      </div>
      <div>
        FormLayout action/enctype
        <FormLayout action="./pg-submit" enctype="multipart/form-data" method="post" />
        <p>action=./pg-submit enctype=multipart/form-data</p>
      </div>
      <div>
        ActionField（span根字段，fieldInline）
        <ActionFieldLayout
          label="ActionField（span根字段，fieldInline）"
          align="top"
          fieldInline
          button={<ButtonInput type="button">提交</ButtonInput>}
        >
          <Button>内联按钮</Button>
        </ActionFieldLayout>
      </div>
      <div>
        {/* label位于字段之后、非换行排布（原版isFieldInline要求字段根为span，div根回退top；本工程不校验） */}
        FieldLayout align=inline
        <FieldLayout label="align=inline" align="inline">
          <Button>字段</Button>
        </FieldLayout>
      </div>
      <div>
        {/* 仅类切换oo-ui-fieldLayout-align-right */}
        FieldLayout align=right
        <FieldLayout label="align=right" align="right">
          <Button>字段</Button>
        </FieldLayout>
      </div>
      <div>
        {/* 原生事件回调经rest透传到button/input元素（原版侧等价能力为jQuery事件绑定） */}
        ButtonInput事件透传（mousedown/keydown等写读数）
        <ButtonInput
          type="button"
          onMouseDown={() => setReadout("ButtonInput mousedown")}
          onKeyDown={(event) => setReadout(`ButtonInput keydown ${event.key}`)}
          onMouseUp={() => setReadout("ButtonInput mouseup")}
        >
          交互触发事件
        </ButtonInput>
      </div>
      <p style={{ wordBreak: "break-all" }}>读数：{readout}</p>
    </div>
  );
}

/** 原版侧：不安全action被isSafeUrl自动加"./"前缀中和（OO.ui.isSafeUrl的两个消费点之一） */
function OriginalUnsafeAction() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as {
      FormLayout: new (config?: Record<string, unknown>) => {
        $element: { append: (content: string | Node) => unknown };
      };
      ButtonInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
    };
    const row = createRowAppender(container, register);
    const unsafeForm = row(ui.FormLayout, "不安全action（原版自动加./前缀）", {
      action: "javascript:alert(1)",
      method: "post",
    });
    unsafeForm.$element.append(
      unwrapJQuery(new ui.ButtonInputWidget({ label: "提交", type: "submit" }).$element),
    );
    const formEl = unwrapJQuery(unsafeForm.$element) as HTMLFormElement;
    const readout = document.createElement("p");
    readout.textContent = `DOM action=${formEl.getAttribute("action")}`;
    container.appendChild(readout);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

/**
 * React侧：本工程不自动改写URL（DEVIATIONS「舍弃」的isSafeUrl条），action原样渲染；
 * 来源不可信时由调用方经导出的sanitizeUrl净化（第二行的action属性与原版自动改写结果一致）
 */
function ReactUnsafeAction() {
  return (
    <div>
      <div>
        未净化（action原样保留——已知差异）
        <FormLayout action="javascript:alert(1)" method="post">
          <ButtonInput type="submit">提交</ButtonInput>
        </FormLayout>
      </div>
      <div>
        经sanitizeUrl净化（与原版自动改写结果一致）
        <FormLayout action={sanitizeUrl("javascript:alert(1)")} method="post">
          <ButtonInput type="submit">提交</ButtonInput>
        </FormLayout>
      </div>
      <p>
        DOM action：
        <span className="cmp-value">
          {sanitizeUrl("https://ok.example.com")} / {sanitizeUrl("javascript:alert(1)")}
        </span>
      </p>
    </div>
  );
}

function FormComparePage() {
  return (
    <CompareLayout
      title="Form / Inputs 对照"
      description={
        <>
          对照点：FormLayout包裹表单、DropdownInput（隐藏select+分组optgroup+禁用项）、
          RadioSelectInput（默认选中首项语义）、CheckboxMultiselectInput（checkbox的name/value表单提交）、
          ButtonInput（submit按钮触发原生提交，两种标签形态，name/value作为表单字段进FormData）、
          ActionFieldLayout（输入框+按钮组合）、
          FieldLayout标签联动（点击标签聚焦输入框/勾选首个非禁用项/按钮/下拉把手）、
          HiddenInputWidget（隐藏值随表单提交）、点击两侧提交按钮后FormData序列化结果应一致。
          「受控Inputs」区块验证受控value+程序化写回、Input族disabled、form的action/enctype
          与fieldInline（span根字段的输入区包装）、FieldsetLayout disabled
          （原生fieldset禁用组内输入并使其退出提交，与原版widget仅切类的禁用路径不同）、
          FieldLayout
          align=inline/right（label在字段后/右侧的排布）；其中HiddenInputWidget
          disabled为已知差异：
          原版仅切类、值仍随表单提交，本工程按原生语义退出提交（DEVIATIONS「增强」）。
        </>
      }
    >
      <h2>表单与Input</h2>
      <CompareColumns original={<OriginalForm />}>
        <ReactForm />
      </CompareColumns>

      <h2>TextInput变体</h2>
      <CompareColumns original={<OriginalTextInputVariants />}>
        <ReactTextInputVariants />
      </CompareColumns>

      <h2>受控Inputs / form属性 / fieldInline</h2>
      <CompareColumns original={<OriginalControlledInputs />}>
        <ReactControlledInputs />
      </CompareColumns>

      <h2>action的URL净化（sanitizeUrl）</h2>
      <CompareColumns original={<OriginalUnsafeAction />}>
        <ReactUnsafeAction />
      </CompareColumns>
    </CompareLayout>
  );
}

FormComparePage.displayName = "FormComparePage";

export default FormComparePage;

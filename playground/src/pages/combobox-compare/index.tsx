import { useRef, useState } from "react";
import { ComboBoxInput } from "ooui-react";
import { AriaProbe, findOwnedMenu } from "../../components/AriaProbe";
import { unwrapJQuery } from "../../components/ooui";
import { createRowAppender, useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

/** 菜单的动态ARIA属性：读数两侧取同一组属性名 */
const MENU_ARIA = ["aria-expanded", "aria-owns", "aria-activedescendant"];

const comboOptions = [
  { data: "Option A", label: "Option A" },
  { data: "Option B", label: "Option B" },
  { data: "Option C", label: "Option C" },
  { data: "Other", label: "自定义输入也合法" },
];

/** React侧选项集：与comboOptions同款4项（data→value、label→children），两侧共用同一份内容 */
const reactComboOptions = [
  { value: "Option A", children: "Option A" },
  { value: "Option B", children: "Option B" },
  { value: "Option C", children: "Option C" },
  { value: "Other", children: "自定义输入也合法" },
];

function OriginalComboBox() {
  const [value, setValue] = useState("（尚未修改）");
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const combo = new (oo.ui.ComboBoxInputWidget as unknown as new (
      config?: Record<string, unknown>,
    ) => {
      $element: unknown;
      on: (event: string, handler: (v?: string) => void) => void;
      getValue: () => string;
    })({
      options: comboOptions,
      placeholder: "输入或从下拉选择",
    });
    register(combo);
    combo.on("change", () => setValue(combo.getValue()));
    container.appendChild(unwrapJQuery(combo.$element));

    // 与原版对应：ComboBoxInputWidget继承TextInputWidget，同样具备标签与required指示器回退
    const Combo = oo.ui.ComboBoxInputWidget as unknown as new (
      config?: Record<string, unknown>,
    ) => { $element: unknown };
    const labelled = new Combo({
      options: comboOptions,
      label: "带标签",
      required: true,
      placeholder: "label + required（指示器缺省回退）",
    });
    register(labelled);
    const row = document.createElement("div");
    row.textContent = "带标签";
    row.appendChild(unwrapJQuery(labelled.$element));
    container.appendChild(row);
  });

  return (
    <div>
      <div ref={containerRef} />
      <p>当前值：{value}</p>
      <p>键盘：输入展开菜单、↑↓移动高亮、Enter选定并收起、Esc收起、下拉按钮切换</p>
      <AriaProbe
        label="输入框读数（持有焦点元素）"
        target={() =>
          containerRef.current?.querySelector<HTMLElement>(
            "input.oo-ui-inputWidget-input",
          ) ?? null
        }
        attrs={MENU_ARIA}
      />
      <AriaProbe
        label="输入框声明拥有的菜单根读数"
        target={() =>
          findOwnedMenu(
            containerRef.current?.querySelector<HTMLElement>(
              "input.oo-ui-inputWidget-input",
            ),
          )
        }
        attrs={MENU_ARIA}
      />
    </div>
  );
}

function ReactComboBox() {
  const [value, setValue] = useState<string>("");
  const paneRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div ref={paneRef}>
        <ComboBoxInput
          options={reactComboOptions}
          placeholder="输入或从下拉选择"
          value={value}
          onChange={(next) => setValue(next)}
        />
      </div>
      {/* 与原版对应：ComboBoxInputWidget继承TextInputWidget，同样具备标签与required指示器回退 */}
      <div>
        带标签
        <ComboBoxInput
          options={reactComboOptions}
          label="带标签"
          required
          placeholder="label + required（指示器缺省回退）"
        />
      </div>
      <p>当前值：{value === "" ? "（尚未修改）" : `"${value}"`}</p>
      <p>键盘：输入展开菜单、↑↓移动高亮、Enter选定并收起、Esc收起、下拉按钮切换</p>
      <AriaProbe
        label="输入框读数（持有焦点元素）"
        target={() =>
          paneRef.current?.querySelector<HTMLElement>("input.oo-ui-inputWidget-input") ??
          null
        }
        attrs={MENU_ARIA}
      />
      <AriaProbe
        label="输入框声明拥有的菜单根读数"
        target={() =>
          findOwnedMenu(
            paneRef.current?.querySelector<HTMLElement>("input.oo-ui-inputWidget-input"),
          )
        }
        attrs={MENU_ARIA}
      />
    </div>
  );
}

/** 原版侧：disabled/readOnly/validate/maxLength/labelPosition/icon+indicator/禁用选项/空options */
function OriginalVariants() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const Combo = oo.ui.ComboBoxInputWidget as unknown as new (
      config?: Record<string, unknown>,
    ) => { $element: unknown };
    const row = createRowAppender(container, register);

    row(Combo, "禁用", { options: comboOptions, disabled: true });
    row(Combo, "readOnly（按钮与菜单联动禁用）", {
      options: comboOptions,
      readOnly: true,
    });
    row(Combo, "validate=integer（输入非整数标红）", {
      options: comboOptions,
      validate: "integer",
      placeholder: "输入123试试",
    });
    row(Combo, "maxLength=5", { options: comboOptions, maxLength: 5 });
    row(Combo, "labelPosition=before", {
      options: comboOptions,
      label: "前置标签",
      labelPosition: "before",
    });
    row(Combo, "icon+indicator", {
      options: comboOptions,
      icon: "search",
      indicator: "down",
    });
    row(Combo, "禁用选项", {
      options: [
        { data: "a", label: "可选" },
        { data: "b", label: "禁用项", disabled: true },
      ],
    });
    row(Combo, "空options（隐藏下拉按钮）", { options: [] });
    row(Combo, "非受控defaultValue（原版为构造期value）", {
      options: comboOptions,
      value: "Option A",
    });
    row(Combo, "invisibleLabel+label", {
      options: comboOptions,
      label: "视觉隐藏标签",
      labelPosition: "before",
      invisibleLabel: true,
    });
    row(Combo, "flags=primary（输出flaggedElement类）", {
      options: comboOptions,
      flags: "primary",
    });
    row(Combo, "name（落input的name属性）", {
      options: comboOptions,
      name: "combo-name",
    });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：与原版区块同名的参数组合 */
function ReactVariants() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div>
      <div>
        禁用
        <ComboBoxInput options={reactComboOptions} disabled />
      </div>
      <div>
        readOnly（按钮与菜单联动禁用）
        <ComboBoxInput options={reactComboOptions} readOnly />
      </div>
      <div>
        validate=integer（输入非整数标红）
        <ComboBoxInput
          options={reactComboOptions}
          validate="integer"
          placeholder="输入123试试"
        />
      </div>
      <div>
        maxLength=5
        <ComboBoxInput options={reactComboOptions} maxLength={5} />
      </div>
      <div>
        labelPosition=before
        <ComboBoxInput
          options={reactComboOptions}
          label="前置标签"
          labelPosition="before"
        />
      </div>
      <div>
        icon+indicator
        <ComboBoxInput options={reactComboOptions} icon="search" indicator="down" />
      </div>
      <div>
        禁用选项
        <ComboBoxInput
          options={[
            { value: "a", children: "可选" },
            { value: "b", children: "禁用项", disabled: true },
          ]}
        />
      </div>
      <div>
        空options（隐藏下拉按钮）
        <ComboBoxInput options={[]} />
      </div>
      <div>
        非受控defaultValue（原版为构造期value）
        <ComboBoxInput options={reactComboOptions} defaultValue="Option A" />
      </div>
      <div>
        invisibleLabel+label
        <ComboBoxInput
          options={reactComboOptions}
          label="视觉隐藏标签"
          labelPosition="before"
          invisibleLabel
        />
      </div>
      <div>
        flags=primary（输出flaggedElement类）
        <ComboBoxInput options={reactComboOptions} flags="primary" />
      </div>
      <div>
        name（落input的name属性）
        <ComboBoxInput options={reactComboOptions} name="combo-name" />
      </div>
      <div>
        {/* inputProps/inputRef为React侧逃生舱：自定义属性落到input、ref用于聚焦 */}
        inputProps+inputRef（自定义属性落input、按钮编程聚焦）
        <ComboBoxInput
          options={reactComboOptions}
          inputProps={{ id: "combo-custom-input", spellCheck: false }}
          inputRef={inputRef}
        />
        <button type="button" onClick={() => inputRef.current?.focus()}>
          聚焦input
        </button>
      </div>
    </div>
  );
}

function ComboBoxComparePage() {
  return (
    <CompareLayout
      title="ComboBoxInput 对照"
      description={
        <>
          对照点：输入即展开菜单、按值精确匹配选中项、↑↓键盘高亮（环绕）、Enter选定高亮项并收起、
          Esc/点击外部收起、下拉按钮切换菜单并聚焦输入框、无选项时隐藏按钮（empty类）。
          「状态与形态变体」区块验证disabled/readOnly（按钮与菜单联动禁用）、validate软校验
          （aria-invalid+invalid标志类，只标红不拦截）、maxLength、labelPosition=before、
          组件级icon/indicator、禁用选项与空options。
          <br />
          ARIA对照（下方实时读数）：输入框作为持有焦点的combobox，须在<b>输入框</b>上给出
          <code>aria-owns</code>与键盘高亮项的<code>aria-activedescendant</code>
          （对齐原版<code>setFocusOwner(widget.$tabIndexed)</code>
          ，此处$tabIndexed为$input），菜单根自身不应输出
          <code>aria-activedescendant</code>。
        </>
      }
    >
      <CompareColumns original={<OriginalComboBox />}>
        <ReactComboBox />
      </CompareColumns>

      <h2>状态与形态变体</h2>
      <CompareColumns original={<OriginalVariants />}>
        <ReactVariants />
      </CompareColumns>
    </CompareLayout>
  );
}

ComboBoxComparePage.displayName = "ComboBoxComparePage";

export default ComboBoxComparePage;

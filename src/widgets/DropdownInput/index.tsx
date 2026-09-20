import { forwardRef, type ChangeEvent } from "react";
import clsx from "clsx";
import { Dropdown, type DropdownOptionProps } from "../Dropdown";
import { Indicator } from "../Indicator";
import type { SelectOptionProps } from "../Select";
import { getWidgetClassName } from "../../mixins";
import { resolveSelectableValue, type ChangeHandler } from "../../utils";
import {
  useControlledValue,
  useControlledValueNotify,
  useFieldInputId,
  useSelectableValues,
} from "../../hooks";
import { useIsMobile } from "../../config";
import type { WidgetProps } from "../Widget";

/**
 * Option type of the dropdown select field (same as `Dropdown`'s).
 *
 * 表单下拉选择的选项类型（与 `Dropdown` 相同）。
 */
export type DropdownInputOptionProps = DropdownOptionProps;

type SelectableOption = SelectOptionProps & { value: string | number };

/** 是否“选项”而非分组标题（分组判定用；禁用项仍是选项，只是不可选，故不含disabled判定） */
const isValueOption = (option: DropdownInputOptionProps): option is SelectableOption =>
  "value" in option && option.value !== undefined;

export interface DropdownInputProps extends Omit<
  WidgetProps<HTMLDivElement>,
  "children"
> {
  /**
   * The option set: items with `value` are selectable, items without render as
   * group headings.
   *
   * 选项集：带 `value` 的为可选项，不带的为分组标题。
   */
  options: DropdownInputOptionProps[];

  /**
   * Current selected value (controlled; passing it enables controlled mode).
   *
   * 当前选中值（受控，传入即受控模式）。
   */
  value?: string | number;

  /**
   * Initial selected value for uncontrolled use.
   *
   * 非受控初始选中值。
   */
  defaultValue?: string | number;

  /**
   * Selected-value change callback. The second argument is the native change
   * event when a real control produced the change — the mobile native `<select>`
   * path carries it; choosing from the desktop Dropdown menu has no native event
   * and passes `undefined`.
   *
   * 选中值变更回调。第二参数为触发变更的原生 change 事件：移动端原生 `<select>`
   * 路径携带事件；桌面 Dropdown 菜单选定无对应原生事件，为 `undefined`。
   */
  onChange?: ChangeHandler<string | number, HTMLSelectElement>;

  /**
   * Form field name (lands on the hidden `select`).
   *
   * 表单提交字段名（落在隐藏的 `select` 上）。
   */
  name?: string;

  /**
   * Whether the field is required.
   *
   * 是否必填。
   */
  required?: boolean;
}

interface OptionGroup {
  /** 分组标题选项，开头无可选项时为undefined */
  section?: DropdownInputOptionProps;
  items: SelectableOption[];
}

/** 将扁平选项按分组标题聚合成optgroup结构 */
const groupOptions = (options: DropdownInputOptionProps[]): OptionGroup[] => {
  const groups: OptionGroup[] = [];
  for (const option of options) {
    if (!isValueOption(option)) {
      groups.push({ section: option, items: [] });
    } else {
      const last = groups[groups.length - 1];
      if (last) {
        last.items.push(option);
      } else {
        groups.push({ items: [option] });
      }
    }
  }
  return groups;
};

/**
 * A dropdown select field (OO.ui.DropdownInputWidget): a Dropdown for display and
 * interaction with an embedded hidden `<select>` carrying the form submission. A
 * value not among the selectable options falls back to the first selectable one.
 * On mobile (`OOUIProvider`'s `isMobile`) the native `<select>` becomes the
 * interaction surface.
 *
 * 表单下拉选择（对齐原版 OO.ui.DropdownInputWidget）：Dropdown 负责展示与交互，
 * 内嵌隐藏 `<select>` 承载表单提交。传入值不在可选项内时回退为首个可选值；
 * 移动端形态（`OOUIProvider` 的 `isMobile`）下由原生 `<select>` 承担交互。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/dropdown-input/index.html
 */
export const DropdownInput = forwardRef<HTMLDivElement, DropdownInputProps>(
  (
    {
      options,
      className,
      disabled,
      name,
      required,
      value,
      defaultValue,
      onChange,
      // 转发给内部Dropdown的handle（对齐原版DropdownInputWidget把$tabIndexed重定向到内部Dropdown的handle）
      tabIndex,
      ...rest
    },
    ref,
  ) => {
    const isMobile = useIsMobile();
    const { value: currentValue, commit } = useControlledValue<
      string | number,
      ChangeEvent<HTMLSelectElement>
    >({ value, defaultValue }, onChange);
    // FieldLayout标签联动（通道A）：select认领字段id；桌面形态select隐藏（点击标签无可见效果），
    // 移动端形态下原生select可见，点击标签即聚焦
    const fieldInputId = useFieldInputId();

    // 可选值集合；当前值不在其中时回退首个可选值（无可选值则undefined）
    const { values: selectableValues } = useSelectableValues(options);
    const effectiveValue = resolveSelectableValue(currentValue, selectableValues);
    // 受控值为非法值时回写生效值，避免父级state与显示值漂移
    useControlledValueNotify(value, effectiveValue, onChange);

    const groups = groupOptions(options);

    const classes = clsx(
      className,
      getWidgetClassName({ disabled }, "input", "dropdownInput"),
      isMobile && "oo-ui-isMobile",
    );

    const renderOption = (option: SelectableOption) => (
      <option
        key={String(option.value)}
        value={String(option.value)}
        disabled={option.disabled}
      >
        {option.children}
      </option>
    );

    return (
      <div
        {...rest}
        className={classes}
        aria-disabled={disabled || undefined}
        // 不输出aria-required：外层div无适用role，该属性对AT无效；必填语义由内层
        // 原生<select required>承载（原生input类组件上的aria-required见DEVIATIONS「等效替代」）
        ref={ref}
      >
        {/* 隐藏select仅承载表单提交（wikimediaui主题下display:none），显示交互由Dropdown承担；
          移动端形态下select转为可见的交互元素。原版0.54的getInputElement为原生`<select>`，
          下箭头由独立的IndicatorWidget子元素承担（移动端CSS按`> .oo-ui-indicatorWidget`显示） */}
        <select
          id={fieldInputId}
          className="oo-ui-inputWidget-input"
          name={name}
          required={required}
          disabled={disabled}
          value={effectiveValue === undefined ? "" : String(effectiveValue)}
          onChange={(event) => {
            // select的value恒为字符串，映射回选项原值类型再提交，与Dropdown路径一致；
            // 事件为原生change，随commit透传
            const match = selectableValues.find((v) => String(v) === event.target.value);
            if (match !== undefined) {
              commit(match, event);
            }
          }}
        >
          {groups.map((group, i) =>
            group.section ? (
              <optgroup
                key={i}
                label={
                  typeof group.section.children === "string" ||
                  typeof group.section.children === "number"
                    ? String(group.section.children)
                    : undefined
                }
                disabled={group.section.disabled}
              >
                {group.items.map(renderOption)}
              </optgroup>
            ) : (
              group.items.map(renderOption)
            ),
          )}
        </select>
        {/* 对齐原版构造函数append的下箭头指示器；桌面形态由主题CSS隐藏 */}
        <Indicator indicator="down" />
        <Dropdown
          options={options}
          disabled={disabled}
          value={effectiveValue}
          // 菜单选定无原生change事件（原版的change亦为程序化派发），第二参数保持undefined
          onChange={(next) => commit(next)}
          tabIndex={tabIndex}
        />
      </div>
    );
  },
);

DropdownInput.displayName = "DropdownInput";

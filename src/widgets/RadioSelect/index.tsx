import {
  useState,
  forwardRef,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEventHandler,
  type MouseEventHandler,
} from "react";
import clsx from "clsx";
import { RadioOption, type RadioOptionProps } from "../RadioOption";
import {
  getWidgetClassName,
  mergeAriaLabelledBy,
  resolveTabIndex,
  selectWidgetStateClasses,
} from "../../mixins";

/**
 * Option type of the radio group (the `RadioOption` props).
 *
 * 单选组的选项类型（即 `RadioOption` 的 props）。
 */
export type RadioSelectOptionProps = RadioOptionProps;
import { resolveOptionDisabled, type ChangeHandler } from "../../utils";
import {
  FieldLabelLinkProvider,
  useControlledValue,
  useFieldGroupLabelLink,
  useFieldLabelFocus,
  useGroupKeyboardSelection,
  useSelectableValues,
} from "../../hooks";
import type { WidgetProps } from "../Widget";

export interface RadioSelectProps extends WidgetProps {
  /**
   * The option set; each item has `value` and `children` (the option text).
   *
   * 选项集，每项含 `value` 与 `children`（选项文本）
   */
  options: RadioOptionProps[];

  /**
   * Form field name, passed to each option's native `radio` (same name = mutually
   * exclusive).
   *
   * 表单提交字段名，透传给每个选项的原生 `radio`（同名即互斥）
   */
  name?: string;

  /**
   * Current selected value (controlled; passing it enables controlled mode)
   *
   * 当前选中值（受控，传入即受控模式）
   */
  value?: string | number;

  /**
   * Initial selected value for uncontrolled use
   *
   * 非受控初始选中值
   */
  defaultValue?: string | number;

  /**
   * Selected-value change callback (value-first, incl. native event).
   *
   * 选中值变更回调（值优先，含原生事件）
   */
  onChange?: ChangeHandler<string | number, HTMLInputElement>;
}

// 实现说明：对齐原版OO.ui.RadioSelectWidget——整组以radiogroup聚焦，↑↓←→在非禁用项间
// 环绕移动并直接改选、Enter重申当前项，聚焦且无选中项时自动选中首个非禁用项
/**
 * A radio group: several radio items in one group, mutually exclusive with at most
 * one selected.
 *
 * 单选组：若干单选项排成一组，同组互斥、至多选中一项。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/radio-select/index.html
 */
export const RadioSelect = forwardRef<HTMLDivElement, RadioSelectProps>(
  (
    {
      options,
      className,
      disabled,
      name,
      value,
      defaultValue,
      onChange,
      onKeyDown,
      onFocus,
      tabIndex,
      "aria-labelledby": ariaLabelledBy,
      ...rest
    },
    ref,
  ) => {
    const { value: currentValue, commit } = useControlledValue<
      string | number,
      ChangeEvent<HTMLInputElement>
    >({ value, defaultValue }, onChange);
    const [pressed, setPressed] = useState(false);
    // FieldLayout标签联动（通道B）：点击标签聚焦容器（对齐原版TabIndexedElement.simulateLabelClick
    // 基线focus()，禁用时不聚焦）
    const { setRef: setRootRef, fieldLabelId } = useFieldLabelFocus<HTMLDivElement>({
      ref,
      disabled,
    });
    // 通道A屏蔽：组内每个radio都会认领同一字段id（重复id且label误切首个选项），禁用之
    const groupLink = useFieldGroupLabelLink();

    const classes = clsx(
      className,
      getWidgetClassName({ disabled }, "select", "radioSelect"),
      selectWidgetStateClasses(pressed),
    );

    // 对齐原版SelectWidget.onMouseDown（RadioSelectWidget继承，oojs-ui.js:7416-7428）：
    // return false在if之外无条件执行，禁用/右键同样阻止mousedown默认的焦点转移；preventDefault
    // 不阻碍label内radio的后续click激活勾选（原版即如此）。仅可用且左键时进入按压态
    const handlePress: MouseEventHandler<HTMLDivElement> = (e) => {
      e.preventDefault();
      if (!disabled && e.button === 0) {
        setPressed(true);
      }
    };

    /**
     * 鼠标抬起/移出时退出按压态（对齐原版onDocumentMouseUp/onMouseLeave的复位）
     */
    const handleUnpress: MouseEventHandler<HTMLDivElement> = () => {
      setPressed(false);
    };

    const { values: selectableValues } = useSelectableValues(options);
    /**
     * 键盘改选（与TabSelect共用useGroupKeyboardSelection，对齐原版RadioSelectWidget经
     * SelectWidget.onDocumentKeyDown绑定于focus/blur的形态）：↑↓←→在非禁用项间环绕移动并
     * 直接改选（radio选项无高亮态，等效chooseItem）、Enter重申当前项。
     * 不转发option.onChange：那是原生input change事件的透传通道，键盘改选对应原版
     * chooseItem→setSelected（静默更新input勾选态、不发change），仅提交组级onChange并
     * 同步非受控内部值
     */
    const handleGroupKeyDown = useGroupKeyboardSelection<string | number>({
      disabled,
      selectableValues,
      value: currentValue,
      onCommit: commit,
    });

    /**
     * 键盘导航入口：先透传调用方onKeyDown，再处理导航键
     */
    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
      onKeyDown?.(e);
      handleGroupKeyDown(e);
    };

    /**
     * 对齐原版SelectWidget.onFocus：Tab聚焦组根本身（内层radio/label均tabIndex=-1）且无选中项时，自动选中首个非禁用项
     */
    const handleFocus = (e: FocusEvent<HTMLDivElement>) => {
      onFocus?.(e);
      if (disabled || e.target !== e.currentTarget) {
        return;
      }
      if (options.some((option) => option.value === currentValue)) {
        return;
      }
      if (selectableValues.length) {
        commit(selectableValues[0]);
      }
    };

    return (
      <div
        {...rest}
        className={classes}
        aria-disabled={disabled || undefined}
        role="radiogroup"
        aria-labelledby={mergeAriaLabelledBy(fieldLabelId, ariaLabelledBy)}
        tabIndex={resolveTabIndex(tabIndex, disabled)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onMouseUp={handleUnpress}
        onMouseDown={handlePress}
        onMouseLeave={handleUnpress}
        ref={setRootRef}
      >
        <FieldLabelLinkProvider value={groupLink}>
          {options.map((option) => {
            const handleChange: ChangeHandler<boolean, HTMLInputElement> = (
              checked,
              event,
            ) => {
              option.onChange?.(checked, event);
              commit(option.value, event);
            };
            return (
              <RadioOption
                {...option}
                disabled={resolveOptionDisabled(option, disabled)}
                selected={currentValue === option.value}
                key={option.value}
                name={name}
                onChange={handleChange}
              />
            );
          })}
        </FieldLabelLinkProvider>
      </div>
    );
  },
);

RadioSelect.displayName = "RadioSelect";

import { forwardRef, type KeyboardEvent, type MouseEvent } from "react";
import clsx from "clsx";
import { getWidgetClassName, mergeAriaLabelledBy, resolveTabIndex } from "../../mixins";
import { useControlledValue, useFieldLabelFocus } from "../../hooks";
import { isActivationKey, isComposingKeyEvent } from "../../utils";
import type { WidgetProps } from "../Widget";

// 内部实现说明：onClick/onKeyDown由组件内部承载切换逻辑（见handleClick/handleKeyDown），
// Omit掉避免调用方传入被静默覆盖——与ToggleButton「Omit掉自身占用的事件」同口径
/**
 * Props of the toggle switch: no `children`, `label` or `icon` slot, and
 * `onClick` / `onKeyDown` are taken over by the toggling logic.
 *
 * 拨动开关属性：没有 `children`、`label`、`icon` 落点，`onClick` / `onKeyDown`
 * 由切换逻辑占用。
 */
export interface ToggleSwitchProps extends Omit<
  WidgetProps<HTMLDivElement>,
  "children" | "onChange" | "onClick" | "onKeyDown"
> {
  /**
   * Whether the switch is on. Passing it enables controlled mode.
   *
   * 是否开启（受控，传入即受控模式）
   */
  checked?: boolean;

  /**
   * Initial toggle state for uncontrolled use
   *
   * 非受控初始开关态
   */
  defaultChecked?: boolean;

  /**
   * Toggle-state change callback; receives only the new state.
   *
   * 开关状态变更回调（仅回传新状态）
   */
  onChange?: (checked: boolean) => void;
}

// 实现说明：对齐原版OO.ui.ToggleSwitchWidget，根为div（该类未覆写getTagName），带role=switch
// 与aria-checked，内含glow/grip两个装饰子元素；开合形态由主题CSS按oo-ui-toggleWidget-on/off驱动
/**
 * A toggle switch. It has no text label of its own — when you need one, wrap it
 * with FieldLayout.
 *
 * 拨动开关。不自带文字标签，需要标签时交给 FieldLayout 包裹。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/toggle-switch/index.html
 */
export const ToggleSwitch = forwardRef<HTMLDivElement, ToggleSwitchProps>(
  (
    {
      checked,
      defaultChecked,
      onChange,
      className,
      disabled,
      tabIndex,
      "aria-labelledby": ariaLabelledBy,
      // onClick/onKeyDown承载切换逻辑，rest透传的其余事件（悬停等）不受影响
      ...rest
    },
    ref,
  ) => {
    const { value: isChecked, commit } = useControlledValue<boolean>(
      { value: checked, defaultValue: defaultChecked ?? false },
      onChange,
    );
    // FieldLayout标签联动（通道B）：点击标签翻转+聚焦（对齐原版覆写的simulateLabelClick，
    // 禁用时既不翻转也不聚焦——原版focus()内含isDisabled判断）
    const { setRef: setRootRef, fieldLabelId } = useFieldLabelFocus<HTMLDivElement>({
      ref,
      disabled,
      activate: (el) => {
        commit(!isChecked);
        el?.focus();
      },
    });

    const classes = clsx(
      className,
      getWidgetClassName({ disabled }, "toggle", "toggleSwitch"),
      isChecked ? "oo-ui-toggleWidget-on" : "oo-ui-toggleWidget-off",
    );

    /**
     * 左键点击切换，对齐原版onClick（仅左键生效，禁用时不切换）
     */
    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
      if (!disabled && e.button === 0) {
        commit(!isChecked);
      }
    };

    /**
     * Space/Enter切换，对齐原版onKeyPress（Space默认滚动页面需阻止）；IME合成期按键不切换：
     * 原版经keypress通道切换，合成期Enter不产生正常keypress，本工程keydown通道需显式防
     * （isComposingKeyEvent，见dev-docs/DEVIATIONS.md「增强」IME条）
     */
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (isComposingKeyEvent(e)) {
        return;
      }
      if (!disabled && isActivationKey(e.key)) {
        e.preventDefault();
        commit(!isChecked);
      }
    };

    return (
      <div
        {...rest}
        className={classes}
        role="switch"
        aria-checked={isChecked}
        aria-labelledby={mergeAriaLabelledBy(fieldLabelId, ariaLabelledBy)}
        aria-disabled={disabled || undefined}
        tabIndex={resolveTabIndex(tabIndex, disabled)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        ref={setRootRef}
      >
        <span className="oo-ui-toggleSwitchWidget-glow" />
        <span className="oo-ui-toggleSwitchWidget-grip" />
      </div>
    );
  },
);

ToggleSwitch.displayName = "ToggleSwitch";

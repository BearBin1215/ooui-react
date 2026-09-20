import { forwardRef } from "react";
import clsx from "clsx";
import { Button, type ButtonProps } from "../Button";
import { useControlledValue } from "../../hooks";

// 内部实现说明：原版ToggleButtonWidget基于ButtonElement（无href能力），故去除链接属性；
// active由开关状态驱动、aria-pressed随状态输出，均不外露；根类经widgetNames对齐
// 原版继承链（ToggleWidget→ToggleButtonWidget，不含oo-ui-buttonWidget）
/**
 * Props of the toggle button: Button's appearance props minus the link ones.
 *
 * 切换按钮属性：沿用 Button 的外观属性，去除链接相关项。
 */
export type ToggleButtonProps = Omit<
  ButtonProps,
  "active" | "href" | "target" | "rel" | "anchorRef" | "onClick" | "aria-pressed"
> & {
  /**
   * Whether the button is pressed. Passing it enables controlled mode.
   *
   * 是否按下（受控，传入即受控模式）
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
};

/**
 * A toggle button that can be pressed or unpressed.
 *
 * 切换按钮：能“按下 / 弹起”的按钮。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/toggle-button/index.html
 */
export const ToggleButton = forwardRef<HTMLSpanElement, ToggleButtonProps>(
  (
    { checked, defaultChecked, onChange, className, disabled, children, ...rest },
    ref,
  ) => {
    const { value: isChecked, commit } = useControlledValue<boolean>(
      { value: checked, defaultValue: defaultChecked ?? false },
      onChange,
    );

    return (
      <Button
        {...rest}
        // disabled须显式下传（解构后不在rest中）；Button内部再与ButtonGroup下发的组禁用取或
        disabled={disabled}
        className={clsx(
          className,
          isChecked ? "oo-ui-toggleWidget-on" : "oo-ui-toggleWidget-off",
        )}
        widgetNames={["toggle", "toggleButton"]}
        active={isChecked}
        aria-pressed={isChecked}
        onClick={() => commit(!isChecked)}
        ref={ref}
      >
        {children}
      </Button>
    );
  },
);

ToggleButton.displayName = "ToggleButton";

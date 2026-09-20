import { forwardRef } from "react";
import clsx from "clsx";
import { Widget, type WidgetProps } from "../Widget";
import { ButtonGroupDisabledProvider } from "./context";

/**
 * Props of the button group: `children` are Button elements, and `disabled` is
 * group-level — it is propagated to every button inside.
 *
 * 按钮组属性：`children` 为按钮元素，`disabled` 为组级禁用、一并下发到组内按钮。
 */
export type ButtonGroupProps = WidgetProps;

// 实现说明：组级disabled经Context下发到组内按钮（React便捷行为，原版无此JS传播）
/**
 * A button group: it lines up several buttons so adjacent ones connect head-to-tail
 * into a single block.
 *
 * 按钮组：把若干 Button 排在一起，相邻按钮首尾相连成一块。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/button-group/index.html
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, disabled, children, ...rest }, ref) => {
    const classes = clsx(className, "oo-ui-buttonGroupWidget");

    return (
      <Widget {...rest} className={classes} disabled={disabled} ref={ref}>
        <ButtonGroupDisabledProvider value={disabled}>
          {children}
        </ButtonGroupDisabledProvider>
      </Widget>
    );
  },
);

ButtonGroup.displayName = "ButtonGroup";

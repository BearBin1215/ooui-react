import { forwardRef } from "react";
import clsx from "clsx";
import { clamp } from "es-toolkit";
import { getWidgetClassName } from "../../mixins";
import type { WidgetProps } from "../Widget";

/**
 * Props for the progress bar.
 *
 * 进度条属性。
 */
export interface ProgressBarProps extends WidgetProps<HTMLDivElement> {
  /**
   * Progress percentage (0–100, clamped); `false` is indeterminate (sliding
   * animation), and non-finite values (e.g. `NaN`) are treated as indeterminate too.
   *
   * 进度百分比（0–100，越界钳制）；`false` 为不定进度（滑动动画），非有限值（如 `NaN`）
   * 也按不定进度处理
   *
   * @default false
   */
  progress?: number | false;
}

/**
 * A progress bar.
 *
 * 进度条。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/progress-bar/index.html
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, disabled, progress = false, ...rest }, ref) => {
    // 数值进度钳制到0-100（超出范围的width/aria-valuenow无意义）；
    // 非有限值（NaN）按不定进度处理，避免输出非法的width:NaN%/aria-valuenow="NaN"
    const bounded =
      progress === false || !Number.isFinite(progress) ? false : clamp(progress, 0, 100);
    const classes = clsx(
      className,
      getWidgetClassName({ disabled }, "progressBar"),
      bounded === false && "oo-ui-progressBarWidget-indeterminate",
    );

    return (
      <div
        {...rest}
        className={classes}
        role="progressbar"
        aria-disabled={disabled || undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={bounded === false ? undefined : bounded}
        ref={ref}
      >
        <div
          className="oo-ui-progressBarWidget-bar"
          style={bounded === false ? undefined : { width: `${bounded}%` }}
        />
      </div>
    );
  },
);

ProgressBar.displayName = "ProgressBar";

import { forwardRef, type FocusEvent as ReactFocusEvent } from "react";
import clsx from "clsx";
import { PanelLayout, type PanelLayoutProps } from "../PanelLayout";
import { PageLayout, type PageLayoutProps } from "../PageLayout";
import type { ChangeHandler } from "../../utils";
import { useLayoutSelection } from "../../hooks";

interface PageOptionProps extends PageLayoutProps {
  /**
   * Page value; doubles as the active-page match key and the list key.
   *
   * 页值，同时作为激活匹配依据与列表 key。
   */
  value: string | number;
}

export interface StackLayoutProps extends Omit<PanelLayoutProps, "onChange"> {
  /**
   * Whether all pages are visible at once (`true` ignores `value`).
   *
   * 是否全显示：为 `true` 时忽略 `value`，所有页同时可见。
   */
  continuous?: boolean;

  /**
   * Current active page (controlled; passing it enables controlled mode).
   *
   * 当前激活页（受控，传入即受控模式）。
   */
  value?: string | number;

  /**
   * Initial active page for uncontrolled use.
   *
   * 非受控初始激活页。
   */
  defaultValue?: string | number;

  /**
   * Active-page change callback. Focus entering a page is signalled separately
   * via `onPageFocus`.
   *
   * 激活页变化回调；焦点进入某页时经 `onPageFocus` 另行通知。
   */
  onChange?: ChangeHandler<string | number>;

  /**
   * The page set.
   *
   * 页集。
   */
  options: PageOptionProps[];

  /**
   * Fires when focus enters a page, carrying the page value. Separate from
   * `onChange`: use it for focus-driven behaviors (e.g. scroll-linked page
   * selection in continuous mode) without changing the active value.
   *
   * 页面内获得焦点时触发，携带页值。与 `onChange` 分离：可据焦点联动（如
   * continuous 模式的滚动选页）而无需改激活值。
   */
  onPageFocus?: (value: string | number, event: ReactFocusEvent<HTMLDivElement>) => void;
}

/**
 * A stack layout: renders pages from `options`, showing only the active page; with
 * `continuous`, all pages are visible and the container scrolls. When the active
 * value is missing or stale, a page is auto-selected.
 *
 * 堆叠布局：按 `options` 渲染分页，仅显示激活页；`continuous` 时所有页同时可见、
 * 容器整体滚动。激活值缺失或失效时自动补选。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/stack-layout/index.html
 */
export const StackLayout = forwardRef<HTMLDivElement, StackLayoutProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      className,
      expanded = true,
      continuous,
      // 连续模式整体滚动，非连续模式由页面自行滚动
      scrollable = !!continuous,
      options,
      onPageFocus,
      ...rest
    },
    ref,
  ) => {
    const { effectiveValue: activeValue } = useLayoutSelection<string | number>({
      value,
      defaultValue,
      onChange,
      options,
      fallback: "nextThenLast",
    });

    const classes = clsx(
      className,
      "oo-ui-stackLayout",
      continuous && "oo-ui-stackLayout-continuous",
    );

    return (
      <PanelLayout
        {...rest}
        expanded={expanded}
        scrollable={scrollable}
        className={classes}
        ref={ref}
      >
        {options.map((option) => (
          <PageLayout
            {...option}
            hidden={!continuous && option.value !== activeValue}
            active={option.value === activeValue}
            onFocus={(event) => onPageFocus?.(option.value, event)}
            key={option.value}
          />
        ))}
      </PanelLayout>
    );
  },
);

StackLayout.displayName = "StackLayout";

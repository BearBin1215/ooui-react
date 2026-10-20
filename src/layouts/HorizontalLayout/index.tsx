import { forwardRef } from "react";
import clsx from "clsx";
import { Layout, type LayoutProps } from "../Layout";

export type HorizontalLayoutProps = LayoutProps;

/**
 * A horizontal container that lays its children out in a row; arrangement is
 * left to the theme CSS.
 *
 * 横向布局：把子元素排成一行，排布交由主题 CSS 完成。
 *
 * @see https://ooui-react.pages.dev/components/horizontal-layout/
 */
export const HorizontalLayout = forwardRef<HTMLDivElement, HorizontalLayoutProps>(
  ({ className, children, ...rest }, ref) => {
    const classes = clsx(className, "oo-ui-horizontalLayout");

    return (
      <Layout {...rest} className={classes} ref={ref}>
        {children}
      </Layout>
    );
  },
);

HorizontalLayout.displayName = "HorizontalLayout";

// 自定义主题入口
import { type LayoutProps, Layout as OriginalLayout } from "@rspress/core/theme-original";
import { ThemeSwitcher } from "./ThemeSwitcher";

export * from "@rspress/core/theme-original";
export { HomeLayout } from "./HomeLayout";

/**
 * 全站根布局：在导航栏右端挂「示例主题」切换器（Nav 渲染于各页面类型之外的公共头部，
 * 首页同样生效）；其余插槽与页面布局（含经 `@rspress/core/theme` 别名回流的原版
 * Layout 内的 HomeLayout 覆盖）原样透传。
 */
function Layout(props: LayoutProps) {
  return <OriginalLayout {...props} afterNavMenu={<ThemeSwitcher />} />;
}

export { Layout };

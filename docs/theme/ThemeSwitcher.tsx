import { useEffect, useRef, useState } from "react";
import { usePage } from "@rspress/core/runtime";
import { IconArrowDown, SvgWrapper } from "@rspress/core/theme-original";
import "./ThemeSwitcher.css";

/** 文档站示例可切换的原版 OOUI 主题（wikimediaui 为默认，apex 为遗留主题仅供预览） */
type DemoTheme = "wikimediaui" | "apex";

/** 主题选择在 localStorage 的持久化键（rspress.config.ts 的预置内联脚本共享此键） */
const STORAGE_KEY = "ooui-docs-theme";

/** 触发器辅助文案：按站点语言显示（键对齐 rspress locale 的 lang 字段） */
const LABELS: Record<string, string> = { zh: "示例主题", en: "Preview theme" };

/** 悬停移出后延迟关闭的毫秒数，对齐 rspress `useHoverGroup` 的手 */
const HOVER_CLOSE_DELAY = 150;

const THEME_OPTIONS: DemoTheme[] = ["wikimediaui", "apex"];

/** 从当前生效的主题样式表读取主题名：head 预置脚本已按持久化值选好 <link>，水合时即为目标值 */
function getActiveTheme(): DemoTheme {
  return document.querySelector<HTMLLinkElement>("link[data-ooui-theme]")?.dataset
    .oouiTheme === "apex"
    ? "apex"
    : "wikimediaui";
}

/** 从当前样式表 href 推导主题 CSS 的 URL：base 由站点配置决定（dev/build 均带），不在此重复拼接 */
function resolveThemeHref(theme: DemoTheme): string {
  const current = document.querySelector<HTMLLinkElement>("link[data-ooui-theme]");
  if (!current) {
    // 预置脚本未跑（如 noscript 场景后手动触发）时的兜底路径，与 base 配置保持一致
    return `/ooui-react/ooui/oojs-ui-${theme}.css`;
  }
  return `${current.href.slice(0, current.href.lastIndexOf("oojs-ui-"))}oojs-ui-${theme}.css`;
}

/**
 * 切换主题样式表：新建 <link> 加载完成后再移除旧节点。不用 disabled 互斥——样式表加载
 * 完成前设置 disabled 会中止加载，后续翻转标志不会恢复（playground 同款坑）；也不在
 * 新表就绪前移除旧节点——两主题规则集不同，并存窗口由后者覆盖、空窗期则会闪裸样式
 */
function applyTheme(theme: DemoTheme): void {
  const current = document.querySelector<HTMLLinkElement>("link[data-ooui-theme]");
  if (current?.dataset.oouiTheme === theme) {
    return;
  }
  const next = document.createElement("link");
  next.rel = "stylesheet";
  next.dataset.oouiTheme = theme;
  next.href = resolveThemeHref(theme);
  next.addEventListener("load", () => current?.remove(), { once: true });
  // 新表加载失败时撤下新节点、保留旧主题生效，失败细节在控制台可见
  next.addEventListener("error", () => next.remove(), { once: true });
  document.head.appendChild(next);
}

/**
 * Navbar switcher for the OOUI theme stylesheet applied to the live demos,
 * styled after the language switcher (`NavLangs`): a `rp-nav-menu__item`
 * trigger with the active theme name, revealing a `rp-hover-group` panel on
 * hover. WikimediaUI is the default; apex is a legacy theme kept for preview
 * only. The choice persists in localStorage and is applied before first paint
 * by an inline script from rspress.config.ts; the theme stylesheets live in
 * `public/ooui/` (populated by scripts/copy-ooui-assets.ts) and are swapped
 * through a single `<link>`.
 *
 * 文档站导航栏的「示例主题」切换器：视觉与交互对齐语言切换器（`NavLangs`）——
 * `rp-nav-menu__item` 触发器显示当前主题名，悬停展开 `rp-hover-group` 面板选择主题。
 * 默认 wikimediaui；apex 为遗留主题、仅供预览。选择经 localStorage 持久化，由
 * rspress.config.ts 注入的内联脚本在首帧前应用；主题 CSS 位于 public/ooui/（由
 * scripts/copy-ooui-assets.ts 生成），经单一 `<link>` 换源。
 */
function ThemeSwitcher() {
  const { page } = usePage();
  const [theme, setTheme] = useState<DemoTheme>("wikimediaui");
  // 开合为自管状态而非 useHoverGroup：后者不暴露 isOpen，无法做 aria-expanded、
  // Escape 关闭与键盘触发的开合；手写仅此数行，时序与其保持一致
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  // SSG 首帧恒渲染默认值（避免水合不匹配），水合后与文档实际生效的主题对齐
  useEffect(() => {
    setTheme(getActiveTheme());
  }, []);

  const openMenu = () => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
  };

  // 移出延迟关闭：面板为触发器的子节点、二者无缝隙，指针在内部移动不会误触关闭
  const closeMenu = () => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setOpen(false);
    }, HOVER_CLOSE_DELAY);
  };

  const label = LABELS[page.lang] ?? LABELS.en;

  return (
    <ul className="rp-nav-menu doc-theme-switcher" aria-label={label}>
      <li className="rp-nav-menu__item" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
        <button
          type="button"
          className="rp-nav-menu__item__container"
          title={label}
          aria-label={label}
          aria-expanded={open}
          onClick={openMenu}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
        >
          {theme}
          <SvgWrapper icon={IconArrowDown} className="rp-nav-menu__item__icon" />
        </button>
        <ul
          className={`rp-hover-group rp-hover-group--right${open ? "" : " rp-hover-group--hidden"}`}
        >
          {THEME_OPTIONS.map((value) => (
            <li
              key={value}
              className={`rp-hover-group__item${value === theme ? " rp-hover-group__item--active" : ""}`}
            >
              <button
                type="button"
                className="rp-hover-group__item__link doc-theme-switcher__option"
                onClick={() => {
                  setTheme(value);
                  localStorage.setItem(STORAGE_KEY, value);
                  applyTheme(value);
                }}
              >
                {value}
              </button>
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
}

export { ThemeSwitcher };

import { useEffect, useRef, forwardRef, type ReactNode } from "react";
import clsx from "clsx";
import { omit } from "es-toolkit";
import { MenuLayout, type MenuLayoutProps } from "../MenuLayout";
import { PANEL_ONLY_PROPS, PanelLayout } from "../PanelLayout";
import { TabPanelLayout, type TabPanelLayoutProps } from "../TabPanelLayout";
import { TabSelect } from "../../widgets/TabSelect";
import type { ChangeHandler } from "../../utils";
import { useIsMobile } from "../../config";
import {
  useAutoFocusPanel,
  useCleanId,
  useLatestRef,
  useLayoutSelection,
} from "../../hooks";

export interface IndexLayoutTabProps extends TabPanelLayoutProps {
  /**
   * Tab display content.
   *
   * 页签显示内容。
   */
  label: ReactNode;

  /**
   * Tab value; doubles as the active-tab match key and the list key.
   *
   * 页签值，同时作为激活匹配依据与列表 key。
   */
  value: string | number;

  /**
   * Whether the tab is disabled; the panel of a disabled tab is fully hidden
   * (regardless of `openMatchedPanels`).
   *
   * 页签是否禁用；禁用页签对应的面板始终以 `hidden` 完全隐藏（不受
   * `openMatchedPanels` 影响）。
   */
  disabled?: boolean;
}

export interface IndexLayoutProps extends Omit<
  MenuLayoutProps,
  "menu" | "menuPosition" | "children" | "onChange"
> {
  /**
   * The tab set.
   *
   * 页签集。
   */
  options: IndexLayoutTabProps[];

  /**
   * Whether the tabs are framed.
   *
   * 页签是否有边框。
   */
  framed?: boolean;

  /**
   * Whether all panels are shown at once.
   *
   * 是否显示全部面板。
   */
  continuous?: boolean;

  /**
   * Focus the panel's first focusable element after a switch.
   *
   * 切换面板后是否自动聚焦面板内第一个可聚焦元素。
   */
  autoFocus?: boolean;

  /**
   * Hide inactive panels with `hidden="until-found"` and switch tabs when the
   * browser's in-page search matches a panel.
   *
   * 未激活面板以 `hidden="until-found"` 隐藏，浏览器查找命中后自动切换页签。
   */
  openMatchedPanels?: boolean;

  /**
   * Current active tab (controlled; passing it enables controlled mode).
   *
   * 当前激活页签（受控，传入即受控模式）。
   */
  value?: string | number;

  /**
   * Initial active tab for uncontrolled use.
   *
   * 非受控初始激活页签。
   */
  defaultValue?: string | number;

  /**
   * Active-tab change callback.
   *
   * 激活页签变化回调。
   */
  onChange?: ChangeHandler<string | number>;
}

/** 非连续渲染下未激活面板的hidden值：开启openMatchedPanels时给until-found（对浏览器查找可见、
 * 视觉隐藏，命中即由beforematch处理器切换到该页签），否则直接隐藏 */
function getPanelHidden(
  inactive: boolean,
  openMatched: boolean,
  disabled?: boolean,
): "until-found" | true | undefined {
  if (!inactive) {
    return undefined;
  }
  return openMatched && !disabled ? "until-found" : true;
}

/**
 * An index layout: a tab menu on top and a stack of tab panels below. Suits
 * settings pages with top tabs and chunked content.
 *
 * 页签布局：顶部页签菜单加下方面板栈。适合顶部页签 + 分块内容的设置页场景。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/index-layout/index.html
 */
export const IndexLayout = forwardRef<HTMLDivElement, IndexLayoutProps>(
  (
    {
      className,
      options,
      framed = true,
      continuous = false,
      autoFocus = true,
      openMatchedPanels = true,
      value,
      defaultValue,
      onChange,
      expanded = true,
      ...rest
    },
    ref,
  ) => {
    // 未指定或激活页失效（被移除）时自动选中首个**可选**（非禁用）页签，对齐原版
    // `selectFirstSelectableTabPanel`（受控回写/非受控提交，见useLayoutSelection）
    const { effectiveValue, select, selectIfChanged } = useLayoutSelection<
      string | number
    >({ value, defaultValue, onChange, options, fallback: "firstSelectable" });
    // id片段经useCleanId剥离`:`，可安全用于CSS选择器与aria关联
    const idBase = useCleanId();
    const stackRef = useRef<HTMLDivElement>(null);
    // 移动端形态开关（全局配置）：autoFocus的抑制条件
    const isMobile = useIsMobile();

    const classes = clsx(className, "oo-ui-indexLayout");

    // 对齐原版autoFocus：切换面板后聚焦新面板内第一个可聚焦元素（初始渲染不聚焦；
    // 移动端形态抑制聚焦，对齐原版onStackLayoutSet的!isMobile条件）
    useAutoFocusPanel({
      activeValue: effectiveValue,
      enabled: autoFocus && !isMobile,
      rootRef: stackRef,
      activeSelector: ".oo-ui-tabPanelLayout-active",
      skipInitialFocus: true,
    });

    // 对齐原版openMatchedPanels：浏览器查找命中隐藏面板时自动切换到对应页签。
    // 处理器经ref读取最新options/生效值/选择回调，监听仅随开关与idBase挂卸
    const optionsRef = useLatestRef(options);
    const effectiveValueRef = useLatestRef(effectiveValue);
    const selectRef = useLatestRef(select);
    useEffect(() => {
      if (!openMatchedPanels || continuous) {
        return undefined;
      }
      const stack = stackRef.current;
      if (!stack) {
        return undefined;
      }
      // beforematch在浏览器页内查找（Ctrl+F）命中hidden="until-found"元素时派发：
      // 按命中面板id反查页签并激活，使查找结果所在面板可见。该事件不冒泡，
      // 须以捕获阶段挂到stack（祖先）上才能收到命中面板派发的事件
      const handleBeforeMatch = (e: Event) => {
        const currentOptions = optionsRef.current;
        const index = currentOptions.findIndex(
          (_, i) => `${idBase}-panel-${i}` === (e.target as HTMLElement).id,
        );
        if (index !== -1) {
          const matched = currentOptions[index].value;
          if (matched !== effectiveValueRef.current) {
            selectRef.current(matched);
          }
        }
      };
      stack.addEventListener("beforematch", handleBeforeMatch, true);
      return () => {
        stack.removeEventListener("beforematch", handleBeforeMatch, true);
      };
    }, [openMatchedPanels, continuous, idBase, optionsRef, effectiveValueRef, selectRef]);

    return (
      <MenuLayout
        {...rest}
        expanded={expanded}
        className={classes}
        menuPosition="top"
        menu={
          <PanelLayout className="oo-ui-indexLayout-tabPanel" expanded={expanded}>
            <TabSelect
              framed={framed}
              value={effectiveValue}
              onChange={selectIfChanged}
              options={options.map((option, i) => ({
                // 对齐原版：页签仅承接label/disabled与元素级属性（原版经tabItemConfig），
                // 面板属性经PANEL_ONLY_PROPS统一剥离
                ...omit(option, [...PANEL_ONLY_PROPS]),
                children: option.label,
                id: `${idBase}-tab-${i}`,
                "aria-controls": `${idBase}-panel-${i}`,
              }))}
            />
          </PanelLayout>
        }
        ref={ref}
      >
        <PanelLayout
          ref={stackRef}
          // continuous类驱动主题把面板转为relative流式排布（原版StackLayout经setContinuous
          // 加类，oojs-ui-wikimediaui.css:2729），缺失时expanded面板absolute叠加、堆栈塌为0高
          className={clsx(
            "oo-ui-stackLayout",
            "oo-ui-indexLayout-stackLayout",
            continuous && "oo-ui-stackLayout-continuous",
          )}
          expanded={expanded}
          scrollable={continuous}
        >
          {options.map((option, i) => (
            <TabPanelLayout
              {...option}
              key={option.value}
              id={`${idBase}-panel-${i}`}
              aria-labelledby={`${idBase}-tab-${i}`}
              active={option.value === effectiveValue}
              hidden={getPanelHidden(
                !continuous && option.value !== effectiveValue,
                openMatchedPanels,
                option.disabled,
              )}
            />
          ))}
        </PanelLayout>
      </MenuLayout>
    );
  },
);

IndexLayout.displayName = "IndexLayout";

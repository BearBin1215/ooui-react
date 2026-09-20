import { useRef, forwardRef, type ReactNode } from "react";
import clsx from "clsx";
import { omit } from "es-toolkit";
import { MenuLayout, type MenuLayoutProps } from "../MenuLayout";
import { PANEL_ONLY_PROPS, PanelLayout } from "../PanelLayout";
import { OutlineSelect } from "../../widgets/OutlineSelect";
import { Button } from "../../widgets/Button";
import { StackLayout } from "../StackLayout";
import type { PageLayoutProps } from "../PageLayout";
import type { ChangeHandler } from "../../utils";
import { useAutoFocusPanel, useLayoutSelection } from "../../hooks";
import { useIsMobile, useMessage } from "../../config";

interface BookletLayoutOptionProps extends PageLayoutProps {
  /**
   * Menu item display content.
   *
   * 菜单选项显示内容。
   */
  label: ReactNode;

  /**
   * Page value; doubles as the active-page match key and the list key.
   *
   * 页值，同时作为激活匹配依据与列表 key。
   */
  value: string | number;

  /**
   * Whether the page can be moved up / down (controls button availability in
   * editable mode).
   *
   * 是否可被上移 / 下移（editable 模式下控制按钮可用性）。
   */
  movable?: boolean;

  /**
   * Whether the page can be removed.
   *
   * 是否可被移除。
   */
  removable?: boolean;
}

export interface BookletLayoutProps extends Omit<
  MenuLayoutProps,
  "menu" | "children" | "onChange"
> {
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
   * The page set.
   *
   * 页集。
   */
  options: BookletLayoutOptionProps[];

  /**
   * Active-page change callback.
   *
   * 激活页变化回调。
   */
  onChange?: ChangeHandler<string | number>;

  /**
   * Whether to show the outline menu (`false` is the plain stacked mode).
   *
   * 是否显示大纲，默认 `false`（纯堆叠模式）。
   *
   * @default false
   */
  outlined?: boolean;

  /**
   * Whether all pages are shown continuously, scrolling to the target page on switch.
   *
   * 是否连续显示所有页面，切页时滚动至目标页。
   */
  continuous?: boolean;

  /**
   * Focus the page's first focusable element after a switch (skipped when focus
   * is already inside the page).
   *
   * 切页后自动聚焦页内第一个可聚焦元素（焦点已在该页内时不重复聚焦），默认 `true`。
   *
   * @default true
   */
  autoFocus?: boolean;

  /**
   * Whether to show move-up / move-down / remove controls at the bottom of the
   * outline. Results are handed back via `onMoveOption` / `onRemoveOption` for
   * the caller to update `options`.
   *
   * 是否在大纲底部显示操作控件（上移/下移/移除）。操作结果经
   * `onMoveOption` / `onRemoveOption` 交回调用方更新 `options`。
   */
  editable?: boolean;

  /**
   * Fires on move-up / move-down click in editable mode; `direction` is `-1`
   * (up) or `1` (down).
   *
   * editable 模式下点击上移 / 下移时触发，direction 为 -1（上移）或 1（下移）。
   */
  onMoveOption?: (value: string | number, direction: -1 | 1) => void;

  /**
   * Fires on remove click in editable mode.
   *
   * editable 模式下点击移除时触发。
   */
  onRemoveOption?: (value: string | number) => void;

  /**
   * Extra button area left of the outline controls in editable mode (e.g. an
   * "Add" button); click behavior is handled by the caller.
   *
   * editable 模式下大纲控件左侧的额外按钮区（如“添加”按钮），
   * 按钮点击行为由调用方自行处理。
   */
  outlineControlsExtra?: ReactNode;
}

/**
 * A booklet layout: with `outlined`, an outline menu on the left and a page stack
 * on the right; without it, a plain stacked panel. Suits settings pages and
 * multi-section content; a page removed while active auto-selects a neighbor.
 *
 * 手册式布局：`outlined` 时左侧大纲（可编辑模式带移动/移除控件）、右侧页面栈；
 * 不开大纲时为纯堆叠面板。适合设置页、多节内容；激活页被移除时自动补选相邻页。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/booklet-layout/index.html
 */
export const BookletLayout = forwardRef<HTMLDivElement, BookletLayoutProps>(
  (
    {
      className,
      options,
      value,
      defaultValue,
      onChange,
      outlined = false,
      showMenu,
      continuous,
      autoFocus = true,
      editable = false,
      onMoveOption,
      onRemoveOption,
      outlineControlsExtra,
      expanded = true,
      ...rest
    },
    ref,
  ) => {
    // 激活页选择：失效（被移除）时按原版stack的口径回退（下一个未被移除项→新末项），
    // 受控回写/非受控提交见useLayoutSelection。回退随stack而非outline的理由见
    // dev-docs/DEVIATIONS.md「增强」的布局补选条
    const { effectiveValue: activeValue, selectIfChanged } = useLayoutSelection<
      string | number
    >({
      value,
      defaultValue,
      onChange,
      options,
      fallback: "nextThenLast",
    });
    const stackRef = useRef<HTMLDivElement>(null);

    const classes = clsx(className, "oo-ui-bookletLayout");

    // editable相关标记（movable/removable）与页面专属属性仅用于按钮禁用计算与StackLayout渲染，
    // 大纲选项不透传（避免落成DOM属性）；label转为children供LabelBase渲染。
    // 页面专属名单与IndexLayout共用（见PanelLayout的PANEL_ONLY_PROPS）
    const menuOptions = options.map((option) => ({
      ...omit(option, [...PANEL_ONLY_PROPS, "movable", "removable"]),
      children: option.label,
    }));
    const pageOptions = options.map((option) => omit(option, ["movable", "removable"]));

    // 对齐原版OutlineControlsWidget.onOutlineChange的按钮禁用规则
    const selectedOption = options.find((o) => o.value === activeValue);
    const movableSelected = !!selectedOption?.movable;
    const removableSelected = !!selectedOption?.removable;
    const movableValues = options.filter((o) => o.movable);
    const selectedIsFirstMovable = movableValues[0]?.value === activeValue;
    const selectedIsLastMovable =
      movableValues[movableValues.length - 1]?.value === activeValue;
    // 大纲控制按钮的缺省标题（对齐原版ooui-outline-control-*消息）
    const moveUpTitle = useMessage("ooui-outline-control-move-up");
    const moveDownTitle = useMessage("ooui-outline-control-move-down");
    const removeTitle = useMessage("ooui-outline-control-remove");
    // 移动端形态开关（全局配置）：autoFocus的抑制条件
    const isMobile = useIsMobile();

    // 对齐原版onStackLayoutSet：continuous时滚动至激活页（首次不滚动）；autoFocus时
    // 聚焦页内第一个可聚焦元素（焦点已在该页内时useAutoFocusPanel自动跳过；
    // 移动端形态抑制聚焦，对齐原版的!isMobile条件）。首帧不聚焦（skipInitialFocus，
    // 与IndexLayout同口径）：原版构造期不自动选页、IndexLayout构造期focus()落在未挂载
    // 元素上同为no-op，两侧实际都不抢焦点；React版聚焦发生在挂载后，首帧不抢
    useAutoFocusPanel({
      activeValue,
      enabled: autoFocus && !isMobile,
      rootRef: stackRef,
      activeSelector: ".oo-ui-pageLayout-active",
      skipInitialFocus: true,
      recomputeKey: continuous,
      onBeforeFocus: (activePage, isFirst) => {
        if (continuous && !isFirst) {
          activePage.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
    });

    return (
      <MenuLayout
        {...rest}
        className={classes}
        ref={ref}
        expanded={expanded}
        showMenu={showMenu ?? outlined}
        menu={
          outlined ? (
            <PanelLayout
              className={clsx(
                "oo-ui-bookletLayout-outlinePanel",
                editable && "oo-ui-bookletLayout-outlinePanel-editable",
              )}
              scrollable
              expanded={expanded}
            >
              <OutlineSelect
                value={activeValue}
                onChange={selectIfChanged}
                options={menuOptions}
              />
              {editable && (
                <div className="oo-ui-outlineControlsWidget">
                  <div className="oo-ui-outlineControlsWidget-items">
                    {outlineControlsExtra}
                  </div>
                  <div className="oo-ui-outlineControlsWidget-movers">
                    <Button
                      framed={false}
                      icon="upTriangle"
                      title={moveUpTitle}
                      disabled={!movableSelected || selectedIsFirstMovable}
                      onClick={() =>
                        activeValue !== undefined && onMoveOption?.(activeValue, -1)
                      }
                    />
                    <Button
                      framed={false}
                      icon="downTriangle"
                      title={moveDownTitle}
                      disabled={!movableSelected || selectedIsLastMovable}
                      onClick={() =>
                        activeValue !== undefined && onMoveOption?.(activeValue, 1)
                      }
                    />
                    <Button
                      framed={false}
                      icon="trash"
                      title={removeTitle}
                      disabled={!removableSelected}
                      onClick={() =>
                        activeValue !== undefined && onRemoveOption?.(activeValue)
                      }
                    />
                  </div>
                </div>
              )}
            </PanelLayout>
          ) : undefined
        }
      >
        <StackLayout
          className="oo-ui-bookletLayout-stackLayout"
          value={activeValue}
          options={pageOptions}
          continuous={continuous}
          expanded={expanded}
          onPageFocus={continuous ? selectIfChanged : undefined}
          ref={stackRef}
        />
      </MenuLayout>
    );
  },
);

BookletLayout.displayName = "BookletLayout";

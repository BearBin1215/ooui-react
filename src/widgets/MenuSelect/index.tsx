import { useRef, forwardRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Select, type SelectInternalProps } from "../Select";
import { elementHiddenClasses } from "../../mixins";
import {
  useAnchoredPanelLayout,
  useCleanId,
  useFloatPortal,
  useMergedRefs,
} from "../../hooks";
import { OFFSCREEN_POSITION, resolveElement } from "../../utils";

export interface MenuSelectProps extends SelectInternalProps {
  /**
   * 菜单面板是否展开（受控）：开合状态由调用方持有，本基座不自带内部开合态
   */
  open?: boolean;

  /**
   * 菜单收起但仍处于聚焦期（DropdownWidget的screenReaderMode）：此时焦点归属元素继续
   * 指向高亮/选中项。对齐原版——`toggleScreenReaderMode`期间`SelectWidget.highlightItem`
   * 照常在$focusOwner上写aria-activedescendant，键盘通道也在此期间直接改选。
   * 有意提前：聚焦即写选中项（原版首次highlightItem才写），读屏聚焦即播报当前值
   */
  screenReaderMode?: boolean;

  /**
   * 浮动定位的锚定容器。菜单经portal渲染到body（`OOUIProvider.getPortalContainer`指定的
   * 容器，或弹窗子树内为该弹窗的管理器根）上、无法回退到DOM父节点，故定位依赖此参数
   * （Dropdown等调用方须显式传入）
   */
  container?: RefObject<HTMLElement | null> | HTMLElement | null;

  /**
   * 菜单与锚点之间的间距（px，对齐原版`FloatableElement` config.spacing）。
   * 缺省0（贴合锚点，DropdownWidget即此）；ButtonMenuSelectWidget用4
   */
  spacing?: number;

  /**
   * 菜单宽度是否贴合锚点（缺省true）：clip进组件的菜单（Dropdown/ComboBoxInput的输入框、
   * TagMultiselect的组件根）与组件同宽；按钮触发的浮出菜单（ButtonMenuSelectWidget）传false——
   * 原版floatable菜单无width配置、CSS亦不设宽，宽度随内容自适应
   */
  matchAnchorWidth?: boolean;
}

/**
 * 对齐原版MenuSelectWidget（DropdownWidget的菜单面板；原版中亦被LookupElement/
 * ComboBoxInputWidget等复用）。键盘导航开关对齐原版static：handleNavigationKeys=true、
 * listWrapsAround=false；菜单根不输出tabindex、焦点由触发控件持有。浮动定位与方向改选经
 * useAnchoredPanelLayout承担。与原版的对照见dev-docs/DEVIATIONS.md「等效替代」的
 * 菜单键盘通道条与翻转条
 */
export const MenuSelect = forwardRef<HTMLDivElement, MenuSelectProps>(
  (
    {
      className,
      open = false,
      screenReaderMode = false,
      container,
      spacing = 0,
      matchAnchorWidth = true,
      id: idProp,
      options,
      style,
      // 取值对齐原版static（见组件注释），须显式下发以覆盖Select自身的缺省false/true
      handleNavigationKeys = true,
      listWrapsAround = false,
      ...rest
    },
    ref,
  ) => {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const mergedRef = useMergedRefs(menuRef, ref);
    // 面板id供调用方建立aria-owns/aria-controls关联
    // useCleanId须无条件调用：Hook不可置于`??`短路右侧，否则idProp有无切换时Hook数量变化触发卸载
    const generatedId = useCleanId();
    const menuId = idProp ?? `oo-ui-menuSelectWidget-${generatedId}`;

    const layout = useAnchoredPanelLayout({
      open,
      anchor: container,
      panelRef: menuRef,
      matchAnchorWidth,
      hideWhenOutOfView: true,
      offset: spacing,
      // 对齐原版：菜单空间不足时翻到锚点上方（工具栏面板按setAutoFlip(false)的口径不翻）
      flip: true,
    });
    // 菜单portal容器：宿主配置优先，弹窗子树内回落该弹窗的管理器根，其余document.body
    const { getContainer, dialogZIndex } = useFloatPortal();
    const portalTarget = getContainer(resolveElement(container));

    const classes = clsx(
      className,
      "oo-ui-clippableElement-clippable",
      "oo-ui-floatableElement-floatable",
      "oo-ui-menuSelectWidget",
      // 聚焦期输出screenReaderMode类（对齐原版toggleScreenReaderMode的类切换）：主题CSS以
      // `.oo-ui-menuSelectWidget-screenReaderMode.oo-ui-element-hidden`把收起期菜单从
      // display:none翻转为读屏可见的裁剪隐藏，aria-activedescendant指向的内容才可被读屏读到
      screenReaderMode && "oo-ui-menuSelectWidget-screenReaderMode",
      // 无可见项时整个面板隐藏（对齐原版updateItemVisibility的anyVisible判定，主题规则
      // display:none）：消费方的选项按输入过滤，全不匹配时不留一个空框
      options.length === 0 && "oo-ui-menuSelectWidget-invisible",
      elementHiddenClasses(!open),
    );

    return createPortal(
      <Select
        {...rest}
        id={menuId}
        options={options}
        ref={mergedRef}
        // 不输出tabindex：对齐原版MenuSelectWidget（只混入ClippableElement/FloatableElement，
        // 根无tabindex），菜单根既不进Tab序也不可聚焦，焦点恒由触发控件持有。需要编程聚焦菜单
        // 根的调用方经rest显式传tabIndex（Select按调用方取值）
        handleNavigationKeys={handleNavigationKeys}
        listWrapsAround={listWrapsAround}
        // 焦点归属元素的管理期随菜单显隐开合（对齐原版MenuSelectWidget.toggle：
        // 打开时指向选中/高亮项、关闭时移除aria-activedescendant）
        focusOwnerActive={open || screenReaderMode}
        className={clsx(classes, elementHiddenClasses(layout?.outOfView))}
        // dir取锚点有效方向（RTL站点/Provider.dir配置下菜单文本方向正确）
        dir={layout?.dir}
        // 调用方style与定位样式合并：定位键以组件为准（同Popup根），其余键透传生效
        style={{
          ...style,
          position: "absolute",
          top: layout?.top ?? OFFSCREEN_POSITION,
          left: layout?.left ?? OFFSCREEN_POSITION,
          width: layout?.width,
          maxHeight: layout?.maxHeight,
          overflowY: layout?.maxHeight !== undefined ? "auto" : undefined,
          // 弹窗子树内与所属弹窗同层（见useFloatPortal）；其余情形交回主题CSS
          zIndex: dialogZIndex,
        }}
      />,
      portalTarget,
    );
  },
);

MenuSelect.displayName = "MenuSelect";

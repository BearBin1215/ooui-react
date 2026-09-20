import {
  useRef,
  useState,
  forwardRef,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type Ref,
} from "react";
import clsx from "clsx";
import { IconBase } from "../Icon/Base";
import { IndicatorBase } from "../Indicator/Base";
import { LabelBase } from "../Label/Base";
import { ButtonSlots } from "../Button/slots";
import {
  buttonElementClasses,
  getTextInputClassName,
  getWidgetClassName,
  hasLabel,
  indicatorElementClasses,
  resolveTabIndex,
} from "../../mixins";
import { isActivationKey, isComposingKeyEvent, type ChangeHandler } from "../../utils";
import {
  useCleanId,
  useControlledValue,
  useMenuPopup,
  useMergedRefs,
  usePressedState,
  useSelectableValues,
} from "../../hooks";
import { useMessage } from "../../config";
import { useInputProps, type UserInputProps } from "../Input/props";
import { resolveValidate, type TextInputValidate } from "../TextInput";
import type {
  AccessKeyedElement,
  FlaggedElement,
  IconElement,
  IndicatorElement,
  LabelElement,
} from "../../Element";
import type { LabelPosition } from "../Label";
import type { WidgetProps } from "../Widget";
import type { DropdownOptionProps } from "../Dropdown";
import { MenuSelect } from "../MenuSelect";

/**
 * Props of the combo box: it shares TextInput's input capabilities
 * (label / icon / indicator / soft validation / field id).
 *
 * 下拉候选框属性：与 TextInput 共用同一套输入能力（标签 / 图标 / 指示器 / 软校验 / 字段 id）。
 */
export interface ComboBoxInputProps
  extends
    Omit<WidgetProps<HTMLDivElement>, "children" | "id">,
    AccessKeyedElement,
    IconElement,
    IndicatorElement,
    LabelElement,
    FlaggedElement {
  /**
   * Candidate option set (**required**), shown as a dropdown while typing; choosing
   * one writes it into the input, whose text stays freely editable.
   *
   * 候选选项集（**必填**），输入时下拉展示；选定后写入输入框，输入框文本本身可自由编辑
   */
  options: DropdownOptionProps[];

  /**
   * Input text (controlled)
   *
   * 输入框文本（受控）
   */
  value?: string;

  /**
   * Initial value for uncontrolled use
   *
   * 非受控初始值
   */
  defaultValue?: string;

  /**
   * Value-change callback (typed and chosen items both fire).
   *
   * 值变化回调（键入与选定菜单项均触发）
   */
  onChange?: ChangeHandler<string>;

  /**
   * Form field name (lands on `<input>`)
   *
   * 表单提交字段名（落在 `<input>`）
   */
  name?: string;

  /**
   * Input hint
   *
   * 输入提示
   */
  placeholder?: string;

  /**
   * Required (the indicator falls back to required, same as TextInput)
   *
   * 必填（required 时指示器缺省回退 required，与 TextInput 一致）
   */
  required?: boolean;

  /**
   * Read-only (disables the dropdown button and menu too)
   *
   * 只读（只读时下拉按钮与菜单同步禁用）
   */
  readOnly?: boolean;

  /**
   * Maximum length
   *
   * 最大长度
   */
  maxLength?: number;

  /**
   * Label position.
   *
   * 标签位置
   *
   * @default 'after'
   */
  labelPosition?: LabelPosition;

  /**
   * Soft validation, same as TextInput: on failure the input gets `aria-invalid`
   * and the root an invalid flag class, without rewriting the value.
   *
   * 软校验（软反馈）：与 TextInput 同款，值不满足时输入框输出 `aria-invalid`、
   * 根元素叠加 invalid 标志类，不改写值
   */
  validate?: TextInputValidate;

  /**
   * Ref to the inner `<input>`
   *
   * 内部 `<input>` 的引用（组件 ref 指向外层 div）
   */
  inputRef?: Ref<HTMLInputElement>;

  /**
   * Extra-props channel for the native `<input>`; `onChange` / `onBlur` / `onFocus`
   * are chained after the component logic.
   *
   * 原生 `<input>` 的附加属性通道（`...rest` 落在根 div）；`onChange`/`onBlur`/`onFocus`
   * 串联在组件自身逻辑之后（值管线与菜单联动不会被截断）
   */
  inputProps?: UserInputProps<HTMLInputElement>;
}

// 实现说明：对齐原版OO.ui.ComboBoxInputWidget——输入或点击输入框即展开菜单并按值精确匹配
// 选中项，↑↓移动高亮、Enter选定高亮项并收起菜单、下拉按钮切换菜单；不像原生combobox那样
// 强制输入内容必须是选项之一
/**
 * A combo box: a freely editable input with a dropdown candidate menu; the text
 * doesn't have to be one of the candidates.
 *
 * 可输入的下拉候选框：可自由编辑的输入框配下拉候选菜单，不强制输入必须是候选之一。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/combo-box-input/index.html
 */
export const ComboBoxInput = forwardRef<HTMLDivElement, ComboBoxInputProps>(
  (
    {
      options,
      className,
      disabled,
      readOnly,
      name,
      placeholder,
      required,
      accessKey,
      icon,
      indicator,
      label,
      invisibleLabel,
      labelPosition = "after",
      maxLength,
      validate,
      inputRef: inputRefProp,
      inputProps,
      flags,
      value,
      defaultValue,
      onChange,
      // tabIndex/title落在input上（对齐原版ComboBoxInputWidget继承InputWidget的
      // $tabIndexed与$titled均为$input）
      tabIndex,
      // dir对齐原版setDir的落点（$input），不放外层div
      title,
      dir,
      ...rest
    },
    ref,
  ) => {
    // 与其余输入类组件统一受控/非受控语义：非受控时由内部state承接，defaultValue缺省''
    const {
      value: currentValue,
      commit,
      commitIfChanged,
    } = useControlledValue<string, ChangeEvent<HTMLInputElement>>(
      { value, defaultValue: defaultValue ?? "" },
      onChange,
    );
    const [open, setOpen] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const internalInputRef = useRef<HTMLInputElement>(null);
    const setInputRef = useMergedRefs(inputRefProp, internalInputRef);
    // 根元素引用：供useInputProps读取样式表方向，决定标签让位的内边距落在哪一侧
    const internalRootRef = useRef<HTMLDivElement>(null);
    const setRootRef = useMergedRefs(ref, internalRootRef);
    // 菜单面板经MenuSelect portal出控件子树，点击外部关闭时需连同菜单一起排除
    const menuRef = useRef<HTMLDivElement>(null);
    // 菜单id：aria-owns/aria-controls关联portal化的菜单面板
    const menuId = useCleanId();
    // 标签元素引用（原版继承TextInputWidget：input按标签宽度预留内边距）
    const labelRef = useRef<HTMLSpanElement>(null);
    const controlsDisabled = disabled || readOnly;
    // 可选项（有value且未禁用），键盘导航的目标集合
    const { values: selectableValues } = useSelectableValues(options);
    // 下拉按钮的无障碍标签（对齐原版ooui-combobox-button-label消息）
    const toggleOptionsLabel = useMessage("ooui-combobox-button-label");

    /**
     * 选定菜单项：值经String归一化后写入输入框，对齐原版InputWidget.cleanUpValue（强制String），
     * 并收起菜单（对齐原版MenuSelectWidget.hideOnChoose）。注意数值型选项值与原版一致不会
     * 呈现选中态——原版findItemFromData按OO.getHash（JSON.stringify）比较，数字与字符串不等价
     */
    function selectOption(optionValue: string | number) {
      commitIfChanged(String(optionValue));
      setOpen(false);
    }

    // 菜单开合与键盘高亮：导航起点为高亮项、无高亮回退选中项（输入文本精确匹配的选项）；
    // 端点钳制不环绕（原版MenuSelectWidget static.listWrapsAround=false）；
    // 开启时点击外部/Escape关闭（Escape捕获阶段，嵌套于Dialog时不误关弹窗）。
    // 高亮与Select共用（含鼠标悬停），经onHighlightedChange回写。
    // 本组件有输入框，前缀跳转让位给键入，不启用
    const {
      highlightedValue,
      setHighlightedValue,
      navigationValue,
      handleNavigationKey,
      consumeNavigationKey,
    } = useMenuPopup<string | number>({
      open,
      onClose: () => setOpen(false),
      values: selectableValues,
      ignore: [elementRef, menuRef],
      selectedValue: currentValue,
      onChoose: selectOption,
    });

    /**
     * 值管线（挂入useInputProps的onCommitValue，输入即触发）：提交输入文本并展开菜单
     * （对齐原版onEdit的input事件分支）；已有高亮时按原版onInputChange随输入重定位到
     * 精确匹配项（无匹配则清除高亮），避免残留上一轮高亮。
     * event随commit透传给onChange，与TextInput/NumberInput/MultilineTextInput同口径
     */
    const handleInputChange = (
      nextValue: string,
      event: ChangeEvent<HTMLInputElement>,
    ) => {
      commit(nextValue, event);
      setOpen(true);
      setHighlightedValue((prev) =>
        prev === undefined
          ? prev
          : selectableValues.find((optionValue) => optionValue === nextValue),
      );
    };

    // 输入元素的公共属性派生：原版ComboBoxInputWidget继承TextInputWidget，能力与TextInput同源
    // （title/accessKey/dir同落input，对齐原版继承的$titled/$accessKeyed/$input）
    const {
      inputProps: commonInputProps,
      invalid,
      decorationProps,
      indicator: resolvedIndicator,
      indicatorProps: indicatorSlotProps,
    } = useInputProps<HTMLInputElement, string>({
      inputRef: internalInputRef,
      rootRef: internalRootRef,
      value: currentValue,
      validate: resolveValidate(validate),
      disabled,
      tabIndex,
      accessKey,
      name,
      readOnly,
      required,
      placeholder,
      maxLength,
      title,
      invisibleLabel,
      dir,
      labelRef,
      label,
      labelPosition,
      indicator,
      // 值管线：提交输入文本并联动菜单展开/高亮重定位（见handleInputChange）
      onCommitValue: handleInputChange,
    });

    const classes = clsx(
      className,
      // indicatorElement类按解析后的指示器判定（明确无指示器时不输出）
      getTextInputClassName(
        {
          disabled,
          icon,
          indicator: resolvedIndicator ?? undefined,
          label,
          invisibleLabel,
          labelPosition,
          type: "text",
          flags,
          invalid,
        },
        [
          options.length === 0 && "oo-ui-comboBoxInputWidget-empty",
          open && "oo-ui-comboBoxInputWidget-open",
        ],
        "input",
        "textInput",
        "comboBoxInput",
      ),
    );

    /**
     * 输入框键盘交互：↑↓展开/保持菜单并移动高亮，PageUp/PageDown/Tab仅在菜单展开时
     * 占用（Home/End与←→交还输入框光标——原版MenuSelectWidget有$input时不代理这些键），
     * Enter选定导航起点并收起菜单
     */
    const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (controlsDisabled) {
        return;
      }
      // IME合成期按键（确认候选的Enter、选词的方向键）不驱动菜单
      if (isComposingKeyEvent(event)) {
        return;
      }
      switch (event.key) {
        // 方向键唤起菜单并移动高亮（未展开时自首/末项起步）；高亮移动对两键只差offset符号，
        // 传event.key行为等价
        case "ArrowDown":
        case "ArrowUp":
          event.preventDefault();
          setOpen(true);
          handleNavigationKey(event.key);
          break;
        case "PageUp":
        case "PageDown":
        case "Tab":
          // 仅菜单展开时占用：翻页步长走±10导航；Tab对齐原版MenuSelectWidget的TAB分支
          // （有高亮未选中则提交并阻止移出，否则收起并放行移出）；收起时保留输入框原生滚动
          consumeNavigationKey(event);
          break;
        case "Enter":
          // 选定导航起点（高亮项，无高亮时输入文本精确匹配的选中项）后收起菜单；
          // 菜单开启时阻止默认，避免处于FormLayout内时同时提交表单
          if (open) {
            event.preventDefault();
            if (navigationValue !== undefined) {
              selectOption(navigationValue);
            }
          }
          setOpen(false);
          break;
      }
    };

    /**
     * 点击输入框重新展开菜单（对齐原版onEdit的`mouseup`分支：菜单已展开、禁用或不可见时不处理）。
     * 表现为"点击已有关键字的输入框即重开菜单"；readOnly在本工程即下拉按钮与菜单同步禁用
     * （见props注释），故与其余展开通道一致用controlsDisabled把关
     */
    const handleInputMouseUp = () => {
      if (controlsDisabled || open) {
        return;
      }
      setOpen(true);
    };

    /**
     * 下拉按钮开合菜单并把焦点交还输入框（对齐原版onDropdownButtonClick）
     */
    const handleDropdownButtonClick = () => {
      if (controlsDisabled) {
        return;
      }
      setOpen((prev) => !prev);
      internalInputRef.current?.focus();
    };

    // 下拉按钮按压态与键盘激活，对齐原版ButtonElement的相位：mousedown加按压类并
    // return false（cancelButtonMouseDownEvents缺省true，阻止焦点转移，oojs-ui-core.js:2374-2392）；
    // keydown仅加按压类、不阻默认（oojs-ui-core.js:2429-2443）；keypress在Enter/空格时
    // emit click→onDropdownButtonClick（toggle+focus，oojs-ui-core.js:12784-12788）并
    // return false（空格不滚动，oojs-ui-core.js:2462-2468）——activate经handleDropdownButtonClick
    // 走同一开合通道。mouseup/keyup经document级capture监听复位（oojs-ui-core.js:2394/2445）。
    // pressed类落在buttonElement根（span）：主题按压选择器要求其为.oo-ui-buttonElement-button
    // 的父级（oojs-ui-wikimediaui.css:343）
    const {
      pressed: dropdownPressed,
      onMouseDown: pressedDropdownMouseDown,
      onMouseUp: dropdownMouseUp,
      onKeyDown: dropdownKeyDown,
      onKeyUp: dropdownKeyUp,
    } = usePressedState<boolean, HTMLAnchorElement>({
      disabled: controlsDisabled,
      preventDefaultOnPress: false,
    });
    // 鼠标侧阻默认对齐onMouseDown的return false：仅对会被接受的按压（非禁用、左键）生效
    const dropdownMouseDown: MouseEventHandler<HTMLAnchorElement> = (event) => {
      if (!controlsDisabled && event.button === 0) {
        event.preventDefault();
      }
      pressedDropdownMouseDown(event);
    };
    const handleDropdownKeyPress: KeyboardEventHandler<HTMLAnchorElement> = (event) => {
      if (!controlsDisabled && isActivationKey(event.key)) {
        event.preventDefault();
        handleDropdownButtonClick();
      }
    };

    return (
      <div
        {...rest}
        className={classes}
        aria-disabled={disabled || undefined}
        ref={setRootRef}
      >
        {/* 图标与指示器须是根元素（同时带oo-ui-textInputWidget）的直接子节点、且排在-field之前：
            原版TextInputWidget先把input/图标/指示器append到根，ComboBoxInputWidget再新建$field把
            $input与下拉按钮收进去（oojs-ui-core.js:12700-12704），装饰故留在根级；主题的装饰定位
            规则全为`.oo-ui-textInputWidget > .oo-ui-iconElement-icon`一类直接子选择器
            （oojs-ui-core-wikimediaui.css:1718/1735/1787），收进field即全部失配 */}
        <IconBase icon={icon} {...decorationProps} />
        <IndicatorBase {...indicatorSlotProps} />
        <div ref={elementRef} className="oo-ui-comboBoxInputWidget-field">
          <input
            ref={setInputRef}
            // 形态专属属性（combobox角色与菜单关联、按键导航与点击展开）与调用方的inputProps
            // 通道经useInputProps的合并规则并入：同名事件处理器由该hook统一串联（内部逻辑在前）
            {...commonInputProps(
              {
                type: "text",
                role: "combobox",
                "aria-autocomplete": "list",
                "aria-expanded": open,
                // 展开时声明所拥有的菜单、收起即移除（对齐原版MenuSelectWidget.onToggle，
                // 与Dropdown/ButtonMenuSelectWidget同口径；差异见DEVIATIONS「增强」）
                "aria-owns": open ? menuId : undefined,
                // 对齐原版autocomplete:false默认（自定义建议菜单与浏览器原生补全不可叠加）
                autoComplete: "off",
                onKeyDown: handleInputKeyDown,
                onMouseUp: handleInputMouseUp,
              },
              inputProps,
            )}
          />
          <span
            className={clsx(
              "oo-ui-comboBoxInputWidget-dropdownButton",
              // 容器与内层锚点整体对应原版自动生成的真ButtonWidget（framed、indicator:'down'、
              // invisibleLabel）：类贡献走Widget/ButtonElement/IndicatorElement贡献器（禁用态随
              // readOnly，按压态为dropdownPressed），图标/标签/指示器槽位交给ButtonSlots（含
              // noIcon/noIndicator空占位）。锚点故而是`<a>`（无href）并带其固定输出rel=nofollow
              // （setNoFollow缺省true，oojs-ui-core.js:4224；ToggleButtonWidget不走该通道故无
              // rel），title为invisibleLabel→label兜底。aria关系只写aria-controls
              // （oojs-ui-core.js:12692）——原版不给该按钮aria-haspopup，菜单归属已由上方输入框的
              // aria-owns声明
              getWidgetClassName({ disabled: controlsDisabled }, "button"),
              buttonElementClasses({
                framed: true,
                disabled: controlsDisabled,
                pressed: dropdownPressed,
              }),
              indicatorElementClasses({ indicator: "down" }),
            )}
            // Widget.setElementAccessibility的双落点：根与可聚焦锚点各写一次aria-disabled
            aria-disabled={controlsDisabled || undefined}
          >
            <a
              className="oo-ui-buttonElement-button"
              role="button"
              rel="nofollow"
              tabIndex={resolveTabIndex(undefined, controlsDisabled)}
              aria-disabled={controlsDisabled || undefined}
              aria-controls={menuId}
              title={toggleOptionsLabel}
              onClick={handleDropdownButtonClick}
              onKeyPress={handleDropdownKeyPress}
              onMouseDown={dropdownMouseDown}
              onMouseUp={dropdownMouseUp}
              onKeyDown={dropdownKeyDown}
              onKeyUp={dropdownKeyUp}
            >
              <ButtonSlots label={toggleOptionsLabel} labelInvisible indicator="down" />
            </a>
          </span>
        </div>
        {/* 标签是根元素直接子节点（对齐原版positionLabel的$element.append($label)）：
          主题的标签定位规则均为根元素直接子选择器，放进field（display:table）会脱离定位并挤占列宽 */}
        {hasLabel(label) && (
          <LabelBase ref={labelRef} invisible={invisibleLabel}>
            {label}
          </LabelBase>
        )}
        <MenuSelect
          ref={menuRef}
          id={menuId}
          container={elementRef}
          // 高亮项的aria-activedescendant落在输入框上（对齐原版setFocusOwner(widget.$tabIndexed)，
          // 此处$tabIndexed为$input）
          focusOwnerRef={internalInputRef}
          onChoose={selectOption}
          value={currentValue}
          open={open}
          options={options}
          highlightedValue={highlightedValue}
          onHighlightedChange={setHighlightedValue}
        />
      </div>
    );
  },
);

ComboBoxInput.displayName = "ComboBoxInput";

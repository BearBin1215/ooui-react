import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type Ref,
  type RefObject,
} from "react";
import { useMergedRefs } from "./refs";

/**
 * FieldLayout与字段组件的标签联动通道（对齐原版FieldLayout按getInputId()分流的双路径）：
 * 含原生input的字段经`inputId`与label的htmlFor原生关联（原版path 1， getInputId为
 * 可标记元素自动生成id）；无原生input的组件注册标签点击激活回调（对齐原版
 * simulateLabelClick）并经`labelId`挂aria-labelledby（对齐原版setLabelledBy，原版path 2）。
 * 通道按组件形态认领：输入类组件只走通道A；组容器（RadioSelect/CheckboxMultiselect）经
 * useFieldGroupLabelLink屏蔽通道A后只走通道B，保证不双触发。
 * 另有`registerAccessKey`：字段控件把自身的accessKey登记给FieldLayout，对齐原版
 * FieldLayout覆写`formatTitleWithAccessKey`委托字段控件——label的tooltip附字段的键位后缀
 */
export interface FieldLabelLink {
  /** 原生input应使用的id（label的htmlFor指向它）；选项组容器经useFieldGroupLabelLink屏蔽后为undefined */
  inputId?: string;
  /** 标签元素id，供无原生input的组件经aria-labelledby引用 */
  labelId: string;
  /** 注册标签点击的激活回调，返回注销函数 */
  registerLabelActivate: (activate: () => void) => () => void;
  /**
   * 登记字段控件的accessKey（供label的tooltip附键位后缀），返回注销函数。
   * 传空值表示不登记；同一FieldLayout内多个字段登记时以最后登记者为准
   */
  registerAccessKey: (accessKey?: string) => () => void;
}

const FieldLabelLinkContext = createContext<FieldLabelLink | null>(null);

/** FieldLayout向字段子树下发联动通道（组容器RadioSelect/CheckboxMultiselect经
 * useFieldGroupLabelLink屏蔽通道A后，再经本Provider向组内选项继续下发） */
export const FieldLabelLinkProvider = FieldLabelLinkContext.Provider;

/**
 * 输入类组件（通道A）：取原生input/select应挂的id，显式`inputId`优先，不在FieldLayout内时
 * 返回undefined。id与label的htmlFor配合后，点击标签的聚焦/切换由浏览器原生处理
 */
export function useFieldInputId(explicitId?: string): string | undefined {
  const link = useContext(FieldLabelLinkContext);
  return explicitId ?? link?.inputId;
}

/**
 * 选项组容器（RadioSelect/CheckboxMultiselect等）的通道A屏蔽：组内每个选项input都会认领
 * 同一个字段id——产生重复id，且label原生激活首个选项（原版组容器getInputId()为null，
 * 标签点击走simulateLabelClick聚焦而非切换）。经此改写下发值：仅屏蔽inputId，labelId与
 * 激活回调注册照常下发；不在FieldLayout内时返回null（无需再下发）
 */
export function useFieldGroupLabelLink(): FieldLabelLink | null {
  const link = useContext(FieldLabelLinkContext);
  return useMemo(() => (link ? { ...link, inputId: undefined } : null), [link]);
}

/**
 * 非input类组件（通道B）：注册标签点击的激活回调（激活逻辑随渲染更新经ref读取），
 * 返回标签元素id供组件根挂aria-labelledby；不在FieldLayout内时返回undefined且不注册
 */
function useFieldLabelActivate(activate: () => void): string | undefined {
  const link = useContext(FieldLabelLinkContext);
  const activateRef = useRef(activate);
  activateRef.current = activate;
  const register = link?.registerLabelActivate;
  useEffect(
    () => (register ? register(() => activateRef.current()) : undefined),
    [register],
  );
  return link?.labelId;
}

/**
 * 字段控件登记自身的accessKey（对齐原版FieldLayout覆写`formatTitleWithAccessKey`委托
 * 字段控件：label的tooltip会附字段的键位后缀`Title [k]`）。输入族经`useNativeInputProps`、
 * 按钮族经`Button`各调用一次；不在FieldLayout内时为空操作
 */
export function useFieldAccessKey(accessKey?: string): void {
  const register = useContext(FieldLabelLinkContext)?.registerAccessKey;
  useEffect(() => (register ? register(accessKey) : undefined), [register, accessKey]);
}

/**
 * 通道B的标签点击激活（对齐原版`TabIndexedElement.simulateLabelClick`的默认实现）：
 * 点击FieldLayout标签时聚焦组件根元素，禁用时不聚焦（原版`focus()`内含isDisabled判断）。
 * 内部持有根元素ref并与外部转发的ref合并，返回合并后的ref回调、内部ref与标签元素id。
 * 落点不是根元素或需附带副作用的组件传`activate`覆盖默认的聚焦：
 * Dropdown聚焦handle、ToggleButton经内部锚点聚焦、ToggleSwitch额外翻转值、
 * CheckboxMultiselect聚焦首个可用选项（不经根元素）
 */
export function useFieldLabelFocus<T extends HTMLElement>({
  ref,
  disabled,
  activate,
}: {
  /** 外部转发的根元素ref */
  ref?: Ref<T>;
  /** 禁用时不激活 */
  disabled?: boolean;
  /** 自定义激活动作，入参为根元素；缺省聚焦根元素 */
  activate?: (el: T | null) => void;
}): {
  /** 合并内部ref与外部ref后的根元素ref回调 */
  setRef: (node: T | null) => void;
  /** 内部持有的根元素ref，供组件自身读取（如Dropdown的浮层忽略目标） */
  rootRef: RefObject<T | null>;
  /** 标签元素id，供根元素挂aria-labelledby */
  fieldLabelId: string | undefined;
} {
  const rootRef = useRef<T>(null);
  const setRef = useMergedRefs(ref, rootRef);
  // 激活回调经useFieldLabelActivate的ref读取，闭包里的disabled/activate恒为最新值
  const fieldLabelId = useFieldLabelActivate(() => {
    if (disabled) {
      return;
    }
    if (activate) {
      activate(rootRef.current);
    } else {
      rootRef.current?.focus();
    }
  });
  return { setRef, rootRef, fieldLabelId };
}

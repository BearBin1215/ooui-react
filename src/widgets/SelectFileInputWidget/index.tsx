import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
  type ReactNode,
  type Ref,
} from "react";
import clsx from "clsx";
import { ActionFieldLayout } from "../../layouts/ActionFieldLayout";
import { getWidgetClassName, pendingElementClasses, resolveTitle } from "../../mixins";
import type { AccessKeyedElement } from "../../Element";
import { useControlledValue, useLatestRef, useMergedRefs } from "../../hooks";
import { useAccessKeyLabel, useMessage } from "../../config";
import { Button, type ButtonProps } from "../Button";
import { Icon } from "../Icon";
import { SearchInput } from "../SearchInput";
import type { WidgetProps } from "../Widget";

/** 空文件集常量（模块级，避免每次新建字面量） */
const NO_FILES: File[] = [];

/**
 * `DataTransfer`构造器可用性（Safari<14.1缺）：不可用时无法把文件集写回`input.files`，
 * 拖放能力一并关闭（对齐原版`canSetFiles`探测）
 */
const CAN_SET_FILES = (() => {
  try {
    new DataTransfer();
    return true;
  } catch {
    return false;
  }
})();

/**
 * 文件比较键：`File`的字段不可枚举，按原版`comparableFile`取size/type/lastModified/name
 * 四字段比较（忽略内容，故非严格相等）
 */
const comparableKey = (file: File) =>
  [file.name, file.size, file.type, file.lastModified].join("\u0000");

/** 两个文件集是否等价（长度相同且逐项比较键相同） */
const isSameFiles = (a: File[], b: File[]) =>
  a.length === b.length &&
  a.every((file, index) => comparableKey(file) === comparableKey(b[index]));

/**
 * 拖入/拖过的接收判定（对齐原版`onDragEnterOrOver`），返回本次应呈现的拖放态。
 * 分两段判定：拖入阶段`items`只给出kind（安全限制下不暴露文件内容），故先按kind判断
 * 是否含文件，再按accept过滤；`items`为空时浏览器不提供文件信息，退按`types`含'Files'
 * 先行按可接收处理（原版同）
 * @param dataTransfer 拖放事件的数据传输对象
 * @param filterFiles 按accept过滤文件集的判定（见组件内同名实现）
 */
function resolveDropState(
  dataTransfer: DataTransfer,
  filterFiles: (list: ArrayLike<File>) => File[],
): "canDrop" | "cantDrop" | null {
  // 本组件的拖放路径已由CAN_SET_FILES门控（DataTransfer构造器，Safari 14.1+），该起点上
  // items/types恒存在，故直接取用、不回退files（原版的老Safari兜底见DEVIATIONS「舍弃」）
  const { items, types } = dataTransfer;
  const hasFiles = Array.from(items).some(
    (item: DataTransferItem) => item.kind === "file",
  );
  if (hasFiles) {
    // DataTransferItem与File同样带type，accept过滤按type判定故可复用
    return filterFiles(items as unknown as ArrayLike<File>).length > 0
      ? "canDrop"
      : "cantDrop";
  }
  return types.includes("Files") ? "canDrop" : null;
}

/**
 * 读取图片文件的dataURL并校验其可解码（对齐原版`loadAndGetImageUrl`）：仅`image/*`且
 * 大小在上限内才尝试，解码失败（自然尺寸为0或未加载完成）时reject
 */
function loadImageUrl(file: File, sizeLimitMb: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (
      !(file.type || "").startsWith("image/") ||
      file.size >= sizeLimitMb * 1024 * 1024
    ) {
      reject(new Error("not a thumbnailable image"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = String(event.target?.result ?? "");
      const image = document.createElement("img");
      image.addEventListener("load", () => {
        if (
          image.naturalWidth === 0 ||
          image.naturalHeight === 0 ||
          image.complete === false
        ) {
          reject(new Error("not decodable"));
        } else {
          resolve(url);
        }
      });
      image.addEventListener("error", () => reject(new Error("load failed")));
      image.src = url;
    };
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

/**
 * Props of the file-selection input.
 *
 * 文件选择输入框属性。
 */
export interface SelectFileInputWidgetProps
  extends Omit<WidgetProps<HTMLDivElement>, "children" | "onChange">, AccessKeyedElement {
  /**
   * Current file set (controlled; passing it enables controlled mode; an empty
   * array means none selected). Always an array, even for single selection —
   * `multiple` decides whether files beyond the first are kept.
   *
   * 当前文件集（受控，传入即受控模式；空数组即未选择）。无论单/多选统一为
   * 数组，单选形态由 `multiple` 决定（非多选时只保留首个文件）。
   */
  value?: File[];

  /**
   * Initial file set for uncontrolled use.
   *
   * 非受控初始文件集。
   */
  defaultValue?: File[];

  /**
   * File-set change callback; fires on select, drop, clear and controlled
   * write-back, but not when the new set is equivalent to the current one.
   *
   * 文件集变化回调（选择、拖放、清除、受控值写回时触发）；新旧等价时不触发。
   */
  onChange?: (files: File[]) => void;

  /**
   * Accepted file types (MIME or `image/*` patterns); written to the native
   * `accept` attribute and used to filter selections and drops.
   *
   * 接受的文件类型（MIME 或 `image/*` 形态）；同时写入 `accept` 属性并按此
   * 过滤选择与拖放。
   */
  accept?: string[];

  /**
   * Whether to allow multiple selection.
   *
   * 是否多选。
   */
  multiple?: boolean;

  /**
   * Whether drag-and-drop is enabled (default `true`; forcibly off when the
   * browser lacks `DataTransfer` support).
   *
   * 是否可拖放（缺省 true；`DataTransfer` 不可用时强制关闭）。
   */
  droppable?: boolean;

  /**
   * Use the full-area drop-zone form (whole area accepts drops and clicks;
   * requires `droppable`).
   *
   * 是否使用拖放区形态（整块可拖放与点击，须 `droppable`）。
   */
  showDropTarget?: boolean;

  /**
   * Render only the select button, without the info field (takes priority over
   * `showDropTarget`).
   *
   * 只渲染选择按钮（优先级高于 `showDropTarget`）。
   */
  buttonOnly?: boolean;

  /**
   * Maximum file size in MB for loading a thumbnail; oversized or non-image
   * files show an attachment icon instead (default 20).
   *
   * 缩略图大小上限（MB），超出则不加载缩略图而显示附件图标（缺省 20）。
   */
  thumbnailSizeLimit?: number;

  /**
   * Placeholder text for the info field (falls back to a localized message).
   *
   * 信息框占位文案（缺省取本地化消息）。
   */
  placeholder?: string;

  /**
   * Icon for the info field (no default; must be passed explicitly).
   *
   * 信息框图标（缺省无，须显式传入）。
   */
  icon?: string;

  /**
   * Required (the native `required` lands on the file `<input>`; the info field
   * shows no required indicator).
   *
   * 是否必填（`required` 写在文件 `input` 上，信息框不显示 required 指示器）。
   */
  required?: boolean;

  /**
   * Form field name (written to the file `<input>` for submission).
   *
   * 文件字段名（写在文件 `input` 的 `name` 上，用于表单提交）。
   */
  name?: string;

  /**
   * Select-button label (falls back to a localized message by `multiple`).
   *
   * 选择按钮文案（缺省按 `multiple` 取本地化消息）。
   */
  buttonLabel?: ReactNode;

  /**
   * Select-button props override (`disabled` / `onClick` are taken over by this
   * component).
   *
   * 选择按钮属性覆盖（`disabled` / `onClick` 由本组件接管）。
   */
  buttonProps?: Omit<
    ButtonProps,
    "children" | "disabled" | "onClick" | "anchorContent" | "anchorRef"
  >;

  /**
   * Ref to the inner file `<input>` element.
   *
   * 获取内部文件 `input` 元素引用。
   */
  inputRef?: Ref<HTMLInputElement>;
}

/**
 * A file-selection input (OO.ui.SelectFileInputWidget): a read-only info field
 * (its clear indicator is the sole way to reset) plus a select button whose
 * anchor overlays a native `<input type="file">`, laid out via ActionFieldLayout.
 * Also has a drop-zone form and a button-only form. The Tab stop is the select
 * button; the clear indicator is keyboard-reachable.
 *
 * 文件选择输入框（对齐原版 OO.ui.SelectFileInputWidget）：信息框（只读展示
 * 文件名，清除指示器是唯一的清除入口）+ 选择按钮（锚点上覆盖原生
 * `<input type="file">`，点击即开系统选择器），二者经 ActionFieldLayout 排布；
 * 另有拖放区形态与只渲染按钮形态。Tab 停靠点为选择按钮，清除指示器键盘可达。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/select-file-input-widget/index.html
 */
export const SelectFileInputWidget = forwardRef<
  HTMLDivElement,
  SelectFileInputWidgetProps
>(
  (
    {
      accessKey,
      accept,
      buttonLabel,
      buttonOnly = false,
      buttonProps,
      className,
      defaultValue,
      disabled,
      droppable = true,
      icon,
      inputRef,
      multiple = false,
      name,
      onChange,
      placeholder,
      required,
      showDropTarget = false,
      tabIndex,
      thumbnailSizeLimit = 20,
      title,
      value,
      ...rest
    },
    ref,
  ) => {
    const selectButtonMessage = useMessage(
      multiple
        ? "ooui-selectfile-button-select-multiple"
        : "ooui-selectfile-button-select",
    );
    const placeholderMessage = useMessage("ooui-selectfile-placeholder");
    const dropLabelMessage = useMessage(
      multiple
        ? "ooui-selectfile-dragdrop-placeholder-multiple"
        : "ooui-selectfile-dragdrop-placeholder",
    );
    const { value: files, commit } = useControlledValue<File[]>(
      { value, defaultValue: defaultValue ?? NO_FILES },
      onChange,
    );
    const filesRef = useLatestRef(files);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const setFileInputRef = useMergedRefs(inputRef, fileInputRef);
    /** 拖放态类（canDrop/cantDrop），对齐原版onDragEnterOrOver/onDragLeave的类切换 */
    const [dropState, setDropState] = useState<"canDrop" | "cantDrop" | null>(null);
    const [thumbnail, setThumbnail] = useState<{ url: string | null; failed: boolean }>({
      url: null,
      failed: false,
    });
    const [thumbnailPending, setThumbnailPending] = useState(false);

    const isDropTarget = droppable && CAN_SET_FILES && showDropTarget;
    // DataTransfer不可用时拖放一并关闭（对齐原版canSetFiles探测里对config.droppable的覆盖）
    const isDroppable = droppable && CAN_SET_FILES;
    // 拖放区形态取代了按钮形态（原版二者互斥，dropTarget分支优先）
    const isButtonOnly = !isDropTarget && buttonOnly;
    // 缩略图仅在拖放区且非多选时存在（原版：多选拖放区不加载缩略图）
    const useThumbnail = isDropTarget && !multiple;
    const acceptList = useMemo(() => (accept?.length ? accept : null), [accept]);

    /**
     * 按`accept`过滤（MIME全等或`image/*`前缀匹配；文件无type信息时一律放行，
     * 对齐原版`filterFiles`），用于选择结果与拖放的入参校验
     */
    const filterFiles = useCallback(
      (list: ArrayLike<File>): File[] => {
        const candidates = Array.from(list);
        if (!acceptList) {
          return candidates;
        }
        return candidates.filter((file) => {
          const mimeType = file.type;
          if (!mimeType) {
            return true;
          }
          return acceptList.some(
            (accepted) =>
              accepted === mimeType ||
              (accepted.endsWith("/*") && mimeType.startsWith(accepted.slice(0, -1))),
          );
        });
      },
      [acceptList],
    );

    /** 提交文件集：仅与原值不等价时向上提交（对齐原版`setValue`的比较语义，非多选时截首位） */
    const commitFiles = useCallback(
      (next: File[]) => {
        const normalized = multiple ? next : next.slice(0, 1);
        const normalizedRef = multiple ? filesRef.current : filesRef.current.slice(0, 1);
        if (!isSameFiles(normalized, normalizedRef)) {
          commit(normalized.length ? normalized : NO_FILES);
        }
      },
      [commit, filesRef, multiple],
    );

    // 受控值 → input.files（对齐原版setValue的DataTransfer写回）。DOM已是同一集合时不动，
    // 否则会把用户刚选中的文件清掉
    useEffect(() => {
      const input = fileInputRef.current;
      if (!input) {
        return;
      }
      if (!CAN_SET_FILES) {
        // 无法构造FileList时只能清空（对齐原版回退到InputWidget.setValue('')）
        if (!files.length) {
          input.value = "";
        }
        return;
      }
      if (isSameFiles(Array.from(input.files ?? []), files)) {
        return;
      }
      const dataTransfer = new DataTransfer();
      files.forEach((file) => dataTransfer.items.add(file));
      input.files = dataTransfer.files;
    }, [files]);

    // 缩略图：仅单文件拖放区形态下加载（对齐原版updateUI的loadAndGetImageUrl分支），
    // 加载中给缩略图容器挂pending类，失败时改放attachment图标
    useEffect(() => {
      if (!useThumbnail || files.length === 0) {
        setThumbnail({ url: null, failed: false });
        setThumbnailPending(false);
        return;
      }
      let cancelled = false;
      setThumbnailPending(true);
      loadImageUrl(files[0], thumbnailSizeLimit)
        .then((url) => {
          if (!cancelled) {
            setThumbnail({ url, failed: false });
          }
        })
        .catch(() => {
          if (!cancelled) {
            setThumbnail({ url: null, failed: true });
          }
        })
        .finally(() => {
          if (!cancelled) {
            setThumbnailPending(false);
          }
        });
      return () => {
        cancelled = true;
      };
    }, [files, useThumbnail, thumbnailSizeLimit]);

    // title的键位后缀：快捷键文案由宿主解析（未提供时title附原键值）
    const accessKeyLabel = useAccessKeyLabel(accessKey);

    /** 打开系统文件选择器（对齐原版onKeyPress/onDropTargetClick对`$input`触发click） */
    const openPicker = () => {
      if (!disabled) {
        fileInputRef.current?.click();
      }
    };

    /** 用户在系统选择器里选定文件（对齐原版onFileSelected，选择结果按accept过滤） */
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      commitFiles(filterFiles(event.target.files ?? []));
    };

    /**
     * 信息框值变化：信息框被清空时同步清空文件集（对齐原版onInfoChange，oojs-ui.js:14629：
     * 值为''即清文件、非空值不改变文件集）。信息框的input恒禁用、不可键入，用户唯一能
     * 改动信息框值的入口就是清除指示器，指示器把值置''后经此清空文件集
     */
    const handleInfoChange = (next: string) => {
      if (next === "") {
        commitFiles(NO_FILES);
      }
    };

    /** 拖放区空态时整块可点击开选择器（对齐原版updateUI：有文件时解绑root的click） */
    const handleRootClick = () => {
      if (files.length === 0) {
        openPicker();
      }
    };

    /** 拖入/拖过：按能否接收切换canDrop/cantDrop类并设置dropEffect（对齐原版onDragEnterOrOver） */
    const handleDragEnterOrOver = (event: ReactDragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const { dataTransfer } = event;
      if (disabled) {
        setDropState(null);
        dataTransfer.dropEffect = "none";
        return;
      }
      const state = resolveDropState(dataTransfer, filterFiles);
      setDropState(state);
      // 无可接收文件时把dropEffect置none（对齐原版：canDrop以外一律不接受放置）
      if (state !== "canDrop") {
        dataTransfer.dropEffect = "none";
      }
    };

    const handleDragLeave = () => {
      setDropState(null);
    };

    /** 落放：按accept过滤后入库（对齐原版onDrop） */
    const handleDrop = (event: ReactDragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setDropState(null);
      if (disabled) {
        return;
      }
      commitFiles(filterFiles(event.dataTransfer.files));
    };

    const fileName = files.map((file) => file.name).join(", ");
    const isEmpty = files.length === 0;
    // 类序对齐原版：基础类→构造期形态类（dropTarget/withThumbnail/buttonOnly）→`-empty`
    // （原版由构造末尾的updateUI追加，故在形态类之后）→运行期拖放态类
    const rootClasses = clsx(
      className,
      getWidgetClassName({ disabled }, "input", "selectFileInput"),
      "oo-ui-selectFileWidget",
      isDropTarget &&
        "oo-ui-selectFileInputWidget-dropTarget oo-ui-selectFileWidget-dropTarget",
      useThumbnail &&
        "oo-ui-selectFileInputWidget-withThumbnail oo-ui-selectFileWidget-withThumbnail",
      isButtonOnly &&
        "oo-ui-selectFileInputWidget-buttonOnly oo-ui-selectFileWidget-buttonOnly",
      isEmpty && "oo-ui-selectFileInputWidget-empty",
      dropState === "canDrop" &&
        "oo-ui-selectFileInputWidget-canDrop oo-ui-selectFileWidget-canDrop",
      dropState === "cantDrop" && "oo-ui-selectFileInputWidget-cantDrop",
    );

    const fileInput = (
      <input
        ref={setFileInputRef}
        className="oo-ui-inputWidget-input"
        type="file"
        // 选择按钮才是Tab停靠点（原版把$tabIndexed让给selectButton.$button）
        tabIndex={-1}
        name={name}
        accessKey={accessKey}
        // 空title抑制浏览器对file input的默认提示（原版static.title=''，经TitledElement落在
        // $input上，调用方title同落此处）；accessKey有值时附加键位后缀，解析见resolveTitle
        title={resolveTitle({ title: title ?? "", accessKey, accessKeyLabel })}
        accept={acceptList ? acceptList.join(", ") : undefined}
        multiple={multiple || undefined}
        required={required}
        disabled={disabled}
        onChange={handleInputChange}
        // 阻止冒泡：拖放区形态下按钮的click会被root的“空态整块可点击”再处理一次
        // （对齐原版$input的click stopPropagation）
        onClick={(event) => event.stopPropagation()}
      />
    );

    // 信息框为SearchInput组合（对齐原版构造`new OO.ui.SearchInputWidget(...)`，oojs-ui.js:14254）：
    // 展示文件名，清除指示器是唯一的清除入口——指示器的清除交互（点击/Enter）把信息框值
    // 置''，再经handleInfoChange清空文件集，与原版的change→onInfoChange链同构
    // （原版info.connect(this, { change: 'onInfoChange' })，oojs-ui.js:14350）
    const infoField = (
      <SearchInput
        className="oo-ui-selectFileInputWidget-info"
        // 图标由icon参数决定、未传时无图标（对齐原版setIcon(config.icon)，缺省null）
        icon={icon}
        noDefaultIcon
        // 信息框自身移出Tab序（对齐原版info.$input.attr('tabindex', -1)，oojs-ui.js:14263）
        tabIndex={-1}
        // 清除是唯一的清除入口，指示器须键盘可达（对齐原版info.$indicator.attr('tabindex', 0)，
        // oojs-ui.js:14265）
        indicatorTabIndex={0}
        // input恒禁用：对齐原版setDisabled里无条件的`info.$input.attr('disabled', true)`
        // （oojs-ui.js:14667，借此让findFocusable取不到它）。经inputProps通道承载、不驱动
        // 根元素的禁用类，根禁用态由disabled prop随组件
        inputProps={{ disabled: true }}
        placeholder={placeholder ?? placeholderMessage}
        value={fileName}
        onChange={handleInfoChange}
        disabled={disabled}
      />
    );

    const selectButton = (
      <Button
        // buttonOnly时根元素即按钮：调用方的DOM属性随之落到按钮上（对齐原版把$element替换为按钮）
        {...(isButtonOnly ? (rest as Partial<ButtonProps>) : {})}
        {...buttonProps}
        ref={isButtonOnly ? (ref as Ref<HTMLSpanElement>) : undefined}
        className={clsx(
          buttonProps?.className,
          "oo-ui-selectFileInputWidget-selectButton",
          isButtonOnly && rootClasses,
        )}
        disabled={disabled}
        icon={isDropTarget ? "upload" : buttonProps?.icon}
        tabIndex={tabIndex}
        onClick={openPicker}
        anchorContent={fileInput}
      >
        {buttonLabel ?? selectButtonMessage}
      </Button>
    );

    if (isButtonOnly) {
      return selectButton;
    }

    return (
      <div
        {...rest}
        ref={ref}
        className={rootClasses}
        aria-disabled={disabled || undefined}
        onClick={isDropTarget ? handleRootClick : undefined}
        onDragEnter={isDroppable ? handleDragEnterOrOver : undefined}
        onDragOver={isDroppable ? handleDragEnterOrOver : undefined}
        onDragLeave={isDroppable ? handleDragLeave : undefined}
        onDrop={isDroppable ? handleDrop : undefined}
      >
        {isDropTarget ? (
          <>
            {useThumbnail && (
              <div
                className={clsx(
                  "oo-ui-selectFileInputWidget-thumbnail oo-ui-selectFileWidget-thumbnail",
                  pendingElementClasses(thumbnailPending),
                )}
                style={
                  thumbnail.url
                    ? { backgroundImage: `url( ${thumbnail.url} )` }
                    : undefined
                }
              >
                {thumbnail.failed && (
                  <Icon
                    className="oo-ui-selectFileInputWidget-noThumbnail-icon oo-ui-selectFileWidget-noThumbnail-icon"
                    icon="attachment"
                  />
                )}
              </div>
            )}
            {infoField}
            {selectButton}
            <span className="oo-ui-selectFileInputWidget-dropLabel oo-ui-selectFileWidget-dropLabel">
              {dropLabelMessage}
            </span>
          </>
        ) : (
          <ActionFieldLayout align="top" button={selectButton}>
            {infoField}
          </ActionFieldLayout>
        )}
      </div>
    );
  },
);

SelectFileInputWidget.displayName = "SelectFileInputWidget";

import { useState } from "react";
import { SelectFileInputWidget } from "ooui-react";
import {
  appendValueOutput,
  createRowAppender,
  useOriginalWidgets,
} from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";
import { unwrapJQuery } from "../../components/ooui";

type SelectFileUi = {
  SelectFileInputWidget: new (config?: Record<string, unknown>) => {
    $element: unknown;
    setValue: (files: File[]) => void;
    getValue: () => File | File[] | null;
    on: (event: string, handler: (files: File[]) => void) => void;
  };
};

/** 1x1透明PNG：用于“已选文件”“缩略图”两条路径的真图片（缩略图须能真正解码） */
const PNG_1PX =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

/** 构造一个可解码的图片File（缩略图路径要求文件内容真为图片） */
function makeImageFile(fileName = "logo.png"): File {
  const binary = atob(PNG_1PX);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], fileName, { type: "image/png" });
}

/**
 * 原版侧各行配置（React侧逐条对应），第三项为true时须在构造后补一次`setValue`：
 * 原版构造期传`value`会被丢弃——彼时`$input`尚未置`type=file`，`setValue`写回`input.files`
 * 无效，而构造末尾又用`$input.files`覆盖了`currentFiles`。React侧`value`/`defaultValue`
 * 直接生效（修掉该缺陷，见dev-docs/DEVIATIONS.md「增强」）。
 */
const ORIGINAL_ROWS: [string, Record<string, unknown>, boolean?][] = [
  ["默认（信息框+选择按钮）", {}],
  ["多选（multiple）", { multiple: true }],
  ["限定类型（accept: image/*）", { accept: ["image/*"] }],
  ["已选文件（信息框显示文件名）", {}, true],
  ["必填（required）", { required: true }],
  ["禁用", { disabled: true }],
  ["拖放区·单选（空态）", { showDropTarget: true }],
  ["拖放区·多选（空态）", { showDropTarget: true, multiple: true }],
  ["拖放区·单选·已选图片（缩略图）", { showDropTarget: true }, true],
  [
    "拖放区·多选·已选文件（不加载缩略图）",
    { showDropTarget: true, multiple: true },
    true,
  ],
  ["拖放区·限定类型（accept: image/*）", { showDropTarget: true, accept: ["image/*"] }],
  ["仅按钮", { buttonOnly: true }],
];

/** 原版侧：同一组配置逐行登记 */
function OriginalSelectFiles() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as SelectFileUi;
    const row = createRowAppender(container, register);
    ORIGINAL_ROWS.forEach(([name, config, setValueAfterConstruct]) => {
      const widget = row(ui.SelectFileInputWidget, name, config);
      if (setValueAfterConstruct) {
        widget.setValue([makeImageFile()]);
      }
    });

    // 受控演示：按钮程序化setValue（React为受控value+按钮写回）
    const controlled = row(ui.SelectFileInputWidget, "受控value（按钮程序化写回）", {});
    // 行尾cmp-value读数监听change事件（程序化setValue与选文件都派发），与React侧行尾读数对称
    const writeCount = appendValueOutput(controlled);
    const showCount = (count: number) => writeCount(`当前：${count}个文件`);
    // 初始按构造期文件数显示（getValue单选返回单个File、多选返回File[]，无文件时为空）
    const initialValue = controlled.getValue();
    if (Array.isArray(initialValue)) {
      showCount(initialValue.length);
    } else {
      showCount(initialValue ? 1 : 0);
    }
    controlled.on("change", (files) => showCount(files.length));
    const controlledButton = document.createElement("button");
    controlledButton.type = "button";
    controlledButton.textContent = "程序化设置文件";
    controlledButton.addEventListener("click", () => {
      controlled.setValue([makeImageFile("controlled.png")]);
    });
    // 按钮置于行内，与React侧行内按钮布局一致
    unwrapJQuery(controlled.$element).parentElement?.appendChild(controlledButton);

    // 状态与自定义通道变体
    row(ui.SelectFileInputWidget, "droppable=false（关拖放）", { droppable: false });
    const limited = row(
      ui.SelectFileInputWidget,
      "缩略图超限（thumbnailSizeLimit=0回退图标）",
      {
        showDropTarget: true,
        thumbnailSizeLimit: 0,
      },
    );
    limited.setValue([makeImageFile("over-limit.png")]);
    row(ui.SelectFileInputWidget, "自定义placeholder/icon", {
      placeholder: "尚未选择任何文件",
      icon: "upload",
    });
    row(ui.SelectFileInputWidget, "自定义按钮文案（button.label）", {
      button: { label: "浏览…" },
    });
    row(ui.SelectFileInputWidget, "button.flags（按钮带标志）", {
      button: { flags: "primary" },
    });
    row(ui.SelectFileInputWidget, "name（落input的name属性）", { name: "file-name" });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：与原版逐行同配置 */
function ReactSelectFiles({ addLog }: { addLog: (msg: string) => void }) {
  const [initialFile] = useState(() => makeImageFile());
  const [limitFile] = useState(() => makeImageFile("over-limit.png"));
  const [controlledFiles, setControlledFiles] = useState<File[]>([]);

  return (
    <div>
      <div>
        默认（信息框+选择按钮）
        <SelectFileInputWidget onChange={(files) => addLog(`default=${files.length}`)} />
      </div>
      <div>
        多选（multiple）
        <SelectFileInputWidget
          multiple
          onChange={(files) => addLog(`multiple=${files.length}`)}
        />
      </div>
      <div>
        限定类型（accept: image/*）
        <SelectFileInputWidget
          accept={["image/*"]}
          onChange={(files) => addLog(`accept=${files.length}`)}
        />
      </div>
      <div>
        已选文件（信息框显示文件名）
        <SelectFileInputWidget defaultValue={[initialFile]} />
      </div>
      <div>
        必填（required）
        <SelectFileInputWidget required />
      </div>
      <div>
        禁用
        <SelectFileInputWidget disabled />
      </div>
      <div>
        拖放区·单选（空态）
        <SelectFileInputWidget
          showDropTarget
          onChange={(files) => addLog(`dropTarget=${files.length}`)}
        />
      </div>
      <div>
        拖放区·多选（空态）
        <SelectFileInputWidget
          multiple
          showDropTarget
          onChange={(files) => addLog(`dropTargetMultiple=${files.length}`)}
        />
      </div>
      <div>
        拖放区·单选·已选图片（缩略图）
        <SelectFileInputWidget showDropTarget defaultValue={[initialFile]} />
      </div>
      <div>
        拖放区·多选·已选文件（不加载缩略图）
        <SelectFileInputWidget multiple showDropTarget defaultValue={[initialFile]} />
      </div>
      <div>
        拖放区·限定类型（accept: image/*）
        <SelectFileInputWidget
          accept={["image/*"]}
          showDropTarget
          onChange={(files) => addLog(`dropTargetAccept=${files.length}`)}
        />
      </div>
      <div>
        仅按钮
        <SelectFileInputWidget
          buttonOnly
          onChange={(files) => addLog(`buttonOnly=${files.length}`)}
        />
      </div>
      <div>
        受控value（按钮程序化写回）
        <SelectFileInputWidget value={controlledFiles} onChange={setControlledFiles} />
        <span className="cmp-value">当前：{controlledFiles.length}个文件</span>
        <button
          type="button"
          onClick={() => setControlledFiles([makeImageFile("controlled.png")])}
        >
          程序化设置文件
        </button>
      </div>
      <div>
        droppable=false（关拖放）
        <SelectFileInputWidget droppable={false} />
      </div>
      <div>
        缩略图超限（thumbnailSizeLimit=0回退图标）
        <SelectFileInputWidget
          showDropTarget
          thumbnailSizeLimit={0}
          defaultValue={[limitFile]}
        />
      </div>
      <div>
        自定义placeholder/icon
        <SelectFileInputWidget placeholder="尚未选择任何文件" icon="upload" />
      </div>
      <div>
        {/* 行名标注各自API通道：原版button.label配置、React扁平化props buttonLabel */}
        自定义按钮文案（buttonLabel）
        <SelectFileInputWidget buttonLabel="浏览…" />
      </div>
      <div>
        {/* 行名标注各自API通道：原版button.flags配置、React扁平化props buttonProps */}
        buttonProps（按钮带标志）
        <SelectFileInputWidget buttonProps={{ flags: "primary" }} />
      </div>
      <div>
        name（落input的name属性）
        <SelectFileInputWidget name="file-name" />
      </div>
      <div>
        {/* inputRef为React侧逃生舱：ref回调拿到内部文件input引用（此处写dataset标记验证） */}
        inputRef（读取内部input的name与accept）
        <SelectFileInputWidget
          name="file-ref-name"
          accept={["image/*"]}
          inputRef={(el) => {
            if (el) {
              el.dataset.probe = "ok";
            }
          }}
        />
      </div>
    </div>
  );
}

function FileInputComparePage() {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => setLog((prev) => [...prev.slice(-9), message]);

  return (
    <CompareLayout
      title="SelectFileInputWidget 对照"
      description={
        <>
          对照点：信息框（type=search、input的tabindex=-1、清除指示器tabindex=0）、选择按钮
          （文件input覆盖在锚点上、tab停靠点是按钮）、ActionFieldLayout的排布、多选与accept过滤、
          拖放区的类切换（canDrop/cantDrop）与缩略图加载（thumbnailSizeLimit超限或解码失败
          回退attachment图标、多选拖放区不加载缩略图）、buttonOnly的根元素替换；
          受控value程序化写回（原版经构造后
          setValue，本工程受控value直接生效，见DEVIATIONS「增强」）、droppable=false、
          自定义placeholder/icon/buttonLabel。
        </>
      }
    >
      <CompareColumns original={<OriginalSelectFiles />}>
        <ReactSelectFiles addLog={addLog} />
      </CompareColumns>

      <h2>事件日志（React侧）</h2>
      <ul>
        {log.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </CompareLayout>
  );
}

FileInputComparePage.displayName = "FileInputComparePage";

export default FileInputComparePage;

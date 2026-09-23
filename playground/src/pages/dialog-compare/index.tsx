import { useRef, useState } from "react";
import {
  alert,
  Button,
  confirm,
  Dialog,
  Dropdown,
  MessageDialog,
  PopupButton,
} from "ooui-react";
import { ensureOOUI, unwrapJQuery, type OOUIWindow } from "../../components/ooui";
import { useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

const sizes = ["small", "medium", "large", "larger", "full"] as const;
type DialogSize = (typeof sizes)[number];

/** 原版侧：每种尺寸一个WindowManager（同类的static.name相同，同一manager只能挂一个MessageDialog），按钮逐个打开 */
function OriginalDialogs() {
  const dialogsRef = useRef<Partial<Record<DialogSize, OOUIWindow>>>({});
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const dialogs = sizes.map((size) => {
      const OriginalMessageDialog = oo.ui.MessageDialog as unknown as new (
        config?: Record<string, unknown>,
      ) => OOUIWindow;
      const manager = new oo.ui.WindowManager();
      // manager.$element为jQuery对象，取其包裹的真实DOM节点
      container.appendChild(unwrapJQuery(manager.$element));
      const dialog = new OriginalMessageDialog({ size });
      // destroy清理windowManager（clearWindows+移除DOM），避免窗口残留
      register(manager);
      manager.addWindows([dialog]);
      return [size, dialog] as const;
    });
    dialogsRef.current = Object.fromEntries(dialogs);
  });

  const openOriginal = (size: DialogSize) => {
    // 与React版相同的标题与内容，保证对照等价。
    // size必须经open的data传入：原版MessageDialog.getSetupProcess每次open都会以
    // data.size ?? static.size（'small'）覆盖构造时的size配置
    dialogsRef.current[size]?.open({
      title: `Confirm (${size})`,
      message: "message content",
      size,
    });
  };

  return (
    <div>
      <p>
        {sizes.map((size) => (
          <Button
            key={size}
            onClick={() => openOriginal(size)}
            style={{ marginRight: "0.5em" }}
          >
            Open {size}
          </Button>
        ))}
      </p>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：五种尺寸的受控MessageDialog */
function ReactDialogs() {
  const [openSize, setOpenSize] = useState<DialogSize | undefined>(void 0);

  return (
    <div>
      <p>
        {sizes.map((size) => (
          <Button
            key={size}
            onClick={() => setOpenSize(size)}
            style={{ marginRight: "0.5em" }}
          >
            Open {size}
          </Button>
        ))}
      </p>
      {sizes.map((size) => (
        <MessageDialog
          key={size}
          open={openSize === size}
          size={size}
          title={`Confirm (${size})`}
          onEscape={() => setOpenSize(undefined)}
          onOk={() => setOpenSize(undefined)}
          onCancel={() => setOpenSize(undefined)}
        >
          message content
        </MessageDialog>
      ))}
    </div>
  );
}

/** 超长动作文案：验证动作区横向装不下时切竖向布局（两版fitActions） */
const LONG_OK_LABEL = "确定并保存这个非常长的操作名称";
const LONG_CANCEL_LABEL = "取消并放弃这个同样很长的操作";

/** 原版侧：长文案经open的data.actions传入（每次打开以data.actions覆盖static.actions） */
function OriginalLongLabelDialog() {
  const dialogRef = useRef<OOUIWindow | null>(null);
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const OriginalMessageDialog = oo.ui.MessageDialog as unknown as new (
      config?: Record<string, unknown>,
    ) => OOUIWindow;
    const manager = new oo.ui.WindowManager();
    container.appendChild(unwrapJQuery(manager.$element));
    const dialog = new OriginalMessageDialog({ size: "small" });
    register(manager);
    manager.addWindows([dialog]);
    dialogRef.current = dialog;
  });

  return (
    <div>
      <p>
        <Button
          onClick={() =>
            dialogRef.current?.open({
              title: "Long labels (small)",
              message: "message content",
              size: "small",
              actions: [
                // flags与React侧内置按钮（framed + primary/safe）对齐；原版默认accept动作即primary
                { action: "accept", label: LONG_OK_LABEL, flags: "primary" },
                { action: "reject", label: LONG_CANCEL_LABEL, flags: "safe" },
              ],
            })
          }
        >
          Open 长文案
        </Button>
      </p>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：同一对超长文案，用于对照竖向动作布局与foot让位 */
function ReactLongLabelDialog() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <p>
        <Button onClick={() => setOpen(true)}>Open 长文案</Button>
      </p>
      <MessageDialog
        open={open}
        size="small"
        title="Long labels (small)"
        okLabel={LONG_OK_LABEL}
        cancelLabel={LONG_CANCEL_LABEL}
        onEscape={() => setOpen(false)}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        message content
      </MessageDialog>
    </div>
  );
}

/** 原版侧：open的data.actions只传accept——与OO.ui.alert相同的单按钮形态（oojs-ui.js:27247） */
function OriginalAcceptOnly() {
  const dialogRef = useRef<OOUIWindow | null>(null);
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const OriginalMessageDialog = oo.ui.MessageDialog as unknown as new (
      config?: Record<string, unknown>,
    ) => OOUIWindow;
    const manager = new oo.ui.WindowManager();
    container.appendChild(unwrapJQuery(manager.$element));
    const dialog = new OriginalMessageDialog({ size: "small" });
    register(manager);
    manager.addWindows([dialog]);
    dialogRef.current = dialog;
  });

  return (
    <div>
      <p>
        <Button
          onClick={() =>
            dialogRef.current?.open({
              title: "Accept only (alert form)",
              message: "仅一个确定按钮，与命令式alert()相同的单按钮渲染。",
              size: "small",
              // 只传accept动作（OK为缺省accept文案），即OO.ui.alert的传参方式
              actions: [{ action: "accept", label: "OK", flags: "primary" }],
            })
          }
        >
          Open 仅确定
        </Button>
      </p>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：cancelLabel=null隐藏取消按钮（alert形态的单按钮渲染） */
function ReactAcceptOnly() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <p>
        <Button onClick={() => setOpen(true)}>Open 仅确定</Button>
      </p>
      <MessageDialog
        open={open}
        size="small"
        title="Accept only (alert form)"
        cancelLabel={null}
        onEscape={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        仅一个确定按钮，与命令式alert()相同的单按钮渲染。
      </MessageDialog>
    </div>
  );
}

/** 原版侧：OO.ui.confirm / OO.ui.alert静态命令式弹窗 */
function OriginalImperative() {
  const [result, setResult] = useState("（尚未操作）");
  // 命令式API无DOM宿主，仅借hook预加载原版库并展示状态；点击时经ensureOOUI调用
  const { containerRef } = useOriginalWidgets(() => undefined);

  const runConfirm = () => {
    ensureOOUI()
      .then((oo) => {
        const ui = oo.ui as unknown as {
          confirm: (
            message: string,
            options?: Record<string, unknown>,
          ) => Promise<boolean>;
        };
        return ui.confirm("确定要执行吗？（原版OO.ui.confirm）", { title: "确认" });
      })
      .then((confirmed) => {
        setResult(`confirm结果：${confirmed}`);
      })
      .catch((error) => {
        console.error("原版confirm调用失败", error);
      });
  };

  const runAlert = () => {
    ensureOOUI()
      .then((oo) => {
        const ui = oo.ui as unknown as {
          alert: (message: string, options?: Record<string, unknown>) => Promise<void>;
        };
        return ui.alert("操作已完成。（原版OO.ui.alert）", { title: "提示" });
      })
      .then(() => {
        setResult("alert已关闭");
      })
      .catch((error) => {
        console.error("原版alert调用失败", error);
      });
  };

  // 自定义文案与尺寸
  const runConfirmCustom = () => {
    ensureOOUI()
      .then((oo) => {
        const ui = oo.ui as unknown as {
          confirm: (
            message: string,
            options?: Record<string, unknown>,
          ) => Promise<boolean>;
        };
        return ui.confirm("使用自定义按钮文案与small尺寸。", {
          title: "自定义确认",
          size: "small",
          actions: [
            { action: "accept", label: "就这么办", flags: "primary" },
            { action: "reject", label: "再想想", flags: "safe" },
          ],
        });
      })
      .then((confirmed) => {
        setResult(`自定义confirm结果：${confirmed}`);
      })
      .catch((error) => {
        console.error("原版confirm调用失败", error);
      });
  };

  const runAlertCustom = () => {
    ensureOOUI()
      .then((oo) => {
        const ui = oo.ui as unknown as {
          alert: (message: string, options?: Record<string, unknown>) => Promise<void>;
        };
        return ui.alert("使用自定义按钮文案与large尺寸。", {
          title: "自定义提示",
          size: "large",
          actions: [{ action: "accept", label: "知道了", flags: "primary" }],
        });
      })
      .then(() => {
        setResult("自定义alert已关闭");
      })
      .catch((error) => {
        console.error("原版alert调用失败", error);
      });
  };

  return (
    <div>
      {/* hook的容器占位（命令式API无控件需要挂载） */}
      <div ref={containerRef} />
      <p>
        <Button onClick={runConfirm} style={{ marginRight: "0.5em" }}>
          confirm
        </Button>
        <Button onClick={runAlert} style={{ marginRight: "0.5em" }}>
          alert
        </Button>
        <Button onClick={runConfirmCustom} style={{ marginRight: "0.5em" }}>
          confirm自定义
        </Button>
        <Button onClick={runAlertCustom}>alert自定义</Button>
      </p>
      <p>最近一次结果：{result}</p>
    </div>
  );
}

/** React侧：组件库导出的命令式confirm / alert */
function ReactImperative() {
  const [result, setResult] = useState("（尚未操作）");

  const runConfirm = async () => {
    const confirmed = await confirm("确定要执行吗？（React版confirm）", {
      title: "确认",
    });
    setResult(`confirm结果：${confirmed}`);
  };

  const runAlert = async () => {
    await alert("操作已完成。（React版alert）", { title: "提示" });
    setResult("alert已关闭");
  };

  const runConfirmCustom = async () => {
    const confirmed = await confirm("使用自定义按钮文案与small尺寸。", {
      title: "自定义确认",
      size: "small",
      okLabel: "就这么办",
      cancelLabel: "再想想",
    });
    setResult(`自定义confirm结果：${confirmed}`);
  };

  const runAlertCustom = async () => {
    await alert("使用自定义按钮文案与large尺寸。", {
      title: "自定义提示",
      size: "large",
      okLabel: "知道了",
    });
    setResult("自定义alert已关闭");
  };

  return (
    <div>
      <p>
        <Button onClick={runConfirm} style={{ marginRight: "0.5em" }}>
          confirm
        </Button>
        <Button onClick={runAlert} style={{ marginRight: "0.5em" }}>
          alert
        </Button>
        <Button onClick={runConfirmCustom} style={{ marginRight: "0.5em" }}>
          confirm自定义
        </Button>
        <Button onClick={runAlertCustom}>alert自定义</Button>
      </p>
      <p>最近一次结果：{result}</p>
    </div>
  );
}

/** 原版侧：escapable=false（ESC不可关，仅能按钮关闭） */
function OriginalNotEscapable() {
  const dialogRef = useRef<OOUIWindow | null>(null);
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const OriginalMessageDialog = oo.ui.MessageDialog as unknown as new (
      config?: Record<string, unknown>,
    ) => OOUIWindow;
    const manager = new oo.ui.WindowManager();
    container.appendChild(unwrapJQuery(manager.$element));
    const dialog = new OriginalMessageDialog({ size: "small", escapable: false });
    register(manager);
    manager.addWindows([dialog]);
    dialogRef.current = dialog;
  });

  return (
    <div>
      <p>
        <Button
          onClick={() =>
            dialogRef.current?.open({
              title: "Escapable=false",
              message: "按ESC不会关闭本弹窗，只能点确定。",
              size: "small",
            })
          }
        >
          Open 不可ESC
        </Button>
      </p>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：escapable={false}对照 */
function ReactNotEscapable() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <p>
        <Button onClick={() => setOpen(true)}>Open 不可ESC</Button>
      </p>
      <MessageDialog
        open={open}
        size="small"
        title="Escapable=false"
        escapable={false}
        onEscape={() => setOpen(false)}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        按ESC不会关闭本弹窗，只能点确定。
      </MessageDialog>
    </div>
  );
}

type OOUIWindowWithBody = OOUIWindow & { $body: { append: (el: Node) => void } };

/** 原版侧：ready/closing事件日志（Ctrl/Cmd+Enter触发primary动作经closing的action观察到） */
function OriginalShortcutDialog() {
  const dialogRef = useRef<OOUIWindow | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-4), msg]);
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const OriginalMessageDialog = oo.ui.MessageDialog as unknown as new (
      config?: Record<string, unknown>,
    ) => OOUIWindow & { on: (event: string, cb: (data?: unknown) => void) => void };
    const manager = new oo.ui.WindowManager() as unknown as {
      $element: unknown;
      addWindows: (w: unknown[]) => void;
      on: (
        event: string,
        cb: (win?: unknown, data?: { action?: string }) => void,
      ) => void;
    };
    container.appendChild(unwrapJQuery(manager.$element));
    const dialog = new OriginalMessageDialog({ size: "small" });
    register(manager);
    manager.addWindows([dialog]);
    dialog.on("ready", () => addLog("原版 ready（打开动画结束）"));
    manager.on("closing", (_win, data) => {
      if (data?.action) {
        addLog(`原版 closing action=${data.action}`);
      }
    });
    dialogRef.current = dialog;
  });

  return (
    <div>
      <p>
        <Button
          onClick={() =>
            dialogRef.current?.open({
              title: "快捷键与ready",
              message: "按 Ctrl/Cmd+Enter 触发primary动作（accept）。",
              size: "small",
            })
          }
        >
          Open 快捷键与ready
        </Button>
      </p>
      <ul>
        {log.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
      <div ref={containerRef} />
    </div>
  );
}

/**
 * React侧：onOk（Ctrl/Cmd+Enter或点确定）与onReady日志；下方为bare Dialog的
 * 自定义结构通道——head/contentClassName/bodyFitFoot/overlay/onPrimaryAction为
 * React侧组合通道，原版对应的是$head/$foot DOM区域与子类装配，无构造配置形态
 */
function ReactShortcutAndCustom() {
  const [shortcutOpen, setShortcutOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-4), msg]);

  return (
    <div>
      <p>
        <Button onClick={() => setShortcutOpen(true)}>Open 快捷键与ready</Button>
      </p>
      <MessageDialog
        open={shortcutOpen}
        size="small"
        title="快捷键与ready"
        onOk={() => {
          addLog("onOk（Ctrl/Cmd+Enter或点确定）");
          setShortcutOpen(false);
        }}
        onCancel={() => setShortcutOpen(false)}
        onReady={() => addLog("onReady（打开动画结束）")}
      >
        {/* 正文文案随各自API命名（原版accept动作/ready事件，React为onOk/onReady回调），属有意差异 */}
        <p>按 Ctrl/Cmd+Enter 触发primary动作（onOk），打开动画结束后触发onReady。</p>
      </MessageDialog>

      <p>
        <Button onClick={() => setCustomOpen(true)}>
          Open 自定义head/overlay/长foot
        </Button>
      </p>
      <Dialog
        open={customOpen}
        size="medium"
        contentClassName="dialog-compare-custom"
        head={
          <div style={{ padding: "8px 12px", borderBottom: "1px solid #c8ccd1" }}>
            自定义head区（contentClassName落在content容器上）
          </div>
        }
        bodyFitFoot
        overlay={
          showOverlay ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.85)",
              }}
            >
              覆盖层（overlay prop，覆盖整个弹窗）
            </div>
          ) : undefined
        }
        foot={
          <div style={{ padding: 8, borderTop: "1px solid #c8ccd1" }}>
            一个会换行变高的foot：bodyFitFoot开启后body底部让出foot实测高度，
            滚动区不被遮挡。本行文案加长以制造换行，观察body滚动区底界与foot顶界的关系。
            <Button onClick={() => setCustomOpen(false)}>关闭</Button>
          </div>
        }
        onEscape={() => setCustomOpen(false)}
        onPrimaryAction={() => addLog("bare Dialog onPrimaryAction（Ctrl/Cmd+Enter）")}
      >
        <p style={{ height: 120 }}>正文区（内容足够低时无滚动）。</p>
        <p>
          <Button onClick={() => setShowOverlay((v) => !v)}>
            {showOverlay ? "隐藏覆盖层" : "显示覆盖层"}
          </Button>
        </p>
      </Dialog>

      <ul>
        {log.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}

/** 原版侧：把DropdownWidget挂进window body——原版浮层缺省落在控件自身$element内（即窗口子树内） */
function OriginalDialogWithFloats() {
  const dialogRef = useRef<OOUIWindow | null>(null);
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const manager = new oo.ui.WindowManager();
    container.appendChild(unwrapJQuery(manager.$element));
    const OriginalMessageDialog = oo.ui.MessageDialog as unknown as new (
      config?: Record<string, unknown>,
    ) => OOUIWindowWithBody;
    const OriginalDropdown = oo.ui.DropdownWidget as unknown as new (
      config?: Record<string, unknown>,
    ) => { $element: unknown };
    const dialog = new OriginalMessageDialog({ size: "medium" });
    const dropdown = new OriginalDropdown({
      label: "选项",
      options: [
        { data: "a", label: "选项一" },
        { data: "b", label: "选项二" },
      ],
    });
    register(manager, dropdown);
    manager.addWindows([dialog]);
    // $body（以及$head/$foot）在setManager时才建立，故追加必须在addWindows之后
    dialog.$body.append(unwrapJQuery(dropdown.$element));
    dialogRef.current = dialog;
  });

  return (
    <div>
      <p>
        <Button
          onClick={() =>
            dialogRef.current?.open({
              title: "含浮层（medium）",
              message: "打开弹窗内的下拉菜单，观察菜单与弹窗的层叠关系。",
              size: "medium",
            })
          }
        >
          Open 含浮层
        </Button>
      </p>
      <div ref={containerRef} />
    </div>
  );
}

/**
 * React侧：同一个下拉菜单，另加一个按钮弹层——主题给 `.oo-ui-popupWidget` 的层值仅 1
 * （低于弹窗的 4），是层叠修复的重点对照物：菜单靠「同层 + DOM靠后」压住弹窗，
 * 弹层则必须靠 `useFloatPortal` 写入的同层层值
 */
function ReactDialogWithFloats() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <p>
        <Button onClick={() => setOpen(true)}>Open 含浮层</Button>
      </p>
      <Dialog
        open={open}
        size="medium"
        // foot内容非对照点（原版为默认OK/Cancel两按钮）：用自定义foot验证Dialog的foot通道
        foot={<Button onClick={() => setOpen(false)}>关闭</Button>}
      >
        {/* 弹层放在首行：浮层按「锚点就近的可滚动容器」钳高（见DEVIATIONS的MenuSelect条），
            锚点落在正文底部时可用空间会被弹窗body的滚动区吃掉，浮层只剩几像素 */}
        <p>
          <PopupButton popupContent={<p>弹层内容</p>}>按钮弹层</PopupButton>
        </p>
        <p>打开弹窗内的下拉菜单与按钮弹层，观察层叠关系与背景的隔离。</p>
        <Dropdown
          label="选项"
          options={[
            { value: "a", children: "选项一" },
            { value: "b", children: "选项二" },
          ]}
        />
      </Dialog>
    </div>
  );
}

function DialogComparePage() {
  return (
    <CompareLayout
      title="Dialog 对照"
      description={
        <>
          左侧为本地安装的原版oojs-ui，右侧为本组件库实现。
          两者行为对照点：打开/关闭动画时序、ESC关闭、Ctrl/Cmd+Enter触发primary按钮、焦点管理；
          打开弹窗后缩放窗口跨过尺寸阈值（如
          large=700px），验证宽度/高度自适应是否实时更新。
          「长动作文案」区块验证动作区横向装不下时切竖向布局，以及 body 底部让位给
          foot（首帧高度与滚动区不被遮挡）；「仅确定按钮」区块验证cancelLabel=null的
          单按钮（alert形态）渲染。
          「含浮层」区块验证弹窗内浮层的层叠（菜单与弹层都须压在弹窗之上）与内容隔离
          （打开弹窗后本页内容被 `aria-hidden` + `inert`，可用 DOM 检查器核对）。
        </>
      }
    >
      <h2>MessageDialog尺寸</h2>
      <CompareColumns original={<OriginalDialogs />}>
        <ReactDialogs />
      </CompareColumns>

      <h2>含浮层（弹窗内嵌菜单与弹层）</h2>
      <CompareColumns original={<OriginalDialogWithFloats />}>
        <ReactDialogWithFloats />
      </CompareColumns>

      <h2>长动作文案（竖向动作布局）</h2>
      <CompareColumns original={<OriginalLongLabelDialog />}>
        <ReactLongLabelDialog />
      </CompareColumns>

      <h2>仅确定按钮（alert形态）</h2>
      <CompareColumns original={<OriginalAcceptOnly />}>
        <ReactAcceptOnly />
      </CompareColumns>

      <h2>命令式confirm/alert</h2>
      <CompareColumns original={<OriginalImperative />}>
        <ReactImperative />
      </CompareColumns>

      <h2>escapable=false</h2>
      <CompareColumns original={<OriginalNotEscapable />}>
        <ReactNotEscapable />
      </CompareColumns>

      <h2>快捷键回调与自定义结构</h2>
      <CompareColumns original={<OriginalShortcutDialog />}>
        <ReactShortcutAndCustom />
      </CompareColumns>
    </CompareLayout>
  );
}

DialogComparePage.displayName = "DialogComparePage";

export default DialogComparePage;

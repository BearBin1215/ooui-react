import { useRef, useState } from "react";
import { ProcessDialog, ProgressBar, type ProcessDialogErrorProps } from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import { useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

/** 原版侧自行维护尝试计数：第奇数次点击continue模拟失败（可恢复错误），偶数次成功并关闭 */
function OriginalProcessDialog() {
  const progressRef = useRef<HTMLDivElement>(null);
  const [log, setLog] = useState<string[]>([]);
  const attemptRef = useRef(0);
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as any;

    // 进度条样本（普通widget无destroy，随容器卸载清理）
    const progressHost = progressRef.current;
    for (const progress of [0, 40, 100, false]) {
      const bar = new ui.ProgressBarWidget({ progress });
      progressHost?.appendChild(unwrapJQuery(bar.$element));
    }
    const disabledBar = new ui.ProgressBarWidget({ progress: 40, disabled: true });
    progressHost?.appendChild(unwrapJQuery(disabledBar.$element));

    const DemoDialog: any = function (this: any, config: Record<string, unknown>) {
      ui.ProcessDialog.call(this, config);
    };
    DemoDialog.prototype = Object.create(ui.ProcessDialog.prototype);
    // 修正constructor指向：OOJS实例经this.constructor.static读取子类配置
    DemoDialog.prototype.constructor = DemoDialog;
    DemoDialog.static = Object.create(ui.ProcessDialog.static);
    Object.assign(DemoDialog.static, {
      name: "demoProcessDialog",
      title: "流程弹窗（原版）",
      actions: [
        { action: "continue", label: "继续", flags: ["primary", "progressive"] },
        { action: "cancel", label: "取消", flags: "safe" },
      ],
    });
    DemoDialog.prototype.initialize = function (...args: unknown[]) {
      ui.ProcessDialog.prototype.initialize.apply(this, args);
      this.panel = new ui.PanelLayout({ padded: true, expanded: false });
      this.panel.$element.append(
        "<p>点击“继续”执行异步流程：奇数次模拟失败展示错误面板，重试后成功关闭。</p>",
      );
      this.$body.append(this.panel.$element);
    };
    DemoDialog.prototype.getBodyHeight = () => 120;
    DemoDialog.prototype.getActionProcess = function (action: string) {
      if (action === "continue") {
        // 单动作按钮pending：对continue按钮pushPending（原版PendingElement用法，
        // 见oojs-ui.js:4977的文档示例），流程结束时popPending复原，与弹窗级头部条纹并存
        const continueButton = this.getActions().get({ actions: "continue" })[0];
        continueButton.pushPending();
        attemptRef.current += 1;
        const willFail = attemptRef.current % 2 === 1;
        return new ui.Process()
          .next(
            () =>
              new Promise<void>((resolve, reject) => {
                setLog((prev) =>
                  [
                    willFail ? "执行：失败（模拟错误）" : "执行：成功并关闭",
                    ...prev,
                  ].slice(0, 5),
                );
                setTimeout(() => {
                  continueButton.popPending();
                  if (willFail) {
                    reject([new ui.Error("模拟保存失败，请重试", { recoverable: true })]);
                  } else {
                    resolve();
                  }
                }, 600);
              }),
          )
          .next(() => {
            this.close();
          });
      }
      return ui.ProcessDialog.prototype.getActionProcess.call(this, action);
    };

    const windowManager = new ui.WindowManager();
    register(windowManager);
    container.appendChild(unwrapJQuery(windowManager.$element));
    const openButton = document.createElement("button");
    openButton.textContent = "打开原版ProcessDialog";
    openButton.addEventListener("click", () => {
      const dialog = new DemoDialog({ size: "medium" });
      windowManager.addWindows([dialog]);
      windowManager.openWindow(dialog);
    });
    // 各按钮按append排列，行序与React侧的JSX行序一一对应
    container.appendChild(openButton);

    // 不可恢复错误样本：错误后触发动作被禁用（setAbilities持续到关闭），错误面板仅能经Back退出
    const FatalDialog: any = function (this: any, config: Record<string, unknown>) {
      ui.ProcessDialog.call(this, config);
    };
    FatalDialog.prototype = Object.create(ui.ProcessDialog.prototype);
    FatalDialog.prototype.constructor = FatalDialog;
    FatalDialog.static = Object.create(ui.ProcessDialog.static);
    Object.assign(FatalDialog.static, {
      name: "demoProcessDialogFatal",
      title: "不可恢复错误（原版）",
      actions: [
        { action: "continue", label: "继续", flags: ["primary", "progressive"] },
        { action: "cancel", label: "取消", flags: "safe" },
      ],
    });
    FatalDialog.prototype.initialize = function (...args: unknown[]) {
      ui.ProcessDialog.prototype.initialize.apply(this, args);
      this.panel = new ui.PanelLayout({ padded: true, expanded: false });
      this.panel.$element.append(
        "<p>点击“继续”始终失败（不可恢复）：continue按钮禁用持续到关闭。</p>",
      );
      this.$body.append(this.panel.$element);
    };
    FatalDialog.prototype.getBodyHeight = () => 120;
    FatalDialog.prototype.getActionProcess = function (action: string) {
      if (action === "continue") {
        return new ui.Process().next(
          () =>
            new Promise<void>((_resolve, reject) => {
              setTimeout(
                () =>
                  reject([new ui.Error("致命错误，动作已禁用", { recoverable: false })]),
                300,
              );
            }),
        );
      }
      return ui.ProcessDialog.prototype.getActionProcess.call(this, action);
    };

    const fatalManager = new ui.WindowManager();
    register(fatalManager);
    container.appendChild(unwrapJQuery(fatalManager.$element));
    const fatalButton = document.createElement("button");
    fatalButton.textContent = "打开原版不可恢复错误示例";
    fatalButton.addEventListener("click", () => {
      const dialog = new FatalDialog({ size: "medium" });
      fatalManager.addWindows([dialog]);
      fatalManager.openWindow(dialog);
    });
    container.appendChild(fatalButton);

    // 不可ESC样本：escapable=false，仅能经动作按钮关闭（独立manager避开同名窗口覆盖）
    const escapableManager = new ui.WindowManager();
    register(escapableManager);
    container.appendChild(unwrapJQuery(escapableManager.$element));
    const escapableButton = document.createElement("button");
    escapableButton.textContent = "打开原版不可ESC的ProcessDialog";
    escapableButton.addEventListener("click", () => {
      const dialog = new DemoDialog({ size: "medium", escapable: false });
      escapableManager.addWindows([dialog]);
      escapableManager.openWindow(dialog);
    });
    container.appendChild(escapableButton);

    // size=large样本：家族尺寸已在dialog页覆盖，本页补ProcessDialog一档，观察fitLabel
    // 标题避让与窄屏满宽（独立manager避开同名窗口覆盖）
    const largeManager = new ui.WindowManager();
    register(largeManager);
    container.appendChild(unwrapJQuery(largeManager.$element));
    const largeButton = document.createElement("button");
    largeButton.textContent = "打开原版large尺寸ProcessDialog";
    largeButton.addEventListener("click", () => {
      const dialog = new DemoDialog({ size: "large" });
      largeManager.addWindows([dialog]);
      largeManager.openWindow(dialog);
    });
    container.appendChild(largeButton);
  });

  return (
    <div>
      <div ref={containerRef} />
      <h3>进度条样本（0/40/100/不定/禁用）</h3>
      <div ref={progressRef} style={{ maxWidth: 320 }} />
      <h3>执行记录</h3>
      <ul>
        {log.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ReactProcessDialog() {
  const [open, setOpen] = useState(false);
  const [fatalOpen, setFatalOpen] = useState(false);
  const [escapableOpen, setEscapableOpen] = useState(false);
  const [largeOpen, setLargeOpen] = useState(false);
  // 单动作按钮pending态：continue按钮在流程执行期间叠加条纹动画（声明式对应原版对单个
  // 动作pushPending/popPending的PendingElement用法，与弹窗级头部条纹并存）
  const [continuePending, setContinuePending] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const attemptRef = useRef(0);

  // close为所在弹窗的关闭回调（medium/不可ESC/large弹窗各自传入）
  const handleAction = (action: string, close: () => void): Promise<void> => {
    if (action !== "continue") {
      // 对齐原版默认getActionProcess：空流程后close
      close();
      return Promise.resolve();
    }
    attemptRef.current += 1;
    const willFail = attemptRef.current % 2 === 1;
    setLog((prev) =>
      [willFail ? "执行：失败（模拟错误）" : "执行：成功并关闭", ...prev].slice(0, 5),
    );
    setContinuePending(true);
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (willFail) {
          const error: ProcessDialogErrorProps = {
            message: "模拟保存失败，请重试",
            recoverable: true,
          };
          reject([error]);
        } else {
          resolve();
        }
      }, 600);
    })
      .finally(() => setContinuePending(false))
      .then(close);
  };

  return (
    <div>
      <button onClick={() => setOpen(true)}>打开React ProcessDialog</button>
      <ProcessDialog
        open={open}
        title="流程弹窗（React）"
        size="medium"
        // pending为单动作按钮的条纹pending态（原版对单个动作pushPending的声明式对应）
        actions={[
          {
            action: "continue",
            label: "继续",
            flags: ["primary", "progressive"],
            pending: continuePending,
          },
          { action: "cancel", label: "取消", flags: "safe" },
        ]}
        onAction={(action) => handleAction(action, () => setOpen(false))}
        onEscape={() => setOpen(false)}
      >
        <div style={{ padding: "1em" }}>
          <p>点击“继续”执行异步流程：奇数次模拟失败展示错误面板，重试后成功关闭。</p>
        </div>
      </ProcessDialog>
      <button onClick={() => setFatalOpen(true)}>打开React不可恢复错误示例</button>
      <ProcessDialog
        open={fatalOpen}
        title="不可恢复错误（React）"
        size="medium"
        actions={[
          { action: "continue", label: "继续", flags: ["primary", "progressive"] },
          { action: "cancel", label: "取消", flags: "safe" },
        ]}
        onAction={(action) => {
          if (action !== "continue") {
            setFatalOpen(false);
            return Promise.resolve();
          }
          // 始终失败：continue按钮禁用持续到关闭（对齐原版setAbilities）
          return new Promise<void>((_resolve, reject) => {
            setTimeout(
              () => reject([{ message: "致命错误，动作已禁用", recoverable: false }]),
              300,
            );
          });
        }}
        onEscape={() => setFatalOpen(false)}
      >
        <div style={{ padding: "1em" }}>
          <p>点击“继续”始终失败（不可恢复）：continue按钮禁用持续到关闭。</p>
        </div>
      </ProcessDialog>
      <button onClick={() => setEscapableOpen(true)}>
        打开React不可ESC的ProcessDialog
      </button>
      {/* 不可ESC样本：escapable=false，按ESC不会关闭，仅能经动作按钮关闭；内容与流程与medium弹窗同款 */}
      <ProcessDialog
        open={escapableOpen}
        title="流程弹窗（React）"
        size="medium"
        escapable={false}
        actions={[
          {
            action: "continue",
            label: "继续",
            flags: ["primary", "progressive"],
            pending: continuePending,
          },
          { action: "cancel", label: "取消", flags: "safe" },
        ]}
        onAction={(action) => handleAction(action, () => setEscapableOpen(false))}
        onEscape={() => setEscapableOpen(false)}
      >
        <div style={{ padding: "1em" }}>
          <p>点击“继续”执行异步流程：奇数次模拟失败展示错误面板，重试后成功关闭。</p>
        </div>
      </ProcessDialog>
      {/* size=large样本：家族尺寸已在dialog页覆盖，本页补ProcessDialog一档，
          观察fitLabel标题避让与窄屏满宽（动作/流程与medium弹窗共用同一套状态） */}
      <button onClick={() => setLargeOpen(true)}>打开React large尺寸ProcessDialog</button>
      <ProcessDialog
        open={largeOpen}
        title="流程弹窗（React）"
        size="large"
        actions={[
          {
            action: "continue",
            label: "继续",
            flags: ["primary", "progressive"],
            pending: continuePending,
          },
          { action: "cancel", label: "取消", flags: "safe" },
        ]}
        onAction={(action) => handleAction(action, () => setLargeOpen(false))}
        onEscape={() => setLargeOpen(false)}
      >
        <div style={{ padding: "1em" }}>
          <p>点击“继续”执行异步流程：奇数次模拟失败展示错误面板，重试后成功关闭。</p>
        </div>
      </ProcessDialog>
      <h3>进度条样本（0/40/100/不定/禁用）</h3>
      <div style={{ maxWidth: 320 }}>
        <ProgressBar progress={0} />
        <ProgressBar progress={40} />
        <ProgressBar progress={100} />
        <ProgressBar />
        <ProgressBar progress={40} disabled />
      </div>
      <h3>执行记录</h3>
      <ul>
        {log.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** 原版侧：mode/modes多步向导（含back图标动作、other动作区、disabled与title动作） */
function OriginalWizard() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as any;
    const WizardDialog: any = function (this: any, config: Record<string, unknown>) {
      ui.ProcessDialog.call(this, config);
    };
    WizardDialog.prototype = Object.create(ui.ProcessDialog.prototype);
    WizardDialog.prototype.constructor = WizardDialog;
    WizardDialog.static = Object.create(ui.ProcessDialog.static);
    Object.assign(WizardDialog.static, {
      name: "demoProcessWizard",
      title: "多步向导（原版）",
      actions: [
        { action: "back", label: "返回", flags: "back", modes: ["preview"] },
        { action: "cancel", label: "取消", flags: "safe", modes: ["edit", "preview"] },
        {
          action: "docs",
          label: "帮助",
          title: "查看帮助文档",
          modes: ["edit", "preview"],
        },
        {
          action: "next",
          label: "下一步",
          flags: ["primary", "progressive"],
          modes: ["edit"],
        },
        {
          action: "save",
          label: "保存",
          flags: ["primary", "progressive"],
          modes: ["preview"],
        },
        { action: "edit", label: "返回编辑", flags: "safe", modes: ["preview"] },
        { action: "locked", label: "不可用", disabled: true, modes: ["edit"] },
      ],
    });
    WizardDialog.prototype.initialize = function (...args: unknown[]) {
      ui.ProcessDialog.prototype.initialize.apply(this, args);
      this.panel = new ui.PanelLayout({ padded: true, expanded: false });
      this.panel.$element.append(
        "<p>“下一步”切到preview模式（动作随modes显隐），back图标动作返回edit；“帮助”落other动作区。</p>",
      );
      this.$body.append(this.panel.$element);
    };
    WizardDialog.prototype.getBodyHeight = () => 110;
    WizardDialog.prototype.getActionProcess = function (action: string) {
      if (action === "next") {
        return new ui.Process().next(() => {
          this.actions.setMode("preview");
        });
      }
      if (action === "back") {
        return new ui.Process().next(() => {
          this.actions.setMode("edit");
        });
      }
      if (action === "save") {
        return new ui.Process().next(() => {
          this.close();
        });
      }
      return ui.ProcessDialog.prototype.getActionProcess.call(this, action);
    };

    const manager = new ui.WindowManager();
    register(manager);
    container.appendChild(unwrapJQuery(manager.$element));
    const openButton = document.createElement("button");
    openButton.textContent = "打开原版多步向导";
    openButton.addEventListener("click", () => {
      const dialog = new WizardDialog({ size: "medium" });
      manager.addWindows([dialog]);
      manager.openWindow(dialog);
    });
    container.prepend(openButton);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactWizard() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <div>
      <button onClick={() => setOpen(true)}>打开React多步向导</button>
      <ProcessDialog
        open={open}
        title="多步向导（React）"
        size="medium"
        mode={mode}
        actions={[
          { action: "back", label: "返回", flags: "back", modes: ["preview"] },
          { action: "cancel", label: "取消", flags: "safe", modes: ["edit", "preview"] },
          {
            action: "docs",
            label: "帮助",
            title: "查看帮助文档",
            modes: ["edit", "preview"],
          },
          {
            action: "next",
            label: "下一步",
            flags: ["primary", "progressive"],
            modes: ["edit"],
          },
          {
            action: "save",
            label: "保存",
            flags: ["primary", "progressive"],
            modes: ["preview"],
          },
          { action: "edit", label: "返回编辑", flags: "safe", modes: ["preview"] },
          { action: "locked", label: "不可用", disabled: true, modes: ["edit"] },
        ]}
        onAction={(action) => {
          if (action === "next") {
            setMode("preview");
            return Promise.resolve();
          }
          if (action === "back") {
            setMode("edit");
            return Promise.resolve();
          }
          if (action === "save") {
            setOpen(false);
            return Promise.resolve();
          }
          return Promise.resolve();
        }}
        onEscape={() => setOpen(false)}
      >
        <div style={{ padding: "1em" }}>
          <p>
            “下一步”切到preview模式（动作随modes显隐），back图标动作返回edit；“帮助”落other动作区。
          </p>
        </div>
      </ProcessDialog>
    </div>
  );
}

/** 原版侧：warning警告错误（重试按钮显示Continue） */
function OriginalWarning() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as any;
    const WarningDialog: any = function (this: any, config: Record<string, unknown>) {
      ui.ProcessDialog.call(this, config);
    };
    WarningDialog.prototype = Object.create(ui.ProcessDialog.prototype);
    WarningDialog.prototype.constructor = WarningDialog;
    WarningDialog.static = Object.create(ui.ProcessDialog.static);
    Object.assign(WarningDialog.static, {
      name: "demoProcessWarning",
      title: "警告错误（原版）",
      actions: [
        { action: "continue", label: "继续", flags: ["primary", "progressive"] },
        { action: "cancel", label: "取消", flags: "safe" },
      ],
    });
    WarningDialog.prototype.initialize = function (...args: unknown[]) {
      ui.ProcessDialog.prototype.initialize.apply(this, args);
      this.panel = new ui.PanelLayout({ padded: true, expanded: false });
      this.panel.$element.append(
        "<p>点击“继续”始终弹出warning错误：重试按钮显示Continue，动作不禁用。</p>",
      );
      this.$body.append(this.panel.$element);
    };
    WarningDialog.prototype.getBodyHeight = () => 110;
    WarningDialog.prototype.getActionProcess = function (action: string) {
      if (action === "continue") {
        return new ui.Process().next(
          () =>
            new Promise<void>((_resolve, reject) => {
              setTimeout(
                () => reject([new ui.Error("某些设置未经确认", { warning: true })]),
                300,
              );
            }),
        );
      }
      return ui.ProcessDialog.prototype.getActionProcess.call(this, action);
    };

    const manager = new ui.WindowManager();
    register(manager);
    container.appendChild(unwrapJQuery(manager.$element));
    const openButton = document.createElement("button");
    openButton.textContent = "打开原版警告错误示例";
    openButton.addEventListener("click", () => {
      const dialog = new WarningDialog({ size: "medium" });
      manager.addWindows([dialog]);
      manager.openWindow(dialog);
    });
    container.prepend(openButton);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactWarning() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)}>打开React警告错误示例</button>
      <ProcessDialog
        open={open}
        title="警告错误（React）"
        size="medium"
        actions={[
          { action: "continue", label: "继续", flags: ["primary", "progressive"] },
          { action: "cancel", label: "取消", flags: "safe" },
        ]}
        onAction={(action) => {
          if (action !== "continue") {
            setOpen(false);
            return Promise.resolve();
          }
          // warning错误：重试按钮显示Continue，动作不禁用
          return new Promise<void>((_resolve, reject) => {
            setTimeout(
              () => reject([{ message: "某些设置未经确认", warning: true }]),
              300,
            );
          });
        }}
        onEscape={() => setOpen(false)}
      >
        <div style={{ padding: "1em" }}>
          <p>点击“继续”始终弹出warning错误：重试按钮显示Continue，动作不禁用。</p>
        </div>
      </ProcessDialog>
    </div>
  );
}

function ProcessDialogComparePage() {
  return (
    <CompareLayout
      title="ProcessDialog/ProgressBar 对照"
      description={
        <>
          对照点：头部safe（左）/标题（中）/primary（右）布局、ESC触发safe动作、Ctrl/Cmd+Enter触发primary、
          动作执行期间头部pending条纹与continue按钮的单动作pending条纹
          （原版经PendingElement的pushPending/popPending，React为actions项的pending
          prop）、
          失败错误面板（挂载于content、绝对定位覆盖整个弹窗；Dismiss/重试按钮、警告文案Continue）、
          不可恢复错误时触发动作禁用持续到关闭、进度条0/40/100/不定/禁用进度形态、
          size=large档位（fitLabel标题避让与窄屏满宽）。
          「多步向导」区块验证mode/modes动作显隐、back/close图标动作、无safe/primary标志的
          other动作区（含title提示与静态disabled）；「警告错误」区块验证warning错误的
          Continue重试（不禁用动作）。注意初始态差异：原版在首次setMode前不按modes过滤
          （混显全部动作），本工程声明式mode从一开始即过滤。
        </>
      }
    >
      <CompareColumns original={<OriginalProcessDialog />}>
        <ReactProcessDialog />
      </CompareColumns>

      <h2>mode/modes多步向导与其他动作区</h2>
      <CompareColumns original={<OriginalWizard />}>
        <ReactWizard />
      </CompareColumns>

      <h2>warning警告错误</h2>
      <CompareColumns original={<OriginalWarning />}>
        <ReactWarning />
      </CompareColumns>
    </CompareLayout>
  );
}

ProcessDialogComparePage.displayName = "ProcessDialogComparePage";

export default ProcessDialogComparePage;

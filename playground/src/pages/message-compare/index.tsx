import { useState } from "react";
import { Message, type MessageType } from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import { useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

const messageItems: Array<[string, Record<string, unknown>]> = [
  ["block notice", { label: "Notice: 这是一条说明信息" }],
  ["block error", { label: "Error: 这是一条错误信息", type: "error" }],
  ["block warning", { label: "Warning: 这是一条警告信息", type: "warning" }],
  ["block success", { label: "Success: 这是一条成功信息", type: "success" }],
  [
    "block 非法type=bogus（回退notice/infoFilled）",
    { label: "Bogus: 非法type回退notice", type: "bogus" },
  ],
  ["inline notice", { label: "Notice: 内联说明", inline: true }],
  ["inline error", { label: "Error: 内联错误", type: "error", inline: true }],
  [
    "block close",
    {
      label: "带关闭按钮的消息（点击关闭后由调用方隐藏）",
      type: "warning",
      showClose: true,
    },
  ],
  ["custom icon", { label: "自定义图标（覆盖类型默认图标）", icon: "help" }],
  [
    "inline close（inline不渲染关闭按钮）",
    {
      label: "内联错误+showClose（应无关闭按钮）",
      type: "error",
      inline: true,
      showClose: true,
    },
  ],
  [
    "error close（错误+关闭按钮组合）",
    { label: "错误消息带关闭按钮", type: "error", showClose: true },
  ],
  ["title提示", { label: "悬浮查看title", title: "消息title" }],
  [
    "invisibleLabel（正文视觉隐藏+title兜底）",
    { label: "视觉隐藏的正文", invisibleLabel: true, title: "隐藏正文消息" },
  ],
  ["disabled（禁用态压暗）", { label: "禁用态消息", disabled: true }],
];

function OriginalMessages() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const MessageWidget = oo.ui.MessageWidget as unknown as new (
      config?: Record<string, unknown>,
    ) => { $element: unknown };
    for (const [, config] of messageItems) {
      const widget = new MessageWidget(config);
      register(widget);
      container.appendChild(unwrapJQuery(widget.$element));
    }
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactMessages({ addLog }: { addLog?: (msg: string) => void }) {
  const [closeVisible, setCloseVisible] = useState(true);

  return (
    <div>
      <Message>Notice: 这是一条说明信息</Message>
      <Message type="error">Error: 这是一条错误信息</Message>
      <Message type="warning">Warning: 这是一条警告信息</Message>
      <Message type="success">Success: 这是一条成功信息</Message>
      {/* type传非法值"bogus"：props类型仅收合法值联合，经断言传入以演示运行时回退
          （type回退notice、图标回退infoFilled） */}
      <Message type={"bogus" as unknown as MessageType}>
        Bogus: 非法type回退notice
      </Message>
      <Message inline>Notice: 内联说明</Message>
      <Message inline type="error">
        Error: 内联错误
      </Message>
      {closeVisible ? (
        <Message type="warning" showClose onClose={() => setCloseVisible(false)}>
          带关闭按钮的消息（点击关闭后由调用方隐藏）
        </Message>
      ) : (
        <button onClick={() => setCloseVisible(true)}>恢复被关闭的消息</button>
      )}
      <Message icon="help">自定义图标（覆盖类型默认图标）</Message>
      <Message inline type="error" showClose>
        内联错误+showClose（应无关闭按钮）
      </Message>
      {/*
        差异提示（见 DEVIATIONS「舍弃」的 Message 条）：原版点击关闭按钮即内置 toggle(false) 自隐，
        本工程只回调 onClose、不持显隐状态——调用方**必须**在 onClose 里把消息卸载/隐藏，
        否则点击后消息仍在（表现为「点不掉的消息」）。
      */}
      <Message
        type="error"
        showClose
        onClose={() =>
          addLog?.(
            "error close 点击：本工程不自隐，漏接 onClose 的消息将点不掉（见 DEVIATIONS 舍弃节）",
          )
        }
      >
        错误消息带关闭按钮
      </Message>
      <Message title="消息title">悬浮查看title</Message>
      <Message invisibleLabel title="隐藏正文消息">
        视觉隐藏的正文
      </Message>
      <Message disabled>禁用态消息</Message>
    </div>
  );
}

function MessageComparePage() {
  const [log, setLog] = useState<string[]>([]);
  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);

  return (
    <CompareLayout
      title="Message 对照"
      description={
        <>
          对照点：四种type的图标与配色（notice/error/warning/success，非法type回退
          notice与infoFilled图标）、block与inline两种形态、
          自定义图标覆盖、showClose关闭按钮（inline形态无关闭按钮的抑制、error+close组合）、
          title落根元素、invisibleLabel（正文视觉隐藏但保留可访问文本并由title兜底）、
          error的role=alert与其余类型的aria-live。
          <br />
          <strong>差异（迁移陷阱）</strong>：原版点击关闭按钮即内置自隐；本工程只回调
          onClose、
          不持显隐状态，调用方须在回调里把消息卸载/隐藏，否则点击后消息仍在（即「点不掉的消息」）。
        </>
      }
    >
      <CompareColumns original={<OriginalMessages />}>
        <ReactMessages addLog={addLog} />
      </CompareColumns>

      <h2>事件日志（React侧）</h2>
      <ul>
        {log.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </CompareLayout>
  );
}

MessageComparePage.displayName = "MessageComparePage";

export default MessageComparePage;

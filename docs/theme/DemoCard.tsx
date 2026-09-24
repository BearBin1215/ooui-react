import { Children, isValidElement, useState, type ReactNode } from "react";
import "./DemoCard.css";

export interface DemoCardProps {
  /**
   * Live demo rendered in the card stage.
   *
   * 卡片内实际运行的示例元素。
   */
  demo: ReactNode;
  /**
   * Tab names for the code blocks passed as children, in the same order.
   *
   * 代码区 tabs 的文件名，顺序与 children 一致。
   */
  names: string[];
  children: ReactNode;
}

/**
 * Demo card for the docs site: renders a runnable demo on top; the button at
 * the top-right corner toggles a tabbed code area below, whose tabs are the
 * highlighted code blocks passed as children (usually via `file=` code blocks
 * so the sources stay real, typechecked files).
 *
 * 文档站示例卡片：上方渲染可运行的 demo，右上角按钮展开/收起下方的代码区；
 * 代码区以 tabs 展示 children 传入的多个代码块（一般用 `file=` 代码块引用
 * 真实源文件，构建期高亮且随文件热更新）。
 */
function DemoCard({ demo, names, children }: DemoCardProps) {
  const [showCode, setShowCode] = useState(false);
  const [active, setActive] = useState(0);
  // children 是 mdx 里的若干代码块，过滤掉空白文本节点后按下标对应 names
  const blocks = Children.toArray(children).filter(isValidElement);

  // llms（SSG_MD）输出只需要代码文本：demo 是组件渲染，markdown 里没有意义，
  // 且示例含 Dropdown 等首帧访问 document 的组件，会在 SSG-MD 渲染期崩溃
  if (import.meta.env.SSG_MD) {
    return <>{children}</>;
  }

  return (
    <div className={`doc-demo-card${showCode ? " doc-demo-card--expanded" : ""}`}>
      <div className="doc-demo-card__stage">
        {demo}
        <button
          type="button"
          className={`doc-demo-card__toggle${showCode ? " doc-demo-card__toggle--active" : ""}`}
          aria-label={showCode ? "Collapse Code" : "Expand Code"}
          onClick={() => setShowCode(!showCode)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </button>
      </div>
      {showCode && (
        <div className="doc-demo-card__code">
          <div className="doc-demo-card__tabs" role="tablist">
            {names.map((name, i) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={i === active}
                className={`doc-demo-card__tab${i === active ? " doc-demo-card__tab--active" : ""}`}
                onClick={() => setActive(i)}
              >
                {name}
              </button>
            ))}
          </div>
          {blocks[active]}
        </div>
      )}
    </div>
  );
}

export default DemoCard;

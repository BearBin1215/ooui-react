import { useEffect, useRef, useState } from "react";
import { createOOUIWidgets, ensureOOUI, unwrapJQuery, type OOUI } from "./ooui";

/** 登记原版控件的回调，登记的控件在容器卸载时统一destroy */
export type RegisterWidget = (...items: object[]) => void;

/** build回调：oo为ensureOOUI返回的原版命名空间（oo.ui为OO.ui），container为待填充容器 */
export type OriginalBuilder = (
  oo: OOUI,
  container: HTMLElement,
  register: RegisterWidget,
) => void;

/**
 * 生成“名称+控件”行输出器：在容器内输出一行原版控件（与React侧的div行结构一致，
 * 保证两侧逐行对照），并返回创建出的控件实例供页面绑事件。
 */
export function createRowAppender(container: HTMLElement, register: RegisterWidget) {
  return <T extends { $element: unknown }>(
    Widget: new (config?: Record<string, unknown>) => T,
    name: string,
    config: Record<string, unknown>,
  ): T => {
    const widget = new Widget(config);
    register(widget);
    // 行容器用div：p的内容模型为phrasing content，块级widget入p属不合规结构，
    // 且p的UA上下margin会使左右两侧行距不一致（React侧行容器同为div、无margin）
    const row = document.createElement("div");
    row.textContent = name;
    row.appendChild(unwrapJQuery(widget.$element));
    container.appendChild(row);
    return widget;
  };
}

/**
 * 原版控件容器：ensureOOUI就绪后执行build创建原版控件，组件卸载时统一destroy登记的
 * 原版控件（Toolbar/ToolGroup/WindowManager等有destroy）。build仅在挂载后执行一次，
 * 无需用useCallback保持引用稳定。
 * 需要向容器追加内容的页面必须把返回的containerRef渲染出来；不渲染容器的页面
 * （如命令式API、自带多个宿主ref的页面）不得在build内使用container参数。
 */
export function useOriginalWidgets(build: OriginalBuilder) {
  const containerRef = useRef<HTMLDivElement>(null);
  // build以ref持有：effect仅挂载时跑一次，用最新闭包执行即可，不作为effect依赖
  const buildRef = useRef(build);
  buildRef.current = build;
  const [status, setStatus] = useState("未初始化");

  useEffect(() => {
    let cancelled = false;
    const host = createOOUIWidgets();
    ensureOOUI()
      .then((oo) => {
        if (cancelled) {
          return;
        }
        buildRef.current(oo, containerRef.current!, host.add);
        setStatus("原版已就绪");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("原版加载失败");
        }
      });
    return () => {
      cancelled = true;
      host.destroyAll();
    };
  }, []);

  return { containerRef, status };
}

/**
 * 在原版控件所在行尾追加实时值读出span（样式与React侧的cmp-value一致），返回写入函数。
 * 依赖createRowAppender的行结构：控件元素的父节点即行容器，故控件须已经row()输出。
 * 用于两侧都展示逐行实时值的对照页，保证左右行高一致、逐行可对齐。
 */
export function appendValueOutput(widget: { $element: unknown }): (text: string) => void {
  const element = unwrapJQuery(widget.$element);
  const row = element.parentElement;
  if (!row) {
    throw new Error(
      "appendValueOutput：控件尚未挂载到行容器，请先经createRowAppender输出",
    );
  }
  const output = document.createElement("span");
  output.className = "cmp-value";
  row.appendChild(output);
  return (text) => {
    output.textContent = text;
  };
}

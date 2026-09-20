/**
 * 共享hook的导出面，按能力域组织：
 * refs         最新值ref/多ref合并/无冒号id
 * field        FieldLayout标签联动通道（A原生htmlFor / B simulateLabelClick）
 * value        受控/非受控值态与布局激活选择
 * dismiss      浮层外点/Escape关闭
 * press        按压态、选项DOM双向索引与拖拽选择
 * input        输入类的label让位内边距与软校验标记
 * menu         菜单弹层高亮与直选型选项组键盘改选
 * select       选择族共用原语（可选值派生/选项id）与直选型容器脚手架
 * prefixSearch 前缀跳转的字符缓冲与超时计时
 * anchored     锚定浮层定位/对齐侧选择与面板自动聚焦
 * portal       浮层的portal容器解析（宿主配置 + 弹窗子树宿主）
 */
export * from "./refs";
export * from "./field";
export * from "./value";
export * from "./dismiss";
export * from "./press";
export * from "./input";
export * from "./menu";
export * from "./select";
export * from "./prefixSearch";
export * from "./anchored";
export * from "./portal";

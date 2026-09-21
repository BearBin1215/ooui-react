/**
 * 工具组测试的领域级共享工具（仅测试使用，不进构建产物）。
 *
 * 与 barrel `src/testing/index.ts` 的分工：barrel 只放通用原语（取根/事件/快照），
 * 工具组特有的语义（弹出面板与其内工具的定位）按域落此，供 Menu/List 工具组测试引用；
 * 出现第三个工具组测试再考虑进一步泛化。
 */

/**
 * 弹出工具组（MenuToolGroup/ListToolGroup）的工具面板。
 *
 * 面板经 `createPortal` 挂到 portal 容器（默认回退 `document.body`），**不在渲染容器子树内**，
 * 故只能全局查询、不能经 `getRoot(screen)` 取得（见 barrel `getRoot` 的适用面说明）。
 */
export const getPanel = (): HTMLElement =>
  document.querySelector<HTMLElement>(".oo-ui-popupToolGroup-tools")!;

/**
 * 面板内按 `data-tool-name` 定位工具链接；不存在时返回 `null`（供收起/折叠类断言）。
 */
export const getTool = (name: string): HTMLElement | null =>
  getPanel().querySelector<HTMLElement>(`[data-tool-name="${name}"]`);

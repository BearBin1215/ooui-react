/**
 * 浏览器测试环境全局设置（经 vitest.config.ts 的 test.setupFiles 注入，与测试同运行于 iframe 内）。
 *
 * 测试组件多渲染在页面左上角，而无头浏览器的光标停在起始位置（iframe坐标约(24,13)）——
 * 布局出现时浏览器会向光标下的元素补发真实的pointerover/mouseover，触发Select系的
 * 悬停高亮（对齐原版的正确行为），与键盘导航类断言产生偶发竞争（探针实测：失败时
 * 按键前高亮已被悬停置于首项）。每条测试开始前经userEvent把真实光标停靠到视口右下角
 * 的固定小块上，悬停事件从此只落在该块（无任何行为），组件不再被光标波及。
 *
 * 注意：测试里的点击有两种——dispatchEvent合成事件（不经命中测试，与光标无关）与
 * locator.click真实点击（会移动光标，靠本hook在下条测试前重新停靠）。若新增测试在
 * 真实点击之后断言悬停敏感状态，需将停靠提前到该测试的点击之后。
 */
import { beforeEach } from "vitest";
import { page, userEvent } from "vitest/browser";
import { cleanup } from "vitest-browser-react";

/** 光标停车位：钉在视口角落的顶层小块，仅承接停靠后的悬停事件，无任何行为 */
const parking = document.createElement("div");
parking.setAttribute("data-testid", "vitest-cursor-parking");
parking.style.cssText =
  "position:fixed;right:0;bottom:0;width:8px;height:8px;z-index:2147483647;";
document.body.appendChild(parking);

beforeEach(async () => {
  // 先卸载上一轮的挂载再停靠，不能省：残留的未关闭弹窗会给停车位带上 inert
  // （内容隔离标记管理器根路径以外的 body 子节点，见 src/dialogs/isolation.ts），
  // 停靠 hover 命中不到，整条用例以 30s 超时失败。这里不依赖 vitest-browser-react
  // 自带清理的时序——它的清理钩子登记在自身模块求值处，先后取决于本文件是否 import 它
  // （实测去掉该 import 后它排到本 hook 之后，弹窗系用例大面积超时），故显式调用（幂等）
  await cleanup();
  await userEvent.hover(page.getByTestId("vitest-cursor-parking"));
});

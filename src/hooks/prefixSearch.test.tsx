import type { MutableRefObject } from "react";
import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { tick } from "../testing";
import { KEY_PRESS_BUFFER_MS } from "../utils";
import { usePrefixSearchBuffer } from "./prefixSearch";

type BufferApi = ReturnType<typeof usePrefixSearchBuffer>;

/** 只暴露hook实例，具体推进入参由各用例给出 */
function Harness({ apiRef }: { apiRef: MutableRefObject<BufferApi | null> }) {
  apiRef.current = usePrefixSearchBuffer();
  return null;
}

const VALUES = ["apple", "avocado", "banana"];
const text = (value: string) => value;

const mount = async () => {
  const apiRef: MutableRefObject<BufferApi | null> = { current: null };
  const screen = await render(<Harness apiRef={apiRef} />);
  return {
    screen,
    apiRef,
    get api() {
      return apiRef.current!;
    },
  };
};

/**
 * prefixSearch.ts的usePrefixSearchBuffer：按键前缀跳转的缓冲生命周期
 * （匹配算法advancePrefixSearch的契约见utils.test.ts）。核心契约：逐字符累积并经同一
 * 算法求命中值、退格裁剪缓冲并把"无缓冲"如实报给调用方、导航键/通道停用经clear重置、
 * 缓冲空闲KEY_PRESS_BUFFER_MS后自动清空而字符输入续期、返回对象引用跨渲染稳定。
 */
it("逐字符累积推进：返回命中值，缓冲活跃期由hasBuffer如实上报", async () => {
  const { api } = await mount();
  expect(api.hasBuffer()).toBe(false);
  expect(api.advance("a", VALUES, text, undefined)).toBe("apple");
  expect(api.hasBuffer()).toBe(true);
  // 缓冲已累积为"ap"：仍在apple上前缀匹配
  expect(api.advance("p", VALUES, text, "apple")).toBe("apple");
  // 清空后重新搜索
  api.clear();
  expect(api.hasBuffer()).toBe(false);
});

it("backspace裁剪缓冲，无缓冲时返回false（调用方据此放行默认行为）", async () => {
  const { api } = await mount();
  expect(api.backspace()).toBe(false);
  api.advance("a", VALUES, text, undefined);
  api.advance("p", VALUES, text, "apple");
  expect(api.backspace()).toBe(true);
  expect(api.backspace()).toBe(true);
  expect(api.backspace()).toBe(false);
  expect(api.hasBuffer()).toBe(false);
});

it("返回对象引用跨渲染稳定（消费方的effect以本对象为依赖）", async () => {
  const apiRef: MutableRefObject<BufferApi | null> = { current: null };
  const screen = await render(<Harness apiRef={apiRef} />);
  const established = apiRef.current!;
  await screen.rerender(<Harness apiRef={apiRef} />);
  expect(apiRef.current).toBe(established);
  expect(apiRef.current?.advance).toBe(established.advance);
});

it("缓冲空闲KEY_PRESS_BUFFER_MS后自动清空，字符输入续期计时器", async () => {
  const { api } = await mount();
  api.advance("a", VALUES, text, undefined);
  await tick(1000);
  // 续期：距首次推进已超过KEY_PRESS_BUFFER_MS时不因旧计时器清空
  api.advance("p", VALUES, text, "apple");
  await tick(KEY_PRESS_BUFFER_MS - 600);
  expect(api.hasBuffer()).toBe(true);
  // 末段改条件等待：固定sleep相对1500ms超时只剩200ms余量，CI抖动即假红
  await expect.poll(() => api.hasBuffer(), { timeout: 2000 }).toBe(false);
});

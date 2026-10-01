import { describe, expect, it, vi } from "vitest";
import { useEffect, useRef, useState } from "react";
import { render } from "vitest-browser-react";
import { TextInput } from ".";
import { getRoot, snapshotHTML, tick, typeValue } from "../../testing";

/**
 * TextInput（对齐原版OO.ui.TextInputWidget）的浏览器渲染契约：
 * 双层结构与type类、值管线（受控/非受控）、软校验、required指示器缺省、
 * inputProps通道与rest落点、标签让位类。
 */
it("常规：根div输出input/textInput类链与type类，input承载输入", async () => {
  const screen = await render(<TextInput defaultValue="甲" />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-inputWidget");
  expect(root).toHaveClass("oo-ui-textInputWidget");
  expect(root).toHaveClass("oo-ui-textInputWidget-type-text");
  const input = root.querySelector("input")!;
  expect(input.value).toBe("甲");
  expect(input).toHaveAttribute("type", "text");
});

it("type白名单：合法值入type类，非法值回退text", async () => {
  const screen = await render(<TextInput type="search" />);
  expect(getRoot(screen)).toHaveClass("oo-ui-textInputWidget-type-search");
  const screen2 = await render(<TextInput type="tel" />);
  expect(getRoot(screen2)).toHaveClass("oo-ui-textInputWidget-type-text");
});

it("非受控：输入更新内部值并按值优先回调onChange", async () => {
  const onChange = vi.fn<(event: unknown) => void>();
  const screen = await render(<TextInput defaultValue="" onChange={onChange} />);
  const input = screen.container.querySelector<HTMLInputElement>("input")!;
  await typeValue(input, "新值");
  expect(onChange).toHaveBeenCalledWith("新值", expect.anything());
});

it("受控：显示值随props更新", async () => {
  const screen = await render(<TextInput value="a" />);
  const input = screen.container.querySelector<HTMLInputElement>("input")!;
  expect(input.value).toBe("a");
  await screen.rerender(<TextInput value="b" />);
  expect(input.value).toBe("b");
});

it("disabled：input禁用+tabIndex=-1，根输出禁用类", async () => {
  const screen = await render(<TextInput disabled />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  const input = root.querySelector("input")!;
  expect(input).toHaveAttribute("disabled");
  expect(input).toHaveAttribute("tabIndex", "-1");
  expect(input).toHaveAttribute("aria-disabled", "true");
});

it("软校验：失焦校验非法时input输出aria-invalid、根输出invalid标志类；聚焦清除", async () => {
  const screen = await render(<TextInput defaultValue="abc" validate={/^\d+$/} />);
  const root = getRoot(screen);
  const input = root.querySelector("input")!;
  expect(root).not.toHaveClass("oo-ui-flaggedElement-invalid");
  input.focus();
  input.blur();
  await tick();
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(root).toHaveClass("oo-ui-flaggedElement-invalid");
  // 聚焦即清除（对齐原版setValidityFlag在focus时的清除）
  input.focus();
  await tick();
  expect(root).not.toHaveClass("oo-ui-flaggedElement-invalid");
  expect(input).not.toHaveAttribute("aria-invalid");
});

it("required且未显式给indicator时输出required指示器", async () => {
  const screen = await render(<TextInput required />);
  const indicator = getRoot(screen).querySelector(".oo-ui-indicatorElement-indicator")!;
  expect(indicator).toHaveClass("oo-ui-indicator-required");
});

it("inputProps通道：非事件属性写进input（rest不冲突），事件串联在组件逻辑之后", async () => {
  const userOnChange = vi.fn<(event: unknown) => void>();
  const screen = await render(
    <TextInput
      defaultValue=""
      inputProps={{ autoComplete: "off", spellCheck: false, onChange: userOnChange }}
      id="root-id"
    />,
  );
  const root = getRoot(screen);
  const input = root.querySelector("input")!;
  // rest（id）落根div而非input
  expect(root).toHaveAttribute("id", "root-id");
  expect(input).toHaveAttribute("autoComplete", "off");
  expect(input).toHaveAttribute("spellCheck", "false");
  await typeValue(input, "x");
  // 调用方onChange仍被串联调用（值管线不被截断）
  expect(userOnChange).toHaveBeenCalled();
});

it("label渲染为标签元素，根输出labelPosition类", async () => {
  const screen = await render(<TextInput label="字段名" labelPosition="before" />);
  const root = getRoot(screen);
  expect(root.querySelector(".oo-ui-labelElement-label")?.textContent).toBe("字段名");
  expect(root).toHaveClass("oo-ui-textInputWidget-labelPosition-before");
});

it("inputRef指向内部input，组件ref指向根div", async () => {
  function Host() {
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [result, setResult] = useState("");
    useEffect(() => {
      const input = inputRef.current;
      const root = rootRef.current;
      // ref挂载后探测：inputRef是input元素且包含于组件ref指向的根div内
      setResult(
        root && input && input.tagName === "INPUT" && root.contains(input) ? "ok" : "bad",
      );
    }, []);
    return (
      <>
        <TextInput ref={rootRef} inputRef={inputRef} />
        <span data-testid="probe" data-result={result} />
      </>
    );
  }
  await render(<Host />);
  await tick();
  const probe = document.querySelector("[data-testid=probe]")!;
  expect(probe.getAttribute("data-result")).toBe("ok");
});

describe("HTML快照", () => {
  // 快照锁结构：差异须有意识地更新，勿靠 -u 反推（靶心为原版DOM，见comparison-guide「渲染契约的靶心」）
  it("默认文本框", async () => {
    const screen = await render(<TextInput defaultValue="甲" />);
    expect(snapshotHTML(screen.container)).toMatchInlineSnapshot(
      `"<div class="oo-ui-widget oo-ui-widget-enabled oo-ui-inputWidget oo-ui-textInputWidget oo-ui-textInputWidget-type-text"><input class="oo-ui-inputWidget-input" tabindex="0" type="text" value="甲"><span class="oo-ui-iconElement-icon oo-ui-iconElement-noIcon"></span><span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator"></span></div>"`,
    );
  });

  it("search形态+禁用", async () => {
    const screen = await render(<TextInput type="search" placeholder="搜索" disabled />);
    expect(snapshotHTML(screen.container)).toMatchInlineSnapshot(
      `"<div aria-disabled="true" class="oo-ui-widget oo-ui-widget-disabled oo-ui-inputWidget oo-ui-textInputWidget oo-ui-textInputWidget-type-search"><input aria-disabled="true" class="oo-ui-inputWidget-input" disabled="" placeholder="搜索" tabindex="-1" type="search" value=""><span class="oo-ui-iconElement-icon oo-ui-iconElement-noIcon"></span><span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator"></span></div>"`,
    );
  });
});

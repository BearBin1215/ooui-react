import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, tick } from "../../testing";
import { SearchInput } from ".";

/**
 * SearchInput（对齐原版OO.ui.SearchInputWidget）的浏览器渲染契约：
 * search形态类与缺省图标、清除指示器随值显隐、点击/Enter清空并回焦、禁用不显示清除。
 */
it("常规：search type类与缺省search图标", async () => {
  const screen = await render(<SearchInput />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-textInputWidget-type-search");
  expect(root.querySelector(".oo-ui-iconElement-icon")).toHaveClass("oo-ui-icon-search");
  // 空值时无清除指示器（indicatorOverride=null完全接管槽位，required回退被抑制）
  expect(
    root.querySelector(".oo-ui-indicatorElement-indicator.oo-ui-indicator-clear"),
  ).toBeNull();
});

it("值非空且可编辑时显示clear清除指示器（role=button）", async () => {
  const screen = await render(<SearchInput defaultValue="kw" />);
  const indicator = getRoot(screen).querySelector(
    ".oo-ui-indicatorElement-indicator.oo-ui-indicator-clear",
  )!;
  expect(indicator).toHaveAttribute("role", "button");
  // aria-label取ooui-item-remove消息（英文默认Remove）
  expect(indicator).toHaveAttribute("aria-label", "Remove");
});

it("点击清除指示器：清空值并回焦输入框", async () => {
  const onChange = vi.fn<(value: string, event?: unknown) => void>();
  const screen = await render(<SearchInput defaultValue="kw" onChange={onChange} />);
  const input = screen.container.querySelector<HTMLInputElement>("input")!;
  const indicator = getRoot(screen).querySelector(
    ".oo-ui-indicatorElement-indicator.oo-ui-indicator-clear",
  )!;
  await (indicator as HTMLElement).click();
  await tick();
  expect(onChange).toHaveBeenLastCalledWith("");
  expect(input.value).toBe("");
  expect(document.activeElement).toBe(input);
});

it("清除指示器上的Enter同样触发清空", async () => {
  const onChange = vi.fn<(value: string, event?: unknown) => void>();
  const screen = await render(<SearchInput defaultValue="kw" onChange={onChange} />);
  const indicator = getRoot(screen).querySelector(
    ".oo-ui-indicatorElement-indicator.oo-ui-indicator-clear",
  )!;
  indicator.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
  );
  await tick();
  expect(onChange).toHaveBeenLastCalledWith("");
});

it("禁用或只读时不显示清除指示器（对齐updateSearchIndicator的形态判定）", async () => {
  const screen = await render(<SearchInput defaultValue="kw" disabled />);
  expect(
    getRoot(screen).querySelector(
      ".oo-ui-indicatorElement-indicator.oo-ui-indicator-clear",
    ),
  ).toBeNull();
  const screen2 = await render(<SearchInput defaultValue="kw" readOnly />);
  expect(
    getRoot(screen2).querySelector(
      ".oo-ui-indicatorElement-indicator.oo-ui-indicator-clear",
    ),
  ).toBeNull();
});

describe("HTML快照", () => {
  // 快照锁结构：差异须有意识地更新，勿靠 -u 反推（靶心为原版DOM，见comparison-guide「渲染契约的靶心」）
  it("空值", async () => {
    const screen = await render(<SearchInput />);
    expect(screen.container.innerHTML).toMatchInlineSnapshot(
      `"<div class="oo-ui-widget oo-ui-widget-enabled oo-ui-iconElement oo-ui-inputWidget oo-ui-textInputWidget oo-ui-textInputWidget-type-search"><input tabindex="0" class="oo-ui-inputWidget-input" type="search" value=""><span class="oo-ui-iconElement-icon oo-ui-icon-search"></span><span role="button" tabindex="-1" class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator"></span></div>"`,
    );
  });

  it("有值显示清除指示器", async () => {
    const screen = await render(<SearchInput defaultValue="kw" />);
    expect(screen.container.innerHTML).toMatchInlineSnapshot(
      `"<div class="oo-ui-widget oo-ui-widget-enabled oo-ui-iconElement oo-ui-indicatorElement oo-ui-inputWidget oo-ui-textInputWidget oo-ui-textInputWidget-type-search"><input tabindex="0" class="oo-ui-inputWidget-input" type="search" value="kw"><span class="oo-ui-iconElement-icon oo-ui-icon-search"></span><span role="button" tabindex="-1" aria-label="Remove" class="oo-ui-indicatorElement-indicator oo-ui-indicator-clear"></span></div>"`,
    );
  });
});

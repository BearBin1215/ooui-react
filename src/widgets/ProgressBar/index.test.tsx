import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, snapshotHTML } from "../../testing";
import { ProgressBar } from ".";

/**
 * ProgressBar（对齐原版OO.ui.ProgressBarWidget）的浏览器渲染契约：
 * progressbar语义、数值进度的width/aria-valuenow、不定进度形态、越界钳制与NaN兜底、
 * disabled下根输出禁用类与aria-disabled（进度语义不受影响）。
 */
it("不定进度（缺省）：indeterminate类，无aria-valuenow与width", async () => {
  const screen = await render(<ProgressBar />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-progressBarWidget");
  expect(root).toHaveClass("oo-ui-progressBarWidget-indeterminate");
  expect(root).toHaveAttribute("role", "progressbar");
  expect(root).toHaveAttribute("aria-valuemin", "0");
  expect(root).toHaveAttribute("aria-valuemax", "100");
  expect(root).not.toHaveAttribute("aria-valuenow");
  const bar = root.querySelector(".oo-ui-progressBarWidget-bar")!;
  expect(bar.getAttribute("style")).toBeNull();
});

it("数值进度：bar宽度与aria-valuenow同步", async () => {
  const screen = await render(<ProgressBar progress={40} />);
  const root = getRoot(screen);
  expect(root).not.toHaveClass("oo-ui-progressBarWidget-indeterminate");
  expect(root).toHaveAttribute("aria-valuenow", "40");
  const bar = root.querySelector(".oo-ui-progressBarWidget-bar")!;
  expect(bar.getAttribute("style")).toContain("width: 40%");
});

it("disabled：根输出禁用类与aria-disabled，进度语义不受影响", async () => {
  const screen = await render(<ProgressBar progress={40} disabled />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
  expect(root).toHaveAttribute("aria-valuenow", "40");
});

it("progress钳制到0-100（修正原版NaN/越界直出）", async () => {
  const screen = await render(<ProgressBar progress={150} />);
  expect(getRoot(screen)).toHaveAttribute("aria-valuenow", "100");
  const screen2 = await render(<ProgressBar progress={-5} />);
  expect(getRoot(screen2)).toHaveAttribute("aria-valuenow", "0");
  // NaN按不定进度处理，不输出非法的width:NaN%/aria-valuenow="NaN"
  const screen3 = await render(<ProgressBar progress={Number.NaN} />);
  expect(getRoot(screen3)).toHaveClass("oo-ui-progressBarWidget-indeterminate");
  expect(getRoot(screen3)).not.toHaveAttribute("aria-valuenow");
});

describe("HTML快照", () => {
  // 快照锁结构：差异须有意识地更新，勿靠 -u 反推（靶心为原版DOM，见comparison-guide「渲染契约的靶心」）
  it("不定进度", async () => {
    const screen = await render(<ProgressBar />);
    expect(snapshotHTML(screen.container)).toMatchInlineSnapshot(
      `"<div aria-valuemax="100" aria-valuemin="0" class="oo-ui-widget oo-ui-widget-enabled oo-ui-progressBarWidget oo-ui-progressBarWidget-indeterminate" role="progressbar"><div class="oo-ui-progressBarWidget-bar"></div></div>"`,
    );
  });

  it("数值进度", async () => {
    const screen = await render(<ProgressBar progress={40} />);
    expect(snapshotHTML(screen.container)).toMatchInlineSnapshot(
      `"<div aria-valuemax="100" aria-valuemin="0" aria-valuenow="40" class="oo-ui-widget oo-ui-widget-enabled oo-ui-progressBarWidget" role="progressbar"><div class="oo-ui-progressBarWidget-bar" style="width: 40%;"></div></div>"`,
    );
  });
});

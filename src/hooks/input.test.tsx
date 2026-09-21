import { useRef, useState } from "react";
import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { clickElement, getTestId, tick } from "../testing";
import { useLabelPadding, useValidityFlag } from "./input";

/** label与input并排：input按label实测宽度预留内边距 */
function PaddingHost({
  labelPosition,
  rtl,
}: {
  labelPosition: "before" | "after";
  rtl: boolean;
}) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const style = useLabelPadding(labelRef, "字段名", labelPosition, rtl);
  return (
    <div>
      <span ref={labelRef} style={{ display: "inline-block", width: "40px" }}>
        字段名
      </span>
      <input data-testid="input" style={style} />
    </div>
  );
}

/** label元素不存在（ref恒空）：不应预留内边距 */
function NoLabelHost() {
  const labelRef = useRef<HTMLSpanElement>(null);
  const style = useLabelPadding(labelRef, "字段名", "after", false);
  return <input data-testid="input" style={style} />;
}

function ValidityHost({
  validate,
}: {
  validate?: (value: string) => boolean | Promise<boolean>;
}) {
  const [value, setValue] = useState("a");
  const inputRef = useRef<HTMLInputElement>(null);
  const { invalid, handleBlur, handleFocus } = useValidityFlag<HTMLInputElement, string>({
    inputRef,
    value,
    validate,
  });
  return (
    <>
      <input
        ref={inputRef}
        data-testid="input"
        data-invalid={invalid ? "yes" : "no"}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <button type="button" data-testid="to-b" onClick={() => setValue("b")}>
        b
      </button>
      <button type="button" data-testid="to-c" onClick={() => setValue("c")}>
        c
      </button>
    </>
  );
}

/**
 * input.ts的度量与软校验：
 * useLabelPadding按label实测宽度预留内边距（+2px间距），落侧按根方向在LTR/RTL下互换；
 * useValidityFlag的值变更校验经250ms防抖（对齐原版change事件的debounce），
 * 连续变更只保留最后一次，自定义validate返回Promise时按决议/拒绝标记。
 */
it("label在after侧：LTR落paddingRight、RTL落paddingLeft（宽度+2px间距）", async () => {
  const ltr = await render(<PaddingHost labelPosition="after" rtl={false} />);
  expect(getTestId(ltr, "input").style.paddingRight).toBe("42px");
  expect(getTestId(ltr, "input").style.paddingLeft).toBe("");

  const rtl = await render(<PaddingHost labelPosition="after" rtl />);
  expect(getTestId(rtl, "input").style.paddingLeft).toBe("42px");
  expect(getTestId(rtl, "input").style.paddingRight).toBe("");
});

it("label在before侧：LTR落paddingLeft、RTL落paddingRight", async () => {
  const ltr = await render(<PaddingHost labelPosition="before" rtl={false} />);
  expect(getTestId(ltr, "input").style.paddingLeft).toBe("42px");

  const rtl = await render(<PaddingHost labelPosition="before" rtl />);
  expect(getTestId(rtl, "input").style.paddingRight).toBe("42px");
});

it("label元素不存在时不预留内边距", async () => {
  const screen = await render(<NoLabelHost />);
  const input = getTestId(screen, "input");
  expect(input.style.paddingLeft).toBe("");
  expect(input.style.paddingRight).toBe("");
});

it("值变更防抖250ms后校验：窗口内不标记，窗口后标记", async () => {
  const validate = vi.fn<(value: string) => boolean>(() => false);
  const screen = await render(<ValidityHost validate={validate} />);
  // 首值不校验（对齐原版构造期无change事件）
  expect(getTestId(screen, "input").dataset.invalid).toBe("no");

  clickElement(getTestId(screen, "to-b"));
  await tick(150);
  expect(getTestId(screen, "input").dataset.invalid).toBe("no");
  await tick(200);
  expect(getTestId(screen, "input").dataset.invalid).toBe("yes");
});

it("连续变更只保留最后一次（防抖句柄跨渲染复用）", async () => {
  const validate = vi.fn<(value: string) => boolean>(() => true);
  const screen = await render(<ValidityHost validate={validate} />);
  clickElement(getTestId(screen, "to-b"));
  clickElement(getTestId(screen, "to-c"));
  await tick(400);
  expect(validate).toHaveBeenCalledTimes(1);
  expect(validate).toHaveBeenCalledWith("c");
});

it("自定义validate返回Promise：决议false与拒绝都标记为非法，决议true不标记", async () => {
  const rejected = await render(<ValidityHost validate={() => Promise.resolve(false)} />);
  clickElement(getTestId(rejected, "to-b"));
  await tick(400);
  expect(getTestId(rejected, "input").dataset.invalid).toBe("yes");

  const throws = await render(
    <ValidityHost validate={() => Promise.reject(new Error("校验失败"))} />,
  );
  clickElement(getTestId(throws, "to-b"));
  await tick(400);
  expect(getTestId(throws, "input").dataset.invalid).toBe("yes");

  const valid = await render(<ValidityHost validate={() => Promise.resolve(true)} />);
  clickElement(getTestId(valid, "to-b"));
  await tick(400);
  expect(getTestId(valid, "input").dataset.invalid).toBe("no");
});

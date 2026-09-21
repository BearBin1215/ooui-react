import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getTestId, tick } from "../testing";
import {
  FieldLabelLinkProvider,
  type FieldLabelLink,
  useFieldGroupLabelLink,
  useFieldInputId,
  useFieldLabelFocus,
} from "./field";

/** 字段id与labelId固定的基准通道（activate/accessKey的登记用spy承接） */
function makeLink() {
  const activateRef: { current?: () => void } = {};
  const link: FieldLabelLink = {
    inputId: "field-input",
    labelId: "field-label",
    registerLabelActivate: (activate) => {
      activateRef.current = activate;
      return () => {
        activateRef.current = undefined;
      };
    },
    registerAccessKey: () => () => {},
  };
  return { link, activateRef };
}

/** 通道A的消费方：把认领到的id挂到原生input上 */
function InputHost() {
  return <input data-testid="input" id={useFieldInputId()} />;
}

/** 组内选项：须渲染在屏蔽后的Provider之内，才能读到被改写的通道 */
function OptionInput({ labelId }: { labelId?: string }) {
  return <input data-testid="option" id={useFieldInputId()} aria-labelledby={labelId} />;
}

/** 组容器：先屏蔽通道A，再向组内选项继续下发 */
function GroupHost() {
  const groupLink = useFieldGroupLabelLink();
  return (
    <FieldLabelLinkProvider value={groupLink}>
      <OptionInput labelId={groupLink?.labelId} />
    </FieldLabelLinkProvider>
  );
}

/** 通道B的消费方：标签点击的激活动作经useFieldLabelFocus注册 */
function FocusHost({ disabled }: { disabled?: boolean }) {
  const { setRef, fieldLabelId } = useFieldLabelFocus<HTMLDivElement>({ disabled });
  return (
    <div data-testid="root" tabIndex={0} ref={setRef} aria-labelledby={fieldLabelId} />
  );
}

/**
 * field.ts的标签联动通道：
 * 通道A（含原生input的字段经inputId与label的htmlFor原生关联）、组容器对通道A的屏蔽
 * （避免组内每个选项复制同一id）、通道B的标签点击激活与禁用时提前返回。
 */
it("通道A：原生input认领字段id（label的htmlFor指向它）", async () => {
  const { link } = makeLink();
  const screen = await render(
    <FieldLabelLinkProvider value={link}>
      <InputHost />
    </FieldLabelLinkProvider>,
  );
  expect(getTestId(screen, "input").id).toBe("field-input");
});

it("组容器屏蔽通道A：组内选项不再认领字段id，labelId照常下发", async () => {
  const { link } = makeLink();
  const screen = await render(
    <FieldLabelLinkProvider value={link}>
      <GroupHost />
    </FieldLabelLinkProvider>,
  );
  const option = getTestId(screen, "option");
  // 不屏蔽则组内每个选项input都会复制该id（重复id + 标签原生激活首个选项）
  expect(option.id).toBe("");
  expect(option).toHaveAttribute("aria-labelledby", "field-label");
});

it("标签点击激活：默认聚焦组件根元素", async () => {
  const { link, activateRef } = makeLink();
  const screen = await render(
    <FieldLabelLinkProvider value={link}>
      <FocusHost />
    </FieldLabelLinkProvider>,
  );
  const root = getTestId(screen, "root");
  await tick();
  activateRef.current!();
  expect(document.activeElement).toBe(root);
});

it("disabled：标签激活提前返回，不聚焦根元素", async () => {
  const { link, activateRef } = makeLink();
  const screen = await render(
    <FieldLabelLinkProvider value={link}>
      <FocusHost disabled />
    </FieldLabelLinkProvider>,
  );
  const root = getTestId(screen, "root");
  await tick();
  activateRef.current!();
  expect(document.activeElement).not.toBe(root);
});

it("字段卸载后注销激活回调（点标签不再触发已卸载字段）", async () => {
  const { link, activateRef } = makeLink();
  const screen = await render(
    <FieldLabelLinkProvider value={link}>
      <FocusHost />
    </FieldLabelLinkProvider>,
  );
  await tick();
  expect(activateRef.current).toBeTypeOf("function");
  await screen.unmount();
  expect(activateRef.current).toBeUndefined();
});

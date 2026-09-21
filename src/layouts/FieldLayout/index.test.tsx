import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, tick } from "../../testing";
import { CheckboxMultiselect } from "../../widgets/CheckboxMultiselect";
import { TextInput } from "../../widgets/TextInput";
import { FieldLayout } from ".";

/**
 * FieldLayout（对齐原版OO.ui.FieldLayout）的浏览器渲染契约：
 * 结构与align类、disabled类、invisibleLabel裁剪落点、标签联动双通道——
 * 输入类字段经htmlFor原生关联（通道A），无原生input的组容器经注册激活回调聚焦
 * （通道B）并以aria-labelledby反向关联。
 */
it("结构：fieldLayout根与align类，label进header、字段进field容器", async () => {
  const screen = await render(
    <FieldLayout label="字段名" align="top">
      <TextInput />
    </FieldLayout>,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-layout");
  expect(root).toHaveClass("oo-ui-fieldLayout");
  expect(root).toHaveClass("oo-ui-fieldLayout-align-top");
  expect(root).toHaveClass("oo-ui-labelElement");
  const header = root.querySelector(".oo-ui-fieldLayout-header")!;
  expect(header.querySelector("label")?.textContent).toBe("字段名");
  expect(
    root.querySelector(".oo-ui-fieldLayout-field")!.querySelector("input"),
  ).toBeTruthy();
});

it("非inline布局header在前，inline布局field在前", async () => {
  const screen = await render(
    <FieldLayout label="字段名" align="inline">
      <TextInput />
    </FieldLayout>,
  );
  const body = screen.container.querySelector(".oo-ui-fieldLayout-body")!;
  expect(body.children[0]).toHaveClass("oo-ui-fieldLayout-field");
  expect(body.children[1]).toHaveClass("oo-ui-fieldLayout-header");

  const screen2 = await render(
    <FieldLayout label="字段名">
      <TextInput />
    </FieldLayout>,
  );
  const body2 = screen2.container.querySelector(".oo-ui-fieldLayout-body")!;
  expect(body2.children[0]).toHaveClass("oo-ui-fieldLayout-header");
});

it("disabled：输出fieldLayout-disabled类", async () => {
  const screen = await render(
    <FieldLayout label="字段名" disabled>
      <TextInput />
    </FieldLayout>,
  );
  expect(getRoot(screen)).toHaveClass("oo-ui-fieldLayout-disabled");
});

it("invisibleLabel：裁剪类落在label元素上", async () => {
  const screen = await render(
    <FieldLayout label="字段名" invisibleLabel>
      <TextInput />
    </FieldLayout>,
  );
  const label = screen.container.querySelector("label")!;
  expect(label).toHaveClass("oo-ui-labelElement-invisible");
});

it("通道A（原生input字段）：input认领字段id与label的htmlFor关联，点击标签聚焦input", async () => {
  const screen = await render(
    <FieldLayout label="字段名">
      <TextInput />
    </FieldLayout>,
  );
  const label = screen.getByText("字段名");
  const input = screen.container.querySelector("input")!;
  expect(input.id).toBeTruthy();
  expect(label.element()).toHaveAttribute("for", input.id);
  await label.click();
  expect(document.activeElement).toBe(input);
});

it("字段accessKey委托：label的tooltip附字段控件的键位后缀（原版formatTitleWithAccessKey委托）", async () => {
  const screen = await render(
    <FieldLayout label="字段名" title="字段提示">
      <TextInput accessKey="k" />
    </FieldLayout>,
  );
  const label = screen.container.querySelector("label")!;
  // 未配置getAccessKeyLabel解析器时按原版回落分支附原键值
  expect(label.getAttribute("title")).toBe("字段提示 [k]");
  // accessKey本身仍落在输入元素上（落点不变，委托只让label的tooltip带上后缀）
  expect(screen.container.querySelector("input")!.getAttribute("accessKey")).toBe("k");
});

it("无accessKey的字段不污染label tooltip（登记为空即无后缀）", async () => {
  const screen = await render(
    <FieldLayout label="字段名" title="字段提示">
      <TextInput />
    </FieldLayout>,
  );
  expect(screen.container.querySelector("label")!.getAttribute("title")).toBe("字段提示");
});

it("通道B（无原生input的组容器）：字段根aria-labelledby关联label，点击标签聚焦首个非禁用选项", async () => {
  const screen = await render(
    <FieldLayout label="多选组">
      <CheckboxMultiselect
        options={[
          { children: "甲", value: "a", disabled: true },
          { children: "乙", value: "b" },
        ]}
      />
    </FieldLayout>,
  );
  const label = screen.getByText("多选组");
  const group = screen.container.querySelector(".oo-ui-checkboxMultiselectWidget")!;
  expect(group.getAttribute("aria-labelledby")).toBe(label.element().id);
  // 首个选项禁用：激活聚焦的是首个非禁用项的checkbox（对齐原版getRelativeFocusableItem）
  await label.click();
  await tick();
  const inputs = [...group.querySelectorAll<HTMLInputElement>("input")];
  expect(document.activeElement).toBe(inputs[1]);
});

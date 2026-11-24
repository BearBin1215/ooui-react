import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { tick } from "../../testing";
import { getPanel } from "../../testing/toolGroups";
import { ListToolGroup, type ListToolGroupProps } from "../ListToolGroup";
import { Toolbar } from ".";

/**
 * 测试样式：主题 CSS 不参与测试，提升判定又依赖真实布局，故用固定宽度模拟
 * bar 组形态——组 handle 60px、每个工具 40px、提升容器按内容收缩（与主题下
 * `.oo-ui-toolGroup`/`.oo-ui-barToolGroup-tools` 的 inline-block 行为一致）
 */
const PROMOTION_CSS = `
  .promotion-fixture { position: relative; }
  .promotion-fixture .oo-ui-toolbar-tools { display: inline; }
  .promotion-fixture .oo-ui-toolGroup { display: inline-block; vertical-align: middle; }
  .promotion-fixture .oo-ui-popupToolGroup { width: 60px; }
  .promotion-fixture .oo-ui-popupToolGroup-allToolsPromoted { display: none; }
  .promotion-fixture .oo-ui-barToolGroup-tools { display: inline-block; white-space: nowrap; }
  .promotion-fixture .oo-ui-tool { display: inline-block; vertical-align: top; }
  .promotion-fixture .oo-ui-tool-link { display: inline-block; width: 40px; height: 20px; }
`;

const TOOLS = [
  { name: "a", label: "工具甲", title: "工具甲", accelerator: "Ctrl+A" },
  { name: "b", label: "工具乙", title: "工具乙" },
  { name: "c", label: "工具丙", title: "工具丙" },
];

/** 固定栏宽的测试夹具：bar 宽即外层 div 宽，组/工具的宽度由 PROMOTION_CSS 固定 */
const Fixture = ({
  width,
  groupProps,
}: {
  width: number;
  groupProps?: Partial<ListToolGroupProps>;
}) => (
  <div className="promotion-fixture" style={{ width }}>
    <style>{PROMOTION_CSS}</style>
    <Toolbar>
      <ListToolGroup
        label="更多"
        icon="menu"
        promoteToBar={["a", "b", "c"]}
        tools={[...TOOLS]}
        {...groupProps}
      />
    </Toolbar>
  </div>
);

const renderFixture = (width: number, groupProps?: Partial<ListToolGroupProps>) =>
  render(<Fixture width={width} groupProps={groupProps} />);

const getGroupRoot = (screen: { container: Element }): HTMLElement =>
  screen.container.querySelector<HTMLElement>(".oo-ui-popupToolGroup")!;
const getPromotedContainer = (screen: { container: Element }): HTMLElement | null =>
  screen.container.querySelector<HTMLElement>(".oo-ui-popupToolGroup-promoted");
/** 提升容器内的工具名（容器在工具栏子树内，按渲染容器查询） */
const promotedNames = (screen: { container: Element }): (string | null)[] =>
  Array.from(
    screen.container.querySelectorAll(".oo-ui-popupToolGroup-promoted [data-tool-name]"),
  ).map((el) => el.getAttribute("data-tool-name"));
/** 面板内的工具名（面板 portal 至 body，全局查询） */
const panelNames = (): (string | null)[] =>
  Array.from(getPanel().querySelectorAll("[data-tool-name]")).map((el) =>
    el.getAttribute("data-tool-name"),
  );

/**
 * 工具提升（对齐原版 Toolbar.updatePromotedTools + PopupToolGroup.setPromotedTools）：
 * 宽度充足的工具从面板提升到组前的平铺容器、宽度不足时按累计宽逐个收回、
 * 嵌套集合整组提升、窄栏下不提升、全部提升时组整体隐藏并收起面板。
 * 测量依赖真实布局，此处经注入样式给出确定性宽度（组 60px、工具 40px、栏宽随用例）。
 */
it("宽度充足：声明的工具全部提升，组整体隐藏并挂allToolsPromoted", async () => {
  const screen = await renderFixture(400);
  await expect
    .poll(() => promotedNames(screen), { timeout: 3_000 })
    .toEqual(["a", "b", "c"]);
  const group = getGroupRoot(screen);
  expect(group).toHaveClass("oo-ui-popupToolGroup-hasPromotedTools");
  expect(group).toHaveClass("oo-ui-popupToolGroup-allToolsPromoted");
  // 提升容器形态对齐原版$promoted（bar组类链）
  const promoted = getPromotedContainer(screen)!;
  expect(promoted).toHaveClass("oo-ui-toolGroup");
  expect(promoted).toHaveClass("oo-ui-barToolGroup");
  expect(promoted.querySelector(".oo-ui-barToolGroup-tools")).toBeTruthy();
});

it("宽度只够一个工具：按累计宽逐个收回，其余留在面板", async () => {
  const screen = await renderFixture(110);
  await expect.poll(() => promotedNames(screen), { timeout: 3_000 }).toEqual(["a"]);
  expect(getGroupRoot(screen)).not.toHaveClass("oo-ui-popupToolGroup-allToolsPromoted");
  expect(panelNames()).toEqual(["b", "c"]);
});

it("提升工具按Bar组规则渲染：promoted类、tooltip含标题与快捷键", async () => {
  const screen = await renderFixture(110);
  await expect.poll(() => promotedNames(screen), { timeout: 3_000 }).toEqual(["a"]);
  const link = screen.container.querySelector<HTMLElement>(
    '.oo-ui-popupToolGroup-promoted [data-tool-name="a"]',
  )!;
  expect(link.closest(".oo-ui-tool")).toHaveClass("oo-ui-tool-promoted");
  expect(link).toHaveAttribute("title", "工具甲 Ctrl+A");
});

it("嵌套数组整组提升：整组放不下时一个都不提升", async () => {
  // 追加不可提升的 d：保留「未提升工具」使全部工具被提升的组宽扣除不介入
  const tools = [...TOOLS, { name: "d", label: "工具丁" }];
  const groupProps = { tools, promoteToBar: [["a", "b"], "c"] };
  const screen = await renderFixture(400, groupProps);
  await expect
    .poll(() => promotedNames(screen), { timeout: 3_000 })
    .toEqual(["a", "b", "c"]);

  // 收窄到 130：可用 70px 放不下整组 [a,b]（80px），一个都不提升
  await screen.rerender(<Fixture width={130} groupProps={groupProps} />);
  await expect
    .poll(() => getPromotedContainer(screen) === null, { timeout: 3_000 })
    .toBe(true);
  expect(panelNames()).toEqual(["a", "b", "c", "d"]);

  // 放宽到 150：可用 90px 容纳整组（80px），c 放不下
  await screen.rerender(<Fixture width={150} groupProps={groupProps} />);
  await expect.poll(() => promotedNames(screen), { timeout: 3_000 }).toEqual(["a", "b"]);
  expect(panelNames()).toEqual(["c", "d"]);
});

it("栏宽不足以容纳弹层形态时进入窄栏，提升全部收回", async () => {
  const screen = await renderFixture(50);
  await expect
    .poll(() => screen.container.querySelector(".oo-ui-toolbar")!.className, {
      timeout: 3_000,
    })
    .toContain("oo-ui-toolbar-narrow");
  expect(getPromotedContainer(screen)).toBeNull();
  expect(panelNames()).toEqual(["a", "b", "c"]);
});

it("栏宽变化时重新测量：变宽后提升更多工具，变窄后收回", async () => {
  const screen = await renderFixture(110);
  await expect.poll(() => promotedNames(screen), { timeout: 3_000 }).toEqual(["a"]);

  await screen.rerender(<Fixture width={400} />);
  await expect
    .poll(() => promotedNames(screen), { timeout: 3_000 })
    .toEqual(["a", "b", "c"]);

  await screen.rerender(<Fixture width={110} />);
  await expect.poll(() => promotedNames(screen), { timeout: 3_000 }).toEqual(["a"]);
});

it("栏宽变化但提升结果不变时不搬动已提升的工具（焦点保留）", async () => {
  const screen = await renderFixture(110);
  await expect.poll(() => promotedNames(screen), { timeout: 3_000 }).toEqual(["a"]);
  const link = screen.container.querySelector<HTMLElement>(
    '.oo-ui-popupToolGroup-promoted [data-tool-name="a"]',
  )!;
  link.focus();
  expect(document.activeElement).toBe(link);

  // 110 → 120：可用宽从 50px 变到 60px，仍只放得下一个工具（整组提升要扣组宽 60px，
  // 恰好等于可用宽不算放下），提升集不变
  await screen.rerender(<Fixture width={120} />);
  // ResizeObserver → rAF 的测量：留两拍确保它已跑完
  await tick(100);

  expect(promotedNames(screen)).toEqual(["a"]);
  // 提升工具未被收回重挂（同一节点、焦点仍在）：缓存命中的测量不动DOM
  expect(screen.container.querySelector('[data-tool-name="a"]')).toBe(link);
  expect(document.activeElement).toBe(link);
});

it("内嵌工具组工具可提升：按工具位宽度累计并渲染到平铺容器", async () => {
  // 内嵌组工具无工具链接，宽度以工具位（span.oo-ui-toolGroupTool）为准
  const screen = await renderFixture(400, {
    tools: [
      {
        name: "nested",
        group: (
          <ListToolGroup
            label="内嵌"
            icon="menu"
            tools={[{ name: "n1", label: "子项" }]}
          />
        ),
      },
      TOOLS[1],
      TOOLS[2],
    ],
    promoteToBar: ["nested"],
  });
  await expect.poll(() => promotedNames(screen), { timeout: 3_000 }).toEqual(["nested"]);
  const slot = screen.container.querySelector<HTMLElement>(
    '.oo-ui-popupToolGroup-promoted [data-tool-name="nested"]',
  )!;
  expect(slot).toHaveClass("oo-ui-toolGroupTool");
  expect(slot).toHaveClass("oo-ui-tool-promoted");
});

it("全部工具被提升时收起已展开的面板", async () => {
  const screen = await renderFixture(400, { defaultOpen: true });
  const handle = () =>
    getGroupRoot(screen).querySelector(".oo-ui-popupToolGroup-handle")!;
  await expect
    .poll(() => handle().getAttribute("aria-expanded"), {
      timeout: 3_000,
    })
    .toBe("false");
  expect(getPanel()).toHaveClass("oo-ui-element-hidden");
});

it("折叠项被提升时从面板移入工具栏，可折叠项全部提升后不再出现More/Fewer", async () => {
  const screen = await renderFixture(400, {
    allowCollapse: ["c"],
    promoteToBar: ["c"],
  });
  await expect.poll(() => promotedNames(screen), { timeout: 3_000 }).toEqual(["c"]);
  expect(panelNames()).toEqual(["a", "b"]);
});

it("仍有未提升的可折叠项时保留More/Fewer", async () => {
  const screen = await renderFixture(400, {
    allowCollapse: ["b", "c"],
    promoteToBar: ["b"],
  });
  await expect.poll(() => promotedNames(screen), { timeout: 3_000 }).toEqual(["b"]);
  expect(panelNames()).toEqual(["a", "more-fewer"]);
});

it("提升优先级按声明顺序：align=after 的组声明在前时仍优先", async () => {
  const screen = await render(
    <div className="promotion-fixture" style={{ width: 180 }}>
      <style>{PROMOTION_CSS}</style>
      <Toolbar>
        <ListToolGroup
          align="after"
          label="右侧"
          icon="menu"
          promoteToBar={["a1"]}
          tools={[
            { name: "a1", label: "甲一", title: "甲一" },
            { name: "a2", label: "甲二", title: "甲二" },
          ]}
        />
        <ListToolGroup
          label="左侧"
          icon="menu"
          promoteToBar={["b1"]}
          tools={[
            { name: "b1", label: "乙一", title: "乙一" },
            { name: "b2", label: "乙二", title: "乙二" },
          ]}
        />
      </Toolbar>
    </div>,
  );
  await expect
    .poll(
      () =>
        screen.container.querySelectorAll(
          ".oo-ui-popupToolGroup-promoted [data-tool-name]",
        ).length,
      { timeout: 3_000 },
    )
    .toBe(1);
  const promoted = screen.container.querySelector(".oo-ui-popupToolGroup-promoted")!;
  expect(promoted.querySelector('[data-tool-name="a1"]')).toBeTruthy();
  expect(screen.container.querySelector('[data-tool-name="b1"]')).toBeNull();
  // 提升容器随所属组排在右侧after容器
  expect(promoted.closest(".oo-ui-toolbar-after")).toBeTruthy();
});

it("提升集变化时工具跨父节点重挂（React 不搬运节点）", async () => {
  const screen = await renderFixture(110);
  await expect.poll(() => promotedNames(screen), { timeout: 3_000 }).toEqual(["a"]);
  // b 初始在面板（portal 在 body），放宽后提升到平铺容器：父节点变化必然重挂
  const panelLink = getPanel().querySelector<HTMLElement>('[data-tool-name="b"]')!;

  await screen.rerender(<Fixture width={400} />);
  await expect
    .poll(() => promotedNames(screen), { timeout: 3_000 })
    .toEqual(["a", "b", "c"]);
  expect(screen.container.querySelector('[data-tool-name="b"]')).not.toBe(panelLink);
});

it("内嵌工具组声明的 promoteToBar 不参与外层工具栏提升", async () => {
  await renderFixture(400, {
    defaultOpen: true,
    promoteToBar: [],
    tools: [
      {
        name: "nested",
        group: (
          <ListToolGroup
            label="内嵌"
            icon="menu"
            promoteToBar={["n1"]}
            tools={[{ name: "n1", label: "子项" }]}
          />
        ),
      },
      TOOLS[1],
    ],
  });
  await tick(100);
  expect(document.querySelector('[data-tool-name="nested"]')).toBeTruthy();
  // 原版Toolbar只遍历顶层items：内嵌组不注册，因此不出现提升容器
  expect(document.querySelector(".oo-ui-popupToolGroup-promoted")).toBeNull();
});

it("提升的工具在工具栏上可直接选中：点击经按压流触发onSelect", async () => {
  const onSelect = vi.fn<() => void>();
  const screen = await renderFixture(110, {
    tools: [{ ...TOOLS[0], onSelect }, TOOLS[1], TOOLS[2]],
  });
  await expect.poll(() => promotedNames(screen), { timeout: 3_000 }).toEqual(["a"]);
  const link = screen.container.querySelector<HTMLElement>(
    '.oo-ui-popupToolGroup-promoted [data-tool-name="a"]',
  )!;
  // 按压流由组容器的委托处理器承接：合成 mousedown+mouseup 即提交选择
  link.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
  link.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
  await tick();
  expect(onSelect).toHaveBeenCalledOnce();
  // 面板原本收起：提升工具的选中不产生关闭态回调，也不因未打开面报错
  expect(getPanel()).toHaveClass("oo-ui-element-hidden");
});

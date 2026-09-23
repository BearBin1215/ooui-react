import { useState, type ReactNode } from "react";
import {
  BarToolGroup,
  LabelToolGroup,
  ListToolGroup,
  MenuToolGroup,
  Toolbar,
  type ToolProps,
} from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import { useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

function OriginalToolbar() {
  const [log, setLog] = useState<string[]>([]);
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as any;
    const createTool = (
      name: string,
      title: string,
      icon?: string,
      narrowConfig?: Record<string, unknown>,
      disabled?: boolean,
    ) => {
      class DemoTool extends ui.Tool {
        constructor(...args: unknown[]) {
          super(...args);
          if (icon) {
            this.setIcon(icon);
          }
          // 原版Tool的disabled为构造config（经Widget基类的setDisabled生效，
          // oojs-ui.js:1803），工具组populate经工厂create(name, toolGroup)构造工具
          // 无法透传config，构造后置位等价
          if (disabled) {
            this.setDisabled(true);
          }
        }
        // 原版要求子类实现onSelect原型方法（ToolGroup.onMouseKeyUp直接调用
        // this.pressed.onSelect()，基类无缺省实现，也不派发'select'事件）
        onSelect() {
          setLog((prev) => [`点击：${title}`, ...prev].slice(0, 5));
          // 原版ToolGroup将active兼作按压视觉态（mousedown时setActive(true)），
          // 故不能以isActive()取反（读到的是按压态），须用实例自有标志，与官方Demo一致
          this.reallyActive = !this.reallyActive;
          this.setActive(this.reallyActive);
          // updateState广播给工具实例所属的工具栏（Tool构造时记录this.toolbar）；
          // 两个工具栏共享工具工厂，不能经全局变量反查（会串到最后创建的那条）
          this.toolbar?.emit("updateState");
        }
        onUpdateState() {
          /* 演示工具不响应应用状态 */
        }
      }
      DemoTool.static = Object.create(ui.Tool.static);
      Object.assign(DemoTool.static, { name, title, icon, group: "demo", narrowConfig });
      return DemoTool;
    };

    // 弹出工具（PopupTool）：onSelect/onUpdateState由基类实现——选中即开合浮层，
    // 浮层显隐经onPopupToggle回写工具激活态
    const createPopupTool = (name: string, title: string, icon: string) => {
      class DemoPopupTool extends ui.PopupTool {
        constructor(toolGroup: unknown, config: unknown) {
          super(
            toolGroup,
            Object.assign({ popup: { padded: true, label: title, head: true } }, config),
          );
          this.popup.$body.append(
            "<p>这是弹出工具的内容，与原版 OO.ui.PopupTool 对照。</p>",
          );
        }
      }
      DemoPopupTool.static = Object.create(ui.PopupTool.static);
      Object.assign(DemoPopupTool.static, { name, title, icon, group: "demo" });
      return DemoPopupTool;
    };
    // 内嵌工具组工具（ToolGroupTool）：工具位渲染为groupConfig声明的内嵌工具组
    // （原版经toolbar.getToolGroupFactory()创建list组），把手与面板由内嵌组提供
    const createToolGroupTool = (
      name: string,
      title: string,
      icon: string,
      groupConfig: unknown,
    ) => {
      class DemoToolGroupTool extends ui.ToolGroupTool {}
      DemoToolGroupTool.static = Object.create(ui.ToolGroupTool.static);
      Object.assign(DemoToolGroupTool.static, {
        name,
        title,
        icon,
        group: "demo",
        groupConfig,
      });
      return DemoToolGroupTool;
    };

    const toolFactory = new ui.ToolFactory();
    for (const tool of [
      // 图标名须为当前版本主题CSS实际提供的图标，否则渲染为空白
      createTool("person", "个人", "userAvatar"),
      createTool("help", "帮助", "help"),
      // narrowConfig：窄栏下换成另一套图标/标题（对应React侧同名配置）
      createTool("comment", "评论", "speechBubbles", {
        icon: "image",
        title: "评论（窄）",
      }),
      createTool("settings", "设置", "settings"),
      createTool("image", "图片", "image"),
      // menu组工具无图标，与React侧menuTools一致
      createTool("optionOne", "选项一"),
      createTool("optionTwo", "选项二"),
      // 选项三禁用（React侧menuTools的同名工具已声明disabled，双侧对齐）
      createTool("optionThree", "选项三", undefined, undefined, true),
      // 原版工具按工具栏独占预留（ToolGroup.populate经isToolAvailable/reserveTool），
      // 同一工具不能同时进两个工具组，右侧组须用独立工具
      createTool("optionFour", "选项四"),
      createTool("optionFive", "选项五"),
      // 弹出工具与内嵌工具组工具（第二组bar），及其内嵌组引用的工具
      createPopupTool("helpPopup", "帮助", "help"),
      createTool("settingOne", "设置一"),
      createTool("settingTwo", "设置二"),
      createToolGroupTool("settingsGroup", "设置", "settings", {
        icon: "settings",
        label: "设置",
        include: ["settingOne", "settingTwo"],
      }),
    ]) {
      toolFactory.register(tool);
    }
    const toolGroupFactory = new ui.ToolGroupFactory();
    toolGroupFactory.register(ui.BarToolGroup);
    toolGroupFactory.register(ui.ListToolGroup);
    toolGroupFactory.register(ui.MenuToolGroup);
    // LabelToolGroup不能容纳工具（populate为空实现），仅展示标签
    toolGroupFactory.register(ui.LabelToolGroup);

    // 工厂供两条工具栏共享（工具实例由各工具组自行创建），分组结构对齐React侧
    const top = new ui.Toolbar(toolFactory, toolGroupFactory);
    top.setup([
      { type: "bar", include: ["person", "help"] },
      // 弹出工具与内嵌工具组工具：二者都在bar组内，工具位分别渲染为浮层把手与内嵌list组
      { type: "bar", include: ["helpPopup", "settingsGroup"] },
      // 空工具组：两侧均输出oo-ui-toolGroup-empty（主题display:none）整体隐藏
      { type: "bar", include: [] },
      {
        type: "label",
        label: "标签组",
        icon: "userAvatar",
        indicator: "down",
        title: "标签工具组",
      },
      { type: "label", label: "纯文本" },
      // narrowConfig：窄栏下把手换图标/标签（对应React侧ListToolGroup的narrowConfig）
      {
        type: "list",
        include: ["comment", "settings", "image"],
        icon: "ellipsis",
        indicator: "down",
        label: "更多",
        narrowConfig: { icon: "help", label: "更多（窄）" },
      },
      {
        type: "menu",
        include: ["optionOne", "optionTwo", "optionThree"],
        icon: "ellipsis",
        label: "菜单",
      },
      // align:'after'：工具组排到工具栏右侧的$after容器（原版insertItemElements）
      {
        type: "menu",
        include: ["optionFour", "optionFive"],
        icon: "ellipsis",
        label: "右侧",
        align: "after",
      },
    ]);
    // 原版要求先attach再initialize（narrow阈值依赖布局测量）
    container.appendChild(unwrapJQuery(top.$element));
    top.initialize();
    register(top);

    // bottom工具栏：弹层面板向上展开、indicator随position翻转（两侧均不传indicator，
    // 对照PopupToolGroup构造期的缺省逻辑：position bottom→up、其余down）
    const bottom = new ui.Toolbar(toolFactory, toolGroupFactory, { position: "bottom" });
    bottom.setup([
      {
        type: "list",
        include: ["comment", "settings", "image"],
        icon: "ellipsis",
        label: "更多",
      },
      {
        type: "menu",
        include: ["optionOne", "optionTwo", "optionThree"],
        icon: "ellipsis",
        label: "菜单",
      },
    ]);
    container.appendChild(unwrapJQuery(bottom.$element));
    bottom.initialize();
    register(bottom);
  });

  return (
    <div>
      <div ref={containerRef} />
      <h3>点击记录</h3>
      <ul>
        {log.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** 原版侧：List组的allowCollapse折叠链路（More/Fewer切换项）、面板header、图标+标签工具、actions区 */
function OriginalCollapseToolbar() {
  const [log, setLog] = useState<string[]>([]);
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as any;
    const createSimpleTool = (name: string, title: string, icon?: string) => {
      class SimpleTool extends ui.Tool {
        constructor(...args: unknown[]) {
          super(...args);
          if (icon) {
            this.setIcon(icon);
          }
        }
        onSelect() {
          setLog((prev) => [`点击：${title}`, ...prev].slice(0, 5));
          this.reallyActive = !this.reallyActive;
          this.setActive(this.reallyActive);
          this.toolbar?.emit("updateState");
        }
        onUpdateState() {
          /* 演示工具不响应应用状态 */
        }
      }
      SimpleTool.static = Object.create(ui.Tool.static);
      Object.assign(SimpleTool.static, { name, title, icon, group: "collapse" });
      return SimpleTool;
    };

    const toolFactory = new ui.ToolFactory();
    // 原版displayBothIconAndLabel为Tool的构造config/static声明
    const boldTool = createSimpleTool("boldTool", "加粗", "edit");
    boldTool.static.displayBothIconAndLabel = true;
    toolFactory.register(boldTool);
    for (const name of ["colA", "colB", "colC"]) {
      toolFactory.register(createSimpleTool(name, `列表项${name.slice(-1)}`));
    }
    const toolGroupFactory = new ui.ToolGroupFactory();
    toolGroupFactory.register(ui.BarToolGroup);
    toolGroupFactory.register(ui.ListToolGroup);

    // actions容器仅在config.actions真值时挂载（内容须自行追加到$actions）
    const collapse = new ui.Toolbar(toolFactory, toolGroupFactory, { actions: true });
    // 原版accelerator经Toolbar.getToolAccelerator钩子提供（React为ToolProps.accelerator）
    collapse.getToolAccelerator = (name: string) =>
      name === "boldTool" ? "Ctrl+B" : undefined;
    collapse.setup([
      { type: "bar", include: ["boldTool"] },
      {
        type: "list",
        include: ["colA", "colB", "colC"],
        label: "折叠组",
        icon: "ellipsis",
        header: "可折叠工具列表",
        allowCollapse: ["colA", "colB", "colC"],
      },
    ]);
    // actions区无setup配置：原版经$actions直接追加（React为Toolbar的actions prop）
    const actionLabel = document.createElement("span");
    actionLabel.textContent = "动作区";
    actionLabel.style.padding = "0 0.5em";
    collapse.$actions.append(actionLabel);
    container.appendChild(unwrapJQuery(collapse.$element));
    collapse.initialize();
    register(collapse);
  });

  return (
    <div>
      <div ref={containerRef} />
      <h3>点击记录</h3>
      <ul>
        {log.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

const barTools = (
  active: Record<string, boolean>,
  toggle: (name: string) => void,
): ToolProps[] => [
  {
    name: "person",
    title: "个人",
    icon: "userAvatar",
    active: !!active.person,
    onSelect: () => toggle("person"),
  },
  {
    name: "help",
    title: "帮助",
    icon: "help",
    active: !!active.help,
    onSelect: () => toggle("help"),
  },
];
const listTools = (
  active: Record<string, boolean>,
  toggle: (name: string) => void,
): ToolProps[] => [
  {
    name: "comment",
    label: "评论",
    icon: "speechBubbles",
    // 窄栏配置：窄栏下换成另一套图标/可见文本（对应原版Tool.static.narrowConfig的title）
    narrowConfig: { icon: "image", label: "评论（窄）" },
    active: !!active.comment,
    onSelect: () => toggle("comment"),
  },
  {
    name: "settings",
    label: "设置",
    icon: "settings",
    active: !!active.settings,
    onSelect: () => toggle("settings"),
  },
  {
    name: "image",
    label: "图片",
    icon: "image",
    active: !!active.image,
    onSelect: () => toggle("image"),
  },
];
const menuTools = (
  active: Record<string, boolean>,
  toggle: (name: string) => void,
): ToolProps[] => [
  {
    name: "optionOne",
    label: "选项一",
    active: !!active.optionOne,
    onSelect: () => toggle("optionOne"),
  },
  {
    name: "optionTwo",
    label: "选项二",
    active: !!active.optionTwo,
    onSelect: () => toggle("optionTwo"),
  },
  {
    name: "optionThree",
    label: "选项三",
    disabled: true,
    onSelect: () => toggle("optionThree"),
  },
];
// 右侧组用独立工具（原版工具按工具栏独占预留，同一工具不能进两个组）
const rightMenuTools = (
  active: Record<string, boolean>,
  toggle: (name: string) => void,
): ToolProps[] => [
  {
    name: "optionFour",
    label: "选项四",
    active: !!active.optionFour,
    onSelect: () => toggle("optionFour"),
  },
  {
    name: "optionFive",
    label: "选项五",
    active: !!active.optionFive,
    onSelect: () => toggle("optionFive"),
  },
];
// 内嵌工具组的工具（对齐原版ToolGroupTool的groupConfig.include）
const settingTools = (
  active: Record<string, boolean>,
  toggle: (name: string) => void,
): ToolProps[] => [
  {
    name: "settingOne",
    label: "设置一",
    active: !!active.settingOne,
    onSelect: () => toggle("settingOne"),
  },
  {
    name: "settingTwo",
    label: "设置二",
    active: !!active.settingTwo,
    onSelect: () => toggle("settingTwo"),
  },
];

/** 每个工具组独立的active状态：toggle切换本组激活项并记录点击的工具标题 */
function useGroupTools(
  defs: (active: Record<string, boolean>, toggle: (name: string) => void) => ToolProps[],
  onLog: (title: string) => void,
) {
  const [active, setActive] = useState<Record<string, boolean>>({});
  const toggle = (name: string) => {
    setActive((prev) => ({ ...prev, [name]: !prev[name] }));
    // 可见文本走label（List/Menu组）、tooltip走title（Bar组），日志取二者可用者
    const tool = defs({}, () => undefined).find((t) => t.name === name);
    onLog(String(tool?.label ?? tool?.title ?? name));
  };
  return defs(active, toggle);
}

function ReactBarGroup({ onLog }: { onLog: (title: string) => void }) {
  const tools = useGroupTools(barTools, onLog);
  return <BarToolGroup tools={tools} />;
}

function ReactListGroup({
  onLog,
  label,
  indicator,
  narrowConfig,
}: {
  onLog: (title: string) => void;
  label: string;
  indicator?: "down";
  narrowConfig?: { icon?: string; label?: ReactNode };
}) {
  const tools = useGroupTools(listTools, onLog);
  return (
    <ListToolGroup
      label={label}
      icon="ellipsis"
      indicator={indicator}
      narrowConfig={narrowConfig}
      tools={tools}
    />
  );
}

function ReactMenuGroup({
  onLog,
  label,
  align,
  defs = menuTools,
}: {
  onLog: (title: string) => void;
  label: string;
  align?: "after";
  defs?: (active: Record<string, boolean>, toggle: (name: string) => void) => ToolProps[];
}) {
  const tools = useGroupTools(defs, onLog);
  return <MenuToolGroup label={label} icon="ellipsis" align={align} tools={tools} />;
}

/** 弹出工具与内嵌工具组（对应原版第二组bar的PopupTool/ToolGroupTool） */
function ReactPopupAndGroupTools({ onLog }: { onLog: (title: string) => void }) {
  const settings = useGroupTools(settingTools, onLog);
  const tools: ToolProps[] = [
    {
      name: "helpPopup",
      title: "帮助",
      icon: "help",
      // 弹出工具：选中开合浮层，浮层显隐期间工具呈激活态（对齐原版onPopupToggle）
      popup: {
        popupContent: <p>这是弹出工具的内容，与原版 OO.ui.PopupTool 对照。</p>,
        head: true,
        label: "帮助",
        padded: true,
        onOpenChange: (open) => open && onLog("弹出工具：帮助"),
      },
    },
    // 内嵌工具组：工具位渲染为该工具组，把手与面板由它自行提供（工具本身不渲染链接）
    {
      name: "settingsGroup",
      title: "设置",
      group: <ListToolGroup icon="settings" label="设置" tools={settings} />,
    },
  ];
  return <BarToolGroup tools={tools} />;
}

function ReactToolbar() {
  const [log, setLog] = useState<string[]>([]);

  const handleSelect = (title: string) => {
    setLog((prev) => [`点击：${title}`, ...prev].slice(0, 5));
  };

  return (
    <div>
      {/* active状态按组隔离：对齐原版各ToolGroup实例化各自Tool实例的语义，
          未激活本组工具时把手标签显示组标签而非激活项标题 */}
      <Toolbar>
        <ReactBarGroup onLog={handleSelect} />
        {/* 弹出工具（点击开合浮层）与内嵌工具组（工具位渲染为list组） */}
        <ReactPopupAndGroupTools onLog={handleSelect} />
        {/* 空工具组：无工具时整体隐藏（对齐原版oo-ui-toolGroup-empty） */}
        <BarToolGroup tools={[]} />
        {/* 标签组：不可交互、不承载工具，仅展示文本/图标/指示器 */}
        <LabelToolGroup
          label="标签组"
          icon="userAvatar"
          indicator="down"
          title="标签工具组"
        />
        <LabelToolGroup label="纯文本" />
        <ReactListGroup
          onLog={handleSelect}
          label="更多"
          indicator="down"
          narrowConfig={{ icon: "help", label: "更多（窄）" }}
        />
        <ReactMenuGroup onLog={handleSelect} label="菜单" />
        {/* align='after'：排到工具栏右侧（对应原版ToolGroup的align配置） */}
        <ReactMenuGroup
          onLog={handleSelect}
          label="右侧"
          align="after"
          defs={rightMenuTools}
        />
      </Toolbar>
      {/* bottom工具栏：弹出面板向上展开、indicator随position翻转（均对齐原版），此处用组件缺省 */}
      <Toolbar position="bottom">
        <ReactListGroup onLog={handleSelect} label="更多" />
        <ReactMenuGroup onLog={handleSelect} label="菜单" />
      </Toolbar>
      <h3>点击记录</h3>
      <ul>
        {log.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** React侧：List组折叠链路（allowCollapse+More/Fewer）、面板header、图标+标签工具、actions区 */
function ReactCollapseToolbar() {
  const [log, setLog] = useState<string[]>([]);
  const onLog = (title: string) => {
    setLog((prev) => [`点击：${title}`, ...prev].slice(0, 5));
  };
  const boldTools: ToolProps[] = [
    {
      name: "boldTool",
      label: "加粗",
      // bar组拼 title tooltip（对齐原版titleTooltips），与可见文本label同源但通道独立
      title: "加粗",
      icon: "edit",
      // 快捷键文案：bar组另以tooltip展示（对齐原版Toolbar.getToolAccelerator钩子产物）
      accelerator: "Ctrl+B",
      // bar组同时展示图标与标签（对齐原版Tool.static.displayBothIconAndLabel）
      displayBothIconAndLabel: true,
      onSelect: () => onLog("加粗"),
    },
  ];
  const collapseTools = useGroupTools(
    (active, toggle): ToolProps[] => [
      {
        name: "colA",
        label: "列表项A",
        active: !!active.colA,
        onSelect: () => toggle("colA"),
      },
      {
        name: "colB",
        label: "列表项B",
        active: !!active.colB,
        onSelect: () => toggle("colB"),
      },
      {
        name: "colC",
        label: "列表项C",
        active: !!active.colC,
        onSelect: () => toggle("colC"),
      },
    ],
    onLog,
  );

  return (
    <div>
      <Toolbar
        actions={
          // 动作区：渲染在工具组之后右侧（对齐原版$actions）
          <span style={{ padding: "0 0.5em" }}>动作区</span>
        }
      >
        <BarToolGroup tools={boldTools} />
        <ListToolGroup
          label="折叠组"
          icon="ellipsis"
          header="可折叠工具列表"
          allowCollapse={["colA", "colB", "colC"]}
          tools={collapseTools}
        />
      </Toolbar>
      <h3>点击记录</h3>
      <ul>
        {log.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** 原版侧：组级禁用（Bar组经setDisabled、List组经构造config.disabled）与List组forceExpand */
function OriginalDisabledGroup() {
  const [log, setLog] = useState<string[]>([]);
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as any;
    const createSimpleTool = (name: string, title: string, icon?: string) => {
      class SimpleTool extends ui.Tool {
        constructor(...args: unknown[]) {
          super(...args);
          if (icon) {
            this.setIcon(icon);
          }
        }
        onSelect() {
          setLog((prev) => [`点击：${title}`, ...prev].slice(0, 5));
        }
        onUpdateState() {
          /* 演示工具不响应应用状态 */
        }
      }
      SimpleTool.static = Object.create(ui.Tool.static);
      Object.assign(SimpleTool.static, { name, title, icon, group: "disabledDemo" });
      return SimpleTool;
    };
    const toolFactory = new ui.ToolFactory();
    for (const [name, title, icon] of [
      ["disA", "工具甲", null],
      ["disB", "工具乙", null],
      ["colA", "固定项A", null],
      ["colB", "可折叠B", null],
      ["colC", "可折叠C", null],
    ] as const) {
      toolFactory.register(createSimpleTool(name, title, icon ?? undefined));
    }
    const toolGroupFactory = new ui.ToolGroupFactory();
    toolGroupFactory.register(ui.BarToolGroup);
    toolGroupFactory.register(ui.ListToolGroup);

    // 行结构对齐React侧的「描述文本+控件」div行，行名与行序一一对应
    const setupToolbar = (groups: Record<string, unknown>[]) => {
      const toolbar = new ui.Toolbar(toolFactory, toolGroupFactory, {});
      toolbar.setup(groups);
      register(toolbar);
      return toolbar;
    };
    const appendRow = (
      name: string,
      toolbar: { $element: unknown; initialize: () => void },
    ) => {
      const row = document.createElement("div");
      row.textContent = name;
      row.appendChild(unwrapJQuery(toolbar.$element));
      container.appendChild(row);
      // 原版要求先attach再initialize（narrow阈值依赖布局测量）
      toolbar.initialize();
    };

    // Bar组组级禁用无setup配置：原版经setDisabled整体压制（React为工具组的disabled prop）
    const barToolbar = setupToolbar([{ type: "bar", include: ["disA", "disB"] }]);
    barToolbar.getItems()[0].setDisabled(true);
    appendRow("组级disabled（工具仍声明onSelect，点击不应有记录）", barToolbar);

    // List组组级禁用：disabled经构造config生效（Widget基类setDisabled），
    // PopupToolGroup.setDisabled在禁用时收起面板（setActive(false)）、把手不可聚焦
    appendRow(
      "ListToolGroup：组级disabled（禁用时收起面板、把手不可聚焦）",
      setupToolbar([
        {
          type: "list",
          include: ["disA", "disB"],
          icon: "ellipsis",
          label: "禁用列表组",
          disabled: true,
        },
      ]),
    );

    // forceExpand：仅colA固定显示，其余工具成为可折叠项（原版populate的simpleArrayDifference，
    // oojs-ui.js:23289）；expanded为More/Fewer切换项的初始展开态（React为defaultExpanded）
    appendRow(
      "ListToolGroup：forceExpand仅固定A（B/C可折叠），defaultExpanded初始展开",
      setupToolbar([
        {
          type: "list",
          include: ["colA", "colB", "colC"],
          icon: "ellipsis",
          label: "展开组",
          forceExpand: ["colA"],
          expanded: true,
        },
      ]),
    );
  });

  return (
    <div>
      <div ref={containerRef} />
      <h3>点击记录</h3>
      <ul>
        {log.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * React侧：组级disabled、ListToolGroup的forceExpand/受控open/onToolSelect、
 * MenuToolGroup的keepOpenToolNames（React侧面板开合通道，原版面板由把手点击开合、
 * 无构造配置形态）
 */
function ReactDisabledAndPanel({ onLog }: { onLog: (msg: string) => void }) {
  const [open, setOpen] = useState(false);
  const disabledTools: ToolProps[] = [
    { name: "disA", label: "工具甲", onSelect: () => onLog("工具甲（不应触发）") },
    { name: "disB", label: "工具乙", onSelect: () => onLog("工具乙（不应触发）") },
  ];
  const expandTools = useGroupTools(
    (_active, toggle): ToolProps[] => [
      { name: "colA", label: "固定项A", onSelect: () => toggle("colA") },
      { name: "colB", label: "可折叠B", onSelect: () => toggle("colB") },
      { name: "colC", label: "可折叠C", onSelect: () => toggle("colC") },
    ],
    onLog,
  );
  const panelMenuTools = useGroupTools(
    (_active, toggle): ToolProps[] => [
      { name: "menuA", label: "保留打开", onSelect: () => toggle("menuA") },
      { name: "menuB", label: "选中即收起", onSelect: () => toggle("menuB") },
    ],
    onLog,
  );

  return (
    <div>
      <div>
        组级disabled（工具仍声明onSelect，点击不应有记录）
        <Toolbar>
          <BarToolGroup tools={disabledTools} disabled />
        </Toolbar>
      </div>
      <div>
        ListToolGroup：组级disabled（禁用时收起面板、把手不可聚焦）
        <Toolbar>
          <ListToolGroup
            label="禁用列表组"
            icon="ellipsis"
            disabled
            tools={disabledTools}
          />
        </Toolbar>
      </div>
      <div>
        ListToolGroup：forceExpand仅固定A（B/C可折叠），defaultExpanded初始展开
        <ListToolGroup
          label="展开组"
          icon="ellipsis"
          forceExpand={["colA"]}
          defaultExpanded
          tools={expandTools}
          onToolSelect={(tool) => onLog(`onToolSelect: ${String(tool.name)}`)}
        />
      </div>
      <div>
        {/* React侧独有演示：原版面板仅由把手开合，无keepOpenToolNames与受控open的构造配置形态 */}
        MenuToolGroup：keepOpenToolNames保留打开（menuA选中后面板不收起）+ 受控open
        <MenuToolGroup
          label="菜单组"
          icon="ellipsis"
          keepOpenToolNames={["menuA"]}
          open={open}
          onOpenChange={setOpen}
          tools={panelMenuTools}
          onToolSelect={(tool) => onLog(`onToolSelect: ${String(tool.name)}`)}
        />
        <button type="button" onClick={() => setOpen((v) => !v)}>
          受控{open ? "收起" : "展开"}菜单面板
        </button>
      </div>
    </div>
  );
}

function ToolbarComparePage() {
  const [log, setLog] = useState<string[]>([]);
  return (
    <CompareLayout
      title="Toolbar 对照"
      description={
        <>
          对照点：Bar组平铺按钮（标题tooltip、按压态）、Label组（不可交互、不承载工具的纯文本/图标/
          指示器）、List组下拉面板（选中收起、标题为标签文本）、Menu组（把手标签按激活工具合成、
          选中不关闭时更新标签）、工具active态样式；第二组bar为PopupTool（点击工具开合浮层、
          浮层显隐期间工具呈激活态）与ToolGroupTool（工具位渲染为内嵌list组）；第三组为空工具组
          （无工具时两侧均整体隐藏，且判为禁用）。
          原版为ToolFactory/ToolGroupFactory注册模式，React版为声明式tools props
          （内嵌工具组以React元素经`tools[].group`传入，递归由组件树承担）。
          原版PopupTool的onSelect被浮层开合占用、调用方收不到通知，故React侧的"弹出工具：帮助"
          记录经`popup.onOpenChange`产生（见dev-docs/DEVIATIONS.md增强节），原版侧无对应记录。
          「折叠与动作区」区块验证List组allowCollapse折叠链路（面板尾部More/Fewer切换项、
          选中不收起）、面板header说明行、bar组displayBothIconAndLabel图标+标签工具、
          Toolbar的actions动作区（原版经$actions追加、无setup配置）。
          「组级禁用与面板开合」区块验证组级disabled（Bar组原版经setDisabled、List组经
          构造config.disabled，禁用时面板收起、把手不可聚焦）、List组的
          forceExpand/defaultExpanded/onToolSelect、Menu组的keepOpenToolNames与受控open
          （原版面板仅由把手开合，keepOpen与受控开合为React侧形态）。
        </>
      }
    >
      <CompareColumns original={<OriginalToolbar />}>
        <ReactToolbar />
      </CompareColumns>

      <h2>List组折叠 / actions区 / 图标+标签</h2>
      <CompareColumns original={<OriginalCollapseToolbar />}>
        <ReactCollapseToolbar />
      </CompareColumns>

      <h2>组级禁用与面板开合</h2>
      <CompareColumns original={<OriginalDisabledGroup />}>
        <ReactDisabledAndPanel
          onLog={(msg) => setLog((prev) => [msg, ...prev].slice(0, 6))}
        />
      </CompareColumns>

      <h2>事件日志（React侧）</h2>
      <ul>
        {log.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </CompareLayout>
  );
}

ToolbarComparePage.displayName = "ToolbarComparePage";

export default ToolbarComparePage;

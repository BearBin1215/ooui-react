import { useState } from "react";
import { OutlineSelect, Select, TabSelect, type SelectOptionProps } from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import { useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

type SelectUi = {
  SelectWidget: new (config?: Record<string, unknown>) => {
    $element: unknown;
    selectItem: (item?: unknown) => void;
    findSelectedItem: () => { getData: () => string } | null;
    on: (event: string, handler: (item?: unknown) => void) => void;
  };
  MenuOptionWidget: new (config?: Record<string, unknown>) => unknown;
  MenuSectionOptionWidget: new (config?: Record<string, unknown>) => unknown;
  TabSelectWidget: new (config?: Record<string, unknown>) => {
    $element: unknown;
    selectItem: (item?: unknown) => void;
    findSelectedItem: () => { getData: () => string } | null;
    on: (event: string, handler: (item?: unknown) => void) => void;
  };
  TabOptionWidget: new (config?: Record<string, unknown>) => unknown;
  OutlineSelectWidget: new (config?: Record<string, unknown>) => {
    $element: unknown;
    on: (event: string, handler: (item?: unknown) => void) => void;
  };
  OutlineOptionWidget: new (config?: Record<string, unknown>) => unknown;
};

const OPTIONS: SelectOptionProps[] = [
  { value: "a", children: "选项A" },
  { value: "b", children: "选项B" },
  { value: "c", children: "禁用项", disabled: true },
  { value: "d", children: "危险操作", icon: "trash", flags: "destructive" },
];

/** 原版侧：SelectWidget独立使用（selected经MenuOptionWidget的selected配置） */
function OriginalSelects({ addLog }: { addLog: (msg: string) => void }) {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as SelectUi;
    const append = (name: string, widget: { $element: unknown }) => {
      register(widget);
      const el = document.createElement("div");
      el.textContent = name;
      el.appendChild(unwrapJQuery(widget.$element));
      container.appendChild(el);
    };
    const item = (data: string, label: string, config?: Record<string, unknown>) =>
      new ui.MenuOptionWidget({ data, label, ...config });

    // 基本：defaultValue=b对应原版selected:true；禁用项不可选；flags着色选项图标
    // （原版经flaggedElement类+主题变体，React经image变体类）
    const basic = new ui.SelectWidget({
      items: [
        item("a", "选项A"),
        item("b", "选项B", { selected: true }),
        item("c", "禁用项", { disabled: true }),
        item("d", "危险操作", { icon: "trash", flags: "destructive" }),
      ],
    });
    // select（值变化）与choose（每次选定）分别成日志，与React侧onChange/onChoose对称
    basic.on("select", (it) =>
      addLog(`原版 select ${String((it as { getData: () => string }).getData())}`),
    );
    basic.on("choose", (it) =>
      addLog(`原版 choose ${String((it as { getData: () => string }).getData())}`),
    );
    append("基本（初始选中B）", basic);

    // 分组标题：MenuSectionOptionWidget（不可选）
    const grouped = new ui.SelectWidget({
      items: [
        new ui.MenuSectionOptionWidget({ label: "第一组" }),
        item("a", "选项A"),
        new ui.MenuSectionOptionWidget({ label: "第二组" }),
        item("b", "选项B", { selected: true }),
      ],
    });
    append("分组标题", grouped);

    // 多选展示：multiselect使列表根输出aria-multiselectable=true（React对应selectedValues），
    // 多个selected同时呈选中态；选项集与React侧OPTIONS一致
    const multi = new ui.SelectWidget({
      multiselect: true,
      items: [
        item("a", "选项A", { selected: true }),
        item("b", "选项B"),
        item("c", "禁用项", { disabled: true, selected: true }),
        item("d", "危险操作", { icon: "trash", flags: "destructive" }),
      ],
    });
    append("多选展示", multi);

    // clearOnChoose：选定后清除选中态（React为clearOnChoose prop）
    const clearOnChoose = new ui.SelectWidget({
      items: [item("a", "选项A"), item("b", "选项B", { selected: true })],
    });
    clearOnChoose.on("choose", (it) => {
      addLog(
        `原版 clearOnChoose choose ${String((it as { getData: () => string }).getData())}`,
      );
      clearOnChoose.selectItem();
    });
    append("clearOnChoose", clearOnChoose);

    // 受控：外部按钮selectItem程序化改选；行名的当前值随select事件同步，与React侧
    // 「受控（当前值：x）」动态行名一致
    const controlledItems = [
      item("a", "选项A"),
      item("b", "选项B", { selected: true }),
      item("c", "禁用项", { disabled: true }),
      item("d", "危险操作", { icon: "trash", flags: "destructive" }),
    ];
    const controlled = new ui.SelectWidget({ items: controlledItems });
    register(controlled);
    const controlledRow = document.createElement("div");
    controlledRow.append("受控（当前值：");
    const controlledValue = document.createElement("span");
    controlledValue.textContent = "b";
    controlledRow.append(controlledValue, "）");
    controlledRow.appendChild(unwrapJQuery(controlled.$element));
    controlled.on("select", () => {
      const selected = controlled.findSelectedItem();
      if (selected) {
        controlledValue.textContent = String(selected.getData());
      }
    });
    const changeButton = document.createElement("button");
    changeButton.type = "button";
    changeButton.textContent = "程序化选中A";
    changeButton.addEventListener("click", () =>
      controlled.selectItem(controlledItems[0]),
    );
    controlledRow.appendChild(changeButton);
    container.appendChild(controlledRow);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactSelects({ addLog }: { addLog: (msg: string) => void }) {
  const [value, setValue] = useState<string | number>("b");

  return (
    <div>
      <div>
        基本（初始选中B）
        <Select
          defaultValue="b"
          options={OPTIONS}
          onChange={(v) => addLog(`change ${v}`)}
          onChoose={(v) => addLog(`choose ${v}`)}
        />
      </div>
      <div>
        分组标题
        <Select
          defaultValue="b"
          options={[
            { children: "第一组" },
            { value: "a", children: "选项A" },
            { children: "第二组" },
            { value: "b", children: "选项B" },
          ]}
        />
      </div>
      <div>
        多选展示
        <Select selectedValues={["a", "c"]} options={OPTIONS} />
      </div>
      <div>
        clearOnChoose
        <Select
          clearOnChoose
          defaultValue="b"
          options={[
            { value: "a", children: "选项A" },
            { value: "b", children: "选项B" },
          ]}
          onChoose={(v) => addLog(`clearOnChoose choose ${v}`)}
        />
      </div>
      <div>
        受控（当前值：{String(value)}）
        <Select value={value} onChange={setValue} options={OPTIONS} />
        <button type="button" onClick={() => setValue("a")}>
          程序化选中A
        </button>
      </div>
    </div>
  );
}

/** 原版侧：受控高亮（highlightItem）与listWrapsAround=false子类（static端点不环绕） */
function OriginalHighlight({ addLog }: { addLog: (msg: string) => void }) {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    type HighlightOption = { getData: () => string };
    // SelectWidget需highlightItem通道、MenuOptionWidget需要getData返回值，其余沿用SelectUi的形态
    const ui = oo.ui as unknown as Omit<SelectUi, "SelectWidget" | "MenuOptionWidget"> & {
      SelectWidget: new (config?: Record<string, unknown>) => {
        $element: unknown;
        selectItem: (item?: unknown) => void;
        on: (event: string, handler: (item?: unknown) => void) => void;
        highlightItem: (item?: unknown) => void;
      };
      MenuOptionWidget: new (config?: Record<string, unknown>) => HighlightOption;
    };
    const item = (data: string, label: string) =>
      new ui.MenuOptionWidget({ data, label });
    const items: Record<string, HighlightOption> = {
      a: item("a", "选项A"),
      b: item("b", "选项B"),
    };

    // 受控高亮：外部按钮调用highlightItem（React为highlightedValue受控）
    const highlight = new ui.SelectWidget({ items: [items.a, items.b] });
    highlight.on("highlight", (it) =>
      addLog(
        `原版 highlight ${it ? String((it as { getData: () => string }).getData()) : "清除"}`,
      ),
    );
    register(highlight);
    const highlightRow = document.createElement("div");
    highlightRow.textContent = "受控高亮";
    highlightRow.appendChild(unwrapJQuery(highlight.$element));
    container.appendChild(highlightRow);
    const highlightBar = document.createElement("div");
    for (const [name, opt] of Object.entries(items)) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `高亮${name.toUpperCase()}`;
      button.addEventListener("click", () => highlight.highlightItem(opt));
      highlightBar.appendChild(button);
    }
    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.textContent = "清除高亮";
    clearButton.addEventListener("click", () => highlight.highlightItem(null));
    highlightBar.appendChild(clearButton);
    container.appendChild(highlightBar);

    // 原版键盘导航开关挂SelectWidget的static（dist/oojs-ui.js:7332起），子类覆写static生效；
    // TS下无OO.inheritClass，经原型搭桥构造子类并继承static
    const makeStaticSubclass = (staticOverrides: Record<string, unknown>) => {
      const Sub = function (this: unknown, config: Record<string, unknown>) {
        (
          ui.SelectWidget as unknown as (
            this: unknown,
            c: Record<string, unknown>,
          ) => void
        ).call(this, config);
      } as unknown as {
        prototype: unknown;
        static: Record<string, unknown>;
        new (config?: Record<string, unknown>): { $element: unknown };
      };
      Sub.prototype = Object.create(
        (ui.SelectWidget as unknown as { prototype: object }).prototype,
      );
      Sub.static = Object.create(
        (ui.SelectWidget as unknown as { static: Record<string, unknown> }).static,
      );
      Object.assign(Sub.static, staticOverrides);
      return Sub;
    };

    // listWrapsAround=false：聚焦后按↓到末项停在端点（原版经static配置，子类覆写）
    const NoWrapSelect = makeStaticSubclass({ listWrapsAround: false });
    const noWrap = new NoWrapSelect({
      items: [item("a", "选项A"), item("b", "选项B"), item("c", "选项C")],
    });
    register(noWrap);
    const noWrapRow = document.createElement("div");
    noWrapRow.textContent = "listWrapsAround=false（聚焦后按↓到末项停在端点）";
    noWrapRow.appendChild(unwrapJQuery(noWrap.$element));
    container.appendChild(noWrapRow);

    // handleNavigationKeys：聚焦后Home/End/PageUp/PageDown生效（SelectWidget static缺省false）
    const HandleNavSelect = makeStaticSubclass({ handleNavigationKeys: true });
    const handleNav = new HandleNavSelect({
      items: [
        item("a", "选项A"),
        item("b", "选项B"),
        item("c", "选项C"),
        item("d", "选项D"),
        item("e", "选项E"),
      ],
    });
    register(handleNav);
    const handleNavRow = document.createElement("div");
    handleNavRow.textContent =
      "handleNavigationKeys（聚焦后Home/End/PageUp/PageDown生效）";
    handleNavRow.appendChild(unwrapJQuery(handleNav.$element));
    container.appendChild(handleNavRow);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：highlightedValue受控高亮、listWrapsAround={false}、handleNavigationKeys */
function ReactHighlight({ addLog }: { addLog: (msg: string) => void }) {
  const [highlighted, setHighlighted] = useState<string | number | undefined>();

  return (
    <div>
      <div>
        受控高亮（当前高亮：{highlighted ? String(highlighted) : "无"}）
        <Select
          highlightedValue={highlighted}
          onHighlightedChange={(v) => {
            addLog(`highlight ${v ? String(v) : "清除"}`);
            setHighlighted(v);
          }}
          options={[
            { value: "a", children: "选项A" },
            { value: "b", children: "选项B" },
          ]}
        />
        <button type="button" onClick={() => setHighlighted("a")}>
          高亮A
        </button>
        <button type="button" onClick={() => setHighlighted("b")}>
          高亮B
        </button>
        <button type="button" onClick={() => setHighlighted(undefined)}>
          清除高亮
        </button>
      </div>
      <div>
        listWrapsAround=false（聚焦后按↓到末项停在端点）
        <Select
          listWrapsAround={false}
          options={[
            { value: "a", children: "选项A" },
            { value: "b", children: "选项B" },
            { value: "c", children: "选项C" },
          ]}
        />
      </div>
      <div>
        handleNavigationKeys（聚焦后Home/End/PageUp/PageDown生效）
        <Select
          handleNavigationKeys
          options={[
            { value: "a", children: "选项A" },
            { value: "b", children: "选项B" },
            { value: "c", children: "选项C" },
            { value: "d", children: "选项D" },
            { value: "e", children: "选项E" },
          ]}
        />
      </div>
    </div>
  );
}

/** 原版侧：TabSelectWidget（framed默认true，选中经TabOptionWidget.selected） */
function OriginalTabSelects({ addLog }: { addLog: (msg: string) => void }) {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as SelectUi;
    const append = (name: string, widget: { $element: unknown }) => {
      register(widget);
      const el = document.createElement("div");
      el.textContent = name;
      el.appendChild(unwrapJQuery(widget.$element));
      container.appendChild(el);
    };
    const tab = (data: string, label: string, config?: Record<string, unknown>) =>
      new ui.TabOptionWidget({ data, label, ...config });

    const framed = new ui.TabSelectWidget({
      items: [
        tab("t1", "一"),
        tab("t2", "二", { selected: true }),
        tab("t3", "禁用", { disabled: true }),
      ],
    });
    append("framed默认", framed);

    const frameless = new ui.TabSelectWidget({
      framed: false,
      items: [tab("t1", "一"), tab("t2", "二", { selected: true })],
    });
    append("framed=false", frameless);

    // 受控演示：外部按钮selectItem程序化改选
    const controlledItems = [tab("t1", "一"), tab("t2", "二", { selected: true })];
    const controlled = new ui.TabSelectWidget({ items: controlledItems });
    controlled.on("select", () => {
      const selected = controlled.findSelectedItem();
      if (selected) {
        addLog(`原版 TabSelect select ${selected.getData()}`);
      }
    });
    const changeButton = document.createElement("button");
    changeButton.type = "button";
    changeButton.textContent = "程序化选中一";
    changeButton.addEventListener("click", () => {
      controlled.selectItem(controlledItems[0]);
    });
    append("受控+程序化改选", controlled);
    container.appendChild(changeButton);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactTabSelects({ addLog }: { addLog: (msg: string) => void }) {
  const [value, setValue] = useState<string | number>("t2");

  return (
    <div>
      <div>
        framed默认
        <TabSelect
          defaultValue="t2"
          options={[
            { value: "t1", children: "一" },
            { value: "t2", children: "二" },
            { value: "t3", children: "禁用", disabled: true },
          ]}
        />
      </div>
      <div>
        framed=false
        <TabSelect
          framed={false}
          defaultValue="t2"
          options={[
            { value: "t1", children: "一" },
            { value: "t2", children: "二" },
          ]}
        />
      </div>
      <div>
        受控（当前值：{String(value)}）
        <TabSelect
          value={value}
          onChange={(v) => {
            addLog(`TabSelect select ${v}`);
            setValue(v);
          }}
          options={[
            { value: "t1", children: "一" },
            { value: "t2", children: "二" },
          ]}
        />
        <button type="button" onClick={() => setValue("t1")}>
          程序化选中一
        </button>
      </div>
    </div>
  );
}

/** 原版侧：OutlineSelectWidget（OutlineOption带icon/indicator/level缩进） */
function OriginalOutlineSelects({ addLog }: { addLog: (msg: string) => void }) {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as SelectUi;
    const outline = new ui.OutlineSelectWidget({
      items: [
        // 无data的分组标题条目混入outline选项（React侧为无value的选项）
        new ui.MenuSectionOptionWidget({ label: "组名" }),
        new ui.OutlineOptionWidget({
          data: "o1",
          label: "章节一",
          icon: "image",
          level: 0,
        }),
        new ui.OutlineOptionWidget({
          data: "o2",
          label: "小节一",
          icon: "image",
          level: 1,
          selected: true,
        }),
        new ui.OutlineOptionWidget({
          data: "o3",
          label: "章节二",
          indicator: "down",
          level: 0,
        }),
      ],
    });
    outline.on("select", (it) =>
      addLog(
        `原版 Outline select ${String((it as { getData: () => string }).getData())}`,
      ),
    );
    register(outline);
    container.appendChild(unwrapJQuery(outline.$element));
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactOutlineSelects({ addLog }: { addLog: (msg: string) => void }) {
  return (
    <div>
      <OutlineSelect
        defaultValue="o2"
        onChange={(v) => addLog(`Outline select ${v}`)}
        options={[
          { children: "组名" },
          { value: "o1", children: "章节一", icon: "image", level: 0 },
          { value: "o2", children: "小节一", icon: "image", level: 1 },
          { value: "o3", children: "章节二", indicator: "down", level: 0 },
        ]}
      />
    </div>
  );
}

function SelectFamilyComparePage() {
  const [log, setLog] = useState<string[]>([]);
  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);

  return (
    <CompareLayout
      title="Select / TabSelect / OutlineSelect 对照"
      description={
        <>
          对照点：Select独立使用时聚焦后↑↓移动高亮、Enter选定、字符前缀跳转（1500ms缓冲）、
          Escape清除高亮；onChange（值变化）与onChoose（每次选定，含重复选定）分流；
          分组标题不可选；选项级flags着色选项图标；selectedValues多选展示
          （aria-multiselectable）；clearOnChoose命令菜单形态；handleNavigationKeys开启
          Home/End/PageUp/PageDown（原版经static的子类覆写）。TabSelect：framed、
          不可高亮（↑↓直接改选）、←→环绕。OutlineSelect：icon/indicator/level缩进、
          分组标题条目。原版侧静态选项经构造config，程序化改选经selectItem。
        </>
      }
    >
      <h2>Select</h2>
      <CompareColumns original={<OriginalSelects addLog={addLog} />}>
        <ReactSelects addLog={addLog} />
      </CompareColumns>

      <h2>受控高亮与键盘导航（Select）</h2>
      <CompareColumns original={<OriginalHighlight addLog={addLog} />}>
        <ReactHighlight addLog={addLog} />
      </CompareColumns>

      <h2>TabSelect</h2>
      <CompareColumns original={<OriginalTabSelects addLog={addLog} />}>
        <ReactTabSelects addLog={addLog} />
      </CompareColumns>

      <h2>OutlineSelect</h2>
      <CompareColumns original={<OriginalOutlineSelects addLog={addLog} />}>
        <ReactOutlineSelects addLog={addLog} />
      </CompareColumns>

      <h2>事件日志</h2>
      <ul>
        {log.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </CompareLayout>
  );
}

SelectFamilyComparePage.displayName = "SelectFamilyComparePage";

export default SelectFamilyComparePage;

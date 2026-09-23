import { useRef, useState } from "react";
import {
  Button,
  ButtonGroup,
  CheckboxInput,
  CheckboxMultiselect,
  FieldLayout,
  OOUIProvider,
  RadioInput,
  RadioSelect,
} from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import {
  appendValueOutput,
  createRowAppender,
  useOriginalWidgets,
} from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

type ButtonCheckboxUi = {
  ButtonWidget: new (config?: Record<string, unknown>) => {
    $element: { addClass: (cls: string) => unknown };
  };
  CheckboxInputWidget: new (config?: Record<string, unknown>) => {
    $element: unknown;
    setIndeterminate: (state: boolean) => void;
    isIndeterminate: () => boolean;
  };
};

/** 原版侧：按钮样式变体（与React侧逐行对照） */
function OriginalButtons() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as ButtonCheckboxUi;
    const row = createRowAppender(container, register);
    row(ui.ButtonWidget, "常规", { label: "Button" });
    row(ui.ButtonWidget, "primary", { label: "Primary", flags: "primary" });
    row(ui.ButtonWidget, "progressive", { label: "Progressive", flags: "progressive" });
    row(ui.ButtonWidget, "destructive", { label: "Destructive", flags: "destructive" });
    row(ui.ButtonWidget, "error", { label: "Error", flags: "error" });
    row(ui.ButtonWidget, "无边框destructive", {
      label: "Frameless",
      framed: false,
      flags: "destructive",
    });
    row(ui.ButtonWidget, "激活", { label: "Active", active: true });
    row(ui.ButtonWidget, "禁用带链接", {
      label: "Disabled",
      disabled: true,
      href: "https://www.example.com",
    });
    row(ui.ButtonWidget, "target+rel数组", {
      label: "Target",
      href: "https://www.example.com",
      target: "_blank",
      rel: ["noopener", "noreferrer"],
    });
    row(ui.ButtonWidget, "图标/指示器title", {
      label: "Titles",
      icon: "help",
      iconTitle: "图标提示",
      indicator: "down",
      indicatorTitle: "指示器提示",
    });
    // indicator其余取值行内两个按钮：Required经row()输出后，Clear补进同一行
    const requiredButton = row(ui.ButtonWidget, "indicator其余取值", {
      label: "Required",
      indicator: "required",
    });
    const clearButton = new ui.ButtonWidget({ label: "Clear", indicator: "clear" });
    register(clearButton);
    unwrapJQuery(requiredButton.$element).parentElement?.appendChild(
      unwrapJQuery(clearButton.$element),
    );
    // pressed为瞬时按压类，原版无声明式通道：静态演示经addClass（React为pressed prop）
    const pressedButton = new ui.ButtonWidget({ label: "Pressing" });
    pressedButton.$element.addClass("oo-ui-buttonElement-pressed");
    register(pressedButton);
    const pressedRow = document.createElement("div");
    pressedRow.textContent = "pressed静态按压态";
    pressedRow.appendChild(unwrapJQuery(pressedButton.$element));
    container.appendChild(pressedRow);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactButtons({ addLog }: { addLog: (msg: string) => void }) {
  const anchorRef = useRef<HTMLAnchorElement | null>(null);

  return (
    <div>
      {/* 名称与控件同行，与原版row()的div行结构一致（块级widget入p不合规），保证两侧逐行对照 */}
      <div>
        常规<Button onClick={() => addLog("click 常规")}>Button</Button>
      </div>
      <div>
        primary<Button flags="primary">Primary</Button>
      </div>
      <div>
        progressive<Button flags="progressive">Progressive</Button>
      </div>
      <div>
        destructive<Button flags="destructive">Destructive</Button>
      </div>
      <div>
        error<Button flags="error">Error</Button>
      </div>
      <div>
        无边框destructive
        <Button framed={false} flags="destructive">
          Frameless
        </Button>
      </div>
      <div>
        激活<Button active>Active</Button>
      </div>
      <div>
        禁用带链接
        <Button disabled href="https://www.example.com">
          Disabled
        </Button>
      </div>
      <div>
        target+rel数组
        <Button
          href="https://www.example.com"
          target="_blank"
          rel={["noopener", "noreferrer"]}
        >
          Target
        </Button>
      </div>
      <div>
        图标/指示器title
        <Button
          icon="help"
          iconProps={{ title: "图标提示" }}
          indicator="down"
          indicatorProps={{ title: "指示器提示" }}
        >
          Titles
        </Button>
      </div>
      <div>
        indicator其余取值
        <Button indicator="required">Required</Button>
        <Button indicator="clear">Clear</Button>
      </div>
      <div>
        pressed静态按压态
        <Button pressed>Pressing</Button>
      </div>
      <div>
        {/* anchorRef为React侧逃生舱：组件ref指向外层span，内部<a>经此获取并编程聚焦
            （原版$button为公开属性，无对应配置形态），置于区块末尾保持逐行对照 */}
        anchorRef（按钮编程聚焦）
        <Button anchorRef={anchorRef}>Anchor</Button>
        <button type="button" onClick={() => anchorRef.current?.focus()}>
          聚焦锚点
        </button>
      </div>
    </div>
  );
}

/** 原版侧：CheckboxInput（半选行经setIndeterminate切换，与React侧受控演示对称） */
function OriginalCheckboxes() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as ButtonCheckboxUi;
    const row = createRowAppender(container, register);
    // 行顺序与React侧保持一一对应
    row(ui.CheckboxInputWidget, "常规", { selected: false });
    row(ui.CheckboxInputWidget, "选中", { selected: true });

    // 半选行的切换按钮单独构建（行内含原生button）
    const halfCheckbox = new ui.CheckboxInputWidget({ indeterminate: true });
    register(halfCheckbox);
    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.textContent = "切换indeterminate";
    toggleButton.addEventListener("click", () => {
      halfCheckbox.setIndeterminate(!halfCheckbox.isIndeterminate());
    });
    const halfRow = document.createElement("div");
    halfRow.textContent = "半选";
    halfRow.append(toggleButton, unwrapJQuery(halfCheckbox.$element));
    container.appendChild(halfRow);

    row(ui.CheckboxInputWidget, "必填", { required: true, selected: false });
    row(ui.CheckboxInputWidget, "禁用", { disabled: true, selected: true });
    // FieldLayout包裹：label经for关联字段id（React对应inputId+FieldLayout通道A）
    const linkedCheckbox = new ui.CheckboxInputWidget({ selected: false });
    register(linkedCheckbox);
    const linkedField = new (
      oo.ui as unknown as {
        FieldLayout: new (
          field: unknown,
          config?: Record<string, unknown>,
        ) => { $element: unknown };
      }
    ).FieldLayout(linkedCheckbox, { label: "点击标签勾选", align: "left" });
    register(linkedField);
    const linkedRow = document.createElement("div");
    linkedRow.textContent = "FieldLayout联动";
    linkedRow.appendChild(unwrapJQuery(linkedField.$element));
    container.appendChild(linkedRow);

    row(ui.CheckboxInputWidget, "accessKey（title附[k]）", {
      selected: false,
      accessKey: "c",
    });
    // InputWidget的value：表单提交值落原生input的value，不影响勾选态（React为value prop）
    row(ui.CheckboxInputWidget, "提交值value", { value: "提交值", selected: true });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactCheckboxes({
  addLog,
  indeterminate,
  toggleIndeterminate,
}: {
  addLog: (msg: string) => void;
  indeterminate: boolean;
  toggleIndeterminate: () => void;
}) {
  const checkboxRef = useRef<HTMLInputElement | null>(null);
  return (
    <div>
      <div>
        常规
        <CheckboxInput onChange={(value) => addLog(`change 常规=${value}`)} />
      </div>
      <div>
        选中
        <CheckboxInput
          defaultChecked
          onChange={(value) => addLog(`change 选中=${value}`)}
        />
      </div>
      <div>
        半选
        <button type="button" onClick={toggleIndeterminate}>
          切换indeterminate
        </button>
        <CheckboxInput indeterminate={indeterminate} />
      </div>
      <div>
        必填
        <CheckboxInput required />
      </div>
      <div>
        禁用
        <CheckboxInput disabled checked />
      </div>
      <div>
        FieldLayout联动
        <FieldLayout label="点击标签勾选" align="left">
          <CheckboxInput inputId="pg-linked-checkbox" />
        </FieldLayout>
      </div>
      <div>
        accessKey（title附[k]）
        <CheckboxInput accessKey="c" />
      </div>
      <div>
        提交值value
        <CheckboxInput value="提交值" defaultChecked />
      </div>
      <div>
        {/* getAccessKeyLabel为React侧Provider配置（对应MediaWiki侧jquery.accessKeyLabel），无对照形态 */}
        Provider getAccessKeyLabel（title后缀改为宿主提供的组合键文案）
        <OOUIProvider getAccessKeyLabel={(key) => (key === "c" ? "Alt+Shift+C" : key)}>
          <CheckboxInput accessKey="c" />
        </OOUIProvider>
      </div>
      <div>
        {/* inputRef为React侧逃生舱：获取原生input引用用于聚焦 */}
        inputRef（按钮编程聚焦）
        <CheckboxInput inputRef={checkboxRef} />
        <button type="button" onClick={() => checkboxRef.current?.focus()}>
          聚焦input
        </button>
      </div>
    </div>
  );
}

type RadioUi = {
  RadioInputWidget: new (config?: Record<string, unknown>) => {
    $element: unknown;
    /** 原生input的jQuery对象（change事件监听落点，RadioInputWidget自身不跟踪状态） */
    $input: unknown;
    setSelected: (state: boolean) => void;
    isSelected: () => boolean;
  };
};

/** 原版侧：RadioInput（受控行经setSelected切换，与React受控演示对称） */
function OriginalRadios() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as RadioUi;
    const row = createRowAppender(container, register);
    row(ui.RadioInputWidget, "常规", { selected: false });
    row(ui.RadioInputWidget, "选中", { selected: true });
    row(ui.RadioInputWidget, "禁用", { disabled: true, selected: true });
    row(ui.RadioInputWidget, "name分组", { name: "pg-radio-group", selected: false });
    // InputWidget的value：表单提交值落原生input的value，不影响勾选态（React为value prop）
    row(ui.RadioInputWidget, "提交值value", { value: "提交值", selected: true });

    // 受控行：按钮驱动setSelected（原版无受控props，选中态存于原生input），行尾读数
    const controlled = new ui.RadioInputWidget({ selected: true });
    register(controlled);
    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.textContent = "切换选中";
    const controlledRow = document.createElement("div");
    controlledRow.textContent = "受控";
    controlledRow.append(toggleButton, unwrapJQuery(controlled.$element));
    // 行尾读数：setSelected程序化切换不发事件，按钮回调内手动同步
    const writeSelected = appendValueOutput(controlled);
    const syncSelected = () => {
      writeSelected(controlled.isSelected() ? "已选中" : "未选中");
    };
    toggleButton.addEventListener("click", () => {
      controlled.setSelected(!controlled.isSelected());
      syncSelected();
    });
    // 用户点击radio触发原生change事件，监听同步读数
    unwrapJQuery(controlled.$input).addEventListener("change", syncSelected);
    syncSelected();
    container.appendChild(controlledRow);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactRadios({ addLog }: { addLog: (msg: string) => void }) {
  // 受控演示：checked真实驱动选中态，与原版侧按钮驱动setSelected对称
  const [checked, setChecked] = useState(true);
  return (
    <div>
      <div>
        常规
        <RadioInput onChange={(v) => addLog(`change 常规=${v}`)} />
      </div>
      <div>
        选中
        <RadioInput defaultChecked />
      </div>
      <div>
        禁用
        <RadioInput disabled checked />
      </div>
      <div>
        {/* 两侧组名不同是必要的：同文档同名radio归为同一分组，会跨侧联动互斥 */}
        name分组
        <RadioInput name="pg-radio-react-group" />
      </div>
      <div>
        提交值value
        <RadioInput value="提交值" defaultChecked />
      </div>
      <div>
        受控
        {/* 切换按钮对应原版侧同款：程序化置选中（点击radio本身则经onChange回写） */}
        <button type="button" onClick={() => setChecked((v) => !v)}>
          切换选中
        </button>
        <RadioInput
          checked={checked}
          onChange={(v) => {
            addLog(`change 受控=${v}`);
            setChecked(v);
          }}
        />
        <span className="cmp-value">{checked ? "已选中" : "未选中"}</span>
      </div>
    </div>
  );
}

type SelectUi = {
  RadioSelectWidget: new (config?: Record<string, unknown>) => {
    $element: unknown;
    /** SelectWidget继承的select事件与selectItem程序化改选通道 */
    on: (event: string, handler: (item: unknown) => void) => void;
    selectItem: (item?: unknown) => void;
  };
  RadioOptionWidget: new (config?: Record<string, unknown>) => unknown;
  CheckboxMultiselectWidget: new (config?: Record<string, unknown>) => {
    $element: unknown;
  };
  CheckboxMultioptionWidget: new (config?: Record<string, unknown>) => unknown;
};

/** 原版侧：RadioSelect（radiogroup聚焦，↑↓←→在非禁用项间移动） */
function OriginalRadioSelect({ addLog }: { addLog: (msg: string) => void }) {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as SelectUi;
    const row = createRowAppender(container, register);
    const radioSelect = new ui.RadioSelectWidget({
      items: [
        new ui.RadioOptionWidget({ data: "a", label: "选项A" }),
        new ui.RadioOptionWidget({ data: "b", label: "选项B", selected: true }),
        new ui.RadioOptionWidget({ data: "c", label: "禁用项", disabled: true }),
      ],
    });
    register(radioSelect);
    container.appendChild(unwrapJQuery(radioSelect.$element));

    // 整组禁用：选项未声明disabled随组禁用、键盘导航跳过（React为disabled prop）
    row(ui.RadioSelectWidget, "整组禁用", {
      disabled: true,
      items: [
        new ui.RadioOptionWidget({ data: "a", label: "选项A" }),
        new ui.RadioOptionWidget({ data: "b", label: "选项B" }),
      ],
    });

    // 受控行：按钮驱动selectItem程序化改选，select事件入日志（React为value+onChange）
    const controlledItems = [
      new ui.RadioOptionWidget({ data: "a", label: "选项A", selected: true }),
      new ui.RadioOptionWidget({ data: "b", label: "选项B" }),
      new ui.RadioOptionWidget({ data: "c", label: "选项C" }),
    ];
    const controlled = new ui.RadioSelectWidget({ items: controlledItems });
    register(controlled);
    const syncControlledReadout = (item: unknown) => {
      controlledReadout.textContent = `受控当前选中：${String((item as { data?: unknown } | null)?.data)}`;
    };
    controlled.on("select", (item) => {
      addLog(`原版受控 select=${String((item as { data?: unknown } | null)?.data)}`);
      syncControlledReadout(item);
    });
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "程序化选中选项C";
    button.addEventListener("click", () => controlled.selectItem(controlledItems[2]));
    const controlledRow = document.createElement("div");
    controlledRow.textContent = "受控";
    controlledRow.append(button, unwrapJQuery(controlled.$element));
    container.appendChild(controlledRow);
    // 当前选中读数（与React侧「受控当前选中」行对应）
    const controlledReadout = document.createElement("p");
    syncControlledReadout(controlledItems[0]);
    container.appendChild(controlledReadout);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：RadioSelect（defaultValue对应原版OptionWidget的selected） */
function ReactRadioSelect({ addLog }: { addLog: (msg: string) => void }) {
  const [value, setValue] = useState<string | number>("a");

  return (
    <>
      <RadioSelect
        name="compare-radio"
        defaultValue="b"
        options={[
          { value: "a", children: "选项A" },
          { value: "b", children: "选项B" },
          { value: "c", children: "禁用项", disabled: true },
        ]}
      />
      <div>
        整组禁用
        <RadioSelect
          disabled
          options={[
            { value: "a", children: "选项A" },
            { value: "b", children: "选项B" },
          ]}
        />
      </div>
      <div>
        受控
        <button type="button" onClick={() => setValue("c")}>
          程序化选中选项C
        </button>
        <RadioSelect
          name="compare-radio-controlled"
          value={value}
          onChange={(v) => {
            // onChange在取消选中时为undefined（radiogroup交互不会触发），收窄以维持受控态
            if (v === undefined) {
              return;
            }
            addLog(`React受控 select=${String(v)}`);
            setValue(v);
          }}
          options={[
            { value: "a", children: "选项A" },
            { value: "b", children: "选项B" },
            { value: "c", children: "选项C" },
          ]}
        />
      </div>
      <p>受控当前选中：{String(value)}</p>
    </>
  );
}

/** 原版侧：CheckboxMultiselect（支持Shift+点击范围选择） */
function OriginalMultiselect() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as SelectUi;
    const row = createRowAppender(container, register);
    // 读数需要 isSelected/getData/on，原版类型形状里没有，统一放宽
    const multiItems = [
      new ui.CheckboxMultioptionWidget({ data: "a", label: "选项A", selected: true }),
      new ui.CheckboxMultioptionWidget({ data: "b", label: "选项B" }),
      new ui.CheckboxMultioptionWidget({ data: "c", label: "禁用项", disabled: true }),
    ] as unknown as Array<{
      $element: unknown;
      isSelected: () => boolean;
      getData: () => unknown;
      on: (event: string, handler: () => void) => void;
    }>;
    const multiselect = new ui.CheckboxMultiselectWidget({ items: multiItems });
    register(multiselect);
    container.appendChild(unwrapJQuery(multiselect.$element));
    // 当前选中读数（与React侧「当前选中」行对应）：汇总各选项勾选态
    const selectedReadout = document.createElement("p");
    const syncSelectedReadout = () => {
      selectedReadout.textContent = `当前选中：${JSON.stringify(
        multiItems.filter((item) => item.isSelected()).map((item) => item.getData()),
      )}`;
    };
    for (const item of multiItems) {
      item.on("change", syncSelectedReadout);
    }
    syncSelectedReadout();
    container.appendChild(selectedReadout);

    // 整组禁用：选项未声明disabled随组禁用、键盘导航跳过（React为disabled prop）
    row(ui.CheckboxMultiselectWidget, "整组禁用", {
      disabled: true,
      items: [
        new ui.CheckboxMultioptionWidget({ data: "a", label: "选项A" }),
        new ui.CheckboxMultioptionWidget({ data: "b", label: "选项B" }),
      ],
    });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactMultiselect({ addLog }: { addLog: (msg: string) => void }) {
  // 非受控defaultValue对应原版选项的selected: true，读数经onChange镜像内部选中集
  const [selected, setSelected] = useState<Array<string | number>>(["a"]);

  return (
    <>
      <CheckboxMultiselect
        options={[
          { value: "a", children: "选项A" },
          { value: "b", children: "选项B" },
          { value: "c", children: "禁用项", disabled: true },
        ]}
        defaultValue={["a"]}
        name="compare-multiselect"
        onChange={(values) => {
          addLog(`React select=${JSON.stringify(values)}`);
          setSelected(values);
        }}
      />
      <p>当前选中：{JSON.stringify(selected)}</p>
      <div>
        整组禁用
        <CheckboxMultiselect
          disabled
          options={[
            { value: "a", children: "选项A" },
            { value: "b", children: "选项B" },
          ]}
        />
      </div>
    </>
  );
}

type ButtonGroupUi = {
  ButtonGroupWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  ButtonWidget: new (config?: Record<string, unknown>) => unknown;
};

/** 原版侧：ButtonGroup（整组禁用经ButtonGroupWidget的disabled） */
function OriginalButtonGroups() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as ButtonGroupUi;
    const append = ($element: unknown) => {
      container.appendChild(unwrapJQuery($element));
      container.appendChild(document.createElement("br"));
    };
    const makeGroup = (disabled: boolean) =>
      new ui.ButtonGroupWidget({
        disabled,
        items: [
          new ui.ButtonWidget({ label: "One", icon: "tag" }),
          new ui.ButtonWidget({ label: "Two" }),
          new ui.ButtonWidget({ label: "Three", disabled: true }),
        ],
      });
    const group = makeGroup(false);
    const disabledGroup = makeGroup(true);
    register(group, disabledGroup);
    append(group.$element);
    append(disabledGroup.$element);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactButtonGroups() {
  return (
    <div>
      {/* 与原版侧一致：ButtonGroup为inline-block且无纵向margin，用br换行分隔（原版亦为group+br成对输出） */}
      <ButtonGroup>
        <Button icon="tag">One</Button>
        <Button>Two</Button>
        <Button disabled>Three</Button>
      </ButtonGroup>
      <br />
      <ButtonGroup disabled>
        <Button icon="tag">One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <br />
    </div>
  );
}

function ButtonCheckboxComparePage() {
  const [log, setLog] = useState<string[]>([]);
  const [indeterminate, setIndeterminate] = useState(true);

  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);

  return (
    <CompareLayout
      title="Button / CheckboxInput 对照"
      description={
        <>
          对照点：图标/指示器变体类（primary/progressive/destructive/error/invert、激活、禁用）、
          禁用时移除href、target与rel数组拼接、mousedown阻止焦点转移且按钮外松开复位、
          Enter/空格触发click（keypress时机）、图标/指示器title提示、半选indeterminate、
          required落点、FieldLayout标签联动（for关联字段id）、
          indicator其余取值（required/clear）与pressed静态按压态（原版无声明式通道，
          经addClass静态演示）。RadioSelect/CheckboxMultiselect：radiogroup聚焦与方向键导航、
          Shift+点击范围选择、整组禁用（选项未声明disabled随组禁用、键盘导航跳过）、
          RadioSelect受控value与原版selectItem程序化改选对照、CheckboxMultiselect非受控defaultValue。
          RadioInput：单选形态与受控/非受控勾选。CheckboxInput/RadioInput：
          value为表单提交值落原生input、不影响勾选态。Button：anchorRef编程聚焦内部锚点
          （React侧逃生舱）。
        </>
      }
    >
      <h2>Button样式变体</h2>
      <CompareColumns original={<OriginalButtons />}>
        <ReactButtons addLog={addLog} />
      </CompareColumns>

      <h2>CheckboxInput</h2>
      <CompareColumns original={<OriginalCheckboxes />}>
        <ReactCheckboxes
          addLog={addLog}
          indeterminate={indeterminate}
          toggleIndeterminate={() => setIndeterminate((v) => !v)}
        />
      </CompareColumns>

      <h2>RadioInput</h2>
      <CompareColumns original={<OriginalRadios />}>
        <ReactRadios addLog={addLog} />
      </CompareColumns>

      <h2>RadioSelect</h2>
      <CompareColumns original={<OriginalRadioSelect addLog={addLog} />}>
        <ReactRadioSelect addLog={addLog} />
      </CompareColumns>

      <h2>CheckboxMultiselect</h2>
      <CompareColumns original={<OriginalMultiselect />}>
        <ReactMultiselect addLog={addLog} />
      </CompareColumns>

      <h2>ButtonGroup</h2>
      <CompareColumns original={<OriginalButtonGroups />}>
        <ReactButtonGroups />
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

ButtonCheckboxComparePage.displayName = "ButtonCheckboxComparePage";

export default ButtonCheckboxComparePage;

import { useRef, useState } from "react";
import { IndexLayout } from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import { useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

function OriginalIndexLayout() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const TabPanel = oo.ui.TabPanelLayout as unknown as new (
      name: string,
      config?: Record<string, unknown>,
    ) => { $element: { append: (...args: unknown[]) => void } };
    const Index = oo.ui.IndexLayout as unknown as new (
      config?: Record<string, unknown>,
    ) => { $element: unknown; addTabPanels: (panels: unknown[]) => void };

    const panel1 = new TabPanel("one", { label: "第一个页签" });
    panel1.$element.append("<p>第一个页签内容（纯文本）</p>");
    const panel2 = new TabPanel("two", { label: "第二个页签" });
    panel2.$element.append(
      "<p>第二个页签含可聚焦元素：</p>",
      '<input placeholder="可聚焦输入框">',
      '<button type="button">可聚焦按钮</button>',
    );
    const panel3 = new TabPanel("three", { label: "第三个页签" });
    panel3.$element.append("<p>第三个页签内容</p>");

    const index = new Index();
    register(index);
    index.addTabPanels([panel1, panel2, panel3]);
    container.appendChild(unwrapJQuery(index.$element));
  });

  return (
    <div>
      <p>点击页签切换；聚焦页签栏后←→切换观察自动聚焦</p>
      <div ref={containerRef} />
    </div>
  );
}

/** 原版侧：framed/continuous/autoFocus变体、受控setTabPanel、禁用页签与面板props */
function OriginalIndexVariants({ addLog }: { addLog: (msg: string) => void }) {
  const indexRef = useRef<{ setTabPanel: (name: string) => void } | null>(null);
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const TabPanel = oo.ui.TabPanelLayout as unknown as new (
      name: string,
      config?: Record<string, unknown>,
    ) => { $element: { append: (...args: unknown[]) => void } };
    const Index = oo.ui.IndexLayout as unknown as new (
      config?: Record<string, unknown>,
    ) => {
      $element: unknown;
      addTabPanels: (panels: unknown[]) => void;
      setTabPanel: (name: string) => void;
      tabSelectWidget: {
        on: (event: string, handler: (item: { getData: () => string }) => void) => void;
      };
    };

    // 验证无边框 + 全部页可见 + 抑制自动聚焦
    const variantPanels = [
      { name: "one", label: "第一页" },
      { name: "two", label: "第二页" },
    ].map(({ name, label }) => {
      const panel = new TabPanel(name, { label, padded: true, framed: true });
      panel.$element.append(`<p>${label}内容。</p>`);
      return panel;
    });
    const variant = new Index({
      framed: false,
      continuous: true,
      autoFocus: false,
      expanded: false,
    });
    register(variant);
    variant.addTabPanels(variantPanels);
    const variantBox = document.createElement("div");
    variantBox.textContent = "framed=false+continuous+autoFocus=false";
    variantBox.appendChild(unwrapJQuery(variant.$element));
    container.appendChild(variantBox);

    // 受控切换 + 禁用页签 + 面板padded
    const controlledPanels = [
      { name: "one", label: "常规", padded: true },
      { name: "two", label: "禁用页签", disabled: true },
      { name: "three", label: "第三页", padded: true },
    ].map(({ name, label, padded, disabled }) => {
      const panel = new TabPanel(name, {
        label,
        padded,
        framed: true,
        tabItemConfig: { disabled },
      });
      panel.$element.append(`<p>${label}内容${padded ? "（padded）" : ""}。</p>`);
      return panel;
    });
    const controlled = new Index({ expanded: false });
    register(controlled);
    controlled.addTabPanels(controlledPanels);
    controlled.tabSelectWidget.on("select", (item) =>
      addLog(`原版 set ${item.getData()}`),
    );
    const controlledBox = document.createElement("div");
    controlledBox.textContent = "受控+禁用页签";
    controlledBox.appendChild(unwrapJQuery(controlled.$element));
    container.appendChild(controlledBox);
    const switchButton = document.createElement("button");
    switchButton.type = "button";
    switchButton.textContent = "程序化切到第三页";
    switchButton.addEventListener("click", () => controlled.setTabPanel("three"));
    controlledBox.appendChild(switchButton);
    indexRef.current = controlled;

    // openMatchedPanels：原版IndexLayout构造通道（缺省true，经contentPanel的
    // setHideUntilFound下发并在堆栈根元素挂beforematch），非激活面板
    // hidden="until-found"，浏览器查找命中即切页
    const matchedPanels = [
      { name: "one", label: "第一页", text: "第一页内容（当前可见）。" },
      {
        name: "two",
        label: "第二页",
        text: "第二页隐藏内容：查找命中或beforematch后切到这里。",
      },
    ].map(({ name, label, text }) => {
      const panel = new TabPanel(name, { label, padded: true, framed: true });
      panel.$element.append(`<p>${text}</p>`);
      return panel;
    });
    const matched = new Index({ openMatchedPanels: true, expanded: false });
    register(matched);
    matched.addTabPanels(matchedPanels);
    const matchedBox = document.createElement("div");
    matchedBox.textContent =
      "openMatchedPanels（非激活面板until-found，可被查找命中激活）";
    matchedBox.appendChild(unwrapJQuery(matched.$element));
    // 原版beforematch监听在堆栈根元素（冒泡阶段），模拟事件须bubbles才能到达
    const matchButton = document.createElement("button");
    matchButton.type = "button";
    matchButton.textContent = "模拟查找命中（派发beforematch）";
    matchButton.addEventListener("click", () => {
      const stack = unwrapJQuery(matched.$element) as HTMLElement;
      const panel = stack.querySelector<HTMLDivElement>('[hidden="until-found"]');
      panel?.dispatchEvent(new Event("beforematch", { bubbles: true }));
    });
    matchedBox.appendChild(matchButton);
    container.appendChild(matchedBox);

    const noMatchPanels = [
      { name: "one", label: "第一页", text: "第一页内容（当前可见）。" },
      { name: "two", label: "第二页", text: "第二页内容（直接hidden）。" },
    ].map(({ name, label, text }) => {
      const panel = new TabPanel(name, { label, padded: true, framed: true });
      panel.$element.append(`<p>${text}</p>`);
      return panel;
    });
    const noMatch = new Index({ openMatchedPanels: false, expanded: false });
    register(noMatch);
    noMatch.addTabPanels(noMatchPanels);
    const noMatchBox = document.createElement("div");
    noMatchBox.textContent =
      "openMatchedPanels=false（非激活面板直接hidden，不响应查找）";
    noMatchBox.appendChild(unwrapJQuery(noMatch.$element));
    container.appendChild(noMatchBox);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactIndexVariants({ addLog }: { addLog: (msg: string) => void }) {
  const [value, setValue] = useState<string | number>("one");

  return (
    <div>
      <div>
        framed=false+continuous+autoFocus=false
        <IndexLayout
          framed={false}
          continuous
          autoFocus={false}
          expanded={false}
          defaultValue="one"
          options={[
            {
              value: "one",
              label: "第一页",
              padded: true,
              framed: true,
              children: <p>第一页内容。</p>,
            },
            {
              value: "two",
              label: "第二页",
              padded: true,
              framed: true,
              children: <p>第二页内容。</p>,
            },
          ]}
        />
      </div>
      <div>
        受控+禁用页签
        <IndexLayout
          expanded={false}
          value={value}
          onChange={(v) => {
            addLog(`set ${v}`);
            setValue(v);
          }}
          options={[
            {
              value: "one",
              label: "常规",
              padded: true,
              framed: true,
              children: <p>常规内容（padded）。</p>,
            },
            {
              value: "two",
              label: "禁用页签",
              disabled: true,
              framed: true,
              children: <p>禁用页签内容。</p>,
            },
            {
              value: "three",
              label: "第三页",
              padded: true,
              framed: true,
              children: <p>第三页内容（padded）。</p>,
            },
          ]}
        />
        <button type="button" onClick={() => setValue("three")}>
          程序化切到第三页
        </button>
      </div>
      <div>
        {/* 对齐原版IndexLayout构造通道openMatchedPanels（缺省true，经contentPanel的
            setHideUntilFound下发并在堆栈根元素挂beforematch）：非激活面板
            hidden="until-found"，浏览器查找命中即切页，也可用按钮模拟派发beforematch事件 */}
        openMatchedPanels（非激活面板until-found，可被查找命中激活）
        <IndexLayout
          expanded={false}
          defaultValue="one"
          options={[
            {
              value: "one",
              label: "第一页",
              padded: true,
              framed: true,
              children: <p>第一页内容（当前可见）。</p>,
            },
            {
              value: "two",
              label: "第二页",
              padded: true,
              framed: true,
              children: <p>第二页隐藏内容：查找命中或beforematch后切到这里。</p>,
            },
          ]}
        />
        <button
          type="button"
          onClick={(event) => {
            const root = event.currentTarget.previousElementSibling;
            const panel = root?.querySelector<HTMLDivElement>('[hidden="until-found"]');
            panel?.dispatchEvent(new Event("beforematch"));
          }}
        >
          模拟查找命中（派发beforematch）
        </button>
      </div>
      <div>
        openMatchedPanels=false（非激活面板直接hidden，不响应查找）
        <IndexLayout
          expanded={false}
          openMatchedPanels={false}
          defaultValue="one"
          options={[
            {
              value: "one",
              label: "第一页",
              padded: true,
              framed: true,
              children: <p>第一页内容（当前可见）。</p>,
            },
            {
              value: "two",
              label: "第二页",
              padded: true,
              framed: true,
              children: <p>第二页内容（直接hidden）。</p>,
            },
          ]}
        />
      </div>
    </div>
  );
}

function IndexComparePage() {
  const [log, setLog] = useState<string[]>([]);
  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);
  const options = [
    { value: "one", label: "第一个页签", children: <p>第一个页签内容（纯文本）</p> },
    {
      value: "two",
      label: "第二个页签",
      children: (
        <>
          <p>第二个页签含可聚焦元素：</p>
          <input placeholder="可聚焦输入框" /> <button type="button">可聚焦按钮</button>
        </>
      ),
    },
    { value: "three", label: "第三个页签", children: <p>第三个页签内容</p> },
  ];

  return (
    <CompareLayout
      title="IndexLayout 对照"
      description={
        <>
          对照点：顶部页签样式与选中态、点击切换、聚焦页签栏后←→/↑↓环绕切换、
          Enter确认、切换面板后自动聚焦面板内第一个可聚焦元素（autoFocus）、
          aria-controls/aria-labelledby 关联、非激活面板 hidden + aria-hidden。
          「变体」区块验证framed=false无边框页签、continuous全部可见、autoFocus=false抑制
          自动聚焦、受控value+程序化切页、disabled页签（面板整体隐藏）、逐页padded/framed
          与openMatchedPanels（原版构造通道，缺省true：非激活面板hidden="until-found"，
          浏览器查找命中即切页；false则直接hidden，不响应查找）。
        </>
      }
    >
      <CompareColumns
        original={
          // expanded（absolute定位）布局需要有高度的父容器
          <div style={{ position: "relative", height: 320 }}>
            <OriginalIndexLayout />
          </div>
        }
      >
        <div style={{ position: "relative", height: 320 }}>
          <IndexLayout options={options} defaultValue="one" />
        </div>
      </CompareColumns>

      <h2>framed / continuous / 受控 / 禁用页签</h2>
      <CompareColumns original={<OriginalIndexVariants addLog={addLog} />}>
        <ReactIndexVariants addLog={addLog} />
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

IndexComparePage.displayName = "IndexComparePage";

export default IndexComparePage;

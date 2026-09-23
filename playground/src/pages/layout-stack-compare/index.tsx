import { useState } from "react";
import {
  Button,
  HorizontalLayout,
  MenuLayout,
  PageLayout,
  PanelLayout,
  StackLayout,
  TextInput,
} from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import { useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

type LayoutUi = {
  PanelLayout: new (config?: Record<string, unknown>) => {
    $element: { append: (content: string | Node) => unknown };
  };
  StackLayout: new (config?: Record<string, unknown>) => {
    $element: { append: (content: string | Node) => unknown };
    addItems: (items: unknown[]) => void;
    setItem: (item: unknown) => void;
    on: (event: string, handler: (item?: unknown) => void) => void;
  };
  PageLayout: new (
    name: string,
    config?: Record<string, unknown>,
  ) => {
    $element: {
      append: (content: string | Node) => unknown;
      addClass: (cls: string) => unknown;
    };
    setActive: (active: boolean) => void;
  };
  HorizontalLayout: new (config?: Record<string, unknown>) => { $element: unknown };
  TextInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  ButtonWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  MenuLayout: new (config?: Record<string, unknown>) => {
    $element: { append: (content: string | Node) => unknown };
    $menu: { append: (content: string | Node) => unknown };
  };
};

/** 原版侧：PanelLayout（padded/framed/scrollable/expanded） */
function OriginalPanels() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as LayoutUi;
    const append = (name: string, node: Node) => {
      const el = document.createElement("div");
      el.textContent = name;
      el.appendChild(node);
      container.appendChild(el);
    };

    const framed = new ui.PanelLayout({
      padded: true,
      framed: true,
      expanded: false,
    });
    framed.$element.append("<p>padded + framed，收缩高度。</p>");
    append("padded+framed", unwrapJQuery(framed.$element));
    register(framed);

    // scrollable需外层限高才见滚动：面板expanded（absolute铺满定位容器）+容器确定高度，
    // 容器不定位/面板expanded=false时内容自然高度溢出，会盖住后续行
    const scrollable = new ui.PanelLayout({
      padded: true,
      framed: true,
      scrollable: true,
    });
    scrollable.$element.append(`<p>${"滚动内容行。<br>".repeat(10)}</p>`);
    const scrollBox = document.createElement("div");
    scrollBox.style.position = "relative";
    scrollBox.style.height = "100px";
    scrollBox.appendChild(unwrapJQuery(scrollable.$element));
    append("scrollable（外层限高100px）", scrollBox);
    register(scrollable);

    const collapsed = new ui.PanelLayout({ framed: true, expanded: false });
    collapsed.$element.append("<p>expanded=false：不铺满父元素。</p>");
    append("expanded=false", unwrapJQuery(collapsed.$element));
    register(collapsed);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactPanels() {
  return (
    <div>
      <div>
        padded+framed
        <PanelLayout padded framed expanded={false}>
          <p>padded + framed，收缩高度。</p>
        </PanelLayout>
      </div>
      <div>
        scrollable（外层限高100px）
        {/* 面板expanded（缺省true，absolute铺满）+容器定位限高，滚动才生效 */}
        <div style={{ position: "relative", height: 100 }}>
          <PanelLayout padded framed scrollable>
            <p>
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i}>
                  滚动内容行。
                  <br />
                </span>
              ))}
            </p>
          </PanelLayout>
        </div>
      </div>
      <div>
        expanded=false
        <PanelLayout framed expanded={false}>
          <p>expanded=false：不铺满父元素。</p>
        </PanelLayout>
      </div>
    </div>
  );
}

const STACK_PAGES = ["第一页", "第二页", "第三页"];

/** 原版侧：StackLayout（受控切页经setItem；continuous全部可见） */
function OriginalStacks({ addLog }: { addLog: (msg: string) => void }) {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as LayoutUi;
    const append = (name: string, node: Node) => {
      const el = document.createElement("div");
      el.textContent = name;
      el.appendChild(node);
      container.appendChild(el);
    };
    // withInput对应React侧受控行页内的TextInput：onPageFocus需要页内有可聚焦内容，
    // 原版侧页内放同款输入框保持内容对应（continuous行两侧均无输入框）
    const makePages = (withInput = false) =>
      STACK_PAGES.map((label) => {
        const page = new ui.PanelLayout({ padded: true, expanded: false, framed: true });
        page.$element.append(`<p>${label}内容。</p>`);
        if (withInput) {
          const input = new ui.TextInputWidget({ placeholder: `${label}输入框` });
          page.$element.append(unwrapJQuery(input.$element));
        }
        return page;
      });

    // 受控切页：外部按钮setItem（StackLayout混入GroupElement，items经addItems挂载）
    const pages = makePages(true);
    const stack = new ui.StackLayout({ expanded: false });
    stack.addItems(pages);
    stack.on("set", (item) => {
      const index = pages.indexOf(item as (typeof pages)[number]);
      if (index !== -1) {
        addLog(`原版 Stack set ${STACK_PAGES[index]}`);
      }
    });
    register(stack);
    append("受控切页", unwrapJQuery(stack.$element));
    const switchBar = document.createElement("div");
    for (let i = 0; i < STACK_PAGES.length; i++) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `切到${STACK_PAGES[i]}`;
      button.addEventListener("click", () => stack.setItem(pages[i]));
      switchBar.appendChild(button);
    }
    // 按钮排置于行内，与React侧行内按钮布局一致
    container.lastElementChild?.appendChild(switchBar);

    // continuous：全部可见
    const continuousPages = makePages();
    const continuousStack = new ui.StackLayout({
      expanded: false,
      continuous: true,
    });
    for (const page of continuousPages) {
      continuousStack.$element.append(unwrapJQuery(page.$element));
    }
    append("continuous（全部可见）", unwrapJQuery(continuousStack.$element));
    register(continuousStack);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactStacks({ addLog }: { addLog: (msg: string) => void }) {
  const [value, setValue] = useState<string | number>("第一页");
  const [focusedPage, setFocusedPage] = useState<string | number | "（无）">("（无）");

  return (
    <div>
      <div>
        受控切页
        <StackLayout
          expanded={false}
          value={value}
          onChange={(v) => {
            addLog(`Stack set ${v}`);
            setValue(v);
          }}
          // 焦点进入某页时通知（原版无对应事件形态，autoFocus联动为各布局内部处理）
          onPageFocus={(v) => setFocusedPage(v)}
          options={STACK_PAGES.map((label) => ({
            value: label,
            // label随页签集对象透入、PageLayout吞掉不落DOM（与TabPanelLayout同款机制）
            label: `${label}页签`,
            padded: true,
            framed: true,
            // 页面不绝对填充堆栈（expanded缺省true会absolute定位、堆栈塌为0高），
            // 与原版侧makePages的expanded:false一致
            expanded: false,
            children: (
              <>
                <p>{label}内容。</p>
                <TextInput placeholder={`${label}输入框`} />
              </>
            ),
          }))}
        />
        {STACK_PAGES.map((label) => (
          <button key={label} type="button" onClick={() => setValue(label)}>
            切到{label}
          </button>
        ))}
        <span className="cmp-value">onPageFocus: {focusedPage}</span>
      </div>
      <div>
        continuous（全部可见）
        <StackLayout
          expanded={false}
          continuous
          // React侧激活页会带active类；原版StackLayout continuous从不setActive，
          // 属实现固有差异
          defaultValue="第二页"
          options={STACK_PAGES.map((label) => ({
            value: label,
            padded: true,
            framed: true,
            expanded: false,
            children: <p>{label}内容。</p>,
          }))}
        />
      </div>
    </div>
  );
}

/** 原版侧：PageLayout独立使用（active类与hidden） */
function OriginalPageLayouts() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as LayoutUi;
    const append = (name: string, node: Node) => {
      const el = document.createElement("div");
      el.textContent = name;
      el.appendChild(node);
      container.appendChild(el);
    };

    const active = new ui.PageLayout("active", {
      padded: true,
      framed: true,
      expanded: false,
    });
    active.setActive(true);
    active.$element.append("<p>active页面（oo-ui-pageLayout-active类）。</p>");
    append("active", unwrapJQuery(active.$element));
    register(active);

    // 原版PageLayout无hidden声明式通道：hidden类由StackLayout.updateHiddenState命令式加，
    // 此处静态加类模拟同一机制（React为Layout的hidden prop）
    const hidden = new ui.PageLayout("hidden", {
      padded: true,
      framed: true,
      expanded: false,
    });
    hidden.$element.append("<p>hidden页面（不可见）。</p>");
    hidden.$element.addClass("oo-ui-element-hidden");
    append("hidden（不可见，静态加类）", unwrapJQuery(hidden.$element));
    register(hidden);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactPageLayouts() {
  return (
    <div>
      <div>
        active
        <PageLayout padded framed expanded={false} active>
          <p>active页面（oo-ui-pageLayout-active类）。</p>
        </PageLayout>
      </div>
      <div>
        hidden（不可见）
        <PageLayout padded framed expanded={false} hidden aria-hidden="true">
          <p>hidden页面（不可见）。</p>
        </PageLayout>
      </div>
    </div>
  );
}

/** 原版侧：HorizontalLayout（字段横排，主题CSS归零子项外边距） */
function OriginalHorizontal() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as LayoutUi;
    const horizontal = new ui.HorizontalLayout({
      items: [
        new ui.TextInputWidget({ placeholder: "字段一" }),
        new ui.TextInputWidget({ placeholder: "字段二" }),
        new ui.ButtonWidget({ label: "提交" }),
      ],
    });
    register(horizontal);
    container.appendChild(unwrapJQuery(horizontal.$element));
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactHorizontal() {
  return (
    <div>
      <HorizontalLayout>
        <TextInput placeholder="字段一" />
        <TextInput placeholder="字段二" />
        <Button>提交</Button>
      </HorizontalLayout>
    </div>
  );
}

const MENU_HTML = "<div style='padding:8px'>菜单项A<br>菜单项B<br>菜单项C</div>";

/** 原版侧：MenuLayout（menuPosition四方位与showMenu收起） */
function OriginalMenus() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as LayoutUi;
    const append = (name: string, node: Node) => {
      const el = document.createElement("div");
      el.textContent = name;
      el.appendChild(node);
      container.appendChild(el);
    };
    const make = (config: Record<string, unknown>) => {
      const layout = new ui.MenuLayout({ expanded: false, ...config });
      layout.$menu.append(MENU_HTML);
      layout.$element.append("<div style='padding:8px'>内容区</div>");
      register(layout);
      return layout.$element;
    };

    append("menuPosition=before（默认）", unwrapJQuery(make({ menuPosition: "before" })));
    // top与before的DOM顺序一致（菜单在前），仅类切换oo-ui-menuLayout-top
    append("menuPosition=top", unwrapJQuery(make({ menuPosition: "top" })));
    append("menuPosition=after", unwrapJQuery(make({ menuPosition: "after" })));
    append("menuPosition=bottom", unwrapJQuery(make({ menuPosition: "bottom" })));
    append("showMenu=false", unwrapJQuery(make({ showMenu: false })));
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactMenus() {
  const menu = (
    <div style={{ padding: 8 }}>
      菜单项A
      <br />
      菜单项B
      <br />
      菜单项C
    </div>
  );

  return (
    <div>
      <div>
        menuPosition=before（默认）
        <MenuLayout menu={menu} expanded={false}>
          <div style={{ padding: 8 }}>内容区</div>
        </MenuLayout>
      </div>
      <div>
        menuPosition=top
        <MenuLayout menu={menu} menuPosition="top" expanded={false}>
          <div style={{ padding: 8 }}>内容区</div>
        </MenuLayout>
      </div>
      <div>
        menuPosition=after
        <MenuLayout menu={menu} menuPosition="after" expanded={false}>
          <div style={{ padding: 8 }}>内容区</div>
        </MenuLayout>
      </div>
      <div>
        menuPosition=bottom
        <MenuLayout menu={menu} menuPosition="bottom" expanded={false}>
          <div style={{ padding: 8 }}>内容区</div>
        </MenuLayout>
      </div>
      <div>
        showMenu=false
        <MenuLayout menu={menu} showMenu={false} expanded={false}>
          <div style={{ padding: 8 }}>内容区</div>
        </MenuLayout>
      </div>
    </div>
  );
}

function LayoutStackComparePage() {
  const [log, setLog] = useState<string[]>([]);
  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);

  return (
    <CompareLayout
      title="Panel / Stack / Page / Horizontal / MenuLayout 对照"
      description={
        <>
          对照点：PanelLayout的padded/framed/scrollable/expanded类组合；StackLayout受控
          切页（原版setItem）与continuous全部可见（页props经PageLayout承载，逐页可配
          padded/framed）；PageLayout独立使用的active（原版hidden无声明式通道，静态加类演示
          StackLayout.updateHiddenState的同款机制）；HorizontalLayout字段横排
          （子项外边距归零）；MenuLayout四方位菜单与showMenu=false收起（收起为
          width/height:0+overflow:hidden，本工程收起时卸载子树避免隐形焦点陷阱）。
        </>
      }
    >
      <h2>PanelLayout</h2>
      <CompareColumns original={<OriginalPanels />}>
        <ReactPanels />
      </CompareColumns>

      <h2>StackLayout</h2>
      <CompareColumns original={<OriginalStacks addLog={addLog} />}>
        <ReactStacks addLog={addLog} />
      </CompareColumns>

      <h2>PageLayout</h2>
      <CompareColumns original={<OriginalPageLayouts />}>
        <ReactPageLayouts />
      </CompareColumns>

      <h2>HorizontalLayout</h2>
      <CompareColumns original={<OriginalHorizontal />}>
        <ReactHorizontal />
      </CompareColumns>

      <h2>MenuLayout</h2>
      <CompareColumns original={<OriginalMenus />}>
        <ReactMenus />
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

LayoutStackComparePage.displayName = "LayoutStackComparePage";

export default LayoutStackComparePage;

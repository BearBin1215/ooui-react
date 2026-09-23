import { useState } from "react";
import { BookletLayout, Button, TextInput, type BookletLayoutProps } from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import { useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

type BookletUi = {
  BookletLayout: new (config?: Record<string, unknown>) => BookletInstance;
  PageLayout: new (
    name: string,
    config?: Record<string, unknown>,
  ) => {
    $element: { append: (content: string | Node) => unknown };
  };
  ButtonWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  TextInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
};

type BookletInstance = {
  $element: unknown;
  addPages: (pages: unknown[], index?: number) => void;
  removePages: (pages: unknown[]) => void;
  getPage: (name: string) => {
    $element: { append: (content: string | Node) => unknown };
    outlineItem: {
      setLabel: (label: string) => void;
      setMovable: (movable: boolean) => void;
      setRemovable: (removable: boolean) => void;
    } | null;
  };
  setPage: (name: string) => void;
  selectFirstSelectablePage: () => void;
  toggleMenu: (show?: boolean) => void;
  on: (event: string, handler: (page?: unknown) => void) => void;
  outlineSelectWidget: {
    findSelectedItem: () => { getData: () => string } | null;
  };
  outlineControlsWidget: {
    connect: (
      context: object,
      methods: Record<string, (...args: unknown[]) => void>,
    ) => void;
    addItems: (items: unknown[]) => void;
  } | null;
  stackLayout: { getItems: () => unknown[] };
};

type PageSpec = { name: string; label: string; text: string; input?: boolean };

const BASIC_PAGES: PageSpec[] = [
  {
    name: "p1",
    label: "第一页",
    text: "第一页内容（切到本页会自动聚焦输入框）。",
    input: true,
  },
  { name: "p2", label: "第二页", text: "第二页内容。" },
  { name: "p3", label: "第三页", text: "第三页内容。" },
];

const EDITABLE_PAGES: PageSpec[] = [
  { name: "e1", label: "章节一", text: "章节一内容。" },
  { name: "e2", label: "章节二", text: "章节二内容。" },
  { name: "e3", label: "章节三", text: "章节三内容。" },
];

/** autoFocus=false行的页集（与原版侧noFocusPages同源） */
const NOFOCUS_PAGES: PageSpec[] = [
  {
    name: "p1",
    label: "输入框页",
    text: "切页不会自动聚焦下方输入框。",
    input: true,
  },
  { name: "p2", label: "第二页", text: "第二页内容。" },
];

/** React侧页面选项公共构造：expanded=false让页面按内容自然高度排布（对齐makeOriginalPage
 * 的expanded:false）；页面缺省expanded=true会absolute铺满定位容器，令堆栈塌缩、内容
 * 裁剪出滚动条 */
function reactPage(
  spec: PageSpec,
  extra?: Partial<BookletLayoutProps["options"][number]>,
) {
  return {
    value: spec.name,
    label: spec.label,
    padded: true,
    framed: true,
    expanded: false,
    children: (
      <>
        <p>{spec.text}</p>
        {spec.input && <TextInput />}
      </>
    ),
    ...extra,
  };
}

/** 构建原版PageLayout并填充内容 */
function makeOriginalPage(
  ui: BookletUi,
  spec: PageSpec,
): { element: unknown; page: unknown } {
  const page = new ui.PageLayout(spec.name, {
    padded: true,
    framed: true,
    expanded: false,
  });
  page.$element.append(`<p>${spec.text}</p>`);
  if (spec.input) {
    page.$element.append(unwrapJQuery(new ui.TextInputWidget({}).$element));
  }
  return { element: page, page };
}

/** 打大纲标签（原版addPages重建大纲选项时不带label，需补写） */
function labelOutlineItems(booklet: BookletInstance, specs: PageSpec[], movable = false) {
  for (const spec of specs) {
    const page = booklet.getPage(spec.name);
    if (page?.outlineItem) {
      page.outlineItem.setLabel(spec.label);
      if (movable) {
        page.outlineItem.setMovable(true);
        page.outlineItem.setRemovable(true);
      }
    }
  }
}

/** 原版侧：outlined基本页册（defaultValue对应setPage） */
function OriginalBasicBooklet({ addLog }: { addLog: (msg: string) => void }) {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as BookletUi;
    const booklet = new ui.BookletLayout({ outlined: true, expanded: false });
    booklet.addPages(BASIC_PAGES.map((spec) => makeOriginalPage(ui, spec).element));
    labelOutlineItems(booklet, BASIC_PAGES);
    booklet.on("set", (page) => {
      const name = (page as { getName: () => string } | undefined)?.getName();
      if (name) {
        addLog(`原版 set ${name}`);
      }
    });
    booklet.setPage("p2");
    register(booklet);
    container.appendChild(unwrapJQuery(booklet.$element));

    // outlined缺省（false）：无大纲面板，原版构造后toggleMenu(outlined)收起菜单，仅页面堆叠
    const plain = new ui.BookletLayout({ expanded: false });
    plain.addPages(BASIC_PAGES.map((spec) => makeOriginalPage(ui, spec).element));
    register(plain);
    const plainRow = document.createElement("div");
    plainRow.textContent = "outlined缺省（无大纲，页面堆叠）";
    plainRow.appendChild(unwrapJQuery(plain.$element));
    container.appendChild(plainRow);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactBasicBooklet({ addLog }: { addLog: (msg: string) => void }) {
  return (
    <div>
      <BookletLayout
        outlined
        expanded={false}
        defaultValue="p2"
        onChange={(v) => addLog(`set ${v}`)}
        options={BASIC_PAGES.map((spec) => reactPage(spec))}
      />
      <div>
        {/* 不传outlined（缺省false）：菜单随outlined收起，无大纲，仅页面堆叠 */}
        outlined缺省（无大纲，页面堆叠）
        <BookletLayout
          expanded={false}
          options={BASIC_PAGES.map((spec) => reactPage(spec))}
        />
      </div>
    </div>
  );
}

/** 原版侧：autoFocus=false（切页不抢焦点） */
function OriginalNoAutoFocus() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as BookletUi;
    const booklet = new ui.BookletLayout({
      outlined: true,
      expanded: false,
      autoFocus: false,
    });
    const noFocusPages: PageSpec[] = NOFOCUS_PAGES;
    booklet.addPages(noFocusPages.map((spec) => makeOriginalPage(ui, spec).element));
    labelOutlineItems(booklet, noFocusPages);
    register(booklet);
    container.appendChild(unwrapJQuery(booklet.$element));
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactNoAutoFocus() {
  return (
    <BookletLayout
      outlined
      expanded={false}
      autoFocus={false}
      options={NOFOCUS_PAGES.map((spec) => reactPage(spec))}
    />
  );
}

/** 原版侧：menuPosition=after（大纲在右）与showMenu=false（收起大纲，构造后toggleMenu） */
function OriginalMenuVariants() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as BookletUi;
    const after = new ui.BookletLayout({
      outlined: true,
      expanded: false,
      menuPosition: "after",
    });
    after.addPages(BASIC_PAGES.map((spec) => makeOriginalPage(ui, spec).element));
    labelOutlineItems(after, BASIC_PAGES);
    register(after);
    container.appendChild(unwrapJQuery(after.$element));

    // 原版构造后将showMenu覆写为outlined，收起大纲须构造后toggleMenu(false)
    const hiddenMenu = new ui.BookletLayout({ outlined: true, expanded: false });
    hiddenMenu.addPages(BASIC_PAGES.map((spec) => makeOriginalPage(ui, spec).element));
    labelOutlineItems(hiddenMenu, BASIC_PAGES);
    hiddenMenu.toggleMenu(false);
    register(hiddenMenu);
    const hiddenRow = document.createElement("div");
    hiddenRow.style.height = "1em";
    container.appendChild(hiddenRow);
    const hiddenLabel = document.createElement("div");
    hiddenLabel.textContent = "showMenu=false（收起大纲，仅剩页面栈）";
    container.appendChild(hiddenLabel);
    container.appendChild(unwrapJQuery(hiddenMenu.$element));
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：menuPosition="after"与showMenu={false}对照 */
function ReactMenuVariants() {
  return (
    <div>
      <BookletLayout
        outlined
        menuPosition="after"
        expanded={false}
        options={BASIC_PAGES.map((spec) => reactPage(spec))}
      />
      <div style={{ height: "1em" }} />
      <div>showMenu=false（收起大纲，仅剩页面栈）</div>
      <BookletLayout
        outlined
        showMenu={false}
        expanded={false}
        options={BASIC_PAGES.map((spec) => reactPage(spec))}
      />
    </div>
  );
}

/** 原版侧：continuous全部渲染，切页滚动定位 */
function OriginalContinuousBooklet() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as BookletUi;
    const booklet = new ui.BookletLayout({
      outlined: true,
      continuous: true,
      expanded: false,
    });
    const pages = BASIC_PAGES.map((spec) => makeOriginalPage(ui, spec).element);
    booklet.addPages(pages);
    labelOutlineItems(booklet, BASIC_PAGES);
    register(booklet);
    container.appendChild(unwrapJQuery(booklet.$element));
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactContinuousBooklet() {
  return (
    <BookletLayout
      outlined
      continuous
      expanded={false}
      options={BASIC_PAGES.map((spec) => reactPage(spec))}
    />
  );
}

/** 原版侧：editable大纲（原版move/remove事件须自行接线，重挂label） */
function OriginalEditableBooklet({ addLog }: { addLog: (msg: string) => void }) {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as BookletUi;
    const booklet = new ui.BookletLayout({
      outlined: true,
      editable: true,
      expanded: false,
    });
    booklet.addPages(EDITABLE_PAGES.map((spec) => makeOriginalPage(ui, spec).element));
    labelOutlineItems(booklet, EDITABLE_PAGES, true);
    register(booklet);

    const controls = booklet.outlineControlsWidget;
    if (controls) {
      controls.connect(
        {},
        {
          move: (...args: unknown[]) => {
            const places = args[0] as number;
            const selected = booklet.outlineSelectWidget.findSelectedItem();
            if (!selected) {
              return;
            }
            const name = selected.getData();
            const page = booklet.getPage(name);
            const index = booklet.stackLayout.getItems().indexOf(page);
            booklet.removePages([page]);
            booklet.addPages([page], Math.max(0, index + places));
            // addPages会重建大纲选项，重打label与movable/removable
            labelOutlineItems(booklet, EDITABLE_PAGES, true);
            booklet.setPage(name);
            addLog(`原版 move ${name} ${places}`);
          },
          remove: () => {
            const selected = booklet.outlineSelectWidget.findSelectedItem();
            if (!selected) {
              return;
            }
            const name = selected.getData();
            booklet.removePages([booklet.getPage(name)]);
            booklet.selectFirstSelectablePage();
            addLog(`原版 remove ${name}`);
          },
        },
      );
      // 大纲控件左侧的额外按钮区（对应React的outlineControlsExtra）
      controls.addItems([new ui.ButtonWidget({ label: "添加", icon: "add" })]);
    }
    container.appendChild(unwrapJQuery(booklet.$element));
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactEditableBooklet({ addLog }: { addLog: (msg: string) => void }) {
  const [options, setOptions] = useState(EDITABLE_PAGES);

  return (
    <BookletLayout
      outlined
      editable
      expanded={false}
      options={options.map((spec) => reactPage(spec, { movable: true, removable: true }))}
      onMoveOption={(value, direction) => {
        addLog(`move ${value} ${direction}`);
        setOptions((prev) => {
          const index = prev.findIndex((option) => option.name === value);
          const target = index + direction;
          if (index === -1 || target < 0 || target >= prev.length) {
            return prev;
          }
          const next = [...prev];
          [next[index], next[target]] = [next[target], next[index]];
          return next;
        });
      }}
      onRemoveOption={(value) => {
        addLog(`remove ${value}`);
        setOptions((prev) => prev.filter((option) => option.name !== value));
      }}
      outlineControlsExtra={
        <Button
          icon="add"
          onClick={() =>
            setOptions((prev) => [
              ...prev,
              {
                name: `e${prev.length + 1}`,
                label: `章节${prev.length + 1}`,
                text: `章节${prev.length + 1}内容。`,
              },
            ])
          }
        >
          添加
        </Button>
      }
    />
  );
}

/** 原版侧：受控切页（setPage由外部按钮驱动） */
function OriginalControlledBooklet({ addLog }: { addLog: (msg: string) => void }) {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as BookletUi;
    const booklet = new ui.BookletLayout({ outlined: true, expanded: false });
    booklet.addPages(BASIC_PAGES.map((spec) => makeOriginalPage(ui, spec).element));
    labelOutlineItems(booklet, BASIC_PAGES);
    booklet.on("set", (page) => {
      const name = (page as { getName: () => string } | undefined)?.getName();
      if (name) {
        addLog(`原版 set ${name}`);
      }
    });
    register(booklet);
    container.appendChild(unwrapJQuery(booklet.$element));
    const bar = document.createElement("div");
    const goButton = document.createElement("button");
    goButton.type = "button";
    goButton.textContent = "切到第三页";
    goButton.addEventListener("click", () => booklet.setPage("p3"));
    bar.appendChild(goButton);
    container.appendChild(bar);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactControlledBooklet({ addLog }: { addLog: (msg: string) => void }) {
  const [value, setValue] = useState<string | number>("p1");

  return (
    <div>
      <BookletLayout
        outlined
        expanded={false}
        value={value}
        onChange={(v) => {
          addLog(`set ${v}`);
          setValue(v);
        }}
        options={BASIC_PAGES.map((spec) => reactPage(spec))}
      />
      <button type="button" onClick={() => setValue("p3")}>
        切到第三页
      </button>
    </div>
  );
}

function BookletComparePage() {
  const [log, setLog] = useState<string[]>([]);
  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);

  return (
    <CompareLayout
      title="BookletLayout 对照"
      description={
        <>
          对照点：outlined大纲页册（切页同步大纲选中）、outlined缺省（false）无大纲
          仅页面堆叠、autoFocus（切页聚焦页内首个可聚焦
          元素，false抑制）、continuous全部渲染+切页滚动定位、editable大纲
          （上移/下移/移除控件，原版move/remove事件须调用方自行接线，本工程经
          onMoveOption/onRemoveOption回调交调用方更新options——声明式受控属有意差异），
          outlineControlsExtra对应原版outlineControls的addItems额外按钮区，受控value
          切页。移除当前页后的失效回退为本工程增强（原版不补选，见DEVIATIONS.md）。
        </>
      }
    >
      <h2>outlined基本页册</h2>
      <CompareColumns original={<OriginalBasicBooklet addLog={addLog} />}>
        <ReactBasicBooklet addLog={addLog} />
      </CompareColumns>

      <h2>autoFocus=false</h2>
      <CompareColumns original={<OriginalNoAutoFocus />}>
        <ReactNoAutoFocus />
      </CompareColumns>

      <h2>continuous</h2>
      <CompareColumns original={<OriginalContinuousBooklet />}>
        <ReactContinuousBooklet />
      </CompareColumns>

      <h2>editable大纲</h2>
      <CompareColumns original={<OriginalEditableBooklet addLog={addLog} />}>
        <ReactEditableBooklet addLog={addLog} />
      </CompareColumns>

      <h2>menuPosition=after / showMenu=false</h2>
      <CompareColumns original={<OriginalMenuVariants />}>
        <ReactMenuVariants />
      </CompareColumns>

      <h2>受控切页</h2>
      <CompareColumns original={<OriginalControlledBooklet addLog={addLog} />}>
        <ReactControlledBooklet addLog={addLog} />
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

BookletComparePage.displayName = "BookletComparePage";

export default BookletComparePage;

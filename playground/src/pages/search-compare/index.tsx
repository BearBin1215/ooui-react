import { useMemo, useRef, useState, type CSSProperties } from "react";
import { SearchInput, SearchWidget } from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import { createRowAppender, useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

type SearchUi = {
  SearchInputWidget: new (config?: Record<string, unknown>) => {
    $element: unknown;
    getValue: () => string;
    on: (event: string, handler: () => void) => void;
  };
};

/** 原版侧：SearchInput形态样本（与React侧逐行对照） */
function OriginalSearchInputs({ addLog }: { addLog: (msg: string) => void }) {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as SearchUi;
    const row = createRowAppender(container, register);
    const regular = row(ui.SearchInputWidget, "常规（空值无清除指示器）", {
      placeholder: "Search",
    });
    // 与React侧「常规」行的onChange日志对称，change事件由InputWidget.setValue派发
    regular.on("change", () => {
      addLog(`change 原版SearchInput=${regular.getValue()}`);
    });
    row(ui.SearchInputWidget, "带值（显示clear指示器）", { value: "MediaWiki" });
    row(ui.SearchInputWidget, "禁用·带值（指示器隐藏）", {
      value: "MediaWiki",
      disabled: true,
    });
    row(ui.SearchInputWidget, "只读·带值（指示器隐藏）", {
      value: "MediaWiki",
      readOnly: true,
    });
    row(ui.SearchInputWidget, "required（空值不回退required指示器）", { required: true });
    row(ui.SearchInputWidget, "icon覆盖缺省search图标", {
      icon: "article",
      value: "MediaWiki",
    });
    row(ui.SearchInputWidget, "validate=non-empty（留空失焦标红）", {
      validate: "non-empty",
    });
    row(ui.SearchInputWidget, "label after", { label: "关键词" });
    row(ui.SearchInputWidget, "labelPosition=before", {
      label: "关键词",
      labelPosition: "before",
    });
    row(ui.SearchInputWidget, "invisibleLabel（label转title）", {
      label: "视觉隐藏标签",
      invisibleLabel: true,
    });
    row(ui.SearchInputWidget, "flags=primary（输出flaggedElement类）", {
      flags: "primary",
    });
    row(ui.SearchInputWidget, "name（落input的name属性）", { name: "search-name" });
    row(ui.SearchInputWidget, "maxLength=8", { maxLength: 8 });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactSearchInputs({ addLog }: { addLog: (msg: string) => void }) {
  const [value, setValue] = useState<string>("初始值");
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div>
      {/* 名称与控件同行，与原版row()的div行结构一致（块级widget入p不合规），保证两侧逐行对照 */}
      <div>
        常规（空值无清除指示器）
        <SearchInput placeholder="Search" onChange={(v) => addLog(`change 常规=${v}`)} />
      </div>
      <div>
        带值（显示clear指示器）
        <SearchInput defaultValue="MediaWiki" />
      </div>
      <div>
        禁用·带值（指示器隐藏）
        <SearchInput defaultValue="MediaWiki" disabled />
      </div>
      <div>
        只读·带值（指示器隐藏）
        <SearchInput defaultValue="MediaWiki" readOnly />
      </div>
      <div>
        required（空值不回退required指示器）
        <SearchInput required />
      </div>
      <div>
        icon覆盖缺省search图标
        <SearchInput icon="article" defaultValue="MediaWiki" />
      </div>
      <div>
        validate=non-empty（留空失焦标红）
        <SearchInput validate="non-empty" />
      </div>
      <div>
        label after
        <SearchInput label="关键词" />
      </div>
      <div>
        labelPosition=before
        <SearchInput label="关键词" labelPosition="before" />
      </div>
      <div>
        invisibleLabel（label转title）
        <SearchInput label="视觉隐藏标签" invisibleLabel />
      </div>
      <div>
        flags=primary（输出flaggedElement类）
        <SearchInput flags="primary" />
      </div>
      <div>
        name（落input的name属性）
        <SearchInput name="search-name" />
      </div>
      <div>
        maxLength=8
        <SearchInput maxLength={8} />
      </div>
      {/* 受控演示为React增强，原版侧无对应形态，置于尾部避免挤占逐行对照 */}
      <div>
        受控（当前：{value === "" ? "（空）" : value}）
        <SearchInput value={value} onChange={setValue} />
      </div>
      <div>
        {/* inputProps/inputRef为React侧逃生舱：自定义属性落到input、ref用于聚焦 */}
        inputProps+inputRef（自定义属性落input、按钮编程聚焦）
        <SearchInput
          inputProps={{ id: "search-custom-input", spellCheck: false }}
          inputRef={inputRef}
        />
        <button type="button" onClick={() => inputRef.current?.focus()}>
          聚焦input
        </button>
      </div>
    </div>
  );
}

/** SearchWidget的候选结果（两侧共用，按查询前缀过滤；含共同前缀以便用↑↓对照多变结果） */
const SEARCH_CANDIDATES = ["alpha", "alto", "beta", "delta"];

/**
 * SearchWidget宿主尺寸：原版query/results均为绝对定位（`top:0`与`top:4em;bottom:0`），
 * 高宽由宿主提供（原版的使用场景是Dialog），故此处用固定尺寸盒替代
 */
const SEARCH_WIDGET_BOX: CSSProperties = {
  position: "relative",
  width: 420,
  height: 240,
  border: "1px solid #c8ccd1",
  overflow: "hidden",
};

/** 原版侧宿主盒的cssText（与SEARCH_WIDGET_BOX同尺寸同边框） */
const SEARCH_WIDGET_BOX_CSS =
  "position:relative;width:420px;height:240px;border:1px solid #c8ccd1;overflow:hidden;";

type SearchWidgetUi = {
  SearchWidget: new (config?: Record<string, unknown>) => {
    $element: unknown;
    getQuery: () => {
      getValue: () => string;
      on: (event: string, handler: () => void) => void;
    };
    getResults: () => {
      clearItems: () => void;
      addItems: (items: unknown[]) => void;
      on: (event: string, handler: (item: { getData: () => string }) => void) => void;
    };
  };
  MenuOptionWidget: new (config?: Record<string, unknown>) => unknown;
};

/** 原版侧：本组件不实现检索，须自行监听查询并重填结果（对齐原版分工） */
function OriginalSearchWidget({ addLog }: { addLog: (msg: string) => void }) {
  const [chosen, setChosen] = useState("");
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as SearchWidgetUi;
    const host = document.createElement("div");
    host.style.cssText = SEARCH_WIDGET_BOX_CSS;

    const search = new ui.SearchWidget({ placeholder: "输入 al / beta / delta 试试" });
    register(search);
    host.appendChild(unwrapJQuery(search.$element));
    container.appendChild(host);

    const query = search.getQuery();
    const results = search.getResults();
    const fill = () => {
      results.clearItems();
      const value = query.getValue();
      if (!value) {
        return;
      }
      results.addItems(
        SEARCH_CANDIDATES.filter((candidate) => candidate.startsWith(value)).map(
          (candidate) => new ui.MenuOptionWidget({ data: candidate, label: candidate }),
        ),
      );
    };
    query.on("change", () => {
      fill();
      // 与React侧addLog同格式的change日志，使事件日志两侧对称
      addLog(`change 原版SearchWidget=${query.getValue()}`);
    });
    results.on("choose", (item) => setChosen(item.getData()));

    // 补充形态行：构造期value即初始查询；disabled的对照差异见页首说明
    const initial = new ui.SearchWidget({ value: "初始查询" });
    register(initial);
    const disabledWidget = new ui.SearchWidget({ disabled: true });
    register(disabledWidget);
    for (const [name, widget] of [
      ["初始查询（原版config.value / React defaultValue）", initial],
      ["disabled（同禁用查询框与结果列表）", disabledWidget],
    ] as const) {
      const row = document.createElement("div");
      row.textContent = name;
      const rowHost = document.createElement("div");
      rowHost.style.cssText = SEARCH_WIDGET_BOX_CSS;
      rowHost.appendChild(unwrapJQuery(widget.$element));
      row.appendChild(rowHost);
      container.appendChild(row);
    }
  });

  return (
    <div>
      <div ref={containerRef} />
      <p>已选：{chosen === "" ? "（无）" : chosen}</p>
    </div>
  );
}

/** React侧：结果由调用方按查询填入results（与SearchInput+Select组合等价） */
function ReactSearchWidget({ addLog }: { addLog: (msg: string) => void }) {
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState("");
  const results = useMemo(
    () =>
      query === ""
        ? []
        : SEARCH_CANDIDATES.filter((candidate) => candidate.startsWith(query)).map(
            (candidate) => ({ value: candidate, children: candidate }),
          ),
    [query],
  );

  return (
    <div>
      <div style={SEARCH_WIDGET_BOX}>
        <SearchWidget
          placeholder="输入 al / beta / delta 试试"
          value={query}
          onQueryChange={(v) => {
            setQuery(v);
            // 与原版侧query.on("change")的日志对称，使SearchWidget区块日志两侧都覆盖
            addLog(`change ReactSearchWidget=${v}`);
          }}
          results={results}
          onChoose={(value) => setChosen(String(value))}
          // inputProps是查询框（SearchInput）的组件props通道，写到原生input上的属性
          // 须再嵌套经inputProps.inputProps（TextInput的输入元素透传通道）
          inputProps={{ inputProps: { spellCheck: false } }}
        />
      </div>
      <div>
        初始查询（原版config.value / React defaultValue）
        <div style={SEARCH_WIDGET_BOX}>
          <SearchWidget defaultValue="初始查询" />
        </div>
      </div>
      <div>
        disabled（同禁用查询框与结果列表）
        <div style={SEARCH_WIDGET_BOX}>
          <SearchWidget disabled />
        </div>
      </div>
      <p>已选：{chosen === "" ? "（无）" : chosen}</p>
    </div>
  );
}

function SearchComparePage() {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);

  return (
    <CompareLayout
      title="SearchInput / SearchWidget 对照"
      description={
        <>
          SearchInput对照点：type=search语义与search缺省图标、clear清除指示器的显隐
          （值非空且未禁用/只读时显示，对齐updateSearchIndicator）、点击指示器或在其上按Enter
          清空并回焦输入框、指示器role=button与aria-label（ooui-item-remove消息）。
          SearchWidget对照点：查询框与始终可见的结果列表的布局、输入即由调用方重填结果、
          焦点留在查询框时↑↓移动结果高亮（端点环绕）、Enter选定高亮结果。
          <br />
          实现差异：SearchWidget的disabled，React侧同步禁用查询框与结果列表，
          原版config.disabled仅输出根元素的禁用类与aria-disabled（查询框仍可输入）。
        </>
      }
    >
      <h2>SearchInput</h2>
      <CompareColumns original={<OriginalSearchInputs addLog={addLog} />}>
        <ReactSearchInputs addLog={addLog} />
      </CompareColumns>

      <h2>SearchWidget</h2>
      <CompareColumns original={<OriginalSearchWidget addLog={addLog} />}>
        <ReactSearchWidget addLog={addLog} />
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

SearchComparePage.displayName = "SearchComparePage";

export default SearchComparePage;

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Icon } from "ooui-react";
import { ICON_GROUPS } from "./_iconNames";

/** 图标总数（工具栏的「共 N 个」读数） */
const TOTAL = ICON_GROUPS.reduce((sum, group) => sum + group.icons.length, 0);

/** 写入剪贴板 */
async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 权限被拒或非安全上下文：继续尝试 execCommand
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

const SEARCH_STYLE: CSSProperties = {
  boxSizing: "border-box",
  width: 240,
  maxWidth: "100%",
  padding: "6px 10px",
  border: "1px solid #a2a9b1",
  borderRadius: 2,
  fontSize: 14,
  fontFamily: "inherit",
};

const COUNT_STYLE: CSSProperties = {
  color: "#72777d",
  fontSize: 13,
};

/** 分组标题：沿用原版 demos 的标题形态 `Icons – <组名>`（en dash） */
const GROUP_TITLE_STYLE: CSSProperties = {
  margin: "20px 0 8px",
  fontSize: 15,
  fontWeight: 600,
  color: "#54595d",
};

const GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
  gap: 8,
};

const ITEM_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  boxSizing: "border-box",
  width: "100%",
  padding: "6px 10px",
  border: "1px solid #eaecf0",
  borderRadius: 4,
  background: "transparent",
  color: "#202122",
  fontFamily: "inherit",
  fontSize: 13,
  lineHeight: 1.4,
  textAlign: "left",
  cursor: "pointer",
};

const ITEM_COPIED_STYLE: CSSProperties = {
  ...ITEM_STYLE,
  borderColor: "#36c",
  background: "#eaf3ff",
};

const NAME_STYLE: CSSProperties = {
  flex: "auto",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

/** 「已复制」反馈的停留时长（ms） */
const COPIED_DURATION = 1500;

/** 画廊内可本地化的界面文案；图标名与分组名恒为语言中性的原值 */
const LABELS = {
  zh: {
    search: "搜索图标名",
    total: (total: number) => `共 ${total} 个`,
    matched: (matched: number, total: number) => `匹配 ${matched} / ${total} 个`,
    empty: (query: string) => `没有匹配「${query}」的图标。`,
    copy: (icon: string) => `复制 ${icon}`,
  },
  en: {
    search: "Search icon names",
    total: (total: number) => `${total} icons`,
    matched: (matched: number, total: number) => `${matched} of ${total} matched`,
    empty: (query: string) => `No icons match "${query}".`,
    copy: (icon: string) => `Copy ${icon}`,
  },
};

/**
 * 全部图标画廊：按原版 demos 的分组列出主题图标集，点击任意一项复制其图标名。
 * 分组数据见 `./_iconNames.ts`（组名、顺序与图标名均对照原版取定）。
 * 中英文档共用本组件，界面文案经 `locale` 切换（默认中文）。
 */
export function IconGallery({ locale = "zh" }: { locale?: keyof typeof LABELS }) {
  const labels = LABELS[locale];
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const copiedTimer = useRef<number | null>(null);

  // 卸载时清掉「已复制」反馈的定时器
  useEffect(
    () => () => {
      if (copiedTimer.current !== null) {
        window.clearTimeout(copiedTimer.current);
      }
    },
    [],
  );

  const keyword = query.trim().toLowerCase();
  // 按名过滤（大小写不敏感），空组直接隐去——标题不随过滤留空
  const groups = useMemo(
    () =>
      ICON_GROUPS.map((group) => ({
        name: group.name,
        icons: keyword
          ? group.icons.filter((icon) => icon.toLowerCase().includes(keyword))
          : group.icons,
      })).filter((group) => group.icons.length > 0),
    [keyword],
  );
  const matched = groups.reduce((sum, group) => sum + group.icons.length, 0);

  const handleSelect = async (icon: string) => {
    if (!(await copyText(icon))) {
      return;
    }
    setCopied(icon);
    if (copiedTimer.current !== null) {
      window.clearTimeout(copiedTimer.current);
    }
    copiedTimer.current = window.setTimeout(() => setCopied(null), COPIED_DURATION);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={labels.search}
          aria-label={labels.search}
          style={SEARCH_STYLE}
        />
        <span style={COUNT_STYLE}>
          {keyword ? labels.matched(matched, TOTAL) : labels.total(TOTAL)}
        </span>
      </div>

      {groups.length === 0 ? (
        <p style={COUNT_STYLE}>{labels.empty(query.trim())}</p>
      ) : (
        groups.map((group) => (
          <section key={group.name}>
            <h3 style={GROUP_TITLE_STYLE}>Icons – {group.name}</h3>
            <div style={GRID_STYLE}>
              {group.icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  title={labels.copy(icon)}
                  onClick={() => handleSelect(icon)}
                  style={copied === icon ? ITEM_COPIED_STYLE : ITEM_STYLE}
                >
                  <Icon icon={icon} />
                  <span style={NAME_STYLE}>{icon}</span>
                  {copied === icon && <Icon icon="check" flags="success" />}
                </button>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

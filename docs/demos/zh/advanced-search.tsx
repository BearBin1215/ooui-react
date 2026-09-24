import { useState } from "react";
import { Button, Dropdown, TextInput } from "ooui-react";
import "./advanced-search.css";

const SEARCH_CODES = {
  none: "无",
  intitle: "标题包含",
  incategory: "属于分类",
  hastemplate: "嵌入模板",
  linksto: "链接到",
  insource: "源码包含",
};

const OPTIONS = Object.entries(SEARCH_CODES).map(([value, label]) => ({
  value,
  children: label,
}));

function AdvancedSearchDemo() {
  const [rows, setRows] = useState([{ code: "none", value: "" }]);
  const addRow = () => setRows((prev) => [...prev, { code: "none", value: "" }]);
  const setRow = (index: number, patch: { code?: string; value?: string }) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  return (
    <div className="advsearch">
      <div className="advsearch-header">高级搜索</div>
      {rows.map(({ code, value }, index) => {
        const pending = index === rows.length - 1;
        return (
          <div
            key={index}
            className={`advsearch-line${pending ? " advsearch-line-pending" : ""}`}
          >
            <Dropdown
              className="advsearch-code"
              value={code}
              onChange={(next) => setRow(index, { code: String(next) })}
              onFocus={pending ? addRow : undefined}
              options={OPTIONS}
            />
            <TextInput
              className="advsearch-value"
              value={value}
              onChange={(next) => setRow(index, { value: next })}
              onFocus={pending ? addRow : undefined}
            />
            <Button
              className="advsearch-remove"
              icon="subtract"
              tabIndex={-1}
              disabled={pending}
              onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
            />
          </div>
        );
      })}
    </div>
  );
}

export default AdvancedSearchDemo;

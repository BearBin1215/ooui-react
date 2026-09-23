import { useRef, useState } from "react";
import { NumberInput } from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import { createRowAppender, useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

function OriginalNumber() {
  // 「当前值」读数随change事件更新（InputWidget.setValue派发），初始值与构造config.value一致
  const [currentValue, setCurrentValue] = useState<string>("5");
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const NumberInputWidget = oo.ui.NumberInputWidget as unknown as new (
      config?: Record<string, unknown>,
    ) => {
      $element: unknown;
      getValue: () => string;
      on: (event: string, handler: (value: string) => void) => void;
    };
    const widget = new NumberInputWidget({
      min: 0,
      max: 10,
      step: 1,
      showButtons: true,
      value: 5,
    });
    register(widget);
    container.appendChild(unwrapJQuery(widget.$element));
    widget.on("change", (value) => setCurrentValue(value));

    // 软校验样本：required空值加载即标红，键入合法值后清除
    const requiredWidget = new NumberInputWidget({
      required: true,
      showButtons: false,
      placeholder: "必填",
    });
    register(requiredWidget);
    const label = document.createElement("p");
    label.textContent = "required（空值/越界/非step倍数标红）";
    container.append(label, unwrapJQuery(requiredWidget.$element));

    // 标签变体：原版NumberInputWidget继承TextInputWidget，同样按标签宽度给input留内边距
    for (const config of [
      { label: "label after（默认）" },
      { label: "label before", labelPosition: "before" },
    ]) {
      const labelled = new NumberInputWidget({ showButtons: false, value: 1, ...config });
      register(labelled);
      const row = document.createElement("div");
      row.textContent = String(config.label);
      row.appendChild(unwrapJQuery(labelled.$element));
      container.appendChild(row);
    }
  });

  return (
    <div>
      <p>0-10，聚焦后滚轮/↑↓/PgUp/PgDn步进</p>
      <p>当前值：{currentValue === "" ? "（空）" : currentValue}</p>
      <div ref={containerRef} />
    </div>
  );
}

/** 原版侧：disabled/readOnly、buttonStep/pageStep、allowInteger、无step小数区间 */
function OriginalVariants() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const NumberInputWidget = oo.ui.NumberInputWidget as unknown as new (
      config?: Record<string, unknown>,
    ) => { $element: unknown };
    const row = createRowAppender(container, register);

    row(NumberInputWidget, "禁用（按钮/滚轮/键盘步进抑制）", {
      min: 0,
      max: 10,
      showButtons: true,
      value: 5,
      disabled: true,
    });
    row(NumberInputWidget, "readOnly（按钮禁用，可聚焦）", {
      min: 0,
      max: 10,
      showButtons: true,
      value: 5,
      readOnly: true,
    });
    row(NumberInputWidget, "buttonStep=5+pageStep=50", {
      min: 0,
      max: 200,
      step: 1,
      buttonStep: 5,
      pageStep: 50,
      showButtons: true,
      value: 10,
    });
    row(NumberInputWidget, "allowInteger（强制step=1）", {
      min: 0,
      max: 10,
      step: 0.5,
      allowInteger: true,
      showButtons: true,
      value: 3,
    });
    row(NumberInputWidget, "isInteger（allowInteger别名，同样强制step=1）", {
      min: 0,
      max: 10,
      step: 0.5,
      isInteger: true,
      showButtons: true,
      value: 3,
    });
    row(NumberInputWidget, "小数与跨零区间（step=0.1为合法性步距演示）", {
      min: -1,
      max: 1,
      step: 0.1,
      showButtons: true,
      value: 0.5,
    });
    row(NumberInputWidget, "icon+indicator", {
      icon: "edit",
      indicator: "down",
    });
    row(NumberInputWidget, "invisibleLabel+label", {
      label: "视觉隐藏标签",
      labelPosition: "before",
      invisibleLabel: true,
    });
    row(NumberInputWidget, "flags=primary（输出flaggedElement类）", { flags: "primary" });
    row(NumberInputWidget, "name（落input的name属性）", { name: "number-name" });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：与原版区块同名的参数组合 */
function ReactVariants() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div>
      <div>
        禁用（按钮/滚轮/键盘步进抑制）
        <NumberInput min={0} max={10} showButtons defaultValue={5} disabled />
      </div>
      <div>
        readOnly（按钮禁用，可聚焦）
        <NumberInput min={0} max={10} showButtons defaultValue={5} readOnly />
      </div>
      <div>
        buttonStep=5+pageStep=50
        <NumberInput
          min={0}
          max={200}
          step={1}
          buttonStep={5}
          pageStep={50}
          showButtons
          defaultValue={10}
        />
      </div>
      <div>
        allowInteger（强制step=1）
        <NumberInput
          min={0}
          max={10}
          step={0.5}
          allowInteger
          showButtons
          defaultValue={3}
        />
      </div>
      <div>
        isInteger（allowInteger别名，同样强制step=1）
        <NumberInput min={0} max={10} step={0.5} isInteger showButtons defaultValue={3} />
      </div>
      <div>
        小数与跨零区间（step=0.1为合法性步距演示）
        <NumberInput min={-1} max={1} step={0.1} showButtons defaultValue={0.5} />
      </div>
      <div>
        icon+indicator
        <NumberInput icon="edit" indicator="down" />
      </div>
      <div>
        invisibleLabel+label
        <NumberInput label="视觉隐藏标签" labelPosition="before" invisibleLabel />
      </div>
      <div>
        flags=primary（输出flaggedElement类）
        <NumberInput flags="primary" />
      </div>
      <div>
        name（落input的name属性）
        <NumberInput name="number-name" />
      </div>
      <div>
        {/* inputProps/inputRef为React侧逃生舱：自定义属性落到input、ref用于聚焦 */}
        inputProps+inputRef（自定义属性落input、按钮编程聚焦）
        <NumberInput
          inputProps={{ id: "number-custom-input", spellCheck: false }}
          inputRef={inputRef}
        />
        <button type="button" onClick={() => inputRef.current?.focus()}>
          聚焦input
        </button>
      </div>
    </div>
  );
}

function NumberComparePage() {
  const [value, setValue] = useState<number | "">(5);

  return (
    <CompareLayout
      title="NumberInput 对照"
      description={
        <>
          对照点：键入越界值保留、清空为空、空值时+/-从0起步、
          ↑↓按buttonStep、PgUp/PgDn按pageStep步进、聚焦时滚轮步进、
          +/-按钮不抢焦点（aria-hidden）；软校验反馈（required/min/max/step不满足时
          aria-invalid+invalid标志类标红，值变更防抖/失焦触发、聚焦清除，required空值在加载时即标红）；
          标签让位（labelPosition 两侧同步按标签宽度给 input 留内边距）。
          「状态与步距变体」区块验证disabled/readOnly对按钮、滚轮、键盘步进的抑制、
          buttonStep/pageStep步距、allowInteger与其别名isInteger均强制step=1
          （废弃兼容配置，React侧置位有开发期告警且两者文案不同）与小数区间。
        </>
      }
    >
      <h2>状态与步距变体</h2>
      <CompareColumns original={<OriginalVariants />}>
        <ReactVariants />
      </CompareColumns>

      <h2>受控与软校验</h2>
      <CompareColumns original={<OriginalNumber />}>
        <div>
          <p>0-10，聚焦后滚轮/↑↓/PgUp/PgDn步进</p>
          <p>当前值：{value === "" ? "（空）" : value}</p>
          <NumberInput
            min={0}
            max={10}
            step={1}
            showButtons
            value={value}
            onChange={(v) => setValue(v)}
          />
          <p>required（空值/越界/非step倍数标红）</p>
          <NumberInput required showButtons={false} placeholder="必填" />
          <div>
            label after（默认）
            <NumberInput
              showButtons={false}
              label="label after（默认）"
              defaultValue={1}
            />
          </div>
          <div>
            label before
            <NumberInput
              showButtons={false}
              label="label before"
              labelPosition="before"
              defaultValue={1}
            />
          </div>
        </div>
      </CompareColumns>
    </CompareLayout>
  );
}

NumberComparePage.displayName = "NumberComparePage";

export default NumberComparePage;

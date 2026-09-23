import { useState } from "react";
import {
  MenuTagMultiselect,
  pickValidTags,
  TagMultiselect,
  type TagOptionProps,
} from "ooui-react";
import {
  appendValueOutput,
  createRowAppender,
  useOriginalWidgets,
} from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

/** 菜单选项（两侧共用数据，React侧映射为value/label/icon） */
const menuItems = [
  { data: "option1", label: "选项一" },
  { data: "option2", label: "选项二" },
  { data: "option3", label: "选项三", icon: "tag" },
];

const reactMenuOptions: TagOptionProps[] = menuItems.map((item) => ({
  value: item.data,
  label: item.label,
  icon: item.icon,
}));

/** 菜单行选项：在共用菜单选项前补一个禁用项（对照禁用项呈禁用态、不可经菜单选定添加为标签） */
const menuWithDisabledOptions: TagOptionProps[] = [
  { value: "x", label: "禁用项", disabled: true },
  ...reactMenuOptions,
];

/** 固定标签演示选项：仅React侧会读取fixed */
const fixedItems = [
  { data: "lock", label: "固定项" },
  { data: "free1", label: "可移动1" },
  { data: "free2", label: "可移动2" },
];

const reactFixedOptions: TagOptionProps[] = [
  { value: "lock", label: "固定项", fixed: true },
  { value: "free1", label: "可移动1" },
  { value: "free2", label: "可移动2" },
];

type OriginalTagWidget = {
  $element: { addClass: (className: string) => void };
  on: (event: string, handler: () => void) => void;
  getValue: () => (string | number)[];
};

function OriginalTags() {
  const [values, setValues] = useState<Record<string, string>>({});
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as Record<string, unknown>;
    const append = createRowAppender(container, register);
    const Basic = ui.TagMultiselectWidget as unknown as new (
      config?: Record<string, unknown>,
    ) => OriginalTagWidget;
    const Menu = ui.MenuTagMultiselectWidget as unknown as new (
      config?: Record<string, unknown>,
    ) => OriginalTagWidget;
    const MenuOption = ui.MenuOptionWidget as unknown as new (
      config?: Record<string, unknown>,
    ) => unknown;

    /** 给原版控件根加测试标识类，并在行尾输出与React侧对称的实时change值 */
    const setup = (key: string, marker: string, widget: OriginalTagWidget) => {
      widget.$element.addClass(marker);
      const writeValue = appendValueOutput(widget);
      const sync = () => {
        const json = JSON.stringify(widget.getValue());
        writeValue(json);
        setValues((prev) => ({ ...prev, [key]: json }));
      };
      widget.on("change", sync);
      sync();
    };

    setup(
      "基础",
      "cmp-basic",
      append(Basic, "基础（任意值，inline输入）", {
        allowArbitrary: true,
        inputPosition: "inline",
        placeholder: "输入后回车添加",
      }),
    );
    setup(
      "白名单",
      "cmp-whitelist",
      append(Basic, "白名单（仅foo/bar/baz，非法值不添加）", {
        allowedValues: ["foo", "bar", "baz"],
        inputPosition: "inline",
        placeholder: "foo / bar / baz",
      }),
    );
    setup(
      "菜单",
      "cmp-menu",
      append(Menu, "菜单（outline输入，初始已选option1）", {
        inputPosition: "outline",
        placeholder: "输入过滤或从菜单选择",
        selected: ["option1"],
        options: menuItems,
        // 原版addOptions仅按data/label/icon重建菜单项（dist/oojs-ui.js:20450），disabled须
        // 经菜单items通道注入真正的MenuOptionWidget
        menu: {
          items: [new MenuOption({ data: "x", label: "禁用项", disabled: true })],
        },
      }),
    );
    setup(
      "菜单任意",
      "cmp-menu-arbitrary",
      append(Menu, "菜单+allowArbitrary（任意值回车可添加，过滤不高亮首项）", {
        allowArbitrary: true,
        inputPosition: "outline",
        placeholder: "输入任意值或从菜单选择",
        options: menuItems,
      }),
    );
    setup(
      "上限",
      "cmp-limit",
      append(Basic, "上限3（任意值，满额输入禁用）", {
        allowArbitrary: true,
        tagLimit: 3,
        inputPosition: "outline",
        placeholder: "最多3个标签",
      }),
    );
    setup(
      "非法展示",
      "cmp-invalid",
      append(Basic, "非法展示（allowDisplayInvalidTags，重复即非法）", {
        allowDisplayInvalidTags: true,
        allowArbitrary: true,
        inputPosition: "inline",
        placeholder: "可输入重复值观察invalid态",
      }),
    );
    setup(
      "宽度",
      "cmp-width",
      append(Basic, "宽度自适应（inline，预设3标签，输入框铺满本行剩余空间）", {
        allowArbitrary: true,
        inputPosition: "inline",
        placeholder: "输入框应铺满本行剩余空间",
        selected: ["alpha", "beta", "gamma"],
      }),
    );
    setup(
      "重排",
      "cmp-reorder",
      append(Basic, "拖拽重排（allowReordering缺省true，拖动标签换位）", {
        allowArbitrary: true,
        inputPosition: "outline",
        placeholder: "拖动标签可调整顺序",
        selected: ["一", "二", "三", "四"],
      }),
    );
    setup(
      "禁重排",
      "cmp-noreorder",
      append(Basic, "禁用重排（allowReordering:false，新增按白名单顺序插入）", {
        allowedValues: ["x", "y", "z"],
        allowReordering: false,
        inputPosition: "inline",
        placeholder: "依次输入z、x观察插入顺序",
        selected: ["y"],
      }),
    );
    setup(
      "固定",
      "cmp-fixed",
      append(Menu, "固定标签（React增强：固定项不可拖拽/移除；原版无fixed概念）", {
        inputPosition: "outline",
        selected: ["lock", "free1"],
        options: fixedItems,
      }),
    );
  });

  return (
    <div>
      <div ref={containerRef} />
      <p>change值：{JSON.stringify(values)}</p>
    </div>
  );
}

function ReactTags() {
  const [basic, setBasic] = useState<(string | number)[]>([]);
  const [whitelist, setWhitelist] = useState<(string | number)[]>([]);
  const [menu, setMenu] = useState<(string | number)[]>(["option1"]);
  const [menuArbitrary, setMenuArbitrary] = useState<(string | number)[]>([]);
  const [limit, setLimit] = useState<(string | number)[]>([]);
  const [invalidTags, setInvalidTags] = useState<(string | number)[]>([]);
  const [width, setWidth] = useState<(string | number)[]>(["alpha", "beta", "gamma"]);
  const [reorder, setReorder] = useState<(string | number)[]>(["一", "二", "三", "四"]);
  const [noReorder, setNoReorder] = useState<(string | number)[]>(["y"]);
  const [fixed, setFixed] = useState<(string | number)[]>(["lock", "free1"]);

  return (
    <div>
      {/* 每行行尾输出实时值（cmp-value），与原版侧appendValueOutput对称，保证左右行高一致 */}
      <div>
        基础（任意值，inline输入）
        <TagMultiselect
          className="cmp-basic"
          allowArbitrary
          inputPosition="inline"
          placeholder="输入后回车添加"
          value={basic}
          onChange={setBasic}
        />
        <span className="cmp-value">{JSON.stringify(basic)}</span>
      </div>
      <div>
        白名单（仅foo/bar/baz，非法值不添加）
        <TagMultiselect
          className="cmp-whitelist"
          allowedValues={["foo", "bar", "baz"]}
          inputPosition="inline"
          placeholder="foo / bar / baz"
          value={whitelist}
          onChange={setWhitelist}
        />
        <span className="cmp-value">{JSON.stringify(whitelist)}</span>
      </div>
      <div>
        菜单（outline输入，初始已选option1）
        <MenuTagMultiselect
          className="cmp-menu"
          inputPosition="outline"
          placeholder="输入过滤或从菜单选择"
          options={menuWithDisabledOptions}
          value={menu}
          onChange={setMenu}
        />
        <span className="cmp-value">{JSON.stringify(menu)}</span>
      </div>
      <div>
        菜单+allowArbitrary（任意值回车可添加，过滤不高亮首项）
        <MenuTagMultiselect
          className="cmp-menu-arbitrary"
          allowArbitrary
          inputPosition="outline"
          placeholder="输入任意值或从菜单选择"
          options={reactMenuOptions}
          value={menuArbitrary}
          onChange={setMenuArbitrary}
        />
        <span className="cmp-value">{JSON.stringify(menuArbitrary)}</span>
      </div>
      <div>
        上限3（任意值，满额输入禁用）
        <TagMultiselect
          className="cmp-limit"
          allowArbitrary
          tagLimit={3}
          inputPosition="outline"
          placeholder="最多3个标签"
          value={limit}
          onChange={setLimit}
        />
        <span className="cmp-value">{JSON.stringify(limit)}</span>
      </div>
      <div>
        非法展示（allowDisplayInvalidTags，重复即非法）
        <TagMultiselect
          className="cmp-invalid"
          allowDisplayInvalidTags
          allowArbitrary
          inputPosition="inline"
          placeholder="可输入重复值观察invalid态"
          value={invalidTags}
          onChange={setInvalidTags}
        />
        <span className="cmp-value">{JSON.stringify(invalidTags)}</span>
      </div>
      <div>
        宽度自适应（inline，预设3标签，输入框铺满本行剩余空间）
        <TagMultiselect
          className="cmp-width"
          allowArbitrary
          inputPosition="inline"
          placeholder="输入框应铺满本行剩余空间"
          value={width}
          onChange={setWidth}
        />
        <span className="cmp-value">{JSON.stringify(width)}</span>
      </div>
      <div>
        拖拽重排（allowReordering缺省true，拖动标签换位）
        <TagMultiselect
          className="cmp-reorder"
          allowArbitrary
          inputPosition="outline"
          placeholder="拖动标签可调整顺序"
          value={reorder}
          onChange={setReorder}
        />
        <span className="cmp-value">{JSON.stringify(reorder)}</span>
      </div>
      <div>
        禁用重排（allowReordering:false，新增按白名单顺序插入）
        <TagMultiselect
          className="cmp-noreorder"
          allowedValues={["x", "y", "z"]}
          allowReordering={false}
          inputPosition="inline"
          placeholder="依次输入z、x观察插入顺序"
          value={noReorder}
          onChange={setNoReorder}
        />
        <span className="cmp-value">{JSON.stringify(noReorder)}</span>
      </div>
      <div>
        固定标签（React增强：固定项不可拖拽/移除；原版无fixed概念）
        <MenuTagMultiselect
          className="cmp-fixed"
          inputPosition="outline"
          options={reactFixedOptions}
          value={fixed}
          onChange={setFixed}
        />
        <span className="cmp-value">{JSON.stringify(fixed)}</span>
      </div>
      <p>
        change值：
        {JSON.stringify({
          基础: basic,
          白名单: whitelist,
          菜单: menu,
          菜单任意: menuArbitrary,
          上限: limit,
          非法展示: invalidTags,
          宽度: width,
          重排: reorder,
          禁重排: noReorder,
          固定: fixed,
        })}
      </p>
    </div>
  );
}

/** 原版侧：disabled/inputPosition=none/allowDuplicates/allowEditTags=false/icon/非法值只读通道 */
function OriginalVariants() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as Record<string, unknown>;
    const Basic = ui.TagMultiselectWidget as unknown as new (
      config?: Record<string, unknown>,
    ) => OriginalTagWidget;
    const Menu = ui.MenuTagMultiselectWidget as unknown as new (
      config?: Record<string, unknown>,
    ) => OriginalTagWidget;
    const row = createRowAppender(container, register);

    row(Basic, "禁用", {
      allowArbitrary: true,
      inputPosition: "inline",
      selected: ["alpha", "beta"],
      disabled: true,
    });
    row(Menu, "inputPosition=none（无输入框，纯标签+菜单）", {
      inputPosition: "none",
      options: menuItems,
      selected: ["option1"],
    });
    row(Basic, "allowDuplicates（重复值可添加）", {
      allowArbitrary: true,
      allowDuplicates: true,
      inputPosition: "inline",
      placeholder: "连续输入同一个值试试",
    });
    row(Basic, "allowEditTags=false（点击标签不回填编辑）", {
      allowArbitrary: true,
      allowEditTags: false,
      inputPosition: "inline",
      selected: ["点击我不回填"],
    });
    row(Basic, "icon+indicator", {
      allowArbitrary: true,
      inputPosition: "inline",
      icon: "tag",
      indicator: "down",
    });
    row(Basic, "非受控defaultValue（构造期初值）", {
      allowArbitrary: true,
      inputPosition: "inline",
      selected: ["one", "two"],
    });
    row(Basic, "flags=primary（输出flaggedElement类）", {
      allowArbitrary: true,
      inputPosition: "inline",
      flags: "primary",
    });
    row(Basic, "name（落隐藏input的name属性）", {
      allowArbitrary: true,
      inputPosition: "inline",
      name: "tags-name",
    });
    row(Menu, "clearInputOnChoose=false（选定后保留输入文本）", {
      clearInputOnChoose: false,
      inputPosition: "inline",
      options: menuItems,
      placeholder: "输入并选定后观察输入框",
    });
  });

  return (
    <div>
      <div ref={containerRef} />
      <p>原版无非法值派生回调，只能经getValue()命令式读取合法子集。</p>
    </div>
  );
}

/** React侧：disabled/inputPosition=none/allowDuplicates/allowEditTags=false/icon/非受控/非法值回调 */
function ReactVariants() {
  const [dup, setDup] = useState<(string | number)[]>([]);
  const [editable, setEditable] = useState<(string | number)[]>(["点击我不回填"]);
  const [iconed, setIconed] = useState<(string | number)[]>([]);
  const [invalidValues, setInvalidValues] = useState<(string | number)[]>([]);

  return (
    <div>
      <div>
        禁用
        <TagMultiselect
          allowArbitrary
          inputPosition="inline"
          defaultValue={["alpha", "beta"]}
          disabled
        />
      </div>
      <div>
        inputPosition=none（无输入框，纯标签+菜单）
        <MenuTagMultiselect
          inputPosition="none"
          options={reactMenuOptions}
          defaultValue={["option1"]}
        />
      </div>
      <div>
        allowDuplicates（重复值可添加）
        <TagMultiselect
          allowArbitrary
          allowDuplicates
          inputPosition="inline"
          placeholder="连续输入同一个值试试"
          value={dup}
          onChange={setDup}
        />
        <span className="cmp-value">{JSON.stringify(dup)}</span>
      </div>
      <div>
        allowEditTags=false（点击标签不回填编辑）
        <TagMultiselect
          allowArbitrary
          allowEditTags={false}
          inputPosition="inline"
          value={editable}
          onChange={setEditable}
        />
        <span className="cmp-value">{JSON.stringify(editable)}</span>
      </div>
      <div>
        icon+indicator
        <TagMultiselect
          allowArbitrary
          inputPosition="inline"
          icon="tag"
          indicator="down"
          value={iconed}
          onChange={setIconed}
        />
        <span className="cmp-value">{JSON.stringify(iconed)}</span>
      </div>
      <div>
        非受控defaultValue（构造期初值）
        <TagMultiselect
          allowArbitrary
          inputPosition="inline"
          defaultValue={["one", "two"]}
        />
      </div>
      <div>
        flags=primary（输出flaggedElement类）
        <TagMultiselect allowArbitrary inputPosition="inline" flags="primary" />
      </div>
      <div>
        name（落隐藏input的name属性）
        <TagMultiselect allowArbitrary inputPosition="inline" name="tags-name" />
      </div>
      <div>
        clearInputOnChoose=false（选定后保留输入文本）
        <MenuTagMultiselect
          clearInputOnChoose={false}
          inputPosition="inline"
          options={reactMenuOptions}
          placeholder="输入并选定后观察输入框"
        />
      </div>
      <div>
        {/* pickValidTags为公开纯函数：与组件同款合法性规则过滤值序列（React侧工具） */}
        pickValidTags（与组件同款合法性规则过滤值序列）
        <div>
          <span className="cmp-value">
            {JSON.stringify(
              pickValidTags(["option1", "option1", "unknown"], {
                options: reactMenuOptions,
              }),
            )}
          </span>
          <span className="cmp-value">
            {JSON.stringify(
              pickValidTags(["option1", "option1", "unknown"], {
                options: reactMenuOptions,
                allowDuplicates: true,
                allowArbitrary: true,
              }),
            )}
          </span>
        </div>
      </div>
      <div>
        {/* labelText为React扩展：原版OptionWidget.getMatchText无显式matchText通道
            （dist/oojs-ui.js:7175，取字符串label或渲染文本）。菜单前缀过滤与选定回填
            用labelText纯文本、不取渲染内容（rich项输入「富」不匹配、输入「rich」匹配）；
            富内容label未给labelText的选项（nokey项）退出前缀过滤 */}
        labelText（富内容选项的纯文本匹配键，React扩展）
        <MenuTagMultiselect
          inputPosition="outline"
          placeholder="输入rich或富观察过滤与回填"
          options={[
            { value: "rich", label: <b>富文本选项</b>, labelText: "rich" },
            { value: "plain", label: "纯文本选项" },
            { value: "nokey", label: <b>富内容无纯文本键</b> },
          ]}
        />
      </div>
      <div>
        {/* onInvalidTagsChange为React增强通道（原版经getInvalidTags命令式读取），置区块末尾 */}
        onInvalidTagsChange（非法值派生回调，allowDisplayInvalidTags下重复即非法）
        <TagMultiselect
          allowDisplayInvalidTags
          allowArbitrary
          inputPosition="inline"
          placeholder="可输入重复值观察回调"
          onInvalidTagsChange={setInvalidValues}
        />
        <span className="cmp-value">{JSON.stringify(invalidValues)}</span>
      </div>
    </div>
  );
}

function TagMultiselectComparePage() {
  return (
    <CompareLayout
      title="TagMultiselect / MenuTagMultiselect 对照"
      description={
        <>
          对照点：标签以chip呈现、输入后Enter添加、Backspace（未输入时）移除末尾标签并回填文本、
          点击标签移回输入框编辑、←→在标签与输入框间导航、Escape清空输入；白名单校验（非法值不添加）、
          tagLimit满额后输入禁用、allowDisplayInvalidTags以invalid态展示非法/重复值；
          菜单形态：输入过滤菜单、↑↓移动高亮、Enter选定、点击切换标签、已添加标签的菜单项呈选中态、
          禁用项呈禁用态且不可经菜单选定添加（直接输入其值仍可添加，两侧同规则）、
          allowArbitrary下任意值回车可添加且过滤不高亮首项；
          inline输入框宽度自适应（输入框铺满本行剩余空间，空间不足时换行取整行）；
          拖拽重排（拖动标签换位，drop后写回值顺序）；固定标签为React增强（原版无fixed概念）。
          「状态与输入形态变体」区块验证disabled、inputPosition=none（无输入框形态，本工程该形态
          可用鼠标展开菜单但暂无键盘通道，属对原版的增强而非缺口，见DEVIATIONS「增强」）、
          allowDuplicates、allowEditTags=false、
          icon/indicator、非受控defaultValue与onInvalidTagsChange派生回调（对应原版
          getValue()只返回合法子集的只读口径）；labelText为React扩展（原版getMatchText
          无显式matchText通道，作为富内容选项的纯文本匹配键）。
        </>
      }
    >
      <CompareColumns original={<OriginalTags />}>
        <ReactTags />
      </CompareColumns>

      <h2>状态与输入形态变体</h2>
      <CompareColumns original={<OriginalVariants />}>
        <ReactVariants />
      </CompareColumns>
    </CompareLayout>
  );
}

TagMultiselectComparePage.displayName = "TagMultiselectComparePage";

export default TagMultiselectComparePage;

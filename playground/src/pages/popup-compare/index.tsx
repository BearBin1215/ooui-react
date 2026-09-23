import { useEffect, useRef, useState } from "react";
import { Button, OOUIProvider, Popup, PopupButton, type PopupAlign } from "ooui-react";
import { unwrapJQuery } from "../../components/ooui";
import { useOriginalWidgets } from "../../components/original";
import { CompareColumns, CompareLayout } from "../../components/CompareLayout";

/** 原版侧：PopupButtonWidget + 手动toggle的PopupWidget（各方位/无箭头/悬浮） */
function OriginalPopups() {
  const buttonHostRef = useRef<HTMLDivElement>(null);
  const aboveHostRef = useRef<HTMLDivElement>(null);
  const sideHostRef = useRef<HTMLDivElement>(null);
  const noArrowHostRef = useRef<HTMLDivElement>(null);
  const hoverHostRef = useRef<HTMLDivElement>(null);
  useOriginalWidgets((oo, _container, register) => {
    const $ = (window as unknown as { $: (arg: Node) => unknown }).$;
    // 与React版等价：带头部/关闭按钮、padded
    const button = new oo.ui.PopupButtonWidget({
      label: "原版弹层按钮",
      icon: "help",
      popup: {
        padded: true,
        head: true,
      },
    });
    register(button);
    button.getPopup().$body.append(
      Object.assign(document.createElement("p"), {
        textContent: "这是原版PopupButtonWidget的内容。",
      }),
    );
    buttonHostRef.current?.appendChild(unwrapJQuery(button.$element));

    // 无边框变体：验证弹层的-frameless-popup类（对应React侧framed={false}）
    const framelessButton = new oo.ui.PopupButtonWidget({
      framed: false,
      label: "原版无边框弹层",
      popup: { padded: true },
    });
    register(framelessButton);
    framelessButton
      .getPopup()
      .$body.append(
        Object.assign(document.createElement("p"), { textContent: "无边框变体的内容。" }),
      );
    buttonHostRef.current?.appendChild(unwrapJQuery(framelessButton.$element));

    // 禁用：弹层按钮整体不可交互
    const disabledButton = new oo.ui.PopupButtonWidget({
      label: "原版禁用弹层按钮",
      disabled: true,
      popup: { padded: true },
    });
    register(disabledButton);
    disabledButton.getPopup().$body.append(
      Object.assign(document.createElement("p"), {
        textContent: "禁用弹层按钮的内容。",
      }),
    );
    buttonHostRef.current?.appendChild(unwrapJQuery(disabledButton.$element));

    // pressed为瞬时按压类，原版无声明式通道：静态加类模拟（React为pressed prop）
    const pressedButton = new oo.ui.PopupButtonWidget({
      label: "原版按压态",
      popup: { padded: true },
    });
    (unwrapJQuery(pressedButton.$element) as HTMLElement).classList.add(
      "oo-ui-buttonElement-pressed",
    );
    register(pressedButton);
    pressedButton.getPopup().$body.append(
      Object.assign(document.createElement("p"), {
        textContent: "按压态弹层按钮的内容。",
      }),
    );
    buttonHostRef.current?.appendChild(unwrapJQuery(pressedButton.$element));

    // invisibleLabel：标签转入title，仅图标/指示器可见
    const invisibleLabelButton = new oo.ui.PopupButtonWidget({
      label: "原版图标弹层按钮",
      invisibleLabel: true,
      icon: "help",
      indicator: "down",
      popup: { padded: true },
    });
    register(invisibleLabelButton);
    invisibleLabelButton.getPopup().$body.append(
      Object.assign(document.createElement("p"), {
        textContent: "invisibleLabel的内容。",
      }),
    );
    buttonHostRef.current?.appendChild(unwrapJQuery(invisibleLabelButton.$element));

    // 原版PopupWidget的$content要求jQuery对象
    const anchorButton = new oo.ui.ButtonWidget({ label: "原版上方弹出" });
    const popup = new oo.ui.PopupWidget({
      $content: $(
        Object.assign(document.createElement("p"), {
          textContent: "原版受控Popup，上方弹出。",
        }),
      ),
      padded: true,
      $floatableContainer: anchorButton.$element,
      position: "above",
      autoClose: true,
      $autoCloseIgnore: anchorButton.$element,
    });
    register(anchorButton, popup);
    aboveHostRef.current?.appendChild(unwrapJQuery(anchorButton.$element));
    aboveHostRef.current?.appendChild(unwrapJQuery(popup.$element));
    anchorButton.on("click", () => popup.toggle(true));

    // 侧面弹出对照：before（LTR下左侧）/after（LTR下右侧）
    (
      [
        { label: "原版左侧弹出", position: "before" },
        { label: "原版右侧弹出", position: "after" },
      ] as const
    ).forEach(({ label, position }) => {
      const sideButton = new oo.ui.ButtonWidget({ label });
      const sidePopup = new oo.ui.PopupWidget({
        $content: $(
          Object.assign(document.createElement("p"), {
            textContent: `${label}内容。`,
          }),
        ),
        padded: true,
        $floatableContainer: sideButton.$element,
        position,
        autoClose: true,
        $autoCloseIgnore: sideButton.$element,
      });
      register(sideButton, sidePopup);
      sideHostRef.current?.appendChild(unwrapJQuery(sideButton.$element));
      sideHostRef.current?.appendChild(unwrapJQuery(sidePopup.$element));
      sideButton.on("click", () => sidePopup.toggle());
    });

    // 无箭头对照：原版anchor:false，React对应anchor={false}
    const noArrowButton = new oo.ui.ButtonWidget({ label: "原版无箭头弹层" });
    const noArrowPopup = new oo.ui.PopupWidget({
      $content: $(
        Object.assign(document.createElement("p"), {
          textContent: "原版无箭头Popup，下方弹出。",
        }),
      ),
      padded: true,
      anchor: false,
      $floatableContainer: noArrowButton.$element,
      autoClose: true,
      $autoCloseIgnore: noArrowButton.$element,
    });
    register(noArrowButton, noArrowPopup);
    noArrowHostRef.current?.appendChild(unwrapJQuery(noArrowButton.$element));
    noArrowHostRef.current?.appendChild(unwrapJQuery(noArrowPopup.$element));
    noArrowButton.on("click", () => noArrowPopup.toggle());

    // 悬浮触发对照：原版无内置封装，容器mouseenter/mouseleave手动toggle（两侧等价接线）
    const hoverButton = new oo.ui.ButtonWidget({ label: "悬浮我试试（原版）" });
    const hoverPopup = new oo.ui.PopupWidget({
      $content: $(
        Object.assign(document.createElement("p"), {
          textContent: "原版悬浮弹层，移开后消失。",
        }),
      ),
      padded: true,
      $floatableContainer: hoverButton.$element,
      position: "below",
    });
    register(hoverButton, hoverPopup);
    const hoverHost = hoverHostRef.current;
    if (hoverHost) {
      hoverHost.appendChild(unwrapJQuery(hoverButton.$element));
      hoverHost.appendChild(unwrapJQuery(hoverPopup.$element));
      hoverHost.addEventListener("mouseenter", () => hoverPopup.toggle(true));
      hoverHost.addEventListener("mouseleave", () => hoverPopup.toggle(false));
    }
  });

  return (
    <div>
      <div ref={buttonHostRef} />
      <div style={{ height: "1em" }} />
      <div ref={aboveHostRef} />
      <div style={{ height: "1em" }} />
      <div ref={sideHostRef} />
      <div style={{ height: "1em" }} />
      <div ref={noArrowHostRef} />
      <div style={{ height: "1em" }} />
      <div ref={hoverHostRef} style={{ display: "inline-block", position: "relative" }} />
    </div>
  );
}

/** React侧：受控Popup，锚定按钮、上方弹出（与原版手动toggle对照） */
function AboveReact() {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button ref={ref} onClick={() => setOpen((v) => !v)}>
        React上方弹出
      </Button>
      <Popup
        open={open}
        container={ref}
        padded
        position="above"
        autoClose
        autoCloseIgnore={ref}
        onOpenChange={setOpen}
      >
        <p>React受控Popup，上方弹出。</p>
      </Popup>
    </>
  );
}

/** React侧：侧面弹出对照（before=左侧/after=右侧，与原版手动toggle对照） */
function SideReact({ label, position }: { label: string; position: "before" | "after" }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button ref={ref} onClick={() => setOpen((v) => !v)}>
        {label}
      </Button>
      <Popup
        open={open}
        container={ref}
        padded
        position={position}
        autoClose
        autoCloseIgnore={ref}
        onOpenChange={setOpen}
      >
        <p>React{label}内容。</p>
      </Popup>
    </>
  );
}

/** React侧：无箭头对照（anchor={false}，与原版noArrow对照） */
function NoArrowReact() {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button ref={ref} onClick={() => setOpen((v) => !v)}>
        React无箭头弹层
      </Button>
      <Popup
        open={open}
        container={ref}
        padded
        anchor={false}
        autoClose
        autoCloseIgnore={ref}
        onOpenChange={setOpen}
      >
        <p>React无箭头Popup，下方弹出。</p>
      </Popup>
    </>
  );
}

function ReactPopups() {
  const hoverRef = useRef<HTMLDivElement>(null);
  const [hoverOpen, setHoverOpen] = useState(false);

  return (
    <div>
      {/* 行分组与原版侧宿主一一对应：按钮行/上方/侧面/无箭头/悬浮，1em间隔同步 */}
      <div>
        <PopupButton
          padded
          head
          icon="help"
          popupContent={<p>这是React版PopupButton的内容。</p>}
        >
          React弹层按钮
        </PopupButton>
        <PopupButton framed={false} padded popupContent={<p>无边框变体的内容。</p>}>
          React无边框弹层
        </PopupButton>
        <PopupButton padded disabled popupContent={<p>禁用弹层按钮的内容。</p>}>
          React禁用弹层按钮
        </PopupButton>
        {/* pressed为瞬时按压态prop，静态演示（原版侧以加类模拟同一机制） */}
        <PopupButton padded pressed popupContent={<p>按压态弹层按钮的内容。</p>}>
          React按压态
        </PopupButton>
        <PopupButton
          padded
          invisibleLabel
          icon="help"
          indicator="down"
          title="React图标弹层按钮"
          popupContent={<p>invisibleLabel的内容。</p>}
        />
      </div>
      <div style={{ height: "1em" }} />
      <AboveReact />
      <div style={{ height: "1em" }} />
      <div>
        <SideReact label="左侧弹出" position="before" />{" "}
        <SideReact label="右侧弹出" position="after" />
      </div>
      <div style={{ height: "1em" }} />
      <NoArrowReact />
      <div style={{ height: "1em" }} />
      <div
        ref={hoverRef}
        style={{ display: "inline-block", position: "relative" }}
        onMouseEnter={() => setHoverOpen(true)}
        onMouseLeave={() => setHoverOpen(false)}
      >
        <Button>悬浮我试试（React）</Button>
        {/* 弹层portal在body上，若不保持悬浮，指针从按钮移入弹层的瞬间会先触发关闭；
            原版弹层是宿主的子节点无此问题，此处补齐等价行为 */}
        <Popup
          open={hoverOpen}
          container={hoverRef}
          padded
          onMouseEnter={() => setHoverOpen(true)}
          onMouseLeave={() => setHoverOpen(false)}
        >
          <p>React悬浮弹层，移开后消失。</p>
        </Popup>
      </div>
    </div>
  );
}

/** 原版侧：靠近视口底部的PopupButton，autoFlip默认开启应向上翻转 */
function OriginalAutoFlip() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const $ = (window as unknown as { $: (arg: Node) => unknown }).$;
    const button = new oo.ui.PopupButtonWidget({
      label: "接近底部",
      popup: {
        padded: true,
        $content: $(
          Object.assign(document.createElement("p"), {
            textContent: "我应该向上翻转显示。",
          }),
        ),
      },
    });
    register(button);
    container.appendChild(unwrapJQuery(button.$element));
  });

  return (
    <div>
      <p style={{ marginTop: "60vh" }} ref={containerRef} />
    </div>
  );
}

/** React侧：靠近视口底部的PopupButton（受控开关），验证autoFlip翻转 */
function ReactAutoFlip() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <p style={{ marginTop: "60vh" }}>
        <PopupButton
          label="接近底部"
          padded
          position="below"
          open={open}
          onClick={() => setOpen((v) => !v)}
          onOpenChange={setOpen}
          popupContent={<p>我应该向上翻转显示。</p>}
        >
          接近底部
        </PopupButton>
      </p>
    </div>
  );
}

/** 原版侧：align对齐方向（forwards/backwards是逻辑值、随方向换物理侧；force-left/force-right是物理值、弹层体恒在锚点物理左/右侧。缺省center） */
function OriginalAlignPopups() {
  const forwardsHostRef = useRef<HTMLDivElement>(null);
  const backwardsHostRef = useRef<HTMLDivElement>(null);
  const forceLeftHostRef = useRef<HTMLDivElement>(null);
  const forceRightHostRef = useRef<HTMLDivElement>(null);
  useOriginalWidgets((oo, _container, register) => {
    const $ = (window as unknown as { $: (arg: Node) => unknown }).$;
    const build = (label: string, align: string, host: HTMLDivElement | null) => {
      const anchorButton = new oo.ui.ButtonWidget({ label });
      const popup = new oo.ui.PopupWidget({
        $content: $(
          Object.assign(document.createElement("p"), { textContent: `${label}内容。` }),
        ),
        padded: true,
        $floatableContainer: anchorButton.$element,
        align,
        autoClose: true,
        $autoCloseIgnore: anchorButton.$element,
      });
      register(anchorButton, popup);
      host?.appendChild(unwrapJQuery(anchorButton.$element));
      host?.appendChild(unwrapJQuery(popup.$element));
      anchorButton.on("click", () => popup.toggle());
    };
    build("原版align=forwards", "forwards", forwardsHostRef.current);
    build("原版align=backwards", "backwards", backwardsHostRef.current);
    build("原版align=force-left", "force-left", forceLeftHostRef.current);
    build("原版align=force-right", "force-right", forceRightHostRef.current);
  });

  return (
    <div>
      <div ref={forwardsHostRef} />
      <div style={{ height: "1em" }} />
      <div ref={backwardsHostRef} />
      <div style={{ height: "1em" }} />
      <div ref={forceLeftHostRef} />
      <div style={{ height: "1em" }} />
      <div ref={forceRightHostRef} />
    </div>
  );
}

/** React侧：align对齐方向对照 */
function ReactAlignPopups() {
  return (
    <div>
      <AlignPopup label="React align=forwards" align="forwards" />
      <div style={{ height: "1em" }} />
      <AlignPopup label="React align=backwards" align="backwards" />
      <div style={{ height: "1em" }} />
      <AlignPopup label="React align=force-left" align="force-left" />
      <div style={{ height: "1em" }} />
      <AlignPopup label="React align=force-right" align="force-right" />
    </div>
  );
}

function AlignPopup({ label, align }: { label: string; align: PopupAlign }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button ref={ref} onClick={() => setOpen((v) => !v)}>
        {label}
      </Button>
      <Popup
        open={open}
        container={ref}
        padded
        align={align}
        autoClose
        autoCloseIgnore={ref}
        onOpenChange={setOpen}
      >
        <p>{label}内容。</p>
      </Popup>
    </>
  );
}

/** 原版侧：非受控初始打开（构造后toggle(true)，与React defaultOpen对称） */
function OriginalDefaultOpen() {
  const hostRef = useRef<HTMLDivElement>(null);
  useOriginalWidgets((oo, _container, register) => {
    const $ = (window as unknown as { $: (arg: Node) => unknown }).$;
    const anchorButton = new oo.ui.ButtonWidget({ label: "原版初始打开" });
    const popup = new oo.ui.PopupWidget({
      $content: $(
        Object.assign(document.createElement("p"), {
          textContent: "非受控初始打开，弹层随锚点。",
        }),
      ),
      padded: true,
      $floatableContainer: anchorButton.$element,
      autoClose: true,
      $autoCloseIgnore: anchorButton.$element,
    });
    register(anchorButton, popup);
    hostRef.current?.appendChild(unwrapJQuery(anchorButton.$element));
    hostRef.current?.appendChild(unwrapJQuery(popup.$element));
    anchorButton.on("click", () => popup.toggle());
    popup.toggle(true);

    // PopupButtonWidget形态：构造后getPopup().toggle(true)（React为defaultOpen prop），
    // 关闭后点按钮可再开
    const popupButton = new oo.ui.PopupButtonWidget({
      label: "原版初始打开按钮",
      popup: { padded: true },
    });
    register(popupButton);
    // 本页OOUI类型声明的PopupButtonWidget.getPopup()未列toggle，cast补齐（运行时为PopupWidget）
    const defaultOpenPopup = popupButton.getPopup() as {
      $body: { append: (el: Node) => void };
      toggle: (show?: boolean) => void;
    };
    defaultOpenPopup.$body.append(
      Object.assign(document.createElement("p"), {
        textContent: "构造后立即打开的弹层按钮。",
      }),
    );
    hostRef.current?.appendChild(unwrapJQuery(popupButton.$element));
    defaultOpenPopup.toggle(true);
  });

  return (
    <div>
      <div ref={hostRef} />
    </div>
  );
}

/** React侧：非受控defaultOpen（初始即打开，关闭走内部状态，不经受控props） */
function ReactDefaultOpen() {
  const ref = useRef<HTMLSpanElement | null>(null);

  return (
    <>
      {/* 纯非受控演示：锚点为静态文本，defaultOpen初始打开；点外部/Escape关闭后不复活 */}
      <span ref={ref} style={{ display: "inline-block", padding: "0 4px" }}>
        React初始打开（锚点）
      </span>
      <Popup defaultOpen container={ref} padded autoClose autoCloseIgnore={ref}>
        <p>非受控初始打开，弹层随锚点。</p>
      </Popup>
      {/* PopupButton形态：defaultOpen非受控初始打开，关闭后点按钮可再开 */}
      <div>
        <PopupButton defaultOpen padded popupContent={<p>构造后立即打开的弹层按钮。</p>}>
          React初始打开按钮
        </PopupButton>
      </div>
    </>
  );
}

/** 原版侧：autoFlip=false（接近底部不翻转，改为钳制） */
function OriginalNoFlip() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const $ = (window as unknown as { $: (arg: Node) => unknown }).$;
    const button = new oo.ui.PopupButtonWidget({
      label: "接近底部不翻转",
      popup: {
        padded: true,
        autoFlip: false,
        $content: $(
          Object.assign(document.createElement("p"), {
            textContent: "autoFlip=false：不向上翻转，空间不足时钳制。",
          }),
        ),
      },
    });
    register(button);
    container.appendChild(unwrapJQuery(button.$element));
  });

  return (
    <div>
      <p style={{ marginTop: "60vh" }} ref={containerRef} />
    </div>
  );
}

/** React侧：autoFlip=false（接近底部不翻转） */
function ReactNoFlip() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <p style={{ marginTop: "60vh" }}>
        <PopupButton
          label="不翻转"
          padded
          autoFlip={false}
          open={open}
          onClick={() => setOpen((v) => !v)}
          onOpenChange={setOpen}
          popupContent={<p>autoFlip=false：不向上翻转，空间不足时钳制。</p>}
        >
          接近底部不翻转
        </PopupButton>
      </p>
    </div>
  );
}

/** 原版侧：hideWhenOutOfView（锚点滚出视口弹层隐藏，滚回恢复） */
function OriginalOutOfView() {
  const hostRef = useRef<HTMLDivElement>(null);
  useOriginalWidgets((oo, _container, register) => {
    const $ = (window as unknown as { $: (arg: Node) => unknown }).$;
    const host = hostRef.current;
    if (!host) {
      return;
    }
    const anchorButton = new oo.ui.ButtonWidget({ label: "打开弹层后向下滚动" });
    const popup = new oo.ui.PopupWidget({
      $content: $(
        Object.assign(document.createElement("p"), {
          textContent: "锚点滚出视口后本弹层隐藏。",
        }),
      ),
      padded: true,
      $floatableContainer: anchorButton.$element,
      autoClose: true,
      $autoCloseIgnore: anchorButton.$element,
    });
    register(anchorButton, popup);
    host.appendChild(unwrapJQuery(anchorButton.$element));
    host.appendChild(unwrapJQuery(popup.$element));
    anchorButton.on("click", () => popup.toggle());
  });

  return (
    <div style={{ height: 140, overflow: "auto", border: "1px solid #c8ccd1" }}>
      <div style={{ height: 60 }}>顶部占位。</div>
      <div ref={hostRef} style={{ padding: "0 8px" }} />
      <div style={{ height: 220 }}>底部占位（滚动到此锚点出视口）。</div>
    </div>
  );
}

/** React侧：hideWhenOutOfView（锚点滚出视口弹层隐藏，滚回恢复，open状态不变） */
function ReactOutOfView() {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div style={{ height: 140, overflow: "auto", border: "1px solid #c8ccd1" }}>
      <div style={{ height: 60 }}>顶部占位。</div>
      <div style={{ padding: "0 8px" }}>
        <Button ref={ref} onClick={() => setOpen((v) => !v)}>
          打开弹层后向下滚动
        </Button>
        <Popup
          open={open}
          container={ref}
          padded
          autoClose
          autoCloseIgnore={ref}
          onOpenChange={setOpen}
        >
          <p>锚点滚出视口后本弹层隐藏。</p>
        </Popup>
      </div>
      <div style={{ height: 220 }}>底部占位（滚动到此锚点出视口）。</div>
    </div>
  );
}

/** 原版侧：hideWhenOutOfView=false（滚出视口不隐藏）与containerPadding=30（容器钳制内边距） */
function OriginalOutOfViewOff() {
  const keepHostRef = useRef<HTMLDivElement>(null);
  const paddingHostRef = useRef<HTMLDivElement>(null);
  useOriginalWidgets((oo, _container, register) => {
    const $ = (window as unknown as { $: (arg: Node) => unknown }).$;
    const build = (
      label: string,
      content: string,
      config: Record<string, unknown>,
      host: HTMLDivElement | null,
    ) => {
      const anchorButton = new oo.ui.ButtonWidget({ label });
      const popup = new oo.ui.PopupWidget({
        $content: $(Object.assign(document.createElement("p"), { textContent: content })),
        padded: true,
        $floatableContainer: anchorButton.$element,
        autoClose: true,
        $autoCloseIgnore: anchorButton.$element,
        ...config,
      });
      register(anchorButton, popup);
      host?.appendChild(unwrapJQuery(anchorButton.$element));
      host?.appendChild(unwrapJQuery(popup.$element));
      anchorButton.on("click", () => popup.toggle());
    };

    build(
      "打开弹层后向下滚动",
      "原版hideWhenOutOfView=false：滚出视口后弹层保持显示。",
      { hideWhenOutOfView: false },
      keepHostRef.current,
    );

    // below弹层的钳制沿水平轴：按钮贴容器右缘，宽320的弹层被钳制在容器右缘内缩30px
    const padScrollBox = document.createElement("div");
    padScrollBox.style.cssText =
      "width:300px;height:140px;overflow:auto;border:1px solid #c8ccd1";
    const padSpacer = document.createElement("div");
    padSpacer.style.height = "20px";
    const padButtonHost = document.createElement("div");
    padButtonHost.style.textAlign = "right";
    const padBottom = document.createElement("div");
    padBottom.style.height = "60px";
    padBottom.textContent = "容器底部。";
    const padButton = new oo.ui.ButtonWidget({ label: "containerPadding=30" });
    const padPopup = new oo.ui.PopupWidget({
      $content: $(
        Object.assign(document.createElement("p"), {
          textContent: "弹层宽320超出300宽的容器，钳制后距容器右缘30px（缺省10px）。",
        }),
      ),
      padded: true,
      $floatableContainer: padButton.$element,
      autoClose: true,
      $autoCloseIgnore: padButton.$element,
      containerPadding: 30,
    });
    register(padButton, padPopup);
    padButtonHost.appendChild(unwrapJQuery(padButton.$element));
    padScrollBox.append(padSpacer, padButtonHost, padBottom);
    padScrollBox.appendChild(unwrapJQuery(padPopup.$element));
    padButton.on("click", () => padPopup.toggle());
    paddingHostRef.current?.append(padScrollBox);
  });

  return (
    <div>
      <div style={{ height: 140, overflow: "auto", border: "1px solid #c8ccd1" }}>
        <div style={{ height: 60 }}>顶部占位。</div>
        <div ref={keepHostRef} style={{ padding: "0 8px" }} />
        <div style={{ height: 220 }}>底部占位（滚动到此锚点出视口）。</div>
      </div>
      <div style={{ height: "1em" }} />
      <div ref={paddingHostRef} />
    </div>
  );
}

/** React侧：hideWhenOutOfView=false（滚出视口不隐藏）与containerPadding=30对照 */
function ReactOutOfViewOff() {
  const keepRef = useRef<HTMLSpanElement | null>(null);
  const [keepOpen, setKeepOpen] = useState(false);
  const paddingRef = useRef<HTMLSpanElement | null>(null);
  const [paddingOpen, setPaddingOpen] = useState(false);

  return (
    <div>
      <div style={{ height: 140, overflow: "auto", border: "1px solid #c8ccd1" }}>
        <div style={{ height: 60 }}>顶部占位。</div>
        <div style={{ padding: "0 8px" }}>
          <Button ref={keepRef} onClick={() => setKeepOpen((v) => !v)}>
            打开弹层后向下滚动
          </Button>
          <Popup
            open={keepOpen}
            container={keepRef}
            padded
            hideWhenOutOfView={false}
            autoClose
            autoCloseIgnore={keepRef}
            onOpenChange={setKeepOpen}
          >
            <p>React hideWhenOutOfView=false：滚出视口后弹层保持显示。</p>
          </Popup>
        </div>
        <div style={{ height: 220 }}>底部占位（滚动到此锚点出视口）。</div>
      </div>
      <div style={{ height: "1em" }} />
      {/* below弹层的钳制沿水平轴：按钮贴容器右缘，宽320的弹层被钳制在容器右缘内缩30px */}
      <div
        style={{ width: 300, height: 140, overflow: "auto", border: "1px solid #c8ccd1" }}
      >
        <div style={{ height: 20 }} />
        <div style={{ textAlign: "right" }}>
          <Button ref={paddingRef} onClick={() => setPaddingOpen((v) => !v)}>
            containerPadding=30
          </Button>
        </div>
        <Popup
          open={paddingOpen}
          container={paddingRef}
          padded
          containerPadding={30}
          autoClose
          autoCloseIgnore={paddingRef}
          onOpenChange={setPaddingOpen}
        >
          <p>弹层宽320超出300宽的容器，钳制后距容器右缘30px（缺省10px）。</p>
        </Popup>
        <div style={{ height: 60 }}>容器底部。</div>
      </div>
    </div>
  );
}

/** 原版侧：width/height固定尺寸、footer区、head+hideCloseButton */
function OriginalSizedPopups() {
  const sizedHostRef = useRef<HTMLDivElement>(null);
  const footerHostRef = useRef<HTMLDivElement>(null);
  const headHostRef = useRef<HTMLDivElement>(null);
  useOriginalWidgets((oo, _container, register) => {
    const $ = (window as unknown as { $: (arg: Node) => unknown }).$;
    const build = (
      label: string,
      config: Record<string, unknown>,
      content: string,
      host: HTMLDivElement | null,
    ) => {
      const anchorButton = new oo.ui.ButtonWidget({ label });
      const popup = new oo.ui.PopupWidget({
        $content: $(Object.assign(document.createElement("p"), { textContent: content })),
        padded: true,
        $floatableContainer: anchorButton.$element,
        autoClose: true,
        $autoCloseIgnore: anchorButton.$element,
        ...config,
      });
      register(anchorButton, popup);
      host?.appendChild(unwrapJQuery(anchorButton.$element));
      host?.appendChild(unwrapJQuery(popup.$element));
      anchorButton.on("click", () => popup.toggle());
    };

    build(
      "原版固定尺寸",
      { width: 200, height: 90 },
      "width=200、height=90的固定尺寸弹层。",
      sizedHostRef.current,
    );
    build(
      "原版footer区",
      {
        $footer: $(
          Object.assign(document.createElement("div"), {
            textContent: "底部操作区",
            style: "padding:4px 8px;border-top:1px solid #c8ccd1;",
          }),
        ),
      },
      "带footer区的弹层。",
      footerHostRef.current,
    );
    build(
      "原版head无关闭",
      { head: true, hideCloseButton: true, label: "仅头部" },
      "head=true且hideCloseButton=true。",
      headHostRef.current,
    );
    build(
      "原版head invisibleLabel",
      { head: true, label: "视觉隐藏头部标签", invisibleLabel: true },
      "head+invisibleLabel：头部标签视觉隐藏（title兜底）。",
      headHostRef.current,
    );
    // head由$icon+$label+closeButton组成（oojs-ui.js PopupWidget构造），icon即头部图标
    build(
      "原版head图标",
      { head: true, icon: "help", label: "头部图标" },
      "head+icon：头部由图标+标签+关闭按钮组成。",
      headHostRef.current,
    );
  });

  return (
    <div>
      <div ref={sizedHostRef} />
      <div style={{ height: "1em" }} />
      <div ref={footerHostRef} />
      <div style={{ height: "1em" }} />
      <div ref={headHostRef} />
    </div>
  );
}

/** React侧：width/height固定尺寸、footer区、head+hideCloseButton对照 */
function ReactSizedPopups() {
  const sizedRef = useRef<HTMLSpanElement | null>(null);
  const [sizedOpen, setSizedOpen] = useState(false);
  const footerRef = useRef<HTMLSpanElement | null>(null);
  const [footerOpen, setFooterOpen] = useState(false);
  const headRef = useRef<HTMLSpanElement | null>(null);
  const [headOpen, setHeadOpen] = useState(false);
  const headInvisibleRef = useRef<HTMLSpanElement | null>(null);
  const [headInvisibleOpen, setHeadInvisibleOpen] = useState(false);
  const headIconRef = useRef<HTMLSpanElement | null>(null);
  const [headIconOpen, setHeadIconOpen] = useState(false);

  return (
    <div>
      <div>
        <Button ref={sizedRef} onClick={() => setSizedOpen((v) => !v)}>
          React固定尺寸
        </Button>
        <Popup
          open={sizedOpen}
          container={sizedRef}
          padded
          width={200}
          height={90}
          autoClose
          autoCloseIgnore={sizedRef}
          onOpenChange={setSizedOpen}
        >
          <p>width=200、height=90的固定尺寸弹层。</p>
        </Popup>
      </div>
      <div style={{ height: "1em" }} />
      <div>
        <Button ref={footerRef} onClick={() => setFooterOpen((v) => !v)}>
          React footer区
        </Button>
        <Popup
          open={footerOpen}
          container={footerRef}
          padded
          footer={
            <div style={{ padding: "4px 8px", borderTop: "1px solid #c8ccd1" }}>
              底部操作区
            </div>
          }
          autoClose
          autoCloseIgnore={footerRef}
          onOpenChange={setFooterOpen}
        >
          <p>带footer区的弹层。</p>
        </Popup>
      </div>
      <div style={{ height: "1em" }} />
      <div>
        <Button ref={headRef} onClick={() => setHeadOpen((v) => !v)}>
          React head无关闭
        </Button>
        <Popup
          open={headOpen}
          container={headRef}
          padded
          head
          hideCloseButton
          label="仅头部"
          autoClose
          autoCloseIgnore={headRef}
          onOpenChange={setHeadOpen}
        >
          <p>head=true且hideCloseButton=true。</p>
        </Popup>
      </div>
      <div style={{ height: "1em" }} />
      <div>
        <Button ref={headInvisibleRef} onClick={() => setHeadInvisibleOpen((v) => !v)}>
          React head invisibleLabel
        </Button>
        <Popup
          open={headInvisibleOpen}
          container={headInvisibleRef}
          padded
          head
          label="视觉隐藏头部标签"
          invisibleLabel
          autoClose
          autoCloseIgnore={headInvisibleRef}
          onOpenChange={setHeadInvisibleOpen}
        >
          <p>head+invisibleLabel：头部标签视觉隐藏（title兜底）。</p>
        </Popup>
      </div>
      <div style={{ height: "1em" }} />
      <div>
        <Button ref={headIconRef} onClick={() => setHeadIconOpen((v) => !v)}>
          React head图标
        </Button>
        <Popup
          open={headIconOpen}
          container={headIconRef}
          padded
          head
          icon="help"
          label="头部图标"
          autoClose
          autoCloseIgnore={headIconRef}
          onOpenChange={setHeadIconOpen}
        >
          <p>head+icon：头部由图标+标签+关闭按钮组成。</p>
        </Popup>
      </div>
    </div>
  );
}

/** React侧：getPortalContainer（浮层挂进自定义容器）与viewportSpacing（视口钳制留白80px） */
function ReactProviderChannels() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [portalOpen, setPortalOpen] = useState(false);
  const spacingRef = useRef<HTMLSpanElement | null>(null);
  const [spacingOpen, setSpacingOpen] = useState(false);
  const [spacingTop, setSpacingTop] = useState<number | null>(null);

  // 读数：视口钳制后弹层顶与视口顶的距离（应≈viewportSpacing的80px）
  useEffect(() => {
    if (!spacingOpen) {
      setSpacingTop(null);
      return;
    }
    requestAnimationFrame(() => {
      const el = [...document.querySelectorAll(".oo-ui-popupWidget-popup")].find((e) =>
        e.textContent.includes("弹层顶被钳制"),
      );
      setSpacingTop(el ? Math.round(el.getBoundingClientRect().top) : null);
    });
  }, [spacingOpen]);

  return (
    <div>
      <div>
        getPortalContainer（弹层渲染进虚线容器而非body）
        <OOUIProvider getPortalContainer={() => hostRef.current ?? document.body}>
          <PopupButton
            open={portalOpen}
            onClick={() => setPortalOpen((v) => !v)}
            onOpenChange={setPortalOpen}
            popupContent={<p>本弹层的父节点是下方虚线容器。</p>}
          >
            打开浮层
          </PopupButton>
        </OOUIProvider>
        <div
          ref={hostRef}
          style={{
            border: "1px dashed #c8ccd1",
            minHeight: 48,
            padding: 4,
            maxWidth: 360,
          }}
        />
      </div>
      <div style={{ height: "1em" }} />
      <div>
        {/* viewportSpacing只作用于视口边界的钳制（锚点的就近滚动容器为html时生效）。
            本playground内容区是内部滚动容器，弹层钳制恒以该容器为基准，故此读数
            不随配置变化——该配置面向页面自身滚动的站点场景（如MediaWiki） */}
        viewportSpacing=80（配置通道演示，见下方说明）
        <OOUIProvider viewportSpacing={80}>
          <span ref={spacingRef}>
            <Button onClick={() => setSpacingOpen((v) => !v)}>打开above弹层</Button>
          </span>
          <Popup
            open={spacingOpen}
            container={spacingRef}
            position="above"
            autoFlip={false}
            onOpenChange={setSpacingOpen}
          >
            <p>弹层顶被钳制在视口顶下方80px（缺省0）。</p>
          </Popup>
        </OOUIProvider>
        <span className="cmp-value">
          弹层顶距视口顶：{spacingTop === null ? "（未打开）" : `${spacingTop}px`}
        </span>
        <p style={{ maxWidth: 480 }}>
          说明：viewportSpacing只参与「视口」边界的钳制与留白；当锚点的就近滚动容器是
          页面本身（html）时，弹层贴视口边会被内缩80px。本playground内容区是内部滚动
          容器，弹层恒按容器边界钳制，此读数不随配置变化，仅供核对配置通道已接通。
        </p>
      </div>
    </div>
  );
}

function PopupComparePage() {
  return (
    <CompareLayout
      title="Popup对照"
      description={
        <>
          左侧为本地安装的原版oojs-ui，右侧为本组件库实现。
          两者行为对照点：点击开合、锚点箭头指向、position/align定位（含before/after侧面弹出、
          forwards/backwards对齐边、force-left/force-right物理侧别名）、无箭头弹层、autoFlip翻转与autoFlip=false钳制、
          非受控defaultOpen（Popup与PopupButton两种形态）、hideWhenOutOfView（锚点滚出视口隐藏、滚回恢复且open状态不变）、
          autoClose（点击外部关闭且忽略触发按钮）、头部关闭按钮（head/hideCloseButton）、
          头部图标（head+icon）、固定尺寸（width/height）、footer区、
          容器边缘钳制（就近滚动容器+containerPadding，钳制后锚点仍指向触发器中心）。
        </>
      }
    >
      <h2>各方位与形态</h2>
      <CompareColumns original={<OriginalPopups />}>
        <ReactPopups />
      </CompareColumns>

      <h2>接近视口底部自动翻转</h2>
      <CompareColumns original={<OriginalAutoFlip />}>
        <ReactAutoFlip />
      </CompareColumns>

      <h2>autoFlip=false（不翻转）</h2>
      <CompareColumns original={<OriginalNoFlip />}>
        <ReactNoFlip />
      </CompareColumns>

      <h2>align对齐方向</h2>
      <CompareColumns original={<OriginalAlignPopups />}>
        <ReactAlignPopups />
      </CompareColumns>

      <h2>非受控初始打开</h2>
      <CompareColumns original={<OriginalDefaultOpen />}>
        <ReactDefaultOpen />
      </CompareColumns>

      <h2>hideWhenOutOfView（滚动容器内）</h2>
      <CompareColumns original={<OriginalOutOfView />}>
        <ReactOutOfView />
      </CompareColumns>

      <h2>hideWhenOutOfView=false 与 containerPadding</h2>
      <CompareColumns original={<OriginalOutOfViewOff />}>
        <ReactOutOfViewOff />
      </CompareColumns>

      <h2>尺寸 / footer / head变体</h2>
      <CompareColumns original={<OriginalSizedPopups />}>
        <ReactSizedPopups />
      </CompareColumns>

      <h2>getPortalContainer / viewportSpacing（React侧全局配置）</h2>
      <CompareColumns
        original={
          <p>
            原版对应OO.ui.getTeleportTarget（浮层挂载目标）与视口计算留白，二者为宿主级
            全局覆写、无构造配置形态，本工程收敛为OOUIProvider配置，此处无对照形态。
          </p>
        }
      >
        <ReactProviderChannels />
      </CompareColumns>
    </CompareLayout>
  );
}

PopupComparePage.displayName = "PopupComparePage";

export default PopupComparePage;

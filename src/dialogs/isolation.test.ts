import { afterEach, expect, it } from "vitest";
import { acquireIsolation, releaseIsolation } from "./isolation";

/**
 * isolation（对齐原版`WindowManager.toggleIsolation`）的浏览器侧契约：
 * 标记范围（管理器根路径以外的兄弟节点）、弹窗内浮层不在范围内（它是管理器根的子节点）、
 * 多层嵌套的逐层标记、注销时只撤销自己写入的属性、叠加时的层位与恢复。
 * 标记落在手搭的DOM上，不经组件渲染——组件侧的接入见Dialog的用例。
 */
const created: HTMLElement[] = [];
const handles: object[] = [];

/** 追加一个div到指定父节点（缺省body）并登记清理 */
function add(parent: HTMLElement = document.body): HTMLDivElement {
  const el = document.createElement("div");
  parent.appendChild(el);
  created.push(el);
  return el;
}

/** 建一个「管理器根 > 弹窗 + 浮层」子树：浮层是管理器根的**子节点**，不是兄弟 */
function addManager(parent: HTMLElement = document.body): {
  root: HTMLDivElement;
  dialog: HTMLDivElement;
  float: HTMLDivElement;
} {
  const root = add(parent);
  return { root, dialog: add(root), float: add(root) };
}

/** 取一个登记句柄（afterEach统一注销，避免模块级登记表跨用例残留） */
function newHandle(): object {
  const handle = {};
  handles.push(handle);
  return handle;
}

/** 登记隔离并返回句柄 */
function isolate(root: HTMLElement): object {
  const handle = newHandle();
  acquireIsolation(handle, root);
  return handle;
}

afterEach(() => {
  for (const handle of handles.splice(0)) {
    releaseIsolation(handle);
  }
  for (const el of created.splice(0)) {
    el.remove();
  }
});

it("登记后标记管理器根的兄弟节点，管理器根与其子树（含弹窗内浮层）不动", () => {
  const background = add();
  const { root, dialog, float } = addManager();
  isolate(root);

  expect(background).toHaveAttribute("aria-hidden", "true");
  expect(background).toHaveAttribute("inert");
  // 逐层标记的只是兄弟：管理器根在路径上，浮层是它的子节点，两者都不在标记范围
  expect(root).not.toHaveAttribute("aria-hidden");
  expect(dialog).not.toHaveAttribute("inert");
  expect(float).not.toHaveAttribute("inert");
});

it("管理器嵌在深层容器内时逐层向上标记，承载它的容器自身保持可见", () => {
  const outerBackground = add();
  const wrapper = add();
  const innerSibling = add(wrapper);
  const { root } = addManager(wrapper);
  isolate(root);

  expect(innerSibling).toHaveAttribute("inert");
  expect(outerBackground).toHaveAttribute("inert");
  expect(wrapper).not.toHaveAttribute("inert");
  expect(root).not.toHaveAttribute("inert");
});

it("script不参与隔离（原版同款豁免）", () => {
  const script = document.createElement("script");
  document.body.appendChild(script);
  const { root } = addManager();
  isolate(root);

  expect(script).not.toHaveAttribute("aria-hidden");
  expect(script).not.toHaveAttribute("inert");
  script.remove();
});

it("注销后撤销自己写入的属性；已声明aria-hidden=true的节点仍补inert且不移除其值", () => {
  // 两份集合独立判定（对齐原版）：已声明隐藏的节点只跳过aria-hidden，仍会被inert
  const hostHidden = add();
  hostHidden.setAttribute("aria-hidden", "true");
  const background = add();
  const { root } = addManager();
  const handle = isolate(root);
  expect(background).toHaveAttribute("inert");
  expect(hostHidden).toHaveAttribute("inert");
  expect(hostHidden).toHaveAttribute("aria-hidden", "true");

  releaseIsolation(handle);
  expect(background).not.toHaveAttribute("aria-hidden");
  expect(background).not.toHaveAttribute("inert");
  expect(hostHidden).toHaveAttribute("aria-hidden", "true");
  expect(hostHidden).not.toHaveAttribute("inert");
});

it("aria-hidden=false的节点照常标记并还原原值（管理器根即此情形）", () => {
  // 管理器根由Dialog渲染`aria-hidden={!active}`：打开中的管理器根带aria-hidden="false"，
  // 叠加时必须仍被隔离（按原版siblings.not('[aria-hidden=true]')的值判定，不是「有该属性就跳过」）
  const declaredVisible = add();
  declaredVisible.setAttribute("aria-hidden", "false");
  const { root } = addManager();
  const handle = isolate(root);

  expect(declaredVisible).toHaveAttribute("inert");
  expect(declaredVisible).toHaveAttribute("aria-hidden", "true");

  releaseIsolation(handle);
  // 还原被覆盖的原值而非移除：该属性由React渲染，移除会让其DOM与vdom失同步
  expect(declaredVisible).toHaveAttribute("aria-hidden", "false");
  expect(declaredVisible).not.toHaveAttribute("inert");
});

it("叠加：后打开的管理器把先开者降为背景，上层注销后下层恢复可见", () => {
  const background = add();
  const lower = addManager();
  const upper = addManager();
  const lowerHandle = isolate(lower.root);
  const upperHandle = isolate(upper.root);

  // 已在下层管理器内的浮层随管理器根一起被隔离（inert沿子树生效，属性只在管理器根上）
  expect(lower.root).toHaveAttribute("aria-hidden", "true");
  expect(lower.root).toHaveAttribute("inert");
  expect(lower.float.closest("[inert]")).toBe(lower.root);
  expect(upper.root).not.toHaveAttribute("inert");
  expect(background).toHaveAttribute("inert");

  releaseIsolation(upperHandle);
  expect(lower.root).not.toHaveAttribute("aria-hidden");
  expect(lower.root).not.toHaveAttribute("inert");
  expect(background).toHaveAttribute("inert");

  releaseIsolation(lowerHandle);
  expect(background).not.toHaveAttribute("inert");
});

it("打开周期内重复登记同一管理器不改变其层位（登记顺序即打开顺序）", () => {
  const lower = addManager();
  const upper = addManager();
  const lowerHandle = isolate(lower.root);
  const upperHandle = isolate(upper.root);

  // 打开周期内的重复登记（active翻转等）不应把下层提到最上层
  acquireIsolation(lowerHandle, lower.root);
  expect(lower.root).toHaveAttribute("inert");
  expect(upper.root).not.toHaveAttribute("inert");

  releaseIsolation(upperHandle);
  releaseIsolation(lowerHandle);
});

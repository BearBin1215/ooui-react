import { describe, expect, it } from "vitest";
import { snapshotHTML } from "./index";

/** 造一个容器并写入给定 HTML（浏览器按插入顺序保留属性），返回该容器 */
const mount = (html: string): HTMLElement => {
  const container = document.createElement("div");
  container.innerHTML = html;
  return container;
};

/**
 * snapshotHTML 的归一化契约。HTML 快照必须与 React 版本无关，否则换一次 React 版本
 * 就会整批失败；归一化两项——起始标签的属性顺序、id 类属性值。
 */
describe("snapshotHTML", () => {
  it("属性按名排序：属性顺序不同的等价 DOM 归一化后一致", () => {
    // 同一份 DOM 在 React 18 / 19 下序列化出的属性顺序不同（19 起 name、type 落在末尾）
    const react18 = `<input name="agree" tabindex="0" class="x" type="checkbox">`;
    const react19 = `<input tabindex="0" class="x" type="checkbox" name="agree">`;
    expect(snapshotHTML(mount(react18))).toBe(
      `<input class="x" name="agree" tabindex="0" type="checkbox">`,
    );
    expect(snapshotHTML(mount(react19))).toBe(snapshotHTML(mount(react18)));
  });

  it("嵌套标签各自排序，标签层级与属性值原样保留", () => {
    expect(
      snapshotHTML(mount(`<span class="a b"><input value="v" type="text"></span>`)),
    ).toBe(`<span class="a b"><input type="text" value="v"></span>`);
  });

  it("无属性的标签保持原样", () => {
    expect(snapshotHTML(mount(`<span><br></span>`))).toBe(`<span><br></span>`);
  });

  it("id 类属性值归一化为 r#，且引用关系保留", () => {
    expect(snapshotHTML(mount(`<div id="r3" aria-labelledby="r3 r7"></div>`))).toBe(
      `<div aria-labelledby="r# r#" id="r#"></div>`,
    );
  });
});

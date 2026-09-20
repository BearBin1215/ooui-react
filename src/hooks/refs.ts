import { useId, useMemo, useRef, type MutableRefObject, type Ref } from "react";

/**
 * ref与id类小工具：跨域共享的最小机制件（最新值ref、多ref合并、无冒号id）。
 * 其余按域组织的能力见同目录其他文件，导出面统一走hooks/index.ts
 */

/**
 * 跟踪最新值的ref（渲染期同步），供事件监听/定时器等场景经ref读取最新props：
 * 既避免闭包过期，又使监听等只需挂载一次的资源不必随回调身份变化反复重挂
 */
export function useLatestRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

/**
 * 稳定的多ref合并回调（回调引用跨渲染稳定）：
 * 组件内需同时持有元素引用并向外转发ref时使用。经ref读取最新refs数组，
 * 回调仅创建一次，避免每渲染新函数导致的detach/attach
 */
export function useMergedRefs<T>(
  ...refs: (Ref<T> | undefined)[]
): (node: T | null) => void {
  const refsRef = useRef(refs);
  refsRef.current = refs;
  return useMemo(
    () => (node: T | null) => {
      for (const ref of refsRef.current) {
        if (!ref) {
          continue;
        }
        if (typeof ref === "function") {
          ref(node);
        } else {
          // React 18的RefObject.current为readonly，需断言
          (ref as MutableRefObject<T | null>).current = node;
        }
      }
    },
    [],
  );
}

/**
 * 生成不含React `useId`冒号分隔符的id片段：`:`在CSS选择器中非法，
 * 元素id与`aria-labelledby`/`aria-controls`等关联属性统一经此生成
 */
export function useCleanId(): string {
  return useId().replace(/:/g, "");
}

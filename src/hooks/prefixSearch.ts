import { useCallback, useEffect, useMemo, useRef } from "react";
import { advancePrefixSearch, KEY_PRESS_BUFFER_MS } from "../utils";

/** 前缀跳转的字符缓冲与超时计时（Select的keydown通道与useMenuPopup的document keypress通道共用） */

/**
 * 前缀跳转的字符缓冲状态（对齐原版keyPressBuffer + keyPressBufferClearTimeout）：
 * 缓冲存ref供事件闭包同步读取，1500ms超时计时器随缓冲一并管理——字符输入续期，
 * 导航键命中/键盘通道停用/卸载时经clear清空。匹配算法advancePrefixSearch见utils.ts，
 * 本hook只负责缓冲生命周期。Select的keydown通道与useMenuPopup的document keypress
 * 通道共用，不要再各自手写缓冲+定时器
 */
export function usePrefixSearchBuffer() {
  const stateRef = useRef({ buffer: "", timer: 0 });

  /** 清空缓冲并复位计时器 */
  const clear = useCallback(() => {
    clearTimeout(stateRef.current.timer);
    stateRef.current = { buffer: "", timer: 0 };
  }, []);

  /**
   * 单个可打印字符推进：续期计时器并经advancePrefixSearch求命中值
   * @param char 本次输入的单个可打印字符
   * @param values 可选值序列（按展示顺序）
   * @param getText 取选项显示文本（对齐原版读渲染后textContent的口径）
   * @param current 导航起点
   * @returns 命中的值；无命中时undefined
   */
  const advance = useCallback(
    <T extends string | number>(
      char: string,
      values: T[],
      getText: (value: T) => string,
      current: T | undefined,
    ): T | undefined => {
      const state = stateRef.current;
      clearTimeout(state.timer);
      state.timer = window.setTimeout(clear, KEY_PRESS_BUFFER_MS);
      return advancePrefixSearch(state, char, values, getText, current);
    },
    [clear],
  );

  /**
   * 退格裁剪缓冲（对齐原版退格分支）
   * @returns 是否确有裁剪（无缓冲时false，调用方据此放行默认行为）
   */
  const backspace = useCallback((): boolean => {
    if (!stateRef.current.buffer) {
      return false;
    }
    stateRef.current.buffer = stateRef.current.buffer.slice(0, -1);
    return true;
  }, []);

  /** 缓冲是否活跃（对齐原版`keyPressBuffer !== ''`守卫：活跃期内空格属于type-to-search而非开合键） */
  const hasBuffer = useCallback((): boolean => stateRef.current.buffer !== "", []);

  useEffect(() => () => clearTimeout(stateRef.current.timer), []);

  // 返回对象经useMemo稳定：消费方（useMenuPopup）的effect以本对象为依赖，
  // 不得因渲染产生新引用而重挂document监听
  return useMemo(
    () => ({ advance, backspace, clear, hasBuffer }) as const,
    [advance, backspace, clear, hasBuffer],
  );
}

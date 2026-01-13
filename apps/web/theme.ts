import type { ThemeConfig } from '@polaris/core';

/**
 * Cling AI 主题配置
 * 单独文件便于设计师/产品修改
 */
export const clingAiTheme: ThemeConfig = {
  colors: {
    primary: '#6366f1',      // Indigo
    background: '#0b0f19',   // 深色背景
    surface: '#0f1630',      // 卡片/面板
    text: '#e6e9f2',         // 主文字
    textMuted: '#aeb8d6',    // 次要文字
    border: '#1c2540',       // 边框
    error: '#ef4444',        // 错误红
    success: '#22c55e'       // 成功绿
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px'
  },
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
};

/**
 * 浅色主题备选
 */
export const clingAiLightTheme: ThemeConfig = {
  colors: {
    primary: '#6366f1',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    error: '#ef4444',
    success: '#22c55e'
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px'
  },
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
};

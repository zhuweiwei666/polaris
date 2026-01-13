import type { ThemeConfig } from '../types';

/**
 * 默认深色主题
 */
export const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#6366f1',
    background: '#0b0f19',
    surface: '#0f1630',
    text: '#e6e9f2',
    textMuted: '#aeb8d6',
    border: '#1c2540',
    error: '#ef4444',
    success: '#22c55e'
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px'
  },
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif'
};

/**
 * 浅色主题
 */
export const lightTheme: ThemeConfig = {
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
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif'
};

/**
 * 生成 CSS 变量字符串
 */
export function themeToCssVariables(theme: ThemeConfig): string {
  return `
    --color-primary: ${theme.colors.primary};
    --color-background: ${theme.colors.background};
    --color-surface: ${theme.colors.surface};
    --color-text: ${theme.colors.text};
    --color-text-muted: ${theme.colors.textMuted};
    --color-border: ${theme.colors.border};
    --color-error: ${theme.colors.error ?? '#ef4444'};
    --color-success: ${theme.colors.success ?? '#22c55e'};
    --radius-sm: ${theme.borderRadius.sm};
    --radius-md: ${theme.borderRadius.md};
    --radius-lg: ${theme.borderRadius.lg};
    --font-family: ${theme.fontFamily};
  `.trim();
}

/**
 * 注入主题 CSS 变量到 :root
 */
export function injectTheme(theme: ThemeConfig): void {
  if (typeof document === 'undefined') return;

  const styleId = 'polaris-theme-vars';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `:root { ${themeToCssVariables(theme)} }`;
}

/**
 * 合并主题
 */
export function mergeTheme(base: ThemeConfig, overrides: Partial<ThemeConfig>): ThemeConfig {
  return {
    colors: { ...base.colors, ...overrides.colors },
    borderRadius: { ...base.borderRadius, ...overrides.borderRadius },
    fontFamily: overrides.fontFamily ?? base.fontFamily
  };
}

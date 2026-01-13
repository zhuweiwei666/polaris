import type { AppConfig } from '@polaris/core';

/**
 * Cling AI 应用配置
 * 这是第一个使用 Core + Modules 架构的应用
 */
const config: AppConfig = {
  appId: 'cling-ai',
  appName: 'Cling AI',
  version: '1.0.0',

  // 启用的模块
  modules: [
    { moduleId: 'ai-tools', enabled: true, config: { showRecentTasks: true } },
    { moduleId: 'user-center', enabled: true, config: { showOrders: true, showWallet: true } }
  ],

  // Tab 配置
  tabs: [
    { id: 'home', label: 'Home', icon: '🏠', route: '/' },
    { id: 'create', label: 'Create', icon: '✨', route: '/create' },
    { id: 'library', label: 'Library', icon: '📚', route: '/library' },
    { id: 'inbox', label: 'Inbox', icon: '📬', route: '/inbox' },
    { id: 'me', label: 'Me', icon: '👤', route: '/me' }
  ],

  // 首页布局
  home: {
    sections: [
      { type: 'module-entry', moduleId: 'ai-tools' },
      { type: 'recent-tasks' }
    ]
  },

  // 主题配置
  theme: {
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
  },

  // 埋点配置
  analytics: {
    provider: 'console', // 开发阶段用 console，上线改 firebase
    key: undefined
  },

  // API 配置
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api'
  },

  // 收费策略
  pricing: {
    freeDailyQuota: 5,
    showPaywall: true
  }
};

export default config;

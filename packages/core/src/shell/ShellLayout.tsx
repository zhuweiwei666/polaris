'use client';

import { useEffect, type ReactNode } from 'react';
import { useCoreContext } from '../CoreProvider';
import { injectTheme } from './theme';
import type { ShellLayoutProps } from './types';

/**
 * Shell 布局组件
 * - 注入主题 CSS 变量
 * - 渲染 Nav/Tab/Main 结构
 * - 不包含业务逻辑
 */
export function ShellLayout({ children, header, footer, hideNav }: ShellLayoutProps) {
  const { appConfig } = useCoreContext();

  // 注入主题
  useEffect(() => {
    injectTheme(appConfig.theme);
  }, [appConfig.theme]);

  return (
    <div className="polaris-shell" data-app-id={appConfig.appId}>
      {header}
      <div className="polaris-shell__container">
        {!hideNav && <NavSidebar tabs={appConfig.tabs} />}
        <main className="polaris-shell__main">{children}</main>
      </div>
      {footer}

      <style>{`
        .polaris-shell {
          min-height: 100vh;
          background: var(--color-background);
          color: var(--color-text);
          font-family: var(--font-family);
        }
        .polaris-shell__container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px;
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 16px;
          min-height: calc(100vh - 32px);
        }
        .polaris-shell__main {
          min-width: 0;
        }
        @media (max-width: 768px) {
          .polaris-shell__container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * 侧边导航栏
 */
function NavSidebar({ tabs }: { tabs: Array<{ id: string; label: string; route: string; icon?: string }> }) {
  const { appConfig } = useCoreContext();

  return (
    <nav className="polaris-nav">
      <div className="polaris-nav__logo">{appConfig.appName}</div>
      <div className="polaris-nav__items">
        {tabs.map((tab) => (
          <a key={tab.id} href={tab.route} className="polaris-nav__item">
            {tab.icon && <span className="polaris-nav__icon">{tab.icon}</span>}
            {tab.label}
          </a>
        ))}
      </div>

      <style>{`
        .polaris-nav {
          position: sticky;
          top: 16px;
          height: fit-content;
          padding: 12px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }
        .polaris-nav__logo {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          opacity: 0.9;
        }
        .polaris-nav__item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          border-radius: var(--radius-md);
          color: var(--color-text-muted);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .polaris-nav__item:hover {
          background: var(--color-border);
          color: var(--color-text);
        }
        @media (max-width: 768px) {
          .polaris-nav {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}

/**
 * 底部 Tab 栏（移动端）
 */
export function TabBar({ tabs }: { tabs: Array<{ id: string; label: string; route: string; icon?: string }> }) {
  return (
    <nav className="polaris-tabbar">
      {tabs.map((tab) => (
        <a key={tab.id} href={tab.route} className="polaris-tabbar__item">
          {tab.icon && <span className="polaris-tabbar__icon">{tab.icon}</span>}
          <span className="polaris-tabbar__label">{tab.label}</span>
        </a>
      ))}

      <style>{`
        .polaris-tabbar {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--color-surface);
          border-top: 1px solid var(--color-border);
          padding: 8px;
          justify-content: space-around;
        }
        .polaris-tabbar__item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px;
          color: var(--color-text-muted);
          text-decoration: none;
          font-size: 12px;
        }
        .polaris-tabbar__item:hover {
          color: var(--color-text);
        }
        @media (max-width: 768px) {
          .polaris-tabbar {
            display: flex;
          }
        }
      `}</style>
    </nav>
  );
}

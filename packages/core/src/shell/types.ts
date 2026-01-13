import type { ComponentType, ReactNode } from 'react';
import type { TabItem, ThemeConfig } from '../types';

export interface ShellLayoutProps {
  children: ReactNode;
  /** 自定义 header */
  header?: ReactNode;
  /** 自定义 footer */
  footer?: ReactNode;
  /** 隐藏导航（用于全屏页面） */
  hideNav?: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string | ReactNode;
  badge?: number | string;
}

export interface ShellConfig {
  /** Tab 配置 */
  tabs: TabItem[];
  /** 额外的导航项（如管理入口） */
  extraNavItems?: NavItem[];
  /** Logo 组件或文本 */
  logo?: ReactNode;
  /** 主题 */
  theme: ThemeConfig;
}

export interface TabBarProps {
  tabs: TabItem[];
  currentPath: string;
  onNavigate?: (path: string) => void;
}

export interface NavSidebarProps {
  items: NavItem[];
  extraItems?: NavItem[];
  logo?: ReactNode;
  currentPath: string;
}

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ComponentType<{ error: Error; reset: () => void }>;
}

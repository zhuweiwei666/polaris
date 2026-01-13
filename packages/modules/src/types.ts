import type { ComponentType, ReactNode } from 'react';
import type {
  AuthService,
  BillingService,
  EntitlementService,
  AnalyticsService,
  ApiClient,
  StorageService,
  ConfigService
} from '@polaris/core';

/**
 * 模块定义接口
 * 每个业务模块必须导出符合此接口的对象
 */
export interface ModuleDefinition {
  /** 模块唯一 ID */
  moduleId: string;

  /** 模块显示名称 */
  displayName: string;

  /** 模块版本 */
  version: string;

  /** 模块提供的路由 */
  routes: ModuleRoute[];

  /** 如果模块可作为 Tab，提供 tab 配置 */
  tabItem?: {
    label: string;
    icon: string;
    order?: number;
  };

  /** 模块初始化钩子 */
  init?: (ctx: ModuleContext) => Promise<void> | void;

  /** 模块卸载钩子 */
  destroy?: () => void;

  /** 模块级配置 schema */
  configSchema?: Record<string, ConfigParam>;
}

export interface ModuleRoute {
  /** 路由路径 */
  path: string;

  /** 页面组件 */
  component: ComponentType<ModulePageProps>;

  /** 访问权限 */
  guard?: 'public' | 'auth' | `entitlement:${string}`;

  /** 页面标题 */
  title?: string;

  /** 是否精确匹配 */
  exact?: boolean;
}

export interface ModulePageProps {
  /** 模块上下文 */
  ctx: ModuleContext;
  /** 路由参数 */
  params?: Record<string, string>;
}

export interface ModuleContext {
  /** App ID */
  appId: string;

  /** 模块 ID */
  moduleId: string;

  /** 注入的模块配置 */
  config: Record<string, unknown>;

  /** Core 服务 */
  auth: AuthService;
  billing: BillingService;
  entitlement: EntitlementService;
  analytics: AnalyticsService;
  api: ApiClient;
  storage: StorageService;
  configService: ConfigService;
}

export interface ConfigParam {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  default?: unknown;
  description?: string;
  required?: boolean;
}

/**
 * 模块事件定义
 */
export interface ModuleEvents {
  [eventName: string]: {
    description: string;
    properties: Record<string, string>;
  };
}

/**
 * 模块注册表
 */
export interface ModuleRegistry {
  register(module: ModuleDefinition): void;
  get(moduleId: string): ModuleDefinition | undefined;
  getAll(): ModuleDefinition[];
  getEnabled(enabledIds: string[]): ModuleDefinition[];
}

/**
 * 创建模块的辅助函数类型
 */
export type CreateModuleOptions = Omit<ModuleDefinition, 'version'> & {
  version?: string;
};

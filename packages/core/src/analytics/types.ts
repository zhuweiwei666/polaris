export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

export interface AnalyticsService {
  /** 发送事件（自动附加 appId/userId/deviceId/version） */
  track(event: string, properties?: Record<string, unknown>): void;
  /** 设置用户属性 */
  identify(userId: string, traits?: Record<string, unknown>): void;
  /** 页面浏览 */
  page(name: string, properties?: Record<string, unknown>): void;
  /** 设置全局属性（每次事件都会带上） */
  setGlobalProperties(properties: Record<string, unknown>): void;
}

export interface AnalyticsAdapter {
  /** 初始化 */
  init(key?: string): void;
  /** 发送事件 */
  track(event: AnalyticsEvent): void;
  /** 标识用户 */
  identify(userId: string, traits?: Record<string, unknown>): void;
  /** 页面浏览 */
  page(name: string, properties?: Record<string, unknown>): void;
}

export interface AnalyticsProviderProps {
  children: React.ReactNode;
  /** 禁用埋点（用于开发/隐私模式） */
  disabled?: boolean;
  /** 开发模式打印事件 */
  debug?: boolean;
}

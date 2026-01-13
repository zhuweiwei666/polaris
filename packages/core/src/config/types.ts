export interface RemoteConfig {
  featureFlags: Record<string, boolean>;
  params: Record<string, unknown>;
}

export interface ConfigService {
  /** 获取 feature flag */
  getFlag(key: string, defaultValue?: boolean): boolean;
  /** 获取配置参数 */
  getParam<T>(key: string, defaultValue?: T): T;
  /** 刷新配置 */
  refresh(): Promise<void>;
  /** 配置是否已加载 */
  isLoaded(): boolean;
}

export interface ConfigProviderProps {
  children: React.ReactNode;
  /** API 端点，默认 /config */
  endpoint?: string;
  /** 初始配置（SSR 预加载） */
  initialConfig?: RemoteConfig;
  /** 刷新间隔（ms），0 表示不自动刷新 */
  refreshInterval?: number;
}

// Core Provider
export { CoreProvider, useCoreContext, useAppConfig, useApi, useStorage } from './CoreProvider';

// Auth
export {
  AuthProvider,
  useAuth,
  useUser,
  useIsAuthenticated,
  generateDeviceId,
  getDeviceInfo
} from './auth';
export type { User, AuthState, AuthService, AuthProviderProps, LoginResponse } from './auth';

// Billing
export { BillingProvider, useBilling, useSubscription, useCoins } from './billing';
export type { BillingService, Product, Subscription, Wallet, BillingProviderProps } from './billing';

// Entitlement
export { EntitlementProvider, useEntitlement, useCan, useQuota } from './entitlement';
export type { EntitlementService, EntitlementState, QuotaInfo, EntitlementProviderProps } from './entitlement';

// Config
export { ConfigProvider, useConfig, useFlag, useParam } from './config';
export type { ConfigService, RemoteConfig, ConfigProviderProps } from './config';

// Analytics
export { AnalyticsProvider, useAnalytics, createModuleAnalytics } from './analytics';
export type { AnalyticsService, AnalyticsAdapter, AnalyticsEvent, AnalyticsProviderProps } from './analytics';

// Network
export { createApiClient, ApiError } from './network';
export type { ApiClient, ApiClientOptions } from './network';

// Storage
export { createWebStorage, createMemoryStorage, getDefaultStorage } from './storage';
export type { StorageService, StorageOptions } from './storage';

// Shell
export {
  ShellLayout,
  TabBar,
  EmptyState,
  ErrorBoundary,
  Loading,
  FullPageLoading,
  defaultTheme,
  lightTheme,
  themeToCssVariables,
  injectTheme,
  mergeTheme
} from './shell';
export type { ShellLayoutProps, ShellConfig, EmptyStateProps } from './shell';

// Types
export type {
  AppConfig,
  ModuleConfig,
  HomeSection,
  TabItem,
  ThemeConfig,
  Tool,
  ToolSchemaProperty
} from './types';

'use client';

import { createContext, useContext, useMemo } from 'react';
import { createApiClient } from './network';
import { getDefaultStorage } from './storage';
import type { ApiClient } from './network';
import type { StorageService } from './storage';
import type { AppConfig } from './types';

export interface CoreContextValue {
  appConfig: AppConfig;
  api: ApiClient;
  storage: StorageService;
}

const CoreContext = createContext<CoreContextValue | null>(null);

export interface CoreProviderProps {
  children: React.ReactNode;
  appConfig: AppConfig;
  /** 可选：自定义 API Client */
  apiClient?: ApiClient;
  /** 可选：自定义 Storage */
  storage?: StorageService;
  /** 可选：获取 access token 的函数 */
  getAccessToken?: () => Promise<string | null> | string | null;
  /** 可选：401 回调 */
  onAuthError?: () => void;
}

export function CoreProvider({
  children,
  appConfig,
  apiClient,
  storage,
  getAccessToken,
  onAuthError
}: CoreProviderProps) {
  const value = useMemo<CoreContextValue>(() => {
    const api =
      apiClient ??
      createApiClient({
        baseUrl: appConfig.api.baseUrl,
        getAccessToken,
        onAuthError,
        timeout: 30000,
        retries: 1
      });

    const storageInstance = storage ?? getDefaultStorage({ prefix: `${appConfig.appId}_` });

    return {
      appConfig,
      api,
      storage: storageInstance
    };
  }, [appConfig, apiClient, storage, getAccessToken, onAuthError]);

  return <CoreContext.Provider value={value}>{children}</CoreContext.Provider>;
}

export function useCoreContext(): CoreContextValue {
  const ctx = useContext(CoreContext);
  if (!ctx) {
    throw new Error('useCoreContext must be used within CoreProvider');
  }
  return ctx;
}

export function useAppConfig(): AppConfig {
  return useCoreContext().appConfig;
}

export function useApi(): ApiClient {
  return useCoreContext().api;
}

export function useStorage(): StorageService {
  return useCoreContext().storage;
}

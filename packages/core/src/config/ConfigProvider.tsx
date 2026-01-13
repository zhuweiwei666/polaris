'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import type { ConfigService, RemoteConfig, ConfigProviderProps } from './types';
import { useCoreContext } from '../CoreProvider';

const defaultConfig: RemoteConfig = {
  featureFlags: {},
  params: {}
};

const ConfigContext = createContext<ConfigService | null>(null);

export function ConfigProvider({
  children,
  endpoint = '/config',
  initialConfig,
  refreshInterval = 0
}: ConfigProviderProps) {
  const { api } = useCoreContext();
  const [config, setConfig] = useState<RemoteConfig>(initialConfig ?? defaultConfig);
  const [loaded, setLoaded] = useState(!!initialConfig);
  const refreshRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<RemoteConfig>(endpoint);
      setConfig({
        featureFlags: res.featureFlags ?? {},
        params: res.params ?? res // 兼容老接口
      });
      setLoaded(true);
    } catch {
      // 加载失败保持现有配置
    }
  }, [api, endpoint]);

  useEffect(() => {
    if (!initialConfig) {
      refresh();
    }

    if (refreshInterval > 0) {
      refreshRef.current = setInterval(refresh, refreshInterval);
      return () => {
        if (refreshRef.current) clearInterval(refreshRef.current);
      };
    }
  }, [refresh, refreshInterval, initialConfig]);

  const service = useMemo<ConfigService>(
    () => ({
      getFlag(key: string, defaultValue = false): boolean {
        return config.featureFlags[key] ?? defaultValue;
      },
      getParam<T>(key: string, defaultValue?: T): T {
        return (config.params[key] as T) ?? (defaultValue as T);
      },
      refresh,
      isLoaded: () => loaded
    }),
    [config, refresh, loaded]
  );

  return <ConfigContext.Provider value={service}>{children}</ConfigContext.Provider>;
}

export function useConfig(): ConfigService {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return ctx;
}

export function useFlag(key: string, defaultValue = false): boolean {
  const config = useConfig();
  return config.getFlag(key, defaultValue);
}

export function useParam<T>(key: string, defaultValue?: T): T {
  const config = useConfig();
  return config.getParam(key, defaultValue);
}

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode
} from 'react';
import type { AnalyticsAdapter, AnalyticsProviderProps, AnalyticsService } from './types';
import { useCoreContext } from '../CoreProvider';
import { useAuth } from '../auth';
import { createConsoleAdapter } from './adapters/console';
import { createFirebaseAdapter } from './adapters/firebase';

const AnalyticsContext = createContext<AnalyticsService | null>(null);

function getAdapter(provider: string): AnalyticsAdapter {
  switch (provider) {
    case 'firebase':
      return createFirebaseAdapter();
    case 'console':
    default:
      return createConsoleAdapter();
  }
}

export function AnalyticsProvider({
  children,
  disabled = false,
  debug = false
}: AnalyticsProviderProps & { children: ReactNode }) {
  const { appConfig, storage } = useCoreContext();
  const auth = useAuth();
  const adapterRef = useRef<AnalyticsAdapter | null>(null);
  const globalPropsRef = useRef<Record<string, unknown>>({});
  const deviceIdRef = useRef<string | null>(null);

  // 初始化 adapter
  useEffect(() => {
    if (disabled) return;

    const adapter = getAdapter(appConfig.analytics.provider);
    adapter.init(appConfig.analytics.key);
    adapterRef.current = adapter;

    // 获取 deviceId
    storage.get<string>('device_id').then((id) => {
      deviceIdRef.current = id;
    });
  }, [appConfig.analytics, disabled, storage]);

  // 用户登录后 identify
  useEffect(() => {
    const user = auth.getUser();
    if (user && adapterRef.current) {
      adapterRef.current.identify(user.userId, {
        email: user.email,
        displayName: user.displayName
      });
    }
  }, [auth]);

  const buildProperties = useCallback(
    (moduleId: string | undefined, properties?: Record<string, unknown>) => {
      return {
        appId: appConfig.appId,
        appVersion: appConfig.version,
        moduleId,
        deviceId: deviceIdRef.current,
        userId: auth.getUser()?.userId,
        timestamp: Date.now(),
        ...globalPropsRef.current,
        ...properties
      };
    },
    [appConfig.appId, appConfig.version, auth]
  );

  const track = useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      if (disabled) return;

      const enriched = buildProperties(properties?.moduleId as string, properties);

      if (debug) {
        console.log('[Analytics] Track:', event, enriched);
      }

      adapterRef.current?.track({ name: event, properties: enriched });
    },
    [disabled, debug, buildProperties]
  );

  const identify = useCallback(
    (userId: string, traits?: Record<string, unknown>) => {
      if (disabled) return;

      if (debug) {
        console.log('[Analytics] Identify:', userId, traits);
      }

      adapterRef.current?.identify(userId, traits);
    },
    [disabled, debug]
  );

  const page = useCallback(
    (name: string, properties?: Record<string, unknown>) => {
      if (disabled) return;

      const enriched = buildProperties(undefined, properties);

      if (debug) {
        console.log('[Analytics] Page:', name, enriched);
      }

      adapterRef.current?.page(name, enriched);
    },
    [disabled, debug, buildProperties]
  );

  const setGlobalProperties = useCallback((properties: Record<string, unknown>) => {
    globalPropsRef.current = { ...globalPropsRef.current, ...properties };
  }, []);

  const service = useMemo<AnalyticsService>(
    () => ({
      track,
      identify,
      page,
      setGlobalProperties
    }),
    [track, identify, page, setGlobalProperties]
  );

  return <AnalyticsContext.Provider value={service}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics(): AnalyticsService {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return ctx;
}

/**
 * 创建模块级别的 analytics hook
 * 自动附加 moduleId
 */
export function createModuleAnalytics(moduleId: string) {
  return function useModuleAnalytics() {
    const analytics = useAnalytics();

    return useMemo(
      () => ({
        track: (event: string, properties?: Record<string, unknown>) => {
          analytics.track(event, { moduleId, ...properties });
        },
        page: (name: string, properties?: Record<string, unknown>) => {
          analytics.page(name, { moduleId, ...properties });
        }
      }),
      [analytics]
    );
  };
}

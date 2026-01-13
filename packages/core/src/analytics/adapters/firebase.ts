import type { AnalyticsAdapter, AnalyticsEvent } from '../types';

/**
 * Firebase Analytics Adapter
 * 需要在使用前通过 <script> 或 npm 加载 Firebase SDK
 */
export function createFirebaseAdapter(): AnalyticsAdapter {
  let analytics: any = null;

  return {
    init(_key?: string) {
      // Firebase 需要在外部初始化，这里只获取实例
      if (typeof window !== 'undefined' && (window as any).firebase?.analytics) {
        analytics = (window as any).firebase.analytics();
      }
    },
    track(event: AnalyticsEvent) {
      if (!analytics) return;
      analytics.logEvent(event.name, event.properties);
    },
    identify(userId: string, traits?: Record<string, unknown>) {
      if (!analytics) return;
      analytics.setUserId(userId);
      if (traits) {
        analytics.setUserProperties(traits);
      }
    },
    page(name: string, properties?: Record<string, unknown>) {
      if (!analytics) return;
      analytics.logEvent('page_view', { page_title: name, ...properties });
    }
  };
}

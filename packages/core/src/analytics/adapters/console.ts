import type { AnalyticsAdapter, AnalyticsEvent } from '../types';

/**
 * Console Adapter - 开发/调试用，输出到 console
 */
export function createConsoleAdapter(): AnalyticsAdapter {
  return {
    init() {
      console.log('[Analytics] Console adapter initialized');
    },
    track(event: AnalyticsEvent) {
      console.log('[Analytics] Track:', event.name, event.properties);
    },
    identify(userId: string, traits?: Record<string, unknown>) {
      console.log('[Analytics] Identify:', userId, traits);
    },
    page(name: string, properties?: Record<string, unknown>) {
      console.log('[Analytics] Page:', name, properties);
    }
  };
}

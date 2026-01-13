/**
 * 生成设备 ID
 * - 浏览器：使用 crypto.randomUUID 或 fallback
 * - React Native：需要原生模块
 */
export function generateDeviceId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `dev_${crypto.randomUUID()}`;
  }
  return `dev_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/**
 * 获取设备信息（用于埋点和风控）
 */
export function getDeviceInfo(): Record<string, string> {
  if (typeof navigator === 'undefined') {
    return { platform: 'server' };
  }

  return {
    platform: 'web',
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenWidth: String(window.screen?.width ?? 0),
    screenHeight: String(window.screen?.height ?? 0),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}

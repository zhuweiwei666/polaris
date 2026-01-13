import type { ApiClient, ApiClientOptions } from './types';
import { ApiError } from './types';

function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `req_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * 创建 API Client 实例
 * - 统一 token 注入
 * - 统一 401 处理
 * - 统一 request-id
 * - 超时/重试支持
 */
export function createApiClient(options: ApiClientOptions): ApiClient {
  const {
    baseUrl,
    getAccessToken,
    onAuthError,
    timeout = 30000,
    retries = 0,
    defaultHeaders = {}
  } = options;

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);

    // 设置默认 headers
    for (const [key, value] of Object.entries(defaultHeaders)) {
      if (!headers.has(key)) {
        headers.set(key, value);
      }
    }

    // Content-Type 默认 JSON
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    // 注入 token
    const token = await getAccessToken?.();
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    // 注入 request-id
    const requestId = generateRequestId();
    headers.set('x-request-id', requestId);

    // 创建 AbortController 用于超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let lastError: Error | null = null;
    const maxAttempts = retries + 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await fetch(`${baseUrl}${path}`, {
          ...init,
          headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // 401 处理
        if (res.status === 401) {
          onAuthError?.();
        }

        const text = await res.text();
        const json = text ? safeJson(text) : null;

        if (!res.ok) {
          throw new ApiError(res.status, json ?? text, requestId);
        }

        return json as T;
      } catch (err) {
        lastError = err as Error;

        // 不重试的情况
        if (err instanceof ApiError) throw err;
        if ((err as Error).name === 'AbortError') {
          throw new ApiError(0, 'Request timeout', requestId);
        }

        // 最后一次尝试失败
        if (attempt === maxAttempts - 1) {
          throw new ApiError(0, (err as Error).message, requestId);
        }

        // 指数退避
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 100));
      }
    }

    throw lastError;
  }

  return {
    request,
    get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'GET' }),
    post: <T>(path: string, body?: unknown, init?: RequestInit) =>
      request<T>(path, { ...init, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    put: <T>(path: string, body?: unknown, init?: RequestInit) =>
      request<T>(path, { ...init, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
    patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
      request<T>(path, { ...init, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
    delete: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'DELETE' })
  };
}

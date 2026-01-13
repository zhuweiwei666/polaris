import type { StorageService, StorageOptions } from './types';

/**
 * 创建 Web Storage 实例（localStorage / sessionStorage）
 * - 自动 JSON 序列化
 * - 支持 prefix 隔离
 * - 支持 SSR（服务端返回空操作）
 */
export function createWebStorage(
  storage: Storage | null,
  options: StorageOptions = {}
): StorageService {
  const {
    prefix = 'polaris_',
    serialize = JSON.stringify,
    deserialize = JSON.parse
  } = options;

  const prefixedKey = (key: string) => `${prefix}${key}`;

  return {
    async get<T>(key: string): Promise<T | null> {
      if (!storage) return null;
      try {
        const text = storage.getItem(prefixedKey(key));
        if (text === null) return null;
        return deserialize(text) as T;
      } catch {
        return null;
      }
    },

    async set<T>(key: string, value: T): Promise<void> {
      if (!storage) return;
      try {
        storage.setItem(prefixedKey(key), serialize(value));
      } catch {
        // 存储满或隐私模式，静默失败
      }
    },

    async remove(key: string): Promise<void> {
      if (!storage) return;
      storage.removeItem(prefixedKey(key));
    },

    async clear(): Promise<void> {
      if (!storage) return;
      // 只清除带 prefix 的 key
      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => storage.removeItem(k));
    }
  };
}

/**
 * 内存存储（用于 SSR 或无 Storage 环境）
 */
export function createMemoryStorage(options: StorageOptions = {}): StorageService {
  const { prefix = 'polaris_' } = options;
  const store = new Map<string, unknown>();
  const prefixedKey = (key: string) => `${prefix}${key}`;

  return {
    async get<T>(key: string): Promise<T | null> {
      return (store.get(prefixedKey(key)) as T) ?? null;
    },
    async set<T>(key: string, value: T): Promise<void> {
      store.set(prefixedKey(key), value);
    },
    async remove(key: string): Promise<void> {
      store.delete(prefixedKey(key));
    },
    async clear(): Promise<void> {
      store.clear();
    }
  };
}

/**
 * 获取默认 Storage 实例
 * - 浏览器：localStorage
 * - SSR：内存存储
 */
export function getDefaultStorage(options?: StorageOptions): StorageService {
  if (typeof window !== 'undefined' && window.localStorage) {
    return createWebStorage(window.localStorage, options);
  }
  return createMemoryStorage(options);
}

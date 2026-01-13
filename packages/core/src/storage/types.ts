export interface StorageService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface StorageOptions {
  /** 存储前缀，避免 key 冲突 */
  prefix?: string;
  /** 自定义序列化 */
  serialize?: (value: unknown) => string;
  /** 自定义反序列化 */
  deserialize?: (text: string) => unknown;
}

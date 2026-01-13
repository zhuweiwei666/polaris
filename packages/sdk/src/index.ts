export type ApiClientOptions = {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null> | string | null;
  onAuthError?: () => void;
};

export class ApiClient {
  constructor(private readonly opts: ApiClientOptions) {}

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    headers.set("content-type", headers.get("content-type") ?? "application/json");

    const token = await this.opts.getAccessToken?.();
    if (token) headers.set("authorization", `Bearer ${token}`);

    // request_id / trace_id 可在这里注入（后续接 OpenTelemetry）
    headers.set("x-request-id", headers.get("x-request-id") ?? cryptoRandomId());

    const res = await fetch(`${this.opts.baseUrl}${path}`, { ...init, headers });
    if (res.status === 401) this.opts.onAuthError?.();

    const text = await res.text();
    const json = text ? safeJson(text) : null;

    if (!res.ok) {
      throw new ApiError(res.status, json ?? text);
    }
    return json as T;
  }

  health() {
    return this.request<{ ok: boolean }>("/health");
  }

  listTools() {
    return this.request<Array<any>>("/tools");
  }

  createTask(dto: { toolId: string; payload: Record<string, unknown> }) {
    return this.request<any>("/ai/tasks", { method: "POST", body: JSON.stringify(dto) });
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly payload: unknown
  ) {
    super(`API Error ${status}`);
  }
}

function safeJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function cryptoRandomId() {
  // 浏览器/Node 皆可用的简单实现
  const g: any = globalThis as any;
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  return `req_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}


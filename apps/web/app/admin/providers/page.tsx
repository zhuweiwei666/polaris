"use client";

import { useState, useEffect } from "react";

type Provider = {
  id: string;
  displayName: string;
  hasApiKey: boolean;
  apiKey: string | null;
  baseUrl: string | null;
  enabled: boolean;
};

const KNOWN_PROVIDERS = [
  { id: "openrouter", displayName: "OpenRouter" },
  { id: "a2e", displayName: "A2E" }
];

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const base =
    typeof window === "undefined"
      ? process.env.API_INTERNAL_BASE_URL ?? "http://localhost:4000/api"
      : "/api";

  const fetchProviders = async () => {
    try {
      const res = await fetch(`${base}/admin/providers`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setProviders(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleSave = async (providerId: string, apiKey: string, enabled: boolean) => {
    setSaving(providerId);
    setError(null);
    try {
      const known = KNOWN_PROVIDERS.find((p) => p.id === providerId);
      const res = await fetch(`${base}/admin/providers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: providerId,
          displayName: known?.displayName ?? providerId,
          apiKey,
          enabled
        })
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchProviders();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Provider 配置</h2>
        <p className="muted">加载中...</p>
      </div>
    );
  }

  // Merge known providers with DB providers
  const merged = KNOWN_PROVIDERS.map((kp) => {
    const dbProvider = providers.find((p) => p.id === kp.id);
    return dbProvider ?? { ...kp, hasApiKey: false, apiKey: null, baseUrl: null, enabled: false };
  });

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Provider 配置</h2>
      <p className="muted">在这里配置 AI 服务商的 API Key。配置后将优先使用数据库中的 Key（而非环境变量）。</p>

      {error && (
        <div style={{ color: "#ff6b6b", marginBottom: 16, padding: 12, background: "#2a1a1a", borderRadius: 8 }}>
          {error}
        </div>
      )}

      <div className="row" style={{ marginTop: 16, flexDirection: "column", gap: 16 }}>
        {merged.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            saving={saving === provider.id}
            onSave={handleSave}
          />
        ))}
      </div>
    </div>
  );
}

function ProviderCard({
  provider,
  saving,
  onSave
}: {
  provider: Provider;
  saving: boolean;
  onSave: (id: string, apiKey: string, enabled: boolean) => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [enabled, setEnabled] = useState(provider.enabled);

  return (
    <div className="card" style={{ background: "#0b1026" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{provider.displayName}</div>
          <div className="muted" style={{ marginTop: 4 }}>
            ID: <code>{provider.id}</code>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="muted">启用</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            style={{ width: 20, height: 20 }}
          />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="muted" style={{ marginBottom: 6 }}>
          API Key {provider.hasApiKey && <span style={{ color: "#4ade80" }}>✓ 已配置 ({provider.apiKey})</span>}
        </div>
        <input
          type="password"
          placeholder={provider.hasApiKey ? "留空保持不变，或输入新 Key" : "输入 API Key"}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #23305a",
            background: "#0f1630",
            color: "#e6e9f2",
            fontSize: 14
          }}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          className="btn"
          disabled={saving}
          onClick={() => onSave(provider.id, apiKey, enabled)}
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
}

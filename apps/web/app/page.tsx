import Link from "next/link";

async function getTools() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
  const res = await fetch(`${base}/tools`, { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as Array<{ toolId: string; title: string; description: string }>;
}

export default async function HomePage() {
  const tools = await getTools();

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Home</h2>
      <p className="muted">这里展示：推荐工具 / 最近任务 / 模板入口（现在先用工具注册表占位）。</p>

      <div className="row" style={{ marginTop: 12 }}>
        <div className="pill">ToC</div>
        <div className="pill">异步任务</div>
        <div className="pill">次数配额</div>
        <div className="pill">必须登录，不可分享</div>
      </div>

      <h3 style={{ marginTop: 18 }}>Tools</h3>
      <div className="row">
        {tools.map((t) => (
          <div key={t.toolId} className="card" style={{ width: 320 }}>
            <div style={{ fontWeight: 600 }}>{t.title}</div>
            <div className="muted" style={{ marginTop: 6 }}>
              {t.description}
            </div>
            <div style={{ marginTop: 12 }}>
              <Link className="btn" href={`/create?toolId=${encodeURIComponent(t.toolId)}`}>
                Use
              </Link>
            </div>
          </div>
        ))}
        {tools.length === 0 ? <div className="muted">API 未启动或未配置。先跑起 `apps/api` 再刷新。</div> : null}
      </div>
    </div>
  );
}


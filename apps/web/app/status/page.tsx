import Link from "next/link";

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function getStatus() {
  const base =
    process.env.API_INTERNAL_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

  const healthRes = await fetch(`${base}/health`, { cache: "no-store" }).catch(() => null);
  const healthOk = Boolean(healthRes && healthRes.ok);
  const healthBody = healthRes ? await safeJson(healthRes) : null;

  const toolsRes = await fetch(`${base}/tools`, { cache: "no-store" }).catch(() => null);
  const toolsOk = Boolean(toolsRes && toolsRes.ok);
  const toolsBody = toolsRes ? await safeJson(toolsRes) : null;
  const toolsCount = Array.isArray(toolsBody) ? toolsBody.length : null;

  return { base, healthOk, healthBody, toolsOk, toolsCount };
}

export default async function StatusPage() {
  const s = await getStatus();

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>验收面板</h2>
      <p className="muted">你只需要按顺序点下面几项，就能确认“做了什么、没做什么、下一步该做什么”。</p>

      <div className="row" style={{ marginTop: 12 }}>
        <div className="pill">
          API Base: <span className="muted">{s.base}</span>
        </div>
        <div className="pill">
          API Health: <span className="muted">{s.healthOk ? "OK" : "FAIL"}</span>
        </div>
        <div className="pill">
          Tools: <span className="muted">{s.toolsOk ? `OK (${s.toolsCount ?? "?"})` : "FAIL"}</span>
        </div>
      </div>

      <h3 style={{ marginTop: 18 }}>你该怎么验收（可视化）</h3>
      <div className="row">
        <div className="card" style={{ width: 340 }}>
          <div style={{ fontWeight: 600 }}>1) 看工具列表</div>
          <div className="muted" style={{ marginTop: 6 }}>
            首页会拉取 Tools（如果这里能看到卡片，说明 Web→API 通了）。
          </div>
          <div style={{ marginTop: 12 }}>
            <Link className="btn" href="/">
              打开 Home
            </Link>
          </div>
        </div>

        <div className="card" style={{ width: 340 }}>
          <div style={{ fontWeight: 600 }}>2) 创建任务</div>
          <div className="muted" style={{ marginTop: 6 }}>
            在 /create 输入 prompt → 点 Create task → 会跳到任务详情页。
          </div>
          <div style={{ marginTop: 12 }}>
            <Link className="btn" href="/create">
              打开 Create
            </Link>
          </div>
        </div>

        <div className="card" style={{ width: 340 }}>
          <div style={{ fontWeight: 600 }}>3) 看任务详情</div>
          <div className="muted" style={{ marginTop: 6 }}>
            任务详情页会去 API 拉取任务状态（第一期先刷新/轮询即可）。
          </div>
          <div style={{ marginTop: 12 }}>
            <Link className="btn" href="/tasks/demo">
              打开 Tasks 示例页
            </Link>
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: 18 }}>下一步建议（你看完就知道要做什么）</h3>
      <div className="row">
        <div className="card" style={{ width: 340 }}>
          <div style={{ fontWeight: 600 }}>A) 开 DB/Redis（生产态）</div>
          <div className="muted" style={{ marginTop: 6 }}>
            目前为了“先跑起来可视化验收”，默认不注入 DB/Redis。确认 UI 正常后再开。
          </div>
          <div className="muted" style={{ marginTop: 10 }}>
            做法：Repo Secrets 加 `ENABLE_DB=true`、`ENABLE_REDIS=true`，再跑一次 deploy。
          </div>
        </div>

        <div className="card" style={{ width: 340 }}>
          <div style={{ fontWeight: 600 }}>B) 登录/不可分享（必须）</div>
          <div className="muted" style={{ marginTop: 6 }}>
            下一步把 API 从公网开放改为需要登录（Google/Apple），并加上 session/JWT。
          </div>
        </div>

        <div className="card" style={{ width: 340 }}>
          <div style={{ fontWeight: 600 }}>C) 先把 key 换掉（安全）</div>
          <div className="muted" style={{ marginTop: 6 }}>
            你之前泄露过 Service Account key，必须轮换；最终改成 WIF(OIDC) 就不用 key 了。
          </div>
        </div>
      </div>

      <details style={{ marginTop: 18 }}>
        <summary className="muted">展开：API 健康返回（调试用）</summary>
        <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{JSON.stringify(s.healthBody, null, 2)}</pre>
      </details>
    </div>
  );
}


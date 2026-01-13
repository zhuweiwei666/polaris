async function getUsage() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
  const res = await fetch(`${base}/quota/me/usage`, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as any;
}

async function getProducts() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
  const res = await fetch(`${base}/billing/products`, { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as any[];
}

export default async function MePage() {
  const usage = await getUsage();
  const products = await getProducts();

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Me</h2>
      <p className="muted">个人中心：会员状态/剩余次数/升级入口/账号绑定/设置。</p>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 600 }}>Membership</div>
        <div className="muted" style={{ marginTop: 6 }}>
          TODO：这里展示 entitlements + subscription（去广告/内容会员/解锁视频/到期日）。
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 600 }}>Usage</div>
        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(usage, null, 2)}</pre>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 600 }}>Upgrade</div>
        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(products, null, 2)}</pre>
      </div>
    </div>
  );
}


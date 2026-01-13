async function getProducts() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
  const res = await fetch(`${base}/billing/products`, { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as any[];
}

export default async function PaywallPage() {
  const products = await getProducts();

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Paywall</h2>
      <p className="muted">订阅墙：展示套餐、权益、恢复购买、FAQ（第一期先走占位数据）。</p>
      <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(products, null, 2)}</pre>
      <div className="muted" style={{ marginTop: 12 }}>
        TODO：对接 iOS/Android 内购流程，Web 可接 Stripe（如允许）。
      </div>
    </div>
  );
}


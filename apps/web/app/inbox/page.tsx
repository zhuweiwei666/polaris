async function getInbox() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
  const res = await fetch(`${base}/inbox`, { cache: "no-store" });
  if (!res.ok) return { items: [] as any[] };
  return (await res.json()) as { items: any[] };
}

export default async function InboxPage() {
  const data = await getInbox();

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Inbox</h2>
      <p className="muted">站内通知（system/billing/task），支持未读数与 deep link。</p>
      <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(data.items, null, 2)}</pre>
    </div>
  );
}


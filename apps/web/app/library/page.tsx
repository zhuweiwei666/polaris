async function getTasks() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
  const res = await fetch(`${base}/ai/tasks`, { cache: "no-store" });
  if (!res.ok) return { items: [] as any[] };
  return (await res.json()) as { items: any[] };
}

export default async function LibraryPage() {
  const data = await getTasks();

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Library</h2>
      <p className="muted">我的生成结果/任务列表（后续按类型筛选：文本/图/视频）。</p>

      <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(data.items, null, 2)}</pre>
    </div>
  );
}


import Link from "next/link";

async function getTask(taskId: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
  const res = await fetch(`${base}/ai/tasks/${encodeURIComponent(taskId)}`, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as any;
}

export default async function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const task = await getTask(taskId);

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Task</h2>
      <p className="muted">异步任务详情页（第一期先轮询/刷新；后续可加 SSE 实时进度）。</p>

      {!task ? (
        <div className="muted">任务不存在或 API 未启动。</div>
      ) : (
        <>
          <div className="row">
            <div className="pill">taskId: {task.taskId}</div>
            <div className="pill">toolId: {task.toolId}</div>
            <div className="pill">status: {task.status}</div>
          </div>

          <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{JSON.stringify(task, null, 2)}</pre>

          <div style={{ marginTop: 12 }} className="row">
            <Link className="btn" href="/library">
              Go to Library
            </Link>
            <Link className="btn" href="/create">
              New Task
            </Link>
          </div>
        </>
      )}
    </div>
  );
}


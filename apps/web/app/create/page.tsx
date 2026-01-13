"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Tool = { toolId: string; title: string; description: string; schema?: any };

export default function CreatePage() {
  const sp = useSearchParams();
  const router = useRouter();
  const toolId = sp.get("toolId") ?? "text.write";
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

  const [tool, setTool] = useState<Tool | null>(null);
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${base}/tools/${encodeURIComponent(toolId)}`)
      .then((r) => r.json())
      .then(setTool)
      .catch(() => setTool(null));
  }, [base, toolId]);

  const title = useMemo(() => tool?.title ?? toolId, [tool, toolId]);

  async function submit() {
    setSubmitting(true);
    try {
      const res = await fetch(`${base}/ai/tasks`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          toolId,
          payload: { prompt }
        })
      });
      const data = await res.json();
      if (data?.taskId) router.push(`/tasks/${encodeURIComponent(data.taskId)}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Create</h2>
      <p className="muted">通用工作台：选工具 → 输入 → 提交 → 跳任务详情（异步）。</p>

      <div className="pill">Tool: {title}</div>

      <div style={{ marginTop: 12 }}>
        <div className="muted" style={{ marginBottom: 6 }}>
          Prompt
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid #23305a",
            background: "#0b1026",
            color: "#e6e9f2"
          }}
          placeholder="输入你的需求..."
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <button className="btn" onClick={submit} disabled={submitting || !prompt.trim()}>
          {submitting ? "Submitting..." : "Create task"}
        </button>
      </div>

      <div className="muted" style={{ marginTop: 12 }}>
        TODO：根据 Tools Registry 的 JSON Schema 自动渲染参数表单（最大可扩展性）。
      </div>
    </div>
  );
}


'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApi, useEntitlement, useAnalytics } from '@polaris/core';
import { createAiToolsApi } from '../service/api';
import type { Tool, AiTask } from '../types';

export function useAiTools() {
  const api = useApi();
  const entitlement = useEntitlement();
  const analytics = useAnalytics();

  const aiApi = useMemo(() => createAiToolsApi(api), [api]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTools = useCallback(async () => {
    setLoading(true);
    try {
      const list = await aiApi.listTools();
      setTools(list);
    } catch {
      setTools([]);
    } finally {
      setLoading(false);
    }
  }, [aiApi]);

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  const createTask = useCallback(
    async (toolId: string, payload: Record<string, unknown>): Promise<AiTask | null> => {
      // 检查配额
      const canUse = await entitlement.use('daily', 1);
      if (!canUse) {
        analytics.track('ai_tools.quota_exceeded', { toolId });
        return null;
      }

      try {
        const task = await aiApi.createTask({ toolId, payload });
        analytics.track('ai_tools.task_created', { toolId, taskId: task.taskId });
        return task;
      } catch (err) {
        analytics.track('ai_tools.task_error', { toolId, error: String(err) });
        throw err;
      }
    },
    [aiApi, entitlement, analytics]
  );

  return {
    tools,
    loading,
    loadTools,
    createTask,
    api: aiApi
  };
}

export function useTask(taskId: string | null) {
  const api = useApi();
  const aiApi = useMemo(() => createAiToolsApi(api), [api]);
  const [task, setTask] = useState<AiTask | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTask = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const t = await aiApi.getTask(taskId);
      setTask(t);
    } finally {
      setLoading(false);
    }
  }, [aiApi, taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  // 轮询等待任务完成
  useEffect(() => {
    if (!task || task.status === 'succeeded' || task.status === 'failed' || task.status === 'canceled') {
      return;
    }

    const interval = setInterval(loadTask, 2000);
    return () => clearInterval(interval);
  }, [task, loadTask]);

  return { task, loading, reload: loadTask };
}

export function useTaskList() {
  const api = useApi();
  const aiApi = useMemo(() => createAiToolsApi(api), [api]);
  const [tasks, setTasks] = useState<AiTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aiApi.listTasks();
      setTasks(res.items);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [aiApi]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return { tasks, loading, reload: loadTasks };
}

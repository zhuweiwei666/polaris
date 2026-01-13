import { createModule } from '../registry';
import { ToolsPage } from './ui/pages/ToolsPage';
import { CreatePage } from './ui/pages/CreatePage';
import { LibraryPage } from './ui/pages/LibraryPage';

export const aiToolsModule = createModule({
  moduleId: 'ai-tools',
  displayName: 'AI 工具',
  version: '1.0.0',

  routes: [
    {
      path: '/tools',
      component: ToolsPage as any,
      guard: 'public',
      title: 'AI 工具'
    },
    {
      path: '/create',
      component: CreatePage as any,
      guard: 'auth',
      title: '创作'
    },
    {
      path: '/library',
      component: LibraryPage as any,
      guard: 'auth',
      title: '我的作品'
    }
  ],

  tabItem: {
    label: '工具',
    icon: '🛠️',
    order: 1
  },

  configSchema: {
    featuredTools: {
      type: 'array',
      description: '首页推荐的工具 ID 列表'
    },
    showRecentTasks: {
      type: 'boolean',
      default: true,
      description: '是否显示最近任务'
    }
  }
});

// Re-export components for direct usage
export { ToolsPage } from './ui/pages/ToolsPage';
export { CreatePage } from './ui/pages/CreatePage';
export { LibraryPage } from './ui/pages/LibraryPage';
export { ToolGrid } from './ui/ToolGrid';
export { CreateForm } from './ui/CreateForm';
export { TaskResult } from './ui/TaskResult';

// Re-export hooks
export { useAiTools, useTask, useTaskList } from './state/useAiTools';

// Re-export types
export type { Tool, AiTask, AiArtifact, CreateTaskDto, AiToolsConfig } from './types';

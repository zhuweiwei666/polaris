// Module Registry
export { moduleRegistry, createModule, registerModules } from './registry';
export type {
  ModuleDefinition,
  ModuleRoute,
  ModulePageProps,
  ModuleContext,
  ModuleRegistry,
  ConfigParam
} from './types';

// AI Tools Module
export { aiToolsModule } from './ai-tools';
export {
  ToolsPage,
  CreatePage,
  LibraryPage,
  ToolGrid,
  CreateForm,
  TaskResult,
  useAiTools,
  useTask,
  useTaskList
} from './ai-tools';
export type { Tool, AiTask, AiArtifact, AiToolsConfig } from './ai-tools';

// User Center Module
export { userCenterModule } from './user-center';
export { ProfilePage, SettingsPage } from './user-center';
export type { UserCenterConfig, SettingsItem } from './user-center';

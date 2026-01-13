import type { ModuleDefinition, ModuleRegistry, CreateModuleOptions } from './types';

const modules = new Map<string, ModuleDefinition>();

export const moduleRegistry: ModuleRegistry = {
  register(module: ModuleDefinition) {
    if (modules.has(module.moduleId)) {
      console.warn(`[ModuleRegistry] Module "${module.moduleId}" already registered, overwriting`);
    }
    modules.set(module.moduleId, module);
  },

  get(moduleId: string) {
    return modules.get(moduleId);
  },

  getAll() {
    return Array.from(modules.values());
  },

  getEnabled(enabledIds: string[]) {
    return enabledIds
      .map((id) => modules.get(id))
      .filter((m): m is ModuleDefinition => m !== undefined);
  }
};

/**
 * 创建模块定义的辅助函数
 */
export function createModule(options: CreateModuleOptions): ModuleDefinition {
  const module: ModuleDefinition = {
    ...options,
    version: options.version ?? '1.0.0'
  };

  // 自动注册
  moduleRegistry.register(module);

  return module;
}

/**
 * 批量注册模块
 */
export function registerModules(modules: ModuleDefinition[]) {
  modules.forEach((m) => moduleRegistry.register(m));
}

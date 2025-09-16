// 插件管理器
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  dependencies?: string[];
  load(): Promise<void>;
  unload(): Promise<void>;
  getComponents?(): Record<string, React.ComponentType<any>>;
  getHooks?(): Record<string, any>;
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private loadedPlugins: Set<string> = new Set();

  async registerPlugin(plugin: Plugin): Promise<void> {
    this.plugins.set(plugin.id, plugin);
  }

  async loadPlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.error(`Plugin ${pluginId} not found`);
      return false;
    }

    if (this.loadedPlugins.has(pluginId)) {
      console.warn(`Plugin ${pluginId} already loaded`);
      return true;
    }

    try {
      // 检查依赖
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          if (!this.loadedPlugins.has(dep)) {
            console.error(`Plugin ${pluginId} requires ${dep} to be loaded first`);
            return false;
          }
        }
      }

      await plugin.load();
      this.loadedPlugins.add(pluginId);
      console.log(`Plugin ${pluginId} loaded successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to load plugin ${pluginId}:`, error);
      return false;
    }
  }

  async unloadPlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.error(`Plugin ${pluginId} not found`);
      return false;
    }

    if (!this.loadedPlugins.has(pluginId)) {
      console.warn(`Plugin ${pluginId} not loaded`);
      return true;
    }

    try {
      await plugin.unload();
      this.loadedPlugins.delete(pluginId);
      console.log(`Plugin ${pluginId} unloaded successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to unload plugin ${pluginId}:`, error);
      return false;
    }
  }

  isPluginLoaded(pluginId: string): boolean {
    return this.loadedPlugins.has(pluginId);
  }

  getLoadedPlugins(): string[] {
    return Array.from(this.loadedPlugins);
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }
}

// 全局插件管理器实例
export const pluginManager = new PluginManager();

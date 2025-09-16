// 插件配置管理
export interface PluginConfig {
  enabled: boolean;
  autoLoad: boolean;
  settings?: Record<string, any>;
}

export interface PluginConfigs {
  workflow: PluginConfig;
  // 未来可以添加更多插件配置
}

const DEFAULT_PLUGIN_CONFIGS: PluginConfigs = {
  workflow: {
    enabled: false, // 默认禁用工作流插件
    autoLoad: false,
    settings: {}
  }
};

const PLUGIN_CONFIG_KEY = 'promptmate-plugin-configs';

export function loadPluginConfigs(): PluginConfigs {
  try {
    const saved = localStorage.getItem(PLUGIN_CONFIG_KEY);
    if (saved) {
      const configs = JSON.parse(saved);
      // 合并默认配置，确保新插件有默认值
      return { ...DEFAULT_PLUGIN_CONFIGS, ...configs };
    }
    return DEFAULT_PLUGIN_CONFIGS;
  } catch (error) {
    console.error('Failed to load plugin configs:', error);
    return DEFAULT_PLUGIN_CONFIGS;
  }
}

export function savePluginConfigs(configs: PluginConfigs): void {
  try {
    localStorage.setItem(PLUGIN_CONFIG_KEY, JSON.stringify(configs));
  } catch (error) {
    console.error('Failed to save plugin configs:', error);
  }
}

export function updatePluginConfig(pluginId: keyof PluginConfigs, config: Partial<PluginConfig>): void {
  const configs = loadPluginConfigs();
  configs[pluginId] = { ...configs[pluginId], ...config };
  savePluginConfigs(configs);
}

export function isPluginEnabled(pluginId: keyof PluginConfigs): boolean {
  const configs = loadPluginConfigs();
  return configs[pluginId]?.enabled ?? false;
}

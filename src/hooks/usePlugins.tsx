import { useState, useEffect, useCallback } from 'react';
import { pluginManager, Plugin } from '../plugins/PluginManager';
import { WorkflowPlugin } from '../plugins/workflow/WorkflowPlugin';
import { loadPluginConfigs, savePluginConfigs, updatePluginConfig } from '../lib/pluginConfig';

export function usePlugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loadedPlugins, setLoadedPlugins] = useState<string[]>([]);

  // 初始化插件
  useEffect(() => {
    const initializePlugins = async () => {
      // 注册工作流插件
      const workflowPlugin = new WorkflowPlugin();
      await pluginManager.registerPlugin(workflowPlugin);
      
      // 加载插件配置并自动启用已配置的插件
      const configs = loadPluginConfigs();
      if (configs.workflow.enabled && configs.workflow.autoLoad) {
        await pluginManager.loadPlugin('workflow');
      }
      
      // 更新插件列表
      setPlugins(pluginManager.getAllPlugins());
      setLoadedPlugins(pluginManager.getLoadedPlugins());
    };

    initializePlugins();
  }, []);

  const loadPlugin = useCallback(async (pluginId: string) => {
    const success = await pluginManager.loadPlugin(pluginId);
    if (success) {
      setLoadedPlugins(pluginManager.getLoadedPlugins());
      // 更新插件配置
      updatePluginConfig(pluginId as any, { enabled: true, autoLoad: true });
    }
    return success;
  }, []);

  const unloadPlugin = useCallback(async (pluginId: string) => {
    const success = await pluginManager.unloadPlugin(pluginId);
    if (success) {
      setLoadedPlugins(pluginManager.getLoadedPlugins());
      // 更新插件配置
      updatePluginConfig(pluginId as any, { enabled: false, autoLoad: false });
    }
    return success;
  }, []);

  const isPluginLoaded = useCallback((pluginId: string) => {
    return pluginManager.isPluginLoaded(pluginId);
  }, []);

  const getPluginComponent = useCallback((pluginId: string, componentName: string) => {
    const plugin = pluginManager.getPlugin(pluginId);
    if (!plugin || !pluginManager.isPluginLoaded(pluginId)) {
      return null;
    }
    return plugin.getComponents?.()?.[componentName] || null;
  }, []);

  const getPluginHook = useCallback((pluginId: string, hookName: string) => {
    const plugin = pluginManager.getPlugin(pluginId);
    if (!plugin || !pluginManager.isPluginLoaded(pluginId)) {
      return null;
    }
    return plugin.getHooks?.()?.[hookName] || null;
  }, []);

  return {
    plugins,
    loadedPlugins,
    loadPlugin,
    unloadPlugin,
    isPluginLoaded,
    getPluginComponent,
    getPluginHook,
  };
}

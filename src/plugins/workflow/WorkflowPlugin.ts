import { Plugin } from '../PluginManager';
import { lazy } from 'react';

// 工作流插件
export class WorkflowPlugin implements Plugin {
  id = 'workflow';
  name = 'Workflow';
  version = '1.0.0';
  description = 'Advanced workflow automation and visual flow builder';
  enabled = false;

  private components: Record<string, React.ComponentType<any>> = {};
  private hooks: Record<string, any> = {};

  async load(): Promise<void> {
    console.log('[WorkflowPlugin] Loading workflow plugin...');
    
    // 动态导入工作流相关组件
    const { default: WorkflowView } = await import('../../views/WorkflowView');
    const { default: WorkflowBuilder } = await import('../../components/workflow/WorkflowBuilder');
    const { default: WorkflowList } = await import('../../components/workflow/WorkflowList');
    const { default: WorkflowExecutor } = await import('../../components/workflow/WorkflowExecutor');
    
    // 动态导入工作流相关hooks
    const { useWorkflows } = await import('../../hooks/useWorkflows');
    const { useWorkflowExecution } = await import('../../hooks/useWorkflowExecution');
    const { useWorkflowCanvas } = await import('../../hooks/useWorkflowCanvas');

    this.components = {
      WorkflowView,
      WorkflowBuilder,
      WorkflowList,
      WorkflowExecutor,
    };

    this.hooks = {
      useWorkflows,
      useWorkflowExecution,
      useWorkflowCanvas,
    };

    this.enabled = true;
    console.log('[WorkflowPlugin] Workflow plugin loaded successfully');
  }

  async unload(): Promise<void> {
    console.log('[WorkflowPlugin] Unloading workflow plugin...');
    this.components = {};
    this.hooks = {};
    this.enabled = false;
    console.log('[WorkflowPlugin] Workflow plugin unloaded');
  }

  getComponents(): Record<string, React.ComponentType<any>> {
    return this.components;
  }

  getHooks(): Record<string, any> {
    return this.hooks;
  }
}

// 懒加载的工作流组件
export const LazyWorkflowView = lazy(() => 
  import('../../views/WorkflowView').then(module => ({ default: module.default }))
);

export const LazyWorkflowBuilder = lazy(() => 
  import('../../components/workflow/WorkflowBuilder').then(module => ({ default: module.default }))
);

export const LazyWorkflowList = lazy(() => 
  import('../../components/workflow/WorkflowList').then(module => ({ default: module.default }))
);

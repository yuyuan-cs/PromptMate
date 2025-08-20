import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Workflow, WorkflowExecution, WorkflowTemplate } from "@/types/workflow";
import { 
  loadWorkflows, 
  saveWorkflows, 
  loadWorkflowExecutions, 
  saveWorkflowExecutions,
  builtInWorkflowTemplates,
  generateId 
} from "@/lib/data";

interface WorkflowsContextType {
  // 工作流管理
  workflows: Workflow[];
  selectedWorkflow: Workflow | null;
  setSelectedWorkflow: (workflow: Workflow | null) => void;
  createWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  duplicateWorkflow: (id: string) => void;
  
  // 工作流执行
  executions: WorkflowExecution[];
  currentExecution: WorkflowExecution | null;
  startWorkflowExecution: (workflowId: string, variables?: Record<string, any>) => string;
  pauseExecution: (executionId: string) => void;
  resumeExecution: (executionId: string) => void;
  stopExecution: (executionId: string) => void;
  
  // 模板管理
  templates: WorkflowTemplate[];
  createWorkflowFromTemplate: (templateId: string) => void;
  
  // 搜索和过滤
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
  
  // 计算属性
  filteredWorkflows: Workflow[];
  categories: string[];
}

const WorkflowsContext = createContext<WorkflowsContextType | undefined>(undefined);

export function WorkflowsProvider({ children }: { children: ReactNode }) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null);
  const [templates] = useState<WorkflowTemplate[]>(builtInWorkflowTemplates);
  
  // 搜索和过滤状态
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  // 初始化数据
  useEffect(() => {
    setWorkflows(loadWorkflows());
    setExecutions(loadWorkflowExecutions());
  }, []);

  // 保存工作流变化
  useEffect(() => {
    saveWorkflows(workflows);
  }, [workflows]);

  // 保存执行记录变化
  useEffect(() => {
    saveWorkflowExecutions(executions);
  }, [executions]);

  // 创建工作流
  const createWorkflow = (workflowData: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWorkflow: Workflow = {
      ...workflowData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setWorkflows(prev => [...prev, newWorkflow]);
    setSelectedWorkflow(newWorkflow);
  };

  // 更新工作流
  const updateWorkflow = (id: string, updates: Partial<Workflow>) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === id 
        ? { ...workflow, ...updates, updatedAt: new Date().toISOString() }
        : workflow
    ));
    
    // 如果更新的是当前选中的工作流，也更新选中状态
    if (selectedWorkflow?.id === id) {
      setSelectedWorkflow(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
    }
  };

  // 删除工作流
  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(workflow => workflow.id !== id));
    if (selectedWorkflow?.id === id) {
      setSelectedWorkflow(null);
    }
    // 同时删除相关的执行记录
    setExecutions(prev => prev.filter(execution => execution.workflowId !== id));
  };

  // 复制工作流
  const duplicateWorkflow = (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    if (workflow) {
      const duplicated: Workflow = {
        ...workflow,
        id: generateId(),
        name: `${workflow.name} (副本)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setWorkflows(prev => [...prev, duplicated]);
    }
  };

  // 从模板创建工作流
  const createWorkflowFromTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      createWorkflow({
        ...template.workflow,
        name: template.name,
        description: template.description
      });
    }
  };

  // 开始工作流执行
  const startWorkflowExecution = (workflowId: string, variables: Record<string, any> = {}): string => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) {
      throw new Error("工作流不存在");
    }

    const executionId = generateId();
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'pending',
      startedAt: new Date().toISOString(),
      currentStep: 0,
      stepResults: workflow.steps.map(step => ({
        stepId: step.id,
        status: 'pending'
      })),
      variables
    };

    setExecutions(prev => [...prev, execution]);
    setCurrentExecution(execution);
    return executionId;
  };

  // 暂停执行
  const pauseExecution = (executionId: string) => {
    setExecutions(prev => prev.map(execution =>
      execution.id === executionId
        ? { ...execution, status: 'paused' as const }
        : execution
    ));
    
    if (currentExecution?.id === executionId) {
      setCurrentExecution(prev => prev ? { ...prev, status: 'paused' } : null);
    }
  };

  // 恢复执行
  const resumeExecution = (executionId: string) => {
    setExecutions(prev => prev.map(execution =>
      execution.id === executionId
        ? { ...execution, status: 'running' as const }
        : execution
    ));
    
    if (currentExecution?.id === executionId) {
      setCurrentExecution(prev => prev ? { ...prev, status: 'running' } : null);
    }
  };

  // 停止执行
  const stopExecution = (executionId: string) => {
    setExecutions(prev => prev.map(execution =>
      execution.id === executionId
        ? { ...execution, status: 'failed' as const, completedAt: new Date().toISOString() }
        : execution
    ));
    
    if (currentExecution?.id === executionId) {
      setCurrentExecution(null);
    }
  };

  // 计算过滤后的工作流
  const filteredWorkflows = workflows.filter(workflow => {
    // 搜索过滤
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        workflow.name.toLowerCase().includes(searchLower) ||
        workflow.description?.toLowerCase().includes(searchLower) ||
        workflow.tags.some(tag => tag.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // 分类过滤
    if (activeCategory && workflow.category !== activeCategory) {
      return false;
    }

    // 收藏过滤
    if (showFavorites && !workflow.isFavorite) {
      return false;
    }

    return true;
  });

  // 获取所有分类
  const categories = Array.from(new Set(workflows.map(w => w.category))).sort();

  const value: WorkflowsContextType = {
    workflows,
    selectedWorkflow,
    setSelectedWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    
    executions,
    currentExecution,
    startWorkflowExecution,
    pauseExecution,
    resumeExecution,
    stopExecution,
    
    templates,
    createWorkflowFromTemplate,
    
    searchTerm,
    setSearchTerm,
    activeCategory,
    setActiveCategory,
    showFavorites,
    setShowFavorites,
    
    filteredWorkflows,
    categories
  };

  return (
    <WorkflowsContext.Provider value={value}>
      {children}
    </WorkflowsContext.Provider>
  );
}

export function useWorkflows() {
  const context = useContext(WorkflowsContext);
  if (context === undefined) {
    throw new Error('useWorkflows must be used within a WorkflowsProvider');
  }
  return context;
}
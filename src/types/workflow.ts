export interface Workflow {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  steps: WorkflowStep[];
  variables: WorkflowVariable[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  promptId?: string; // 关联现有提示词
  customPrompt?: string; // 或使用自定义提示词
  order: number;
  inputVariables: string[]; // 输入变量
  outputVariable?: string; // 输出变量名
  condition?: WorkflowCondition; // 条件执行
  isOptional: boolean;
  description?: string;
}

export interface WorkflowVariable {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'file';
  defaultValue?: any;
  description?: string;
  required: boolean;
}

export interface WorkflowCondition {
  type: 'always' | 'if_success' | 'if_failure' | 'if_contains';
  value?: string; // 条件值
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  startedAt: string;
  completedAt?: string;
  currentStep: number;
  stepResults: WorkflowStepResult[];
  variables: Record<string, any>;
  error?: string;
}

export interface WorkflowStepResult {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  input?: string;
  output?: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>;
  author?: string;
  isBuiltIn: boolean;
}
import { useState, useCallback } from "react";
import { Workflow, WorkflowExecution, WorkflowStep, WorkflowStepResult } from "@/types/workflow";
import { usePrompts } from "./usePrompts";

interface UseWorkflowExecutionProps {
  workflow: Workflow;
  execution: WorkflowExecution;
  onExecutionUpdate: (execution: WorkflowExecution) => void;
}

export function useWorkflowExecution({ 
  workflow, 
  execution, 
  onExecutionUpdate 
}: UseWorkflowExecutionProps) {
  const { prompts } = usePrompts();
  const [isExecuting, setIsExecuting] = useState(false);

  // 替换变量占位符
  const replaceVariables = useCallback((text: string, variables: Record<string, any>): string => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return variables[varName] || match;
    });
  }, []);

  // 获取提示词内容
  const getPromptContent = useCallback((step: WorkflowStep, variables: Record<string, any>): string => {
    let content = "";
    
    if (step.promptId) {
      const prompt = prompts.find(p => p.id === step.promptId);
      content = prompt?.content || "";
    } else if (step.customPrompt) {
      content = step.customPrompt;
    }
    
    return replaceVariables(content, variables);
  }, [prompts, replaceVariables]);

  // 执行单个步骤
  const executeStep = useCallback(async (
    stepIndex: number, 
    variables: Record<string, any>
  ): Promise<{ success: boolean; output?: string; error?: string }> => {
    const step = workflow.steps[stepIndex];
    if (!step) {
      return { success: false, error: "步骤不存在" };
    }

    try {
      // 更新步骤状态为运行中
      const updatedExecution = {
        ...execution,
        stepResults: execution.stepResults.map((result, index) =>
          index === stepIndex
            ? { ...result, status: 'running' as const, startedAt: new Date().toISOString() }
            : result
        )
      };
      onExecutionUpdate(updatedExecution);

      // 获取处理后的提示词内容
      const promptContent = getPromptContent(step, variables);
      
      // 模拟AI处理（实际项目中这里会调用AI API）
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // 模拟输出结果
      const output = `步骤 "${step.name}" 的执行结果：\n\n基于输入：\n${promptContent}\n\n生成的输出内容...`;
      
      // 更新步骤结果
      const finalExecution = {
        ...updatedExecution,
        stepResults: updatedExecution.stepResults.map((result, index) =>
          index === stepIndex
            ? { 
                ...result, 
                status: 'completed' as const, 
                input: promptContent,
                output,
                completedAt: new Date().toISOString() 
              }
            : result
        )
      };
      onExecutionUpdate(finalExecution);

      return { success: true, output };
    } catch (error) {
      // 更新步骤状态为失败
      const failedExecution = {
        ...execution,
        stepResults: execution.stepResults.map((result, index) =>
          index === stepIndex
            ? { 
                ...result, 
                status: 'failed' as const, 
                error: error instanceof Error ? error.message : "未知错误",
                completedAt: new Date().toISOString() 
              }
            : result
        )
      };
      onExecutionUpdate(failedExecution);

      return { success: false, error: error instanceof Error ? error.message : "未知错误" };
    }
  }, [workflow.steps, execution, onExecutionUpdate, getPromptContent]);

  // 执行整个工作流
  const executeWorkflow = useCallback(async () => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    
    try {
      // 更新执行状态为运行中
      let currentExecution = {
        ...execution,
        status: 'running' as const,
        startedAt: new Date().toISOString()
      };
      onExecutionUpdate(currentExecution);

      const variables = { ...currentExecution.variables };
      
      // 按顺序执行每个步骤
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        
        // 检查是否应该跳过此步骤
        if (step.isOptional && step.condition) {
          // 这里可以添加条件判断逻辑
          // 暂时简化处理
        }
        
        // 更新当前步骤
        currentExecution = {
          ...currentExecution,
          currentStep: i
        };
        onExecutionUpdate(currentExecution);
        
        // 执行步骤
        const result = await executeStep(i, variables);
        
        if (!result.success) {
          // 步骤失败，停止执行
          const failedExecution = {
            ...currentExecution,
            status: 'failed' as const,
            error: result.error,
            completedAt: new Date().toISOString()
          };
          onExecutionUpdate(failedExecution);
          return;
        }
        
        // 将输出保存到变量中
        if (step.outputVariable && result.output) {
          variables[step.outputVariable] = result.output;
        }
        
        // 更新执行记录中的变量
        currentExecution = {
          ...currentExecution,
          variables
        };
      }
      
      // 所有步骤完成
      const completedExecution = {
        ...currentExecution,
        status: 'completed' as const,
        completedAt: new Date().toISOString()
      };
      onExecutionUpdate(completedExecution);
      
    } catch (error) {
      // 执行过程中出现错误
      const errorExecution = {
        ...execution,
        status: 'failed' as const,
        error: error instanceof Error ? error.message : "执行过程中出现未知错误",
        completedAt: new Date().toISOString()
      };
      onExecutionUpdate(errorExecution);
    } finally {
      setIsExecuting(false);
    }
  }, [isExecuting, execution, workflow.steps, onExecutionUpdate, executeStep]);

  // 执行单个步骤（手动模式）
  const executeStepManually = useCallback(async (stepIndex: number) => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    
    try {
      const variables = { ...execution.variables };
      await executeStep(stepIndex, variables);
    } finally {
      setIsExecuting(false);
    }
  }, [isExecuting, execution.variables, executeStep]);

  return {
    isExecuting,
    executeWorkflow,
    executeStepManually,
    replaceVariables,
    getPromptContent
  };
}
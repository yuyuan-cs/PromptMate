import { useState, useEffect } from "react";
import { useWorkflows } from "@/hooks/useWorkflows";
import { useWorkflowExecution } from "@/hooks/useWorkflowExecution";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icons } from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Workflow, WorkflowExecution } from "@/types/workflow";

interface WorkflowExecutorProps {
  workflow: Workflow;
  onClose: () => void;
}

export function WorkflowExecutor({ workflow, onClose }: WorkflowExecutorProps) {
  const { 
    executions, 
    currentExecution,
    startWorkflowExecution, 
    pauseExecution, 
    resumeExecution, 
    stopExecution 
  } = useWorkflows();
  
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // 初始化变量默认值
  useEffect(() => {
    const initialVariables: Record<string, any> = {};
    workflow.variables.forEach(variable => {
      if (variable.defaultValue !== undefined) {
        initialVariables[variable.name] = variable.defaultValue;
      }
    });
    setVariables(initialVariables);
  }, [workflow.variables]);

  // 监听当前执行状态
  useEffect(() => {
    if (currentExecution && currentExecution.workflowId === workflow.id) {
      setExecution(currentExecution);
    }
  }, [currentExecution, workflow.id]);

  // 工作流执行hook
  const workflowExecution = execution ? useWorkflowExecution({
    workflow,
    execution,
    onExecutionUpdate: (updatedExecution) => {
      setExecution(updatedExecution);
      // 这里应该更新到全局状态，但为了简化暂时只更新本地状态
    }
  }) : null;

  // 开始执行
  const handleStart = () => {
    // 验证必需变量
    const missingVariables = workflow.variables
      .filter(variable => variable.required && !variables[variable.name])
      .map(variable => variable.name);
    
    if (missingVariables.length > 0) {
      alert(`请填写必需变量: ${missingVariables.join(", ")}`);
      return;
    }

    const executionId = startWorkflowExecution(workflow.id, variables);
    const newExecution = executions.find(e => e.id === executionId);
    if (newExecution) {
      setExecution(newExecution);
    }
  };

  // 暂停执行
  const handlePause = () => {
    if (execution) {
      pauseExecution(execution.id);
    }
  };

  // 恢复执行
  const handleResume = () => {
    if (execution) {
      resumeExecution(execution.id);
    }
  };

  // 停止执行
  const handleStop = () => {
    if (execution) {
      stopExecution(execution.id);
    }
  };

  // 自动执行工作流
  const handleAutoExecute = () => {
    if (workflowExecution && execution) {
      workflowExecution.executeWorkflow();
    }
  };

  // 手动执行单个步骤
  const handleExecuteStep = (stepIndex: number) => {
    if (workflowExecution) {
      workflowExecution.executeStepManually(stepIndex);
    }
  };

  // 切换步骤展开状态
  const toggleStepExpanded = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  // 计算执行进度
  const getProgress = () => {
    if (!execution) return 0;
    const completedSteps = execution.stepResults.filter(result => 
      result.status === 'completed' || result.status === 'skipped'
    ).length;
    return (completedSteps / workflow.steps.length) * 100;
  };

  // 获取步骤状态图标
  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Icons.check className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Icons.loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <Icons.x className="h-4 w-4 text-red-500" />;
      case 'skipped':
        return <Icons.skip className="h-4 w-4 text-gray-500" />;
      default:
        return <Icons.circle className="h-4 w-4 text-gray-300" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{workflow.name}</h2>
            <p className="text-sm text-muted-foreground">工作流执行</p>
          </div>
          <Button variant="outline" onClick={onClose}>
            <Icons.x className="h-4 w-4 mr-2" />
            关闭
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* 变量输入 */}
          {workflow.variables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>输入变量</CardTitle>
                <CardDescription>
                  请填写工作流执行所需的变量值
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {workflow.variables.map(variable => (
                  <div key={variable.name}>
                    <Label htmlFor={variable.name}>
                      {variable.name}
                      {variable.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {variable.description && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {variable.description}
                      </p>
                    )}
                    {variable.type === 'text' ? (
                      <Textarea
                        id={variable.name}
                        value={variables[variable.name] || ""}
                        onChange={(e) => setVariables(prev => ({
                          ...prev,
                          [variable.name]: e.target.value
                        }))}
                        placeholder={variable.defaultValue || `输入${variable.name}`}
                        disabled={execution?.status === 'running'}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={variable.name}
                        type={variable.type === 'number' ? 'number' : 'text'}
                        value={variables[variable.name] || ""}
                        onChange={(e) => setVariables(prev => ({
                          ...prev,
                          [variable.name]: variable.type === 'number' 
                            ? Number(e.target.value) 
                            : e.target.value
                        }))}
                        placeholder={variable.defaultValue || `输入${variable.name}`}
                        disabled={execution?.status === 'running'}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 执行控制 */}
          <Card>
            <CardHeader>
              <CardTitle>执行控制</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                {!execution || execution.status === 'completed' || execution.status === 'failed' ? (
                  <Button onClick={handleStart}>
                    <Icons.play className="h-4 w-4 mr-2" />
                    开始执行
                  </Button>
                ) : (
                  <>
                    {execution.status === 'running' ? (
                      <>
                        <Button onClick={handlePause} variant="outline">
                          <Icons.pause className="h-4 w-4 mr-2" />
                          暂停
                        </Button>
                        <Button onClick={handleStop} variant="destructive">
                          <Icons.stop className="h-4 w-4 mr-2" />
                          停止
                        </Button>
                      </>
                    ) : execution.status === 'paused' ? (
                      <>
                        <Button onClick={handleResume}>
                          <Icons.play className="h-4 w-4 mr-2" />
                          继续
                        </Button>
                        <Button onClick={handleStop} variant="destructive">
                          <Icons.stop className="h-4 w-4 mr-2" />
                          停止
                        </Button>
                      </>
                    ) : (
                      <Button onClick={handleStart}>
                        <Icons.play className="h-4 w-4 mr-2" />
                        重新开始
                      </Button>
                    )}
                    
                    {execution.status === 'pending' && (
                      <Button onClick={handleAutoExecute} variant="outline">
                        <Icons.zap className="h-4 w-4 mr-2" />
                        自动执行
                      </Button>
                    )}
                  </>
                )}
              </div>

              {execution && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>执行进度</span>
                    <span>{Math.round(getProgress())}%</span>
                  </div>
                  <Progress value={getProgress()} />
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>状态: {execution.status}</span>
                    <span>当前步骤: {execution.currentStep + 1}/{workflow.steps.length}</span>
                    {execution.startedAt && (
                      <span>开始时间: {new Date(execution.startedAt).toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 步骤执行状态 */}
          <Card>
            <CardHeader>
              <CardTitle>执行步骤</CardTitle>
              <CardDescription>
                工作流步骤的执行状态和结果
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflow.steps.map((step, index) => {
                  const stepResult = execution?.stepResults.find(result => result.stepId === step.id);
                  const isExpanded = expandedSteps.has(step.id);
                  
                  return (
                    <Collapsible key={step.id}>
                      <div className="flex items-center gap-3 p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          {stepResult && getStepStatusIcon(stepResult.status)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{step.name}</span>
                            {step.isOptional && (
                              <Badge variant="outline" className="text-xs">可选</Badge>
                            )}
                            {stepResult && (
                              <Badge 
                                variant={stepResult.status === 'completed' ? 'default' : 
                                        stepResult.status === 'failed' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {stepResult.status}
                              </Badge>
                            )}
                          </div>
                          {step.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {step.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-1">
                          {execution?.status === 'paused' && stepResult?.status === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleExecuteStep(index)}
                            >
                              <Icons.play className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {stepResult && (stepResult.input || stepResult.output || stepResult.error) && (
                            <CollapsibleTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => toggleStepExpanded(step.id)}
                              >
                                {isExpanded ? (
                                  <Icons.chevronUp className="h-4 w-4" />
                                ) : (
                                  <Icons.chevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          )}
                        </div>
                      </div>
                      
                      {stepResult && (stepResult.input || stepResult.output || stepResult.error) && (
                        <CollapsibleContent>
                          <div className="ml-11 mt-2 space-y-3">
                            {stepResult.input && (
                              <div>
                                <Label className="text-xs font-medium">输入内容</Label>
                                <div className="mt-1 p-2 bg-muted rounded text-sm">
                                  <pre className="whitespace-pre-wrap">{stepResult.input}</pre>
                                </div>
                              </div>
                            )}
                            
                            {stepResult.output && (
                              <div>
                                <Label className="text-xs font-medium">输出结果</Label>
                                <div className="mt-1 p-2 bg-muted rounded text-sm">
                                  <pre className="whitespace-pre-wrap">{stepResult.output}</pre>
                                </div>
                              </div>
                            )}
                            
                            {stepResult.error && (
                              <div>
                                <Label className="text-xs font-medium text-red-500">错误信息</Label>
                                <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                  {stepResult.error}
                                </div>
                              </div>
                            )}
                            
                            {stepResult.startedAt && (
                              <div className="text-xs text-muted-foreground">
                                开始时间: {new Date(stepResult.startedAt).toLocaleString()}
                                {stepResult.completedAt && (
                                  <span className="ml-4">
                                    完成时间: {new Date(stepResult.completedAt).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 执行历史 */}
          {executions.filter(e => e.workflowId === workflow.id).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>执行历史</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {executions
                    .filter(e => e.workflowId === workflow.id)
                    .slice(0, 5)
                    .map(exec => (
                      <div key={exec.id} className="flex items-center justify-between p-2 border rounded text-sm">
                        <div className="flex items-center gap-2">
                          {getStepStatusIcon(exec.status)}
                          <span>{exec.status}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(exec.startedAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
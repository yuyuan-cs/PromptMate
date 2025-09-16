import { useState, useEffect } from "react";
import { useWorkflows } from "@/hooks/useWorkflows";
import { usePrompts } from "@/hooks/usePrompts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Workflow, WorkflowStep, WorkflowVariable } from "@/types/workflow";
import { generateId } from "@/lib/data";
import { WorkflowCanvas } from "./canvas/WorkflowCanvas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkflowBuilderProps {
  workflow?: Workflow;
  onSave: (workflow: Workflow) => void;
  onCancel: () => void;
}

function WorkflowBuilder({ workflow, onSave, onCancel }: WorkflowBuilderProps) {
  const { categories: workflowCategories } = useWorkflows();
  const { prompts, categories: promptCategories } = usePrompts();
  
  // 表单状态
  const [name, setName] = useState(workflow?.name || "");
  const [description, setDescription] = useState(workflow?.description || "");
  const [category, setCategory] = useState(workflow?.category || "");
  const [tags, setTags] = useState(workflow?.tags.join(", ") || "");
  const [steps, setSteps] = useState<WorkflowStep[]>(workflow?.steps || []);
  const [variables, setVariables] = useState<WorkflowVariable[]>(workflow?.variables || []);
  
  // 对话框状态
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [showVariableDialog, setShowVariableDialog] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [editingVariable, setEditingVariable] = useState<WorkflowVariable | null>(null);

  // 步骤编辑状态
  const [stepName, setStepName] = useState("");
  const [stepDescription, setStepDescription] = useState("");
  const [stepPromptId, setStepPromptId] = useState("");
  const [stepCustomPrompt, setStepCustomPrompt] = useState("");
  const [stepOutputVariable, setStepOutputVariable] = useState("");
  const [stepIsOptional, setStepIsOptional] = useState(false);

  // 变量编辑状态
  const [variableName, setVariableName] = useState("");
  const [variableType, setVariableType] = useState<WorkflowVariable['type']>("text");
  const [variableDescription, setVariableDescription] = useState("");
  const [variableDefaultValue, setVariableDefaultValue] = useState("");
  const [variableRequired, setVariableRequired] = useState(true);

  // 重置步骤编辑表单
  const resetStepForm = () => {
    setStepName("");
    setStepDescription("");
    setStepPromptId("");
    setStepCustomPrompt("");
    setStepOutputVariable("");
    setStepIsOptional(false);
  };

  // 重置变量编辑表单
  const resetVariableForm = () => {
    setVariableName("");
    setVariableType("text");
    setVariableDescription("");
    setVariableDefaultValue("");
    setVariableRequired(true);
  };

  // 打开步骤编辑对话框
  const openStepDialog = (step?: WorkflowStep) => {
    if (step) {
      setEditingStep(step);
      setStepName(step.name);
      setStepDescription(step.description || "");
      setStepPromptId(step.promptId || "");
      setStepCustomPrompt(step.customPrompt || "");
      setStepOutputVariable(step.outputVariable || "");
      setStepIsOptional(step.isOptional);
    } else {
      setEditingStep(null);
      resetStepForm();
    }
    setShowStepDialog(true);
  };

  // 打开变量编辑对话框
  const openVariableDialog = (variable?: WorkflowVariable) => {
    if (variable) {
      setEditingVariable(variable);
      setVariableName(variable.name);
      setVariableType(variable.type);
      setVariableDescription(variable.description || "");
      setVariableDefaultValue(variable.defaultValue || "");
      setVariableRequired(variable.required);
    } else {
      setEditingVariable(null);
      resetVariableForm();
    }
    setShowVariableDialog(true);
  };

  // 保存步骤
  const saveStep = () => {
    if (!stepName.trim()) return;

    const newStep: WorkflowStep = {
      id: editingStep?.id || generateId(),
      name: stepName.trim(),
      description: stepDescription.trim() || undefined,
      promptId: stepPromptId || undefined,
      customPrompt: stepCustomPrompt.trim() || undefined,
      order: editingStep?.order || steps.length + 1,
      inputVariables: [], // 这里可以后续扩展为从提示词内容中自动提取
      outputVariable: stepOutputVariable.trim() || undefined,
      isOptional: stepIsOptional
    };

    if (editingStep) {
      setSteps(prev => prev.map(step => 
        step.id === editingStep.id ? newStep : step
      ));
    } else {
      setSteps(prev => [...prev, newStep]);
    }

    setShowStepDialog(false);
    resetStepForm();
  };

  // 保存变量
  const saveVariable = () => {
    if (!variableName.trim()) return;

    const newVariable: WorkflowVariable = {
      name: variableName.trim(),
      type: variableType,
      description: variableDescription.trim() || undefined,
      defaultValue: variableDefaultValue.trim() || undefined,
      required: variableRequired
    };

    if (editingVariable) {
      setVariables(prev => prev.map(variable => 
        variable.name === editingVariable.name ? newVariable : variable
      ));
    } else {
      setVariables(prev => [...prev, newVariable]);
    }

    setShowVariableDialog(false);
    resetVariableForm();
  };

  // 删除步骤
  const deleteStep = (stepId: string) => {
    setSteps(prev => prev.filter(step => step.id !== stepId));
  };

  // 删除变量
  const deleteVariable = (variableName: string) => {
    setVariables(prev => prev.filter(variable => variable.name !== variableName));
  };

  // 移动步骤
  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    setSteps(prev => {
      const index = prev.findIndex(step => step.id === stepId);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newSteps = [...prev];
      [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
      
      // 更新order
      return newSteps.map((step, i) => ({ ...step, order: i + 1 }));
    });
  };

  // 保存工作流
  const handleSave = () => {
    if (!name.trim()) return;

    const workflowData: Workflow = {
      id: workflow?.id || generateId(),
      name: name.trim(),
      description: description.trim() || undefined,
      category: category || "general",
      tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
      steps: steps.map((step, index) => ({ ...step, order: index + 1 })),
      variables,
      isFavorite: workflow?.isFavorite || false,
      createdAt: workflow?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: workflow?.version || 1
    };

    onSave(workflowData);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <Icons.arrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {workflow ? '编辑工作流' : '创建工作流'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            <Icons.save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1">
        <Tabs defaultValue="canvas" className="min-h-[80vh] flex flex-col">
          <div className="px-4 pt-2">
            <TabsList>
              <TabsTrigger value="canvas">可视化编辑</TabsTrigger>
              <TabsTrigger value="form">表单编辑</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="canvas" className="flex-1 mt-2">
            <WorkflowCanvas
              workflow={{
                id: workflow?.id || generateId(),
                name: name || 'Untitled Workflow',
                description: description || '',
                category: category || 'default',
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                steps: steps,
                variables: variables,
                isFavorite: workflow?.isFavorite || false,
                createdAt: workflow?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1
              }}
              onSave={handleSave}
              onLoad={() => console.log('Load workflow')}
              onExport={() => console.log('Export workflow')}
            />
          </TabsContent>
          
          <TabsContent value="form" className="flex-1 mt-2">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                {/* 基本信息 */}
                <Card>
                  <CardHeader>
                    <CardTitle>基本信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">工作流名称</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="输入工作流名称"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">描述</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="描述工作流的用途和功能"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">分类</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择分类" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">通用</SelectItem>
                            <SelectItem value="creative">创意生成</SelectItem>
                            <SelectItem value="development">开发编程</SelectItem>
                            <SelectItem value="business">商务沟通</SelectItem>
                            <SelectItem value="education">教育学习</SelectItem>
                            <SelectItem value="productivity">生产力</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="tags">标签</Label>
                        <Input
                          id="tags"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          placeholder="用逗号分隔多个标签"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 变量管理 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>变量管理</CardTitle>
                        <CardDescription>定义工作流中使用的变量</CardDescription>
                      </div>
                      <Button size="sm" onClick={() => openVariableDialog()}>
                        <Icons.plus className="h-4 w-4 mr-2" />
                        添加变量
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {variables.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        暂无变量，点击上方按钮添加
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {variables.map(variable => (
                          <div key={variable.name} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{variable.name}</span>
                                <Badge variant="secondary">{variable.type}</Badge>
                                {variable.required && (
                                  <Badge variant="destructive" className="text-xs">必需</Badge>
                                )}
                              </div>
                              {variable.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {variable.description}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => openVariableDialog(variable)}
                              >
                                <Icons.edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => deleteVariable(variable.name)}
                              >
                                <Icons.trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 步骤管理 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>工作流步骤</CardTitle>
                        <CardDescription>定义工作流的执行步骤</CardDescription>
                      </div>
                      <Button size="sm" onClick={() => openStepDialog()}>
                        <Icons.plus className="h-4 w-4 mr-2" />
                        添加步骤
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {steps.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        暂无步骤，点击上方按钮添加
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {steps.map((step, index) => (
                          <div key={step.id} className="flex items-start gap-3 p-3 border rounded">
                            <div className="flex flex-col items-center gap-1 mt-1">
                              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                {index + 1}
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => moveStep(step.id, 'up')}
                                  disabled={index === 0}
                                  className="h-6 w-6 p-0"
                                >
                                  <Icons.chevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => moveStep(step.id, 'down')}
                                  disabled={index === steps.length - 1}
                                  className="h-6 w-6 p-0"
                                >
                                  <Icons.chevronDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{step.name}</span>
                                {step.isOptional && (
                                  <Badge variant="outline" className="text-xs">可选</Badge>
                                )}
                                {step.outputVariable && (
                                  <Badge variant="secondary" className="text-xs">
                                    输出: {step.outputVariable}
                                  </Badge>
                                )}
                              </div>
                              
                              {step.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {step.description}
                                </p>
                              )}
                              
                              <div className="text-xs text-muted-foreground">
                                {step.promptId ? (
                                  <span>使用提示词: {prompts.find(p => p.id === step.promptId)?.title || "未找到"}</span>
                                ) : (
                                  <span>自定义提示词</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => openStepDialog(step)}
                              >
                                <Icons.edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => deleteStep(step.id)}
                              >
                                <Icons.trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* 步骤编辑对话框 */}
      <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStep ? "编辑步骤" : "添加步骤"}</DialogTitle>
            <DialogDescription>
              配置工作流步骤的详细信息
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="stepName">步骤名称</Label>
              <Input
                id="stepName"
                value={stepName}
                onChange={(e) => setStepName(e.target.value)}
                placeholder="输入步骤名称"
              />
            </div>
            
            <div>
              <Label htmlFor="stepDescription">步骤描述</Label>
              <Textarea
                id="stepDescription"
                value={stepDescription}
                onChange={(e) => setStepDescription(e.target.value)}
                placeholder="描述这个步骤的作用"
                rows={2}
              />
            </div>
            
            <div>
              <Label>提示词来源</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="useExisting"
                    name="promptSource"
                    checked={!!stepPromptId}
                    onChange={() => {
                      setStepCustomPrompt("");
                      if (!stepPromptId && prompts.length > 0) {
                        setStepPromptId(prompts[0].id);
                      }
                    }}
                  />
                  <Label htmlFor="useExisting">使用现有提示词</Label>
                </div>
                
                {stepPromptId && (
                  <Select value={stepPromptId} onValueChange={setStepPromptId}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择提示词" />
                    </SelectTrigger>
                    <SelectContent>
                      {prompts.map(prompt => (
                        <SelectItem key={prompt.id} value={prompt.id}>
                          {prompt.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="useCustom"
                    name="promptSource"
                    checked={!!stepCustomPrompt}
                    onChange={() => {
                      setStepPromptId("");
                      setStepCustomPrompt("请输入自定义提示词内容...");
                    }}
                  />
                  <Label htmlFor="useCustom">自定义提示词</Label>
                </div>
                
                {stepCustomPrompt && (
                  <Textarea
                    value={stepCustomPrompt}
                    onChange={(e) => setStepCustomPrompt(e.target.value)}
                    placeholder="输入自定义提示词内容，使用 {{变量名}} 来引用变量"
                    rows={4}
                  />
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="stepOutputVariable">输出变量名</Label>
              <Input
                id="stepOutputVariable"
                value={stepOutputVariable}
                onChange={(e) => setStepOutputVariable(e.target.value)}
                placeholder="将此步骤的输出保存到变量（可选）"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="stepIsOptional"
                checked={stepIsOptional}
                onChange={(e) => setStepIsOptional(e.target.checked)}
              />
              <Label htmlFor="stepIsOptional">可选步骤</Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowStepDialog(false)}>
              取消
            </Button>
            <Button onClick={saveStep} disabled={!stepName.trim()}>
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 变量编辑对话框 */}
      <Dialog open={showVariableDialog} onOpenChange={setShowVariableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVariable ? "编辑变量" : "添加变量"}</DialogTitle>
            <DialogDescription>
              定义工作流中使用的变量
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="variableName">变量名</Label>
              <Input
                id="variableName"
                value={variableName}
                onChange={(e) => setVariableName(e.target.value)}
                placeholder="输入变量名（如：topic, content）"
              />
            </div>
            
            <div>
              <Label htmlFor="variableType">变量类型</Label>
              <Select value={variableType} onValueChange={(value: WorkflowVariable['type']) => setVariableType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">文本</SelectItem>
                  <SelectItem value="number">数字</SelectItem>
                  <SelectItem value="boolean">布尔值</SelectItem>
                  <SelectItem value="file">文件</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="variableDescription">描述</Label>
              <Textarea
                id="variableDescription"
                value={variableDescription}
                onChange={(e) => setVariableDescription(e.target.value)}
                placeholder="描述这个变量的用途"
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="variableDefaultValue">默认值</Label>
              <Input
                id="variableDefaultValue"
                value={variableDefaultValue}
                onChange={(e) => setVariableDefaultValue(e.target.value)}
                placeholder="输入默认值（可选）"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="variableRequired"
                checked={variableRequired}
                onChange={(e) => setVariableRequired(e.target.checked)}
              />
              <Label htmlFor="variableRequired">必需变量</Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowVariableDialog(false)}>
              取消
            </Button>
            <Button onClick={saveVariable} disabled={!variableName.trim()}>
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WorkflowBuilder;
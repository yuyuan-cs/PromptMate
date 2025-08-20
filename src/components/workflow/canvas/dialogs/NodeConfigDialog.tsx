import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Icons } from '@/components/ui/icons';
import { CanvasNode } from '@/types/canvas';

interface NodeConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: CanvasNode | null;
  onSave: (nodeData: Partial<CanvasNode>) => void;
}

interface VariablePort {
  id: string;
  name: string;
  type: 'input' | 'output';
  dataType: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export function NodeConfigDialog({ open, onOpenChange, node, onSave }: NodeConfigDialogProps) {
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    promptContent: '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: '',
    variables: [] as VariablePort[],
    outputFormat: 'text',
    retryCount: 1,
    timeout: 30000,
  });

  useEffect(() => {
    if (node) {
      setFormData({
        label: node.label || '',
        description: node.description || '',
        promptContent: node.data?.promptContent || '',
        model: node.data?.model || 'gpt-4',
        temperature: node.data?.temperature || 0.7,
        maxTokens: node.data?.maxTokens || 2000,
        systemPrompt: node.data?.systemPrompt || '',
        variables: node.data?.variables || [],
        outputFormat: node.data?.outputFormat || 'text',
        retryCount: node.data?.retryCount || 1,
        timeout: node.data?.timeout || 30000,
      });
    }
  }, [node]);

  const handleSave = () => {
    if (!node) return;

    const updatedNode: Partial<CanvasNode> = {
      label: formData.label,
      description: formData.description,
      data: {
        ...node.data,
        promptContent: formData.promptContent,
        model: formData.model,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens,
        systemPrompt: formData.systemPrompt,
        variables: formData.variables,
        outputFormat: formData.outputFormat,
        retryCount: formData.retryCount,
        timeout: formData.timeout,
      },
    };

    onSave(updatedNode);
    onOpenChange(false);
  };

  const addVariable = () => {
    const newVariable: VariablePort = {
      id: `var_${Date.now()}`,
      name: `variable_${formData.variables.length + 1}`,
      type: 'input',
      dataType: 'string',
      required: false,
    };
    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, newVariable],
    }));
  };

  const updateVariable = (index: number, updates: Partial<VariablePort>) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.map((v, i) => i === index ? { ...v, ...updates } : v),
    }));
  };

  const removeVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }));
  };

  const extractVariablesFromPrompt = () => {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const matches = [...formData.promptContent.matchAll(variableRegex)];
    const extractedVars = matches.map(match => match[1]);
    
    const newVariables: VariablePort[] = extractedVars
      .filter(varName => !formData.variables.some(v => v.name === varName))
      .map(varName => ({
        id: `var_${Date.now()}_${varName}`,
        name: varName,
        type: 'input' as const,
        dataType: 'string' as const,
        required: true,
      }));

    if (newVariables.length > 0) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, ...newVariables],
      }));
    }
  };

  if (!node) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>配置节点: {node.type}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">基本设置</TabsTrigger>
            <TabsTrigger value="prompt">提示词</TabsTrigger>
            <TabsTrigger value="variables">变量</TabsTrigger>
            <TabsTrigger value="advanced">高级设置</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="label">节点标签</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="输入节点标签"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">AI模型</Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3">Claude 3</SelectItem>
                    <SelectItem value="custom">自定义</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="输入节点描述"
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="prompt" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="promptContent">提示词内容</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={extractVariablesFromPrompt}
                >
                  <Icons.zap className="h-4 w-4 mr-1" />
                  提取变量
                </Button>
              </div>
              <Textarea
                id="promptContent"
                value={formData.promptContent}
                onChange={(e) => setFormData(prev => ({ ...prev, promptContent: e.target.value }))}
                placeholder="输入提示词内容，使用 {{变量名}} 格式定义变量"
                rows={8}
                className="font-mono"
              />
              <p className="text-sm text-muted-foreground">
                使用 <code>{"{{变量名}}"}</code> 格式在提示词中定义变量
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">系统提示词</Label>
              <Textarea
                id="systemPrompt"
                value={formData.systemPrompt}
                onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
                placeholder="输入系统提示词（可选）"
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="variables" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>变量配置</Label>
              <Button variant="outline" size="sm" onClick={addVariable}>
                <Icons.plus className="h-4 w-4 mr-1" />
                添加变量
              </Button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {formData.variables.map((variable, index) => (
                <div key={variable.id} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{variable.type}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariable(index)}
                    >
                      <Icons.trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>变量名</Label>
                      <Input
                        value={variable.name}
                        onChange={(e) => updateVariable(index, { name: e.target.value })}
                        placeholder="变量名"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>数据类型</Label>
                      <Select
                        value={variable.dataType}
                        onValueChange={(value: any) => updateVariable(index, { dataType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">字符串</SelectItem>
                          <SelectItem value="number">数字</SelectItem>
                          <SelectItem value="boolean">布尔值</SelectItem>
                          <SelectItem value="array">数组</SelectItem>
                          <SelectItem value="object">对象</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={variable.required}
                      onCheckedChange={(checked) => updateVariable(index, { required: checked })}
                    />
                    <Label>必需</Label>
                  </div>
                  <div className="space-y-1">
                    <Label>描述</Label>
                    <Input
                      value={variable.description || ''}
                      onChange={(e) => updateVariable(index, { description: e.target.value })}
                      placeholder="变量描述"
                    />
                  </div>
                </div>
              ))}
              {formData.variables.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Icons.circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>暂无变量</p>
                  <p className="text-sm">点击"添加变量"或"提取变量"来创建变量</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">温度 ({formData.temperature})</Label>
                <input
                  type="range"
                  id="temperature"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTokens">最大令牌数</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={formData.maxTokens}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retryCount">重试次数</Label>
                <Input
                  id="retryCount"
                  type="number"
                  value={formData.retryCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, retryCount: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">超时时间 (毫秒)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={formData.timeout}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="outputFormat">输出格式</Label>
              <Select
                value={formData.outputFormat}
                onValueChange={(value) => setFormData(prev => ({ ...prev, outputFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">纯文本</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

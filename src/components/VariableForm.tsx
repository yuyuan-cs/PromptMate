import React, { useState, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { 
  Check, 
  ChevronsUpDown, 
  Variable, 
  Copy, 
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  generateVariableFormData, 
  applyVariableValues, 
  validateVariableValues,
  getVariableStats,
  VariableValues,
  COMMON_VARIABLES
} from '@/lib/variableUtils';
import { cn } from '@/lib/utils';
import { VariableDisplay } from './VariableHighlighter';

interface VariableFormProps {
  content: string;
  onVariableChange: (values: VariableValues) => void;
  onPreviewChange?: (previewContent: string) => void;
  className?: string;
}

export const VariableForm: React.FC<VariableFormProps> = ({
  content,
  onVariableChange,
  onPreviewChange,
  className = '',
}) => {
  const [variableValues, setVariableValues] = useState<VariableValues>({});
  const [showPreview, setShowPreview] = useState(true); // 默认显示预览
  const [previewContent, setPreviewContent] = useState('');
  const [openPopovers, setOpenPopovers] = useState<{ [key: string]: boolean }>({});
  
  // 生成变量表单数据
  const { variables, formFields } = generateVariableFormData(content);
  const stats = getVariableStats(content);
  
  // 当内容变化时，重新生成表单
  useEffect(() => {
    const newFormData = generateVariableFormData(content);
    const newValues: VariableValues = {};
    
    // 保留已填写的变量值
    newFormData.variables.forEach(variable => {
      if (variableValues[variable.name]) {
        newValues[variable.name] = variableValues[variable.name];
      }
    });
    
    setVariableValues(newValues);
    onVariableChange(newValues);
  }, [content]);
  
  // 当变量值变化时，更新预览
  useEffect(() => {
    if (showPreview) {
      const newPreview = applyVariableValues(content, variableValues);
      setPreviewContent(newPreview);
      onPreviewChange?.(newPreview);
    }
  }, [variableValues, content, showPreview, onPreviewChange]);

  // 自适应文本域高度（处理程序化赋值或初始化场景）
  useEffect(() => {
    // 下一帧执行，确保DOM已更新
    const raf = requestAnimationFrame(() => {
      formFields.forEach((field) => {
        const el = document.getElementById(field.name) as HTMLTextAreaElement | null;
        if (el && el.tagName.toLowerCase() === 'textarea') {
          el.style.height = 'auto';
          el.style.height = `${el.scrollHeight}px`;
        }
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [formFields, variableValues]);
  
  // 处理变量值变化
  const handleVariableChange = useCallback((name: string, value: string) => {
    const newValues = { ...variableValues, [name]: value };
    setVariableValues(newValues);
    onVariableChange(newValues);
  }, [variableValues, onVariableChange]);
  
  // 处理建议值选择
  const handleSuggestionSelect = useCallback((name: string, value: string) => {
    handleVariableChange(name, value);
    setOpenPopovers(prev => ({ ...prev, [name]: false }));
  }, [handleVariableChange]);
  
  // 清空所有变量值
  const clearAllVariables = useCallback(() => {
    setVariableValues({});
    onVariableChange({});
  }, [onVariableChange]);
  
  // 填充示例值
  const fillExampleValues = useCallback(() => {
    const exampleValues: VariableValues = {};
    formFields.forEach(field => {
      if (field.suggestions.length > 0) {
        exampleValues[field.name] = field.suggestions[0];
      }
    });
    setVariableValues(exampleValues);
    onVariableChange(exampleValues);
  }, [formFields, onVariableChange]);
  
  // 验证变量完整性
  const validation = validateVariableValues(content, variableValues);
  
  if (variables.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="p-6 text-center">
          <Variable className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            当前提示词中没有发现变量占位符
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            支持的格式：{'{variable}'}、{{variable}}、[variable]、$variable
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* 变量统计信息 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Variable className="h-4 w-4" />
            变量统计
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary">
              总计: {stats.totalVariables}
            </Badge>
            <Badge variant="secondary">
              唯一: {stats.uniqueVariables}
            </Badge>
            <Badge variant={validation.isValid ? "default" : "destructive"}>
              {validation.isValid ? "已完成" : `${validation.missingVariables.length} 个待填写`}
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      {/* 变量填写表单 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">变量填写</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fillExampleValues}
                className="h-7 px-2 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                填充示例
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllVariables}
                className="h-7 px-2 text-xs"
              >
                清空
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {formFields.map((field) => (
            <div key={field.name} className="flex items-center gap-3">
              {/* 变量标签 */}
              <div className="flex items-center gap-2 min-w-[80px]">
                <Label htmlFor={field.name} className="text-sm font-medium whitespace-nowrap">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              </div>
              
              {/* 输入框（自适应高度，不超出容器宽度） */}
              <Textarea
                id={field.name}
                value={variableValues[field.name] || ''}
                onChange={(e) => {
                  // 自适应高度
                  e.currentTarget.style.height = 'auto';
                  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                  handleVariableChange(field.name, e.target.value);
                }}
                onInput={(e) => {
                  const el = e.currentTarget as HTMLTextAreaElement;
                  el.style.height = 'auto';
                  el.style.height = `${el.scrollHeight}px`;
                }}
                placeholder={field.placeholder}
                rows={1}
                style={{ overflow: 'hidden', resize: 'none' }}
                className={cn(
                  "flex-1 w-full max-w-full transition-all duration-200",
                  // 根据填写状态改变输入框样式
                  variableValues[field.name]
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : "border-gray-300 hover:border-gray-400 focus:border-blue-500"
                )}
              />
              
              {/* 建议值选择器 */}
              {field.suggestions.length > 0 && (
                <Popover
                  open={openPopovers[field.name]}
                  onOpenChange={(open) => 
                    setOpenPopovers(prev => ({ ...prev, [field.name]: open }))
                  }
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-3 flex-shrink-0"
                    >
                      <ChevronsUpDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-0" align="end">
                    <Command>
                      <CommandInput placeholder="搜索建议..." />
                      <CommandList>
                        <CommandEmpty>没有找到建议</CommandEmpty>
                        <CommandGroup>
                          {field.suggestions.map((suggestion) => (
                            <CommandItem
                              key={suggestion}
                              onSelect={() => handleSuggestionSelect(field.name, suggestion)}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  variableValues[field.name] === suggestion
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {suggestion}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* 预览控制 */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="h-8 px-3 text-xs"
        >
          {showPreview ? <EyeOff className="h-2 w-2 mr-1" /> : <Eye className="h-2 w-2 mr-1" />}
          {showPreview ?  '隐藏预览':'显示预览'}
        </Button>
        
        {showPreview && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(previewContent);
            }}
            className="h-8 px-3"
          >
            <Copy className="h-4 w-4 mr-1" />
            复制预览内容
          </Button>
        )}
      </div>
      
      {/* 实时预览 */}
      {showPreview && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">实时预览</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-muted/30 rounded-md p-4 min-h-[100px] whitespace-pre-wrap">
              {previewContent ? (
                <div className="space-y-2">
                  {/* 变量高亮显示 */}
                  <div className="text-xs text-muted-foreground mb-2">
                    已填写的变量高亮显示：
                  </div>
                  <VariableDisplay
                    content={previewContent}
                    showVariableCount={false}
                    className="text-sm"
                  />
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">
                  填写变量后，这里将显示替换后的内容
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
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

  // Textarea 自适应高度（基于 refs，避免 query DOM）
  const textareasRef = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const mirrorsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    // 优先使用镜像元素的高度（能正确处理长连续字符换行）
    const name = el.id;
    const mirror = mirrorsRef.current[name];
    if (mirror) {
      // 强制至少一行高度
      const h = Math.max(mirror.scrollHeight, el.scrollHeight);
      el.style.height = 'auto';
      el.style.height = `${h}px`;
      return;
    }
    // 退化处理：无镜像时使用 scrollHeight
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  const setTextareaRef = useCallback(
    (name: string) => (el: HTMLTextAreaElement | null) => {
      textareasRef.current[name] = el;
      if (el) autoResize(el); // 初次挂载时调整
    },
    [autoResize]
  );

  const setMirrorRef = useCallback(
    (name: string) => (el: HTMLDivElement | null) => {
      mirrorsRef.current[name] = el;
      // 镜像出现/更新时尝试同步一次高度
      const ta = textareasRef.current[name];
      if (ta) autoResize(ta);
    },
    [autoResize]
  );

  // 当字段或变量值变化（程序化赋值）时，统一调整高度
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      Object.values(textareasRef.current).forEach((el) => autoResize(el));
    });
    return () => cancelAnimationFrame(raf);
  }, [formFields, variableValues, autoResize]);
  
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
            支持的格式：
            <code className="mx-1">{`{variable}`}</code>
            、
            <code className="mx-1">{`{{variable}}`}</code>
            、
            <code className="mx-1">{`[variable]`}</code>
            、
            <code className="mx-1">{`$variable`}</code>
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
              <div className="relative flex-1 w-full">
                {/* 隐藏的镜像元素用于测量高度（支持长连续字符换行） */}
                <div
                  aria-hidden
                  ref={setMirrorRef(field.name)}
                  className="invisible absolute z-[-1] top-0 left-0 w-full whitespace-pre-wrap break-all px-3 py-2 text-sm"
                >
                  {(variableValues[field.name] || '') + '\n'}
                </div>
                <Textarea
                  id={field.name}
                  ref={setTextareaRef(field.name)}
                  value={variableValues[field.name] || ''}
                  onChange={(e) => {
                    handleVariableChange(field.name, e.target.value);
                    const el = e.currentTarget;
                    requestAnimationFrame(() => autoResize(el));
                  }}
                  onInput={(e) => {
                    const el = e.currentTarget as HTMLTextAreaElement;
                    requestAnimationFrame(() => autoResize(el));
                  }}
                  placeholder={field.placeholder}
                  rows={1}
                  style={{ overflow: 'hidden', resize: 'none', boxSizing: 'border-box' }}
                  className={cn(
                    "w-full min-h-0 transition-all duration-200 whitespace-pre-wrap break-all",
                    // 根据填写状态改变输入框样式
                    variableValues[field.name]
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : "border-gray-300 hover:border-gray-400 focus:border-blue-500"
                  )}
                />
              </div>
              
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
            <div className="bg-muted/30 rounded-md p-4 min-h-[100px]">
              {previewContent ? (
                <div className="space-y-3">
                  {/* Markdown 渲染预览 */}
                  <div className="markdown-body">
                    <ReactMarkdown>{previewContent}</ReactMarkdown>
                  </div>
                  
                  {/* 变量高亮显示 */}
                  <div className="pt-2 border-t border-border/30">
                    <div className="text-xs text-muted-foreground mb-2">
                      变量替换情况：
                    </div>
                    <VariableDisplay
                      content={previewContent}
                      showVariableCount={false}
                      className="text-sm"
                    />
                  </div>
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
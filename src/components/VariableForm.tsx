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
  EyeOff,
  ChevronDown,
  History
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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [variableValues, setVariableValues] = useState<VariableValues>({});
  const [showPreview, setShowPreview] = useState(true); // 默认显示预览
  const [previewContent, setPreviewContent] = useState('');
  const [openPopovers, setOpenPopovers] = useState<{ [key: string]: boolean }>({});
  const [variableHistory, setVariableHistory] = useState<{ [key: string]: string[] }>({});
  
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
    
    // 保存到历史记录
    if (value.trim()) {
      setVariableHistory(prev => ({
        ...prev,
        [name]: [
          value,
          ...(prev[name] || []).filter(v => v !== value)
        ].slice(0, 10) // 最多保存10条历史记录
      }));
    }
  }, [variableValues, onVariableChange]);
  
  // 处理建议值选择
  const handleSuggestionSelect = useCallback((name: string, value: string) => {
    handleVariableChange(name, value);
    setOpenPopovers(prev => ({ ...prev, [name]: false }));
  }, [handleVariableChange]);
  
  // 处理历史记录选择
  const handleHistorySelect = useCallback((name: string, value: string) => {
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
            {t('variableForm.noVariables')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('variableForm.supportedFormats')}
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
    <div className={cn("space-y-4 max-h-full overflow-hidden flex flex-col w-full min-w-0", className)}>
      {/* 变量统计信息 */}
      <div className="flex-shrink-0">
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <Variable className="h-4 w-4" />
                {t('variableForm.variableStats')}
              </span>
              <Badge variant={validation.isValid ? "default" : "destructive"}>
                {validation.isValid ? t('variableForm.completed') : `${validation.missingVariables.length} ${t('variableForm.pending')}`}
              </Badge>
            </CardTitle>
          </CardHeader>
          {/* <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary">
                {t('variableForm.total')}: {stats.totalVariables}
              </Badge>
              <Badge variant="secondary">
                {t('variableForm.unique')}: {stats.uniqueVariables}
              </Badge>
              <Badge variant={validation.isValid ? "default" : "destructive"}>
                {validation.isValid ? t('variableForm.completed') : `${validation.missingVariables.length} ${t('variableForm.pending')}`}
              </Badge>
            </div>
          </CardContent> */}
        </Card>
      </div>
      {/* 变量填写表单 */}
      <div className="flex-1 min-h-0 overflow-hidden w-full">
        <Card className="h-full flex flex-col w-full">
          <CardHeader className="pt-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('variableForm.variableFill')}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fillExampleValues}
                  className="h-7 px-2 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {t('variableForm.fillExample')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllVariables}
                  className="h-7 px-2 text-xs"
                >
                  {t('variableForm.clear')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4 flex-1 overflow-y-auto w-full">
            {formFields.map((field) => (
              <div key={field.name} className="relative">
                {/* 输入框 */}
                <div className="relative flex items-center gap-1 border border-border/30 rounded-md px-3 py-1.5 hover:border-border/20 focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-200">
                  {/* 隐藏的镜像元素用于测量高度 */}
                  <div
                    aria-hidden
                    ref={setMirrorRef(field.name)}
                    className="invisible absolute z-[-1] top-0 left-0 w-full whitespace-pre-wrap break-all px-6 py-3 text-sm"
                  >
                    {(variableValues[field.name] || '') + '\n'}
                  </div>
                  
                  <div className="relative flex-1">
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
                      placeholder=" "
                      rows={1}
                      style={{ overflow: 'hidden', resize: 'none', boxSizing: 'border-box', maxHeight: '120px' }}
                      className={cn(
                        "w-full min-h-[44px] pt-6 pb-2 px-0 border-0 bg-transparent focus:ring-0 focus:outline-none transition-all duration-200 whitespace-pre-wrap break-all text-sm",
                        "peer"
                      )}
                    />
                    
                    {/* 浮动标签 */}
                    <Label
                      htmlFor={field.name}
                      className={cn(
                        "absolute left-0 transition-all duration-200 pointer-events-none text-muted-foreground",
                        "peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted-foreground",
                        "peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary",
                        variableValues[field.name] 
                          ? "top-1 text-xs text-primary" 
                          : "top-3 text-sm"
                      )}
                    >
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                  </div>
                  
                  {/* 统一的下拉选择按钮 */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Popover
                      open={openPopovers[field.name]}
                      onOpenChange={(open) => 
                        setOpenPopovers(prev => ({ ...prev, [field.name]: open }))
                      }
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          disabled={
                            (!variableHistory[field.name] || variableHistory[field.name].length === 0) &&
                            field.suggestions.length === 0
                          }
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-60 p-0" align="end">
                        <div className="p-2">
                          {/* 历史记录部分 */}
                          {variableHistory[field.name] && variableHistory[field.name].length > 0 && (
                            <>
                              <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground border-b">
                                <History className="h-3 w-3" />
                                {t('variableForm.historyRecords')}
                              </div>
                              <div className="max-h-32 overflow-y-auto">
                                {variableHistory[field.name].map((historyValue, index) => (
                                  <Button
                                    key={`history-${index}`}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-left h-auto p-2 text-sm"
                                    onClick={() => handleHistorySelect(field.name, historyValue)}
                                  >
                                    <div className="truncate">{historyValue}</div>
                                  </Button>
                                ))}
                              </div>
                            </>
                          )}

                          {/* 建议值部分 */}
                          {field.suggestions.length > 0 && (
                            <>
                              {/* 如果同时有历史记录和建议值，添加分隔线 */}
                              {variableHistory[field.name] && variableHistory[field.name].length > 0 && (
                                <Separator className="my-2" />
                              )}
                              
                              <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground border-b">
                                <ChevronsUpDown className="h-3 w-3" />
                                {t('variableForm.suggestions')}
                              </div>
                              <div className="max-h-32 overflow-y-auto">
                                {field.suggestions.map((suggestion) => (
                                  <Button
                                    key={`suggestion-${suggestion}`}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-left h-auto p-2 text-sm"
                                    onClick={() => handleSuggestionSelect(field.name, suggestion)}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 flex-shrink-0",
                                        variableValues[field.name] === suggestion
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="truncate">{suggestion}</div>
                                  </Button>
                                ))}
                              </div>
                            </>
                          )}

                          {/* 当没有历史记录和建议值时的提示 */}
                          {(!variableHistory[field.name] || variableHistory[field.name].length === 0) &&
                           field.suggestions.length === 0 && (
                            <div className="p-4 text-xs text-muted-foreground text-center">
                              {t('variableForm.noHistoryOrSuggestions')}
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      
      {/* 预览控制 */}
      <div className="flex-shrink-0 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="h-8 px-3 text-xs"
        >
          {showPreview ? <EyeOff className="h-2 w-2 mr-1" /> : <Eye className="h-2 w-2 mr-1" />}
          {showPreview ? t('variableForm.hidePreview') : t('variableForm.showPreview')}
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
            {t('variableForm.copyPreview')}
          </Button>
        )}
      </div>
      
      {/* 实时预览 */}
      {showPreview && (
        <div className="flex-shrink-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{t('variableForm.livePreview')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-muted/30 rounded-md p-4 min-h-[100px] max-h-[200px] overflow-y-auto">
                {previewContent ? (
                  <div className="space-y-3">
                    {/* Markdown 渲染预览 */}
                    <div className="markdown-body">
                      <ReactMarkdown>{previewContent}</ReactMarkdown>
                    </div>
                    
                    {/* 变量高亮显示 */}
                    <div className="pt-2 border-t border-border/30">
                      <div className="text-xs text-muted-foreground mb-2">
                        {t('variableForm.variableReplacement')}
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
                    {t('variableForm.fillVariablesHint')}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}; 
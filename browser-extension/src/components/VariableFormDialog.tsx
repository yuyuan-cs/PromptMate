import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  Variable, 
  VariableValues, 
  VariableInfo,
  generateVariableFormData,
  applyVariableValues, 
  validateVariables 
} from '../shared/variableUtils';
import { AlertCircle, Lightbulb, Copy, Send, Wand2, RotateCcw, Eye, EyeOff } from 'lucide-react';

interface VariableFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptTitle: string;
  promptContent: string;
  onCopy: (finalText: string, variableValues: VariableValues) => void;
  onInject: (finalText: string, variableValues: VariableValues) => void;
  variableHistory?: VariableValues[];
}

export const VariableFormDialog: React.FC<VariableFormDialogProps> = ({
  open,
  onOpenChange,
  promptTitle,
  promptContent,
  onCopy,
  onInject,
  variableHistory = []
}) => {
  const [values, setValues] = React.useState<VariableValues>({});
  const [errors, setErrors] = React.useState<string[]>([]);
  const [previewText, setPreviewText] = React.useState('');
  const [showMarkdown, setShowMarkdown] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  // 生成表单数据
  const { variables, formFields } = React.useMemo(() => 
    generateVariableFormData(promptContent), [promptContent]
  );

  // 初始化变量值
  React.useEffect(() => {
    if (open && formFields.length > 0) {
      const initialValues: VariableValues = {};
      formFields.forEach(field => {
        initialValues[field.name] = '';
      });
      setValues(initialValues);
      setErrors([]);
    }
  }, [open, formFields]);

  // 实时更新预览
  React.useEffect(() => {
    const preview = applyVariableValues(promptContent, values);
    setPreviewText(preview);
  }, [promptContent, values]);

  // 更新变量值
  const updateValue = React.useCallback((name: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除该字段的错误
    if (errors.includes(name)) {
      setErrors(prev => prev.filter(error => error !== name));
    }
  }, [errors]);

  // 验证表单
  const validateForm = React.useCallback(() => {
    const validation = validateVariables(formFields, values);
    setErrors(validation.missing);
    return validation.valid;
  }, [formFields, values]);

  // 应用历史值
  const applyHistoryValues = React.useCallback((historyValues: VariableValues) => {
    setValues(prev => ({
      ...prev,
      ...historyValues
    }));
    setErrors([]); // 清除错误
  }, []);

  // 自动填充示例值
  const fillExampleValues = React.useCallback(() => {
    const exampleValues: VariableValues = {};
    formFields.forEach(field => {
      if (field.suggestions.length > 0) {
        exampleValues[field.name] = field.suggestions[0];
      } else {
        // 根据字段名生成示例值
        exampleValues[field.name] = getExampleValue(field.name);
      }
    });
    setValues(exampleValues);
    setErrors([]);
  }, [formFields]);

  // 获取示例值
  const getExampleValue = (fieldName: string): string => {
    const examples: { [key: string]: string } = {
      'title': '如何提高工作效率',
      'name': '示例项目',
      'topic': '人工智能发展趋势',
      'content': '这是一个示例内容',
      'user': '张三',
      'company': '科技公司',
      'product': 'AI助手',
      'time': '2024年',
      'count': '1000'
    };
    
    const lowerName = fieldName.toLowerCase();
    return examples[lowerName] || `示例${fieldName}`;
  };

  // 复制最终文本
  const handleCopy = React.useCallback(async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        await onCopy(previewText, values);
        onOpenChange(false);
      } catch (error) {
        console.error('复制失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [validateForm, onCopy, previewText, values, onOpenChange]);

  // 注入最终文本
  const handleInject = React.useCallback(async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        await onInject(previewText, values);
        onOpenChange(false);
      } catch (error) {
        console.error('注入失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [validateForm, onInject, previewText, values, onOpenChange]);

  // 获取变量的历史建议
  const getVariableSuggestions = React.useCallback((variableName: string): string[] => {
    const suggestions = new Set<string>();
    variableHistory.forEach(record => {
      if (record[variableName] && record[variableName].trim()) {
        suggestions.add(record[variableName]);
      }
    });
    return Array.from(suggestions).slice(0, 5);
  }, [variableHistory]);

  // 清空所有值
  const clearAllValues = React.useCallback(() => {
    const clearedValues: VariableValues = {};
    formFields.forEach(field => {
      clearedValues[field.name] = '';
    });
    setValues(clearedValues);
    setErrors([]);
  }, [formFields]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-hidden flex flex-col bg-background/95 backdrop-blur-sm border-border/60">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Wand2 className="w-4 h-4 text-primary" />
            填写变量
          </DialogTitle>
          <DialogDescription className="text-sm">
            <span className="text-muted-foreground/80">{promptTitle}</span>
            <Badge variant="secondary" className="ml-2 text-xs">{formFields.length} 个变量</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4">
          {/* 变量表单区域 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                智能表单填写
              </h3>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fillExampleValues}
                  className="text-xs"
                >
                  <Wand2 className="w-3 h-3 mr-1" />
                  示例值
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllValues}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  清空
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-4">
                {formFields.map((field) => {
                  const suggestions = getVariableSuggestions(field.name);
                  const allSuggestions = [...new Set([...field.suggestions, ...suggestions])];
                  const hasError = errors.includes(field.name);
                  
                  return (
                    <div key={field.name} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label 
                          htmlFor={field.name} 
                          className={`text-sm font-medium ${hasError ? 'text-destructive' : ''}`}
                        >
                          {field.label}
                          {hasError && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        {hasError && (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      
                      {/* 输入框 */}
                      <Textarea
                        id={field.name}
                        value={values[field.name] || ''}
                        onChange={(e) => updateValue(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className={`min-h-[80px] resize-y ${hasError ? 'border-destructive focus:border-destructive' : ''}`}
                        rows={3}
                      />
                      
                      {/* 智能建议 */}
                      {allSuggestions.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">智能建议：</div>
                          <div className="flex flex-wrap gap-1">
                            {allSuggestions.slice(0, 6).map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 hover:bg-primary hover:text-primary-foreground"
                                onClick={() => updateValue(field.name, suggestion)}
                              >
                                {suggestion.length > 15 ? `${suggestion.slice(0, 15)}...` : suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* 历史记录快速应用 */}
            {variableHistory.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <h4 className="text-xs font-medium text-muted-foreground">历史记录快捷填充：</h4>
                <div className="space-y-1">
                  {variableHistory.slice(0, 2).map((history, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-auto py-2 hover:bg-primary/10"
                      onClick={() => applyHistoryValues(history)}
                    >
                      <div className="space-y-1 text-left">
                        {Object.entries(history).slice(0, 2).map(([name, value]) => (
                          <div key={name}>
                            <span className="font-medium text-primary">{name}:</span> {value.slice(0, 25)}{value.length > 25 ? '...' : ''}
                          </div>
                        ))}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 预览区域 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                实时预览
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMarkdown(!showMarkdown)}
                className="text-xs"
              >
                {showMarkdown ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                {showMarkdown ? '纯文本' : 'Markdown'}
              </Button>
            </div>

            <ScrollArea className="h-[350px]">
              <div className="space-y-3">
                {/* 预览内容 */}
                <div className="p-4 bg-muted/30 rounded-lg border min-h-[200px]">
                  {previewText ? (
                    showMarkdown ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {previewText}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-sm whitespace-pre-wrap font-mono">
                        {previewText}
                      </div>
                    )
                  ) : (
                    <div className="text-muted-foreground text-sm text-center py-8">
                      填写变量后这里会显示最终的提示词内容...
                    </div>
                  )}
                </div>

                {/* 统计信息 */}
                {previewText && (
                  <div className="text-xs text-muted-foreground text-center">
                    字符数：{previewText.length} | 已填写：{Object.values(values).filter(v => v.trim()).length}/{formFields.length}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* 错误提示 */}
            {errors.length > 0 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-2">
                  <AlertCircle className="w-4 h-4" />
                  请填写以下必需变量：
                </div>
                <div className="flex flex-wrap gap-1">
                  {errors.map(variableName => (
                    <Badge key={variableName} variant="destructive" className="text-xs">
                      {formFields.find(f => f.name === variableName)?.label || variableName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            取消
          </Button>
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={errors.length > 0 || isLoading || !previewText}
          >
            <Copy className="w-4 h-4 mr-1" />
            {isLoading ? '复制中...' : '复制最终文本'}
          </Button>
          <Button
            onClick={handleInject}
            disabled={errors.length > 0 || isLoading || !previewText}
          >
            <Send className="w-4 h-4 mr-1" />
            {isLoading ? '注入中...' : '注入到页面'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

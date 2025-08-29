import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AutoResizeTextarea } from '@components/ui/auto-resize-textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
  Variable, 
  VariableValues, 
  VariableInfo,
  generateVariableFormData,
  applyVariableValues, 
  validateVariables 
} from '../shared/variableUtils';
import { 
  AlertCircle, 
  ArrowLeft, 
  Copy, 
  Send, 
  MoreVertical, 
  Wand2, 
  RotateCcw, 
  Eye, 
  EyeOff,
  X 
} from 'lucide-react';

interface VariableFormViewProps {
  promptTitle: string;
  promptContent: string;
  onBack: () => void;
  onClose: () => void;
  onCopy: (finalText: string, variableValues: VariableValues) => void;
  onInject: (finalText: string, variableValues: VariableValues) => void;
  variableHistory?: VariableValues[];
  showBackButton?: boolean;
  showCloseButton?: boolean;
}

export const VariableFormView: React.FC<VariableFormViewProps> = ({
  promptTitle,
  promptContent,
  onBack,
  onClose,
  onCopy,
  onInject,
  variableHistory = [],
  showBackButton = true,
  showCloseButton = true
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
    if (formFields.length > 0) {
      const initialValues: VariableValues = {};
      formFields.forEach(field => {
        initialValues[field.name] = '';
      });
      setValues(initialValues);
      setErrors([]);
    }
  }, [formFields]);

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

  // 自动填充示例值
  const fillExampleValues = React.useCallback(() => {
    const exampleValues: VariableValues = {};
    formFields.forEach(field => {
      if (field.suggestions.length > 0) {
        exampleValues[field.name] = field.suggestions[0];
      } else {
        // 根据字段名生成示例值
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
        const lowerName = field.name.toLowerCase();
        exampleValues[field.name] = examples[lowerName] || `示例${field.name}`;
      }
    });
    setValues(exampleValues);
    setErrors([]);
  }, [formFields]);

  // 清空所有值
  const clearAllValues = React.useCallback(() => {
    const clearedValues: VariableValues = {};
    formFields.forEach(field => {
      clearedValues[field.name] = '';
    });
    setValues(clearedValues);
    setErrors([]);
  }, [formFields]);

  // 应用历史值
  const applyHistoryValues = React.useCallback((historyValues: VariableValues) => {
    setValues(prev => ({
      ...prev,
      ...historyValues
    }));
    setErrors([]);
  }, []);

  // 复制最终文本
  const handleCopy = React.useCallback(async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        await onCopy(previewText, values);
        onBack();
      } catch (error) {
        console.error('复制失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [validateForm, onCopy, previewText, values, onBack]);

  // 注入最终文本
  const handleInject = React.useCallback(async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        await onInject(previewText, values);
        onBack();
      } catch (error) {
        console.error('注入失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [validateForm, onInject, previewText, values, onBack]);

  // 获取变量的历史建议
  const getVariableSuggestions = React.useCallback((variableName: string): string[] => {
    const suggestions = new Set<string>();
    variableHistory.forEach(record => {
      if (record[variableName] && record[variableName].trim()) {
        suggestions.add(record[variableName]);
      }
    });
    return Array.from(suggestions).slice(0, 3);
  }, [variableHistory]);


  return (
    <div className="flex flex-col h-full bg-background animate-in slide-in-from-right-full duration-300">
      {/* 精简头部 - 单行设计 */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-border/30">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-7 w-7 p-0 hover:bg-muted/60"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <h2 className="font-medium text-sm truncate flex-1">
            {promptTitle}
          </h2>
          <Badge variant="secondary" className="text-xs shrink-0">
            {formFields.length}个变量
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          {/* 更多功能下拉菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={fillExampleValues}>
                <Wand2 className="w-3 h-3 mr-2" />
                示例值
              </DropdownMenuItem>
              <DropdownMenuItem onClick={clearAllValues}>
                <RotateCcw className="w-3 h-3 mr-2" />
                清空
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowMarkdown(!showMarkdown)}>
                {showMarkdown ? <EyeOff className="w-3 h-3 mr-2" /> : <Eye className="w-3 h-3 mr-2" />}
                {showMarkdown ? '纯文本' : 'Markdown'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 hover:bg-muted/60"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-4">
            {/* 变量表单区域 - 紧凑设计 */}
            <div className="space-y-3">
              {formFields.map((field) => {
                const suggestions = getVariableSuggestions(field.name);
                const allSuggestions = [...new Set([...field.suggestions, ...suggestions])];
                const hasError = errors.includes(field.name);
                
                return (
                  <div key={field.name} className="space-y-2">
                    <Label 
                      htmlFor={field.name} 
                      className={`text-xs font-medium ${hasError ? 'text-destructive' : ''}`}
                    >
                      {field.label}
                      {hasError && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    
                    {/* 使用自适应高度的文本框 */}
                    <AutoResizeTextarea
                      id={field.name}
                      value={values[field.name] || ''}
                      onChange={(e) => updateValue(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className={`text-sm ${hasError ? 'border-destructive focus:border-destructive' : ''}`}
                    />
                    
                    {/* 智能建议 - 紧凑显示 */}
                    {allSuggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {allSuggestions.slice(0, 3).map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-6 px-2 hover:bg-primary hover:text-primary-foreground"
                            onClick={() => updateValue(field.name, suggestion)}
                          >
                            {suggestion.length > 12 ? `${suggestion.slice(0, 12)}...` : suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 历史记录快速应用 - 紧凑显示 */}
            {variableHistory.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                <h4 className="text-xs font-medium text-muted-foreground">历史记录：</h4>
                <div className="space-y-1">
                  {variableHistory.slice(0, 1).map((history, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-auto py-1.5 hover:bg-primary/10"
                      onClick={() => applyHistoryValues(history)}
                    >
                      <div className="text-left truncate">
                        {Object.entries(history).slice(0, 1).map(([name, value]) => (
                          <span key={name}>
                            <span className="font-medium text-primary">{name}:</span> {value.slice(0, 20)}{value.length > 20 ? '...' : ''}
                          </span>
                        ))}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* 预览区域 - 紧凑显示 */}
            <div className="space-y-2 border-t pt-3">
              <h3 className="text-xs font-medium text-muted-foreground">预览</h3>
              <div className="p-3 bg-muted/30 rounded-lg border min-h-[120px] max-h-[200px] overflow-y-auto">
                {previewText ? (
                  showMarkdown ? (
                    <div className="prose prose-xs max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {previewText}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-xs whitespace-pre-wrap font-mono">
                      {previewText}
                    </div>
                  )
                ) : (
                  <div className="text-muted-foreground text-xs text-center py-4">
                    填写变量后显示预览...
                  </div>
                )}
              </div>
              
              {/* 统计信息 */}
              {previewText && (
                <div className="text-xs text-muted-foreground text-center">
                  {previewText.length}字符 | {Object.values(values).filter(v => v.trim()).length}/{formFields.length}已填写
                </div>
              )}
            </div>

            {/* 错误提示 */}
            {errors.length > 0 && (
              <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-destructive text-xs font-medium mb-1">
                  <AlertCircle className="w-3 h-3" />
                  请填写必需变量：
                </div>
                <div className="flex flex-wrap gap-1">
                  {errors.map(variableName => (
                    <Badge key={variableName} variant="destructive" className="text-xs h-5">
                      {formFields.find(f => f.name === variableName)?.label || variableName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 底部操作按钮 - 水平排列 */}
      <div className="flex-shrink-0 p-3 border-t bg-background/95 backdrop-blur-sm">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={errors.length > 0 || isLoading || !previewText}
            className="flex-1 h-8 text-sm"
          >
            <Copy className="w-3 h-3 mr-1" />
            {isLoading ? '复制中...' : '复制'}
          </Button>
          <Button
            onClick={handleInject}
            disabled={errors.length > 0 || isLoading || !previewText}
            className="flex-1 h-8 text-sm"
          >
            <Send className="w-3 h-3 mr-1" />
            {isLoading ? '注入中...' : '注入到页面'}
          </Button>
        </div>
      </div>
    </div>
  );
};

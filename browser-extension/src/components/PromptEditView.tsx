// 临时替换 PromptEditView - 用于测试
import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AutoResizeTextarea } from './ui/auto-resize-textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { ArrowLeft, X, Save, Plus, Wand2 } from 'lucide-react';
import { Prompt, Category } from '../shared/types';

interface PromptEditViewProps {
  prompt?: Prompt | null;
  categories: Category[];
  onBack: () => void;
  onClose: () => void;
  onSave: (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<Prompt>) => Promise<void>;
  showBackButton?: boolean;
  showCloseButton?: boolean;
}

export const PromptEditView: React.FC<PromptEditViewProps> = ({
  prompt,
  categories,
  onBack,
  onClose,
  onSave,
  onUpdate,
  showBackButton = true,
  showCloseButton = true,
}) => {
  console.log('PromptEditView rendering:', { prompt, categories: categories?.length });
  const isEditing = !!prompt;
  
  // 表单状态
  const [formData, setFormData] = React.useState({
    title: '',
    content: '',
    description: '',
    category: 'general',
    tags: [] as string[],
    isFavorite: false
  });
  
  const [tagInput, setTagInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOptimizing, setIsOptimizing] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  // 初始化表单数据
  React.useEffect(() => {
    if (prompt) {
      // 编辑模式 - 填充现有数据
      setFormData({
        title: prompt.title || '',
        content: prompt.content || '',
        description: prompt.description || '',
        category: prompt.category || 'general',
        tags: prompt.tags || [],
        isFavorite: prompt.isFavorite || false
      });
    } else {
      // 新建模式 - 重置表单
      setFormData({
        title: '',
        content: '',
        description: '',
        category: 'general',
        tags: [],
        isFavorite: false
      });
    }
    setTagInput('');
    setErrors([]);
  }, [prompt]);

  // 更新表单字段
  const updateField = React.useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除该字段的错误
    if (errors.includes(field)) {
      setErrors(prev => prev.filter(error => error !== field));
    }
  }, [errors]);

  // 添加标签
  const addTag = React.useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  }, [tagInput, formData.tags]);

  // 移除标签
  const removeTag = React.useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // 处理标签输入的回车键
  const handleTagKeyPress = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }, [addTag]);

  // 验证表单
  const validateForm = React.useCallback(() => {
    const newErrors: string[] = [];
    
    if (!formData.title.trim()) {
      newErrors.push('title');
    }
    
    if (!formData.content.trim()) {
      newErrors.push('content');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  }, [formData]);

  // AI优化提示词
  const handleOptimize = React.useCallback(async () => {
    if (!formData.content.trim()) {
      return;
    }

    setIsOptimizing(true);
    try {
      const aiSettings = localStorage.getItem('promptmate_ai_settings');
      if (!aiSettings) {
        alert('请先在设置中配置AI服务');
        return;
      }

      const settings = JSON.parse(aiSettings);
      if (!settings.apiKey) {
        alert('请先在设置中配置API密钥');
        return;
      }

      // 构建优化请求
      const optimizePrompt = `请优化以下提示词，使其更加清晰、具体和有效：

原始提示词：
${formData.content}

请返回优化后的提示词，保持原有的变量格式（如{{变量名}}）不变。`;

      let url = '';
      let headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      let body: any = {};

      switch (settings.provider) {
        case 'openai':
          url = settings.endpoint || 'https://api.openai.com/v1/chat/completions';
          headers['Authorization'] = `Bearer ${settings.apiKey}`;
          body = {
            model: settings.model || 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: optimizePrompt }],
            max_tokens: 1000
          };
          break;
        case 'anthropic':
          url = settings.endpoint || 'https://api.anthropic.com/v1/messages';
          headers['x-api-key'] = settings.apiKey;
          headers['anthropic-version'] = '2023-06-01';
          body = {
            model: settings.model || 'claude-3-haiku-20240307',
            max_tokens: 1000,
            messages: [{ role: 'user', content: optimizePrompt }]
          };
          break;
        default:
          alert('暂不支持该AI服务商');
          return;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      let optimizedContent = '';

      if (settings.provider === 'openai') {
        optimizedContent = data.choices?.[0]?.message?.content || '';
      } else if (settings.provider === 'anthropic') {
        optimizedContent = data.content?.[0]?.text || '';
      }

      if (optimizedContent) {
        updateField('content', optimizedContent.trim());
      }
    } catch (error) {
      console.error('AI优化失败:', error);
      alert('AI优化失败，请检查网络连接和API配置');
    } finally {
      setIsOptimizing(false);
    }
  }, [formData.content, updateField]);

  // 保存提示词
  const handleSave = React.useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const promptData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags,
        isFavorite: formData.isFavorite,
        usageCount: prompt?.usageCount || 0
      };

      if (isEditing && prompt && onUpdate) {
        await onUpdate(prompt.id, promptData);
      } else {
        await onSave(promptData);
      }
      
      onBack();
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, formData, isEditing, prompt, onUpdate, onSave, onBack]);


  return (
    <div className="flex flex-col h-full bg-background animate-in slide-in-from-right-full duration-300">
      {/* 紧凑导航头部 */}
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
            {isEditing ? '编辑提示词' : '新建提示词'}
          </h2>
        </div>
        
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

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-4">
            {/* 核心字段：标题和内容 */}
            <div className="space-y-3">
              {/* 标题 - 必填 */}
              <div className="space-y-2">
                <Label 
                  htmlFor="title" 
                  className={`text-xs font-medium ${errors.includes('title') ? 'text-destructive' : ''}`}
                >
                  标题
                  {errors.includes('title') && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="输入提示词标题..."
                  className={`h-8 text-sm ${errors.includes('title') ? 'border-destructive focus:border-destructive' : ''}`}
                />
              </div>

              {/* 提示词内容 - 必填 */}
              <div className="space-y-2">
                <Label 
                  htmlFor="content" 
                  className={`text-xs font-medium ${errors.includes('content') ? 'text-destructive' : ''}`}
                >
                  提示词内容
                  {errors.includes('content') && <span className="text-destructive ml-1">*</span>}
                </Label>
                <AutoResizeTextarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => updateField('content', e.target.value)}
                  placeholder="输入提示词内容..."
                  className={`text-sm ${errors.includes('content') ? 'border-destructive focus:border-destructive' : ''}`}
                />
                {/* 变量使用提示 - 精简为小字说明 */}
                <p className="text-xs text-muted-foreground/70">
                  使用 <code className="bg-muted px-1 rounded text-xs">{'{{变量名}}'}</code> 来定义可替换的变量
                </p>
              </div>
            </div>

            {/* 分类和收藏 - 整合到一行 */}
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="category" className="text-xs font-medium">
                  分类
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateField('category', value)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">通用</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pb-1">
                <Checkbox
                  id="favorite"
                  checked={formData.isFavorite}
                  onCheckedChange={(checked) => updateField('isFavorite', checked)}
                />
                <Label htmlFor="favorite" className="text-xs font-medium">
                  收藏
                </Label>
              </div>
            </div>

            {/* 次要字段：描述 */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-medium">
                描述 <span className="text-muted-foreground/60">(可选)</span>
              </Label>
              <AutoResizeTextarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="简要描述这个提示词的用途..."
                className="text-sm"
              />
            </div>

            {/* 标签管理 - 紧凑设计 */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-xs font-medium">
                标签 <span className="text-muted-foreground/60">(可选)</span>
              </Label>
              
              {/* 现有标签显示 */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs h-6 px-2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeTag(tag)}
                    >
                      #{tag} ×
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* 添加新标签 */}
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="输入标签名称..."
                  className="h-8 text-sm flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                  className="h-8 px-3"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* 错误提示 */}
            {errors.length > 0 && (
              <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="text-destructive text-xs font-medium">
                  请填写必需字段：
                  {errors.includes('title') && ' 标题'}
                  {errors.includes('content') && ' 提示词内容'}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 底部操作按钮 - AI优化 + 保存 */}
      <div className="flex-shrink-0 p-3 border-t bg-background/95 backdrop-blur-sm">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleOptimize}
            disabled={isOptimizing || isLoading || !formData.content.trim()}
            className="flex-1 h-9 text-sm font-medium"
          >
            {isOptimizing ? (
              <>
                <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full mr-2" />
                优化中...
              </>
            ) : (
              <>
                <Wand2 className="w-3 h-3 mr-2" />
                AI 优化
              </>
            )}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || isOptimizing}
            className="flex-1 h-9 text-sm font-medium"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full mr-2" />
                {isEditing ? '保存中...' : '创建中...'}
              </>
            ) : (
              <>
                {isEditing ? <Save className="w-3 h-3 mr-2" /> : <Plus className="w-3 h-3 mr-2" />}
                {isEditing ? '保存' : '创建'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
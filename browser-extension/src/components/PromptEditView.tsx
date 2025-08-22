import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AutoResizeTextarea } from './ui/auto-resize-textarea';
import { AIOptimizeButton } from './AIOptimizeButton';
import { Prompt, Category } from '../shared/types';

// Props for the component
export interface PromptEditViewProps {
  prompt?: Prompt | null;
  categories: Category[];
  onSave: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  onCancel: () => void;
  onAddNewCategory: (name: string) => Promise<Category | null>;
  showBackButton?: boolean;
  showCloseButton?: boolean;
}

// Main component
export const PromptEditView: React.FC<PromptEditViewProps> = ({
  prompt,
  categories,
  onSave,
  onCancel,
  onAddNewCategory,
  showBackButton = true,
  showCloseButton = true,
}) => {
  console.log('🚀 PromptEditView START - Props received:', {
    prompt: prompt ? { id: prompt.id, title: prompt.title } : null,
    categoriesCount: categories?.length,
    onSave: typeof onSave,
    onCancel: typeof onCancel,
    showBackButton,
    showCloseButton
  });
  
  // Add error boundary
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  React.useEffect(() => {
    console.log('🔧 PromptEditView useEffect - Setting up error handler');
    const handleError = (error: any) => {
      console.error('❌ PromptEditView window error:', error);
      setHasError(true);
      setErrorMessage(error.message || 'Unknown error');
    };

    window.addEventListener('error', handleError);
    return () => {
      console.log('🧹 PromptEditView cleanup - Removing error handler');
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (hasError) {
    console.log('💥 PromptEditView has error, showing error UI');
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 mb-2">❌ PromptEditView 错误</div>
          <p className="text-sm text-gray-600 mb-4">{errorMessage}</p>
          <button onClick={() => setHasError(false)} className="px-4 py-2 bg-blue-500 text-white rounded">
            重试
          </button>
        </div>
      </div>
    );
  }

  console.log('📝 PromptEditView - Determining edit mode');
  const isEditMode = !!prompt;
  console.log('📝 Edit mode:', isEditMode);

  // Form state
  console.log('🔧 PromptEditView - Initializing form state');
  const [title, setTitle] = React.useState(() => {
    console.log('📝 Initializing title:', prompt?.title || '');
    return prompt?.title || '';
  });
  const [content, setContent] = React.useState(() => {
    console.log('📝 Initializing content:', prompt?.content || '');
    return prompt?.content || '';
  });
  const [description, setDescription] = React.useState(() => {
    console.log('📝 Initializing description:', prompt?.description || '');
    return prompt?.description || '';
  });
  const [category, setCategory] = React.useState(() => {
    console.log('📝 Initializing category:', prompt?.category || '');
    return prompt?.category || '';
  });
  const [isFavorite, setIsFavorite] = React.useState(() => {
    console.log('📝 Initializing isFavorite:', prompt?.isFavorite || false);
    return prompt?.isFavorite || false;
  });
  const [tags, setTags] = React.useState<string[]>(() => {
    console.log('📝 Initializing tags:', prompt?.tags || []);
    return prompt?.tags || [];
  });
  const [tagInput, setTagInput] = React.useState('');

  // UI/Error state
  console.log('🔧 PromptEditView - Initializing UI state');
  const [isSaving, setIsSaving] = React.useState(false);
  const [isOptimizing, setIsOptimizing] = React.useState(false);
  const [errors, setErrors] = React.useState<{ title?: string; content?: string }>({});
  
  console.log('📊 PromptEditView - Current state:', {
    title,
    content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
    description: description.substring(0, 30) + (description.length > 30 ? '...' : ''),
    category,
    isFavorite,
    tagsCount: tags.length,
    isSaving,
    isOptimizing
  });

  const handleSave = async () => {
    console.log('💾 PromptEditView - handleSave called');
    try {
      // Simple validation
      const newErrors: { title?: string; content?: string } = {};
      if (!title.trim()) newErrors.title = '此项为必填项';
      if (!content.trim()) newErrors.content = '此项为必填项';

      if (Object.keys(newErrors).length > 0) {
        console.log('❌ PromptEditView - Validation errors:', newErrors);
        setErrors(newErrors);
        return;
      }

      console.log('✅ PromptEditView - Validation passed, saving...');
      setIsSaving(true);
      const promptData = {
        ...(isEditMode ? { id: prompt.id } : {}),
        title,
        content,
        description,
        category: category || '',
        isFavorite,
        tags,
      };

      console.log('📤 PromptEditView - Calling onSave with data:', promptData);
      await onSave(promptData);
      console.log('✅ PromptEditView - Save completed successfully');
    } catch (error) {
      console.error('❌ PromptEditView - Save failed:', error);
      setErrors({ title: '保存失败，请重试' });
    } finally {
      console.log('🔄 PromptEditView - Resetting saving state');
      setIsSaving(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAiOptimize = (optimizedContent: string) => {
    setContent(optimizedContent);
    if (!title.trim() && optimizedContent.trim()) {
      // Auto-generate title from first line of optimized content
      const firstLine = optimizedContent.split('\n')[0].trim();
      if (firstLine.length > 0 && firstLine.length <= 50) {
        setTitle(firstLine);
      }
    }
  };

  // Draft protection
  const hasUnsavedChanges = React.useMemo(() => {
    if (!isEditMode) {
      return title || content || description || category || isFavorite || tags.length > 0;
    }
    return (
      title !== prompt?.title ||
      content !== prompt?.content ||
      description !== prompt?.description ||
      category !== prompt?.category ||
      isFavorite !== prompt?.isFavorite ||
      JSON.stringify(tags.sort()) !== JSON.stringify(prompt?.tags?.sort() || [])
    );
  }, [prompt, title, content, description, category, isFavorite, tags, isEditMode]);

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('您有未保存的更改，确定要离开吗？')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  // 简化版本以避免白屏
  console.log('🎨 PromptEditView - Starting render process');
  console.log('📋 PromptEditView - Render data check:', {
    hasTitle: !!title,
    hasContent: !!content,
    categoriesAvailable: categories?.length || 0,
    isEditMode,
    isSaving,
    hasErrors: Object.keys(errors).length > 0
  });
  
  try {
    console.log('🎨 PromptEditView - Entering try block for render');
    
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Simple Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEditMode ? '编辑提示词' : '新建提示词'}
          </h2>
        </div>

        {/* Simple Form */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1">标题 *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入标题"
              className="w-full"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">内容 *</label>
            <AutoResizeTextarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入内容"
              className="w-full font-mono text-sm"
              minRows={5}
            />
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">描述</label>
            <AutoResizeTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入描述（可选）"
              className="w-full"
              minRows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">分类</label>
            <select
              value={category || ''}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">无分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="mr-2"
              />
              添加到收藏
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">标签</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center gap-1">
                  {tag}
                  <button 
                    onClick={() => removeTag(tag)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="输入标签后按回车添加"
              className="w-full"
            />
          </div>
        </div>

        {/* Simple Footer */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <AIOptimizeButton
              content={content}
              title={title}
              onOptimize={handleAiOptimize}
              disabled={isOptimizing}
              variant="inline"
            />
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? '保存中...' : (isEditMode ? '保存更改' : '创建')}
            </Button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ PromptEditView render error:', error);
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 mb-2">❌ 渲染错误</div>
          <p className="text-sm text-gray-600 mb-4">{error.message}</p>
          <Button onClick={handleCancel}>返回</Button>
        </div>
      </div>
    );
  }
};

/* 提示词 */

import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Combobox } from './ui/combobox';
import { Prompt, Category } from '../shared/types';
import { useTranslation } from '../i18n';
import { AIOptimizeIconButton } from './AIOptimizeIconButton';
import { useSidebarAlert } from '../hooks/useSidebarAlert';

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
  const { t } = useTranslation();
  const { showConfirm, AlertComponent } = useSidebarAlert();
  console.log('🎯 PromptEditView rendered with:', { prompt: prompt?.title || 'new' });
  
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
          <p className="text-xs text-gray-600 mb-4">{errorMessage}</p>
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
  const [errors, setErrors] = React.useState<{ title?: string; content?: string }>({});
  
  console.log('📊 PromptEditView - Current state:', {
    title,
    content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
    description: description.substring(0, 30) + (description.length > 30 ? '...' : ''),
    category,
    isFavorite,
    tagsCount: tags.length,
    isSaving
  });

  const handleSave = async () => {
    console.log('💾 PromptEditView - handleSave called');
    try {
      // Simple validation
      const newErrors: { title?: string; content?: string } = {};
      if (!title.trim()) newErrors.title = t('validation_required');
      if (!content.trim()) newErrors.content = t('validation_required');

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
      setErrors({ title: t('prompts_saveFailed') });
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

  // 处理创建新分类
  const handleCreateCategory = async (name: string) => {
    try {
      const newCategory = await onAddNewCategory(name);
      if (newCategory) {
        setCategory(newCategory.id);
      }
    } catch (error) {
      console.error('创建分类失败:', error);
    }
  };

  // 准备分类选项
  const categoryOptions = React.useMemo(() => [
    { value: '', label: t('prompts_noCategory') },
    ...categories.map(cat => ({ value: cat.id, label: cat.name }))
  ], [categories, t]);

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

  const handleCancel = async () => {
    if (hasUnsavedChanges) {
      let confirmed = false;
      await new Promise<void>((resolve) => {
        showConfirm(
          t('prompts_unsavedChanges'),
          '',
          () => { confirmed = true; resolve(); },
          () => { confirmed = false; resolve(); },
          t('common_confirm') || '确定',
          t('common_cancel') || '取消'
        );
      });
      if (confirmed) {
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
        {/* Alert component for custom dialogs */}
        <AlertComponent />
        {/* Simple Header */}
        <div className="p-4 border-b">
          <h3 className="text-xs font-semibold">
            {isEditMode ? t('prompts_editPrompt') : t('prompts_newPrompt')}
          </h3>
        </div>

        {/* Simple Form */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-xs font-medium mb-1">{t('prompts_title')} *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('prompts_titlePlaceholder')}
              className="w-full  text-xs placeholder:text-muted-foreground/60"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">{t('prompts_content')} *</label>
            <div className="relative">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('prompts_contentPlaceholder')}
                className="w-full font-mono text-xs min-h-[120px] pr-12"
              />
              <div className="absolute bottom-2 right-2">
                <AIOptimizeIconButton
                  content={content}
                  title={title}
                  onOptimize={(optimizedContent) => setContent(optimizedContent)}
                  onOpenSettings={() => {
                    // 这里可以添加打开AI设置的逻辑
                    console.log('Open AI settings');
                  }}
                />
              </div>
            </div>
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">{t('prompts_description')}</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('prompts_descriptionPlaceholder')}
              className="w-full min-h-[60px] text-xs placeholder:text-muted-foreground/60"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">{t('prompts_category')}</label>
            <Combobox
              options={categoryOptions}
              value={category}
              onValueChange={setCategory}
              onCreateNew={handleCreateCategory}
              placeholder={t('prompts_selectCategory')}
              searchPlaceholder="搜索分类..."
              createLabel="创建分类"
              className="w-full text-xs placeholder:text-muted-foreground/60"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="mr-2 text-xs placeholder:text-muted-foreground/60"
              />
              {t('prompts_addToFavorites')}
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">{t('prompts_tags')}</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-1">
                  {tag}
                </span>
              ))}
            </div>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={t('prompts_tagsPlaceholder')}
              className="w-full text-xs placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Simple Footer */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
            >
              {t('prompts_cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? t('prompts_saving') : (isEditMode ? t('prompts_save') : t('prompts_create'))}
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
          <div className="text-red-500 mb-2">❌ {t('prompts_renderError')}</div>
          <p className="text-xs text-gray-600 mb-4">{error.message}</p>
          <Button onClick={handleCancel}>{t('prompts_back')}</Button>
        </div>
      </div>
    );
  }
};

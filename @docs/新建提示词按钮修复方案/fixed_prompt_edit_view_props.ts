// PromptEditView.tsx - 修复 props 接口
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
  console.log('📝 PromptEditView rendering:', { 
    prompt: prompt?.id || 'new', 
    categories: categories?.length,
    isEditing: !!prompt 
  });

  const isEditing = !!prompt;
  
  // 初始化表单数据
  React.useEffect(() => {
    console.log('🔄 Initializing form data for:', isEditing ? 'edit' : 'new');
    
    if (prompt) {
      // 编辑模式 - 填充现有数据
      console.log('📋 Loading existing prompt data:', prompt);
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
      console.log('🆕 Initializing new prompt form');
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

  // 保存提示词 - 添加更多调试信息
  const handleSave = React.useCallback(async () => {
    console.log('💾 handleSave called:', { isEditing, formData });
    
    if (!validateForm()) {
      console.warn('⚠️ Form validation failed');
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

      console.log('📤 Submitting prompt data:', promptData);

      if (isEditing && prompt && onUpdate) {
        console.log('🔄 Updating existing prompt:', prompt.id);
        await onUpdate(prompt.id, promptData);
      } else {
        console.log('🆕 Creating new prompt');
        await onSave(promptData);
      }
      
      console.log('✅ Save operation completed successfully');
      onBack();
    } catch (error) {
      console.error('❌ Save operation failed:', error);
      // 不要在这里抛出错误，让父组件处理
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, formData, isEditing, prompt, onUpdate, onSave, onBack]);

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

  // 更新表单字段
  const updateField = React.useCallback((field: string, value: any) => {
    console.log('📝 Updating field:', field, '=', value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除该字段的错误
    if (errors.includes(field)) {
      setErrors(prev => prev.filter(error => error !== field));
    }
  }, [errors]);

  // 验证表单
  const validateForm = React.useCallback(() => {
    const newErrors: string[] = [];
    
    if (!formData.title.trim()) {
      newErrors.push('title');
      console.warn('⚠️ Title is required');
    }
    
    if (!formData.content.trim()) {
      newErrors.push('content');
      console.warn('⚠️ Content is required');
    }
    
    setErrors(newErrors);
    console.log('🔍 Form validation result:', newErrors.length === 0 ? 'PASS' : 'FAIL', newErrors);
    return newErrors.length === 0;
  }, [formData]);

  // 如果 categories 为空或未定义，显示加载状态
  if (!categories || categories.length === 0) {
    console.warn('⚠️ Categories not loaded yet');
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-8 text-muted-foreground">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p>加载分类数据...</p>
        </div>
      </div>
    );
  }

  // 渲染组件
  return (
    <div className="flex flex-col h-full bg-background animate-in slide-in-from-right-full duration-300">
      {/* ... 其余组件内容保持不变 ... */}
    </div>
  );
};
import { useState, useCallback, useRef, useEffect } from "react";
import { usePrompts } from "@/hooks/usePrompts";
import { useToast } from "@/hooks/use-toast";
import { PromptImage, Prompt } from "@/types";
import { generateId } from "@/lib/data";

export interface PromptFormData {
  title: string;
  content: string;
  category: string;
  tags: string;
  images: PromptImage[];
  isFavorite?: boolean;
}

export interface PromptFormOptions {
  mode: 'create' | 'edit';
  initialData?: Partial<PromptFormData>;
  prompt?: Prompt | null; // 编辑模式时的原始提示词
  defaultCategory?: string; // 默认分类
  onSuccess?: () => void;
  onCancel?: () => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export interface PromptFormState extends PromptFormData {
  hasChanges: boolean;
  selectedImageIndex: number | null;
  imageCaption: string;
  autoSaveStatus: "idle" | "saving" | "saved";
  isSubmitting: boolean;
}

/**
 * 统一的提示词表单管理Hook
 * 支持新建和编辑两种模式，提供统一的状态管理和业务逻辑
 */
export const usePromptForm = (options: PromptFormOptions) => {
  const { 
    mode, 
    initialData, 
    prompt, 
    defaultCategory,
    onSuccess, 
    onCancel, 
    autoSave = false, 
    autoSaveDelay = 2000 
  } = options;

  const { addPrompt, updatePrompt, categories, allTags, activeCategory } = usePrompts();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取初始表单数据
  const getInitialFormData = (): PromptFormData => {
    if (mode === 'edit' && prompt) {
      return {
        title: prompt.title,
        content: prompt.content,
        category: prompt.category,
        tags: prompt.tags.join(", "),
        images: prompt.images || [],
        isFavorite: prompt.isFavorite,
      };
    }
    
    // 修复默认分类逻辑：defaultCategory 应该有最高优先级
    // 只有在没有指定 defaultCategory 时才使用 activeCategory
    const getDefaultCategory = () => {
      if (initialData?.category) return initialData.category;
      if (defaultCategory) return defaultCategory;
      if (activeCategory) return activeCategory;
      if (categories[0]?.id) return categories[0].id;
      return "general";
    };
    
    return {
      title: initialData?.title || "",
      content: initialData?.content || "",
      category: getDefaultCategory(),
      tags: initialData?.tags || "",
      images: initialData?.images || [],
      isFavorite: initialData?.isFavorite || false,
    };
  };

  // 表单状态
  const [state, setState] = useState<PromptFormState>(() => ({
    ...getInitialFormData(),
    hasChanges: false,
    selectedImageIndex: null,
    imageCaption: "",
    autoSaveStatus: "idle",
    isSubmitting: false,
  }));

  // 监听 prompt 变化，重新初始化表单数据
  useEffect(() => {
    if (mode === 'edit' && prompt) {
      const newFormData = {
        title: prompt.title,
        content: prompt.content,
        category: prompt.category,
        tags: prompt.tags.join(", "),
        images: prompt.images || [],
        isFavorite: prompt.isFavorite,
      };
      
      setState(prev => ({
        ...prev,
        ...newFormData,
        hasChanges: false,
        selectedImageIndex: null,
        imageCaption: "",
        isSubmitting: false,
      }));
    }
  }, [prompt?.id, mode]); // 使用 prompt.id 作为依赖，确保在切换不同提示词时重新初始化

  // 监听 defaultCategory 变化，重新初始化表单数据（创建模式）
  useEffect(() => {
    if (mode === 'create' && defaultCategory) {
      console.log('🔄 defaultCategory 变化，重新初始化表单:', {
        oldCategory: state.category,
        newDefaultCategory: defaultCategory,
        activeCategory
      });
      
      setState(prev => ({
        ...prev,
        category: defaultCategory,
        hasChanges: false,
      }));
    }
  }, [defaultCategory, mode]);

  // 检查是否有变更
  const checkHasChanges = useCallback((newState: PromptFormState): boolean => {
    if (mode === 'create') {
      return newState.title.trim() !== "" || newState.content.trim() !== "";
    }
    
    if (mode === 'edit' && prompt) {
      return (
        newState.title !== prompt.title ||
        newState.content !== prompt.content ||
        newState.category !== prompt.category ||
        newState.tags !== prompt.tags.join(", ") ||
        JSON.stringify(newState.images) !== JSON.stringify(prompt.images || [])
      );
    }
    
    return false;
  }, [mode, prompt]);

  // 更新单个字段
  const updateField = useCallback(<K extends keyof PromptFormData>(
    field: K,
    value: PromptFormData[K]
  ) => {
    setState(prev => {
      const newState = { ...prev, [field]: value };
      const hasChanges = checkHasChanges(newState);
      return { ...newState, hasChanges };
    });
  }, [checkHasChanges]);

  // 批量更新状态
  const updateState = useCallback((updates: Partial<PromptFormState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      const hasChanges = updates.hasChanges !== undefined ? updates.hasChanges : checkHasChanges(newState);
      return { ...newState, hasChanges };
    });
  }, [checkHasChanges]);

  // 重置表单
  const resetForm = useCallback(() => {
    const initialFormData = getInitialFormData();
    setState({
      ...initialFormData,
      hasChanges: false,
      selectedImageIndex: null,
      imageCaption: "",
      autoSaveStatus: "idle",
      isSubmitting: false,
    });
  }, [mode, prompt, initialData, defaultCategory, activeCategory, categories]);

  // 表单验证
  const validate = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!state.title.trim()) {
      errors.push("标题不能为空");
    }
    
    if (!state.content.trim()) {
      errors.push("内容不能为空");
    }
    
    if (state.title.length > 200) {
      errors.push("标题长度不能超过200个字符");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [state.title, state.content]);

  // 处理图片上传
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      // 文件大小检查
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: `图片 "${file.name}" 大小不能超过10MB`,
          variant: "destructive",
        });
        return;
      }

      // 文件类型检查
      if (!file.type.startsWith('image/')) {
        toast({
          title: "文件类型错误",
          description: `文件 "${file.name}" 不是有效的图片格式`,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: PromptImage = {
          id: generateId(),
          data: e.target?.result as string,
          caption: "",
        };
        
        setState(prev => {
          const newImages = [...prev.images, newImage];
          const newState = { ...prev, images: newImages };
          return { ...newState, hasChanges: checkHasChanges(newState) };
        });
      };
      reader.readAsDataURL(file);
    });

    // 清空文件输入
    event.target.value = '';
  }, [toast, checkHasChanges]);

  // 删除图片
  const deleteImage = useCallback((index: number) => {
    setState(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      const newState = { 
        ...prev, 
        images: newImages,
        selectedImageIndex: prev.selectedImageIndex === index ? null : prev.selectedImageIndex,
        imageCaption: prev.selectedImageIndex === index ? "" : prev.imageCaption,
      };
      return { ...newState, hasChanges: checkHasChanges(newState) };
    });
  }, [checkHasChanges]);

  // 选择图片
  const selectImage = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      selectedImageIndex: index,
      imageCaption: prev.images[index]?.caption || "",
    }));
  }, []);

  // 更新图片说明
  const updateImageCaption = useCallback((index: number, caption: string) => {
    setState(prev => {
      const newImages = [...prev.images];
      newImages[index] = { ...newImages[index], caption };
      const newState = { ...prev, images: newImages };
      return { ...newState, hasChanges: checkHasChanges(newState) };
    });
  }, [checkHasChanges]);

  // 添加标签
  const addTag = useCallback((tag: string) => {
    const currentTags = state.tags.split(/[,，;；]/).map(t => t.trim()).filter(Boolean);
    
    if (!currentTags.includes(tag)) {
      const newTagsString = currentTags.length > 0 
        ? `${state.tags.trim()}${state.tags.trim().endsWith(',') ? ' ' : ', '}${tag}` 
        : tag;
      
      updateField('tags', newTagsString);
    }
  }, [state.tags, updateField]);

  // 提交表单
  const submitForm = useCallback(async (): Promise<boolean> => {
    const validation = validate();
    
    if (!validation.isValid) {
      toast({
        title: "表单验证失败",
        description: validation.errors.join(", "),
        variant: "destructive",
      });
      return false;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const tags = state.tags.split(/[,，;；]/).map(tag => tag.trim()).filter(Boolean);
      
      if (mode === 'create') {
        addPrompt({
          title: state.title,
          content: state.content,
          category: state.category,
          tags,
          isFavorite: state.isFavorite || false,
          images: state.images.length > 0 ? state.images : undefined,
          version: 1,
        });
        
        toast({
          title: "创建成功",
          description: "新的提示词已创建",
          variant: "success",
        });
      } else if (mode === 'edit' && prompt) {
        updatePrompt(prompt.id, {
          title: state.title,
          content: state.content,
          category: state.category,
          tags,
          images: state.images.length > 0 ? state.images : undefined,
        });
        
        toast({
          title: "更新成功",
          description: "提示词已更新",
          variant: "success",
        });
      }

      resetForm();
      onSuccess?.();
      return true;
    } catch (error) {
      console.error('提交表单失败:', error);
      toast({
        title: "操作失败",
        description: "请稍后重试",
        variant: "destructive",
      });
      return false;
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [validate, state, mode, prompt, addPrompt, updatePrompt, toast, resetForm, onSuccess]);

  // 取消操作
  const cancelForm = useCallback(() => {
    resetForm();
    onCancel?.();
  }, [resetForm, onCancel]);

  // 触发文件选择
  const triggerImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    // 状态
    state,
    
    // 验证
    validation: validate(),
    
    // 引用
    fileInputRef,
    
    // 数据
    categories,
    allTags,
    
    // 操作函数
    updateField,
    updateState,
    resetForm,
    submitForm,
    cancelForm,
    
    // 图片相关
    handleImageUpload,
    deleteImage,
    selectImage,
    updateImageCaption,
    triggerImageUpload,
    
    // 标签相关
    addTag,
    
    // 工具函数
    checkHasChanges,
  };
};

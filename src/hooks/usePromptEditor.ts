import { useState, useEffect, useCallback, useRef } from "react";
import { usePrompts } from "@/hooks/usePrompts";
import { useToast } from "@/hooks/use-toast";
import { PromptImage, Prompt } from "@/types";
import { generateId } from "@/lib/data";

// 防抖函数
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export interface PromptEditorOptions {
  prompt?: Prompt | null;
  onSave?: (prompt: Prompt) => void;
  onDelete?: (promptId: string) => void;
  onCancel?: () => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
  enableSwitchConfirmation?: boolean;
}

export interface PromptEditorState {
  title: string;
  content: string;
  category: string;
  tags: string;
  images: PromptImage[];
  isFavorite: boolean;
  hasChanges: boolean;
  isEditing: boolean;
  selectedImageIndex: number | null;
  imageCaption: string;
  autoSaveStatus: "idle" | "saving" | "saved";
}

export const usePromptEditor = (options: PromptEditorOptions = {}) => {
  const { toast } = useToast();
  const {
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    categories,
    allTags,
    copyPromptContent,
    setCheckUnsavedChangesCallback,
    prompts,
    setSelectedPrompt,
  } = usePrompts();

  const {
    prompt = null,
    onSave,
    onDelete,
    onCancel,
    autoSave = true,
    autoSaveDelay = 2000,
    enableSwitchConfirmation = true,
  } = options;

  // 编辑状态
  const [state, setState] = useState<PromptEditorState>({
    title: prompt?.title || "",
    content: prompt?.content || "",
    category: prompt?.category || "general",
    tags: prompt?.tags.join(", ") || "",
    images: prompt?.images || [],
    isFavorite: prompt?.isFavorite || false,
    hasChanges: false,
    isEditing: false,
    selectedImageIndex: null,
    imageCaption: "",
    autoSaveStatus: "idle",
  });

  // 内部状态管理
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [switchConfirmOpen, setSwitchConfirmOpen] = useState(false);
  const [pendingPromptId, setPendingPromptId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAutoSavingRef = useRef<boolean>(false);
  const previousSelectedPromptIdRef = useRef<string | null>(null);

  // 更新单个字段
  const updateField = useCallback(<K extends keyof PromptEditorState>(
    field: K,
    value: PromptEditorState[K]
  ) => {
    setState(prev => {
      const newState = { ...prev, [field]: value };
      
      // 检查是否有变更
      if (prompt && field !== 'hasChanges' && field !== 'autoSaveStatus') {
        const hasChanges = 
          newState.title !== prompt.title ||
          newState.content !== prompt.content ||
          newState.category !== prompt.category ||
          newState.tags !== prompt.tags.join(", ") ||
          JSON.stringify(newState.images) !== JSON.stringify(prompt.images || []);
        
        newState.hasChanges = hasChanges;
      }
      
      return newState;
    });
  }, [prompt]);

  // 批量更新状态
  const updateState = useCallback((updates: Partial<PromptEditorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // 重置表单
  const resetForm = useCallback(() => {
    if (prompt) {
      setState({
        title: prompt.title,
        content: prompt.content,
        category: prompt.category,
        tags: prompt.tags.join(", "),
        images: prompt.images || [],
        isFavorite: prompt.isFavorite,
        hasChanges: false,
        isEditing: false,
        selectedImageIndex: null,
        imageCaption: "",
        autoSaveStatus: "idle",
      });
    }
  }, [prompt]);

  // 保存更改
  const saveChanges = useCallback(async () => {
    if (!prompt || !state.hasChanges) return false;
    
    try {
      updateState({ autoSaveStatus: "saving" });
      
      const payload = {
        title: state.title,
        content: state.content,
        category: state.category,
        tags: state.tags.split(/[,，;；]/).map((tag) => tag.trim()).filter(Boolean),
        images: state.images
      };
      
      isAutoSavingRef.current = true;
      updatePrompt(prompt.id, payload);
      
      updateState({ 
        hasChanges: false,
        autoSaveStatus: "saved" 
      });
      
      // 1秒后隐藏已保存状态
      setTimeout(() => {
        updateState({ autoSaveStatus: "idle" });
        isAutoSavingRef.current = false;
      }, 1000);

      if (onSave) {
        onSave({ ...prompt, ...payload });
      }
      
      return true;
    } catch (error) {
      updateState({ autoSaveStatus: "idle" });
      isAutoSavingRef.current = false;
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive",
      });
      return false;
    }
  }, [prompt, state, updatePrompt, updateState, onSave, toast]);

  // 创建防抖版本的保存函数
  const debouncedSaveChanges = useCallback(
    debounce(saveChanges, autoSaveDelay),
    [saveChanges, autoSaveDelay]
  );

  // 手动保存
  const handleManualSave = useCallback(async () => {
    const success = await saveChanges();
    if (success) {
      toast({
        title: "保存成功",
        description: "更改已保存",
        variant: "success",
        duration: 1000,
      });
    }
  }, [saveChanges, toast]);

  // 图片上传
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "图片大小不能超过5MB",
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
      
      updateField('images', [...state.images, newImage]);
    };
    reader.readAsDataURL(file);
  }, [state.images, updateField, toast]);

  // 删除图片
  const deleteImage = useCallback((index: number) => {
    const newImages = state.images.filter((_, i) => i !== index);
    updateField('images', newImages);
    if (state.selectedImageIndex === index) {
      updateField('selectedImageIndex', null);
      updateField('imageCaption', '');
    }
  }, [state.images, state.selectedImageIndex, updateField]);

  // 选择图片
  const selectImage = useCallback((index: number) => {
    updateField('selectedImageIndex', index);
    updateField('imageCaption', state.images[index]?.caption || '');
  }, [state.images, updateField]);

  // 更新图片说明
  const updateImageCaption = useCallback((index: number, caption: string) => {
    const newImages = [...state.images];
    newImages[index] = { ...newImages[index], caption };
    updateField('images', newImages);
  }, [state.images, updateField]);

  // 切换收藏状态
  const handleToggleFavorite = useCallback(() => {
    if (prompt) {
      toggleFavorite(prompt.id);
      updateField('isFavorite', !state.isFavorite);
    }
  }, [prompt, state.isFavorite, toggleFavorite, updateField]);

  // 删除提示词
  const handleDelete = useCallback(() => {
    if (prompt) {
      deletePrompt(prompt.id);
      if (onDelete) {
        onDelete(prompt.id);
      }
      setDeleteDialogOpen(false);
    }
  }, [prompt, deletePrompt, onDelete]);

  // 复制内容
  const handleCopy = useCallback(() => {
    if (prompt) {
      copyPromptContent(prompt.id);
    }
  }, [prompt, copyPromptContent]);

  // 处理AI优化结果
  const handleAIOptimize = useCallback((optimizedContent: string) => {
    // 解析AI返回的内容，尝试分离标题和内容
    const lines = optimizedContent.split('\n');
    let newTitle = state.title;
    let newContent = optimizedContent;

    // 简单的启发式方法来检测是否包含标题
    if (lines.length > 1 && lines[0].length < 100 && !lines[0].includes('\n')) {
      // 如果第一行较短且不包含换行，可能是标题
      const firstLine = lines[0].trim();
      if (firstLine && !firstLine.startsWith('#') && !firstLine.includes('：') && !firstLine.includes(':')) {
        newTitle = firstLine;
        newContent = lines.slice(1).join('\n').trim();
      }
    }

    // 更新表单字段
    updateField('title', newTitle);
    updateField('content', newContent);
  }, [state.title, updateField]);

  // 开始编辑
  const startEditing = useCallback(() => {
    updateField('isEditing', true);
  }, [updateField]);

  // 取消编辑
  const cancelEditing = useCallback(() => {
    if (state.hasChanges) {
      setSwitchConfirmOpen(true);
    } else {
      updateField('isEditing', false);
      resetForm();
    }
  }, [state.hasChanges, updateField, resetForm]);

  // 确认取消编辑
  const confirmCancelEditing = useCallback(() => {
    setSwitchConfirmOpen(false);
    updateField('isEditing', false);
    resetForm();
    if (onCancel) {
      onCancel();
    }
  }, [updateField, resetForm, onCancel]);

  // 确认切换提示词
  const confirmSwitchPrompt = useCallback(() => {
    setSwitchConfirmOpen(false);
    
    if (pendingPromptId !== null) {
      isAutoSavingRef.current = false;
      if (pendingPromptId === 'null') {
        setSelectedPrompt(null);
      } else {
        const promptToSelect = prompts.find(p => p.id === pendingPromptId);
        setSelectedPrompt(promptToSelect || null);
      }
      setPendingPromptId(null);
    }
  }, [pendingPromptId, setSelectedPrompt, prompts]);

  // 保存并切换提示词
  const saveAndSwitchPrompt = useCallback(() => {
    if (prompt && state.hasChanges) {
      // 手动保存当前更改
      handleManualSave();
      
      // 短暂延迟后确认切换，确保保存完成
      setTimeout(() => {
        setSwitchConfirmOpen(false);
        
        // 执行切换
        if (pendingPromptId !== null) {
          isAutoSavingRef.current = false;
          if (pendingPromptId === 'null') {
            setSelectedPrompt(null);
          } else {
            const promptToSelect = prompts.find(p => p.id === pendingPromptId);
            setSelectedPrompt(promptToSelect || null);
          }
          setPendingPromptId(null);
        }
      }, 100);
    } else {
      // 如果没有更改，直接切换
      confirmSwitchPrompt();
    }
  }, [prompt, state.hasChanges, handleManualSave, pendingPromptId, setSelectedPrompt, prompts, confirmSwitchPrompt]);

  // 自动保存效果
  useEffect(() => {
    if (autoSave && state.hasChanges && state.isEditing && prompt) {
      debouncedSaveChanges();
    }
  }, [autoSave, state.hasChanges, state.isEditing, prompt, debouncedSaveChanges]);

  // 当提示词变化时重置表单
  useEffect(() => {
    if (prompt && !isAutoSavingRef.current) {
      resetForm();
    }
  }, [prompt, resetForm]);

  // 注册切换提示词前的检查回调函数
  useEffect(() => {
    if (!enableSwitchConfirmation || !setCheckUnsavedChangesCallback) return;

    const checkUnsavedChanges = (newPromptId: string | null) => {
      // 如果当前没有选定的提示词或没有未保存的更改，可以安全切换
      if (!prompt || !state.hasChanges || isAutoSavingRef.current) {
        return true;
      }

      // 如果是同一个提示词，可以安全切换
      if (prompt.id === newPromptId) {
        return true;
      }
      
      // 存储要切换的ID并显示确认对话框
      setPendingPromptId(newPromptId);
      setSwitchConfirmOpen(true);
      
      // 返回false表示不能立即切换，需要用户确认
      return false;
    };
    
    // 注册回调函数
    setCheckUnsavedChangesCallback(checkUnsavedChanges);
    
    // 清理函数
    return () => {
      // 注册一个永远返回true的函数，以便在组件卸载时不再检查未保存的更改
      setCheckUnsavedChangesCallback(() => true);
    };
  }, [prompt, state.hasChanges, setCheckUnsavedChangesCallback, enableSwitchConfirmation]);

  return {
    // 状态
    state,
    
    // 对话框状态
    deleteDialogOpen,
    setDeleteDialogOpen,
    switchConfirmOpen,
    setSwitchConfirmOpen,
    pendingPromptId,
    
    // 引用
    fileInputRef,
    
    // 数据
    categories,
    allTags,
    
    // 操作函数
    updateField,
    updateState,
    resetForm,
    saveChanges,
    handleManualSave,
    handleImageUpload,
    deleteImage,
    selectImage,
    updateImageCaption,
    handleToggleFavorite,
    handleDelete,
    handleCopy,
    startEditing,
    cancelEditing,
    confirmCancelEditing,
    confirmSwitchPrompt,
    saveAndSwitchPrompt,
    handleAIOptimize,
  };
};

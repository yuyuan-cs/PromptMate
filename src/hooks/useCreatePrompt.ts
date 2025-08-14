import { useState, useCallback } from "react";
import { usePrompts } from "@/hooks/usePrompts";
import { useToast } from "@/hooks/use-toast";
import { PromptImage } from "@/types";

export interface CreatePromptFormData {
  title: string;
  content: string;
  category: string;
  tags: string;
  images: PromptImage[];
}

export interface CreatePromptOptions {
  defaultCategory?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * 新建提示词功能的自定义 Hook
 * 提供统一的状态管理和业务逻辑
 */
export const useCreatePrompt = (options: CreatePromptOptions = {}) => {
  const { addPrompt, activeCategory, categories } = usePrompts();
  const { toast } = useToast();

  // 表单状态
  const [formData, setFormData] = useState<CreatePromptFormData>({
    title: "",
    content: "",
    category: options.defaultCategory || activeCategory || categories[0]?.id || "general",
    tags: "",
    images: [],
  });

  // 图片相关状态
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageCaption, setImageCaption] = useState("");

  // 重置表单
  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      content: "",
      category: options.defaultCategory || activeCategory || categories[0]?.id || "general",
      tags: "",
      images: [],
    });
    setSelectedImageIndex(null);
    setImageCaption("");
  }, [options.defaultCategory, activeCategory, categories]);

  // 更新表单字段
  const updateField = useCallback(<K extends keyof CreatePromptFormData>(
    field: K,
    value: CreatePromptFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // 处理图片上传
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            const newImage: PromptImage = {
              id: Date.now() + Math.random(),
              url: result,
              caption: "",
              filename: file.name,
              size: file.size
            };
            
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, newImage]
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // 清空 input 值，允许重复选择同一文件
    e.target.value = '';
  }, []);

  // 删除图片
  const deleteImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null);
      setImageCaption("");
    } else if (selectedImageIndex !== null && selectedImageIndex > index) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  }, [selectedImageIndex]);

  // 选择图片进行编辑
  const selectImage = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setImageCaption(formData.images[index].caption || "");
  }, [formData.images]);

  // 更新图片说明
  const updateImageCaption = useCallback((index: number, caption: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, caption } : img
      )
    }));
  }, []);

  // 添加标签
  const addTag = useCallback((tag: string) => {
    const currentTags = formData.tags.split(/[,，;；]/).map(t => t.trim()).filter(Boolean);
    
    if (!currentTags.includes(tag)) {
      const newTagsString = currentTags.length > 0 
        ? `${formData.tags.trim()}${formData.tags.trim().endsWith(',') ? ' ' : ', '}${tag}` 
        : tag;
      
      updateField('tags', newTagsString);
    }
  }, [formData.tags, updateField]);

  // 创建提示词
  const createPrompt = useCallback(() => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "错误",
        description: "标题和内容不能为空",
        variant: "destructive",
      });
      return false;
    }

    const tags = formData.tags.split(/[,，;；]/).map(tag => tag.trim()).filter(Boolean);

    addPrompt({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags,
      isFavorite: false,
      images: formData.images.length > 0 ? formData.images : undefined,
    });

    toast({
      title: "创建成功",
      description: "新的提示词已创建",
      variant: "success",
    });

    resetForm();
    options.onSuccess?.();
    return true;
  }, [formData, addPrompt, toast, resetForm, options]);

  // 取消创建
  const cancelCreate = useCallback(() => {
    resetForm();
    options.onCancel?.();
  }, [resetForm, options]);

  // 处理AI优化结果
  const handleAIOptimize = useCallback((optimizedContent: string) => {
    // 解析AI返回的内容，尝试分离标题和内容
    const lines = optimizedContent.split('\n');
    let newTitle = formData.title;
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
  }, [formData.title, updateField]);

  return {
    // 表单数据
    formData,
    updateField,
    resetForm,
    
    // 图片相关
    selectedImageIndex,
    imageCaption,
    setImageCaption,
    handleImageUpload,
    deleteImage,
    selectImage,
    updateImageCaption,
    
    // 标签相关
    addTag,
    
    // 操作方法
    createPrompt,
    cancelCreate,
    handleAIOptimize,
    
    // 验证状态
    isValid: formData.title.trim() && formData.content.trim(),
  };
};

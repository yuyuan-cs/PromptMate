import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { PromptImage } from "@/types";
import { generateId } from "@/lib/data";

export interface ImageManagerOptions {
  maxFileSize?: number; // 字节，默认10MB
  allowedTypes?: string[]; // MIME类型，默认所有图片类型
  maxImages?: number; // 最大图片数量，默认无限制
  onImagesChange?: (images: PromptImage[]) => void;
}

/**
 * 独立的图片管理Hook
 * 提供统一的图片上传、删除、预览、拖拽等功能
 */
export const useImageManager = (
  initialImages: PromptImage[] = [],
  options: ImageManagerOptions = {}
) => {
  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/*'],
    maxImages,
    onImagesChange,
  } = options;

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<PromptImage[]>(initialImages);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageCaption, setImageCaption] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // 更新图片列表并触发回调
  const updateImages = useCallback((newImages: PromptImage[]) => {
    setImages(newImages);
    onImagesChange?.(newImages);
  }, [onImagesChange]);

  // 验证文件
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // 检查文件大小
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `文件 "${file.name}" 大小超过限制 (${Math.round(maxFileSize / 1024 / 1024)}MB)`
      };
    }

    // 检查文件类型
    const isValidType = allowedTypes.some(type => {
      if (type === 'image/*') {
        return file.type.startsWith('image/');
      }
      return file.type === type;
    });

    if (!isValidType) {
      return {
        valid: false,
        error: `文件 "${file.name}" 格式不支持`
      };
    }

    // 检查图片数量限制
    if (maxImages && images.length >= maxImages) {
      return {
        valid: false,
        error: `最多只能上传 ${maxImages} 张图片`
      };
    }

    return { valid: true };
  }, [maxFileSize, allowedTypes, maxImages, images.length]);

  // 处理文件列表
  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        toast({
          title: "文件上传失败",
          description: validation.error,
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
        
        setImages(prev => {
          const newImages = [...prev, newImage];
          onImagesChange?.(newImages);
          return newImages;
        });
      };
      
      reader.onerror = () => {
        toast({
          title: "文件读取失败",
          description: `无法读取文件 "${file.name}"`,
          variant: "destructive",
        });
      };
      
      reader.readAsDataURL(file);
    });
  }, [validateFile, toast, onImagesChange]);

  // 处理文件输入上传
  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // 清空输入，允许重复选择同一文件
    event.target.value = '';
  }, [processFiles]);

  // 处理拖拽上传
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      processFiles(imageFiles);
    }
  }, [processFiles]);

  // 处理粘贴上传
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length > 0) {
      const files = imageItems.map(item => item.getAsFile()).filter(Boolean) as File[];
      processFiles(files);
    }
  }, [processFiles]);

  // 删除图片
  const deleteImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    updateImages(newImages);
    
    // 更新选中状态
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null);
      setImageCaption("");
    } else if (selectedImageIndex !== null && selectedImageIndex > index) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  }, [images, selectedImageIndex, updateImages]);

  // 选择图片
  const selectImage = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setImageCaption(images[index]?.caption || "");
  }, [images]);

  // 取消选择图片
  const deselectImage = useCallback(() => {
    setSelectedImageIndex(null);
    setImageCaption("");
  }, []);

  // 更新图片说明
  const updateImageCaption = useCallback((index: number, caption: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], caption };
    updateImages(newImages);
    
    // 如果是当前选中的图片，同时更新输入框
    if (selectedImageIndex === index) {
      setImageCaption(caption);
    }
  }, [images, selectedImageIndex, updateImages]);

  // 应用当前编辑的图片说明
  const applyImageCaption = useCallback(() => {
    if (selectedImageIndex !== null) {
      updateImageCaption(selectedImageIndex, imageCaption);
      deselectImage();
    }
  }, [selectedImageIndex, imageCaption, updateImageCaption, deselectImage]);

  // 移动图片位置
  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    updateImages(newImages);
    
    // 更新选中状态
    if (selectedImageIndex === fromIndex) {
      setSelectedImageIndex(toIndex);
    } else if (selectedImageIndex !== null) {
      if (fromIndex < selectedImageIndex && toIndex >= selectedImageIndex) {
        setSelectedImageIndex(selectedImageIndex - 1);
      } else if (fromIndex > selectedImageIndex && toIndex <= selectedImageIndex) {
        setSelectedImageIndex(selectedImageIndex + 1);
      }
    }
  }, [images, selectedImageIndex, updateImages]);

  // 触发文件选择器
  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 清空所有图片
  const clearAllImages = useCallback(() => {
    updateImages([]);
    setSelectedImageIndex(null);
    setImageCaption("");
  }, [updateImages]);

  // 批量设置图片
  const setAllImages = useCallback((newImages: PromptImage[]) => {
    updateImages(newImages);
    setSelectedImageIndex(null);
    setImageCaption("");
  }, [updateImages]);

  return {
    // 状态
    images,
    selectedImageIndex,
    imageCaption,
    isDragging,
    
    // 引用
    fileInputRef,
    
    // 设置函数
    setImageCaption,
    setAllImages,
    
    // 操作函数
    handleFileInput,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePaste,
    deleteImage,
    selectImage,
    deselectImage,
    updateImageCaption,
    applyImageCaption,
    moveImage,
    triggerFileSelect,
    clearAllImages,
    
    // 工具函数
    validateFile,
    processFiles,
    
    // 计算属性
    hasImages: images.length > 0,
    canAddMore: !maxImages || images.length < maxImages,
    selectedImage: selectedImageIndex !== null ? images[selectedImageIndex] : null,
  };
};

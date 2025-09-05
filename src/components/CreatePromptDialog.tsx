import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePromptForm, PromptFormOptions } from "@/hooks/usePromptForm";
import { useImageManager } from "@/hooks/useImageManager";
import { useAIOptimization } from "@/services/aiOptimization";
import { PromptFormFields } from "./PromptFormFields";
import { AISettingsDialog } from "./AISettingsDialog";
import { useTranslation } from "react-i18next";
import { Prompt } from "@/types";

interface CreatePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'create' | 'edit';
  prompt?: Prompt | null; // 编辑模式时的提示词
  options?: Partial<PromptFormOptions>;
  showMarkdownPreview?: boolean;
  showImageUpload?: boolean;
  showTagSuggestions?: boolean;
}

/**
 * 统一的提示词对话框组件
 * 支持新建和编辑模式，封装了完整的表单功能、验证、图片上传等
 */
export const CreatePromptDialog: React.FC<CreatePromptDialogProps> = ({
  open,
  onOpenChange,
  mode = 'create',
  prompt = null,
  options = {},
  showMarkdownPreview = true,
  showImageUpload = true,
  showTagSuggestions = true,
}) => {
  const { t } = useTranslation();
  const [showAISettings, setShowAISettings] = React.useState(false);
  
  // 表单管理
  const {
    state,
    categories,
    allTags,
    updateField,
    submitForm,
    cancelForm,
    fileInputRef,
    validation,
    handleImageUpload,
    deleteImage,
    selectImage,
    updateImageCaption,
    triggerImageUpload,
  } = usePromptForm({
    mode,
    prompt,
    ...options,
    onSuccess: () => {
      onOpenChange(false);
      options.onSuccess?.();
    },
    onCancel: () => {
      onOpenChange(false);
      options.onCancel?.();
    },
  });

  // 图片管理
  const {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePaste,
  } = useImageManager(state.images, {
    onImagesChange: (images) => updateField('images', images),
  });

  // AI优化
  const { optimizeContent } = useAIOptimization();

  const handleAIOptimize = async (optimizedContent: string) => {
    const result = await optimizeContent(optimizedContent, state.title);
    if (result) {
      updateField('title', result.title);
      updateField('content', result.content);
    }
  };

  const handleSubmit = async () => {
    const success = await submitForm();
    if (success) {
      // 提交成功，对话框会通过 onSuccess 回调关闭
    }
  };

  const handleCancel = () => {
    cancelForm();
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      cancelForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' 
              ? t('common.edit_prompt.title') 
              : t('common.create_prompt.title')
            }
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 max-h-[calc(90vh-130px)] overflow-auto">
          <div className="py-4 px-1">
            <PromptFormFields
              state={state}
              categories={categories}
              allTags={allTags}
              onFieldChange={updateField}
              onImageUpload={triggerImageUpload}
              onImageUploadChange={handleImageUpload}
              onImageSelect={selectImage}
              onImageDelete={deleteImage}
              onImageCaptionUpdate={updateImageCaption}
              fileInputRef={fileInputRef}
              onAIOptimize={handleAIOptimize}
              onOpenAISettings={() => setShowAISettings(true)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onPaste={handlePaste}
              isDragging={isDragging}
              showFields={{
                title: true,
                content: true,
                category: true,
                tags: showTagSuggestions,
                images: showImageUpload,
                markdownPreview: showMarkdownPreview,
                aiOptimization: true,
              }}
              mode={mode}
            />
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!validation.isValid || state.isSubmitting}
          >
            {state.isSubmitting 
              ? t('common.saving') 
              : mode === 'edit' 
                ? t('common.save') 
                : t('common.create')
            }
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* AI设置对话框 */}
      <AISettingsDialog
        open={showAISettings}
        onOpenChange={setShowAISettings}
      />
    </Dialog>
  );
};

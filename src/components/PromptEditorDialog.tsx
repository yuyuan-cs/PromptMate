import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Star, Save, Trash, X, Copy, Edit, Check } from "lucide-react";
import { usePromptEditor, PromptEditorOptions } from "@/hooks/usePromptEditor";
import { PromptEditForm } from "./PromptEditForm";
import { PromptPreview } from "./PromptPreview";
import { Prompt } from "@/types";

interface PromptEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: Prompt | null;
  options?: Omit<PromptEditorOptions, 'prompt'>;
}

export const PromptEditorDialog: React.FC<PromptEditorDialogProps> = ({
  open,
  onOpenChange,
  prompt,
  options = {},
}) => {
  const {
    state,
    deleteDialogOpen,
    setDeleteDialogOpen,
    switchConfirmOpen,
    setSwitchConfirmOpen,
    pendingPromptId,
    fileInputRef,
    categories,
    allTags,
    updateField,
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
  } = usePromptEditor({ 
    prompt, 
    onCancel: () => onOpenChange(false),
    enableSwitchConfirmation: false, // 对话框模式下不需要切换确认
    ...options 
  });

  if (!prompt) {
    return null;
  }

  // 自动保存状态显示
  const getAutoSaveStatusText = () => {
    switch (state.autoSaveStatus) {
      case "saving":
        return "保存中...";
      case "saved":
        return "已保存";
      default:
        return "";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {state.isEditing ? "编辑提示词" : prompt.title}
                {state.hasChanges && (
                  <span className="text-xs text-muted-foreground">
                    • {getAutoSaveStatusText() || "有未保存的更改"}
                  </span>
                )}
              </DialogTitle>
              
              {/* 操作按钮 */}
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  {/* 收藏按钮 */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleFavorite}
                        className={state.isFavorite ? "text-yellow-500" : ""}
                      >
                        <Star className={`h-4 w-4 ${state.isFavorite ? "fill-current" : ""}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {state.isFavorite ? "取消收藏" : "收藏"}
                    </TooltipContent>
                  </Tooltip>

                  {/* 复制按钮 */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>复制内容</TooltipContent>
                  </Tooltip>

                  {/* 编辑/保存按钮 */}
                  {state.isEditing ? (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleManualSave}
                            disabled={!state.hasChanges}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>保存更改</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>取消编辑</TooltipContent>
                      </Tooltip>
                    </>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={startEditing}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>编辑</TooltipContent>
                    </Tooltip>
                  )}

                  {/* 删除按钮 */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteDialogOpen(true)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>删除</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </DialogHeader>

          {/* 内容区域 */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 pt-0">
                {state.isEditing ? (
                  <PromptEditForm
                    state={state}
                    categories={categories}
                    allTags={allTags}
                    onFieldChange={updateField}
                    onImageUpload={() => fileInputRef.current?.click()}
                    onImageSelect={selectImage}
                    onImageDelete={deleteImage}
                    onImageCaptionUpdate={updateImageCaption}
                    fileInputRef={fileInputRef}
                  />
                ) : (
                  <PromptPreview prompt={prompt} />
                )}
              </div>
            </ScrollArea>
          </div>

          {/* 隐藏的文件输入 */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </DialogContent>
      </Dialog>

      {/* 确认删除对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除此提示词，该操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 取消编辑确认对话框 */}
      <AlertDialog open={switchConfirmOpen} onOpenChange={setSwitchConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>未保存的更改</AlertDialogTitle>
            <AlertDialogDescription>
              您有未保存的更改。要保存更改并继续，还是放弃更改？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-0">继续编辑</AlertDialogCancel>
            <Button variant="outline" onClick={confirmCancelEditing}>
              放弃更改
            </Button>
            <Button onClick={handleManualSave}>
              保存更改
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

import React, { useRef, useState } from "react";
import { usePrompts } from "@/hooks/usePrompts";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Star, Copy, Edit, Trash, Save, X, Eye } from "lucide-react";
import { Icons } from "@/components/ui/icons";
import { usePromptEditor } from "@/hooks/usePromptEditor";
import { PromptEditForm } from "./PromptEditForm";
import { PromptPreview } from "./PromptPreview";
import { AISettingsDialog } from "./AISettingsDialog";
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

export function PromptEditorModular() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { selectedPrompt } = usePrompts();
  const [showAISettings, setShowAISettings] = useState(false);

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
    handleAIOptimize,
  } = usePromptEditor({ 
    prompt: selectedPrompt,
    autoSave: true,
    autoSaveDelay: 2000,
    enableSwitchConfirmation: true,
  });

  // 选中新提示词时，默认进入预览模式
  React.useEffect(() => {
    if (selectedPrompt && state.isEditing) {
      // 如果当前在编辑模式，切换到预览模式
      if (!state.hasChanges) {
        cancelEditing();
      }
    }
  }, [selectedPrompt?.id]); // 只在选中不同提示词时触发

  if (!selectedPrompt) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg mb-2">选择一个提示词开始编辑</p>
          <p className="text-sm">从左侧列表中选择要编辑的提示词</p>
        </div>
      </div>
    );
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
    <div className="flex-1 flex flex-col h-full">
      {/* 头部工具栏 */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold truncate">
              {selectedPrompt.title}
            </h2>
            {state.hasChanges && (
              <span className="text-xs text-muted-foreground">
                • {getAutoSaveStatusText() || "有未保存的更改"}
              </span>
            )}
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              {/* 编辑/预览切换按钮 */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={state.isEditing ? cancelEditing : startEditing}
                  >
                    {state.isEditing ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <Edit className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {state.isEditing ? "切换到预览模式" : "切换到编辑模式"}
                </TooltipContent>
              </Tooltip>

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

              {/* 手动保存按钮 */}
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
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            {state.isEditing ? (
              <PromptEditForm
                state={state}
                categories={categories}
                allTags={allTags}
                onFieldChange={updateField}
                onImageUpload={() => fileInputRef.current?.click()}
                onImageUploadChange={handleImageUpload}
                onImageSelect={selectImage}
                onImageDelete={deleteImage}
                onImageCaptionUpdate={updateImageCaption}
                fileInputRef={fileInputRef}
                onAIOptimize={handleAIOptimize}
                onOpenSettings={() => setShowAISettings(true)}
              />
            ) : (
              <PromptPreview
                prompt={selectedPrompt}
              />
            )}
          </div>
        </ScrollArea>
      </div>



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
              您有未保存的更改。要保存更改并继续，放弃更改，还是留在当前编辑页面？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-0">留在当前页面</AlertDialogCancel>
            <Button variant="outline" onClick={confirmSwitchPrompt}>
              放弃更改
            </Button>
            <Button onClick={saveAndSwitchPrompt}>
              保存并继续
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI设置对话框 */}
      <AISettingsDialog
        open={showAISettings}
        onOpenChange={setShowAISettings}
      />
    </div>
  );
}

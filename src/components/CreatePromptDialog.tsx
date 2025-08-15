import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { Plus, X } from "lucide-react";
import { useCreatePrompt, CreatePromptOptions } from "@/hooks/useCreatePrompt";
import { usePrompts } from "@/hooks/usePrompts";
import { AIOptimizeButton } from "./AIOptimizeButton";
import { AISettingsDialog } from "./AISettingsDialog";
import ReactMarkdown from "react-markdown";

interface CreatePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options?: CreatePromptOptions;
  showMarkdownPreview?: boolean;
  showImageUpload?: boolean;
  showTagSuggestions?: boolean;
}

/**
 * 可复用的新建提示词对话框组件
 * 封装了完整的新建提示词功能，包括表单、验证、图片上传等
 */
export const CreatePromptDialog: React.FC<CreatePromptDialogProps> = ({
  open,
  onOpenChange,
  options = {},
  showMarkdownPreview = true,
  showImageUpload = true,
  showTagSuggestions = true,
}) => {
  const { categories, allTags } = usePrompts();
  const [showAISettings, setShowAISettings] = React.useState(false);
  
  const {
    formData,
    updateField,
    selectedImageIndex,
    imageCaption,
    setImageCaption,
    handleImageUpload,
    deleteImage,
    selectImage,
    updateImageCaption,
    addTag,
    createPrompt,
    cancelCreate,
    handleAIOptimize,
    isValid,
  } = useCreatePrompt({
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

  const handleSubmit = () => {
    if (createPrompt()) {
      // 创建成功，对话框会通过 onSuccess 回调关闭
    }
  };

  const handleCancel = () => {
    cancelCreate();
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      cancelCreate();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>新建提示词</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 max-h-[calc(90vh-130px)] overflow-auto">
          <div className="space-y-4 py-4 px-1">
            {/* 标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input 
                id="title" 
                placeholder="请输入提示词标题" 
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>

            {/* 内容 */}
            <div className="space-y-2">
              <Label htmlFor="content">内容</Label>
              <div className="relative">
                <Textarea 
                  id="content" 
                  placeholder="请输入提示词内容" 
                  className="h-[200px] pr-12"
                  value={formData.content}
                  onChange={(e) => updateField('content', e.target.value)}
                />
                {/* AI优化按钮 - 内联模式，位于输入框右下角 */}
                <div className="absolute bottom-2 right-2 z-10">
                  <AIOptimizeButton
                    content={formData.content}
                    title={formData.title}
                    onOptimize={handleAIOptimize}
                    onOpenSettings={() => setShowAISettings(true)}
                    variant="inline"
                  />
                </div>
              </div>
              
              {/* Markdown 预览 */}
              {showMarkdownPreview && formData.content && (
                <div className="mt-2 p-2 border rounded bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Markdown 预览：</div>
                  <div className="markdown-body">
                    <ReactMarkdown>{formData.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* 分类 */}
            <div className="space-y-2">
              <Label htmlFor="category">分类</Label>
              <Select 
                value={formData.category}
                onValueChange={(value) => updateField('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 标签 */}
            <div className="space-y-2">
              <Label htmlFor="tags">标签</Label>
              <div className="space-y-2">
                <Input
                  id="tags" 
                  placeholder="输入标签，用逗号、分号分隔"
                  value={formData.tags}
                  onChange={(e) => updateField('tags', e.target.value)}
                />
                
                {/* 标签建议 */}
                {showTagSuggestions && allTags && allTags.length > 0 && (
                  <div className="mt-2">
                    <Label className="text-xs text-muted-foreground mb-1 block">选择已有标签</Label>
                    <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto p-1">
                      {allTags.map(tag => (
                        <Badge 
                          key={tag}
                          variant="outline" 
                          className="cursor-pointer px-2 py-0.5 text-[8px] font-normal hover:bg-primary/10"
                          onClick={() => addTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 图片上传 */}
            {showImageUpload && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="images">参考图片</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Icons.upload className="h-4 w-4 mr-2" />
                    上传图片
                  </Button>
                </div>
                
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {/* 图片预览 */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {formData.images.map((image, index) => (
                      <div 
                        key={image.id} 
                        className={`relative group cursor-pointer border-2 rounded ${
                          selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                        }`}
                        onClick={() => selectImage(index)}
                      >
                        <img 
                          src={image.data} 
                          alt={image.caption || `图片 ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImage(index);
                          }}
                        >
                          <Icons.x className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 图片说明编辑 */}
                {selectedImageIndex !== null && (
                  <div className="space-y-2 p-2 border rounded bg-muted/30">
                    <Label htmlFor="image-caption">图片说明</Label>
                    <Input
                      id="image-caption"
                      placeholder="为这张图片添加说明..."
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      onBlur={() => {
                        if (selectedImageIndex !== null) {
                          updateImageCaption(selectedImageIndex, imageCaption);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            创建
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

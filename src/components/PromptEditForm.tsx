import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, X } from "lucide-react";
import { PromptEditorState } from "@/hooks/usePromptEditor";
import { Category } from "@/types";
import { AIOptimizeButton } from "./AIOptimizeButton";

interface PromptEditFormProps {
  state: PromptEditorState;
  categories: Category[];
  allTags: string[];
  onFieldChange: <K extends keyof PromptEditorState>(field: K, value: PromptEditorState[K]) => void;
  onImageUpload: () => void;
  onImageSelect: (index: number) => void;
  onImageDelete: (index: number) => void;
  onImageCaptionUpdate: (index: number, caption: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onAIOptimize?: (optimizedContent: string) => void;
  onOpenSettings?: () => void;
}

export const PromptEditForm: React.FC<PromptEditFormProps> = ({
  state,
  categories,
  allTags,
  onFieldChange,
  onImageUpload,
  onImageSelect,
  onImageDelete,
  onImageCaptionUpdate,
  fileInputRef,
  onAIOptimize,
  onOpenSettings,
}) => {
  // 获取标签建议
  const getTagSuggestions = () => {
    const currentTags = state.tags.split(/[,，;；]/).map(tag => tag.trim()).filter(Boolean);
    return allTags.filter(tag => 
      !currentTags.includes(tag) && 
      tag.toLowerCase().includes(state.tags.toLowerCase())
    ).slice(0, 5);
  };

  // 添加建议标签
  const addSuggestedTag = (tag: string) => {
    const currentTags = state.tags.split(/[,，;；]/).map(t => t.trim()).filter(Boolean);
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(", ");
      onFieldChange('tags', newTags);
    }
  };

  // 处理AI优化结果
  const handleAIOptimize = (optimizedContent: string) => {
    if (onAIOptimize) {
      onAIOptimize(optimizedContent);
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* 标题输入 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">标题</label>
        <Input
          value={state.title}
          onChange={(e) => onFieldChange('title', e.target.value)}
          placeholder="输入提示词标题"
          className="w-full"
        />
      </div>

      {/* 分类选择 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">分类</label>
        <Select
          value={state.category}
          onValueChange={(value) => onFieldChange('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择分类" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 内容编辑 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">内容</label>
        <Textarea
          value={state.content}
          onChange={(e) => onFieldChange('content', e.target.value)}
          placeholder="输入提示词内容，支持 Markdown 格式"
          className="min-h-[200px] resize-none"
        />
      </div>

      {/* 标签输入 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">标签</label>
        <div className="relative">
          <Input
            value={state.tags}
            onChange={(e) => onFieldChange('tags', e.target.value)}
            placeholder="输入标签，用逗号分隔"
            className="w-full"
          />
          
          {/* 标签建议 */}
          {state.tags && getTagSuggestions().length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 bg-popover border rounded-md shadow-md mt-1 p-2">
              <div className="text-xs text-muted-foreground mb-2">建议标签：</div>
              <div className="flex flex-wrap gap-1">
                {getTagSuggestions().map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => addSuggestedTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 图片管理 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">参考图片</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onImageUpload}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            添加图片
          </Button>
        </div>

        {/* 图片网格 */}
        {state.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {state.images.map((image, index) => (
              <div key={image.id} className="relative group">
                <Popover>
                  <PopoverTrigger asChild>
                    <div 
                      className={`border rounded-md overflow-hidden cursor-pointer transition-all ${
                        state.selectedImageIndex === index 
                          ? 'ring-2 ring-primary' 
                          : 'hover:opacity-90'
                      }`}
                      onClick={() => onImageSelect(index)}
                    >
                      <img 
                        src={image.data} 
                        alt={image.caption || `图片 ${index + 1}`} 
                        className="w-full h-20 object-cover"
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-2 max-w-xs">
                    <img 
                      src={image.data} 
                      alt={image.caption || `图片 ${index + 1}`} 
                      className="w-full mb-2 rounded" 
                    />
                    <div className="text-xs text-muted-foreground">
                      {image.caption || "无说明"}
                    </div>
                  </PopoverContent>
                </Popover>
                
                {/* 删除按钮 */}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onImageDelete(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* 图片编辑区域 */}
        {state.selectedImageIndex !== null && (
          <div className="rounded-md p-3 bg-muted/50">
            <p className="text-sm font-medium mb-2">图片说明</p>
            <div className="flex gap-2">
              <Input
                value={state.imageCaption}
                onChange={(e) => onFieldChange('imageCaption', e.target.value)}
                placeholder="添加图片说明"
                className="flex-1"
              />
              <Button 
                size="sm"
                onClick={() => {
                  onImageCaptionUpdate(state.selectedImageIndex!, state.imageCaption);
                  onFieldChange('selectedImageIndex', null);
                  onFieldChange('imageCaption', '');
                }}
              >
                确定
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          // 父组件会通过 usePromptEditor hook 处理文件上传逻辑
          // 这里不需要额外处理，onChange 事件会被 hook 捕获
        }}
      />

      {/* AI优化按钮 */}
      <AIOptimizeButton
        content={state.content}
        title={state.title}
        onOptimize={handleAIOptimize}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
};

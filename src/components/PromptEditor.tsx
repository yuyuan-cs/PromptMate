import { useState, useEffect, useCallback, useRef } from "react";
import { usePrompts } from "@/hooks/usePrompts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Save, Trash, X, Plus, Copy, ChevronRight, Check, Edit } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icons } from "@/components/ui/icons";
import { PromptImage } from "@/types";
import { generateId } from "@/lib/data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export function PromptEditor() {
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const {
    selectedPrompt,
    setSelectedPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    categories,
    showRecommended,
    addFromRecommended,
    setShowRecommended,
    copyPromptContent,
    allTags
  } = usePrompts();
  
  const [title, setTitle] = useState(selectedPrompt?.title || "");
  const [content, setContent] = useState(selectedPrompt?.content || "");
  const [category, setCategory] = useState(selectedPrompt?.category || "general");
  const [tags, setTags] = useState(selectedPrompt?.tags.join(", ") || "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(selectedPrompt?.isFavorite || false);
  // 图片相关状态
  const [images, setImages] = useState<PromptImage[]>(selectedPrompt?.images || []);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageCaption, setImageCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理收藏状态切换
  const handleToggleFavorite = useCallback(() => {
    if (!selectedPrompt) return;
    
    // 立即更新本地状态
    setIsFavorite(!isFavorite);
    
    // 调用全局状态更新
    toggleFavorite(selectedPrompt.id);
  }, [isFavorite, selectedPrompt, toggleFavorite]);

  // 添加标签
  const handleAddTag = useCallback((tag: string) => {
    const currentTags = tags.split(/[,，;；]/).map(t => t.trim()).filter(Boolean);
    
    // 检查标签是否已存在
    if (!currentTags.includes(tag)) {
      // 如果当前已有标签，则添加逗号和新标签
      const newTagsString = currentTags.length > 0 
        ? `${tags.trim()}${tags.trim().endsWith(',') ? ' ' : ', '}${tag}` 
        : tag;
      
      setTags(newTagsString);
    }
  }, [tags]);

  // 处理复制提示词内容
  const handleCopyPrompt = useCallback((content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        toast({
          title: "复制成功", 
          description: "提示词内容已复制到剪贴板",
          variant: "success",
        });
      })
      .catch(() => {
        toast({
          title: "复制失败",
          description: "无法复制到剪贴板，请手动复制", 
          variant: "destructive",
        });
      });
  }, [toast]);

  // 当选择的提示词改变时更新表单和编辑状态
  useEffect(() => {
    if (selectedPrompt) {
      setTitle(selectedPrompt.title);
      setContent(selectedPrompt.content);
      setCategory(selectedPrompt.category);
      setTags(selectedPrompt.tags.join(", "));
      setIsFavorite(selectedPrompt.isFavorite);
      setImages(selectedPrompt.images || []);
      setHasChanges(false);
      setIsEditing(false);
    }
  }, [selectedPrompt]);

  // 跟踪变更
  useEffect(() => {
    if (!selectedPrompt) return;
    
    const originalImages = selectedPrompt.images || [];
    const imagesChanged = 
      images.length !== originalImages.length || 
      images.some((img, idx) => {
        const origImg = originalImages[idx];
        return !origImg || img.id !== origImg.id || img.data !== origImg.data || img.caption !== origImg.caption;
      });
    
    const changed = 
      title !== selectedPrompt.title ||
      content !== selectedPrompt.content ||
      category !== selectedPrompt.category ||
      tags !== selectedPrompt.tags.join(", ") ||
      imagesChanged;
    
    setHasChanges(changed);
  }, [title, content, category, tags, images, selectedPrompt]);

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "格式错误",
        description: "请上传图片文件",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB限制
      toast({
        title: "文件过大",
        description: "图片大小不能超过5MB",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const newImage: PromptImage = {
        id: generateId(),
        data: result,
        caption: ""
      };
      setImages(prev => [...prev, newImage]);
      setSelectedImageIndex(images.length);
    };
    reader.readAsDataURL(file);
    
    // 清空文件输入以允许重复选择相同文件
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // 删除图片
  const handleDeleteImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null);
      setImageCaption("");
    } else if (selectedImageIndex !== null && selectedImageIndex > index) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };
  
    // 更新图片说明 - 直接修改主 images 状态
    const handleUpdateCaption = useCallback((index: number, newCaption: string) => {
      setImages(prevImages =>
        prevImages.map((img, i) =>
          i === index ? { ...img, caption: newCaption } : img
        )
      );
      // `hasChanges` 将会因为 `images` 状态的改变而由对应的 useEffect 自动更新
    }, []); // 保持依赖项为空或根据 ESLint 调整，核心是它能正确更新 setImages

  // 选择图片进行编辑
  const handleSelectImage = (index: number) => {
    setSelectedImageIndex(index);
    setImageCaption(images[index]?.caption || "");
  };

  //保存提示词
  const handleSave = () => {
    if (!selectedPrompt) return;
    
    const payload = {
      title,
      content,
      category,
      tags: tags.split(/[,，;；]/).map((tag) => tag.trim()).filter(Boolean),
      images // This is PromptEditor's 'images' state
    };
    // ---- DEBUG LOG 1 ----
    console.log('[PromptEditor] handleSave - payload to updatePrompt:', payload);
    // 为了更清晰地看到如果直接转JSON会怎样，可以额外加一个（可选）
    // console.log('[PromptEditor] handleSave - payload (stringified):', JSON.stringify(payload, null, 2));

    updatePrompt(selectedPrompt.id, {
      title,
      content,
      category,
      tags: tags.split(/[,，;；]/).map((tag) => tag.trim()).filter(Boolean),
      images
    });
    
    toast({
      title: "保存成功",
      description: "您的提示词已成功保存。",
      variant: "success",
    });
    
    setHasChanges(false);
  };
  //删除提示词
  const handleDelete = () => {
    if (!selectedPrompt) return;
    deletePrompt(selectedPrompt.id);
    setDeleteDialogOpen(false);
    
    toast({
      title: "删除成功",
      description: "您的提示词已被删除。",
      variant: "warning",
    });
  };
  //添加推荐提示词
  const handleAddFromRecommended = () => {
    if (!selectedPrompt) return;
    
    const newPrompt = addFromRecommended(selectedPrompt);
    setSelectedPrompt(newPrompt);
    setShowRecommended(false);
    
    toast({
      title: "添加成功",
      description: "推荐模板已添加到您的提示词库",
      variant: "success",
    });
  };

  // 关闭编辑面板
  const handleClose = () => {
    setSelectedPrompt(null);
  };

  // 当没有选择提示词时，显示提示词列表
  if (!selectedPrompt) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-semibold mb-4">
            选择或创建提示词
          </h2>
          <p className="text-muted-foreground mb-6">
            从列表中选择一个提示词进行编辑，或创建一个新的提示词。
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新建提示词
          </Button>
        </div>
      </div>
    );
  }

  // 当有选择提示词时，显示提示词编辑器
  return (
    // 整个编辑器容器
    <div className="flex flex-col h-[calc(100%-var(--header-height))]">
      {/* 顶部工具栏 */}
      <div className="flex flex-col h-10 sm:flex-row justify-between items-start sm:items-center p-2 md:p-2 border-b gap-1 sticky top-0 bg-background z-10">
        
        {/* 左侧工具栏 */}
        <div className="flex flex-wrap gap-1 items-center w-full sm:w-auto justify-center">

          {/* 分类选择器 */}
          {!showRecommended && (
            <Select value={category} onValueChange={setCategory} disabled={!isEditing}>
              <SelectTrigger className="h-6 rounded-md md:w-[90px] lg:w-[100px] flex-shrink-0 text-[10px] focus-visible:ring-0 border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          
        </div>
        {/* 右侧工具栏 */}
        <div className="flex flex-wrap gap-1 h-8 justify-end">

          {/* 收藏按钮 */}
          {!showRecommended ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleFavorite}
                    className="h-6 w-6 flex-shrink-0"
                  >
                    <Star
                      className={`h-4 w-4 md:h-5 md:w-5 ${
                        isFavorite
                          ? "fill-yellow-400 text-yellow-400"
                          : ""
                      }`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFavorite ? "取消收藏" : "添加到收藏"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            // 添加推荐提示词按钮
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={handleAddFromRecommended}
              className="h-8 flex items-center flex-shrink-0"
            >
              <Copy className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm">添加到我的提示词</span>
            </Button>
          )}
          {/* 编辑/完成编辑按钮 (非推荐模式) */}
          {!showRecommended && (
            <>
            {isEditing ? (
            <>
              {/* 完成编辑按钮 */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSave}
                      disabled={!hasChanges}
                      className="h-6 w-6 flex items-center justify-center text-green-600 hover:text-green-700"
                      title="保存更改"
                    >
                      <Icons.check className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>保存更改</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
            ) : (
              // 编辑按钮
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      className="h-6 w-6 flex items-center justify-center" 
                    >
                      <Edit className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>编辑提示词</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </>
        )}

          
          
          {/* 放弃更改按钮 (仅在编辑模式且有更改时显示) */}
          {!showRecommended && isEditing && hasChanges && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (selectedPrompt) {
                        setTitle(selectedPrompt.title);
                        setContent(selectedPrompt.content);
                        setCategory(selectedPrompt.category);
                        setTags(selectedPrompt.tags.join(", "));
                        setImages(selectedPrompt.images || []);
                        setHasChanges(false);
                      }
                    }}
                    className="h-6 w-6"
                  >
                    <X className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>放弃更改</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {/* 保存和删除按钮 */}         
          {/* {!showRecommended && isEditing && (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                        variant="outline"
                        size="icon"
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className="h-6 w-6 text-green-600"
                        >
                        <Save className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>保存更改</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          )} */}

          {!showRecommended && (
            <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setDeleteDialogOpen(true)}
                        className="h-6 w-6"
                        >
                        <Trash className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>删除提示词</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          )}
                    
          
        </div>
      </div>
      {/* Global Unsaved Changes Notification Bar - Placed directly after the toolbar */}
      {isEditing && hasChanges && (
          <div className="bg-yellow-100 gap-10 border-b border-yellow-300 text-yellow-700 px-3 py-1.5 text-xs text-center">
             您有未保存的更改。
          </div>
      )}
      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-3 md:p-6 space-y-4">
          {/* 只读模式标题 */}
          {!isEditing && (
            <div className="flex items-center justify-between w-full">
              <h2 className="text-2xl font-semibold">
                {selectedPrompt.title}
              </h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyPrompt(selectedPrompt?.content || "");
                      }}
                    >
                      <Icons.copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>复制提示词内容</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* 编辑模式表单 */}
          {isEditing && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  标题
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="提示词标题"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="content" className="text-sm font-medium">
                  内容
                </label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="输入提示词内容"
                  className="min-h-[200px]"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="category" className="text-sm font-medium">
                  分类
                </label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger id="category">
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

              <div className="grid gap-2">
                <label htmlFor="tags" className="text-sm font-medium">
                  标签（用逗号、分号分隔）
                </label>
                <div className="space-y-2">
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="标签1, 标签2, 标签3"
                  />
                  
                  {/* 显示现有标签供选择 */}
                  {allTags && allTags.length > 0 && (
                    <div className="mt-2">
                      <label className="text-xs text-muted-foreground mb-1 block">选择已有标签</label>
                      <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto p-1">
                        {allTags.map(tag => (
                          <Badge 
                            key={tag}
                            variant="outline" 
                            className="cursor-pointer px-2 py-0.5 text-[10px] font-normal hover:bg-primary/10"
                            onClick={() => handleAddTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 图片管理区域 */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    参考图片
                  </label>
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Icons.image className="h-4 w-4 mr-2" />
                      添加图片
                    </Button>
                  </div>
                </div>

                {/* 图片预览区域 */}
                {images.length > 0 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((image, index) => (
                        <div 
                          key={image.id} 
                          className={`relative border rounded-md overflow-hidden cursor-pointer
                          ${selectedImageIndex === index ? 'ring-2 ring-primary' : ''}
                          group`}
                          onClick={() => handleSelectImage(index)}
                        >
                          <img 
                            src={image.data} 
                            alt={image.caption || `图片 ${index + 1}`} 
                            className="w-full h-28 object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 p-1 text-xs bg-black/60 text-white truncate">
                            {image.caption || `图片 ${index + 1}`}
                          </div>
                          <button 
                            className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(index);
                            }}
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* 图片编辑区域 */}
                    {selectedImageIndex !== null && (
                      <div className="rounded-md p-3 bg-muted/50">
                        <p className="text-sm font-medium mb-2">图片说明</p>
                        <div className="flex gap-2">
                          <Input
                            value={imageCaption}
                            onChange={(e) => setImageCaption(e.target.value)}
                            placeholder="添加图片说明"
                            className="flex-1"
                          />
                          <Button 
                            size="sm"
                            onClick={() => {
                              handleUpdateCaption(selectedImageIndex, imageCaption);
                              setSelectedImageIndex(null);
                              setImageCaption("");
                            }}
                          >
                            保存
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 只读模式内容 */}
          {!isEditing && (
            <>
              <div className="bg-muted/30 rounded-md p-4 mb-4 whitespace-pre-wrap">
                {selectedPrompt.content}
              </div>
              
              {/* 图片预览区域（只读模式） */}
              {selectedPrompt.images && selectedPrompt.images.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h3 className="text-sm font-medium">参考图片</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedPrompt.images.map((image, index) => (
                      <Popover key={image.id}>
                        <PopoverTrigger asChild>
                          <div className="border rounded-md overflow-hidden cursor-pointer hover:opacity-90">
                            <img 
                              src={image.data} 
                              alt={image.caption || `图片 ${index + 1}`} 
                              className="w-full h-32 object-cover"
                            />
                            {image.caption && (
                              <div className="p-2 text-xs text-muted-foreground truncate">
                                {image.caption}
                              </div>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0">
                          <div className="relative">
                            <img 
                              src={image.data} 
                              alt={image.caption || `图片 ${index + 1}`} 
                              className="w-full max-h-[500px] object-contain"
                            />
                            {image.caption && (
                              <div className="p-2 text-sm bg-background/95 border-t">
                                {image.caption}
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedPrompt.tags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-muted/80 text-muted-foreground px-1.5 py-0.5 rounded-md text-[10px] font-normal"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

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
    </div>
  );
}

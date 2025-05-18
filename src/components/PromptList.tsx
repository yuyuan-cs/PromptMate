import { usePrompts } from "@/hooks/usePrompts";
import { Button } from "@/components/ui/button";
import { Plus, Star, Search, X, Copy, Edit, Trash, MoreVertical, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, memo, useCallback, useRef } from "react";
import { Prompt, Category, PromptImage } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { FontSelector } from "./FontSelector";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import React from "react";
import { ViewBadge } from "./category/ViewBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogDescription } from "@/components/ui/dialog";
import { generateId } from "@/lib/data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from "@/components/ui/context-menu";

// 提示词详情查看对话框组件 (Memoized)
const PromptDetailDialog = memo(function PromptDetailDialog({ 
  prompt, 
  open, 
  onOpenChange 
}: { 
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { copyPromptContent, toggleFavorite } = usePrompts();

  if (!prompt) return null;

  const formattedDate = new Date(prompt.updatedAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{prompt.title}</DialogTitle>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() => copyPromptContent(prompt.id)}
                title="复制提示词"
              >
                <Icons.copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() => toggleFavorite(prompt.id)}
                title={prompt.isFavorite ? "取消收藏" : "收藏"}
              >
                {prompt.isFavorite ? (
                  <Icons.starFilled className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ) : (
                  <Icons.star className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span className="mr-2">最后更新: {formattedDate}</span>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-4 rounded-lg bg-muted/30 whitespace-pre-wrap">
            {prompt.content}
          </div>
          
          {/* 显示图片 */}
          {prompt.images && prompt.images.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium px-1">参考图片</h3>
              <div className="grid grid-cols-2 gap-2 p-1">
                {prompt.images.map((image, index) => (
                  <div 
                    key={image.id} 
                    className="border rounded-md overflow-hidden"
                  >
                    <img 
                      src={image.data} 
                      alt={image.caption || `图片 ${index + 1}`} 
                      className="w-full h-32 object-cover"
                    />
                    {image.caption && (
                      <div className="p-2 text-xs text-muted-foreground">
                        {image.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {prompt.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 px-1">
              {prompt.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

// PromptList component (Memoized)
export const PromptList = memo(function PromptList({ 
  onToggleSidebar,
  contentTitle,
  isEditPanelOpen = false
}: { 
  onToggleSidebar?: () => void;
  contentTitle?: string;
  isEditPanelOpen?: boolean;
}) {
  const { toast } = useToast();
  const {
    prompts,
    categories,
    addPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    searchTerm,
    setSearchTerm,
    activeCategory,
    setActiveCategory,
    showFavorites,
    setShowFavorites,
    showRecommended,
    setShowRecommended,
    selectedPrompt,
    setSelectedPrompt,
    filteredPrompts,
    allTags,
    selectedTag,
    setSelectedTag,
    refreshCounter,
    addFromRecommended,
    copyPromptContent,
    deleteTag
  } = usePrompts();
  
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [showNewPromptDialog, setShowNewPromptDialog] = useState(false);
  const [showEditPromptDialog, setShowEditPromptDialog] = useState(false);
  const [showDeletePromptDialog, setShowDeletePromptDialog] = useState(false);
  const [promptToEdit, setPromptToEdit] = useState<Prompt | null>(null);
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);
  const [newPromptTitle, setNewPromptTitle] = useState("");
  const [newPromptContent, setNewPromptContent] = useState("");
  const [newPromptCategory, setNewPromptCategory] = useState("general");
  const [newPromptTags, setNewPromptTags] = useState("");
  const [editPromptTitle, setEditPromptTitle] = useState("");
  const [editPromptContent, setEditPromptContent] = useState("");
  const [editPromptCategory, setEditPromptCategory] = useState("");
  const [editPromptTags, setEditPromptTags] = useState("");
  const [localRefreshKey, setLocalRefreshKey] = useState(0);
  const [detailPrompt, setDetailPrompt] = useState<Prompt | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  // 图片上传相关状态
  const [newPromptImages, setNewPromptImages] = useState<PromptImage[]>([]);
  const [selectedNewImageIndex, setSelectedNewImageIndex] = useState<number | null>(null);
  const [newImageCaption, setNewImageCaption] = useState("");
  const newFileInputRef = useRef<HTMLInputElement>(null);
  const [editDialogImages, setEditDialogImages] = useState<PromptImage[]>([]);
  const [selectedEditDialogImageIndex, setSelectedEditDialogImageIndex] = useState<number | null>(null);
  const [editDialogImageCaption, setEditDialogImageCaption] = useState("");
  const editDialogFileInputRef = useRef<HTMLInputElement>(null);

  const [showAllTags, setShowAllTags] = useState(false);
  const TAGS_DISPLAY_LIMIT = 10; // 每行最多显示的标签数量

  const handleEditDialogImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({ title: "格式错误", description: "请上传图片文件", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB限制
      toast({ title: "文件过大", description: "图片大小不能超过5MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const newImage: PromptImage = { id: generateId(), data: result, caption: "" };
      setEditDialogImages(prev => [...prev, newImage]);
    };
    reader.readAsDataURL(file);
    if (editDialogFileInputRef.current) {
      editDialogFileInputRef.current.value = "";
    }
  };

  const handleDeleteEditDialogImage = (index: number) => {
    setEditDialogImages(prev => prev.filter((_, i) => i !== index));
    if (selectedEditDialogImageIndex === index) {
      setSelectedEditDialogImageIndex(null);
      setEditDialogImageCaption("");
    } else if (selectedEditDialogImageIndex !== null && selectedEditDialogImageIndex > index) {
      setSelectedEditDialogImageIndex(prevIdx => prevIdx !== null ? prevIdx - 1 : null);
    }
  };

  const handleUpdateEditDialogCaption = (index: number, caption: string) => {
    setEditDialogImages(prev =>
      prev.map((img, i) => (i === index ? { ...img, caption } : img))
    );
  };

  const handleSelectEditDialogImage = (index: number) => {
    setSelectedEditDialogImageIndex(index);
    setEditDialogImageCaption(editDialogImages[index]?.caption || "");
  };


  useEffect(() => {
    setLocalRefreshKey(prev => prev + 1);
    console.log('PromptList 内部刷新:', contentTitle);
  }, [activeCategory, showFavorites, showRecommended, searchTerm, selectedTag, contentTitle]);

  useEffect(() => {
    console.log('PromptList state:', {
      activeCategory,
      showFavorites,
      showRecommended,
      searchTerm,
      selectedTag,
      filteredPromptsCount: filteredPrompts.length,
      totalPromptsCount: prompts.length,
      contentTitle,
      localRefreshKey
    });
  }, [activeCategory, showFavorites, showRecommended, searchTerm, selectedTag, filteredPrompts, prompts, contentTitle, localRefreshKey]);

  const handlePromptClick = useCallback((prompt: Prompt) => {
    setSelectedPrompt(prompt);
  }, [setSelectedPrompt]);
  
  // 处理图片上传
  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setNewPromptImages(prev => [...prev, newImage]);
      setSelectedNewImageIndex(newPromptImages.length);
    };
    reader.readAsDataURL(file);
    
    // 清空文件输入以允许重复选择相同文件
    if (newFileInputRef.current) {
      newFileInputRef.current.value = "";
    }
  };
  
  // 删除图片
  const handleDeleteNewImage = (index: number) => {
    setNewPromptImages(prev => prev.filter((_, i) => i !== index));
    if (selectedNewImageIndex === index) {
      setSelectedNewImageIndex(null);
      setNewImageCaption("");
    } else if (selectedNewImageIndex !== null && selectedNewImageIndex > index) {
      setSelectedNewImageIndex(selectedNewImageIndex - 1);
    }
  };
  
  // 更新图片说明
  const handleUpdateNewCaption = (index: number, caption: string) => {
    setNewPromptImages(prev => 
      prev.map((img, i) => 
        i === index ? {...img, caption} : img
      )
    );
  };
  
  // 选择图片进行编辑
  const handleSelectNewImage = (index: number) => {
    setSelectedNewImageIndex(index);
    setNewImageCaption(newPromptImages[index].caption || "");
  };
  
  // 创建提示词
  const handleCreatePrompt = useCallback(() => {
    if (!newPromptTitle.trim() || !newPromptContent.trim()) {
      toast({
        title: "错误",
        description: "标题和内容不能为空",
        variant: "destructive",
      });
      return;
    }
    
    const tags = newPromptTags.split(",").map(tag => tag.trim()).filter(Boolean);
    
    addPrompt({
      title: newPromptTitle,
      content: newPromptContent,
      category: newPromptCategory,
      tags,
      isFavorite: false,
      images: newPromptImages.length > 0 ? newPromptImages : undefined
    });
    
    toast({
      title: "创建成功",
      description: "新的提示词已创建",
      variant: "success",
    });
    
    // Reset form
    setNewPromptTitle("");
    setNewPromptContent("");
    setNewPromptCategory("general");
    setNewPromptTags("");
    setNewPromptImages([]);
    setSelectedNewImageIndex(null);
    setNewImageCaption("");
    setShowNewPromptDialog(false);
  }, [newPromptTitle, newPromptContent, newPromptCategory, newPromptTags, newPromptImages, addPrompt, toast]);
  
  // 从推荐模板添加提示词
  const handleAddFromRecommended = useCallback((prompt: Prompt) => {
    const newPrompt = addFromRecommended(prompt);
    setSelectedPrompt(newPrompt);
    setShowRecommended(false);
    
    toast({
      title: "添加成功",
      description: "推荐模板已添加到您的提示词库",
      variant: "success",
    });
  }, [addFromRecommended, setSelectedPrompt, setShowRecommended, toast]);

  // 复制提示词
  const handleCopyPrompt = useCallback((content: string) => {
    const copyPromptContent = (content: string) => {
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
    };
    copyPromptContent(content);
  }, [toast]);

  // 打开编辑对话框
  const handleOpenEditDialog = useCallback((prompt: Prompt) => {
      setPromptToEdit(prompt);
      setEditPromptTitle(prompt.title);
      setEditPromptContent(prompt.content);
      setEditPromptCategory(prompt.category);
      setEditPromptTags(prompt.tags.join(", "));
      setEditDialogImages(prompt.images || []);
      setSelectedEditDialogImageIndex(null);
      setEditDialogImageCaption("");
      setShowEditPromptDialog(true);
    }, []);

  // 编辑提示词
  const handleEditPrompt = useCallback(() => {
    if (!promptToEdit) return;
    
    if (!editPromptTitle.trim() || !editPromptContent.trim()) {
      toast({
        title: "错误",
        description: "标题和内容不能为空",
        variant: "destructive",
      });
      return;
    }
    
    // 修改标签处理逻辑，支持中英文逗号和分号
    const tags = editPromptTags.split(/[,，;；]/).map(tag => tag.trim()).filter(Boolean);
    
    updatePrompt(promptToEdit.id, {
      title: editPromptTitle,
      content: editPromptContent,
      category: editPromptCategory,
      tags,
      images: editDialogImages.length > 0 ? editDialogImages : undefined,
    });

    
    toast({
      title: "更新成功",
      description: "提示词已更新",
      variant: "success",
    });
    
    setShowEditPromptDialog(false);
    setPromptToEdit(null);
    setEditDialogImages([]);
    setSelectedEditDialogImageIndex(null);
    setEditDialogImageCaption("");
  }, [
    promptToEdit, editPromptTitle, editPromptContent, editPromptCategory, 
    editPromptTags, updatePrompt, toast, editDialogImages, 
    selectedEditDialogImageIndex, editDialogImageCaption
  ]);

  const handleOpenDeleteDialog = useCallback((prompt: Prompt) => {
    setPromptToDelete(prompt);
    setShowDeletePromptDialog(true);
  }, []);

  // 删除提示词
  const handleDeletePrompt = useCallback(() => {
    if (!promptToDelete) return;
    
    deletePrompt(promptToDelete.id);
    
    toast({
      title: "删除成功",
      description: "提示词已删除",
      variant: "warning",
    });
    
    setShowDeletePromptDialog(false);
    setPromptToDelete(null);
  }, [promptToDelete, deletePrompt, toast]);

  // 查看提示词详情
  const handleViewPromptDetail = useCallback((prompt: Prompt) => {
    if (selectedPrompt?.id === prompt.id) {
      setSelectedPrompt(null);
    } else {
      setSelectedPrompt(prompt);
    }
  }, [selectedPrompt, setSelectedPrompt]);

  // 切换收藏状态
  const handleToggleFavorite = useCallback((e: React.MouseEvent, promptId: string) => {
    e.stopPropagation();
    toggleFavorite(promptId);
  }, [toggleFavorite]);

  // 标签点击
  const handleTagClick = useCallback((e: React.MouseEvent, tag: string | null) => {
    e.stopPropagation();
    setSelectedTag(currentTag => tag === currentTag ? null : tag);
  }, [setSelectedTag]);

  // 处理新建对话框关闭
  const handleNewDialogClose = useCallback(() => {
    setShowNewPromptDialog(false);
    setNewPromptTitle("");
    setNewPromptContent("");
    setNewPromptCategory("general");
    setNewPromptTags("");
    setNewPromptImages([]);
    setSelectedNewImageIndex(null);
    setNewImageCaption("");
  }, []);

  // 编辑对话框关闭
  const handleEditDialogClose = useCallback(() => {
    setShowEditPromptDialog(false);
    setEditDialogImages([]);
    setSelectedEditDialogImageIndex(null);
    setEditDialogImageCaption("");
  }, []);

  // 编辑对话框保存
  const handleEditDialogSave = useCallback(() => handleEditPrompt(), [handleEditPrompt]);

  const handleDeleteDialogClose = useCallback(() => setShowDeletePromptDialog(false), []);
  const handleDeleteDialogConfirm = useCallback(() => handleDeletePrompt(), [handleDeletePrompt]);
  const handleDetailDialogClose = useCallback(() => setShowDetailDialog(false), []);

  // 添加标签到编辑提示词
  const handleAddTagToEdit = useCallback((tag: string) => {
    const currentTags = editPromptTags.split(/[,，;；]/).map(t => t.trim()).filter(Boolean);
    
    // 检查标签是否已存在
    if (!currentTags.includes(tag)) {
      // 如果当前已有标签，则添加逗号和新标签
      const newTagsString = currentTags.length > 0 
        ? `${editPromptTags.trim()}${editPromptTags.trim().endsWith(',') ? ' ' : ', '}${tag}` 
        : tag;
      
      setEditPromptTags(newTagsString);
    }
  }, [editPromptTags]);

  // 处理右键菜单删除标签
  const handleDeleteTag = (tag: string) => {
    // 显示确认对话框
    if (window.confirm(`确定要删除标签 "${tag}" 吗？此操作将从所有提示词中移除该标签。`)) {
      deleteTag(tag);
      toast({
        title: "删除成功",
        description: `标签 "${tag}" 已从所有提示词中删除`,
        variant: "success",
      });
    }
  };

  return (
    <div className="flex flex-col h-full"> 
      
      {/* 当前分类/模式指示器 */}
      <div className="bg-muted/30 px-4 py-2 text-sm flex items-center w-full sticky top-0 z-20 border-b border-border/40">
        <span className="font-medium mr-2">当前查看:</span>
        <ViewBadge 
          showRecommended={showRecommended}
          showFavorites={showFavorites}
          activeCategory={activeCategory}
          categories={categories}
        />
        <span className="ml-auto text-muted-foreground">找到 {filteredPrompts.length} 个提示词</span>
      </div>

      {/* 标签过滤器 */}
      {allTags.length > 0 && (
        <div className="p-2 border-b w-full">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={selectedTag === null ? "default" : "outline"}
              className="cursor-pointer text-xs px-2 py-0.5"
              onClick={(e) => handleTagClick(e, null)}
            >
              全部
            </Badge>
            {(showAllTags ? allTags : allTags.slice(0, TAGS_DISPLAY_LIMIT)).map(tag => (
              <ContextMenu key={tag}>
                <ContextMenuTrigger>
                  <Badge
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="cursor-pointer text-xs px-2 py-0.5"
                    onClick={(e) => handleTagClick(e, tag)}
                  >
                    {tag}
                  </Badge>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => handleTagClick(null, tag)}>
                    <Icons.fileText className="mr-2 h-4 w-4" />
                    按此标签筛选
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleDeleteTag(tag)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Icons.trash className="mr-2 h-4 w-4" />
                    删除此标签
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
            {allTags.length > TAGS_DISPLAY_LIMIT && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => setShowAllTags(!showAllTags)}
              >
                {showAllTags ? (
                  <>
                    <Icons.chevronUp className="h-3 w-3 mr-1" />
                    收起
                  </>
                ) : (
                  <>
                    <Icons.chevronDown className="h-3 w-3 mr-1" />
                    查看更多 ({allTags.length - TAGS_DISPLAY_LIMIT})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 搜索结果提示 */}
      {searchTerm && (
        <div className="flex items-center px-4 py-2 bg-muted/50 w-full border-b">
          <Icons.search className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">
            当前搜索 "{searchTerm}" 的结果
          </span>
        </div>
      )}

      {/* 提示词列表 */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredPrompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="p-8 rounded-lg bg-muted/50 max-w-md">
                <Icons.fileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">没有找到提示词</h3>
                <p className="text-muted-foreground">
              {searchTerm 
                    ? "没有找到匹配的提示词，请尝试其他搜索词。"
                : showRecommended 
                      ? "当前没有可用的推荐模板。"
                      : showFavorites
                        ? "您还没有收藏任何提示词。"
                        : activeCategory
                          ? "此分类下暂无提示词。"
                          : "点击新建提示词创建你的第一个提示词。"}
                </p>
                {!searchTerm && !showRecommended && (
                  <Button 
                    className="mt-4"
                    onClick={() => setShowNewPromptDialog(true)}
                  >
                    <Icons.plus className="h-4 w-4 mr-2" />
                    新建提示词
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // 提示词列表
            <div className={`grid grid-cols-1 ${isEditPanelOpen ? '' : 'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'} gap-4`}>
              {filteredPrompts.map((prompt) => (
                <Card 
                  key={prompt.id}
                  className={cn(
                    "prompt-card cursor-pointer transition-all duration-200 ease-in-out rounded-md p-0.5 min-w-[280px]",
                    "focus-visible:ring-1  focus-visible:ring-offset-0 focus-visible:shadow-lg",
                    selectedPrompt?.id === prompt.id 
                      ? "ring-0.2 ring-primary/20 shadow-xl border-primary/25 bg-primary/1"
                      : "border border-transparent hover:border-primary/10 hover:shadow-lg"
                  )}
                  onClick={() => handleViewPromptDetail(prompt)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleViewPromptDetail(prompt);
                    }
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-1">{prompt.title}</CardTitle>
                    <div className="flex flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyPrompt(prompt.content);
                          }}
                          title="复制提示词"
                        >
                          <Icons.copy className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Icons.moreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!showRecommended && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditDialog(prompt);
                              }}>
                                <Icons.pencil className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              if (showRecommended) {
                                handleAddFromRecommended(prompt);
                              } else {
                                handleToggleFavorite(e, prompt.id);
                              }
                            }}>
                              {showRecommended ? (
                                <>
                                  <Icons.plus className="mr-2 h-4 w-4" />
                                  添加到我的提示词
                                </>
                              ) : prompt.isFavorite ? (
                                <>
                                  <Icons.starOff className="mr-2 h-4 w-4" />
                                  取消收藏
                                </>
                              ) : (
                                <>
                                  <Icons.star className="mr-2 h-4 w-4" />
                                  收藏
                                </>
                              )}
                            </DropdownMenuItem>
                            {!showRecommended && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDeleteDialog(prompt);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Icons.trash className="mr-2 h-4 w-4" />
                                  删除
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-2">
                    <div className="text-sm text-muted-foreground line-clamp-3 h-[4.5em]">
                      {prompt.content}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2 text-[8px] max-w-[calc(100%-40px)] overflow-hidden">
                      {prompt.tags.slice(0, 3).map((tag) => (
                        <ContextMenu key={tag}>
                          <ContextMenuTrigger>
                            <Badge 
                              variant="secondary" 
                              className="cursor-pointer text-nowrap text-[8px] py-0 px-1.5 font-normal h-5 bg-secondary/70"
                              onClick={(e) => handleTagClick(e, tag)}
                            >
                              {tag}
                            </Badge>
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem onClick={() => handleTagClick(null, tag)}>
                              <Icons.fileText className="mr-2 h-4 w-4" />
                              按此标签筛选
                            </ContextMenuItem>
                            <ContextMenuItem 
                              onClick={() => handleDeleteTag(tag)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Icons.trash className="mr-2 h-4 w-4" />
                              删除此标签
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      ))}
                      {prompt.tags.length > 3 && (
                        <Badge variant="outline" className="cursor-pointer text-[10px] py-0 px-1.5 font-normal h-5">
                          +{prompt.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                      {!showRecommended && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={(e) => handleToggleFavorite(e, prompt.id)}
                        title={prompt.isFavorite ? "取消收藏" : "收藏"}
                      >
                        {prompt.isFavorite ? (
                          <Icons.starFilled className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <Icons.star className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* 创建新提示词对话框 */}
      <Dialog open={showNewPromptDialog} onOpenChange={setShowNewPromptDialog}>
        <DialogContent className={cn(
          "max-h-[90vh] flex flex-col",
          isMobile ? "w-[90vw] max-w-[90vw]" : ""
        )}>
          <DialogHeader>
            <DialogTitle>创建新提示词</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 max-h-[calc(90vh-130px)] overflow-auto">
            <div className="space-y-4 py-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="title">标题</Label>
                <Input
                  id="title"
                  placeholder="输入提示词标题"
                  value={newPromptTitle}
                  onChange={(e) => setNewPromptTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">内容</Label>
                <Textarea
                  id="content"
                  placeholder="输入提示词内容"
                  className="min-h-[150px]"
                  value={newPromptContent}
                  onChange={(e) => setNewPromptContent(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">分类</Label>
                <Select
                  value={newPromptCategory}
                  onValueChange={setNewPromptCategory}
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
              
              <div className="space-y-2">
                <Label htmlFor="tags">标签（用逗号分隔）</Label>
                <Input
                  id="tags"
                  placeholder="输入标签，用逗号分隔"
                  value={newPromptTags}
                  onChange={(e) => setNewPromptTags(e.target.value)}
                />
              </div>
              
              {/* 图片上传区域 */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label>参考图片</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => newFileInputRef.current?.click()}
                    type="button"
                  >
                    <Icons.image className="h-4 w-4 mr-2" />
                    添加图片
                  </Button>
                  <input
                    type="file"
                    ref={newFileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleNewImageUpload}
                  />
                </div>
                
                {/* 图片预览区域 */}
                {newPromptImages.length > 0 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {newPromptImages.map((image, index) => (
                        <div 
                          key={image.id} 
                          className={`relative border rounded-md overflow-hidden cursor-pointer
                          ${selectedNewImageIndex === index ? 'ring-2 ring-primary' : ''}
                          group`}
                          onClick={() => handleSelectNewImage(index)}
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
                              handleDeleteNewImage(index);
                            }}
                            type="button"
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* 图片编辑区域 */}
                    {selectedNewImageIndex !== null && (
                      <div className="rounded-md p-3 bg-muted/50">
                        <p className="text-sm font-medium mb-2">图片说明</p>
                        <div className="flex gap-2">
                          <Input
                            value={newImageCaption}
                            onChange={(e) => setNewImageCaption(e.target.value)}
                            placeholder="添加图片说明"
                            className="flex-1"
                          />
                          <Button 
                            size="sm"
                            onClick={() => {
                              handleUpdateNewCaption(selectedNewImageIndex, newImageCaption);
                              setSelectedNewImageIndex(null);
                              setNewImageCaption("");
                            }}
                            type="button"
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
          </ScrollArea>
          <DialogFooter className="mt-4 pt-4 border-t">
            <Button variant="outline" onClick={handleNewDialogClose}>
              取消
            </Button>
            <Button onClick={handleCreatePrompt}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑提示词对话框 */}
      <Dialog open={showEditPromptDialog} onOpenChange={setShowEditPromptDialog}>
        <DialogContent className={cn(
          "max-h-[90vh] flex flex-col",
          isMobile ? "w-[90vw] max-w-[90vw]" : ""
        )}>
          {/* 整个编辑器容器 */}
          <DialogHeader>
            <DialogTitle>编辑提示词</DialogTitle>
          </DialogHeader>
          {/* 提示词编辑器 */}
          <ScrollArea className="flex-1 max-h-[calc(90vh-130px)] overflow-auto">
            <div className="space-y-4 py-4 px-1">
              {/* 标题 */}
              <div className="space-y-2">
                <Label htmlFor="edit-title">标题</Label>
                <Input
                  id="edit-title"
                  value={editPromptTitle}
                  onChange={(e) => setEditPromptTitle(e.target.value)}
                />
              </div>
              {/* 内容 */}
              <div className="space-y-2">
                <Label htmlFor="edit-content">内容</Label>
                <Textarea
                  id="edit-content"
                  value={editPromptContent}
                  onChange={(e) => setEditPromptContent(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
              {/* 分类 */}
              <div className="space-y-2">
                <Label htmlFor="edit-category">分类</Label>
                <Select
                  value={editPromptCategory}
                  onValueChange={setEditPromptCategory}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* 标签 */}  
              <div className="space-y-2">
                <Label htmlFor="edit-tags">标签（用逗号、分号分隔）</Label>
                <div className="space-y-2">
                  <Input
                    id="edit-tags"
                    value={editPromptTags}
                    onChange={(e) => setEditPromptTags(e.target.value)}
                    placeholder="输入标签，用逗号、分号分隔"
                  />
                  
                  {/* 显示现有标签供选择 */}
                  {allTags && allTags.length > 0 && (
                    <div className="mt-2">
                      <Label className="text-xs text-muted-foreground mb-1 block">选择已有标签</Label>
                      <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto p-1">
                        {allTags.map(tag => (
                          <Badge 
                            key={tag}
                            variant="outline" 
                            className="cursor-pointer px-2 py-0.5 text-[10px] font-normal hover:bg-primary/10"
                            onClick={() => handleAddTagToEdit(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t">
                 <div className="flex items-center justify-between">
                   <Label htmlFor="edit-dialog-images">参考图片</Label> {/* Added htmlFor for accessibility */}
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => editDialogFileInputRef.current?.click()}
                     type="button"
                   >
                     <Icons.image className="h-4 w-4 mr-2" />
                     添加图片
                   </Button>
                   <input
                     type="file"
                     id="edit-dialog-images" // Added id
                     ref={editDialogFileInputRef}
                     className="hidden"
                     accept="image/*"
                     multiple={false} // Explicitly single file for simplicity here
                     onChange={handleEditDialogImageUpload}
                   />
                 </div>

                 {editDialogImages.length > 0 && (
                   <div className="space-y-3">
                     <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                       {editDialogImages.map((image, index) => (
                         <div
                           key={image.id}
                           className={`relative border rounded-md overflow-hidden cursor-pointer group ${
                             selectedEditDialogImageIndex === index ? 'ring-2 ring-primary' : ''
                           }`}
                           onClick={() => handleSelectEditDialogImage(index)}
                         >
                           <img
                             src={image.data}
                             alt={image.caption || `图片 ${index + 1}`}
                             className="w-full h-24 sm:h-28 object-cover"
                           />
                           <div className="absolute bottom-0 left-0 right-0 p-1 text-xs bg-black/60 text-white truncate">
                             {image.caption || `图片 ${index + 1}`}
                           </div>
                           <button
                             className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                             onClick={(e) => { e.stopPropagation(); handleDeleteEditDialogImage(index); }}
                             type="button"
                             title="删除图片"
                           >
                             <X className="h-3 w-3 text-white" />
                           </button>
                         </div>
                       ))}
                     </div>

                     {selectedEditDialogImageIndex !== null && editDialogImages[selectedEditDialogImageIndex] && (
                       <div className="rounded-md p-3 bg-muted/50">
                         <p className="text-sm font-medium mb-2">编辑图片说明 (图片 {selectedEditDialogImageIndex + 1})</p>
                         <div className="flex gap-2">
                           <Input
                             value={editDialogImageCaption}
                             onChange={(e) => setEditDialogImageCaption(e.target.value)} // Local state update
                             placeholder="添加图片说明"
                             className="flex-1"
                           />
                           <Button
                             size="sm"
                             onClick={() => {
                               if (selectedEditDialogImageIndex !== null) {
                                 handleUpdateEditDialogCaption(selectedEditDialogImageIndex, editDialogImageCaption);
                                 toast({ title: "图片说明已暂存", description: "点击下方「保存更改」以应用到提示词。" });
                                 // Optional: deselect after updating caption locally
                                 // setSelectedEditDialogImageIndex(null);
                                 // setEditDialogImageCaption("");
                               }
                             }}
                             type="button"
                           >
                             更新说明
                           </Button>
                         </div>
                       </div>
                     )}
                   </div>
                 )}
               </div>
               {/* ---- END: Image Management UI for Edit Dialog ---- */}

               
            </div> {/* This is the closing div for space-y-4 py-4 px-1 */}
           </ScrollArea>
          {/* 底部工具栏 */}  
          <DialogFooter className="mt-4 pt-4 border-t">
            <Button variant="outline" onClick={handleEditDialogClose}>
              取消
            </Button>
            <Button onClick={handleEditDialogSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除提示词确认对话框 */}
      <Dialog open={showDeletePromptDialog} onOpenChange={setShowDeletePromptDialog}>
        <DialogContent className={isMobile ? "w-[90vw] max-w-[90vw]" : ""}>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p>
            您确定要删除提示词 "{promptToDelete?.title}" 吗？此操作无法撤销。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteDialogClose}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteDialogConfirm}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 提示词详情查看对话框 */}
      <PromptDetailDialog 
        prompt={detailPrompt} 
        open={showDetailDialog} 
        onOpenChange={setShowDetailDialog} 
      />
    </div>
  );
});
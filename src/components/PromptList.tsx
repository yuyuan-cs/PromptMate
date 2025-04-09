import { usePrompts } from "@/hooks/usePrompts";
import { Button } from "@/components/ui/button";
import { Plus, Star, Search, X, Copy, Edit, Trash, MoreVertical, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Prompt, Category } from "@/types";
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

// 提示词详情查看对话框组件
function PromptDetailDialog({ 
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
          {prompt.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
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
}

export function PromptList({ 
  onToggleSidebar,
  contentTitle
}: { 
  onToggleSidebar?: () => void;
  contentTitle?: string;
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
    addFromRecommended
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

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
  };
  
  const handleCreatePrompt = () => {
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
    });
    
    toast({
      title: "创建成功",
      description: "新的提示词已创建",
      variant: "success",
    });
    
    // 重置表单
    setNewPromptTitle("");
    setNewPromptContent("");
    setNewPromptCategory("general");
    setNewPromptTags("");
    setShowNewPromptDialog(false);
  };
  
  const handleAddFromRecommended = (prompt: Prompt) => {
    const newPrompt = addFromRecommended(prompt);
    setSelectedPrompt(newPrompt);
    setShowRecommended(false);
    
    toast({
      title: "添加成功",
      description: "推荐模板已添加到您的提示词库",
      variant: "success",
    });
  };

  const handleCopyPrompt = (
    eventOrContent: React.MouseEvent | string, 
    prompt?: Prompt
  ) => {
    // 如果第一个参数是事件，则使用prompt.content
    // 如果第一个参数是字符串，则直接使用它
    let content: string;
    
    if (typeof eventOrContent === 'string') {
      content = eventOrContent;
    } else {
      eventOrContent.stopPropagation();
      content = prompt?.content || '';
    }
    
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

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  // 修改打开编辑对话框函数支持直接传递prompt
  const handleOpenEditDialog = (
    eventOrPrompt: React.MouseEvent | Prompt,
    promptFromEvent?: Prompt
  ) => {
    let prompt: Prompt;
    
    if ('stopPropagation' in eventOrPrompt) {
      eventOrPrompt.stopPropagation();
      if (!promptFromEvent) return;
      prompt = promptFromEvent;
    } else {
      prompt = eventOrPrompt;
    }
    
    setPromptToEdit(prompt);
    setEditPromptTitle(prompt.title);
    setEditPromptContent(prompt.content);
    setEditPromptCategory(prompt.category);
    setEditPromptTags(prompt.tags.join(", "));
    setShowEditPromptDialog(true);
  };

  // 确认编辑提示词
  const handleEditPrompt = () => {
    if (!promptToEdit) return;
    
    if (!editPromptTitle.trim() || !editPromptContent.trim()) {
      toast({
        title: "错误",
        description: "标题和内容不能为空",
        variant: "destructive",
      });
      return;
    }
    
    const tags = editPromptTags.split(",").map(tag => tag.trim()).filter(Boolean);
    
    updatePrompt(promptToEdit.id, {
      title: editPromptTitle,
      content: editPromptContent,
      category: editPromptCategory,
      tags,
    });
    
    toast({
      title: "更新成功",
      description: "提示词已更新",
      variant: "success",
    });
    
    setShowEditPromptDialog(false);
    setPromptToEdit(null);
  };

  // 修改打开删除对话框函数支持直接传递prompt
  const handleOpenDeleteDialog = (
    eventOrPrompt: React.MouseEvent | Prompt,
    promptFromEvent?: Prompt
  ) => {
    let prompt: Prompt;
    
    if ('stopPropagation' in eventOrPrompt) {
      eventOrPrompt.stopPropagation();
      if (!promptFromEvent) return;
      prompt = promptFromEvent;
    } else {
      prompt = eventOrPrompt;
    }
    
    setPromptToDelete(prompt);
    setShowDeletePromptDialog(true);
  };

  // 确认删除提示词
  const handleDeletePrompt = () => {
    if (!promptToDelete) return;
    
    deletePrompt(promptToDelete.id);
    
    toast({
      title: "删除成功",
      description: "提示词已删除",
      variant: "warning",
    });
    
    setShowDeletePromptDialog(false);
    setPromptToDelete(null);
  };

  // 查看提示词详情 (修改点击逻辑)
  const handleViewPromptDetail = (prompt: Prompt) => {
    if (selectedPrompt?.id === prompt.id) {
      // 如果点击的是当前已选中的卡片，则取消选中 (关闭编辑器)
      setSelectedPrompt(null);
    } else {
      // 否则，选中新的卡片 (打开编辑器)
      setSelectedPrompt(prompt);
    }
  };

  return (
    <div className="flex flex-col h-full">
      
      {/* 当前分类/模式指示器 */}
      <div className="bg-muted/30 px-4 py-2 text-sm flex items-center">
        <span className="font-medium mr-2">当前查看:</span>
        <ViewBadge 
          showRecommended={showRecommended}
          showFavorites={showFavorites}
          activeCategory={activeCategory}
          categories={categories}
        />
        <span className="ml-auto text-muted-foreground">找到 {filteredPrompts.length} 个提示词</span>
        
        {/* 添加当前视图类型显示 */}
        {contentTitle && (
          <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
            <Icons.fileText className="h-3 w-3 mr-1" /> {contentTitle}
          </Badge>
        )}
      </div>

      {/* 标签过滤器 */}
      {allTags.length > 0 && (
        <div className="p-2 border-b">
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedTag === null ? "default" : "outline"} 
              className="cursor-pointer px-3 py-1 text-sm"
              onClick={() => setSelectedTag(null)}
            >
              全部
            </Badge>
            {allTags.map(tag => (
              <Badge 
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"} 
                className="cursor-pointer px-3 py-1 text-sm"
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 搜索结果提示 */}
      {searchTerm && (
        <div className="flex items-center px-4 py-2 bg-muted/50">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPrompts.map((prompt) => (
                <Card 
                  key={prompt.id}
                  className={`prompt-card cursor-pointer hover:shadow-md transition-shadow ${
                    selectedPrompt?.id === prompt.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleViewPromptDetail(prompt)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{prompt.title}</CardTitle>
                    <div className="flex">
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
                                toggleFavorite(prompt.id);
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
                    <div className="text-sm text-muted-foreground line-clamp-3">
                      {prompt.content}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      {prompt.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTag(tag === selectedTag ? null : tag);
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                      {!showRecommended && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(prompt.id);
                          }}
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
        <DialogContent className={isMobile ? "w-[90vw] max-w-[90vw]" : ""}>
          <DialogHeader>
            <DialogTitle>创建新提示词</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPromptDialog(false)}>
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
                <Label htmlFor="edit-tags">标签（用逗号分隔）</Label>
                <Input
                  id="edit-tags"
                  value={editPromptTags}
                  onChange={(e) => setEditPromptTags(e.target.value)}
                />
              </div>
            </div>
          </ScrollArea>
          {/* 底部工具栏 */}  
          <DialogFooter className="mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEditPromptDialog(false)}>
              取消
            </Button>
            <Button onClick={handleEditPrompt}>保存</Button>
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
            <Button variant="outline" onClick={() => setShowDeletePromptDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeletePrompt}>
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
}
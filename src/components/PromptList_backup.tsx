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
import { PromptEditForm } from "./PromptEditForm";
import { CreatePromptDialog } from "./CreatePromptDialog";
import { TagDeleteDialog } from "./TagDeleteDialog";
import { FontSelector } from "./FontSelector";
import { PromptVersionManager } from "./PromptVersionManager";
import { PromptRatingManager } from "./PromptRatingManager";
import { PromptComparisonManager } from "./PromptComparisonManager";
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
import ReactMarkdown from 'react-markdown';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{prompt.title}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyPromptContent(prompt.content)}
                title="复制提示词"
              >
                <Icons.copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
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
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 max-h-[calc(90vh-120px)]">
          <div className="space-y-4 p-1">
            <div>
              <h4 className="text-sm font-medium mb-2">提示词内容</h4>
              <div className="p-4 rounded-md bg-muted/50 text-sm whitespace-pre-wrap markdown-body">
                <ReactMarkdown>{prompt.content}</ReactMarkdown>
              </div>
            </div>
            
            {prompt.description && (
              <div>
                <h4 className="text-sm font-medium mb-2">描述</h4>
                <p className="text-sm text-muted-foreground">{prompt.description}</p>
              </div>
            )}
            
            {prompt.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">标签</h4>
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              创建时间: {new Date(prompt.createdAt).toLocaleString()}
              {prompt.updatedAt !== prompt.createdAt && (
                <span className="ml-4">
                  更新时间: {new Date(prompt.updatedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter>
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
    deleteTag,
    getTagsForCategory
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
  
  // 编辑对话框图片状态
  const [editDialogImages, setEditDialogImages] = useState<PromptImage[]>([]);
  const [selectedEditDialogImageIndex, setSelectedEditDialogImageIndex] = useState<number | null>(null);
  const [editDialogImageCaption, setEditDialogImageCaption] = useState("");
  const editDialogFileInputRef = useRef<HTMLInputElement>(null);
  
  // 标签管理相关状态
  const TAGS_DISPLAY_LIMIT = 10;
  const [showAllTags, setShowAllTags] = useState(false);
  
  // 标签删除对话框状态
  const [showTagDeleteDialog, setShowTagDeleteDialog] = useState(false);
  const [tagToDelete, setTagToDelete] = useState('');
  const [tagAffectedCount, setTagAffectedCount] = useState(0);
  
  // 版本管理、评分和对比功能状态
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [enhancementPrompt, setEnhancementPrompt] = useState<Prompt | null>(null);

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
      images: newPromptImages.length > 0 ? newPromptImages : undefined,
      version: 1
    });
    
    toast({
      title: "创建成功",
      description: "新的提示词已创建",
      variant: "success",
    });
    
    // 重置表单
    setNewPromptTitle("");
    setNewPromptContent("");
    setNewPromptTags("");
    setNewPromptImages([]);
    setSelectedNewImageIndex(null);
    setNewImageCaption("");
    setShowNewPromptDialog(false);
  }, [newPromptTitle, newPromptContent, newPromptCategory, newPromptTags, newPromptImages, addPrompt, toast]);

  // 处理查看提示词详情
  const handleViewPromptDetail = useCallback((prompt: Prompt) => {
    setDetailPrompt(prompt);
    setShowDetailDialog(true);
  }, []);

  // 处理复制提示词
  const handleCopyPrompt = useCallback((content: string) => {
    copyPromptContent(content);
  }, [copyPromptContent]);

  // 处理收藏切换
  const handleToggleFavorite = useCallback((e: React.MouseEvent, promptId: string) => {
    e.stopPropagation();
    toggleFavorite(promptId);
  }, [toggleFavorite]);

  // 处理标签点击
  const handleTagClick = useCallback((e: React.MouseEvent | null, tag: string | null) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedTag(tag);
  }, [setSelectedTag]);

  // 处理删除标签
  const handleDeleteTag = (tag: string) => {
    // 计算受影响的提示词数量（仅当前分类）
    const targetPrompts = activeCategory 
      ? prompts.filter(prompt => prompt.category === activeCategory && prompt.tags.includes(tag))
      : prompts.filter(prompt => prompt.tags.includes(tag));
    
    setTagToDelete(tag);
    setTagAffectedCount(targetPrompts.length);
    setShowTagDeleteDialog(true);
  };
  
  // 确认删除标签
  const confirmDeleteTag = () => {
    if (tagToDelete) {
      // 使用分类范围删除标签
      deleteTag(tagToDelete, activeCategory);
      
      const scopeDescription = activeCategory 
        ? `当前分类下的所有提示词`
        : `所有提示词`;
      
      toast({
        title: "删除成功",
        description: `标签 "${tagToDelete}" 已从${scopeDescription}中删除`,
        variant: "success",
      });
      setTagToDelete('');
      setTagAffectedCount(0);
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
                    onClick={() => {
                      setNewPromptCategory(activeCategory || categories[0]?.id || "general");
                      setShowNewPromptDialog(true);
                    }}
                  >
                    <Icons.plus className="h-4 w-4 mr-2" />
                    新建提示词
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${isEditPanelOpen ? '' : 'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'} gap-4`}>
              {filteredPrompts.map((prompt) => (
                <Card 
                  key={prompt.id}
                  className={cn(
                    "prompt-card cursor-pointer transition-all duration-200 ease-in-out rounded-md p-0.5 min-w-[280px]",
                    "focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:shadow-lg",
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
                                // handleOpenEditDialog(prompt);
                              }}>
                                <Icons.pencil className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              if (showRecommended) {
                                // handleAddFromRecommended(prompt);
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
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  setEnhancementPrompt(prompt);
                                  setShowVersionDialog(true);
                                }}>
                                  <Icons.history className="mr-2 h-4 w-4" />
                                  版本管理
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  setEnhancementPrompt(prompt);
                                  setShowRatingDialog(true);
                                }}>
                                  <Icons.star className="mr-2 h-4 w-4" />
                                  评分管理
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  setEnhancementPrompt(prompt);
                                  setShowComparisonDialog(true);
                                }}>
                                  <Icons.gitCompare className="mr-2 h-4 w-4" />
                                  模型对比
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // handleOpenDeleteDialog(prompt);
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
                    <div className="text-sm text-muted-foreground line-clamp-3 h-[4.5em] markdown-body">
                      <ReactMarkdown>{prompt.content}</ReactMarkdown>
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

      {/* 提示词详情查看对话框 */}
      <PromptDetailDialog 
        prompt={detailPrompt} 
        open={showDetailDialog} 
        onOpenChange={setShowDetailDialog} 
      />

      {/* 版本管理对话框 */}
      {enhancementPrompt && (
        <PromptVersionManager
          prompt={enhancementPrompt}
          open={showVersionDialog}
          onOpenChange={setShowVersionDialog}
          onVersionRestore={(updatedPrompt) => {
            updatePrompt(enhancementPrompt.id, updatedPrompt);
            setShowVersionDialog(false);
          }}
          onVersionCreate={(updatedPrompt) => {
            updatePrompt(enhancementPrompt.id, updatedPrompt);
          }}
        />
      )}

      {/* 评分管理对话框 */}
      {enhancementPrompt && (
        <PromptRatingManager
          prompt={enhancementPrompt}
          open={showRatingDialog}
          onOpenChange={setShowRatingDialog}
          onRatingUpdate={(updatedPrompt) => {
            updatePrompt(enhancementPrompt.id, updatedPrompt);
            setShowRatingDialog(false);
          }}
        />
      )}

      {/* 对比管理对话框 */}
      {enhancementPrompt && (
        <PromptComparisonManager
          prompt={enhancementPrompt}
          open={showComparisonDialog}
          onOpenChange={setShowComparisonDialog}
        />
      )}

      {/* 自定义标签删除确认对话框 */}
      <TagDeleteDialog
        isOpen={showTagDeleteDialog}
        onClose={() => setShowTagDeleteDialog(false)}
        onConfirm={confirmDeleteTag}
        tagName={tagToDelete}
        affectedPromptsCount={tagAffectedCount}
      />
    </div>
  );
});

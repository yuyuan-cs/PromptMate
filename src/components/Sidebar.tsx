import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { usePrompts } from "@/hooks/usePrompts";
import { Icons } from "@/components/ui/icons";
import { DataImportExport } from "./DataImportExport";
import { useSettings } from "@/hooks/useSettings";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FontSelector } from "./FontSelector";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { CategoryManager } from "./category/CategoryManager";
import { Category } from "@/types";
import { ViewBadge } from "./category/ViewBadge";
import { CategoryIcon } from "./category/CategoryIcon";
import { IconSelector } from "./category/IconSelector";
import { ThemePreview } from "./ThemePreview";
import { themePresets } from "@/lib/themes";
import { ThemeType } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import React from "react";
import { ThemeCustomizer } from "./ThemeCustomizer";
import { Settings } from "@/types";
import { About } from './About';
import { QuickCreatePrompt } from "./QuickCreatePrompt";
import { CreatePromptDialog } from "./CreatePromptDialog";
import { AISettings } from "./AISettings";
import { useToast } from "@/hooks/use-toast";

// 侧边栏显示模式类型
type SidebarMode = "expanded" | "collapsed";

export function Sidebar({ className }: { className?: string }) {
  const {
    activeCategory,
    setActiveCategory,
    categories, 
    showFavorites,
    setShowFavorites,
    showRecommended,
    setShowRecommended,
    setSearchTerm,
    setSelectedTag,
    prompts,
    addPrompt,
    selectedPrompt,
    setSelectedPrompt,
    resetAllFilters,
    forceRefresh,
    updateCategory,
    deleteCategory,
    updateCategoriesOrder,
    allTags
  } = usePrompts();
  
  const { settings, toggleTheme, updateSettings, availableFonts } = useSettings();
  const { toast } = useToast();

  // 新建提示词对话框状态
  const [showNewPromptDialog, setShowNewPromptDialog] = useState(false);
  const [newPromptCategoryId, setNewPromptCategoryId] = useState<string | null>(null);

  const [showDataImportExport, setShowDataImportExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(180); // 默认180px
  const [isDragging, setIsDragging] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("expanded");
  const [settingsPanel, setSettingsPanel] = useState<"appearance" | "data" | "ai" | "about">("appearance");
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingIcon, setEditingIcon] = useState("");
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [tempCustomTheme, setTempCustomTheme] = useState<Settings['customTheme']>(
    settings.customTheme || {
      background: "#ffffff",
      foreground: "#000000",
      primary: "#3b82f6",
      accent: "#f1f5f9",
    }
  );
  
  // 当设置对话框关闭时，重置面板状态
  useEffect(() => {
    if (!showSettings) {
      // 延迟重置面板，确保动画完成后再切换
      const timer = setTimeout(() => {
        setSettingsPanel("appearance");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showSettings]);
  
  const draggingRef = useRef<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // 计算每个分类下的提示词数量
  const promptCounts = prompts.reduce((acc, prompt) => {
    acc[prompt.category] = (acc[prompt.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 计算收藏的提示词数量
  const favoritesCount = prompts.filter(prompt => prompt.isFavorite).length;

  // 添加调试日志
  useEffect(() => {
    console.log('Sidebar state:', {
      activeCategory,
      showFavorites,
      showRecommended,
      categories
    });
  }, [activeCategory, showFavorites, showRecommended, categories]);

  // 处理点击分类
  const handleCategoryClick = (categoryId: string) => {
    console.log('Category clicked:', categoryId);
    
    // 先设置一个缓存变量
    const targetCategory = categoryId;
    
    // 清空所有其他状态
    setShowFavorites(false);
    setShowRecommended(false);
    setSearchTerm("");
    setSelectedTag(null);
    setSelectedPrompt(null);
    
    // 最后设置当前分类
    setActiveCategory(targetCategory);
    
    // 强制刷新
    forceRefresh();
    
    // 添加强制刷新的调试日志
    console.log('分类已更新:', targetCategory);
  };

  // 处理点击收藏
  const handleFavoritesClick = () => {
    console.log('Favorites clicked');
    
    // 清空所有其他状态
    setActiveCategory(null);
    setShowRecommended(false);
    setSearchTerm("");
    setSelectedTag(null);
    setSelectedPrompt(null);
    
    // 设置收藏状态
    setShowFavorites(true);
    
    // 强制刷新
    forceRefresh();
    
    // 添加强制刷新的调试日志
    console.log('收藏已更新:', true);
  };

  // 处理点击推荐模板
  const handleRecommendedClick = () => {
    console.log('Recommended clicked');
    
    // 清空所有其他状态
    setActiveCategory(null);
    setShowFavorites(false);
    setSearchTerm("");
    setSelectedTag(null);
    setSelectedPrompt(null);
    
    // 设置推荐状态
    setShowRecommended(true);
    
    // 强制刷新
    forceRefresh();
    
    // 添加强制刷新的调试日志
    console.log('推荐已更新:', true);
  };

  // 处理点击全部提示词
  const handleAllPromptsClick = () => {
    console.log('All prompts clicked');
    
    // 使用全局重置函数
    resetAllFilters();
    
    // 添加强制刷新的调试日志
    console.log('所有状态已重置');
  };

  // 数据变更后刷新
  const handleDataChanged = () => {
    // 重置为默认视图
    handleAllPromptsClick();
    // 这里可以添加额外的刷新逻辑
  };

  // 侧边栏宽度调整处理
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
    setIsDragging(true);
    
    // 添加全局事件监听
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 处理鼠标移动事件
  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingRef.current) return;
    
    const deltaX = e.clientX - startXRef.current;
    let newWidth = startWidthRef.current + deltaX;
    
    // 设置最小和最大宽度限制
    newWidth = Math.max(60, Math.min(450, newWidth));
    
    // 如果宽度小于100px，自动切换到折叠模式
    if (newWidth < 100 && sidebarMode === "expanded") {
      setSidebarMode("collapsed");
    } else if (newWidth >= 100 && sidebarMode === "collapsed") {
      setSidebarMode("expanded");
    }
    
    setSidebarWidth(newWidth);
  };

  // 处理鼠标抬起事件
  const handleMouseUp = () => {
    draggingRef.current = false;
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // 更新鼠标样式
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.cursor = '';
    }
    
    return () => {
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  // 清理事件监听
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // 切换侧边栏模式
  const toggleSidebarMode = () => {
    const newMode = sidebarMode === "expanded" ? "collapsed" : "expanded";
    setSidebarMode(newMode);
    
    // 根据模式自动调整宽度
    if (newMode === "collapsed") {
      setSidebarWidth(50);
    } else {
      setSidebarWidth(180);
    }
    
    // 重置所有tooltip的状态，防止收起侧边栏时所有tooltip都显示
  };

  const isCollapsed = sidebarMode === "collapsed";

  // 添加键盘事件处理函数
  const handleKeyDown = (e: React.KeyboardEvent, category: Category) => {
    if (e.key === "F2") {
      e.preventDefault();
      handleEditCategory(category);
    } else if (e.key === "Escape") {
      setEditingCategory(null);
    }
  };

  // 选择一个分类进行编辑
  const handleEditCategory = (category: Category) => {
    // 如果侧边栏是折叠状态，自动展开
    if (sidebarMode === "collapsed") {
      setSidebarMode("expanded");
      setSidebarWidth(180);
    }

    setEditingCategory(category.id);
    setEditingName(category.name);
    setEditingIcon(category.icon || "");
  };

  // 添加重命名处理函数
  const handleRename = (categoryId: string) => {
    if (editingName.trim()) {
      // 更新分类名称和图标
      updateCategory(categoryId, editingName.trim(), editingIcon);
      setEditingCategory(null);
    }
  };

  // 添加删除处理函数
  const handleDelete = (categoryId: string) => {
    // 确认删除
    if (window.confirm("确定要删除这个分类吗？")) {
      // 删除分类
      deleteCategory(categoryId);
      // 如果删除的是当前选中的分类，切换到全部提示词
      if (activeCategory === categoryId) {
        handleAllPromptsClick();
      }
    }
  };

  // 处理右键菜单新建提示词
  const handleContextMenuNewPrompt = (categoryId: string) => {
    setNewPromptCategoryId(categoryId);
    setShowNewPromptDialog(true);
  };



  // 应用自定义主题
  const applyCustomTheme = () => {
    updateSettings({ 
      theme: 'custom', 
      customTheme: tempCustomTheme 
    });
    setShowThemeCustomizer(false);
  };

  // 拖拽状态
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);

  // 处理拖拽开始
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, categoryId: string) => {
    e.dataTransfer.setData('text/plain', categoryId);
    setDraggedCategory(categoryId);
    
    // 设置拖拽图像
    if (e.currentTarget.firstChild instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget.firstChild, 20, 20);
    }
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    setDraggedCategory(null);
    setDragOverCategory(null);
  };

  // 处理拖拽悬停
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, categoryId: string) => {
    e.preventDefault();
    if (draggedCategory === categoryId) return;
    setDragOverCategory(categoryId);
  };

  // 处理拖拽离开
  const handleDragLeave = () => {
    setDragOverCategory(null);
  };

  // 处理放置
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetCategoryId: string) => {
    e.preventDefault();
    const draggedCategoryId = e.dataTransfer.getData('text/plain');
    
    if (draggedCategoryId === targetCategoryId) return;
    
    // 找到拖拽的分类和目标分类的索引
    const draggedIndex = categories.findIndex(cat => cat.id === draggedCategoryId);
    const targetIndex = categories.findIndex(cat => cat.id === targetCategoryId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // 创建新的分类数组并调整顺序
    const newCategories = [...categories];
    const [movedCategory] = newCategories.splice(draggedIndex, 1);
    
    // 关键修复：计算正确的插入位置
    // 当目标索引大于拖拽索引时，由于我们已经移除了一个元素，目标索引需要减1
    let insertIndex = targetIndex;
    if (targetIndex > draggedIndex) {
      insertIndex = targetIndex - 1;
    }
    
    newCategories.splice(insertIndex, 0, movedCategory);
    
    // 更新分类顺序
    updateCategoriesOrder(newCategories);
    
    // 重置拖拽状态
    setDraggedCategory(null);
    setDragOverCategory(null);
  };

  // 处理拖拽到末尾
  const handleDropToEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const draggedCategoryId = e.dataTransfer.getData('text/plain');
    const draggedIndex = categories.findIndex(cat => cat.id === draggedCategoryId);
    
    if (draggedIndex === -1) return;
    
    // 创建新的分类数组并调整顺序
    const newCategories = [...categories];
    const [movedCategory] = newCategories.splice(draggedIndex, 1);
    
    // 插入到末尾
    newCategories.push(movedCategory);
    
    // 更新分类顺序
    updateCategoriesOrder(newCategories);
    
    // 重置拖拽状态
    setDraggedCategory(null);
    setDragOverCategory(null);
  };

  // 渲染侧边栏
  return (
    <div 
      ref={sidebarRef}
      className={cn(
        "h-full border-r relative transition-all duration-300 flex-shrink-0 bg-background flex flex-col",
        isCollapsed && "w-[60px]",
        !isCollapsed && "sidebar-dynamic-width",
        className
      )}
      style={!isCollapsed ? { '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties : undefined}
    >
      {/* 拖拽调整区域 - 整个右边缘 */}
      <div
        className="absolute top-0 right-0 w-4 h-full cursor-col-resize z-30 transform translate-x-0.5"
        onMouseDown={handleMouseDown}
      />

      {/* 顶部标题和按钮 */}
      <div className={cn(
        "flex items-center justify-between py-3 flex-shrink-0",
        isCollapsed ? "px-2" : "px-4"
      )}>
        {!isCollapsed && (
          <h2 className="text-lg font-medium">
            PromptMate
          </h2>
        )}
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebarMode}
                className={cn(
                  "rounded-full",
                  isCollapsed ? "mx-auto" : "ml-auto"
                )}
              >
                <Icons.chevronLeft
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isCollapsed ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? "展开侧边栏" : "收起侧边栏"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* 中间内容区域 */}
      <ScrollArea className="flex-1">
        <div className={cn(
          "h-full pb-4", 
          isCollapsed ? "px-2" : "px-4"
        )}>
          {/* 按钮组 */}
          <div className="py-3">
            <div className="space-y-1">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "rounded-xl group hover:scale-105 transition-transform",
                        isCollapsed
                          ? "h-9 w-9 p-0 mx-auto flex items-center justify-center"
                          : "w-full justify-start py-1 px-3"
                      )}
                      onClick={handleAllPromptsClick}
                    >
                      <Icons.layout className="h-4 w-4" />
                      {!isCollapsed && "全部提示词"}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      全部提示词
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showFavorites ? "default" : "ghost"}
                      className={cn(
                        "rounded-xl group hover:scale-105 transition-transform",
                        showFavorites ? "" : (activeCategory === null && !showRecommended ? "" : "hover:bg-accent hover:text-accent-foreground"),
                        isCollapsed
                          ? "h-9 w-9 p-0 mx-auto flex items-center justify-center"
                          : "w-full justify-start py-1 px-3"
                      )}
                      size="sm"
                      onClick={handleFavoritesClick}
                      >
                      <Icons.starFilled className="h-4 w-4" />
                      {!isCollapsed && "收藏提示词"}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      收藏提示词
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showRecommended ? "default" : "ghost"}
                      className={cn(
                        "rounded-xl group hover:scale-105 transition-transform",
                        showRecommended ? "" : (activeCategory === null && !showFavorites ? "" : "hover:bg-accent hover:text-accent-foreground"),
                        isCollapsed
                          ? "h-9 w-9 p-0 mx-auto flex items-center justify-center"
                          : "w-full justify-start py-1 px-3"
                      )}
                      onClick={handleRecommendedClick}
                    >
                      <Icons.gift className="h-4 w-4" />
                      {!isCollapsed && "推荐模板"}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      推荐模板
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* 分类列表 */}
          <div className="mt-6">
            {/* 分类列表标题 */}
            <div className={cn(
              "flex items-center justify-between mb-2 px-2 w-full",
              isCollapsed ? "justify-center" : ""
            )}>

              {!isCollapsed && (
                <h2 className="text-sm font-medium text-muted-foreground">
                  分类
                </h2>
              )}
              {/* 管理分类 */}
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowCategoryManager(true)}
                      className={cn(
                        "rounded-full h-7 w-7 hover:scale-105 color transition-transform",
                        isCollapsed ? "mx-auto" : "ml-auto"
                      )}
                    >
                      <Icons.folderPlus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    管理分类
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* 分类列表内容 */}
            <div className="space-y-1">
              {categories.map((category) => (
                <TooltipProvider key={category.id} delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <div
                            className={cn(
                              "w-full",
                              draggedCategory === category.id && "opacity-50",
                              dragOverCategory === category.id && "border-t-2 border-primary"
                            )}
                            onKeyDown={(e) => handleKeyDown(e, category)}
                            tabIndex={0}
                            draggable={editingCategory !== category.id}
                            onDragStart={(e) => handleDragStart(e, category.id)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, category.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, category.id)}
                          >
                            {editingCategory === category.id ? (
                              <div className="flex flex-col p-1 space-y-2">
                                {/* 第一行：图标选择和文字输入 */}
                                <div className="flex items-center gap-2 w-full">
                                  <IconSelector
                                    value={editingIcon || category.icon || "folder"}
                                    onChange={(iconName) => setEditingIcon(iconName)}
                                  />
                                  {/* 编辑分类名称 */}
                                  <Input
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleRename(category.id);
                                      } else if (e.key === "Escape") {
                                        setEditingCategory(null);
                                      }
                                    }}
                                    onBlur={() => handleRename(category.id)}
                                    autoFocus
                                    className="h-8 w-full min-w-0"
                                  />
                                </div>
                                
                                {/* 第二行：操作按钮 */}
                                <div className="flex justify-center gap-0.5 w-auto px-6">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingCategory(null)}
                                    className="h-6 hover:scale-105 transition-transform"
                                  >
                                    <Icons.x className="h-4 w-4" />
                                    取消
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRename(category.id)}
                                    className="h-6 hover:scale-105 transition-transform"
                                  >
                                    <Icons.check className="h-4 w-4" />
                                    确定
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <TooltipProvider delayDuration={100}>
                                {/* 分类名称 */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant={activeCategory === category.id ? "default" : "ghost"}
                                      className={cn(
                                        "rounded-xl group hover:scale-105 transition-transform",
                                        activeCategory === category.id ? "bg-primary/10 text-primary hover:bg-primary/15" : "hover:bg-muted/50",
                                        isCollapsed
                                          ? "h-9 w-9 p-0 mx-auto flex items-center justify-center"
                                          : "w-full justify-start py-1 px-3"
                                      )}
                                      onClick={() => handleCategoryClick(category.id)}
                                    >
                                      {/* 分类图标 */}
                                      <CategoryIcon iconName={category.icon} />
                                      {/* 分类名称 */}
                                      {!isCollapsed && category.name}
                                      {/* 拖拽提示图标 */}
                                      {!isCollapsed && (
                                        <Icons.moveVertical className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-50" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  {isCollapsed && (
                                    <TooltipContent side="right">
                                      {category.name}
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => handleEditCategory(category)}>
                            编辑
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleContextMenuNewPrompt(category.id)}>
                            <Icons.plus className="h-4 w-4 mr-2" />
                            新建提示词
                          </ContextMenuItem>
                          <ContextMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(category.id)}
                          >
                            删除
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">
                        {category.name}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
              
              {/* 列表末尾的拖拽区域 */}
              {draggedCategory && (
                <div 
                  className={cn(
                    "h-8 w-full rounded-md border-0 border-dashed border-primary/20",
                    dragOverCategory === "end" && "border-primary bg-primary/5"
                  )}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverCategory("end");
                    }}
                    onDragLeave={() => setDragOverCategory(null)}
                    onDrop={handleDropToEnd}
                />
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* 底部按钮 */}
      <div className={cn(
        "border-t p-3 flex-shrink-0 mt-auto bg-background",
        isCollapsed ? "space-y-2 h-auto flex flex-col items-center" : "flex items-center h-12 justify-between"
      )}>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={cn(
                  "rounded-full h-8 w-8",
                  isCollapsed ? "mx-auto" : ""
                )}
              >
                {settings.theme === 'dark' ? (
                  <Icons.sun className="h-4 w-4" />
                ) : (
                  <Icons.moon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {settings.theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        
        {/* 新建提示词 */}
        <QuickCreatePrompt
          variant="icon"
          className={cn(
            "bg-primary/10 text-primary hover:bg-primary/20",
            isCollapsed ? "mx-auto" : ""
          )}
          options={{
            defaultCategory: activeCategory || categories[0]?.id || "general"
          }}
        />
        
        {/* 设置 */}
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSettingsPanel("appearance");
                  setShowSettings(true);
                }}
                className={cn(
                  "rounded-full h-8 w-8 hover:scale-95 transition-transform",
                  isCollapsed ? "mx-auto" : ""
                )}
              >
                <Icons.settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              设置
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>


      {/* 设置对话框 */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[650px] md:max-w-[750px]">
          <DialogHeader>
            <DialogTitle>应用设置</DialogTitle>
            <DialogDescription>
              自定义应用外观和行为
            </DialogDescription>
          </DialogHeader>
          
          {/* 设置导航按钮 */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <Button 
              variant={settingsPanel === "appearance" ? "default" : "outline"} 
              onClick={() => setSettingsPanel("appearance")}
              className="w-full"
            >
              <Icons.palette className="mr-2 h-4 w-4" />
              外观设置
            </Button>
            <Button 
              variant={settingsPanel === "data" ? "default" : "outline"} 
              onClick={() => setSettingsPanel("data")}
              className="w-full"
            >
              <Icons.fileJson className="mr-2 h-4 w-4" />
              数据管理
            </Button>
            <Button 
              variant={settingsPanel === "ai" ? "default" : "outline"} 
              onClick={() => setSettingsPanel("ai")}
              className="w-full"
            >
              <Icons.star className="mr-2 h-4 w-4" />
              AI设置
            </Button>
            <Button 
              variant={settingsPanel === "about" ? "default" : "outline"} 
              onClick={() => setSettingsPanel("about")}
              className="w-full"
            >
              <Icons.info className="mr-2 h-4 w-4" />
              关于
            </Button>
          </div>
          
          {/* 外观设置面板 */}
          {settingsPanel === "appearance" && (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="py-2 space-y-6">
                
                {/* 字体设置 */}
                <div className="space-y-2">
                  <Label htmlFor="font">字体</Label>
                  <FontSelector
                    value={settings.font}
                    onChange={(font) => updateSettings({ font })}
                  />
                </div>
                
                {/* 主题设置 */}
                <div className="space-y-2">
                  <Label>主题</Label>
                  
                  {/* 系统主题部分 */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">默认主题</h3>
                    <div className="grid grid-cols-3 gap-6  px-2">
                      {themePresets
                        .filter(theme => theme.isDefault)
                        .map((theme) => (
                          <ThemePreview
                            key={theme.id}
                            theme={theme}
                            selected={settings.theme === theme.id}
                            onClick={() => updateSettings({ theme: theme.id as ThemeType })}
                          />
                        ))}
                    </div>
                  </div>
                  
                  {/* 自定义主题部分 */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">自定义主题</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 px-2">
                      {themePresets
                        .filter(theme => !theme.isDefault)
                        .map((theme) => (
                          <ThemePreview
                            key={theme.id}
                            theme={theme}
                            selected={settings.theme === theme.id}
                            onClick={() => updateSettings({ theme: theme.id as ThemeType })}
                          />
                        ))}
                      
                      {/* 自定义主题按钮 */}
                      <div 
                        className="flex flex-col items-center justify-center rounded-lg overflow-hidden border cursor-pointer h-32 hover:shadow-md hover:scale-102 transition-all"
                        onClick={() => setShowThemeCustomizer(true)}
                      >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-muted">
                          <Icons.palette className="h-6 w-6 text-primary" />
                        </div>
                        <span className="mt-2 text-sm font-medium">自定义主题</span>
                        <span className="text-xs text-muted-foreground">创建专属配色</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 窗口置顶设置 */}
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="always-on-top" className="flex-1">窗口置顶</Label>
                  <Switch 
                    id="always-on-top"
                    checked={settings.alwaysOnTop}
                    onCheckedChange={(checked) => {
                      updateSettings({ alwaysOnTop: checked });
                      // 简化置顶逻辑，只改变设置
                    }}
                  />
                </div>
              </div>
            </ScrollArea>
          )}
          
          {/* 数据管理面板 */}
          {settingsPanel === "data" && (
            <div className="py-4">
              <DataImportExport 
                inline={true} 
                open={true} 
                onOpenChange={() => {}} 
                onDataChanged={handleDataChanged}
              />
            </div>
          )}

          {/* AI设置面板 */}
          {settingsPanel === "ai" && (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="py-2">
                <AISettings />
              </div>
            </ScrollArea>
          )}

          {/* 关于面板 */}
          {settingsPanel === "about" && (
            <ScrollArea className="h-[60vh] pr-4">
              <About />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* 分类管理对话框 */}
      <CategoryManager 
        open={showCategoryManager} 
        onOpenChange={setShowCategoryManager} 
      />

      {/* 自定义主题对话框 */}
      <Dialog open={showThemeCustomizer} onOpenChange={setShowThemeCustomizer}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>自定义主题</DialogTitle>
            <DialogDescription>
              选择您喜欢的颜色，创建个性化主题
            </DialogDescription>
          </DialogHeader>
          <ThemeCustomizer
            customTheme={settings.theme === 'custom' ? settings.customTheme : tempCustomTheme}
            onChange={setTempCustomTheme}
            onApply={applyCustomTheme}
          />
        </DialogContent>
      </Dialog>

      {/* 新建提示词对话框 */}
      <CreatePromptDialog
        open={showNewPromptDialog}
        onOpenChange={setShowNewPromptDialog}
        options={{
          defaultCategory: newPromptCategoryId || undefined,
          onSuccess: () => {
            setShowNewPromptDialog(false);
            setNewPromptCategoryId(null);
          }
        }}
      />
    </div>
  );
}

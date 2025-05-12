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
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CategoryManager } from "./category/CategoryManager";
import { Category } from "@/types";
import { ViewBadge } from "./category/ViewBadge";
import { CategoryIcon } from "./category/CategoryIcon";
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
import * as LucideIcons from "lucide-react";
import React from "react";
import { ThemeCustomizer } from "./ThemeCustomizer";
import { Settings } from "@/types";
import { About } from './About';
import { aiIcons, getIconComponent } from "@/lib/icons";
import { generateId } from "@/lib/data";
import { PromptImage } from "@/types";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  const [showDataImportExport, setShowDataImportExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState("");
  const [newPromptContent, setNewPromptContent] = useState("");
  const [newPromptCategory, setNewPromptCategory] = useState("");
  const [newPromptTags, setNewPromptTags] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(180); // 默认180px
  const [isDragging, setIsDragging] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("expanded");
  const [settingsPanel, setSettingsPanel] = useState<"appearance" | "data" | "about">("appearance");
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingIcon, setEditingIcon] = useState("");
  const [iconSearch, setIconSearch] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
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
  const [showNewPromptDialog, setShowNewPromptDialog] = useState(false);
  
  // 添加图片相关状态
  const [newPromptImages, setNewPromptImages] = useState<PromptImage[]>([]);
  const [selectedNewImageIndex, setSelectedNewImageIndex] = useState<number | null>(null);
  const [newImageCaption, setNewImageCaption] = useState("");
  const newFileInputRef = useRef<HTMLInputElement>(null);

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

  // 添加图片上传功能
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
      setNewImageCaption("");
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

  // 处理创建新提示词
  const handleCreatePrompt = () => {
    if (!newPromptTitle.trim() || !newPromptContent.trim()) {
      toast({
        title: "错误",
        description: "标题和内容不能为空",
        variant: "destructive",
      });
      return;
    }
    
    // 修改标签处理逻辑，确保正确分割
    const tags = newPromptTags.split(/[,，;；]/).map(tag => tag.trim()).filter(Boolean);
    
    addPrompt({
      title: newPromptTitle,
      content: newPromptContent,
      category: newPromptCategory || activeCategory || categories[0]?.id || "general",
      tags,
      isFavorite: false,
      images: newPromptImages, // 添加图片数据
    });
    
    toast({
      title: "创建成功",
      description: "新的提示词已创建",
      variant: "success",
    });
    
    // 重置表单
    setNewPromptTitle("");
    setNewPromptContent("");
    setNewPromptCategory("");
    setNewPromptTags("");
    setNewPromptImages([]);
    setSelectedNewImageIndex(null);
    setNewImageCaption("");
    setShowNewPromptDialog(false);
  };

  // 打开新建提示词对话框
  const openNewPromptDialog = () => {
    setNewPromptCategory(activeCategory || categories[0]?.id || "general");
    setNewPromptImages([]);
    setSelectedNewImageIndex(null);
    setNewImageCaption("");
    setShowNewPromptDialog(true);
  };

  // 添加标签选择功能
  const handleAddTag = (tag: string) => {
    const currentTags = newPromptTags.split(/[,，;；]/).map(t => t.trim()).filter(Boolean);
    
    // 检查标签是否已存在
    if (!currentTags.includes(tag)) {
      // 如果当前已有标签，则添加逗号和新标签
      const newTagsString = currentTags.length > 0 
        ? `${newPromptTags.trim()}${newPromptTags.trim().endsWith(',') ? ' ' : ', '}${tag}` 
        : tag;
      
      setNewPromptTags(newTagsString);
    }
  };

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

  // 使用防抖处理搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(iconSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [iconSearch]);

  // 过滤并限制显示的图标数量
  const filteredIcons = useMemo(() => {
    return aiIcons
      .filter(name => name.toLowerCase().includes(debouncedSearch.toLowerCase()))
      .slice(0, 50);
  }, [debouncedSearch]);

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
        className
      )}
      style={!isCollapsed ? { width: `${sidebarWidth}px` } : undefined}
    >
      {/* 拖拽调整区域 - 整个右边缘 */}
      <div
        className="absolute top-0 right-0 w-4 h-full cursor-col-resize z-30"
        onMouseDown={handleMouseDown}
        style={{transform: 'translateX(2px)'}}
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
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0 hover:scale-105 transition-transform"
                                      >
                                        <CategoryIcon iconName={editingIcon || category.icon} />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[300px] p-2" align="start" side="right" sideOffset={5}>
                                      <div className="w-full p-2">
                                        <Input
                                          placeholder="搜索图标..."
                                          value={iconSearch}
                                          onChange={(e) => setIconSearch(e.target.value)}
                                          className="mb-1 h-6"
                                        />
                                        <div className="grid grid-cols-6 gap-2 max-h-[300px] overflow-y-auto">
                                          {filteredIcons.map(name => (
                                            <Button
                                              key={name}
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 hover:bg-muted/50"
                                              onClick={() => {
                                                setEditingIcon(name);
                                                setShowIconPicker(false);
                                              }}
                                            >
                                              {React.createElement(getIconComponent(name), { className: "h-4 w-4" })}
                                            </Button>
                                          ))}
                                        </div>
                                      </div>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
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
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full h-8 w-8 bg-primary/10 text-primary hover:bg-primary/20 hover:scale-95 transition-transform",
                  isCollapsed ? "mx-auto" : ""
                )}
                onClick={() => setShowNewPromptDialog(true)}
              >
                <Icons.plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              新建提示词
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
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

      {/* 对话框组件 */}
      <Dialog open={showNewPromptDialog} onOpenChange={(open) => {
        if (!open) {
          // 关闭对话框时重置所有状态
          setNewPromptTitle("");
          setNewPromptContent("");
          setNewPromptCategory("");
          setNewPromptTags("");
          setNewPromptImages([]);
          setSelectedNewImageIndex(null);
          setNewImageCaption("");
        }
        setShowNewPromptDialog(open);
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>新建提示词</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 max-h-[calc(90vh-130px)] overflow-auto">
            <div className="space-y-4 py-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="title">标题</Label>
                <Input 
                  id="title" 
                  placeholder="请输入提示词标题" 
                  value={newPromptTitle}
                  onChange={(e) => setNewPromptTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">内容</Label>
                <Textarea 
                  id="content" 
                  placeholder="请输入提示词内容" 
                  className="h-[200px]"
                  value={newPromptContent}
                  onChange={(e) => setNewPromptContent(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">分类</Label>
                <Select 
                  value={newPromptCategory || activeCategory || categories[0]?.id || "general"}
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
                <Label htmlFor="tags">标签</Label>
                <div className="space-y-2">
                  <Input
                    id="tags" 
                    placeholder="输入标签，用逗号、分号分隔"
                    value={newPromptTags}
                    onChange={(e) => setNewPromptTags(e.target.value)}
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
                            className="cursor-pointer px-2 py-0.5 text-[8px] font-normal hover:bg-primary/10"
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
              
              {/* 图片上传区域 */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="newPromptImages">参考图片</Label>
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
                    id="newPromptImages"
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
            <Button variant="outline" onClick={() => setShowNewPromptDialog(false)}>取消</Button>
            <Button onClick={handleCreatePrompt}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          <div className="grid grid-cols-3 gap-2 mb-4">
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
    </div>
  );
}

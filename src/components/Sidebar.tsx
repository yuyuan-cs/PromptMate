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
    deleteCategory
  } = usePrompts();
  
  const { settings, toggleTheme, updateSettings, availableFonts } = useSettings();
  const { toast } = useToast();

  const [showDataImportExport, setShowDataImportExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState("");
  const [newPromptContent, setNewPromptContent] = useState("");
  const [newPromptCategory, setNewPromptCategory] = useState("");
  const [newPromptTags, setNewPromptTags] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(260);
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
      setSidebarWidth(60);
    } else {
      setSidebarWidth(260);
    }
    
    // 重置所有tooltip的状态，防止收起侧边栏时所有tooltip都显示
  };

  const isCollapsed = sidebarMode === "collapsed";

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
    
    const tags = newPromptTags.split(",").map(tag => tag.trim()).filter(Boolean);
    
    addPrompt({
      title: newPromptTitle,
      content: newPromptContent,
      category: newPromptCategory || activeCategory || categories[0]?.id || "general",
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
    setNewPromptCategory("");
    setNewPromptTags("");
    setShowNewPromptDialog(false);
  };

  // 打开新建提示词对话框
  const openNewPromptDialog = () => {
    setNewPromptCategory(activeCategory || categories[0]?.id || "general");
    setShowNewPromptDialog(true);
  };

  // 添加键盘事件处理函数
  const handleKeyDown = (e: React.KeyboardEvent, category: Category) => {
    if (e.key === "F2") {
      e.preventDefault();
      setEditingCategory(category.id);
      setEditingName(category.name);
    } else if (e.key === "Escape") {
      setEditingCategory(null);
    }
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

  // AI相关图标列表
  const aiIcons = [
    "Brain", "Cpu", "Bot", "Robot", "MessageSquare", "MessageCircle", 
    "MessageSquarePlus", "MessageSquareText", "MessageSquareCode", 
    "Code", "Code2", "Terminal", "Command", "Keyboard", "Laptop", 
    "Monitor", "Server", "Database", "Network", "Cloud", "CloudLightning", 
    "CloudCog", "CloudDownload", "CloudUpload", "FileText", "FileCode", 
    "FileJson", "FileSpreadsheet", "FileDatabase", "FileSearch", 
    "Search", "SearchCode", "SearchCheck", "SearchX", "Lightbulb", 
    "LightbulbOff", "Zap", "ZapOff", "Sparkles", "Star", "StarHalf", 
    "Book", "BookOpen", "BookMarked", "BookText", "BookType", 
    "BookUser", "BookKey", "BookLock", "BookCheck", "BookX", 
    "BookPlus", "BookMinus", "BookOpenText", "BookOpenCheck", 
    "BookOpenCode", "BookOpenUser", "BookOpenKey", "BookOpenLock", 
    "BookOpenX", "BookOpenPlus", "BookOpenMinus"
  ];

  // 过滤并限制显示的图标数量
  const filteredIcons = useMemo(() => {
    return aiIcons
      .filter(name => name.toLowerCase().includes(debouncedSearch.toLowerCase()))
      .slice(0, 50);
  }, [debouncedSearch, aiIcons]);

  // 应用自定义主题
  const applyCustomTheme = () => {
    updateSettings({ 
      theme: 'custom', 
      customTheme: tempCustomTheme 
    });
    setShowThemeCustomizer(false);
  };

  return (
    <div
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}px` }}
      className={cn(
        "h-full border-r relative transition-all duration-300 flex flex-col apple-blur shrink-0",
        isCollapsed && "w-[80px]",
        className
      )}
    >
      {/* 拖拽手柄 */}
      <div
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-12 bg-muted/30 border border-border rounded-full flex items-center justify-center cursor-col-resize hover:bg-muted/50 transition-colors z-10 opacity-0 hover:opacity-100"
        onMouseDown={handleMouseDown}
        title="调整侧边栏宽度"
      >
        <div className="w-1 h-4 bg-muted-foreground/30 rounded-full" />
      </div>

      <div className="h-full overflow-hidden flex-1">
        <ScrollArea className="h-full">
          <div className={cn(
            "h-full",
            isCollapsed ? "px-1" : "px-4"
          )}>
            {/* 顶部按钮 */}
            <div className="flex items-center justify-between py-3">
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

            {/* 按钮组 */}
            <div className="py-3">
              <div className="space-y-1">
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start rounded-xl group",
                          isCollapsed && "justify-center px-2"
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
                          "w-full justify-start rounded-xl group",
                          isCollapsed && "justify-center px-2"
                        )}
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
                          "w-full justify-start rounded-xl group",
                          isCollapsed && "justify-center px-2"
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
            <div className="mt-6 w-full">
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
                          "rounded-full h-7 w-8",
                          isCollapsed ? "mx-auto" : "ml-auto"
                        )}
                      >
                        {/* 管理分类 */}
                        <Icons.folderPlus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      管理分类
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {/* 分类列表 */}
              <ScrollArea className={cn(
                "h-[calc(100vh-200px)] px-1",
                isCollapsed ? "" : "pr-4"
              )}>
                {/* 分类列表 */}
                <div className="space-y-1">
                  {categories.map((category) => (
                    <TooltipProvider key={category.id} delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ContextMenu>
                            <ContextMenuTrigger asChild>
                              <div
                                className="w-full"
                                onKeyDown={(e) => handleKeyDown(e, category)}
                                tabIndex={0}
                              >
                                {editingCategory === category.id ? (
                                  <div className="flex items-center gap-2 p-2">
                                    <div className="flex items-center gap-2 flex-1">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                          >
                                            <CategoryIcon iconName={editingIcon || category.icon} />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                          <div className="w-[300px] p-2">
                                            <Input
                                              placeholder="搜索图标..."
                                              value={iconSearch}
                                              onChange={(e) => setIconSearch(e.target.value)}
                                              className="mb-2"
                                            />
                                            <div className="grid grid-cols-6 gap-2 max-h-[300px] overflow-y-auto">
                                              {filteredIcons.map(name => (
                                                <Button
                                                  key={name}
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-8 w-8"
                                                  onClick={() => {
                                                    setEditingIcon(name);
                                                    setShowIconPicker(false);
                                                  }}
                                                >
                                                  <CategoryIcon iconName={name} className="h-4 w-4" />
                                                </Button>
                                              ))}
                                            </div>
                                          </div>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
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
                                        className="h-8 flex-1"
                                      />
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRename(category.id)}
                                      className="h-8 w-8"
                                    >
                                      <Icons.check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setEditingCategory(null)}
                                      className="h-8 w-8"
                                    >
                                      <Icons.x className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <TooltipProvider delayDuration={100}>
                                    {/* 分类名称 */}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant={activeCategory === category.id ? "default" : "ghost"}
                                          className={cn(
                                            "w-full justify-start rounded-xl group py-2", 
                                            isCollapsed && "justify-center px-2",
                                            activeCategory === category.id ? "bg-primary/10 text-primary hover:bg-primary/15" : ""
                                          )}
                                          onClick={() => handleCategoryClick(category.id)}
                                        >
                                          {/* 分类图标 */}
                                          <CategoryIcon iconName={category.icon} />
                                          {/* 分类名称 */}
                                          {!isCollapsed && category.name}
                                          {/* 分类提示词数量 */}
                                          {/* {!isCollapsed && (
                                            <span className="ml-auto text-xs opacity-70 rounded-full bg-muted/50 px-1.5 py-0.5 min-w-[20px] text-center">
                                              {promptCounts[category.id] || 0}
                                            </span>
                                          )} */}
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
                              <ContextMenuItem onClick={() => {
                                setEditingCategory(category.id);
                                setEditingName(category.name);
                                setEditingIcon(category.icon || "");
                              }}>
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
                </div>
              </ScrollArea>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* 底部按钮 */}
      <div className={cn(
        "border-t p-3 shrink-0",
        isCollapsed ? "space-y-2" : "flex items-center justify-between"
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
                  isCollapsed ? "w-full justify-center" : ""
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
        
        

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full h-8 w-8 bg-primary/10 text-primary hover:bg-primary/20",
                  isCollapsed ? "w-full justify-center" : ""
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
                  "rounded-full h-8 w-8",
                  isCollapsed ? "w-full justify-center" : ""
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
      <Dialog open={showNewPromptDialog} onOpenChange={setShowNewPromptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建提示词</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Input
                id="tags" 
                placeholder="输入标签，用逗号分隔"
                value={newPromptTags}
                onChange={(e) => setNewPromptTags(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
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
                {/* 侧边栏设置 */}
                <div className="space-y-2">
                  <Label htmlFor="sidebar-mode">侧边栏模式</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">仅图标模式</span>
                    <Switch
                      id="sidebar-mode"
                      checked={sidebarMode === "expanded"}
                      onCheckedChange={(checked) => {
                        setSidebarMode(checked ? "expanded" : "collapsed");
                        setSidebarWidth(checked ? 280 : 80);
                      }}
                    />
                    <span className="text-sm">完整模式</span>
                  </div>
                </div>
                
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

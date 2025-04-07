import { useState, useRef, useEffect } from "react";
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
    forceRefresh
  } = usePrompts();
  
  const { settings, toggleTheme, updateSettings, availableFonts } = useSettings();
  const { toast } = useToast();

  const [showDataImportExport, setShowDataImportExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState("");
  const [newPromptContent, setNewPromptContent] = useState("");
  const [newPromptCategory, setNewPromptCategory] = useState("");
  const [newPromptTags, setNewPromptTags] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isDragging, setIsDragging] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("expanded");
  const [settingsPanel, setSettingsPanel] = useState<"appearance" | "data">("appearance");
  
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
    setIsDragging(true);
    draggingRef.current = true;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      let newWidth = e.clientX;
      
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

    const handleMouseUp = () => {
      setIsDragging(false);
      draggingRef.current = false;
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, sidebarMode]);

  // 切换侧边栏模式
  const toggleSidebarMode = () => {
    const newMode = sidebarMode === "expanded" ? "collapsed" : "expanded";
    setSidebarMode(newMode);
    
    // 根据模式自动调整宽度
    if (newMode === "collapsed") {
      setSidebarWidth(80);
    } else {
      setSidebarWidth(280);
    }
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

    return (
    <div 
      className={cn(
        "h-full flex flex-col relative bg-background",
        className
      )}
      ref={sidebarRef}
    >
      {/* 拖拽调整宽度的把手 */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize z-50 hover:bg-border"
        onMouseDown={handleMouseDown}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* 新建提示词按钮 */}
        <div className="p-4">
          <Button
            className="w-full justify-start"
            onClick={openNewPromptDialog}
          >
            <Icons.plus className="h-4 w-4 mr-2" />
            新建提示词
          </Button>
        </div>

        {/* 提示词管理部分 */}
        <div className="px-2 space-y-1">
          <Button
            variant={!activeCategory && !showFavorites && !showRecommended ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={handleAllPromptsClick}
          >
            <Icons.layout className="h-4 w-4 mr-2" />
            全部提示词
            <span className="ml-auto opacity-70">{prompts.length}</span>
          </Button>
          <Button
            variant={showFavorites ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={handleFavoritesClick}
          >
            <Icons.star className="h-4 w-4 mr-2" />
            收藏提示词
            <span className="ml-auto opacity-70">{favoritesCount}</span>
          </Button>
          <Button
            variant={showRecommended ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={handleRecommendedClick}
          >
            <Icons.gift className="h-4 w-4 mr-2" />
            推荐模板
          </Button>
        </div>
        
        {/* 分类列表 */}
        <div className="px-2 mt-6">
          <h2 className="px-2 text-lg font-semibold tracking-tight mb-2">
            分类
          </h2>
          <ScrollArea className="h-[calc(100vh-350px)]">
            <div className="space-y-1 px-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.icon ? (
                    <span className="mr-2">{category.icon}</span>
                  ) : (
                    <Icons.folder className="h-4 w-4 mr-2" />
                  )}
                  {category.name}
                  <span className="ml-auto opacity-70">{promptCounts[category.id] || 0}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
          </div>
        </div>

      {/* 底部设置按钮 */}
      <div className="border-t mt-auto p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={settings.theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
          >
            {settings.theme === 'dark' ? (
              <Icons.sun className="h-5 w-5" />
            ) : (
              <Icons.moon className="h-5 w-5" />
            )}
          </Button>

            <Button
            variant="ghost"
            size="icon"
            title="设置"
              onClick={() => {
                // 打开设置时默认展示外观设置
                setSettingsPanel("appearance");
                setShowSettings(true);
              }}
            >
            <Icons.settings className="h-5 w-5" />
            </Button>
          </div>
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

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
            <DialogTitle>应用设置</DialogTitle>
            <DialogDescription>
              自定义应用外观和行为
            </DialogDescription>
            </DialogHeader>
          
          {/* 设置导航按钮 */}
          <div className="grid grid-cols-2 gap-2 mb-4">
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
          </div>
          
          {/* 外观设置面板 */}
          {settingsPanel === "appearance" && (
            <div className="py-4 space-y-4">
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
              
              {/* 字体大小 */}
              <div className="space-y-2">
                <Label htmlFor="font-size">字体大小: {settings.fontSize}px</Label>
                <Slider
                  id="font-size"
                  defaultValue={[settings.fontSize]}
                  min={12}
                  max={20}
                  step={1}
                  onValueChange={(value) => updateSettings({ fontSize: value[0] })}
                />
              </div>
            </div>
          )}
          
          {/* 数据管理面板 */}
          {settingsPanel === "data" && (
            <div className="py-4">
              <DataImportExport
                inline={true}
                open={showDataImportExport}
                onOpenChange={setShowDataImportExport}
                onDataChanged={() => {
                  // 重新加载数据
                  window.location.reload();
                }}
              />
            </div>
          )}
          </DialogContent>
        </Dialog>
    </div>
    );
}

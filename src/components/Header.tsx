import { Button } from "@/components/ui/button";
import { Moon, Sun, Pin, PinOff, Menu, Minus, Maximize2, X } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { usePrompts } from "@/hooks/usePrompts";
import { useEffect, CSSProperties } from "react";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// 定义样式接口扩展WebkitAppRegion属性
interface DraggableStyle extends CSSProperties {
  WebkitAppRegion?: 'drag' | 'no-drag';
  '-webkit-app-region'?: 'drag' | 'no-drag';
}

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const { settings, updateSettings, togglePinWindow, toggleTheme } = useSettings();
  const { toast } = useToast();
  const { 
    activeCategory, 
    showFavorites, 
    showRecommended, 
    searchTerm,
    setSearchTerm,
    categories, 
    prompts,
    refreshCounter
   } = usePrompts();

  // 检测是否为移动设备
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // 添加调试日志查看状态变化
  useEffect(() => {
    console.log('Header状态更新:', {
      activeCategory,
      showFavorites,
      showRecommended,
      searchTerm,
      refreshCounter
    });
  }, [activeCategory, showFavorites, showRecommended, searchTerm, refreshCounter]);
  
  // 获取当前标题
  const getTitle = () => {
    if (searchTerm) {
      return `搜索结果: "${searchTerm}"`;
    }
    
    if (showRecommended) {
      return "推荐模板";
    }
    
    if (showFavorites) {
      return "收藏提示词";
    }
    
    if (activeCategory) {
      const category = categories.find(c => c.id === activeCategory);
      return category ? `${category.name}` : "全部提示词";
    }
    
    return "全部提示词";
  };
  // 切换窗口置顶
  const togglePin = () => {
    const newState = !settings.alwaysOnTop;
    togglePinWindow(newState);
    
    // 添加置顶状态变化的通知
    toast({
      title: newState ? "窗口已置顶" : "窗口已取消置顶",
      description: newState ? "应用将保持在其他窗口前方" : "应用将遵循正常窗口顺序",
      variant: newState ? "success" : "default",
    });
  };

  // 主题切换处理函数
  const handleToggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    toggleTheme();
    
    // 添加主题变化的通知
    toast({
      title: `已切换到${newTheme === 'dark' ? '深色' : '浅色'}主题`,
      variant: "success",
    });
  };

  // 窗口控制函数
  const handleMinimize = () => {
    window.electronAPI?.minimize();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximize();
  };

  const handleClose = () => {
    window.electronAPI?.close();
  };

  return (
    <div 
      className="flex flex-col md:flex-row items-center backdrop-blur-sm bg-background/80 border-b px-4 py-2 md:py-2 md:h-14 sticky top-0 z-10 titlebar-drag"
      style={{ WebkitAppRegion: 'drag' } as DraggableStyle}
    >
      {/* 移除绝对定位的拖拽层 */}
      {/* <div className="absolute inset-0 titlebar-drag" /> */}
      
      {/* 移除容器的no-drag，直接应用到子元素 */}
      <div className="flex items-center md:w-1/4">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 rounded-full titlebar-no-drag"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className={`text-sm font-medium ${isMobile ? 'mb-2' : 'mr-4'} titlebar-no-drag`}>
          {getTitle()}
        </h2>
      </div>
        
      {/* 移除容器的no-drag */}
      <div className={`relative ${isMobile ? 'w-full mt-2' : 'w-2/4 flex justify-center'}`}>
        <div className={`${isMobile ? 'w-full' : 'w-80'} relative`}>
          <Input
            placeholder="搜索提示词..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 rounded-full shadow-sm bg-muted/30 border-muted focus:bg-background transition-colors duration-200 titlebar-no-drag"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {searchTerm ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full titlebar-no-drag"
                onClick={() => setSearchTerm("")}
              >
                <Icons.x className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Icons.search className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Wrap button group in TooltipProvider */}
      <TooltipProvider delayDuration={100}>
        <div className="flex items-center space-x-2 mt-2 md:mt-0 md:w-1/4 justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleTheme}
                className="rounded-full titlebar-no-drag h-9 w-9"
              >
                {settings.theme === 'dark' ? (
                  <Sun className="h-4.5 w-4.5" />
                ) : (
                  <Moon className="h-4.5 w-4.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{settings.theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePin}
                className={`rounded-full ${settings.alwaysOnTop ? "text-primary" : ""} titlebar-no-drag h-9 w-9`}
              >
                {settings.alwaysOnTop ? (
                  <Pin className="h-4.5 w-4.5" />
                ) : (
                  <PinOff className="h-4.5 w-4.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{settings.alwaysOnTop ? '取消窗口置顶' : '窗口置顶'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMinimize}
                className="rounded-full hover:bg-muted/50 titlebar-no-drag h-9 w-9"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>最小化</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMaximize}
                className="rounded-full hover:bg-muted/50 titlebar-no-drag h-9 w-9"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>最大化</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="rounded-full hover:bg-destructive hover:text-destructive-foreground titlebar-no-drag h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>关闭</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

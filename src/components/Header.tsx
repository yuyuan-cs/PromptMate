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

// 检测是否为 macOS
const isMacOS = () => {
  return window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};

// 头部组件
export function Header() {
  const { settings, toggleTheme, togglePinWindow } = useSettings();
  const { prompts, setSearchTerm } = usePrompts();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { toast } = useToast();
  const isMac = isMacOS();

  // 检查electronAPI是否可用
  const isElectronAPIAvailable = () => {
    return window.electronAPI && 
           typeof window.electronAPI.minimize === 'function' &&
           typeof window.electronAPI.maximize === 'function' &&
           typeof window.electronAPI.close === 'function';
  };

  // 调试信息
  useEffect(() => {
    console.log('Header component mounted');
    console.log('window.electronAPI:', window.electronAPI);
    console.log('isElectronAPIAvailable:', isElectronAPIAvailable());
    
    if (window.electronAPI) {
      console.log('electronAPI methods:', {
        minimize: typeof window.electronAPI.minimize,
        maximize: typeof window.electronAPI.maximize,
        close: typeof window.electronAPI.close,
        togglePinWindow: typeof window.electronAPI.togglePinWindow
      });
    } else {
      console.warn('electronAPI is not available');
      toast({
        title: "调试信息",
        description: "electronAPI 不可用，请检查preload脚本",
      });
    }
  }, []);

  // 获取标题
  const getTitle = () => {
    if (prompts.length === 0) return "PromptMate";
    return `PromptMate - ${prompts.length} 个提示词`;
  };

  // 切换侧边栏
  const toggleSidebar = () => {
    // 实现侧边栏切换逻辑
  };

  // 切换主题
  const handleToggleTheme = () => {
    toggleTheme();
  };

  // 窗口控制函数
  const handleMinimize = () => {
    try {
      if (isElectronAPIAvailable()) {
        window.electronAPI.minimize();
        console.log('最小化窗口');
      } else {
        console.warn('electronAPI 不可用');
        toast({
          title: "功能不可用",
          description: "窗口控制功能在当前环境下不可用",
        });
      }
    } catch (error) {
      console.error('最小化窗口失败:', error);
      toast({
        title: "操作失败",
        description: "最小化窗口时发生错误",
        variant: "destructive",
      });
    }
  };

  const handleMaximize = () => {
    try {
      if (isElectronAPIAvailable()) {
        window.electronAPI.maximize();
        console.log('最大化/还原窗口');
      } else {
        console.warn('electronAPI 不可用');
        toast({
          title: "功能不可用",
          description: "窗口控制功能在当前环境下不可用",
        });
      }
    } catch (error) {
      console.error('最大化窗口失败:', error);
      toast({
        title: "操作失败",
        description: "最大化窗口时发生错误",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    try {
      if (isElectronAPIAvailable()) {
        window.electronAPI.close();
        console.log('关闭窗口');
      } else {
        console.warn('electronAPI 不可用');
        toast({
          title: "功能不可用",
          description: "窗口控制功能在当前环境下不可用",
        });
      }
    } catch (error) {
      console.error('关闭窗口失败:', error);
      toast({
        title: "操作失败",
        description: "关闭窗口时发生错误",
        variant: "destructive",
      });
    }
  };

  return (
        /* 头部容器 */
    <div 
      className={`flex flex-col md:flex-row items-center backdrop-blur-sm bg-background/80 border-b px-4 py-2 md:py-2 md:h-12 sticky top-0 z-10 titlebar-drag ${
        isMac ? 'pl-20' : ''
      }`}
    >
      {/* 左侧标题区域 */}
      <div className="flex items-center md:w-1/4">
        <h2 className={`text-sm font-medium ${isMobile ? 'mb-2' : 'mr-4'} titlebar-no-drag`}>
          
        </h2>
      </div>
      {/* 搜索框 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-2xl">
          <Input
            type="search"
            placeholder="搜索提示词..."
              className="w-full pl-10 titlebar-no-drag h-8 !text-[14px] focus-visible:ring-1 focus-visible:ring-ring/50"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        </div>
      </div>
      {/* 右侧按钮区域 */}
      <TooltipProvider delayDuration={100}>
        <div className="flex items-center space-x-2 mt-2 md:mt-0 md:w-1/4 justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              {/* 主题按钮 */}
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

          {/* 窗口置顶按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => togglePinWindow(!settings.alwaysOnTop)}
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

          {!isMac && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                                {/* 最小化按钮 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMinimize}
                className="rounded-full window-control-button titlebar-no-drag h-9 w-9"
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
                    className="rounded-full window-control-button titlebar-no-drag h-9 w-9"
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
                    className="rounded-full window-control-button window-control-close titlebar-no-drag h-9 w-9"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>关闭</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}

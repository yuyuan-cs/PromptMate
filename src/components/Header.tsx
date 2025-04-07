import { Button } from "@/components/ui/button";
import { Moon, Sun, Pin, PinOff, Menu } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { usePrompts } from "@/hooks/usePrompts";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <div className="flex flex-col md:flex-row items-center justify-between border-b px-4 py-2 md:py-0 md:h-14">
      <div className="flex items-center w-full md:w-auto">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className={`text-xl font-semibold ${isMobile ? 'mb-2' : 'mr-4'}`}>
          {getTitle()}
        </h2>
        
        {/* 搜索框 */}
        <div className={`relative ${isMobile ? 'w-full mt-2' : 'max-w-md w-96'}`}>
          <Input
            placeholder="搜索提示词..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {searchTerm ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSearchTerm("")}
              >
                <Icons.x className="h-4 w-4" />
              </Button>
            ) : (
              <Icons.search className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 mt-2 md:mt-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleTheme}
          title={settings.theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
        >
          {settings.theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={togglePin}
          title={settings.alwaysOnTop ? '取消窗口置顶' : '窗口置顶'}
          className={settings.alwaysOnTop ? "text-primary" : ""}
        >
          {settings.alwaysOnTop ? (
            <Pin className="h-5 w-5" />
          ) : (
            <PinOff className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}

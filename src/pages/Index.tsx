import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PromptList } from "@/components/PromptList";
import { PromptEditorModular } from "@/components/PromptEditorModular";
import { usePrompts } from "@/hooks/usePrompts";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IndexProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: Dispatch<SetStateAction<boolean>>;
  onToggleSidebarRef?: (fn: () => void) => void;
}

// 内容区域组件，负责根据当前状态显示不同内容
function ContentArea({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { 
    selectedPrompt,
    activeCategory,
    showFavorites,
    showRecommended,
    searchTerm,
    categories,
    filteredPrompts,
    setActiveCategory,
    setShowFavorites,
    setShowRecommended
  } = usePrompts();

  // 添加强制刷新状态
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewKey, setViewKey] = useState(0);
  const [showEditor, setShowEditor] = useState(true);
  
  // 监听状态变化并强制刷新
  useEffect(() => {
    console.log('ContentArea 状态变化:', {
      activeCategory, 
      showFavorites, 
      showRecommended, 
      searchTerm,
      filteredCount: filteredPrompts.length
    });
    // 强制刷新组件
    setRefreshKey(prev => prev + 1);
    setViewKey(prev => prev + 1);
  }, [activeCategory, showFavorites, showRecommended, searchTerm, filteredPrompts.length]);
  
  // 确定当前应该显示哪个组件
  const renderCurrentView = () => {
    // 构建一个唯一的key来强制组件重新渲染
    const viewKey = `view-${activeCategory || 'all'}-${showFavorites ? 'fav' : ''}-${showRecommended ? 'rec' : ''}-${searchTerm ? 'search' : ''}-${refreshKey}`;
    
    // 如果有搜索词，显示搜索结果
    if (searchTerm) {
      return (
        <PromptList 
          key={viewKey}
          onToggleSidebar={onToggleSidebar} 
          contentTitle={`搜索结果: "${searchTerm}"`}
          isEditPanelOpen={!!selectedPrompt}
        />
      );
    }
    
    // 如果是推荐模式
    if (showRecommended) {
      return (
        <PromptList 
          key={viewKey}
          onToggleSidebar={onToggleSidebar} 
          contentTitle="推荐模板"
          isEditPanelOpen={!!selectedPrompt}
        />
      );
    }
    
    // 如果是收藏模式
    if (showFavorites) {
      return (
        <PromptList 
          key={viewKey}
          onToggleSidebar={onToggleSidebar} 
          contentTitle="收藏提示词"
          isEditPanelOpen={!!selectedPrompt}
        />
      );
    }
    
    // 如果有激活的分类
    if (activeCategory) {
      const categoryName = categories.find(c => c.id === activeCategory)?.name || activeCategory;
      return (
        <PromptList 
          key={viewKey}
          onToggleSidebar={onToggleSidebar} 
          contentTitle={`分类: ${categoryName}`}
          isEditPanelOpen={!!selectedPrompt}
        />
      );
    }
    
    // 默认显示所有提示词
    return (
      <PromptList 
        key={viewKey}
        onToggleSidebar={onToggleSidebar} 
        contentTitle="全部提示词"
        isEditPanelOpen={!!selectedPrompt}
      />
    );
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* 左侧：提示词列表 - 始终显示 */}
      <div className={`h-full transition-all duration-300 ${selectedPrompt ? "flex-1" : "w-full"}`}>
        {renderCurrentView()}
      </div>


    </div>
  );
}

export function Index({ sidebarOpen: propsSidebarOpen, setSidebarOpen: propSetSidebarOpen, onToggleSidebarRef }: IndexProps) {
  const [localSidebarOpen, setLocalSidebarOpen] = useState(true);
  const { selectedPrompt } = usePrompts();
  
  // 使用props传递的状态或本地状态
  const sidebarOpen = propsSidebarOpen !== undefined ? propsSidebarOpen : localSidebarOpen;
  const setSidebarOpen = propSetSidebarOpen || setLocalSidebarOpen;

  // 切换侧边栏显示状态
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 将toggleSidebar函数暴露给父组件
  useEffect(() => {
    if (onToggleSidebarRef) {
      onToggleSidebarRef(toggleSidebar);
    }
  }, [onToggleSidebarRef]);

  return (
    <div className="flex h-full">
      {/* 左侧边栏 */}
      {sidebarOpen && <Sidebar />}
      
      {/* 中间内容区域 */}
      <div className={cn(
        "flex-1 h-full",
        selectedPrompt ? "flex" : ""
      )}>
        <div className={cn(
          "h-full", // 注释掉过渡动画: transition-all duration-400 ease-out
          selectedPrompt ? "flex-1 border-r" : "w-full"
        )}>
          <ScrollArea className="h-full">
            <ContentArea onToggleSidebar={toggleSidebar} />
          </ScrollArea>
        </div>
        
        {/* 右侧编辑面板 - 只在选中提示词时显示 */}
        {selectedPrompt && (
          <div className="w-96 h-full border-l bg-background animate-slide-in-panel shadow-lg">
            <PromptEditorModular />
          </div>
        )}
      </div>
    </div>
  );
}

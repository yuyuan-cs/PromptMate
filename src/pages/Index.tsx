import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PromptList } from "@/components/PromptList";
import { PromptEditor } from "@/components/PromptEditor";
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
      {/* 左侧内容区域 */}
      <div className={`h-full transition-all duration-300 ${selectedPrompt ? "w-full md:w-1/2" : "w-full"}`}>
        {renderCurrentView()}
      </div>

      {/* 提示词编辑器 */}
      {selectedPrompt && (
        <div className={`min-h-[150vh] h-full border-l fixed md:relative right-0 top-[64px] bottom-0 z-10 bg-background md:z-0 w-full md:w-1/2 transition-all duration-300 overflow-auto ${showEditor ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
          <PromptEditor />
        </div>
      )}
    </div>
  );
}

export function Index({ sidebarOpen: propsSidebarOpen, setSidebarOpen: propSetSidebarOpen, onToggleSidebarRef }: IndexProps) {
  const [localSidebarOpen, setLocalSidebarOpen] = useState(true);
  
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
      {sidebarOpen && <Sidebar />}
      <ScrollArea className="flex-1 h-full">
        <ContentArea onToggleSidebar={toggleSidebar} />
      </ScrollArea>
    </div>
  );
}

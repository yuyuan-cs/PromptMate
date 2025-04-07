import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PromptList } from "@/components/PromptList";
import { PromptEditor } from "@/components/PromptEditor";
import { usePrompts } from "@/hooks/usePrompts";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

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
        />
      );
    }
    
    // 默认显示所有提示词
    return (
      <PromptList 
        key={viewKey}
        onToggleSidebar={onToggleSidebar} 
        contentTitle="全部提示词"
      />
    );
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* 左侧内容区域 */}
      <div className={`h-full ${selectedPrompt ? "w-1/2" : "w-full"} transition-all duration-300`}>
        {renderCurrentView()}
      </div>

      {/* 提示词编辑器 */}
      {selectedPrompt && (
        <div className="w-1/2 h-full border-l">
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
    <div className="flex h-full overflow-hidden">
      {/* 侧边栏容器 */}
      <div className={`relative transition-all duration-300 ease-in-out border-r ${
        sidebarOpen ? "w-[280px] min-w-[280px]" : "w-0"
      }`}>
        {sidebarOpen && (
          <Sidebar className="h-full" />
        )}
      </div>

      {/* 主内容区域 */}
      <ContentArea onToggleSidebar={toggleSidebar} />
    </div>
  );
}

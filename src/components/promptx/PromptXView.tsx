import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PromptXMain } from "@/components/promptx/PromptXMain";

interface PromptXViewProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: Dispatch<SetStateAction<boolean>>;
  onToggleSidebarRef?: (fn: () => void) => void;
}

export function PromptXView({ sidebarOpen: propsSidebarOpen, setSidebarOpen: propSetSidebarOpen, onToggleSidebarRef }: PromptXViewProps) {
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
    <div className="flex flex-1 min-h-0">
      {/* 左侧边栏 */}
      {sidebarOpen && <Sidebar />}

      {/* 右侧内容区域：PromptX 主体 */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="h-full flex flex-col">
            {/* 顶部预留区域可放工具条/面包屑等，如需 */}
            <div className="flex-1 min-h-0">
              <PromptXMain />
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

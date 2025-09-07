import { useEffect, useState, lazy, Suspense, useCallback } from "react";
import { useSettings } from "@/hooks/useSettings";
// import { ThemeProvider } from "@/components/ThemeProvider"; // 移除ThemeProvider，避免与useSettings冲突
// import { Index } from "@/pages/Index"; // Remove direct import
import { Header } from "@/components/Header";
import { PromptsProvider } from "@/hooks/usePrompts";
import { AppViewProvider, useAppView } from "@/hooks/useAppView";
import { Toaster } from "@/components/ui/toaster";
import { Icons } from "@/components/ui/icons"; // Import Icons for fallback
import ErrorBoundary from "@/components/ErrorBoundary";
import NotFoundPage from "@/components/NotFoundPage";
import SplashScreen from "@/components/SplashScreen";
import { useSplashScreen } from "@/hooks/useSplashScreen";

// Lazy load the Index component (handle named export)
const Index = lazy(() => 
  import("@/pages/Index")
    .then(module => ({ default: module.Index }))
    .catch(error => {
      console.error('Failed to load Index component:', error);
      return { default: () => <NotFoundPage error="Failed to load main page" /> };
    })
);

// Lazy load the WorkflowView component (dev only)
const WorkflowView = lazy(() => 
  import("@/views/WorkflowView")
    .then(module => ({ default: module.WorkflowView }))
    .catch(error => {
      console.error('Failed to load WorkflowView component:', error);
      return { default: () => <NotFoundPage error="Failed to load workflow view" /> };
    })
);

function AppContent() {
  const { currentView } = useAppView();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isDev = import.meta.env.DEV;
  
  // 启动页面管理
  const { 
    showSplash, 
    isLoading, 
    progress, 
    currentTask, 
    tasks 
  } = useSplashScreen({
    onComplete: () => {
      console.log('启动页面完成');
    }
  });

  // 切换侧边栏显示状态 (Memoized with useCallback)
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []); // Empty dependency array as it doesn't depend on any props/state from App scope

  // 根据当前视图渲染不同的组件
  const renderCurrentView = () => {
    // 在生产环境隐藏工作流视图
    if (!isDev && currentView === 'workflows') {
      return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Icons.fileText className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
          <Index sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </Suspense>
      );
    }

    switch (currentView) {
      case 'workflows':
        return (
          <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Icons.workflow className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
            <WorkflowView />
          </Suspense>
        );
      case 'prompts':
      default:
        return (
          <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Icons.fileText className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
            <Index sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          </Suspense>
        );
    }
  };

  // 如果显示启动页面，则只显示启动页面
  if (showSplash) {
    return (
      <SplashScreen 
        isLoading={isLoading}
        progress={progress}
        currentTask={currentTask}
        tasks={tasks}
      />
    );
  }

  return (
    <main className="h-screen flex flex-col" data-testid="main-app">
      <Header />
      <div className="flex-1 flex min-h-0 overflow-hidden app-content">
        {renderCurrentView()}
      </div>
      <Toaster />
    </main>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppViewProvider>
        <ErrorBoundary>
          <PromptsProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </PromptsProvider>
        </ErrorBoundary>
      </AppViewProvider>
    </ErrorBoundary>
  );
}

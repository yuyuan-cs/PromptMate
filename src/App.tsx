import { useEffect, useState, lazy, Suspense, useCallback } from "react";
import { useSettings } from "@/hooks/useSettings";
import { ThemeProvider } from "@/components/ThemeProvider";
// import { Index } from "@/pages/Index"; // Remove direct import
import { Header } from "@/components/Header";
import { PromptsProvider } from "@/hooks/usePrompts";
import { Toaster } from "@/components/ui/toaster";
import { Icons } from "@/components/ui/icons"; // Import Icons for fallback

// Lazy load the Index component (handle named export)
const Index = lazy(() => import("@/pages/Index").then(module => ({ default: module.Index })));

export default function App() {
  const { settings } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 应用字体设置
  useEffect(() => {
    if (settings.font) {
      document.documentElement.style.setProperty("--font-sans", settings.font);
    }
    
    if (settings.fontSize) {
      document.documentElement.style.setProperty("--font-size", `${settings.fontSize}px`);
      document.body.style.fontSize = `${settings.fontSize}px`;
    }
  }, [settings.font, settings.fontSize]);

  // 切换侧边栏显示状态 (Memoized with useCallback)
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []); // Empty dependency array as it doesn't depend on any props/state from App scope

  return (
    <ThemeProvider defaultTheme={settings.theme} storageKey="promptmate-theme">
      <PromptsProvider>
        <main className="h-screen overflow-hidden flex flex-col">
          <Header toggleSidebar={toggleSidebar} />
          <div className="flex-1 overflow-hidden flex">
            {/* Use Suspense to show a fallback while Index is loading */}
            <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Icons.fileText className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
              <Index sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            </Suspense>
          </div>
          <Toaster />
        </main>
      </PromptsProvider>
    </ThemeProvider>
  );
}

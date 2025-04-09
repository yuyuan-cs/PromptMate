import { useEffect, useRef, useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Index } from "@/pages/Index";
import { Header } from "@/components/Header";
import { PromptsProvider } from "@/hooks/usePrompts";
import { Toaster } from "@/components/ui/toaster";

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

  // 切换侧边栏显示状态
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider defaultTheme={settings.theme} storageKey="promptmate-theme">
      <PromptsProvider>
        <main className="h-screen overflow-hidden flex flex-col">
          <Header toggleSidebar={toggleSidebar} />
          <div className="flex-1 overflow-hidden flex">
            <Index sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          </div>
          <Toaster />
        </main>
      </PromptsProvider>
    </ThemeProvider>
  );
}

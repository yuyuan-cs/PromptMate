
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";
import { ThemeType } from "@/types";
import { useSettings } from "@/hooks/useSettings";

export function ThemeToggle() {
  const { settings, updateSettings } = useSettings();
  
  // Cycle through themes: light -> dark -> system
  const cycleTheme = () => {
    const themes: ThemeType[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(settings.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    updateSettings({ theme: themes[nextIndex] });
  };
  
  const getThemeIcon = () => {
    switch (settings.theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'system':
        return <Monitor className="h-5 w-5" />;
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={cycleTheme}
      title={`Current theme: ${settings.theme}`}
    >
      {getThemeIcon()}
    </Button>
  );
}

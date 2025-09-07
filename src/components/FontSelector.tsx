import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Type, Monitor } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import SystemFontSelector from "./SystemFontSelector";

interface FontSelectorProps {
  value?: string;
  onChange?: (font: string) => void;
}

export function FontSelector({ value, onChange }: FontSelectorProps = {}) {
  const { settings, availableFonts, updateSettings } = useSettings();
  const { t } = useTranslation();
  const [showSystemFontSelector, setShowSystemFontSelector] = useState(false);
  
  // 使用传入的value或从settings中获取
  const currentFont = value || settings.font;

  const handleSelectFont = (font: string) => {
    // 如果有自定义onChange，则调用
    if (onChange) {
      onChange(font);
    } else {
      // 否则使用默认更新方法
      updateSettings({ font });
    }
  };

  const handleFontSizeChange = (change: number) => {
    const newSize = Math.max(10, Math.min(22, settings.fontSize + change));
    updateSettings({ fontSize: newSize });
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex gap-2 items-center">
            <Type className="h-4 w-4" />
            <span>{currentFont}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{t('font.selectFont')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* 系统字体选择器入口 */}
          <DropdownMenuItem
            onClick={() => setShowSystemFontSelector(true)}
            className="flex items-center gap-2"
          >
            <Monitor className="h-4 w-4" />
            {t('font.selectSystemFont')}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* 预设字体 */}
          {availableFonts.map((font) => (
            <DropdownMenuItem
              key={font.name}
              onClick={() => handleSelectFont(font.name)}
              className={currentFont === font.name ? "bg-muted" : ""}
              style={{ fontFamily: font.value }}
            >
              {font.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center border rounded-md">
        <Button 
          variant="ghost" 
          size="sm" 
          className="px-2 h-8"
          onClick={() => handleFontSizeChange(-1)}
        >
          -
        </Button>
        <span className="px-2 text-sm">{settings.fontSize}px</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="px-2 h-8"
          onClick={() => handleFontSizeChange(1)}
        >
          +
        </Button>
      </div>

      {/* 系统字体选择器 */}
      <SystemFontSelector
        open={showSystemFontSelector}
        onOpenChange={setShowSystemFontSelector}
        currentFont={currentFont}
        onFontSelect={handleSelectFont}
        title={t('font.selectSystemFont')}
      />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings } from "@/types";
import { Input } from "@/components/ui/input";
import { hexToHsl } from "@/lib/themes";
import { useTranslation } from "react-i18next";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

// 颜色选择器组件
function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded border cursor-pointer" 
            style={{ backgroundColor: value }}
            onClick={() => document.getElementById(`color-${label}`)?.click()}
          />
          <Input
            id={`color-${label}`}
            type="color"
            className="w-10 h-8 p-0 overflow-hidden"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <Input
            type="text"
            className="w-24 h-8 text-xs"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

interface ThemeCustomizerProps {
  customTheme?: Settings['customTheme'];
  onChange: (theme: Settings['customTheme']) => void;
  onApply: () => void;
}

// 主题定制器组件
export function ThemeCustomizer({ customTheme, onChange, onApply }: ThemeCustomizerProps) {
  const { t } = useTranslation();
  const [colors, setColors] = useState<Settings['customTheme']>({
    background: "#ffffff",
    foreground: "#000000",
    primary: "#3b82f6",
    accent: "#f1f5f9",
  });

  // 加载现有自定义主题
  useEffect(() => {
    if (customTheme) {
      setColors(customTheme);
    }
  }, [customTheme]);

  // 更新颜色并通知父组件
  const updateColor = (key: keyof Settings['customTheme'], value: string) => {
    const newColors = { ...colors, [key]: value };
    setColors(newColors);
    onChange(newColors);
  };

  // 预览区域背景样式
  const previewStyle = {
    background: colors.background,
    color: colors.foreground,
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <ColorPicker
          label={t('themeCustomizer.backgroundColor')}
          value={colors.background}
          onChange={(value) => updateColor('background', value)}
        />
        <ColorPicker
          label={t('themeCustomizer.textColor')}
          value={colors.foreground}
          onChange={(value) => updateColor('foreground', value)}
        />
        <ColorPicker
          label={t('themeCustomizer.primaryColor')}
          value={colors.primary}
          onChange={(value) => updateColor('primary', value)}
        />
        <ColorPicker
          label={t('themeCustomizer.accentColor')}
          value={colors.accent}
          onChange={(value) => updateColor('accent', value)}
        />
      </div>

      <div className="mt-4 space-y-3">
        <Label>{t('themeCustomizer.themePreview')}</Label>
        <div
          className="p-4 rounded-md border space-y-3"
          style={previewStyle}
        >
          <div className="flex justify-between items-center">
            <span>{t('themeCustomizer.customThemePreview')}</span>
            <div
              className="h-6 w-6 rounded-full"
              style={{ backgroundColor: colors.primary }}
            ></div>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded-md text-sm"
              style={{ backgroundColor: colors.primary, color: colors.background }}
            >
              {t('themeCustomizer.primaryButton')}
            </button>
            <button
              className="px-3 py-1.5 rounded-md text-sm"
              style={{ backgroundColor: colors.accent, color: colors.foreground }}
            >
              {t('themeCustomizer.secondaryButton')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onApply}>{t('themeCustomizer.applyTheme')}</Button>
      </div>
    </div>
  );
}

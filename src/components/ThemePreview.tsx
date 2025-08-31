// src/components/ThemePreview.tsx
import { cn } from "@/lib/utils";
import { ThemePreset } from "@/lib/themes";
import { useTranslation } from "react-i18next";

interface ThemePreviewProps {
  theme: ThemePreset;
  selected?: boolean;
  onClick?: () => void;
}

export function ThemePreview({ theme, selected, onClick }: ThemePreviewProps) {
  const { t } = useTranslation();
  return (
    <div 
      className={cn(
        "flex flex-col rounded-lg overflow-hidden border cursor-pointer transition-all",
        "hover:shadow-md hover:scale-102",
        selected ? "ring-2 ring-primary" : "ring-0"
      )}
      onClick={onClick}
    >
      <div 
        className="h-20 p-2 flex flex-col justify-between" 
        style={{ 
          background: theme.preview.background, 
          color: theme.preview.foreground,
          backgroundSize: 'cover'
        }}
      >
        <div className="flex justify-between items-center">
          <div className="text-xs font-medium" style={{ color: theme.preview.foreground }}>
            {theme.isDefault ? t('themePreview.systemTheme') : t('themePreview.customTheme')}
          </div>
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: theme.preview.primary, color: theme.preview.background }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div 
          className="w-14 h-5 rounded-md flex items-center justify-center text-xs"
          style={{ background: theme.preview.accent, color: theme.preview.foreground }}
        >
          {t('themePreview.button')}
        </div>
      </div>
      <div className="p-2 bg-background">
        <div className="text-xs font-medium">{theme.name}</div>
        <div className="text-xs text-muted-foreground truncate" style={{fontSize: "0.65rem"}}>{theme.description}</div>
      </div>
    </div>
  );
}
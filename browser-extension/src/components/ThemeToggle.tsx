import * as React from 'react';
import { Button } from './ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const getThemeIcon = (theme: Theme) => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = (theme: Theme) => {
    switch (theme) {
      case 'light':
        return '浅色主题';
      case 'dark':
        return '深色主题';
      case 'system':
        return '跟随系统';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
        >
          {getThemeIcon(currentTheme)}
          <span className="ml-2">{getThemeLabel(currentTheme)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onThemeChange('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>浅色主题</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onThemeChange('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>深色主题</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onThemeChange('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>跟随系统</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


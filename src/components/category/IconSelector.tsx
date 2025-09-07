import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import * as LucideIcons from "lucide-react";
import { aiIcons, getIconComponent, AiIconName } from "@/lib/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React from "react";

// 选择图标组件
interface IconSelectorProps {
  value: string;
  onChange: (value: AiIconName) => void;
  className?: string;
}

const ICONS_PER_PAGE = 42; // 6列 x 7行

export function IconSelector({ value, onChange, className }: IconSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const SelectedIconComponent = getIconComponent(value);

  // 过滤图标
  const filteredIcons = useMemo(() => {
    return aiIcons.filter(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // 计算总页数
  const totalPages = Math.ceil(filteredIcons.length / ICONS_PER_PAGE);

  // 获取当前页的图标
  const currentPageIcons = useMemo(() => {
    const startIndex = currentPage * ICONS_PER_PAGE;
    return filteredIcons.slice(startIndex, startIndex + ICONS_PER_PAGE);
  }, [filteredIcons, currentPage]);

  // 处理搜索变化时重置页码
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  // 处理图标选择
  const handleIconSelect = (iconName: AiIconName) => {
    onChange(iconName);
    setOpen(false);
    setSearchTerm("");
    setCurrentPage(0);
  };

  // 翻页函数
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* 选择图标按钮 */}
        <Button
          variant="outline"
          className={cn("w-8 h-8 p-0 justify-center", className)}
          aria-label="选择图标"
        >
          <SelectedIconComponent className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      
      {/* 选择图标内容 */}
      <PopoverContent className="w-80 p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="p-3 border-b">
          <Input
            placeholder="搜索图标..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="h-8 text-sm"
          />
        </div>
        
        <ScrollArea className="h-[300px]" type="always">
          <div 
            className="grid grid-cols-6 p-3 gap-1"
            onWheel={(e) => {
              // 防止滚轮事件被PopoverContent拦截
              e.stopPropagation();
            }}
          >
            {currentPageIcons.map((iconName) => {
              const Icon = getIconComponent(iconName);
              return (
                <Button
                  key={iconName}
                  variant={value === iconName ? "default" : "ghost"}
                  className="justify-center h-10 w-10 p-0 aspect-square hover:scale-105 transition-transform"
                  title={iconName}
                  onClick={() => handleIconSelect(iconName as AiIconName)}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              );
            })}
          </div>
        </ScrollArea>
        
        {/* 翻页控制 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="h-7 px-2"
            >
              <Icons.chevronLeft className="h-3 w-3" />
            </Button>
            
            <span className="text-xs text-muted-foreground">
              {currentPage + 1} / {totalPages}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="h-7 px-2"
            >
              <Icons.chevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
} 
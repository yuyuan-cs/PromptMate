import { useState } from "react";
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
import { cn } from "@/lib/utils";
import React from "react";

// 选择图标组件
interface IconSelectorProps {
  value: string;
  onChange: (value: AiIconName) => void;
  className?: string;
}
// 
export function IconSelector({ value, onChange, className }: IconSelectorProps) {
  const [open, setOpen] = useState(false);

  const SelectedIconComponent = getIconComponent(value);

  return (
    // 
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        {/* 选择图标按钮 */}
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center">
            <SelectedIconComponent className="h-4 w-4 mr-2" />
            <span>{value || "选择图标"}</span>
          </div>
          <Icons.chevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      {/* 选择图标内容 */}
      <PopoverContent className="w-80 p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <ScrollArea className="h-[250px]" type="always">
          <div 
            className="grid grid-cols-7 p-2 gap-1"
            onWheel={(e) => {
              // 防止滚轮事件被PopoverContent拦截
              e.stopPropagation();
            }}
          >
            {aiIcons.map((iconName) => {
              const Icon = getIconComponent(iconName);
              return (
                <Button
                  key={iconName}
                  variant={value === iconName ? "default" : "ghost"}
                  className="justify-center h-10 w-10 p-0 aspect-square"
                  title={iconName}
                  onClick={() => {
                    onChange(iconName as AiIconName);
                    setOpen(false);
                  }}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 
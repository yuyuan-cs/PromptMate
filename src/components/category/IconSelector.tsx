import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// 定义可用的图标列表
const availableIcons = [
  { id: "folder", icon: Icons.folder, label: "文件夹" },
  { id: "star", icon: Icons.star, label: "星标" },
  { id: "file", icon: Icons.file, label: "文件" },
  { id: "fileText", icon: Icons.fileText, label: "文本" },
  { id: "layout", icon: Icons.layout, label: "布局" },
  { id: "settings", icon: Icons.settings, label: "设置" },
  { id: "palette", icon: Icons.palette, label: "调色板" },
  { id: "gift", icon: Icons.gift, label: "礼物" },
  { id: "download", icon: Icons.download, label: "下载" },
  { id: "upload", icon: Icons.upload, label: "上传" },
  { id: "pencil", icon: Icons.pencil, label: "铅笔" },
  { id: "trash", icon: Icons.trash, label: "垃圾桶" },
];

interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function IconSelector({ value, onChange, className }: IconSelectorProps) {
  const [open, setOpen] = useState(false);

  // 根据ID获取图标组件
  const getIconById = (id: string) => {
    const found = availableIcons.find((item) => item.id === id);
    return found?.icon || Icons.folder;
  };

  // 选中的图标组件
  const SelectedIcon = value ? getIconById(value) : Icons.folder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center">
            <SelectedIcon className="h-4 w-4 mr-2" />
            <span>{availableIcons.find((item) => item.id === value)?.label || "选择图标"}</span>
          </div>
          <Icons.chevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0">
        <div className="grid grid-cols-4 p-2 gap-1">
          {availableIcons.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={value === item.id ? "default" : "ghost"}
                className="justify-center h-10 w-10 p-0"
                title={item.label}
                onClick={() => {
                  onChange(item.id);
                  setOpen(false);
                }}
              >
                <Icon className="h-5 w-5" />
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
} 
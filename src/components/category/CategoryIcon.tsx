import React from "react";
import * as LucideIcons from "lucide-react";

interface CategoryIconProps {
  iconName: string;
  className?: string;
}

export function CategoryIcon({ iconName, className = "h-5 w-5" }: CategoryIconProps) {
  const Icon = LucideIcons[iconName as keyof typeof LucideIcons];
  
  if (!Icon) {
    return <LucideIcons.Folder className={className} />;
  }
  
  return <Icon className={className} />;
} 
import React from "react";
import * as LucideIcons from "lucide-react";
import { getIconComponent } from "@/lib/icons";

interface CategoryIconProps {
  iconName: string;
  className?: string;
}

export function CategoryIcon({ iconName, className = "h-5 w-5" }: CategoryIconProps) {
  const IconComponent = getIconComponent(iconName);
  
  return <IconComponent className={className} />;
} 
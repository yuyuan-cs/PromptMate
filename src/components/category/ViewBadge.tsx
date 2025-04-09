import React from "react";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { Category } from "@/types";
import { CategoryIcon } from "./CategoryIcon";

interface ViewBadgeProps {
  showRecommended: boolean;
  showFavorites: boolean;
  activeCategory: string | null;
  categories: Category[];
}

export function ViewBadge({ 
  showRecommended, 
  showFavorites, 
  activeCategory, 
  categories 
}: ViewBadgeProps) {
  // 优先级顺序：showRecommended > showFavorites > activeCategory > 默认全部
  if (showRecommended) {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Icons.gift className="h-3 w-3 mr-1" /> 推荐模板
      </Badge>
    );
  } 
  
  if (showFavorites) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Icons.starFilled className="h-3 w-3 mr-1" /> 收藏提示词
      </Badge>
    );
  } 
  
  if (activeCategory) {
    const category = categories.find(c => c.id === activeCategory);
    
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CategoryIcon iconName={category?.icon} className="h-3 w-3 mr-1" />
        {category?.name || "分类"}
      </Badge>
    );
  } 
  
  // 默认显示全部提示词
  return (
    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
      <Icons.layout className="h-3 w-3 mr-1" /> 全部提示词
    </Badge>
  );
} 
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { Category } from "@/types";
import { CategoryIcon } from "./CategoryIcon";
import { useTranslation } from "react-i18next";

// 预定义的颜色方案，确保美观和可读性
const CATEGORY_COLORS = [
  { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  { bg: "bg-lime-50", text: "text-lime-700", border: "border-lime-200" },
  { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200" },
  { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
];

// 根据分类ID生成一致的颜色
function getCategoryColor(categoryId: string) {
  // 使用分类ID的哈希值来确保颜色的一致性
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    const char = categoryId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  // 使用哈希值选择颜色，确保相同ID总是得到相同颜色
  const colorIndex = Math.abs(hash) % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[colorIndex];
}

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
  const { t } = useTranslation();
  // 优先级顺序：showRecommended > showFavorites > activeCategory > 默认全部
  if (showRecommended) {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Icons.gift className="h-3 w-3 mr-1" /> {t('sidebar.tooltip.recommendedPrompts')}
      </Badge>
    );
  } 
  
  if (showFavorites) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Icons.starFilled className="h-3 w-3 mr-1" /> {t('sidebar.tooltip.favoritePrompts')}
      </Badge>
    );
  } 
  
  if (activeCategory) {
    const category = categories.find(c => c.id === activeCategory);
    const colors = getCategoryColor(activeCategory);
    
    return (
      <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border}`}>
        <CategoryIcon iconName={category?.icon} className="h-3 w-3 mr-1" />
        {category?.name || t('sidebar.tooltip.categoryPrompts')}
      </Badge>
    );
  } 
  
  // 默认显示全部提示词
  return (
    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
      <Icons.layout className="h-3 w-3 mr-1" /> {t('sidebar.tooltip.allPrompts')}
    </Badge>
  );
} 
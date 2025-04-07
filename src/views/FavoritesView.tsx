import { PromptList } from "@/components/PromptList";
import { usePrompts } from "@/hooks/usePrompts";
import { useEffect } from "react";

export function FavoritesView({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { setActiveCategory, setShowFavorites, setShowRecommended } = usePrompts();
  
  // 确保正确的状态
  useEffect(() => {
    setActiveCategory(null);
    setShowFavorites(true);
    setShowRecommended(false);
  }, [setActiveCategory, setShowFavorites, setShowRecommended]);
  
  return (
    <PromptList 
      onToggleSidebar={onToggleSidebar} 
      contentTitle="我的收藏" 
    />
  );
} 
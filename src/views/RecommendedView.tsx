import { PromptList } from "@/components/PromptList";
import { usePrompts } from "@/hooks/usePrompts";
import { useEffect } from "react";

export function RecommendedView({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { setActiveCategory, setShowFavorites, setShowRecommended, selectedPrompt } = usePrompts();
  
  // 确保正确的状态
  useEffect(() => {
    setActiveCategory(null);
    setShowFavorites(false);
    setShowRecommended(true);
  }, [setActiveCategory, setShowFavorites, setShowRecommended]);
  
  return (
    <PromptList 
      onToggleSidebar={onToggleSidebar} 
      contentTitle="推荐模板" 
      isEditPanelOpen={!!selectedPrompt}
    />
  );
} 
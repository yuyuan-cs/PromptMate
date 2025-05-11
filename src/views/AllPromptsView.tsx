import { PromptList } from "@/components/PromptList";
import { usePrompts } from "@/hooks/usePrompts";
import { useEffect } from "react";

export function AllPromptsView({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { setActiveCategory, setShowFavorites, setShowRecommended, selectedPrompt } = usePrompts();
  
  // 确保正确的状态
  useEffect(() => {
    setActiveCategory(null);
    setShowFavorites(false);
    setShowRecommended(false);
  }, [setActiveCategory, setShowFavorites, setShowRecommended]);
  
  return (
    <PromptList 
      onToggleSidebar={onToggleSidebar} 
      contentTitle="我的提示词库" 
      isEditPanelOpen={!!selectedPrompt}
    />
  );
} 
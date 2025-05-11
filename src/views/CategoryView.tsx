import { PromptList } from "@/components/PromptList";
import { usePrompts } from "@/hooks/usePrompts";
import { useEffect } from "react";

export function CategoryView({ 
  categoryId, 
  onToggleSidebar 
}: { 
  categoryId: string;
  onToggleSidebar?: () => void;
}) {
  const { setActiveCategory, setShowFavorites, setShowRecommended, categories, selectedPrompt } = usePrompts();
  
  // 确保正确的状态
  useEffect(() => {
    setActiveCategory(categoryId);
    setShowFavorites(false);
    setShowRecommended(false);
  }, [categoryId, setActiveCategory, setShowFavorites, setShowRecommended]);
  
  const categoryName = categories.find(c => c.id === categoryId)?.name || categoryId;
  
  return (
    <PromptList 
      onToggleSidebar={onToggleSidebar} 
      contentTitle={`分类: ${categoryName}`} 
      isEditPanelOpen={!!selectedPrompt}
    />
  );
} 
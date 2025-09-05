import { Prompt } from "@/types";
import recommendedPromptsData from "./recommendedPrompts-zh.json";
import recommendedPromptsDataEn from "./recommendedPrompts-en.json";

// 创建当前时间
// const now = new Date().toISOString();

// 预设推荐的提示词库
export const recommendedPromptsZh: Prompt[] = recommendedPromptsData as unknown as Prompt[];
export const recommendedPromptsEn: Prompt[] = recommendedPromptsDataEn as unknown as Prompt[];

// 将推荐提示词按类别分组
export const getRecommendedPromptsByCategory = () => {
  const grouped: Record<string, Prompt[]> = {};
  
  recommendedPromptsZh.forEach(prompt => {
    if (!grouped[prompt.category]) {
      grouped[prompt.category] = [];
    }
    grouped[prompt.category].push(prompt);
  });
  
  return grouped;
};

// 根据标签获取推荐提示词
export const getRecommendedPromptsByTag = (tag: string) => {
  return recommendedPromptsZh.filter(prompt => 
    prompt.tags.includes(tag)
  );
};

// 获取所有推荐标签
export const getAllRecommendedTags = () => {
  const tags = new Set<string>();
  
  recommendedPromptsZh.forEach(prompt => {
    prompt.tags.forEach(tag => tags.add(tag));
  });
  
  return Array.from(tags).sort();
};

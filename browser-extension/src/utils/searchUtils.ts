import { Prompt } from '../shared/types';

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 高性能搜索函数
export function performSearch(
  prompts: Prompt[],
  searchTerm: string,
  activeCategory: string,
  showFavorites: boolean = false
): Prompt[] {
  if (!searchTerm && activeCategory === 'all' && !showFavorites) {
    return prompts;
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  return prompts.filter(prompt => {
    // 分类过滤
    if (activeCategory !== 'all' && activeCategory !== 'favorites') {
      if (prompt.category !== activeCategory) return false;
    }

    // 收藏过滤
    if (showFavorites || activeCategory === 'favorites') {
      if (!prompt.isFavorite) return false;
    }

    // 搜索过滤
    if (normalizedSearch) {
      const titleMatch = prompt.title.toLowerCase().includes(normalizedSearch);
      const contentMatch = prompt.content.toLowerCase().includes(normalizedSearch);
      const descriptionMatch = prompt.description?.toLowerCase().includes(normalizedSearch);
      const tagsMatch = prompt.tags.some(tag => 
        tag.toLowerCase().includes(normalizedSearch)
      );

      if (!titleMatch && !contentMatch && !descriptionMatch && !tagsMatch) {
        return false;
      }
    }

    return true;
  });
}

// 搜索结果高亮
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// 转义正则表达式特殊字符
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 计算搜索匹配分数
export function calculateMatchScore(prompt: Prompt, searchTerm: string): number {
  if (!searchTerm.trim()) return 0;

  const normalizedSearch = searchTerm.toLowerCase();
  let score = 0;

  // 标题匹配权重最高
  if (prompt.title.toLowerCase().includes(normalizedSearch)) {
    score += 10;
    if (prompt.title.toLowerCase().startsWith(normalizedSearch)) {
      score += 5; // 开头匹配额外加分
    }
  }

  // 标签匹配
  prompt.tags.forEach(tag => {
    if (tag.toLowerCase().includes(normalizedSearch)) {
      score += 3;
      if (tag.toLowerCase() === normalizedSearch) {
        score += 2; // 完全匹配额外加分
      }
    }
  });

  // 描述匹配
  if (prompt.description?.toLowerCase().includes(normalizedSearch)) {
    score += 2;
  }

  // 内容匹配权重较低
  if (prompt.content.toLowerCase().includes(normalizedSearch)) {
    score += 1;
  }

  // 使用频率加权
  if (prompt.usageCount && prompt.usageCount > 0) {
    score += Math.min(prompt.usageCount * 0.1, 2); // 最多加2分
  }

  return score;
}

// 智能排序
export function sortPrompts(
  prompts: Prompt[],
  searchTerm: string,
  sortBy: 'relevance' | 'created' | 'updated' | 'usage' = 'relevance'
): Prompt[] {
  const sorted = [...prompts];

  switch (sortBy) {
    case 'relevance':
      if (searchTerm.trim()) {
        // 根据匹配分数排序
        sorted.sort((a, b) => {
          const scoreA = calculateMatchScore(a, searchTerm);
          const scoreB = calculateMatchScore(b, searchTerm);
          if (scoreA !== scoreB) return scoreB - scoreA;
          
          // 分数相同时按更新时间排序
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      } else {
        // 无搜索词时按更新时间排序
        sorted.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
      break;

    case 'created':
      sorted.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;

    case 'updated':
      sorted.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      break;

    case 'usage':
      sorted.sort((a, b) => {
        const usageA = a.usageCount || 0;
        const usageB = b.usageCount || 0;
        if (usageA !== usageB) return usageB - usageA;
        
        // 使用次数相同时按更新时间排序
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      break;
  }

  return sorted;
}


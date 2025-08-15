import { useState, useEffect, useMemo, createContext, useContext, ReactNode, useRef, useCallback } from 'react';
import { Prompt, Category } from '../types';
import { loadPrompts, savePrompts, loadCategories, saveCategories, generateId } from '../lib/data';
import { recommendedPrompts } from '../data/recommendedPrompts';
import { useToast } from '@/hooks/use-toast';

// 创建Context
type PromptsContextType = ReturnType<typeof usePromptsState>;
const PromptsContext = createContext<PromptsContextType | undefined>(undefined);

// 创建真正的状态管理hook
function usePromptsState() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecommended, setShowRecommended] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  // 添加刷新计数器
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { toast } = useToast();
  
  // 添加标记未保存更改的状态
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // 添加一个回调函数引用，用于检查是否有未保存的更改
  const checkUnsavedChangesCallback = useRef<((newPromptId: string | null) => boolean) | null>(null);

  // 设置检查未保存更改的回调函数
  const setCheckUnsavedChangesCallback = useCallback((callback: (newPromptId: string | null) => boolean) => {
    checkUnsavedChangesCallback.current = callback;
  }, []);

  // 强制刷新函数
  const forceRefresh = () => setRefreshCounter(prev => prev + 1);
  
  // 安全版本的setSelectedPrompt，会在切换前检查未保存的更改
  const safeSetSelectedPrompt = useCallback((newPrompt: Prompt | null) => {
    // 如果有检查未保存更改的回调函数，则执行它
    if (checkUnsavedChangesCallback.current) {
      const newPromptId = newPrompt ? newPrompt.id : null;
      const canProceed = checkUnsavedChangesCallback.current(newPromptId);
      
      // 如果不能安全切换，则中止切换
      if (!canProceed) {
        return;
      }
    }
    
    // 可以安全切换，执行原始的setSelectedPrompt
    setSelectedPrompt(newPrompt);
  }, []);

  useEffect(() => {
    console.log('Loading prompts and categories from storage');
    const loadedPrompts = loadPrompts();
    setPrompts(loadedPrompts);
    
    // 初始化默认分类
    const defaultCategories: Category[] = [
      { id: "creative", name: "创意生成", icon: "palette" },
      { id: "productivity", name: "生产力", icon: "settings" },
      { id: "development", name: "开发编程", icon: "fileText" },
      { id: "education", name: "教育学习", icon: "fileUp" },
      { id: "business", name: "商务沟通", icon: "file" },
      { id: "general", name: "通用", icon: "layout" },
    ];
    
    const loadedCategories = loadCategories();
    
    // 如果没有已保存的分类，使用默认分类
    if (loadedCategories.length === 0) {
      setCategories(defaultCategories);
      saveCategories(defaultCategories);
    } else {
      setCategories(loadedCategories);
    }
  }, []);

  // 保存提示词当它们变化时
  useEffect(() => {
    // 确保这里是您实际的保存逻辑，之前的代码是 if (prompts.length > 0)
     // 如果您的逻辑不同，请将日志放在调用 savePrompts 之前即可
     // ---- DEBUG LOG 4 ----
     console.log('[usePrompts] useEffect[prompts] - prompts array just before savePrompts:', prompts);
     // console.log('[usePrompts] useEffect[prompts] - prompts array (stringified):', JSON.stringify(prompts, null, 2));

    if (prompts.length > 0) {
      savePrompts(prompts);
    }
  }, [prompts]);

  // 保存分类当它们变化时
  useEffect(() => {
    if (categories.length > 0) {
      saveCategories(categories);
    }
  }, [categories]);

  // 获取当前显示的提示词（用户的或推荐的）
  const displayedPrompts = showRecommended 
    ? recommendedPrompts 
    : prompts;

  // 添加调试日志
  useEffect(() => {
    console.log('usePrompts displayedPrompts 更新:', {
      displayedPrompts: displayedPrompts.length,
      showRecommended,
      prompts: prompts.length,
      recommendedPrompts: recommendedPrompts.length,
      activeCategory,
      showFavorites,
      refreshCounter
    });
  }, [displayedPrompts, showRecommended, prompts, activeCategory, showFavorites, refreshCounter]);

  // 获取所有标签（支持按分类过滤）
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    
    // 如果有选中的分类，只显示该分类下的标签
    const targetPrompts = activeCategory 
      ? prompts.filter(prompt => prompt.category === activeCategory)
      : prompts;
    
    // 合并标签
    targetPrompts.forEach(prompt => {
      prompt.tags.forEach(tag => tagsSet.add(tag));
    });
    
    return Array.from(tagsSet).sort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshCounter, searchTerm, activeCategory, prompts]);

  // 过滤提示词基于当前分类、标签和搜索词
  const filteredPrompts = useMemo(() => {
    console.log('过滤条件变更:', {
      showRecommended,
      showFavorites,
      activeCategory,
      selectedTag,
      searchTerm,
      refreshCounter
    });

    const filtered = displayedPrompts.filter(prompt => {
      // 如果在收藏模式下，只显示收藏的提示词
      if (showFavorites && !prompt.isFavorite) {
        return false;
      }
      
      // 如果有激活的分类，只显示该分类下的提示词
      if (!showRecommended && activeCategory && prompt.category !== activeCategory) {
        return false;
      }
      
      // 匹配标签
      if (selectedTag && !prompt.tags.includes(selectedTag)) {
        return false;
      }
      
      // 匹配搜索词
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return prompt.title.toLowerCase().includes(lowerSearchTerm) || 
               prompt.content.toLowerCase().includes(lowerSearchTerm);
      }
      
      // 如果没有任何过滤条件，显示所有提示词
      return true;
    });

    // 添加调试日志
    console.log('Filtered prompts 结果:', {
      total: displayedPrompts.length,
      filtered: filtered.length,
      filteredPrompts: filtered.map(p => ({id: p.id, title: p.title, category: p.category, isFavorite: p.isFavorite}))
    });

    return filtered;
  }, [displayedPrompts, activeCategory, selectedTag, searchTerm, showFavorites, showRecommended, prompts, refreshCounter]);

  // 类别切换函数，确保状态同步
  const setActiveCategoryAndRefresh = (categoryId: string | null) => {
    setActiveCategory(categoryId);
    forceRefresh();
  };

  // 收藏切换函数，确保状态同步
  const setShowFavoritesAndRefresh = (value: boolean) => {
    setShowFavorites(value);
    forceRefresh();
  };

  // 推荐切换函数，确保状态同步
  const setShowRecommendedAndRefresh = (value: boolean) => {
    setShowRecommended(value);
    forceRefresh();
  };

  const addPrompt = (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPrompt: Prompt = {
      ...promptData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setPrompts(prev => [...prev, newPrompt]);
    return newPrompt;
  };

  // 从推荐提示词中添加到用户的个人提示词库
  const addFromRecommended = (recommendedPrompt: Prompt) => {
    const newPrompt = {
      ...recommendedPrompt,
      id: generateId(), // 生成新ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setPrompts(prev => [...prev, newPrompt]);
    return newPrompt;
  };

  const updatePrompt = (id: string, promptData: Partial<Prompt>) => {
     // ---- DEBUG LOG 2 ----
     console.log('[usePrompts] updatePrompt - received promptData:', promptData);
     // console.log('[usePrompts] updatePrompt - received promptData (stringified):', JSON.stringify(promptData, null, 2));

    setPrompts(prevPrompts => {
      const newPrompts = prevPrompts.map(p => {
        if (p.id === id) {
          const updatedPrompt = { ...p, ...promptData, updatedAt: new Date().toISOString() };
          // 如果当前选中的提示词就是正在更新的这个，那么也更新 selectedPrompt 状态
          if (selectedPrompt && selectedPrompt.id === id) {
            setSelectedPrompt(updatedPrompt);
          }
          return updatedPrompt;
        }
        return p;
      });
      return newPrompts;
    });
  };

  const deletePrompt = (id: string) => {
    setPrompts(prev => prev.filter(prompt => prompt.id !== id));
    if (selectedPrompt?.id === id) {
      setSelectedPrompt(null);
    }
  };

  const toggleFavorite = (id: string) => {
    // 获取当前提示词，用于显示提示信息
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;
    
    const willBeFavorite = !prompt.isFavorite;
    
    setPrompts(prev => 
      prev.map(prompt => 
        prompt.id === id 
          ? { ...prompt, isFavorite: willBeFavorite } 
          : prompt
      )
    );
    
    // 添加提示信息
    toast({
      title: willBeFavorite ? "已收藏" : "已取消收藏",
      description: willBeFavorite 
        ? `已将"${prompt.title}"添加到收藏` 
        : `已将"${prompt.title}"从收藏中移除`,
      variant: "success",
    });
  };

  const addCategory = (name: string, icon?: string) => {
    const newCategory = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      icon
    };
    
    setCategories(prev => [...prev, newCategory]);
    
    toast({
      title: "分类已添加",
      description: `新分类 "${name}" 已成功创建`,
      variant: "success",
    });
    
    return newCategory;
  };

  const updateCategory = (id: string, name: string, icon?: string) => {
    // 获取旧分类名称用于通知
    const oldCategory = categories.find(cat => cat.id === id);
    
    setCategories(prev => 
      prev.map(category => 
        category.id === id 
          ? { ...category, name, icon } 
          : category
      )
    );
    
    toast({
      title: "分类已更新",
      description: `分类 "${oldCategory?.name || id}" 已更新`,
      variant: "success",
    });
  };

  const deleteCategory = (id: string) => {
    // 获取分类信息用于通知
    const categoryToDelete = categories.find(cat => cat.id === id);
    
    // 计算该分类下有多少提示词
    const promptsInCategory = prompts.filter(p => p.category === id).length;
    
    // 将该分类下的提示词移到"general"
    setPrompts(prev => 
      prev.map(prompt => 
        prompt.category === id 
          ? { ...prompt, category: "general" } 
          : prompt
      )
    );
    
    setCategories(prev => prev.filter(category => category.id !== id));
    
    if (activeCategory === id) {
      setActiveCategory(null);
    }
    
    toast({
      title: "分类已删除",
      description: promptsInCategory > 0 
        ? `分类 "${categoryToDelete?.name || id}" 已删除，${promptsInCategory} 个提示词已移至"通用"分类`
        : `分类 "${categoryToDelete?.name || id}" 已删除`,
      variant: "warning",
    });
  };

  // 更新分类顺序
  const updateCategoriesOrder = (reorderedCategories: Category[]) => {
    setCategories(reorderedCategories);
    
    toast({
      title: "分类顺序已更新",
      description: "分类顺序已成功更新",
      variant: "success",
    });
  };

  // 获取指定提示词
  const getPrompt = (id: string) => {
    return prompts.find(p => p.id === id) || null;
  };

  // 复制提示词到剪贴板
  const copyPromptContent = (id: string) => {
    const prompt = getPrompt(id);
    if (prompt) {
      navigator.clipboard.writeText(prompt.content)
        .then(() => {
          toast({
            title: "复制成功",
            description: "提示词内容已复制到剪贴板",
            variant: "success",
          });
        })
        .catch(() => {
          toast({
            title: "复制失败",
            description: "无法复制到剪贴板，请手动复制",
            variant: "destructive",
          });
        });
      return true;
    }
    
    toast({
      title: "复制失败",
      description: "未找到提示词",
      variant: "destructive",
    });
    return false;
  };

  // 重置所有过滤器，切换到主视图
  const resetAllFilters = () => {
    setActiveCategory(null);
    setShowFavorites(false);
    setShowRecommended(false);
    setSearchTerm('');
    setSelectedTag(null);
    setSelectedPrompt(null);
    forceRefresh();
    
    toast({
      title: "所有过滤器已重置",
      description: "现在显示所有提示词",
      variant: "success",
    });
  };

  // 获取指定分类的标签
  const getTagsForCategory = useCallback((categoryId: string | null) => {
    const tagsSet = new Set<string>();
    const targetPrompts = categoryId 
      ? prompts.filter(prompt => prompt.category === categoryId)
      : prompts;
    
    targetPrompts.forEach(prompt => {
      prompt.tags.forEach(tag => tagsSet.add(tag));
    });
    
    return Array.from(tagsSet).sort();
  }, [prompts]);

  // 添加删除标签功能（支持分类范围删除）
  const deleteTag = (tagToDelete: string, categoryScope: string | null = null) => {
    // 1. 从指定分类或所有提示词中删除该标签
    setPrompts(prevPrompts => {
      const updatedPrompts = prevPrompts.map(prompt => {
        // 如果指定了分类范围，只处理该分类下的提示词
        const shouldProcess = categoryScope ? prompt.category === categoryScope : true;
        
        if (shouldProcess && prompt.tags.includes(tagToDelete)) {
          // 创建一个不包含要删除标签的新标签数组
          const updatedTags = prompt.tags.filter(tag => tag !== tagToDelete);
          
          // 如果当前选中的提示词包含该标签，同步更新selectedPrompt
          if (selectedPrompt && selectedPrompt.id === prompt.id) {
            setSelectedPrompt({
              ...selectedPrompt,
              tags: updatedTags
            });
          }
          
          return {
            ...prompt,
            tags: updatedTags
          };
        }
        return prompt;
      });
      
      return updatedPrompts;
    });
    
    // 2. 如果当前选中的标签就是要删除的标签，清除选中状态
    if (selectedTag === tagToDelete) {
      setSelectedTag(null);
    }
    
    // 3. 强制刷新以更新UI
    forceRefresh();
  };

  return {
    prompts,
    selectedPrompt,
    setSelectedPrompt: safeSetSelectedPrompt,
    toggleFavorite,
    searchTerm,
    setSearchTerm,
    activeCategory,
    setActiveCategory: setActiveCategoryAndRefresh,
    showRecommended,
    setShowRecommended: setShowRecommendedAndRefresh,
    categories,
    addPrompt,
    addFromRecommended,
    deletePrompt,
    updatePrompt,
    allTags,
    selectedTag,
    setSelectedTag,
    showFavorites,
    setShowFavorites: setShowFavoritesAndRefresh,
    displayedPrompts,
    filteredPrompts,
    addCategory,
    updateCategory,
    deleteCategory,
    updateCategoriesOrder,
    getPrompt,
    copyPromptContent,
    resetAllFilters,
    forceRefresh,
    refreshCounter,
    deleteTag,
    getTagsForCategory,
    setCheckUnsavedChangesCallback,
    hasUnsavedChanges
  };
}

// 创建Provider组件
export function PromptsProvider({ children }: { children: ReactNode }) {
  const promptsState = usePromptsState();
  
  return (
    <PromptsContext.Provider value={promptsState}>
      {children}
    </PromptsContext.Provider>
  );
}

// 创建使用Context的钩子
export function usePrompts() {
  const context = useContext(PromptsContext);
  if (context === undefined) {
    throw new Error('usePrompts must be used within a PromptsProvider');
  }
  return context;
}

export type { PromptsContextType };

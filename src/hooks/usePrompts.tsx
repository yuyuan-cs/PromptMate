// 在src/hooks/usePrompts.tsx中添加SQLite支持
import { useState, useEffect, useMemo, createContext, useContext, ReactNode, useRef, useCallback } from 'react';
import { Prompt, Category } from '../types';
import { loadPrompts, savePrompts, loadCategories, saveCategories, generateId } from '../lib/data';
import recommendedPromptsDataZh from "../data/recommendedPrompts-zh.json";
import recommendedPromptsDataEn from "../data/recommendedPrompts-en.json";
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

//导入其他中英文数据
// import categoriesDataZh from "../data/categories-zh.json";
// import categoriesDataEn from "../data/categories-en.json";
// import promptsDataZh from "../data/prompts-zh.json";
// import promptsDataEn from "../data/prompts-en.json";
// import settingsDataZh from "../data/settings-zh.json";
// import settingsDataEn from "../data/settings-en.json";


// 导入数据库客户端
import { databaseClient } from '../lib/databaseClient';

// 数据库状态管理
interface DatabaseState {
  isInitialized: boolean;
  isConnected: boolean;
  useSqlite: boolean;
  error: string | null;
}

// 创建真正的状态管理hook
function usePromptsState() {
  const { i18n } = useTranslation();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecommended, setShowRecommended] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { toast } = useToast();
  
  // 数据库状态
  const [dbState, setDbState] = useState<DatabaseState>({
    isInitialized: false,
    isConnected: false,
    useSqlite: false,
    error: null
  });

  // 数据库客户端状态
  const [dbClient] = useState(() => databaseClient);
  
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

  // 初始化数据库连接
  useEffect(() => {
    const initDatabase = async () => {
      try {
        console.log('开始初始化数据库...');
        
        // 检查是否在Electron环境中并且数据库客户端可用
        if (dbClient.isAvailable()) {
          try {
            // 获取数据库状态
            const dbStatus = await dbClient.getStatus();
            console.log('数据库状态:', dbStatus);
            
            if (dbStatus.initialized) {
              // 数据库已初始化，检查是否需要迁移
              const migrationStatus = await dbClient.getMigrationStatus();
              
              if (migrationStatus === 'pending') {
                // 执行数据迁移
                console.log('开始数据迁移...');
                const localData = {
                  prompts: loadPrompts(),
                  categories: loadCategories(),
                  settings: { /* 根据需要加载设置 */ }
                };
                
                await dbClient.migrateFromLocalStorage(localData);
                console.log('数据迁移完成');
              }
              
              // 更新数据库状态
              setDbState({
                isInitialized: true,
                isConnected: true,
                useSqlite: true,
                error: null
              });
              
              // 从数据库加载数据
              console.log('从数据库加载数据...');
              await loadDataFromDatabase();
              
              console.log('SQLite数据库初始化成功');
            } else {
              throw new Error('数据库初始化失败');
            }
          } catch (dbError) {
            console.warn('SQLite初始化失败，回退到localStorage:', dbError);
            throw dbError;
          }
        } else {
          // 非Electron环境或数据库客户端不可用，使用localStorage
          console.log('数据库客户端不可用，使用localStorage');
          throw new Error('数据库客户端不可用');
        }
      } catch (error) {
        console.log('使用localStorage模式');
        
        // 回退到localStorage
        setDbState({
          isInitialized: true,
          isConnected: false,
          useSqlite: false,
          error: error instanceof Error ? error.message : '未知错误'
        });
        
        await loadDataFromLocalStorage();
      }
    };

    initDatabase();
  }, []);

  // 从数据库加载数据
  const loadDataFromDatabase = async () => {
    try {
      const [dbPrompts, dbCategories] = await Promise.all([
        dbClient.getAllPrompts(),
        dbClient.getAllCategories()
      ]);
      
      setPrompts(dbPrompts);
      setCategories(dbCategories);
      
      console.log(`从数据库加载了 ${dbPrompts.length} 个提示词和 ${dbCategories.length} 个分类`);
    } catch (error) {
      console.error('从数据库加载数据失败:', error);
      throw error;
    }
  };

  // 从localStorage加载数据（回退方案）
  const loadDataFromLocalStorage = async () => {
    try {
      const localPrompts = await loadPrompts();
      const localCategories = loadCategories();
      
      setPrompts(localPrompts);
      setCategories(localCategories);
      
      console.log(`从localStorage加载了 ${localPrompts.length} 个提示词和 ${localCategories.length} 个分类`);
    } catch (error) {
      console.error('从localStorage加载数据失败:', error);
    }
  };

  // 安全版本的setSelectedPrompt，会在切换前检查未保存的更改
  const safeSetSelectedPrompt = useCallback((newPrompt: Prompt | null) => {
    if (checkUnsavedChangesCallback.current) {
      const newPromptId = newPrompt ? newPrompt.id : null;
      const canProceed = checkUnsavedChangesCallback.current(newPromptId);
      
      if (!canProceed) {
        return;
      }
    }
    
    setSelectedPrompt(newPrompt);
  }, []);

  // 添加提示词
  const addPrompt = useCallback(async (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPrompt: Prompt = {
        ...promptData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (dbState.useSqlite && dbClient.isAvailable()) {
        // 使用SQLite数据库
        const savedPrompt = await dbClient.createPrompt(newPrompt);
        setPrompts(prev => [savedPrompt, ...prev]);
        
        // 同时备份到localStorage
        const allPrompts = [savedPrompt, ...prompts];
        savePrompts(allPrompts);
        
        console.log('提示词已保存到数据库:', savedPrompt.id);
      } else {
        // 使用localStorage
        const updatedPrompts = [newPrompt, ...prompts];
        setPrompts(updatedPrompts);
        savePrompts(updatedPrompts);
        
        console.log('提示词已保存到localStorage:', newPrompt.id);
      }

      toast({
        title: "添加成功",
        description: "提示词已添加",
        variant: "success",
      });

    } catch (error) {
      console.error('添加提示词失败:', error);
      
      // 如果数据库操作失败，回退到localStorage
      if (dbState.useSqlite) {
        console.log('数据库操作失败，回退到localStorage');
        const newPrompt: Prompt = {
          ...promptData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const updatedPrompts = [newPrompt, ...prompts];
        setPrompts(updatedPrompts);
        savePrompts(updatedPrompts);
      }
      
      toast({
        title: "添加失败",
        description: "提示词添加失败，请重试",
        variant: "destructive",
      });
    }
  }, [prompts, dbState.useSqlite, dbClient, toast]);

  // 更新提示词
  const updatePrompt = useCallback(async (id: string, updates: Partial<Prompt>) => {
    try {
      if (dbState.useSqlite && dbClient.isAvailable()) {
        // 使用SQLite数据库
        const updatedPrompt = await dbClient.updatePrompt(id, updates);
        setPrompts(prev => prev.map(p => p.id === id ? updatedPrompt : p));
        
        // 同时更新localStorage备份
        const allPrompts = prompts.map(p => p.id === id ? updatedPrompt : p);
        savePrompts(allPrompts);
        
        console.log('提示词已在数据库中更新:', id);
      } else {
        // 使用localStorage
        const updatedPrompts = prompts.map(prompt => 
          prompt.id === id 
            ? { ...prompt, ...updates, updatedAt: new Date().toISOString() }
            : prompt
        );
        setPrompts(updatedPrompts);
        savePrompts(updatedPrompts);
        
        console.log('提示词已在localStorage中更新:', id);
      }

      // 如果更新的是当前选中的提示词，也要更新selectedPrompt
      if (selectedPrompt && selectedPrompt.id === id) {
        const updatedSelected = { ...selectedPrompt, ...updates };
        setSelectedPrompt(updatedSelected);
      }

    } catch (error) {
      console.error('更新提示词失败:', error);
      
      // 如果数据库操作失败，回退到localStorage
      if (dbState.useSqlite) {
        console.log('数据库更新失败，回退到localStorage');
        const updatedPrompts = prompts.map(prompt => 
          prompt.id === id 
            ? { ...prompt, ...updates, updatedAt: new Date().toISOString() }
            : prompt
        );
        setPrompts(updatedPrompts);
        savePrompts(updatedPrompts);
      }
      
      toast({
        title: "更新失败",
        description: "提示词更新失败，请重试",
        variant: "destructive",
      });
    }
  }, [prompts, selectedPrompt, dbState.useSqlite, dbClient, toast]);

  // 删除提示词
  const deletePrompt = useCallback(async (id: string) => {
    try {
      if (dbState.useSqlite && dbClient.isAvailable()) {
        // 使用SQLite数据库
        const success = await dbClient.deletePrompt(id);
        if (success) {
          setPrompts(prev => prev.filter(p => p.id !== id));
          
          // 同时从localStorage删除
          const filteredPrompts = prompts.filter(p => p.id !== id);
          savePrompts(filteredPrompts);
          
          console.log('提示词已从数据库删除:', id);
        }
      } else {
        // 使用localStorage
        const filteredPrompts = prompts.filter(prompt => prompt.id !== id);
        setPrompts(filteredPrompts);
        savePrompts(filteredPrompts);
        
        console.log('提示词已从localStorage删除:', id);
      }

      // 如果删除的是当前选中的提示词，清空选中状态
      if (selectedPrompt && selectedPrompt.id === id) {
        setSelectedPrompt(null);
      }

      toast({
        title: "删除成功",
        description: "提示词已删除",
        variant: "success",
      });

    } catch (error) {
      console.error('删除提示词失败:', error);
      
      toast({
        title: "删除失败",
        description: "提示词删除失败，请重试",
        variant: "destructive",
      });
    }
  }, [prompts, selectedPrompt, dbState.useSqlite, dbClient, toast]);

  // 切换收藏状态
  const toggleFavorite = useCallback((id: string) => {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;

    updatePrompt(id, { isFavorite: !prompt.isFavorite });
  }, [prompts, updatePrompt]);

  // 更新分类
  const updateCategory = useCallback((id: string, name: string, icon?: string) => {
    // 获取旧分类名称用于通知
    const oldCategory = categories.find(cat => cat.id === id);
    
    setCategories(prev => 
      prev.map(category => 
        category.id === id 
          ? { ...category, name, icon } 
          : category
      )
    );
    
    // 同时更新localStorage
    const updatedCategories = categories.map(category => 
      category.id === id 
        ? { ...category, name, icon } 
        : category
    );
    saveCategories(updatedCategories);
    
    toast({
      title: "分类已更新",
      description: `分类 "${oldCategory?.name || id}" 已更新`,
      variant: "success",
    });
  }, [categories, toast]);

  // 删除分类
  const deleteCategory = useCallback((id: string) => {
    // 获取分类信息用于通知
    const categoryToDelete = categories.find(cat => cat.id === id);
    
    // 计算该分类下有多少提示词
    const promptsInCategory = prompts.filter(p => p.category === id).length;
    
    // 将该分类下的提示词移到"general"
    const updatedPrompts = prompts.map(prompt => 
      prompt.category === id 
        ? { ...prompt, category: "general" } 
        : prompt
    );
    setPrompts(updatedPrompts);
    savePrompts(updatedPrompts);
    
    const updatedCategories = categories.filter(category => category.id !== id);
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    
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
  }, [categories, prompts, activeCategory, toast]);

  // 更新分类顺序
  const updateCategoriesOrder = useCallback((reorderedCategories: Category[]) => {
    setCategories(reorderedCategories);
    saveCategories(reorderedCategories);
    
    toast({
      title: "分类顺序已更新",
      description: "分类顺序已成功更新",
      variant: "success",
    });
  }, [toast]);

  // 获取所有标签
  const allTags = useMemo(() => {
    if (dbState.useSqlite && dbClient.isAvailable()) {
      try {
        // 这里需要在useEffect中异步获取，暂时使用prompts中的标签
        const tags = new Set<string>();
        prompts.forEach(prompt => {
          prompt.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
      } catch (error) {
        console.error('从数据库获取标签失败:', error);
      }
    }
    
    // 回退到从prompts中提取标签
    const tags = new Set<string>();
    prompts.forEach(prompt => {
      prompt.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [prompts, refreshCounter, dbState.useSqlite, dbClient]);

  // 根据分类获取标签
  const getTagsForCategory = useCallback(async (categoryId?: string) => {
    if (!categoryId) return allTags;
    
    if (dbState.useSqlite && dbClient.isAvailable()) {
      try {
        return await dbClient.getTagsByCategory(categoryId);
      } catch (error) {
        console.error('从数据库获取分类标签失败:', error);
      }
    }
    
    // 回退到从prompts中筛选
    const categoryPrompts = prompts.filter(prompt => prompt.category === categoryId);
    const tags = new Set<string>();
    categoryPrompts.forEach(prompt => {
      prompt.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [prompts, allTags, dbState.useSqlite, dbClient]);

  // 删除标签（从prompts中移除）
  const deleteTag = useCallback((tagName: string, categoryId?: string) => {
    try {
      // 使用localStorage - 从prompts中删除标签
      const updatedPrompts = prompts.map(prompt => {
        if (!categoryId || prompt.category === categoryId) {
          return {
            ...prompt,
            tags: prompt.tags.filter(tag => tag !== tagName),
            updatedAt: new Date().toISOString()
          };
        }
        return prompt;
      });
      
      setPrompts(updatedPrompts);
      savePrompts(updatedPrompts);
      
      // 如果使用SQLite，也更新数据库
      if (dbState.useSqlite && dbClient.isAvailable()) {
        updatedPrompts.forEach(async (prompt) => {
          if (prompt.tags.length !== prompts.find(p => p.id === prompt.id)?.tags.length) {
            await dbClient.updatePrompt(prompt.id, { tags: prompt.tags });
          }
        });
      }
      
      console.log(`标签 "${tagName}" 已删除`);

      // 如果删除的是当前选中的标签，清空选中状态
      if (selectedTag === tagName) {
        setSelectedTag(null);
      }

    } catch (error) {
      console.error('删除标签失败:', error);
      
      toast({
        title: "删除标签失败",
        description: "标签删除失败，请重试",
        variant: "destructive",
      });
    }
  }, [prompts, selectedTag, dbState.useSqlite, dbClient, toast]);

  // 复制提示词内容
  const copyPromptContent = useCallback((promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;

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
  }, [prompts, toast]);

  // 过滤后的提示词
  const filteredPrompts = useMemo(() => {
    
    const isZh = i18n.language === 'zh-CN';
    const currentLanguage = i18n.language || 'zh-CN';
    let filtered = prompts;

    // 推荐模式
    if (showRecommended) {
      // 推荐数据需补全Prompt缺失字段以兼容类型
      const mapRecommended = (data: any[]): Prompt[] =>
        data.map(item => ({
          ...item,
          isFavorite: item.isFavorite ?? item.sFavorite ?? false,
          version: item.version ?? 1,
        }));
      if (currentLanguage === 'zh-CN') {
        filtered = mapRecommended(recommendedPromptsDataZh);
      } else {
        filtered = mapRecommended(recommendedPromptsDataEn);
      }
    }

    // 分类过滤
    if (activeCategory) {
      if (currentLanguage === 'zh-CN') {
        filtered = filtered.filter(prompt => prompt.category === activeCategory);
      } else {
        filtered = filtered.filter(prompt => prompt.category === activeCategory);
      }
    }

    // 收藏过滤
    if (showFavorites) {
      filtered = filtered.filter(prompt => prompt.isFavorite);
    }

    // 标签过滤
    if (selectedTag) {
      filtered = filtered.filter(prompt => prompt.tags.includes(selectedTag));
    }

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(term) ||
        prompt.content.toLowerCase().includes(term) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [prompts, activeCategory, showFavorites, selectedTag, searchTerm, showRecommended]);

  // 从推荐中添加
  const addFromRecommended = useCallback((prompt: Prompt) => {
    const promptData = {
      title: prompt.title,
      content: prompt.content,
      category: prompt.category,
      tags: prompt.tags,
      isFavorite: false,
      version: 1
    };
    
    addPrompt(promptData);
  }, [addPrompt]);

  // 数据库状态信息
  const getDatabaseInfo = useCallback(() => {
    return {
      ...dbState,
      promptCount: prompts.length,
      categoryCount: categories.length,
      tagCount: allTags.length
    };
  }, [dbState, prompts.length, categories.length, allTags.length]);

  return {
    // 数据状态
    prompts,
    categories,
    filteredPrompts,
    allTags,
    
    // UI状态
    activeCategory,
    setActiveCategory,
    selectedPrompt,
    setSelectedPrompt: safeSetSelectedPrompt,
    searchTerm,
    setSearchTerm,
    showRecommended,
    setShowRecommended,
    selectedTag,
    setSelectedTag,
    showFavorites,
    setShowFavorites,
    refreshCounter,
    hasUnsavedChanges,
    
    // 操作方法
    addPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    copyPromptContent,
    addFromRecommended,
    deleteTag,
    getTagsForCategory,
    
    // 分类管理
    updateCategory,
    deleteCategory,
    updateCategoriesOrder,
    
    // 工具方法
    forceRefresh,
    setCheckUnsavedChangesCallback,
    
    // 重置所有过滤器
    resetAllFilters: () => {
      setActiveCategory(null);
      setShowFavorites(false);
      setShowRecommended(false);
      setSelectedTag(null);
      setSearchTerm('');
      setSelectedPrompt(null);
    },
    
    // 数据库信息
    getDatabaseInfo,
    dbState
  };
}

// 创建Context
const PromptsContext = createContext<ReturnType<typeof usePromptsState> | undefined>(undefined);

// Provider组件
export function PromptsProvider({ children }: { children: ReactNode }) {
  const value = usePromptsState();
  return (
    <PromptsContext.Provider value={value}>
      {children}
    </PromptsContext.Provider>
  );
}

// 导出hook
export function usePrompts() {
  const context = useContext(PromptsContext);
  if (context === undefined) {
    throw new Error('usePrompts must be used within a PromptsProvider');
  }
  return context;
}
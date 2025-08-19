import { useState, useEffect, useCallback, useMemo } from 'react';
import { Prompt, Category, SearchFilters, Settings, VariableValues } from '../shared/types';
import { StorageManager } from '../shared/storage';

export function useExtensionPrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 搜索和过滤状态
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  const storage = StorageManager.getInstance();

  // 加载数据
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [promptsData, categoriesData, settingsData] = await Promise.all([
        storage.getPrompts(),
        storage.getCategories(),
        storage.getSettings()
      ]);

      setPrompts(promptsData);
      setCategories(categoriesData);
      setSettings(settingsData);
    } catch (err) {
      console.error('加载数据失败:', err);
      setError('加载数据失败，请刷新页面重试');
    } finally {
      setIsLoading(false);
    }
  }, [storage]);

  // 初始加载
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 过滤和搜索提示词
  const filteredPrompts = useMemo(() => {
    let filtered = [...prompts];

    // 搜索过滤
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(term) ||
        prompt.description?.toLowerCase().includes(term) ||
        prompt.content.toLowerCase().includes(term) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // 分类过滤
    if (activeCategory !== 'all') {
      if (activeCategory === 'favorites') {
        filtered = filtered.filter(prompt => prompt.isFavorite);
      } else if (activeCategory === 'recent') {
        // 按最近使用排序，取前20个
        filtered = filtered
          .filter(prompt => prompt.lastUsed)
          .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())
          .slice(0, 20);
      } else {
        filtered = filtered.filter(prompt => prompt.category === activeCategory);
      }
    }

    // 标签过滤
    if (selectedTag) {
      filtered = filtered.filter(prompt => prompt.tags.includes(selectedTag));
    }

    // 收藏过滤
    if (showFavorites) {
      filtered = filtered.filter(prompt => prompt.isFavorite);
    }

    // 按更新时间排序
    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [prompts, searchTerm, activeCategory, selectedTag, showFavorites]);

  // 获取所有标签
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    prompts.forEach(prompt => {
      prompt.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [prompts]);

  // 添加提示词
  const addPrompt = useCallback(async (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPrompt: Prompt = {
        ...prompt,
        id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      };

      await storage.addPrompt(newPrompt);
      setPrompts(prev => [newPrompt, ...prev]);
      return newPrompt;
    } catch (err) {
      console.error('添加提示词失败:', err);
      throw new Error('添加提示词失败');
    }
  }, [storage]);

  // 更新提示词
  const updatePrompt = useCallback(async (id: string, updates: Partial<Prompt>) => {
    try {
      await storage.updatePrompt(id, updates);
      setPrompts(prev => prev.map(prompt =>
        prompt.id === id ? { ...prompt, ...updates, updatedAt: new Date().toISOString() } : prompt
      ));
    } catch (err) {
      console.error('更新提示词失败:', err);
      throw new Error('更新提示词失败');
    }
  }, [storage]);

  // 删除提示词
  const deletePrompt = useCallback(async (id: string) => {
    try {
      await storage.deletePrompt(id);
      setPrompts(prev => prev.filter(prompt => prompt.id !== id));
    } catch (err) {
      console.error('删除提示词失败:', err);
      throw new Error('删除提示词失败');
    }
  }, [storage]);

  // 切换收藏状态
  const toggleFavorite = useCallback(async (id: string) => {
    try {
      const prompt = prompts.find(p => p.id === id);
      if (prompt) {
        await updatePrompt(id, { isFavorite: !prompt.isFavorite });
      }
    } catch (err) {
      console.error('切换收藏状态失败:', err);
    }
  }, [prompts, updatePrompt]);

  // 记录使用
  const recordUsage = useCallback(async (promptId: string, action: 'copy' | 'inject' | 'view') => {
    try {
      await storage.recordUsage(promptId, action);
      // 更新本地状态
      setPrompts(prev => prev.map(prompt => {
        if (prompt.id === promptId) {
          return {
            ...prompt,
            usageCount: (prompt.usageCount || 0) + 1,
            lastUsed: new Date().toISOString()
          };
        }
        return prompt;
      }));
    } catch (err) {
      console.error('记录使用失败:', err);
    }
  }, [storage]);

  // 更新设置
  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    try {
      if (settings) {
        const updated = { ...settings, ...newSettings };
        await storage.saveSettings(updated);
        setSettings(updated);
      }
    } catch (err) {
      console.error('更新设置失败:', err);
      throw new Error('更新设置失败');
    }
  }, [settings, storage]);

  // 导出数据
  const exportData = useCallback(async () => {
    try {
      return await storage.exportData();
    } catch (err) {
      console.error('导出数据失败:', err);
      throw new Error('导出数据失败');
    }
  }, [storage]);

  // 导入数据
  const importData = useCallback(async (jsonData: string) => {
    try {
      await storage.importData(jsonData);
      await loadData(); // 重新加载数据
    } catch (err) {
      console.error('导入数据失败:', err);
      throw new Error('导入数据失败');
    }
  }, [storage, loadData]);

  // 清空所有数据
  const clearAllData = useCallback(async () => {
    try {
      await storage.clearAllData();
      await loadData(); // 重新加载数据（会显示默认数据）
    } catch (err) {
      console.error('清空数据失败:', err);
      throw new Error('清空数据失败');
    }
  }, [storage, loadData]);

  // 获取变量历史记录
  const getVariableHistory = useCallback(async (promptId: string): Promise<VariableValues[]> => {
    try {
      return await storage.getVariableHistory(promptId);
    } catch (err) {
      console.error('获取变量历史记录失败:', err);
      return [];
    }
  }, [storage]);

  // 保存变量历史记录
  const saveVariableHistory = useCallback(async (promptId: string, values: VariableValues): Promise<void> => {
    try {
      await storage.saveVariableHistory(promptId, values);
    } catch (err) {
      console.error('保存变量历史记录失败:', err);
      throw new Error('保存变量历史记录失败');
    }
  }, [storage]);

  return {
    // 数据
    prompts: filteredPrompts,
    allPrompts: prompts,
    categories,
    settings,
    allTags,
    isLoading,
    error,

    // 搜索和过滤
    searchTerm,
    setSearchTerm,
    activeCategory,
    setActiveCategory,
    selectedTag,
    setSelectedTag,
    showFavorites,
    setShowFavorites,

    // 操作方法
    addPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    recordUsage,
    updateSettings,
    exportData,
    importData,
    clearAllData,
    getVariableHistory,
    saveVariableHistory,
    refreshData: loadData,

    // 统计信息
    totalPrompts: prompts.length,
    favoritePrompts: prompts.filter(p => p.isFavorite).length,
    categoryCounts: categories.map(cat => ({
      ...cat,
      count: prompts.filter(p => p.category === cat.id).length
    }))
  };
}
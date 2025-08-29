/**
 * PromptMate 侧边栏 - 渐进式功能版本
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Icons } from '../components/ui/icons';
import { cn } from '../lib/utils';
import { useExtensionPrompts } from '../hooks/useExtensionPrompts';
import { Prompt, VariableValues } from '../shared/types';
import { PromptEditView } from '../components/PromptEditView';
import { SettingsView } from '../components/SettingsView';
import { VariableFormView } from '../components/VariableFormView';
import { NewPromptList } from '../components/NewPromptList';
import { extractVariables, hasVariables } from '../shared/variableUtils';
import { debounce, performSearch, sortPrompts } from '../utils/searchUtils';
import { useTranslation, t } from '../i18n';
import { useTheme } from '../hooks/useTheme';
import '../assets/styles.css';

interface SidePanelProps {}

const SidePanel: React.FC<SidePanelProps> = () => {
  console.log('🔄 SidePanel component rendering...');
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  
  // Error boundary state
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Error handling effect
  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('SidePanel error:', error);
      setHasError(true);
      setErrorMessage(t('error_componentRuntime') + ': ' + error.message);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('SidePanel unhandled promise rejection:', event.reason);
      setErrorMessage(t('error_asyncOperation') + ': ' + (event.reason?.message || event.reason));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // If there's a critical error, show error UI
  if (hasError) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-destructive mb-2">❌ {t('sidepanel_componentLoadFailed')}</div>
          <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
          <Button 
            onClick={() => {
              setHasError(false);
              setErrorMessage(null);
              window.location.reload();
            }}
            variant="outline"
            size="sm"
          >
            {t('sidepanel_reload')}
          </Button>
        </div>
      </div>
    );
  }
  
  const {
    prompts, // This is now the filtered list
    categories,
    settings,
    isLoading, // Corrected from 'loading'
    error: hookError,
    searchTerm,
    setSearchTerm,
    activeCategory, // Corrected from 'selectedCategory'
    setActiveCategory, // Corrected from 'setSelectedCategory'
    selectedTag,
    setSelectedTag,
    allTags,
    addPrompt,
    updatePrompt,
    deletePrompt,
    addCategory,
    updateSettings,
    exportData,
    importData,
    clearAllData,
    getVariableHistory,
    saveVariableHistory
  } = useExtensionPrompts();
  
  // Component state
  const [selectedPrompt, setSelectedPrompt] = React.useState<Prompt | null>(null);
  const [editingPrompt, setEditingPrompt] = React.useState<Prompt | null>(null);
  const [currentView, setCurrentView] = React.useState<'list' | 'variables' | 'edit' | 'settings'>('list');
  const [currentPromptForVariables, setCurrentPromptForVariables] = React.useState<Prompt | null>(null);
  const [variableHistory, setVariableHistory] = React.useState<VariableValues[]>([]);
  
  // Additional state for UI controls
  const [showFavorites, setShowFavorites] = React.useState<boolean>(false);
  // 'activeCategory' and 'setActiveCategory' are now from the hook.
  // 'error' state is replaced by 'hookError' from the hook.
  // The 'error' state is now managed by the 'hookError' variable from the useExtensionPrompts hook.
  
  // 本地搜索输入（防抖）
  const [searchInput, setSearchInput] = React.useState<string>(searchTerm);
  const debouncedSetSearch = React.useMemo(() => debounce((val: string) => setSearchTerm(val), 250), [setSearchTerm]);
  React.useEffect(() => { setSearchInput(searchTerm); }, [searchTerm]);

  // 标签滚动相关状态
  const categoryScrollRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(false);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');

  // Computed values
  const favoritePrompts = React.useMemo(() => {
    return prompts.filter(p => p.isFavorite).length;
  }, [prompts]);

  const totalPrompts = prompts.length;
  // const isLoading = loading; // This is now directly from the hook as 'isLoading'

  // Record usage function
  const recordUsage = React.useCallback(async (promptId: string, action: 'copy' | 'inject' | 'view') => {
    try {
      console.log(`Recording usage: ${promptId} - ${action}`);
      // This would typically call a function from useExtensionPrompts
      // For now, we'll just log it
    } catch (error) {
      console.error('记录使用情况失败:', error);
    }
  }, []);

  // Toggle favorite function
  const toggleFavorite = React.useCallback(async (promptId: string) => {
    try {
      const prompt = prompts.find(p => p.id === promptId);
      if (!prompt) {
        showToast(t('toast_promptNotFound'), 'error');
        return;
      }
      
      await updatePrompt(prompt.id, { 
        ...prompt, 
        isFavorite: !prompt.isFavorite 
      });
      showToast(
        prompt.isFavorite ? t('toast_favoriteRemoved') : t('toast_favoriteAdded'), 
        'success'
      );
    } catch (error) {
      console.error('切换收藏状态失败:', error);
      showToast(t('toast_operationFailed'), 'error');
    }
  }, [prompts, updatePrompt]);

  // 复制到剪贴板
  const handleCopy = React.useCallback(async (text: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      await recordUsage(promptId, 'copy');
      showToast(t('toast_copied'), 'success');
    } catch (err) {
      console.error('复制失败:', err);
      showToast(t('toast_copyFailed'), 'error');
    }
  }, [recordUsage]);

  // 处理带变量的复制
  const handleCopyWithVariables = React.useCallback(async (prompt: Prompt) => {
    if (hasVariables(prompt.content)) {
      // 切换到变量填写视图
      setCurrentPromptForVariables(prompt);
      const history = await getVariableHistory(prompt.id);
      setVariableHistory(history);
      setCurrentView('variables');
    } else {
      // 直接复制
      await handleCopy(prompt.content, prompt.id);
    }
  }, [getVariableHistory, handleCopy]);

  // 注入到页面
  const handleInject = React.useCallback((text: string, promptId: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id, 
          {
            type: 'INJECT_TEXT',
            payload: { text }
          },
          async (response) => {
            if (chrome.runtime.lastError) {
              console.error('注入失败:', chrome.runtime.lastError.message);
              showToast(t('toast_injectFailedRefresh'), 'error');
            } else if (response?.success) {
              console.log('文本注入成功');
              await recordUsage(promptId, 'inject');
              showToast(t('toast_injected'), 'success');
            } else {
              console.error('注入失败:', response?.error);
              showToast(response?.error || t('toast_injectFailedNoInput'), 'error');
            }
          }
        );
      } else {
        showToast(t('toast_injectFailedNoPage'), 'error');
      }
    });
  }, [recordUsage]);

  // 处理带变量的注入
  const handleInjectWithVariables = React.useCallback(async (prompt: Prompt) => {
    if (hasVariables(prompt.content)) {
      // 切换到变量填写视图
      setCurrentPromptForVariables(prompt);
      const history = await getVariableHistory(prompt.id);
      setVariableHistory(history);
      setCurrentView('variables');
    } else {
      // 直接注入
      handleInject(prompt.content, prompt.id);
    }
  }, [getVariableHistory, handleInject]);

  // 显示提示消息
  const showToast = React.useCallback((message: string, type: 'success' | 'error' = 'success') => {
    // 创建临时提示元素
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideUp 0.3s ease-out;
      max-width: 300px;
      text-align: center;
    `;
    
    // 添加动画
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 3秒后移除
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideUp 0.3s ease-out reverse';
        setTimeout(() => {
          toast.remove();
          style.remove();
        }, 300);
      }
    }, 3000);
  }, []);


  // Type guard for prompt validation
  const isValidPrompt = React.useCallback((prompt: any): prompt is Prompt => {
    return prompt && 
           typeof prompt.id === 'string' && 
           typeof prompt.title === 'string' && 
           typeof prompt.content === 'string';
  }, []);

  // 处理提示词选择
  const handlePromptSelect = React.useCallback(async (prompt: Prompt) => {
    if (!isValidPrompt(prompt)) {
      console.error('Invalid prompt object:', prompt);
      showToast(t('sidepanel_invalidPromptData'), 'error');
      return;
    }
    
    setSelectedPrompt(prompt);
    await recordUsage(prompt.id, 'view');
  }, [recordUsage, isValidPrompt]);

  // 打开新建提示词视图
  const handleCreatePrompt = React.useCallback(() => {
    console.log('🚀 handleCreatePrompt called');
    console.log('📍 Current currentView:', currentView);
    console.log('📍 Current editingPrompt:', editingPrompt);
    console.log('📍 Categories length:', categories?.length);
    console.log('📍 Setting editingPrompt to null and currentView to edit');
    
    try {
      setEditingPrompt(null);
      setCurrentView('edit');
      
      // 验证状态是否更新
      setTimeout(() => {
        console.log('✅ After state update - currentView should be edit');
        console.log('📍 Updated currentView:', currentView);
      }, 100);
    } catch (error) {
      console.error('❌ Error in handleCreatePrompt:', error);
    }
  }, [currentView, editingPrompt, categories]);

  // 打开编辑提示词视图
  const handleEditPrompt = React.useCallback((prompt: Prompt) => {
    console.log('📝 SidePanel - handleEditPrompt called with:', prompt.title);
    setEditingPrompt(prompt);
    setCurrentView('edit');
  }, []);

  // 关闭编辑视图
  const handleCloseEdit = React.useCallback(() => {
    setCurrentView('list');
    setEditingPrompt(null);
  }, []);

  // 保存或更新提示词
  const handleSaveOrUpdatePrompt = React.useCallback(async (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    try {
      if (!promptData.title?.trim() || !promptData.content?.trim()) {
        showToast(t('validation_titleContentRequired'), 'error');
        throw new Error('Validation failed');
      }

      if (promptData.id) {
        // Update existing prompt
        await updatePrompt(promptData.id, promptData);
        showToast(t('toast_promptUpdated'), 'success');
      } else {
        // Create new prompt
        await addPrompt(promptData);
        showToast(t('toast_promptCreated'), 'success');
      }
      handleCloseEdit(); // Go back to list view on success
    } catch (error) {
      console.error('保存提示词失败:', error);
      showToast(t('toast_saveFailed'), 'error');
      throw error; // Re-throw to let the component handle its saving state
    }
  }, [addPrompt, updatePrompt, handleCloseEdit]);

  // 标签滚动控制函数
  const updateScrollArrows = React.useCallback(() => {
    const container = categoryScrollRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  const scrollCategories = React.useCallback((direction: 'left' | 'right') => {
    const container = categoryScrollRef.current;
    if (!container) return;
    
    const scrollAmount = 120;
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  }, []);

  const handleCategoryWheel = React.useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const container = categoryScrollRef.current;
    if (!container) return;
    
    container.scrollLeft += e.deltaY;
    updateScrollArrows();
  }, [updateScrollArrows]);

  // 监听滚动更新箭头状态
  React.useEffect(() => {
    const container = categoryScrollRef.current;
    if (!container) return;
    
    const handleScroll = () => updateScrollArrows();
    container.addEventListener('scroll', handleScroll);
    
    // 初始检查
    updateScrollArrows();
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, [updateScrollArrows]);

  // 添加新分类
  const handleAddNewCategory = React.useCallback(async (name: string) => {
    if (!name.trim()) return null;
    
    try {
      const newCategory = await addCategory({ 
        name: name.trim(),
        icon: '📁',
        color: '#6366f1'
      });
      
      showToast(t('toast_categoryCreated', { name: name.trim() }), 'success');
      setNewCategoryName('');
      setShowNewCategoryDialog(false);
      
      return newCategory;
    } catch (error) {
      console.error('添加分类失败:', error);
      showToast(t('toast_categoryCreateFailed'), 'error');
      return null;
    }
  }, [addCategory]);

  // 创建新分类对话框处理
  const handleCreateCategory = React.useCallback(() => {
    if (newCategoryName.trim()) {
      handleAddNewCategory(newCategoryName.trim());
    }
  }, [newCategoryName, handleAddNewCategory]);

  // 删除提示词
  const handleDeletePrompt = React.useCallback(async (prompt: Prompt) => {
    if (confirm(t('confirm_deletePrompt', { title: prompt.title }))) {
      try {
        await deletePrompt(prompt.id);
        showToast(t('success_promptDeleted'), 'success');
        if (selectedPrompt?.id === prompt.id) {
          setSelectedPrompt(null);
        }
      } catch (error) {
        console.error('删除提示词失败:', error);
        showToast(t('error_deletePromptFailed'), 'error');
      }
    }
  }, [deletePrompt, selectedPrompt, t]);

  // 处理变量视图的复制
  const handleVariableCopy = React.useCallback(async (finalText: string, variableValues: VariableValues) => {
    if (currentPromptForVariables) {
      await handleCopy(finalText, currentPromptForVariables.id);
      // 保存变量值到历史
      if (Object.keys(variableValues).length > 0) {
        await handleSaveVariableValues(variableValues);
      }
    }
  }, [currentPromptForVariables, handleCopy]);

  // 处理变量视图的注入
  const handleVariableInject = React.useCallback(async (finalText: string, variableValues: VariableValues) => {
    if (currentPromptForVariables) {
      handleInject(finalText, currentPromptForVariables.id);
      // 保存变量值到历史
      if (Object.keys(variableValues).length > 0) {
        await handleSaveVariableValues(variableValues);
      }
    }
  }, [currentPromptForVariables, handleInject]);

  // 保存变量值到历史
  const handleSaveVariableValues = React.useCallback(async (values: VariableValues) => {
    if (currentPromptForVariables) {
      await saveVariableHistory(currentPromptForVariables.id, values);
    }
  }, [currentPromptForVariables, saveVariableHistory]);

  // 返回到提示词列表
  const handleBackToList = React.useCallback(() => {
    setCurrentView('list');
    setCurrentPromptForVariables(null);
    setVariableHistory([]);
  }, []);

  // 关闭变量视图
  const handleCloseVariables = React.useCallback(() => {
    setCurrentView('list');
    setCurrentPromptForVariables(null);
    setVariableHistory([]);
  }, []);


  // 打开设置视图
  const handleOpenSettings = React.useCallback(() => {
    console.log('handleOpenSettings called, setting view to settings');
    setCurrentView('settings');
    console.log('currentView should now be settings');
  }, []);

  // 关闭设置视图
  const handleCloseSettings = React.useCallback(() => {
    setCurrentView('list');
  }, []);

  // 处理文件导入
  const handleImportFile = React.useCallback(async (file: File) => {
    try {
      const text = await file.text();
      await importData(text);
    } catch (error) {
      console.error('导入文件失败:', error);
      showToast(t('sidepanel_importFailed'), 'error');
    }
  }, [importData]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 头部 - 紧凑设计 - 仅在列表视图显示 */}
      {currentView === 'list' && (
        <div className="flex-shrink-0 p-3 border-b border-border/30">
        {/* <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">P</span>
            </div>
            <h1 className="text-base font-semibold">PromptMate</h1>
          </div>
          <div className="text-xs text-muted-foreground/80">
            {totalPrompts}
          </div>
        </div> */}
        
        {/* 搜索与筛选行 */}
        <div className="relative mb-2">
          <Icons.search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <Input
            placeholder={t('sidepanel_searchPlaceholder')}
            value={searchInput}
            onChange={(e) => { const v = e.target.value; setSearchInput(v); debouncedSetSearch(v); }}
            className="pl-8 h-8 text-sm bg-background/80 border-border/40 focus:border-primary/50 transition-all duration-200"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button
              variant={showFavorites ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setShowFavorites(!showFavorites)}
              title={showFavorites ? t('sidepanel_showAll') : t('sidepanel_favoritesOnly')}
            >
              <span className={cn('mr-1', showFavorites ? 'text-yellow-400' : 'text-muted-foreground')}>⭐</span>
              {t('sidepanel_favoritesOnly')}
            </Button>
          </div>
        </div>

        {/* 分类筛选 - 带箭头控制的滚动设计 */}
        <div className="relative flex items-center">
          {/* 左箭头 */}
          {showLeftArrow && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollCategories('left')}
              className="absolute left-0 z-10 h-6 w-6 p-0 bg-background/80 backdrop-blur-sm border border-border/50 rounded-full shadow-sm"
            >
              <Icons.chevronDown className="h-3 w-3 rotate-90" />
            </Button>
          )}
          
          {/* 滚动容器 */}
          <div 
            ref={categoryScrollRef}
            onWheel={handleCategoryWheel}
            className="flex gap-1 overflow-x-hidden pb-1 mx-6 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('all')}
              className="h-6 px-3 text-xs whitespace-nowrap shrink-0 rounded-full font-medium"
            >
              {t('sidepanel_all')}
            </Button>
            <Button
              variant={activeCategory === 'favorites' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('favorites')}
              className="h-6 px-3 text-xs whitespace-nowrap shrink-0 rounded-full font-medium"
            >
              ⭐ {favoritePrompts}
            </Button>
            <Button
              variant={activeCategory === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('recent')}
              className="h-6 px-3 text-xs whitespace-nowrap shrink-0 rounded-full font-medium"
            >
              {t('sidepanel_recent')}
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className="h-6 px-3 text-xs whitespace-nowrap shrink-0 rounded-full font-medium"
              >
                {category.name}
              </Button>
            ))}
            {/* 新建分类按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewCategoryDialog(true)}
              className="h-6 px-3 text-xs whitespace-nowrap shrink-0 rounded-full font-medium border-dashed text-muted-foreground hover:text-foreground"
            >
              <Icons.plus className="h-3 w-3 mr-1" />
              {t('sidepanel_newCategory')}
            </Button>
          </div>
          
          {/* 右箭头 */}
          {showRightArrow && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollCategories('right')}
              className="absolute right-0 z-10 h-6 w-6 p-0 bg-background/80 backdrop-blur-sm border border-border/50 rounded-full shadow-sm"
            >
              <Icons.chevronDown className="h-3 w-3 -rotate-90" />
            </Button>
          )}
        </div>

        {/* 标签筛选 - 可横向滚动的芯片 */}
        {/* {allTags.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pt-1 pb-1 scrollbar-none">
            <Button
              variant={!selectedTag ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag(null)}
              className="h-6 px-3 text-xs whitespace-nowrap shrink-0 rounded-full"
            >
              全部标签
            </Button>
            {allTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className="h-6 px-3 text-xs whitespace-nowrap shrink-0 rounded-full"
              >
                #{tag}
              </Button>
            ))}
          </div>
        )} */}
        </div>
      )}

      {/* 主内容区域 - 使用 switch 语句进行视图切换 */}
      <div className="flex-1 flex flex-col min-h-0">
        {(() => {
          console.log('📍 Rendering main content - currentView:', currentView);
          console.log('📍 editingPrompt:', editingPrompt);
          console.log('📍 categories:', categories?.length);
          console.log('📍 handleSaveOrUpdatePrompt:', typeof handleSaveOrUpdatePrompt);
          console.log('📍 handleCloseEdit:', typeof handleCloseEdit);
          console.log('📍 handleAddNewCategory:', typeof handleAddNewCategory);

          switch (currentView) {
            case 'edit':
              console.log('🎯 SidePanel - Rendering edit view');
              console.log('📝 SidePanel - editingPrompt:', editingPrompt ? { id: editingPrompt.id, title: editingPrompt.title } : null);
              console.log('📂 SidePanel - categories count:', categories?.length);
              console.log('🔧 SidePanel - handlers available:', {
                handleSaveOrUpdatePrompt: typeof handleSaveOrUpdatePrompt,
                handleCloseEdit: typeof handleCloseEdit,
                handleAddNewCategory: typeof handleAddNewCategory
              });
              
              try {
                console.log('🚀 SidePanel - About to render PromptEditView');
                const editViewElement = (
                  <React.Suspense fallback={
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p>{t('sidepanel_loadingEditor')}</p>
                      </div>
                    </div>
                  }>
                    <PromptEditView
                      prompt={editingPrompt}
                      categories={categories}
                      onSave={handleSaveOrUpdatePrompt}
                      onCancel={handleCloseEdit}
                      onAddNewCategory={handleAddNewCategory}
                      showBackButton={true}
                      showCloseButton={false}
                    />
                  </React.Suspense>
                );
                console.log('✅ SidePanel - PromptEditView element created successfully');
                return editViewElement;
              } catch (error) {
                console.error('❌ SidePanel - Error rendering PromptEditView:', error);
                console.error('❌ SidePanel - Error stack:', error.stack);
                return (
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="text-red-500 mb-2">❌ {t('sidepanel_editViewError')}</div>
                      <p className="text-sm text-gray-600 mb-4">{error.message}</p>
                      <button onClick={() => setCurrentView('list')} className="px-4 py-2 bg-blue-500 text-white rounded">
                        {t('sidepanel_backToList')}
                      </button>
                    </div>
                  </div>
                );
              }

            case 'variables':
              return (
                <VariableFormView
                  promptTitle={currentPromptForVariables.title}
                  promptContent={currentPromptForVariables.content}
                  onBack={handleBackToList}
                  onClose={handleCloseVariables}
                  onCopy={handleVariableCopy}
                  onInject={handleVariableInject}
                  variableHistory={variableHistory}
                  showBackButton={true}
                  showCloseButton={true}
                />
              );

            case 'settings':
              return (
                <ScrollArea className="flex-1">
                  <SettingsView
                    onBack={handleCloseSettings}
                  />
                </ScrollArea>
              );

            case 'list':
            default:
              if (isLoading) {
                return (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p>{t('sidepanel_loading')}</p>
                    </div>
                  </div>
                );
              }
              if (hookError) {
                return (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-8 text-destructive">
                      <Icons.star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{hookError}</p>
                    </div>
                  </div>
                );
              }
              if (prompts.length === 0) {
                return (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-10 text-muted-foreground">
                      <Icons.search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="mb-1">{t('sidepanel_noMatches')}</p>
                      <p className="text-xs opacity-80">
                        {t('sidepanel_noMatchesHint')}
                      </p>
                    </div>
                  </div>
                );
              }
              return (
                <NewPromptList
                  prompts={prompts}
                  selectedPrompt={selectedPrompt}
                  onPromptSelect={handlePromptSelect}
                  onCopyWithVariables={handleCopyWithVariables}
                  onInjectWithVariables={handleInjectWithVariables}
                  onToggleFavorite={toggleFavorite}
                  onEditPrompt={handleEditPrompt}
                  onDeletePrompt={handleDeletePrompt}
                />
              );
          }
        })()}
      </div>

      {/* 底部操作栏 - 仅在列表视图显示 */}
      {currentView === 'list' && (
        <div className="flex-shrink-0 p-3 border-t bg-background/95 backdrop-blur-sm relative z-10">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleCreatePrompt}
          >
            <Icons.plus className="w-4 h-4 mr-1" />
            {t('sidepanel_new')}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleOpenSettings}
          >
            <Icons.settings className="w-4 h-4 mr-1" />
            {t('sidepanel_settings')}
          </Button>
        </div>
        </div>
      )}

      {/* 新建分类对话框 */}
      {showNewCategoryDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-4 w-80 max-w-[90vw]">
            <h3 className="text-sm font-medium mb-3">{t('sidepanel_newCategoryTitle')}</h3>
            <Input
              placeholder={t('sidepanel_categoryNamePlaceholder')}
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateCategory();
                } else if (e.key === 'Escape') {
                  setShowNewCategoryDialog(false);
                  setNewCategoryName('');
                }
              }}
              className="mb-3"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowNewCategoryDialog(false);
                  setNewCategoryName('');
                }}
              >
                {t('sidepanel_cancel')}
              </Button>
              <Button
                size="sm"
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
              >
                {t('sidepanel_create')}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// 初始化函数
function initializeSidePanel() {
  console.log('初始化PromptMate侧边栏...');
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('找不到root元素');
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(React.createElement(SidePanel));
    console.log('侧边栏初始化成功');
  } catch (error) {
    console.error('侧边栏初始化失败:', error);
    
    // Fallback: 使用原生DOM显示错误
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #ef4444;">PromptMate 加载失败</h1>
        <p style="color: #6b7280;">UI组件无法正常加载，请检查控制台错误信息。</p>
        <pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; overflow-x: auto;">${error}</pre>
      </div>
    `;
  }
}

// 等待DOM加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSidePanel);
} else {
  initializeSidePanel();
}
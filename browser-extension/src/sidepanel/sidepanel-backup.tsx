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
import '../assets/styles.css';

interface SidePanelProps {}

const SidePanel: React.FC<SidePanelProps> = () => {
  console.log(' SidePanel component rendering...');
  
  const {
    prompts,
    categories,
    settings,
    loading,
    searchTerm,
    selectedCategory,
    selectedTag,
    allTags,
    filteredPrompts,
    setSearchTerm,
    setSelectedCategory,
    setSelectedTag,
    addPrompt,
    updatePrompt,
    deletePrompt,
    updateSettings,
    exportData,
    importData,
    clearAllData,
    getVariableHistory,
    saveVariableHistory
  } = useExtensionPrompts();
  
  const [selectedPrompt, setSelectedPrompt] = React.useState<Prompt | null>(null);
  const [editingPrompt, setEditingPrompt] = React.useState<Prompt | null>(null);
  const [currentView, setCurrentView] = React.useState<'list' | 'variables' | 'edit' | 'settings'>('list');
  const [currentPromptForVariables, setCurrentPromptForVariables] = React.useState<Prompt | null>(null);
  const [variableHistory, setVariableHistory] = React.useState<VariableValues[]>([]);
  // 本地搜索输入（防抖）
  const [searchInput, setSearchInput] = React.useState<string>(searchTerm);
  const debouncedSetSearch = React.useMemo(() => debounce((val: string) => setSearchTerm(val), 250), [setSearchTerm]);
  React.useEffect(() => { setSearchInput(searchTerm); }, [searchTerm]);

  // 复制到剪贴板
  const handleCopy = React.useCallback(async (text: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      await recordUsage(promptId, 'copy');
      showToast('已复制到剪贴板', 'success');
    } catch (err) {
      console.error('复制失败:', err);
      showToast('复制失败', 'error');
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
              showToast('注入失败：请刷新页面后重试', 'error');
            } else if (response?.success) {
              console.log('文本注入成功');
              await recordUsage(promptId, 'inject');
              showToast('文本已注入到页面', 'success');
            } else {
              console.error('注入失败:', response?.error);
              showToast(response?.error || '注入失败：未找到输入框', 'error');
            }
          }
        );
      } else {
        showToast('注入失败：无法获取当前页面', 'error');
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


  // 处理提示词选择
  const handlePromptSelect = React.useCallback(async (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    await recordUsage(prompt.id, 'view');
  }, [recordUsage]);

  // 打开新建提示词视图
  const handleCreatePrompt = React.useCallback(() => {
    setEditingPrompt(null);
    setCurrentView('edit');
  }, []);

  // 打开编辑提示词视图
  const handleEditPrompt = React.useCallback((prompt: Prompt) => {
    setEditingPrompt(prompt);
    setCurrentView('edit');
  }, []);

  // 保存新提示词
  const handleSavePrompt = React.useCallback(async (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addPrompt(promptData);
      showToast('提示词创建成功', 'success');
    } catch (error) {
      console.error('创建提示词失败:', error);
      showToast('创建提示词失败', 'error');
      throw error;
    }
  }, [addPrompt]);

  // 更新提示词
  const handleUpdatePrompt = React.useCallback(async (id: string, updates: Partial<Prompt>) => {
    try {
      await updatePrompt(id, updates);
      showToast('提示词更新成功', 'success');
    } catch (error) {
      console.error('更新提示词失败:', error);
      showToast('更新提示词失败', 'error');
      throw error;
    }
  }, [updatePrompt]);

  // 删除提示词
  const handleDeletePrompt = React.useCallback(async (prompt: Prompt) => {
    if (confirm(`确定要删除提示词"${prompt.title}"吗？此操作无法撤销。`)) {
      try {
        await deletePrompt(prompt.id);
        showToast('提示词已删除', 'success');
        if (selectedPrompt?.id === prompt.id) {
          setSelectedPrompt(null);
        }
      } catch (error) {
        console.error('删除提示词失败:', error);
        showToast('删除提示词失败', 'error');
      }
    }
  }, [deletePrompt, selectedPrompt]);

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

  // 关闭编辑视图
    setCurrentView('list');
  }, []);

  // 打开设置视图
  const handleOpenSettings = React.useCallback(() => {
    console.log('handleOpenSettings called, setting view to settings');
    setCurrentView('settings');
    console.log('currentView should now be settings');
  }, []);

  }, []);

  // 处理文件导入
  const handleImportFile = React.useCallback(async (file: File) => {
    try {
      const text = await file.text();
      await importData(text);
    } catch (error) {
      console.error('导入文件失败:', error);
      showToast('导入文件失败', 'error');
    }
  }, [importData]);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
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
            placeholder="搜索提示词..."
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
              title={showFavorites ? '显示全部' : '仅收藏'}
            >
              <span className={cn('mr-1', showFavorites ? 'text-yellow-400' : 'text-muted-foreground')}>⭐</span>
              仅收藏
            </Button>
          </div>
        </div>

        {/* 分类筛选 - 紧凑标签设计 */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('all')}
            className="h-6 px-3 text-xs whitespace-nowrap shrink-0 rounded-full font-medium"
          >
            全部
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
            最近
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

      {/* 主内容区域 */}
      {currentView === 'settings' ? (
        <SettingsView
          isVisible={true}
          settings={settings}
          onBack={handleCloseSettings}
          onClose={handleCloseSettings}
          onUpdateSettings={updateSettings}
          onExportData={exportData}
          onImportData={handleImportFile}
          onClearData={clearAllData}
        />
      ) : currentView === 'edit' ? (
        <div>
          <div style={{ padding: '10px', background: 'red', color: 'white' }}>
            DEBUG: Edit view is rendering. Prompt: {editingPrompt ? editingPrompt.title : 'null'}
          </div>
          <PromptEditView
            isVisible={true}
            prompt={editingPrompt}
            categories={categories}
            onBack={handleCloseEdit}
            onClose={handleCloseEdit}
            onSave={handleSavePrompt}
            onUpdate={handleUpdatePrompt}
          />
        </div>
      ) : currentView === 'variables' && currentPromptForVariables ? (
        <VariableFormView
          isVisible={true}
          promptTitle={currentPromptForVariables.title}
          promptContent={currentPromptForVariables.content}
          onBack={handleBackToList}
          onClose={handleCloseVariables}
          onCopy={handleVariableCopy}
          onInject={handleVariableInject}
          variableHistory={variableHistory}
        />
      ) : (
        /* 提示词列表 */
        <>
        {isLoading ? (
        <div className="flex-1 min-h-0 relative">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>加载中...</p>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8 text-destructive">
            <Icons.star className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{error}</p>
          </div>
        </div>
      ) : prompts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-10 text-muted-foreground">
            <Icons.search className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="mb-1">没有匹配的提示词</p>
            <p className="text-xs opacity-80">
              尝试调整搜索关键词、切换分类或清除标签/收藏筛选
            </p>
          </div>
        </div>
      ) : (
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
      )}
        </>
      )}

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
            新建
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleOpenSettings}
          >
            <Icons.settings className="w-4 h-4 mr-1" />
            设置
          </Button>
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
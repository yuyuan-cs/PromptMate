/**
 * PromptMate 侧边栏 - 优化版本
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Icons } from '../components/ui/icons';
import { ScrollArea } from '../components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { VirtualizedPromptList } from '../components/VirtualizedPromptList';
import { PromptEditView } from '../components/PromptEditView';
import { SettingsView } from '../components/SettingsView';
import { VariableFormView } from '../components/VariableFormView';
import { useExtensionPrompts } from '../hooks/useExtensionPrompts';
import { Prompt, VariableValues } from '../shared/types';
import { cn } from '../lib/utils';
import '../assets/styles.css';

// --- 改进 3: 使用常量管理视图名称 ---
const VIEW_STATES = {
  LIST: 'list',
  EDIT: 'edit',
  SETTINGS: 'settings',
  VARIABLES: 'variables',
} as const;

type ViewState = typeof VIEW_STATES[keyof typeof VIEW_STATES];

interface SidePanelProps {}

const SidePanel: React.FC<SidePanelProps> = () => {
  const {
    prompts,
    categories: promptCategories,
    settings,
    isLoading,
    error,
    searchTerm,
    allTags,
    setSearchTerm,
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
  
  // --- 改进 1: 为 state 添加明确类型 ---
  const [currentView, setCurrentView] = React.useState<ViewState>(VIEW_STATES.LIST);
  const [editingPrompt, setEditingPrompt] = React.useState<Prompt | null>(null);
  const [currentPromptForVariables, setCurrentPromptForVariables] = React.useState<Prompt | null>(null);
  const [variableHistory, setVariableHistory] = React.useState<any[]>([]);
  const [expandedPromptId, setExpandedPromptId] = React.useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = React.useState<Prompt | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('全部');
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const [showFavorites, setShowFavorites] = React.useState(false);

  const handleCreatePrompt = React.useCallback(() => {
    setCurrentView(VIEW_STATES.EDIT);
    setEditingPrompt(null);
  }, []);

  const handleEditPrompt = React.useCallback((prompt: Prompt) => {
    setCurrentView(VIEW_STATES.EDIT);
    setEditingPrompt(prompt);
  }, []);

  const handleBackToList = React.useCallback(() => {
    setCurrentView(VIEW_STATES.LIST);
    setEditingPrompt(null);
    setCurrentPromptForVariables(null);
    setVariableHistory([]);
  }, []);

  const handleSavePrompt = React.useCallback(async (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addPrompt(promptData);
    handleBackToList();
  }, [addPrompt, handleBackToList]);

  const handleUpdatePrompt = React.useCallback(async (id: string, updates: Partial<Prompt>) => {
    await updatePrompt(id, updates);
    handleBackToList();
  }, [updatePrompt, handleBackToList]);

  const handlePromptSelect = React.useCallback((prompt: Prompt) => {
    setSelectedPrompt(prompt);
  }, []);

  const handleToggleExpand = React.useCallback((promptId: string) => {
    setExpandedPromptId(prev => prev === promptId ? null : promptId);
  }, []);

  const handleCopyWithVariables = React.useCallback((prompt: Prompt) => {
    // 复制功能实现
    navigator.clipboard.writeText(prompt.content);
  }, []);

  const handleInjectWithVariables = React.useCallback((prompt: Prompt) => {
    // 注入功能实现
    setCurrentPromptForVariables(prompt);
    setCurrentView(VIEW_STATES.VARIABLES);
  }, []);

  const handleToggleFavorite = React.useCallback(async (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (prompt) {
      await updatePrompt(promptId, { isFavorite: !prompt.isFavorite });
    }
  }, [prompts, updatePrompt]);

  const handleDeletePrompt = React.useCallback(async (prompt: Prompt) => {
    if (confirm(`确定要删除提示词 "${prompt.title}" 吗？`)) {
      await deletePrompt(prompt.id);
    }
  }, [deletePrompt]);

  const handleShowSettings = React.useCallback(() => {
    setCurrentView(VIEW_STATES.SETTINGS);
  }, []);

  // 获取所有分类
  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(prompts.map(p => p.category)));
    return ['全部', ...cats];
  }, [prompts]);

  // 获取当前分类的标签
  const currentTags = React.useMemo(() => {
    const targetPrompts = selectedCategory === '全部' 
      ? prompts 
      : prompts.filter(p => p.category === selectedCategory);
    const tagsSet = new Set<string>();
    targetPrompts.forEach(prompt => {
      prompt.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [prompts, selectedCategory]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <p>加载失败: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 主内容区域 */}
      {currentView === VIEW_STATES.LIST ? (
        <div className="flex-1 flex flex-col">
          {/* 头部搜索区域 */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <h1 className="text-lg font-semibold">PromptMate</h1>
              <div className="ml-auto flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShowSettings}
                  className="h-8 w-8 p-0"
                >
                  <Icons.settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* 搜索框 */}
            <div className="relative mb-3">
              <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索提示词..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 分类和标签筛选 */}
            <div className="flex items-center gap-2 mb-3">
              <ScrollArea className="flex-1">
                <div className="flex gap-1 pb-1">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "secondary"}
                      className={cn(
                        "cursor-pointer whitespace-nowrap",
                        selectedCategory === category && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* 标签筛选 */}
            {currentTags.length > 0 && (
              <div className="mb-3">
                <ScrollArea className="w-full">
                  <div className="flex gap-1 pb-1">
                    <Badge
                      variant={selectedTag === null ? "default" : "outline"}
                      className="cursor-pointer whitespace-nowrap"
                      onClick={() => setSelectedTag(null)}
                    >
                      全部标签
                    </Badge>
                    {currentTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTag === tag ? "default" : "outline"}
                        className="cursor-pointer whitespace-nowrap"
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <Button onClick={handleCreatePrompt} size="sm" className="flex-1">
                <Icons.plus className="h-4 w-4 mr-1" />
                新建
              </Button>
              <Button
                variant={showFavorites ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavorites(!showFavorites)}
                className="px-3"
              >
                <Icons.star className={cn("h-4 w-4", showFavorites && "fill-current")} />
              </Button>
            </div>
          </div>

          {/* 提示词列表 */}
          <div className="flex-1 overflow-hidden">
            <VirtualizedPromptList
              prompts={prompts}
              selectedPrompt={selectedPrompt}
              expandedPromptId={expandedPromptId}
              onPromptSelect={handlePromptSelect}
              onToggleExpand={handleToggleExpand}
              onCopyWithVariables={handleCopyWithVariables}
              onInjectWithVariables={handleInjectWithVariables}
              onToggleFavorite={handleToggleFavorite}
              onEditPrompt={handleEditPrompt}
              onDeletePrompt={handleDeletePrompt}
            />
          </div>
        </div>
      ) : currentView === VIEW_STATES.EDIT ? (
        <PromptEditView
          isVisible={true}
          prompt={editingPrompt}
          categories={promptCategories}
          onBack={handleBackToList}
          onClose={handleBackToList}
          onSave={handleSavePrompt}
          onUpdate={handleUpdatePrompt}
        />
      ) : currentView === VIEW_STATES.SETTINGS ? (
        <SettingsView
          isVisible={true}
          settings={settings}
          onBack={handleBackToList}
          onClose={handleBackToList}
          onUpdateSettings={updateSettings}
          onExportData={exportData}
          onImportData={(file: File) => importData(file.name)}
          onClearData={clearAllData}
        />
      ) : currentView === VIEW_STATES.VARIABLES ? (
        <VariableFormView
          isVisible={true}
          promptTitle={currentPromptForVariables?.title || ''}
          promptContent={currentPromptForVariables?.content || ''}
          onBack={handleBackToList}
          onClose={handleBackToList}
          onCopy={(finalText, variableValues) => {
            navigator.clipboard.writeText(finalText);
            handleBackToList();
          }}
          onInject={(finalText, variableValues) => {
            // 处理注入逻辑
            console.log('Inject:', finalText, variableValues);
            handleBackToList();
          }}
          variableHistory={variableHistory}
        />
      ) : null}
    </div>
  );
};

// 渲染到DOM
const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<React.StrictMode><SidePanel /></React.StrictMode>);
} else {
  console.error('未找到root容器');
}

export default SidePanel;

// 修复 sidepanel.tsx 中的视图渲染逻辑

// 1. 修复主内容区域的渲染逻辑
{(() => {
  console.log('🔍 Rendering main content - currentView:', currentView);
  console.log('🔍 editingPrompt:', editingPrompt);
  console.log('🔍 currentPromptForVariables:', currentPromptForVariables);
  
  // 根据当前视图渲染对应组件
  switch (currentView) {
    case 'settings':
      return (
        <SettingsView
          settings={settings}
          onBack={handleCloseSettings}
          onClose={handleCloseSettings}
          onUpdateSettings={updateSettings}
          onExportData={exportData}
          onImportData={handleImportFile}
          onClearData={clearAllData}
        />
      );

    case 'edit':
      return (
        <React.Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>加载编辑器...</p>
            </div>
          </div>
        }>
          <PromptEditView
            prompt={editingPrompt} // 新建时为 null，编辑时为具体的 prompt
            categories={categories}
            onBack={handleCloseEdit}
            onClose={handleCloseEdit}
            onSave={handleSavePrompt}
            onUpdate={handleUpdatePrompt}
            showBackButton={true}
            showCloseButton={true}
          />
        </React.Suspense>
      );

    case 'variables':
      if (!currentPromptForVariables) {
        console.error('Variables view without prompt');
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-8 text-destructive">
              <p>变量视图错误：缺少提示词数据</p>
              <Button onClick={handleBackToList} className="mt-2">返回列表</Button>
            </div>
          </div>
        );
      }
      return (
        <VariableFormView
          promptTitle={currentPromptForVariables.title}
          promptContent={currentPromptForVariables.content}
          onBack={handleBackToList}
          onClose={handleCloseVariables}
          onCopy={handleVariableCopy}
          onInject={handleVariableInject}
          variableHistory={variableHistory}
        />
      );

    case 'list':
    default:
      // 提示词列表视图
      if (isLoading) {
        return (
          <div className="flex-1 min-h-0 relative">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p>加载中...</p>
              </div>
            </div>
          </div>
        );
      }

      if (error) {
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-8 text-destructive">
              <Icons.star className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{error}</p>
            </div>
          </div>
        );
      }

      if (prompts.length === 0) {
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-10 text-muted-foreground">
              <Icons.search className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="mb-1">没有匹配的提示词</p>
              <p className="text-xs opacity-80">
                尝试调整搜索关键词、切换分类或清除标签/收藏筛选
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

// 2. 修复新建提示词的处理函数
const handleCreatePrompt = React.useCallback(() => {
  console.log('🚀 handleCreatePrompt called');
  console.log('Current currentView:', currentView);
  console.log('Setting editingPrompt to null and currentView to edit');
  
  // 确保状态正确重置
  setEditingPrompt(null);
  setSelectedPrompt(null);
  setCurrentView('edit');
  
  // 调试：验证状态是否更新
  setTimeout(() => {
    console.log('✅ After state update - currentView should be edit:', currentView);
  }, 100);
}, [currentView]);

// 3. 修复编辑提示词的处理函数
const handleEditPrompt = React.useCallback((prompt: Prompt) => {
  console.log('✏️ handleEditPrompt called with prompt:', prompt);
  
  if (!isValidPrompt(prompt)) {
    console.error('❌ Invalid prompt for editing:', prompt);
    showToast('提示词数据无效', 'error');
    return;
  }
  
  setEditingPrompt(prompt);
  setSelectedPrompt(null);
  setCurrentView('edit');
}, [isValidPrompt, showToast]);

// 4. 修复保存处理函数
const handleSavePrompt = React.useCallback(async (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    console.log('💾 Saving prompt:', promptData);
    
    // 验证数据
    if (!promptData.title?.trim()) {
      showToast('提示词标题不能为空', 'error');
      return;
    }
    if (!promptData.content?.trim()) {
      showToast('提示词内容不能为空', 'error');
      return;
    }
    
    await addPrompt(promptData);
    showToast('提示词创建成功', 'success');
    
    // 保存成功后返回列表视图
    setCurrentView('list');
    setEditingPrompt(null);
  } catch (error) {
    console.error('❌ 创建提示词失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    showToast(`创建提示词失败: ${errorMessage}`, 'error');
    throw error;
  }
}, [addPrompt, showToast]);

// 5. 修复更新处理函数
const handleUpdatePrompt = React.useCallback(async (id: string, updates: Partial<Prompt>) => {
  try {
    console.log('🔄 Updating prompt:', id, updates);
    
    await updatePrompt(id, updates);
    showToast('提示词更新成功', 'success');
    
    // 更新成功后返回列表视图
    setCurrentView('list');
    setEditingPrompt(null);
  } catch (error) {
    console.error('❌ 更新提示词失败:', error);
    showToast('更新提示词失败', 'error');
    throw error;
  }
}, [updatePrompt, showToast]);

// 6. 修复关闭编辑的处理函数
const handleCloseEdit = React.useCallback(() => {
  console.log('❌ Closing edit view');
  setCurrentView('list');
  setEditingPrompt(null);
  setSelectedPrompt(null);
}, []);
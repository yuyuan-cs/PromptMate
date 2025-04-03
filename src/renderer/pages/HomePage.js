import React, { useState } from 'react';
import PromptEditor from '../components/PromptEditor';
import { v4 as uuidv4 } from 'uuid';
import './HomePage.css';

function HomePage({ prompts, savePrompts }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  
  // 获取所有分类
  const categories = ['全部', ...new Set(prompts.map(prompt => prompt.category))];
  
  // 过滤提示语
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prompt.tags && prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = selectedCategory === '全部' || prompt.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // 创建新提示语
  const handleCreatePrompt = () => {
    setEditingPrompt(null);
    setShowEditor(true);
  };

  // 编辑提示语
  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt);
    setShowEditor(true);
  };

  // 保存提示语
  const handleSavePrompt = (newPrompt) => {
    // 如果是编辑现有提示语
    if (newPrompt.id) {
      const updatedPrompts = prompts.map(p => 
        p.id === newPrompt.id ? newPrompt : p
      );
      savePrompts(updatedPrompts);
    } 
    // 如果是创建新提示语
    else {
      const promptWithId = {
        ...newPrompt,
        id: uuidv4()
      };
      savePrompts([...prompts, promptWithId]);
    }
    
    // 关闭编辑器
    setShowEditor(false);
    setEditingPrompt(null);
  };

  // 取消编辑/创建
  const handleCancelEdit = () => {
    setShowEditor(false);
    setEditingPrompt(null);
  };

  // 复制提示语内容到剪贴板
  const handleCopyContent = (content) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        alert('已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
      });
  };

  // 切换收藏状态
  const toggleFavorite = (promptId) => {
    const updatedPrompts = prompts.map(prompt => 
      prompt.id === promptId 
        ? { ...prompt, isFavorite: !prompt.isFavorite } 
        : prompt
    );
    
    savePrompts(updatedPrompts);
  };

  return (
    <div className="home-page">
      {!showEditor ? (
        // 提示语列表视图
        <>
          <div className="page-header">
            <h2>我的提示语</h2>
            <button className="primary-button" onClick={handleCreatePrompt}>
              新建提示语
            </button>
          </div>
          
          <div className="search-filter-container">
            <div className="search-container">
              <input
                type="text"
                placeholder="搜索提示语..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="category-filter">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <div className="prompts-grid">
            {filteredPrompts.length > 0 ? (
              filteredPrompts.map(prompt => (
                <div key={prompt.id} className="prompt-card">
                  <h3 className="prompt-title">{prompt.title}</h3>
                  <div className="prompt-category">{prompt.category}</div>
                  <p className="prompt-content">
                    {prompt.content}
                  </p>
                  <div className="prompt-tags">
                    {prompt.tags && prompt.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="prompt-actions">
                    <button 
                      className="action-button"
                      onClick={() => handleEditPrompt(prompt)}
                    >
                      编辑
                    </button>
                    <button 
                      className="action-button"
                      onClick={() => handleCopyContent(prompt.content)}
                    >
                      复制
                    </button>
                    <button 
                      className="action-button favorite"
                      onClick={() => toggleFavorite(prompt.id)}
                    >
                      {prompt.isFavorite ? '★' : '☆'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>没有找到匹配的提示语</p>
              </div>
            )}
          </div>
        </>
      ) : (
        // 提示语编辑视图
        <PromptEditor 
          prompt={editingPrompt} 
          onSave={handleSavePrompt} 
          onCancel={handleCancelEdit} 
        />
      )}
    </div>
  );
}

export default HomePage; 
import React, { useState } from 'react';
import './FavoritesPage.css';

function FavoritesPage({ prompts, savePrompts }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // 获取收藏的提示语
  const favoritePrompts = prompts.filter(prompt => prompt.isFavorite);
  
  // 过滤提示语
  const filteredPrompts = favoritePrompts.filter(prompt => {
    return (
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prompt.tags && prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  });

  // 取消收藏
  const handleRemoveFavorite = (promptId) => {
    const updatedPrompts = prompts.map(prompt => 
      prompt.id === promptId 
        ? { ...prompt, isFavorite: false } 
        : prompt
    );
    
    savePrompts(updatedPrompts);
  };

  // 复制提示语内容到剪贴板
  const handleCopyContent = (content) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        // 可以添加一个成功复制的提示
        alert('已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
      });
  };

  return (
    <div className="favorites-page">
      <div className="page-header">
        <h2>我的收藏</h2>
      </div>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="搜索收藏..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="favorites-list">
        {filteredPrompts.length > 0 ? (
          filteredPrompts.map(prompt => (
            <div key={prompt.id} className="favorite-item">
              <div className="favorite-header">
                <h3 className="favorite-title">{prompt.title}</h3>
                <div className="favorite-category">{prompt.category}</div>
              </div>
              
              <div className="favorite-content">
                {prompt.content.length > 200 
                  ? `${prompt.content.slice(0, 200)}...` 
                  : prompt.content
                }
              </div>
              
              {prompt.tags && prompt.tags.length > 0 && (
                <div className="favorite-tags">
                  {prompt.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              
              <div className="favorite-actions">
                <button 
                  className="action-button"
                  onClick={() => handleCopyContent(prompt.content)}
                >
                  复制内容
                </button>
                <button 
                  className="action-button"
                  onClick={() => handleRemoveFavorite(prompt.id)}
                >
                  取消收藏
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-favorites">
            <p>暂无收藏的提示语</p>
            <p className="sub-message">前往主页添加提示语到收藏夹</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage; 
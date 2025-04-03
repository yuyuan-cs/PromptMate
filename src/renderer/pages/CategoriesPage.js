import React, { useState, useEffect } from 'react';
import './CategoriesPage.css';

function CategoriesPage({ prompts, savePrompts }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});

  // 初始化分类数据
  useEffect(() => {
    // 获取所有分类
    const uniqueCategories = [...new Set(prompts.map(prompt => prompt.category))].sort();
    setCategories(uniqueCategories);
    
    // 计算每个分类下的提示语数量
    const counts = {};
    uniqueCategories.forEach(category => {
      counts[category] = prompts.filter(prompt => prompt.category === category).length;
    });
    setCategoryCounts(counts);
    
    // 默认选择第一个分类
    if (uniqueCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(uniqueCategories[0]);
    }
  }, [prompts, selectedCategory]);

  // 获取当前选中分类的提示语
  const categoryPrompts = selectedCategory
    ? prompts.filter(prompt => prompt.category === selectedCategory)
    : [];

  // 切换收藏状态
  const toggleFavorite = (promptId) => {
    const updatedPrompts = prompts.map(prompt => 
      prompt.id === promptId 
        ? { ...prompt, isFavorite: !prompt.isFavorite } 
        : prompt
    );
    
    savePrompts(updatedPrompts);
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

  return (
    <div className="categories-page">
      <div className="page-header">
        <h2>分类浏览</h2>
      </div>
      
      <div className="categories-container">
        <div className="category-sidebar">
          <div className="category-list">
            {categories.map(category => (
              <div 
                key={category} 
                className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                <span className="category-name">{category}</span>
                <span className="category-count">{categoryCounts[category]}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="category-content">
          {selectedCategory ? (
            <>
              <div className="category-header">
                <h3>{selectedCategory}</h3>
                <div className="category-prompt-count">
                  共 {categoryPrompts.length} 个提示语
                </div>
              </div>
              
              <div className="category-prompts">
                {categoryPrompts.length > 0 ? (
                  categoryPrompts.map(prompt => (
                    <div key={prompt.id} className="category-prompt-item">
                      <div className="prompt-header">
                        <h4 className="prompt-title">{prompt.title}</h4>
                        <button 
                          className="favorite-button"
                          onClick={() => toggleFavorite(prompt.id)}
                        >
                          {prompt.isFavorite ? '★' : '☆'}
                        </button>
                      </div>
                      
                      <div className="prompt-content">
                        {prompt.content.length > 150 
                          ? `${prompt.content.slice(0, 150)}...` 
                          : prompt.content
                        }
                      </div>
                      
                      {prompt.tags && prompt.tags.length > 0 && (
                        <div className="prompt-tags">
                          {prompt.tags.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                      
                      <div className="prompt-actions">
                        <button 
                          className="action-button"
                          onClick={() => handleCopyContent(prompt.content)}
                        >
                          复制
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-prompts">
                    <p>此分类下暂无提示语</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-category-selected">
              <p>请选择一个分类查看相关提示语</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoriesPage; 
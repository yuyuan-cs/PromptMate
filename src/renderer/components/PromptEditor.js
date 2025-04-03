import React, { useState, useEffect } from 'react';
import './PromptEditor.css';

// 预设分类列表，来自数据字典文档
const PRESET_CATEGORIES = ['开发', '写作', '营销', '工作', '学习', '其他'];

function PromptEditor({ prompt = {}, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    id: prompt.id || '',
    title: prompt.title || '',
    content: prompt.content || '',
    category: prompt.category || '开发',
    tags: prompt.tags?.join(', ') || '',
    isFavorite: prompt.isFavorite || false
  });

  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [isNewCategory, setIsNewCategory] = useState(false);
  const isEditing = !!prompt.id;

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '标题不能为空';
    } else if (formData.title.length > 50) {
      newErrors.title = '标题最多50个字符';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = '内容不能为空';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = '分类不能为空';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const currentTags = formData.tags ? formData.tags.split(', ').filter(tag => tag) : [];
      if (!currentTags.includes(tagInput.trim())) {
        const newTags = [...currentTags, tagInput.trim()].join(', ');
        setFormData({
          ...formData,
          tags: newTags
        });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    const currentTags = formData.tags.split(', ').filter(tag => tag);
    const newTags = currentTags.filter(tag => tag !== tagToRemove).join(', ');
    setFormData({
      ...formData,
      tags: newTags
    });
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === '新建分类') {
      setIsNewCategory(true);
      setFormData({
        ...formData,
        category: ''
      });
    } else {
      setFormData({
        ...formData,
        category: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // 处理提交数据
      const tagsArray = formData.tags
        ? formData.tags.split(', ').filter(tag => tag.trim() !== '')
        : [];
      
      const now = new Date().toISOString();
      
      const submitData = {
        ...formData,
        tags: tagsArray,
        updatedAt: now,
        createdAt: prompt.createdAt || now,
        useCount: prompt.useCount || 0
      };
      
      onSave(submitData);
    }
  };

  return (
    <div className="prompt-editor">
      <div className="editor-header">
        <h2>{isEditing ? '编辑提示语' : '新建提示语'}</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">标题</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={errors.title ? 'error' : ''}
            placeholder="提示语标题（最多50个字符）"
            maxLength={50}
          />
          {errors.title && <div className="error-message">{errors.title}</div>}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">分类</label>
            {!isNewCategory ? (
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                className={errors.category ? 'error' : ''}
              >
                {PRESET_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
                <option value="新建分类">+ 新建分类</option>
              </select>
            ) : (
              <div className="new-category-input">
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={errors.category ? 'error' : ''}
                  placeholder="请输入分类名称"
                />
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setIsNewCategory(false);
                    setFormData({
                      ...formData,
                      category: '开发'
                    });
                  }}
                >
                  取消
                </button>
              </div>
            )}
            {errors.category && <div className="error-message">{errors.category}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="isFavorite">
              <input
                type="checkbox"
                id="isFavorite"
                name="isFavorite"
                checked={formData.isFavorite}
                onChange={handleInputChange}
              />
              <span className="checkbox-label">添加到收藏</span>
            </label>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="tags">标签</label>
          <div className="tags-input">
            <input
              type="text"
              id="tagInput"
              value={tagInput}
              onChange={handleTagInputChange}
              placeholder="添加标签（按回车或点击添加按钮）"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
            <button type="button" onClick={handleAddTag} className="add-tag-button">
              添加
            </button>
          </div>
          
          <div className="tags-container">
            {formData.tags && formData.tags.split(', ').filter(tag => tag).map(tag => (
              <span key={tag} className="tag">
                {tag}
                <button 
                  type="button" 
                  className="remove-tag" 
                  onClick={() => removeTag(tag)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="content">内容</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            className={errors.content ? 'error' : ''}
            placeholder="在此输入提示语内容，支持Markdown格式"
            rows={10}
          ></textarea>
          {errors.content && <div className="error-message">{errors.content}</div>}
        </div>
        
        <div className="preview-section">
          <h3>预览</h3>
          <div className="content-preview">
            {formData.content || <span className="placeholder">暂无内容预览</span>}
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            取消
          </button>
          <button type="submit" className="save-button">
            保存
          </button>
        </div>
      </form>
    </div>
  );
}

export default PromptEditor; 
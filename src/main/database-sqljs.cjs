const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class DatabaseServiceSqlJs {
  constructor() {
    this.db = null;
    this.SQL = null;
    this.isInitialized = false;
    this.dbPath = null;
  }

  async initialize() {
    try {
      console.log('正在初始化 sql.js SQLite 数据库...');
      
      // 初始化 sql.js
      this.SQL = await initSqlJs({
        // 可以指定 wasm 文件路径，如果需要的话
        // locateFile: file => `path/to/${file}`
      });
      
      // 获取数据库路径
      const userDataPath = app.getPath('userData');
      this.dbPath = path.join(userDataPath, 'promptmate.db');
      
      console.log('sql.js SQLite 数据库路径:', this.dbPath);
      
      // 检查数据库文件是否存在
      let data = null;
      if (fs.existsSync(this.dbPath)) {
        // 读取现有数据库文件
        data = fs.readFileSync(this.dbPath);
      }
      
      // 创建数据库连接（如果文件不存在，会创建内存数据库）
      this.db = new this.SQL.Database(data);
      
      // 读取并执行 schema
      const schemaPath = path.join(__dirname, '../../src/lib/database/schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        this.db.exec(schema);
        console.log('数据库 schema 执行成功');
      } else {
        console.warn('Schema 文件不存在:', schemaPath);
      }
      
      this.isInitialized = true;
      console.log('sql.js SQLite 数据库初始化成功');
      
      return { success: true };
    } catch (error) {
      console.error('sql.js SQLite 数据库初始化失败:', error);
      this.isInitialized = false;
      return { success: false, error: error.message };
    }
  }

  // 保存数据库到文件
  saveToFile() {
    if (!this.db || !this.dbPath) return;
    
    try {
      const data = this.db.export();
      fs.writeFileSync(this.dbPath, data);
    } catch (error) {
      console.error('保存数据库文件失败:', error);
    }
  }

  // 执行查询并返回结果
  executeQuery(sql, params = []) {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.getAsObject(params);
      stmt.free();
      return result;
    } catch (error) {
      console.error('查询执行失败:', sql, params, error);
      throw error;
    }
  }

  // 执行查询并返回所有结果
  executeQueryAll(sql, params = []) {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    try {
      const stmt = this.db.prepare(sql);
      const results = [];
      
      stmt.bind(params);
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      
      return results;
    } catch (error) {
      console.error('查询执行失败:', sql, params, error);
      throw error;
    }
  }

  // 执行更新/插入/删除操作
  executeUpdate(sql, params = []) {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    try {
      const stmt = this.db.prepare(sql);
      stmt.run(params);
      const changes = this.db.getRowsModified();
      stmt.free();
      
      // 自动保存到文件
      this.saveToFile();
      
      return { changes };
    } catch (error) {
      console.error('更新执行失败:', sql, params, error);
      throw error;
    }
  }

  // 获取状态
  getStatus() {
    return {
      initialized: this.isInitialized,
      dbPath: this.dbPath
    };
  }

  // 提示词相关操作
  getAllPrompts() {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    const sql = `
      SELECT p.*, 
             GROUP_CONCAT(t.name) as tags,
             json_group_array(
               json_object(
                 'id', pi.id,
                 'data', pi.data,
                 'caption', pi.caption
               )
             ) as images
      FROM prompts p
      LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      LEFT JOIN prompt_images pi ON p.id = pi.prompt_id
      GROUP BY p.id
      ORDER BY p.updated_at DESC
    `;
    
    const results = this.executeQueryAll(sql);
    
    return results.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : [],
      images: row.images ? JSON.parse(row.images).filter(img => img.id) : [],
      isFavorite: Boolean(row.is_favorite)
    }));
  }

  getAllCategories() {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    const sql = 'SELECT * FROM categories ORDER BY name ASC';
    return this.executeQueryAll(sql);
  }

  createPrompt(prompt) {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    const now = new Date().toISOString();
    
    // 插入提示词 (只使用schema中存在的字段)
    const insertPromptSql = `
      INSERT INTO prompts (id, title, content, category_id, is_favorite, version, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    this.executeUpdate(insertPromptSql, [
      prompt.id,
      prompt.title,
      prompt.content,
      prompt.category,
      prompt.isFavorite ? 1 : 0,
      prompt.version || 1,
      now,
      now
    ]);
    
    // 处理标签
    if (prompt.tags && prompt.tags.length > 0) {
      for (const tagName of prompt.tags) {
        // 确保标签存在
        const insertTagSql = 'INSERT OR IGNORE INTO tags (name, created_at) VALUES (?, ?)';
        this.executeUpdate(insertTagSql, [tagName, now]);
        
        // 获取标签ID
        const getTagIdSql = 'SELECT id FROM tags WHERE name = ?';
        const tagResult = this.executeQueryAll(getTagIdSql, [tagName]);
        
        if (tagResult.length > 0) {
          // 关联标签和提示词
          const linkTagSql = 'INSERT OR IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES (?, ?)';
          this.executeUpdate(linkTagSql, [prompt.id, tagResult[0].id]);
        }
      }
    }
    
    // 处理图片
    if (prompt.images && prompt.images.length > 0) {
      for (const image of prompt.images) {
        const insertImageSql = `
          INSERT INTO prompt_images (id, prompt_id, data, caption, created_at)
          VALUES (?, ?, ?, ?, ?)
        `;
        this.executeUpdate(insertImageSql, [
          image.id,
          prompt.id,
          image.data,
          image.caption || null,
          now
        ]);
      }
    }
    
    return prompt;
  }

  createCategory(category) {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    const now = new Date().toISOString();
    const sql = `
      INSERT INTO categories (id, name, icon, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    this.executeUpdate(sql, [
      category.id,
      category.name,
      category.icon || null,
      now,
      now
    ]);
    
    return category;
  }

  updateCategoryLanguage(language) {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    // 这里需要导入多语言数据，但由于是CJS文件，我们使用动态导入
    // 暂时使用硬编码的默认分类
    const defaultCategories = {
      'zh-CN': [
        { id: 'general', name: '通用' },
        { id: 'creative', name: '创意生成' },
        { id: 'development', name: '开发编程' },
        { id: 'business', name: '商务沟通' },
        { id: 'education', name: '教育学习' },
        { id: 'productivity', name: '生产力' }
      ],
      'en-US': [
        { id: 'general', name: 'General' },
        { id: 'creative', name: 'Creative' },
        { id: 'development', name: 'Development' },
        { id: 'business', name: 'Business' },
        { id: 'education', name: 'Education' },
        { id: 'productivity', name: 'Productivity' }
      ]
    };
    
    const categories = defaultCategories[language] || defaultCategories['zh-CN'];
    const now = new Date().toISOString();
    
    // 更新所有默认分类的语言
    for (const category of categories) {
      const sql = `
        UPDATE categories 
        SET name = ?, updated_at = ?
        WHERE id = ?
      `;
      
      this.executeUpdate(sql, [category.name, now, category.id]);
    }
    
    console.log(`已更新分类语言为: ${language}`);
  }

  updatePromptsLanguage(language) {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    // 硬编码的示例提示词数据
    const samplePrompts = {
      'zh-CN': [
        { id: '1', title: '代码解释器', content: '请解释以下代码的功能和实现原理，使用简单易懂的语言：\n\n```\n[在此粘贴代码]\n```', tags: ['代码', '解释', '编程'] },
        { id: '2', title: '故事创意生成器', content: '请构思一个有创意的故事，包含以下元素：[元素1]、[元素2]和[元素3]。故事类型为[类型]，适合[目标受众]阅读。', tags: ['写作', '创意', '故事'] },
        { id: '3', title: '商务邮件撰写', content: '请帮我撰写一封关于[主题]的专业商务邮件，收件人是[收件人]。邮件语气应该[正式/友好/专业]，主要包含以下要点：\n1. [要点1]\n2. [要点2]\n3. [要点3]', tags: ['邮件', '商务', '沟通'] },
        { id: '4', title: '学术论文结构', content: '请为一篇关于[主题]的学术论文创建详细大纲，包括引言、文献综述、方法论、讨论和结论等部分。请针对每个部分提供详细的子标题和内容建议。', tags: ['学术', '论文', '写作'] },
        { id: '5', title: '会议总结生成器', content: '请根据以下会议记录生成一份简洁明了的会议总结：\n\n[会议记录]\n\n总结应包括：主要讨论点、做出的决策和后续行动项。', tags: ['会议', '总结', '效率'] },
        { id: '6', title: '知识提取与总结', content: '请帮我从以下内容中提取关键信息并总结为要点列表：\n\n[文本内容]\n\n要点应按重要性排序，并提供简洁的解释。', tags: ['总结', '学习', '知识'] }
      ],
      'en-US': [
        { id: '1', title: 'Code Interpreter', content: 'Please explain the functionality and implementation principles of the following code using simple and understandable language:\n\n```\n[Paste your code here]\n```', tags: ['code', 'explanation', 'programming'] },
        { id: '2', title: 'Story Idea Generator', content: 'Please create a creative story that includes the following elements: [Element 1], [Element 2], and [Element 3]. The story type should be [Type], suitable for [Target Audience] to read.', tags: ['writing', 'creativity', 'story'] },
        { id: '3', title: 'Business Email Writer', content: 'Please help me write a professional business email about [Topic] to [Recipient]. The email tone should be [Formal/Friendly/Professional] and include the following key points:\n1. [Point 1]\n2. [Point 2]\n3. [Point 3]', tags: ['email', 'business', 'communication'] },
        { id: '4', title: 'Academic Paper Structure', content: 'Please create a detailed outline for an academic paper about [Topic], including introduction, literature review, methodology, discussion, and conclusion sections. Please provide detailed subheadings and content suggestions for each section.', tags: ['academic', 'paper', 'writing'] },
        { id: '5', title: 'Meeting Summary Generator', content: 'Please generate a concise and clear meeting summary based on the following meeting notes:\n\n[Meeting Notes]\n\nThe summary should include: main discussion points, decisions made, and follow-up action items.', tags: ['meeting', 'summary', 'productivity'] },
        { id: '6', title: 'Knowledge Extraction & Summary', content: 'Please help me extract key information from the following content and summarize it into bullet points:\n\n[Text Content]\n\nPoints should be sorted by importance and provide concise explanations.', tags: ['summary', 'learning', 'knowledge'] }
      ]
    };
    
    const prompts = samplePrompts[language] || samplePrompts['zh-CN'];
    const now = new Date().toISOString();
    
    // 更新所有示例提示词的语言
    for (const prompt of prompts) {
      const sql = `
        UPDATE prompts 
        SET title = ?, content = ?, updated_at = ?
        WHERE id = ?
      `;
      
      this.executeUpdate(sql, [prompt.title, prompt.content, now, prompt.id]);
      
      // 更新标签（简化处理，直接更新标签名称）
      for (const tag of prompt.tags) {
        const tagSql = `
          UPDATE tags 
          SET name = ?, created_at = ?
          WHERE name IN (SELECT t.name FROM tags t 
                        JOIN prompt_tags pt ON t.id = pt.tag_id 
                        WHERE pt.prompt_id = ?)
        `;
        
        this.executeUpdate(tagSql, [tag, now, prompt.id]);
      }
    }
    
    console.log(`已更新提示词语言为: ${language}`);
  }

  // 迁移相关方法
  getMigrationStatus() {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    try {
      // 检查是否有数据
      const promptCount = this.executeQueryAll('SELECT COUNT(*) as count FROM prompts')[0].count;
      const categoryCount = this.executeQueryAll('SELECT COUNT(*) as count FROM categories')[0].count;
      
      if (promptCount > 0 || categoryCount > 0) {
        return 'completed';
      } else {
        return 'pending';
      }
    } catch (error) {
      console.error('获取迁移状态失败:', error);
      return 'pending';
    }
  }

  async migrateFromLocalStorage(data) {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    try {
      console.log('开始迁移数据到 sql.js 数据库...');
      
      // 迁移分类
      if (data.categories && data.categories.length > 0) {
        for (const category of data.categories) {
          try {
            this.createCategory(category);
          } catch (error) {
            console.warn('分类迁移失败:', category.id, error.message);
          }
        }
      }
      
      // 迁移提示词
      if (data.prompts && data.prompts.length > 0) {
        for (const prompt of data.prompts) {
          try {
            this.createPrompt(prompt);
          } catch (error) {
            console.warn('提示词迁移失败:', prompt.id, error.message);
          }
        }
      }
      
      console.log('数据迁移完成');
      return true;
    } catch (error) {
      console.error('数据迁移失败:', error);
      throw error;
    }
  }

  // 其他缺少的方法
  getPromptById(id) {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    const sql = `
      SELECT p.*, 
             GROUP_CONCAT(t.name) as tags,
             json_group_array(
               json_object(
                 'id', pi.id,
                 'data', pi.data,
                 'caption', pi.caption
               )
             ) as images
      FROM prompts p
      LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      LEFT JOIN prompt_images pi ON p.id = pi.prompt_id
      WHERE p.id = ?
      GROUP BY p.id
    `;
    
    const results = this.executeQueryAll(sql, [id]);
    if (results.length === 0) return null;
    
    const row = results[0];
    return {
      ...row,
      tags: row.tags ? row.tags.split(',') : [],
      images: row.images ? JSON.parse(row.images).filter(img => img.id) : [],
      isFavorite: Boolean(row.is_favorite)
    };
  }

  updatePrompt(id, updates) {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    const now = new Date().toISOString();
    
    // 构建更新SQL
    const fields = [];
    const values = [];
    
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      fields.push('content = ?');
      values.push(updates.content);
    }
    if (updates.category !== undefined) {
      fields.push('category_id = ?');
      values.push(updates.category);
    }
    if (updates.isFavorite !== undefined) {
      fields.push('is_favorite = ?');
      values.push(updates.isFavorite ? 1 : 0);
    }
    // 注意：rating 和 ratingNotes 字段在当前 schema 中不存在
    // 如果需要这些字段，需要先更新数据库 schema
    // if (updates.rating !== undefined) {
    //   fields.push('rating = ?');
    //   values.push(updates.rating);
    // }
    // if (updates.ratingNotes !== undefined) {
    //   fields.push('ratingNotes = ?');
    //   values.push(updates.ratingNotes);
    // }
    
    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    const sql = `UPDATE prompts SET ${fields.join(', ')} WHERE id = ?`;
    this.executeUpdate(sql, values);
    
    // 处理标签更新
    if (updates.tags !== undefined) {
      // 删除现有标签关联
      this.executeUpdate('DELETE FROM prompt_tags WHERE prompt_id = ?', [id]);
      
      // 添加新标签
      for (const tagName of updates.tags) {
        // 确保标签存在
        this.executeUpdate('INSERT OR IGNORE INTO tags (name, created_at) VALUES (?, ?)', [tagName, now]);
        
        // 获取标签ID并关联
        const tagResult = this.executeQueryAll('SELECT id FROM tags WHERE name = ?', [tagName]);
        if (tagResult.length > 0) {
          this.executeUpdate('INSERT OR IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES (?, ?)', [id, tagResult[0].id]);
        }
      }
    }
    
    return this.getPromptById(id);
  }

  deletePrompt(id) {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    try {
      // 删除相关数据
      this.executeUpdate('DELETE FROM prompt_tags WHERE prompt_id = ?', [id]);
      this.executeUpdate('DELETE FROM prompt_images WHERE prompt_id = ?', [id]);
      
      // 删除提示词
      const result = this.executeUpdate('DELETE FROM prompts WHERE id = ?', [id]);
      
      return result.changes > 0;
    } catch (error) {
      console.error('删除提示词失败:', error);
      return false;
    }
  }

  getAllTags() {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    const sql = 'SELECT DISTINCT name FROM tags ORDER BY name ASC';
    const results = this.executeQueryAll(sql);
    return results.map(row => row.name);
  }

  getTagsByCategory(categoryId) {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    const sql = `
      SELECT DISTINCT t.name 
      FROM tags t
      JOIN prompt_tags pt ON t.id = pt.tag_id
      JOIN prompts p ON pt.prompt_id = p.id
      WHERE p.category = ?
      ORDER BY t.name ASC
    `;
    
    const results = this.executeQueryAll(sql, [categoryId]);
    return results.map(row => row.name);
  }

  getAllSettings() {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    try {
      const sql = 'SELECT key, value, type FROM settings';
      const rows = this.executeQueryAll(sql);
      
      const settings = {};
      rows.forEach(row => {
        try {
          switch (row.type) {
            case 'string':
              settings[row.key] = row.value;
              break;
            case 'number':
              settings[row.key] = parseFloat(row.value);
              break;
            case 'boolean':
              settings[row.key] = row.value === 'true';
              break;
            case 'object':
              settings[row.key] = JSON.parse(row.value);
              break;
            default:
              settings[row.key] = row.value;
          }
        } catch (error) {
          console.warn('解析设置值失败:', row.key, error);
          settings[row.key] = row.value;
        }
      });
      
      return settings;
    } catch (error) {
      console.error('获取设置失败:', error);
      return {};
    }
  }

  setSetting(key, value) {
    if (!this.isInitialized) throw new Error('数据库未初始化');
    
    let type = typeof value;
    let serializedValue = value;
    
    if (type === 'object' && value !== null) {
      serializedValue = JSON.stringify(value);
      type = 'object';
    } else {
      serializedValue = String(value);
    }
    
    const sql = `
      INSERT OR REPLACE INTO settings (key, value, type, updated_at)
      VALUES (?, ?, ?, ?)
    `;
    
    this.executeUpdate(sql, [key, serializedValue, type, new Date().toISOString()]);
  }

  // 关闭数据库
  close() {
    if (this.db) {
      this.saveToFile();
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

module.exports = { DatabaseServiceSqlJs };

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

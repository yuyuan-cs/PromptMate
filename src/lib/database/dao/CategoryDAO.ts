import { Category } from '../../../types';
import { BaseDAO } from './BaseDAO';
import { getDefaultCategories, getSamplePrompts } from '../../data';

export class CategoryDAO extends BaseDAO {
  // 获取所有分类
  getAll(): Category[] {
    const stmt = this.db.prepare(`
      SELECT * FROM categories 
      ORDER BY name ASC
    `);
    return stmt.all() as Category[];
  }

  // 根据ID获取分类
  getById(id: string): Category | null {
    const stmt = this.db.prepare(`
      SELECT * FROM categories WHERE id = ?
    `);
    return stmt.get(id) as Category | null;
  }

  // 创建新分类
  create(category: Category): Category {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO categories (id, name, icon, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      category.id,
      category.name,
      category.icon || null,
      now,
      now
    );
    
    return category;
  }

  // 更新分类
  update(id: string, updates: Partial<Omit<Category, 'id'>>): Category | null {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE categories 
      SET name = COALESCE(?, name),
          icon = COALESCE(?, icon),
          updated_at = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(
      updates.name || null,
      updates.icon || null,
      now,
      id
    );
    
    if (result.changes === 0) {
      return null;
    }
    
    return this.getById(id);
  }

  // 删除分类
  delete(id: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM categories WHERE id = ?
    `);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // 检查分类是否被使用
  isInUse(id: string): boolean {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM prompts WHERE category = ?
    `);
    const result = stmt.get(id) as { count: number };
    return result.count > 0;
  }

  // 更新分类语言
  updateLanguage(language: string): void {
    const defaultCategories = getDefaultCategories(language);
    const defaultCategoryMap = new Map(defaultCategories.map(cat => [cat.id, cat]));
    
    const updateStmt = this.db.prepare(`
      UPDATE categories 
      SET name = ?, updated_at = ?
      WHERE id = ?
    `);
    
    const now = new Date().toISOString();
    
    // 使用事务更新所有默认分类的语言
    const transaction = this.db.transaction(() => {
      defaultCategoryMap.forEach((defaultCategory, id) => {
        updateStmt.run(defaultCategory.name, now, id);
      });
    });
    
    transaction();
    
    console.log(`已更新分类语言为: ${language}`);
  }

  // 更新提示词语言
  updatePromptsLanguage(language: string): void {
    const samplePrompts = getSamplePrompts(language);
    const samplePromptMap = new Map(samplePrompts.map(prompt => [prompt.id, prompt]));
    
    const updatePromptStmt = this.db.prepare(`
      UPDATE prompts 
      SET title = ?, content = ?, updated_at = ?
      WHERE id = ?
    `);
    
    const updateTagStmt = this.db.prepare(`
      UPDATE tags 
      SET name = ?, created_at = ?
      WHERE name = ?
    `);
    
    const now = new Date().toISOString();
    
    // 使用事务更新所有示例提示词的语言
    const transaction = this.db.transaction(() => {
      samplePromptMap.forEach((samplePrompt, id) => {
        // 更新提示词标题和内容
        updatePromptStmt.run(samplePrompt.title, samplePrompt.content, now, id);
        
        // 更新标签（这里需要更复杂的逻辑来处理标签更新）
        // 暂时跳过标签更新，因为标签更新需要重新建立关联关系
      });
    });
    
    transaction();
    
    console.log(`已更新提示词语言为: ${language}`);
  }
}
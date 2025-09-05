import { Category } from '../../../types';
import { BaseDAO } from './BaseDAO';

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
}
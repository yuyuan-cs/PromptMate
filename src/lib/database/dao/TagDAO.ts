import { BaseDAO } from './BaseDAO';

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export class TagDAO extends BaseDAO {
  // 获取所有标签
  getAll(): string[] {
    try {
      const stmt = this.db.prepare('SELECT name FROM tags ORDER BY name');
      const rows = stmt.all() as { name: string }[];
      return rows.map(row => row.name);
    } catch (error) {
      this.handleError('获取所有标签', error);
    }
  }

  // 获取分类下的标签
  getByCategory(categoryId: string): string[] {
    try {
      const stmt = this.db.prepare(`
        SELECT DISTINCT t.name
        FROM tags t
        JOIN prompt_tags pt ON t.id = pt.tag_id
        JOIN prompts p ON pt.prompt_id = p.id
        WHERE p.category_id = ?
        ORDER BY t.name
      `);
      const rows = stmt.all(categoryId) as { name: string }[];
      return rows.map(row => row.name);
    } catch (error) {
      this.handleError('获取分类标签', error);
    }
  }

  // 创建标签
  create(name: string): Tag {
    try {
      return this.executeInTransaction(() => {
        const stmt = this.db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
        stmt.run(name);
        
        const getStmt = this.db.prepare('SELECT * FROM tags WHERE name = ?');
        return getStmt.get(name) as Tag;
      });
    } catch (error) {
      this.handleError('创建标签', error);
    }
  }

  // 删除标签
  delete(name: string, categoryId?: string): boolean {
    try {
      return this.executeInTransaction(() => {
        if (categoryId) {
          // 只删除特定分类下的标签关联
          const stmt = this.db.prepare(`
            DELETE FROM prompt_tags 
            WHERE tag_id = (SELECT id FROM tags WHERE name = ?)
            AND prompt_id IN (SELECT id FROM prompts WHERE category_id = ?)
          `);
          const result = stmt.run(name, categoryId);
          return result.changes > 0;
        } else {
          // 删除所有相关的标签关联和标签本身
          const deleteRelationsStmt = this.db.prepare(`
            DELETE FROM prompt_tags 
            WHERE tag_id = (SELECT id FROM tags WHERE name = ?)
          `);
          deleteRelationsStmt.run(name);
          
          const deleteTagStmt = this.db.prepare('DELETE FROM tags WHERE name = ?');
          const result = deleteTagStmt.run(name);
          return result.changes > 0;
        }
      });
    } catch (error) {
      this.handleError('删除标签', error);
    }
  }

  // 获取标签使用统计
  getUsageStats(): Array<{ name: string; count: number }> {
    try {
      const stmt = this.db.prepare(`
        SELECT t.name, COUNT(pt.prompt_id) as count
        FROM tags t
        LEFT JOIN prompt_tags pt ON t.id = pt.tag_id
        GROUP BY t.id, t.name
        ORDER BY count DESC, t.name
      `);
      return stmt.all() as Array<{ name: string; count: number }>;
    } catch (error) {
      this.handleError('获取标签使用统计', error);
    }
  }
}
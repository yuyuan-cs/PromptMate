import { Prompt, PromptImage } from '../../../types';
import { BaseDAO } from './BaseDAO';

export class PromptDAO extends BaseDAO {
  // 获取所有提示词
  getAll(): Prompt[] {
    const stmt = this.db.prepare(`
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
    `);
    
    const rows = stmt.all() as any[];
    return rows.map(this.mapRowToPrompt);
  }

  // 根据ID获取提示词
  getById(id: string): Prompt | null {
    const stmt = this.db.prepare(`
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
    `);
    
    const row = stmt.get(id) as any;
    return row ? this.mapRowToPrompt(row) : null;
  }

  // 创建提示词
  create(prompt: Omit<Prompt, 'createdAt' | 'updatedAt'>): Prompt {
    const transaction = this.db.transaction(() => {
      // 插入提示词
      const insertPrompt = this.db.prepare(`
        INSERT INTO prompts (id, title, content, category_id, is_favorite, version)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      insertPrompt.run(
        prompt.id,
        prompt.title,
        prompt.content,
        prompt.category,
        prompt.isFavorite ? 1 : 0,
        prompt.version || 1
      );

      // 处理标签
      if (prompt.tags?.length > 0) {
        this.insertTags(prompt.id, prompt.tags);
      }

      // 处理图片
      if (prompt.images?.length > 0) {
        this.insertImages(prompt.id, prompt.images);
      }
    });

    transaction();
    return this.getById(prompt.id)!;
  }

  // 更新提示词
  update(id: string, updates: Partial<Prompt>): Prompt {
    const transaction = this.db.transaction(() => {
      // 更新基本信息
      if (updates.title || updates.content || updates.category !== undefined || updates.isFavorite !== undefined) {
        const updatePrompt = this.db.prepare(`
          UPDATE prompts 
          SET title = COALESCE(?, title),
              content = COALESCE(?, content),
              category_id = COALESCE(?, category_id),
              is_favorite = COALESCE(?, is_favorite)
          WHERE id = ?
        `);
        
        updatePrompt.run(
          updates.title,
          updates.content,
          updates.category,
          updates.isFavorite !== undefined ? (updates.isFavorite ? 1 : 0) : undefined,
          id
        );
      }

      // 更新标签
      if (updates.tags !== undefined) {
        this.deleteTags(id);
        if (updates.tags.length > 0) {
          this.insertTags(id, updates.tags);
        }
      }

      // 更新图片
      if (updates.images !== undefined) {
        this.deleteImages(id);
        if (updates.images.length > 0) {
          this.insertImages(id, updates.images);
        }
      }
    });

    transaction();
    return this.getById(id)!;
  }

  // 删除提示词
  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM prompts WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // 辅助方法
  private mapRowToPrompt(row: any): Prompt {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category_id,
      tags: row.tags ? row.tags.split(',').filter(Boolean) : [],
      isFavorite: Boolean(row.is_favorite),
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      images: row.images && row.images !== '[null]' ? JSON.parse(row.images).filter((img: any) => img.id) : []
    };
  }

  private insertTags(promptId: string, tags: string[]): void {
    for (const tagName of tags) {
      // 插入或获取标签ID
      const insertTag = this.db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
      insertTag.run(tagName);
      
      const getTagId = this.db.prepare('SELECT id FROM tags WHERE name = ?');
      const tagId = (getTagId.get(tagName) as any).id;
      
      // 关联提示词和标签
      const linkTag = this.db.prepare('INSERT OR IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES (?, ?)');
      linkTag.run(promptId, tagId);
    }
  }

  private deleteTags(promptId: string): void {
    const stmt = this.db.prepare('DELETE FROM prompt_tags WHERE prompt_id = ?');
    stmt.run(promptId);
  }

  private insertImages(promptId: string, images: PromptImage[]): void {
    const stmt = this.db.prepare(`
      INSERT INTO prompt_images (id, prompt_id, data, caption, order_index)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    images.forEach((image, index) => {
      stmt.run(image.id, promptId, image.data, image.caption || '', index);
    });
  }

  private deleteImages(promptId: string): void {
    const stmt = this.db.prepare('DELETE FROM prompt_images WHERE prompt_id = ?');
    stmt.run(promptId);
  }
}
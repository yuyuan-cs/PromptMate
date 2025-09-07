import Database from 'better-sqlite3';
import { app } from 'electron';
import { join } from 'path';
import { promises as fs } from 'fs';
import { getDefaultCategories, getSamplePrompts } from '../data';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database.Database | null = null;
  private dbPath: string;

  private constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = join(userDataPath, 'promptmate.db');
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async init(): Promise<void> {
    try {
      // 创建数据库连接
      this.db = new Database(this.dbPath);
      
      // 启用WAL模式以提高性能
      this.db.pragma('journal_mode = WAL');
      
      // 执行Schema
      await this.createTables();
      
      // 插入种子数据
      await this.seedDefaultData();
      
      console.log('数据库初始化成功:', this.dbPath);
    } catch (error) {
      console.error('数据库初始化失败:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');
    
    try {
      // 读取schema.sql文件
      const schemaPath = join(__dirname, 'schema.sql');
      const schema = await fs.readFile(schemaPath, 'utf-8');
      
      // 执行schema SQL
      this.db.exec(schema);
      console.log('数据库表创建成功');
    } catch (error) {
      console.error('创建数据库表失败:', error);
      throw error;
    }
  }

  public getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('数据库未初始化');
    }
    return this.db;
  }

  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  public backup(backupPath: string): void {
    if (!this.db) throw new Error('数据库未初始化');
    
    this.db.backup(backupPath);
  }

  // 清除所有数据
  public clearAllData(): void {
    if (!this.db) throw new Error('数据库未初始化');
    
    try {
      const transaction = this.db.transaction(() => {
        // 删除所有表的数据，保持表结构
        this.db.exec('DELETE FROM prompt_tags');
        this.db.exec('DELETE FROM prompt_images');
        this.db.exec('DELETE FROM prompts');
        this.db.exec('DELETE FROM categories');
        this.db.exec('DELETE FROM tags');
        this.db.exec('DELETE FROM settings');
      });
      
      transaction();
      console.log('数据库数据清除成功');
    } catch (error) {
      console.error('清除数据库数据失败:', error);
      throw error;
    }
  }

  // 重置为默认数据
  public resetToDefaults(language: string = 'zh-CN'): void {
    if (!this.db) throw new Error('数据库未初始化');
    
    try {
      // 先清除所有数据
      this.clearAllData();
      
      // 重新插入种子数据
      this.seedDefaultData();
      
      console.log('数据库重置为默认数据成功');
    } catch (error) {
      console.error('重置数据库为默认数据失败:', error);
      throw error;
    }
  }

  // 插入种子数据
  private async seedDefaultData(): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');
    
    try {
      // 检查是否已有分类数据
      const categoryStmt = this.db.prepare('SELECT COUNT(*) as count FROM categories');
      const categoryResult = categoryStmt.get() as { count: number };
      
      // 检查是否已有提示词数据
      const promptStmt = this.db.prepare('SELECT COUNT(*) as count FROM prompts');
      const promptResult = promptStmt.get() as { count: number };
      
      if (categoryResult.count === 0) {
        console.log('插入默认分类数据...');
        
        // 获取默认分类（使用中文作为默认语言）
        const defaultCategories = getDefaultCategories('zh-CN');
        
        const insertCategoryStmt = this.db.prepare(`
          INSERT INTO categories (id, name, icon, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
        `);
        
        const now = new Date().toISOString();
        
        // 使用事务插入所有默认分类
        const categoryTransaction = this.db.transaction(() => {
          defaultCategories.forEach(category => {
            insertCategoryStmt.run(
              category.id,
              category.name,
              category.icon || null,
              now,
              now
            );
          });
        });
        
        categoryTransaction();
        
        console.log(`已插入 ${defaultCategories.length} 个默认分类`);
      } else {
        console.log('分类数据已存在，跳过分类种子数据插入');
      }
      
      if (promptResult.count === 0) {
        console.log('插入示例提示词数据...');
        
        // 获取示例提示词（使用中文作为默认语言）
        const samplePrompts = getSamplePrompts('zh-CN');
        
        const insertPromptStmt = this.db.prepare(`
          INSERT INTO prompts (id, title, content, category_id, is_favorite, version, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const now = new Date().toISOString();
        
        // 使用事务插入所有示例提示词
        const promptTransaction = this.db.transaction(() => {
          samplePrompts.forEach(prompt => {
            insertPromptStmt.run(
              prompt.id,
              prompt.title,
              prompt.content,
              prompt.category,
              prompt.isFavorite ? 1 : 0,
              prompt.version || 1,
              now,
              now
            );
            
            // 插入标签
            if (prompt.tags && prompt.tags.length > 0) {
              const insertTagStmt = this.db.prepare(`
                INSERT OR IGNORE INTO tags (name, created_at)
                VALUES (?, ?)
              `);
              
              const insertPromptTagStmt = this.db.prepare(`
                INSERT INTO prompt_tags (prompt_id, tag_id)
                VALUES (?, (SELECT id FROM tags WHERE name = ?))
              `);
              
              prompt.tags.forEach(tag => {
                insertTagStmt.run(tag, now);
                insertPromptTagStmt.run(prompt.id, tag);
              });
            }
          });
        });
        
        promptTransaction();
        
        console.log(`已插入 ${samplePrompts.length} 个示例提示词`);
      } else {
        console.log('提示词数据已存在，跳过提示词种子数据插入');
      }
    } catch (error) {
      console.error('插入种子数据失败:', error);
      // 不抛出错误，避免影响数据库初始化
    }
  }
}
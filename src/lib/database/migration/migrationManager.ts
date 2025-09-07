import { DatabaseManager } from '../database';
import { loadPrompts, loadCategories, loadSettings, getDefaultCategories } from '../../data';
import { PromptDAO } from '../dao/PromptDAO';
import { CategoryDAO } from '../dao/CategoryDAO';
import { SettingsDAO } from '../dao/SettingsDAO';

export class MigrationManager {
  private db = DatabaseManager.getInstance();

  public async migrateFromLocalStorage(): Promise<void> {
    try {
      console.log('开始从localStorage迁移数据到SQLite...');

      // 检查是否已经迁移过
      const migrationStatus = this.getMigrationStatus();
      if (migrationStatus === 'completed') {
        console.log('数据已经迁移过，跳过迁移');
        return;
      }

      // 创建备份
      await this.createBackup();

      // 从localStorage读取数据
      const prompts = loadPrompts();
      const categories = loadCategories();
      const settings = loadSettings();

      console.log(`准备迁移: ${prompts.length} 个提示词, ${categories.length} 个分类`);

      // 使用DAO进行迁移
      const promptDAO = new PromptDAO();
      const categoryDAO = new CategoryDAO();
      const settingsDAO = new SettingsDAO();

      const database = this.db.getDatabase();
      const transaction = database.transaction(() => {
        // 1. 迁移分类
        console.log('迁移分类数据...');
        categories.forEach(category => {
          try {
            categoryDAO.create(category);
          } catch (error) {
            // 如果分类已存在，尝试更新
            categoryDAO.update(category.id, category);
          }
        });

        // 2. 迁移提示词（包括标签和图片）
        console.log('迁移提示词数据...');
        prompts.forEach(prompt => {
          try {
            promptDAO.create(prompt);
          } catch (error) {
            console.warn(`提示词 ${prompt.id} 迁移失败:`, error);
            // 如果提示词已存在，尝试更新
            try {
              promptDAO.update(prompt.id, prompt);
            } catch (updateError) {
              console.error(`提示词 ${prompt.id} 更新失败:`, updateError);
            }
          }
        });

        // 3. 迁移设置
        console.log('迁移设置数据...');
        settingsDAO.setMany(settings);

        // 4. 标记迁移完成
        settingsDAO.set('migration_status', 'completed');
        settingsDAO.set('migration_date', new Date().toISOString());
        settingsDAO.set('migration_source', 'localStorage');
      });

      transaction();
      
      // 验证迁移结果
      const migratedPrompts = promptDAO.getAll();
      const migratedCategories = categoryDAO.getAll();
      
      console.log(`迁移完成: ${migratedPrompts.length} 个提示词, ${migratedCategories.length} 个分类`);
      
      if (migratedPrompts.length !== prompts.length) {
        console.warn('警告: 迁移的提示词数量不匹配');
      }
      
      if (migratedCategories.length !== categories.length) {
        console.warn('警告: 迁移的分类数量不匹配');
      }

    } catch (error) {
      console.error('数据迁移失败:', error);
      throw error;
    }
  }

  private getMigrationStatus(): string {
    try {
      const database = this.db.getDatabase();
      const stmt = database.prepare('SELECT value FROM settings WHERE key = ?');
      const result = stmt.get('migration_status') as any;
      return result ? JSON.parse(result.value) : 'pending';
    } catch {
      return 'pending';
    }
  }

  private async createBackup(): Promise<void> {
    try {
      console.log('创建迁移前备份...');
      
      // 备份localStorage数据
      const backupData = {
        prompts: loadPrompts(),
        categories: loadCategories(),
        settings: loadSettings(),
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };

      // 如果在Electron环境中，保存到文件
      if (typeof window !== 'undefined' && window.require) {
        const { app } = window.require('electron');
        const path = window.require('path');
        const fs = window.require('fs').promises;
        
        const userDataPath = app.getPath('userData');
        const backupPath = path.join(userDataPath, `localStorage_backup_${Date.now()}.json`);
        
        await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
        console.log('备份已保存到:', backupPath);
      }
      
    } catch (error) {
      console.warn('创建备份失败，但继续迁移:', error);
    }
  }

  public async rollbackMigration(): Promise<void> {
    try {
      console.log('开始回滚迁移...');
      
      const settingsDAO = new SettingsDAO();
      
      // 清空数据库表
      const database = this.db.getDatabase();
      const transaction = database.transaction(() => {
        database.prepare('DELETE FROM prompt_images').run();
        database.prepare('DELETE FROM prompt_tags').run();
        database.prepare('DELETE FROM prompts').run();
        database.prepare('DELETE FROM categories').run();
        database.prepare('DELETE FROM tags').run();
        database.prepare('DELETE FROM settings WHERE key != ?').run('migration_status');
        
        // 标记迁移状态为已回滚
        settingsDAO.set('migration_status', 'rolled_back');
        settingsDAO.set('rollback_date', new Date().toISOString());
      });
      
      transaction();
      console.log('迁移已回滚，数据库已清空');
      
    } catch (error) {
      console.error('回滚迁移失败:', error);
      throw error;
    }
  }

  public getMigrationInfo(): any {
    try {
      const settingsDAO = new SettingsDAO();
      return {
        status: settingsDAO.get('migration_status') || 'pending',
        date: settingsDAO.get('migration_date'),
        source: settingsDAO.get('migration_source'),
        rollbackDate: settingsDAO.get('rollback_date')
      };
    } catch {
      return { status: 'pending' };
    }
  }
}
import { Settings } from '../../../types';
import { BaseDAO } from './BaseDAO';

export class SettingsDAO extends BaseDAO {
  // 获取所有设置
  getAll(): Settings {
    try {
      const stmt = this.db.prepare('SELECT key, value, type FROM settings');
      const rows = stmt.all() as Array<{ key: string; value: string; type: string }>;
      
      const settings: any = {};
      rows.forEach(row => {
        settings[row.key] = this.parseValue(row.value, row.type);
      });
      
      return settings as Settings;
    } catch (error) {
      this.handleError('获取所有设置', error);
    }
  }

  // 根据键获取设置
  get(key: string): any {
    try {
      const stmt = this.db.prepare('SELECT value, type FROM settings WHERE key = ?');
      const row = stmt.get(key) as { value: string; type: string } | undefined;
      
      if (!row) return undefined;
      return this.parseValue(row.value, row.type);
    } catch (error) {
      this.handleError('获取设置', error);
    }
  }

  // 设置值
  set(key: string, value: any): void {
    try {
      const type = typeof value;
      const serializedValue = JSON.stringify(value);
      
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO settings (key, value, type)
        VALUES (?, ?, ?)
      `);
      
      stmt.run(key, serializedValue, type);
    } catch (error) {
      this.handleError('设置值', error);
    }
  }

  // 批量设置
  setMany(settings: Record<string, any>): void {
    try {
      this.executeInTransaction(() => {
        Object.entries(settings).forEach(([key, value]) => {
          this.set(key, value);
        });
      });
    } catch (error) {
      this.handleError('批量设置', error);
    }
  }

  // 删除设置
  delete(key: string): boolean {
    try {
      const stmt = this.db.prepare('DELETE FROM settings WHERE key = ?');
      const result = stmt.run(key);
      return result.changes > 0;
    } catch (error) {
      this.handleError('删除设置', error);
    }
  }

  // 解析值
  private parseValue(value: string, type: string): any {
    try {
      const parsed = JSON.parse(value);
      
      // 类型验证
      if (typeof parsed !== type) {
        console.warn(`设置值类型不匹配: 期望 ${type}, 实际 ${typeof parsed}`);
      }
      
      return parsed;
    } catch {
      // 如果JSON解析失败，返回原始字符串
      return value;
    }
  }
}
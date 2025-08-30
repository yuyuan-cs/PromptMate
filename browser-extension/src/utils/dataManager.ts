import { Prompt, Category, ExtensionSettings } from '../shared/types';
import { t } from '../i18n/index';

export interface ExportData {
  prompts: Prompt[];
  categories: Category[];
  settings: ExtensionSettings;
  exportDate: string;
  version: string;
}

export class DataManager {
  /**
   * 导出所有数据为JSON文件
   */
  static async exportData(): Promise<void> {
    try {
      // 获取所有数据
      const result = await chrome.storage.local.get(['prompts', 'categories', 'settings']);
      
      const exportData: ExportData = {
        prompts: result.prompts || [],
        categories: result.categories || [],
        settings: result.settings || {},
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };

      // 创建下载链接
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      // 创建下载链接
      const link = document.createElement('a');
      link.href = url;
      link.download = `${t('dataManager_backupFilePrefix')}${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 清理URL对象
      URL.revokeObjectURL(url);
      
      console.log('数据导出成功');
    } catch (error) {
      console.error('数据导出失败:', error);
      throw new Error(t('dataManager_exportFailed'));
    }
  }

  /**
   * 从JSON文件导入数据
   */
  static async importData(file: File): Promise<void> {
    try {
      const text = await file.text();
      const importData: ExportData = JSON.parse(text);

      // 验证数据格式
      if (!importData.prompts || !Array.isArray(importData.prompts)) {
        throw new Error(t('dataManager_invalidFormat'));
      }

      // 合并数据（保留现有数据，添加新数据）
      const existingResult = await chrome.storage.local.get(['prompts', 'categories', 'settings']);
      
      const existingPrompts = existingResult.prompts || [];
      const existingCategories = existingResult.categories || [];
      const existingSettings = existingResult.settings || {};

      // 合并提示词（避免重复ID）
      const mergedPrompts = [...existingPrompts];
      importData.prompts.forEach(prompt => {
        const exists = existingPrompts.find(p => p.id === prompt.id);
        if (!exists) {
          mergedPrompts.push(prompt);
        } else {
          // 如果ID重复，生成新ID
          const newPrompt = { ...prompt, id: `${prompt.id}_imported_${Date.now()}` };
          mergedPrompts.push(newPrompt);
        }
      });

      // 合并分类
      const mergedCategories = [...existingCategories];
      if (importData.categories) {
        importData.categories.forEach(category => {
          const exists = existingCategories.find(c => c.id === category.id);
          if (!exists) {
            mergedCategories.push(category);
          }
        });
      }

      // 合并设置（导入的设置优先）
      const mergedSettings = { ...existingSettings, ...importData.settings };

      // 保存合并后的数据
      await chrome.storage.local.set({
        prompts: mergedPrompts,
        categories: mergedCategories,
        settings: mergedSettings
      });

      console.log(`数据导入成功：导入了 ${importData.prompts.length} 个提示词`);
    } catch (error) {
      console.error('数据导入失败:', error);
      if (error instanceof SyntaxError) {
        throw new Error(t('dataManager_jsonParseError'));
      }
      throw new Error(t('dataManager_importFailed', { error: error.message }));
    }
  }

  /**
   * 清除所有数据
   */
  static async clearAllData(): Promise<void> {
    try {
      await chrome.storage.local.clear();
      console.log('所有数据已清除');
    } catch (error) {
      console.error('清除数据失败:', error);
      throw new Error(t('dataManager_clearFailed'));
    }
  }

  /**
   * 获取数据统计信息
   */
  static async getDataStats(): Promise<{
    promptCount: number;
    categoryCount: number;
    totalUsage: number;
    lastBackup?: string;
  }> {
    try {
      const result = await chrome.storage.local.get(['prompts', 'categories', 'lastBackup']);
      const prompts = result.prompts || [];
      const categories = result.categories || [];
      
      const totalUsage = prompts.reduce((sum, prompt) => sum + (prompt.usageCount || 0), 0);

      return {
        promptCount: prompts.length,
        categoryCount: categories.length,
        totalUsage,
        lastBackup: result.lastBackup
      };
    } catch (error) {
      console.error('获取数据统计失败:', error);
      return {
        promptCount: 0,
        categoryCount: 0,
        totalUsage: 0
      };
    }
  }

  /**
   * 自动备份数据
   */
  static async autoBackup(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['settings']);
      const settings = result.settings || {};
      
      if (settings.autoExportOnChange) {
        await this.exportData();
        await chrome.storage.local.set({ lastBackup: new Date().toISOString() });
      }
    } catch (error) {
      console.error('自动备份失败:', error);
    }
  }
}

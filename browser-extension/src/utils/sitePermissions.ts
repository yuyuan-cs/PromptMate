export interface SitePermission {
  domain: string;
  allowed: boolean;
  addedAt: string;
  lastUsed?: string;
}

export class SitePermissionManager {
  /**
   * 检查当前站点是否被允许使用扩展
   */
  static async isCurrentSiteAllowed(): Promise<boolean> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) return false;

      const domain = this.extractDomain(tab.url);
      return await this.isDomainAllowed(domain);
    } catch (error) {
      console.error('检查站点权限失败:', error);
      return true; // 默认允许
    }
  }

  /**
   * 检查指定域名是否被允许
   */
  static async isDomainAllowed(domain: string): Promise<boolean> {
    try {
      const result = await chrome.storage.local.get(['settings']);
      const settings = result.settings || {};
      
      const allowList = settings.allowList || [];
      const blockList = settings.blockList || [];

      // 如果有白名单，只允许白名单中的域名
      if (allowList.length > 0) {
        return allowList.some(allowedDomain => this.matchesDomain(domain, allowedDomain));
      }

      // 如果没有白名单，检查黑名单
      if (blockList.length > 0) {
        return !blockList.some(blockedDomain => this.matchesDomain(domain, blockedDomain));
      }

      // 默认允许所有站点
      return true;
    } catch (error) {
      console.error('检查域名权限失败:', error);
      return true;
    }
  }

  /**
   * 添加域名到白名单
   */
  static async addToAllowList(domain: string): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['settings']);
      const settings = result.settings || {};
      const allowList = settings.allowList || [];

      if (!allowList.includes(domain)) {
        allowList.push(domain);
        await chrome.storage.local.set({
          settings: { ...settings, allowList }
        });
      }
    } catch (error) {
      console.error('添加到白名单失败:', error);
      throw new Error('添加到白名单失败');
    }
  }

  /**
   * 添加域名到黑名单
   */
  static async addToBlockList(domain: string): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['settings']);
      const settings = result.settings || {};
      const blockList = settings.blockList || [];

      if (!blockList.includes(domain)) {
        blockList.push(domain);
        await chrome.storage.local.set({
          settings: { ...settings, blockList }
        });
      }
    } catch (error) {
      console.error('添加到黑名单失败:', error);
      throw new Error('添加到黑名单失败');
    }
  }

  /**
   * 从白名单移除域名
   */
  static async removeFromAllowList(domain: string): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['settings']);
      const settings = result.settings || {};
      const allowList = settings.allowList || [];

      const updatedAllowList = allowList.filter(d => d !== domain);
      await chrome.storage.local.set({
        settings: { ...settings, allowList: updatedAllowList }
      });
    } catch (error) {
      console.error('从白名单移除失败:', error);
      throw new Error('从白名单移除失败');
    }
  }

  /**
   * 从黑名单移除域名
   */
  static async removeFromBlockList(domain: string): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['settings']);
      const settings = result.settings || {};
      const blockList = settings.blockList || [];

      const updatedBlockList = blockList.filter(d => d !== domain);
      await chrome.storage.local.set({
        settings: { ...settings, blockList: updatedBlockList }
      });
    } catch (error) {
      console.error('从黑名单移除失败:', error);
      throw new Error('从黑名单移除失败');
    }
  }

  /**
   * 获取当前站点域名
   */
  static async getCurrentDomain(): Promise<string | null> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) return null;
      return this.extractDomain(tab.url);
    } catch (error) {
      console.error('获取当前域名失败:', error);
      return null;
    }
  }

  /**
   * 获取所有权限设置
   */
  static async getAllPermissions(): Promise<{
    allowList: string[];
    blockList: string[];
  }> {
    try {
      const result = await chrome.storage.local.get(['settings']);
      const settings = result.settings || {};
      
      return {
        allowList: settings.allowList || [],
        blockList: settings.blockList || []
      };
    } catch (error) {
      console.error('获取权限设置失败:', error);
      return { allowList: [], blockList: [] };
    }
  }

  /**
   * 从URL提取域名
   */
  private static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      console.error('提取域名失败:', error);
      return '';
    }
  }

  /**
   * 检查域名是否匹配（支持通配符）
   */
  private static matchesDomain(domain: string, pattern: string): boolean {
    // 简单的通配符匹配
    if (pattern.startsWith('*.')) {
      const baseDomain = pattern.slice(2);
      return domain === baseDomain || domain.endsWith('.' + baseDomain);
    }
    return domain === pattern;
  }

  /**
   * 快速切换当前站点权限
   */
  static async toggleCurrentSite(): Promise<boolean> {
    try {
      const domain = await this.getCurrentDomain();
      if (!domain) return false;

      const isAllowed = await this.isDomainAllowed(domain);
      
      if (isAllowed) {
        await this.addToBlockList(domain);
        return false;
      } else {
        await this.removeFromBlockList(domain);
        await this.addToAllowList(domain);
        return true;
      }
    } catch (error) {
      console.error('切换站点权限失败:', error);
      return false;
    }
  }
}

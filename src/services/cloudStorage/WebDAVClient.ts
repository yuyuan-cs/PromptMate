/**
 * WebDAV 客户端实现
 * 支持坚果云、ownCloud、NextCloud 等标准 WebDAV 服务
 */
import { CloudFileInfo } from '../../types';

export interface WebDAVClientConfig {
  url: string;
  username: string;
  password: string;
  timeout?: number;
}

export class WebDAVClient {
  private config: WebDAVClientConfig;
  private baseURL: string;

  constructor(config: WebDAVClientConfig) {
    this.config = config;
    this.baseURL = config.url.replace(/\/$/, '');
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('PROPFIND', '/', {
        'Depth': '0',
        'Content-Type': 'application/xml'
      });
      return response.ok;
    } catch (error) {
      console.error('WebDAV连接测试失败:', error);
      return false;
    }
  }

  /**
   * 上传文件
   */
  async uploadFile(path: string, content: string | Buffer): Promise<void> {
    try {
      // 确保远程目录存在
      await this.ensureDirectoryExists(this.getDirectoryPath(path));

      const response = await this.makeRequest('PUT', path, {
        'Content-Type': 'application/octet-stream'
      }, content);

      if (!response.ok) {
        throw new Error(`上传文件失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('WebDAV上传文件失败:', error);
      throw error;
    }
  }

  /**
   * 下载文件
   */
  async downloadFile(path: string): Promise<string> {
    try {
      const response = await this.makeRequest('GET', path);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('文件不存在');
        }
        throw new Error(`下载文件失败: ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error('WebDAV下载文件失败:', error);
      throw error;
    }
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      const response = await this.makeRequest('HEAD', path);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(path: string): Promise<CloudFileInfo | null> {
    try {
      const response = await this.makeRequest('PROPFIND', path, {
        'Depth': '0',
        'Content-Type': 'application/xml'
      }, this.buildPropfindXML());

      if (!response.ok) {
        return null;
      }

      const xmlText = await response.text();
      return this.parseFileInfoFromXML(xmlText, path);
    } catch (error) {
      console.error('获取文件信息失败:', error);
      return null;
    }
  }

  /**
   * 列出目录内容
   */
  async listDirectory(path: string): Promise<CloudFileInfo[]> {
    try {
      const response = await this.makeRequest('PROPFIND', path, {
        'Depth': '1',
        'Content-Type': 'application/xml'
      }, this.buildPropfindXML());

      if (!response.ok) {
        throw new Error(`列出目录失败: ${response.status} ${response.statusText}`);
      }

      const xmlText = await response.text();
      return this.parseDirectoryListFromXML(xmlText);
    } catch (error) {
      console.error('WebDAV列出目录失败:', error);
      throw error;
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const response = await this.makeRequest('DELETE', path);
      
      if (!response.ok && response.status !== 404) {
        throw new Error(`删除文件失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('WebDAV删除文件失败:', error);
      throw error;
    }
  }

  /**
   * 创建目录
   */
  async createDirectory(path: string): Promise<void> {
    try {
      const response = await this.makeRequest('MKCOL', path);
      
      if (!response.ok && response.status !== 405) { // 405表示目录已存在
        throw new Error(`创建目录失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('WebDAV创建目录失败:', error);
      throw error;
    }
  }

  /**
   * 确保目录存在
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    if (!dirPath || dirPath === '/') return;

    const pathParts = dirPath.split('/').filter(part => part);
    let currentPath = '';

    for (const part of pathParts) {
      currentPath += `/${part}`;
      try {
        await this.createDirectory(currentPath);
      } catch (error) {
        // 忽略创建失败，可能目录已存在
      }
    }
  }

  /**
   * 获取目录路径
   */
  private getDirectoryPath(filePath: string): string {
    const lastSlashIndex = filePath.lastIndexOf('/');
    return lastSlashIndex > 0 ? filePath.substring(0, lastSlashIndex) : '';
  }

  /**
   * 发送 HTTP 请求
   */
  private async makeRequest(
    method: string,
    path: string,
    headers: Record<string, string> = {},
    body?: string | Buffer
  ): Promise<Response> {
    const url = `${this.baseURL}${path.startsWith('/') ? path : '/' + path}`;
    
    const requestHeaders = {
      'Authorization': `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`,
      'User-Agent': 'PromptMate/1.0.0',
      ...headers
    };

    const requestInit: RequestInit = {
      method,
      headers: requestHeaders
    };

    // 添加超时控制（兼容性更好的实现）
    if (this.config.timeout) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), this.config.timeout);
      requestInit.signal = controller.signal;
    }

    if (body) {
      requestInit.body = body;
    }

    return fetch(url, requestInit);
  }

  /**
   * 构建 PROPFIND XML
   */
  private buildPropfindXML(): string {
    return `<?xml version="1.0"?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:displayname/>
    <d:getcontentlength/>
    <d:getlastmodified/>
    <d:resourcetype/>
  </d:prop>
</d:propfind>`;
  }

  /**
   * 解析文件信息 XML
   */
  private parseFileInfoFromXML(xmlText: string, path: string): CloudFileInfo | null {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      
      const response = doc.querySelector('response');
      if (!response) return null;

      const displayName = response.querySelector('displayname')?.textContent || '';
      const contentLength = response.querySelector('getcontentlength')?.textContent || '0';
      const lastModified = response.querySelector('getlastmodified')?.textContent || '';

      return {
        name: displayName || path.split('/').pop() || '',
        size: parseInt(contentLength, 10),
        lastModified,
        path
      };
    } catch (error) {
      console.error('解析文件信息XML失败:', error);
      return null;
    }
  }

  /**
   * 解析目录列表 XML
   */
  private parseDirectoryListFromXML(xmlText: string): CloudFileInfo[] {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      
      const responses = doc.querySelectorAll('response');
      const files: CloudFileInfo[] = [];

      responses.forEach(response => {
        const href = response.querySelector('href')?.textContent || '';
        const displayName = response.querySelector('displayname')?.textContent || '';
        const contentLength = response.querySelector('getcontentlength')?.textContent || '0';
        const lastModified = response.querySelector('getlastmodified')?.textContent || '';
        const resourceType = response.querySelector('resourcetype');
        
        // 跳过目录本身和集合类型
        if (resourceType?.querySelector('collection')) return;
        if (!displayName) return;

        files.push({
          name: displayName,
          size: parseInt(contentLength, 10),
          lastModified,
          path: href
        });
      });

      return files;
    } catch (error) {
      console.error('解析目录列表XML失败:', error);
      return [];
    }
  }
}
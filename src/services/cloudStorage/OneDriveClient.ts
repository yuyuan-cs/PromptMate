/**
 * OneDrive 客户端实现
 * 基于 Microsoft Graph API v1.0
 */
import { CloudFileInfo } from '../../types';

export interface OneDriveClientConfig {
  clientId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  timeout?: number;
}

export class OneDriveClient {
  private config: OneDriveClientConfig;
  private readonly graphBaseURL = 'https://graph.microsoft.com/v1.0';
  private readonly authBaseURL = 'https://login.microsoftonline.com/common/oauth2/v2.0';

  constructor(config: OneDriveClientConfig) {
    this.config = config;
  }

  /**
   * 获取授权 URL
   */
  getAuthorizationUrl(redirectUri: string, scopes: string[] = ['Files.ReadWrite']): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      response_mode: 'query',
      state: Math.random().toString(36).substring(2, 15)
    });

    return `${this.authBaseURL}/authorize?${params.toString()}`;
  }

  /**
   * 通过授权码获取访问令牌
   */
  async getAccessToken(code: string, redirectUri: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  }> {
    try {
      const response = await fetch(`${this.authBaseURL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        throw new Error(`获取访问令牌失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

      this.config.accessToken = data.access_token;
      this.config.refreshToken = data.refresh_token;
      this.config.expiresAt = expiresAt;

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt
      };
    } catch (error) {
      console.error('OneDrive获取访问令牌失败:', error);
      throw error;
    }
  }

  /**
   * 刷新访问令牌
   */
  async refreshAccessToken(): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  }> {
    if (!this.config.refreshToken) {
      throw new Error('缺少刷新令牌');
    }

    try {
      const response = await fetch(`${this.authBaseURL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          refresh_token: this.config.refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        throw new Error(`刷新令牌失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

      this.config.accessToken = data.access_token;
      if (data.refresh_token) {
        this.config.refreshToken = data.refresh_token;
      }
      this.config.expiresAt = expiresAt;

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || this.config.refreshToken,
        expiresAt
      };
    } catch (error) {
      console.error('OneDrive刷新令牌失败:', error);
      throw error;
    }
  }

  /**
   * 检查令牌是否过期
   */
  private isTokenExpired(): boolean {
    if (!this.config.expiresAt) return true;
    return new Date() >= new Date(this.config.expiresAt);
  }

  /**
   * 确保访问令牌有效
   */
  private async ensureValidToken(): Promise<void> {
    if (this.isTokenExpired() && this.config.refreshToken) {
      await this.refreshAccessToken();
    }
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.ensureValidToken();
      const response = await this.makeRequest('GET', '/me/drive');
      return response.ok;
    } catch (error) {
      console.error('OneDrive连接测试失败:', error);
      return false;
    }
  }

  /**
   * 上传文件
   */
  async uploadFile(path: string, content: string | Buffer): Promise<void> {
    try {
      await this.ensureValidToken();
      
      // 确保远程目录存在
      await this.ensureDirectoryExists(this.getDirectoryPath(path));

      const encodedPath = encodeURIComponent(path);
      const response = await this.makeRequest(
        'PUT',
        `/me/drive/root:${encodedPath}:/content`,
        {
          'Content-Type': 'application/octet-stream'
        },
        content
      );

      if (!response.ok) {
        throw new Error(`上传文件失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('OneDrive上传文件失败:', error);
      throw error;
    }
  }

  /**
   * 下载文件
   */
  async downloadFile(path: string): Promise<string> {
    try {
      await this.ensureValidToken();
      
      const encodedPath = encodeURIComponent(path);
      const response = await this.makeRequest('GET', `/me/drive/root:${encodedPath}:/content`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('文件不存在');
        }
        throw new Error(`下载文件失败: ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error('OneDrive下载文件失败:', error);
      throw error;
    }
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      await this.ensureValidToken();
      
      const encodedPath = encodeURIComponent(path);
      const response = await this.makeRequest('GET', `/me/drive/root:${encodedPath}`);
      
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
      await this.ensureValidToken();
      
      const encodedPath = encodeURIComponent(path);
      const response = await this.makeRequest('GET', `/me/drive/root:${encodedPath}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        name: data.name,
        size: data.size,
        lastModified: data.lastModifiedDateTime,
        path: path
      };
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
      await this.ensureValidToken();
      
      const encodedPath = path === '/' ? '' : encodeURIComponent(path);
      const endpoint = encodedPath 
        ? `/me/drive/root:${encodedPath}:/children`
        : '/me/drive/root/children';
        
      const response = await this.makeRequest('GET', endpoint);

      if (!response.ok) {
        throw new Error(`列出目录失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const files: CloudFileInfo[] = [];

      if (data.value) {
        data.value.forEach((item: any) => {
          // 只返回文件，不包括文件夹
          if (!item.folder) {
            files.push({
              name: item.name,
              size: item.size,
              lastModified: item.lastModifiedDateTime,
              path: `${path}/${item.name}`.replace('//', '/')
            });
          }
        });
      }

      return files;
    } catch (error) {
      console.error('OneDrive列出目录失败:', error);
      throw error;
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(path: string): Promise<void> {
    try {
      await this.ensureValidToken();
      
      const encodedPath = encodeURIComponent(path);
      const response = await this.makeRequest('DELETE', `/me/drive/root:${encodedPath}`);
      
      if (!response.ok && response.status !== 404) {
        throw new Error(`删除文件失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('OneDrive删除文件失败:', error);
      throw error;
    }
  }

  /**
   * 创建目录
   */
  async createDirectory(path: string): Promise<void> {
    try {
      await this.ensureValidToken();
      
      const parentPath = this.getDirectoryPath(path);
      const folderName = path.split('/').pop();
      
      if (!folderName) return;

      const encodedParentPath = parentPath === '/' ? '' : encodeURIComponent(parentPath);
      const endpoint = encodedParentPath 
        ? `/me/drive/root:${encodedParentPath}:/children`
        : '/me/drive/root/children';

      const response = await this.makeRequest('POST', endpoint, {
        'Content-Type': 'application/json'
      }, JSON.stringify({
        name: folderName,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'replace'
      }));
      
      if (!response.ok) {
        throw new Error(`创建目录失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('OneDrive创建目录失败:', error);
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
        // 检查目录是否存在
        const encodedPath = encodeURIComponent(currentPath);
        const checkResponse = await this.makeRequest('GET', `/me/drive/root:${encodedPath}`);
        
        if (!checkResponse.ok) {
          // 目录不存在，创建它
          await this.createDirectory(currentPath);
        }
      } catch (error) {
        // 忽略错误，可能目录已存在
      }
    }
  }

  /**
   * 获取目录路径
   */
  private getDirectoryPath(filePath: string): string {
    const lastSlashIndex = filePath.lastIndexOf('/');
    return lastSlashIndex > 0 ? filePath.substring(0, lastSlashIndex) : '/';
  }

  /**
   * 发送 HTTP 请求
   */
  private async makeRequest(
    method: string,
    endpoint: string,
    headers: Record<string, string> = {},
    body?: string | Buffer
  ): Promise<Response> {
    if (!this.config.accessToken) {
      throw new Error('缺少访问令牌');
    }

    const url = `${this.graphBaseURL}${endpoint}`;
    
    const requestHeaders = {
      'Authorization': `Bearer ${this.config.accessToken}`,
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
}
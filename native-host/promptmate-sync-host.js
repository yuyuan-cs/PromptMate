#!/usr/bin/env node

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const os = require('os');
const { execSync } = require('child_process');

class PromptMateSyncHost {
  constructor() {
    this.dataPath = this.getSyncDataPath();
    this.watcher = null;
    this.lastChecksum = '';
    
    // 设置标准输入输出
    process.stdin.setEncoding('utf8');
    process.stdout.setEncoding('utf8');
    
    this.setupMessageHandling();
  }

  // 获取默认应用数据目录
  getDefaultUserDataDir() {
    const home = os.homedir();
    if (process.platform === 'win32') {
      return path.join(home, 'AppData', 'Roaming', 'PromptMate');
    } else if (process.platform === 'darwin') {
      return path.join(home, 'Library', 'Application Support', 'PromptMate');
    } else {
      return path.join(home, '.config', 'PromptMate');
    }
  }

  // 获取同步数据文件路径（优先使用 sync-settings.json 中的自定义路径；兼容 Windows 注册表自定义目录）
  getSyncDataPath() {
    let baseDir = null;

    // 1) 优先读取默认目录下的 sync-settings.json
    try {
      const defaultDir = this.getDefaultUserDataDir();
      const settingsFile = path.join(defaultDir, 'sync-settings.json');
      if (fsSync.existsSync(settingsFile)) {
        const content = fsSync.readFileSync(settingsFile, 'utf-8');
        const config = JSON.parse(content);
        if (config && typeof config.dataPath === 'string' && config.dataPath.trim()) {
          return config.dataPath; // 已经是完整文件路径
        }
      }
    } catch (_) {
      // 忽略配置读取错误，继续其他判断
    }

    // 2) Windows 下读取注册表自定义目录
    if (process.platform === 'win32') {
      try {
        const result = execSync('reg query "HKCU\\Software\\PromptMate" /v DataDirectory', { encoding: 'utf8', stdio: 'pipe' });
        const match = result.match(/DataDirectory\s+REG_SZ\s+(.+)/);
        if (match && match[1] && fsSync.existsSync(match[1].trim())) {
          baseDir = match[1].trim();
        }
      } catch (_) {
        // ignore and fallback
      }
    }

    // 3) 默认目录
    if (!baseDir) {
      baseDir = this.getDefaultUserDataDir();
    }

    return path.join(baseDir, 'sync-data.json');
  }

  // 设置消息处理
  setupMessageHandling() {
    let messageBuffer = '';

    process.stdin.on('data', (chunk) => {
      messageBuffer += chunk;
      
      // 处理可能的多个消息
      let messages = messageBuffer.split('\n');
      messageBuffer = messages.pop() || ''; // 保留不完整的消息
      
      messages.forEach(messageStr => {
        if (messageStr.trim()) {
          try {
            const message = JSON.parse(messageStr);
            this.handleMessage(message);
          } catch (error) {
            this.sendError('消息解析失败: ' + error.message);
          }
        }
      });
    });

    process.stdin.on('end', () => {
      this.cleanup();
      process.exit(0);
    });

    // 启动文件监听
    this.startFileWatcher();
  }

  // 处理来自扩展的消息
  async handleMessage(message) {
    try {
      switch (message.type) {
        case 'readSyncData':
          await this.handleReadSyncData(message);
          break;
        case 'writeSyncData':
          await this.handleWriteSyncData(message);
          break;
        case 'getSyncStatus':
          await this.handleGetSyncStatus(message);
          break;
        case 'manualSync':
          await this.handleManualSync(message);
          break;
        case 'resolveConflict':
          await this.handleResolveConflict(message);
          break;
        default:
          this.sendError('未知的消息类型: ' + message.type, message.id);
      }
    } catch (error) {
      this.sendError(error.message, message.id);
    }
  }

  // 处理读取同步数据请求
  async handleReadSyncData(message) {
    try {
      const data = await this.readSyncData();
      this.sendResponse(data, message.id);
    } catch (error) {
      this.sendError('读取同步数据失败: ' + error.message, message.id);
    }
  }

  // 处理写入同步数据请求
  async handleWriteSyncData(message) {
    try {
      await this.writeSyncData(message.data);
      this.sendResponse({ success: true }, message.id);
    } catch (error) {
      this.sendError('写入同步数据失败: ' + error.message, message.id);
    }
  }

  // 处理获取同步状态请求
  async handleGetSyncStatus(message) {
    try {
      const status = {
        lastSync: await this.getLastSyncTime(),
        hasConflicts: false, // TODO: 实现冲突检测
        error: null
      };
      this.sendResponse(status, message.id);
    } catch (error) {
      this.sendError('获取同步状态失败: ' + error.message, message.id);
    }
  }

  // 处理手动同步请求
  async handleManualSync(message) {
    try {
      // 触发手动同步逻辑
      const data = await this.readSyncData();
      if (data) {
        this.sendMessage({
          type: 'dataChanged',
          data: data
        });
      }
      this.sendResponse({ success: true }, message.id);
    } catch (error) {
      this.sendError('手动同步失败: ' + error.message, message.id);
    }
  }

  // 处理冲突解决请求
  async handleResolveConflict(message) {
    try {
      const { resolution, localData } = message.data;
      
      switch (resolution) {
        case 'local':
          if (localData) {
            await this.writeSyncData(localData);
          }
          break;
        case 'remote':
          // 保持远程数据不变
          break;
        case 'merge':
          // TODO: 实现智能合并逻辑
          break;
      }
      
      this.sendResponse({ success: true }, message.id);
    } catch (error) {
      this.sendError('解决冲突失败: ' + error.message, message.id);
    }
  }

  // 读取同步数据
  async readSyncData() {
    try {
      const content = await fs.readFile(this.dataPath, 'utf-8');
      const data = JSON.parse(content);
      
      if (this.validateSyncData(data)) {
        return data;
      } else {
        throw new Error('同步数据格式无效');
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null; // 文件不存在
      }
      throw error;
    }
  }

  // 写入同步数据
  async writeSyncData(data) {
    try {
      // 确保目录存在
      await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
      
      // 写入数据
      const content = JSON.stringify(data, null, 2);
      await fs.writeFile(this.dataPath, content, 'utf-8');
      
      // 更新校验和
      this.lastChecksum = data.syncMetadata.checksum;
    } catch (error) {
      throw new Error('写入文件失败: ' + error.message);
    }
  }

  // 验证同步数据格式
  validateSyncData(data) {
    return (
      data &&
      typeof data.version === 'string' &&
      typeof data.lastModified === 'string' &&
      Array.isArray(data.prompts) &&
      Array.isArray(data.categories) &&
      typeof data.settings === 'object' &&
      data.syncMetadata &&
      typeof data.syncMetadata.source === 'string' &&
      typeof data.syncMetadata.checksum === 'string'
    );
  }

  // 获取最后同步时间
  async getLastSyncTime() {
    try {
      const stats = await fs.stat(this.dataPath);
      return stats.mtime.toISOString();
    } catch (error) {
      return null;
    }
  }

  // 启动文件监听器
  startFileWatcher() {
    if (this.watcher) {
      this.watcher.close();
    }

    this.watcher = chokidar.watch(this.dataPath, {
      persistent: true,
      ignoreInitial: true
    });

    this.watcher.on('change', async () => {
      try {
        const data = await this.readSyncData();
        if (data && data.syncMetadata.source === 'desktop') {
          // 检测到桌面端的数据变更
          if (data.syncMetadata.checksum !== this.lastChecksum) {
            this.lastChecksum = data.syncMetadata.checksum;
            this.sendMessage({
              type: 'dataChanged',
              data: data
            });
          }
        }
      } catch (error) {
        this.sendMessage({
          type: 'error',
          error: '文件监听处理失败: ' + error.message
        });
      }
    });

    this.watcher.on('error', (error) => {
      this.sendMessage({
        type: 'error',
        error: '文件监听器错误: ' + error.message
      });
    });
  }

  // 发送消息到扩展
  sendMessage(message) {
    try {
      const messageStr = JSON.stringify(message) + '\n';
      process.stdout.write(messageStr);
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  }

  // 发送响应
  sendResponse(data, messageId) {
    this.sendMessage({
      id: messageId,
      data: data
    });
  }

  // 发送错误
  sendError(error, messageId) {
    this.sendMessage({
      id: messageId,
      error: error
    });
  }

  // 清理资源
  cleanup() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}

// 启动 Native Host
const syncHost = new PromptMateSyncHost();

// 处理进程退出
process.on('SIGINT', () => {
  syncHost.cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  syncHost.cleanup();
  process.exit(0);
});

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

class NativeHostInstaller {
  constructor() {
    this.platform = os.platform();
    this.hostName = 'com.promptmate.sync';
    this.manifestFileName = this.platform === 'win32' ? 'manifest.json' : 'manifest.json';
  }

  async install() {
    try {
      console.log('开始安装 PromptMate Native Host...');
      
      // 1. 创建安装目录
      const installDir = await this.createInstallDirectory();
      console.log(`安装目录: ${installDir}`);
      
      // 2. 复制文件
      await this.copyFiles(installDir);
      console.log('文件复制完成');
      
      // 3. 创建并注册 manifest
      await this.createAndRegisterManifest(installDir);
      console.log('Manifest 注册完成');
      
      // 4. 设置权限 (非 Windows)
      if (this.platform !== 'win32') {
        await this.setPermissions(installDir);
        console.log('权限设置完成');
      }
      
      console.log('✅ Native Host 安装成功!');
      console.log(`安装路径: ${installDir}`);
      
    } catch (error) {
      console.error('❌ Native Host 安装失败:', error.message);
      throw error;
    }
  }

  async uninstall() {
    try {
      console.log('开始卸载 PromptMate Native Host...');
      
      // 1. 删除注册表项 (Windows) 或配置文件
      await this.unregisterManifest();
      console.log('Manifest 注册已删除');
      
      // 2. 删除安装文件
      const installDir = this.getInstallDirectory();
      try {
        await fs.rmdir(installDir, { recursive: true });
        console.log('安装文件已删除');
      } catch (error) {
        console.warn('删除安装文件时出现警告:', error.message);
      }
      
      console.log('✅ Native Host 卸载成功!');
      
    } catch (error) {
      console.error('❌ Native Host 卸载失败:', error.message);
      throw error;
    }
  }

  // 创建安装目录
  async createInstallDirectory() {
    const installDir = this.getInstallDirectory();
    await fs.mkdir(installDir, { recursive: true });
    return installDir;
  }

  // 获取安装目录路径
  getInstallDirectory() {
    switch (this.platform) {
      case 'win32':
        return path.join(os.homedir(), 'AppData', 'Local', 'PromptMate', 'NativeHost');
      case 'darwin':
        return path.join(os.homedir(), 'Library', 'Application Support', 'PromptMate', 'NativeHost');
      case 'linux':
        return path.join(os.homedir(), '.config', 'promptmate', 'native-host');
      default:
        throw new Error(`不支持的平台: ${this.platform}`);
    }
  }

  // 复制文件到安装目录
  async copyFiles(installDir) {
    const sourceDir = path.join(__dirname, '..', 'native-host');
    
    // 复制 JavaScript 文件
    const hostScript = path.join(sourceDir, 'promptmate-sync-host.js');
    const targetScript = path.join(installDir, 'promptmate-sync-host.js');
    await fs.copyFile(hostScript, targetScript);
    
    // 创建可执行文件
    if (this.platform === 'win32') {
      // Windows: 创建批处理文件
      const batchContent = `@echo off\nnode "${targetScript}" %*`;
      await fs.writeFile(path.join(installDir, 'promptmate-sync-host.bat'), batchContent);
    } else {
      // Unix: 创建 shell 脚本
      const shellContent = `#!/bin/bash\nnode "${targetScript}" "$@"`;
      const shellScript = path.join(installDir, 'promptmate-sync-host');
      await fs.writeFile(shellScript, shellContent);
      await fs.chmod(shellScript, '755');
    }
  }

  // 创建并注册 manifest
  async createAndRegisterManifest(installDir) {
    const manifest = this.createManifest(installDir);
    const manifestPath = path.join(installDir, 'manifest.json');
    
    // 写入 manifest 文件
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    
    // 注册 manifest
    await this.registerManifest(manifestPath);
  }

  // 创建 manifest 内容
  createManifest(installDir) {
    const executableName = this.platform === 'win32' 
      ? 'promptmate-sync-host.bat' 
      : 'promptmate-sync-host';
    
    return {
      name: this.hostName,
      description: 'PromptMate Data Sync Native Host',
      path: path.join(installDir, executableName),
      type: 'stdio',
      allowed_origins: [
        'chrome-extension://*/'] // 将在运行时替换为实际的扩展ID
    };
  }

  // 注册 manifest
  async registerManifest(manifestPath) {
    switch (this.platform) {
      case 'win32':
        await this.registerManifestWindows(manifestPath);
        break;
      case 'darwin':
        await this.registerManifestMacOS(manifestPath);
        break;
      case 'linux':
        await this.registerManifestLinux(manifestPath);
        break;
    }
  }

  // Windows 注册表注册
  async registerManifestWindows(manifestPath) {
    const regKey = `HKEY_CURRENT_USER\\Software\\Google\\Chrome\\NativeMessagingHosts\\${this.hostName}`;
    const command = `reg add "${regKey}" /ve /t REG_SZ /d "${manifestPath.replace(/\\/g, '\\\\')}" /f`;
    
    try {
      execSync(command, { stdio: 'pipe' });
    } catch (error) {
      throw new Error(`注册表注册失败: ${error.message}`);
    }
  }

  // macOS 注册
  async registerManifestMacOS(manifestPath) {
    const targetDir = path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome', 'NativeMessagingHosts');
    await fs.mkdir(targetDir, { recursive: true });
    
    const targetPath = path.join(targetDir, `${this.hostName}.json`);
    await fs.copyFile(manifestPath, targetPath);
  }

  // Linux 注册
  async registerManifestLinux(manifestPath) {
    const targetDir = path.join(os.homedir(), '.config', 'google-chrome', 'NativeMessagingHosts');
    await fs.mkdir(targetDir, { recursive: true });
    
    const targetPath = path.join(targetDir, `${this.hostName}.json`);
    await fs.copyFile(manifestPath, targetPath);
  }

  // 取消注册 manifest
  async unregisterManifest() {
    switch (this.platform) {
      case 'win32':
        await this.unregisterManifestWindows();
        break;
      case 'darwin':
        await this.unregisterManifestMacOS();
        break;
      case 'linux':
        await this.unregisterManifestLinux();
        break;
    }
  }

  // Windows 取消注册
  async unregisterManifestWindows() {
    const regKey = `HKEY_CURRENT_USER\\Software\\Google\\Chrome\\NativeMessagingHosts\\${this.hostName}`;
    const command = `reg delete "${regKey}" /f`;
    
    try {
      execSync(command, { stdio: 'pipe' });
    } catch (error) {
      // 忽略删除不存在的键的错误
      if (!error.message.includes('找不到指定的注册表项或值')) {
        throw new Error(`注册表删除失败: ${error.message}`);
      }
    }
  }

  // macOS 取消注册
  async unregisterManifestMacOS() {
    const targetPath = path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome', 'NativeMessagingHosts', `${this.hostName}.json`);
    try {
      await fs.unlink(targetPath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  // Linux 取消注册
  async unregisterManifestLinux() {
    const targetPath = path.join(os.homedir(), '.config', 'google-chrome', 'NativeMessagingHosts', `${this.hostName}.json`);
    try {
      await fs.unlink(targetPath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  // 设置文件权限 (非 Windows)
  async setPermissions(installDir) {
    const scriptPath = path.join(installDir, 'promptmate-sync-host');
    await fs.chmod(scriptPath, '755');
  }

  // 检查安装状态
  async checkInstallation() {
    try {
      const installDir = this.getInstallDirectory();
      const manifestPath = path.join(installDir, 'manifest.json');
      
      // 检查文件是否存在
      await fs.access(manifestPath);
      
      // 检查注册状态
      const isRegistered = await this.checkRegistration();
      
      return {
        installed: true,
        registered: isRegistered,
        installPath: installDir
      };
    } catch (error) {
      return {
        installed: false,
        registered: false,
        installPath: null
      };
    }
  }

  // 检查注册状态
  async checkRegistration() {
    try {
      switch (this.platform) {
        case 'win32':
          const regKey = `HKEY_CURRENT_USER\\Software\\Google\\Chrome\\NativeMessagingHosts\\${this.hostName}`;
          execSync(`reg query "${regKey}"`, { stdio: 'pipe' });
          return true;
        case 'darwin':
          const macPath = path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome', 'NativeMessagingHosts', `${this.hostName}.json`);
          await fs.access(macPath);
          return true;
        case 'linux':
          const linuxPath = path.join(os.homedir(), '.config', 'google-chrome', 'NativeMessagingHosts', `${this.hostName}.json`);
          await fs.access(linuxPath);
          return true;
      }
    } catch (error) {
      return false;
    }
  }
}

// 命令行接口
if (require.main === module) {
  const installer = new NativeHostInstaller();
  const command = process.argv[2];

  switch (command) {
    case 'install':
      installer.install().catch(console.error);
      break;
    case 'uninstall':
      installer.uninstall().catch(console.error);
      break;
    case 'check':
      installer.checkInstallation().then(status => {
        console.log('安装状态:', status);
      }).catch(console.error);
      break;
    default:
      console.log('用法: node install-native-host.js [install|uninstall|check]');
  }
}

module.exports = NativeHostInstaller;

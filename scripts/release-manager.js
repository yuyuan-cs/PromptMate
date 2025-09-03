#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const VersionManager = require('./version-manager');

// GitHub Release配置
const GITHUB_REPO_OWNER = 'yy0691';
const GITHUB_REPO_NAME = 'PromptMate';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

class ReleaseManager {
  constructor() {
    this.versionManager = new VersionManager();
    this.packageJson = this.versionManager.packageJson;
  }

  // 检查环境
  checkEnvironment() {
    console.log('🔍 检查发布环境...');
    
    if (!GITHUB_TOKEN) {
      throw new Error('❌ 未设置GITHUB_TOKEN环境变量。请设置: export GITHUB_TOKEN=your_token');
    }
    
    // 检查是否在Git仓库中
    try {
      execSync('git status', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('❌ 当前目录不是Git仓库');
    }
    
    // 检查是否有未提交的更改
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.warn('⚠️  检测到未提交的更改，将自动提交');
    }
    
    console.log('✅ 环境检查通过');
  }

  // 构建应用
  async buildApp(platform = 'all') {
    console.log(`🔨 开始构建应用 (${platform})...`);
    
    try {
      switch (platform) {
        case 'win':
          execSync('npm run dist:win', { stdio: 'inherit' });
          break;
        case 'mac':
          execSync('npm run dist:mac', { stdio: 'inherit' });
          break;
        case 'all':
        default:
          execSync('npm run dist:all', { stdio: 'inherit' });
          break;
      }
      console.log('✅ 应用构建完成');
    } catch (error) {
      throw new Error(`❌ 构建失败: ${error.message}`);
    }
  }

  // 获取构建产物
  getBuildArtifacts(version = null) {
    const releaseDir = path.join(__dirname, '../release');
    const artifacts = [];
    
    if (!fs.existsSync(releaseDir)) {
      throw new Error('❌ 构建产物目录不存在');
    }
    
    // 获取当前版本号
    const currentVersion = version || this.packageJson.version;
    console.log(`🔍 查找版本 ${currentVersion} 的构建产物...`);
    
    // 定义要排除的文件和目录
    const excludePatterns = [
      '.DS_Store',
      'Assets.zip',
      'builder-debug.yml',
      'builder-effective-config.yaml',
      'latest-mac.yml',
      '.blockmap',
      '.icon-ico',
      '.icon-icns',
      'win-unpacked',
      'mac',
      'win-universal-unpacked',
      'win-arm64-unpacked',
      'Assets'
    ];
    
    // 定义当前版本相关的文件模式
    const currentVersionPatterns = [
      `PromptMate-${currentVersion}-x64.exe`,
      `PromptMate-${currentVersion}-arm64.exe`,
      `PromptMate-${currentVersion}.exe`,
      `PromptMate Setup ${currentVersion}.exe`,
      `PromptMate-${currentVersion}-x64.dmg`,
      `PromptMate-${currentVersion}-arm64.dmg`,
      `PromptMate-${currentVersion}-universal.dmg`,
      `PromptMate-${currentVersion}-x64.zip`,
      `PromptMate-${currentVersion}-arm64.zip`,
      `PromptMate-${currentVersion}-universal.zip`,
      `PromptMate-${currentVersion}.dmg`,
      `PromptMate-${currentVersion}.pkg`,
      `PromptMate-${currentVersion}.AppImage`,
      `PromptMate-${currentVersion}.deb`,
      `PromptMate-${currentVersion}.rpm`,
      'latest.yml',
      'latest-mac.yml',
      'latest-linux.yml'
    ];
    
    // 添加构建相关的最新文件（签名文件、配置文件等）
    // 这些文件通常是每次构建都会更新的
    const alwaysIncludePatterns = [
      /^[A-Fa-f0-9]{32,64}$/, // 哈希签名文件
      /^[A-Fa-f0-9]{32,64}\.pub$/, // 公钥文件
      /^latest.*\.yml$/, // 更新配置文件
    ];
    
    const files = fs.readdirSync(releaseDir);
    files.forEach(file => {
      // 检查是否应该排除这个文件
      const shouldExclude = excludePatterns.some(pattern => {
        if (pattern.startsWith('.')) {
          // 对于以点开头的模式，检查文件扩展名
          return file.endsWith(pattern);
        }
        return file === pattern || file.startsWith(pattern + '.');
      });
      
      if (shouldExclude) {
        console.log(`⏭️  跳过文件: ${file}`);
        return;
      }
      
      // 检查是否是当前版本的文件
      const isCurrentVersion = currentVersionPatterns.some(pattern => {
        return file === pattern;
      });
      
      // 检查是否是构建相关的通用文件（签名文件等）
      const isAlwaysInclude = alwaysIncludePatterns.some(pattern => {
        return pattern.test(file);
      });
      
      // 如果既不是当前版本的文件，也不是通用构建文件，跳过
      if (!isCurrentVersion && !isAlwaysInclude) {
        console.log(`⏭️  跳过旧版本文件: ${file}`);
        return;
      }
      
      const filePath = path.join(releaseDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile()) {
        artifacts.push({
          name: file,
          path: filePath,
          size: stats.size
        });
      }
    });
    
    if (artifacts.length === 0) {
      throw new Error('❌ 未找到当前版本的构建产物');
    }
    
    console.log(`📦 找到 ${artifacts.length} 个当前版本构建产物:`);
    artifacts.forEach(artifact => {
      console.log(`   - ${artifact.name} (${this.formatFileSize(artifact.size)})`);
    });
    
    return artifacts;
  }

  // 格式化文件大小
  formatFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // 创建GitHub Release
  async createGitHubRelease(version, artifacts) {
    console.log('🚀 创建GitHub Release...');
    
    const releaseData = {
      tag_name: `v${version}`,
      name: `PromptMate ${version}`,
      body: this.generateReleaseNotes(version),
      draft: false,
      prerelease: false
    };
    
    try {
      // 创建Release
      const createResponse = await this.githubApiRequest(
        `POST /repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases`,
        releaseData
      );
      
      const releaseId = createResponse.id;
      console.log(`✅ GitHub Release创建成功: ${createResponse.html_url}`);
      
      // 上传构建产物
      await this.uploadArtifacts(releaseId, artifacts);
      
      return createResponse;
    } catch (error) {
      throw new Error(`❌ 创建GitHub Release失败: ${error.message}`);
    }
  }

  // 上传构建产物
  async uploadArtifacts(releaseId, artifacts) {
    console.log('📤 上传构建产物...');
    
    for (const artifact of artifacts) {
      try {
        // GitHub 上传API需要使用uploads.github.com域名
        await this.uploadSingleAsset(releaseId, artifact);
        
        console.log(`✅ 上传成功: ${artifact.name}`);
      } catch (error) {
        console.error(`❌ 上传失败 ${artifact.name}: ${error.message}`);
      }
    }
  }

  // 上传单个文件
  async uploadSingleAsset(releaseId, artifact) {
    const fileContent = fs.readFileSync(artifact.path);
    
    const uploadUrl = `https://uploads.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/${releaseId}/assets?name=${encodeURIComponent(artifact.name)}`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileContent.length,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'PromptMate-Release-Manager'
      },
      body: fileContent
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub 上传API错误 (${response.status}): ${errorText}`);
    }
    
    return await response.json();
  }

  // GitHub API请求
  async githubApiRequest(endpoint, data = null, uploadData = null) {
    const url = `https://api.github.com${endpoint.replace(/^[A-Z]+ /, '')}`;
    const method = endpoint.split(' ')[0];
    
    const headers = {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'PromptMate-Release-Manager'
    };
    
    const options = {
      method,
      headers
    };
    
    let finalUrl = url;
    
    if (uploadData) {
      // 文件上传 - GitHub API v3 要求直接上传文件内容
      const fileContent = fs.readFileSync(uploadData.file);
      
      headers['Content-Type'] = 'application/octet-stream';
      headers['Content-Length'] = fileContent.length;
      
      options.body = fileContent;
      
      // 修改URL以包含文件名
      const urlObj = new URL(url);
      urlObj.searchParams.set('name', uploadData.name);
      finalUrl = urlObj.toString();
    } else if (data) {
      // JSON数据
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(finalUrl, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API错误 (${response.status}): ${errorText}`);
    }
    
    return await response.json();
  }

  // 生成发布说明
  generateReleaseNotes(version) {
    const changelogPath = path.join(__dirname, '../CHANGELOG.md');
    
    if (!fs.existsSync(changelogPath)) {
      return `## PromptMate ${version}\n\n自动发布版本`;
    }
    
    const changelog = fs.readFileSync(changelogPath, 'utf8');
    const lines = changelog.split('\n');
    
    // 查找当前版本的发布说明
    let startIndex = -1;
    let endIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`[${version}]`)) {
        startIndex = i;
        break;
      }
    }
    
    if (startIndex === -1) {
      return `## PromptMate ${version}\n\n自动发布版本`;
    }
    
    // 查找下一个版本或文件结尾
    for (let i = startIndex + 1; i < lines.length; i++) {
      if (lines[i].startsWith('## [')) {
        endIndex = i;
        break;
      }
    }
    
    if (endIndex === -1) {
      endIndex = lines.length;
    }
    
    const releaseNotes = lines.slice(startIndex, endIndex).join('\n');
    return releaseNotes;
  }

  // 推送Git标签
  pushGitTags() {
    console.log('🏷️  推送Git标签...');
    
    try {
      execSync('git push origin --tags', { stdio: 'inherit' });
      console.log('✅ Git标签推送成功');
    } catch (error) {
      // 如果推送失败，尝试强制推送
      console.warn('⚠️  标签推送失败，尝试强制推送...');
      try {
        execSync('git push origin --tags --force', { stdio: 'inherit' });
        console.log('✅ Git标签强制推送成功');
      } catch (forceError) {
        throw new Error(`❌ Git标签推送失败: ${forceError.message}`);
      }
    }
  }

  // 主发布流程
  async release(type = 'patch', platform = 'all') {
    console.log('🚀 开始自动化发布流程...\n');
    
    try {
      // 1. 检查环境
      this.checkEnvironment();
      
      // 2. 更新版本
      const newVersion = this.versionManager.run(type);
      
      // 3. 构建应用
      await this.buildApp(platform);
      
      // 4. 获取构建产物
      const artifacts = this.getBuildArtifacts(newVersion);
      
      // 5. 创建GitHub Release
      const release = await this.createGitHubRelease(newVersion, artifacts);
      
      // 6. 推送Git标签
      this.pushGitTags();
      
      console.log('\n🎉 发布完成!');
      console.log(`📋 版本: ${newVersion}`);
      console.log(`🌐 Release页面: ${release.html_url}`);
      console.log(`📦 构建产物: ${artifacts.length} 个文件`);
      
      return {
        version: newVersion,
        release: release,
        artifacts: artifacts
      };
      
    } catch (error) {
      console.error('\n❌ 发布失败:', error.message);
      process.exit(1);
    }
  }
}

// 命令行参数处理
function main() {
  const args = process.argv.slice(2);
  const type = args[0] || 'patch';
  const platform = args[1] || 'all';
  
  if (!['major', 'minor', 'patch'].includes(type)) {
    console.error('❌ 无效的版本类型。请使用: major, minor, 或 patch');
    process.exit(1);
  }
  
  if (!['all', 'win', 'mac'].includes(platform)) {
    console.error('❌ 无效的平台。请使用: all, win, 或 mac');
    process.exit(1);
  }
  
  const releaseManager = new ReleaseManager();
  releaseManager.release(type, platform);
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = ReleaseManager; 
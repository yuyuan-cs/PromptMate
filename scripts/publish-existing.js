#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 环境变量
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'yy0691';
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || 'PromptMate';

class PublishExistingManager {
  constructor() {
    this.versionManager = require('./version-manager.js');
  }

  // 检查环境
  checkEnvironment() {
    console.log('🔍 检查发布环境...');
    
    if (!GITHUB_TOKEN) {
      throw new Error('❌ 未设置GITHUB_TOKEN环境变量');
    }
    
    if (!fs.existsSync(path.join(__dirname, '../release'))) {
      throw new Error('❌ release目录不存在，请先构建应用');
    }
    
    console.log('✅ 环境检查通过');
  }

  // 获取已构建的产物
  getExistingArtifacts() {
    const releaseDir = path.join(__dirname, '../release');
    const artifacts = [];
    
    if (!fs.existsSync(releaseDir)) {
      throw new Error('❌ release目录不存在');
    }
    
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
      throw new Error('❌ 未找到可发布的构建产物');
    }
    
    console.log(`📦 找到 ${artifacts.length} 个构建产物:`);
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

  // 获取当前版本
  getCurrentVersion() {
    const packagePath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version;
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
        const uploadUrl = `POST /repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/${releaseId}/assets`;
        
        await this.githubApiRequest(uploadUrl, null, {
          name: artifact.name,
          file: artifact.path
        });
        
        console.log(`✅ 上传成功: ${artifact.name}`);
      } catch (error) {
        console.error(`❌ 上传失败 ${artifact.name}: ${error.message}`);
      }
    }
  }

  // GitHub API请求
  async githubApiRequest(endpoint, data = null, uploadData = null) {
    const url = `https://api.github.com${endpoint.replace(/^[A-Z]+ /, '')}`;
    const method = endpoint.split(' ')[0];
    
    const headers = {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'PromptMate-Publish-Manager'
    };
    
    const options = {
      method,
      headers
    };
    
    if (uploadData) {
      // 文件上传 - GitHub API v3 要求直接上传文件内容
      const fileContent = fs.readFileSync(uploadData.file);
      
      headers['Content-Type'] = 'application/octet-stream';
      headers['Content-Length'] = fileContent.length;
      
      options.body = fileContent;
      
      // 修改URL以包含文件名
      const urlObj = new URL(url);
      urlObj.searchParams.set('name', uploadData.name);
      url = urlObj.toString();
    } else if (data) {
      // JSON数据
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
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
      return `## PromptMate ${version}\n\n直接发布已构建的版本`;
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
      return `## PromptMate ${version}\n\n直接发布已构建的版本`;
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
      throw new Error(`❌ Git标签推送失败: ${error.message}`);
    }
  }

  // 主发布流程
  async publish() {
    console.log('🚀 开始发布已构建的版本...\n');
    
    try {
      // 1. 检查环境
      this.checkEnvironment();
      
      // 2. 获取当前版本
      const version = this.getCurrentVersion();
      console.log(`📋 当前版本: ${version}`);
      
      // 3. 获取已构建的产物
      const artifacts = this.getExistingArtifacts();
      
      // 4. 创建GitHub Release
      const release = await this.createGitHubRelease(version, artifacts);
      
      // 5. 推送Git标签
      this.pushGitTags();
      
      console.log('\n🎉 发布完成!');
      console.log(`📋 版本: ${version}`);
      console.log(`🌐 Release页面: ${release.html_url}`);
      console.log(`📦 构建产物: ${artifacts.length} 个文件`);
      
    } catch (error) {
      console.error(`\n❌ 发布失败: ${error.message}`);
      process.exit(1);
    }
  }
}

// 主函数
function main() {
  const publisher = new PublishExistingManager();
  publisher.publish();
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = PublishExistingManager; 
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// GitHub配置
const GITHUB_REPO_OWNER = 'yy0691';
const GITHUB_REPO_NAME = 'PromptMate';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

class AssetUploader {
  constructor() {
    if (!GITHUB_TOKEN) {
      throw new Error('❌ 未设置GITHUB_TOKEN环境变量');
    }
  }

  // 获取Release信息
  async getRelease(tagName) {
    console.log(`🔍 获取Release信息: ${tagName}`);
    
    const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/tags/${tagName}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'PromptMate-Asset-Uploader'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`获取Release失败 (${response.status}): ${errorText}`);
    }
    
    return await response.json();
  }

  // 上传单个文件
  async uploadAsset(releaseId, filePath, fileName) {
    console.log(`📤 上传文件: ${fileName}`);
    
    const fileContent = fs.readFileSync(filePath);
    const uploadUrl = `https://uploads.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/${releaseId}/assets?name=${encodeURIComponent(fileName)}`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileContent.length,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'PromptMate-Asset-Uploader'
      },
      body: fileContent
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`上传失败 (${response.status}): ${errorText}`);
    }
    
    return await response.json();
  }

  // 格式化文件大小
  formatFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // 主要上传流程
  async uploadToRelease(tagName, filesToUpload = null) {
    try {
      // 1. 获取Release信息
      const release = await this.getRelease(tagName);
      console.log(`✅ 找到Release: ${release.name} (ID: ${release.id})`);
      
      // 2. 获取要上传的文件
      const releaseDir = path.join(__dirname, '../release');
      if (!fs.existsSync(releaseDir)) {
        throw new Error('❌ 构建产物目录不存在');
      }
      
      // 只上传最新版本的可执行文件和重要文件
      const version = tagName.replace('v', '');
      const importantFiles = filesToUpload || [
        // Windows版本
        `PromptMate-${version}-x64.exe`,
        
        // Mac版本
        `PromptMate-${version}-x64.dmg`,
        `PromptMate-${version}-arm64.dmg`,
        `PromptMate-${version}-universal.dmg`,
        `PromptMate-${version}-x64.zip`,
        `PromptMate-${version}-arm64.zip`,
        `PromptMate-${version}-universal.zip`,
        
        // 更新配置文件
        'latest.yml',
        'latest-mac.yml'
      ];
      
      const existingFiles = fs.readdirSync(releaseDir);
      const filesToProcess = [];
      
      importantFiles.forEach(fileName => {
        if (existingFiles.includes(fileName)) {
          const filePath = path.join(releaseDir, fileName);
          const stats = fs.statSync(filePath);
          filesToProcess.push({
            name: fileName,
            path: filePath,
            size: stats.size
          });
        } else {
          console.warn(`⚠️  文件不存在: ${fileName}`);
        }
      });
      
      if (filesToProcess.length === 0) {
        throw new Error('❌ 没有找到要上传的文件');
      }
      
      console.log(`📦 准备上传 ${filesToProcess.length} 个文件:`);
      filesToProcess.forEach(file => {
        console.log(`   - ${file.name} (${this.formatFileSize(file.size)})`);
      });
      
      // 3. 上传文件
      let successCount = 0;
      for (const file of filesToProcess) {
        try {
          await this.uploadAsset(release.id, file.path, file.name);
          console.log(`✅ 上传成功: ${file.name}`);
          successCount++;
        } catch (error) {
          console.error(`❌ 上传失败 ${file.name}: ${error.message}`);
        }
      }
      
      console.log(`\n🎉 上传完成! 成功: ${successCount}/${filesToProcess.length}`);
      console.log(`🌐 Release页面: ${release.html_url}`);
      
    } catch (error) {
      console.error('\n❌ 上传失败:', error.message);
      process.exit(1);
    }
  }
}

// 命令行使用
async function main() {
  const args = process.argv.slice(2);
  const tagName = args[0] || 'v1.1.8';
  const filesToUpload = args.slice(1);
  
  console.log('🚀 开始上传构建产物到GitHub Release...\n');
  console.log(`📋 目标Release: ${tagName}`);
  
  if (filesToUpload.length > 0) {
    console.log(`📝 指定文件: ${filesToUpload.join(', ')}`);
  } else {
    console.log('📦 将上传所有平台的构建产物 (Windows + macOS)');
  }
  console.log('');
  
  const uploader = new AssetUploader();
  await uploader.uploadToRelease(tagName, filesToUpload.length > 0 ? filesToUpload : null);
}

if (require.main === module) {
  main();
}

module.exports = AssetUploader;

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 版本管理脚本
class VersionManager {
  constructor() {
    this.packageJsonPath = path.join(__dirname, '../package.json');
    this.packageJson = this.loadPackageJson();
  }

  // 加载package.json
  loadPackageJson() {
    try {
      const content = fs.readFileSync(this.packageJsonPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('读取package.json失败:', error);
      process.exit(1);
    }
  }

  // 保存package.json
  savePackageJson() {
    try {
      fs.writeFileSync(this.packageJsonPath, JSON.stringify(this.packageJson, null, 2) + '\n');
      console.log('✅ package.json已更新');
    } catch (error) {
      console.error('保存package.json失败:', error);
      process.exit(1);
    }
  }

  // 解析版本号
  parseVersion(version) {
    const parts = version.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0
    };
  }

  // 格式化版本号
  formatVersion(versionObj) {
    return `${versionObj.major}.${versionObj.minor}.${versionObj.patch}`;
  }

  // 更新版本号
  updateVersion(type = 'patch') {
    const currentVersion = this.packageJson.version;
    const versionObj = this.parseVersion(currentVersion);
    
    console.log(`📦 当前版本: ${currentVersion}`);
    
    switch (type) {
      case 'major':
        versionObj.major++;
        versionObj.minor = 0;
        versionObj.patch = 0;
        break;
      case 'minor':
        versionObj.minor++;
        versionObj.patch = 0;
        break;
      case 'patch':
      default:
        versionObj.patch++;
        break;
    }
    
    const newVersion = this.formatVersion(versionObj);
    this.packageJson.version = newVersion;
    
    console.log(`🚀 新版本: ${newVersion}`);
    return newVersion;
  }

  // 更新构建日期
  updateBuildDate() {
    const buildDate = new Date().toISOString();
    this.packageJson.buildDate = buildDate;
    console.log(`📅 构建日期: ${buildDate}`);
  }

  // 更新changelog
  updateChangelog(version, type) {
    const changelogPath = path.join(__dirname, '../CHANGELOG.md');
    const date = new Date().toLocaleDateString('zh-CN');
    
    const changelogEntry = `## [${version}] - ${date}

### ${this.getUpdateTypeDescription(type)}
- 自动版本更新

---

`;
    
    try {
      let changelog = '';
      if (fs.existsSync(changelogPath)) {
        changelog = fs.readFileSync(changelogPath, 'utf8');
      } else {
        changelog = `# Changelog

所有重要的更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

`;
      }
      
      // 在开头插入新版本
      const lines = changelog.split('\n');
      const insertIndex = lines.findIndex(line => line.startsWith('## [')) + 1;
      lines.splice(insertIndex, 0, changelogEntry);
      
      fs.writeFileSync(changelogPath, lines.join('\n'));
      console.log('📝 CHANGELOG.md已更新');
    } catch (error) {
      console.error('更新CHANGELOG.md失败:', error);
    }
  }

  // 获取更新类型描述
  getUpdateTypeDescription(type) {
    switch (type) {
      case 'major':
        return '重大更新';
      case 'minor':
        return '功能更新';
      case 'patch':
        return '补丁更新';
      default:
        return '更新';
    }
  }

  // 创建Git标签
  createGitTag(version) {
    const { execSync } = require('child_process');
    try {
      execSync(`git add .`);
      execSync(`git commit -m "chore: bump version to ${version}"`);
      execSync(`git tag -a v${version} -m "Release version ${version}"`);
      console.log(`🏷️  Git标签 v${version} 已创建`);
    } catch (error) {
      console.warn('⚠️  Git操作失败，请手动提交:', error.message);
    }
  }

  // 主函数
  run(type = 'patch') {
    console.log('🔄 开始版本更新...\n');
    
    // 更新版本号
    const newVersion = this.updateVersion(type);
    
    // 更新构建日期
    this.updateBuildDate();
    
    // 保存package.json
    this.savePackageJson();
    
    // 更新changelog
    this.updateChangelog(newVersion, type);
    
    // 创建Git标签
    this.createGitTag(newVersion);
    
    console.log('\n✅ 版本更新完成!');
    console.log(`📋 新版本: ${newVersion}`);
    console.log(`📦 类型: ${this.getUpdateTypeDescription(type)}`);
    
    return newVersion;
  }
}

// 命令行参数处理
function main() {
  const args = process.argv.slice(2);
  const type = args[0] || 'patch';
  
  if (!['major', 'minor', 'patch'].includes(type)) {
    console.error('❌ 无效的版本类型。请使用: major, minor, 或 patch');
    process.exit(1);
  }
  
  const versionManager = new VersionManager();
  versionManager.run(type);
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = VersionManager; 
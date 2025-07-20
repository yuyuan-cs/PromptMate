#!/usr/bin/env node

const { execSync } = require('child_process');
const VersionManager = require('./version-manager');

// 简化版发布脚本（跳过构建）
class SimpleRelease {
  constructor() {
    this.versionManager = new VersionManager();
  }

  // 检查环境
  checkEnvironment() {
    console.log('🔍 检查发布环境...');
    
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

  // 推送代码和标签
  pushToGitHub() {
    console.log('🚀 推送代码和标签到GitHub...');
    
    try {
      // 推送代码
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('✅ 代码推送成功');
      
      // 推送标签
      execSync('git push origin --tags', { stdio: 'inherit' });
      console.log('✅ 标签推送成功');
      
      console.log('🎉 发布流程完成！');
      console.log('📋 GitHub Actions将自动构建并创建Release');
      console.log('🌐 请访问: https://github.com/yy0691/PromptMate/releases');
      
    } catch (error) {
      throw new Error(`❌ 推送失败: ${error.message}`);
    }
  }

  // 主发布流程
  release(type = 'patch') {
    console.log('🚀 开始简化发布流程...\n');
    
    try {
      // 1. 检查环境
      this.checkEnvironment();
      
      // 2. 更新版本
      const newVersion = this.versionManager.run(type);
      
      // 3. 推送代码和标签
      this.pushToGitHub();
      
      console.log('\n🎉 简化发布完成!');
      console.log(`📋 版本: ${newVersion}`);
      console.log(`📦 类型: ${this.getUpdateTypeDescription(type)}`);
      console.log(`⏱️  等待GitHub Actions自动构建和发布...`);
      
      return {
        version: newVersion,
        type: type
      };
      
    } catch (error) {
      console.error('\n❌ 发布失败:', error.message);
      process.exit(1);
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
}

// 命令行参数处理
function main() {
  const args = process.argv.slice(2);
  const type = args[0] || 'patch';
  
  if (!['major', 'minor', 'patch'].includes(type)) {
    console.error('❌ 无效的版本类型。请使用: major, minor, 或 patch');
    process.exit(1);
  }
  
  const simpleRelease = new SimpleRelease();
  simpleRelease.release(type);
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = SimpleRelease; 
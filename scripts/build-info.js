#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 构建信息更新脚本
 * 用于在构建时自动更新版本信息和构建日期
 */

class BuildInfoManager {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.packageJsonPath = path.join(this.rootDir, 'package.json');
    this.packageJson = this.loadPackageJson();
  }

  // 加载package.json
  loadPackageJson() {
    try {
      const content = fs.readFileSync(this.packageJsonPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ 读取package.json失败:', error);
      process.exit(1);
    }
  }

  // 保存package.json
  savePackageJson() {
    try {
      fs.writeFileSync(this.packageJsonPath, JSON.stringify(this.packageJson, null, 2) + '\n');
      console.log('✅ package.json已更新');
    } catch (error) {
      console.error('❌ 保存package.json失败:', error);
      process.exit(1);
    }
  }

  // 更新构建信息
  updateBuildInfo() {
    console.log('🔧 开始更新构建信息...');
    
    // 更新构建日期
    const buildDate = new Date().toISOString();
    this.packageJson.buildDate = buildDate;
    console.log(`📅 构建日期: ${buildDate}`);
    
    // 验证版本号
    const version = this.packageJson.version;
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      console.warn(`⚠️  警告: 版本号格式可能无效: ${version}`);
    } else {
      console.log(`📦 当前版本: ${version}`);
    }
    
    // 保存更新
    this.savePackageJson();
    
    // 创建构建信息文件
    this.createBuildInfoFile();
    
    console.log('✅ 构建信息更新完成');
  }

  // 创建构建信息文件
  createBuildInfoFile() {
    try {
      const buildInfo = {
        version: this.packageJson.version,
        buildDate: this.packageJson.buildDate,
        buildTime: new Date().toISOString(),
        gitCommit: this.getGitCommitHash(),
        gitBranch: this.getGitBranch()
      };

      const buildInfoPath = path.join(this.rootDir, 'src', 'build-info.json');
      const buildInfoDir = path.dirname(buildInfoPath);
      
      // 确保目录存在
      if (!fs.existsSync(buildInfoDir)) {
        fs.mkdirSync(buildInfoDir, { recursive: true });
      }
      
      fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2) + '\n');
      console.log('✅ 构建信息文件已创建:', buildInfoPath);
      
      // 创建环境变量文件
      this.createEnvFile(buildInfo);
      
    } catch (error) {
      console.warn('⚠️  创建构建信息文件失败:', error);
    }
  }

  // 获取Git提交哈希
  getGitCommitHash() {
    try {
      const { execSync } = require('child_process');
      const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      return hash;
    } catch (error) {
      return 'unknown';
    }
  }

  // 获取Git分支
  getGitBranch() {
    try {
      const { execSync } = require('child_process');
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      return branch;
    } catch (error) {
      return 'unknown';
    }
  }

  // 创建环境变量文件
  createEnvFile(buildInfo) {
    try {
      const envContent = `# 构建时自动生成的环境变量
VITE_APP_VERSION=${buildInfo.version}
VITE_BUILD_DATE=${buildInfo.buildDate}
VITE_BUILD_TIME=${buildInfo.buildTime}
VITE_GIT_COMMIT=${buildInfo.gitCommit}
VITE_GIT_BRANCH=${buildInfo.gitBranch}
`;

      const envPath = path.join(this.rootDir, '.env.local');
      fs.writeFileSync(envPath, envContent);
      console.log('✅ 环境变量文件已创建:', envPath);
      
    } catch (error) {
      console.warn('⚠️  创建环境变量文件失败:', error);
    }
  }

  // 显示构建信息
  showBuildInfo() {
    console.log('\n📋 当前构建信息:');
    console.log(`   版本: ${this.packageJson.version}`);
    console.log(`   构建日期: ${this.packageJson.buildDate}`);
    console.log(`   Git提交: ${this.getGitCommitHash()}`);
    console.log(`   Git分支: ${this.getGitBranch()}`);
    console.log('');
  }
}

// 主函数
function main() {
  const manager = new BuildInfoManager();
  
  // 解析命令行参数
  const args = process.argv.slice(2);
  
  if (args.includes('--show') || args.includes('-s')) {
    manager.showBuildInfo();
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔧 构建信息管理工具

用法:
  node build-info.js [选项]

选项:
  --show, -s     显示当前构建信息
  --help, -h     显示帮助信息
  (无参数)       更新构建信息

示例:
  node build-info.js          # 更新构建信息
  node build-info.js --show   # 显示构建信息
  node build-info.js --help   # 显示帮助
`);
  } else {
    manager.updateBuildInfo();
    manager.showBuildInfo();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = BuildInfoManager; 
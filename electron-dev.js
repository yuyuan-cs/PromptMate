// 简单的启动脚本
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 创建dist-electron/main目录（如果不存在）
const mainDir = path.join(__dirname, 'dist-electron/main');
if (!fs.existsSync(mainDir)) {
  fs.mkdirSync(mainDir, { recursive: true });
}

// 复制主进程文件
fs.copyFileSync(
  path.join(__dirname, 'src/main/main.cjs'),
  path.join(__dirname, 'dist-electron/main/main.cjs')
);
fs.copyFileSync(
  path.join(__dirname, 'src/main/preload.cjs'),
  path.join(__dirname, 'dist-electron/main/preload.cjs')
);

console.log('已复制Electron文件到dist-electron/main目录');

// 启动开发服务器和Electron
try {
  console.log('启动开发环境...');
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('开发服务器启动失败:', error);
} 
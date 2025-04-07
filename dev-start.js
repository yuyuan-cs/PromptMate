const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const waitOn = require('wait-on');
const electron = require('electron');

// 设置环境变量
process.env.NODE_ENV = 'development';

// 创建dist-electron/main目录（如果不存在）
const mainDir = path.join(__dirname, 'dist-electron/main');
if (!fs.existsSync(mainDir)) {
  fs.mkdirSync(mainDir, { recursive: true });
}

// 复制主进程文件
fs.copyFileSync(
  path.join(__dirname, 'src/main/main.cjs'),
  path.join(mainDir, 'main.cjs')
);
fs.copyFileSync(
  path.join(__dirname, 'src/main/preload.cjs'),
  path.join(mainDir, 'preload.cjs')
);

console.log('已复制Electron文件到dist-electron/main目录');

// 启动Vite开发服务器
console.log('正在启动Vite开发服务器...');
const viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// 等待开发服务器启动
waitOn({
  resources: ['http-get://localhost:5173'],
  timeout: 30000,  // 30秒超时
  log: true
}).then(() => {
  console.log('Vite开发服务器已启动，正在启动Electron应用...');
  
  // 启动Electron应用
  const electronProcess = spawn(electron, ['.'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  });

  // 处理应用退出
  electronProcess.on('close', () => {
    viteProcess.kill();
    console.log('应用已关闭');
    process.exit();
  });
}).catch((err) => {
  console.error('等待开发服务器启动失败:', err);
  viteProcess.kill();
  process.exit(1);
});

// 处理终止信号
process.on('SIGINT', () => {
  viteProcess.kill();
  process.exit();
}); 
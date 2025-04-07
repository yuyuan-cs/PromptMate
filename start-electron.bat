@echo off
echo 正在启动PromptMate开发环境...

:: 创建必要的目录
mkdir dist-electron\main 2>nul

:: 复制主进程文件
copy src\main\main.cjs dist-electron\main\main.cjs
copy src\main\preload.cjs dist-electron\main\preload.cjs

echo 正在启动Vite开发服务器...
:: 在新的cmd窗口中启动Vite开发服务器
start cmd /k "npm run dev"

:: 等待开发服务器启动
echo 等待开发服务器启动（15秒）...
timeout /t 15

:: 设置开发环境变量
set NODE_ENV=development

:: 启动Electron应用
echo 正在启动Electron应用...
electron .

echo 应用已关闭。 
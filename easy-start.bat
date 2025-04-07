@echo off
echo 正在启动PromptMate开发环境...

:: 创建必要的目录
mkdir dist-electron\main 2>nul

:: 复制主进程文件
copy src\main\main.cjs dist-electron\main\main.cjs
copy src\main\preload.cjs dist-electron\main\preload.cjs

:: 运行npm脚本
echo 正在启动开发服务器和Electron应用...
npm run electron:dev 
@echo off
echo 正在构建和启动PromptMate应用...

:: 创建必要的目录
mkdir dist-electron\main 2>nul

:: 复制主进程文件
copy src\main\main.cjs dist-electron\main\main.cjs
copy src\main\preload.cjs dist-electron\main\preload.cjs

:: 设置开发环境变量
set NODE_ENV=development

:: 启动Electron应用
electron .

echo 应用已关闭。 
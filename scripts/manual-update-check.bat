@echo off
echo 正在检查 PromptMate 更新...
echo.

echo 1. 测试网络连接...
ping -n 1 github.com >nul 2>&1
if %errorlevel%==0 (
    echo    ✓ 网络连接正常
) else (
    echo    ✗ 网络连接失败
    echo    请检查网络设置
    pause
    exit /b 1
)

echo.
echo 2. 检查最新版本...
echo    当前版本: 1.1.0
echo    最新版本: 请访问 https://github.com/yy0691/PromptMate/releases/latest
echo.

echo 3. 解决建议:
echo    - 检查防火墙设置
echo    - 确认代理配置
echo    - 稍后重试更新检查
echo    - 手动下载最新版本
echo.

start https://github.com/yy0691/PromptMate/releases/latest
echo 已打开 GitHub 发布页面
pause

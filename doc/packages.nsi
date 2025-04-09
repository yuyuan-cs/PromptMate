; 定义安装程序名称和版本
Name "PromptMate"
OutFile "PromptMate_Setup.exe"

; 设置安装目录
InstallDir "$PROGRAMFILES\PromptMate"

; 添加文件
Section
    SetOutPath "$INSTDIR"
    File /r "F:\Blog2025\PromptMate\PromptMate-win32-x64"
SectionEnd

; 添加卸载功能
Section "Uninstall"
    RMDir /r "$INSTDIR"
SectionEnd
# NSIS Installer Script for PromptMate
# 支持自定义安装路径和数据目录

!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "WinVer.nsh"
!include "x64.nsh"

# 多语言支持
!include "installer-zh.nsh"
!include "installer-en.nsh"

# 现代UI设置
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\win.bmp"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\win.bmp"

# 界面定制
!define MUI_WELCOMEPAGE_TITLE "欢迎安装 PromptMate"
!define MUI_WELCOMEPAGE_TEXT "PromptMate 是一个强大的提示词管理工具，帮助您更好地组织和使用 AI 提示词。$\r$\n$\r$\n本安装向导将指导您完成安装过程。"
!define MUI_FINISHPAGE_TITLE "安装完成"
!define MUI_FINISHPAGE_TEXT "PromptMate 已成功安装到您的计算机。"
!define MUI_FINISHPAGE_RUN "$INSTDIR\PromptMate.exe"
!define MUI_FINISHPAGE_RUN_TEXT "立即运行 PromptMate"

# 定义变量
Var DataDir
Var CustomDataDir
Var InstallChoice

# 页面定义
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE
Page custom InstallTypePage InstallTypePageLeave
Page custom DataDirPage DataDirPageLeave
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

# 卸载页面
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

# 安装类型选择页面
Function InstallTypePage
  !insertmacro MUI_HEADER_TEXT $(INSTALL_TYPE_TITLE) $(INSTALL_TYPE_SUBTITLE)
  
  nsDialogs::Create 1018
  Pop $0
  
  ${If} $0 == error
    Abort
  ${EndIf}
  
  # 标准安装选项
  ${NSD_CreateRadioButton} 10 20 280 12 $(INSTALL_TYPE_STANDARD)
  Pop $1
  ${NSD_Check} $1
  ${NSD_CreateLabel} 30 35 260 20 $(INSTALL_TYPE_STANDARD_DESC)
  Pop $2
  
  # 自定义安装选项
  ${NSD_CreateRadioButton} 10 60 280 12 $(INSTALL_TYPE_CUSTOM)
  Pop $3
  ${NSD_CreateLabel} 30 75 260 20 $(INSTALL_TYPE_CUSTOM_DESC)
  Pop $4
  
  # 便携安装选项
  ${NSD_CreateRadioButton} 10 100 280 12 $(INSTALL_TYPE_PORTABLE)
  Pop $5
  ${NSD_CreateLabel} 30 115 260 20 $(INSTALL_TYPE_PORTABLE_DESC)
  Pop $6
  
  nsDialogs::Show
FunctionEnd

# 安装类型页面离开时的处理
Function InstallTypePageLeave
  ${NSD_GetState} $1 $0
  ${If} $0 == ${BST_CHECKED}
    StrCpy $InstallChoice "standard"
  ${Else}
    ${NSD_GetState} $3 $0
    ${If} $0 == ${BST_CHECKED}
      StrCpy $InstallChoice "custom"
    ${Else}
      StrCpy $InstallChoice "portable"
    ${EndIf}
  ${EndIf}
FunctionEnd

# 数据目录选择页面
Function DataDirPage
  !insertmacro MUI_HEADER_TEXT "数据目录设置" "请选择 PromptMate 数据保存位置"
  
  nsDialogs::Create 1018
  Pop $0
  
  ${If} $0 == error
    Abort
  ${EndIf}
  
  # 创建单选按钮
  ${NSD_CreateRadioButton} 10 20 280 12 "使用默认位置 (%APPDATA%\PromptMate)"
  Pop $1
  ${NSD_Check} $1
  
  ${NSD_CreateRadioButton} 10 40 280 12 "自定义数据目录"
  Pop $2
  
  # 自定义路径输入框
  ${NSD_CreateText} 30 60 200 12 "$APPDATA\PromptMate"
  Pop $3
  
  # 浏览按钮
  ${NSD_CreateButton} 240 58 50 16 "浏览..."
  Pop $4
  ${NSD_OnClick} $4 BrowseDataDir
  
  # 注意文本
  ${NSD_CreateLabel} 10 90 280 30 "注意：选择自定义目录后，请确保该位置有足够的磁盘空间。数据目录将用于存储您的提示词、设置和其他应用数据。"
  Pop $5
  
  nsDialogs::Show
FunctionEnd

# 浏览数据目录
Function BrowseDataDir
  nsDialogs::SelectFolderDialog "选择数据保存目录" "$APPDATA"
  Pop $0
  ${If} $0 != error
    ${NSD_SetText} $3 "$0\PromptMate"
  ${EndIf}
FunctionEnd

# 数据目录页面离开时的处理
Function DataDirPageLeave
  ${NSD_GetState} $1 $0
  ${If} $0 == ${BST_CHECKED}
    StrCpy $CustomDataDir "$APPDATA\PromptMate"
  ${Else}
    ${NSD_GetText} $3 $CustomDataDir
  ${EndIf}
FunctionEnd

# 安装完成后的处理
Function .onInstSuccess
  # 写入数据目录配置到注册表
  WriteRegStr HKCU "Software\PromptMate" "DataDirectory" "$CustomDataDir"
  
  # 创建数据目录
  CreateDirectory "$CustomDataDir"
  CreateDirectory "$CustomDataDir\config"
  CreateDirectory "$CustomDataDir\backups"
  
  # 如果旧的数据目录存在，询问是否迁移
  ${If} ${FileExists} "$APPDATA\PromptMate\config\prompts.json"
  ${AndIf} "$CustomDataDir" != "$APPDATA\PromptMate"
    MessageBox MB_YESNO "检测到现有的用户数据，是否迁移到新的数据目录？" IDYES migrate IDNO nomigrate
    migrate:
      CopyFiles /SILENT "$APPDATA\PromptMate\*.*" "$CustomDataDir"
      MessageBox MB_OK "数据迁移完成！"
    nomigrate:
  ${EndIf}
FunctionEnd

# 卸载时保留数据选项
Function un.onInit
  MessageBox MB_YESNO "是否同时删除所有用户数据？$\n$\n选择"否"将保留您的提示词和设置。" IDYES delete IDNO keep
  delete:
    # 读取数据目录位置
    ReadRegStr $DataDir HKCU "Software\PromptMate" "DataDirectory"
    ${If} $DataDir != ""
      RMDir /r "$DataDir"
    ${EndIf}
    RMDir /r "$APPDATA\PromptMate"
  keep:
FunctionEnd

# 更新检查
!macro CheckForUpdate
  # 检查是否为更新安装
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${INSTALL_REGISTRY_KEY}}" "UninstallString"
  ${If} $0 != ""
    MessageBox MB_YESNO "检测到 PromptMate 已安装。是否要更新到新版本？$\n$\n注意：更新过程中将保留您的所有数据。" IDYES update IDNO cancel
    update:
      # 静默卸载旧版本，保留数据
      ExecWait '"$0" /S _?=$INSTDIR'
      Goto continue
    cancel:
      Abort
    continue:
  ${EndIf}
!macroend

# 主安装函数中调用更新检查
Function .onInit
  !insertmacro CheckForUpdate
FunctionEnd

# 添加自定义字符串（多语言支持）
LangString DESC_Section1 ${LANG_SIMPCHINESE} "PromptMate 主程序文件"
LangString DESC_Section1 ${LANG_ENGLISH} "PromptMate main program files"

LangString WELCOME_TEXT ${LANG_SIMPCHINESE} "欢迎使用 PromptMate 安装向导！$\r$\n$\r$\nPromptMate 是一个强大的提示词管理工具，帮助您更好地组织和使用 AI 提示词。"
LangString WELCOME_TEXT ${LANG_ENGLISH} "Welcome to PromptMate Setup Wizard!$\r$\n$\r$\nPromptMate is a powerful prompt management tool that helps you organize and use AI prompts more effectively."

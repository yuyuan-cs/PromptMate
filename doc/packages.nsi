; ���尲װ�������ƺͰ汾
Name "PromptMate"
OutFile "PromptMate_Setup.exe"

; ���ð�װĿ¼
InstallDir "$PROGRAMFILES\PromptMate"

; ����ļ�
Section
    SetOutPath "$INSTDIR"
    File /r "F:\Blog2025\PromptMate\PromptMate-win32-x64"
SectionEnd

; ���ж�ع���
Section "Uninstall"
    RMDir /r "$INSTDIR"
SectionEnd
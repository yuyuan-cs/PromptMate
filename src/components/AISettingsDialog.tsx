import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AISettings } from "./AISettings";
import { useTranslation } from "react-i18next";

interface AISettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * AI设置对话框组件
 * 提供AI服务配置的弹窗界面
 */
export const AISettingsDialog: React.FC<AISettingsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-[90vw] h-[90vh] flex flex-col p-0">
        <div className="flex-shrink-0 p-6 pb-0">
          <DialogHeader>
            <DialogTitle>{t('ai_settings.title')}</DialogTitle>
            <DialogDescription>
              {t('ai_settings.description')}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <AISettings />
        </div>
        
        <div className="flex-shrink-0 h-6"></div>
      </DialogContent>
    </Dialog>
  );
};

export default AISettingsDialog;

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AISettings } from "./AISettings";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>AI设置</DialogTitle>
          <DialogDescription>
            配置您的AI服务提供商和API密钥，以启用提示词优化和生成功能
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <AISettings />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AISettingsDialog;

import React, { useState, useCallback } from 'react';
import { SidebarAlert, SidebarAlertProps } from '../components/ui/sidebar-alert';

interface AlertConfig {
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const useSidebarAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
    setIsOpen(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsOpen(false);
    setAlertConfig(null);
  }, []);

  const showError = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({
      title,
      message,
      type: 'error',
      confirmText: '确定',
      onConfirm
    });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({
      title,
      message,
      type: 'warning',
      confirmText: '确定',
      onConfirm
    });
  }, [showAlert]);

  const showSuccess = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({
      title,
      message,
      type: 'success',
      confirmText: '确定',
      onConfirm
    });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({
      title,
      message,
      type: 'info',
      confirmText: '确定',
      onConfirm
    });
  }, [showAlert]);

  const showConfirm = useCallback((
    title: string, 
    message: string, 
    onConfirm?: () => void, 
    onCancel?: () => void,
    confirmText = '确定',
    cancelText = '取消'
  ) => {
    showAlert({
      title,
      message,
      type: 'warning',
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
      showCancel: true
    });
  }, [showAlert]);

  const AlertComponent = useCallback(() => {
    if (!alertConfig) return null;

    return (
      <SidebarAlert
        open={isOpen}
        onOpenChange={setIsOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        showCancel={alertConfig.showCancel}
      />
    );
  }, [alertConfig, isOpen]);

  return {
    showAlert,
    showError,
    showWarning,
    showSuccess,
    showInfo,
    showConfirm,
    hideAlert,
    AlertComponent
  };
};

import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Button } from './button';

export interface SidebarAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const SidebarAlert: React.FC<SidebarAlertProps> = ({
  open,
  onOpenChange,
  title,
  message,
  type = 'info',
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
  showCancel = false
}) => {
  if (!open) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'error':
        return 'border-red-200';
      case 'warning':
        return 'border-yellow-200';
      case 'success':
        return 'border-green-200';
      default:
        return 'border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`extension-dialog bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border-2 ${getBorderColor()}`}>
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          {getIcon()}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-700 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          {showCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800"
            >
              {cancelText}
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleConfirm}
            className={`${
              type === 'error' 
                ? 'bg-red-500 hover:bg-red-600' 
                : type === 'warning'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : type === 'success'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

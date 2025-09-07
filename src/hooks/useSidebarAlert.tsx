import React, { useCallback, useState, useRef } from 'react';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from '@/components/ui/alert-dialog';

// Keep the state interface simple, callbacks are handled by a ref.
interface AlertState {
  open: boolean;
  title?: string;
  message?: string;
  mode: 'alert' | 'confirm';
  confirmText?: string;
  cancelText?: string;
}

export function useSidebarAlert() {
  const [state, setState] = useState<AlertState>({ open: false, mode: 'alert' });
  
  // Use a ref to hold the latest callbacks to avoid stale closures.
  const callbacks = useRef<{ onConfirm?: () => void; onCancel?: () => void; }>();

  const showAlert = useCallback((message: string, title = '提示', onConfirm?: () => void, confirmText = '确定') => {
    callbacks.current = { onConfirm };
    setState({ open: true, mode: 'alert', message, title, confirmText });
  }, []);

  const showConfirm = useCallback(
    (
      message: string,
      title = '确认',
      onConfirm?: () => void,
      onCancel?: () => void,
      confirmText = '确定',
      cancelText = '取消'
    ) => {
      callbacks.current = { onConfirm, onCancel };
      setState({ open: true, mode: 'confirm', message, title, confirmText, cancelText });
    },
    []
  );

  const close = () => {
    setState(prev => ({ ...prev, open: false }));
    // 清空回调，防止重复触发
    callbacks.current = undefined;
  };

  const handleConfirm = () => {
    console.log('[useSidebarAlert] handleConfirm called');
    const confirmCallback = callbacks.current?.onConfirm;
    console.log('[useSidebarAlert] confirmCallback exists:', !!confirmCallback);
    close();
    // 在关闭后延迟触发回调，防止状态冲突
    setTimeout(() => {
      console.log('[useSidebarAlert] executing confirmCallback');
      confirmCallback?.();
    }, 0);
  };

  const handleCancel = () => {
    console.log('[useSidebarAlert] handleCancel called');
    const cancelCallback = callbacks.current?.onCancel;
    console.log('[useSidebarAlert] cancelCallback exists:', !!cancelCallback);
    close();
    // 在关闭后延迟触发回调，防止状态冲突
    setTimeout(() => {
      console.log('[useSidebarAlert] executing cancelCallback');
      cancelCallback?.();
    }, 0);
  };

  const AlertComponent: React.FC = () => {
    return (
      <AlertDialog 
        open={state.open} 
        onOpenChange={(open) => {
          // 只在未手动关闭时才触发取消操作
          if (!open && state.open) {
            // 使用直接关闭，不触发取消回调，防止闪烁
            close();
          }
        }}
      >
        <AlertDialogContent>
          {state.title && (
            <AlertDialogHeader>
              <AlertDialogTitle>{state.title}</AlertDialogTitle>
              {state.message && <AlertDialogDescription>{state.message}</AlertDialogDescription>}
            </AlertDialogHeader>
          )}
          {!state.title && state.message && (
            <div className="text-sm text-muted-foreground">{state.message}</div>
          )}
          <AlertDialogFooter>
            {state.mode === 'confirm' && (
              <AlertDialogCancel 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCancel();
                }}
              >
                {state.cancelText || '取消'}
              </AlertDialogCancel>
            )}
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleConfirm();
              }}
            >
              {state.confirmText || '确定'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return { showAlert, showConfirm, AlertComponent };
}
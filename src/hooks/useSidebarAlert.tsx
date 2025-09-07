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
  }

  const handleConfirm = () => {
    const confirmCallback = callbacks.current?.onConfirm;
    close();
    confirmCallback?.();
  };

  const handleCancel = () => {
    const cancelCallback = callbacks.current?.onCancel;
    close();
    cancelCallback?.();
  };

  const AlertComponent: React.FC = () => {
    return (
      <AlertDialog open={state.open} onOpenChange={(open) => {
        if (!open) {
          // If closing via overlay click or escape key, treat as cancel.
          handleCancel();
        }
      }}>
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
              <AlertDialogCancel onClick={handleCancel}>
                {state.cancelText || '取消'}
              </AlertDialogCancel>
            )}
            <AlertDialogAction onClick={handleConfirm}>
              {state.confirmText || '确定'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return { showAlert, showConfirm, AlertComponent };
}
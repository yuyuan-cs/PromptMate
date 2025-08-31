import React, { useCallback, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AlertState {
  open: boolean;
  title?: string;
  message?: string;
  mode: 'alert' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useSidebarAlert() {
  const [state, setState] = useState<AlertState>({ open: false, mode: 'alert' });

  const showAlert = useCallback((message: string, title = '提示', onConfirm?: () => void, confirmText = '确定') => {
    setState({ open: true, mode: 'alert', message, title, onConfirm, confirmText });
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
      setState({ open: true, mode: 'confirm', message, title, onConfirm, onCancel, confirmText, cancelText });
    },
    []
  );

  const close = () => setState(prev => ({ ...prev, open: false }));

  const AlertComponent: React.FC = () => (
    <Dialog open={state.open} onOpenChange={(o) => !o && close()}>
      <DialogContent>
        {state.title && (
          <DialogHeader>
            <DialogTitle>{state.title}</DialogTitle>
            {state.message && <DialogDescription>{state.message}</DialogDescription>}
          </DialogHeader>
        )}
        {!state.title && state.message && (
          <div className="text-sm text-muted-foreground">{state.message}</div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          {state.mode === 'confirm' && (
            <Button
              variant="outline"
              onClick={() => {
                close();
                state.onCancel?.();
              }}
            >
              {state.cancelText || '取消'}
            </Button>
          )}
          <Button
            onClick={() => {
              close();
              state.onConfirm?.();
            }}
          >
            {state.confirmText || '确定'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return { showAlert, showConfirm, AlertComponent };
}

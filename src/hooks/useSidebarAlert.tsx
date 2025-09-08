import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import React, { useState, useCallback } from 'react';

// ✅ FIX: Include optional callbacks directly in the state type.
// This keeps all related data for a single alert action together.
interface AlertState {
  open: boolean;
  title: string;
  message: string;
  mode: 'alert' | 'confirm';
  confirmText: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// Define a partial initial state to avoid repetition.
const initialState: Omit<AlertState, 'open'> = {
  title: '',
  message: '',
  mode: 'alert',
  confirmText: 'OK',
};

export function useSidebarAlert() {
  // The state now holds everything, or is null when closed.
  const [state, setState] = useState<AlertState | null>(null);

  // ✅ FIX: This function now simply sets the state directly.
  // No more setTimeout or useRef. The logic is clean and synchronous.
  const showConfirm = useCallback(
    (
      message: string,
      title = 'Confirm',
      onConfirm?: () => void,
      onCancel?: () => void,
      confirmText = 'Confirm',
      cancelText = 'Cancel'
    ) => {
      console.log('[useSidebarAlert] showConfirm called');
      setState({
        open: true,
        mode: 'confirm',
        message,
        title,
        onConfirm,
        onCancel,
        confirmText,
        cancelText,
      });
    },
    [] // Empty dependency array ensures this function's reference is stable.
  );

  // ✅ FIX: showAlert is also simplified.
  const showAlert = useCallback((message: string, title = 'Alert', onConfirm?: () => void, confirmText = 'OK') => {
    setState({
      open: true,
      mode: 'alert',
      message,
      title,
      onConfirm,
      confirmText,
    });
  }, []);
  
  // ✅ FIX: A single, clean function to close the dialog.
  const handleClose = useCallback(() => {
    setState(null);
  }, []);

  // ✅ FIX: Handler logic is simpler. It calls the callback from state, then closes.
  const handleConfirm = useCallback(() => {
    if (state?.onConfirm) {
      state.onConfirm();
    }
    handleClose();
  }, [state, handleClose]);

  const handleCancel = useCallback(() => {
    if (state?.onCancel) {
      state.onCancel();
    }
    handleClose();
  }, [state, handleClose]);

  // ✅ FIX: The entire component definition is wrapped in useCallback.
  // This memoizes the component itself, making it stable across renders
  // unless its dependencies (state, handlers) change.
  const AlertComponent = useCallback(() => {
    if (!state) {
      return null;
    }

    return (
      <AlertDialog
        open={state.open}
        onOpenChange={(isOpen) => {
          // If the dialog is closed by clicking outside or pressing Escape,
          // trigger the cancel action.
          if (!isOpen) {
            handleCancel();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{state.title}</AlertDialogTitle>
            <AlertDialogDescription>{state.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {state.mode === 'confirm' && (
              <AlertDialogCancel onClick={handleCancel}>
                {state.cancelText}
              </AlertDialogCancel>
            )}
            <AlertDialogAction onClick={handleConfirm}>
              {state.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }, [state, handleConfirm, handleCancel]);

  return { 
    showAlert, 
    showConfirm, 
    AlertComponent,
    // You can optionally expose the open state if needed elsewhere
    isAlertOpen: state?.open ?? false 
  };
}
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TagDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tagName: string;
  affectedPromptsCount: number;
}

export const TagDeleteDialog: React.FC<TagDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tagName,
  affectedPromptsCount,
}) => {
  const { t } = useTranslation();
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-left">{t('tagDeleteDialog.deleteTag')}</DialogTitle>
              <DialogDescription className="text-left">
                {t('tagDeleteDialog.irreversible')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{t('tagDeleteDialog.tagName')}</span>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium">
              {tagName}
            </span>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p className="text-muted-foreground">
              {t('tagDeleteDialog.deleteWillCause')}
            </p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                {t('tagDeleteDialog.removeFromPrompts')} <span className="font-medium text-foreground">{affectedPromptsCount}</span> {t('tagDeleteDialog.promptsCount')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                {t('tagDeleteDialog.cannotRecover')}
              </li>
            </ul>
          </div>
          
          <p className="text-sm text-muted-foreground mt-3">
            {t('tagDeleteDialog.confirmDelete')} <span className="font-medium text-foreground">"{tagName}"</span>?
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {t('tagDeleteDialog.confirmDeleteButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import * as React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import { Prompt, Category } from '../shared/types';
import { PromptEditView } from './PromptEditView';

interface PromptEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt?: Prompt | null;
  categories: Category[];
  onSave: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Prompt>) => Promise<void>;
}

export const PromptEditDialog: React.FC<PromptEditDialogProps> = ({
  open,
  onOpenChange,
  prompt,
  categories,
  onSave,
  onUpdate
}) => {
  const isEdit = Boolean(prompt);

  const handleBack = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>
            {isEdit ? '编辑提示词' : '新建提示词'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? '修改提示词的内容和属性' : '创建一个新的提示词模板'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-hidden">
          <PromptEditView
            prompt={prompt}
            categories={categories}
            onSave={onSave}
            onUpdate={onUpdate}
            onBack={handleBack}
            onClose={handleBack} // Also wiring up onClose to close the dialog
            showCloseButton={false} // Hide close button in view, dialog has its own
            showBackButton={true} // Show back button to act as cancel
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};


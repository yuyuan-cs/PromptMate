import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PromptEditorDialog } from "./PromptEditorDialog";
import { Prompt } from "@/types";
import { PromptEditorOptions } from "@/hooks/usePromptEditor";

interface QuickPromptEditorProps {
  prompt: Prompt | null;
  variant?: "button" | "icon" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  options?: Omit<PromptEditorOptions, 'prompt'>;
  disabled?: boolean;
}

export const QuickPromptEditor: React.FC<QuickPromptEditorProps> = ({
  prompt,
  variant = "icon",
  size = "sm",
  className = "",
  children,
  options = {},
  disabled = false,
}) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleOpenDialog = () => {
    if (prompt && !disabled) {
      setShowDialog(true);
    }
  };

  const renderTrigger = () => {
    switch (variant) {
      case "button":
        return (
          <Button
            variant="outline"
            size={size}
            onClick={handleOpenDialog}
            disabled={disabled || !prompt}
            className={className}
          >
            <Edit className="h-4 w-4 mr-2" />
            {children || "编辑"}
          </Button>
        );
      
      case "ghost":
        return (
          <Button
            variant="ghost"
            size={size}
            onClick={handleOpenDialog}
            disabled={disabled || !prompt}
            className={className}
          >
            <Edit className="h-4 w-4 mr-2" />
            {children || "编辑"}
          </Button>
        );
      
      case "icon":
      default:
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={size}
                  onClick={handleOpenDialog}
                  disabled={disabled || !prompt}
                  className={className}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {children || "编辑提示词"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
    }
  };

  return (
    <>
      {renderTrigger()}
      
      {prompt && (
        <PromptEditorDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          prompt={prompt}
          options={{
            ...options,
            onSave: (updatedPrompt) => {
              setShowDialog(false);
              if (options.onSave) {
                options.onSave(updatedPrompt);
              }
            },
            onDelete: (promptId) => {
              setShowDialog(false);
              if (options.onDelete) {
                options.onDelete(promptId);
              }
            },
          }}
        />
      )}
    </>
  );
};

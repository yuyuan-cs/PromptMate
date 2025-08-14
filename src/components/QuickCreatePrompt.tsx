import React from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useCreatePrompt, CreatePromptOptions } from "@/hooks/useCreatePrompt";
import { CreatePromptDialog } from "@/components/CreatePromptDialog";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ContextMenuItem } from "@/components/ui/context-menu";

interface QuickCreatePromptProps {
  variant?: "button" | "icon" | "fab" | "menu-item";
  size?: "sm" | "default" | "lg";
  className?: string;
  options?: CreatePromptOptions;
  showMarkdownPreview?: boolean;
  showImageUpload?: boolean;
  showTagSuggestions?: boolean;
  children?: React.ReactNode;
  tooltip?: string;
}

/**
 * 快速新建提示词组件
 * 提供多种样式的触发按钮和统一的创建对话框
 */
export const QuickCreatePrompt: React.FC<QuickCreatePromptProps> = ({
  variant = "button",
  size = "default",
  className,
  options,
  showMarkdownPreview = true,
  showImageUpload = true,
  showTagSuggestions = true,
  children,
  tooltip = "新建提示词",
}) => {
  const [showDialog, setShowDialog] = useState(false);

  const renderTrigger = () => {
    const baseProps = {
      onClick: () => setShowDialog(true),
      className: cn(className),
    };

    switch (variant) {
      case "icon":
        return (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  {...baseProps}
                  className={cn(
                    "rounded-full h-8 w-8 hover:scale-95 transition-transform",
                    className
                  )}
                >
                  <Icons.plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );

      case "fab":
        return (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  {...baseProps}
                  className={cn(
                    "rounded-full h-12 w-12 bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all",
                    className
                  )}
                >
                  <Icons.plus className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );

      case "menu-item":
        return (
          <ContextMenuItem
            onClick={() => setShowDialog(true)}
            className={cn(className)}
          >
            <Icons.plus className="h-4 w-4 mr-2" />
            {children || "新建提示词"}
          </ContextMenuItem>
        );

      case "button":
      default:
        return (
          <Button
            variant="default"
            size={size}
            {...baseProps}
          >
            <Icons.plus className="h-4 w-4 mr-2" />
            {children || "新建提示词"}
          </Button>
        );
    }
  };

  return (
    <>
      {renderTrigger()}
      <CreatePromptDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        options={options}
        showMarkdownPreview={showMarkdownPreview}
        showImageUpload={showImageUpload}
        showTagSuggestions={showTagSuggestions}
      />
    </>
  );
};

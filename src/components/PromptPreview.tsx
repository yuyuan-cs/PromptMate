import React, { useState } from "react";
import ReactMarkdown from 'react-markdown';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Prompt } from "@/types";
import { VariableDisplay } from "./VariableHighlighter";
import { VariableForm } from "./VariableForm";
import { applyVariableValues } from "@/lib/variableUtils";

interface PromptPreviewProps {
  prompt: Prompt;
  className?: string;
  showVariableForm: boolean;
  variableValues: Record<string, string>;
  onVariableChange: (values: Record<string, string>) => void;
  onPreviewChange: (content: string) => void;
}

export const PromptPreview: React.FC<PromptPreviewProps> = ({
  prompt,
  className = "",
  showVariableForm,
  variableValues,
  onVariableChange,
  onPreviewChange,
}) => {
  // 计算预览内容
  const previewContent = variableValues && Object.keys(variableValues).length > 0
    ? applyVariableValues(prompt.content, variableValues)
    : prompt.content;

  // 确保 variableValues 有默认值
  const safeVariableValues = variableValues || {};

  return (
    <div className={`space-y-4 ${className}`}>
      

      {/* 变量填写表单 */}
      {showVariableForm && (
        <div className="bg-muted/30 rounded-md p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">变量填写</h3>
            <div className="text-xs text-muted-foreground">
              填写变量后，下方将显示最终预览效果
            </div>
          </div>
          
          <VariableForm
            content={prompt.content}
            onVariableChange={onVariableChange}
            onPreviewChange={onPreviewChange}
          />
        </div>
      )}
      
      {/* 内容预览区域 */}
      <div className="bg-muted/30 rounded-md p-4 space-y-4">
        <div className="flex items-center justify-between">
          
          <h3 className="text-sm font-medium">
            {Object.keys(safeVariableValues).length > 0 ? "最终预览" : "原始内容"}
          </h3>
          {Object.keys(safeVariableValues).length > 0 && (
            <div className="text-xs text-muted-foreground">
              已填写 {Object.keys(safeVariableValues).length} 个变量
            </div>
          )}
        </div>

        {/* 原始内容（带变量高亮） */}
        {!Object.keys(safeVariableValues).length && (
          <div className="space-y-3">
            {/* <div className="text-xs text-muted-foreground">变量占位符高亮显示：</div> */}
            <VariableDisplay
              content={prompt.content}
              showVariableCount={true}
            />
          </div>
        )}

        {/* 最终预览内容 */}
        {Object.keys(safeVariableValues).length > 0 && (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">变量替换后的最终内容：</div>
            <div className="markdown-body">
              <ReactMarkdown>{previewContent}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

    

      
      
      {/* 图片预览区域 */}
      {prompt.images && prompt.images.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">参考图片</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {prompt.images.map((image, index) => (
              <Popover key={image.id}>
                <PopoverTrigger asChild>
                  <div className="border rounded-md overflow-hidden cursor-pointer hover:opacity-90">
                    <img 
                      src={image.data} 
                      alt={image.caption || `图片 ${index + 1}`} 
                      className="w-full h-28 object-cover"
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-2 max-w-xs">
                  <img 
                    src={image.data} 
                    alt={image.caption || `图片 ${index + 1}`} 
                    className="w-full mb-2 rounded" 
                  />
                  <div className="text-xs text-muted-foreground">
                    {image.caption || "无说明"}
                  </div>
                </PopoverContent>
              </Popover>
            ))}
          </div>
        </div>
      )}
      
      {/* 标签显示 */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {prompt.tags.map((tag) => (
            <div
              key={tag}
              className="bg-muted/80 text-muted-foreground px-1.5 py-0.5 rounded-md text-[10px] font-normal"
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

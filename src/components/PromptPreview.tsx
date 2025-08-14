import React from "react";
import ReactMarkdown from 'react-markdown';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Prompt } from "@/types";

interface PromptPreviewProps {
  prompt: Prompt;
  className?: string;
}

export const PromptPreview: React.FC<PromptPreviewProps> = ({
  prompt,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Markdown 内容预览 */}
      <div className="bg-muted/30 rounded-md p-4 markdown-body">
        <ReactMarkdown>{prompt.content}</ReactMarkdown>
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

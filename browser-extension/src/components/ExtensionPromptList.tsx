import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { Prompt } from '../shared/types';

interface ExtensionPromptListProps {
  prompts: Prompt[];
  onUsePrompt: (prompt: Prompt) => void;
  onCopyPrompt: (content: string) => void;
  onToggleFavorite: (promptId: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function ExtensionPromptList({
  prompts,
  onUsePrompt,
  onCopyPrompt,
  onToggleFavorite,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}: ExtensionPromptListProps) {
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 获取所有分类
  const categories = useMemo(() => {
    const cats = Array.from(new Set(prompts.map(p => p.category)));
    return ['全部', ...cats];
  }, [prompts]);

  // 过滤和排序提示词
  const filteredPrompts = useMemo(() => {
    let filtered = prompts.filter(prompt => {
      const matchesSearch = searchTerm === '' || 
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });

    // 分类过滤
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(prompt => prompt.category === selectedCategory);
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortBy];
      let bValue: string | number = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [prompts, searchTerm, selectedCategory, sortBy, sortOrder]);

  return (
    <div className="flex flex-col h-full">
      {/* 搜索和筛选 */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索提示词..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* 排序选项 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {filteredPrompts.length} 个提示词
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Icons.moreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('title')}>
                按标题排序
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('updatedAt')}>
                按更新时间排序
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('createdAt')}>
                按创建时间排序
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '降序' : '升序'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 提示词列表 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredPrompts.length > 0 ? (
            filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="cursor-pointer hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium truncate">
                        {prompt.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {prompt.category}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(prompt.id);
                      }}
                    >
                      {prompt.isFavorite ? (
                        <Icons.starFilled className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <Icons.star className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 pb-3">
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {prompt.content.length > 100 
                      ? prompt.content.substring(0, 100) + '...' 
                      : prompt.content
                    }
                  </p>
                  
                  {/* 标签 */}
                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {prompt.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {prompt.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          +{prompt.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUsePrompt(prompt);
                      }}
                      className="flex-1 text-xs h-7"
                    >
                      <Icons.pencil className="h-3 w-3 mr-1" />
                      使用
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyPrompt(prompt.content);
                      }}
                      className="text-xs h-7"
                    >
                      <Icons.copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Icons.search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                {searchTerm ? '未找到匹配的提示词' : '暂无提示词'}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSearchChange('')}
                  className="mt-2"
                >
                  清除搜索
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}



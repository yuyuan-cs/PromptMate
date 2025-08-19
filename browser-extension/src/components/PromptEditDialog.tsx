import * as React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Prompt, Category } from '../shared/types';
import { X } from 'lucide-react';

interface PromptEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt?: Prompt | null;
  categories: Category[];
  onSave: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<Prompt>) => Promise<void>;
}

export const PromptEditDialog: React.FC<PromptEditDialogProps> = ({
  open,
  onOpenChange,
  prompt,
  categories,
  onSave,
  onUpdate
}) => {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const isEdit = Boolean(prompt);

  // 重置表单
  const resetForm = React.useCallback(() => {
    if (prompt) {
      setTitle(prompt.title);
      setContent(prompt.content);
      setDescription(prompt.description || '');
      setCategory(prompt.category);
      setTags([...prompt.tags]);
      setIsFavorite(prompt.isFavorite);
    } else {
      setTitle('');
      setContent('');
      setDescription('');
      setCategory(categories[0]?.id || '');
      setTags([]);
      setIsFavorite(false);
    }
    setTagInput('');
  }, [prompt, categories]);

  // 当对话框打开或提示词变化时重置表单
  React.useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  // 添加标签
  const addTag = React.useCallback((tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags(prev => [...prev, trimmedTag]);
    }
    setTagInput('');
  }, [tags]);

  // 移除标签
  const removeTag = React.useCallback((tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  // 处理标签输入
  const handleTagInput = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  }, [tagInput, addTag]);

  // 保存提示词
  const handleSave = React.useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      alert('标题和内容不能为空');
      return;
    }

    setIsLoading(true);
    try {
      const promptData = {
        title: title.trim(),
        content: content.trim(),
        description: description.trim(),
        category,
        tags: [...tags],
        isFavorite,
        usageCount: prompt?.usageCount || 0
      };

      if (isEdit && prompt && onUpdate) {
        await onUpdate(prompt.id, promptData);
      } else {
        await onSave(promptData);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('保存提示词失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [title, content, description, category, tags, isFavorite, isEdit, prompt, onSave, onUpdate, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? '编辑提示词' : '新建提示词'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? '修改提示词的内容和属性' : '创建一个新的提示词模板'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* 标题 */}
          <div className="grid gap-2">
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="为您的提示词起一个简洁的名称"
              className="w-full"
            />
          </div>

          {/* 内容 */}
          <div className="grid gap-2">
            <Label htmlFor="content">提示词内容 *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入您的提示词内容，可以使用 {{变量名}} 定义变量"
              className="min-h-[120px] w-full resize-y"
            />
            <div className="text-xs text-muted-foreground">
              提示：使用 {'{{变量名}}'} 创建可替换的变量，如 {'{{产品名称}}'}, {'{{目标用户}}'}
            </div>
          </div>

          {/* 描述 */}
          <div className="grid gap-2">
            <Label htmlFor="description">描述</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简短描述这个提示词的用途"
              className="w-full"
            />
          </div>

          {/* 分类 */}
          <div className="grid gap-2">
            <Label htmlFor="category">分类</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 标签 */}
          <div className="grid gap-2">
            <Label htmlFor="tags">标签</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInput}
              placeholder="输入标签后按回车键添加"
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">
              按回车键或逗号添加标签
            </div>
          </div>

          {/* 收藏 */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="favorite"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="rounded border-input"
            />
            <Label htmlFor="favorite">添加到收藏</Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !title.trim() || !content.trim()}
          >
            {isLoading ? '保存中...' : isEdit ? '更新' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


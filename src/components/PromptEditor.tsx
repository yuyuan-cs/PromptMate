import { useState, useEffect } from "react";
import { usePrompts } from "@/hooks/usePrompts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Save, Trash, X, Plus, Copy } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export function PromptEditor() {
  const { toast } = useToast();
  const {
    selectedPrompt,
    setSelectedPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    categories,
    showRecommended,
    addFromRecommended,
    setShowRecommended
  } = usePrompts();
  
  const [title, setTitle] = useState(selectedPrompt?.title || "");
  const [content, setContent] = useState(selectedPrompt?.content || "");
  const [category, setCategory] = useState(selectedPrompt?.category || "general");
  const [tags, setTags] = useState(selectedPrompt?.tags.join(", ") || "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 当选择的提示词改变时更新表单
  useEffect(() => {
    if (selectedPrompt) {
      setTitle(selectedPrompt.title);
      setContent(selectedPrompt.content);
      setCategory(selectedPrompt.category);
      setTags(selectedPrompt.tags.join(", "));
      setHasChanges(false);
    }
  }, [selectedPrompt]);

  // 跟踪变更
  useEffect(() => {
    if (!selectedPrompt) return;
    
    const changed = 
      title !== selectedPrompt.title ||
      content !== selectedPrompt.content ||
      category !== selectedPrompt.category ||
      tags !== selectedPrompt.tags.join(", ");
    
    setHasChanges(changed);
  }, [title, content, category, tags, selectedPrompt]);

  const handleSave = () => {
    if (!selectedPrompt) return;
    
    updatePrompt(selectedPrompt.id, {
      title,
      content,
      category,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    });
    
    toast({
      title: "保存成功",
      description: "您的提示词已成功保存。",
      variant: "success",
    });
    
    setHasChanges(false);
  };

  const handleDelete = () => {
    if (!selectedPrompt) return;
    deletePrompt(selectedPrompt.id);
    setDeleteDialogOpen(false);
    
    toast({
      title: "删除成功",
      description: "您的提示词已被删除。",
      variant: "warning",
    });
  };
  
  const handleAddFromRecommended = () => {
    if (!selectedPrompt) return;
    
    const newPrompt = addFromRecommended(selectedPrompt);
    setSelectedPrompt(newPrompt);
    setShowRecommended(false);
    
    toast({
      title: "添加成功",
      description: "推荐模板已添加到您的提示词库",
      variant: "success",
    });
  };

  if (!selectedPrompt) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-semibold mb-4">
            选择或创建提示词
          </h2>
          <p className="text-muted-foreground mb-6">
            从列表中选择一个提示词进行编辑，或创建一个新的提示词。
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新建提示词
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex gap-2">
          {!showRecommended ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(selectedPrompt.id)}
              className="h-10 w-10"
            >
              <Star
                className={`h-5 w-5 ${
                  selectedPrompt.isFavorite
                    ? "fill-yellow-400 text-yellow-400"
                    : ""
                }`}
              />
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleAddFromRecommended}
              className="h-10 flex items-center"
            >
              <Copy className="h-4 w-4 mr-2" />
              添加到我的提示词
            </Button>
          )}
          
          {!showRecommended && (
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="flex gap-2">
          {!showRecommended && hasChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedPrompt) {
                  setTitle(selectedPrompt.title);
                  setContent(selectedPrompt.content);
                  setCategory(selectedPrompt.category);
                  setTags(selectedPrompt.tags.join(", "));
                  setHasChanges(false);
                }
              }}
            >
              <X className="h-4 w-4 mr-1" />
              放弃更改
            </Button>
          )}
          
          {!showRecommended && (
            <>
              <Button variant="default" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                保存
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="h-4 w-4 mr-1" />
                删除
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4 flex-1 overflow-auto apple-scrollbar">
        <div>
          <Input
            placeholder="提示词标题"
            className="text-xl font-medium px-2 py-2 h-12 border-0 border-b"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            readOnly={showRecommended}
          />
        </div>

        <div className="flex-1">
          <Textarea
            placeholder="在此编写提示词内容..."
            className="min-h-[300px] resize-none p-3 border rounded-md text-base"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            readOnly={showRecommended}
          />
        </div>

        <div>
          <Input
            placeholder="标签（用逗号分隔）"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="p-2"
            readOnly={showRecommended}
          />
        </div>
        
        {!showRecommended && (
          <div className="text-xs text-muted-foreground">
            最后更新: {new Date(selectedPrompt.updatedAt).toLocaleString('zh-CN')}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除此提示词，该操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

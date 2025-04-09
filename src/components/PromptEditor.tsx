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
import { Star, Save, Trash, X, Plus, Copy, ChevronRight, Check } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PromptEditor() {
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
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
  //保存提示词
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
  //删除提示词
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
  //添加推荐提示词
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

  // 关闭编辑面板
  const handleClose = () => {
    setSelectedPrompt(null);
  };

  // 当没有选择提示词时，显示提示词列表
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

  // 当有选择提示词时，显示提示词编辑器
  return (
    // 整个编辑器容器
    <div className="flex flex-col h-[calc(100%-var(--header-height))]">
      {/* 顶部工具栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 md:p-4 border-b gap-2">
        {/* 左侧工具栏 */}
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          
          {/* 添加收起按钮 */}
          {/* <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            className="ml-0 md:ml-2 h-8 w-8 md:h-9 md:w-9 flex-shrink-0"
            title="收起编辑面板"
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button> */}

          
          {/* 分类选择器 */}
          {!showRecommended && (
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 md:h-10 w-[100px] md:w-[120px] lg:w-[120px] flex-shrink-0 text-xs md:text-sm">
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
        {/* 右侧工具栏 */}
        <div className="flex flex-wrap gap-1 md:gap-2 mt-1 sm:mt-0 w-full sm:w-auto justify-end">


          {/* 收藏按钮 */}
          {!showRecommended ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(selectedPrompt.id)}
              className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0"
            >
              <Star
                className={`h-4 w-4 md:h-5 md:w-5 ${
                  selectedPrompt.isFavorite
                    ? "fill-yellow-400 text-yellow-400"
                    : ""
                }`}
              />
            </Button>
          ) : (
            // 添加推荐提示词按钮
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={handleAddFromRecommended}
              className="h-9 md:h-10 flex items-center flex-shrink-0"
            >
              <Copy className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm">添加到我的提示词</span>
            </Button>
          )}
          
          {/* 放弃更改按钮 */}
          {!showRecommended && hasChanges && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (selectedPrompt) {
                        setTitle(selectedPrompt.title);
                        setContent(selectedPrompt.content);
                        setCategory(selectedPrompt.category);
                        setTags(selectedPrompt.tags.join(", "));
                        setHasChanges(false);
                      }
                    }}
                    className="h-9 w-9 md:h-10 md:w-10"
                  >
                    <X className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>放弃更改</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {/* 保存和删除按钮 */}         
          {!showRecommended && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleSave} className="h-9 w-9 md:h-10 md:w-10 text-green-800 hover:bg-green-50 hover:text-green-700">
                      <Check className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>保存更改</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteDialogOpen(true)} className="h-9 w-9 md:h-10 md:w-10 text-destructive hover:bg-destructive/10">
                      <Trash className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>删除提示词</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
                    
          
        </div>
      </div>

      <ScrollArea className="flex-1 px-1 py-2 md:px-2 md:py-3">
        <div className="space-y-3 md:space-y-4 md:p-2">
          <div>
            <Input
              placeholder="提示词标题"
              className="text-base md:text-xl font-medium px-2 py-1 md:py-2 h-9 md:h-12 border rounded-md w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              readOnly={showRecommended}
            />
          </div>

          <div className="flex-1">
            <Textarea
              placeholder="在此编写提示词内容..."
              className="min-h-[200px] md:min-h-[300px] resize-none p-2 md:p-3 border rounded-md text-sm md:text-base w-full"
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
              className="p-2 border rounded-md w-full text-sm md:text-base"
              readOnly={showRecommended}
            />
          </div>
          
          {!showRecommended && (
            <div className="text-xs text-muted-foreground">
              最后更新: {new Date(selectedPrompt.updatedAt).toLocaleString('zh-CN')}
            </div>
          )}
        </div>
      </ScrollArea>

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

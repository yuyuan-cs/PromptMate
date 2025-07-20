import { useState, useEffect } from "react";
import { usePrompts } from "@/hooks/usePrompts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IconSelector } from "./IconSelector";
import { Icons } from "@/components/ui/icons";
import { Category } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "./CategoryIcon";

interface CategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryManager({ open, onOpenChange }: CategoryManagerProps) {
  const { categories, addCategory, updateCategory, deleteCategory } = usePrompts();
  const { toast } = useToast();
  
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; icon: string }>({ name: "", icon: "" });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("folder");

  // 重置编辑状态
  const resetEditState = () => {
    setEditingCategoryId(null);
    setEditValues({ name: "", icon: "" });
  };

  // 选择一个分类进行编辑
  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditValues({ 
      name: category.name, 
      icon: category.icon || "folder" 
    });
  };

  // 保存分类编辑
  const handleSaveCategory = (categoryId: string) => {
    if (!editValues.name.trim()) {
      toast({
        title: "错误",
        description: "分类名称不能为空",
        variant: "destructive",
      });
      return;
    }
    
    // 更新分类，包括图标
    updateCategory(categoryId, editValues.name, editValues.icon);
    resetEditState();
  };

  // 添加新分类
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "错误",
        description: "分类名称不能为空",
        variant: "destructive",
      });
      return;
    }
    
    // 添加分类时带上图标
    addCategory(newCategoryName, newCategoryIcon);
    setNewCategoryName("");
    setNewCategoryIcon("folder");
  };

  // 当对话框关闭时重置状态
  useEffect(() => {
    if (!open) {
      resetEditState();
      setNewCategoryName("");
      setNewCategoryIcon("folder");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle>分类管理</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* 添加新分类 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">添加新分类</h3>
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="输入分类名称"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div className="w-[150px]">
                <IconSelector
                  value={newCategoryIcon}
                  onChange={setNewCategoryIcon}
                />
              </div>
              <Button onClick={handleAddCategory} size="icon" className="flex-shrink-0">
                <Icons.plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* 分类列表 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">现有分类</h3>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={cn(
                      "border rounded-md transition-all duration-200",
                      editingCategoryId === category.id ? "p-3 space-y-3" : "p-2"
                    )}
                  >
                    {editingCategoryId === category.id ? (
                      // 编辑模式
                      <>
                        <div className="space-y-2">
                          <Label htmlFor={`edit-category-name-${category.id}`}>分类名称</Label>
                          <Input
                            id={`edit-category-name-${category.id}`}
                            value={editValues.name}
                            onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`edit-category-icon-${category.id}`}>分类图标</Label>
                          <IconSelector
                            value={editValues.icon}
                            onChange={(icon) => setEditValues(prev => ({ ...prev, icon }))}
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-2 mt-2">
                          <Button variant="outline" size="sm" onClick={resetEditState}>
                            取消
                          </Button>
                          <Button size="sm" onClick={() => handleSaveCategory(category.id)}>
                            保存
                          </Button>
                        </div>
                      </>
                    ) : (
                      // 查看模式
                      <div className="flex items-center justify-between h-10">
                        <div className="flex items-center">
                          <CategoryIcon iconName={category.icon} className="h-4 w-4 mr-2" />
                          <span>{category.name}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCategory(category)}
                            className="h-8 w-8 hover:bg-muted/50"
                          >
                            <Icons.edit className="h-4 w-4" />
                          </Button>
                          
                          {/* 不允许删除默认的 general 分类 */}
                          {category.id !== "general" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteCategory(category.id)}
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Icons.trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
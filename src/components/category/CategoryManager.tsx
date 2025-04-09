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

interface CategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryManager({ open, onOpenChange }: CategoryManagerProps) {
  const { categories, addCategory, updateCategory, deleteCategory } = usePrompts();
  const { toast } = useToast();
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("folder");

  // 重置编辑状态
  const resetEditState = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryIcon("");
  };

  // 选择一个分类进行编辑
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryIcon(category.icon || "folder");
  };

  // 保存分类编辑
  const handleSaveCategory = () => {
    if (!editingCategory) return;
    
    if (!categoryName.trim()) {
      toast({
        title: "错误",
        description: "分类名称不能为空",
        variant: "destructive",
      });
      return;
    }
    
    // 更新分类，包括图标
    updateCategory(editingCategory.id, categoryName, categoryIcon);
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
    const newCategory = addCategory(newCategoryName, newCategoryIcon);
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
      <DialogContent className="sm:max-w-[500px]">
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
              <Button onClick={handleAddCategory}>
                <Icons.plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* 分类列表 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">现有分类</h3>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between border p-2 rounded-md"
                  >
                    <div className="flex items-center">
                      {category.icon ? (
                        (() => {
                          const IconComponent = Icons[category.icon as keyof typeof Icons] || Icons.folder;
                          return <IconComponent className="h-4 w-4 mr-2" />;
                        })()
                      ) : (
                        <Icons.folder className="h-4 w-4 mr-2" />
                      )}
                      <span>{category.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Icons.edit className="h-4 w-4" />
                      </Button>
                      
                      {/* 不允许删除默认的 general 分类 */}
                      {category.id !== "general" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCategory(category.id)}
                        >
                          <Icons.trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* 编辑分类对话框 */}
          {editingCategory && (
            <div className="border p-4 rounded-md space-y-3 mt-4">
              <h3 className="text-sm font-medium">编辑分类: {editingCategory.name}</h3>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category-name">分类名称</Label>
                <Input
                  id="edit-category-name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category-icon">分类图标</Label>
                <IconSelector
                  value={categoryIcon}
                  onChange={setCategoryIcon}
                />
              </div>
              
              <div className="flex justify-end space-x-2 mt-2">
                <Button variant="outline" onClick={resetEditState}>
                  取消
                </Button>
                <Button onClick={handleSaveCategory}>
                  保存
                </Button>
              </div>
            </div>
          )}
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
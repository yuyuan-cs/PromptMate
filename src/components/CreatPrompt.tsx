// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { DialogFooter } from "@/components/ui/dialog";
// import { useState } from "react";
// import { usePrompts } from "@/hooks/usePrompts";
// import { Sidebar } from "./Sidebar";
// import { toast } from "sonner";

// const [showNewPromptDialog, setShowNewPromptDialog] = useState(false);
// const [newPromptTitle, setNewPromptTitle] = useState("");
// const [newPromptContent, setNewPromptContent] = useState("");
// const [newPromptCategory, setNewPromptCategory] = useState("");
// const [newPromptTags, setNewPromptTags] = useState("");

// // 处理创建新提示词
// const handleCreatePrompt = () => {
//     if (!newPromptTitle.trim() || !newPromptContent.trim()) {
//       toast({
//         title: "错误",
//         description: "标题和内容不能为空",
//         variant: "destructive",
//       });
//       return;
//     }
    
//     const tags = newPromptTags.split(",").map(tag => tag.trim()).filter(Boolean);
    
//     addPrompt({
//       title: newPromptTitle,
//       content: newPromptContent,
//       category: newPromptCategory || activeCategory || categories[0]?.id || "general",
//       tags,
//       isFavorite: false,
//     });
    
//     toast({
//       title: "创建成功",
//       description: "新的提示词已创建",
//       variant: "success",
//     });
    
//     // 重置表单
//     setNewPromptTitle("");
//     setNewPromptContent("");
//     setNewPromptCategory("");
//     setNewPromptTags("");
//     setShowNewPromptDialog(false);
//   };



// export const CreatPrompt = () => {
//     const { activeCategory, categories, handleCreatePrompt } = usePrompts();
//     return (
//     // 新建提示词对话框
//     <Dialog open={showNewPromptDialog} onOpenChange={setShowNewPromptDialog}>
//     <DialogContent>
//     <DialogHeader>
//         <DialogTitle>新建提示词</DialogTitle>
//     </DialogHeader>
//     <div className="space-y-4">
//         <div className="space-y-2">
//         <Label htmlFor="title">标题</Label>
//         <Input 
//             id="title" 
//             placeholder="请输入提示词标题" 
//             value={newPromptTitle}
//             onChange={(e) => setNewPromptTitle(e.target.value)}
//         />
//         </div>
//         <div className="space-y-2">
//         <Label htmlFor="content">内容</Label>
//         <Textarea 
//             id="content" 
//             placeholder="请输入提示词内容" 
//             className="h-[200px]"
//             value={newPromptContent}
//             onChange={(e) => setNewPromptContent(e.target.value)}
//         />
//         </div>
//         <div className="space-y-2">
//         <Label htmlFor="category">分类</Label>
//         <Select 
//             value={newPromptCategory || activeCategory || categories[0]?.id || "general"}
//             onValueChange={setNewPromptCategory}
//         >
//             <SelectTrigger>
//             <SelectValue placeholder="选择分类" />
//             </SelectTrigger>
//             <SelectContent>
//             {categories.map(category => (
//                 <SelectItem key={category.id} value={category.id}>
//                 {category.name}
//                 </SelectItem>
//             ))}
//             </SelectContent>
//         </Select>
//         </div>
//         <div className="space-y-2">
//         <Label htmlFor="tags">标签</Label>
//         <Input
//             id="tags" 
//             placeholder="输入标签，用逗号分隔"
//             value={newPromptTags}
//             onChange={(e) => setNewPromptTags(e.target.value)}
//         />
//         </div>
//     </div>

//     <DialogFooter>
//         <Button variant="outline" onClick={() => setShowNewPromptDialog(false)}>取消</Button>
//         <Button onClick={handleCreatePrompt}>创建</Button>
//     </DialogFooter>
//     </DialogContent>
//     </Dialog>
//     );
// }
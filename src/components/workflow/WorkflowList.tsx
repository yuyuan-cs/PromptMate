import { useState } from "react";
import { useWorkflows } from "@/hooks/useWorkflows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/ui/icons";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Workflow } from "@/types/workflow";

interface WorkflowListProps {
  onCreateNew: () => void;
  onEdit: (workflow: Workflow) => void;
  onExecute: (workflow: Workflow) => void;
}

function WorkflowList({ onCreateNew, onEdit, onExecute }: WorkflowListProps) {
  const {
    filteredWorkflows,
    selectedWorkflow,
    setSelectedWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    updateWorkflow,
    searchTerm,
    setSearchTerm,
    categories,
    activeCategory,
    setActiveCategory,
    showFavorites,
    setShowFavorites
  } = useWorkflows();

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // 处理搜索
  const handleSearch = (value: string) => {
    setLocalSearchTerm(value);
    setSearchTerm(value);
  };

  // 切换收藏状态
  const toggleFavorite = (workflow: Workflow) => {
    updateWorkflow(workflow.id, { isFavorite: !workflow.isFavorite });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 头部工具栏 */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">工作流管理</h2>
          <Button onClick={onCreateNew} size="sm">
            <Icons.plus className="h-4 w-4 mr-2" />
            新建工作流
          </Button>
        </div>
        
        {/* 搜索框 */}
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索工作流..."
            value={localSearchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* 过滤器 */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={showFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavorites(!showFavorites)}
          >
            <Icons.heart className="h-4 w-4 mr-1" />
            收藏
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Icons.filter className="h-4 w-4 mr-1" />
                {activeCategory || "所有分类"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setActiveCategory(null)}>
                所有分类
              </DropdownMenuItem>
              {categories.map(category => (
                <DropdownMenuItem 
                  key={category} 
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 工作流列表 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredWorkflows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icons.workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无工作流</p>
              <Button variant="link" onClick={onCreateNew} className="mt-2">
                创建第一个工作流
              </Button>
            </div>
          ) : (
            filteredWorkflows.map(workflow => (
              <Card 
                key={workflow.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedWorkflow?.id === workflow.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {workflow.name}
                        {workflow.isFavorite && (
                          <Icons.heart className="h-4 w-4 text-red-500 fill-current" />
                        )}
                      </CardTitle>
                      {workflow.description && (
                        <CardDescription className="mt-1">
                          {workflow.description}
                        </CardDescription>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icons.moreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onExecute(workflow)}>
                          <Icons.play className="h-4 w-4 mr-2" />
                          执行
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(workflow)}>
                          <Icons.edit className="h-4 w-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleFavorite(workflow)}>
                          <Icons.heart className="h-4 w-4 mr-2" />
                          {workflow.isFavorite ? '取消收藏' : '收藏'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateWorkflow(workflow.id)}>
                          <Icons.copy className="h-4 w-4 mr-2" />
                          复制
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteWorkflow(workflow.id)}
                          className="text-destructive"
                        >
                          <Icons.trash className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>{workflow.steps.length} 个步骤</span>
                    <span>{workflow.category}</span>
                  </div>
                  
                  {workflow.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {workflow.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {workflow.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{workflow.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default WorkflowList;
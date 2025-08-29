import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useDataSync } from '@/hooks/useDataSync';
import { cn } from '@/lib/utils';

interface SyncStatusIndicatorProps {
  className?: string;
  showText?: boolean;
  onOpenSettings?: () => void;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  className,
  showText = false,
  onOpenSettings
}) => {
  const { syncStatus, manualSync } = useDataSync();

  // 获取状态图标和颜色
  const getStatusIcon = () => {
    if (!syncStatus.enabled) {
      return { icon: CloudOff, color: 'text-muted-foreground', variant: 'secondary' as const };
    }
    
    if (syncStatus.syncing) {
      return { icon: RefreshCw, color: 'text-blue-500', variant: 'default' as const, animate: true };
    }
    
    if (syncStatus.hasConflicts) {
      return { icon: AlertTriangle, color: 'text-yellow-500', variant: 'destructive' as const };
    }
    
    if (syncStatus.error) {
      return { icon: WifiOff, color: 'text-red-500', variant: 'destructive' as const };
    }
    
    if (syncStatus.connected) {
      return { icon: CheckCircle, color: 'text-green-500', variant: 'default' as const };
    }
    
    return { icon: Wifi, color: 'text-muted-foreground', variant: 'secondary' as const };
  };

  // 获取状态文本
  const getStatusText = () => {
    if (!syncStatus.enabled) return '同步已禁用';
    if (syncStatus.syncing) return '同步中...';
    if (syncStatus.hasConflicts) return '存在冲突';
    if (syncStatus.error) return '同步错误';
    if (syncStatus.connected) return '已连接';
    return '未连接';
  };

  // 获取详细状态信息
  const getDetailedStatus = () => {
    const details = [];
    
    if (syncStatus.lastSync) {
      const lastSyncTime = new Date(syncStatus.lastSync);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastSyncTime.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) {
        details.push('刚刚同步');
      } else if (diffMinutes < 60) {
        details.push(`${diffMinutes}分钟前同步`);
      } else {
        details.push(`${Math.floor(diffMinutes / 60)}小时前同步`);
      }
    }
    
    if (syncStatus.error) {
      details.push(`错误: ${syncStatus.error}`);
    }
    
    return details.join(' • ');
  };

  const { icon: StatusIcon, color, variant, animate } = getStatusIcon();

  const handleManualSync = async () => {
    try {
      await manualSync();
    } catch (error) {
      console.error('手动同步失败:', error);
    }
  };

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2 gap-2",
                  className
                )}
              >
                <StatusIcon 
                  className={cn(
                    "h-4 w-4",
                    color,
                    animate && "animate-spin"
                  )} 
                />
                {showText && (
                  <>
                    <span className="text-sm">{getStatusText()}</span>
                    <Badge variant={variant} className="h-5 px-1.5 text-xs">
                      同步
                    </Badge>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          
          <TooltipContent>
            <div className="space-y-1">
              <div className="font-medium">{getStatusText()}</div>
              {getDetailedStatus() && (
                <div className="text-xs text-muted-foreground">
                  {getDetailedStatus()}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <div className="flex items-center gap-2">
              <StatusIcon className={cn("h-4 w-4", color)} />
              <div>
                <div className="font-medium text-sm">{getStatusText()}</div>
                {getDetailedStatus() && (
                  <div className="text-xs text-muted-foreground">
                    {getDetailedStatus()}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleManualSync}
            disabled={syncStatus.syncing || !syncStatus.enabled}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            手动同步
          </DropdownMenuItem>
          
          {syncStatus.hasConflicts && (
            <DropdownMenuItem className="text-yellow-600">
              <AlertTriangle className="h-4 w-4 mr-2" />
              解决冲突
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={onOpenSettings}>
            <Settings className="h-4 w-4 mr-2" />
            同步设置
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};

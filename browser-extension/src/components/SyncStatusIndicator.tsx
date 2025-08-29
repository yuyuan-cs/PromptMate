import * as React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
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
import { useDataSync } from '../hooks/useDataSync';
import { cn } from '../lib/utils';

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
    if (syncStatus.error) {
      return { icon: WifiOff, color: 'text-red-500', variant: 'destructive' as const };
    }
    
    if (syncStatus.hasConflicts) {
      return { icon: AlertTriangle, color: 'text-yellow-500', variant: 'destructive' as const };
    }
    
    if (syncStatus.connected) {
      return { icon: CheckCircle, color: 'text-green-500', variant: 'default' as const };
    }
    
    return { icon: CloudOff, color: 'text-muted-foreground', variant: 'secondary' as const };
  };

  // 获取状态文本
  const getStatusText = () => {
    if (syncStatus.error) return '同步错误';
    if (syncStatus.hasConflicts) return '存在冲突';
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

  const { icon: StatusIcon, color, variant } = getStatusIcon();

  const handleManualSync = async () => {
    try {
      await manualSync();
    } catch (error) {
      console.error('手动同步失败:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 gap-2",
            className
          )}
        >
          <StatusIcon className={cn("h-3 w-3", color)} />
          {showText && (
            <>
              <span className="text-xs">{getStatusText()}</span>
              <Badge variant={variant} className="h-4 px-1 text-xs">
                同步
              </Badge>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("h-3 w-3", color)} />
            <div>
              <div className="font-medium text-xs">{getStatusText()}</div>
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
          disabled={!syncStatus.connected}
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          手动同步
        </DropdownMenuItem>
        
        {syncStatus.hasConflicts && (
          <DropdownMenuItem className="text-yellow-600">
            <AlertTriangle className="h-3 w-3 mr-2" />
            解决冲突
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onOpenSettings}>
          <Settings className="h-3 w-3 mr-2" />
          同步设置
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

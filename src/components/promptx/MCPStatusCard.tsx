import React from "react";
import { useTranslation } from 'react-i18next';

export interface MCPStatusCardProps {
  connected?: boolean;
  serverUrl?: string;
  onTestConnection?: () => void;
  onOpenSettings?: () => void;
  className?: string;
}

/**
 * PR1 Skeleton: Shows MCP connection status and actions.
 * TODO(PR3): Wire to MCPClient.connect() and capabilities list.
 */
export const MCPStatusCard: React.FC<MCPStatusCardProps> = ({
  connected = false,
  serverUrl = "ws://localhost:5203/mcp",
  onTestConnection,
  onOpenSettings,
  className = "",
}) => {
  const { t } = useTranslation();
  return (
    <div className={`rounded-lg border p-4 space-y-3 ${className}`}>
      <div className="font-semibold">{t('promptx.mcp.title')}</div>
      <div className="text-sm text-muted-foreground">{serverUrl}</div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-sm">{connected ? t('promptx.mcp.connected') : t('promptx.mcp.disconnected')}</span>
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-1 rounded-md border text-sm" onClick={onTestConnection}>{t('promptx.mcp.testConnection')}</button>
        <button className="px-3 py-1 rounded-md border text-sm" onClick={onOpenSettings}>{t('promptx.mcp.openSettings')}</button>
      </div>
      <div className="text-xs text-muted-foreground">PR1 占位：展示连接状态与操作入口。</div>
    </div>
  );
};

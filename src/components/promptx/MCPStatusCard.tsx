import React from "react";
import { useTranslation } from 'react-i18next';

export interface MCPStatusCardProps {
  status: { connected: boolean; url?: string; error?: string };
  onTestConnection?: () => void;
  onOpenSettings?: () => void;
  className?: string;
}

/**
 * PR1 Skeleton: Shows MCP connection status and actions.
 * TODO(PR3): Wire to MCPClient.connect() and capabilities list.
 */
export const MCPStatusCard: React.FC<MCPStatusCardProps> = ({
  status = { connected: false },
  onTestConnection,
  onOpenSettings,
  className = "",
}) => {
  const { t } = useTranslation();
  return (
    <div className={`rounded-lg border p-4 space-y-3 ${className}`}>
      <div className="font-semibold">{t('promptx.mcp.title')}</div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${status.connected ? "bg-green-500" : (status.error ? "bg-red-500" : "bg-yellow-500")}`} />
        <span className="text-sm">
          {status.connected ? t('promptx.mcp.connected') : (status.error ? t('promptx.mcp.connectionFailed') : t('promptx.mcp.disconnected'))}
        </span>
      </div>
      {status.error && <div className="text-xs text-red-500">{status.error}</div>}
      {status.connected && status.url && <div className="text-sm text-muted-foreground truncate">{status.url}</div>}
      <div className="flex gap-2 pt-2">
        <button className="px-3 py-1 rounded-md border text-sm" onClick={onTestConnection}>{t('promptx.mcp.testConnection')}</button>
        {onOpenSettings && <button className="px-3 py-1 rounded-md border text-sm" onClick={onOpenSettings}>{t('promptx.mcp.openSettings')}</button>}
      </div>
    </div>
  );
};

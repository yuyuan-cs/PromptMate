import React from "react";
import { useTranslation } from 'react-i18next';

export interface ActiveRolePanelProps {
  roleName?: string;
  roleTitle?: string;
  onContinueChat?: () => void;
  onSwitchRole?: () => void;
  onEndSession?: () => void;
  className?: string;
}

/**
 * PR1 Skeleton: Right-rail panel to show currently active role and quick actions.
 * TODO(PR2+): Wire to real role instance and session state.
 */
export const ActiveRolePanel: React.FC<ActiveRolePanelProps> = ({
  roleName = "(未激活)",
  roleTitle = "",
  onContinueChat,
  onSwitchRole,
  onEndSession,
  className = "",
}) => {
  const { t } = useTranslation();
  return (
    <div className={`rounded-lg border p-4 space-y-3 ${className}`}>
      <div className="font-semibold">{t('promptx.activeRole.title')}</div>
      <div className="text-sm text-muted-foreground">
        {roleName} {roleTitle ? `· ${roleTitle}` : ""}
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-sm" onClick={onContinueChat}>
          {t('promptx.actions.continueChat')}
        </button>
        <button className="px-3 py-1 rounded-md border text-sm" onClick={onSwitchRole}>
          {t('promptx.actions.switchRole')}
        </button>
        <button className="px-3 py-1 rounded-md border text-sm" onClick={onEndSession}>
          {t('promptx.actions.endSession')}
        </button>
      </div>
      <div className="text-xs text-muted-foreground">PR1 占位：展示当前激活角色与快捷操作。</div>
    </div>
  );
};

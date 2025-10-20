import React from "react";
import { useTranslation } from 'react-i18next';
import { Star, StarOff, Pin, PinOff } from 'lucide-react';

export interface RoleCardProps {
  id: string;
  name: string;
  title?: string;
  description?: string;
  onActivate?: (id: string) => void;
  onOpenDetail?: (id: string) => void;
  isFavorite?: boolean;
  isPinned?: boolean;
  onToggleFavorite?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  className?: string;
}

/**
 * PR1 Skeleton: Role card for the role library grid.
 * TODO(PR2): add badges, avatar, i18n, favorite/pin actions.
 */
export const RoleCard: React.FC<RoleCardProps> = ({
  id,
  name,
  title,
  description,
  onActivate,
  onOpenDetail,
  isFavorite,
  isPinned,
  onToggleFavorite,
  onTogglePin,
  className = "",
}) => {
  const { t } = useTranslation();
  return (
    <div className={`rounded-lg border p-4 hover:shadow-sm transition ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="flex items-center gap-1">
          <button
            className="p-1 rounded hover:bg-muted"
            aria-label={isFavorite ? t('promptx.roleLibrary.unfavorite') : t('promptx.roleLibrary.favorite') as string}
            onClick={() => onToggleFavorite?.(id)}
            title={isFavorite ? (t('promptx.roleLibrary.unfavorite') as string) : (t('promptx.roleLibrary.favorite') as string)}
          >
            {isFavorite ? <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> : <StarOff className="h-4 w-4" />}
          </button>
          <button
            className="p-1 rounded hover:bg-muted"
            aria-label={isPinned ? t('promptx.roleLibrary.unpin') : t('promptx.roleLibrary.pin') as string}
            onClick={() => onTogglePin?.(id)}
            title={isPinned ? (t('promptx.roleLibrary.unpin') as string) : (t('promptx.roleLibrary.pin') as string)}
          >
            {isPinned ? <Pin className="h-4 w-4 text-blue-500" /> : <PinOff className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="font-semibold text-base">{name}</div>
      {description && (
        <div className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</div>
      )}
      <div className="flex gap-2 mt-3">
        <button className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-sm" onClick={() => onActivate?.(id)}>
          {t('promptx.roleLibrary.activate')}
        </button>
        <button className="px-3 py-1 rounded-md border text-sm" onClick={() => onOpenDetail?.(id)}>
          {t('promptx.roleLibrary.detail')}
        </button>
      </div>
    </div>
  );
};

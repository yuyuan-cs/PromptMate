import React, { useMemo, useRef, useState } from "react";
import { RoleCard } from "./RoleCard";
import { useTranslation } from 'react-i18next';

export interface RoleGridItem {
  id: string;
  name: string;
  title?: string;
  description?: string;
}

export interface RoleGridProps {
  roles: RoleGridItem[];
  onActivate?: (id: string) => void;
  onOpenDetail?: (id: string) => void;
  favorites?: Set<string>;
  pinned?: Set<string>;
  onToggleFavorite?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  className?: string;
}

/**
 * PR1 Skeleton: Grid for rendering role cards.
 */
export const RoleGrid: React.FC<RoleGridProps> = ({
  roles,
  onActivate,
  onOpenDetail,
  favorites,
  pinned,
  onToggleFavorite,
  onTogglePin,
  className = "",
}) => {
  const { t } = useTranslation();
  const [focusIndex, setFocusIndex] = useState(0);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const cols = useMemo(() => 3, []); // 简化：默认3列（lg），小屏退化为线性左右移动

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (!roles.length) return;
    let next = idx;
    switch (e.key) {
      case 'ArrowRight':
        next = Math.min(roles.length - 1, idx + 1); break;
      case 'ArrowLeft':
        next = Math.max(0, idx - 1); break;
      case 'ArrowDown':
        next = Math.min(roles.length - 1, idx + cols); break;
      case 'ArrowUp':
        next = Math.max(0, idx - cols); break;
      case 'Home':
        next = 0; break;
      case 'End':
        next = roles.length - 1; break;
      case 'Enter':
      case ' ': // Space
        e.preventDefault();
        onOpenDetail?.(roles[idx].id);
        return;
      default:
        return;
    }
    e.preventDefault();
    setFocusIndex(next);
    itemRefs.current[next]?.focus();
  };

  if (!roles.length) {
    return (
      <div className={`rounded-lg border p-6 text-center text-sm text-muted-foreground ${className}`} role="status" aria-live="polite">
        <div className="font-medium text-foreground mb-1">{t('promptx.empty.noResults')}</div>
        <div>{t('promptx.empty.tryAdjust')}</div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`} role="grid" aria-rowcount={Math.ceil(roles.length / cols)}>
      {roles.map((r, i) => (
        <div
          key={r.id}
          ref={el => itemRefs.current[i] = el}
          tabIndex={i === focusIndex ? 0 : -1}
          role="gridcell"
          aria-selected={i === focusIndex}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
        >
          <RoleCard
            id={r.id}
            name={r.name}
            title={r.title}
            description={r.description}
            onActivate={onActivate}
            onOpenDetail={onOpenDetail}
            isFavorite={favorites?.has(r.id)}
            isPinned={pinned?.has(r.id)}
            onToggleFavorite={onToggleFavorite}
            onTogglePin={onTogglePin}
          />
        </div>
      ))}
    </div>
  );
};

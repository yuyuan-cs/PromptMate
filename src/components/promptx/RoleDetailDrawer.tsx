import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { professionalRolesManager } from '@/services/promptx/ProfessionalRoles';

export interface RoleDetailData {
  id: string;
  name: string;
  title?: string;
  description?: string;
}

export interface RoleDetailDrawerProps {
  open: boolean;
  role?: RoleDetailData | null;
  onOpenChange?: (open: boolean) => void;
  onActivate?: (id: string) => void;
}

export const RoleDetailDrawer: React.FC<RoleDetailDrawerProps> = ({
  open,
  role,
  onOpenChange,
  onActivate,
}) => {
  const { t } = useTranslation();
  const handleActivate = () => {
    if (role) onActivate?.(role.id);
  };

  const full = role?.id ? professionalRolesManager.getRoleById(role.id) : null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{t('promptx.roleDetail.title')}</DrawerTitle>
          <DrawerDescription>
            {role?.title}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 space-y-3">
          <div>
            <div className="text-base font-semibold">{role?.name}</div>
            {role?.description && (
              <div className="text-sm text-muted-foreground mt-1">
                {role.description}
              </div>
            )}
          </div>

          <Separator />

          {full && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">{t('promptx.roleDetail.capabilities')}</div>
                <ul className="mt-2 grid grid-cols-1 gap-1 list-disc list-inside text-sm">
                  {full.capabilities.map((c, i) => (
                    <li key={i} className="text-muted-foreground">{c}</li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium">{t('promptx.roleDetail.persona')}</div>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <div>{t('promptx.roleDetail.communication_style')}: {full.personality.communication_style}</div>
                  <div>{t('promptx.roleDetail.decision_making')}: {full.personality.decision_making}</div>
                  <div>{t('promptx.roleDetail.work_approach')}: {full.personality.work_approach}</div>
                  <div>{t('promptx.roleDetail.traits')}: {full.personality.traits.join('，')}</div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium">{t('promptx.roleDetail.knowledge')}</div>
                <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-muted-foreground">
                  <div>{t('promptx.roleDetail.domains')}: {full.knowledge_base.domains.join('，')}</div>
                  <div>{t('promptx.roleDetail.methodologies')}: {full.knowledge_base.methodologies.join('，')}</div>
                  <div>{t('promptx.roleDetail.tools')}: {full.knowledge_base.tools.join('，')}</div>
                  <div>{t('promptx.roleDetail.frameworks')}: {full.knowledge_base.frameworks.join('，')}</div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium">{t('promptx.roleDetail.examples')}</div>
                <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
                  {full.examples.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        <DrawerFooter>
          <Button onClick={handleActivate} className="w-full">{t('promptx.roleLibrary.activate')}</Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">{t('common.close')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

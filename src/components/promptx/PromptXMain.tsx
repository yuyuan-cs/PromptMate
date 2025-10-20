/**
 * PromptX 主界面组件
 * 整合角色激活和 AI 对话功能
 */

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  MessageSquare, 
  Users,
  Brain,
  Zap
} from 'lucide-react';

import { SmartRoleActivator, SmartRoleActivatorHandle } from '@/components/promptx/SmartRoleActivator';
import { RoleInstance } from '@/services/promptx/ProfessionalRoles';
import { professionalRolesManager } from '@/services/promptx/ProfessionalRoles';
import { ActiveRolePanel } from '@/components/promptx/ActiveRolePanel';
import { MCPStatusCard } from '@/components/promptx/MCPStatusCard';
import { RoleGrid } from '@/components/promptx/RoleGrid';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { RoleDetailDrawer } from '@/components/promptx/RoleDetailDrawer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MCPClient } from '@/services/promptx/MCPClient';
import { mcpConfigStore } from '@/services/promptx/MCPConfig';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface PromptXMainProps {
  className?: string;
}

export const PromptXMain: React.FC<PromptXMainProps> = ({
  className = ''
}) => {
  const [activeRole, setActiveRole] = useState<RoleInstance | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [search, setSearch] = useState('');
  const { t } = useTranslation();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRole, setDetailRole] = useState<{ id: string; name: string; title?: string; description?: string } | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'az' | 'za' | 'pinned'>('recent');
  const activatorRef = useRef<SmartRoleActivatorHandle>(null);

  // Restore favorites/pinned from localStorage on mount
  useEffect(() => {
    try {
      const favRaw = localStorage.getItem('promptx_favorites');
      if (favRaw) setFavorites(new Set<string>(JSON.parse(favRaw)));
    } catch {}
    try {
      const pinRaw = localStorage.getItem('promptx_pinned');
      if (pinRaw) setPinned(new Set<string>(JSON.parse(pinRaw)));
    } catch {}
  }, []);

  // Persist favorites/pinned when changed
  useEffect(() => {
    try { localStorage.setItem('promptx_favorites', JSON.stringify(Array.from(favorites))); } catch {}
  }, [favorites]);
  useEffect(() => {
    try { localStorage.setItem('promptx_pinned', JSON.stringify(Array.from(pinned))); } catch {}
  }, [pinned]);

  // 获取角色统计信息
  const roleStats = professionalRolesManager.getRoleStats();
  const allRoles = professionalRolesManager.getAllRoles();

  // MCP status state
  const [mcpStatus, setMcpStatus] = useState<{ connected: boolean; url?: string; error?: string }>({ connected: false });

  useEffect(() => {
    // Subscribe to MCP status changes
    const off = MCPClient.onStatusChange(status => {
      setMcpStatus(status);
    });
    // Try lazy-connect to active endpoint on mount (non-blocking)
    (async () => {
      const ep = mcpConfigStore.getActive();
      if (ep) {
        try { await MCPClient.connect(ep); } catch (e: any) {
          setMcpStatus({ connected: false, error: e?.message || 'Failed to connect' });
        }
      }
    })();
    return () => { off(); };
  }, []);

  const handleTestMCP = async () => {
    const res = await MCPClient.testConnection();
    if (res.ok) toast.success('MCP connected'); else toast.error(`MCP failed: ${res.error || 'unknown'}`);
  };

  /**
   * 角色激活回调
   */
  const handleRoleActivated = (roleInstance: RoleInstance) => {
    setActiveRole(roleInstance);
    setShowStats(false);
  };

  /**
   * 角色取消激活回调
   */
  const handleRoleDeactivated = () => {
    setActiveRole(null);
    setShowStats(true);
  };

  return (
    <div className={`promptx-main space-y-6 ${className}`}>
      {/* 页面标题 */
      }
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold">{t('promptx.heroTitle')}</h1>
        </div>
        <p className="text-muted-foreground">{t('promptx.heroSubtitle')}</p>
      </div>

      {/* 统计信息面板 */}
      {showStats && !activeRole && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{roleStats.totalRoles}</p>
                  <p className="text-sm text-muted-foreground">专业角色</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{Object.keys(roleStats.categoriesCount).length}</p>
                  <p className="text-sm text-muted-foreground">专业领域</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">∞</p>
                  <p className="text-sm text-muted-foreground">对话次数</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 主要功能区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 角色激活器 - 占据主要空间 */}
        <div className="lg:col-span-2">
          <SmartRoleActivator
            ref={activatorRef}
            onRoleActivated={handleRoleActivated}
            onRoleDeactivated={handleRoleDeactivated}
          />
        </div>

        {/* 右侧信息栏 */}
        {activeRole ? (
          <div className="space-y-4">
            <ActiveRolePanel
              roleName={activeRole.name}
              roleTitle={activeRole.title}
              onContinueChat={() => activatorRef.current?.focusInput()}
              onSwitchRole={() => {
                activatorRef.current?.deactivate();
                // Deactivate already resets activeRole via callback
              }}
              onEndSession={() => activatorRef.current?.deactivate()}
            />
            <MCPStatusCard
              status={mcpStatus}
              onTestConnection={handleTestMCP}
              onOpenSettings={() => {
                // Dispatch a global event for Sidebar to open settings at MCP tab
                window.dispatchEvent(new CustomEvent('open-settings-panel', { detail: { panel: 'mcp' } }));
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* 快速开始 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <span>{t('promptx.quickStart.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">{t('promptx.quickStart.step1Title')}</h4>
                  <p className="text-xs text-muted-foreground">{t('promptx.quickStart.step1Desc')}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">{t('promptx.quickStart.step2Title')}</h4>
                  <p className="text-xs text-muted-foreground">{t('promptx.quickStart.step2Desc')}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">{t('promptx.quickStart.step3Title')}</h4>
                  <p className="text-xs text-muted-foreground">{t('promptx.quickStart.step3Desc')}</p>
                </div>
              </CardContent>
            </Card>

            {/* 可用角色 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>{t('promptx.availableRoles.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allRoles.slice(0, 5).map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{role.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  ))}
                  {allRoles.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      {t('promptx.availableRoles.more', { count: allRoles.length - 5 })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 分类统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-green-500" />
                  <span>{t('promptx.domains.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(roleStats.categoriesCount).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm">{category}</span>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* MCP 状态 */}
            <MCPStatusCard status={mcpStatus} onTestConnection={handleTestMCP} />
          </div>
        )}
      </div>

      {/* 底部说明 */}
      {!activeRole && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">🎯 PromptX 的核心优势</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <h4 className="font-medium">10倍效率提升</h4>
                  <p className="text-sm text-muted-foreground">
                    从复制粘贴到自然对话激活
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🎭</div>
                  <h4 className="font-medium">专业能力保证</h4>
                  <p className="text-sm text-muted-foreground">
                    行业最佳实践的角色定义
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🧠</div>
                  <h4 className="font-medium">智能记忆学习</h4>
                  <p className="text-sm text-muted-foreground">
                    持续学习优化的记忆系统
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 角色库（PR2：加入基础搜索过滤） */}
      {!activeRole && (
        <div className="space-y-3">
          <div className="text-base font-semibold">{t('promptx.roleLibrary.title')}</div>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('common.search') as string}
              className="max-w-sm"
            />
            <div className="flex items-center gap-2">
              <Switch id="favorites-only" checked={favoritesOnly} onCheckedChange={setFavoritesOnly} />
              <Label htmlFor="favorites-only" className="text-sm">{t('promptx.filters.favoritesOnly')}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">{t('promptx.filters.sort')}</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{t('promptx.filters.sort_recent')}</SelectItem>
                  <SelectItem value="pinned">{t('promptx.filters.sort_pinned')}</SelectItem>
                  <SelectItem value="az">{t('promptx.filters.sort_az')}</SelectItem>
                  <SelectItem value="za">{t('promptx.filters.sort_za')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <RoleGrid
            roles={allRoles
              .filter(r => {
                if (!search.trim()) return true;
                const s = search.toLowerCase();
                return (
                  r.name.toLowerCase().includes(s) ||
                  (r.title?.toLowerCase().includes(s) ?? false) ||
                  (r.description?.toLowerCase().includes(s) ?? false)
                );
              })
              .filter(r => !favoritesOnly || favorites.has(r.id))
              .slice()
              .sort((a, b) => {
                if (sortBy === 'pinned') {
                  const ap = pinned.has(a.id) ? 0 : 1;
                  const bp = pinned.has(b.id) ? 0 : 1;
                  if (ap !== bp) return ap - bp;
                }
                if (sortBy === 'az') return a.name.localeCompare(b.name);
                if (sortBy === 'za') return b.name.localeCompare(a.name);
                return 0; // recent: keep as-is
              })
              .map(r => ({ id: r.id, name: r.name, title: r.title, description: r.description }))}
            onActivate={(id) => {
              const role = allRoles.find(r => r.id === id);
              if (!role) return;
              // 简单触发：标记已激活（PR1占位，不接入真实会话）
              handleRoleActivated({ ...role, activatedAt: new Date().toISOString(), sessionId: 'pr1-temp' } as any);
            }}
            onOpenDetail={(id) => {
              const role = allRoles.find(r => r.id === id);
              if (!role) return;
              setDetailRole({ id: role.id, name: role.name, title: role.title, description: role.description });
              setDetailOpen(true);
            }}
            favorites={favorites}
            pinned={pinned}
            onToggleFavorite={(id) => {
              setFavorites(prev => {
                const next = new Set(prev);
                next.has(id) ? next.delete(id) : next.add(id);
                return next;
              });
            }}
            onTogglePin={(id) => {
              setPinned(prev => {
                const next = new Set(prev);
                next.has(id) ? next.delete(id) : next.add(id);
                return next;
              });
            }}
          />
        </div>
      )}

      {/* 角色详情抽屉 */}
      <RoleDetailDrawer
        open={detailOpen}
        role={detailRole}
        onOpenChange={setDetailOpen}
        onActivate={(id) => {
          const role = allRoles.find(r => r.id === id);
          if (!role) return;
          handleRoleActivated({ ...role, activatedAt: new Date().toISOString(), sessionId: 'pr1-temp' } as any);
          setDetailOpen(false);
        }}
      />
    </div>
  );
}
;

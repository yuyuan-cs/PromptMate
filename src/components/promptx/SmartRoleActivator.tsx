/**
 * PromptX 智能角色激活器
 * 实现自然对话激活专业角色的核心界面组件
 */

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  Zap, 
  User, 
  MessageSquare, 
  Sparkles, 
  Brain,
  ArrowRight,
  Lightbulb,
  Target
} from 'lucide-react';

import { AIRoleChat } from '@/components/promptx/AIRoleChat';
import { dialogueEngine, RoleActivationIntent } from '@/services/promptx/DialogueEngine';
import { professionalRolesManager, RoleInstance, ProfessionalRole } from '@/services/promptx/ProfessionalRoles';

interface RoleSuggestion {
  roleId: string;
  name: string;
  reason: string;
  confidence: number;
}

export interface SmartRoleActivatorProps {
  onRoleActivated?: (roleInstance: RoleInstance) => void;
  onRoleDeactivated?: () => void;
  className?: string;
}

export interface SmartRoleActivatorHandle {
  deactivate: () => void;
  focusInput: () => void;
  setPresetMessage: (msg: string) => void;
}

export const SmartRoleActivator = forwardRef<SmartRoleActivatorHandle, SmartRoleActivatorProps>(({ 
  onRoleActivated,
  onRoleDeactivated,
  className = ''
}, ref) => {
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeRole, setActiveRole] = useState<RoleInstance | null>(null);
  const [suggestions, setSuggestions] = useState<RoleSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentMessages, setRecentMessages] = useState<string[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 示例消息
  const exampleMessages = [
    '我需要产品经理专家帮我分析用户需求',
    '需要系统架构师指导技术方案设计',
    '请文案策划帮我写个营销文案',
    '需要UI设计师优化界面体验',
    '请数据分析师帮我分析用户行为'
  ];

  useEffect(() => {
    // 加载最近使用的消息
    const saved = localStorage.getItem('promptx_recent_messages');
    if (saved) {
      try {
        setRecentMessages(JSON.parse(saved));
      } catch (error) {
        console.error('加载最近消息失败:', error);
      }
    }
  }, []);

  /**
   * 处理消息提交
   */
  const handleMessageSubmit = async () => {
    if (!message.trim()) {
      toast.error('请输入您的需求描述');
      return;
    }

    setIsProcessing(true);
    setShowSuggestions(false);

    try {
      // 使用对话引擎解析用户意图
      const intent = await dialogueEngine.parseUserIntent(message);
      
      if (intent && dialogueEngine.validateIntent(intent)) {
        // 成功识别角色意图，激活角色
        await activateRoleFromIntent(intent);
      } else {
        // 未能识别明确意图，提供角色建议
        const roleSuggestions = await dialogueEngine.suggestRoles(message);
        setSuggestions(roleSuggestions);
        setShowSuggestions(true);
        
        if (roleSuggestions.length === 0) {
          toast.info('未能识别具体角色需求，请尝试更具体的描述，比如："我需要产品经理专家帮助"');
        } else {
          toast.info(`为您推荐了 ${roleSuggestions.length} 个相关角色`);
        }
      }

      // 保存到最近消息
      saveRecentMessage(message);
      
    } catch (error) {
      console.error('处理消息失败:', error);
      toast.error('处理请求时出现错误，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 从意图激活角色
   */
  const activateRoleFromIntent = async (intent: RoleActivationIntent) => {
    try {
      const roleInstance = await professionalRolesManager.activateRole(
        intent.roleId, 
        intent.context
      );
      
      if (roleInstance) {
        setActiveRole(roleInstance);
        setMessage('');
        setSuggestions([]);
        setShowSuggestions(false);
        
        const role = professionalRolesManager.getRoleById(intent.roleId);
        toast.success(
          `已激活 ${roleInstance.name}，现在我是您的专业${roleInstance.title}助手！`,
          { duration: 3000 }
        );
        
        onRoleActivated?.(roleInstance);
      } else {
        toast.error('角色激活失败，请重试');
      }
    } catch (error) {
      console.error('角色激活失败:', error);
      toast.error('角色激活时出现错误');
    }
  };

  /**
   * 直接激活建议的角色
   */
  const activateRole = async (roleId: string) => {
    try {
      const roleInstance = await professionalRolesManager.activateRole(roleId, {
        originalMessage: message,
        activationMethod: 'suggestion_select'
      });
      
      if (roleInstance) {
        setActiveRole(roleInstance);
        setMessage('');
        setSuggestions([]);
        setShowSuggestions(false);
        
        toast.success(`已激活 ${roleInstance.name}！`);
        onRoleActivated?.(roleInstance);
      }
    } catch (error) {
      console.error('角色激活失败:', error);
      toast.error('角色激活失败');
    }
  };

  /**
   * 取消激活角色
   */
  const deactivateRole = () => {
    setActiveRole(null);
    onRoleDeactivated?.();
    toast.info('已退出专业角色模式');
  };

  /**
   * 保存最近消息
   */
  const saveRecentMessage = (msg: string) => {
    const updated = [msg, ...recentMessages.filter(m => m !== msg)].slice(0, 5);
    setRecentMessages(updated);
    localStorage.setItem('promptx_recent_messages', JSON.stringify(updated));
  };

  /**
   * 使用示例消息
   */
  const useExampleMessage = (exampleMsg: string) => {
    setMessage(exampleMsg);
    textareaRef.current?.focus();
  };

  /**
   * 键盘事件处理
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleMessageSubmit();
    }
  };

  useImperativeHandle(ref, () => ({
    deactivate: () => deactivateRole(),
    focusInput: () => textareaRef.current?.focus(),
    setPresetMessage: (msg: string) => {
      setMessage(msg);
    },
  }));

  return (
    <div className={`smart-role-activator space-y-6 ${className}`}>
      {/* 当前激活的角色 - AI 对话界面 */}
      {activeRole ? (
        <div className="h-[600px]">
          <AIRoleChat
            activeRole={activeRole}
            onRoleDeactivated={deactivateRole}
          />
        </div>
      ) : null}

      {/* 主要交互界面 */}
      {!activeRole && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span>智能角色激活</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              用自然语言描述您的需求，我会为您匹配最合适的专业角色
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 输入区域 */}
            <div className="space-y-2">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="告诉我您需要什么帮助，比如：我需要产品经理专家帮我分析用户需求..."
                className="min-h-[100px] resize-none"
                disabled={isProcessing}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  按 Ctrl+Enter 快速提交
                </p>
                <Button 
                  onClick={handleMessageSubmit} 
                  disabled={isProcessing || !message.trim()}
                  className="flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Brain className="h-4 w-4 animate-pulse" />
                      <span>分析中...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>激活专业角色</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 示例消息 */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">试试这些示例：</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {exampleMessages.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-1 px-2"
                    onClick={() => useExampleMessage(example)}
                    disabled={isProcessing}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>

            {/* 最近使用的消息 */}
            {recentMessages.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">最近使用：</span>
                </div>
                <div className="space-y-1">
                  {recentMessages.map((recentMsg, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="justify-start h-auto py-2 px-3 text-left"
                      onClick={() => useExampleMessage(recentMsg)}
                      disabled={isProcessing}
                    >
                      <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="truncate">{recentMsg}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 角色建议 */}
      {showSuggestions && suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-500" />
              <span>推荐角色</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              基于您的描述，为您推荐以下专业角色：
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {suggestions.map((suggestion, index) => {
                const role = professionalRolesManager.getRoleById(suggestion.roleId);
                return (
                  <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={role?.avatar} alt={suggestion.name} />
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{suggestion.name}</h4>
                            <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                匹配度: {Math.round(suggestion.confidence * 100)}%
                              </Badge>
                              {role && (
                                <Badge variant="outline" className="text-xs">
                                  {role.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => activateRole(suggestion.roleId)}
                        >
                          激活
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

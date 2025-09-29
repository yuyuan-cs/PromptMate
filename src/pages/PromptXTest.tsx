/**
 * PromptX 功能测试页面
 * 用于测试和演示 PromptX 核心功能
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import { SmartRoleActivator } from '@/components/promptx/SmartRoleActivator';
import { dialogueEngine } from '@/services/promptx/DialogueEngine';
import { professionalRolesManager, RoleInstance } from '@/services/promptx/ProfessionalRoles';

export const PromptXTest: React.FC = () => {
  const [activeRole, setActiveRole] = useState<RoleInstance | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  /**
   * 测试对话理解引擎
   */
  const testDialogueEngine = async () => {
    const testMessages = [
      '我需要产品经理专家帮我分析用户需求',
      '需要系统架构师指导技术方案设计',
      '请文案策划帮我写个营销文案',
      '需要UI设计师优化界面体验',
      '请数据分析师帮我分析用户行为',
      '我想要一个专业的帮助', // 模糊请求
      '你好，今天天气怎么样？' // 无关请求
    ];

    const results = [];
    
    for (const message of testMessages) {
      try {
        const intent = await dialogueEngine.parseUserIntent(message);
        const suggestions = await dialogueEngine.suggestRoles(message);
        
        results.push({
          message,
          intent,
          suggestions,
          timestamp: new Date().toLocaleTimeString()
        });
      } catch (error) {
        results.push({
          message,
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    }

    setTestResults(results);
    toast.success(`完成 ${testMessages.length} 条消息的测试`);
  };

  /**
   * 测试角色管理
   */
  const testRoleManager = () => {
    const allRoles = professionalRolesManager.getAllRoles();
    const stats = professionalRolesManager.getRoleStats();
    
    console.log('所有角色:', allRoles);
    console.log('角色统计:', stats);
    
    toast.success(`发现 ${allRoles.length} 个专业角色`);
  };

  /**
   * 角色激活回调
   */
  const handleRoleActivated = (roleInstance: RoleInstance) => {
    setActiveRole(roleInstance);
    console.log('角色已激活:', roleInstance);
  };

  /**
   * 角色取消激活回调
   */
  const handleRoleDeactivated = () => {
    setActiveRole(null);
    console.log('角色已取消激活');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">PromptX 功能测试</h1>
        <p className="text-muted-foreground">
          测试和演示 PromptX 的核心功能：自然对话激活角色、认知记忆系统、专业角色库
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 智能角色激活器 */}
        <Card>
          <CardHeader>
            <CardTitle>智能角色激活器</CardTitle>
          </CardHeader>
          <CardContent>
            <SmartRoleActivator
              onRoleActivated={handleRoleActivated}
              onRoleDeactivated={handleRoleDeactivated}
            />
          </CardContent>
        </Card>

        {/* 当前激活角色信息 */}
        <Card>
          <CardHeader>
            <CardTitle>当前激活角色</CardTitle>
          </CardHeader>
          <CardContent>
            {activeRole ? (
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">{activeRole.name}</h3>
                  <p className="text-sm text-muted-foreground">{activeRole.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">专业能力：</p>
                  <div className="flex flex-wrap gap-1">
                    {activeRole.capabilities.map((capability, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>激活时间: {new Date(activeRole.activatedAt).toLocaleString()}</p>
                  <p>会话ID: {activeRole.sessionId}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">暂无激活的角色</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 测试工具 */}
      <Card>
        <CardHeader>
          <CardTitle>测试工具</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={testDialogueEngine}>
              测试对话理解引擎
            </Button>
            <Button onClick={testRoleManager} variant="outline">
              测试角色管理器
            </Button>
            <Button 
              onClick={() => setTestResults([])} 
              variant="outline"
            >
              清空测试结果
            </Button>
          </div>

          {/* 测试结果 */}
          {testResults.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <h3 className="font-semibold">测试结果</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <Card key={index} className="p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-sm">{result.message}</p>
                        <span className="text-xs text-muted-foreground">
                          {result.timestamp}
                        </span>
                      </div>
                      
                      {result.error ? (
                        <p className="text-red-500 text-sm">错误: {result.error}</p>
                      ) : (
                        <div className="space-y-2">
                          {result.intent ? (
                            <div>
                              <p className="text-sm">
                                <strong>识别结果:</strong> {result.intent.roleId} 
                                (置信度: {Math.round(result.intent.confidence * 100)}%)
                              </p>
                              {result.intent.extractedKeywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {result.intent.extractedKeywords.map((keyword, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {keyword}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">未识别到明确角色意图</p>
                          )}
                          
                          {result.suggestions && result.suggestions.length > 0 && (
                            <div>
                              <p className="text-sm font-medium">建议角色:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {result.suggestions.map((suggestion, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {suggestion.name} ({Math.round(suggestion.confidence * 100)}%)
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 角色库信息 */}
      <Card>
        <CardHeader>
          <CardTitle>专业角色库</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professionalRolesManager.getAllRoles().map((role) => (
              <Card key={role.id} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{role.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {role.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {role.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {role.capabilities.slice(0, 3).map((capability, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                    {role.capabilities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{role.capabilities.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

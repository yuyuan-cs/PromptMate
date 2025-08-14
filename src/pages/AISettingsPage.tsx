import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Sparkles, ArrowLeft } from "lucide-react";
import { AISettings } from "@/components/AISettings";

interface AISettingsPageProps {
  onBack?: () => void;
}

/**
 * AI设置页面组件
 * 提供AI服务配置、API密钥管理等功能
 */
export const AISettingsPage: React.FC<AISettingsPageProps> = ({
  onBack,
}) => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* 页面头部 */}
      <div className="flex items-center gap-4 mb-6">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">AI设置</h1>
        </div>
      </div>

      {/* 设置内容 */}
      <div className="space-y-6">
        {/* AI服务配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI服务配置
            </CardTitle>
            <CardDescription>
              配置您的AI服务提供商和API密钥，以启用提示词优化和生成功能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AISettings />
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">如何使用AI优化功能：</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>在新建或编辑提示词时，您会看到右下角的AI优化按钮</li>
                <li>点击按钮后，AI将分析您的内容并提供优化建议</li>
                <li>您可以选择接受或拒绝AI的建议</li>
                <li>如果没有内容，AI将帮助您生成新的提示词</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">支持的AI服务商：</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><strong>OpenAI</strong> - 使用GPT模型进行优化</li>
                <li><strong>Anthropic</strong> - 使用Claude模型进行优化</li>
                <li><strong>自定义</strong> - 支持兼容OpenAI API的其他服务</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">注意事项：</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>API密钥将安全存储在本地，不会上传到服务器</li>
                <li>使用AI服务可能会产生费用，请查看相应服务商的定价</li>
                <li>建议定期更新API密钥以确保安全</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AISettingsPage;

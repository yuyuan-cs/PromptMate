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
            {t("common.back")}
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
              {t("aiSettings.title")}
            </CardTitle>
            <CardDescription>
              {t("aiSettings.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AISettings />
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <CardTitle>{t("aiSettings.usageInstructions.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">{t("aiSettings.usageInstructions.title")}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>{t("aiSettings.usageInstructions.step1")}</li>
                <li>{t("aiSettings.usageInstructions.step2")}</li>
                <li>{t("aiSettings.usageInstructions.step3")}</li>
                <li>{t("aiSettings.usageInstructions.step4")}</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">{t("aiSettings.supportedProviders.title")}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><strong>OpenAI</strong> {t("aiSettings.supportedProviders.openai")}</li>
                <li><strong>Anthropic</strong> {t("aiSettings.supportedProviders.anthropic")}</li>
                <li><strong>自定义</strong> {t("aiSettings.supportedProviders.custom")}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{t("aiSettings.usageInstructions.title")}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>{t("aiSettings.usageInstructions.step1")}</li>
                <li>{t("aiSettings.usageInstructions.step2")}</li>
                <li>{t("aiSettings.usageInstructions.step3")}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AISettingsPage;

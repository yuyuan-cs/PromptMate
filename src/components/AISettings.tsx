import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, TestTube, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiService, AIConfig } from "@/services/aiService";

export const AISettings: React.FC = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AIConfig>({
    apiKey: '',
    baseUrl: '',
    model: '',
    provider: 'openai'
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // 预设配置 - 使用用户提供的正确基础URL
  const presetConfigs = {
    openai: {
      baseUrl: 'https://api.openai.com',
      model: 'gpt-3.5-turbo',
      provider: 'openai' as const
    },
    anthropic: {
      baseUrl: 'https://api.anthropic.com',
      model: 'claude-3-sonnet-20240229',
      provider: 'anthropic' as const
    },
    gemini: {
      baseUrl: 'https://generativelanguage.googleapis.com',
      model: 'gemini-pro',
      provider: 'gemini' as const
    },
    siliconflow: {
      baseUrl: 'https://api.siliconflow.cn',
      model: 'Qwen/Qwen2.5-7B-Instruct',
      provider: 'custom' as const
    },
    custom: {
      baseUrl: 'https://api.openai.com',
      model: 'gpt-3.5-turbo',
      provider: 'custom' as const
    }
  };

  // 加载已保存的配置
  useEffect(() => {
    const savedConfig = aiService.getConfig();
    if (savedConfig) {
      setConfig(savedConfig);
    } else {
      // 如果没有保存的配置，使用OpenAI的默认配置
      setConfig({
        ...presetConfigs.openai,
        apiKey: ''
      });
    }
  }, []);

  // 处理提供商变更
  const handleProviderChange = (provider: 'openai' | 'anthropic' | 'custom') => {
    const preset = presetConfigs[provider];
    setConfig(prev => ({
      ...prev,
      ...preset,
      apiKey: prev.apiKey // 保留API Key
    }));
    setTestResult(null);
  };

  // 处理配置变更
  const handleConfigChange = (field: keyof AIConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setTestResult(null);
  };

  // 测试连接
  const testConnection = async () => {
    if (!config.apiKey.trim()) {
      toast({
        title: "测试失败",
        description: "请先输入API Key",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // 使用新的测试连接方法
      const isConnected = await aiService.testConnection(config);

      if (isConnected) {
        setTestResult('success');
        toast({
          title: "连接成功",
          description: "AI服务配置正确，可以正常使用",
          variant: "success",
        });
      } else {
        setTestResult('error');
        toast({
          title: "连接失败",
          description: "无法连接到AI服务，请检查配置信息",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult('error');
      toast({
        title: "连接失败",
        description: error instanceof Error ? error.message : "请检查配置信息",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  // 保存配置
  const saveConfig = () => {
    if (!config.apiKey.trim()) {
      toast({
        title: "保存失败",
        description: "请输入API Key",
        variant: "destructive",
      });
      return;
    }

    if (!config.baseUrl.trim()) {
      toast({
        title: "保存失败",
        description: "请输入API地址",
        variant: "destructive",
      });
      return;
    }

    aiService.saveConfig(config);
    toast({
      title: "保存成功",
      description: "AI服务配置已保存",
      variant: "success",
    });
  };

  // 重置配置
  const resetConfig = () => {
    setConfig({
      apiKey: '',
      baseUrl: '',
      model: '',
      provider: 'openai'
    });
    setTestResult(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          AI优化服务配置
        </CardTitle>
        <CardDescription>
          配置AI服务以启用提示词优化和生成功能。支持OpenAI、Anthropic等主流服务商。
          <br />
          <span className="text-amber-600 text-sm mt-1 block">
            ⚠️ 注意：Google Gemini原生API在浏览器环境下受CORS限制，建议使用"硅基流动"等代理服务。
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 服务提供商选择 */}
        <div className="space-y-2">
          <Label htmlFor="provider">服务提供商</Label>
          <Select
            value={config.provider}
            onValueChange={handleProviderChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择AI服务提供商" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI (GPT)</SelectItem>
              <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
              <SelectItem value="gemini">Google Gemini</SelectItem>
              <SelectItem value="siliconflow">硅基流动 (SiliconFlow)</SelectItem>
              <SelectItem value="custom">自定义服务</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* API Key */}
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              value={config.apiKey}
              onChange={(e) => handleConfigChange('apiKey', e.target.value)}
              placeholder="输入您的API Key"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* API地址 */}
        <div className="space-y-2">
          <Label htmlFor="baseUrl">API地址</Label>
          <Input
            id="baseUrl"
            value={config.baseUrl}
            onChange={(e) => handleConfigChange('baseUrl', e.target.value)}
            placeholder="API服务地址"
          />
        </div>

        {/* 模型 */}
        <div className="space-y-2">
          <Label htmlFor="model">模型名称</Label>
          <Input
            id="model"
            value={config.model}
            onChange={(e) => handleConfigChange('model', e.target.value)}
            placeholder="模型名称（如：gpt-3.5-turbo）"
          />
        </div>

        <Separator />

        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={testConnection}
              disabled={isTesting || !config.apiKey.trim()}
              variant="outline"
            >
              {isTesting ? (
                <>
                  <TestTube className="h-4 w-4 mr-2 animate-spin" />
                  测试中...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  测试连接
                </>
              )}
            </Button>
            
            {testResult && (
              <div className="flex items-center gap-1">
                {testResult === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${testResult === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {testResult === 'success' ? '连接成功' : '连接失败'}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={resetConfig}>
              重置
            </Button>
            <Button onClick={saveConfig}>
              保存配置
            </Button>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <h4 className="font-medium mb-2">使用说明：</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li>配置完成后，在新建或编辑提示词时会显示AI优化按钮</li>
            <li>AI会根据提示词工程最佳实践优化您的内容</li>
            <li>支持生成全新提示词或优化现有内容</li>
            <li>请确保API Key有足够的使用额度</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

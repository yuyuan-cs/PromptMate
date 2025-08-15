import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, XCircle, Eye, EyeOff, Sparkles, Edit3, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService, type AIConfig, getModelsForProvider, type AIModel } from '@/services/aiService';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

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
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [currentProvider, setCurrentProvider] = useState<keyof typeof presetConfigs>('openai');
  const [providerConfigs, setProviderConfigs] = useState<Record<string, Partial<AIConfig>>>({});

  // 预设配置 - 基于Cherry Studio和市场主流AI服务商
  const presetConfigs = {
    // 主流云服务商
    openai: {
      baseUrl: 'https://api.openai.com',
      model: 'gpt-4o',
      provider: 'openai' as const
    },
    anthropic: {
      baseUrl: 'https://api.anthropic.com',
      model: 'claude-3-5-sonnet-20241022',
      provider: 'anthropic' as const
    },
    gemini: {
      baseUrl: 'https://generativelanguage.googleapis.com',
      model: 'gemini-1.5-pro',
      provider: 'gemini' as const
    },
    // 国内主流服务商
    deepseek: {
      baseUrl: 'https://api.deepseek.com',
      model: 'deepseek-chat',
      provider: 'custom' as const
    },
    kimi: {
      baseUrl: 'https://api.moonshot.cn',
      model: 'moonshot-v1-8k',
      provider: 'custom' as const
    },
    doubao: {
      baseUrl: 'https://ark.cn-beijing.volces.com',
      model: 'doubao-pro-4k',
      provider: 'custom' as const
    },
    qwen: {
      baseUrl: 'https://dashscope.aliyuncs.com',
      model: 'qwen-turbo',
      provider: 'custom' as const
    },
    baidu: {
      baseUrl: 'https://aip.baidubce.com',
      model: 'ernie-4.0-8k',
      provider: 'custom' as const
    },
    // 第三方API聚合服务
    siliconflow: {
      baseUrl: 'https://api.siliconflow.cn',
      model: 'deepseek-ai/DeepSeek-V2.5',
      provider: 'custom' as const
    },
    oneapi: {
      baseUrl: 'https://api.oneapi.com',
      model: 'gpt-4o',
      provider: 'custom' as const
    },
    // 国际其他服务商
    groq: {
      baseUrl: 'https://api.groq.com',
      model: 'llama-3.1-70b-versatile',
      provider: 'custom' as const
    },
    perplexity: {
      baseUrl: 'https://api.perplexity.ai',
      model: 'llama-3.1-sonar-large-128k-online',
      provider: 'custom' as const
    },
    together: {
      baseUrl: 'https://api.together.xyz',
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      provider: 'custom' as const
    },
    // 本地部署
    ollama: {
      baseUrl: 'http://localhost:11434',
      model: 'llama3.1:8b',
      provider: 'custom' as const
    },
    lmstudio: {
      baseUrl: 'http://localhost:1234',
      model: 'local-model',
      provider: 'custom' as const
    },
    // 自定义服务
    custom: {
      baseUrl: 'https://api.openai.com',
      model: 'gpt-4o',
      provider: 'custom' as const
    }
  };

  // 加载已保存的配置
  useEffect(() => {
    // 加载所有提供商的配置
    const savedProviderConfigs: Record<string, Partial<AIConfig>> = {};
    Object.keys(presetConfigs).forEach(provider => {
      const savedConfig = localStorage.getItem(`ai-config-${provider}`);
      if (savedConfig) {
        try {
          savedProviderConfigs[provider] = JSON.parse(savedConfig);
        } catch (error) {
          console.error(`Failed to parse config for ${provider}:`, error);
        }
      }
    });
    setProviderConfigs(savedProviderConfigs);

    // 加载当前活跃的配置
    const savedConfig = aiService.getConfig();
    if (savedConfig) {
      // 找到匹配的提供商
      const provider = Object.keys(presetConfigs).find(p => {
        const preset = presetConfigs[p as keyof typeof presetConfigs];
        return preset.baseUrl === savedConfig.baseUrl || p === 'custom';
      }) as keyof typeof presetConfigs || 'openai';
      
      setCurrentProvider(provider);
      setConfig(savedConfig);
      
      // 加载对应服务商的模型列表
      const models = getModelsForProvider(provider);
      setAvailableModels(models);
      
      // 检查当前模型是否在预设列表中
      const isModelInList = models.some(model => model.id === savedConfig.model);
      setIsCustomModel(!isModelInList && savedConfig.model !== '');
    } else {
      // 使用OpenAI的默认配置
      const defaultConfig = {
        ...presetConfigs.openai,
        apiKey: savedProviderConfigs.openai?.apiKey || ''
      };
      setCurrentProvider('openai');
      setConfig(defaultConfig);
      setAvailableModels(getModelsForProvider('openai'));
    }
  }, []);

  // 处理提供商变更
  const handleProviderChange = (provider: keyof typeof presetConfigs) => {
    // 保存当前提供商的配置
    if (currentProvider && config.apiKey) {
      const configToSave = { ...config };
      localStorage.setItem(`ai-config-${currentProvider}`, JSON.stringify(configToSave));
      setProviderConfigs(prev => ({ ...prev, [currentProvider]: configToSave }));
    }

    const preset = presetConfigs[provider];
    const models = getModelsForProvider(provider);
    const savedProviderConfig = providerConfigs[provider];
    
    setCurrentProvider(provider);
    setAvailableModels(models);
    setIsCustomModel(false);
    
    // 使用已保存的配置或默认配置
    const newConfig = {
      ...preset,
      apiKey: savedProviderConfig?.apiKey || '',
      model: savedProviderConfig?.model || preset.model,
      baseUrl: savedProviderConfig?.baseUrl || preset.baseUrl
    };
    
    setConfig(newConfig);
    
    // 检查模型是否为自定义
    if (savedProviderConfig?.model) {
      const isModelInList = models.some(model => model.id === savedProviderConfig.model);
      setIsCustomModel(!isModelInList);
    }
    
    setTestResult(null);
  };

  // 处理模型变更
  const handleModelChange = (modelId: string) => {
    if (modelId === 'custom') {
      setIsCustomModel(true);
      return;
    }
    setIsCustomModel(false);
    setConfig(prev => ({ ...prev, model: modelId }));
  };

  // 处理自定义模型输入
  const handleCustomModelChange = (customModel: string) => {
    setConfig(prev => ({ ...prev, model: customModel }));
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
  const handleSave = async () => {
    try {
      // 保存到全局配置
      aiService.saveConfig(config);
      
      // 保存到当前提供商的专用配置
      localStorage.setItem(`ai-config-${currentProvider}`, JSON.stringify(config));
      setProviderConfigs(prev => ({ ...prev, [currentProvider]: config }));
      
      toast({
        title: "配置已保存",
        description: `${presetConfigs[currentProvider]?.baseUrl?.includes('openai') ? 'OpenAI' : currentProvider} 服务配置已成功保存`
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: "保存配置时出现错误",
        variant: "destructive"
      });
    }
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
    <Card className="w-full max-w-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <TestTube className="h-5 w-5" />
          AI优化服务配置
        </CardTitle>
        <CardDescription className="text-sm">
          配置AI服务以启用提示词优化和生成功能。支持国内外主流AI服务商、本地部署和第三方API聚合服务。
          <br />
          <span className="text-blue-600 text-xs mt-1 block">
            💡 推荐：国内用户可优先选择DeepSeek、Kimi等国内服务，或使用硅基流动等聚合服务。
          </span>
          <span className="text-amber-600 text-xs mt-1 block">
            ⚠️ 注意：部分国外服务可能需要网络代理才能访问。
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">
        {/* 服务提供商选择 */}
        <div className="space-y-2">
          <Label htmlFor="provider">服务提供商</Label>
          <Select
            value={currentProvider}
            onValueChange={handleProviderChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择AI服务提供商" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] w-[350px] max-w-[90vw]">
              {/* 主流云服务商 */}
              <SelectItem value="openai">🤖 OpenAI (GPT-4o)</SelectItem>
              <SelectItem value="anthropic">🧠 Anthropic (Claude-3.5)</SelectItem>
              <SelectItem value="gemini">💎 Google Gemini</SelectItem>
              
              {/* 国内主流服务商 */}
              <SelectItem value="deepseek">🔍 DeepSeek</SelectItem>
              <SelectItem value="kimi">🌙 Kimi (月之暗面)</SelectItem>
              <SelectItem value="doubao">🎯 豆包 (字节跳动)</SelectItem>
              <SelectItem value="qwen">☁️ 通义千问 (阿里云)</SelectItem>
              <SelectItem value="baidu">🔥 文心一言 (百度)</SelectItem>
              
              {/* 第三方API聚合 */}
              <SelectItem value="siliconflow">⚡ 硅基流动</SelectItem>
              <SelectItem value="oneapi">🔗 One API</SelectItem>
              
              {/* 国际其他服务商 */}
              <SelectItem value="groq">⚡ Groq</SelectItem>
              <SelectItem value="perplexity">🔍 Perplexity</SelectItem>
              <SelectItem value="together">🤝 Together AI</SelectItem>
              
              {/* 本地部署 */}
              <SelectItem value="ollama">🏠 Ollama (本地)</SelectItem>
              <SelectItem value="lmstudio">💻 LM Studio (本地)</SelectItem>
              
              {/* 自定义 */}
              <SelectItem value="custom">⚙️ 自定义服务</SelectItem>
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
          <Label htmlFor="model" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            模型选择
          </Label>
          
          {/* 模型选择下拉框 */}
          <Select
            value={isCustomModel ? 'custom' : config.model}
            onValueChange={handleModelChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择模型或自定义输入" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] w-[400px] max-w-[90vw]">
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex flex-col items-start w-full min-w-0">
                    <div className="flex items-center gap-2 w-full min-w-0">
                      <span className="font-medium truncate flex-1">{model.name}</span>
                      {model.contextLength && (
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {model.contextLength >= 1000000 
                            ? `${Math.round(model.contextLength / 1000000)}M` 
                            : model.contextLength >= 1000 
                            ? `${Math.round(model.contextLength / 1000)}K`
                            : model.contextLength}
                        </Badge>
                      )}
                    </div>
                    {model.description && (
                      <span className="text-xs text-muted-foreground truncate w-full">{model.description}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
              <Separator className="my-1" />
              <SelectItem value="custom">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  <span>自定义模型...</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          {/* 自定义模型输入框 */}
          {isCustomModel && (
            <div className="mt-2">
              <Input
                value={config.model}
                onChange={(e) => handleCustomModelChange(e.target.value)}
                placeholder="输入自定义模型名称，例如：gpt-4o-2024-08-06"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                💡 提示：请确保输入的模型名称与API服务商支持的模型完全一致
              </p>
            </div>
          )}
          
          {/* 当前选中模型的详细信息 */}
          {!isCustomModel && availableModels.length > 0 && (
            <div className="mt-2 p-3 bg-muted/30 rounded-lg">
              {(() => {
                const selectedModel = availableModels.find(m => m.id === config.model);
                if (!selectedModel) return null;
                return (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{selectedModel.name}</span>
                      {selectedModel.contextLength && (
                        <Badge variant="outline" className="text-xs">
                          上下文: {selectedModel.contextLength >= 1000000 
                            ? `${Math.round(selectedModel.contextLength / 1000000)}M` 
                            : selectedModel.contextLength >= 1000 
                            ? `${Math.round(selectedModel.contextLength / 1000)}K`
                            : selectedModel.contextLength} tokens
                        </Badge>
                      )}
                    </div>
                    {selectedModel.description && (
                      <p className="text-xs text-muted-foreground">{selectedModel.description}</p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* API Key 获取帮助链接 */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-600 dark:text-blue-400">💡</span>
            <span className="font-medium text-blue-800 dark:text-blue-300">获取 API Key</span>
          </div>
          {(() => {
            const helpLinks: Record<string, { name: string; url: string; description: string }> = {
              openai: { 
                name: 'OpenAI API Keys', 
                url: 'https://platform.openai.com/api-keys', 
                description: '注册OpenAI账户并创建API密钥' 
              },
              anthropic: { 
                name: 'Anthropic Console', 
                url: 'https://console.anthropic.com/', 
                description: '访问Anthropic控制台获取Claude API密钥' 
              },
              gemini: { 
                name: 'Google AI Studio', 
                url: 'https://makersuite.google.com/app/apikey', 
                description: '在Google AI Studio中获取Gemini API密钥' 
              },
              deepseek: { 
                name: 'DeepSeek Platform', 
                url: 'https://platform.deepseek.com/api_keys', 
                description: '注册DeepSeek账户并获取API密钥' 
              },
              kimi: { 
                name: 'Moonshot AI', 
                url: 'https://platform.moonshot.cn/console/api-keys', 
                description: '访问月之暗面平台获取Kimi API密钥' 
              },
              doubao: { 
                name: '火山引擎', 
                url: 'https://console.volcengine.com/ark/', 
                description: '在火山引擎控制台获取豆包API密钥' 
              },
              qwen: { 
                name: '阿里云百炼', 
                url: 'https://bailian.console.aliyun.com/', 
                description: '在阿里云百炼平台获取通义千问API密钥' 
              },
              baidu: { 
                name: '百度智能云', 
                url: 'https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application', 
                description: '在百度智能云获取文心一言API密钥' 
              },
              siliconflow: { 
                name: 'SiliconFlow', 
                url: 'https://cloud.siliconflow.cn/account/ak', 
                description: '注册硅基流动账户并获取API密钥' 
              },
              oneapi: { 
                name: 'One API', 
                url: 'https://github.com/songquanpeng/one-api', 
                description: '部署One API服务并配置相关密钥' 
              },
              groq: { 
                name: 'Groq Console', 
                url: 'https://console.groq.com/keys', 
                description: '在Groq控制台获取API密钥' 
              },
              perplexity: { 
                name: 'Perplexity API', 
                url: 'https://www.perplexity.ai/settings/api', 
                description: '在Perplexity设置中获取API密钥' 
              },
              together: { 
                name: 'Together AI', 
                url: 'https://api.together.xyz/settings/api-keys', 
                description: '在Together AI平台获取API密钥' 
              },
              ollama: { 
                name: 'Ollama', 
                url: 'https://ollama.ai/', 
                description: '下载并安装Ollama，无需API密钥' 
              },
              lmstudio: { 
                name: 'LM Studio', 
                url: 'https://lmstudio.ai/', 
                description: '下载LM Studio并加载本地模型' 
              },
              custom: { 
                name: '自定义服务', 
                url: '', 
                description: '请参考您的API服务商文档获取密钥' 
              }
            };
            
            const currentHelp = helpLinks[currentProvider];
            if (!currentHelp) return null;
            
            return (
              <div className="text-blue-700 dark:text-blue-300">
                <p className="mb-1">{currentHelp.description}</p>
                {currentHelp.url && (
                  <a 
                    href={currentHelp.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline text-sm"
                  >
                    🔗 {currentHelp.name}
                  </a>
                )}
              </div>
            );
          })()}
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
            <Button onClick={handleSave}>
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
            <li>国内服务：DeepSeek、Kimi、豆包等无需代理，速度快</li>
            <li>聚合服务：硅基流动、One API等支持多种模型</li>
            <li>本地部署：Ollama、LM Studio隐私安全，无网络费用</li>
            <li>请确保API Key有足够的使用额度</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

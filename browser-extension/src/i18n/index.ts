import * as React from 'react';

// Language state management
let currentLanguage = 'zh-CN';
let languageChangeListeners: (() => void)[] = [];

// Initialize language from storage
const initializeLanguage = async () => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    try {
      const result = await chrome.storage.local.get(['preferredLanguage']);
      if (result.preferredLanguage) {
        currentLanguage = result.preferredLanguage;
      } else {
        // Detect from browser language
        const browserLang = chrome.i18n ? chrome.i18n.getUILanguage() : navigator.language;
        currentLanguage = browserLang.startsWith('en') ? 'en-US' : 'zh-CN';
      }
      
      // Notify all listeners after initialization
      languageChangeListeners.forEach(listener => listener());
    } catch (error) {
      console.error('Failed to load language preference:', error);
    }
  }
};

// Initialize on load
initializeLanguage();

// Language messages
const messages: Record<string, Record<string, string>> = {
  'zh-CN': {
    // Common
    'common_confirm': '确认',
    'common_cancel': '取消',
    'common_save': '保存',
    'common_delete': '删除',
    'common_edit': '编辑',
    'common_create': '创建',
    'common_search': '搜索',
    'common_loading': '加载中...',
    'common_settings': '设置',
    'common_language': '语言',
    'common_back': '返回',
    
    // Prompts
    'prompts_newPrompt': '新建提示词',
    'prompts_editPrompt': '编辑提示词',
    'prompts_savePrompt': '保存提示词',
    'prompts_title': '标题',
    'prompts_content': '内容',
    'prompts_description': '描述',
    'prompts_category': '分类',
    'prompts_noCategory': '无分类',
    'prompts_addToFavorites': '添加到收藏',
    'prompts_tags': '标签',
    'prompts_titlePlaceholder': '输入标题',
    'prompts_contentPlaceholder': '输入内容',
    'prompts_descriptionPlaceholder': '输入描述（可选）',
    'prompts_tagsPlaceholder': '输入标签后按回车添加',
    'prompts_cancel': '取消',
    'prompts_save': '保存更改',
    'prompts_create': '创建',
    'prompts_saving': '保存中...',
    'prompts_saveFailed': '保存失败，请重试',
    'prompts_unsavedChanges': '您有未保存的更改，确定要离开吗？',
    'prompts_renderError': '渲染错误',
    'prompts_back': '返回',
    
    // AI
    'ai_optimize': 'AI优化',
    'ai_generate': 'AI生成',
    'ai_configureAI': '配置AI',
    'ai_optimizing': '优化中...',
    'ai_generating': '生成中...',
    'ai_optimizeResult': 'AI 优化结果',
    'ai_processing': '正在处理...',
    'ai_realtimeResult': '实时优化结果',
    'ai_copied': '已复制',
    'ai_copy': '复制',
    'ai_optimizedPrompt': '优化后的提示词',
    'ai_explanation': '优化说明',
    'ai_suggestions': '建议',
    'ai_cancel': '取消',
    'ai_applyOptimization': '应用优化',
    'ai_copyFailed': '复制失败',
    'ai_close': '关闭',
    'ai_regenerate': '重新生成',
    'ai_interrupted': '已中断',
    'ai_lastOptimizeResult': '上次AI优化结果',
    
    
    // AI Settings
    'ai_settings_title': 'AI优化服务配置',
    'ai_settings_description': '配置AI服务以启用提示词优化和生成功能。支持国内外主流AI服务商、本地部署和第三方API聚合服务。',
    'ai_settings_tip': '💡 推荐：国内用户可优先选择DeepSeek、Kimi等国内服务，或使用硅基流动等聚合服务。',
    'ai_settings_warning': '⚠️ 注意：部分国外服务可能需要网络代理才能访问。',
    'ai_settings_provider': '服务提供商',
    'ai_settings_selectProvider': '选择AI服务提供商',
    'ai_settings_apiKey': 'API Key',
    'ai_settings_apiKeyPlaceholder': '输入您的API Key',
    'ai_settings_apiUrl': 'API地址',
    'ai_settings_apiUrlPlaceholder': 'API服务地址',
    'ai_settings_modelSelection': '模型选择',
    'ai_settings_selectModel': '选择模型或自定义输入',
    'ai_settings_customModel': '自定义模型...',
    'ai_settings_customModelPlaceholder': '输入自定义模型名称，例如：gpt-4o-2024-08-06',
    'ai_settings_customModelTip': '💡 提示：请确保输入的模型名称与API服务商支持的模型完全一致',
    'ai_settings_context': '上下文',
    'ai_settings_tokens': 'tokens',
    'ai_settings_getApiKey': '获取 API Key',
    'ai_settings_testConnection': '测试连接',
    'ai_settings_testing': '测试中...',
    'ai_settings_connectionSuccess': '连接成功',
    'ai_settings_connectionFailed': '连接失败',
    'ai_settings_reset': '重置',
    'ai_settings_saveConfig': '保存配置',
    'ai_settings_usageInstructions': '使用说明：',
    'ai_settings_instruction1': '配置完成后，在新建或编辑提示词时会显示AI优化按钮',
    'ai_settings_instruction2': 'AI会根据提示词工程最佳实践优化您的内容',
    'ai_settings_instruction3': '支持生成全新提示词或优化现有内容',
    'ai_settings_instruction4': '国内服务：DeepSeek、Kimi、豆包等无需代理，速度快',
    'ai_settings_instruction5': '聚合服务：硅基流动、One API等支持多种模型',
    'ai_settings_instruction6': '本地部署：Ollama、LM Studio隐私安全，无网络费用',
    'ai_settings_instruction7': '请确保API Key有足够的使用额度',
    'ai_settings_enterApiKey': '请先输入API Key',
    'ai_settings_configSuccess': 'AI服务配置正确，可以正常使用',
    'ai_settings_configFailed': '无法连接到AI服务，请检查配置信息',
    'ai_settings_checkConfig': '请检查配置信息',
    'ai_settings_saveSuccess': '服务配置已成功保存',
    'ai_settings_saveError': '保存配置时出现错误',
    
    // SidePanel
    'sidepanel_searchPlaceholder': '搜索提示词...',
    'sidepanel_showAll': '显示全部',
    'sidepanel_favoritesOnly': '仅收藏',
    'sidepanel_all': '全部',
    'sidepanel_favorites': '收藏',
    'sidepanel_recent': '最近',
    'sidepanel_newCategory': '新建',
    'sidepanel_loadingEditor': '加载编辑器...',
    'sidepanel_editViewError': '编辑视图错误',
    'sidepanel_backToList': '返回列表',
    'sidepanel_loading': '加载中...',
    'sidepanel_noMatches': '没有匹配的提示词',
    'sidepanel_noMatchesHint': '尝试调整搜索关键词、切换分类或清除标签/收藏筛选',
    'sidepanel_new': '新建',
    'sidepanel_settings': '设置',
    'sidepanel_newCategoryTitle': '新建分类',
    'sidepanel_categoryNamePlaceholder': '输入分类名称',
    'sidepanel_cancel': '取消',
    'sidepanel_create': '创建',
    'sidepanel_componentLoadFailed': '组件加载失败',
    'sidepanel_reload': '重新加载',
    'sidepanel_invalidPromptData': '提示词数据无效',
    'sidepanel_importFailed': '导入文件失败',
    
    // Settings
    'settings.title': '设置',
    'settings.general': '常规设置',
    'settings.language': '语言',
    'settings.languageDescription': '选择界面显示语言',
    'settings.interfaceLanguage': '界面语言',
    'settings.aiConfiguration': 'AI配置',
    'settings.aiConfigurationDescription': '配置AI服务以启用提示词优化功能',
    'settings.appearance': '外观',
    'settings.appearanceDescription': '自定义界面主题和显示选项',
    'settings.theme': '主题',
    'settings.themeLight': '浅色',
    'settings.themeDark': '深色',
    'settings.themeAuto': '跟随系统',
    'settings.fontSize': '字体大小',
    'settings.compactMode': '紧凑模式',
    'settings.functionality': '功能',
    'settings.functionalityDescription': '配置扩展功能',
    'settings.autoInject': '自动注入',
    'settings.showNotifications': '显示通知',
    'settings.enableShortcuts': '启用快捷键',
    'settings.showUsageStats': '显示使用统计',
    'settings.sitePermissions': '站点权限',
    'settings.sitePermissionsDescription': '管理扩展在不同站点的使用权限',
    'settings.togglePermission': '切换权限',
    'settings.addDomain': '添加域名',
    'settings.addToAllowList': '添加到白名单',
    'settings.allowedSites': '允许的站点',
    'settings.dataManagement': '数据管理',
    'settings.dataManagementDescription': '导入、导出和管理您的数据',
    'settings.currentSite': '当前站点',
    'settings.block': '阻止',
    'settings.allow': '允许',
    'settings.add': '添加',
    'settings.confirmClearData': '确定要清除所有数据吗？此操作不可恢复！',
    'settings.exporting': '导出中...',
    'settings.importing': '导入中...',
    'settings.clearing': '清理中...',
    'settings.exportData': '导出数据',
    'settings.importData': '导入数据',
    'settings.clearAllData': '清除所有数据',
    'settings.prompts': '提示词',
    'settings.categories': '分类',
    'settings.totalUsage': '总使用次数',
    'settings.lastUpdated': '最后更新',
    'settings.autoSave': '自动保存',
    'settings.autoExport': '自动导出',
    'settings.desktopSync': '桌面端同步',
    'settings.desktopSyncDescription': '与桌面应用同步数据',
    'settings.lastSync': '上次同步',
    'settings.never': '从未',
    'settings.syncNow': '立即同步',
    'settings.syncing': '同步中',
    'settings.dangerZone': '危险操作',
    'settings.security': '安全',
    'settings_advanced': '高级',
    'settings_sync': '数据同步',
    'settings.enhanced.title': '增强功能',
    'settings.sync.title': '数据同步',

    // Sync Settings
    'sync.status.title': '同步状态',
    'sync.status.connecting': '连接中',
    'sync.status.connected': '已连接',
    'sync.status.disconnected': '未连接',
    'sync.status.last_sync': '上次同步',
    'sync.method.title': '同步方式',
    'sync.method.native_messaging.title': 'Native Messaging',
    'sync.method.native_messaging.description': '通过原生消息传递与桌面应用同步',
    'sync.method.file_sync.title': '文件同步',
    'sync.method.file_sync.description': '通过共享文件进行数据同步',
    'sync.method.manual_sync.title': '手动同步',
    'sync.method.manual_sync.description': '手动导入导出数据文件',
    'sync.config.file_sync.title': '文件同步配置',
    'sync.config.file_path': '文件路径',
    'sync.config.file_path_placeholder': '例如: C:\\Users\\用户名\\Documents\\promptmate-data.json',
    'sync.config.file_path_description': '指定用于同步的文件路径',
    'sync.config.interval_seconds': '同步间隔',
    'sync.config.interval_10s': '10秒',
    'sync.config.interval_30s': '30秒',
    'sync.config.interval_1m': '1分钟',
    'sync.config.interval_5m': '5分钟',
    'sync.config.interval_10m': '10分钟',
    'sync.options.title': '同步选项',
    'sync.options.auto_sync': '自动同步',
    'sync.options.auto_export_on_change': '变更时自动导出',
    'sync.actions.title': '同步操作',
    'sync.actions.test_connection': '测试连接',
    'sync.actions.testing_connection_in_progress': '测试中',
    'sync.actions.sync_now': '立即同步',
    'sync.actions.syncing_in_progress': '同步中',
    'sync.error.native_host_connection_failed': 'Native Host 连接失败',
    'sync.error.invalid_file_path': '无效的文件路径',
    'sync.error.connection_test_failed': '连接测试失败',
    'sync.error.sync_failed_retry': '同步失败，请重试',
    'sync.help.native_messaging.title': 'Native Messaging:',
    'sync.help.native_messaging.description': '需要安装桌面应用并配置原生消息传递',
    'sync.help.file_sync.title': '文件同步:',
    'sync.help.file_sync.description': '通过监控指定文件变化实现实时同步',
    'sync.help.manual_sync.title': '手动同步:',
    'sync.help.manual_sync.description': '通过导入导出功能手动管理数据',

    // Variable Form
    'variable.no_variables_found': '当前提示词中没有发现变量占位符',
    'variable.supported_formats': '支持的格式：',
    'variable.statistics': '变量统计',
    'variable.total': '总计',
    'variable.unique': '唯一',
    'variable.completed': '已完成',
    'variable.pending_count': '个待填写',
    'variable.form_title': '变量填写',
    'variable.fill_example': '填充示例',
    'variable.clear_all': '清空',
    'variable.search_suggestions': '搜索建议...',
    'variable.no_suggestions_found': '没有找到建议',
    'variable.hide_preview': '隐藏预览',
    'variable.show_preview': '显示预览',
    'variable.copy_preview': '复制预览内容',
    'variable.live_preview': '实时预览',
    'variable.replacement_status': '变量替换情况：',
    'variable.preview_placeholder': '填写变量后，这里将显示替换后的内容',
    'variable.plain_text': '纯文本',
    'variable.history': '历史记录',
    'variable.characters': '字符',
    'variable.required_fields': '请填写必需变量',
    'variable.copying': '复制中...',
    'variable.copy': '复制',
    'variable.injecting': '注入中...',
    'variable.inject': '注入到页面',
    'variable.please_enter': '请输入',

    // Missing translations
    'prompts_promptContent': '提示词内容',
    'settings.enhanced.description': '配置增强功能以获得更好的使用体验',
    'settings.common.title': '常规设置',

    // Enhanced Settings
    'enhanced_settings_title': '增强功能设置',
    'enhanced_settings_description': '管理和配置PromptMate的增强功能，以获得更好的使用体验。',
    'enhanced_settings_warning_title': '实验性功能警告',
    'enhanced_settings_warning_content': '请注意，启用这些高级功能可能会影响应用的性能或稳定性。建议仅在了解相关风险后使用。',
    'enhanced_settings_features_title': '功能列表',
    'feature_context_menu_title': '右键菜单增强',
    'feature_context_menu_description': '在浏览网页时，通过右键菜单快速使用PromptMate功能，例如，将选中的文本作为变量填充到提示词中。',
    'feature_omnibox_title': '地址栏快速搜索',
    'feature_omnibox_description': '在浏览器的地址栏（Omnibox）中输入“pm”加空格，然后输入关键词，即可快速搜索您的提示词。',
    'feature_page_summary_title': '网页内容摘要与分析',
    'feature_page_summary_description': '（需配置AI服务）对当前网页内容进行摘要或分析，帮助您快速获取关键信息。',
    'feature_auto_activate_title': '特定网站自动激活',
    'feature_auto_activate_description': '在访问特定网站（如ChatGPT、Bard等）时，自动激活扩展面板，方便您随时使用。',
    
    // Categories
    'categories_all': '全部',
    'categories_favorites': '收藏',
    'categories_recent': '最近使用',
    
    // Error messages
    'error_componentRuntime': '组件运行时错误',
    'error_asyncOperation': '异步操作失败',
    'error_deletePromptFailed': '删除提示词失败',
    
    // Confirmation messages
    'confirm_deletePrompt': '确定要删除提示词"{title}"吗？此操作无法撤销。',
    
    // Success messages
    'success_promptDeleted': '提示词已删除',
    
    // Search and empty states
    'search_noResults': '未找到匹配的提示词',
    
    // Feature placeholders
    'feature_notImplemented': '功能暂未实现',
    'feature_addCategory': '添加分类',
    
    // Instructions and help text
    'instruction_clickToCreate': '点击"新建"创建您的第一个提示词',
    'instruction_aiUsage': '使用说明：',
    'instruction_aiConfig': '配置完成后，在新建或编辑提示词时会显示AI优化按钮',
    'instruction_aiOptimize': 'AI会根据提示词工程最佳实践优化您的内容',
    'instruction_aiGenerate': '支持生成全新提示词或优化现有内容',
    'instruction_domesticService': '国内服务：DeepSeek、Kimi、豆包等无需代理，速度快',
    
    // Actions and operations
    'action_copy': '复制',
    'action_inject': '注入',
    'action_favorite': '收藏',
    'action_unfavorite': '取消收藏',
    'action_back': '返回',
    'action_close': '关闭',
    
    // Toast messages
    'toast_copied': '已复制到剪贴板',
    'toast_copyFailed': '复制失败',
    'toast_injected': '文本已注入到页面',
    'toast_injectFailed': '注入失败',
    'toast_injectFailedRefresh': '注入失败：请刷新页面后重试',
    'toast_injectFailedNoInput': '注入失败：未找到输入框',
    'toast_injectFailedNoPage': '注入失败：无法获取当前页面',
    'toast_favoriteAdded': '已添加到收藏',
    'toast_favoriteRemoved': '已取消收藏',
    'toast_operationFailed': '操作失败',
    'toast_saveFailed': '保存失败',
    'toast_promptCreated': '提示词创建成功',
    'toast_promptUpdated': '提示词更新成功',
    'toast_promptNotFound': '提示词不存在',
    'toast_categoryCreated': '分类 "{name}" 创建成功',
    'toast_categoryCreateFailed': '添加分类失败',
    
    // Validation
    'validation_required': 'This field is required',
    'validation_titleRequired': 'Title cannot be empty',
    'validation_contentRequired': 'Content cannot be empty',

    // DataManager
    'dataManager_exportFailed': '导出失败，请重试',
    'dataManager_invalidFormat': '无效的数据格式：缺少提示词数据',
    'dataManager_jsonParseError': '文件格式错误，请选择有效的JSON文件',
    'dataManager_importFailed': '导入失败：{message}',
    'dataManager_clearFailed': '清除数据失败，请重试',
    'dataManager_backupFilePrefix': 'promptmate-backup-',
    
    // UI labels
    'ui_fullContent': '完整内容',
    'ui_variableInfo': '变量信息',
    'ui_usageCount': '使用次数',
    'ui_createTime': '创建时间',
    'ui_withVariables': '含变量',
    'ui_copy': '复制',
    'ui_inject': '注入',
    'ui_edit': '编辑',
    'ui_delete': '删除',
    'ui_copyWithVariables': '复制 (含变量)',
    'ui_injectWithVariables': '注入 (含变量)',
    'ui_noPrompts': '暂无提示词',
    'ui_createFirstPrompt': '点击"新建"创建您的第一个提示词',
    'ui_copying': '复制中...',
    'ui_injecting': '注入中...',
    'ui_injectToPage': '注入到页面',
    'ui_previewContent': '预览内容',
    'ui_fillVariables': '填写变量后这里会显示最终的提示词内容...',
    'ui_sortBy': '排序',
    
    // Sort options
    'sort_relevance': '相关性',
    'sort_usage': '使用次数',
    'sort_updated': '更新时间',
    'sort_created': '创建时间'
  },
  'en-US': {
    // Common
    'common_confirm': 'Confirm',
    'common_cancel': 'Cancel',
    'common_save': 'Save',
    'common_delete': 'Delete',
    'common_edit': 'Edit',
    'common_create': 'Create',
    'common_search': 'Search',
    'common_loading': 'Loading...',
    'common_settings': 'Settings',
    'common_language': 'Language',
    'common_back': 'Back',
    
    // Prompts
    'prompts_newPrompt': 'New Prompt',
    'prompts_editPrompt': 'Edit Prompt',
    'prompts_savePrompt': 'Save Prompt',
    'prompts_title': 'Title',
    'prompts_content': 'Content',
    'prompts_description': 'Description',
    'prompts_category': 'Category',
    'prompts_noCategory': 'No Category',
    'prompts_addToFavorites': 'Add to Favorites',
    'prompts_tags': 'Tags',
    'prompts_titlePlaceholder': 'Enter title',
    'prompts_contentPlaceholder': 'Enter content',
    'prompts_descriptionPlaceholder': 'Enter description (optional)',
    'prompts_tagsPlaceholder': 'Enter tag and press Enter to add',
    'prompts_cancel': 'Cancel',
    'prompts_save': 'Save Changes',
    'prompts_create': 'Create',
    'prompts_saving': 'Saving...',
    'prompts_saveFailed': 'Save failed, please try again',
    'prompts_unsavedChanges': 'You have unsaved changes, are you sure you want to leave?',
    'prompts_renderError': 'Render Error',
    'prompts_back': 'Back',
    
    // AI
    'ai_optimize': 'AI Optimize',
    'ai_generate': 'AI Generate',
    'ai_configureAI': 'Configure AI',
    'ai_optimizing': 'Optimizing...',
    'ai_generating': 'Generating...',
    'ai_optimizeResult': 'AI Optimization Result',
    'ai_processing': 'Processing...',
    'ai_realtimeResult': 'Real-time Optimization Result',
    'ai_copied': 'Copied',
    'ai_copy': 'Copy',
    'ai_optimizedPrompt': 'Optimized Prompt',
    'ai_explanation': 'Explanation',
    'ai_suggestions': 'Suggestions',
    'ai_cancel': 'Cancel',
    'ai_applyOptimization': 'Apply Optimization',
    'ai_copyFailed': 'Copy failed',
    'ai_close': 'Close',
    'ai_regenerate': 'Regenerate',
    'ai_interrupted': 'Interrupted',
    'ai_lastOptimizeResult': 'Last AI Optimization Result',
    
    
    // AI Settings
    'ai_settings_title': 'AI Optimization Service Configuration',
    'ai_settings_description': 'Configure AI services to enable prompt optimization and generation. Supports mainstream domestic and international AI providers, local deployment, and third-party API aggregation services.',
    'ai_settings_tip': '💡 Recommended: Domestic users can prioritize DeepSeek, Kimi and other domestic services, or use aggregation services like SiliconFlow.',
    'ai_settings_warning': '⚠️ Note: Some international services may require network proxy to access.',
    'ai_settings_provider': 'Service Provider',
    'ai_settings_selectProvider': 'Select AI Service Provider',
    'ai_settings_apiKey': 'API Key',
    'ai_settings_apiKeyPlaceholder': 'Enter your API Key',
    'ai_settings_apiUrl': 'API URL',
    'ai_settings_apiUrlPlaceholder': 'API service address',
    'ai_settings_modelSelection': 'Model Selection',
    'ai_settings_selectModel': 'Select model or custom input',
    'ai_settings_customModel': 'Custom model...',
    'ai_settings_customModelPlaceholder': 'Enter custom model name, e.g.: gpt-4o-2024-08-06',
    'ai_settings_customModelTip': '💡 Tip: Please ensure the model name matches exactly with what the API provider supports',
    'ai_settings_context': 'Context',
    'ai_settings_tokens': 'tokens',
    'ai_settings_getApiKey': 'Get API Key',
    'ai_settings_testConnection': 'Test Connection',
    'ai_settings_testing': 'Testing...',
    'ai_settings_connectionSuccess': 'Connection successful',
    'ai_settings_connectionFailed': 'Connection failed',
    'ai_settings_reset': 'Reset',
    'ai_settings_saveConfig': 'Save Configuration',
    'ai_settings_usageInstructions': 'Usage Instructions:',
    'ai_settings_instruction1': 'After configuration, AI optimize button will appear when creating or editing prompts',
    'ai_settings_instruction2': 'AI will optimize your content based on prompt engineering best practices',
    'ai_settings_instruction3': 'Support generating new prompts or optimizing existing content',
    'ai_settings_instruction4': 'Domestic services: DeepSeek, Kimi, Doubao etc. require no proxy, fast speed',
    'ai_settings_instruction5': 'Aggregation services: SiliconFlow, One API etc. support multiple models',
    'ai_settings_instruction6': 'Local deployment: Ollama, LM Studio privacy secure, no network fees',
    'ai_settings_instruction7': 'Please ensure API Key has sufficient usage quota',
    'ai_settings_enterApiKey': 'Please enter API Key first',
    'ai_settings_configSuccess': 'AI service configuration is correct and ready to use',
    'ai_settings_configFailed': 'Unable to connect to AI service, please check configuration',
    'ai_settings_checkConfig': 'Please check configuration information',
    'ai_settings_saveSuccess': 'Service configuration saved successfully',
    'ai_settings_saveError': 'Error occurred while saving configuration',
    
    // SidePanel
    'sidepanel_searchPlaceholder': 'Search prompts...',
    'sidepanel_showAll': 'Show All',
    'sidepanel_favoritesOnly': 'Favorites Only',
    'sidepanel_all': 'All',
    'sidepanel_favorites': 'Favorites',
    'sidepanel_recent': 'Recent',
    'sidepanel_newCategory': 'New',
    'sidepanel_loadingEditor': 'Loading editor...',
    'sidepanel_editViewError': 'Edit view error',
    'sidepanel_backToList': 'Back to list',
    'sidepanel_loading': 'Loading...',
    'sidepanel_noMatches': 'No matching prompts',
    'sidepanel_noMatchesHint': 'Try adjusting search keywords, switching categories, or clearing tag/favorite filters',
    'sidepanel_new': 'New',
    'sidepanel_settings': 'Settings',
    'sidepanel_newCategoryTitle': 'New Category',
    'sidepanel_categoryNamePlaceholder': 'Enter category name',
    'sidepanel_cancel': 'Cancel',
    'sidepanel_create': 'Create',
    'sidepanel_componentLoadFailed': 'Component failed to load',
    'sidepanel_reload': 'Reload',
    'sidepanel_invalidPromptData': 'Invalid prompt data',
    'sidepanel_importFailed': 'File import failed',
    
    // Settings
    'settings.title': 'Settings',
    'settings.general': 'General',
    'settings.language': 'Language',
    'settings.languageDescription': 'Choose interface display language',
    'settings.interfaceLanguage': 'Inerface Language',
    'settings.aiConfiguration': 'AI Config',
    'settings.aiConfigurationDescription': 'Configure AI services to enable prompt optimization',
    'settings.appearance': 'Appearance',
    'settings.appearanceDescription': 'Customize interface theme and display options',
    'settings.theme': 'Theme',
    'settings.themeLight': 'Light',
    'settings.themeDark': 'Dark',
    'settings.themeAuto': 'System',
    'settings.fontSize': 'Font Size',
    'settings.compactMode': 'Compact Mode',
    'settings.functionality': 'Functionality',
    'settings.functionalityDescription': 'Configure extension features',
    'settings.autoInject': 'Auto Inject',
    'settings.showNotifications': 'Show Notifications',
    'settings.enableShortcuts': 'Enable Shortcuts',
    'settings.showUsageStats': 'Show Usage Stats',
    'settings.sitePermissions': 'Site Permissions',
    'settings.sitePermissionsDescription': 'Manage extension permissions for different sites',
    'settings.togglePermission': 'Toggle Permission',
    'settings.addDomain': 'Add Domain',
    'settings.addToAllowList': 'Add to Allow List',
    'settings.allowedSites': 'Allowed Sites',
    'settings.dataManagement': 'Data',
    'settings.dataManagementDescription': 'Import, export and manage your data',
    'settings.currentSite': 'Current Site',
    'settings.block': 'Block',
    'settings.allow': 'Allow',
    'settings.add': 'Add',
    'settings.confirmClearData': 'Are you sure you want to clear all data? This action cannot be undone!',
    'settings.exporting': 'Exporting...',
    'settings.importing': 'Importing...',
    'settings.clearing': 'Clearing...',
    'settings.exportData': 'Export Data',
    'settings.importData': 'Import Data',
    'settings.clearAllData': 'Clear All Data',
    'settings.prompts': 'Prompts',
    'settings.categories': 'Categories',
    'settings.totalUsage': 'Total Usage',
    'settings.lastUpdated': 'Last Updated',
    'settings.autoSave': 'Auto Save',
    'settings.autoExport': 'Auto Export',
    'settings.desktopSync': 'Desktop Sync',
    'settings.desktopSyncDescription': 'Sync data with desktop app',
    'settings.lastSync': 'Last Sync',
    'settings.never': 'Never',
    'settings.syncNow': 'Sync Now',
    'settings.syncing': 'Syncing',
    'settings.dangerZone': 'Danger Zone',
    'settings_title': 'Extension Settings',
    'settings_general': 'General Settings',
    'settings_ai': 'AI Settings',
    'settings_appearance': 'Appearance',
    'settings_theme': 'Theme',
    'settings_theme_light': 'Light',
    'settings_theme_dark': 'Dark',
    'settings_theme_system': 'System',
    'settings_compact_mode': 'Compact Mode',
    'settings_features': 'Features',
    'settings_auto_inject': 'Auto Inject (when supported)',
    'settings_show_notifications': 'Show Notifications',
    'settings_enable_shortcuts': 'Enable Keyboard Shortcuts',
    'settings_auto_export': 'Auto Export on Changes',
    'settings_data_config': 'Data Configuration',
    'settings_default_category': 'Default Category',
    'settings_default_category_placeholder': 'e.g.: general',
    'settings_max_history': 'Max History Records',
    'settings_font_size': 'Font Size',
    'settings_site_control': 'Site Control',
    'settings_site_control_desc': 'If allowlist is filled, injection will only be enabled on listed domains; otherwise blocked by blocklist. One domain per line.',
    'settings_allow_list': 'Allow List',
    'settings_allow_list_placeholder': 'e.g.:\nchat.openai.com\nclaude.ai\nmail.google.com',
    'settings_block_list': 'Block List',
    'settings_block_list_placeholder': 'e.g.:\nexample.com\ninternal.company.com',
    'settings_data_management': 'Data Management',
    'settings_export_file': 'Export to File',
    'settings_import_file': 'Import from File',
    'settings_desktop_sync': 'Desktop Sync',
    'settings_last_sync': 'Last Sync',
    'settings_not_synced': 'Not Synced',
    'settings_sync_now': 'Sync Now',
    'settings_syncing': 'Syncing...',
    'settings_clear_all_data': 'Clear All Data',
    'settings_security': 'Security',
    'settings_advanced': 'Advanced',
    'settings_sync': 'Data Sync',
    'settings.enhanced.title': 'Enhanced Features',
    'settings.sync.title': 'Data Sync',

    // Sync Settings
    'sync.status.title': 'Sync Status',
    'sync.status.connecting': 'Connecting',
    'sync.status.connected': 'Connected',
    'sync.status.disconnected': 'Disconnected',
    'sync.status.last_sync': 'Last Sync',
    'sync.method.title': 'Sync Method',
    'sync.method.native_messaging.title': 'Native Messaging',
    'sync.method.native_messaging.description': 'Sync with desktop app via native messaging',
    'sync.method.file_sync.title': 'File Sync',
    'sync.method.file_sync.description': 'Sync data through shared files',
    'sync.method.manual_sync.title': 'Manual Sync',
    'sync.method.manual_sync.description': 'Manually import/export data files',
    'sync.config.file_sync.title': 'File Sync Configuration',
    'sync.config.file_path': 'File Path',
    'sync.config.file_path_placeholder': 'e.g.: C:\\Users\\username\\Documents\\promptmate-data.json',
    'sync.config.file_path_description': 'Specify the file path for synchronization',
    'sync.config.interval_seconds': 'Sync Interval',
    'sync.config.interval_10s': '10 seconds',
    'sync.config.interval_30s': '30 seconds',
    'sync.config.interval_1m': '1 minute',
    'sync.config.interval_5m': '5 minutes',
    'sync.config.interval_10m': '10 minutes',
    'sync.options.title': 'Sync Options',
    'sync.options.auto_sync': 'Auto Sync',
    'sync.options.auto_export_on_change': 'Auto Export on Change',
    'sync.actions.title': 'Sync Actions',
    'sync.actions.test_connection': 'Test Connection',
    'sync.actions.testing_connection_in_progress': 'Testing',
    'sync.actions.sync_now': 'Sync Now',
    'sync.actions.syncing_in_progress': 'Syncing',
    'sync.error.native_host_connection_failed': 'Native Host connection failed',
    'sync.error.invalid_file_path': 'Invalid file path',
    'sync.error.connection_test_failed': 'Connection test failed',
    'sync.error.sync_failed_retry': 'Sync failed, please retry',
    'sync.help.native_messaging.title': 'Native Messaging:',
    'sync.help.native_messaging.description': 'Requires desktop app installation and native messaging configuration',
    'sync.help.file_sync.title': 'File Sync:',
    'sync.help.file_sync.description': 'Real-time sync by monitoring specified file changes',
    'sync.help.manual_sync.title': 'Manual Sync:',
    'sync.help.manual_sync.description': 'Manually manage data through import/export functions',

    // Variable Form
    'variable.no_variables_found': 'No variable placeholders found in current prompt',
    'variable.supported_formats': 'Supported formats:',
    'variable.statistics': 'Variable Statistics',
    'variable.total': 'Total',
    'variable.unique': 'Unique',
    'variable.completed': 'Completed',
    'variable.pending_count': 'pending',
    'variable.form_title': 'Variable Form',
    'variable.fill_example': 'Fill Example',
    'variable.clear_all': 'Clear All',
    'variable.search_suggestions': 'Search suggestions...',
    'variable.no_suggestions_found': 'No suggestions found',
    'variable.hide_preview': 'Hide Preview',
    'variable.show_preview': 'Show Preview',
    'variable.copy_preview': 'Copy Preview Content',
    'variable.live_preview': 'Live Preview',
    'variable.replacement_status': 'Variable replacement status:',
    'variable.preview_placeholder': 'After filling variables, the replaced content will be displayed here',
    'variable.plain_text': 'Plain Text',
    'variable.history': 'History',
    'variable.characters': 'characters',
    'variable.required_fields': 'Please fill required variables',
    'variable.copying': 'Copying...',
    'variable.copy': 'Copy',
    'variable.injecting': 'Injecting...',
    'variable.inject': 'Inject to Page',
    'variable.please_enter': 'Please enter ',

    // Missing translations
    'prompts_promptContent': 'Prompt Content',
    'settings.enhanced.description': 'Configure enhanced features for a better experience',
    'settings.common.title': 'General Settings',
    'ui_sortBy': 'Sort by',
    
    // Sort options
    'sort_relevance': 'Relevance',
    'sort_usage': 'Usage Count',
    'sort_updated': 'Updated',
    'sort_created': 'Created',

    // Enhanced Settings
    'enhanced_settings_title': 'Enhanced Feature Settings',
    'enhanced_settings_description': 'Manage and configure PromptMate\'s enhanced features for a better experience.',
    'enhanced_settings_warning_title': 'Experimental Feature Warning',
    'enhanced_settings_warning_content': 'Please note that enabling these advanced features may affect the performance or stability of the application. It is recommended to use them only after understanding the associated risks.',
    'enhanced_settings_features_title': 'Feature List',
    'feature_context_menu_title': 'Context Menu Enhancement',
    'feature_context_menu_description': 'Quickly use PromptMate features via the context menu when browsing web pages, for example, filling selected text as a variable into a prompt.',
    'feature_omnibox_title': 'Omnibox Quick Search',
    'feature_omnibox_description': 'Enter "pm" followed by a space and then your keywords in the browser\'s address bar (Omnibox) to quickly search your prompts.',
    'feature_page_summary_title': 'Page Content Summary and Analysis',
    'feature_page_summary_description': '(Requires AI service configuration) Summarize or analyze the content of the current web page to help you quickly obtain key information.',
    'feature_auto_activate_title': 'Auto-activation on Specific Sites',
    'feature_auto_activate_description': 'Automatically activate the extension panel when visiting specific websites (such as ChatGPT, Bard, etc.) for your convenience.',
    
    // Categories
    'categories_all': 'All',
    'categories_favorites': 'Favorites',
    'categories_recent': 'Recent',
    
    // Error messages
    'error_componentRuntime': 'Component runtime error',
    'error_asyncOperation': 'Async operation failed',
    'error_deletePromptFailed': 'Failed to delete prompt',
    
    // Confirmation messages
    'confirm_deletePrompt': 'Are you sure you want to delete prompt "{title}"? This action cannot be undone.',
    
    // Success messages
    'success_promptDeleted': 'Prompt deleted',
    
    // Search and empty states
    'search_noResults': 'No matching prompts found',
    
    // Feature placeholders
    'feature_notImplemented': 'Feature not implemented',
    'feature_addCategory': 'Add category',
    
    // Instructions and help text
    'instruction_clickToCreate': 'Click "Create" to create your first prompt',
    'instruction_aiUsage': 'Usage Instructions:',
    'instruction_aiConfig': 'After configuration, AI optimize button will appear when creating or editing prompts',
    'instruction_aiOptimize': 'AI will optimize your content based on prompt engineering best practices',
    'instruction_aiGenerate': 'Support generating new prompts or optimizing existing content',
    'instruction_domesticService': 'Domestic services: DeepSeek, Kimi, Doubao etc. require no proxy, fast speed',
    
    // Actions and operations
    'action_copy': 'Copy',
    'action_inject': 'Inject',
    'action_favorite': 'Favorite',
    'action_unfavorite': 'Unfavorite',
    'action_back': 'Back',
    'action_close': 'Close',
    
    // Toast messages
    'toast_copied': 'Copied to clipboard',
    'toast_copyFailed': 'Copy failed',
    'toast_injected': 'Text injected to page',
    'toast_injectFailed': 'Injection failed',
    'toast_injectFailedRefresh': 'Injection failed: Please refresh the page and try again',
    'toast_injectFailedNoInput': 'Injection failed: No input field found',
    'toast_injectFailedNoPage': 'Injection failed: Cannot access current page',
    'toast_favoriteAdded': 'Added to favorites',
    'toast_favoriteRemoved': 'Removed from favorites',
    'toast_operationFailed': 'Operation failed',
    'toast_saveFailed': 'Save failed',
    'toast_promptCreated': 'Prompt created successfully',
    'toast_promptUpdated': 'Prompt updated successfully',
    'toast_promptNotFound': 'Prompt not found',
    'toast_categoryCreated': 'Category "{name}" created successfully',
    'toast_categoryCreateFailed': 'Failed to create category',
    
    // Validation messages
    'validation_required': 'This field is required',
    'validation_titleRequired': 'Title cannot be empty',
    'validation_contentRequired': 'Content cannot be empty',
    'validation_titleContentRequired': 'Title and content are required',

    // DataManager
    'dataManager_exportFailed': 'Export failed, please try again',
    'dataManager_invalidFormat': 'Invalid data format: missing prompts data',
    'dataManager_jsonParseError': 'File format error, please select a valid JSON file',
    'dataManager_importFailed': 'Import failed: {message}',
    'dataManager_clearFailed': 'Clear data failed, please try again',
    'dataManager_backupFilePrefix': 'promptmate-backup-',
    
    // UI labels
    'ui_fullContent': 'Full Content',
    'ui_variableInfo': 'Variable Info',
    'ui_usageCount': 'Usage Count',
    'ui_createTime': 'Created',
    'ui_withVariables': 'with variables',
    'ui_copy': 'Copy',
    'ui_inject': 'Inject',
    'ui_edit': 'Edit',
    'ui_delete': 'Delete',
    'ui_copyWithVariables': 'Copy (with variables)',
    'ui_injectWithVariables': 'Inject (with variables)',
    'ui_noPrompts': 'No prompts yet',
    'ui_createFirstPrompt': 'Click "New" to create your first prompt',
    'ui_copying': 'Copying...',
    'ui_injecting': 'Injecting...',
    'ui_injectToPage': 'Inject to Page',
    'ui_previewContent': 'Preview Content',
    'ui_fillVariables': 'Fill in variables and the final prompt content will be displayed here...'
  }
};

// Translation function
export const t = (key: string, substitutions?: Record<string, string>): string => {
  const currentMessages = messages[currentLanguage] || messages['zh-CN'];
  let message = currentMessages[key] || key;
  
  // Handle substitutions
  if (substitutions) {
    Object.entries(substitutions).forEach(([placeholder, value]) => {
      message = message.replace(`{${placeholder}}`, value);
    });
  }
  
  return message;
};

// React hook for i18n with reactive updates
export const useTranslation = () => {
  const [, forceUpdate] = React.useState({});
  
  React.useEffect(() => {
    const listener = () => forceUpdate({});
    languageChangeListeners.push(listener);
    
    return () => {
      const index = languageChangeListeners.indexOf(listener);
      if (index > -1) {
        languageChangeListeners.splice(index, 1);
      }
    };
  }, []);
  
  return { t };
};

// Language detection and switching for browser extension
export const getCurrentLanguage = (): string => {
  return currentLanguage;
};

export const getSupportedLanguages = () => [
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
];

export const setLanguage = async (languageCode: string) => {
  currentLanguage = languageCode;
  
  // Save to chrome storage
  if (typeof chrome !== 'undefined' && chrome.storage) {
    try {
      await chrome.storage.local.set({ preferredLanguage: languageCode });
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }
  
  // Notify all listeners to re-render
  languageChangeListeners.forEach(listener => listener());
};

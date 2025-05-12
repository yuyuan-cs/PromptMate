import { Prompt, Category, Settings } from "../types";

// Default categories
export const defaultCategories: Category[] = [
  { id: "general", name: "通用", icon: "layout" },
  { id: "creative", name: "创意生成", icon: "palette" },
  { id: "development", name: "开发编程", icon: "fileText" },
  { id: "business", name: "商务沟通", icon: "file" },
  { id: "education", name: "教育学习", icon: "fileUp" },
  { id: "productivity", name: "生产力", icon: "settings" }
];

// Sample prompts
export const samplePrompts: Prompt[] = [
  {
    id: "1",
    title: "代码解释器",
    content: "请解释以下代码的功能和实现原理，使用简单易懂的语言：\n\n```\n[在此粘贴代码]\n```",
    category: "development",
    tags: ["代码", "解释", "编程"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    title: "故事创意生成器",
    content: "请构思一个有创意的故事，包含以下元素：[元素1]、[元素2]和[元素3]。故事类型为[类型]，适合[目标受众]阅读。",
    category: "creative",
    tags: ["写作", "创意", "故事"],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "3",
    title: "商务邮件撰写",
    content: "请帮我撰写一封关于[主题]的专业商务邮件，收件人是[收件人]。邮件语气应该[正式/友好/专业]，主要包含以下要点：\n1. [要点1]\n2. [要点2]\n3. [要点3]",
    category: "business",
    tags: ["邮件", "商务", "沟通"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "4",
    title: "学术论文结构",
    content: "请为一篇关于[主题]的学术论文创建详细大纲，包括引言、文献综述、方法论、讨论和结论等部分。请针对每个部分提供详细的子标题和内容建议。",
    category: "education",
    tags: ["学术", "论文", "写作"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "5",
    title: "会议总结生成器",
    content: "请根据以下会议记录生成一份简洁明了的会议总结：\n\n[会议记录]\n\n总结应包括：主要讨论点、做出的决策和后续行动项。",
    category: "productivity",
    tags: ["会议", "总结", "效率"],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "6",
    title: "知识提取与总结",
    content: "请帮我从以下内容中提取关键信息并总结为要点列表：\n\n[文本内容]\n\n要点应按重要性排序，并提供简洁的解释。",
    category: "general",
    tags: ["总结", "学习", "知识"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "7",
    title: "代码优化建议",
    content: "请检查以下代码并提供优化建议，重点关注性能、可读性和最佳实践：\n\n```\n[在此粘贴代码]\n```\n\n请分点说明可以改进的地方，并提供优化后的代码示例。",
    category: "development",
    tags: ["代码", "优化", "性能"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "8",
    title: "Bug修复助手",
    content: "我遇到了以下错误，请帮我诊断问题并提供解决方案：\n\n错误信息：[错误信息]\n\n代码片段：\n```\n[相关代码]\n```\n\n我期望的行为是：[期望行为]",
    category: "development",
    tags: ["bug", "调试", "错误"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "9",
    title: "社交媒体内容策划",
    content: "请为[品牌/产品]在[社交媒体平台]上策划一周的内容计划。目标受众是[目标受众]，主要目标是[目标，如提高品牌知名度/增加销售等]。\n\n每篇内容应包含：\n- 标题\n- 正文内容概要\n- 配图/视频建议\n- 最佳发布时间\n- 相关话题标签",
    category: "business",
    tags: ["社交媒体", "营销", "内容"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "10",
    title: "产品说明书编写",
    content: "请为[产品名称]编写一份详细的产品说明书，包含以下部分：\n1. 产品概述\n2. 核心功能与特点\n3. 技术规格\n4. 使用方法/安装指南\n5. 注意事项与维护\n6. 常见问题解答\n7. 售后服务信息",
    category: "business",
    tags: ["产品", "文案", "说明书"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "11",
    title: "学习计划制定",
    content: "请为我制定一个学习[主题/技能]的详细计划。我的当前水平是[初学者/中级/高级]，每周可以投入[小时数]学习。我的学习目标是[具体目标]，希望在[时间期限]内达成。\n\n请提供：\n1. 阶段性学习目标\n2. 每周学习内容安排\n3. 推荐的学习资源\n4. 进度跟踪方法\n5. 练习和巩固建议",
    category: "education",
    tags: ["学习", "计划", "自我提升"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "12",
    title: "概念解释教师",
    content: "请像一位优秀的教师一样，用简单易懂的语言解释[概念/术语]。可以使用类比、例子和情景来帮助理解。适合[年龄/水平]的学习者。如果可能，请分步骤或分层次解释。",
    category: "education",
    tags: ["教学", "解释", "概念"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "13",
    title: "创意绘画提示",
    content: "请为我生成一个详细的绘画/AI图像生成提示，描述[主题]。\n\n请包含以下细节：\n- 场景描述\n- 主体特征\n- 光线和氛围\n- 色彩方案\n- 风格参考（如写实、卡通、水彩等）\n- 构图建议\n- 可能的情感表达",
    category: "creative",
    tags: ["绘画", "AI绘画", "创意"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "14",
    title: "创意问题解决",
    content: "我面临以下挑战：[描述问题或挑战]。请通过头脑风暴提供至少5种创新的解决方案。每个方案应该包含：\n- 解决方案概述\n- 实施步骤\n- 可能的优势\n- 潜在的难点\n- 所需资源\n\n我特别欣赏能够跳出常规思维模式的创意方案。",
    category: "creative",
    tags: ["创意", "解决问题", "头脑风暴"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "15",
    title: "个人效率提升建议",
    content: "请根据我当前的工作/学习习惯，提供提高个人效率的具体建议。\n\n我的日常安排：[描述你的典型一天]\n\n我面临的主要挑战：[描述你的效率障碍，如拖延、分心等]\n\n我使用的工具：[列出你常用的效率工具/应用]\n\n请提供在以下方面的改进建议：\n1. 时间管理策略\n2. 任务优先级设置\n3. 专注力提升方法\n4. 工作流程优化\n5. 可能有帮助的工具和技术",
    category: "productivity",
    tags: ["效率", "时间管理", "自我提升"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "16",
    title: "项目计划制定",
    content: "请帮我为[项目名称]制定一份详细的项目计划。项目目标是[项目目标]，预计持续[时间]，涉及的主要利益相关者包括[利益相关者]。\n\n请包含以下内容：\n1. 项目范围界定\n2. 具体可交付成果\n3. 关键里程碑和时间线\n4. 任务分解结构\n5. 资源需求\n6. 风险评估和缓解策略\n7. 沟通和汇报计划",
    category: "productivity",
    tags: ["项目管理", "计划", "组织"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "17",
    title: "技术架构评审",
    content: "请评审以下系统架构设计，并提供改进建议：\n\n[架构描述/图表]\n\n系统的主要需求和目标是：[需求和目标]\n\n请从以下几个方面进行评审：\n1. 设计是否满足需求\n2. 可扩展性和灵活性\n3. 性能考虑\n4. 安全性\n5. 维护性和可测试性\n6. 可能的简化或优化点",
    category: "development",
    tags: ["架构", "系统设计", "评审"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "18",
    title: "面试准备助手",
    content: "我即将参加[职位/行业]的面试，请帮我准备以下内容：\n\n1. 这个职位最可能被问到的10个专业问题及示例回答\n2. 5个行为问题（如\"描述一个你解决困难问题的经历\"）及如何结构化回答的建议\n3. 我可以问面试官的5个高质量问题\n4. 面试前一天和当天的准备建议\n5. 可能被要求的技术测试或案例分析的准备方向",
    category: "general",
    tags: ["面试", "职业发展", "准备"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "19",
    title: "辩论论点构建",
    content: "请帮我构建关于[话题]的辩论论点。我的立场是[支持/反对]。\n\n请提供：\n1. 3-5个主要论点，每个包含论据和支持数据\n2. 针对可能的反驳的预设回应\n3. 有力的开场和结束陈述\n4. 可引用的相关权威观点或研究\n5. 潜在的辩论策略和技巧",
    category: "education",
    tags: ["辩论", "论证", "演讲"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "20",
    title: "健康生活计划",
    content: "请根据我的情况制定一个综合的健康生活计划：\n\n年龄：[年龄]\n当前健康状况：[状况]\n主要目标：[目标，如减重、增肌、改善能量等]\n时间限制：每天可投入[时间]进行锻炼\n饮食偏好/限制：[偏好/限制]\n\n请包含：\n1. 每周锻炼计划\n2. 基本膳食指南和示例食谱\n3. 睡眠和休息建议\n4. 压力管理技巧\n5. 进度跟踪方法\n6. 可能的调整和进阶计划",
    category: "general",
    tags: ["健康", "生活方式", "计划"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "21",
    title: "翻译与本地化",
    content: "请将以下[语言1]内容翻译成[语言2]，不仅要保持原意准确，还要考虑文化本地化，使表达更加自然：\n\n[原文内容]\n\n请特别注意：\n1. 行业专业术语的准确翻译\n2. 文化特定表达的适当转换\n3. 保持原文的语气和风格\n4. 可能需要解释的文化背景",
    category: "general",
    tags: ["翻译", "语言", "本地化"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "22",
    title: "多角度分析",
    content: "请从多个角度分析以下议题：[议题]\n\n请至少从以下角度进行分析：\n1. 经济影响\n2. 社会文化考量\n3. 技术层面\n4. 伦理道德视角\n5. 政治和监管层面\n6. 环境因素\n\n每个角度应包含支持和反对的观点，以及可能的平衡点或解决方案。",
    category: "general",
    tags: ["分析", "思考", "决策"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "23",
    title: "产品命名创意",
    content: "请为我的[产品/品牌/服务]创作命名创意。产品描述：[产品描述]\n目标受众：[受众]\n品牌个性：[个性特点，如专业、友好、创新等]\n行业：[行业]\n\n请提供10个创意名称，每个包含：\n1. 名称\n2. 简短的解释（为什么合适）\n3. 域名可用性建议\n4. 潜在的品牌扩展可能性",
    category: "creative",
    tags: ["品牌", "命名", "创意"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "24",
    title: "数据分析报告",
    content: "请帮我基于以下数据创建一份分析报告：\n\n[数据集描述或实际数据]\n\n分析目标：[目标，如发现趋势、支持决策等]\n\n报告应包含：\n1. 执行摘要\n2. 关键发现和见解\n3. 数据可视化建议\n4. 实用的行动建议\n5. 研究限制和进一步分析方向",
    category: "business",
    tags: ["数据分析", "报告", "决策"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "25",
    title: "用户故事编写",
    content: "请帮我为开发[产品/功能]编写用户故事。目标用户是[用户角色]，他们的主要需求是[需求]。\n\n请生成：\n1. 5-8个符合INVEST原则的用户故事\n2. 每个故事包含验收标准\n3. 相关的非功能性需求\n4. 用户故事地图或逻辑关系图建议\n5. 优先级建议",
    category: "development",
    tags: ["敏捷开发", "用户故事", "需求"],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Default settings
export const defaultSettings: Settings = {
  theme: "system",
  font: "Inter",
  fontSize: 14,
  alwaysOnTop: false,
  shortcut: "Control+Alt+P"
};

// 数据存储键名
const STORAGE_KEYS = {
  PROMPTS: 'promptmate-prompts',
  CATEGORIES: 'promptmate-categories',
  SETTINGS: 'promptmate-settings'
};

// 加载提示词
export const loadPrompts = (): Prompt[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROMPTS);
    if (saved) {
      return JSON.parse(saved);
    }
    return samplePrompts;
  } catch (error) {
    console.error("加载提示词时出错:", error);
    return samplePrompts;
  }
};

// 保存提示词
export const savePrompts = (prompts: Prompt[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
  } catch (error) {
    console.error("保存提示词时出错:", error);
  }
};

// 加载分类
export const loadCategories = (): Category[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (saved) {
      return JSON.parse(saved);
    }
    return defaultCategories;
  } catch (error) {
    console.error("加载分类时出错:", error);
    return defaultCategories;
  }
};

// 保存分类
export const saveCategories = (categories: Category[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error("保存分类时出错:", error);
  }
};

// 加载设置
export const loadSettings = (): Settings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      return JSON.parse(saved);
    }
    return defaultSettings;
  } catch (error) {
    console.error("加载设置时出错:", error);
    return defaultSettings;
  }
};

// 保存设置
export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("保存设置时出错:", error);
  }
};

// 生成唯一ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// 导出所有数据为JSON
export const exportAllData = (): string => {
  try {
    const data = {
      prompts: loadPrompts(),
      categories: loadCategories(),
      settings: loadSettings(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("导出数据时出错:", error);
    return "";
  }
};

// 从JSON导入数据
export const importAllData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    // 验证数据结构
    if (!data.prompts || !Array.isArray(data.prompts)) {
      throw new Error("提示词数据无效");
    }
    
    if (!data.categories || !Array.isArray(data.categories)) {
      throw new Error("分类数据无效");
    }
    
    // 保存导入的数据
    if (data.prompts) savePrompts(data.prompts);
    if (data.categories) saveCategories(data.categories);
    if (data.settings) saveSettings(data.settings);
    
    return true;
  } catch (error) {
    console.error("导入数据时出错:", error);
    return false;
  }
};

// 导出提示词到文件
export const exportPromptsToFile = () => {
  const prompts = loadPrompts();
  const dataStr = JSON.stringify(prompts, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const exportFileDefaultName = `promptmate-prompts-${new Date().toISOString().slice(0, 10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

// 导出分类到文件
export const exportCategoriesToFile = () => {
  const categories = loadCategories();
  const dataStr = JSON.stringify(categories, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const exportFileDefaultName = `promptmate-categories-${new Date().toISOString().slice(0, 10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

// 将提示词按类别分组
export const groupPromptsByCategory = (prompts: Prompt[]): Record<string, Prompt[]> => {
  const grouped: Record<string, Prompt[]> = {};
  
  prompts.forEach(prompt => {
    if (!grouped[prompt.category]) {
      grouped[prompt.category] = [];
    }
    grouped[prompt.category].push(prompt);
  });
  
  return grouped;
};

// 获取所有标签
export const getAllTags = (prompts: Prompt[]): string[] => {
  const tags = new Set<string>();
  
  prompts.forEach(prompt => {
    prompt.tags.forEach(tag => tags.add(tag));
  });
  
  return Array.from(tags).sort();
};

// 清除所有数据（谨慎使用）
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROMPTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (error) {
    console.error("清除数据时出错:", error);
  }
};

// 重置为默认数据
export const resetToDefaults = (): void => {
  try {
    savePrompts(samplePrompts);
    saveCategories(defaultCategories);
    saveSettings(defaultSettings);
  } catch (error) {
    console.error("重置为默认数据时出错:", error);
  }
};

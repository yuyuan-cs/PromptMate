import { Prompt } from "@/types";
import { generateId } from "@/lib/data";

// 创建当前时间
const now = new Date().toISOString();

// 预设推荐的提示词库
export const recommendedPrompts: Prompt[] = [
  {
    id: generateId(),
    title: "图像生成提示词",
    content: "我需要一张[主题]风格的图片，具有以下特点：[描述具体特点]。色调应该是[色调]，氛围应该给人[情感/氛围]的感觉。图片中应该包含[具体元素]，背景是[背景描述]。图片的风格参考[艺术家/风格]，纹理应该[纹理描述]。",
    category: "creative",
    tags: ["图像生成", "AI绘画", "创意"],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: "内容总结助手",
    content: "请帮我总结以下内容的要点，用简洁明了的语言，并按照重要性排序：\n\n[粘贴需要总结的内容]\n\n请提取出3-5个关键信息点，并解释为什么这些信息很重要。",
    category: "productivity",
    tags: ["总结", "学习", "效率"],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: "代码优化建议",
    content: "请帮我优化以下[编程语言]代码，重点关注性能、可读性和最佳实践。如果发现任何潜在的bug或安全隐患，请一并指出：\n\n```[语言]\n[代码内容]\n```\n\n请提供优化后的代码，并解释你所做的改变及其原因。",
    category: "development",
    tags: ["编程", "代码", "优化"],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: "学习计划生成器",
    content: "我想学习[主题/技能]，目前我的水平是[初级/中级/高级]。我每周可以投入[小时数]小时学习，希望在[时间段]内达到[目标水平]。请为我制定一个详细的学习计划，包括学习资源推荐、阶段性目标和进度检查点。",
    category: "education",
    tags: ["学习", "计划", "教育"],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: "专业邮件模板",
    content: "请帮我起草一封关于[主题]的专业邮件。邮件的目的是[目的]，收件人是[收件人身份/关系]。语气应该[正式/半正式/友好]，并且应该包含以下几点：\n\n1. [要点1]\n2. [要点2]\n3. [要点3]\n\n请确保邮件简洁明了，专业礼貌，并在结尾处提供适当的后续行动建议。",
    category: "business",
    tags: ["邮件", "商务", "沟通"],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  },
  // 添加更多推荐提示词
  {
    id: generateId(),
    title: "头脑风暴创意",
    content: "我需要关于[主题]的创意想法。请提供10个不同的创新思路，每个思路应该独特且具体。请考虑不同角度，如[角度1]、[角度2]和[角度3]。对于每个创意，提供简短描述和可能的实施方法。",
    category: "creative",
    tags: ["创意", "头脑风暴", "想法生成"],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: "文章改写",
    content: "请帮我改写以下文章，使其更加[简洁/专业/生动/正式/通俗易懂]，同时保持原意不变：\n\n[原文内容]\n\n请在改写时注意：\n1. 保持关键信息完整\n2. 改进语句结构和流畅度\n3. 确保语气一致\n4. 强化文章的中心思想",
    category: "productivity",
    tags: ["写作", "编辑", "改写"],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: "SQL查询构建",
    content: "请帮我构建一个SQL查询，满足以下需求：\n\n数据库结构：\n[描述表结构，包括表名、字段名及关系]\n\n需要实现的功能：\n[描述查询需求，例如：查找满足特定条件的数据，连接多个表，计算聚合值等]\n\n请提供优化的SQL查询语句，并解释查询的工作原理和性能考虑因素。",
    category: "development",
    tags: ["SQL", "数据库", "查询"],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: "产品描述生成",
    content: "请为以下产品创建一个引人入胜的产品描述：\n\n产品名称：[名称]\n产品类型：[类型]\n目标受众：[受众]\n主要特点：\n1. [特点1]\n2. [特点2]\n3. [特点3]\n价格范围：[价格]\n\n请创建一个300-500字的产品描述，突出其独特卖点，使用吸引人的语言，并包含针对目标受众的情感诉求。",
    category: "business",
    tags: ["市场营销", "产品", "文案"],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: "演讲稿撰写",
    content: "请帮我撰写一篇关于[主题]的演讲稿。演讲时长约[时长]分钟，目标听众是[听众描述]。演讲的目的是[目的]。演讲应该包含以下要点：\n\n1. [要点1]\n2. [要点2]\n3. [要点3]\n\n请使用[正式/激励/教育/幽默]的语气，并包含引人入胜的开场和有力的结尾。如果可能，请添加相关的故事、统计数据或引述来强化主要观点。",
    category: "business",
    tags: ["演讲", "沟通", "公开演讲"],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: "API接口设计",
    content: "请帮我设计一个RESTful API，用于[功能描述]。\n\n需求：\n1. [需求1]\n2. [需求2]\n3. [需求3]\n\n技术栈：[技术栈]\n目标用户：[用户类型]\n\n请提供：\n1. 主要端点列表及其用途\n2. 请求/响应格式示例（JSON）\n3. 身份验证方法建议\n4. 错误处理策略\n5. API版本控制建议",
    category: "development",
    tags: ["API", "后端", "设计"],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: "科研论文摘要",
    content: "请帮我为以下研究内容撰写一篇学术论文摘要。研究领域是[领域]，主要发现是[发现]。\n\n研究方法：\n[方法描述]\n\n主要结果：\n[结果描述]\n\n请按照标准学术格式撰写一个250字左右的摘要，包括研究背景、方法、结果和结论。使用合适的学术术语，保持客观专业的语气。",
    category: "education",
    tags: ["学术", "研究", "摘要"],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: "工作流程文档",
    content: "请帮我创建一个详细的工作流程文档，用于[流程名称]。这个流程涉及[角色/部门]，目的是[目的]。\n\n流程应包含以下阶段：\n1. [阶段1]\n2. [阶段2]\n3. [阶段3]\n\n对于每个阶段，请详细描述：\n- 负责人\n- 所需输入\n- 具体步骤\n- 预期输出\n- 质量检查点\n- 可能的问题及解决方案",
    category: "productivity",
    tags: ["流程", "文档", "组织"],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: "技术面试准备",
    content: "我即将参加[公司名]的[职位名]技术面试。请帮我准备可能会被问到的技术问题和最佳回答。\n\n我的技能背景：\n[列出技能和经验]\n\n面试可能涉及的技术领域：\n[列出技术领域]\n\n请提供：\n1. 10个最可能被问到的技术问题\n2. 每个问题的详细回答思路\n3. 可以提出的相关问题，展示我的兴趣和知识深度\n4. 如何准备编码测试或技术演示的建议",
    category: "development",
    tags: ["面试", "职业", "准备"],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  },
];

// 将推荐提示词按类别分组
export const getRecommendedPromptsByCategory = () => {
  const grouped: Record<string, Prompt[]> = {};
  
  recommendedPrompts.forEach(prompt => {
    if (!grouped[prompt.category]) {
      grouped[prompt.category] = [];
    }
    grouped[prompt.category].push(prompt);
  });
  
  return grouped;
};

// 根据标签获取推荐提示词
export const getRecommendedPromptsByTag = (tag: string) => {
  return recommendedPrompts.filter(prompt => 
    prompt.tags.includes(tag)
  );
};

// 获取所有推荐标签
export const getAllRecommendedTags = () => {
  const tags = new Set<string>();
  
  recommendedPrompts.forEach(prompt => {
    prompt.tags.forEach(tag => tags.add(tag));
  });
  
  return Array.from(tags).sort();
};

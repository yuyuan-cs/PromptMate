-- 提示词模版示例数据
-- 此文件包含一些示例分类和模版，用于测试模版功能

-- 插入示例分类
INSERT INTO template_categories (name_zh, name_en, description_zh, description_en, icon, sort_order, is_active)
VALUES
  ('编程助手', 'Programming Assistant', '帮助编程和代码开发的提示词', 'Prompts to help with programming and code development', 'code', 1, true),
  ('写作助手', 'Writing Assistant', '帮助写作和内容创作的提示词', 'Prompts to help with writing and content creation', 'pencil', 2, true),
  ('数据分析', 'Data Analysis', '数据分析和可视化相关的提示词', 'Prompts for data analysis and visualization', 'bar-chart', 3, true),
  ('学习教育', 'Learning & Education', '学习和教育相关的提示词', 'Prompts for learning and education', 'book-open', 4, true),
  ('商务办公', 'Business & Office', '商务和办公场景的提示词', 'Prompts for business and office scenarios', 'briefcase', 5, true);

-- 插入示例模版（需要先获取分类ID）
-- 这里使用子查询来获取分类ID

-- 编程助手类模版
INSERT INTO prompt_templates (
  category_id,
  title_zh,
  title_en,
  content_zh,
  content_en,
  description_zh,
  description_en,
  tags,
  version,
  sort_order,
  is_active,
  is_featured
)
VALUES
  (
    (SELECT id FROM template_categories WHERE name_en = 'Programming Assistant' LIMIT 1),
    'Python 代码审查',
    'Python Code Review',
    '请帮我审查以下 Python 代码，重点关注：
1. 代码规范和最佳实践
2. 潜在的 bug 和性能问题
3. 安全性问题
4. 改进建议

代码：
```python
[在这里粘贴你的代码]
```

请提供详细的审查意见和改进建议。',
    'Please review the following Python code, focusing on:
1. Code standards and best practices
2. Potential bugs and performance issues
3. Security concerns
4. Improvement suggestions

Code:
```python
[Paste your code here]
```

Please provide detailed review comments and improvement suggestions.',
    '专业的 Python 代码审查助手，帮助提升代码质量',
    'Professional Python code review assistant to improve code quality',
    '["python", "code-review", "best-practices"]'::jsonb,
    1,
    1,
    true,
    true
  ),
  (
    (SELECT id FROM template_categories WHERE name_en = 'Programming Assistant' LIMIT 1),
    'JavaScript/TypeScript 重构建议',
    'JavaScript/TypeScript Refactoring',
    '请分析以下 JavaScript/TypeScript 代码，并提供重构建议：

代码：
```javascript
[在这里粘贴你的代码]
```

请重点关注：
1. 代码可读性
2. 函数拆分和模块化
3. 类型安全（TypeScript）
4. 性能优化
5. 现代 ES6+ 特性的使用',
    'Please analyze the following JavaScript/TypeScript code and provide refactoring suggestions:

Code:
```javascript
[Paste your code here]
```

Focus on:
1. Code readability
2. Function decomposition and modularization
3. Type safety (TypeScript)
4. Performance optimization
5. Modern ES6+ features usage',
    '帮助改进 JavaScript/TypeScript 代码结构和质量',
    'Help improve JavaScript/TypeScript code structure and quality',
    '["javascript", "typescript", "refactoring", "clean-code"]'::jsonb,
    1,
    2,
    true,
    false
  );

-- 写作助手类模版
INSERT INTO prompt_templates (
  category_id,
  title_zh,
  title_en,
  content_zh,
  content_en,
  description_zh,
  description_en,
  tags,
  version,
  sort_order,
  is_active,
  is_featured
)
VALUES
  (
    (SELECT id FROM template_categories WHERE name_en = 'Writing Assistant' LIMIT 1),
    '文章大纲生成器',
    'Article Outline Generator',
    '请帮我为以下主题创建一个详细的文章大纲：

主题：[输入你的文章主题]

目标受众：[描述你的目标读者]

字数要求：[期望的文章字数]

请提供：
1. 引人入胜的标题建议
2. 清晰的章节结构
3. 每个章节的要点
4. 结论和行动号召',
    'Please help me create a detailed article outline for the following topic:

Topic: [Enter your article topic]

Target Audience: [Describe your target readers]

Word Count: [Expected article length]

Please provide:
1. Engaging title suggestions
2. Clear chapter structure
3. Key points for each section
4. Conclusion and call to action',
    '快速生成结构化的文章大纲',
    'Quickly generate structured article outlines',
    '["writing", "content-creation", "outline"]'::jsonb,
    1,
    1,
    true,
    true
  ),
  (
    (SELECT id FROM template_categories WHERE name_en = 'Writing Assistant' LIMIT 1),
    '社交媒体文案优化',
    'Social Media Copy Optimizer',
    '请优化以下社交媒体文案：

原文案：
[粘贴你的原始文案]

平台：[Twitter/微博/LinkedIn/Instagram等]

目标：[提高互动/增加关注/推广产品等]

请提供：
1. 3-5个优化版本
2. 每个版本的特点说明
3. 建议的发布时间
4. 相关话题标签建议',
    'Please optimize the following social media copy:

Original Copy:
[Paste your original copy]

Platform: [Twitter/Weibo/LinkedIn/Instagram, etc.]

Goal: [Increase engagement/Gain followers/Promote product, etc.]

Please provide:
1. 3-5 optimized versions
2. Features of each version
3. Suggested posting time
4. Related hashtag suggestions',
    '优化社交媒体文案，提高互动率',
    'Optimize social media copy to increase engagement',
    '["social-media", "copywriting", "marketing"]'::jsonb,
    1,
    2,
    true,
    true
  );

-- 数据分析类模版
INSERT INTO prompt_templates (
  category_id,
  title_zh,
  title_en,
  content_zh,
  content_en,
  description_zh,
  description_en,
  tags,
  version,
  sort_order,
  is_active,
  is_featured
)
VALUES
  (
    (SELECT id FROM template_categories WHERE name_en = 'Data Analysis' LIMIT 1),
    '数据分析报告助手',
    'Data Analysis Report Assistant',
    '请帮我分析以下数据并生成报告：

数据描述：
[描述你的数据集]

分析目标：
[你想要了解什么]

请提供：
1. 数据概览和统计摘要
2. 关键发现和洞察
3. 数据可视化建议
4. 结论和行动建议
5. 进一步分析方向',
    'Please help me analyze the following data and generate a report:

Data Description:
[Describe your dataset]

Analysis Goal:
[What you want to understand]

Please provide:
1. Data overview and statistical summary
2. Key findings and insights
3. Data visualization suggestions
4. Conclusions and action recommendations
5. Further analysis directions',
    '专业的数据分析报告生成助手',
    'Professional data analysis report generator',
    '["data-analysis", "statistics", "reporting"]'::jsonb,
    1,
    1,
    true,
    false
  );

-- 学习教育类模版
INSERT INTO prompt_templates (
  category_id,
  title_zh,
  title_en,
  content_zh,
  content_en,
  description_zh,
  description_en,
  tags,
  version,
  sort_order,
  is_active,
  is_featured
)
VALUES
  (
    (SELECT id FROM template_categories WHERE name_en = 'Learning & Education' LIMIT 1),
    '知识点学习计划',
    'Learning Plan Generator',
    '请为以下知识点创建一个详细的学习计划：

学习主题：[输入要学习的主题]

当前水平：[初学者/中级/高级]

可用时间：[每天/每周可以学习的时间]

学习目标：[希望达到的目标]

请提供：
1. 分阶段的学习路线图
2. 每个阶段的学习内容和资源推荐
3. 练习题和项目建议
4. 学习进度检查点
5. 避坑指南',
    'Please create a detailed learning plan for the following topic:

Learning Topic: [Enter the topic to learn]

Current Level: [Beginner/Intermediate/Advanced]

Available Time: [Time available for learning per day/week]

Learning Goal: [Target to achieve]

Please provide:
1. Phased learning roadmap
2. Learning content and resource recommendations for each phase
3. Practice exercises and project suggestions
4. Learning progress checkpoints
5. Common pitfalls to avoid',
    '制定个性化的学习计划和路线图',
    'Create personalized learning plans and roadmaps',
    '["learning", "education", "study-plan"]'::jsonb,
    1,
    1,
    true,
    true
  );

-- 商务办公类模版
INSERT INTO prompt_templates (
  category_id,
  title_zh,
  title_en,
  content_zh,
  content_en,
  description_zh,
  description_en,
  tags,
  version,
  sort_order,
  is_active,
  is_featured
)
VALUES
  (
    (SELECT id FROM template_categories WHERE name_en = 'Business & Office' LIMIT 1),
    '会议纪要生成器',
    'Meeting Minutes Generator',
    '请根据以下会议信息生成专业的会议纪要：

会议主题：[会议主题]

参会人员：[列出参会人员]

会议时间：[会议时间]

讨论内容：
[粘贴会议讨论的要点]

请生成包含以下内容的会议纪要：
1. 会议基本信息
2. 讨论要点总结
3. 决议事项
4. 待办任务和责任人
5. 下次会议安排',
    'Please generate professional meeting minutes based on the following information:

Meeting Topic: [Meeting topic]

Attendees: [List attendees]

Meeting Time: [Meeting time]

Discussion Points:
[Paste key discussion points]

Please generate meeting minutes including:
1. Basic meeting information
2. Summary of discussion points
3. Decisions made
4. Action items and responsible persons
5. Next meeting arrangements',
    '快速生成专业的会议纪要',
    'Quickly generate professional meeting minutes',
    '["business", "meeting", "documentation"]'::jsonb,
    1,
    1,
    true,
    true
  );

-- 查看插入结果
SELECT
  t.title_zh,
  t.title_en,
  c.name_zh as category,
  t.is_featured,
  t.tags
FROM prompt_templates t
JOIN template_categories c ON t.category_id = c.id
ORDER BY c.sort_order, t.sort_order;

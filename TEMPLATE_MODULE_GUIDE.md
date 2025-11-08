# 提示词模版模块使用指南

## 功能概述

提示词模版模块是一个基于 Supabase 云数据库的在线模版系统，允许您：

- 📦 从云端获取最新的提示词模版
- 🔄 无需更新应用即可获得新模版
- 🌐 支持中英文双语
- ⭐ 按分类浏览和搜索模版
- 💾 本地缓存，提高访问速度
- 📊 跟踪模版使用统计

## 架构设计

### 数据库结构

项目使用 Supabase PostgreSQL 数据库，包含两个主要表：

#### 1. template_categories（模版分类表）
- `id`: UUID 主键
- `name_zh`: 中文名称
- `name_en`: 英文名称
- `description_zh`: 中文描述
- `description_en`: 英文描述
- `icon`: 图标名称
- `sort_order`: 排序顺序
- `is_active`: 是否激活

#### 2. prompt_templates（提示词模版表）
- `id`: UUID 主键
- `category_id`: 分类ID（外键）
- `title_zh`: 中文标题
- `title_en`: 英文标题
- `content_zh`: 中文内容
- `content_en`: 英文内容
- `description_zh`: 中文描述
- `description_en`: 英文描述
- `tags`: 标签数组（JSONB）
- `version`: 版本号
- `is_active`: 是否激活
- `is_featured`: 是否推荐
- `usage_count`: 使用次数

### 安全设置

- 启用了行级安全（RLS）
- 公开读取策略：所有用户可以读取激活的模版
- 只有管理员可以修改模版数据

## 使用方法

### 用户端

1. **访问模版库**
   - 点击侧边栏的"模版"按钮
   - 系统会自动从云端加载模版（带本地缓存）

2. **浏览模版**
   - 使用搜索框搜索模版
   - 按分类浏览
   - 查看精选推荐模版

3. **使用模版**
   - 点击模版卡片查看详情
   - 点击"使用模版"按钮将其添加到提示词库
   - 或点击"复制"按钮复制内容

4. **刷新模版**
   - 点击刷新按钮获取最新模版
   - 系统自动清除缓存并重新加载

### 管理端（添加模版到数据库）

#### 方法1：使用 Supabase 控制台

1. 登录 Supabase 控制台
2. 进入 Table Editor
3. 选择 `template_categories` 或 `prompt_templates` 表
4. 点击 "Insert row" 添加数据

#### 方法2：使用 SQL

```sql
-- 添加分类示例
INSERT INTO template_categories (name_zh, name_en, icon, sort_order, is_active)
VALUES ('编程助手', 'Programming Assistant', 'code', 1, true);

-- 添加模版示例
INSERT INTO prompt_templates (
  category_id,
  title_zh,
  title_en,
  content_zh,
  content_en,
  tags,
  is_active,
  is_featured
)
VALUES (
  '分类ID',
  'Python 代码审查',
  'Python Code Review',
  '请帮我审查以下 Python 代码...',
  'Please review the following Python code...',
  '["python", "code-review", "best-practices"]'::jsonb,
  true,
  true
);
```

## 技术实现

### 前端组件

1. **TemplateBrowser.tsx**
   - 模版列表展示
   - 搜索和筛选功能
   - 分类切换

2. **TemplateDetailDialog.tsx**
   - 模版详情展示
   - 复制和使用功能

3. **TemplatesView.tsx**
   - 整合组件的视图页面

### 服务层

1. **supabaseClient.ts**
   - Supabase 客户端初始化
   - 环境变量配置

2. **templateService.ts**
   - 模版数据获取
   - 本地缓存管理
   - 使用统计更新

### 缓存机制

- 缓存时长：1小时
- 存储位置：localStorage
- 缓存键：
  - `template_categories_cache`
  - `prompt_templates_cache`
  - `template_cache_timestamp`

## 环境配置

在 `.env` 文件中配置 Supabase 连接信息：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 最佳实践

### 添加模版时

1. 同时提供中英文内容
2. 使用描述性的标题
3. 添加相关标签便于搜索
4. 设置合适的分类和排序
5. 精选推荐控制在10个以内

### 模版内容编写

1. 内容清晰、结构化
2. 包含必要的上下文说明
3. 可以使用变量占位符
4. 提供使用示例

### 性能优化

1. 使用本地缓存减少请求
2. 按需加载模版详情
3. 分页加载大量模版
4. 定期清理过期缓存

## 常见问题

### Q: 模版不显示？
A: 检查：
- Supabase 连接配置是否正确
- 模版的 `is_active` 是否为 true
- 浏览器控制台是否有错误

### Q: 如何批量导入模版？
A: 可以使用 Supabase 的批量导入功能或编写 SQL 脚本

### Q: 模版更新后需要多久才能看到？
A: 最多1小时（缓存时间），或手动点击刷新按钮立即更新

### Q: 如何统计模版使用情况？
A: 在 Supabase 控制台查询 `usage_count` 字段，或使用分析工具

## 扩展功能建议

1. **模版评分系统**：允许用户对模版评分和评论
2. **个人收藏**：用户可以收藏常用模版
3. **版本历史**：跟踪模版的修改历史
4. **社区贡献**：允许用户提交自己的模版
5. **AI 推荐**：基于使用习惯推荐模版

## 相关文件

- `/src/services/supabaseClient.ts` - Supabase 客户端
- `/src/services/templateService.ts` - 模版服务
- `/src/components/TemplateBrowser.tsx` - 模版浏览器
- `/src/components/TemplateDetailDialog.tsx` - 模版详情
- `/src/views/TemplatesView.tsx` - 模版视图
- `/src/types/index.ts` - 类型定义

## 数据库管理

### 查看所有模版
```sql
SELECT t.*, c.name_zh as category_name
FROM prompt_templates t
JOIN template_categories c ON t.category_id = c.id
ORDER BY t.sort_order;
```

### 查看热门模版
```sql
SELECT title_zh, usage_count
FROM prompt_templates
ORDER BY usage_count DESC
LIMIT 10;
```

### 更新模版状态
```sql
UPDATE prompt_templates
SET is_featured = true
WHERE id = 'template-id';
```

## 许可和贡献

本模块是 PromptMate 项目的一部分，遵循项目的 MIT 许可协议。

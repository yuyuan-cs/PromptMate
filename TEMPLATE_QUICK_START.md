# 提示词模版功能快速开始

## 5分钟快速部署

### 1. 数据库已配置
✅ Supabase 数据库表结构已创建
✅ 数据库连接配置已完成
✅ 安全策略（RLS）已启用

### 2. 添加示例数据

在 Supabase SQL Editor 中执行 `template-sample-data.sql` 文件：

1. 登录 [Supabase 控制台](https://supabase.com/dashboard)
2. 选择您的项目
3. 点击左侧菜单 "SQL Editor"
4. 创建新查询
5. 复制 `template-sample-data.sql` 的内容并执行

### 3. 立即使用

应用已集成模版功能：

1. 启动应用
2. 点击侧边栏的 "📄 模版" 按钮
3. 浏览和使用云端模版

## 功能特点

- ⚡ **实时更新**：数据库更新后，用户刷新即可看到
- 🌍 **双语支持**：自动根据界面语言切换
- 💾 **智能缓存**：1小时缓存，提升性能
- 🔍 **快速搜索**：支持按标题、描述、标签搜索
- ⭐ **精选推荐**：高亮显示优质模版
- 📊 **使用统计**：自动跟踪模版使用次数

## 添加自定义模版

### 方法1：Supabase 控制台（推荐新手）

1. 进入 Supabase 控制台
2. 点击 "Table Editor"
3. 选择 `prompt_templates` 表
4. 点击 "Insert row" 添加新行
5. 填写字段并保存

### 方法2：SQL（推荐批量添加）

```sql
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
  '中文标题',
  'English Title',
  '中文内容',
  'English Content',
  '["tag1", "tag2"]'::jsonb,
  true,
  false
);
```

## 管理模版

### 查看所有模版
```sql
SELECT * FROM prompt_templates WHERE is_active = true;
```

### 设为精选
```sql
UPDATE prompt_templates
SET is_featured = true
WHERE id = '模版ID';
```

### 禁用模版
```sql
UPDATE prompt_templates
SET is_active = false
WHERE id = '模版ID';
```

### 查看使用统计
```sql
SELECT title_zh, usage_count
FROM prompt_templates
ORDER BY usage_count DESC
LIMIT 10;
```

## 架构说明

```
用户应用
    ↓
TemplatesView (视图层)
    ↓
TemplateBrowser (展示层) + TemplateDetailDialog (详情层)
    ↓
TemplateService (业务层)
    ↓
Supabase Client (数据层)
    ↓
Supabase Database (云数据库)
```

## 关键文件

- `src/views/TemplatesView.tsx` - 模版主视图
- `src/components/TemplateBrowser.tsx` - 模版浏览器
- `src/components/TemplateDetailDialog.tsx` - 模版详情对话框
- `src/services/templateService.ts` - 模版数据服务
- `src/services/supabaseClient.ts` - Supabase 客户端
- `template-sample-data.sql` - 示例数据

## 常见问题

**Q: 如何更新模版？**
A: 直接在 Supabase 控制台修改，用户刷新即可看到更新。

**Q: 缓存多久刷新？**
A: 默认1小时，用户也可以手动刷新。

**Q: 如何批量导入模版？**
A: 使用 SQL 脚本批量插入，参考 `template-sample-data.sql`。

**Q: 支持图片吗？**
A: 当前版本暂不支持，可以在后续版本中添加。

**Q: 如何备份模版数据？**
A: 在 Supabase 控制台导出为 CSV 或使用 SQL 导出。

## 下一步

1. ✅ 添加更多分类和模版
2. ✅ 定期更新和维护模版内容
3. ✅ 收集用户反馈优化模版
4. 🎯 考虑添加模版评分功能
5. 🎯 考虑添加用户提交功能

## 技术支持

如有问题，请查看：
- 完整文档：`TEMPLATE_MODULE_GUIDE.md`
- 示例数据：`template-sample-data.sql`
- Supabase 文档：https://supabase.com/docs

---

**开始使用吧！** 🚀

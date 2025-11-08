/*
  # 创建提示词模版系统

  1. 新建表
    - `template_categories` - 模版分类表
      - `id` (uuid, 主键)
      - `name_zh` (text) - 中文名称
      - `name_en` (text) - 英文名称
      - `description_zh` (text) - 中文描述
      - `description_en` (text) - 英文描述
      - `icon` (text) - 图标
      - `sort_order` (integer) - 排序
      - `is_active` (boolean) - 是否激活
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `prompt_templates` - 提示词模版表
      - `id` (uuid, 主键)
      - `category_id` (uuid, 外键)
      - `title_zh` (text) - 中文标题
      - `title_en` (text) - 英文标题
      - `content_zh` (text) - 中文内容
      - `content_en` (text) - 英文内容
      - `description_zh` (text) - 中文描述
      - `description_en` (text) - 英文描述
      - `tags` (jsonb) - 标签数组
      - `version` (integer) - 版本号
      - `sort_order` (integer) - 排序
      - `is_active` (boolean) - 是否激活
      - `is_featured` (boolean) - 是否推荐
      - `usage_count` (integer) - 使用次数
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. 安全设置
    - 启用 RLS
    - 添加公开读取策略（模版对所有人可见）
*/

-- 创建模版分类表
CREATE TABLE IF NOT EXISTS template_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_zh text NOT NULL,
  name_en text NOT NULL,
  description_zh text DEFAULT '',
  description_en text DEFAULT '',
  icon text DEFAULT 'folder',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建提示词模版表
CREATE TABLE IF NOT EXISTS prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES template_categories(id) ON DELETE CASCADE,
  title_zh text NOT NULL,
  title_en text NOT NULL,
  content_zh text NOT NULL,
  content_en text NOT NULL,
  description_zh text DEFAULT '',
  description_en text DEFAULT '',
  tags jsonb DEFAULT '[]'::jsonb,
  version integer DEFAULT 1,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_template_categories_active ON template_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_template_categories_sort ON template_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON prompt_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_featured ON prompt_templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_sort ON prompt_templates(sort_order);

-- 启用 RLS
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- 添加公开读取策略（所有人都可以读取激活的模版）
CREATE POLICY "Anyone can view active template categories"
  ON template_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active prompt templates"
  ON prompt_templates FOR SELECT
  USING (is_active = true);

-- 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 添加更新时间戳触发器
DROP TRIGGER IF EXISTS update_template_categories_updated_at ON template_categories;
CREATE TRIGGER update_template_categories_updated_at
    BEFORE UPDATE ON template_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prompt_templates_updated_at ON prompt_templates;
CREATE TRIGGER update_prompt_templates_updated_at
    BEFORE UPDATE ON prompt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

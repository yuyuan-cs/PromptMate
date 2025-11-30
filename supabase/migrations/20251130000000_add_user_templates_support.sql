/*
  # 添加用户模板上传支持
  
  1. 更新
    - 在 `prompt_templates` 表中添加 `created_by` 字段
    - 添加用户上传模板的 RLS 策略
  
  2. 安全设置
    - 允许认证用户插入模板
    - 允许用户更新和删除自己创建的模板
*/

-- 添加 created_by 字段到 prompt_templates 表
ALTER TABLE prompt_templates 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_prompt_templates_created_by ON prompt_templates(created_by);

-- 删除旧的 RLS 策略
DROP POLICY IF EXISTS "Anyone can view active prompt templates" ON prompt_templates;

-- 添加新的 RLS 策略
-- 所有人可以查看激活的模板
CREATE POLICY "Anyone can view active prompt templates"
  ON prompt_templates FOR SELECT
  USING (is_active = true);

-- 认证用户可以插入模板
CREATE POLICY "Authenticated users can insert templates"
  ON prompt_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- 用户可以更新自己创建的模板
CREATE POLICY "Users can update own templates"
  ON prompt_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- 用户可以删除自己创建的模板
CREATE POLICY "Users can delete own templates"
  ON prompt_templates FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- 添加触发器函数来自动设置 created_by
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 添加触发器
DROP TRIGGER IF EXISTS set_template_created_by ON prompt_templates;
CREATE TRIGGER set_template_created_by
  BEFORE INSERT ON prompt_templates
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();

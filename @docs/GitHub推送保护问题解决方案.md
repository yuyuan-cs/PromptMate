# GitHub推送保护问题解决方案

## 问题描述
在推送代码到GitHub时遇到"GITHUB PUSH PROTECTION"错误，GitHub检测到提交历史中包含敏感信息（GitHub Personal Access Token）。

## 根本原因
之前在配置环境变量时，意外将真实的GitHub Token写入了以下文件并提交到Git历史中：
- `.env` 文件
- `.env.local` 文件  
- `@docs/环境变量配置说明.md` 文件

GitHub的推送保护机制检测到这些敏感信息，阻止了推送操作。

## 解决方案

### 方案一：修复当前提交并请求GitHub解除阻止

1. **清理当前文件**：
   ```bash
   # 删除包含敏感信息的文件
   rm -f .env .env.local
   
   # 修改文档中的敏感信息
   # 将真实token替换为占位符
   ```

2. **提交修复**：
   ```bash
   git add .
   git commit -m "fix: 移除敏感信息，修复GitHub推送保护问题"
   ```

3. **访问GitHub提供的解除阻止URL**：
   - 访问错误消息中提供的URL
   - 按照GitHub指引解除推送保护
   - URL示例：`https://github.com/yuyuan-cs/PromptMate/security/secret-scanning/unblock-secret/xxxxx`

### 方案二：彻底清理Git历史（推荐）

使用BFG Repo-Cleaner工具：

1. **安装BFG Repo-Cleaner**：
   ```bash
   # macOS
   brew install bfg
   
   # 或手动下载
   wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
   ```

2. **创建密钥文件**：
   ```bash
   echo "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" > secrets.txt
   ```

3. **清理仓库**：
   ```bash
   # 克隆裸仓库
   git clone --mirror https://github.com/yy0691/PromptMate.git
   
   # 使用BFG清理
   bfg --replace-text secrets.txt PromptMate.git
   
   # 清理引用
   cd PromptMate.git
   git reflog expire --expire=now --all && git gc --prune=now --aggressive
   
   # 强制推送清理后的历史
   git push --force
   ```

### 方案三：重新生成GitHub Token

1. **撤销当前Token**：
   - 访问 GitHub Settings > Developer settings > Personal access tokens
   - 找到泄露的token并删除

2. **生成新Token**：
   - 创建新的Personal Access Token
   - 更新本地环境变量

3. **重新配置**：
   ```bash
   # 更新全局环境变量
   export GITHUB_TOKEN=new_token_here
   
   # 更新zshrc文件
   sed -i 's/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/new_token_here/g' ~/.zshrc
   ```

## 预防措施

1. **正确的环境变量管理**：
   - 永远不要将真实的敏感信息提交到版本控制
   - 使用示例值或占位符
   - 确保 `.env` 文件在 `.gitignore` 中

2. **使用pre-commit钩子**：
   ```bash
   # 安装pre-commit
   pip install pre-commit
   
   # 添加secret检测
   # .pre-commit-config.yaml
   repos:
   - repo: https://github.com/Yelp/detect-secrets
     rev: v1.4.0
     hooks:
     - id: detect-secrets
   ```

3. **定期轮换密钥**：
   - 定期更新GitHub Token
   - 使用有限权限的Token
   - 设置Token过期时间

## 当前状态
- ✅ 已删除本地 `.env` 和 `.env.local` 文件
- ✅ 已修改文档中的敏感信息为占位符
- ✅ 已提交修复
- ⚠️ 需要解除GitHub推送保护或清理Git历史

## 建议
推荐使用**方案一 + 方案三**的组合：
1. 立即撤销泄露的GitHub Token
2. 生成新的Token并重新配置
3. 访问GitHub提供的URL解除推送保护
4. 完成推送操作

这样既保证了安全性，又避免了复杂的Git历史重写操作。
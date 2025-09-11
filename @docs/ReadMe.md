
# 版本管理 & 发布指南
## 版本管理脚本

### 1. 版本更新脚本

```bash
# 补丁版本更新 (1.0.0 -> 1.0.1)
npm run version:patch

# 次版本更新 (1.0.0 -> 1.1.0)
npm run version:minor

# 主版本更新 (1.0.0 -> 2.0.0)
npm run version:major
```

### 2. 构建信息管理脚本

```bash
# 更新构建信息（自动更新构建日期、Git信息等）
npm run build:info

# 显示当前构建信息
npm run build:info --show

# 显示帮助信息
npm run build:info --help

## 构建流程

### 自动构建信息更新

在每次构建时，系统会自动：

1. 更新 `package.json` 中的 `buildDate` 字段
2. 获取当前 Git 提交哈希和分支信息
3. 创建 `src/build-info.json` 文件
4. 生成 `.env.local` 环境变量文件

### 构建脚本

```bash
# 完整构建（包含构建信息更新）
npm run build

# 仅更新构建信息
npm run build:info

# 仅构建 Electron 主进程
npm run build:electron
```

## 发布流程

### 1. 快速发布

```bash
# 补丁版本发布
npm run quick:patch

# 次版本发布
npm run quick:minor

# 主版本发布
npm run quick:major
```

### 2. 完整发布流程

```bash
# 1. 更新版本号
npm run version:patch

# 2. 构建应用
npm run build

# 3. 打包发布
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:all    # 全平台
```

### 3. 一键发布

```bash
# 补丁版本一键发布
npm run publish:patch

# 指定平台发布
npm run publish:win    # Windows
npm run publish:mac    # macOS
npm run publish:all    # 全平台
```

## 更新检查机制

### GitHub 发布检查

应用会自动检查 GitHub 发布页面，获取最新版本信息：

- 自动版本比较
- 更新类型识别（主版本/次版本/补丁更新）
- 发布详情链接
- 错误处理和重试机制

### 更新检查流程

1. 获取当前应用版本
2. 调用 GitHub API 获取最新发布
3. 版本号格式验证
4. 语义化版本比较
5. 返回更新结果和详细信息

## 文件结构

```
scripts/
├── version-manager.js      # 版本管理脚本
├── build-info.js          # 构建信息管理脚本
├── release-manager.js     # 发布管理脚本
├── quick-release.js       # 快速发布脚本
└── simple-release.js      # 简单发布脚本

src/
├── build-info.json        # 构建信息文件（自动生成）
└── main/
    └── main.cjs          # Electron 主进程（包含更新检查逻辑）

.env.local                 # 环境变量文件（自动生成）
```

## 环境变量

构建时自动生成的环境变量：

```bash
VITE_APP_VERSION=1.0.14
VITE_BUILD_DATE=2025-08-03T14:28:09.355Z
VITE_BUILD_TIME=2025-08-03T14:28:09.355Z
VITE_GIT_COMMIT=abc1234
VITE_GIT_BRANCH=main
```

## 注意事项

### 版本号管理

- 版本号必须符合语义化版本规范
- 发布前必须更新版本号
- 建议使用 `npm run version:patch` 等命令自动更新

### 上传现有构建文件到Release
当自动化发布过程中文件上传失败时，可以使用独立的上传脚本：

```bash
# 上传指定版本的构建文件
node scripts/upload-existing-assets.js v1.1.4

# 上传指定文件
node scripts/upload-existing-assets.js v1.1.4 PromptMate-1.1.4-x64.exe latest.yml
```
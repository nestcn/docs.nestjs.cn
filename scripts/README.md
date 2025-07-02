# NestJS 中文文档自动化工具

这个目录包含了 NestJS 中文文档项目的各种自动化脚本和工具。

## 🌟 主要功能

- **🤖 AI 自动翻译**: 使用 Cloudflare Workers AI 进行智能翻译
- **� 链接处理**: 批量替换内部链接为相对路径
- **�💰 完全免费**: Cloudflare Workers AI 免费使用
- **📚 智能缓存**: 自动缓存翻译结果，避免重复翻译
- **🔒 代码保护**: 保护代码块、内联代码、HTML 标签和链接不被翻译
- **⚡ 增量更新**: 只翻译变更的文件
- ** 详细统计**: 显示处理进度和结果统计

## 📁 项目结构

```
.
├── content/          # 从官方仓库同步的英文原文（不处理）
├── docs/            # 处理后的中文文档（主要处理目录）
├── public/assets/   # 从官方仓库同步的资源文件
├── scripts/         # 自动化脚本（本目录）
└── .github/workflows/ # GitHub Actions 工作流
```

## 🛠️ 核心脚本

### 🔗 链接处理工具

```bash
# 统一的链接处理工具 - 批量替换 docs.nestjs.com 链接为相对路径
bun scripts/final-link-processor.js

# 或使用 Node.js
node scripts/final-link-processor.js
```

**特性：**
- ✅ 只处理 `docs/` 目录，忽略 `content/` 英文原文
- ✅ 自动忽略 `awesome.md` 和 `index.md` 文件
- ✅ 智能跳过示例代码中的链接
- ✅ 自动检测目标文件是否存在
- ✅ 详细的处理报告和统计

### AI 翻译和文档处理

```bash
# 🤖 使用 Cloudflare Workers AI 翻译文档
bun translate-docs

# 🤖 详细输出模式
bun translate-docs:verbose

# 🔄 仅格式处理（不使用 AI 翻译）
bun translate-docs:no-ai

# 🤖 使用不同模型翻译
bun translate-docs:mistral     # 使用 Mistral 7B 模型
bun translate-docs:openchat    # 使用 OpenChat 3.5 模型

# 🔧 修复代码块格式
bun fix-code-blocks

# 🔧 修复模板语法
bun fix-template-syntax

# 🔧 运行所有修复
bun fix-all

# 🚀 完整的翻译和修复流程
bun sync-and-translate

# 🚀 完整的翻译和修复流程（不使用 AI）
bun sync-and-translate:no-ai

# 🧪 测试 Cloudflare Workers AI 功能
bun test-cloudflare
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 使用 bun (推荐)
bun install

# 或使用 npm
npm install
```

### 2. 配置 Cloudflare Workers AI

首先需要获取 Cloudflare 的 API 凭据：

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 获取 Account ID（在右侧边栏）
3. 创建 API Token（需要 Workers:Edit 权限）

### 3. 设置环境变量

```bash
# Windows PowerShell
$env:CLOUDFLARE_API_TOKEN="your-api-token"
$env:CLOUDFLARE_ACCOUNT_ID="your-account-id"

# Linux/macOS
export CLOUDFLARE_API_TOKEN="your-api-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
```

### 4. 运行工具

```bash
# 链接处理
bun scripts/final-link-processor.js

# AI 翻译
bun translate-docs:verbose

# 测试功能
bun test-cloudflare
```

## 🤖 支持的 AI 模型

| 模型名称 | 描述 | 推荐用途 |
|---------|------|---------|
| `@cf/meta/llama-2-7b-chat-int8` | Llama 2 7B (默认) | 通用翻译，平衡质量和速度 |
| `@cf/meta/llama-2-7b-chat-fp16` | Llama 2 7B (高精度) | 高质量翻译 |
| `@cf/mistral/mistral-7b-instruct-v0.1` | Mistral 7B | 技术文档翻译 |
| `@cf/openchat/openchat-3.5-0106` | OpenChat 3.5 | 对话式翻译 |

## 📝 直接运行脚本

```bash
# 链接处理工具
bun scripts/final-link-processor.js

# AI 翻译（基本使用）
bun scripts/translate-docs.js --verbose

# 指定不同模型
bun scripts/translate-docs.js --model "@cf/mistral/mistral-7b-instruct-v0.1"

# 直接指定 API 配置
bun scripts/translate-docs.js --api-token your-token --account-id your-account-id

# 查看所有选项
bun scripts/translate-docs.js --help
```

## 🔧 脚本详情

### final-link-processor.js

统一的链接处理工具，负责将 `docs.nestjs.com` 和 `docs.nestjs.cn` 链接转换为相对路径。

**运行方式：**
```bash
bun scripts/final-link-processor.js
```

**处理规则：**
- ✅ 只处理 `docs/` 目录的 Markdown 文件
- ✅ 自动忽略 `awesome.md` 和 `index.md`
- ✅ 智能识别示例代码中的链接并跳过
- ✅ 检测目标文件是否存在
- ✅ 生成详细的处理报告

**路径映射示例：**
- `https://docs.nestjs.com/introduction` → `../introduction`
- `https://docs.nestjs.com/first-steps` → `../overview/first-steps`
- `https://docs.nestjs.com/controllers` → `../overview/controllers`

## 🔄 自动化工作流

GitHub Actions 会自动：

1. **同步内容** - 从官方仓库同步最新文档
2. **AI 翻译** - 使用 Cloudflare Workers AI 翻译变更内容  
3. **格式修复** - 自动修复代码块和模板语法
4. **提交推送** - 将翻译结果提交到仓库

### 配置 GitHub Secrets

在 GitHub 仓库设置中添加：
- `CLOUDFLARE_API_TOKEN`: Cloudflare API 令牌
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Account ID

## 📊 输出示例

```
🔍 Starting document translation process...
📁 Source: /path/to/content
📁 Target: /path/to/docs  
🤖 AI Provider: Cloudflare Workers AI
🧠 Model: @cf/meta/llama-2-7b-chat-int8
📚 Loaded 15 cached translations

## ⚠️ 重要注意事项

### 文件处理规则

1. **目录处理范围**: 
   - ✅ `docs/` - 中文文档目录，主要处理对象
   - ❌ `content/` - 英文原文，按规则不处理任何链接

2. **文件忽略规则**:
   - `awesome.md` - 外部资源集合，保持原链接
   - `index.md` - 主页文件，保持原链接  

3. **链接处理规则**:
   - 仅处理 `https://docs.nestjs.com` 和 `https://docs.nestjs.cn` 域名
   - 自动跳过示例代码中的链接
   - 自动检测目标文件是否存在
   - 静态资源链接（图片、CSS、JS）保持不变

### 环境要求

1. **运行环境**: 
   - Node.js 或 Bun（推荐）
   - Windows PowerShell 环境兼容

2. **API 配置**: 
   - Cloudflare API Token
   - Cloudflare Account ID

3. **权限要求**:
   - 文件读写权限
   - 网络访问权限（AI 翻译）

## 🐛 故障排除

### 常见问题

1. **API 凭据错误**
   ```
   ❌ Cloudflare API token and Account ID not configured
   ```
   - 检查环境变量是否正确设置

2. **网络连接问题**
   ```
   ⚠️ AI translation failed: fetch failed
   ```
   - 检查网络连接
   - 确认 Cloudflare API 可访问

3. **模型不支持**
   ```
   ❌ Model not found
   ```
   - 使用支持的模型名称
   - 参考模型列表

4. **Windows 命令兼容性**
   ```
   标记"&&"不是此版本中的有效语句分隔符
   ```
   - 使用分步命令或改用 bun

## 📚 相关文档

- [Cloudflare Workers AI 配置指南](../CLOUDFLARE_AI_SETUP.md)
- [Cloudflare Workers AI 文档](https://developers.cloudflare.com/workers-ai/)
- [Cloudflare Dashboard](https://dash.cloudflare.com)
- [NestJS 官方文档](https://docs.nestjs.com)

---

*本工具集专为 NestJS 中文文档项目设计，遵循项目的编码规范和处理规则。*

3. **`advanced-link-replacer.mjs`** (特殊情况处理)
   ```bash
   bun scripts/advanced-link-replacer.mjs
   ```

4. **`validate-links.mjs`** (链接验证工具)
---

*本工具集专为 NestJS 中文文档项目设计，遵循项目的编码规范和处理规则。*

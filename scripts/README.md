# NestJS 中文文档自动翻译系统

这个项目包含了使用 Cloudflare Workers AI 自动翻译 NestJS 官方文档的脚本和工作流。

## 🌟 特性

- **🤖 AI 翻译**: 使用 Cloudflare Workers AI 进行智能翻译
- **💰 完全免费**: Cloudflare Workers AI 免费使用
- **📚 智能缓存**: 自动缓存翻译结果，避免重复翻译
- **🔒 代码保护**: 保护代码块、内联代码、HTML 标签和链接不被翻译
- **⚡ 增量更新**: 只翻译变更的文件
- **🔄 格式修复**: 自动处理 `@@filename` 和 `@@switch` 标记
- **📊 详细统计**: 显示翻译进度和结果统计

## 📁 项目结构

```
.
├── content/          # 从官方仓库同步的英文原文
├── docs/            # 处理后的中文文档
├── public/assets/   # 从官方仓库同步的资源文件
├── scripts/         # 自动化脚本
└── .github/workflows/ # GitHub Actions 工作流
```

## 🛠️ 可用脚本

### AI 翻译和文档处理

```bash
# 🤖 使用 Cloudflare Workers AI 翻译文档
npm run translate-docs

# 🤖 详细输出模式
npm run translate-docs:verbose

# 🔄 仅格式处理（不使用 AI 翻译）
npm run translate-docs:no-ai

# 🤖 使用不同模型翻译
npm run translate-docs:mistral     # 使用 Mistral 7B 模型
npm run translate-docs:openchat    # 使用 OpenChat 3.5 模型

# 🔧 修复代码块格式
npm run fix-code-blocks

# 🔧 修复模板语法
npm run fix-template-syntax

# 🔧 运行所有修复
npm run fix-all

# 🚀 完整的翻译和修复流程
npm run sync-and-translate

# 🚀 完整的翻译和修复流程（不使用 AI）
npm run sync-and-translate:no-ai

# 🧪 测试 Cloudflare Workers AI 功能
npm run test-cloudflare
```

## 🚀 快速开始

### 1. 配置 Cloudflare Workers AI

首先需要获取 Cloudflare 的 API 凭据：

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 获取 Account ID（在右侧边栏）
3. 创建 API Token（需要 Workers:Edit 权限）

### 2. 设置环境变量

```bash
# Windows PowerShell
$env:CLOUDFLARE_API_TOKEN="your-api-token"
$env:CLOUDFLARE_ACCOUNT_ID="your-account-id"

# Linux/macOS
export CLOUDFLARE_API_TOKEN="your-api-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
```

### 3. 运行翻译

```bash
# 基本翻译
npm run translate-docs:verbose

# 测试功能
npm run test-cloudflare
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
# 基本使用
node scripts/translate-docs.js --verbose

# 指定不同模型
node scripts/translate-docs.js --model "@cf/mistral/mistral-7b-instruct-v0.1"

# 直接指定 API 配置
node scripts/translate-docs.js --api-token your-token --account-id your-account-id

# 查看所有选项
node scripts/translate-docs.js --help
```

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

🤖 Translating: overview/controllers.md
  🔒 Protecting 8 code blocks...
  🤖 AI translated: overview/controllers.md
✅ Translated: overview/controllers.md

📊 Translation Summary:
✅ Processed: 25 files
🔄 Translated: 5 files  
⏭️ Skipped: 20 files
❌ Errors: 0 files
📚 Cache entries: 20
```

## ⚠️ 注意事项

1. **环境配置**: 确保正确配置 Cloudflare API 凭据
2. **免费限制**: Cloudflare Workers AI 有使用限制，脚本会自动处理
3. **缓存机制**: 翻译结果会自动缓存，避免重复翻译
4. **文件同步**: 脚本会保持文件修改时间同步
5. **错误处理**: 翻译失败时会回退到原文，不会中断流程

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

## 📚 相关文档

- [Cloudflare Workers AI 配置指南](../CLOUDFLARE_AI_SETUP.md)
- [Cloudflare Workers AI 文档](https://developers.cloudflare.com/workers-ai/)
- [Cloudflare Dashboard](https://dash.cloudflare.com)

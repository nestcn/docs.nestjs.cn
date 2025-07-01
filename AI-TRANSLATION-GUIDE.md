# NestJS 中文文档 AI 翻译系统使用指南

欢迎使用 NestJS 中文文档的 AI 智能翻译系统！这个系统可以自动同步官方英文文档并使用 AI 进行高质量的中文翻译。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 AI 翻译

#### 方法一：使用配置助手（推荐）

```bash
npm run setup-ai
```

配置助手将引导您完成以下步骤：
- 选择是否启用 AI 翻译
- 选择 AI 提供商（OpenAI/Anthropic/本地API）
- 配置 API 密钥和模型
- 自动生成 `.env` 配置文件

#### 方法二：手动配置

1. 复制配置模板：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，配置您的 AI 提供商：

   **OpenAI 配置：**
   ```env
   USE_AI_TRANSLATION=true
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-your-openai-api-key-here
   AI_MODEL=gpt-3.5-turbo
   ```

   **Anthropic Claude 配置：**
   ```env
   USE_AI_TRANSLATION=true
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
   AI_MODEL=claude-3-haiku-20240307
   ```

   **仅格式处理（不使用 AI）：**
   ```env
   USE_AI_TRANSLATION=false
   ```

### 3. 运行翻译

```bash
# 使用 AI 翻译（自动检测配置）
npm run translate-docs

# 查看详细翻译过程
npm run translate-docs:verbose

# 仅格式处理，不使用 AI
npm run translate-docs:no-ai

# 完整流程（翻译 + 格式修复）
npm run sync-and-translate
```

## 🤖 AI 翻译特性

### ✨ 核心功能

- **🧠 智能翻译**：专为 NestJS 技术文档优化
- **📚 翻译缓存**：避免重复翻译，提高效率
- **🔒 代码保护**：保护代码、变量名、函数名不被翻译
- **⚡ 增量更新**：只翻译变更的文件
- **🔄 错误恢复**：翻译失败时自动回退到原文

### 🎯 翻译质量保证

- 保持技术术语的准确性（Controller、Service、Module 等保持英文）
- 保持代码示例、变量名、函数名不变
- 保持 Markdown 格式完整
- 专业的技术文档翻译风格

### 📊 支持的 AI 提供商

| 提供商 | 推荐模型 | 特点 | 成本 |
|--------|----------|------|------|
| **OpenAI** | gpt-3.5-turbo | 速度快，成本低 | ⭐⭐⭐ |
| | gpt-4 | 质量高，适合复杂内容 | ⭐ |
| **Anthropic** | claude-3-haiku | 速度快，质量好 | ⭐⭐ |
| | claude-3-sonnet | 平衡选择 | ⭐⭐ |
| **本地 API** | 自定义 | 数据私有，成本可控 | ⭐⭐⭐⭐ |

## 📝 使用场景

### 场景 1：日常文档更新

```bash
# 自动检测变更并翻译
npm run translate-docs:verbose
```

适用于：
- 官方文档有小幅更新
- 需要查看翻译详细过程

### 场景 2：大批量翻译

```bash
# 使用成本较低的模型
npm run translate-docs:openai
```

适用于：
- 首次设置文档
- 大量文档需要翻译

### 场景 3：高质量翻译

```bash
# 使用高级模型
node scripts/translate-docs.js --provider openai --model gpt-4 --verbose
```

适用于：
- 重要文档需要高质量翻译
- 复杂技术内容

### 场景 4：离线或私有环境

```bash
# 仅格式处理，不使用外部 AI
npm run translate-docs:no-ai
```

适用于：
- 网络受限环境
- 数据安全要求高
- 已有翻译内容只需格式处理

## 🔧 高级配置

### 环境变量说明

```env
# 基础配置
USE_AI_TRANSLATION=true          # 是否启用 AI 翻译
AI_PROVIDER=openai              # AI 提供商 (openai/anthropic/local)

# OpenAI 配置
OPENAI_API_KEY=sk-xxx           # OpenAI API 密钥
AI_MODEL=gpt-3.5-turbo         # 模型名称

# Anthropic 配置
ANTHROPIC_API_KEY=sk-ant-xxx    # Anthropic API 密钥
AI_MODEL=claude-3-haiku-20240307 # Claude 模型

# 本地 API 配置
AI_API_URL=http://localhost:8080 # 本地 API 地址
AI_API_KEY=your-local-key       # 本地 API 密钥

# 高级参数
MAX_TOKENS=4000                 # 最大 token 数
TEMPERATURE=0.3                 # 温度参数 (0.0-1.0)
```

### 命令行选项

```bash
node scripts/translate-docs.js [选项]

选项:
  --provider <provider>   AI 提供商 (openai|anthropic|local)
  --model <model>         AI 模型名称
  --api-key <key>         API 密钥
  --api-url <url>         API 地址 (本地模式)
  --no-ai                 禁用 AI 翻译
  --verbose, -v           详细输出
  --content-dir <dir>     源文件目录
  --docs-dir <dir>        目标文件目录
  --help, -h              显示帮助
```

## 📊 翻译输出示例

```
🔍 Starting document translation process...
📁 Source: /path/to/content
📁 Target: /path/to/docs
🤖 AI Provider: openai
🧠 Model: gpt-3.5-turbo
📚 Loaded 45 cached translations
📄 Found 152 markdown files to process

🤖 Translating: overview/controllers.md
  🔒 Protecting 12 code blocks...
  🤖 AI translated: overview/controllers.md
✅ Translated: overview/controllers.md

📚 Using cached translation for techniques/validation.md
⏭️ Skipped (up to date): introduction.md

📊 Translation Summary:
✅ Processed: 152 files
🔄 Translated: 23 files
⏭️ Skipped: 129 files
❌ Errors: 0 files
📚 Cache entries: 68
💾 Saved 68 translations to cache

✅ Translation completed with changes
```

## ⚠️ 注意事项

### 🔐 安全考虑

1. **API 密钥安全**：不要将 API 密钥提交到代码仓库
2. **数据隐私**：AI 提供商可能会记录翻译内容
3. **成本控制**：注意 API 调用费用，特别是 GPT-4

### 💡 最佳实践

1. **测试优先**：使用 `npm run test-translate` 测试配置
2. **增量翻译**：系统会自动跳过未变更的文件
3. **缓存利用**：翻译结果会被缓存，避免重复翻译
4. **定期清理**：定期清理 `.translation-cache.json` 缓存文件

### 🐛 故障排除

| 问题 | 解决方案 |
|------|----------|
| API 密钥错误 | 检查环境变量配置，确认密钥有效性 |
| 网络连接失败 | 检查网络连接，或使用 `--no-ai` 模式 |
| 翻译质量不佳 | 尝试使用更高级的模型（如 gpt-4） |
| 缓存问题 | 删除 `scripts/.translation-cache.json` |
| Node.js 版本 | 确保使用 Node.js 18+ 版本 |

## 🔄 GitHub Actions 自动化

### 配置 GitHub Secrets

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加：

```
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
AI_API_URL=http://your-local-api
```

### 手动触发工作流

1. 访问 GitHub 仓库的 Actions 页面
2. 选择 "Sync Official NestJS Docs" 工作流
3. 点击 "Run workflow"
4. 选择配置：
   - 是否启用 AI 翻译
   - AI 提供商选择
   - 模型名称

## 📚 更多资源

- [详细脚本文档](scripts/README.md)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [Anthropic Claude API 文档](https://docs.anthropic.com/claude/reference)
- [NestJS 官方文档](https://docs.nestjs.com)

## 🤝 贡献指南

如果您想改进 AI 翻译系统：

1. Fork 此仓库
2. 创建功能分支
3. 测试您的更改
4. 提交 Pull Request

欢迎贡献新的 AI 提供商支持、翻译质量改进或其他功能enhancement！

---

🎉 **开始使用 AI 翻译系统，让 NestJS 中文文档保持最新！**

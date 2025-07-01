# Cloudflare Workers AI 配置指南

Cloudflare Workers AI 是一个**免费**的 AI 服务，非常适合用于文档翻译。本指南将帮助你快速配置和使用。

## 🌟 为什么选择 Cloudflare Workers AI？

- ✅ **完全免费** - 无需付费即可使用
- ⚡ **响应快速** - 全球 CDN 加速
- 🔒 **数据安全** - 不会存储你的数据
- 🌍 **全球可用** - 无地域限制
- 📊 **无需信用卡** - 注册即可使用

## 📋 配置步骤

### 1. 注册 Cloudflare 账户

访问 [https://dash.cloudflare.com](https://dash.cloudflare.com) 注册免费账户。

### 2. 获取 Account ID

1. 登录 Cloudflare Dashboard
2. 在右侧边栏找到 **"Account ID"**
3. 点击复制按钮复制 Account ID

### 3. 创建 API Token

1. 访问 [API Tokens 页面](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 **"Create Token"**
3. 选择 **"Custom token"**
4. 配置 Token 权限：
   - **Token name**: `NestJS Docs Translation`
   - **Permissions**: 
     - Account: `Cloudflare Workers:Edit`
   - **Account Resources**: 选择你的账户
   - **Zone Resources**: `All zones` (或选择特定域名)
5. 点击 **"Continue to summary"**
6. 点击 **"Create Token"**
7. **复制生成的 Token**（重要：只显示一次）

### 4. 设置环境变量

#### Linux/macOS

```bash
# 设置环境变量
export CLOUDFLARE_API_TOKEN="your-cloudflare-api-token"
export CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"

# 验证设置
echo $CLOUDFLARE_API_TOKEN
echo $CLOUDFLARE_ACCOUNT_ID
```

#### Windows PowerShell

```powershell
# 设置环境变量
$env:CLOUDFLARE_API_TOKEN="your-cloudflare-api-token"
$env:CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"

# 验证设置
echo $env:CLOUDFLARE_API_TOKEN
echo $env:CLOUDFLARE_ACCOUNT_ID
```

#### Windows CMD

```cmd
# 设置环境变量
set CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
set CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id

# 验证设置
echo %CLOUDFLARE_API_TOKEN%
echo %CLOUDFLARE_ACCOUNT_ID%
```

## 🚀 使用方法

### 基本使用

```bash
# 使用 Cloudflare Workers AI 翻译
npm run translate-docs:cloudflare

# 或直接使用脚本
node scripts/translate-docs.js --provider cloudflare --verbose
```

### 指定模型

```bash
# 使用 Llama 2 模型（默认）
node scripts/translate-docs.js --provider cloudflare --model "@cf/meta/llama-2-7b-chat-int8"

# 使用 Mistral 模型
node scripts/translate-docs.js --provider cloudflare --model "@cf/mistral/mistral-7b-instruct-v0.1"

# 使用 OpenChat 模型
node scripts/translate-docs.js --provider cloudflare --model "@cf/openchat/openchat-3.5-0106"
```

## 🤖 可用模型

Cloudflare Workers AI 支持多种免费模型：

| 模型名称 | 描述 | 推荐用途 |
|---------|------|---------|
| `@cf/meta/llama-2-7b-chat-int8` | Llama 2 7B (默认) | 通用翻译，平衡质量和速度 |
| `@cf/meta/llama-2-7b-chat-fp16` | Llama 2 7B (高精度) | 高质量翻译 |
| `@cf/mistral/mistral-7b-instruct-v0.1` | Mistral 7B | 技术文档翻译 |
| `@cf/openchat/openchat-3.5-0106` | OpenChat 3.5 | 对话式翻译 |

## 📊 输出示例

```
🔍 Starting document translation process...
📁 Source: /path/to/content
📁 Target: /path/to/docs
🤖 AI Provider: cloudflare
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

1. **API 限制**：Cloudflare Workers AI 有请求频率限制，如果遇到限制会自动重试
2. **模型差异**：不同模型的翻译质量和风格可能有差异
3. **缓存优化**：脚本会自动缓存翻译结果，避免重复翻译
4. **网络要求**：需要稳定的网络连接访问 Cloudflare API

## 🐛 故障排除

### 常见错误

1. **Invalid API token**
   ```bash
   ❌ Cloudflare Workers AI error: Invalid API token
   ```
   - 检查 `CLOUDFLARE_API_TOKEN` 是否正确
   - 确认 Token 有正确的权限

2. **Account not found**
   ```bash
   ❌ Cloudflare Workers AI error: Account not found
   ```
   - 检查 `CLOUDFLARE_ACCOUNT_ID` 是否正确
   - 确认 Account ID 格式正确

3. **Model not found**
   ```bash
   ❌ Cloudflare Workers AI error: Model not found
   ```
   - 使用支持的模型名称
   - 确认模型名称拼写正确

4. **Rate limit exceeded**
   ```bash
   ⚠️ AI translation failed: Too Many Requests
   ```
   - 等待一段时间后重试
   - 脚本会自动处理限制并重试

## 🔗 相关链接

- [Cloudflare Workers AI 文档](https://developers.cloudflare.com/workers-ai/)
- [Cloudflare Dashboard](https://dash.cloudflare.com)
- [API Tokens 管理](https://dash.cloudflare.com/profile/api-tokens)
- [Cloudflare Workers AI 模型列表](https://developers.cloudflare.com/workers-ai/models/)

## 💡 小贴士

- 建议使用默认的 `@cf/meta/llama-2-7b-chat-int8` 模型，它在速度和质量之间取得了很好的平衡
- 可以同时配置多个 AI 提供商，脚本会自动选择可用的提供商
- Cloudflare Workers AI 的响应时间通常比其他提供商更快
- 免费账户通常足够处理大部分文档翻译需求

# GitHub Actions 自动翻译配置指南

本指南将帮助你配置 GitHub Actions，使其能够自动同步官方 NestJS 文档并使用 Cloudflare Workers AI 进行翻译。

## 🔧 配置步骤

### 1. 获取 Cloudflare 凭据

按照 [CLOUDFLARE_AI_SETUP.md](CLOUDFLARE_AI_SETUP.md) 中的说明获取：
- Cloudflare API Token
- Cloudflare Account ID

### 2. 配置 GitHub Secrets

1. 访问你的 GitHub 仓库
2. 点击 **Settings** 标签页
3. 在左侧菜单中选择 **Secrets and variables** > **Actions**
4. 点击 **New repository secret** 按钮

添加以下两个 secrets：

#### CLOUDFLARE_API_TOKEN
- **Name**: `CLOUDFLARE_API_TOKEN`
- **Secret**: 你的 Cloudflare API Token

#### CLOUDFLARE_ACCOUNT_ID
- **Name**: `CLOUDFLARE_ACCOUNT_ID` 
- **Secret**: 你的 Cloudflare Account ID

### 3. 验证配置

配置完成后，工作流将会：

1. **自动触发**：每天 UTC 02:00（北京时间 10:00）自动运行
2. **手动触发**：你可以在 Actions 标签页手动运行工作流
3. **变更触发**：当工作流文件本身被修改时自动运行

## 🚀 工作流程

### 自动同步和翻译流程

1. **同步内容**
   - 从官方 NestJS 仓库克隆最新内容
   - 比较并同步 `content` 文件夹的变更
   - 比较并同步 `assets` 文件夹的变更

2. **AI 翻译**
   - 检测 Cloudflare Workers AI 配置
   - 如果配置正确，使用 AI 翻译变更的内容
   - 如果未配置，仅进行格式处理

3. **格式修复**
   - 自动修复代码块格式
   - 处理模板语法问题

4. **提交变更**
   - 生成详细的提交信息
   - 提交并推送到仓库

### 工作流输出示例

```
🔍 Starting document translation process...
📁 Source: /github/workspace/content
📁 Target: /github/workspace/docs
🤖 AI Provider: Cloudflare Workers AI
🧠 Model: @cf/meta/llama-2-7b-chat-int8

🤖 Translating: overview/controllers.md
✅ Translated: overview/controllers.md

📊 Translation Summary:
✅ Processed: 152 files
🔄 Translated: 23 files
⏭️ Skipped: 129 files
❌ Errors: 0 files
```

## 📊 监控和调试

### 查看运行状态

1. 访问 GitHub 仓库的 **Actions** 标签页
2. 查看 "Sync Official NestJS Docs" 工作流
3. 点击具体的运行记录查看详情

### 常见问题

#### 1. API 凭据错误
```
❌ Cloudflare API token and Account ID not configured
```
**解决方案**：检查 GitHub Secrets 是否正确配置

#### 2. 翻译失败
```
⚠️ AI translation failed: fetch failed
```
**解决方案**：
- 检查网络连接
- 确认 Cloudflare API 限制
- 查看详细错误日志

#### 3. 无变更检测
```
✅ Content folder is up to date, no changes needed
```
**说明**：这是正常情况，表示官方文档没有更新

### 工作流摘要

每次运行后，GitHub Actions 会生成摘要报告：

```
📋 Sync Summary
- Sync Date: 2025-01-01 02:00:00 UTC
- Source Repository: https://github.com/nestjs/docs.nestjs.com
- Content Synced: ✅ Yes (changes detected and applied)
- Translation Updated: ✅ Yes (docs folder updated with Cloudflare Workers AI)
- Assets Synced: ✅ Up to date (no changes needed)
- Changes Committed: ✅ Yes, changes committed and pushed
```

## 🔧 自定义配置

### 修改运行时间

在 `.github/workflows/sync-official-docs.yml` 中修改 cron 表达式：

```yaml
on:
  schedule:
    # 每天 UTC 时间 02:00 运行（北京时间 10:00）
    - cron: '0 2 * * *'
```

### 修改翻译模型

在工作流中可以指定不同的模型：

```yaml
- name: Process and translate content changes
  run: |
    # 使用 Mistral 模型
    npm run translate-docs:mistral
    
    # 或使用 OpenChat 模型  
    npm run translate-docs:openchat
```

## 🎯 最佳实践

1. **定期检查**：定期查看 Actions 运行状态
2. **监控限制**：注意 Cloudflare Workers AI 的使用限制
3. **备份重要**：重要修改前先备份
4. **测试配置**：新配置后手动触发一次测试

## 🔗 相关链接

- [Cloudflare Workers AI 配置指南](CLOUDFLARE_AI_SETUP.md)
- [GitHub Secrets 文档](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

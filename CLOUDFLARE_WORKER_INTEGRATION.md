# Cloudflare Worker 翻译规则集成指南

本文档说明如何在 Cloudflare Worker 中集成 NestJS 中文文档的翻译规则，确保云端翻译遵循 `.github/copilot-instructions.md` 中定义的规则。

## 配置文件

### 核心配置
- `config/anchor-mappings.js` - 锚点和路径映射的主配置文件
- `config/cloudflare-worker-rules.js` - Cloudflare Worker 专用配置和规则

### 主要功能
1. **锚点映射**: 英文锚点 → 中文锚点的自动转换
2. **路径映射**: 内部链接路径的标准化
3. **特殊文件处理**: awesome.md 和 index.md 的特殊规则
4. **代码块处理**: @@filename 和 @@switch 语法的转换
5. **翻译质量验证**: 自动检查翻译后的格式一致性

## Cloudflare Worker 集成方案

### 方案一：配置文件同步
在 Cloudflare Worker 部署时，将配置文件一并上传：

\`\`\`javascript
// worker.js
import CloudflareWorkerConfig from './config/cloudflare-worker-rules.js';

export default {
  async fetch(request, env, ctx) {
    // 在翻译逻辑中使用配置
    const { getTranslationPrompt, postProcessTranslation } = CloudflareWorkerConfig;
    
    // 1. 获取要翻译的内容
    const content = await request.text();
    
    // 2. 使用标准化的翻译提示词
    const prompt = getTranslationPrompt(content);
    
    // 3. 调用 AI 翻译
    const translation = await callCloudflareAI(prompt);
    
    // 4. 后处理翻译结果
    const processed = postProcessTranslation(translation, request.url);
    
    return new Response(processed);
  }
};
\`\`\`

### 方案二：环境变量配置
将关键映射作为环境变量传递：

\`\`\`javascript
// wrangler.toml
[env.production]
vars = { 
  ANCHOR_MAPPINGS = "provider-scope:提供者作用域,library-specific-approach:库特定方法,...",
  PATH_MAPPINGS = "overview:guide,first-steps:guide/first-steps,..."
}
\`\`\`

### 方案三：KV 存储
使用 Cloudflare KV 存储配置数据：

\`\`\`javascript
// worker.js
export default {
  async fetch(request, env, ctx) {
    // 从 KV 加载配置
    const anchorMappings = JSON.parse(await env.CONFIG_KV.get('anchor_mappings'));
    const pathMappings = JSON.parse(await env.CONFIG_KV.get('path_mappings'));
    
    // 使用配置进行翻译处理
    // ...
  }
};
\`\`\`

## 翻译流程

### 1. 预处理
\`\`\`javascript
function preprocessContent(content) {
  // 保护代码块和链接
  const protectedContent = protectCodeBlocks(content);
  return protectedContent;
}
\`\`\`

### 2. AI 翻译
\`\`\`javascript
async function translateWithAI(content) {
  const prompt = CloudflareWorkerConfig.getTranslationPrompt(content);
  
  const response = await fetch(\`https://api.cloudflare.com/client/v4/accounts/\${accountId}/ai/run/@cf/meta/llama-2-7b-chat-int8\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${apiToken}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });
  
  const result = await response.json();
  return result.result.response;
}
\`\`\`

### 3. 后处理
\`\`\`javascript
function postProcessTranslation(translated, filePath) {
  let processed = translated;
  
  // 应用锚点映射
  processed = applyAnchorMappings(processed);
  
  // 应用路径映射（非特殊文件）
  if (!isSpecialFile(filePath)) {
    processed = applyPathMappings(processed);
  }
  
  // 处理代码块语法
  processed = fixCodeBlockSyntax(processed);
  
  // 验证翻译质量
  const issues = validateTranslation(original, processed);
  if (issues.length > 0) {
    console.warn('翻译质量问题:', issues);
  }
  
  return processed;
}
\`\`\`

## GitHub Actions 集成

当前的 GitHub Actions 工作流 (`.github/workflows/sync-official-docs.yml`) 已经集成了以下步骤：

1. **内容同步**: 从官方仓库同步最新内容
2. **AI 翻译**: 使用 Cloudflare Workers AI 进行翻译
3. **后处理**: 自动应用锚点和路径映射
4. **格式修正**: 运行代码块和模板语法修复
5. **提交更新**: 自动提交翻译后的内容

### 触发条件
- 每天自动执行
- 手动触发
- 工作流文件更新时

### 环境变量
需要在 GitHub 仓库的 Secrets 中配置：
- \`CLOUDFLARE_API_TOKEN\`: Cloudflare API 令牌
- \`CLOUDFLARE_ACCOUNT_ID\`: Cloudflare 账户 ID

## 本地开发和测试

### 运行翻译脚本
\`\`\`bash
# 使用 AI 翻译
bun run translate-docs:verbose

# 仅格式处理
bun run translate-docs:no-ai

# 后处理已翻译的文档
bun run post-translate:verbose
\`\`\`

### 验证链接和锚点
\`\`\`bash
# 修正锚点链接
node scripts/fix-anchor-links.js

# 验证链接状态
node scripts/validate-links.mjs
\`\`\`

## 配置更新流程

当需要添加新的锚点或路径映射时：

1. 更新 \`config/anchor-mappings.js\`
2. 如果涉及 Cloudflare Worker，同步更新 \`config/cloudflare-worker-rules.js\`
3. 运行本地测试验证
4. 提交更改并触发 CI/CD 流程

## 监控和维护

### 日志监控
- GitHub Actions 提供详细的翻译日志
- Cloudflare Worker 日志可通过 Dashboard 查看

### 质量检查
- 自动验证翻译后的格式一致性
- 定期检查锚点链接的有效性
- 监控翻译缓存的命中率

### 故障恢复
- 翻译失败时会回退到仅格式处理模式
- 保留翻译缓存以加速重试
- 支持手动触发重新翻译

## 最佳实践

1. **配置同步**: 确保所有环境使用相同的映射配置
2. **增量更新**: 只翻译变更的内容，提高效率
3. **质量验证**: 每次翻译后自动检查格式和链接
4. **缓存策略**: 合理使用翻译缓存，避免重复翻译
5. **错误处理**: 优雅处理翻译失败，不中断整个流程

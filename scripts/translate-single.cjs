#!/usr/bin/env node

/**
 * 单个文件翻译脚本
 * 用于 CI 工作流中重新翻译有问题的文件
 * 
 * 用法: node scripts/translate-single.cjs <source-file> <target-file>
 * 
 * 示例:
 *   node scripts/translate-single.cjs content/introduction.md docs/introduction.md
 */

const fs = require('fs');
const path = require('path');

// 尝试加载 dotenv 包
let dotenv;
try {
  dotenv = require('dotenv');
  dotenv.config();
} catch (error) {
  console.warn('⚠️ dotenv not installed, using environment variables only');
}

// 确保 fetch 可用
let fetch;
if (typeof globalThis.fetch === 'undefined') {
  try {
    fetch = require('node-fetch');
  } catch (error) {
    console.error('❌ fetch is not available. Please upgrade to Node.js 18+ or install node-fetch');
    process.exit(1);
  }
} else {
  fetch = globalThis.fetch;
}

// 加载术语表
const glossaryFile = path.resolve(__dirname, '../config/glossary.json');
let glossary = {};
try {
  if (fs.existsSync(glossaryFile)) {
    glossary = JSON.parse(fs.readFileSync(glossaryFile, 'utf8'));
  }
} catch (error) {
  console.warn('⚠️ Failed to load glossary:', error.message);
}

// 加载翻译缓存
const cacheFile = path.join(__dirname, '.translation-cache.json');
let translationCache = new Map();
try {
  if (fs.existsSync(cacheFile)) {
    const cacheData = fs.readFileSync(cacheFile, 'utf8');
    const cache = JSON.parse(cacheData);
    translationCache = new Map(cache.entries || []);
  }
} catch (error) {
  console.warn('⚠️ Failed to load translation cache:', error.message);
}

/**
 * 保护代码块不被翻译
 */
function protectCodeBlocks(content) {
  const placeholders = new Map();
  let counter = 0;

  // 保护代码块
  content = content.replace(/```[\s\S]*?```/g, (match) => {
    const placeholder = `__CODE_BLOCK_${counter++}__`;
    placeholders.set(placeholder, match);
    return placeholder;
  });

  // 保护行内代码
  content = content.replace(/`[^`\n]+`/g, (match) => {
    const placeholder = `__INLINE_CODE_${counter++}__`;
    placeholders.set(placeholder, match);
    return placeholder;
  });

  // 保护 HTML 标签
  content = content.replace(/<[^>]+>/g, (match) => {
    const placeholder = `__HTML_TAG_${counter++}__`;
    placeholders.set(placeholder, match);
    return placeholder;
  });

  // 保护链接
  content = content.replace(/\[([^\]]*)\]\([^)]*\)/g, (match) => {
    const placeholder = `__LINK_${counter++}__`;
    placeholders.set(placeholder, match);
    return placeholder;
  });

  return { content, placeholders };
}

/**
 * 恢复被保护的代码块
 */
function restoreCodeBlocks(content, placeholders) {
  for (const [placeholder, original] of placeholders) {
    const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    content = content.replace(new RegExp(escapedPlaceholder, 'g'), original);
  }
  return content;
}

/**
 * 获取术语表提示
 */
function getGlossaryPrompt() {
  const terms = Object.entries(glossary);
  if (terms.length === 0) return '';

  const termList = terms.slice(0, 20).map(([en, zh]) => `- ${en} -> ${zh}`).join('\n');
  return `\n\n关键术语表（必须遵循）：\n${termList}`;
}

/**
 * 使用 Cloudflare Workers AI 翻译
 */
async function translateWithCloudflare(text, filePath) {
  const glossaryPrompt = getGlossaryPrompt();

  const systemPrompt = `You are a professional technical documentation translator specializing in translating NestJS-related English technical documentation to Chinese.

Translation Requirements:
1. **Technical Terms**: Strict adherence to the provided glossary is required.${glossaryPrompt}
   - Other common terms: Provider -> 提供者, Controller -> 控制器, Middleware -> 中间件.

2. **Code and Format Preservation (CRITICAL)**:
   - Keep code examples, variable names, function names unchanged.
   - Maintain Markdown formatting, links, images, tables unchanged.
   - Translate code comments from English to Chinese.
   - **DO NOT EXPLAIN OR MODIFY placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.**
   - **Keep these placeholders EXACTLY as they are in the source text.**
   - Keep relative links unchanged (will be processed later).

3. **Special Syntax Processing**:
   - Remove all @@switch blocks and content after them.
   - Convert @@filename(xxx) to rspress syntax: \`\`\`typescript title="xxx".
   - Keep internal anchors unchanged (will be mapped later).

4. **Content Guidelines**:
   - Maintain professionalism and readability. Use natural, fluent Chinese.
   - Keep content that is already in Chinese unchanged.
   - Don't add extra content not in the original.
   - Appropriate Chinese localization improvements are welcome.

5. **Link Handling**:
   - Keep relative paths unchanged (e.g., ./guide/introduction).
   - Keep docs.nestjs.com links unchanged (will be processed later).
   - Maintain anchor links as-is (e.g., #provider-scope).

Please translate the following English technical documentation to Chinese following these rules:`;

  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const model = '@cf/meta/llama-3-8b-instruct';

  if (!apiToken || !accountId) {
    throw new Error('Cloudflare API token and Account ID not configured');
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 4000
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Cloudflare Workers AI error: ${error.error || error.errors?.[0]?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.result?.response || text;
}

/**
 * 检查内容是否包含中文
 */
function hasChineseContent(content) {
  return /[\u4e00-\u9fa5]/.test(content);
}

/**
 * 翻译单个文件
 */
async function translateFile(sourceFile, targetFile) {
  console.log(`📝 翻译单个文件`);
  console.log(`   源文件: ${sourceFile}`);
  console.log(`   目标文件: ${targetFile}`);

  // 检查源文件是否存在
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`源文件不存在: ${sourceFile}`);
  }

  // 读取源文件
  let content = fs.readFileSync(sourceFile, 'utf8');

  // 1. 移除所有 @@switch 分支
  content = content.replace(/@@switch[\s\S]*?(?=```|\n\n|$)/g, '');

  // 2. 删除所有 @@filename 行
  content = content.replace(/^@@filename\s*\([^)]*\)\s*\r?\n/gm, '');

  // 3. 保护代码块
  const { content: protectedContent, placeholders } = protectCodeBlocks(content);

  // 4. 翻译
  let translatedContent;
  
  // 检查是否有可用的 Cloudflare 配置
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (apiToken && accountId) {
    console.log('🔄 使用 Cloudflare Workers AI 翻译...');
    translatedContent = await translateWithCloudflare(protectedContent, sourceFile);
  } else {
    console.log('⚠️ 未配置 Cloudflare API 凭据，保留原文');
    translatedContent = protectedContent;
  }

  // 5. 恢复代码块
  translatedContent = restoreCodeBlocks(translatedContent, placeholders);

  // 6. 添加文件头注释
  const relativePath = path.relative(process.cwd(), sourceFile).replace(/\\/g, '/');
  const timestamp = new Date().toISOString();
  const header = `<!-- 此文件从 ${relativePath} 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: ${timestamp} -->
<!-- 源文件: ${relativePath} -->

`;

  // 确保目标目录存在
  const targetDir = path.dirname(targetFile);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 写入目标文件
  fs.writeFileSync(targetFile, header + translatedContent, 'utf8');

  console.log(`✅ 翻译完成: ${targetFile}`);
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('用法: node scripts/translate-single.cjs <source-file> <target-file>');
    console.error('示例: node scripts/translate-single.cjs content/introduction.md docs/introduction.md');
    process.exit(1);
  }
  
  const sourceFile = path.resolve(args[0]);
  const targetFile = path.resolve(args[1]);
  
  try {
    await translateFile(sourceFile, targetFile);
    process.exit(0);
  } catch (error) {
    console.error(`❌ 翻译失败: ${error.message}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

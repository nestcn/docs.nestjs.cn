#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const crypto = require('crypto');
const pLimit = require('p-limit');

// 确保 fetch 可用 (Node.js 18+ 内置，旧版本需要 polyfill)
let fetch;
if (typeof globalThis.fetch === 'undefined') {
  try {
    fetch = require('node-fetch');
  } catch (error) {
    console.error('❌ fetch is not available. Please upgrade to Node.js 18+ or install node-fetch:');
    console.error('   npm install node-fetch');
    process.exit(1);
  }
} else {
  fetch = globalThis.fetch;
}

/**
 * 自动翻译脚本 - 将 content 目录的英文文档翻译并更新到 docs 目录
 * 
 * 功能：
 * 1. 检测 content 目录中的变更
 * 2. 使用 AI 翻译服务进行翻译 (支持术语表、Llama-3、并发)
 * 3. 处理格式（清理 @@filename, @@switch 等）
 * 4. 将翻译后的内容更新到 docs 目录
 * 5. 支持增量更新（只处理变更的文件）
 */

class DocumentTranslator {
  constructor(options = {}) {
    this.contentDir = options.contentDir || 'content';
    this.docsDir = options.docsDir || 'docs';
    this.processedFiles = 0;
    this.translatedFiles = 0;
    this.skippedFiles = 0;
    this.errors = [];
    this.verbose = options.verbose || false;
    this.concurrency = options.concurrency || 5;

    // AI 翻译配置 - 仅支持 Cloudflare Workers AI
    this.useAI = options.useAI !== false; // 默认启用
    this.aiProvider = 'cloudflare'; // 只支持 cloudflare
    this.apiToken = options.apiToken || process.env.CLOUDFLARE_API_TOKEN;
    this.accountId = options.accountId || process.env.CLOUDFLARE_ACCOUNT_ID;
    this.model = options.model || '@cf/meta/llama-3-8b-instruct'; // 默认升级到 Llama 3
    this.maxTokens = options.maxTokens || 4000;

    // 术语表配置
    this.glossaryFile = path.resolve(__dirname, '../config/glossary.json');
    this.glossary = {};
    this.loadGlossary();

    // 翻译缓存
    this.translationCache = new Map();
    this.cacheFile = path.join(__dirname, '.translation-cache.json');
    this.loadTranslationCache();

    // 代码块保护
    this.codeBlockPlaceholders = new Map();
    this.placeholderCounter = 0;
  }

  /**
   * 加载翻译缓存
   */
  loadTranslationCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const cacheData = fs.readFileSync(this.cacheFile, 'utf8');
        const cache = JSON.parse(cacheData);
        this.translationCache = new Map(cache.entries || []);
        if (this.verbose) {
          console.log(`📚 Loaded ${this.translationCache.size} cached translations`);
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load translation cache:', error.message);
      this.translationCache = new Map();
    }
  }

  /**
   * 加载术语表
   */
  loadGlossary() {
    try {
      if (fs.existsSync(this.glossaryFile)) {
        const data = fs.readFileSync(this.glossaryFile, 'utf8');
        this.glossary = JSON.parse(data);
        if (this.verbose) {
          console.log(`📚 Loaded glossary with ${Object.keys(this.glossary).length} terms`);
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load glossary:', error.message);
    }
  }

  /**
   * 生成术语表提示词
   */
  getGlossaryPrompt() {
    if (Object.keys(this.glossary).length === 0) return '';

    let prompt = '\nTerminology / Glossary (Must Follow):\n';
    for (const [key, value] of Object.entries(this.glossary)) {
      prompt += `- ${key}: ${value}\n`;
    }
    return prompt;
  }

  /**
   * 保存翻译缓存
   */
  saveTranslationCache() {
    try {
      const cacheData = {
        entries: Array.from(this.translationCache.entries()),
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.cacheFile, JSON.stringify(cacheData, null, 2), 'utf8');
      if (this.verbose) {
        console.log(`💾 Saved ${this.translationCache.size} translations to cache`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to save translation cache:', error.message);
    }
  }

  /**
   * 生成内容的哈希值用于缓存
   */
  generateContentHash(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * 保护代码块不被翻译
   */
  protectCodeBlocks(content) {
    this.codeBlockPlaceholders.clear();
    this.placeholderCounter = 0;

    // 保护代码块
    content = content.replace(/```[\s\S]*?```/g, (match) => {
      const placeholder = `__CODE_BLOCK_${this.placeholderCounter++}__`;
      this.codeBlockPlaceholders.set(placeholder, match);
      return placeholder;
    });

    // 保护行内代码
    content = content.replace(/`[^`\n]+`/g, (match) => {
      const placeholder = `__INLINE_CODE_${this.placeholderCounter++}__`;
      this.codeBlockPlaceholders.set(placeholder, match);
      return placeholder;
    });

    // 保护 HTML 标签
    content = content.replace(/<[^>]+>/g, (match) => {
      const placeholder = `__HTML_TAG_${this.placeholderCounter++}__`;
      this.codeBlockPlaceholders.set(placeholder, match);
      return placeholder;
    });

    // 保护链接
    content = content.replace(/\[([^\]]*)\]\([^)]*\)/g, (match) => {
      const placeholder = `__LINK_${this.placeholderCounter++}__`;
      this.codeBlockPlaceholders.set(placeholder, match);
      return placeholder;
    });

    return content;
  }

  /**
   * 恢复被保护的代码块
   */
  restoreCodeBlocks(content) {
    for (const [placeholder, original] of this.codeBlockPlaceholders) {
      content = content.replace(new RegExp(placeholder, 'g'), original);
    }
    return content;
  }

  /**
   * 调用 Cloudflare Workers AI 进行翻译
   */
  async translateWithCloudflare(text) {
    if (!this.apiToken || !this.accountId) {
      throw new Error('Cloudflare API token and Account ID not configured');
    }

    const glossaryPrompt = this.getGlossaryPrompt();

    const systemPrompt = `You are a professional technical documentation translator specializing in translating NestJS-related English technical documentation to Chinese.

Translation Requirements:
1. **Technical Terms**: Strict adherence to the provided glossary is required.${glossaryPrompt}
   - Other common terms: Provider -> 提供者, Controller -> 控制器, Middleware -> 中间件.

2. **Code and Format Preservation**:
   - Keep code examples, variable names, function names unchanged
   - Maintain Markdown formatting, links, images, tables unchanged
   - Translate code comments from English to Chinese
   - Keep relative links unchanged (will be processed later)

3. **Special Syntax Processing**:
   - Remove all @@switch blocks and content after them
   - Convert @@filename(xxx) to rspress syntax: \`\`\`typescript title="xxx"
   - Keep internal anchors unchanged (will be mapped later)

4. **Content Guidelines**:
   - Maintain professionalism and readability. Use natural, fluent Chinese.
   - Keep content that is already in Chinese unchanged
   - Don't add extra content not in the original
   - Appropriate Chinese localization improvements are welcome

5. **Link Handling**:
   - Keep relative paths unchanged (e.g., ./guide/introduction)
   - Keep docs.nestjs.com links unchanged (will be processed later)
   - Maintain anchor links as-is (e.g., #provider-scope)

Please translate the following English technical documentation to Chinese following these rules:`;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/${this.model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
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
          max_tokens: this.maxTokens
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cloudflare Workers AI error: ${error.errors?.[0]?.message || response.statusText}`);
    }

    const result = await response.json();

    // Cloudflare Workers AI 返回格式可能不同，需要适配
    if (result.success && result.result) {
      // 处理可能的响应格式
      if (result.result.response) {
        return result.result.response;
      } else if (result.result.choices && result.result.choices[0]) {
        return result.result.choices[0].message?.content || text;
      } else if (typeof result.result === 'string') {
        return result.result;
      }
    }

    return text;
  }

  /**
   * 使用 Cloudflare Workers AI 翻译文本
   */
  async translateWithAI(text, filePath) {
    if (!this.useAI) {
      return text;
    }

    // 检查缓存
    const contentHash = this.generateContentHash(text);
    const cacheKey = `${filePath}:${contentHash}`;

    if (this.translationCache.has(cacheKey)) {
      if (this.verbose) {
        console.log(`  📚 Using cached translation for ${filePath}`);
      }
      return this.translationCache.get(cacheKey);
    }

    try {
      // 保护代码块
      const protectedText = this.protectCodeBlocks(text);

      // 使用 Cloudflare Workers AI 翻译
      const translatedText = await this.translateWithCloudflare(protectedText);

      // 恢复代码块
      const finalText = this.restoreCodeBlocks(translatedText);

      // 缓存翻译结果
      this.translationCache.set(cacheKey, finalText);

      if (this.verbose) {
        console.log(`  🤖 AI translated: ${filePath}`);
      }

      return finalText;
    } catch (error) {
      console.warn(`⚠️ AI translation failed for ${filePath}: ${error.message}`);
      return text; // 翻译失败时返回原文
    }
  }

  /**
   * 检查文件是否需要更新
   */
  needsUpdate(sourcePath, targetPath) {
    if (!fs.existsSync(targetPath)) {
      return true;
    }

    const sourceStats = fs.statSync(sourcePath);
    const targetStats = fs.statSync(targetPath);

    // 如果源文件更新时间更新，则需要更新
    return sourceStats.mtime > targetStats.mtime;
  }

  /**
   * 处理单个文件的翻译
   */
  async translateFile(contentPath) {
    try {
      const relativePath = path.relative(this.contentDir, contentPath);
      const outputPath = path.join(this.docsDir, relativePath);

      this.processedFiles++;

      // 检查是否需要更新
      if (!this.needsUpdate(contentPath, outputPath)) {
        if (this.verbose) {
          console.log(`⏭️ Skipped (up to date): ${relativePath}`);
        }
        this.skippedFiles++;
        return false;
      }

      const content = fs.readFileSync(contentPath, 'utf8');

      // 确保输出目录存在
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // 使用 AI 翻译内容
      let translatedContent = content;
      if (this.useAI) {
        console.log(`🤖 Translating: ${relativePath}`);
        translatedContent = await this.translateWithAI(content, relativePath);
      }

      // 处理内容格式
      const processedContent = this.processContent(translatedContent, relativePath);

      // 写入文件
      fs.writeFileSync(outputPath, processedContent, 'utf8');

      // 保持修改时间同步
      const sourceStats = fs.statSync(contentPath);
      fs.utimesSync(outputPath, sourceStats.atime, sourceStats.mtime);

      console.log(`✅ Translated: ${relativePath}`);
      this.translatedFiles++;
      return true;
    } catch (error) {
      this.errors.push({ file: contentPath, error: error.message });
      console.error(`❌ Translation failed for ${contentPath}: ${error.message}`);
      return false;
    }
  }

  /**
   * 处理文档内容
   */
  processContent(content, filePath) {
    let processed = content;

    // 1. 处理标准的 @@filename 模式
    processed = processed.replace(/```(\w+)\s*\n@@filename\(([^)]*)\)([\s\S]*?)(?=\n```|@@switch|\n*$)/g, (match, lang, filename, codeContent) => {
      if (this.verbose) {
        console.log(`  Processing @@filename: ${filename} (${lang})`);
      }

      // 查找 @@switch 位置
      const switchIndex = codeContent.indexOf('\n@@switch\n');
      let finalCodeContent = codeContent;

      if (switchIndex !== -1) {
        // 如果有 @@switch，只保留 @@switch 之前的代码
        finalCodeContent = codeContent.substring(0, switchIndex);
      }

      // 清理代码开头和结尾的多余换行符
      finalCodeContent = finalCodeContent.replace(/^\n+/, '').replace(/\n+$/, '');

      // 使用 rspress 格式
      if (filename.trim()) {
        return `\`\`\`${lang} title="${filename}"\n${finalCodeContent}\n\`\`\``;
      } else {
        return `\`\`\`${lang}\n${finalCodeContent}\n\`\`\``;
      }
    });

    // 2. 处理缺少开始标记的 @@filename
    processed = processed.replace(/(\n|^)@@filename\(([^)]*)\)\n([\s\S]*?)(?=\n```|@@switch|\n*$)/g, (match, prefix, filename, codeContent) => {
      if (this.verbose) {
        console.log(`  Processing standalone @@filename: ${filename}`);
      }

      const switchIndex = codeContent.indexOf('\n@@switch\n');
      let finalCodeContent = codeContent;

      if (switchIndex !== -1) {
        finalCodeContent = codeContent.substring(0, switchIndex);
      }

      finalCodeContent = finalCodeContent.replace(/^\n+/, '').replace(/\n+$/, '');

      if (filename.trim()) {
        return `${prefix}\`\`\`typescript title="${filename}"\n${finalCodeContent}\n\`\`\``;
      } else {
        return `${prefix}\`\`\`typescript\n${finalCodeContent}\n\`\`\``;
      }
    });

    // 3. 移除所有剩余的 @@switch 标记及其后续内容
    processed = processed.replace(/\n@@switch\n[\s\S]*?(?=\n```|\n*$)/g, '');
    processed = processed.replace(/@@switch[\s\S]*?(?=\n```|\n*$)/g, '');

    // 4. 修复可能的模板语法问题
    processed = processed.replace(/\{\{\s*['"]\s*\{\s*['"]\s*\}\}/g, '{');
    processed = processed.replace(/\{\{\s*['"]\s*\}\s*['"]\s*\}\}/g, '}');
    processed = processed.replace(/&#125;/g, '}');

    // 5. 清理多余的空行
    processed = processed.replace(/\n{3,}/g, '\n\n');

    // 6. 添加处理标记（仅在开头添加一次）
    if (!processed.startsWith('<!--')) {
      const timestamp = new Date().toISOString();
      const header = `<!-- 此文件从 content/${filePath} 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: ${timestamp} -->
<!-- 源文件: content/${filePath} -->

`;
      processed = header + processed;
    }

    return processed;
  }

  /**
   * 扫描并处理所有文件
   */
  async run() {
    console.log('🔍 Starting document translation process...');
    console.log(`📁 Source: ${path.resolve(this.contentDir)}`);
    console.log(`📁 Target: ${path.resolve(this.docsDir)}`);

    if (this.useAI) {
      console.log(`🤖 AI Provider: Cloudflare Workers AI`);
      console.log(`🧠 Model: ${this.model}`);
      console.log(`🚀 Concurrency: ${this.concurrency}`);
    } else {
      console.log('🔄 AI translation disabled - only format processing');
    }

    try {
      // 检查源目录是否存在
      if (!fs.existsSync(this.contentDir)) {
        throw new Error(`Source directory '${this.contentDir}' does not exist`);
      }

      // 查找所有 Markdown 文件
      const pattern = path.join(this.contentDir, '**', '*.md').replace(/\\/g, '/');
      const files = await glob(pattern);

      console.log(`📄 Found ${files.length} markdown files to process`);

      if (files.length === 0) {
        console.log('⚠️ No markdown files found to process');
        return false;
      }

      // 并发处理文件
      let hasChanges = false;
      const limit = pLimit(this.concurrency);

      // 创建任务队列
      const tasks = files.map(file => limit(async () => {
        const changed = await this.translateFile(file);
        if (changed) hasChanges = true;
        return changed;
      }));

      // 等待所有任务完成
      await Promise.all(tasks);

      // 保存翻译缓存
      if (this.translationCache.size > 0) {
        this.saveTranslationCache();
      }

      // 输出统计信息
      console.log('\n📊 Translation Summary:');
      console.log(`✅ Processed: ${this.processedFiles} files`);
      console.log(`🔄 Translated: ${this.translatedFiles} files`);
      console.log(`⏭️ Skipped: ${this.skippedFiles} files`);
      console.log(`❌ Errors: ${this.errors.length} files`);
      console.log(`📚 Cache entries: ${this.translationCache.size}`);

      if (this.errors.length > 0) {
        console.log('\n❌ Translation Errors:');
        this.errors.forEach(error => {
          console.log(`  - ${path.relative(process.cwd(), error.file)}: ${error.error}`);
        });
      }

      // 运行翻译后处理器
      if (hasChanges) {
        console.log('\n🔄 Running post-translation processing...');
        try {
          const PostTranslateProcessor = require('./post-translate-processor.js');
          const processor = new PostTranslateProcessor({
            docsDir: this.docsDir,
            verbose: this.verbose
          });

          const postProcessChanged = await processor.run();
          if (postProcessChanged) {
            console.log('✅ Post-processing completed with changes');
          } else {
            console.log('✅ Post-processing completed - no changes needed');
          }
        } catch (error) {
          console.warn('⚠️ Post-processing failed:', error.message);
          // 不要因为后处理失败而终止整个翻译流程
        }

        console.log('\n✅ Translation completed with changes');
      } else {
        console.log('\n✅ Translation completed - all files up to date');
      }

      return hasChanges;
    } catch (error) {
      console.error('❌ Translation process failed:', error.message);
      throw error;
    }
  }
}

// 命令行支持
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    contentDir: 'content',
    docsDir: 'docs',
    useAI: !args.includes('--no-ai'),
    model: '@cf/meta/llama-3-8b-instruct', // Updated default
    concurrency: 5
  };

  // 解析命令行参数
  const contentDirIndex = args.indexOf('--content-dir');
  if (contentDirIndex !== -1 && args[contentDirIndex + 1]) {
    options.contentDir = args[contentDirIndex + 1];
  }

  const docsDirIndex = args.indexOf('--docs-dir');
  if (docsDirIndex !== -1 && args[docsDirIndex + 1]) {
    options.docsDir = args[docsDirIndex + 1];
  }

  const modelIndex = args.indexOf('--model');
  if (modelIndex !== -1 && args[modelIndex + 1]) {
    options.model = args[modelIndex + 1];
  }

  const apiTokenIndex = args.indexOf('--api-token');
  if (apiTokenIndex !== -1 && args[apiTokenIndex + 1]) {
    options.apiToken = args[apiTokenIndex + 1];
  }

  const accountIdIndex = args.indexOf('--account-id');
  if (accountIdIndex !== -1 && args[accountIdIndex + 1]) {
    options.accountId = args[accountIdIndex + 1];
  }

  const concurrencyIndex = args.indexOf('--concurrency');
  if (concurrencyIndex !== -1 && args[concurrencyIndex + 1]) {
    options.concurrency = parseInt(args[concurrencyIndex + 1], 10) || 5;
  }

  // 显示帮助信息
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
使用方法: node translate-docs.js [选项]

选项:
  --content-dir <dir>     源文件目录 (默认: content)
  --docs-dir <dir>        目标文件目录 (默认: docs)
  --model <model>         Cloudflare Workers AI 模型 (默认: @cf/meta/llama-3-8b-instruct)
  --concurrency <num>     并发请求数 (默认: 5)
  --api-token <token>     Cloudflare API 令牌 (或使用环境变量)
  --account-id <id>       Cloudflare Account ID (或使用环境变量)
  --no-ai                 禁用 AI 翻译，仅处理格式
  --verbose, -v           显示详细信息
  --help, -h              显示帮助信息

环境变量:
  CLOUDFLARE_API_TOKEN    Cloudflare API 令牌
  CLOUDFLARE_ACCOUNT_ID   Cloudflare Account ID

可用模型:
  @cf/meta/llama-3-8b-instruct         Llama 3 8B (默认，推荐)
  @cf/meta/llama-2-7b-chat-int8        Llama 2 7B
  @cf/mistral/mistral-7b-instruct-v0.1 Mistral 7B
  @cf/openchat/openchat-3.5-0106       OpenChat 3.5

示例:
  # 基本使用（使用环境变量配置）
  node translate-docs.js --verbose
  
  # 指定不同模型
  node translate-docs.js --model "@cf/mistral/mistral-7b-instruct-v0.1"
  
  # 指定并发数
  node translate-docs.js --concurrency 10
  
  # 直接指定 API 配置
  node translate-docs.js --api-token your-token --account-id your-account-id
  
  # 仅格式处理，不使用 AI
  node translate-docs.js --no-ai
`);
    process.exit(0);
  }

  const translator = new DocumentTranslator(options);
  translator.run()
    .then(hasChanges => {
      process.exit(hasChanges ? 0 : 1);
    })
    .catch(error => {
      console.error('Translation failed:', error);
      process.exit(2);
    });
}

module.exports = DocumentTranslator;

#!/usr/bin/env bun
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { glob } from 'glob';
import pLimit from 'p-limit';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 自动翻译脚本 - 将 content 目录的英文文档翻译并更新到 docs 目录
 * 重构版本: TypeScript + Bun
 */

interface TranslatorOptions {
  contentDir?: string;
  docsDir?: string;
  verbose?: boolean;
  concurrency?: number;
  translateEnglish?: boolean;
  useAI?: boolean;
  model?: string;
  apiToken?: string;
  accountId?: string;
  maxTokens?: number;
}

interface TranslationError {
  file: string;
  error: string;
}

interface CacheData {
  entries: [string, string][];
  lastUpdated: string;
}

class DocumentTranslator {
  private contentDir: string;
  private docsDir: string;
  private processedFiles = 0;
  private translatedFiles = 0;
  private skippedFiles = 0;
  private errors: TranslationError[] = [];
  private verbose: boolean;
  private concurrency: number;
  private translateEnglish: boolean;

  private useAI: boolean;
  private aiProvider = 'cloudflare';
  private apiToken: string | undefined;
  private accountId: string | undefined;
  private model: string;
  private maxTokens: number;

  private glossaryFile: string;
  private glossary: Record<string, string> = {};
  private translationCache = new Map<string, string>();
  private cacheFile: string;

  private codeBlockPlaceholders = new Map<string, string>();
  private placeholderCounter = 0;

  constructor(options: TranslatorOptions = {}) {
    this.contentDir = options.contentDir || 'content';
    this.docsDir = options.docsDir || 'docs';
    this.verbose = options.verbose || false;
    this.concurrency = options.concurrency || 5;
    this.translateEnglish = options.translateEnglish || false;

    this.useAI = options.useAI !== false;
    this.apiToken = options.apiToken || process.env.CLOUDFLARE_API_TOKEN;
    this.accountId = options.accountId || process.env.CLOUDFLARE_ACCOUNT_ID;
    this.model = options.model || '@cf/meta/llama-3-8b-instruct';
    this.maxTokens = options.maxTokens || 4000;

    const currentFileUrl = import.meta.url;
    const currentFilePath = new URL(currentFileUrl).pathname;
    const currentDir = path.dirname(currentFilePath);

    this.glossaryFile = path.resolve(currentDir, '../config/glossary.json');
    this.cacheFile = path.join(currentDir, '.translation-cache.json');

    this.loadGlossary();
    this.loadTranslationCache();
  }

  private loadTranslationCache(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const cacheData = fs.readFileSync(this.cacheFile, 'utf8');
        const cache: CacheData = JSON.parse(cacheData);
        this.translationCache = new Map(cache.entries || []);
        if (this.verbose) {
          console.log(`📚 Loaded ${this.translationCache.size} cached translations`);
        }
      }
    } catch (error: any) {
      console.warn('⚠️ Failed to load translation cache:', error.message);
      this.translationCache = new Map();
    }
  }

  private loadGlossary(): void {
    try {
      if (fs.existsSync(this.glossaryFile)) {
        const data = fs.readFileSync(this.glossaryFile, 'utf8');
        this.glossary = JSON.parse(data);
        if (this.verbose) {
          console.log(`📚 Loaded glossary with ${Object.keys(this.glossary).length} terms`);
        }
      }
    } catch (error: any) {
      console.warn('⚠️ Failed to load glossary:', error.message);
    }
  }

  private getGlossaryPrompt(): string {
    if (Object.keys(this.glossary).length === 0) return '';
    let prompt = '\nTerminology / Glossary (Must Follow):\n';
    for (const [key, value] of Object.entries(this.glossary)) {
      prompt += `- ${key}: ${value}\n`;
    }
    return prompt;
  }

  private saveTranslationCache(): void {
    try {
      const cacheData: CacheData = {
        entries: Array.from(this.translationCache.entries()),
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.cacheFile, JSON.stringify(cacheData, null, 2), 'utf8');
      if (this.verbose) {
        console.log(`💾 Saved ${this.translationCache.size} translations to cache`);
      }
    } catch (error: any) {
      console.warn('⚠️ Failed to save translation cache:', error.message);
    }
  }

  private generateContentHash(content: string): string {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  private protectCodeBlocks(content: string): string {
    this.codeBlockPlaceholders.clear();
    this.placeholderCounter = 0;

    let protectedContent = content;

    // 保护代码块
    protectedContent = protectedContent.replace(/```[\s\S]*?```/g, (match) => {
      const placeholder = `__CODE_BLOCK_${this.placeholderCounter++}__`;
      this.codeBlockPlaceholders.set(placeholder, match);
      return placeholder;
    });

    // 保护行内代码
    protectedContent = protectedContent.replace(/`[^`\n]+`/g, (match) => {
      const placeholder = `__INLINE_CODE_${this.placeholderCounter++}__`;
      this.codeBlockPlaceholders.set(placeholder, match);
      return placeholder;
    });

    // 保护 HTML 标签
    protectedContent = protectedContent.replace(/<[^>]+>/g, (match) => {
      const placeholder = `__HTML_TAG_${this.placeholderCounter++}__`;
      this.codeBlockPlaceholders.set(placeholder, match);
      return placeholder;
    });

    // 保护链接
    protectedContent = protectedContent.replace(/\[([^\]]*)\]\([^)]*\)/g, (match) => {
      const placeholder = `__LINK_${this.placeholderCounter++}__`;
      this.codeBlockPlaceholders.set(placeholder, match);
      return placeholder;
    });

    return protectedContent;
  }

  private restoreCodeBlocks(content: string): string {
    let restoredContent = content;
    for (const [placeholder, original] of this.codeBlockPlaceholders) {
      const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      restoredContent = restoredContent.replace(new RegExp(escapedPlaceholder, 'g'), original);
    }
    return restoredContent;
  }

  private async translateWithCloudflare(text: string): Promise<string> {
    const glossaryPrompt = this.getGlossaryPrompt();
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

    const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'production';

    try {
      let response;
      if (isCI) {
        if (!this.apiToken || !this.accountId) {
          throw new Error('Cloudflare API token and Account ID not configured');
        }

        response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/${this.model}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text }
              ],
              max_tokens: this.maxTokens
            })
          }
        );
      } else {
        // 本地开发代理
        response = await fetch('http://localhost:3000/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: systemPrompt + '\n' + text,
            model: this.model
          })
        });
      }

      if (!response.ok) {
        const errorData: any = await response.json();
        throw new Error(`${isCI ? 'Cloudflare Workers AI error' : 'Proxy error'}: ${errorData.error || errorData.errors?.[0]?.message || response.statusText}`);
      }

      const result: any = await response.json();

      if (result.success && result.result) {
        if (result.result.response) return result.result.response;
        if (result.result.choices?.[0]) return result.result.choices[0].message?.content || text;
        if (typeof result.result === 'string') return result.result;
      }

      return text;
    } catch (error: any) {
      console.warn(`⚠️ Translation failed: ${error.message}`);
      throw error;
    }
  }

  private async translateWithAI(text: string, filePath: string): Promise<string> {
    if (!this.useAI) return text;

    const contentHash = this.generateContentHash(text);
    const cacheKey = `${filePath}:${contentHash}`;

    if (this.translationCache.has(cacheKey)) {
      if (this.verbose) console.log(`  📚 Using cached translation for ${filePath}`);
      return this.translationCache.get(cacheKey)!;
    }

    try {
      const protectedText = this.protectCodeBlocks(text);
      let translatedText: string;

      if (protectedText.length > 5000) {
        console.log(`  📝 Text too long, splitting into chunks...`);
        const chunks = this.splitTextIntoChunks(protectedText, 5000);
        const translatedChunks = [];

        for (let i = 0; i < chunks.length; i++) {
          console.log(`  🤖 Translating chunk ${i + 1}/${chunks.length}...`);
          const chunkTranslated = await this.translateWithCloudflare(chunks[i]);
          translatedChunks.push(chunkTranslated);
        }
        translatedText = translatedChunks.join('');
      } else {
        translatedText = await this.translateWithCloudflare(protectedText);
      }

      const finalText = this.restoreCodeBlocks(translatedText);
      const chineseChars = finalText.match(/[\u4e00-\u9fa5]/g);
      const chineseCount = chineseChars ? chineseChars.length : 0;

      if (!filePath.includes('index.md') && chineseCount < 20) {
        throw new Error(`Translation quality check failed: only ${chineseCount} Chinese characters found.`);
      }

      this.translationCache.set(cacheKey, finalText);
      if (this.verbose) console.log(`  🤖 AI translated: ${filePath}`);
      return finalText;
    } catch (error: any) {
      console.warn(`⚠️ AI translation failed for ${filePath}: ${error.message}`);
      throw error;
    }
  }

  private splitTextIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    let currentChunk = '';
    const paragraphs = text.split('\n\n');

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length + 2 <= chunkSize) {
        currentChunk += paragraph + '\n\n';
      } else {
        if (currentChunk) chunks.push(currentChunk);
        if (paragraph.length > chunkSize) {
          const sentences = paragraph.split(/[.!?]+/);
          let currentSentenceChunk = '';
          for (const sentence of sentences) {
            if (currentSentenceChunk.length + sentence.length + 1 <= chunkSize) {
              currentSentenceChunk += sentence + '.';
            } else {
              if (currentSentenceChunk) chunks.push(currentSentenceChunk);
              currentSentenceChunk = sentence + '.';
            }
          }
          currentChunk = currentSentenceChunk;
        } else {
          currentChunk = paragraph + '\n\n';
        }
      }
    }
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
  }

  private needsUpdate(sourcePath: string, targetPath: string): boolean {
    if (!fs.existsSync(targetPath)) return true;
    if (this.translateEnglish) {
      const targetContent = fs.readFileSync(targetPath, 'utf8');
      if (!this.hasChineseContent(targetContent)) return true;
    }
    const sourceStats = fs.statSync(sourcePath);
    const targetStats = fs.statSync(targetPath);
    return sourceStats.mtime > targetStats.mtime;
  }

  private hasChineseContent(content: string): boolean {
    const contentWithoutComments = content.replace(/<!--[\s\S]*?-->/g, '');
    return /[\u4e00-\u9fa5]/.test(contentWithoutComments);
  }

  private processContent(content: string, filePath: string): string {
    let processed = content;
    if (!filePath.includes('index.md')) {
      processed = processed.replace(/https:\/\/docs\.nestjs\.com\//g, '/');
    }
    processed = processed.replace(/\n{3,}/g, '\n\n');

    if (!processed.startsWith('<!--')) {
      const timestamp = new Date().toISOString();
      const header = `<!-- 此文件从 content/${filePath} 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: ${timestamp} -->
<!-- 源文件: content/${filePath} -->

`;
      if (processed.startsWith('---')) {
        const secondDashIndex = processed.indexOf('---', 3);
        if (secondDashIndex !== -1) {
          const endOfFrontmatter = secondDashIndex + 3;
          processed = processed.slice(0, endOfFrontmatter) + '\n' + header + processed.slice(endOfFrontmatter);
        } else {
          processed = header + processed;
        }
      } else {
        processed = header + processed;
      }
    }
    return processed;
  }

  async translateFile(contentPath: string): Promise<boolean> {
    try {
      const relativePath = path.relative(this.contentDir, contentPath);
      const outputPath = path.join(this.docsDir, relativePath);

      this.processedFiles++;

      if (!this.needsUpdate(contentPath, outputPath)) {
        if (this.verbose) console.log(`Skipped (up to date): ${relativePath}`);
        this.skippedFiles++;
        return false;
      }

      let content = fs.readFileSync(contentPath, 'utf8');
      content = content.replace(/@@switch[\s\S]*?(?=```|\n\n|$)/g, '');
      content = content.replace(/^@@filename\s*\([^)]*\)\s*\r?\n/gm, '');

      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      let translatedContent = content;
      const hasPlaceholders = (text: string) => /__\w+_\d+__/.test(text);

      if (!this.useAI && fs.existsSync(outputPath)) {
        const existingContent = fs.readFileSync(outputPath, 'utf8');
        if (this.hasChineseContent(existingContent)) {
          if (hasPlaceholders(existingContent)) {
            const protectedText = this.protectCodeBlocks(content);
            translatedContent = this.restoreCodeBlocks(protectedText);
          } else {
            translatedContent = existingContent;
          }
        } else {
          const protectedText = this.protectCodeBlocks(content);
          translatedContent = this.restoreCodeBlocks(protectedText);
        }
      } else if (this.useAI) {
        console.log(`🤖 Translating: ${relativePath}`);
        translatedContent = await this.translateWithAI(content, relativePath);
      } else {
        const protectedText = this.protectCodeBlocks(content);
        translatedContent = this.restoreCodeBlocks(protectedText);
      }

      const finalContent = this.processContent(translatedContent, relativePath);
      fs.writeFileSync(outputPath, finalContent, 'utf8');

      const sourceStats = fs.statSync(contentPath);
      fs.utimesSync(outputPath, sourceStats.atime, sourceStats.mtime);

      console.log(`✅ Processed: ${relativePath}`);
      this.translatedFiles++;
      return true;
    } catch (error: any) {
      this.errors.push({ file: contentPath, error: error.message });
      console.error(`❌ Translation failed for ${contentPath}: ${error.message}`);
      return false;
    }
  }

  async run(): Promise<boolean> {
    console.log('🔍 Starting document translation process...');
    console.log(`📁 Source: ${path.resolve(this.contentDir)}`);
    console.log(`📁 Target: ${path.resolve(this.docsDir)}`);

    try {
      if (!fs.existsSync(this.contentDir)) {
        throw new Error(`Source directory '${this.contentDir}' does not exist`);
      }

      const pattern = path.join(this.contentDir, '**', '*.md').replace(/\\/g, '/');
      const files = await glob(pattern);
      console.log(`📄 Found ${files.length} markdown files to process`);

      if (files.length === 0) return false;

      let hasChanges = false;
      const limit = pLimit(this.concurrency);
      const tasks = files.map(file => limit(async () => {
        const changed = await this.translateFile(file);
        if (changed) hasChanges = true;
        return changed;
      }));

      await Promise.all(tasks);
      if (this.translationCache.size > 0) this.saveTranslationCache();

      console.log('\n📊 Translation Summary:');
      console.log(`✅ Processed: ${this.processedFiles} files`);
      console.log(`🔄 Translated: ${this.translatedFiles} files`);
      console.log(`⏭️ Skipped: ${this.skippedFiles} files`);
      console.log(`❌ Errors: ${this.errors.length} files`);

      if (hasChanges) {
        console.log('\n🔄 Running post-translation processing...');
        try {
          // 注意: 这里由于 post-translate-processor 还是 .cjs，我们暂时用 require
          const PostTranslateProcessor = require('./post-translate-processor.cjs');
          const processor = new PostTranslateProcessor({
            docsDir: this.docsDir,
            verbose: this.verbose
          });
          await processor.run();
        } catch (error: any) {
          console.warn('⚠️ Post-processing failed:', error.message);
        }
      }

      return hasChanges;
    } catch (error: any) {
      console.error('❌ Translation process failed:', error.message);
      throw error;
    }
  }
}

// 命令行支持
const args = process.argv.slice(2);
const options: TranslatorOptions = {
  verbose: args.includes('--verbose') || args.includes('-v'),
  contentDir: 'content',
  docsDir: 'docs',
  useAI: !args.includes('--no-ai'),
  model: '@cf/meta/llama-3-8b-instruct',
  concurrency: 5,
  translateEnglish: args.includes('--translate-english')
};

const getArgValue = (flag: string) => {
  const index = args.indexOf(flag);
  return index !== -1 ? args[index + 1] : undefined;
};

options.contentDir = getArgValue('--content-dir') || options.contentDir;
options.docsDir = getArgValue('--docs-dir') || options.docsDir;
options.model = getArgValue('--model') || options.model;
options.apiToken = getArgValue('--api-token');
options.accountId = getArgValue('--account-id');
const concurrency = getArgValue('--concurrency');
if (concurrency) options.concurrency = parseInt(concurrency, 10);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
使用方法: bun scripts/translate-docs.ts [选项]

选项:
  --content-dir <dir>     源文件目录 (默认: content)
  --docs-dir <dir>        目标文件目录 (默认: docs)
  --model <model>         Cloudflare Workers AI 模型 (默认: @cf/meta/llama-3-8b-instruct)
  --concurrency <num>     并发请求数 (默认: 5)
  --api-token <token>     Cloudflare API 令牌
  --account-id <id>       Cloudflare Account ID
  --no-ai                 禁用 AI 翻译，仅处理格式
  --translate-english     翻译 docs 目录下的英文文件
  --verbose, -v           显示详细信息
  --help, -h              显示帮助信息
`);
  process.exit(0);
}

const translator = new DocumentTranslator(options);
translator.run().catch(err => {
  console.error(err);
  process.exit(1);
});

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
  apiKey?: string;
  maxTokens?: number;
  force?: boolean;
}

interface TranslationError {
  file: string;
  error: string;
}

interface CacheData {
  entries: [string, string][];
  lastUpdated: string;
}

interface NvidiaCompletionResponse {
  id: string;
  choices: Array<{
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
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
  private force: boolean;

  private useAI: boolean;
  private apiKey: string | undefined;
  private model: string;
  private maxTokens: number;

  // 速率限制: 40 RPM = 每 1500ms 一个请求
  private readonly rateLimitIntervalMs = 1500;
  private lastRequestTime = 0;

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
    this.concurrency = options.concurrency || 3;
    this.translateEnglish = options.translateEnglish || false;
    this.force = options.force || false;

    this.useAI = options.useAI !== false;
    this.apiKey = options.apiKey || process.env.NVIDIA_API_KEY;
    this.model = options.model || 'deepseek-ai/deepseek-v3_1';
    this.maxTokens = options.maxTokens || 4096;

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
    } catch (err: unknown) {
      console.warn('⚠️ Failed to load translation cache:', getErrorMessage(err));
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
    } catch (err: unknown) {
      console.warn('⚠️ Failed to load glossary:', getErrorMessage(err));
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
    } catch (err: unknown) {
      console.warn('⚠️ Failed to save translation cache:', getErrorMessage(err));
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

    // 校验：如果还有未还原的占位符则报错
    const unresolvedMatch = restoredContent.match(/__(?:CODE_BLOCK|INLINE_CODE|LINK|HTML_TAG)_\d+__/g);
    if (unresolvedMatch) {
      const unique = [...new Set(unresolvedMatch)];
      throw new Error(
        `Placeholder restoration failed: ${unique.length} unresolved placeholder(s) remain: ${unique.slice(0, 5).join(', ')}`,
      );
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

    try {
      if (!this.apiKey) {
        throw new Error('NVIDIA_API_KEY not configured');
      }

      // 速率限制：确保请求间隔 >= 1500ms (40 RPM)
      const now = Date.now();
      const elapsed = now - this.lastRequestTime;
      if (elapsed < this.rateLimitIntervalMs) {
        await new Promise(r => setTimeout(r, this.rateLimitIntervalMs - elapsed));
      }
      this.lastRequestTime = Date.now();

      const response = await fetch(
        'https://integrate.api.nvidia.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text },
            ],
            max_tokens: this.maxTokens,
            temperature: 0.3, // 翻译任务用低温度保证准确性
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NVIDIA NIM API error (${response.status}): ${errorText}`);
      }

      const result = (await response.json()) as NvidiaCompletionResponse;
      const content = result.choices?.[0]?.message?.content;

      if (content) {
        if (this.verbose && result.usage) {
          console.log(`    📊 Tokens: ${result.usage.prompt_tokens} prompt + ${result.usage.completion_tokens} completion`);
        }
        return content;
      }

      return text;
    } catch (err: unknown) {
      console.warn(`⚠️ Translation failed: ${getErrorMessage(err)}`);
      throw err;
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
      const sourceCodeBlockCount = (text.match(/```/g) || []).length;
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
        translatedText = translatedChunks.join('\n\n');
      } else {
        translatedText = await this.translateWithCloudflare(protectedText);
      }

      const finalText = this.restoreCodeBlocks(translatedText);

      // 质量校验 1: 中文字符数
      const chineseChars = finalText.match(/[\u4e00-\u9fa5]/g);
      const chineseCount = chineseChars ? chineseChars.length : 0;
      if (!filePath.includes('index.md') && chineseCount < 20) {
        throw new Error(`Translation quality check failed: only ${chineseCount} Chinese characters found.`);
      }

      // 质量校验 2: 代码块数量一致性
      const translatedCodeBlockCount = (finalText.match(/```/g) || []).length;
      if (sourceCodeBlockCount !== translatedCodeBlockCount) {
        console.warn(
          `  ⚠️ Code block count mismatch for ${filePath}: source=${sourceCodeBlockCount}, translated=${translatedCodeBlockCount}. Falling back to source.`,
        );
        throw new Error(
          `Code block count mismatch: source=${sourceCodeBlockCount}, translated=${translatedCodeBlockCount}`,
        );
      }

      this.translationCache.set(cacheKey, finalText);
      if (this.verbose) console.log(`  🤖 AI translated: ${filePath}`);
      return finalText;
    } catch (err: unknown) {
      console.warn(`⚠️ AI translation failed for ${filePath}: ${getErrorMessage(err)}`);
      throw err;
    }
  }

  private splitTextIntoChunks(text: string, chunkSize: number): string[] {
    const placeholderPattern = /__(?:CODE_BLOCK|INLINE_CODE|LINK|HTML_TAG)_\d+__/;
    const chunks: string[] = [];
    let currentChunk = '';
    const paragraphs = text.split('\n\n');

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length + 2 <= chunkSize) {
        currentChunk += paragraph + '\n\n';
      } else {
        // 不在含有占位符的段落边界处切割——如果当前 chunk 末尾
        // 或下一段开头包含占位符，则合并以避免拆断占位符上下文
        if (
          placeholderPattern.test(paragraph) &&
          currentChunk.length + paragraph.length + 2 <= chunkSize * 1.5
        ) {
          currentChunk += paragraph + '\n\n';
          continue;
        }
        if (currentChunk) chunks.push(currentChunk);
        if (paragraph.length > chunkSize) {
          // 超长段落按句子切分，但避免在占位符内部切割
          const sentences = paragraph.split(/(?<=[.!?])\s+/);
          let currentSentenceChunk = '';
          for (const sentence of sentences) {
            if (currentSentenceChunk.length + sentence.length + 1 <= chunkSize) {
              currentSentenceChunk += sentence + ' ';
            } else {
              if (currentSentenceChunk) chunks.push(currentSentenceChunk.trimEnd());
              currentSentenceChunk = sentence + ' ';
            }
          }
          currentChunk = currentSentenceChunk;
        } else {
          currentChunk = paragraph + '\n\n';
        }
      }
    }
    if (currentChunk) chunks.push(currentChunk.trimEnd());
    return chunks;
  }

  private needsUpdate(sourcePath: string, targetPath: string): boolean {
    if (this.force) {
      console.log(`  🔄 Force mode: will re-translate`);
      return true;
    }
    
    if (!fs.existsSync(targetPath)) return true;
    
    const sourceContent = fs.readFileSync(sourcePath, 'utf8');
    const targetContent = fs.readFileSync(targetPath, 'utf8');
    
    // 首先检查翻译完整性，这是最重要的检查
    if (!this.isTranslationComplete(sourceContent, targetContent)) {
      console.log(`  ⚠️ Incomplete translation detected, will re-translate`);
      return true;
    }
    
    if (this.translateEnglish) {
      if (!this.hasChineseContent(targetContent)) return true;
    }
    
    const sourceStats = fs.statSync(sourcePath);
    const targetStats = fs.statSync(targetPath);
    if (sourceStats.mtime > targetStats.mtime) return true;
    
    return false;
  }

  private isTranslationComplete(sourceContent: string, targetContent: string): boolean {
    const sourceLines = sourceContent.split('\n').filter(line => line.trim().length > 0);
    const targetLines = targetContent.split('\n').filter(line => line.trim().length > 0);
    
    const sourceCodeBlocks = (sourceContent.match(/```[\s\S]*?```/g) || []).length;
    const targetCodeBlocks = (targetContent.match(/```[\s\S]*?```/g) || []).length;
    
    if (sourceCodeBlocks !== targetCodeBlocks) {
      return false;
    }
    
    const minRatio = 0.5;
    const ratio = targetLines.length / sourceLines.length;
    if (ratio < minRatio) {
      return false;
    }
    
    const targetWithoutComments = targetContent.replace(/<!--[\s\S]*?-->/g, '');
    const chineseChars = targetWithoutComments.match(/[\u4e00-\u9fa5]/g);
    const chineseCount = chineseChars ? chineseChars.length : 0;
    
    if (chineseCount < 50 && sourceLines.length > 20) {
      return false;
    }
    
    return true;
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
      const outputPath = path.resolve(this.docsDir, relativePath);

      // 安全检查：确保目标路径不在源路径目录内
      const absoluteContentDir = path.resolve(this.contentDir);
      if (outputPath.startsWith(absoluteContentDir)) {
        throw new Error(`CRITICAL: Attempted to write to source directory! Target: ${outputPath}`);
      }

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
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      this.errors.push({ file: contentPath, error: message });
      console.error(`❌ Translation failed for ${contentPath}: ${message}`);
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
          const { runPostTranslateProcessor } = await import('./post-translate-processor.js');
          await runPostTranslateProcessor({
            docsDir: this.docsDir,
            verbose: this.verbose,
          });
        } catch (err: unknown) {
          console.warn('⚠️ Post-processing failed:', getErrorMessage(err));
        }
      }

      return hasChanges;
    } catch (err: unknown) {
      console.error('❌ Translation process failed:', getErrorMessage(err));
      throw err;
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
  model: 'deepseek-ai/deepseek-v3_1',
  concurrency: 3,
  translateEnglish: args.includes('--translate-english'),
  force: args.includes('--force'),
};

const getArgValue = (flag: string) => {
  const index = args.indexOf(flag);
  return index !== -1 ? args[index + 1] : undefined;
};

options.contentDir = getArgValue('--content-dir') || options.contentDir;
options.docsDir = getArgValue('--docs-dir') || options.docsDir;
options.model = getArgValue('--model') || options.model;
options.apiKey = getArgValue('--api-key');
const concurrency = getArgValue('--concurrency');
if (concurrency) options.concurrency = parseInt(concurrency, 10);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
使用方法: bun scripts/translate-docs.ts [选项]

选项:
  --content-dir <dir>     源文件目录 (默认: content)
  --docs-dir <dir>        目标文件目录 (默认: docs)
  --model <model>         NVIDIA NIM 模型 (默认: deepseek-ai/deepseek-v3_1)
  --concurrency <num>     并发请求数 (默认: 3, 受 40 RPM 限速)
  --api-key <key>         NVIDIA API Key (或设置 NVIDIA_API_KEY 环境变量)
  --no-ai                 禁用 AI 翻译，仅处理格式
  --translate-english     翻译 docs 目录下的英文文件
  --force                 强制重新翻译所有文件
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

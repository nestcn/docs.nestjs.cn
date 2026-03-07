#!/usr/bin/env tsx

/**
 * 文档翻译脚本
 * 
 * 用法:
 *   tsx scripts/translate.ts [options]
 * 
 * 选项:
 *   --verbose, -v     显示详细输出
 *   --dry-run         只显示将要翻译的文件，不实际翻译
 *   --force, -f       强制重新翻译所有文件
 *   --model <model>   指定 AI 模型
 *   --file <file>     只翻译指定文件
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  protectCodeBlocks,
  restoreCodeBlocks,
  hasChineseContent,
  loadGlossary,
  generateContentHash,
  removeSwitchBlocks,
  removeFilenameLines,
  generateFileHeader,
  hasPlaceholders,
} from './utils';
import { CloudflareTranslator } from './translator';
import type {
  TranslationOptions,
  FileTranslationTask,
  BatchTranslationResult,
} from './types';

const CONTENT_DIR = path.resolve(process.cwd(), 'content');
const DOCS_DIR = path.resolve(process.cwd(), 'docs');
const CACHE_FILE = path.resolve(process.cwd(), 'scripts/.translation-cache.json');
const GLOSSARY_FILE = path.resolve(process.cwd(), 'config/glossary.json');

class DocumentTranslator {
  private options: TranslationOptions;
  private translator: CloudflareTranslator | null = null;
  private cache: Map<string, string> = new Map();
  private glossary: Record<string, string> = {};
  private verbose: boolean;

  constructor(options: TranslationOptions = {}) {
    this.options = options;
    this.verbose = options.verbose || false;
    this.loadCache();
    this.loadGlossary();
    this.initTranslator();
  }

  private loadCache(): void {
    try {
      if (fs.existsSync(CACHE_FILE)) {
        const data = fs.readFileSync(CACHE_FILE, 'utf8');
        const cache = JSON.parse(data);
        this.cache = new Map(cache.entries || []);
        this.log(`Loaded ${this.cache.size} cached translations`);
      }
    } catch (error) {
      this.log('Failed to load translation cache:', error);
    }
  }

  private saveCache(): void {
    try {
      const data = {
        entries: Array.from(this.cache.entries()),
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf8');
      this.log(`Saved ${this.cache.size} translations to cache`);
    } catch (error) {
      console.error('Failed to save translation cache:', error);
    }
  }

  private loadGlossary(): void {
    try {
      if (fs.existsSync(GLOSSARY_FILE)) {
        this.glossary = JSON.parse(fs.readFileSync(GLOSSARY_FILE, 'utf8'));
        this.log(`Loaded ${Object.keys(this.glossary).length} glossary terms`);
      }
    } catch (error) {
      this.log('Failed to load glossary:', error);
    }
  }

  private initTranslator(): void {
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

    if (apiToken && accountId && this.options.useAI !== false) {
      this.translator = new CloudflareTranslator(
        { apiToken, accountId, model: this.options.model },
        { glossary: this.glossary }
      );
      this.log('Initialized Cloudflare AI translator');
    } else {
      this.log('AI translation disabled or credentials not configured');
    }
  }

  private log(...args: unknown[]): void {
    if (this.verbose) {
      console.log(...args);
    }
  }

  async translateContent(
    content: string,
    filePath: string
  ): Promise<string> {
    // 1. 移除 @@switch 分支
    let processed = removeSwitchBlocks(content);

    // 2. 移除 @@filename 行
    processed = removeFilenameLines(processed);

    // 3. 保护代码块
    const { content: protectedContent, placeholders } =
      protectCodeBlocks(processed);

    // 4. 翻译
    let translated: string;

    if (this.translator) {
      this.log(`Translating ${filePath}...`);
      translated = await this.translator.translate(protectedContent, {
        filePath,
      });
    } else {
      this.log(`No translator available, keeping original content`);
      translated = protectedContent;
    }

    // 5. 恢复代码块
    translated = restoreCodeBlocks(translated, placeholders);

    // 6. 检查占位符是否恢复
    if (hasPlaceholders(translated)) {
      console.warn(`Warning: Placeholders not fully restored in ${filePath}`);
    }

    return translated;
  }

  async translateFile(
    sourcePath: string,
    targetPath: string
  ): Promise<FileTranslationTask> {
    const task: FileTranslationTask = {
      sourcePath,
      targetPath,
      status: 'pending',
    };

    try {
      // 检查源文件是否存在
      if (!fs.existsSync(sourcePath)) {
        throw new Error(`Source file not found: ${sourcePath}`);
      }

      const sourceContent = fs.readFileSync(sourcePath, 'utf8');
      const contentHash = generateContentHash(sourceContent);

      // 检查缓存
      const cacheKey = `${sourcePath}:${contentHash}`;
      if (!this.options.force && this.cache.has(cacheKey)) {
        task.translated = this.cache.get(cacheKey);
        task.fromCache = true;
        task.status = 'completed';
        this.log(`Using cached translation for ${sourcePath}`);
        return task;
      }

      task.status = 'translating';

      // 翻译内容
      const translated = await this.translateContent(sourceContent, sourcePath);

      // 添加文件头
      const header = generateFileHeader(sourcePath);
      task.translated = header + translated;

      // 更新缓存
      this.cache.set(cacheKey, task.translated);

      task.status = 'completed';
      this.log(`Translated ${sourcePath}`);
    } catch (error) {
      task.status = 'failed';
      task.error = (error as Error).message;
      console.error(`Failed to translate ${sourcePath}:`, task.error);
    }

    return task;
  }

  async translateAll(): Promise<BatchTranslationResult> {
    const result: BatchTranslationResult = {
      total: 0,
      success: 0,
      failed: 0,
      cached: 0,
      tasks: [],
    };

    // 获取所有 markdown 文件
    const files = this.getMarkdownFiles(CONTENT_DIR);
    result.total = files.length;

    this.log(`Found ${files.length} files to translate`);

    for (const sourcePath of files) {
      const relativePath = path.relative(CONTENT_DIR, sourcePath);
      const targetPath = path.join(DOCS_DIR, relativePath);

      if (this.options.dryRun) {
        console.log(`Would translate: ${sourcePath} -> ${targetPath}`);
        continue;
      }

      const task = await this.translateFile(sourcePath, targetPath);
      result.tasks.push(task);

      if (task.status === 'completed') {
        result.success++;
        if (task.fromCache) {
          result.cached++;
        }

        // 写入目标文件
        if (task.translated) {
          const targetDir = path.dirname(targetPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          fs.writeFileSync(targetPath, task.translated, 'utf8');
        }
      } else {
        result.failed++;
      }
    }

    // 保存缓存
    if (!this.options.dryRun) {
      this.saveCache();
    }

    return result;
  }

  private getMarkdownFiles(dir: string): string[] {
    const files: string[] = [];

    const traverse = (currentDir: string) => {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (item.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    };

    traverse(dir);
    return files;
  }
}

// CLI 入口
async function main() {
  const args = process.argv.slice(2);
  const options: TranslationOptions = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force') || args.includes('-f'),
  };

  // 解析模型参数
  const modelIndex = args.indexOf('--model');
  if (modelIndex !== -1 && args[modelIndex + 1]) {
    options.model = args[modelIndex + 1];
  }

  // 解析文件参数
  const fileIndex = args.indexOf('--file');
  if (fileIndex !== -1 && args[fileIndex + 1]) {
    options.file = args[fileIndex + 1];
  }

  console.log('🚀 Starting document translation...');
  console.log(`   Verbose: ${options.verbose}`);
  console.log(`   Dry run: ${options.dryRun}`);
  console.log(`   Force: ${options.force}`);

  const translator = new DocumentTranslator(options);
  const result = await translator.translateAll();

  console.log('\n📊 Translation Summary:');
  console.log(`   Total: ${result.total}`);
  console.log(`   Success: ${result.success}`);
  console.log(`   Cached: ${result.cached}`);
  console.log(`   Failed: ${result.failed}`);

  if (result.failed > 0) {
    console.log('\n❌ Failed files:');
    result.tasks
      .filter((t) => t.status === 'failed')
      .forEach((t) => {
        console.log(`   - ${t.sourcePath}: ${t.error}`);
      });
    process.exit(1);
  }

  console.log('\n✅ Translation completed!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

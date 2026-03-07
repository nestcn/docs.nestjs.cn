#!/usr/bin/env tsx

/**
 * 单个文件翻译脚本
 * 
 * 用法:
 *   tsx scripts/translate-single.ts <source-file> <target-file>
 * 
 * 示例:
 *   tsx scripts/translate-single.ts content/introduction.md docs/introduction.md
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  protectCodeBlocks,
  restoreCodeBlocks,
  loadGlossary,
  removeSwitchBlocks,
  removeFilenameLines,
  generateFileHeader,
  hasPlaceholders,
} from './utils';
import { CloudflareTranslator } from './translator';

const GLOSSARY_FILE = path.resolve(process.cwd(), 'config/glossary.json');

async function translateFile(sourceFile: string, targetFile: string): Promise<void> {
  console.log('📝 Translating single file');
  console.log(`   Source: ${sourceFile}`);
  console.log(`   Target: ${targetFile}`);

  // 检查源文件是否存在
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Source file not found: ${sourceFile}`);
  }

  // 加载术语表
  const glossary = loadGlossary(GLOSSARY_FILE);

  // 检查 AI 配置
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!apiToken || !accountId) {
    throw new Error('Cloudflare API credentials not configured');
  }

  // 创建翻译器
  const translator = new CloudflareTranslator(
    { apiToken, accountId },
    { glossary }
  );

  // 读取源文件
  let content = fs.readFileSync(sourceFile, 'utf8');

  // 1. 移除 @@switch 分支
  content = removeSwitchBlocks(content);

  // 2. 移除 @@filename 行
  content = removeFilenameLines(content);

  // 3. 保护代码块
  const { content: protectedContent, placeholders } = protectCodeBlocks(content);

  // 4. 翻译
  console.log('🔄 Translating...');
  const translated = await translator.translate(protectedContent, {
    filePath: sourceFile,
  });

  // 5. 恢复代码块
  let result = restoreCodeBlocks(translated, placeholders);

  // 6. 检查占位符是否恢复
  if (hasPlaceholders(result)) {
    console.warn('⚠️ Warning: Some placeholders were not restored');
  }

  // 7. 添加文件头
  const header = generateFileHeader(sourceFile);
  result = header + result;

  // 确保目标目录存在
  const targetDir = path.dirname(targetFile);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 写入目标文件
  fs.writeFileSync(targetFile, result, 'utf8');

  console.log(`✅ Translation completed: ${targetFile}`);
}

// CLI 入口
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: tsx scripts/translate-single.ts <source-file> <target-file>');
    console.error('Example: tsx scripts/translate-single.ts content/introduction.md docs/introduction.md');
    process.exit(1);
  }

  const sourceFile = path.resolve(args[0]);
  const targetFile = path.resolve(args[1]);

  try {
    await translateFile(sourceFile, targetFile);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Translation failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();

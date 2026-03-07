#!/usr/bin/env tsx

/**
 * 代码块修复脚本
 * 
 * 修复文档中的代码块格式：
 * - 转换 @@filename 语法
 * - 移除 @@switch 分支
 * - 修复缩进问题
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const DOCS_DIR = path.resolve(process.cwd(), 'docs');

function fixCodeBlocks(content: string): string {
  let result = content;

  // 1. 移除 @@switch 分支
  result = result.replace(/@@switch[\s\S]*?(?=```|\n\n|$)/g, '');

  // 2. 转换 @@filename 语法
  // @@filename(main.ts) 后面跟着 ```typescript
  result = result.replace(
    /@@filename\s*\(([^)]+)\)\s*\r?\n```(\w+)/g,
    '\n```$2 title="$1"'
  );

  // 3. 移除独立的 @@filename 行
  result = result.replace(/^@@filename\s*\([^)]*\)\s*\r?\n/gm, '');

  // 4. 修复代码块中的空行
  result = result.replace(/```\s*\n\s*```/g, '```\n```');

  // 5. 确保代码块前后有空行
  result = result.replace(/([^\n])\n```/g, '$1\n\n```');
  result = result.replace(/```\n([^\n])/g, '```\n\n$1');

  return result;
}

async function fixAllCodeBlocks(): Promise<void> {
  console.log('🔧 Fixing code blocks in documentation...');

  const files = await glob(path.join(DOCS_DIR, '**/*.md').replace(/\\/g, '/'));

  let fixedCount = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const fixed = fixCodeBlocks(content);

    if (fixed !== content) {
      fs.writeFileSync(file, fixed, 'utf8');
      fixedCount++;
      console.log(`   Fixed: ${path.relative(process.cwd(), file)}`);
    }
  }

  console.log(`\n✅ Fixed code blocks in ${fixedCount} files`);
}

// CLI 入口
async function main() {
  try {
    await fixAllCodeBlocks();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to fix code blocks:', (error as Error).message);
    process.exit(1);
  }
}

main();

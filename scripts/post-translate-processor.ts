#!/usr/bin/env tsx

/**
 * 翻译后处理器 - 确保翻译后的文档遵循 .github/copilot-instructions.md 规则
 *
 * 功能：
 * 1. 应用锚点映射配置
 * 2. 修正内部链接路径
 * 3. 处理特殊文件规则（awesome.md, index.md）
 * 4. 验证翻译后的文档格式
 */

import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import { anchorMappings, pathMappings } from '../config/anchor-mappings.js';

interface ProcessorOptions {
  docsDir?: string;
  verbose?: boolean;
}

interface ProcessError {
  file: string;
  error: string;
}

interface ProcessorStats {
  processedFiles: number;
  fixedLinks: number;
  fixedAnchors: number;
  errors: ProcessError[];
}

/**
 * 检查文件是否为特殊文件（awesome.md, index.md）
 */
function isSpecialFile(relativePath: string): boolean {
  const fileName = path.basename(relativePath);
  return fileName === 'awesome.md' || fileName === 'index.md';
}

/**
 * 处理单个文件
 */
function processFile(
  filePath: string,
  docsDir: string,
  verbose: boolean,
  stats: ProcessorStats,
): boolean {
  try {
    const relativePath = path.relative(docsDir, filePath);

    if (verbose) {
      console.log(`📝 处理文件: ${relativePath}`);
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    const isSpecial = isSpecialFile(relativePath);

    if (isSpecial && verbose) {
      console.log(`  ⚡ 特殊文件，不替换 docs.nestjs.com 链接`);
    }

    // 1. 修正内部链接路径（非特殊文件）
    if (!isSpecial) {
      content = content.replace(
        /https?:\/\/(docs\.nestjs\.com|docs\.nestjs\.cn)(\/[^\s)]*)?/g,
        (_match, _domain: string, urlPath?: string) => {
          if (!urlPath) return './';

          const cleanPath = urlPath.replace(/^\//, '');

          if (pathMappings[cleanPath]) {
            const mappedPath = pathMappings[cleanPath];
            stats.fixedLinks++;
            if (verbose) {
              console.log(`    🔗 路径映射: ${cleanPath} → ${mappedPath}`);
            }
            return `./${mappedPath}`;
          }

          stats.fixedLinks++;
          return `./${cleanPath}`;
        },
      );
    }

    // 2. 修正锚点链接（所有文件）
    content = content.replace(
      /(\.\/[^\s)]*|https?:\/\/[^\s)]*)?#([a-zA-Z0-9_-]+)/g,
      (match, linkPart?: string, anchorPart?: string) => {
        if (!anchorPart) return match;
        if (anchorMappings[anchorPart]) {
          const mappedAnchor = anchorMappings[anchorPart];
          stats.fixedAnchors++;
          if (verbose) {
            console.log(`    ⚓ 锚点映射: #${anchorPart} → #${mappedAnchor}`);
          }
          return `${linkPart ?? ''}#${mappedAnchor}`;
        }
        return match;
      },
    );

    // 3. 翻译代码块中的常见注释
    content = content.replace(
      /```[\w]*\n([\s\S]*?)```/g,
      (match, codeContent: string) => {
        const translatedCode = codeContent
          .replace(/\/\/ Create/g, '// 创建')
          .replace(/\/\/ Update/g, '// 更新')
          .replace(/\/\/ Delete/g, '// 删除')
          .replace(/\/\/ Get/g, '// 获取')
          .replace(/\/\/ Set/g, '// 设置')
          .replace(/\/\/ Initialize/g, '// 初始化')
          .replace(/\/\/ Configuration/g, '// 配置')
          .replace(/\/\/ Import/g, '// 导入')
          .replace(/\/\/ Export/g, '// 导出')
          .replace(/\/\/ Example/g, '// 示例')
          .replace(/\/\/ Usage/g, '// 用法')
          .replace(/\/\/ Note:/g, '// 注意：')
          .replace(/\/\/ TODO:/g, '// 待办：')
          .replace(/\/\/ FIXME:/g, '// 修复：');

        return match.replace(codeContent, translatedCode);
      },
    );

    // 4. 写回文件
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      if (verbose) {
        console.log(`  ✅ 文件已更新`);
      }
      stats.processedFiles++;
      return true;
    }

    if (verbose) {
      console.log(`  ➖ 无需更改`);
    }
    stats.processedFiles++;
    return false;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    stats.errors.push({ file: filePath, error: message });
    console.error(`❌ 处理文件失败 ${filePath}: ${message}`);
    return false;
  }
}

/**
 * 运行翻译后处理
 */
export async function runPostTranslateProcessor(
  options: ProcessorOptions = {},
): Promise<boolean> {
  const docsDir = options.docsDir ?? 'docs';
  const verbose = options.verbose ?? false;

  console.log(`🔄 开始翻译后处理 (目录: ${docsDir})`);

  const pattern = path.join(docsDir, '**/*.md').replace(/\\/g, '/');
  const files = await glob(pattern);

  if (files.length === 0) {
    console.log('⚠️ 未找到任何 Markdown 文件');
    return false;
  }

  console.log(`📋 找到 ${files.length} 个文件`);

  const stats: ProcessorStats = {
    processedFiles: 0,
    fixedLinks: 0,
    fixedAnchors: 0,
    errors: [],
  };

  let hasChanges = false;

  for (const file of files) {
    const changed = processFile(file, docsDir, verbose, stats);
    if (changed) hasChanges = true;
  }

  // 输出统计信息
  console.log('\n📊 处理统计:');
  console.log(`   📝 处理文件数: ${stats.processedFiles}`);
  console.log(`   🔗 修正链接数: ${stats.fixedLinks}`);
  console.log(`   ⚓ 修正锚点数: ${stats.fixedAnchors}`);

  if (stats.errors.length > 0) {
    console.log(`   ❌ 错误数: ${stats.errors.length}`);
    for (const { file, error } of stats.errors) {
      console.log(`      ${file}: ${error}`);
    }
  }

  if (hasChanges) {
    console.log('\n✅ 翻译后处理完成，有文件被更新');
  } else {
    console.log('\n✅ 翻译后处理完成，无需更改');
  }

  return hasChanges;
}

// CLI 入口
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options: ProcessorOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--docs-dir':
        options.docsDir = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
翻译后处理器 - 确保翻译后的文档遵循规则

用法:
  tsx scripts/post-translate-processor.ts [选项]

选项:
  --verbose, -v     显示详细输出
  --docs-dir DIR    指定文档目录 (默认: docs)
  --help, -h        显示帮助信息

示例:
  tsx scripts/post-translate-processor.ts
  tsx scripts/post-translate-processor.ts --verbose
  tsx scripts/post-translate-processor.ts --docs-dir docs
`);
        process.exit(0);
    }
  }

  runPostTranslateProcessor(options)
    .then(() => {
      process.exit(0);
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error('处理失败:', message);
      process.exit(1);
    });
}

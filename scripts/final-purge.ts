import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

/**
 * 最终修复脚本：确保构建通过，同时保持 content 目录的原始性
 */
async function finalDocFix() {
  const docsDir = 'docs';
  const pattern = path.join(docsDir, '**/*.md').replace(/\\/g, '/');
  const files = await glob(pattern);

  const replacements = [
    // 1. 物理移除引起 Rspress extractPageData 崩溃的 HTML 注释
    { from: /<!-- 此文件从[\s\S]*?直接修改此文件 -->/g, to: '' },
    { from: /<!-- 生成时间: [\s\S]*? -->/g, to: '' },
    { from: /<!-- 源文件: [\s\S]*? -->/g, to: '' },
    
    // 2. 修正 Rspress 强制检查出的死链接（这些链接在 content 中是占位符或旧路径）
    { from: /\]\(todo\)/gi, to: '](https://docs.nestjs.com)' },
    { from: /\(\/fundamentals\/injection-scopes\)/g, to: '(/fundamentals/provider-scopes)' },
    { from: /\(\/fundamentals\/custom-providers\)/g, to: '(/fundamentals/dependency-injection)' },
    { from: /\(\/fundamentals\/module-ref\)/g, to: '(/fundamentals/module-reference)' },
    { from: /\(\/cli\/monorepo\)/g, to: '(/cli/workspaces)' },
    { from: /\(\/testing\)/g, to: '(/fundamentals/unit-testing)' }
  ];

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    for (const r of replacements) {
      if (r.from.test(content)) {
        content = content.replace(r.from, r.to);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(file, content.trimStart(), 'utf8');
      console.log(`✅ Fixed & Cleaned: ${file}`);
    }
  }
}

finalDocFix().catch(console.error);

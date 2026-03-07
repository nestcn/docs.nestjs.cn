import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

/**
 * 彻底修复 HTML 注释导致的构建失败问题
 */
async function nuclearCleanup() {
  const docsDir = 'docs';
  const pattern = path.join(docsDir, '**/*.md').replace(/\\/g, '/');
  const files = await glob(pattern);

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. 标准化 HTML 注释头部
    // 修复例如 <!--此文件...--> (缺少空格) 或者破坏的逻辑
    content = content.replace(/<!--\s*此文件/g, '<!-- 此文件');
    content = content.replace(/直接修改此文件\s*-->/g, '直接修改此文件 -->');
    
    // 2. 移除所有可能导致解析引擎在尝试修改字符串索引时崩溃的异常字符
    // 特别是紧跟在 frontmatter 后的内容
    if (content.startsWith('---')) {
      const parts = content.split('---');
      if (parts.length >= 3) {
        // 如果 frontmatter 后面紧跟着没有换行的内容，可能出问题
        if (parts[2] && !parts[2].startsWith('\n')) {
            parts[2] = '\n' + parts[2];
            content = parts.join('---');
        }
      }
    }

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`⚛️ Atomic Fix: ${file}`);
    }
  }
}

nuclearCleanup().catch(console.error);

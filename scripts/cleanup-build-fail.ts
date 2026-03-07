import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

/**
 * 清理脚本：修复可能导致 Rspress 构建失败的特殊内容
 */
async function cleanupFiles() {
  const docsDir = 'docs';
  const pattern = path.join(docsDir, '**/*.md').replace(/\\/g, '/');
  const files = await glob(pattern);

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. 确保文件不是空的，空文件可能导致 extractPageData 出错
    if (!content.trim()) {
      content = '# ' + path.basename(file, '.md') + '\n\nEmpty content.';
    }

    // 2. 移除可能引起 V8 string 不可变属性错误的特殊标记（如果有的话）
    // 报错提到 TypeError: Cannot assign to read only property '0' of string
    // 这通常发生在对 string 尝试按索引赋值时。Rspress 可能在尝试修改只读的 frontmatter 对象。
    // 我们确保 frontmatter 结构标准
    if (content.startsWith('---')) {
        // 确保 --- 之间有内容，且闭合
        const parts = content.split('---');
        if (parts.length >= 3 && !parts[1].trim()) {
            content = content.replace('------', '---\ntitle: ' + path.basename(file, '.md') + '\n---');
        }
    }

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`🧹 Cleaned: ${file}`);
    }
  }
}

cleanupFiles().catch(console.error);

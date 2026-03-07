import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

/**
 * 终极死链接修复脚本
 */
async function ultimateFix() {
  const docsDir = 'docs';
  const pattern = path.join(docsDir, '**/*.md').replace(/\\/g, '/');
  const files = await glob(pattern);

  const replacements = [
    { from: /\[([^\]]*)\]\(\/fundamentals\/module-ref\)/g, to: '[$1](/fundamentals/module-reference)' },
    { from: /\[([^\]]*)\]\(\/fundamentals\/custom-providers\)/g, to: '[$1](/fundamentals/custom-providers)' },
    { from: /\[([^\]]*)\]\(\/fundamentals\/injection-scopes\)/g, to: '[$1](/fundamentals/injection-scopes)' },
    { from: /\[([^\]]*)\]\(\/cli\/monorepo\)/g, to: '[$1](/cli/workspaces)' },
    { from: /\[([^\]]*)\]\(\/techniques\/caching\.md\)/g, to: '[$1](/techniques/caching)' },
    { from: /\]\(todo\)/gi, to: '](https://docs.nestjs.com)' },
    // 修正图片路径，确保它们相对于 public 根目录或使用绝对路径
    { from: /\/assets\//g, to: '/assets/' }, // 保持现状，如果 RSPress 配置了 public dir
    { from: /\/public\/assets\//g, to: '/assets/' },
    // 修正特定已知死链接
    { from: /middleware#函数式中间件/g, to: 'middleware#functional-middleware' }
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
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✅ Fixed: ${file}`);
    }
  }
}

ultimateFix().catch(console.error);

#!/usr/bin/env node

/**
 * 代码块修复脚本 v2
 * 修复文档中的代码块格式问题
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

class CodeBlocksFixer {
  constructor(options = {}) {
    this.docsDir = options.docsDir || 'docs';
    this.verbose = options.verbose || false;
    this.processedFiles = 0;
    this.fixedBlocks = 0;
    this.errors = [];
  }

  /**
   * 修复代码块格式
   */
  fixCodeBlocks(content) {
    let fixed = content;
    let changeCount = 0;

    // 1. 修复多余的代码块结束标记
    // 匹配: ```language\n...code...\n```\n```
    fixed = fixed.replace(/```([a-zA-Z]*)\n([\s\S]*?)\n```\n```/g, (match, lang, code) => {
      changeCount++;
      return `\`\`\`${lang}\n${code}\n\`\`\``;
    });

    // 2. 修复缺少语言标识的代码块
    fixed = fixed.replace(/```\s*\n([^`]+)\n```/g, (match, code) => {
      // 如果代码看起来像 TypeScript/JavaScript，添加语言标识
      if (code.includes('export') || code.includes('import') || code.includes('class') || code.includes('function')) {
        changeCount++;
        return `\`\`\`typescript\n${code}\n\`\`\``;
      }
      // 如果代码看起来像 JSON，添加 json 标识
      if (code.trim().startsWith('{') && code.trim().endsWith('}')) {
        changeCount++;
        return `\`\`\`json\n${code}\n\`\`\``;
      }
      return match;
    });

    // 3. 修复内联代码块中的特殊字符
    fixed = fixed.replace(/`([^`]*)`/g, (match, code) => {
      // 修复内联代码中的特殊HTML字符
      const fixedCode = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      if (fixedCode !== code) {
        changeCount++;
        return `\`${fixedCode}\``;
      }
      return match;
    });

    // 4. 修复代码块中的HTML实体
    fixed = fixed.replace(/```([a-zA-Z]*)\n([\s\S]*?)\n```/g, (match, lang, code) => {
      const fixedCode = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&#125;/g, '}')
        .replace(/&#123;/g, '{');
      
      if (fixedCode !== code) {
        changeCount++;
        return `\`\`\`${lang}\n${fixedCode}\n\`\`\``;
      }
      return match;
    });

    // 5. 修复标题中的代码格式
    fixed = fixed.replace(/^(#+\s+.*)`([^`]+)`(.*)/gm, (match, prefix, code, suffix) => {
      // 确保标题中的代码片段格式正确
      return `${prefix}\`${code}\`${suffix}`;
    });

    return { content: fixed, changes: changeCount };
  }

  /**
   * 处理单个文件
   */
  async processFile(filePath) {
    try {
      const relativePath = path.relative(this.docsDir, filePath);
      
      if (this.verbose) {
        console.log(`📝 处理文件: ${relativePath}`);
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const result = this.fixCodeBlocks(content);

      if (result.changes > 0) {
        fs.writeFileSync(filePath, result.content, 'utf8');
        this.fixedBlocks += result.changes;
        if (this.verbose) {
          console.log(`  ✅ 修复了 ${result.changes} 个代码块问题`);
        }
        return true;
      } else {
        if (this.verbose) {
          console.log(`  ➖ 无需修复`);
        }
        return false;
      }

    } catch (error) {
      this.errors.push({
        file: filePath,
        error: error.message
      });
      console.error(`❌ 处理文件失败 ${filePath}: ${error.message}`);
      return false;
    }
  }

  /**
   * 运行代码块修复
   */
  async run() {
    console.log(`🔧 开始修复代码块格式 (目录: ${this.docsDir})`);
    
    // 查找所有 Markdown 文件
    const pattern = path.join(this.docsDir, '**/*.md').replace(/\\/g, '/');
    const files = glob.sync(pattern);
    
    if (files.length === 0) {
      console.log('⚠️ 未找到任何 Markdown 文件');
      return false;
    }

    console.log(`📋 找到 ${files.length} 个文件`);
    
    let hasChanges = false;
    
    for (const file of files) {
      const changed = await this.processFile(file);
      if (changed) {
        hasChanges = true;
      }
      this.processedFiles++;
    }

    // 输出统计信息
    console.log('\n📊 修复统计:');
    console.log(`   📝 处理文件数: ${this.processedFiles}`);
    console.log(`   🔧 修复代码块数: ${this.fixedBlocks}`);
    
    if (this.errors.length > 0) {
      console.log(`   ❌ 错误数: ${this.errors.length}`);
      this.errors.forEach(({ file, error }) => {
        console.log(`      ${file}: ${error}`);
      });
    }

    if (hasChanges) {
      console.log('\n✅ 代码块修复完成，有文件被更新');
    } else {
      console.log('\n✅ 代码块修复完成，无需更改');
    }

    return hasChanges;
  }
}

// 命令行界面
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
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
代码块修复工具 - 修复文档中的代码块格式问题

用法:
  node scripts/fix-code-blocks-v2.js [选项]

选项:
  --verbose, -v     显示详细输出
  --docs-dir DIR    指定文档目录 (默认: docs)
  --help, -h        显示帮助信息

示例:
  node scripts/fix-code-blocks-v2.js
  node scripts/fix-code-blocks-v2.js --verbose
  node scripts/fix-code-blocks-v2.js --docs-dir docs
`);
        process.exit(0);
    }
  }

  const fixer = new CodeBlocksFixer(options);
  fixer.run()
    .then(hasChanges => {
      process.exit(hasChanges ? 0 : 1);
    })
    .catch(error => {
      console.error('修复失败:', error);
      process.exit(2);
    });
}

module.exports = CodeBlocksFixer;

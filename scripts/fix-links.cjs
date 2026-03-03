#!/usr/bin/env node

/**
 * 链接修复脚本
 * 自动修复文档中的死链接
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

class LinkFixer {
  constructor(options = {}) {
    this.docsDir = options.docsDir || 'content';
    this.verbose = options.verbose || false;
    this.processedFiles = 0;
    this.fixedLinks = 0;
    this.errors = [];
    
    // 链接映射 - 从错误链接到正确链接的映射
    this.linkMap = {
      // 基础部分
      '/fundamentals/custom-providers': '/fundamentals/dependency-injection',
      '/fundamentals/async-providers': '/fundamentals/async-components',
      '/fundamentals/injection-scopes': '/fundamentals/provider-scopes',
      '/fundamentals/module-ref': '/fundamentals/module-reference',
      
      // 技术部分
      '/techniques/database': '/techniques/sql',
      '/techniques/mongodb': '/recipes/mongodb',
      
      // 概览部分 - 根目录文件移动到 overview
      '/controllers': '/overview/controllers',
      '/guards': '/overview/guards',
      '/interceptors': '/overview/interceptors',
      '/exception-filters': '/overview/exception-filters',
      '/middlewares': '/overview/middlewares',
      '/modules': '/overview/modules',
      '/pipes': '/overview/pipes',
      '/custom-decorators': '/overview/custom-decorators',
      '/first-steps': '/overview/first-steps',
      
      // 其他部分
      '/providers': '/overview/providers',
      '/graphql/resolvers': '/graphql/resolvers-map',
      '/graphql/other-features': '/graphql/guards-interceptors',
      '/cli/monorepo': '/cli/workspaces',
      
      // 相对路径映射
      'exception-filters': '/overview/exception-filters',
      'middlewares': '/overview/middlewares',
      'pipes': '/overview/pipes',
    };
  }

  /**
   * 修复文件中的链接
   */
  fixLinks(content) {
    let fixed = content;
    let changeCount = 0;

    // 遍历链接映射，修复所有匹配的链接
    for (const [oldLink, newLink] of Object.entries(this.linkMap)) {
      // 匹配 Markdown 链接格式: [text](link) 和 [text](link#anchor)
      const linkRegex = new RegExp(`\\[([^\\]]+)\\]\\(\\s*${this.escapeRegExp(oldLink)}(#[^\\)]*)?\\s*\\)`, 'g');
      
      fixed = fixed.replace(linkRegex, (match, text, anchor) => {
        changeCount++;
        return `[${text}](${newLink}${anchor || ''})`;
      });

      // 匹配相对路径格式: controllers#anchor
      if (oldLink.startsWith('/') && !oldLink.includes('/overview/')) {
        const relativeLink = oldLink.replace(/^\//, '');
        const relativeRegex = new RegExp(`\\[([^\\]]+)\\]\\(\\s*${this.escapeRegExp(relativeLink)}(#[^\\)]*)?\\s*\\)`, 'g');
        
        fixed = fixed.replace(relativeRegex, (match, text, anchor) => {
          changeCount++;
          return `[${text}](${newLink}${anchor || ''})`;
        });
      }

      // 匹配相对路径格式: ./exception-filters#anchor
      if (!oldLink.startsWith('/')) {
        const relativePathRegex = new RegExp(`\\[([^\\]]+)\\]\\(\\s*\\./${this.escapeRegExp(oldLink)}(#[^\\)]*)?\\s*\\)`, 'g');
        
        fixed = fixed.replace(relativePathRegex, (match, text, anchor) => {
          changeCount++;
          return `[${text}](${newLink}${anchor || ''})`;
        });
      }
    }

    // 修复特殊情况：/modules#dynamic-modules 等
    const specialCases = {
      '/modules': '/overview/modules',
      '/modules#dynamic-modules': '/overview/modules#dynamic-modules',
    };

    for (const [oldLink, newLink] of Object.entries(specialCases)) {
      const linkRegex = new RegExp(`\\[([^\\]]+)\\]\\(\\s*${this.escapeRegExp(oldLink)}\\s*\\)`, 'g');
      
      fixed = fixed.replace(linkRegex, (match, text) => {
        changeCount++;
        return `[${text}](${newLink})`;
      });
    }

    return { content: fixed, changes: changeCount };
  }

  /**
   * 转义正则表达式特殊字符
   */
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
      const result = this.fixLinks(content);

      if (result.changes > 0) {
        fs.writeFileSync(filePath, result.content, 'utf8');
        this.fixedLinks += result.changes;
        if (this.verbose) {
          console.log(`  ✅ 修复了 ${result.changes} 个链接`);
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
   * 运行链接修复
   */
  async run() {
    console.log(`🔧 开始修复链接 (目录: ${this.docsDir})`);
    
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
    console.log(`   🔗 修复链接数: ${this.fixedLinks}`);
    
    if (this.errors.length > 0) {
      console.log(`   ❌ 错误数: ${this.errors.length}`);
      this.errors.forEach(({ file, error }) => {
        console.log(`      ${file}: ${error}`);
      });
    }

    if (hasChanges) {
      console.log('\n✅ 链接修复完成，有文件被更新');
    } else {
      console.log('\n✅ 链接修复完成，无需更改');
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
链接修复工具 - 修复文档中的死链接

用法:
  node scripts/fix-links.js [选项]

选项:
  --verbose, -v     显示详细输出
  --docs-dir DIR    指定文档目录 (默认: docs)
  --help, -h        显示帮助信息

示例:
  node scripts/fix-links.js
  node scripts/fix-links.js --verbose
  node scripts/fix-links.js --docs-dir docs
`);
        process.exit(0);
    }
  }

  const fixer = new LinkFixer(options);
  fixer.run()
    .then(hasChanges => {
      process.exit(0);
    })
    .catch(error => {
      console.error('修复失败:', error);
      process.exit(1);
    });
}

module.exports = LinkFixer;
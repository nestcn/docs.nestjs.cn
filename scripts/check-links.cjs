#!/usr/bin/env node

/**
 * 链接检查脚本
 * 检查文档中的死链接并提供修复建议
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

class LinkChecker {
  constructor(options = {}) {
    this.docsDir = options.docsDir || 'docs';
    this.verbose = options.verbose || false;
    this.processedFiles = 0;
    this.deadLinks = [];
    this.errors = [];
  }

  /**
   * 提取文件中的所有链接
   */
  extractLinks(content, filePath) {
    const links = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const text = match[1];
      const url = match[2];
      
      // 跳过外部链接
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
        continue;
      }

      // 跳过锚点链接
      if (url.startsWith('#')) {
        continue;
      }

      links.push({
        text,
        url,
        file: filePath
      });
    }

    return links;
  }

  /**
   * 检查链接是否存在
   */
  checkLinkExists(url, baseDir) {
    // 移除查询参数和锚点
    const cleanUrl = url.split('?')[0].split('#')[0];
    
    // 构建完整路径
    let fullPath;
    if (cleanUrl.startsWith('/')) {
      // 绝对路径 - 移除开头的 / 然后与 docsDir 结合
      const relativePath = cleanUrl.replace(/^\//, '');
      fullPath = path.join(this.docsDir, relativePath);
    } else {
      // 相对路径 - 与文件所在目录结合
      fullPath = path.join(baseDir, cleanUrl);
    }

    // 检查文件是否存在
    if (fs.existsSync(fullPath)) {
      return true;
    }

    // 检查是否需要添加 .md 扩展名（Markdown 文件）
    if (fs.existsSync(`${fullPath}.md`)) {
      return true;
    }

    // 检查是否需要添加 .html 扩展名
    if (fs.existsSync(`${fullPath}.html`)) {
      return true;
    }

    // 检查是否需要添加 /index.html
    if (fs.existsSync(path.join(fullPath, 'index.html'))) {
      return true;
    }

    return false;
  }

  /**
   * 处理单个文件
   */
  async processFile(filePath) {
    try {
      const relativePath = path.relative(this.docsDir, filePath);
      const fileDir = path.dirname(filePath);
      
      if (this.verbose) {
        console.log(`📝 检查文件: ${relativePath}`);
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const links = this.extractLinks(content, filePath);

      for (const link of links) {
        if (!this.checkLinkExists(link.url, fileDir)) {
          this.deadLinks.push(link);
          if (this.verbose) {
            console.log(`  ❌ 死链接: ${link.url} (${link.text})`);
          }
        }
      }

      this.processedFiles++;
      return true;

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
   * 运行链接检查
   */
  async run() {
    console.log(`🔗 开始检查链接 (目录: ${this.docsDir})`);
    
    // 查找所有 Markdown 文件
    const pattern = path.join(this.docsDir, '**/*.md').replace(/\\/g, '/');
    const files = glob.sync(pattern);
    
    if (files.length === 0) {
      console.log('⚠️ 未找到任何 Markdown 文件');
      return false;
    }

    console.log(`📋 找到 ${files.length} 个文件`);
    
    for (const file of files) {
      await this.processFile(file);
    }

    // 输出统计信息
    console.log('\n📊 检查结果:');
    console.log(`   📝 处理文件数: ${this.processedFiles}`);
    console.log(`   ❌ 死链接数: ${this.deadLinks.length}`);
    
    if (this.errors.length > 0) {
      console.log(`   ⚠️ 错误数: ${this.errors.length}`);
      this.errors.forEach(({ file, error }) => {
        console.log(`      ${file}: ${error}`);
      });
    }

    if (this.deadLinks.length > 0) {
      console.log('\n🔍 死链接详情:');
      this.deadLinks.forEach(({ file, url, text }) => {
        console.log(`   📄 ${path.relative(this.docsDir, file)}`);
        console.log(`     🔗 ${url} (${text})`);
        console.log('');
      });
      console.log('❌ 发现死链接，请修复后再构建');
      return false;
    } else {
      console.log('\n✅ 没有发现死链接');
      return true;
    }
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
链接检查工具 - 检查文档中的死链接

用法:
  node scripts/check-links.js [选项]

选项:
  --verbose, -v     显示详细输出
  --docs-dir DIR    指定文档目录 (默认: docs)
  --help, -h        显示帮助信息

示例:
  node scripts/check-links.js
  node scripts/check-links.js --verbose
  node scripts/check-links.js --docs-dir docs
`);
        process.exit(0);
    }
  }

  const checker = new LinkChecker(options);
  checker.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('检查失败:', error);
      process.exit(1);
    });
}

module.exports = LinkChecker;
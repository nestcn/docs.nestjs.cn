#!/usr/bin/env node

/**
 * 目录比较脚本
 * 比较 content 和 docs 目录，找出 docs 中缺失的文件
 */

const fs = require('fs');
const path = require('path');

class DirectoryComparator {
  constructor() {
    this.contentDir = 'content';
    this.docsDir = 'docs';
    this.missingFiles = [];
  }

  /**
   * 递归获取目录中的所有文件
   */
  getFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files.push(...this.getFiles(fullPath));
      } else if (item.isFile()) {
        files.push(path.relative(this.contentDir, fullPath));
      }
    }

    return files;
  }

  /**
   * 比较目录
   */
  compare() {
    console.log('🔍 开始比较 content 和 docs 目录...');

    // 获取 content 目录中的所有文件
    const contentFiles = this.getFiles(this.contentDir);
    console.log(`📁 content 目录中有 ${contentFiles.length} 个文件`);

    // 检查 docs 目录中是否存在这些文件
    for (const relativePath of contentFiles) {
      // 跳过 JSON 文件（如 who-uses.json）
      if (relativePath.endsWith('.json')) {
        continue;
      }

      // 检查 docs 目录中是否存在对应文件
      const docsPath = path.join(this.docsDir, relativePath);
      const overviewPath = path.join(this.docsDir, 'overview', path.basename(relativePath));

      if (!fs.existsSync(docsPath) && !fs.existsSync(overviewPath)) {
        this.missingFiles.push(relativePath);
      }
    }

    // 输出结果
    if (this.missingFiles.length === 0) {
      console.log('✅ docs 目录中没有缺失的文件');
    } else {
      console.log(`❌ docs 目录中缺失 ${this.missingFiles.length} 个文件：`);
      this.missingFiles.forEach(file => {
        console.log(`   - ${file}`);
      });
    }

    return this.missingFiles.length === 0;
  }
}

// 运行比较
if (require.main === module) {
  const comparator = new DirectoryComparator();
  comparator.compare();
}

module.exports = DirectoryComparator;
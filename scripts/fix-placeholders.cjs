#!/usr/bin/env node

/**
 * 修复翻译文件中的占位符问题
 * 
 * 这个脚本会：
 * 1. 读取翻译缓存文件
 * 2. 扫描所有包含占位符的文件
 * 3. 尝试从缓存中恢复原始内容
 * 4. 如果无法恢复，则标记文件需要重新翻译
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

class PlaceholderFixer {
  constructor() {
    this.cacheFile = path.join(__dirname, '.translation-cache.json');
    this.cache = new Map();
    this.fixedFiles = 0;
    this.failedFiles = [];
    this.verbose = true;
  }

  /**
   * 加载翻译缓存
   */
  loadCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const cacheData = fs.readFileSync(this.cacheFile, 'utf8');
        const cache = JSON.parse(cacheData);
        this.cache = new Map(cache.entries || []);
        console.log(`📚 Loaded ${this.cache.size} cached translations`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load translation cache:', error.message);
      this.cache = new Map();
    }
  }

  /**
   * 检查文件是否包含占位符
   */
  hasPlaceholders(content) {
    return /__(LINK|HTML_TAG|INLINE_CODE|CODE_BLOCK)_\d+__/.test(content);
  }

  /**
   * 从缓存中获取原始翻译
   */
  getFromCache(filePath, contentHash) {
    const cacheKey = `${filePath}:${contentHash}`;
    return this.cache.get(cacheKey);
  }

  /**
   * 生成内容的哈希值
   */
  generateContentHash(content) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * 修复单个文件
   */
  fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 检查是否包含占位符
      if (!this.hasPlaceholders(content)) {
        return false;
      }

      // 尝试从原始英文文件获取内容
      const relativePath = path.relative('docs', filePath);
      const sourcePath = path.join('content', relativePath);
      
      if (!fs.existsSync(sourcePath)) {
        console.warn(`⚠️ Source file not found: ${sourcePath}`);
        this.failedFiles.push(filePath);
        return false;
      }

      const sourceContent = fs.readFileSync(sourcePath, 'utf8');
      const contentHash = this.generateContentHash(sourceContent);
      
      // 尝试从缓存中获取翻译
      const cachedTranslation = this.getFromCache(relativePath, contentHash);
      
      if (cachedTranslation && !this.hasPlaceholders(cachedTranslation)) {
        // 使用缓存的翻译
        fs.writeFileSync(filePath, cachedTranslation, 'utf8');
        console.log(`✅ Fixed from cache: ${relativePath}`);
        this.fixedFiles++;
        return true;
      }

      // 如果缓存中没有，标记为需要重新翻译
      this.failedFiles.push(filePath);
      console.warn(`⚠️ No valid cache found for: ${relativePath}`);
      return false;
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}: ${error.message}`);
      this.failedFiles.push(filePath);
      return false;
    }
  }

  /**
   * 运行修复过程
   */
  async run() {
    console.log('🔧 Starting placeholder fix process...');
    
    // 加载缓存
    this.loadCache();

    // 查找所有包含占位符的文件
    const pattern = path.join('docs', '**', '*.md').replace(/\\/g, '/');
    const files = await glob(pattern);
    
    console.log(`📄 Found ${files.length} markdown files to check`);

    let checkedFiles = 0;
    for (const file of files) {
      checkedFiles++;
      this.fixFile(file);
    }

    // 输出统计信息
    console.log('\n📊 Fix Summary:');
    console.log(`✅ Fixed: ${this.fixedFiles} files`);
    console.log(`❌ Failed: ${this.failedFiles.length} files`);

    if (this.failedFiles.length > 0) {
      console.log('\n❌ Files that need re-translation:');
      this.failedFiles.forEach(file => {
        console.log(`  - ${path.relative(process.cwd(), file)}`);
      });
    }

    return this.failedFiles.length === 0;
  }
}

// 命令行支持
if (require.main === module) {
  const fixer = new PlaceholderFixer();
  fixer.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fix failed:', error);
      process.exit(2);
    });
}

module.exports = PlaceholderFixer;

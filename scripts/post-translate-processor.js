#!/usr/bin/env node

/**
 * 翻译后处理器 - 确保翻译后的文档遵循 .github/copilot-instructions.md 规则
 * 
 * 功能：
 * 1. 应用锚点映射配置
 * 2. 修正内部链接路径
 * 3. 处理特殊文件规则（awesome.md, index.md）
 * 4. 验证翻译后的文档格式
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// 加载公共配置
let anchorMappings, pathMappings;
try {
  const config = require('../config/anchor-mappings.js');
  anchorMappings = config.anchorMappings;
  pathMappings = config.pathMappings;
} catch (error) {
  console.error('❌ 无法加载锚点映射配置:', error.message);
  process.exit(1);
}

/**
 * 检查文件是否为特殊文件（awesome.md, index.md）
 */
function isSpecialFile(relativePath) {
  const fileName = path.basename(relativePath);
  return fileName === 'awesome.md' || fileName === 'index.md';
}

class PostTranslateProcessor {
  constructor(options = {}) {
    this.docsDir = options.docsDir || 'docs';
    this.verbose = options.verbose || false;
    this.processedFiles = 0;
    this.fixedLinks = 0;
    this.fixedAnchors = 0;
    this.errors = [];
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

      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fileChanged = false;

      // 1. 检查是否为特殊文件（awesome.md, index.md）
      const fileName = path.basename(filePath);
      const isSpecial = isSpecialFile(relativePath);
      
      if (isSpecial) {
        if (this.verbose) {
          console.log(`  ⚡ 特殊文件，不替换 docs.nestjs.com 链接`);
        }
      }

      // 2. 修正内部链接路径（非特殊文件）
      if (!isSpecial) {
        // 替换 docs.nestjs.com 和 docs.nestjs.cn 为相对路径
        content = content.replace(
          /https?:\/\/(docs\.nestjs\.com|docs\.nestjs\.cn)(\/[^\s\)]*)?/g,
          (match, domain, urlPath) => {
            if (!urlPath) return './';
            
            // 移除开头的 /
            const cleanPath = urlPath.replace(/^\//, '');
            
            // 检查路径映射
            if (pathMappings[cleanPath]) {
              const mappedPath = pathMappings[cleanPath];
              this.fixedLinks++;
              if (this.verbose) {
                console.log(`    🔗 路径映射: ${cleanPath} → ${mappedPath}`);
              }
              return `./${mappedPath}`;
            }
            
            // 默认相对路径
            this.fixedLinks++;
            return `./${cleanPath}`;
          }
        );
      }

      // 3. 修正锚点链接（所有文件）
      content = content.replace(
        /(\.\/[^\s\)]*|https?:\/\/[^\s\)]*)?#([a-zA-Z0-9_-]+)/g,
        (match, linkPart, anchorPart) => {
          // 检查锚点映射
          if (anchorMappings[anchorPart]) {
            const mappedAnchor = anchorMappings[anchorPart];
            this.fixedAnchors++;
            if (this.verbose) {
              console.log(`    ⚓ 锚点映射: #${anchorPart} → #${mappedAnchor}`);
            }
            return `${linkPart || ''}#${mappedAnchor}`;
          }
          return match;
        }
      );

      // 4. 确保代码块注释翻译（如果包含英文注释）
      content = content.replace(
        /```[\w]*\n([\s\S]*?)```/g,
        (match, codeContent) => {
          // 翻译常见的代码注释
          let translatedCode = codeContent
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
        }
      );

      // 5. 检查是否有变更
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        fileChanged = true;
        if (this.verbose) {
          console.log(`  ✅ 文件已更新`);
        }
      } else {
        if (this.verbose) {
          console.log(`  ➖ 无需更改`);
        }
      }

      this.processedFiles++;
      return fileChanged;

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
   * 运行后处理
   */
  async run() {
    console.log(`🔄 开始翻译后处理 (目录: ${this.docsDir})`);
    
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
    }

    // 输出统计信息
    console.log('\n📊 处理统计:');
    console.log(`   📝 处理文件数: ${this.processedFiles}`);
    console.log(`   🔗 修正链接数: ${this.fixedLinks}`);
    console.log(`   ⚓ 修正锚点数: ${this.fixedAnchors}`);
    
    if (this.errors.length > 0) {
      console.log(`   ❌ 错误数: ${this.errors.length}`);
      this.errors.forEach(({ file, error }) => {
        console.log(`      ${file}: ${error}`);
      });
    }

    if (hasChanges) {
      console.log('\n✅ 翻译后处理完成，有文件被更新');
    } else {
      console.log('\n✅ 翻译后处理完成，无需更改');
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
翻译后处理器 - 确保翻译后的文档遵循规则

用法:
  bun run post-translate-processor.js [选项]

选项:
  --verbose, -v     显示详细输出
  --docs-dir DIR    指定文档目录 (默认: docs)
  --help, -h        显示帮助信息

示例:
  bun run post-translate-processor.js
  bun run post-translate-processor.js --verbose
  bun run post-translate-processor.js --docs-dir docs
`);
        process.exit(0);
    }
  }

  const processor = new PostTranslateProcessor(options);
  processor.run()
    .then(hasChanges => {
      process.exit(hasChanges ? 0 : 1);
    })
    .catch(error => {
      console.error('处理失败:', error);
      process.exit(2);
    });
}

module.exports = PostTranslateProcessor;

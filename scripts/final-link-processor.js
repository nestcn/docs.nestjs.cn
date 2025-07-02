const fs = require('fs');
const path = require('path');

/**
 * 最终的链接处理工具
 * 
 * 只处理 docs/ 目录中的 Markdown 文件
 * 将 docs.nestjs.com/cn 链接替换为相对路径
 * content/ 目录是英文原文，不处理
 */

class LinkProcessor {
  constructor() {
    this.docsDir = path.join(__dirname, '../docs');
    this.stats = {
      filesProcessed: 0,
      linksFound: 0,
      linksReplaced: 0,
      linksSkipped: 0,
      filesIgnored: 0
    };
    
    // 忽略的文件
    this.ignoredFiles = ['awesome.md', 'index.md'];
    
    // 基本路径映射
    this.pathMappings = new Map([
      ['/introduction', '../introduction'],
      ['/first-steps', '../overview/first-steps'],
      ['/controllers', '../overview/controllers'],
      ['/providers', '../overview/providers'], 
      ['/modules', '../overview/modules'],
      ['/middleware', '../overview/middleware'],
      ['/middlewares', '../overview/middleware'],
      ['/exception-filters', '../overview/exception-filters'],
      ['/pipes', '../overview/pipes'],
      ['/guards', '../overview/guards'],
      ['/interceptors', '../overview/interceptors'],
      ['/custom-decorators', '../overview/custom-decorators'],
      
      // Fundamentals
      ['/fundamentals/dependency-injection', '../fundamentals/dependency-injection'],
      ['/fundamentals/dynamic-modules', '../fundamentals/dynamic-modules'],
      ['/fundamentals/injection-scopes', '../fundamentals/injection-scopes'],
      ['/fundamentals/circular-dependency', '../fundamentals/circular-dependency'],
      ['/fundamentals/module-ref', '../fundamentals/module-reference'],
      ['/fundamentals/lazy-loading-modules', '../fundamentals/lazy-loading-modules'],
      ['/fundamentals/execution-context', '../fundamentals/execution-context'],
      ['/fundamentals/lifecycle-events', '../fundamentals/lifecycle-events'],
      ['/fundamentals/platform-agnosticism', '../fundamentals/platform-agnosticism'],
      ['/fundamentals/testing', '../fundamentals/unit-testing'],
      ['/fundamentals/unit-testing', '../fundamentals/unit-testing'],
      ['/fundamentals/async-components', '../fundamentals/async-components'],
      
      // Techniques
      ['/techniques/sql', '../techniques/sql'],
      ['/techniques/mongo', '../techniques/mongo'],
      ['/techniques/configuration', '../techniques/configuration'],
      ['/techniques/validation', '../techniques/validation'],
      ['/techniques/caching', '../techniques/caching'],
      ['/techniques/serialization', '../techniques/serialization'],
      ['/techniques/versioning', '../techniques/versioning'],
      ['/techniques/task-scheduling', '../techniques/task-scheduling'],
      ['/techniques/queues', '../techniques/queues'],
      ['/techniques/logging', '../techniques/logging'],
      ['/techniques/cookies', '../techniques/cookies'],
      ['/techniques/events', '../techniques/events'],
      ['/techniques/compression', '../techniques/compression'],
      ['/techniques/file-upload', '../techniques/file-upload'],
      ['/techniques/streaming-files', '../techniques/streaming-files'],
      ['/techniques/http-module', '../techniques/http-module'],
      ['/techniques/mvc', '../techniques/mvc'],
      ['/techniques/performance', '../techniques/performance'],
      ['/techniques/server-sent-events', '../techniques/server-sent-events'],
      
      // CLI
      ['/cli/overview', '../cli/overview'],
      ['/cli/workspaces', '../cli/workspaces'],
      ['/cli/libraries', '../cli/libraries'],
      ['/cli/usages', '../cli/usages'],
      ['/cli/scripts', '../cli/scripts'],
      
      // 其他重要映射
      ['/migration-guide', '../migration-guide'],
      ['/standalone-applications', '../standalone-applications'],
      ['/deployment', '../deployment'],
      ['/support', '../support']
    ]);
  }

  checkFileExists(relativePath, currentDir) {
    const targetPath = path.resolve(currentDir, relativePath);
    const pathWithoutAnchor = targetPath.split('#')[0];
    
    if (fs.existsSync(pathWithoutAnchor)) {
      return true;
    }
    
    if (!path.extname(pathWithoutAnchor)) {
      return fs.existsSync(pathWithoutAnchor + '.md');
    }
    
    return false;
  }

  convertToRelativePath(url, currentFilePath) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // 跳过静态资源
      if (pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js)$/i) || pathname.includes('/assets/')) {
        return null;
      }
      
      // 检查直接映射
      if (this.pathMappings.has(pathname)) {
        const mappedPath = this.pathMappings.get(pathname);
        if (this.checkFileExists(mappedPath, path.dirname(currentFilePath))) {
          return mappedPath + (urlObj.hash || '');
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  shouldSkipLink(link, context) {
    // 跳过示例代码中的链接
    const skipPatterns = [
      /@Redirect\(['"`]https:\/\/docs\.nestjs\.com['"`]/,
      /return\s*{\s*url:\s*['"`]https:\/\/docs\.nestjs\.com/,
      /pingCheck\(['"`][^'"`]*['"`],\s*['"`]https:\/\/docs\.nestjs\.com['"`]/
    ];
    
    return skipPatterns.some(pattern => pattern.test(context));
  }

  processFile(filePath) {
    const fileName = path.basename(filePath);
    
    if (this.ignoredFiles.includes(fileName)) {
      console.log(`⏭️  跳过文件: ${path.relative(this.docsDir, filePath)}`);
      this.stats.filesIgnored++;
      return;
    }

    console.log(`🔍 处理文件: ${path.relative(this.docsDir, filePath)}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    let fileLinksFound = 0;
    let fileLinksReplaced = 0;

    // 处理 https://docs.nestjs.com 和 https://docs.nestjs.cn 链接
    const linkPattern = /https:\/\/docs\.nestjs\.c[no]m([^\s\)\]\}"']*)/g;
    
    content = content.replace(linkPattern, (match, pathname) => {
      fileLinksFound++;
      
      // 获取上下文
      const matchIndex = content.indexOf(match);
      const contextStart = Math.max(0, matchIndex - 50);
      const contextEnd = Math.min(content.length, matchIndex + match.length + 50);
      const context = content.substring(contextStart, contextEnd);
      
      if (this.shouldSkipLink(match, context)) {
        console.log(`  ⏭️  跳过: ${match} (示例代码)`);
        return match;
      }
      
      const relativePath = this.convertToRelativePath(match, filePath);
      
      if (relativePath) {
        fileLinksReplaced++;
        changed = true;
        console.log(`  ✅ ${match} → ${relativePath}`);
        return relativePath;
      } else {
        console.log(`  ⚠️  无法映射: ${match}`);
        return match;
      }
    });

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`📝 已更新: ${path.relative(this.docsDir, filePath)}`);
    }

    this.stats.filesProcessed++;
    this.stats.linksFound += fileLinksFound;
    this.stats.linksReplaced += fileLinksReplaced;
  }

  processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      console.log(`📁 目录不存在: ${dirPath}`);
      return;
    }

    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        this.processDirectory(itemPath);
      } else if (stat.isFile() && item.endsWith('.md')) {
        this.processFile(itemPath);
      }
    }
  }

  run() {
    console.log('🚀 启动链接处理工具...');
    console.log('📂 处理目录: docs/ (content/ 是英文原文，不处理)');
    console.log(`🚫 忽略文件: ${this.ignoredFiles.join(', ')}`);
    console.log('');
    
    const startTime = Date.now();
    
    this.processDirectory(this.docsDir);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 处理完成报告');
    console.log('='.repeat(60));
    console.log(`⏱️  耗时: ${duration} 秒`);
    console.log(`📁 处理文件数: ${this.stats.filesProcessed}`);
    console.log(`⏭️  忽略文件数: ${this.stats.filesIgnored}`);
    console.log(`🔗 发现链接数: ${this.stats.linksFound}`);
    console.log(`✅ 成功替换: ${this.stats.linksReplaced}`);
    
    if (this.stats.linksFound > 0) {
      const successRate = ((this.stats.linksReplaced / this.stats.linksFound) * 100).toFixed(1);
      console.log(`📈 成功率: ${successRate}%`);
    }
    
    console.log('\n✅ 链接处理完成！');
  }
}

// 运行处理器
if (require.main === module) {
  const processor = new LinkProcessor();
  processor.run();
}

module.exports = LinkProcessor;

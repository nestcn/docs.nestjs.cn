#!/usr/bin/env bun

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

// 导入公共锚点映射配置
import { anchorMappings, pathMappings } from '../config/anchor-mappings.js';

/**
 * 链接处理验证工具
 * 验证文档中的链接替换情况并生成报告
 */
class LinkValidationTool {
  constructor() {
    this.docsDir = join(import.meta.dir, '../docs');
    this.stats = {
      totalFiles: 0,
      filesWithLinks: 0,
      totalLinks: 0,
      validRemainingLinks: 0,
      ignoredFiles: 0,
      linkTypes: {
        external: 0,        // 外部链接（应该保留）
        assets: 0,          // 静态资源链接
        examples: 0,        // 示例代码链接  
        ignored: 0,         // 忽略文件中的链接
        relativeLinks: 0,   // 已转换的相对链接
        anchorLinks: 0      // 带锚点的链接
      }
    };
    
    this.ignoredFiles = ['awesome.md', 'index.md'];
    
    // 使用公共配置
    this.anchorMappings = anchorMappings;
    this.pathMappings = pathMappings;
  }

  /**
   * 分析链接类型
   */
  analyzeLink(link, filePath, context) {
    const fileName = relative(this.docsDir, filePath);
    
    // 忽略文件中的链接
    if (this.ignoredFiles.some(ignored => fileName.endsWith(ignored))) {
      return 'ignored';
    }
    
    // 静态资源链接
    if (link.includes('/assets/') || link.match(/\.(png|jpg|jpeg|gif|svg|ico)$/i)) {
      return 'assets';
    }
    
    // 示例代码链接
    if (context.includes('@Redirect(') || 
        context.includes('return { url:') || 
        context.includes('pingCheck(')) {
      return 'examples';
    }
    
    return 'external';
  }

  /**
   * 检查锚点映射使用情况
   */
  checkAnchorMappings(content, filePath) {
    const fileName = relative(this.docsDir, filePath);
    let anchorCount = 0;
    
    // 查找所有锚点链接
    const anchorPattern = /\]\([^)]*#([a-zA-Z0-9\-_]+)\)/g;
    let match;
    
    while ((match = anchorPattern.exec(content)) !== null) {
      const anchor = match[1];
      anchorCount++;
      
      // 检查是否是英文锚点但没有被映射
      if (this.anchorMappings[anchor] && this.anchorMappings[anchor] !== anchor) {
        console.log(`🔗 潜在未映射锚点: #${anchor} → #${this.anchorMappings[anchor]} in ${fileName}`);
      }
    }
    
    return anchorCount;
  }

  /**
   * 处理单个文件
   */
  processFile(filePath) {
    const fileName = relative(this.docsDir, filePath);
    
    if (this.ignoredFiles.some(ignored => fileName.endsWith(ignored))) {
      this.stats.ignoredFiles++;
      return;
    }

    this.stats.totalFiles++;
    
    const content = readFileSync(filePath, 'utf8');
    
    let hasLinks = false;
    let fileExternalLinks = 0;
    let fileRelativeLinks = 0;

    // 检查外部链接
    const externalPattern = /https:\/\/docs\.nestjs\.c[no]m[^\s\)\]\}"']*/g;
    let match;
    
    while ((match = externalPattern.exec(content)) !== null) {
      hasLinks = true;
      fileExternalLinks++;
      this.stats.totalLinks++;
      
      const link = match[0];
      const contextStart = Math.max(0, match.index - 30);
      const contextEnd = Math.min(content.length, match.index + link.length + 30);
      const context = content.substring(contextStart, contextEnd);
      
      const linkType = this.analyzeLink(link, filePath, context);
      this.stats.linkTypes[linkType]++;
      
      if (linkType !== 'ignored') {
        this.stats.validRemainingLinks++;
        console.log(`📎 ${linkType.toUpperCase()}: ${link} in ${fileName}`);
      }
    }
    
    // 检查相对链接
    const relativePattern = /\]\(\.\.?[\/\\][^\s\)\]\}"'\#]*\.md[^\s\)\]\}"']*/g;
    while ((match = relativePattern.exec(content)) !== null) {
      hasLinks = true;
      fileRelativeLinks++;
      this.stats.linkTypes.relativeLinks++;
    }

    // 检查锚点链接
    const anchorCount = this.checkAnchorMappings(content, filePath);
    this.stats.linkTypes.anchorLinks += anchorCount;

    if (hasLinks || anchorCount > 0) {
      this.stats.filesWithLinks++;
      if (fileExternalLinks > 0 || anchorCount > 0) {
        console.log(`📄 ${fileName}: ${fileExternalLinks} 外部链接, ${fileRelativeLinks} 相对链接, ${anchorCount} 锚点链接`);
      }
    }
  }

  /**
   * 递归处理目录
   */
  processDirectory(dirPath) {
    if (!existsSync(dirPath)) {
      return;
    }

    const items = readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = join(dirPath, item);
      const stat = statSync(itemPath);
      
      if (stat.isDirectory()) {
        this.processDirectory(itemPath);
      } else if (stat.isFile() && item.endsWith('.md')) {
        this.processFile(itemPath);
      }
    }
  }

  /**
   * 生成验证报告
   */
  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 链接处理验证报告');
    console.log('='.repeat(70));
    
    console.log(`📁 总文件数: ${this.stats.totalFiles + this.stats.ignoredFiles}`);
    console.log(`📝 处理文件数: ${this.stats.totalFiles}`);
    console.log(`⏭️  忽略文件数: ${this.stats.ignoredFiles}`);
    console.log(`🔗 包含链接的文件: ${this.stats.filesWithLinks}`);
    console.log(`🔗 发现的外部链接: ${this.stats.validRemainingLinks}`);
    console.log(`🔗 相对链接数: ${this.stats.linkTypes.relativeLinks}`);
    console.log(`⚓ 锚点链接数: ${this.stats.linkTypes.anchorLinks}`);
    
    console.log('\n📊 剩余外部链接分类:');
    console.log(`🖼️  静态资源链接: ${this.stats.linkTypes.assets}`);
    console.log(`💻 示例代码链接: ${this.stats.linkTypes.examples}`);
    console.log(`📖 忽略文件链接: ${this.stats.linkTypes.ignored}`);
    console.log(`🌐 其他外部链接: ${this.stats.linkTypes.external}`);
    
    console.log('\n🎯 配置统计:');
    console.log(`📋 锚点映射数: ${Object.keys(this.anchorMappings).length}`);
    console.log(`🗂️  路径映射数: ${Object.keys(this.pathMappings).length}`);
    
    const totalExpectedRemaining = this.stats.linkTypes.assets + 
                                  this.stats.linkTypes.examples + 
                                  this.stats.linkTypes.ignored + 
                                  this.stats.linkTypes.external;
    
    console.log('\n✅ 验证结果:');
    if (this.stats.validRemainingLinks === totalExpectedRemaining) {
      console.log('🎉 所有剩余的外部链接都符合预期规则！');
      console.log('📋 链接分类说明:');
      console.log('   • 静态资源链接: 图片等资源文件链接，保持原样');
      console.log('   • 示例代码链接: 演示重定向、健康检查等功能的示例，保持原样');
      console.log('   • 忽略文件链接: awesome.md 和 index.md 中的链接，按规则保持原样');
      console.log('   • 其他外部链接: 需要检查是否应该转换');
      
      if (this.stats.linkTypes.external > 0) {
        console.log('\n⚠️  发现其他外部链接，请检查是否需要进一步处理');
      }
    } else {
      console.log('❌ 链接分类统计不一致，可能存在未处理的情况');
    }
    
    const totalProcessed = this.stats.linkTypes.relativeLinks + this.stats.linkTypes.anchorLinks;
    const totalFound = totalProcessed + this.stats.validRemainingLinks;
    
    if (totalFound > 0) {
      console.log(`\n📈 处理成功率: ${((totalProcessed / totalFound) * 100).toFixed(1)}%`);
    }
  }

  /**
   * 运行验证
   */
  run() {
    console.log('🔍 启动链接处理验证工具...');
    console.log(`📂 验证目录: ${this.docsDir}`);
    console.log(`🎯 使用 ${Object.keys(this.anchorMappings).length} 个锚点映射和 ${Object.keys(this.pathMappings).length} 个路径映射`);
    console.log('');
    
    this.processDirectory(this.docsDir);
    this.generateReport();
    
    return this.stats;
  }
}

// 如果直接运行此脚本
if (import.meta.main) {
  const validator = new LinkValidationTool();
  validator.run();
}

export default LinkValidationTool;

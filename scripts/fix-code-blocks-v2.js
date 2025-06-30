#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * 批量处理 docs 文件夹中的 @@filename 和 @@switch 代码块
 * 1. 将 @@filename(filename) 改为 rspress 语法: typescript title="filename" 
 * 2. 删除所有 @@switch 之后的 JavaScript 代码块部分
 */

class CodeBlockFixer {
  constructor(docsPath = './docs') {
    this.docsPath = docsPath;
    this.processedFiles = 0;
    this.changedFiles = 0;
    this.errors = [];
  }

  /**
   * 处理单个文件
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // 处理代码块
      const processedContent = this.processMarkdownContent(content);
      
      // 如果内容有变化，写回文件
      if (processedContent !== originalContent) {
        fs.writeFileSync(filePath, processedContent, 'utf8');
        this.changedFiles++;
        console.log(`✅ 已修复: ${path.relative(process.cwd(), filePath)}`);
      }
      
      this.processedFiles++;
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      console.error(`❌ 处理文件出错 ${filePath}: ${error.message}`);
    }
  }

  /**
   * 处理 Markdown 内容
   */
  processMarkdownContent(content) {
    let modified = false;
    
    // 首先清理重复的代码块结束标记
    const cleanDuplicates = content.replace(/```\n([\s\S]*?)\n```\n```/g, (match, codeContent) => {
      modified = true;
      console.log(`清理重复的结束标记`);
      return `\`\`\`\n${codeContent}\n\`\`\``;
    });
    
    // 处理标准的 @@filename 模式
    const result1 = cleanDuplicates.replace(/```(\w+)\s*\n@@filename\(([^)]*)\)([\s\S]*?)(?=\n```|\n*$)/g, (match, lang, filename, codeContent) => {
      modified = true;
      console.log(`处理标准模式: lang=${lang}, filename=${filename}`);
      
      // 查找 @@switch 位置
      const switchIndex = codeContent.indexOf('\n@@switch\n');
      let finalCodeContent = codeContent;
      
      if (switchIndex !== -1) {
        console.log(`发现 @@switch，移除后续内容`);
        // 如果有 @@switch，只保留 @@switch 之前的代码
        finalCodeContent = codeContent.substring(0, switchIndex);
      }
      
      // 清理代码开头和结尾的多余换行符
      finalCodeContent = finalCodeContent.replace(/^\n+/, '').replace(/\n+$/, '');
      
      // 如果有文件名，使用 title 格式
      if (filename.trim()) {
        return `\`\`\`${lang} title="${filename}"\n${finalCodeContent}`;
      } else {
        return `\`\`\`${lang}\n${finalCodeContent}`;
      }
    });

    // 处理缺少开始标记的情况（如：直接以 @@filename 开始）
    const result2 = result1.replace(/(\n|^)@@filename\(([^)]*)\)\n([\s\S]*?)(?=\n```|\n*$)/g, (match, prefix, filename, codeContent) => {
      modified = true;
      console.log(`处理缺少开始标记模式: filename=${filename}`);
      
      // 查找 @@switch 位置
      const switchIndex = codeContent.indexOf('\n@@switch\n');
      let finalCodeContent = codeContent;
      
      if (switchIndex !== -1) {
        // 如果有 @@switch，只保留 @@switch 之前的代码
        finalCodeContent = codeContent.substring(0, switchIndex);
      }
      
      // 清理代码开头和结尾的多余换行符
      finalCodeContent = finalCodeContent.replace(/^\n+/, '').replace(/\n+$/, '');
      
      // 如果有文件名，使用 title 格式，默认使用 typescript
      if (filename.trim()) {
        return `${prefix}\`\`\`typescript title="${filename}"\n${finalCodeContent}`;
      } else {
        return `${prefix}\`\`\`typescript\n${finalCodeContent}`;
      }
    });

    // 处理不完整的代码块（缺少结束标记）- 但排除引用块中的代码
    const result3 = result2.replace(/^```(\w+)(\s+title="[^"]*")?\n([\s\S]*?)(\n(?=[#\n]|$))/gm, (match, lang, titlePart, codeContent, endPart) => {
      // 检查是否已经有结束的```
      if (codeContent.includes('\n```')) {
        return match; // 已经有结束标记，不处理
      }
      
      // 检查是否在引用块内（前面是否有 > 符号）
      const matchIndex = result2.indexOf(match);
      const beforeMatch = result2.substring(0, matchIndex);
      const lines = beforeMatch.split('\n');
      const lastLine = lines[lines.length - 1];
      if (lastLine.trim().startsWith('>')) {
        return match; // 在引用块内，不处理
      }
      
      // 检查代码内容是否看起来像是被截断的
      const codeLines = codeContent.split('\n');
      const lastCodeLine = codeLines[codeLines.length - 1];
      
      // 如果最后一行看起来不完整（比如缺少花括号），添加结束标记
      if (lastCodeLine && !lastCodeLine.trim().endsWith('}') && !lastCodeLine.trim().endsWith(';')) {
        console.log(`检测到可能不完整的代码块，lang=${lang}`);
        modified = true;
        return `\`\`\`${lang}${titlePart || ''}\n${codeContent}\n\`\`\`${endPart}`;
      }
      
      return match;
    });

    return result3;
  }

  /**
   * 运行处理程序
   */
  async run() {
    console.log('🔍 开始处理 docs 文件夹中的 Markdown 文件...');
    console.log(`📁 目标目录: ${path.resolve(this.docsPath)}`);

    try {
      // 查找所有 .md 文件
      const pattern = path.join(this.docsPath, '**/*.md').replace(/\\/g, '/');
      const files = await glob(pattern, { 
        ignore: ['**/node_modules/**', '**/.*/**']
      });

      console.log(`📝 找到 ${files.length} 个 Markdown 文件`);

      // 处理每个文件
      for (const file of files) {
        this.processFile(file);
      }

      // 输出处理结果
      console.log('\n📊 处理完成!');
      console.log(`   总文件数: ${this.processedFiles}`);
      console.log(`   修改文件数: ${this.changedFiles}`);
      console.log(`   错误数: ${this.errors.length}`);

      if (this.errors.length > 0) {
        console.log('\n❌ 错误详情:');
        this.errors.forEach(({ file, error }) => {
          console.log(`   ${file}: ${error}`);
        });
        process.exit(1);
      }

      if (this.changedFiles > 0) {
        console.log(`\n✨ 成功修复了 ${this.changedFiles} 个文件的代码块格式!`);
      } else {
        console.log('\n✅ 所有文件的代码块格式都是正确的!');
      }

    } catch (error) {
      console.error('❌ 运行出错:', error.message);
      process.exit(1);
    }
  }
}

// 运行脚本
if (require.main === module) {
  const fixer = new CodeBlockFixer();
  fixer.run().catch(console.error);
}

module.exports = CodeBlockFixer;

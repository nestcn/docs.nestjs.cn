#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * 检查和修复 Markdown 文件中的模板语法问题
 * 主要修复 {{ '{' }} 和 {{ '}' }} 这类模板语法错误
 */

class TemplateSyntaxFixer {
  constructor(docsPath = './docs') {
    this.docsPath = docsPath;
    this.processedFiles = 0;
    this.changedFiles = 0;
    this.errors = [];
    this.issues = [];
  }

  /**
   * 处理单个文件
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // 检查和修复模板语法问题
      const processedContent = this.fixTemplateSyntax(content);
      
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
   * 修复模板语法问题
   */
  fixTemplateSyntax(content) {
    let modified = content;
    let hasChanges = false;

    // 修复 GitHub Actions 模板语法: {{ '${{' }} 变为 ${{
    const githubActionsRegex1 = /\{\{\s*['"]\s*\$\{\{\s*['"]\s*\}\}/g;
    if (githubActionsRegex1.test(modified)) {
      modified = modified.replace(githubActionsRegex1, '${{');
      hasChanges = true;
      console.log('修复了 GitHub Actions 开始模板语法');
    }

    // 修复 GitHub Actions 结束语法: {{ '}}' }} 变为 }}
    const githubActionsRegex2 = /\{\{\s*['"][\}\s]*['"]\s*\}\}/g;
    if (githubActionsRegex2.test(modified)) {
      modified = modified.replace(githubActionsRegex2, '}}');
      hasChanges = true;
      console.log('修复了 GitHub Actions 结束模板语法');
    }

    // 修复普通的模板语法 {{ '{' }} 为 {
    const templateSyntaxRegex = /\{\{\s*['"]\s*\{\s*['"]\s*\}\}/g;
    if (templateSyntaxRegex.test(modified)) {
      modified = modified.replace(templateSyntaxRegex, '{');
      hasChanges = true;
      console.log('修复了开始花括号的模板语法');
    }

    // 修复普通的模板语法 {{ '}' }} 为 }
    const templateSyntaxRegex2 = /\{\{\s*['"]\s*\}\s*['"]\s*\}\}/g;
    if (templateSyntaxRegex2.test(modified)) {
      modified = modified.replace(templateSyntaxRegex2, '}');
      hasChanges = true;
      console.log('修复了结束花括号的模板语法');
    }

    // 修复 &#125; 为正常的花括号
    const htmlEntityRegex = /&#125;/g;
    if (htmlEntityRegex.test(modified)) {
      modified = modified.replace(htmlEntityRegex, '}');
      hasChanges = true;
      console.log('修复了 HTML 实体编码的花括号');
    }

    // 修复转义的美元符号在 shell 变量中: \${VAR} 变为 ${VAR}
    const shellVarRegex = /\\(\$\{[^}]+\})/g;
    if (shellVarRegex.test(modified)) {
      modified = modified.replace(shellVarRegex, '$1');
      hasChanges = true;
      console.log('修复了转义的 shell 变量');
    }

    // 检测和记录可能的问题模式
    const problemPatterns = [
      { pattern: /\{\{\s*['"]\s*[^}]*?\s*['"]\s*\}\}/g, desc: '可疑的模板语法' },
      { pattern: /\{\{\s*[^}]*?\}\}/g, desc: '可能的模板变量' },
      { pattern: /&#\d+;/g, desc: 'HTML 实体编码' }
    ];

    problemPatterns.forEach(({ pattern, desc }) => {
      const matches = modified.match(pattern);
      if (matches) {
        // 过滤掉正常的 GitHub Actions 语法
        const filteredMatches = matches.filter(match => 
          !match.startsWith('${{') && !match.endsWith('}}')
        );
        if (filteredMatches.length > 0) {
          this.issues.push({
            file: this.currentFile,
            description: desc,
            matches: filteredMatches
          });
        }
      }
    });

    return modified;
  }

  /**
   * 运行处理程序
   */
  async run() {
    console.log('🔍 开始检查和修复模板语法问题...');
    console.log(`📁 目标目录: ${path.resolve(this.docsPath)}`);

    try {
      // 找到所有 Markdown 文件
      const files = await glob(`${this.docsPath}/**/*.md`, {
        ignore: ['**/node_modules/**', '**/.git/**']
      });

      console.log(`📄 发现 ${files.length} 个 Markdown 文件`);

      // 处理每个文件
      for (const file of files) {
        this.currentFile = file;
        this.processFile(file);
      }

      // 输出统计信息
      console.log('\n📊 处理完成！');
      console.log(`✅ 处理了 ${this.processedFiles} 个文件`);
      console.log(`🔧 修改了 ${this.changedFiles} 个文件`);
      
      if (this.errors.length > 0) {
        console.log(`❌ 出错文件数: ${this.errors.length}`);
        this.errors.forEach(error => {
          console.log(`  - ${error.file}: ${error.error}`);
        });
      }

      if (this.issues.length > 0) {
        console.log(`⚠️  发现 ${this.issues.length} 个潜在问题需要手动检查:`);
        this.issues.forEach(issue => {
          console.log(`  - ${issue.file}: ${issue.description}`);
          console.log(`    ${issue.matches.slice(0, 3).join(', ')}${issue.matches.length > 3 ? '...' : ''}`);
        });
      }

    } catch (error) {
      console.error('❌ 运行过程中出现错误:', error);
      process.exit(1);
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const fixer = new TemplateSyntaxFixer();
  fixer.run().catch(console.error);
}

module.exports = TemplateSyntaxFixer;

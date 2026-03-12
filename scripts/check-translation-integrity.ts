#!/usr/bin/env bun
import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

interface CheckResult {
  file: string;
  sourceLines: number;
  targetLines: number;
  sourceCodeBlocks: number;
  targetCodeBlocks: number;
  chineseChars: number;
  isComplete: boolean;
  issues: string[];
}

class TranslationIntegrityChecker {
  private contentDir: string;
  private docsDir: string;
  private results: CheckResult[] = [];
  private verbose: boolean;

  constructor(options: { contentDir?: string; docsDir?: string; verbose?: boolean } = {}) {
    this.contentDir = options.contentDir || 'content';
    this.docsDir = options.docsDir || 'docs';
    this.verbose = options.verbose || false;
  }

  private countCodeBlocks(content: string): number {
    return (content.match(/```[\s\S]*?```/g) || []).length;
  }

  private countChineseChars(content: string): number {
    const contentWithoutComments = content.replace(/<!--[\s\S]*?-->/g, '');
    const matches = contentWithoutComments.match(/[\u4e00-\u9fa5]/g);
    return matches ? matches.length : 0;
  }

  private checkFile(sourcePath: string, targetPath: string): CheckResult {
    const issues: string[] = [];
    let isComplete = true;

    const sourceContent = fs.readFileSync(sourcePath, 'utf8');
    const sourceLines = sourceContent.split('\n').filter(line => line.trim().length > 0).length;
    const sourceCodeBlocks = this.countCodeBlocks(sourceContent);

    if (!fs.existsSync(targetPath)) {
      return {
        file: path.relative(this.contentDir, sourcePath),
        sourceLines,
        targetLines: 0,
        sourceCodeBlocks,
        targetCodeBlocks: 0,
        chineseChars: 0,
        isComplete: false,
        issues: ['Target file does not exist']
      };
    }

    const targetContent = fs.readFileSync(targetPath, 'utf8');
    const targetLines = targetContent.split('\n').filter(line => line.trim().length > 0).length;
    const targetCodeBlocks = this.countCodeBlocks(targetContent);
    const chineseChars = this.countChineseChars(targetContent);

    if (sourceCodeBlocks !== targetCodeBlocks) {
      issues.push(`Code block count mismatch: source=${sourceCodeBlocks}, target=${targetCodeBlocks}`);
      isComplete = false;
    }

    const ratio = targetLines / sourceLines;
    if (ratio < 0.5) {
      issues.push(`Line count ratio too low: ${(ratio * 100).toFixed(1)}% (threshold: 50%)`);
      isComplete = false;
    }

    if (chineseChars < 50 && sourceLines > 20) {
      issues.push(`Insufficient Chinese characters: ${chineseChars} (threshold: 50 for files > 20 lines)`);
      isComplete = false;
    }

    if (targetContent.includes('__CODE_BLOCK_') || targetContent.includes('__INLINE_CODE_') || 
        targetContent.includes('__LINK_') || targetContent.includes('__HTML_TAG_')) {
      issues.push('Contains unresolved placeholders');
      isComplete = false;
    }

    return {
      file: path.relative(this.contentDir, sourcePath),
      sourceLines,
      targetLines,
      sourceCodeBlocks,
      targetCodeBlocks,
      chineseChars,
      isComplete,
      issues
    };
  }

  async run(): Promise<boolean> {
    console.log('🔍 Checking translation integrity...\n');

    const pattern = path.join(this.contentDir, '**', '*.md').replace(/\\/g, '/');
    const sourceFiles = await glob(pattern);

    console.log(`📄 Found ${sourceFiles.length} source files to check\n`);

    let completeCount = 0;
    let incompleteCount = 0;

    for (const sourcePath of sourceFiles) {
      const relativePath = path.relative(this.contentDir, sourcePath);
      const targetPath = path.resolve(this.docsDir, relativePath);
      
      const result = this.checkFile(sourcePath, targetPath);
      this.results.push(result);

      if (result.isComplete) {
        completeCount++;
        if (this.verbose) {
          console.log(`✅ ${result.file}`);
        }
      } else {
        incompleteCount++;
        console.log(`❌ ${result.file}`);
        for (const issue of result.issues) {
          console.log(`   - ${issue}`);
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Complete translations: ${completeCount}`);
    console.log(`❌ Incomplete translations: ${incompleteCount}`);
    console.log(`📈 Completion rate: ${((completeCount / sourceFiles.length) * 100).toFixed(1)}%`);

    if (incompleteCount > 0) {
      console.log('\n⚠️  Some translations are incomplete. Please run translation with --force flag to re-translate.');
      console.log('   Example: bun run translate-docs:force');
      return false;
    }

    console.log('\n✅ All translations are complete!');
    return true;
  }
}

const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
使用方法: bun scripts/check-translation-integrity.ts [选项]

选项:
  --verbose, -v    显示详细信息
  --help, -h       显示帮助信息
`);
  process.exit(0);
}

const checker = new TranslationIntegrityChecker({ verbose });
checker.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('❌ Check failed:', err);
  process.exit(1);
});

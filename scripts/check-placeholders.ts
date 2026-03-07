#!/usr/bin/env tsx

/**
 * 占位符检查脚本
 * 
 * 检查文档中是否存在未恢复的占位符
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const DOCS_DIR = path.resolve(process.cwd(), 'docs');

const PLACEHOLDER_PATTERNS = [
  /__PLACEHOLDER_(CODE_BLOCK|INLINE_CODE|HTML_TAG|LINK)_\d+__/g,
  /__LINK_\d+__/g,
  /__HTML_TAG_\d+__/g,
  /__INLINE_CODE_\d+__/g,
  /__CODE_BLOCK_\d+__/g,
];

interface PlaceholderIssue {
  file: string;
  line: number;
  placeholder: string;
  context: string;
}

async function checkPlaceholders(): Promise<PlaceholderIssue[]> {
  console.log('🔍 Checking for placeholders in documentation...');

  const files = await glob(path.join(DOCS_DIR, '**/*.md').replace(/\\/g, '/'));
  const issues: PlaceholderIssue[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const pattern of PLACEHOLDER_PATTERNS) {
        const matches = line.match(pattern);
        if (matches) {
          for (const match of matches) {
            issues.push({
              file: path.relative(process.cwd(), file),
              line: i + 1,
              placeholder: match,
              context: line.trim().substring(0, 100),
            });
          }
        }
      }
    }
  }

  return issues;
}

// CLI 入口
async function main() {
  try {
    const issues = await checkPlaceholders();

    if (issues.length === 0) {
      console.log('\n✅ No placeholder issues found');
      process.exit(0);
    }

    console.log(`\n❌ Found ${issues.length} placeholder issues:\n`);

    // 按文件分组
    const grouped = new Map<string, PlaceholderIssue[]>();
    for (const issue of issues) {
      const existing = grouped.get(issue.file) || [];
      existing.push(issue);
      grouped.set(issue.file, existing);
    }

    for (const [file, fileIssues] of grouped) {
      console.log(`📄 ${file}`);
      for (const issue of fileIssues) {
        console.log(`   Line ${issue.line}: ${issue.placeholder}`);
        console.log(`      ${issue.context}`);
      }
      console.log('');
    }

    console.log(`Total: ${issues.length} issues in ${grouped.size} files`);

    process.exit(1);
  } catch (error) {
    console.error('❌ Failed to check placeholders:', (error as Error).message);
    process.exit(1);
  }
}

main();

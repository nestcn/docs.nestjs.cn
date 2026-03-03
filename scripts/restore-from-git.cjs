#!/usr/bin/env node

/**
 * 从git历史恢复翻译文件
 * 
 * 这个脚本会：
 * 1. 查找所有包含占位符的文件
 * 2. 从指定的commit中恢复这些文件
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COMMIT_HASH = 'af445eb';

function findFilesWithPlaceholders(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (/__LINK_\d+__|__HTML_TAG_\d+__|__INLINE_CODE_\d+__|__CODE_BLOCK_\d+__/.test(content)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  traverse(dir);
  return files;
}

function restoreFiles(files) {
  const batchSize = 10;
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const command = `git checkout ${COMMIT_HASH} -- ${batch.join(' ')}`;
    
    try {
      execSync(command, { encoding: 'utf8', cwd: process.cwd() });
      console.log(`✅ Restored batch ${Math.floor(i / batchSize) + 1}: ${batch.length} files`);
    } catch (error) {
      console.error(`❌ Failed to restore batch ${Math.floor(i / batchSize) + 1}:`, error.message);
    }
  }
}

async function main() {
  console.log('🔍 Finding files with placeholders...');
  const files = findFilesWithPlaceholders('docs');
  console.log(`📄 Found ${files.length} files with placeholders`);
  
  if (files.length === 0) {
    console.log('✅ No files need to be restored');
    return;
  }
  
  console.log('🔄 Restoring files from commit', COMMIT_HASH);
  restoreFiles(files);
  
  console.log('✅ Done!');
}

main().catch(console.error);

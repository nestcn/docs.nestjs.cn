/**
 * 修正文档中的锚点链接
 * 主要处理因翻译导致的内部锚点链接失效问题
 */

const fs = require('fs');
const path = require('path');

// 导入公共锚点映射配置
const { anchorMappings, pathMappings } = require('../config/anchor-mappings.js');

function findMdFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'content') {
      files.push(...findMdFiles(fullPath));
    } else if (stat.isFile() && item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixAnchorLinks(content) {
  let fixed = content;
  let changeCount = 0;
  
  // 修正绝对路径的锚点链接
  const absoluteLinkPattern = /\]\(\/([^)]+?)#([a-zA-Z0-9\-_]+)\)/g;
  fixed = fixed.replace(absoluteLinkPattern, (match, path, anchor) => {
    let newPath = path;
    let newAnchor = anchor;
    
    // 修正路径
    if (pathMappings[`/${path}`]) {
      newPath = pathMappings[`/${path}`].substring(1); // 去掉开头的 /
    }
    
    // 修正锚点
    if (anchorMappings[anchor]) {
      newAnchor = anchorMappings[anchor];
      changeCount++;
    }
    
    return `](../${newPath}#${newAnchor})`;
  });
  
  // 修正相对路径的锚点链接
  const relativeLinkPattern = /\]\(\.\.\/([^)]+?)#([a-zA-Z0-9\-_]+)\)/g;
  fixed = fixed.replace(relativeLinkPattern, (match, path, anchor) => {
    let newAnchor = anchor;
    
    // 修正锚点
    if (anchorMappings[anchor]) {
      newAnchor = anchorMappings[anchor];
      changeCount++;
    }
    
    return `](../${path}#${newAnchor})`;
  });
  
  // 修正当前目录的锚点链接
  const currentDirLinkPattern = /\]\(\.\/([^)]+?)#([a-zA-Z0-9\-_]+)\)/g;
  fixed = fixed.replace(currentDirLinkPattern, (match, path, anchor) => {
    let newAnchor = anchor;
    
    // 修正锚点
    if (anchorMappings[anchor]) {
      newAnchor = anchorMappings[anchor];
      changeCount++;
    }
    
    return `](./${path}#${newAnchor})`;
  });
  
  // 修正同路径的锚点链接（techniques/xxx#yyy 格式）
  const sameDirLinkPattern = /\]\(([a-zA-Z0-9\-_\/]+)#([a-zA-Z0-9\-_]+)\)/g;
  fixed = fixed.replace(sameDirLinkPattern, (match, path, anchor) => {
    let newAnchor = anchor;
    
    // 修正锚点
    if (anchorMappings[anchor]) {
      newAnchor = anchorMappings[anchor];
      changeCount++;
    }
    
    return `](${path}#${newAnchor})`;
  });
  
  return { content: fixed, changes: changeCount };
}

function main() {
  const docsDir = path.join(__dirname, '..', 'docs');
  
  if (!fs.existsSync(docsDir)) {
    console.error('docs 目录不存在');
    process.exit(1);
  }
  
  const mdFiles = findMdFiles(docsDir);
  console.log(`找到 ${mdFiles.length} 个 Markdown 文件`);
  
  let totalChanges = 0;
  let processedFiles = 0;
  
  for (const filePath of mdFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = fixAnchorLinks(content);
      
      if (result.changes > 0) {
        fs.writeFileSync(filePath, result.content, 'utf8');
        console.log(`✓ ${path.relative(docsDir, filePath)} - 修正了 ${result.changes} 个锚点链接`);
        totalChanges += result.changes;
        processedFiles++;
      }
    } catch (error) {
      console.error(`处理文件 ${filePath} 时出错:`, error.message);
    }
  }
  
  console.log(`\n修正完成:`);
  console.log(`- 处理了 ${processedFiles} 个文件`);
  console.log(`- 总共修正了 ${totalChanges} 个锚点链接`);
  console.log(`- 锚点映射表包含 ${Object.keys(anchorMappings).length} 个映射`);
}

if (require.main === module) {
  main();
}

module.exports = { fixAnchorLinks, anchorMappings, pathMappings };

import fs from 'fs';
import path from 'path';

function hasSignificantChineseContent(content) {
  // 移除 HTML 注释
  const contentWithoutComments = content.replace(/<!--[\s\S]*?-->/g, '');
  // 移除 HTML 标签
  const contentWithoutHtml = contentWithoutComments.replace(/<[^>]+>/g, '');
  // 移除代码块
  const contentWithoutCode = contentWithoutHtml.replace(/```[\s\S]*?```/g, '');
  // 移除行内代码
  const contentWithoutInlineCode = contentWithoutCode.replace(/`[^`]+`/g, '');
  // 移除链接
  const contentWithoutLinks = contentWithoutInlineCode.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  // 检查是否包含中文
  const chineseMatch = contentWithoutLinks.match(/[\u4e00-\u9fa5]/g);
  const chineseCount = chineseMatch ? chineseMatch.length : 0;
  // 计算总字符数（排除空白字符）
  const totalChars = contentWithoutLinks.replace(/\s/g, '').length;
  // 计算中文占比
  const chineseRatio = totalChars > 0 ? chineseCount / totalChars : 0;
  // 如果中文字符占比低于 10%，则认为是英文文件
  return chineseRatio < 0.1;
}

function findEnglishFiles(dir) {
  const englishFiles = [];

  function traverse(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        traverse(filePath);
      } else if (file.endsWith('.md')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          // 移除 HTML 注释
          const contentWithoutComments = content.replace(/<!--[\s\S]*?-->/g, '');
          // 移除 HTML 标签
          const contentWithoutHtml = contentWithoutComments.replace(/<[^>]+>/g, '');
          // 移除代码块
          const contentWithoutCode = contentWithoutHtml.replace(/```[\s\S]*?```/g, '');
          // 移除行内代码
          const contentWithoutInlineCode = contentWithoutCode.replace(/`[^`]+`/g, '');
          // 移除链接
          const contentWithoutLinks = contentWithoutInlineCode.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
          // 检查是否包含中文
          const chineseMatch = contentWithoutLinks.match(/[\u4e00-\u9fa5]/g);
          const chineseCount = chineseMatch ? chineseMatch.length : 0;
          // 计算总字符数（排除空白字符）
          const totalChars = contentWithoutLinks.replace(/\s/g, '').length;
          // 计算中文占比
          const chineseRatio = totalChars > 0 ? chineseCount / totalChars : 0;
          
          if (chineseRatio < 0.1) {
            englishFiles.push(filePath);
            console.log(`File ${path.relative(process.cwd(), filePath)}: ${chineseCount} Chinese chars, ${totalChars} total chars, ratio: ${(chineseRatio * 100).toFixed(2)}%`);
          }
        } catch (error) {
          console.error(`Error reading file ${filePath}: ${error.message}`);
        }
      }
    }
  }

  traverse(dir);
  return englishFiles;
}

const docsDir = path.join(process.cwd(), 'docs');
const englishFiles = findEnglishFiles(docsDir);

console.log(`Found ${englishFiles.length} English files in docs directory:`);
englishFiles.forEach(file => {
  console.log(`- ${path.relative(process.cwd(), file)}`);
});
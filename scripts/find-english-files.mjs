import fs from 'fs';
import path from 'path';

const docsDir = path.join(process.cwd(), 'docs');
const englishFiles = [];

function isEnglishFile(content) {
  const chineseChars = content.match(/[\u4e00-\u9fa5]/g) || [];
  const totalChars = content.replace(/\s/g, '').length;
  const chineseRatio = chineseChars.length / totalChars;
  return chineseRatio < 0.1;
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.endsWith('.md')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (isEnglishFile(content)) {
        englishFiles.push(filePath.replace(docsDir, ''));
      }
    }
  }
}

scanDirectory(docsDir);
console.log('Found English files:');
englishFiles.forEach(file => console.log(file));
console.log(`Total English files: ${englishFiles.length}`);

import fs from 'fs';
import path from 'path';

function hasChineseContent(content) {
  return /[\u4e00-\u9fa5]/.test(content);
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
          if (!hasChineseContent(content)) {
            englishFiles.push(filePath);
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
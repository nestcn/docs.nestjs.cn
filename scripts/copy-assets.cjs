#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 复制 assets 目录
const src = path.join(__dirname, '..', 'public', 'assets');
const dest = path.join(__dirname, '..', 'doc_build', 'assets');

if (fs.existsSync(src)) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src, { withFileTypes: true });
  files.forEach(file => {
    const srcPath = path.join(src, file.name);
    const destPath = path.join(dest, file.name);
    if (file.isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
  console.log('✅ Copied assets to doc_build/');
} else {
  console.log('⚠️ public/assets directory not found, skipping copy');
}
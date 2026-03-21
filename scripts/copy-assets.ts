#!/usr/bin/env tsx

/**
 * 资源复制脚本
 *
 * 将 public/assets 目录复制到 doc_build/assets
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.join(__dirname, '..', 'public', 'assets');
const dest = path.join(__dirname, '..', 'doc_build', 'assets');

if (fs.existsSync(src)) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src, { withFileTypes: true });
  for (const file of files) {
    const srcPath = path.join(src, file.name);
    const destPath = path.join(dest, file.name);
    if (file.isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  console.log('✅ Copied assets to doc_build/');
} else {
  console.log('⚠️ public/assets directory not found, skipping copy');
}

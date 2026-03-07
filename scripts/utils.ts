/**
 * 翻译工具函数
 */

import type { ProtectedContent, Glossary } from './types';

const PLACEHOLDER_PREFIX = '__PLACEHOLDER_';
const PLACEHOLDER_SUFFIX = '__';

export function protectCodeBlocks(content: string): ProtectedContent {
  const placeholders = new Map<string, string>();
  let counter = 0;
  let result = content;

  const generatePlaceholder = (type: string): string => {
    return `${PLACEHOLDER_PREFIX}${type}_${counter++}${PLACEHOLDER_SUFFIX}`;
  };

  const patterns = [
    { regex: /```[\s\S]*?```/g, type: 'CODE_BLOCK' },
    { regex: /`[^`\n]+`/g, type: 'INLINE_CODE' },
    { regex: /<[^>]+>/g, type: 'HTML_TAG' },
    { regex: /\[([^\]]*)\]\([^)]*\)/g, type: 'LINK' },
  ];

  for (const { regex, type } of patterns) {
    result = result.replace(regex, (match) => {
      const placeholder = generatePlaceholder(type);
      placeholders.set(placeholder, match);
      return placeholder;
    });
  }

  return { content: result, placeholders };
}

export function restoreCodeBlocks(
  content: string,
  placeholders: Map<string, string>
): string {
  let result = content;

  for (const [placeholder, original] of placeholders) {
    const escapedPlaceholder = placeholder.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );
    result = result.replace(new RegExp(escapedPlaceholder, 'g'), original);
  }

  return result;
}

export function hasChineseContent(content: string): boolean {
  return /[\u4e00-\u9fa5]/.test(content);
}

export function getChineseRatio(content: string): number {
  const chineseChars = content.match(/[\u4e00-\u9fa5]/g);
  const chineseCount = chineseChars ? chineseChars.length : 0;
  const totalChars = content.replace(/\s/g, '').length;
  return totalChars > 0 ? chineseCount / totalChars : 0;
}

export function loadGlossary(glossaryPath: string): Glossary {
  try {
    const fs = require('fs');
    if (fs.existsSync(glossaryPath)) {
      return JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));
    }
  } catch (error) {
    console.warn('Failed to load glossary:', error);
  }
  return {};
}

export function getGlossaryPrompt(glossary: Glossary, limit = 20): string {
  const terms = Object.entries(glossary);
  if (terms.length === 0) return '';

  const termList = terms
    .slice(0, limit)
    .map(([en, zh]) => `- ${en} -> ${zh}`)
    .join('\n');

  return `\n\n关键术语表（必须遵循）：\n${termList}`;
}

export function generateContentHash(content: string): string {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(content).digest('hex');
}

export function removeSwitchBlocks(content: string): string {
  return content.replace(/@@switch[\s\S]*?(?=```|\n\n|$)/g, '');
}

export function removeFilenameLines(content: string): string {
  return content.replace(/^@@filename\s*\([^)]*\)\s*\r?\n/gm, '');
}

export function convertFilenameToTitle(content: string): string {
  return content.replace(
    /@@filename\s*\(([^)]+)\)\s*\r?\n```(\w+)/g,
    '\n```$2 title="$1"'
  );
}

export function hasPlaceholders(content: string): boolean {
  return /__PLACEHOLDER_(CODE_BLOCK|INLINE_CODE|HTML_TAG|LINK)_\d+__/.test(
    content
  );
}

export function extractPlaceholders(content: string): string[] {
  const matches = content.match(
    /__PLACEHOLDER_(CODE_BLOCK|INLINE_CODE|HTML_TAG|LINK)_\d+__/g
  );
  return matches ? [...new Set(matches)] : [];
}

export function generateFileHeader(sourcePath: string): string {
  const relativePath = sourcePath.replace(/\\/g, '/');
  const timestamp = new Date().toISOString();

  return `<!-- 此文件从 ${relativePath} 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: ${timestamp} -->
<!-- 源文件: ${relativePath} -->

`;
}

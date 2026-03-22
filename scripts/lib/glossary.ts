/**
 * 术语表管理
 */

import fs from 'node:fs';
import type { GlossaryData } from './types.js';

/**
 * 加载术语表文件，返回统一的 GlossaryData 结构。
 * 兼容旧格式（纯 Record<string,string>）和新格式（含 doNotTranslate）。
 */
export function loadGlossary(filePath: string, verbose = false): GlossaryData {
  const result: GlossaryData = { terms: {}, doNotTranslate: [] };

  try {
    if (!fs.existsSync(filePath)) {
      if (verbose) console.log('⚠️ Glossary file not found:', filePath);
      return result;
    }

    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (raw.terms && typeof raw.terms === 'object') {
      // 新格式
      result.terms = raw.terms;
      result.doNotTranslate = Array.isArray(raw.doNotTranslate) ? raw.doNotTranslate : [];
    } else {
      // 旧格式：整个文件就是 terms 映射
      result.terms = raw;
    }

    if (verbose) {
      console.log(
        `📚 Loaded glossary: ${Object.keys(result.terms).length} terms, ${result.doNotTranslate.length} do-not-translate`,
      );
    }
  } catch (err) {
    console.warn('⚠️ Failed to load glossary:', err);
  }

  return result;
}

/**
 * 将术语表构建为 AI prompt 中的术语段
 */
export function buildGlossaryPrompt(glossary: GlossaryData): string {
  if (Object.keys(glossary.terms).length === 0 && glossary.doNotTranslate.length === 0) {
    return '';
  }

  let prompt = '\nTerminology / Glossary (Must Follow):\n';
  for (const [en, zh] of Object.entries(glossary.terms)) {
    prompt += `- ${en}: ${zh}\n`;
  }

  if (glossary.doNotTranslate.length > 0) {
    prompt += `\nDo NOT translate these proper nouns: ${glossary.doNotTranslate.join(', ')}\n`;
  }

  return prompt;
}

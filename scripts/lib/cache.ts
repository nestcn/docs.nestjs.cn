/**
 * 翻译缓存 & 断点续传管理
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { CacheData, CacheEntry, ProgressData } from './types.js';

// ============================================================================
// 翻译缓存
// ============================================================================

const CACHE_VERSION = 2;
const DEFAULT_TTL_DAYS = 30;

export class TranslationCache {
  private data: CacheData;
  private filePath: string;
  private dirty = false;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.data = this.load();
  }

  /**
   * 根据文件路径和内容片段 hash 获取缓存的翻译
   */
  get(fileKey: string, contentHash: string): string | undefined {
    const key = `${fileKey}:${contentHash}`;
    const entry = this.data.entries[key];
    if (!entry) return undefined;

    // TTL 检查
    const age = Date.now() - entry.timestamp;
    if (age > DEFAULT_TTL_DAYS * 86_400_000) {
      delete this.data.entries[key];
      this.dirty = true;
      return undefined;
    }

    return entry.translation;
  }

  /**
   * 缓存翻译结果
   */
  set(fileKey: string, contentHash: string, translation: string): void {
    const key = `${fileKey}:${contentHash}`;
    this.data.entries[key] = {
      hash: contentHash,
      translation,
      timestamp: Date.now(),
    };
    this.dirty = true;
  }

  /**
   * 持久化缓存到文件
   */
  save(): void {
    if (!this.dirty) return;
    try {
      this.data.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
      this.dirty = false;
    } catch (err) {
      console.warn(`⚠️ Failed to save translation cache: ${err}`);
    }
  }

  get size(): number {
    return Object.keys(this.data.entries).length;
  }

  private load(): CacheData {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);

        // 兼容旧格式（v1 使用 entries 数组）
        if (parsed.version === CACHE_VERSION) {
          return parsed as CacheData;
        }

        // 迁移旧格式
        if (Array.isArray(parsed.entries)) {
          const entries: Record<string, CacheEntry> = {};
          for (const [key, value] of parsed.entries as [string, string][]) {
            entries[key] = {
              hash: key.split(':')[1] || '',
              translation: value,
              timestamp: Date.now(),
            };
          }
          return { version: CACHE_VERSION, entries, lastUpdated: new Date().toISOString() };
        }
      }
    } catch {
      console.warn('⚠️ Failed to load translation cache, starting fresh');
    }
    return { version: CACHE_VERSION, entries: {}, lastUpdated: new Date().toISOString() };
  }
}

// ============================================================================
// 断点续传
// ============================================================================

export class ProgressTracker {
  private data: ProgressData;
  private filePath: string;

  constructor(baseDir: string) {
    this.filePath = path.join(baseDir, '.progress.json');
    this.data = this.load();
  }

  get completedFiles(): string[] {
    return this.data.completedFiles;
  }

  isCompleted(filePath: string): boolean {
    return this.data.completedFiles.includes(filePath);
  }

  markCompleted(filePath: string): void {
    if (!this.data.completedFiles.includes(filePath)) {
      this.data.completedFiles.push(filePath);
      this.data.lastUpdatedAt = new Date().toISOString();
      this.save();
    }
  }

  clear(): void {
    this.data = {
      completedFiles: [],
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };
    this.save();
  }

  private load(): ProgressData {
    try {
      if (fs.existsSync(this.filePath)) {
        return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      }
    } catch {
      // ignore
    }
    return {
      completedFiles: [],
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  private save(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch {
      // ignore
    }
  }
}

// ============================================================================
// Hash 工具
// ============================================================================

export function contentHash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

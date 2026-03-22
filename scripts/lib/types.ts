/**
 * 共享类型定义
 */

// ============================================================================
// AI 配置
// ============================================================================

export interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
  /** 每分钟请求数上限 */
  rpmLimit: number;
}

export interface AICompletionResponse {
  id: string;
  choices: Array<{
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================================================
// 翻译
// ============================================================================

export interface TranslatorOptions {
  contentDir: string;
  docsDir: string;
  verbose: boolean;
  concurrency: number;
  translateEnglish: boolean;
  useAI: boolean;
  model: string;
  apiKey?: string;
  maxTokens: number;
  force: boolean;
  resume: boolean;
}

export interface TranslationError {
  file: string;
  error: string;
}

// ============================================================================
// 占位符
// ============================================================================

export type PlaceholderType =
  | 'CODE_BLOCK'
  | 'INLINE_CODE'
  | 'LINK'
  | 'IMAGE'
  | 'HTML_TAG'
  | 'FRONTMATTER'
  | 'ADMONITION';

export interface PlaceholderMap {
  placeholders: Map<string, string>;
  counter: number;
}

// ============================================================================
// 缓存
// ============================================================================

export interface CacheEntry {
  hash: string;
  translation: string;
  timestamp: number;
}

export interface CacheData {
  version: number;
  entries: Record<string, CacheEntry>;
  lastUpdated: string;
}

export interface ProgressData {
  completedFiles: string[];
  startedAt: string;
  lastUpdatedAt: string;
}

// ============================================================================
// 校验
// ============================================================================

export interface ValidationIssue {
  file: string;
  type: 'placeholder' | 'codeblock' | 'hallucination' | 'bad-link' | 'dead-link' | 'integrity';
  severity: 'error' | 'warning';
  message: string;
  line?: number;
}

// ============================================================================
// 术语表
// ============================================================================

export interface GlossaryData {
  /** 术语映射：英文 -> 中文 */
  terms: Record<string, string>;
  /** 不翻译列表：品牌名/专有名词 */
  doNotTranslate: string[];
}

// ============================================================================
// 工具函数
// ============================================================================

export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

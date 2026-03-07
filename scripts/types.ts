/**
 * 翻译相关类型定义
 */

export interface TranslationOptions {
  verbose?: boolean;
  useAI?: boolean;
  model?: string;
  dryRun?: boolean;
  force?: boolean;
  file?: string;
}

export interface Glossary {
  [key: string]: string;
}

export interface TranslationCache {
  entries: [string, string][];
}

export interface PlaceholderMap {
  placeholder: string;
  original: string;
}

export interface ProtectedContent {
  content: string;
  placeholders: Map<string, string>;
}

export interface TranslationResult {
  success: boolean;
  translated?: string;
  error?: string;
  fromCache?: boolean;
}

export interface FileInfo {
  path: string;
  content: string;
  hash: string;
}

export interface SyncResult {
  added: string[];
  modified: string[];
  deleted: string[];
  unchanged: string[];
}

export interface ProofreadIssue {
  file: string;
  line?: number;
  issue: string;
  suggestion?: string;
}

export interface ProofreadResult {
  passed: boolean;
  issues: ProofreadIssue[];
}

export interface CloudflareAIResponse {
  result?: {
    response: string;
  };
  errors?: Array<{
    message: string;
    code: number;
  }>;
  success: boolean;
}

export interface CloudflareAIConfig {
  apiToken: string;
  accountId: string;
  model?: string;
}

export interface TranslatorConfig {
  cloudflare?: CloudflareAIConfig;
  glossary?: Glossary;
  cache?: Map<string, string>;
  verbose?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export interface FileTranslationTask {
  sourcePath: string;
  targetPath: string;
  content?: string;
  translated?: string;
  status: 'pending' | 'translating' | 'completed' | 'failed';
  error?: string;
  fromCache?: boolean;
}

export interface BatchTranslationResult {
  total: number;
  success: number;
  failed: number;
  cached: number;
  tasks: FileTranslationTask[];
}

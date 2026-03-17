/**
 * Cloudflare Workers AI 翻译器
 */

import type {
  CloudflareAIConfig,
  CloudflareAIResponse,
  Glossary,
} from './types';
import { getGlossaryPrompt } from './utils';

export class CloudflareTranslator {
  private config: CloudflareAIConfig;
  private glossary: Glossary;
  private maxRetries: number;
  private retryDelay: number;

  constructor(
    config: CloudflareAIConfig,
    options?: {
      glossary?: Glossary;
      maxRetries?: number;
      retryDelay?: number;
    }
  ) {
    this.config = config;
    this.glossary = options?.glossary || {};
    this.maxRetries = options?.maxRetries || 3;
    this.retryDelay = options?.retryDelay || 1000;
  }

  private getSystemPrompt(): string {
    const glossaryPrompt = getGlossaryPrompt(this.glossary);

    return `你是一个专业的技术文档翻译专家，专门将 NestJS 英文技术文档翻译成中文。

翻译要求：

1. **占位符保护（极其重要）**：
   - 文本中包含形如 [[PH_0_C]]、[[PH_1_I]]、[[PH_2_H]]、[[PH_3_L]] 的占位符
   - 这些占位符代表代码块、内联代码、HTML标签和链接
   - **必须原样保留这些占位符，不得修改、删除或添加任何占位符**
   - 占位符的数量和位置必须与原文完全一致
   - 占位符格式：[[PH_数字_字母]]，例如 [[PH_0_C]]、[[PH_1_I]]

2. **技术术语**：严格遵循提供的术语表。${glossaryPrompt}
   - 其他常用术语：Provider -> 提供者, Controller -> 控制器, Middleware -> 中间件, Module -> 模块, Service -> 服务, Guard -> 守卫, Pipe -> 管道, Interceptor -> 拦截器, Filter -> 过滤器

3. **格式保持**：
   - 保持 Markdown 格式不变
   - 保持标题层级不变
   - 保持列表格式不变
   - 保持表格格式不变

4. **内容准则**：
   - 保持专业性和可读性，使用自然流畅的中文
   - 已是中文的内容保持不变
   - 不要添加原文中没有的额外内容
   - 适当进行中文本地化改进

5. **特殊处理**：
   - 代码注释需要翻译成中文
   - 保持专有名词的英文原文（如 NestJS、TypeScript、JavaScript）

请将以下英文技术文档翻译成中文：`;
  }

  async translate(
    text: string,
    options?: { filePath?: string; maxTokens?: number }
  ): Promise<string> {
    const model = this.config.model || '@cf/meta/llama-3-8b-instruct';
    const maxTokens = options?.maxTokens || 4000;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/ai/run/${model}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.config.apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [
                {
                  role: 'system',
                  content: this.getSystemPrompt(),
                },
                {
                  role: 'user',
                  content: text,
                },
              ],
              max_tokens: maxTokens,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json() as { errors?: Array<{ message: string }> };
          throw new Error(
            `Cloudflare API error: ${errorData.errors?.[0]?.message || response.statusText}`
          );
        }

        const data = (await response.json()) as CloudflareAIResponse;

        if (!data.success || !data.result?.response) {
          throw new Error('Invalid response from Cloudflare AI');
        }

        return data.result.response;
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `Translation attempt ${attempt}/${this.maxRetries} failed:`,
          lastError.message
        );

        if (attempt < this.maxRetries) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.retryDelay * attempt)
          );
        }
      }
    }

    throw lastError || new Error('Translation failed after all retries');
  }

  async translateBatch(
    texts: string[],
    options?: { filePath?: string; maxTokens?: number }
  ): Promise<string[]> {
    const results: string[] = [];

    for (const text of texts) {
      const translated = await this.translate(text, options);
      results.push(translated);
    }

    return results;
  }
}

export function createTranslator(
  config: CloudflareAIConfig,
  options?: {
    glossary?: Glossary;
    maxRetries?: number;
    retryDelay?: number;
  }
): CloudflareTranslator {
  return new CloudflareTranslator(config, options);
}

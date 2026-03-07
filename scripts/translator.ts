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

    return `You are a professional technical documentation translator specializing in translating NestJS-related English technical documentation to Chinese.

Translation Requirements:
1. **Technical Terms**: Strict adherence to the provided glossary is required.${glossaryPrompt}
   - Other common terms: Provider -> 提供者, Controller -> 控制器, Middleware -> 中间件.

2. **Code and Format Preservation (CRITICAL)**:
   - Keep code examples, variable names, function names unchanged.
   - Maintain Markdown formatting, links, images, tables unchanged.
   - Translate code comments from English to Chinese.
   - **DO NOT EXPLAIN OR MODIFY placeholders like __PLACEHOLDER_INLINE_CODE_N__, __PLACEHOLDER_CODE_BLOCK_N__, __PLACEHOLDER_LINK_N__, __PLACEHOLDER_HTML_TAG_N__.**
   - **Keep these placeholders EXACTLY as they are in the source text.**
   - Keep relative links unchanged (will be processed later).

3. **Special Syntax Processing**:
   - Remove all @@switch blocks and content after them.
   - Convert @@filename(xxx) to rspress syntax: \`\`\`typescript title="xxx".
   - Keep internal anchors unchanged (will be mapped later).

4. **Content Guidelines**:
   - Maintain professionalism and readability. Use natural, fluent Chinese.
   - Keep content that is already in Chinese unchanged.
   - Don't add extra content not in the original.
   - Appropriate Chinese localization improvements are welcome.

5. **Link Handling**:
   - Keep relative paths unchanged (e.g., ./guide/introduction).
   - Keep docs.nestjs.com links unchanged (will be processed later).
   - Maintain anchor links as-is (e.g., #provider-scope).

Please translate the following English technical documentation to Chinese following these rules:`;
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

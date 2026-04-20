/**
 * AI API 交互模块
 *
 * 统一的 AI 翻译接口，支持：
 * - NVIDIA NIM (默认，使用 DeepSeek V3.1)
 * - OpenAI / OpenAI 兼容 API (GPT-5.4-codex 等)
 * - 指数退避重试（3 次，针对 429/500/503）
 * - 速率限制（默认 40 RPM）
 * - 滑动窗口上下文（分段翻译时附加前段摘要）
 */

import type { AIConfig, AICompletionResponse, GlossaryData } from './types.js';
import { getErrorMessage } from './types.js';

// 支持的模型配置
export const SUPPORTED_MODELS = {
  // NVIDIA NIM 模型
  'deepseek-ai/deepseek-v3_1': {
    provider: 'nvidia',
    name: 'DeepSeek V3.1',
    rpmLimit: 40,
  },
  'meta/llama-3.1-405b-instruct': {
    provider: 'nvidia',
    name: 'Llama 3.1 405B',
    rpmLimit: 40,
  },
  'meta/llama-3.1-70b-instruct': {
    provider: 'nvidia',
    name: 'Llama 3.1 70B',
    rpmLimit: 40,
  },
  // OpenAI / OpenAI 兼容模型
  'gpt-5.4-codex': {
    provider: 'openai',
    name: 'GPT-5.4 Codex',
    rpmLimit: 60,
  },
  'gpt-4o': {
    provider: 'openai',
    name: 'GPT-4o',
    rpmLimit: 60,
  },
  'gpt-4-turbo': {
    provider: 'openai',
    name: 'GPT-4 Turbo',
    rpmLimit: 60,
  },
  'claude-3.5-sonnet': {
    provider: 'openai',
    name: 'Claude 3.5 Sonnet',
    rpmLimit: 60,
  },
} as const;

export type ModelId = keyof typeof SUPPORTED_MODELS;

// ============================================================================
// AI Client
// ============================================================================

export class AIClient {
  private config: AIConfig;
  private lastRequestTime = 0;
  private requestIntervalMs: number;
  private provider: 'nvidia' | 'openai';

  constructor(config: Partial<AIConfig> = {}) {
    const model = config.model || 'deepseek-ai/deepseek-v3_1';
    const modelConfig = SUPPORTED_MODELS[model as ModelId];
    
    this.provider = modelConfig?.provider || 'nvidia';
    
    // 根据 provider 选择默认配置
    let defaultBaseUrl: string;
    let defaultApiKey: string;
    
    if (this.provider === 'openai') {
      defaultBaseUrl = 'https://api.openai.com/v1/chat/completions';
      defaultApiKey = process.env.OPENAI_API_KEY || '';
    } else {
      defaultBaseUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
      defaultApiKey = process.env.NVIDIA_API_KEY || '';
    }
    
    this.config = {
      apiKey: config.apiKey || defaultApiKey,
      baseUrl: config.baseUrl || defaultBaseUrl,
      model: model,
      maxTokens: config.maxTokens || 4096,
      temperature: config.temperature || 0.3,
      rpmLimit: config.rpmLimit || modelConfig?.rpmLimit || 40,
    };
    // 计算请求间隔
    this.requestIntervalMs = Math.ceil(60_000 / this.config.rpmLimit);
  }

  get isConfigured(): boolean {
    return !!this.config.apiKey;
  }
  
  get modelInfo() {
    return SUPPORTED_MODELS[this.config.model as ModelId];
  }

  /**
   * 翻译文本，包含速率限制和重试逻辑
   */
  async translate(
    text: string,
    options: {
      glossary?: GlossaryData;
      previousContext?: string;
      verbose?: boolean;
    } = {},
  ): Promise<{ content: string; usage?: AICompletionResponse['usage'] }> {
    if (!this.config.apiKey) {
      const envVar = this.provider === 'openai' ? 'OPENAI_API_KEY' : 'NVIDIA_API_KEY';
      throw new Error(`API Key 未配置 (设置 ${envVar} 环境变量)`);
    }

    const systemPrompt = this.buildSystemPrompt(options.glossary, options.previousContext);

    // 速率限制
    await this.rateLimit();

    // 指数退避重试
    return this.withRetry(() => this.callAPI(systemPrompt, text, options.verbose), 3);
  }

  // --------------------------------------------------------------------------
  // Internal
  // --------------------------------------------------------------------------

  private buildSystemPrompt(glossary?: GlossaryData, previousContext?: string): string {
    let glossarySection = '';
    if (glossary) {
      const terms = Object.entries(glossary.terms)
        .map(([en, zh]) => `- ${en}: ${zh}`)
        .join('\n');
      const dnt = glossary.doNotTranslate.join(', ');
      glossarySection = `
Terminology / Glossary (Must Follow):
${terms}

Do NOT translate these proper nouns: ${dnt}
`;
    }

    let contextSection = '';
    if (previousContext) {
      contextSection = `
Previous translation context (for consistency):
"""
${previousContext.slice(-300)}
"""
`;
    }

    return `You are a professional technical documentation translator specializing in translating NestJS-related English technical documentation to Chinese.

Translation Requirements:
1. **Technical Terms**: Strict adherence to the provided glossary.${glossarySection}
   - Other common terms: Provider -> 提供者, Controller -> 控制器, Middleware -> 中间件.

2. **Code and Format Preservation (CRITICAL)**:
   - Keep code examples, variable names, function names unchanged.
   - Maintain Markdown formatting, links, images, tables unchanged.
   - Translate code comments from English to Chinese.
   - **DO NOT EXPLAIN OR MODIFY placeholders like ⟦CB_0⟧, ⟦IC_1⟧, ⟦LN_2⟧, ⟦HT_3⟧, ⟦IMG_4⟧, ⟦FM_5⟧, ⟦AD_6⟧.**
   - **Keep these placeholders EXACTLY as they are in the source text.**
   - Keep relative links unchanged.

3. **Special Syntax Processing**:
   - Remove all @@switch blocks and content after them.
   - Convert @@filename(xxx) to rspress syntax: \`\`\`typescript title="xxx".
   - Keep internal anchors unchanged.

4. **Content Guidelines**:
   - Maintain professionalism and readability. Use natural, fluent Chinese.
   - Keep content already in Chinese unchanged.
   - Don't add extra content not in the original.

5. **Link Handling**:
   - Keep relative paths unchanged (e.g., ./guide/introduction).
   - Keep docs.nestjs.com links unchanged.
   - Maintain anchor links as-is (e.g., #provider-scope).
${contextSection}
Please translate the following English technical documentation to Chinese following these rules:`;
  }

  private async callAPI(
    systemPrompt: string,
    userContent: string,
    verbose?: boolean,
  ): Promise<{ content: string; usage?: AICompletionResponse['usage'] }> {
    const response = await fetch(this.config.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(
        `API error (${response.status}): ${errorText.slice(0, 200)}`,
      ) as Error & { statusCode: number };
      error.statusCode = response.status;
      throw error;
    }

    const result = (await response.json()) as AICompletionResponse;
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('API returned empty content');
    }

    if (verbose && result.usage) {
      console.log(
        `    📊 Tokens: ${result.usage.prompt_tokens} prompt + ${result.usage.completion_tokens} completion`,
      );
    }

    return { content, usage: result.usage };
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.requestIntervalMs) {
      await new Promise((r) => setTimeout(r, this.requestIntervalMs - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  private async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err: unknown) {
        lastError = err;
        const statusCode = (err as { statusCode?: number }).statusCode;
        const isRetryable = statusCode === 429 || statusCode === 500 || statusCode === 503;

        if (!isRetryable || attempt === maxRetries) {
          throw err;
        }

        const delay = Math.min(2000 * Math.pow(2, attempt), 30_000);
        console.warn(
          `  ⚠️ API error (${statusCode}), retrying in ${delay / 1000}s (attempt ${attempt + 1}/${maxRetries})...`,
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    throw lastError;
  }
}

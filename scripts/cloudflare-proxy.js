import { Hono } from 'hono';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const app = new Hono();
const port = 3000;

// 验证环境变量
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
  console.error('❌ Missing Cloudflare API credentials');
  console.error('Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env file');
  process.exit(1);
}

app.post('/translate', async (c) => {
  try {
    const { text, model } = await c.req.json();
    
    if (!text) {
      return c.json({ error: 'Missing text parameter' }, 400);
    }
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${model || '@cf/meta/llama-3-8b-instruct'}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a professional technical documentation translator specializing in translating NestJS-related English technical documentation to Chinese.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 4000
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cloudflare Workers AI error: ${error.errors?.[0]?.message || response.statusText}`);
    }

    const result = await response.json();
    return c.json(result);
  } catch (error) {
    console.error('Proxy error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 健康检查端点
app.get('/health', async (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 对于 Node.js 环境，我们需要使用 @hono/node-server
import { serve } from '@hono/node-server';

serve({
  fetch: app.fetch,
  port
}, () => {
  console.log(`Cloudflare AI proxy running at http://localhost:${port}`);
  console.log('Health check: http://localhost:${port}/health');
});

/**
 * Cloudflare Worker 翻译规则配置
 * 
 * 此文件定义了 Cloudflare Worker 在进行 AI 翻译时需要遵循的规则，
 * 确保与 .github/copilot-instructions.md 保持一致
 */

// 导入锚点映射配置（如果在 Worker 环境中可用）
let anchorMappings = {};
let pathMappings = {};

// 如果在 Node.js 环境中，加载本地配置
if (typeof require !== 'undefined') {
  try {
    const config = require('./anchor-mappings.js');
    anchorMappings = config.anchorMappings || {};
    pathMappings = config.pathMappings || {};
  } catch (error) {
    console.warn('无法加载锚点映射配置，使用默认配置');
  }
} else {
  // 在 Cloudflare Worker 环境中，定义关键映射
  anchorMappings = {
    'provider-scope': '提供者作用域',
    'library-specific-approach': '库特定方法',
    'binding-guards': '绑定守卫',
    'declarative-cron-jobs': '声明式-cron-任务',
    'dependency-injection': '依赖注入',
    'request-lifecycle': '请求生命周期',
    'exception-filters': '异常过滤器',
    'custom-decorators': '自定义装饰器',
    'middleware': '中间件',
    'interceptors': '拦截器',
    'pipes': '管道',
    'guards': '守卫',
    'execution-context': '执行上下文',
    'configuration': '配置',
    'dynamic-modules': '动态模块',
    'circular-dependency': '循环依赖',
    'module-reference': '模块引用',
    'lazy-loading-modules': '懒加载模块',
    'application-context': '应用上下文',
    'lifecycle-events': '生命周期事件',
    'application-shutdown': '应用关闭',
    'testing': '测试',
    'end-to-end-testing': '端到端测试',
    'authentication': '身份认证',
    'authorization': '授权',
    'encryption-and-hashing': '加密和哈希',
    'helmet': '头盔',
    'cors': '跨域资源共享',
    'csrf': '跨站请求伪造防护',
    'rate-limiting': '速率限制',
    'compression': '压缩',
    'file-upload': '文件上传',
    'streaming-files': '流式文件',
    'http-module': 'HTTP模块',
    'model-view-controller': '模型-视图-控制器',
    'performance': '性能',
    'hot-reload': '热重载',
    'serve-static': '静态文件服务',
    'server-sent-events': '服务器发送事件',
    'websockets': 'WebSocket',
    'microservices': '微服务',
    'graphql': 'GraphQL',
    'openapi': 'OpenAPI'
  };

  pathMappings = {
    'overview': 'guide',
    'first-steps': 'guide/first-steps',
    'controllers': 'guide/controllers',
    'providers': 'guide/providers',
    'modules': 'guide/modules',
    'middleware': 'guide/middleware',
    'exception-filters': 'guide/exception-filters',
    'pipes': 'guide/pipes',
    'guards': 'guide/guards',
    'interceptors': 'guide/interceptors',
    'custom-decorators': 'guide/custom-decorators'
  };
}

/**
 * 翻译提示词模板
 */
const TRANSLATION_PROMPT_TEMPLATE = `
请将以下英文技术文档翻译成中文，遵循以下规则：

## 翻译规则
1. **术语一致性**: 保持技术术语的一致性，如 "provider" → "提供者"，"decorator" → "装饰器"
2. **格式保持**: 严格保持原有的 Markdown 格式，包括代码块、链接、表格等
3. **代码注释**: 翻译代码块中的英文注释
4. **链接处理**: 
   - 保持相对路径不变
   - 内部锚点链接需要转换为中文标题对应的锚点
   - docs.nestjs.com 链接保持不变（在后处理中统一处理）
5. **特殊语法**: 
   - 删除所有 @@switch 代码块
   - 将 @@filename(xxx) 转换为 rspress 语法格式
6. **本地化**: 适当进行中文本地化改进，但不添加原文没有的内容

## 技术术语对照表
- Provider → 提供者
- Decorator → 装饰器  
- Controller → 控制器
- Service → 服务
- Module → 模块
- Middleware → 中间件
- Guard → 守卫
- Interceptor → 拦截器
- Pipe → 管道
- Filter → 过滤器
- Dependency Injection → 依赖注入
- Lifecycle → 生命周期
- Request → 请求
- Response → 响应
- Route → 路由
- Endpoint → 端点
- Schema → 模式
- Validation → 验证
- Authentication → 身份认证
- Authorization → 授权

## 要翻译的内容：
{content}

请提供翻译后的中文内容：
`;

/**
 * 获取翻译提示词
 */
function getTranslationPrompt(content) {
  return TRANSLATION_PROMPT_TEMPLATE.replace('{content}', content);
}

/**
 * 后处理翻译内容，应用链接和锚点规则
 */
function postProcessTranslation(translatedContent, originalFilePath = '') {
  let processed = translatedContent;

  // 1. 检查是否为特殊文件（awesome.md, index.md）
  const fileName = originalFilePath.split('/').pop() || '';
  const isSpecialFile = fileName === 'awesome.md' || fileName === 'index.md';

  // 2. 应用锚点映射
  processed = processed.replace(
    /#([a-zA-Z0-9_-]+)/g,
    (match, anchorPart) => {
      if (anchorMappings[anchorPart]) {
        return `#${anchorMappings[anchorPart]}`;
      }
      return match;
    }
  );

  // 3. 处理内部链接（非特殊文件）
  if (!isSpecialFile) {
    processed = processed.replace(
      /https?:\/\/(docs\.nestjs\.com|docs\.nestjs\.cn)(\/[^\s\)]*)?/g,
      (match, domain, urlPath) => {
        if (!urlPath) return './';
        
        const cleanPath = urlPath.replace(/^\//, '');
        
        // 应用路径映射
        if (pathMappings[cleanPath]) {
          return `./${pathMappings[cleanPath]}`;
        }
        
        return `./${cleanPath}`;
      }
    );
  }

  // 4. 处理代码块语法
  processed = processed.replace(/@@filename\(([^)]*)\)/g, (match, filename) => {
    return `\`\`\`typescript title="${filename}"`;
  });

  // 5. 删除 @@switch 标记
  processed = processed.replace(/@@switch[\s\S]*?(?=```|\n\n|$)/g, '');

  return processed;
}

/**
 * 检查文件是否需要特殊处理
 */
function isSpecialFile(filePath) {
  const fileName = filePath.split('/').pop() || '';
  return fileName === 'awesome.md' || fileName === 'index.md';
}

/**
 * 验证翻译质量
 */
function validateTranslation(original, translated) {
  const issues = [];

  // 检查代码块数量是否一致
  const originalCodeBlocks = (original.match(/```/g) || []).length;
  const translatedCodeBlocks = (translated.match(/```/g) || []).length;
  
  if (originalCodeBlocks !== translatedCodeBlocks) {
    issues.push(`代码块数量不匹配: 原文 ${originalCodeBlocks}, 译文 ${translatedCodeBlocks}`);
  }

  // 检查链接数量是否大致一致
  const originalLinks = (original.match(/\[.*?\]\(.*?\)/g) || []).length;
  const translatedLinks = (translated.match(/\[.*?\]\(.*?\)/g) || []).length;
  
  if (Math.abs(originalLinks - translatedLinks) > 2) {
    issues.push(`链接数量差异较大: 原文 ${originalLinks}, 译文 ${translatedLinks}`);
  }

  // 检查是否还有未处理的 @@switch
  if (translated.includes('@@switch')) {
    issues.push('仍包含未处理的 @@switch 标记');
  }

  return issues;
}

// 导出配置和函数
const CloudflareWorkerConfig = {
  anchorMappings,
  pathMappings,
  getTranslationPrompt,
  postProcessTranslation,
  isSpecialFile,
  validateTranslation,
  TRANSLATION_PROMPT_TEMPLATE
};

// 支持多种模块导出方式
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CloudflareWorkerConfig;
}

if (typeof window !== 'undefined') {
  window.CloudflareWorkerConfig = CloudflareWorkerConfig;
}

// ES6 模块导出
export default CloudflareWorkerConfig;

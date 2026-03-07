#!/usr/bin/env tsx

/**
 * 链接修复脚本
 * 
 * 修复文档中的链接：
 * - 将 docs.nestjs.com 链接转换为本地链接
 * - 修复内部锚点链接
 * - 更新相对路径
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const DOCS_DIR = path.resolve(process.cwd(), 'docs');

// 锚点映射表
const ANCHOR_MAPPINGS: Record<string, string> = {
  // 通用锚点
  'overview': '概述',
  'introduction': '介绍',
  'installation': '安装',
  'getting-started': '快速开始',
  'configuration': '配置',
  'usage': '用法',
  'examples': '示例',
  'faq': '常见问题',
  'troubleshooting': '故障排除',
  
  // 核心概念
  'modules': '模块',
  'controllers': '控制器',
  'providers': '提供者',
  'middleware': '中间件',
  'pipes': '管道',
  'guards': '守卫',
  'interceptors': '拦截器',
  'filters': '过滤器',
  'decorators': '装饰器',
  
  // 功能特性
  'dependency-injection': '依赖注入',
  'lifecycle-events': '生命周期事件',
  'circular-dependency': '循环依赖',
  'module-reference': '模块引用',
  'lazy-loading': '延迟加载',
  
  // HTTP 相关
  'request-lifecycle': '请求生命周期',
  'exception-filters': '异常过滤器',
  'execution-context': '执行上下文',
  
  // 数据库
  'typeorm': 'TypeORM',
  'sequelize': 'Sequelize',
  'prisma': 'Prisma',
  'mongoose': 'Mongoose',
  
  // 微服务
  'redis': 'Redis',
  'kafka': 'Kafka',
  'rabbitmq': 'RabbitMQ',
  'nats': 'NATS',
  'mqtt': 'MQTT',
  
  // GraphQL
  'resolvers': '解析器',
  'mutations': '变更',
  'subscriptions': '订阅',
  'queries': '查询',
  'scalars': '标量',
  'directives': '指令',
  
  // 安全
  'authentication': '认证',
  'authorization': '授权',
  'encryption': '加密',
  'helmet': 'Helmet',
  'cors': 'CORS',
  'csrf': 'CSRF',
  'rate-limiting': '速率限制',
  
  // 测试
  'unit-tests': '单元测试',
  'e2e-tests': '端到端测试',
  'testing': '测试',
  
  // CLI
  'cli': 'CLI',
  'commands': '命令',
  'workspaces': '工作区',
  'libraries': '库',
  
  // 其他
  'performance': '性能',
  'caching': '缓存',
  'compression': '压缩',
  'file-upload': '文件上传',
  'streaming': '流式传输',
  'validation': '验证',
  'serialization': '序列化',
  'cqrs': 'CQRS',
  'events': '事件',
  'task-scheduling': '任务调度',
  'queues': '队列',
  'logger': '日志',
  'health-checks': '健康检查',
  'openapi': 'OpenAPI',
  'swagger': 'Swagger',
  'graphql': 'GraphQL',
  'websockets': 'WebSocket',
  'microservices': '微服务',
};

function fixExternalLinks(content: string): string {
  // 将 docs.nestjs.com 链接转换为本地链接
  return content.replace(
    /https?:\/\/docs\.nestjs\.com\/([^\s\)]+)/g,
    (match, path) => {
      // 移除尾部斜杠
      path = path.replace(/\/$/, '');
      return `/${path}`;
    }
  );
}

function fixAnchorLinks(content: string): string {
  // 修复锚点链接
  for (const [en, zh] of Object.entries(ANCHOR_MAPPINGS)) {
    const enAnchor = `#${en}`;
    const zhAnchor = `#${zh}`;
    content = content.replace(new RegExp(enAnchor, 'g'), zhAnchor);
  }
  
  return content;
}

function fixRelativeLinks(content: string, filePath: string): string {
  const fileDir = path.dirname(filePath);
  const relativeToRoot = path.relative(fileDir, DOCS_DIR);
  const prefix = relativeToRoot ? relativeToRoot + '/' : './';
  
  // 修复相对路径链接
  // 例如：../introduction -> ./introduction
  return content;
}

async function fixLinks(): Promise<void> {
  console.log('🔧 Fixing links in documentation...');
  
  const files = await glob(path.join(DOCS_DIR, '**/*.md').replace(/\\/g, '/'));
  
  let fixedCount = 0;
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    const originalContent = content;
    
    // 修复外部链接
    content = fixExternalLinks(content);
    
    // 修复锚点链接
    content = fixAnchorLinks(content);
    
    // 修复相对链接
    content = fixRelativeLinks(content, file);
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      fixedCount++;
      console.log(`   Fixed: ${path.relative(process.cwd(), file)}`);
    }
  }
  
  console.log(`\n✅ Fixed links in ${fixedCount} files`);
}

// CLI 入口
async function main() {
  try {
    await fixLinks();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to fix links:', (error as Error).message);
    process.exit(1);
  }
}

main();

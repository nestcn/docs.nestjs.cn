#!/usr/bin/env bun

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename, resolve, extname, relative } from 'path';

// 导入公共锚点映射配置
import { anchorMappings } from '../config/anchor-mappings.js';

const DOCS_DIR = join(import.meta.dir, '../docs');

// 忽略的文件（根据 copilot-instructions.md）
const IGNORED_FILES = ['awesome.md', 'index.md'];

// 检查文件是否存在的函数
function checkFileExists(relativePath, currentDir) {
  // 标准化路径
  const normalizedPath = relativePath.replace(/^\.\//, '').replace(/^\.\.\//, '../');
  
  let targetPath;
  if (normalizedPath.startsWith('../')) {
    // 相对于当前目录的上级目录
    targetPath = resolve(currentDir, normalizedPath);
  } else {
    // 相对于当前目录
    targetPath = resolve(currentDir, normalizedPath);
  }
  
  // 移除锚点
  const pathWithoutAnchor = targetPath.split('#')[0];
  
  // 如果没有扩展名，假设是 .md 文件
  if (!extname(pathWithoutAnchor)) {
    return existsSync(pathWithoutAnchor + '.md');
  }
  
  return existsSync(pathWithoutAnchor);
}

// 将 URL 路径转换为本地文件路径
function urlPathToLocalPath(urlPath, currentFileDir) {
  // 分离路径和锚点
  const pathWithoutAnchor = urlPath.split('#')[0];
  let anchor = urlPath.includes('#') ? urlPath.split('#')[1] : '';
  
  // 修正锚点映射（英文 → 中文）
  if (anchor && anchorMappings[anchor]) {
    anchor = anchorMappings[anchor];
  }
  
  // 重新组装完整锚点
  const anchorPart = anchor ? '#' + anchor : '';
  
  // 移除前导斜杠
  const cleanPath = pathWithoutAnchor.replace(/^\//, '');
  
  // 路径映射规则
  const pathMappings = {
    // Overview 相关
    'controllers': '../overview/controllers',
    'providers': '../overview/providers',
    'modules': '../overview/modules',
    'middleware': '../overview/middlewares',
    'middlewares': '../overview/middlewares',
    'pipes': '../overview/pipes',
    'guards': '../overview/guards',
    'interceptors': '../overview/interceptors',
    'exception-filters': '../overview/exception-filters',
    'custom-decorators': '../overview/custom-decorators',
    'first-steps': '../overview/first-steps',
    
    // Fundamentals 相关
    'fundamentals/custom-providers': '../fundamentals/dependency-injection',
    'fundamentals/async-providers': '../fundamentals/async-components',
    'fundamentals/dependency-injection': '../fundamentals/dependency-injection',
    'fundamentals/module-ref': '../fundamentals/module-reference',
    'fundamentals/execution-context': '../fundamentals/execution-context',
    'fundamentals/lifecycle-events': '../fundamentals/lifecycle-events',
    'fundamentals/testing': '../fundamentals/unit-testing',
    'fundamentals/circular-dependency': '../fundamentals/circular-dependency',
    'fundamentals/dynamic-modules': '../fundamentals/dynamic-modules',
    'fundamentals/async-components': '../fundamentals/async-components',
    'fundamentals/unit-testing': '../fundamentals/unit-testing',
    
    // Techniques 相关
    'techniques/validation': '../techniques/validation',
    'techniques/configuration': '../techniques/configuration',
    'techniques/caching': '../techniques/caching',
    'techniques/queues': '../techniques/queues',
    'techniques/streaming-files': '../techniques/streaming-files',
    'techniques/serialization': '../techniques/serialization',
    'techniques/file-upload': '../techniques/file-upload',
    'techniques/sql': '../techniques/sql',
    'techniques/mongo': '../techniques/mongo',
    'techniques/http-module': '../techniques/http-module',
    'techniques/versioning': '../techniques/versioning',
    
    // CLI 相关
    'cli/overview': '../cli/overview',
    'cli/usages': '../cli/usages',
    'cli/scripts': '../cli/scripts',
    'cli/libraries': '../cli/libraries',
    'cli/workspaces': '../cli/workspaces',
    
    // Recipes 相关
    'recipes/crud-generator': '../recipes/crud-generator',
    'recipes/authentication': '../recipes/authentication',
    'recipes/passport': '../recipes/passport',
    'recipes/prisma': '../recipes/prisma',
    'recipes/terminus': '../recipes/terminus',
    'recipes/hot-reload': '../recipes/hot-reload',
    'recipes/helmet': '../recipes/helmet',
    'recipes/rate-limiting': '../recipes/rate-limiting',
    'recipes/cors': '../recipes/cors',
    'recipes/mvc': '../recipes/mvc',
    
    // GraphQL 相关
    'graphql/quick-start': '../graphql/quick-start',
    'graphql/resolvers-map': '../graphql/resolvers-map',
    'graphql/mapped-types': '../graphql/mapped-types',
    
    // Microservices 相关
    'microservices/basics': '../microservices/basics',
    'microservices/custom-transport': '../microservices/custom-transport',
    'microservices/redis': '../microservices/redis',
    'microservices/nats': '../microservices/nats',
    'microservices/rabbitmq': '../microservices/rabbitmq',
    'microservices/kafka': '../microservices/kafka',
    'microservices/mqtt': '../microservices/mqtt',
    
    // WebSockets 相关
    'websockets/gateways': '../websockets/gateways',
    'websockets/guards': '../websockets/guards',
    'websockets/pipes': '../websockets/pipes',
    'websockets/interceptors': '../websockets/interceptors',
    'websockets/exception-filters': '../websockets/exception-filters',
    'websockets/adapter': '../websockets/adapter',
    
    // OpenAPI 相关
    'openapi/introduction': '../openapi/introduction',
    'openapi/mapped-types': '../openapi/mapped-types',
    'openapi/decorators': '../openapi/decorators',
    'openapi/operations': '../openapi/operations',
    'openapi/cli-plugin': '../openapi/cli-plugin',
    
    // FAQ 相关
    'faq/errors': '../faq/errors',
    'faq/global-prefix': '../faq/global-prefix',
    'faq/http-adapter': '../faq/http-adapter',
    
    // 其他
    'standalone-applications': '../standalone-applications',
    'support': '../support/index',
    'migration-guide': '../migration-guide'
  };
  
  // 首先检查精确映射
  if (pathMappings[cleanPath]) {
    const mappedPath = pathMappings[cleanPath] + anchorPart;
    if (checkFileExists(pathMappings[cleanPath], currentFileDir)) {
      return mappedPath;
    }
  }
  
  // 尝试基于目录结构的智能映射
  const segments = cleanPath.split('/');
  
  if (segments.length === 1) {
    // 单个段，尝试不同目录
    const possiblePaths = [
      `../overview/${segments[0]}`,
      `../fundamentals/${segments[0]}`,
      `../techniques/${segments[0]}`,
      `../${segments[0]}`
    ];
    
    for (const possiblePath of possiblePaths) {
      if (checkFileExists(possiblePath, currentFileDir)) {
        return possiblePath + anchorPart;
      }
    }
  } else if (segments.length === 2) {
    // 两个段，通常是 category/page
    const relativePath = `../${segments[0]}/${segments[1]}`;
    if (checkFileExists(relativePath, currentFileDir)) {
      return relativePath + anchorPart;
    }
  }
  
  // 如果在同一目录，使用相对路径
  if (segments.length === 1) {
    const sameDirPath = `./${segments[0]}`;
    if (checkFileExists(sameDirPath, currentFileDir)) {
      return sameDirPath + anchorPart;
    }
  }
  
  // 如果找不到映射，返回 null 表示保留原链接
  return null;
}

// 处理单个文件
function processFile(filePath) {
  const fileName = basename(filePath);
  
  // 跳过忽略的文件
  if (IGNORED_FILES.includes(fileName)) {
    console.log(`⏭️  跳过文件: ${filePath} (根据规则忽略)`);
    return;
  }
  
  let content = readFileSync(filePath, 'utf8');
  let changed = false;
  const currentFileDir = dirname(filePath);
  
  // 替换 https://docs.nestjs.com/xxx 和 https://docs.nestjs.cn/xxx 格式的链接
  content = content.replace(/https:\/\/docs\.nestjs\.c[no]m([^\)\]\s"']*)/g, (match, urlPath) => {
    // 跳过图片和资源文件
    if (urlPath.match(/\\.(png|jpg|jpeg|gif|svg|ico)$/i) || urlPath.includes('/assets/')) {
      return match;
    }
    
    // 尝试转换为本地路径
    const localPath = urlPathToLocalPath(urlPath, currentFileDir);
    
    if (localPath) {
      changed = true;
      console.log(`  ✅ ${urlPath} → ${localPath}`);
      return localPath;
    } else {
      console.log(`  ⚠️  无法映射: ${urlPath} (保留原链接)`);
      return match;
    }
  });
  
  if (changed) {
    writeFileSync(filePath, content, 'utf8');
    console.log(`📝 已更新: ${relative(DOCS_DIR, filePath)}`);
  }
}

// 递归处理目录
function processDirectory(dirPath) {
  const files = readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = join(dirPath, file);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.md')) {
      processFile(fullPath);
    }
  });
}

// 主函数
function main() {
  console.log('🚀 开始智能链接替换...');
  console.log(`📁 处理目录: ${DOCS_DIR}`);
  console.log(`🚫 忽略文件: ${IGNORED_FILES.join(', ')}`);
  console.log('');
  
  if (!existsSync(DOCS_DIR)) {
    console.error(`❌ 目录不存在: ${DOCS_DIR}`);
    process.exit(1);
  }
  
  try {
    processDirectory(DOCS_DIR);
    console.log('');
    console.log('✅ 链接替换完成！');
    console.log('💡 提示: 请检查输出中的警告，手动验证无法自动映射的链接');
  } catch (error) {
    console.error('❌ 处理过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 运行主函数
main();

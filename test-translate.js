#!/usr/bin/env node

const DocumentTranslator = require('./scripts/translate-docs.js');
const fs = require('fs');
const path = require('path');

// 创建测试文件
const testContentDir = 'test-content';
const testDocsDir = 'test-docs';

// 确保测试目录存在
if (!fs.existsSync(testContentDir)) {
  fs.mkdirSync(testContentDir, { recursive: true });
}

// 创建测试文档
const testContent = `# Introduction

NestJS is a framework for building efficient, scalable Node.js server-side applications. It uses modern JavaScript, is built with TypeScript (preserves compatibility with pure JavaScript), and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).

Under the hood, Nest makes use of robust HTTP Server frameworks like Express (the default) and optionally can be configured to use Fastify as well!

## Installation

To get started, you can either scaffold the project with the Nest CLI, or clone a starter project (both will produce the same outcome).

\`\`\`bash
@@filename(shell)
$ npm i -g @nestjs/cli
$ nest new project-name
@@switch
$ yarn global add @nestjs/cli
$ nest new project-name
\`\`\`

## First steps

In this set of articles, you'll learn the **core fundamentals** of Nest. To get familiar with the essential building blocks of Nest applications, we'll build a basic CRUD application with features that cover a lot of ground at an introductory level.

### Controllers

Controllers are responsible for handling incoming **requests** and returning **responses** to the client.

\`\`\`typescript
@@filename(cats.controller.ts)
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
@@switch
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll() {
    return 'This action returns all cats';
  }
}
\`\`\`

The \`@Controller()\` decorator is required to define a basic controller. We specify an optional route path prefix of \`cats\`. Using a path prefix in a \`@Controller()\` decorator allows us to easily group a set of related routes, and minimize repetitive code.
`;

fs.writeFileSync(path.join(testContentDir, 'test-intro.md'), testContent, 'utf8');

// 测试翻译功能
async function testTranslation() {
  console.log('🧪 Testing translation functionality...\n');

  // 测试不同配置
  const testConfigs = [
    {
      name: '仅格式处理 (无 AI)',
      options: { 
        contentDir: testContentDir, 
        docsDir: testDocsDir + '-no-ai',
        useAI: false,
        verbose: true 
      }
    },
    {
      name: 'OpenAI 翻译 (模拟)',
      options: { 
        contentDir: testContentDir, 
        docsDir: testDocsDir + '-openai',
        useAI: true,
        aiProvider: 'openai',
        apiKey: 'test-key',
        verbose: true 
      }
    }
  ];

  for (const config of testConfigs) {
    console.log(`\n📋 测试配置: ${config.name}`);
    console.log('='.repeat(50));
    
    try {
      const translator = new DocumentTranslator(config.options);
      await translator.run();
      
      // 检查输出文件
      const outputFile = path.join(config.options.docsDir, 'test-intro.md');
      if (fs.existsSync(outputFile)) {
        const output = fs.readFileSync(outputFile, 'utf8');
        console.log(`\n📄 输出文件预览 (前 500 字符):`);
        console.log('-'.repeat(50));
        console.log(output.substring(0, 500) + '...');
        console.log('-'.repeat(50));
      }
    } catch (error) {
      console.error(`❌ 测试失败: ${error.message}`);
    }
  }

  // 清理测试文件
  console.log('\n🧹 清理测试文件...');
  try {
    fs.rmSync(testContentDir, { recursive: true, force: true });
    fs.rmSync(testDocsDir + '-no-ai', { recursive: true, force: true });
    fs.rmSync(testDocsDir + '-openai', { recursive: true, force: true });
    console.log('✅ 清理完成');
  } catch (error) {
    console.warn('⚠️ 清理失败:', error.message);
  }
}

// 运行测试
testTranslation().catch(console.error);

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * AI 翻译配置助手
 * 帮助用户快速配置 AI 翻译功能
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return colors[color] + text + colors.reset;
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupAITranslation() {
  console.log(colorize('\n🤖 NestJS 中文文档 AI 翻译配置助手', 'cyan'));
  console.log(colorize('='.repeat(50), 'blue'));
  
  console.log('\n此助手将帮助您配置 AI 翻译功能。');
  console.log('您可以选择 OpenAI、Anthropic Claude 或本地 API。\n');
  
  const config = {};
  
  // 1. 询问是否启用 AI 翻译
  const useAI = await question(colorize('是否启用 AI 翻译？(y/n) [y]: ', 'yellow'));
  config.USE_AI_TRANSLATION = (useAI.toLowerCase() || 'y') === 'y' ? 'true' : 'false';
  
  if (config.USE_AI_TRANSLATION === 'false') {
    console.log(colorize('\n✅ 已配置为仅格式处理模式（不使用 AI 翻译）', 'green'));
  } else {
    // 2. 选择 AI 提供商
    console.log(colorize('\n请选择 AI 提供商：', 'yellow'));
    console.log('1. OpenAI (ChatGPT)');
    console.log('2. Anthropic (Claude)');
    console.log('3. 本地 API');
    
    const providerChoice = await question(colorize('请输入选项 (1/2/3) [1]: ', 'yellow'));
    
    switch (providerChoice || '1') {
      case '1':
        config.AI_PROVIDER = 'openai';
        await setupOpenAI(config);
        break;
      case '2':
        config.AI_PROVIDER = 'anthropic';
        await setupAnthropic(config);
        break;
      case '3':
        config.AI_PROVIDER = 'local';
        await setupLocalAPI(config);
        break;
      default:
        config.AI_PROVIDER = 'openai';
        await setupOpenAI(config);
    }
  }
  
  // 3. 生成配置文件
  await generateConfigFile(config);
  
  // 4. 显示使用说明
  showUsageInstructions(config);
  
  rl.close();
}

async function setupOpenAI(config) {
  console.log(colorize('\n🔧 配置 OpenAI', 'cyan'));
  
  const apiKey = await question(colorize('请输入 OpenAI API 密钥: ', 'yellow'));
  if (!apiKey) {
    console.log(colorize('⚠️ 未输入 API 密钥，请稍后手动配置', 'yellow'));
  } else {
    config.OPENAI_API_KEY = apiKey;
  }
  
  console.log(colorize('\n可用的 OpenAI 模型：', 'blue'));
  console.log('1. gpt-3.5-turbo (推荐，成本低)');
  console.log('2. gpt-4 (质量高，成本高)');
  console.log('3. gpt-4-turbo (平衡选择)');
  console.log('4. 自定义模型');
  
  const modelChoice = await question(colorize('请选择模型 (1/2/3/4) [1]: ', 'yellow'));
  
  switch (modelChoice || '1') {
    case '1':
      config.AI_MODEL = 'gpt-3.5-turbo';
      break;
    case '2':
      config.AI_MODEL = 'gpt-4';
      break;
    case '3':
      config.AI_MODEL = 'gpt-4-turbo';
      break;
    case '4':
      const customModel = await question(colorize('请输入自定义模型名称: ', 'yellow'));
      config.AI_MODEL = customModel || 'gpt-3.5-turbo';
      break;
    default:
      config.AI_MODEL = 'gpt-3.5-turbo';
  }
}

async function setupAnthropic(config) {
  console.log(colorize('\n🔧 配置 Anthropic Claude', 'cyan'));
  
  const apiKey = await question(colorize('请输入 Anthropic API 密钥: ', 'yellow'));
  if (!apiKey) {
    console.log(colorize('⚠️ 未输入 API 密钥，请稍后手动配置', 'yellow'));
  } else {
    config.ANTHROPIC_API_KEY = apiKey;
  }
  
  console.log(colorize('\n可用的 Claude 模型：', 'blue'));
  console.log('1. claude-3-haiku-20240307 (推荐，速度快)');
  console.log('2. claude-3-sonnet-20240229 (平衡选择)');
  console.log('3. claude-3-opus-20240229 (质量最高)');
  console.log('4. 自定义模型');
  
  const modelChoice = await question(colorize('请选择模型 (1/2/3/4) [1]: ', 'yellow'));
  
  switch (modelChoice || '1') {
    case '1':
      config.AI_MODEL = 'claude-3-haiku-20240307';
      break;
    case '2':
      config.AI_MODEL = 'claude-3-sonnet-20240229';
      break;
    case '3':
      config.AI_MODEL = 'claude-3-opus-20240229';
      break;
    case '4':
      const customModel = await question(colorize('请输入自定义模型名称: ', 'yellow'));
      config.AI_MODEL = customModel || 'claude-3-haiku-20240307';
      break;
    default:
      config.AI_MODEL = 'claude-3-haiku-20240307';
  }
}

async function setupLocalAPI(config) {
  console.log(colorize('\n🔧 配置本地 API', 'cyan'));
  
  const apiUrl = await question(colorize('请输入本地 API URL: ', 'yellow'));
  if (!apiUrl) {
    console.log(colorize('⚠️ 未输入 API URL，请稍后手动配置', 'yellow'));
  } else {
    config.AI_API_URL = apiUrl;
  }
  
  const apiKey = await question(colorize('请输入 API 密钥 (可选): ', 'yellow'));
  if (apiKey) {
    config.AI_API_KEY = apiKey;
  }
}

async function generateConfigFile(config) {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  let envContent = '';
  
  // 添加注释头
  envContent += '# NestJS 中文文档 AI 翻译配置\n';
  envContent += `# 生成时间: ${new Date().toISOString()}\n`;
  envContent += '# 由配置助手自动生成\n\n';
  
  // 添加配置项
  for (const [key, value] of Object.entries(config)) {
    envContent += `${key}=${value}\n`;
  }
  
  // 检查是否已存在 .env 文件
  if (fs.existsSync(envPath)) {
    const overwrite = await question(colorize('\n.env 文件已存在，是否覆盖？(y/n) [n]: ', 'yellow'));
    if ((overwrite.toLowerCase() || 'n') !== 'y') {
      console.log(colorize('\n配置已生成，但未覆盖现有文件。', 'blue'));
      console.log(colorize('\n生成的配置内容：', 'blue'));
      console.log(colorize('-'.repeat(30), 'blue'));
      console.log(envContent);
      console.log(colorize('-'.repeat(30), 'blue'));
      return;
    }
  }
  
  try {
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(colorize('\n✅ 配置文件已生成: .env', 'green'));
  } catch (error) {
    console.log(colorize(`\n❌ 生成配置文件失败: ${error.message}`, 'red'));
    console.log(colorize('\n生成的配置内容：', 'blue'));
    console.log(colorize('-'.repeat(30), 'blue'));
    console.log(envContent);
    console.log(colorize('-'.repeat(30), 'blue'));
  }
}

function showUsageInstructions(config) {
  console.log(colorize('\n🚀 使用说明', 'cyan'));
  console.log(colorize('='.repeat(30), 'blue'));
  
  if (config.USE_AI_TRANSLATION === 'false') {
    console.log('\n📝 您已配置为仅格式处理模式');
    console.log('运行命令: ' + colorize('npm run translate-docs:no-ai', 'green'));
  } else {
    console.log('\n🤖 您已配置 AI 翻译功能');
    console.log('运行命令: ' + colorize('npm run translate-docs', 'green'));
    console.log('详细输出: ' + colorize('npm run translate-docs:verbose', 'green'));
  }
  
  console.log('\n🔧 其他有用命令:');
  console.log('- 测试翻译: ' + colorize('npm run test-translate', 'green'));
  console.log('- 完整流程: ' + colorize('npm run sync-and-translate', 'green'));
  console.log('- 修复格式: ' + colorize('npm run fix-all', 'green'));
  
  console.log('\n📚 更多信息:');
  console.log('- 查看脚本文档: ' + colorize('scripts/README.md', 'blue'));
  console.log('- 查看配置示例: ' + colorize('.env.example', 'blue'));
  
  if (config.AI_PROVIDER === 'openai' && !config.OPENAI_API_KEY) {
    console.log('\n⚠️ ' + colorize('请记得设置 OPENAI_API_KEY 环境变量', 'yellow'));
    console.log('获取地址: https://platform.openai.com/api-keys');
  }
  
  if (config.AI_PROVIDER === 'anthropic' && !config.ANTHROPIC_API_KEY) {
    console.log('\n⚠️ ' + colorize('请记得设置 ANTHROPIC_API_KEY 环境变量', 'yellow'));
    console.log('获取地址: https://console.anthropic.com/');
  }
  
  console.log(colorize('\n🎉 配置完成！', 'green'));
}

// 运行配置助手
if (require.main === module) {
  setupAITranslation().catch(error => {
    console.error(colorize('\n❌ 配置失败:', 'red'), error.message);
    process.exit(1);
  });
}

module.exports = { setupAITranslation };

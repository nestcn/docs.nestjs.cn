/**
 * 测试 ES 模块导入公共锚点映射配置
 */

// 导入 ES 模块方式
import { anchorMappings, pathMappings } from '../config/anchor-mappings.js';

console.log('🧪 测试 ES 模块导入公共锚点映射配置...\n');

// 测试锚点映射
console.log('📋 ES 模块锚点映射统计:');
console.log(`   - 总计: ${Object.keys(anchorMappings).length} 个映射`);
console.log(`   - 示例: "${Object.keys(anchorMappings)[0]}" → "${anchorMappings[Object.keys(anchorMappings)[0]]}"`);

// 测试路径映射
console.log('\n🗂️  ES 模块路径映射统计:');
console.log(`   - 总计: ${Object.keys(pathMappings).length} 个映射`);
console.log(`   - 示例: "${Object.keys(pathMappings)[0]}" → "${pathMappings[Object.keys(pathMappings)[0]]}"`);

console.log('\n✅ ES 模块配置测试完成！');

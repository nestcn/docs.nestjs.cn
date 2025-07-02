/**
 * 测试公共锚点映射配置
 */

// 导入 CommonJS 方式
const { anchorMappings, pathMappings } = require('../config/anchor-mappings.js');

console.log('🧪 测试公共锚点映射配置...\n');

// 测试锚点映射
console.log('📋 锚点映射统计:');
console.log(`   - 总计: ${Object.keys(anchorMappings).length} 个映射`);
console.log(`   - 示例: "${Object.keys(anchorMappings)[0]}" → "${anchorMappings[Object.keys(anchorMappings)[0]]}"`);

// 测试路径映射
console.log('\n🗂️  路径映射统计:');
console.log(`   - 总计: ${Object.keys(pathMappings).length} 个映射`);
console.log(`   - 示例: "${Object.keys(pathMappings)[0]}" → "${pathMappings[Object.keys(pathMappings)[0]]}"`);

// 测试一些常见映射
console.log('\n🔍 测试常见映射:');
const testCases = [
  'library-specific-approach',
  'binding-guards',
  'dependency-injection',
  'provider-scope',
  'installation'
];

testCases.forEach(anchor => {
  const mapped = anchorMappings[anchor];
  if (mapped) {
    console.log(`   ✅ "${anchor}" → "${mapped}"`);
  } else {
    console.log(`   ❌ "${anchor}" 未找到映射`);
  }
});

console.log('\n✅ 配置测试完成！');

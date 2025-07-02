# 公共锚点映射配置

## 概述

为了提高维护性和一致性，我们将锚点映射配置抽离为公共配置文件，供多个脚本复用。

## 配置文件

### `config/anchor-mappings.js`

这是公共的锚点和路径映射配置文件，包含：

- **锚点映射 (anchorMappings)**: 364个英文锚点到中文锚点的映射
- **路径映射 (pathMappings)**: 7个路径重定向映射

文件同时支持 CommonJS 和 ES 模块导入方式。

## 使用方式

### CommonJS 导入

```javascript
const { anchorMappings, pathMappings } = require('../config/anchor-mappings.js');
```

### ES 模块导入

```javascript
import { anchorMappings, pathMappings } from '../config/anchor-mappings.js';
```

## 相关脚本

### 1. `scripts/fix-anchor-links.js`

批量修正文档中的锚点链接，主要处理因翻译导致的内部锚点链接失效问题。

**运行方式**:
```bash
bun scripts/fix-anchor-links.js
```

**功能**:
- 修正绝对路径的锚点链接: `](/xxx#anchor)` → `](../xxx#中文锚点)`
- 修正相对路径的锚点链接: `](../xxx#anchor)` → `](../xxx#中文锚点)`
- 修正当前目录的锚点链接: `](./xxx#anchor)` → `](./xxx#中文锚点)`
- 支持多种路径格式的智能识别

### 2. `scripts/replace-links.mjs`

智能替换外部链接为内部相对路径，并同时处理锚点映射。

**运行方式**:
```bash
bun scripts/replace-links.mjs
```

**功能**:
- 替换 `https://docs.nestjs.com/xxx` 格式的链接为相对路径
- 替换 `https://docs.nestjs.cn/xxx` 格式的链接为相对路径
- 自动修正链接中的英文锚点为中文锚点
- 智能路径推断和文件存在性检查
- 跳过图片和资源文件

### 3. `scripts/validate-links.mjs`

验证链接处理情况并生成详细报告，使用公共配置进行验证。

**运行方式**:
```bash
bun scripts/validate-links.mjs
```

**功能**:
- 扫描并分析所有文档中的链接
- 统计链接处理成功率
- 分类展示剩余的外部链接（资源、示例、忽略文件等）
- 验证锚点映射的使用情况
- 生成详细的处理报告

## 配置维护

### 添加新的锚点映射

在 `config/anchor-mappings.js` 的 `anchorMappings` 对象中添加新映射：

```javascript
const anchorMappings = {
  // ...existing mappings...
  'new-english-anchor': '新的中文锚点',
};
```

### 添加新的路径映射

在 `config/anchor-mappings.js` 的 `pathMappings` 对象中添加新映射：

```javascript
const pathMappings = {
  // ...existing mappings...
  '/old-path': '/new-path',
};
```

## 测试

### 配置测试脚本

- `scripts/test-config.js` - 测试 CommonJS 导入
- `scripts/test-config-esm.mjs` - 测试 ES 模块导入

运行测试：
```bash
bun scripts/test-config.js
bun scripts/test-config-esm.mjs
```

## 优势

1. **统一管理**: 所有锚点映射都在一个文件中，便于维护
2. **避免重复**: 多个脚本可以复用相同的映射配置
3. **易于扩展**: 新增映射只需修改一个文件
4. **兼容性强**: 同时支持 CommonJS 和 ES 模块
5. **类型安全**: 配置结构清晰，减少错误

## 注意事项

1. 修改配置后需要重新运行相关脚本
2. 新增锚点映射时要确保映射的准确性
3. 路径映射需要确保目标路径的真实存在
4. 建议在修改配置前运行测试脚本验证

## 统计信息

- 锚点映射: 364个
- 路径映射: 7个
- 支持的脚本: 3个
- 导入方式: 2种 (CommonJS + ES模块)

# 链接处理脚本说明

这个文档描述了用于处理 NestJS 中文文档链接的核心脚本。

## 🗂️ 核心脚本文件

```
scripts/
├── fix-anchor-links.js        # 锚点链接修正工具 ⭐
├── replace-links.mjs          # 智能链接替换工具 ⭐
├── validate-links.mjs         # 链接验证工具 ⭐
└── SCRIPTS_CORE.md           # 本说明文档
```

## 📋 公共配置

所有脚本都使用 `config/anchor-mappings.js` 的统一配置：

- **364个锚点映射**: 英文锚点 → 中文锚点
- **7个路径映射**: 旧路径 → 新路径  
- **兼容性**: 支持 CommonJS 和 ES 模块导入

## 🔧 脚本详情

### 1. fix-anchor-links.js ⚡
**用途**: 批量修正文档中的锚点链接

**运行**: `bun scripts/fix-anchor-links.js`

**功能**:
- 修正绝对路径锚点: `](/xxx#anchor)` → `](../xxx#中文锚点)`
- 修正相对路径锚点: `](../xxx#anchor)` → `](../xxx#中文锚点)`
- 修正当前目录锚点: `](./xxx#anchor)` → `](./xxx#中文锚点)`
- 智能识别多种路径格式

### 2. replace-links.mjs 🔄
**用途**: 智能替换外部链接为内部相对路径

**运行**: `bun scripts/replace-links.mjs`

**功能**:
- 替换 `https://docs.nestjs.com/xxx` 为相对路径
- 替换 `https://docs.nestjs.cn/xxx` 为相对路径
- 同时处理锚点映射
- 智能路径推断
- 跳过图片和资源文件

### 3. validate-links.mjs 📊
**用途**: 验证链接处理情况并生成报告

**运行**: `bun scripts/validate-links.mjs`

**功能**:
- 分析所有文档中的链接
- 统计处理成功率 (当前: 98.0%)
- 分类剩余外部链接
- 检测未映射锚点
- 生成详细报告

## 🚀 标准使用流程

```bash
# 1. 替换外部链接
bun scripts/replace-links.mjs

# 2. 修正锚点链接  
bun scripts/fix-anchor-links.js

# 3. 验证处理结果
bun scripts/validate-links.mjs
```

## 📊 当前处理状态

- **文件总数**: 152个
- **处理文件**: 136个
- **忽略文件**: 16个
- **成功率**: 98.0%
- **剩余外部链接**: 3个 (示例代码)

## 🎯 优势特点

✅ **统一配置**: 所有脚本使用公共映射配置  
✅ **避免重复**: 消除了多个重复脚本  
✅ **易于维护**: 配置集中管理  
✅ **兼容性强**: 支持多种模块系统  
✅ **智能处理**: 自动识别链接类型  
✅ **详细报告**: 提供完整的处理分析

## ⚠️ 重要提醒

- 修改配置后需重新运行脚本
- 忽略文件中的链接会保持原样
- 示例代码链接按规则不会被处理
- 定期验证确保链接质量

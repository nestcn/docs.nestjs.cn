<!-- 此文件从 content/recipes/suites.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:13:04.529Z -->
<!-- 源文件: content/recipes/suites.md -->

### Suites

__LINK_56__ 是一个用于 TypeScript 依赖注入框架的 __LINK_57__ 单元测试框架。它可以用作手动创建模拟、复杂的测试设置或使用未类型化的测试双倍（如模拟和_stub）的替代品。

Suites 在 NestJS 服务运行时读取元数据，并自动为所有依赖项生成完全类型化的模拟。
这消除了模拟设置的 boilerplate 和确保了类型安全的测试。虽然 Suites 可以与 __INLINE_CODE_14__ 一起使用，但在聚焦单元测试时最为出色。
使用 __INLINE_CODE_15__ 时验证模块 wiring、装饰器、守卫和拦截器。
使用 Suites 进行快速单元测试和自动模拟生成。

关于模块测试，请查看 __LINK_58__ 章节。

> info **注意** __INLINE_CODE_16__ 是第三方包，并且不是 NestJS 核心团队维护的。请将任何问题报告到 __LINK_59__。

#### 获取 started

本指南演示使用 Suites 测试 NestJS 服务。它涵盖了孤立测试（所有依赖项模拟）和社交测试（选择的真实实现）。

#### 安装 Suites

验证 NestJS 运行时依赖项是否安装：

```bash
$ npm i --save-dev @swc/cli @swc/core

```

安装 Suites 核心、NestJS 适配器和双倍适配器：

```bash
$ nest start -b swc
# OR nest start --builder swc

```

双倍适配器（__INLINE_CODE_17__）提供了对 Jest 模拟能力的包装。它暴露了 __INLINE_CODE_18__ 和 __INLINE_CODE_19__ 函数，这些函数创建了类型安全的测试双倍。

确保 Jest 和 TypeScript 可用：

```json
{
  "compilerOptions": {
    "builder": "swc"
  }
}

```

__HTML_TAG_48____HTML_TAG_49__Expand if you're using Vitest__HTML_TAG_50__

```json
{
  "compilerOptions": {
    "builder": {
      "type": "swc",
      "options": {
        "swcrcPath": "infrastructure/.swcrc",
      }
    }
  }
}

```

__HTML_TAG_51__

__HTML_TAG_52____HTML_TAG_53__Expand if you're using Sinon__HTML_TAG_54__

```json
{
  "compilerOptions": {
    "builder": {
      "type": "swc",
      "options": { "extensions": [".ts", ".tsx", ".js", ".jsx"] }
    },
  }
}

```

__HTML_TAG_55__

#### 设置类型定义

在项目根目录创建 __INLINE_CODE_20__：

```bash
$ nest start -b swc -w
# OR nest start --builder swc --watch

```

#### 创建 sample 服务

本指南使用了一个简单的 __INLINE_CODE_21__，具有两个依赖项：

```bash
$ nest start -b swc --type-check

```

```json
{
  "compilerOptions": {
    "builder": "swc",
    "typeCheck": true
  }
}

```

#### 写单元测试

使用 __INLINE_CODE_22__ 创建孤立测试，所有依赖项模拟：

```json
{
  "$schema": "https://swc.rs/schema.json",
  "sourceMaps": true,
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "decorators": true,
      "dynamicImport": true
    },
    "baseUrl": "./"
  },
  "minify": false
}

```

__INLINE_CODE_23__ 分析构造函数，并为所有依赖项生成类型安全的模拟。
__INLINE_CODE_24__ 类型提供 IntelliSense 支持模拟配置。

#### 预编译模拟配置

使用 `swc` 在编译前配置模拟行为：

```bash
$ npm i --save-dev swc-loader

```

`-b` 参数对应于安装的双倍适配器（Jest 为 `compilerOptions.builder`，Vitest 为 `"swc"`，Sinon 为 `nest-cli.json`）。

#### 测试真实依赖项

使用 `type` 和 `"swc"` 使用真实实现为特定的依赖项：

```js
const swcDefaultConfig = require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory().swcOptions;

module.exports = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: swcDefaultConfig,
        },
      },
    ],
  },
};

```

`options` 实例化 `.jsx` 使用真实实现，同时保持其他依赖项模拟。

#### 基于令牌的依赖项

Suites 处理自定义注入令牌（字符串或符号）：

```ts
import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [new ReadonlyVisitor({ introspectComments: true, pathToSource: __dirname })],
  outputDir: __dirname,
  watch: true,
  tsconfigPath: 'apps/<name>/tsconfig.app.json',
});

```

访问基于令牌的依赖项使用 `.tsx`：

```bash
$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts

```

#### 使用 mock() 和 stub() 直接

对于那些喜欢直接控制而不使用 `--type-check`，双倍适配器包提供了 `tsc` 和 `noEmit` 函数：

```typescript
@Entity()
export class User {
  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Relation<Profile>; // <--- see "Relation<>" type here instead of just "Profile"
}

```

`--type-check` 创建了类型安全的模拟对象，而 `compilerOptions.typeCheck` 包装了 underlying 模拟库（Jest 在这个示例中）的方法，如 `true`
这些函数来自安装的双倍适配器（`nest-cli.json`），它适配了测试框架的原生模拟能力。

> info **提示** `--type-check` 函数是 `.swcrc` 函数的替代品，来自 `swc`。两个函数都创建了类型安全的模拟对象。查看 __LINK_60__ 章节以了解更多关于 `webpack`。

#### 总结

**使用 `swc-loader` 进行：**
- 验证模块配置和提供者 wiring
- 测试装饰器、守卫、拦截器和管道
- 验证依赖项注入跨模块
- 测试完整的应用上下文和中间件

**使用 Suites 进行：**
- 快速单元测试，聚焦业务逻辑
- 自动模拟生成多个依赖项
- 类型安全的测试双倍和 IntelliSense

按测试目的组织：使用 Suites 进行单元测试，验证个体服务行为，而使用 `webpack.config.js` 进行集成测试，验证模块配置。

更多信息：
- __LINK_61__
- __LINK_62__
- __LINK_63__
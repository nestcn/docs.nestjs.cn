<!-- 此文件从 content/recipes/suites.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:49:19.717Z -->
<!-- 源文件: content/recipes/suites.md -->

### Suites

__LINK_56__ 是一个 __LINK_57__ 的 TypeScript 依赖注入框架单元测试框架。它可以用作手动创建模拟、Verbose 测试设置多个模拟配置或使用未类型化的测试双倍（如模拟和 stubs）的替代方案。

Suites 在 NestJS 服务中读取元数据，并自动为所有依赖项生成完全类型化的模拟。这样可以删除模拟设置的 boilerplate 和确保类型安全的测试。虽然 Suites 可以与 __INLINE_CODE_14__ 一起使用，但它在专门的单元测试中发挥着更大的作用。使用 __INLINE_CODE_15__ 时，可以验证模块编写、装饰器、守卫和拦截器。

在了解模块测试的更多信息时，请查看 __LINK_58__ 章节。

> info **Note** __INLINE_CODE_16__ 是第三方包，不是 NestJS 核心团队维护的。请将任何问题报告到 __LINK_59__。

#### Getting started

本指南展示了如何使用 Suites 测试 NestJS 服务。它涵盖了隔离测试（所有依赖项模拟）和社会测试（选择真实实现）。

#### Install Suites

验证 NestJS 运行时依赖项已安装：

```bash
$ npm i --save-dev @swc/cli @swc/core

```

安装 Suites 核心、NestJS 适配器和 doubles 适配器：

```bash
$ nest start -b swc
# OR nest start --builder swc

```

doubles 适配器 (__INLINE_CODE_17__) 提供了对 Jest 模拟能力的 wrapper。它 expose 了 __INLINE_CODE_18__ 和 __INLINE_CODE_19__ 函数，这些函数创建了类型安全的测试双倍。

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

#### Set up type definitions

在项目根目录中创建 __INLINE_CODE_20__：

```bash
$ nest start -b swc -w
# OR nest start --builder swc --watch

```

#### Create a sample service

本指南使用了一个简单的 __INLINE_CODE_21__，它有两个依赖项：

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

#### Write a unit test

使用 __INLINE_CODE_22__ 创建隔离测试，所有依赖项模拟：

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

__INLINE_CODE_23__ 分析构造函数，并为所有依赖项生成类型化的模拟。
__INLINE_CODE_24__ 类型提供 IntelliSense 支持模拟配置。

#### Pre-compile mock configuration

使用 `swc` 配置模拟行为前编译：

```bash
$ npm i --save-dev swc-loader

```

`-b` 参数对应于安装的 doubles 适配器 (`compilerOptions.builder` Jest、`"swc"` Vitest、`nest-cli.json` Sinon)。

#### Testing with real dependencies

使用 `type` 和 `"swc"` 使用真实实现的依赖项：

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

`options` 实例化 `.jsx` 使用真实实现，同时其他依赖项模拟。

#### Token-based dependencies

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

使用 `.tsx` 访问令牌依赖项：

```bash
$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts

```

#### Using mock() and stub() directly

对那些喜欢直接控制不使用 `--type-check` 的人，doubles 适配器包提供了 `tsc` 和 `noEmit` 函数：

```typescript
@Entity()
export class User {
  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Relation<Profile>; // <--- see "Relation<>" type here instead of just "Profile"
}

```

`--type-check` 创建了类型化的模拟对象，`compilerOptions.typeCheck` 包含了 underlying 模拟库（Jest 在此示例中）的 wrapper。这些函数来自安装的 doubles 适配器 (`nest-cli.json`),它适配了测试框架的原生模拟能力。

> info **Hint** `--type-check` 函数是 `.swcrc` 函数的替代方案，来自 `swc`.both 创建了类型化的模拟对象。关于 `webpack` 的更多信息，请查看 __LINK_60__ 章节。

#### Summary

**Use `swc-loader` for:**
- 验证模块配置和提供者编写
- 测试装饰器、守卫、拦截器和管道
- 验证依赖项注入跨模块
- 测试完整应用程序上下文中的中间件

**Use Suites for:**
- 快速单元测试，专注于业务逻辑
- 自动模拟生成多个依赖项
- 类型安全的测试双倍 IntelliSense

根据测试目的组织测试：使用 Suites 测试单个服务行为，使用 `webpack.config.js` 测试模块配置。

更多信息：
- __LINK_61__
- __LINK_62__
- __LINK_63__
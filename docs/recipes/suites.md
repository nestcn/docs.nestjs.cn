<!-- 此文件从 content/recipes/suites.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:30:26.781Z -->
<!-- 源文件: content/recipes/suites.md -->

### Suites

__LINK_56__ 是一个用于 TypeScript 依赖注入框架的单元测试框架。它可以用作手动创建 mock、verbose 测试设置、或使用未typed 测试 doubles（如 mocks 和 stubs）的替代方案。

Suites 可以从 nestjs 服务中读取元数据，并自动生成类型安全的 mocks，以便删除 boilerplate mock 设置和确保类型安全的测试。虽然 Suites 可以与 __INLINE_CODE_14__ 一起使用，但在专注于单元测试时它更 excels。

使用 __INLINE_CODE_15__ 来验证模块绑定、装饰器、守卫和拦截器。使用 Suites 进行快速单元测试，以便自动生成 mocks。

关于模块基于测试，请查看 __LINK_58__ 章节。

> info **注意** __INLINE_CODE_16__ 是第三方包，不是 NestJS 核心团队维护的。请将任何问题报告到 __LINK_59__。

#### Getting started

本指南展示了使用 Suites 测试 NestJS 服务。它涵盖了孤立测试（所有依赖项mock）和社交测试（选定的真实实现）。

#### 安装 Suites

验证 NestJS 运行时依赖项是否安装：

```bash
$ npm i --save-dev @swc/cli @swc/core

```

安装 Suites 核心、NestJS 适配器和双胞胎适配器：

```bash
$ nest start -b swc
# OR nest start --builder swc

```

双胞胎适配器（__INLINE_CODE_17__）提供了 Jest 的 mocking 能力。它暴露了 __INLINE_CODE_18__ 和 __INLINE_CODE_19__ 函数，以创建类型安全的测试 doubles。

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

#### 创建示例服务

本指南使用了一个简单的 __INLINE_CODE_21__，有两个依赖项：

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

#### 编写单元测试

使用 __INLINE_CODE_22__ 创建孤立测试，所有依赖项mock：

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

__INLINE_CODE_23__ 分析构造函数，并创建了类型安全的 mocks，以便删除 boilerplate mock 设置和确保类型安全的测试。

#### 预编译 mock 配置

在编译前使用 `swc` 配置 mock 行为：

```bash
$ npm i --save-dev swc-loader

```

`-b` 参数对应于安装的双胞胎适配器（`compilerOptions.builder` Jest、`"swc"` Vitest、`nest-cli.json` Sinon）。

#### 使用真实依赖项

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

`options` 实例化 `.jsx`，使用其真实实现，同时其他依赖项mock。

####  token-based 依赖项

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

访问 token-based 依赖项使用 `.tsx`：

```bash
$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts

```

#### 使用 mock() 和 stub() 直接

对于那些prefer直接控制而不是使用 `--type-check`，双胞胎适配器包提供了 `tsc` 和 `noEmit` 函数：

```typescript
@Entity()
export class User {
  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Relation<Profile>; // <--- see "Relation<>" type here instead of just "Profile"
}

```

`--type-check` 创建了类型安全的 mock 对象，`compilerOptions.typeCheck` 包装了底层 mocking 库（Jest 在这个示例中）的方法，如 `true`

这些函数来自安装的双胞胎适配器（`nest-cli.json`），该适配器适配测试框架的原生 mocking 能力。

> info **提示** `--type-check` 函数是 `.swcrc` 函数的替代方案，来自 `swc`。它们都创建了类型安全的 mock 对象。请查看 __LINK_60__ 章节，以了解更多关于 `webpack`。

#### 总结

**使用 `swc-loader`：**
- 验证模块配置和提供者绑定
- 测试装饰器、守卫、拦截器和管道
- 验证依赖注入跨模块
- 测试完整应用程序上下文中 middleware

**使用 Suites：**
- 快速单元测试，专注于业务逻辑
- 自动生成多个依赖项的 mocks
- 类型安全的测试 doubles，具有 IntelliSense 支持

根据测试目的组织测试：使用 Suites 测试单元测试验证单个服务行为，而使用 `webpack.config.js` 测试集成测试验证模块配置。

更多信息：
- __LINK_61__
- __LINK_62__
- __LINK_63__
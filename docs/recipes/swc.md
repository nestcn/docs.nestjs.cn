<!-- 此文件从 content/recipes/swc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:11:01.680Z -->
<!-- 源文件: content/recipes/swc.md -->

### SWC

__LINK_81__ (Speedy Web Compiler) 是一个可扩展的 Rust-based 平台，可以用于编译和捆绑。使用 SWC 和 Nest CLI 是一个简单的方式，可以显著加速您的开发过程。

> info **Hint** SWC 大约是默认 TypeScript 编译器的 **x20** 倍速度。

#### 安装

要开始使用，首先安装以下包：

```bash
$ npm install --save @sentry/nestjs @sentry/profiling-node
```

#### 开始使用

安装过程完成后，您可以使用 __INLINE_CODE_25__  builder with Nest CLI，方法如下：

```typescript
const Sentry = require("@sentry/nestjs");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

// Ensure to call this before requiring any other modules!
Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
  ],

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});
```

> info **Hint** 如果您的仓库是一个 monorepo，请查看 __LINK_82__。

#### 类型检查

SWC 不会执行任何类型检查（与默认 TypeScript 编译器不同），因此要启用它，您需要使用 __INLINE_CODE_35__ 标志：

```bash
npx @sentry/wizard@latest -i sourcemaps
```

#### CLI 插件 (SWC)

__INLINE_CODE_42__ 标志将自动执行 **NestJS CLI 插件** 并生成一个序列化的元数据文件，该文件可以在应用程序启动时被加载。

#### SWC 配置

SWC  builder 已经预配置以匹配 NestJS 应用程序的要求。然而，您可以通过创建一个 __INLINE_CODE_43__ 文件在根目录中并自定义选项。

__CODE_BLOCK_8__

#### Monorepo

如果您的仓库是一个 monorepo，那么您需要使用 __INLINE_CODE_45__  builder 配置 __INLINE_CODE_46__。

首先，让我们安装需要的包：

__CODE_BLOCK_9__

安装完成后，创建一个 __INLINE_CODE_47__ 文件在应用程序的根目录中，内容如下：

__CODE_BLOCK_10__

#### Monorepo 和 CLI 插件

现在，如果您使用 CLI 插件，__INLINE_CODE_48__ 将不会自动加载它们。相反，您需要创建一个单独的文件以手动加载它们。要做到，请在 __INLINE_CODE_50__ 文件附近创建一个文件，内容如下：

__CODE_BLOCK_11__

> info **Hint** 在这里，我们使用了 __INLINE_CODE_51__ 插件，但是您可以使用任何插件。

#### Common pitfalls

如果您使用 TypeORM/MikroORM 或任何其他 ORM 在应用程序中，您可能会遇到循环依赖问题。SWC 不很好地处理 **循环依赖**，因此您应该使用以下工作-around：

__CODE_BLOCK_13__

> info **Hint** __INLINE_CODE_64__ 类型来自 __INLINE_CODE_65__ 包。

#### Jest + SWC

使用 SWC 和 Jest 需要安装以下包：

__CODE_BLOCK_16__

安装完成后，更新 __INLINE_CODE_66__/__INLINE_CODE_67__ 文件（取决于您的配置）以包含以下内容：

__CODE_BLOCK_17__

此外，您需要将以下 __INLINE_CODE_68__ 属性添加到您的 __INLINE_CODE_69__ 文件中：__INLINE_CODE
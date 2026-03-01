<!-- 此文件从 content/recipes/swc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:19:05.354Z -->
<!-- 源文件: content/recipes/swc.md -->

### SWC

__LINK_81__（Speedy Web Compiler）是一个基于 Rust 的可扩展平台，可以用于编译和捆绑。使用 SWC 和 Nest CLI 是一个简单的方法，可以大大加速您的开发过程。

> info **Hint** SWC 大约是默认 TypeScript 编译器的 **x20** 倍速度。

#### 安装

要开始使用，首先安装以下包：

```bash
$ npm install --save @sentry/nestjs @sentry/profiling-node
```

#### 开始使用

安装完成后，您可以使用 __INLINE_CODE_25__ 构建器与 Nest CLI 一起使用，例如：

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

> info **Hint** 如果您的 저장库是一个 monorepo，查看 __LINK_82__。

#### 类型检查

SWC 不执行任何类型检查（与默认 TypeScript 编译器不同），因此要启用它，您需要使用 __INLINE_CODE_35__ 标志：

```bash
npx @sentry/wizard@latest -i sourcemaps
```

这个命令将 instruct Nest CLI 执行 __INLINE_CODE_36__ 在 __INLINE_CODE_37__ 模式下，同时异步执行类型检查。相反，您也可以在 __INLINE_CODE_41__ 文件中设置 __INLINE_CODE_39__ 属性为 __INLINE_CODE_40__，例如：

```typescript
@Get("debug-sentry")
getError() {
  throw new Error("My first Sentry error!");
}
```

#### CLI 插件（SWC）

__INLINE_CODE_42__ 标志将自动执行 **NestJS CLI 插件** 并生成一个序列化的元数据文件，然后可以在运行时由应用程序加载。

#### SWC 配置

SWC 构建器预先配置为满足 NestJS 应用程序的要求。然而，您可以根据需要自定义配置，创建一个 __INLINE_CODE_43__ 文件在应用程序的根目录中，调整选项。

__CODE_BLOCK_8__

#### Monorepo

如果您的存储库是一个 monorepo，那么您需要使用 __INLINE_CODE_45__ 配置 __INLINE_CODE_46__。

首先，让我们安装所需的包：

__CODE_BLOCK_9__

安装完成后，创建一个 __INLINE_CODE_47__ 文件在应用程序的根目录中，内容如下：

__CODE_BLOCK_10__

#### Monorepo 和 CLI 插件

现在，如果您使用 CLI 插件，__INLINE_CODE_48__ 将不会自动加载它们。相反，您需要创建一个单独的文件来手动加载它们。例如：

__CODE_BLOCK_11__

> info **Hint** 在这里，我们使用了 __INLINE_CODE_51__ 插件，但是您可以使用任何插件。

#### Common pitfalls

如果您使用 TypeORM/MikroORM 或其他 ORM 在应用程序中，您可能会遇到循环依赖问题。SWC 不处理循环依赖关系很好，因此您需要使用以下解决方案：

__CODE_BLOCK_13__

> info **Hint** __INLINE_CODE_64__ 类型来自 __INLINE_CODE_65__ 包。

#### Jest + SWC

要使用 SWC 和 Jest，您需要安装以下包：

__CODE_BLOCK_16__

安装完成后，更新 __INLINE_CODE_
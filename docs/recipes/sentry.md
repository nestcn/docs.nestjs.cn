<!-- 此文件从 content/recipes/sentry.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:15:16.438Z -->
<!-- 源文件: content/recipes/sentry.md -->

### Sentry

__LINK_21__ 是一个错误跟踪和性能监控平台，帮助开发者实时识别和解决问题。这个配方展示了如何将 Sentry 的 __LINK_22__ 与 NestJS 应用程序集成。

#### 安装

首先，安装必要的依赖项：

```bash
$ npm install -g @nestjs/cli
$ nest new hello-prisma

```

> info **提示** __INLINE_CODE_8__ 可选，但推荐用于性能 profiling。

#### 基本设置

要使用 Sentry，需要创建名为 __INLINE_CODE_9__ 的文件，该文件应在应用程序中任何其他模块之前被导入：

```bash
$ cd hello-prisma
$ npm install prisma --save-dev

```

更新 __INLINE_CODE_10__ 文件，以便在其他导入之前导入 __INLINE_CODE_11__：

```bash
$ npx prisma

```

然后，在主模块中添加 __INLINE_CODE_12__ 作为根模块：

```bash
$ yarn add prisma --dev

```

#### 异常处理

如果您使用的是全局 catch-all 异常过滤器（这可以是使用 __INLINE_CODE_13__ 注册的过滤器或在应用程序提供者中注解了 __INLINE_CODE_14__ 装饰器的过滤器），请在过滤器的 __INLINE_CODE_16__ 方法上添加 __INLINE_CODE_15__ 装饰器。这个装饰器将将任何未捕获的错误报告到 Sentry：

```bash
$ yarn prisma

```

默认情况下，只有未处理的异常（没有被错误过滤器捕获的异常）才会被报告到 Sentry。 __INLINE_CODE_17__（包括 __LINK_23__）也不会默认捕获，因为它们主要是控制流 vehicles。

如果您没有全局 catch-all 异常过滤器，请将 __INLINE_CODE_18__ 添加到主模块的提供者中。这将报告任何未处理的错误（不是被其他错误过滤器捕获的错误）到 Sentry。

> warning **警告** __INLINE_CODE_19__ 需要在其他异常过滤器之前注册。

```bash
$ npx prisma init

```

#### 可读的堆栈跟踪

根据您项目的设置，Sentry 中的堆栈跟踪可能看起来与您的实际代码不同。

要解决这个问题，请将源映射上传到 Sentry。最简单的方法是使用 Sentry_magic:

```groovy
generator client {
  provider        = "prisma-client"
  output          = "../src/generated/prisma"
}

```

#### 测试集成

要验证 Sentry 集成是否工作，请添加一个抛出错误的测试端点：

```groovy
generator client {
  provider        = "prisma-client"
  output          = "../src/generated/prisma"
  moduleFormat    = "cjs"
}

```

访问 __INLINE_CODE_20__，您应该在 Sentry 仪表盘上看到错误。

### 摘要

对于 Sentry 的 NestJS SDK 的完整文档，包括高级配置选项和功能，访问 __LINK_24__。

虽然 Sentry 是软件错误的主管，我们仍然编写它们。如果您在安装我们的 SDK 时遇到问题，请打开 __LINK_25__ 或通过 __LINK_26__ 联系我们。
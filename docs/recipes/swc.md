<!-- 此文件从 content/recipes/swc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:12:02.270Z -->
<!-- 源文件: content/recipes/swc.md -->

### SWC

__LINK_81__ (Speedy Web Compiler)是一个基于Rust的可扩展平台，可以用于编译和捆绑。使用SWC与Nest CLI是一个简单的方式来加速开发过程。

> info **Hint** SWC约是默认TypeScript编译器的20倍快。

#### 安装

要开始，请先安装以下包：

```bash
$ npm install --save @sentry/nestjs @sentry/profiling-node
```

#### 开始使用

安装过程完成后，您可以使用__INLINE_CODE_25__ builder与Nest CLI，例如：

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

  // 设置 sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});
```

> info **Hint** 如果您的仓库是一个monorepo，请查看__LINK_82__。

您也可以将__INLINE_CODE_26__标志改为在__INLINE_CODE_29__文件中设置__INLINE_CODE_28__属性，例如：

```typescript
// 导入 this first!
import "./instrument";

// Now import other modules
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
```

#### 自定义

要自定义builder的行为，可以传递一个包含两个属性__INLINE_CODE_30__（__INLINE_CODE_31__）和__INLINE_CODE_32__的对象，例如：

```typescript
import { Module } from "@nestjs/common";
import { SentryModule } from "@sentry/nestjs/setup";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    SentryModule.forRoot(),
    // ...other modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

例如，要编译__INLINE_CODE_33__和__INLINE_CODE_34__文件，可以：

```typescript
import { Catch, ExceptionFilter } from '@nestjs/common';
import { SentryExceptionCaptured } from '@sentry/nestjs';

@Catch()
export class YourCatchAllExceptionFilter implements ExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception, host): void {
    // your implementation here
  }
}
```

要在watch模式下运行应用程序，请使用以下命令：

```typescript
import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { SentryGlobalFilter } from "@sentry/nestjs/setup";

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    // ..other providers
  ],
})
export class AppModule {}
```

#### 类型检查

SWC不执行类型检查（与默认TypeScript编译器不同），因此要启用它，请使用__INLINE_CODE_35__标志：

```bash
npx @sentry/wizard@latest -i sourcemaps
```

这将 instruct Nest CLI在__INLINE_CODE_36__模式下异步执行__INLINE_CODE_37__，从而执行类型检查。相反，您也可以在__INLINE_CODE_41__文件中设置__INLINE_CODE_40__属性，例如：

```typescript
@Get("debug-sentry")
getError() {
  throw new Error("My first Sentry error!");
}
```

#### CLI插件（SWC）

__INLINE_CODE_42__标志将自动执行NestJS CLI插件，并生成一个序列化的元数据文件，该文件可以在应用程序运行时被加载。

#### SWC配置

SWC builder预配置以匹配NestJS应用程序的要求。但是，您可以在根目录中创建一个__INLINE_CODE_43__文件，并自定义选项。

__CODE_BLOCK_8__

#### monorepo

如果您的仓库是一个monorepo，那么您需要使用__INLINE_CODE_45__ builder而不是__INLINE_CODE_44__ builder。

首先，让我们安装所需的包：

__CODE_BLOCK_9__

安装完成后，请在应用程序根目录中创建一个__INLINE_CODE_47__文件，内容如下：

__CODE_BLOCK_10__

#### monorepo和CLI插件

现在，如果您使用CLI插件，__INLINE_CODE_48__将不会自动加载它们。相反，您需要创建一个单独的文件来加载它们。要做到这一点，请在__INLINE_CODE_50__文件附近创建一个__INLINE_CODE_49__文件，内容如下：

__CODE_BLOCK_11__

> info **Hint** 在本例中，我们使用了__INLINE_CODE_51__插件，但是
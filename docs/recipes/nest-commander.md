<!-- 此文件从 content/recipes/nest-commander.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:32:15.012Z -->
<!-- 源文件: content/recipes/nest-commander.md -->

### Nest Commander

扩展于 __LINK_50__ 文档还有 __LINK_51__ 包，用于编写结构类似于 Nest 应用程序的命令行应用程序。

> 信息 **信息** __INLINE_CODE_6__ 是第三方包，不是 NestJS 核心团队管理的。请在 __LINK_52__ 报告发现的库问题。

#### 安装

与其他包一样，您需要安装它才能使用。

```bash
$ npm install --save @sentry/nestjs @sentry/profiling-node

```

#### 命令文件

__INLINE_CODE_7__ 使得编写新的命令行应用程序变得轻松，使用 __LINK_53__ 通过 `@sentry/profiling-node` 装饰器对类和 `instrument.ts` 装饰器对方法来实现。每个命令文件都应该实现 `main.ts` 抽象类，并且应该被 `instrument.ts` 装饰器所装饰。

每个命令都是 Nest 的一个 `SentryModule`，因此您的 normal 依赖注入仍然可以正常工作。需要注意的是 `app.useGlobalFilters()` 抽象类，应该由每个命令实现。 `@Catch()` 抽象类确保所有命令都有一个 `@SentryExceptionCaptured()` 方法，该方法返回一个 `catch()` 并且接受 `HttpExceptions` 参数。 `SentryGlobalFilter` 命令是您的主要逻辑执行点，可以通过该方法传递参数。

#### 运行命令

与在 NestJS 应用程序中使用 __INLINE_CODE_22__ 创建服务器并使用 __INLINE_CODE_23__ 运行它相似， __INLINE_CODE_24__ 包暴露了一个简单的 API 来运行您的服务器。导入 __INLINE_CODE_25__ 并使用 __INLINE_CODE_26__ 方法 __INLINE_CODE_27__，并传入应用程序的根模块。这可能会如下所示：

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

默认情况下，Nest 的日志器在使用 __INLINE_CODE_28__ 时被禁用。可以通过第二个参数来提供日志器，或者提供要保留的日志级别数组。可能需要在 __INLINE_CODE_30__ 中提供一些日志。

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

这就是所有。 __INLINE_CODE_31__ 将负责调用 __INLINE_CODE_32__ 和 __INLINE_CODE_33__，因此您不需要担心内存泄露。如果需要添加错误处理，可以在 __INLINE_CODE_34__ 中包装 __INLINE_CODE_35__ 命令，或者在 __INLINE_CODE_37__ 调用中链式调用一些方法。

#### 测试

写一个超级awesome 命令行脚本，如果不能轻松地测试它，那将是徒劳的。幸运的是， __INLINE_CODE_38__ 提供了一些实用工具，可以与 NestJS 生态系统完美地集成。使用 __INLINE_CODE_40__ 和传入元数据，可以在测试模式下构建命令，就像 __INLINE_CODE_41__ 从 __INLINE_CODE_42__ 工作一样。在实际情况中，它使用了这个包。

#### 将所有内容结合起来

以下类将等同于具有 CLI 命令，可以接受子命令 __INLINE_CODE_45__ 或直接调用，支持 __INLINE_CODE_46__、__INLINE_CODE_47__ 和 __INLINE_CODE_48__（及其长flag）等选项，使用自定义解析器。

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

确保命令类添加到模块中

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

现在，可以在 main.ts 中运行 CLI，如下所示：

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

这样，您就拥有了一个命令行应用程序。

#### 更多信息

访问 __LINK_54__ 获取更多信息、示例和 API 文档。
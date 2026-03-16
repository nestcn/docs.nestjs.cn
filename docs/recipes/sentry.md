<!-- 此文件从 content/recipes/sentry.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:04:48.508Z -->
<!-- 源文件: content/recipes/sentry.md -->

### Sentry

__LINK_21__ 是一个错误跟踪和性能监控平台，帮助开发者实时识别和修复问题。这份配方展示了如何将 Sentry 的__LINK_22__与 NestJS 应用程序集成。

#### 安装

首先，安装所需的依赖项：

```typescript
// #1 Express
import * as express from 'express';

async function bootstrap() {
  const app = express();
  app.get('/', (req, res) => res.send('Hello world!'));
  await new Promise<void>((resolve) => app.listen(3000, resolve));
}
bootstrap();

// #2 Nest (with @nestjs/platform-express)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error'] });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

// #3 Nest as a Standalone application (no HTTP server)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  console.log(app.get(AppService).getHello());
}
bootstrap();

// #4 Raw Node.js script
async function bootstrap() {
  console.log('Hello world!');
}
bootstrap();

```

> info **提示** __INLINE_CODE_8__ 是可选的，但recommended for performance profiling。

#### 基本设置

要使用 Sentry，需要创建一个名为 __INLINE_CODE_9__ 的文件，该文件应在应用程序中任何其他模块之前被导入：

```javascript
module.exports = (options, webpack) => {
  const lazyImports = [
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
  ];

  return {
    ...options,
    externals: [],
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
    ],
  };
};

```

更新您的 __INLINE_CODE_10__ 文件，以便在其他导入之前导入 __INLINE_CODE_11__：

```typescript
if (request.method === RequestMethod[RequestMethod.GET]) {
  const { CacheModule } = await import('./cache.module');
  const moduleRef = await this.lazyModuleLoader.load(() => CacheModule);

  const { CacheService } = await import('./cache.service');
  const cacheService = moduleRef.get(CacheService);

  return cacheService.get(ENDPOINT_KEY);
}

```

随后，在您的主要模块中添加 __INLINE_CODE_12__ 作为根模块：

```typescript
if (workerType === WorkerType.A) {
  const { WorkerAModule } = await import('./worker-a.module');
  const moduleRef = await this.lazyModuleLoader.load(() => WorkerAModule);
  // ...
} else if (workerType === WorkerType.B) {
  const { WorkerBModule } = await import('./worker-b.module');
  const moduleRef = await this.lazyModuleLoader.load(() => WorkerBModule);
  // ...
}

```

#### 异常处理

如果您使用的是全局catch-all 异常过滤器（即注册在 `express` 或在应用程序模块提供商中注解为 `tsc` 装饰器的过滤器），请在过滤器的 `@nestjs/platform-express` 方法上添加 `webpack` 装饰器。这将将所有未捕获的错误报告到 Sentry：

```bash
$ npm i @codegenie/serverless-express aws-lambda
$ npm i -D @types/aws-lambda serverless-offline

```

默认情况下，只有未捕获的异常（不包括 __LINK_23__）被报告到 Sentry。 `webpack`（包括 __LINK_23__）也不会默认捕获，因为它们大多数作为控制流工具。

如果您没有全局catch-all 异常过滤器，请将 `nest build --webpack` 添加到您的主要模块的提供商中。这将报告所有未捕获的错误（不是由其他过滤器捕获的）到 Sentry。

> warning **警告** `webpack` 需要在其他异常过滤器之前注册。

```yaml
service: serverless-example

plugins:
  - serverless-offline

provider:
  name: aws
  runtime: nodejs14.x

functions:
  main:
    handler: dist/main.handler
    events:
      - http:
          method: ANY
          path: /
      - http:
          method: ANY
          path: '{proxy+}'

```

#### 可读性 stack traces

根据您的项目设置，Sentry 错误中的 stack traces可能不会像您的实际代码一样。

要解决这个问题，可以将您的 source maps 上传到 Sentry。最简单的方法是使用 Sentry Wizard：

```typescript
import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};

```

#### 测试集成

要验证 Sentry 集成是否正确，可以添加一个抛出错误的测试端点：

```json
{
  "compilerOptions": {
    ...
    "esModuleInterop": true
  }
}

```

访问 `node_modules` 在您的应用程序中，您应该在 Sentry 仪表板中看到错误。

### 总结

对于 Sentry 的 NestJS SDK 的完整文档，包括高级配置选项和功能，请访问 __LINK_24__。

虽然 Sentry 是软件 bugs 的事，但我们仍然编写它们。如果您在安装我们的 SDK 时遇到任何问题，请打开 __LINK_25__ 或通过 __LINK_26__ 联系我们。
### Serverless

Serverless 计算是一种云计算执行模型，云提供商按需分配机器资源，代表客户管理服务器。当应用程序不使用时，没有分配给应用程序的计算资源。定价基于应用程序消耗的实际资源量（[来源](https://en.wikipedia.org/wiki/Serverless_computing)）。

使用 **serverless 架构**，您可以纯粹专注于应用程序代码中的各个函数。AWS Lambda、Google Cloud Functions 和 Microsoft Azure Functions 等服务负责所有物理硬件、虚拟机操作系统和 Web 服务器软件管理。

> info **提示** 本章不涵盖 serverless 函数的优缺点，也不深入探讨任何云提供商的具体细节。

#### 冷启动

冷启动是很长一段时间以来您的代码第一次执行。根据您使用的云提供商，它可能跨越多个不同的操作，从下载代码和引导运行时到最终运行您的代码。
此过程增加了**显著的延迟**，具体取决于多个因素，如语言、应用程序所需的包数量等。

冷启动很重要，虽然有些事情超出了我们的控制范围，但在我们这边仍然可以做很多事情来使其尽可能短。

虽然您可以将 Nest 视为专为复杂企业应用程序设计的完整框架，但它也**适用于更"简单"的应用程序**（或脚本）。例如，通过使用[独立应用程序](/standalone-applications)功能，您可以在简单的工作程序、CRON 作业、CLI 或 serverless 函数中利用 Nest 的 DI 系统。

#### 基准测试

为了更好地了解在 serverless 函数上下文中使用 Nest 或其他知名库（如 `express`）的成本，让我们比较 Node 运行时运行以下脚本需要多长时间：

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

对于所有这些脚本，我们使用了 `tsc` (TypeScript) 编译器，因此代码保持未打包状态（未使用 `webpack`）。

|                                      |                   |
| ------------------------------------ | ----------------- |
| Express                              | 0.0079s (7.9ms)   |
| Nest with `@nestjs/platform-express` | 0.1974s (197.4ms) |
| Nest (standalone application)        | 0.1117s (111.7ms) |
| Raw Node.js script                   | 0.0071s (7.1ms)   |

> info **注意** 机器：MacBook Pro Mid 2014, 2.5 GHz Quad-Core Intel Core i7, 16 GB 1600 MHz DDR3, SSD。

现在，让我们重复所有基准测试，但这次使用 `webpack`（如果您安装了 [Nest CLI](/cli/overview)，可以运行 `nest build --webpack`）将我们的应用程序打包成单个可执行 JavaScript 文件。
但是，我们不使用 Nest CLI 附带的默认 `webpack` 配置，而是确保将所有依赖项（`node_modules`）打包在一起，如下所示：

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

> info **提示** 要指示 Nest CLI 使用此配置，请在项目的根目录中创建一个新的 `webpack.config.js` 文件。

使用此配置，我们获得了以下结果：

|                                      |                  |
| ------------------------------------ | ---------------- |
| Express                              | 0.0068s (6.8ms)  |
| Nest with `@nestjs/platform-express` | 0.0815s (81.5ms) |
| Nest (standalone application)        | 0.0319s (31.9ms) |
| Raw Node.js script                   | 0.0066s (6.6ms)  |

> info **注意** 机器：MacBook Pro Mid 2014, 2.5 GHz Quad-Core Intel Core i7, 16 GB 1600 MHz DDR3, SSD。

> info **提示** 您可以通过应用额外的代码压缩和优化技术（使用 `webpack` 插件等）进一步优化它。

如您所见，编译方式（以及是否打包代码）至关重要，对整体启动时间有重大影响。使用 `webpack`，您可以将独立 Nest 应用程序（具有一个模块、控制器和服务的入门项目）的引导时间平均降低到约 32ms，对于常规的基于 HTTP、express 的 NestJS 应用程序降低到约 81.5ms。

对于更复杂的 Nest 应用程序，例如，具有 10 个资源（通过 `$ nest g resource` 原理图生成 = 10 个模块、10 个控制器、10 个服务、20 个 DTO 类、50 个 HTTP 端点 + `AppModule`），在 MacBook Pro Mid 2014, 2.5 GHz Quad-Core Intel Core i7, 16 GB 1600 MHz DDR3, SSD 上的整体启动时间约为 0.1298s (129.8ms)。将单体应用程序作为 serverless 函数运行通常没有太大意义，因此请将此基准测试更多地视为引导时间如何随着应用程序增长而可能增加的示例。

#### 运行时优化

到目前为止，我们涵盖了编译时优化。这些与您定义提供者和在应用程序中加载 Nest 模块的方式无关，而随着应用程序变大，这起着重要作用。

例如，假设有一个数据库连接定义为[异步提供者](/fundamentals/async-components)。异步提供者旨在延迟应用程序启动，直到完成一个或多个异步任务。
这意味着，如果您的 serverless 函数平均需要 2 秒连接数据库（在引导时），您的端点将需要至少额外两秒（因为它必须等待连接建立）才能发回响应（当它是冷启动且您的应用程序尚未运行时）。

如您所见，在引导时间很重要的 **serverless 环境**中，您构建提供者的方式有些不同。
另一个很好的例子是如果您使用 Redis 进行缓存，但仅在某些情况下。也许在这种情况下，您不应该将 Redis 连接定义为异步提供者，因为它会减慢引导时间，即使此特定函数调用不需要它。

此外，有时您可以使用 `LazyModuleLoader` 类延迟加载整个模块，如[本章](/fundamentals/lazy-loading-modules)所述。缓存也是这里的一个很好的例子。
想象您的应用程序有 `CacheModule`，它内部连接到 Redis，并且还导出 `CacheService` 以与 Redis 存储交互。如果您不是所有潜在的函数调用都需要它，
您可以只是按需延迟加载它。这样，对于所有不需要缓存的调用，您将获得更快的启动时间（当发生冷启动时）。

```typescript
if (request.method === RequestMethod[RequestMethod.GET]) {
  const { CacheModule } = await import('./cache.module');
  const moduleRef = await this.lazyModuleLoader.load(() => CacheModule);

  const { CacheService } = await import('./cache.service');
  const cacheService = moduleRef.get(CacheService);

  return cacheService.get(ENDPOINT_KEY);
}

```

另一个很好的例子是 webhook 或工作程序，根据某些特定条件（例如输入参数），可能执行不同的操作。
在这种情况下，您可以在路由处理程序中指定一个条件，为特定函数调用延迟加载适当的模块，并只是延迟加载其他所有模块。

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

#### 示例集成

应用程序入口文件（通常是 `main.ts` 文件）的外观**取决于多个因素**，因此**没有单一模板**适用于每个场景。
例如，启动 serverless 函数所需的初始化文件因云提供商（AWS、Azure、GCP 等）而异。
此外，根据您是想运行具有多个路由/端点的典型 HTTP 应用程序还是只提供单个路由（或执行特定代码部分），
您的应用程序代码看起来会不同（例如，对于每个函数一个端点的方法，您可以使用 `NestFactory.createApplicationContext` 而不是启动 HTTP 服务器、设置中间件等）。

仅出于说明目的，我们将 Nest（使用 `@nestjs/platform-express` 并因此启动整个、功能齐全的 HTTP 路由器）
与 [Serverless](https://www.serverless.com/) 框架集成（在本例中，针对 AWS Lambda）。正如我们之前提到的，您的代码将因您选择的云提供商和许多其他因素而异。

首先，让我们安装所需的包：

```bash
$ npm i @codegenie/serverless-express aws-lambda
$ npm i -D @types/aws-lambda serverless-offline

```

> info **提示** 为了加快开发周期，我们安装了 `serverless-offline` 插件，它模拟 AWS λ 和 API Gateway。

安装过程完成后，让我们创建 `serverless.yml` 文件来配置 Serverless 框架：

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

> info **提示** 要了解有关 Serverless 框架的更多信息，请访问[官方文档](https://www.serverless.com/framework/docs/)。

有了这些，我们现在可以导航到 `main.ts` 文件并使用所需的样板代码更新我们的引导代码：

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

> info **提示** 要创建多个 serverless 函数并在它们之间共享公共模块，我们建议使用 [CLI Monorepo 模式](/cli/workspaces#monorepo-模式)。

> warning **警告** 如果您使用 `@nestjs/swagger` 包，在 serverless 函数上下文中使其正常工作需要一些额外的步骤。查看此[线程](https://github.com/nestjs/swagger/issues/199)了解更多信息。

接下来，打开 `tsconfig.json` 文件并确保启用 `esModuleInterop` 选项以使 `@codegenie/serverless-express` 包正确加载。

```json
{
  "compilerOptions": {
    ...
    "esModuleInterop": true
  }
}

```

现在我们可以构建应用程序（使用 `nest build` 或 `tsc`）并使用 `serverless` CLI 在本地启动我们的 lambda 函数：

```bash
$ npm run build
$ npx serverless offline

```

应用程序运行后，打开浏览器并导航到 `http://localhost:3000/dev/[ANY_ROUTE]`（其中 `[ANY_ROUTE]` 是您应用程序中注册的任何端点）。

在上面的部分中，我们已经展示了使用 `webpack` 和打包应用程序可以对整体引导时间产生重大影响。
但是，要使其与我们的示例一起工作，您必须在 `webpack.config.js` 文件中添加一些额外的配置。通常，
为了确保我们的 `handler` 函数被拾取，我们必须将 `output.libraryTarget` 属性更改为 `commonjs2`。

```javascript
return {
  ...options,
  externals: [],
  output: {
    ...options.output,
    libraryTarget: 'commonjs2',
  },
  // ... 其余配置
};

```

有了这些，您现在可以使用 `$ nest build --webpack` 编译函数代码（然后使用 `$ npx serverless offline` 测试它）。

还建议（但**不是必需的**，因为它会减慢您的构建过程）安装 `terser-webpack-plugin` 包并覆盖其配置以在压缩生产构建时保持类名完整。不这样做可能会导致在应用程序中使用 `class-validator` 时出现不正确的行为。

```javascript
const TerserPlugin = require('terser-webpack-plugin');

return {
  ...options,
  externals: [],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
        },
      }),
    ],
  },
  output: {
    ...options.output,
    libraryTarget: 'commonjs2',
  },
  // ... 其余配置
};

```

#### 使用独立应用程序功能

或者，如果您想保持函数非常轻量级，并且不需要任何 HTTP 相关功能（路由，还有守卫、拦截器、管道等），
您可以只使用 `NestFactory.createApplicationContext`（如前所述），而不是运行整个 HTTP 服务器（以及底层的 `express`），如下所示：

```typescript
import { HttpStatus } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';
import { AppService } from './app.service';

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const appService = appContext.get(AppService);

  return {
    body: appService.getHello(),
    statusCode: HttpStatus.OK,
  };
};

```

> info **提示** 请注意，`NestFactory.createApplicationContext` 不会用增强器（守卫、拦截器等）包装控制器方法。为此，您必须使用 `NestFactory.create` 方法。

您也可以将 `event` 对象向下传递给 `EventsService` 提供者，该提供者可以处理它并返回相应的值（取决于输入值和您的业务逻辑）。

```typescript
export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const eventsService = appContext.get(EventsService);
  return eventsService.process(event);
};

```

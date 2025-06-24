### 无服务器

无服务器计算是一种云计算执行模型，云提供商按需分配机器资源，代表客户管理服务器。当应用未被使用时，不会为其分配计算资源。计费基于应用程序实际消耗的资源量（ [来源](https://en.wikipedia.org/wiki/Serverless_computing) ）。

采用**无服务器架构**时，您只需专注于应用程序代码中的各个函数。诸如 AWS Lambda、Google Cloud Functions 和 Microsoft Azure Functions 等服务会负责所有物理硬件、虚拟机操作系统及 Web 服务器软件的管理。

> info **注意** 本章节不讨论无服务器函数的优缺点，也不会深入探讨任何云提供商的具体实现细节。

#### 冷启动

冷启动是指代码在一段时间后首次执行。根据您使用的云服务提供商不同，它可能涉及多种操作，从下载代码和引导运行时环境到最终运行您的代码。这个过程会带来**显著的延迟** ，具体取决于多种因素，如编程语言、应用程序所需的依赖包数量等。

冷启动非常重要，尽管有些因素超出我们的控制范围，但我们仍可以通过许多方法来尽可能缩短这一过程。

虽然 Nest 被视为一个功能完备的框架，专为复杂的企业级应用设计，但它同样**适用于更"简单"的应用** （或脚本）。例如，通过使用[独立应用](/standalone-applications)功能，您可以在简单的 worker、CRON 任务、命令行工具或无服务器函数中利用 Nest 的依赖注入系统。

#### 基准测试

为了更好地理解在无服务器函数环境中使用 Nest 或其他知名库（如 `express`）的成本，我们比较了 Node 运行时执行以下脚本所需的时间：

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

所有这些脚本均使用 `tsc`（TypeScript）编译器，因此代码保持未打包状态（未使用 `webpack`）。

|                                            |                         |
| ------------------------------------------ | ----------------------- |
| Express                                    | 0.0079 秒（7.9 毫秒）   |
| 使用 @nestjs/platform-express 的 Nest 框架 | 0.1974 秒（197.4 毫秒） |
| Nest（独立应用）                           | 0.1117 秒（111.7 毫秒） |
| 原始 Node.js 脚本                          | 0.0071 秒（7.1 毫秒）   |

> info **注意** 设备：MacBook Pro 2014 年中款，2.5 GHz 四核 Intel Core i7 处理器，16 GB 1600 MHz DDR3 内存，固态硬盘。

现在，让我们重复所有基准测试，但这次使用 `webpack`（如果已安装 [Nest CLI](/cli/overview)，可以运行 `nest build --webpack`）将我们的应用程序打包成单个可执行 JavaScript 文件。不过，我们将确保将所有依赖项（`node_modules`）一起打包，而不是使用 Nest CLI 自带的默认 `webpack` 配置，具体如下：

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

> info **提示** 要指示 Nest CLI 使用此配置，请在项目根目录中创建一个新的 `webpack.config.js` 文件。

使用此配置后，我们得到了以下结果：

|                                            |                        |
| ------------------------------------------ | ---------------------- |
| Express                                    | 0.0068 秒（6.8 毫秒）  |
| 使用 @nestjs/platform-express 的 Nest 框架 | 0.0815 秒（81.5 毫秒） |
| Nest（独立应用）                           | 0.0319 秒（31.9 毫秒） |
| 原始 Node.js 脚本                          | 0.0066 秒（6.6 毫秒）  |

> info **注意** 机器配置：MacBook Pro 2014 年中款，2.5 GHz 四核 Intel Core i7 处理器，16 GB 1600 MHz DDR3 内存，固态硬盘。

> info **提示** 您可以通过应用额外的代码压缩与优化技术（如使用 `webpack` 插件等）进一步优化。

如您所见，编译方式（以及是否打包代码）至关重要，对整体启动时间有显著影响。使用 `webpack` 时，独立 Nest 应用（包含一个模块、控制器和服务的初始项目）的平均引导时间可降至约 32 毫秒，基于 Express 的常规 HTTP NestJS 应用则可降至约 81.5 毫秒。

对于更复杂的 Nest 应用，例如包含 10 个资源（通过 `$ nest g resource` 示意图生成=10 个模块、10 个控制器、10 个服务、20 个 DTO 类、50 个 HTTP 端点+`AppModule`），在 2014 年中款 MacBook Pro（2.5 GHz 四核 Intel Core i7 处理器，16GB 1600 MHz DDR3 内存，SSD 硬盘）上的整体启动时间约为 0.1298 秒（129.8 毫秒）。无论如何，以无服务器函数形式运行单体应用通常没有太大意义，因此请将此基准测试更多地视为展示应用规模扩大时引导时间可能增长的示例。

#### 运行时优化

至此我们已经介绍了编译时优化。这些优化与你定义提供者和加载 Nest 模块的方式无关，但随着应用规模扩大，后者的优化将发挥关键作用。

比如，假设你定义了一个数据库连接作为[异步提供者](/fundamentals/async-providers) 。异步提供者的设计初衷是延迟应用启动，直到一个或多个异步任务完成。这意味着如果你的无服务器函数平均需要 2 秒来连接数据库（在启动阶段），那么你的接口至少需要额外两秒（因为它必须等待连接建立）才能返回响应（在冷启动且应用原先未运行的情况下）。

可以看出，在**无服务器环境**中（启动时间至关重要时），你组织提供者的方式会有所不同。另一个典型例子是使用 Redis 进行缓存但仅在某些场景下需要的情况。或许在这种情况下，你不应该将 Redis 连接定义为异步提供者，因为即便当前函数调用不需要它，这仍会拖慢启动时间。

此外，有时您可以使用 `LazyModuleLoader` 类懒加载整个模块，如[本章节](/fundamentals/lazy-loading-modules)所述。缓存在这里也是个很好的例子。假设您的应用程序有一个 `CacheModule`，它内部连接到 Redis，并导出 `CacheService` 来与 Redis 存储交互。如果并非所有函数调用都需要它，您可以按需懒加载该模块。这样，对于不需要缓存的调用，您将获得更快的启动时间（当发生冷启动时）。

```typescript
if (request.method === RequestMethod[RequestMethod.GET]) {
  const { CacheModule } = await import('./cache.module');
  const moduleRef = await this.lazyModuleLoader.load(() => CacheModule);

  const { CacheService } = await import('./cache.service');
  const cacheService = moduleRef.get(CacheService);

  return cacheService.get(ENDPOINT_KEY);
}
```

另一个很好的例子是 webhook 或 worker，根据特定条件（例如输入参数）可能执行不同的操作。在这种情况下，您可以在路由处理程序中指定一个条件，为特定函数调用懒加载适当的模块，而其他所有模块也都采用懒加载方式。

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

#### 集成示例

应用程序入口文件（通常是 `main.ts` 文件）的编写方式**取决于多种因素** ，因此**并不存在适用于所有场景的单一模板** 。例如，启动无服务器功能所需的初始化文件会因云服务提供商（AWS、Azure、GCP 等）而异。此外，根据您是要运行具有多个路由/端点的典型 HTTP 应用程序，还是仅提供单个路由（或执行特定代码段），应用程序代码也会有所不同（例如，对于端点即函数的方法，您可以使用 `NestFactory.createApplicationContext` 而不是启动 HTTP 服务器、设置中间件等）。

为了便于说明，我们将把 Nest（使用 `@nestjs/platform-express` 来启动完整且功能齐全的 HTTP 路由器）与 [Serverless](https://www.serverless.com/) 框架（本例中以 AWS Lambda 为目标）进行集成。如前所述，您的代码将根据所选的云服务提供商及其他多种因素而有所不同。

首先，让我们安装所需的软件包：

```bash
$ npm i @codegenie/serverless-express aws-lambda
$ npm i -D @types/aws-lambda serverless-offline
```

> info **提示** 为了加快开发周期，我们安装了 `serverless-offline` 插件来模拟 AWS λ 和 API Gateway。

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

> info **提示** 要了解更多关于 Serverless 框架的信息，请访问 [官方文档](https://www.serverless.com/framework/docs/) 。

完成这些设置后，我们现在可以转到 `main.ts` 文件，用所需的样板代码更新我们的引导代码：

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
  callback: Callback
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
```

> info **提示** 如需创建多个无服务器函数并在它们之间共享公共模块，我们推荐使用 [CLI 单仓库模式](/cli/monorepo#monorepo-mode) 。

> warning **警告** 如果使用 `@nestjs/swagger` 包，需要执行几个额外步骤才能使其在无服务器函数环境中正常工作。查看此 [讨论帖](https://github.com/nestjs/swagger/issues/199) 获取更多信息。

接下来，打开 `tsconfig.json` 文件并确保启用 `esModuleInterop` 选项，以使 `@codegenie/serverless-express` 包能正确加载。

```json
{
  "compilerOptions": {
    ...
    "esModuleInterop": true
  }
}
```

现在我们可以构建应用（使用 `nest build` 或 `tsc`），并通过 `serverless` CLI 在本地启动 lambda 函数：

```bash
$ npm run build
$ npx serverless offline
```

应用启动后，打开浏览器并访问 `http://localhost:3000/dev/[ANY_ROUTE]` （其中 `[ANY_ROUTE]` 表示应用程序中注册的任何端点）。

在前面的章节中，我们已经展示了使用 `webpack` 打包应用会对整体启动时间产生显著影响。但要让其适用于我们的示例，您还需在 `webpack.config.js` 文件中添加一些额外配置。通常，为确保我们的 `handler` 函数能被正确识别，需要将 `output.libraryTarget` 属性修改为 `commonjs2`。

```javascript
return {
  ...options,
  externals: [],
  output: {
    ...options.output,
    libraryTarget: 'commonjs2',
  },
  // ... the rest of the configuration
};
```

完成上述配置后，您现在可以使用 `$ nest build --webpack` 编译函数代码（然后通过 `$ npx serverless offline` 进行测试）。

还建议（但**非必须** ，因为这会延长构建时间）安装 `terser-webpack-plugin` 包并覆盖其配置，以便在生产构建压缩时保持类名不变。若不这样做，在应用中使用 `class-validator` 时可能导致异常行为。

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
  // ... the rest of the configuration
};
```

#### 使用独立应用程序功能

或者，如果您希望保持函数非常轻量级且不需要任何 HTTP 相关功能（路由、守卫、拦截器、管道等），可以仅使用 `NestFactory.createApplicationContext` （如前所述）而不运行整个 HTTP 服务器（以及底层的 `express`），如下所示：

```typescript
@@filename(main)
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

> info **注意** 请注意 `NestFactory.createApplicationContext` 不会用增强器（守卫、拦截器等）包装控制器方法。为此，您必须使用 `NestFactory.create` 方法。

您还可以将 `event` 对象传递给例如 `EventsService` 提供者，该提供者可以处理它并返回相应的值（取决于输入值和业务逻辑）。

```typescript
export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const eventsService = appContext.get(EventsService);
  return eventsService.process(event);
};
```

<!-- 此文件从 content/security/authentication.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:44:19.953Z -->
<!-- 源文件: content/security/authentication.md -->

### 认证

认证是大多数应用程序中的一个**必要**部分。有许多不同的方法和策略来处理认证。任何项目的认证方法都取决于其特定的应用需求。这章将介绍一些认证方法，可以根据不同需求进行适应。

让我们 flesh out我们的需求。对于这个用例，客户将首先使用用户名和密码进行认证。一旦认证成功，服务器将颁发一个 JWT，可以将其作为__LINK_91__在 Authorization 头中发送，以证明认证。我们还将创建一个受保护的路由，只有包含有效 JWT 的请求才能访问。

我们将从第一个需求开始：认证用户。然后，我们将扩展该要求，颁发 JWT。最后，我们将创建一个检查请求中的有效 JWT 的受保护路由。

#### 创建认证模块

我们将从生成一个 `webpack`开始，在其中生成一个 `node_modules` 和一个 `webpack.config.js`。我们将使用 `@nestjs/platform-express` 实现认证逻辑，使用 `webpack` 暴露认证端点。

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

在实现 `webpack`时，我们将发现将用户操作封装在 `$ nest g resource` 中非常有用，所以让我们生成该模块和服务：

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

将 default 内容替换为以下内容。对于我们的示例应用程序，`AppModule` 只是维护了一个硬编码的内存用户列表，并具有find方法来根据用户名检索用户。在实际应用中，这是您将构建用户模型和持久层的地方，使用您的库（例如 TypeORM、Sequelize、Mongoose 等）。

```typescript
if (request.method === RequestMethod[RequestMethod.GET]) {
  const { CacheModule } = await import('./cache.module');
  const moduleRef = await this.lazyModuleLoader.load(() => CacheModule);

  const { CacheService } = await import('./cache.service');
  const cacheService = moduleRef.get(CacheService);

  return cacheService.get(ENDPOINT_KEY);
}

```

在 `LazyModuleLoader` 中，唯一需要更改的是将 `CacheModule` 添加到 `CacheService` 装饰器的 exports 数组中，以便在外部模块中可见（我们将很快使用它在我们的 `main.ts` 中）。

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

#### 实现“登录”端点

我们的 `NestFactory.createApplicationContext` 负责检索用户和验证密码。我们创建了一个 `@nestjs/platform-express` 方法来实现该目的。在以下代码中，我们使用 ES6 spread 操作符将用户对象中的密码属性删除，以便返回用户对象。这是返回用户对象时的一种常见实践，因为您不想暴露敏感字段，如密码或其他安全密钥。

```bash
$ npm i @codegenie/serverless-express aws-lambda
$ npm i -D @types/aws-lambda serverless-offline

```

> 警告 **警告** 在实际应用中，您不应该将密码存储在明文中。您应该使用一个库，如 __LINK_92__，使用 salted one-way hash 算法。这样，您只需要存储哈希密码，然后将 incoming 密码哈希化，以便比较存储密码。为了保持我们的示例应用程序简单，我们违反了这个绝对要求，并使用明文密码。**不要在您的实际应用中这样！**

现在，我们将更新 `serverless-offline`，以便将 `serverless.yml` 导入。

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

现在，让我们打开 `main.ts` 并添加一个 `@nestjs/swagger` 方法到其中。该方法将由客户端调用，以认证用户。它将接收用户名和密码作为请求体，并将返回一个 JWT 令牌，如果用户认证成功。

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

> 提示 **提示** 理想情况下，我们应该使用 DTO 类来定义请求体的形状。见 __LINK_93__ 章节了解更多信息。

__HTML_TAG_89____HTML_TAG_90__

#### JWT 令牌

我们已经准备好移动到 JWT 认证系统的部分。让我们回顾和完善我们的需求：

- 允许用户使用用户名/密码认证，并返回一个 JWT 令牌，以便在受保护的 API 端点上使用该令牌。我们已经很好地实现了这个需求。为了完成它，我们需要编写颁发 JWT 令牌的代码。
- 创建 API 路由，以便在 presence of a valid JWT 作为 Bearer 令牌时进行保护

我们需要安装一个额外的包来支持我们的 JWT 需求：

```json
{
  "compilerOptions": {
    ...
    "esModuleInterop": true
  }
}

```

> 提示 **提示** `esModuleInterop` 包（见 __LINK_94__）是一个帮助 JWT 操作的工具包。这包括生成和验证 JWT 令牌。

为了保持我们的服务模块化，我们将在 `@codegenie/serverless-express` 中生成 JWT 令牌。打开 `nest build` 文件，在 `tsc` 文件夹中注入 `serverless`，并更新 `http://localhost:3000/dev/[ANY_ROUTE]` 方法以生成 JWT 令牌，如以下所示：

```bash
$ npm run build
$ npx serverless offline

```

Here is the translation of the English technical documentation to Chinese:

我们使用 `[ANY_ROUTE]` 库，提供了 `webpack` 函数来生成 JWT，从 `webpack.config.js` 对象的部分属性生成，然后将其作为一个简单的对象返回，其中只有一个 `handler` 属性。注意，我们选择了 `output.libraryTarget` 属性名来存储我们的 `commonjs2` 值，以保持与 JWT 标准一致。

现在，我们需要更新 `$ nest build --webpack`，以导入新的依赖项并配置 `$ npx serverless offline`。

首先，在 `class-validator` 文件夹中创建 `terser-webpack-plugin`，并添加以下代码：

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

我们将使用这个来共享我们的密钥 между JWT 签名和验证步骤。

> 警告 **Warning** **不要公开这个密钥**。我们这里公开了，以便使代码更容易理解，但在生产环境中 **您必须保护这个密钥**，使用适当的措施，如秘密库、环境变量或配置服务。

现在，打开 `express` 文件夹中的 `NestFactory.createApplicationContext`，并更新它以看起来像这样：

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

> 提示 **Hint** 我们将 `NestFactory.createApplicationContext` 注册为全局，以便使事情变得更容易。这样，我们不需要在应用程序中导入 `NestFactory.create`。

我们使用 `EventsService` 配置 `event`，将配置对象作为参数。查看 __LINK_95__以了解 Nest 中的 __INLINE_CODE_60__，和 __LINK_96__以了解可用的配置选项。

让我们继续测试我们的路由使用 cURL。您可以使用 __INLINE_CODE_62__ 中硬编码的 __INLINE_CODE_61__ 对象进行测试。

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

#### 实现身份验证守卫

现在，我们可以实现我们的最后一个要求：保护端点，要求请求中存在有效的 JWT。我们将使用 __INLINE_CODE_63__ 创建守卫，以保护我们的路由。

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

现在，我们可以实现我们的受保护路由，并将 __INLINE_CODE_64__ 注册为保护它。

打开 __INLINE_CODE_65__ 文件，并更新它以看起来像这样：

__CODE_BLOCK_13__

我们将 __INLINE_CODE_66__ 应用到 __INLINE_CODE_67__ 路由上，以便保护它。

确保应用程序正在运行，并使用 __INLINE_CODE_68__ 测试路由。

__CODE_BLOCK_14__

在 __INLINE_CODE_69__ 中，我们配置了 JWT 的有效期为 __INLINE_CODE_70__。这太短了，处理 token 有效期和刷新是超出了本文的范围。然而，我们选择了这个，以演示 JWT 的一个重要特性。如果您在身份验证后等待 60 秒，然后尝试 __INLINE_CODE_71__ 请求，您将收到 __INLINE_CODE_72__ 响应。这是因为 __INLINE_CODE_73__ 自动检查 JWT 的有效期，省去了您在应用程序中做出检查的麻烦。

我们现在已经完成了 JWT 身份验证实现。JavaScript 客户端（如 Angular/React/Vue），和其他 JavaScript 应用程序，可以现在身份验证和安全地与我们的 API 服务器通信。

#### 启用身份验证

如果您的大多数端点都应该被默认保护，可以将身份验证守卫注册为 __LINK_97__，而不是使用 __INLINE_CODE_74__ 装饰器在每个控制器上。相反，您可以简单地标记哪些路由应该是公共的。

首先，在任何模块中（例如，在 __INLINE_CODE_76__ 中），使用以下构造注册 __INLINE_CODE_75__：

__CODE_BLOCK_15__

现在，我们必须提供一个机制来声明路由为公共的。为此，我们可以创建一个自定义装饰器，使用 __INLINE_CODE_78__ 装饰器工厂函数。

__CODE_BLOCK_16__

在上面的文件中，我们导出了两个常量。一个是我们的元数据键 __INLINE_CODE_79__，另一个是我们的新装饰器 __INLINE_CODE_80__（您可以将其命名为 __INLINE_CODE_81__ 或 __INLINE_CODE_82__，whatever fits your project）。

现在，我们已经有了自定义 __INLINE_CODE_83__ 装饰器，可以使用它来装饰任何方法，例如：

__CODE_BLOCK_17__

最后，我们需要 __INLINE_CODE_84__ 返回 __INLINE_CODE_85__，当找到 __INLINE_CODE_86__ 元数据时。为此，我们将使用 __INLINE_CODE_87__ 类（阅读更多 __LINK_98__）。

__CODE_BLOCK_18__

#### Passports 集成

__LINK_99__ 是 Node.js 认证库，社区广泛使用和成功应用于许多生产应用程序。使用 __INLINE_CODE_88__ 模块，可以轻松地将这个库集成到 **Nest** 应用程序中。

要了解如何将 Passport 集成到 NestJS 中，请查看这个 __LINK_100__。

#### 示例

您可以在本章中找到完整的代码 __LINK_101__。
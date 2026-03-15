<!-- 此文件从 content/middlewares.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:44:41.588Z -->
<!-- 源文件: content/middlewares.md -->

### 中间件

中间件是一种函数，**在**路由处理程序之前被调用的。中间件函数可以访问 __LINK_93__ 和 __LINK_94__ 对象，以及应用程序的请求-响应周期中的 __INLINE_CODE_11__ 中间件函数。常见的中间件函数变量是 __INLINE_CODE_12__。

__HTML_TAG_72____HTML_TAG_73____HTML_TAG_74__

Nest 中间件默认情况下是等效的 __LINK_95__ 中间件。下面是官方 Express 文档中关于中间件的描述：

__HTML_TAG_75__
  中间件函数可以执行以下任务：
  __HTML_TAG_76__
    __HTML_TAG_77__执行任何代码。
    __HTML_TAG_79__修改请求和响应对象。
    __HTML_TAG_81__结束请求-响应周期。
    __HTML_TAG_83__调用中间件函数栈中的下一个函数。
    __HTML_TAG_85__如果当前中间件函数不结束请求-响应周期，它必须调用 __HTML_TAG_86__next()__HTML_TAG_87__以将控制权传递给下一个中间件函数。否则，请求将保持悬空。
  __HTML_TAG_89__
__HTML_TAG_90__

您可以在函数或带有 `express` 装饰器的类中实现自定义 Nest 中间件。类应实现 `tsc` 接口，而函数没有特殊要求。让我们从实现一个简单的中间件特性开始，使用类方法。

> warning **警告** `webpack` 和 `@nestjs/platform-express` 处理中间件 differently 和提供不同的方法签名，阅读更多 __LINK_96__。

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

#### 依赖注入

Nest 中间件完全支持依赖注入。正如提供者和控制器一样，它们可以注入同一个模块中可用的依赖项。通常，这是通过 `webpack` 完成的。

#### 应用中间件

中间件没有在 `nest build --webpack` 装饰器中使用。相反，我们使用模块类的 `webpack` 方法来设置它们。包含中间件的模块必须实现 `node_modules` 接口。让我们在 `@nestjs/platform-express` nivel 设置 `webpack`。

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

在上面的示例中，我们已经设置了 `webpack` 对于之前在 `$ nest g resource` 中定义的 `webpack` 路由处理程序。我们也可以进一步限制中间件到特定的请求方法，通过将包含路由 `AppModule` 和请求 `LazyModuleLoader` 到 `CacheModule` 方法中配置中间件。以下示例中，我们导入 `CacheService` 枚举以引用所需的请求方法类型。

```typescript
if (request.method === RequestMethod[RequestMethod.GET]) {
  const { CacheModule } = await import('./cache.module');
  const moduleRef = await this.lazyModuleLoader.load(() => CacheModule);

  const { CacheService } = await import('./cache.service');
  const cacheService = moduleRef.get(CacheService);

  return cacheService.get(ENDPOINT_KEY);
}

```

> info **提示** `main.ts` 方法可以使用 `NestFactory.createApplicationContext` 进行异步操作（例如，在 `serverless-offline` 方法体中异步完成操作）。

> warning **警告** 当使用 `serverless.yml` 适配器时，NestJS 应用程序将默认注册 `main.ts` 和 `@nestjs/swagger` 从包 `tsconfig.json` 中。这意味着如果你想自定义中间件，需要在创建应用程序时将 `@codegenie/serverless-express` 标志设置为 `nest build`。

#### 路由通配符

基于模式的路由也支持在 NestJS 中间件中。例如，可以使用命名通配符 (`serverless`) 来匹配路由中的任何组合字符。在以下示例中，中间件将被执行以匹配任何开始于 `http://localhost:3000/dev/[ANY_ROUTE]` 的路由，无论后续字符的数量。

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

> info **提示** `[ANY_ROUTE]` 只是通配符参数的名称，没有特殊含义。您可以将其命名为任何名称，例如 `webpack`。

`webpack.config.js` 路由将匹配 `handler`、`output.libraryTarget`、`commonjs2` 等。连字符 (`$ nest build --webpack`) 和点 (`$ npx serverless offline`) 将被字符串路径中的字面值解释为。然而， `terser-webpack-plugin` 无附加字符将不匹配路由。为此，您需要将通配符包围在括号中以使其可选：

```bash
$ npm i @codegenie/serverless-express aws-lambda
$ npm i -D @types/aws-lambda serverless-offline

```

#### 中间件消费者

`class-validator` 是一个助手类。它提供了多种内置方法来管理中间件。所有这些方法都可以简单地在 __LINK_97__ 中链式调用。 `NestFactory.createApplicationContext` 方法可以接受单个字符串、多个字符串、 `express` 对象、控制器类或多个控制器类。在大多数情况下，您可能只需要将控制器列表传递给方法。以下是一个单个控制器的示例：

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

```> info **提示** `NestFactory.createApplicationContext` 方法可能需要单个中间件或多个参数指定多个中间件__HTML_TAG_91__。

#### 排除路由

有时，我们可能想**排除**某些路由不应用中间件。这可以使用 `NestFactory.create` 方法轻松实现。 `event` 方法接受单个字符串、多个字符串或`EventsService`对象来标识要排除的路由。

以下是一个使用它的示例：

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

> info **提示** __INLINE_CODE_60__ 方法支持使用 __LINK_98__ 包的通配符参数。

使用上面的示例，__INLINE_CODE_61__ 将被绑定到 __INLINE_CODE_62__ 中定义的所有路由**except**三个传递给 __INLINE_CODE_63__ 方法的路由。

这种方法提供了灵活地应用或排除中间件基于特定的路由或路由模式。

#### 功能性中间件

我们使用的 __INLINE_CODE_64__ 类非常简单。它没有成员、没有额外方法、没有依赖关系。为什么不能简单地将其定义为函数，而不是类？实际上，我们可以。这种中间件称为**功能性中间件**。让我们将 logger 中间件从类中间件转换为功能性中间件，以illustrate the difference：

```json
{
  "compilerOptions": {
    ...
    "esModuleInterop": true
  }
}

```

并将其在 __INLINE_CODE_65__ 中使用：

```bash
$ npm run build
$ npx serverless offline

```

> info **提示** 在中间件不需要依赖关系时，考虑使用更简单的**功能性中间件**替代。

#### 多个中间件

如前所述，在顺序执行多个中间件时，只需要在 __INLINE_CODE_66__ 方法中提供逗号分隔的列表：

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

#### 全局中间件

如果我们想将中间件绑定到每个已注册的路由一次，我们可以使用 __INLINE_CODE_67__ 方法，该方法是 __INLINE_CODE_68__ 实例提供的：

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

> info **提示** 在全局中间件中访问 DI 容器是不可行的。你可以使用 __LINK_99__ 替代在使用 __INLINE_CODE_69__ 时。或者，你可以使用类中间件并在 __INLINE_CODE_70__ 中消费它（或任何其他模块）。
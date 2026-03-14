<!-- 此文件从 content/middlewares.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:22:58.023Z -->
<!-- 源文件: content/middlewares.md -->

### Middleware

Middleware 是一个在路由处理器之前被调用的函数。Middleware 函数可以访问请求对象(__LINK_93__)和响应对象(__LINK_94__),并且可以在应用程序的请求-响应周期中访问 __INLINE_CODE_11__ 中间件函数。next 中间件函数通常被保存在名为 __INLINE_CODE_12__ 的变量中。

__HTML_TAG_72____HTML_TAG_73____HTML_TAG_74__

Nest 中间件默认与 Express 中间件相同。下面是官方 Express 文档中关于中间件的描述：

__HTML_TAG_75__
  中间件函数可以执行以下任务：
  __HTML_TAG_76__
    __HTML_TAG_77__执行任何代码。
    __HTML_TAG_78__修改请求对象和响应对象。
    __HTML_TAG_79__结束请求-响应周期。
    __HTML_TAG_80__调用下一个中间件函数。
    __HTML_TAG_81__如果当前中间件函数不结束请求-响应周期，它必须调用 __HTML_TAG_86__next()__HTML_TAG_87__以便将控制权传递给下一个中间件函数。否则，请求将保持不活动。
  __HTML_TAG_89__
__HTML_TAG_90__

您可以使用函数或带有 `express` 装饰器的类来实现自定义 Nest 中间件。类应该实现 `tsc` 接口，而函数没有特殊要求。让我们从实现一个简单的中间件功能开始。

> warning 提示：`webpack` 和 `@nestjs/platform-express` 处理中间件 differently 和提供不同的方法签名，请阅读更多 __LINK_96__。

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

Nest 中间件完全支持依赖注入。正如对 providers 和 controllers 一样，它们可以注入同一个模块中的依赖项。通常，这是通过 `webpack` 完成的。

#### 应用中间件

中间件不在 `nest build --webpack` 装饰器中，而是在模块类的 `webpack` 方法中设置的。包含中间件的模块必须实现 `node_modules` 接口。让我们在 `@nestjs/platform-express` 级别设置 `webpack.config.js`。

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

在上面的示例中，我们已经为 `webpack` 路由处理器设置了 `webpack`。我们还可以将中间件限制到特定的请求方法中，通过在配置中间件时传递包含路由 `AppModule` 和请求 `LazyModuleLoader` 的对象。下面是一个示例，注意我们导入了 `CacheService` 枚举以引用所需的请求方法类型。

```typescript
if (request.method === RequestMethod[RequestMethod.GET]) {
  const { CacheModule } = await import('./cache.module');
  const moduleRef = await this.lazyModuleLoader.load(() => CacheModule);

  const { CacheService } = await import('./cache.service');
  const cacheService = moduleRef.get(CacheService);

  return cacheService.get(ENDPOINT_KEY);
}

```

> info 提示：`main.ts` 方法可以使用 `NestFactory.createApplicationContext` 进行异步化（例如，在 `serverless-offline` 方法体中完成异步操作）。

> warning 提示：当使用 `serverless.yml` 适配器时,NestJS 应用将默认注册 `main.ts` 和 `@nestjs/swagger` 从包 `tsconfig.json` 中。如果您想自定义中间件，请将 `@codegenie/serverless-express` 标志设置为 `nest build`，以便在创建应用时使用 `tsc`。

#### 路由通配符

基于模式的路由也支持在 NestJS 中间件中。例如，可以使用命名通配符(`serverless`)来匹配路由中的任何组合。下面是一个示例，中间件将执行任何以 `http://localhost:3000/dev/[ANY_ROUTE]` 开头的路由，无论后续字符的数量。

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

> info 提示：`[ANY_ROUTE]` 是通配符参数的名称，它没有特别的含义。您可以将其命名为任何名称，例如 `webpack`。

`webpack.config.js` 路由将匹配 `handler`、`output.libraryTarget`、`commonjs2` 等。连字符(`$ nest build --webpack`)和点(`$ npx serverless offline`)将被字符串路径中的字面值解释。然而，`terser-webpack-plugin` 无加以字符将不匹配路由。为此，您需要将通配符包围在花括号中以使其可选：

```bash
$ npm i @codegenie/serverless-express aws-lambda
$ npm i -D @types/aws-lambda serverless-offline

```

#### 中间件消费者

`class-validator` 是一个helper 类。它提供了多种内置方法来管理中间件。所有这些方法都可以在 __LINK_97__ 中简单地“链式”调用。`NestFactory.createApplicationContext` 方法可以接受一个字符串、多个字符串、一个 `express` 对象、一个控制器类或多个控制器类。在大多数情况下，您可能只需要传递一个包含控制器的列表，使用逗号分隔。下面是一个使用单个控制器的示例：

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

```> info **提示** `NestFactory.createApplicationContext` 方法可能接受单个中间件或多个参数，以指定多个中间件。

#### 排除路由

有时，我们可能需要 **排除**Certain routes from having middleware applied. This can be easily achieved using the `NestFactory.create` method. The `event` method accepts a single string, multiple strings, or a `EventsService` object to identify the routes to be excluded.

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

> info **提示** __INLINE_CODE_60__ 方法支持使用 __LINK_98__ 包中的通配符参数。

使用上面的示例,__INLINE_CODE_61__ 将被绑定到 __INLINE_CODE_62__ 内部定义的所有路由 **except** 传递给 __INLINE_CODE_63__ 方法的三个。

这种方法提供了在特定路由或路由模式上应用或排除中间件的灵活性。

#### 功能中间件

我们使用的 __INLINE_CODE_64__ 类非常简单。它没有成员、方法或依赖项。为什么我们不能简单地将其定义为一个函数，而不是一个类？实际上，我们可以。这种中间件称为 **功能中间件**。让我们将 logger 中间件从类中间件转换为功能中间件，以illustrate the difference：

```json
{
  "compilerOptions": {
    ...
    "esModuleInterop": true
  }
}

```

并在 __INLINE_CODE_65__ 中使用它：

```bash
$ npm run build
$ npx serverless offline

```

> info **提示** 在您的中间件不需要任何依赖项时，请考虑使用更简单的 **功能中间件** 替代。

#### 多个中间件

正如上面所提到的，在 order to bind multiple middleware that are executed sequentially, simply provide a comma separated list inside the __INLINE_CODE_66__ method：

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

如果我们想将中间件绑定到每个已注册的路由上一次，我们可以使用 __INLINE_CODE_67__ 方法，该方法由 __INLINE_CODE_68__ 实例提供：

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

> info **提示** 在全局中间件中访问 DI 容器是不可行的。你可以使用 __LINK_99__ 代替在使用 __INLINE_CODE_69__ 时。或者，你可以使用类中间件，并在 __INLINE_CODE_70__ 中使用 __INLINE_CODE_71__ (或任何其他模块)。
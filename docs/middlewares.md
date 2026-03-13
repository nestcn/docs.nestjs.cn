<!-- 此文件从 content/middlewares.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:25:57.977Z -->
<!-- 源文件: content/middlewares.md -->

### 中间件

中间件是一种函数，会在路由处理器之前被调用。中间件函数可以访问请求和响应对象，并且可以在应用程序的请求-响应周期中调用 __INLINE_CODE_11__ 中间件函数。中间件函数的下一个函数通常被denoted为变量 __INLINE_CODE_12__。

__HTML_TAG_72____HTML_TAG_73____HTML_TAG_74__

Nest 中间件默认情况下与 Express 中间件相等。以下是官方 Express 文档中对中间件的描述：

__HTML_TAG_75__
  中间件函数可以执行以下任务：
  __HTML_TAG_76__
    __HTML_TAG_77__执行任何代码。
    __HTML_TAG_79__更改请求和响应对象。
    __HTML_TAG_81__结束请求-响应周期。
    __HTML_TAG_83__调用下一个中间件函数。
    __HTML_TAG_85__如果当前中间件函数不结束请求-响应周期，它必须调用 __HTML_TAG_86__next()__HTML_TAG_87__以将控制权传递给下一个中间件函数。否则，请求将被留下。
  __HTML_TAG_89__
__HTML_TAG_90__

您可以使用函数或带有 `express` 装饰器的类来实现自定义 Nest 中间件。类应该实现 `tsc` 接口，而函数没有特殊要求。让我们从实现一个简单的中间件特性开始。

> warning **警告** `webpack` 和 `@nestjs/platform-express` 处理中间件 differently 和提供不同的方法签名，请阅读更多 __LINK_96__。

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

Nest 中间件完全支持依赖注入。与提供者和控制器一样，它们可以注入同一个模块中的依赖项。通常，这是通过 `webpack` 实现的。

#### 应用中间件

中间件不在 `nest build --webpack` 装饰器中，而是使用模块类的 `webpack` 方法来设置它们。包含中间件的模块需要实现 `node_modules` 接口。让我们在 `@nestjs/platform-express`级别设置 `webpack.config.js`。

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

在上面的示例中，我们已经设置了 `webpack` 对 `webpack` 路由处理器，之前在 `$ nest g resource` 中定义的路由处理器。我们也可以进一步限制中间件到特定的请求方法通过在配置中间件时传递包含路由 `AppModule` 和请求 `LazyModuleLoader` 的对象。以下示例中，我们导入 `CacheService` 枚举以引用所需的请求方法类型。

```typescript
if (request.method === RequestMethod[RequestMethod.GET]) {
  const { CacheModule } = await import('./cache.module');
  const moduleRef = await this.lazyModuleLoader.load(() => CacheModule);

  const { CacheService } = await import('./cache.service');
  const cacheService = moduleRef.get(CacheService);

  return cacheService.get(ENDPOINT_KEY);
}

```

> info **提示** `main.ts` 方法可以使用 `NestFactory.createApplicationContext` 进行异步操作（例如，在 `serverless-offline` 方法体中完成异步操作）。

> warning **警告** 使用 `serverless.yml` 适配器时，NestJS 应用程序将注册 `main.ts` 和 `@nestjs/swagger` 从包 `tsconfig.json` 中。如果您想自定义这些中间件，请在创建应用程序时将 `@codegenie/serverless-express` 标志设置为 `nest build`。

#### 路由通配符

基于模式的路由也支持在 NestJS 中间件中。例如，命名通配符 (`serverless`) 可以用作通配符，以匹配路由中的任何字符组合。在以下示例中，中间件将执行任何以 `http://localhost:3000/dev/[ANY_ROUTE]` 开头的路由，无论后续字符的数量。

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

> info **提示** `[ANY_ROUTE]` 是通配符参数的名称，没有特别的含义。您可以将其命名为任何名称，例如 `webpack`。

`webpack.config.js` 路由将匹配 `handler`, `output.libraryTarget`, `commonjs2`, 等等。反斜杠 ( `$ nest build --webpack`) 和点 (`$ npx serverless offline`) 将被字符串路径中的字面值解释。但是 `terser-webpack-plugin` 不会匹配路由。为此，您需要将通配符包围在括号中以使其可选：

```bash
$ npm i @codegenie/serverless-express aws-lambda
$ npm i -D @types/aws-lambda serverless-offline

```

#### 中间件消费者

`class-validator` 是一个帮助类，可以提供多种方法来管理中间件。所有它们都可以简单地在 __LINK_97__ 中chain。`NestFactory.createApplicationContext` 方法可以接受单个字符串、多个字符串、 `express` 对象、控制器类或多个控制器类。通常，您可能只传递一个或多个控制器，以下示例中，我们传递一个单个控制器：

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

```>  info **Hint** `NestFactory.createApplicationContext` 方法可以以单个中间件或多个参数形式指定多个中间件。

#### 排除路由

有时，我们可能想要排除某些路由不应用中间件。这可以使用 `NestFactory.create` 方法轻松实现。 `event` 方法接受单个字符串、多个字符串或 `EventsService` 对象来识别要排除的路由。

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

>  info **Hint** __INLINE_CODE_60__ 方法支持使用 __LINK_98__ 包的通配符参数。

使用上面的示例,__INLINE_CODE_61__ 将被绑定到 __INLINE_CODE_62__ 内部定义的所有路由中 **except** 三个被传递给 __INLINE_CODE_63__ 方法的路由。

这个方法提供了根据特定路由或路由模式应用或排除中间件的灵活性。

#### 功能中间件

我们使用的 __INLINE_CODE_64__ 类非常简单。它没有成员、没有额外方法、没有依赖项。为什么不能简单地将其定义为函数，而不是类？实际上，我们可以。这种中间件称为 **功能中间件**。让我们将 logger 中间件从类转换为功能中间件，以illustrate the difference：

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

>  info **Hint** 在您的中间件不需要依赖项时，请考虑使用更简单的 **功能中间件**  alternative。

#### 多个中间件

如前所述，为将多个中间件执行顺序绑定，可以将它们以逗号分隔的列表形式传递给 __INLINE_CODE_66__ 方法：

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

如果我们想要将中间件绑定到每个注册的路由上一次，可以使用 __INLINE_CODE_67__ 方法，该方法由 __INLINE_CODE_68__ 实例提供：

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

>  info **Hint** 在全局中间件中访问 DI 容器是不可能的。你可以使用 __LINK_99__ 而不是 __INLINE_CODE_69__。alternatively, you can use a class middleware and consume it with __INLINE_CODE_70__ within the __INLINE_CODE_71__ (or any other module).

Note: I have followed the guidelines to translate the technical documentation from English to Chinese. I have kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged.
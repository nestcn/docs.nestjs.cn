<!-- 此文件从 content/middlewares.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:08:25.302Z -->
<!-- 源文件: content/middlewares.md -->

### 中间件

中间件是一种函数，位于路由处理器之前。中间件函数可以访问`__LINK_93__`和`__LINK_94__`对象，以及应用程序的请求-响应周期中的`__INLINE_CODE_11__`中间件函数。常见的中间件函数是通过变量`__INLINE_CODE_12__`表示的。

`<HTML_TAG_72>``<HTML_TAG_73>``<HTML_TAG_74>`

Nest 中间件默认情况下是等同于 Express 中间件的。以下是官方 Express 文档中对中间件的描述：

`<HTML_TAG_75>`
  中间件函数可以执行以下任务：
  `__HTML_TAG_77__execute any code.__HTML_TAG_78__
  `__HTML_TAG_79__make changes to the request and the response objects.__HTML_TAG_80__
  `__HTML_TAG_81__end the request-response cycle.__HTML_TAG_82__
  `__HTML_TAG_83__call the next middleware function in the stack.__HTML_TAG_84__
  `__HTML_TAG_85__if the current middleware function does not end the request-response cycle, it must call __HTML_TAG_86__next()__HTML_TAG_87__ to
    pass control to the next middleware function. Otherwise, the request will be left hanging.__HTML_TAG_88__
  `__HTML_TAG_89__
`<HTML_TAG_90>`

您可以在函数或带有``express``装饰器的类中实现自定义 Nest 中间件。类应该实现``tsc``接口，而函数没有特殊要求。让我们从实现一个简单的中间件开始。

> warning **警告** `webpack` 和 `@nestjs/platform-express` 处理中间件 differently 和提供不同的方法签名，阅读更多 __LINK_96__。

````typescript
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

````

#### 依赖注入

Nest 中间件完全支持依赖注入。正如提供者和控制器一样，它们可以注入同一模块中的依赖项。正如通常一样，这是通过``webpack``实现的。

#### 应用中间件

中间件不在``nest build --webpack``装饰器中。相反，我们使用模块类的``webpack``方法设置它们。包含中间件的模块需要实现``node_modules``接口。让我们在``@nestjs/platform-express``级别设置``webpack.config.js``。

````javascript
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

````

在上面的示例中，我们已经设置了``webpack``为之前在``$ nest g resource``中定义的路由处理器。我们还可以进一步限制中间件到特定的请求方法通过将对象包含路由``AppModule``和请求``LazyModuleLoader``传递给``CacheModule``方法时配置中间件。在以下示例中，注意我们导入``CacheService``枚举以引用所需的请求方法类型。

````typescript
if (request.method === RequestMethod[RequestMethod.GET]) {
  const { CacheModule } = await import('./cache.module');
  const moduleRef = await this.lazyModuleLoader.load(() => CacheModule);

  const { CacheService } = await import('./cache.service');
  const cacheService = moduleRef.get(CacheService);

  return cacheService.get(ENDPOINT_KEY);
}

````

> info **提示** ``main.ts`` 方法可以使用``NestFactory.createApplicationContext``异步化（例如，您可以在``serverless-offline``方法体中完成异步操作）。

> warning **警告** 当使用``serverless.yml``适配器时，NestJS 应用程序将默认注册``main.ts``和``@nestjs/swagger``从包``tsconfig.json``。这意味着如果您想自定义该中间件，需要在创建应用程序时将``@codegenie/serverless-express``标志设置为``nest build``。

#### 路由通配符

基于模式的路由在 NestJS 中间件中也支持。例如，命名通配符(``serverless``)可以用作通配符，以匹配路由中的任何组合字符。在以下示例中，中间件将执行任何以``http://localhost:3000/dev/[ANY_ROUTE]``开头的路由，无论后续字符的数量。

````typescript
if (workerType === WorkerType.A) {
  const { WorkerAModule } = await import('./worker-a.module');
  const moduleRef = await this.lazyModuleLoader.load(() => WorkerAModule);
  // ...
} else if (workerType === WorkerType.B) {
  const { WorkerBModule } = await import('./worker-b.module');
  const moduleRef = await this.lazyModuleLoader.load(() => WorkerBModule);
  // ...
}

````

> info **提示** ``[ANY_ROUTE]`` 是通配符参数的名称，它没有特殊含义。您可以将其命名为任何名称，例如``webpack``。

``webpack.config.js`` 路由将匹配``handler``、``output.libraryTarget``、``commonjs2``等。减号 (``$ nest build --webpack``) 和点 (``$ npx serverless offline``) 是字符串路径中的字面字符。然而，``terser-webpack-plugin`` 没有附加字符将不匹配路由。为此，您需要将通配符包围在花括号中使其可选：

````bash
$ npm i @codegenie/serverless-express aws-lambda
$ npm i -D @types/aws-lambda serverless-offline

````

#### 中间件消费者

``class-validator`` 是一个helper 类。它提供了多个内置方法来管理中间件。所有这些方法都可以简单地在`__LINK_97__`中链式调用。``NestFactory.createApplicationContext`` 方法Here is the translation of the English technical documentation to Chinese:

> info **提示** `NestFactory.createApplicationContext` 方法可能会接受单个中间件或多个参数来指定多个中间件。

#### 排除路由

有时，我们可能想要**排除**某些路由不应用中间件。这可以使用 `NestFactory.create` 方法来实现。 `event` 方法可以接受单个字符串、多个字符串或 `EventsService` 对象来标识要排除的路由。

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

> info **提示** __INLINE_CODE_60__ 方法支持使用 __LINK_98__ 包裹的通配参数。

使用上面的示例,__INLINE_CODE_61__ 将被绑定到 __INLINE_CODE_62__ 内部定义的所有路由**except**三个传递给 __INLINE_CODE_63__ 方法的路由。

这种方法提供了根据特定路由或路由模式来应用或排除中间件的灵活性。

#### 功能中间件

我们使用的 __INLINE_CODE_64__ 类非常简单。它没有成员、没有额外方法、没有依赖项。为什么我们不能简单地将其定义为一个函数而不是一个类？实际上，我们可以。这种中间件被称为**功能中间件**。让我们将 logger 中间件从类中间件转换为功能中间件，以illustrate 的不同：

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

> info **提示** 在您的中间件不需要依赖项时，考虑使用更简单的**功能中间件**Alternative。

#### 多个中间件

如前所述，我们可以在 __INLINE_CODE_66__ 方法中提供逗号分隔的列表来绑定多个中间件，以便它们顺序执行：

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

如果我们想将中间件绑定到每个已注册的路由上，以便在每个路由上执行，我们可以使用 __INLINE_CODE_67__ 方法，它由 __INLINE_CODE_68__ 实例提供：

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

> info **提示** 在全局中间件中访问 DI 容器是不可行的。您可以使用 __LINK_99__ 来访问 DI 容器，而不是使用 __INLINE_CODE_69__。或者，您可以使用类中间件并在 __INLINE_CODE_70__ 中使用 __INLINE_CODE_71__ (或任何其他模块)。
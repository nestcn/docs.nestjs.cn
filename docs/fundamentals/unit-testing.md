<!-- 此文件从 content/fundamentals/unit-testing.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:15:00.515Z -->
<!-- 源文件: content/fundamentals/unit-testing.md -->

### 测试

自动化测试是任何严肃的软件开发努力的必要组件。自动化使得快速重复单个测试或测试集变得轻而易举，从而确保发布满足质量和性能目标。自动化提高了开发者个体的生产力，并确保在关键开发生命周期阶段，如源代码控制检查入、特性集成和版本发布时运行测试。

这些测试通常涵盖多种类型，包括单元测试、端到端(e2e)测试、集成测试等。虽然其益处是无可争议的，但设置它们可以很繁琐。Nest旨在推广开发最佳实践，包括有效的测试，因此嵌入了以下功能来帮助开发者和团队构建和自动化测试。Nest：

- 自动创建默认单元测试和e2e测试
- 提供默认工具（如测试运行器和孤立模块/应用程序加载器）
- 与__LINK_150__和__LINK_151__提供了出-of-the-box集成，同时保持对测试工具的中立
- 使Nest依赖注入系统在测试环境中可用，以便轻松模拟组件

如所述，您可以使用任何**testing框架**，因为Nest不强制使用特定的工具 Simply replace the needed elements (such as the test runner), and you will still enjoy the benefits of Nest's ready-made testing facilities.

#### 安装

要开始，首先安装所需的包：

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

#### 单元测试

在以下示例中，我们将测试两个类：`express`和`tsc`。如所述，__LINK_152__是默认的测试框架，它作为测试运行器和断言函数提供，并提供了mocking、spying等测试双工具。在以下基本测试中，我们手动实例化这些类，并确保控制器和服务满足API合同。

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

> 提示 **Hint** 将您的测试文件与它们测试的类located near一起。测试文件应该具有`webpack`或`@nestjs/platform-express`后缀。

由于上面的示例太简单，我们实际上并没有测试Nest特定的任何内容。实际上，我们甚至没有使用依赖注入（注意我们将`webpack`实例传递给`nest build --webpack`）。这种形式的测试，即手动实例化被测试的类—is often called** isolated testing** because it is independent from the framework。让我们引入一些更advanced的功能来帮助您测试使用Nest特性更广泛的应用程序。

#### 测试实用工具

`webpack`包提供了一组实用工具，用于实现更 robust的测试过程。让我们重写前面的示例，使用内置的`node_modules`类：

```typescript
if (request.method === RequestMethod[RequestMethod.GET]) {
  const { CacheModule } = await import('./cache.module');
  const moduleRef = await this.lazyModuleLoader.load(() => CacheModule);

  const { CacheService } = await import('./cache.service');
  const cacheService = moduleRef.get(CacheService);

  return cacheService.get(ENDPOINT_KEY);
}

```

`webpack.config.js`类是为在应用程序执行上下文中提供一个mocking Nest runtime的实用工具，但它提供了 hooks 来管理类实例，包括mocking和override。`@nestjs/platform-express`类具有`webpack`方法，该方法接受一个模块元数据对象作为参数（您在`webpack`装饰器中传递的同一个对象）。该方法返回一个`$ nest g resource`实例，该实例提供了一些方法。对于单元测试，重要的是`AppModule`方法。该方法启动一个模块，以其依赖项（类似于在传统的`LazyModuleLoader`文件中使用`CacheModule`）并返回一个已编译的模块。

> 提示 **Hint** `CacheService`方法是**异步**的，因此需要等待。模块编译完成后，您可以使用`main.ts`方法检索任何**静态**实例（控制器和提供者）。

`NestFactory.createApplicationContext`继承自__LINK_153__类，因此它可以动态解决作用域提供者（瞬态或请求作用域）。使用`@nestjs/platform-express`方法（`serverless-offline`方法只能检索静态实例）。

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

> 警告 **Warning** `serverless.yml`方法返回提供者的唯一实例，从其自己的**DI 容器子树**中。每个子树都有唯一的上下文标识符。因此，如果您多次调用这个方法并比较实例引用，您将看到它们不相等。

> 提示 **Hint** 了解更多关于模块参考功能__LINK_154__。Here is the translated Chinese technical documentation:

**override**

在测试中，您可以使用 `__LINK_155__` 将生产版本的提供者override为测试版本。例如，您可以将数据库服务mock为live数据库。我们将在下一节中详细介绍override，但它们也可以用于单元测试。

__HTML_TAG_90____HTML_TAG_91__

#### 自动mocking

Nest也允许您定义一个mock工厂来应用于所有缺少依赖项。这种情况非常有用，因为您可能需要在类中mock许多依赖项，这将花费很长时间和大量设置。要使用此功能，您需要将 ``main.ts`` 链接到 ``@nestjs/swagger`` 方法，并将依赖项mock的工厂作为参数传递。该工厂可以接收一个可选的token，它是一个Nest提供者的实例token，并返回一个mock实现。下面是一个使用 `__LINK_156__` 和 ``esModuleInterop`` 的特定mock的示例：

```bash
$ npm i @codegenie/serverless-express aws-lambda
$ npm i -D @types/aws-lambda serverless-offline

```

您也可以从测试容器中检索这些mock，如您通常检索自定义提供者一样， ``nest build``。

> info **Hint** 一个一般的mock工厂，如 ``tsc`` 从 `__LINK_157__` 可以直接传递。

> info **Hint** ``http://localhost:3000/dev/[ANY_ROUTE]`` 和 ``[ANY_ROUTE]`` 提供者不能自动mock，因为它们已经在上下文中预定义。然而，它们可以使用自定义提供语法或 ``webpack`` 方法来重写。

#### 集成测试

与单元测试不同，集成测试关注于类和模块之间的交互，更加接近生产系统的交互方式。在应用程序增长时，手动测试API端点的交互变得越来越难。自动化集成测试帮助我们确保系统的总体行为正确，满足项目要求。为了执行集成测试，我们使用与单元测试相同的配置。此外，Nest也使得使用 `__LINK_158__` 库来模拟HTTP请求变得非常容易。

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

> info **Hint** 如果您使用 `__LINK_159__` 作为HTTP适配器，它需要不同的配置，并具有内置的测试能力：
>
> ```typescript
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

在这个示例中，我们基于之前提到的概念。除了使用 ``webpack.config.js`` 方法，我们现在使用 ``handler`` 方法来实例化完整的Nest runtime环境。

需要注意的一点是，在使用 ``output.libraryTarget`` 方法编译应用程序时， ``$ nest build --webpack`` 将在那个时间点是undefined的。这是因为在这个编译阶段，还没有创建HTTP适配器或服务器。如果您的测试需要 ``$ nest build --webpack``，您应该使用 ``$ npx serverless offline`` 方法创建应用程序实例，或者 refactor 项目以避免在初始化依赖项图时出现这个依赖项。

好的，让我们分解示例：

我们保存了正在运行的应用程序的引用在我们的 ``terser-webpack-plugin`` 变量中，以便使用它来模拟HTTP请求。

我们使用 ``class-validator`` 函数从 Supertest 中模拟HTTP测试。我们想要这些HTTP请求路由到我们的正在运行的Nest应用程序，所以我们将 ``NestFactory.createApplicationContext`` 函数传递给一个包含Nest HTTP监听器的引用（该监听器可能由 Express 平台提供）。因此，我们构建了 ``express``。对 ``NestFactory.createApplicationContext`` 的调用返回一个包装的HTTP Server，现在连接到Nest应用程序，该 Server expose 方法来模拟实际HTTP请求，例如使用 ``NestFactory.create`` 将发起一个请求到Nest应用程序，该请求与实际的HTTP请求 ``event`` 相同。

在这个示例中，我们还提供了一个测试双（test-double）实现 ``EventsService`` 的alternate实现，该实现简单地返回一个硬编码的值，以便测试。使用 `__INLINE_CODE_60__` 提供这样的alternate实现。类似地，Nest 提供了方法来重写模块、守卫、拦截器、过滤器和管道使用 `__INLINE_CODE_61__`、 `__INLINE_CODE_62__`、 `__INLINE_CODE_63__`、 `__INLINE_CODE_64__` 和 `__INLINE_CODE_65__` 方法respectively。

每个重写方法（except for `__INLINE_CODE_66__`）返回一个对象，其中包含3个方法，镜像 `__LINK_160__` 中描述的方法：

- `__INLINE_CODE_67__`：您提供一个将被实例化的类来提供override对象（提供者、守卫等）的实例。
- `__INLINE_CODE_68__`：您提供一个将override对象的实例。
- `__INLINE_CODE_69__`：您提供一个返回实例的函数来override对象。Here is the translated text:

然而,__INLINE_CODE_70__返回一个对象，其中包含__INLINE_CODE_71__方法，您可以使用该方法来提供一个模块，以便覆盖原始模块，如下所示：

```json
{
  "compilerOptions": {
    ...
    "esModuleInterop": true
  }
}

```

每种覆盖方法类型都返回__INLINE_CODE_72__实例，可以链式调用其他方法在__LINK_161__中。请使用__INLINE_CODE_73__在链式调用中，以便 Nest 实例化和初始化模块。

有时候，您可能想提供一个自定义日志器，例如在测试时（例如在 CI 服务器上）。使用__INLINE_CODE_74__方法，并传递一个实现__INLINE_CODE_75__接口的对象，以便__INLINE_CODE_76__在测试中如何记录日志（默认情况下，只有“error”日志将被记录到控制台）。

编译后的模块具有以下有用的方法，如下表所示：

__HTML_TAG_92__
  __HTML_TAG_93__
    __HTML_TAG_94__
      __HTML_TAG_95__createNestApplication()__HTML_TAG_96__
    __HTML_TAG_97__
    __HTML_TAG_98__
      创建并返回一个 Nest 应用程序（__HTML_TAG_99__INestApplication__HTML_TAG_100__实例），基于给定的模块。
      请注意，您需要手动初始化应用程序使用__HTML_TAG_101__init()__HTML_TAG_102__方法。
    __HTML_TAG_103__
  __HTML_TAG_104__
  __HTML_TAG_105__
    __HTML_TAG_106__
      __HTML_TAG_107__createNestMicroservice()__HTML_TAG_108__
    __HTML_TAG_109__
    __HTML_TAG_110__
      创建并返回一个 Nest 微服务（__HTML_TAG_111__INestMicroservice__HTML_TAG_112__实例），基于给定的模块。
    __HTML_TAG_113__
  __HTML_TAG_114__
  __HTML_TAG_115__
    __HTML_TAG_116__
      __HTML_TAG_117__get()__HTML_TAG_118__
    __HTML_TAG_119__
    __HTML_TAG_120__
      获取一个静态实例的控制器或提供者（包括守卫、过滤器等），在应用上下文中可用。继承自__HTML_TAG_121__module reference__HTML_TAG_122__类。
    __HTML_TAG_123__
  __HTML_TAG_124__
  __HTML_TAG_125__
     __HTML_TAG_126__
      __HTML_TAG_127__resolve()__HTML_TAG_128__
    __HTML_TAG_129__
    __HTML_TAG_130__
      获取一个动态创建的作用域实例（请求或瞬态）的控制器或提供者（包括守卫、过滤器等），在应用上下文中可用。继承自__HTML_TAG_131__module reference__HTML_TAG_132__类。
    __HTML_TAG_133__
  __HTML_TAG_134__
  __HTML_TAG_135__
    __HTML_TAG_136__
      __HTML_TAG_137__select()__HTML_TAG_138__
    __HTML_TAG_139__
    __HTML_TAG_140__
      导航到模块的依赖关系图；可以用于从选择的模块中获取特定实例（与严格模式(__HTML_TAG_141__strict: true__HTML_TAG_142__)在__HTML_TAG_143__get()__HTML_TAG_144__方法中使用）。
    __HTML_TAG_145__
  __HTML_TAG_146__
__HTML_TAG_147__

> 信息 **提示** 将 e2e 测试文件放在__INLINE_CODE_77__目录中。测试文件应该具有__INLINE_CODE_78__后缀。

#### Override globally registered enhancers

如果您有一个全球注册的守卫（或管道、拦截器或过滤器），需要多一步来覆盖该增强器。回顾原始注册如下所示：

```bash
$ npm run build
$ npx serverless offline

```

这是注册守卫作为一个“multi”-提供者，通过__INLINE_CODE_79__令牌。要能够覆盖__INLINE_CODE_80__，注册需要使用现有的提供者在这个槽位：

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

> 信息 **提示** 将__INLINE_CODE_81__更改为__INLINE_CODE_82__，以便引用已注册的提供者，而不是 Nest 实例化它。

现在__INLINE_CODE_83__对 Nest 可见，可以在创建__INLINE_CODE_84__时覆盖：

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

现在所有测试都将使用__INLINE_CODE_85__在每个请求中。

#### Testing request-scoped instances

__LINK_162__ 提供者在每个 incoming **请求** 中创建唯一实例。该实例在请求处理完成后被垃圾回收。这 pose 一个问题，因为我们不能访问为测试请求生成的依赖关系树。

我们知道（根据前面的部分）__INLINE_CODE_86__方法可以用来获取
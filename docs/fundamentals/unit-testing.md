### 测试

自动化测试被视为任何严肃软件开发工作中不可或缺的部分。自动化使得在开发过程中能够快速轻松地重复执行单个测试或测试套件，这有助于确保发布版本达到质量和性能目标。自动化不仅能提高测试覆盖率，还能为开发者提供更快速的反馈循环。它既提升了开发者的个人生产力，又能确保在源代码控制签入、功能集成和版本发布等关键开发周期节点运行测试。

这类测试通常涵盖多种类型，包括单元测试、端到端(e2e)测试、集成测试等。尽管其优势毋庸置疑，但配置过程可能较为繁琐。Nest 致力于推广包括高效测试在内的开发最佳实践，因此提供了以下特性来帮助开发者和团队构建并自动化测试。Nest：

- 自动为组件生成默认单元测试脚手架，并为应用程序生成端到端测试脚手架
- 提供默认工具链（例如构建独立模块/应用加载器的测试运行器）
- 开箱即用提供与 [Jest](https://github.com/facebook/jest) 和 [Supertest](https://github.com/visionmedia/supertest) 的集成，同时保持对测试工具的无关性
- 将 Nest 依赖注入系统引入测试环境，便于模拟组件

如前所述，您可以使用任何喜欢的**测试框架** ，因为 Nest 不会强制使用特定工具。只需替换所需元素（如测试运行器），您仍可享受 Nest 现成测试设施的优势。

#### 安装

要开始使用，首先安装所需软件包：

```bash
$ npm i --save-dev @nestjs/testing
```

#### 单元测试

在以下示例中，我们测试两个类：`CatsController` 和 `CatsService`。如前所述，[Jest](https://github.com/facebook/jest) 是默认提供的测试框架，它既是测试运行器，又提供了断言函数和测试替身工具，可用于模拟、监视等操作。在这个基础测试中，我们手动实例化这些类，并确保控制器和服务满足它们的 API 约定。

```typescript title="cats.controller.spec"
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;

  beforeEach(() => {
    catsService = new CatsService();
    catsController = new CatsController(catsService);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = ['test'];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    });
  });
});
```

> info **提示** 将测试文件保存在它们所测试的类附近。测试文件应带有 `.spec` 或 `.test` 后缀。

由于上述示例过于简单，我们并未真正测试任何 Nest 特有的功能。实际上，我们甚至没有使用依赖注入（注意我们是直接将 `CatsService` 实例传递给 `catsController`）。这种手动实例化待测类的测试形式通常被称为**隔离测试** ，因为它独立于框架运行。接下来我们将介绍一些更高级的功能，帮助您测试那些更充分利用 Nest 特性的应用程序。

#### 测试工具集

`@nestjs/testing` 包提供了一系列实用工具，能够实现更健壮的测试流程。让我们使用内置的 `Test` 类重写之前的示例：

```typescript title="cats.controller.spec"
import { Test } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        controllers: [CatsController],
        providers: [CatsService],
      }).compile();

    catsService = moduleRef.get(CatsService);
    catsController = moduleRef.get(CatsController);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = ['test'];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    });
  });
});
```

`Test` 类为应用提供了执行上下文，它本质上模拟了完整的 Nest 运行时环境，同时提供了便于管理类实例的钩子，包括模拟和重写功能。该类的 `createTestingModule()` 方法接收一个模块元数据对象作为参数（与传入 `@Module()` 装饰器的对象相同），返回一个 `TestingModule` 实例，该实例又提供了若干方法。对于单元测试而言，关键方法是 `compile()`，它会引导模块及其依赖项（类似于传统 `main.ts` 文件中使用 `NestFactory.create()` 引导应用的方式），并返回一个准备就绪的测试模块。

> **提示** `compile()` 方法是**异步的** ，因此需要使用 await。模块编译完成后，可通过 `get()` 方法获取其声明的任何**静态**实例（控制器和提供者）。

`TestingModule` 继承自[模块引用](/fundamentals/module-ref)类，因此具备动态解析作用域提供者（瞬时或请求作用域）的能力。可通过 `resolve()` 方法实现（而 `get()` 方法仅能获取静态实例）。

```typescript
const moduleRef = await Test.createTestingModule({
  controllers: [CatsController],
  providers: [CatsService],
}).compile();

catsService = await moduleRef.resolve(CatsService);
```

> warning **警告** `resolve()` 方法会从自身的 **DI 容器子树**返回提供者的唯一实例。每个子树都有唯一的上下文标识符。因此，若多次调用此方法并比较实例引用，会发现它们并不相同。

> info **提示** 了解更多模块引用特性请[点击此处](/fundamentals/module-ref) 。

您可以用[自定义提供者](/fundamentals/custom-providers)覆盖任何生产环境的提供者实现来进行测试。例如，可以模拟数据库服务而非连接真实数据库。我们将在下一节讨论覆盖机制，该功能同样适用于单元测试场景。

#### 自动模拟

Nest 还允许您定义一个模拟工厂应用于所有缺失的依赖项。这在类中存在大量依赖项且全部模拟将耗费大量时间和设置的情况下非常有用。要使用此功能，需将 `createTestingModule()` 与 `useMocker()` 方法链式调用，并传入依赖项模拟的工厂函数。该工厂函数可接收一个可选令牌（即实例令牌，任何适用于 Nest 提供者的令牌），并返回模拟实现。以下是使用 [`jest-mock`](https://www.npmjs.com/package/jest-mock) 创建通用模拟器及使用 `jest.fn()` 为 `CatsService` 创建特定模拟的示例。

```typescript
// ...
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('CatsController', () => {
  let controller: CatsController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CatsController],
    })
      .useMocker((token) => {
        const results = ['test1', 'test2'];
        if (token === CatsService) {
          return { findAll: jest.fn().mockResolvedValue(results) };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = moduleRef.get(CatsController);
  });
});
```

您也可以像通常获取自定义提供者那样从测试容器中检索这些模拟对象，例如 `moduleRef.get(CatsService)`。

> info **提示** 通用模拟工厂（如 [`@golevelup/ts-jest`](https://github.com/golevelup/nestjs/tree/master/packages/testing) 中的 `createMock`）也可以直接传入使用。

> info **提示** `REQUEST` 和 `INQUIRER` 提供者无法被自动模拟，因为它们已在上下文中预定义。但可以通过自定义提供者语法或使用 `.overrideProvider` 方法进行*覆盖* 。

#### 端到端测试

与专注于单个模块和类的单元测试不同，端到端(e2e)测试涵盖了类和模块在更高聚合层级上的交互——更接近最终用户与生产系统的交互方式。随着应用规模增长，手动测试每个 API 端点的端到端行为变得困难。自动化端到端测试帮助我们确保系统的整体行为正确并满足项目需求。执行 e2e 测试时，我们使用与**单元测试**相似的配置。此外，Nest 可以轻松使用 [Supertest](https://github.com/visionmedia/supertest) 库来模拟 HTTP 请求。

```typescript title="cats.e2e-spec"
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { CatsModule } from '../../src/cats/cats.module';
import { CatsService } from '../../src/cats/cats.service';
import { INestApplication } from '@nestjs/common';

describe('Cats', () => {
  let app: INestApplication;
  let catsService = { findAll: () => ['test'] };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CatsModule],
    })
      .overrideProvider(CatsService)
      .useValue(catsService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET cats`, () => {
    return request(app.getHttpServer())
      .get('/cats')
      .expect(200)
      .expect({
        data: catsService.findAll(),
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

> info **提示** 如果您使用 [Fastify](/techniques/performance) 作为 HTTP 适配器，它需要稍有不同的配置，并具有内置的测试能力：
>
> ```ts
> let app: NestFastifyApplication;
>
> beforeAll(async () => {
>   app = moduleRef.createNestApplication<NestFastifyApplication>(
>     new FastifyAdapter()
>   );
>
>   await app.init();
>   await app.getHttpAdapter().getInstance().ready();
> });
>
> it(`/GET cats`, () => {
>   return app
>     .inject({
>       method: 'GET',
>       url: '/cats',
>     })
>     .then((result) => {
>       expect(result.statusCode).toEqual(200);
>       expect(result.payload).toEqual(/* expectedPayload */);
>     });
> });
>
> afterAll(async () => {
>   await app.close();
> });
> ```
```

在本例中，我们基于之前描述的一些概念进行构建。除了之前使用的 `compile()` 方法外，我们现在还使用 `createNestApplication()` 方法来实例化完整的 Nest 运行时环境。

需要注意的一点是，当您的应用程序使用 `compile()` 方法编译时，`HttpAdapterHost#httpAdapter` 此时会是未定义的。这是因为在此编译阶段尚未创建 HTTP 适配器或服务器。如果您的测试需要 `httpAdapter`，则应使用 `createNestApplication()` 方法创建应用实例，或者重构项目以避免在初始化依赖关系图时产生此依赖。

好的，让我们分解这个示例：

我们将正在运行的应用程序引用保存在变量 `app` 中，以便用它来模拟 HTTP 请求。

我们使用 Supertest 的 `request()` 函数来模拟 HTTP 测试。我们希望这些 HTTP 请求能路由到正在运行的 Nest 应用，因此向 `request()` 函数传递了 Nest 底层 HTTP 监听器的引用（该监听器可能由 Express 平台提供）。因此构造了 `request(app.getHttpServer())`。调用 `request()` 会返回一个包装后的 HTTP Server，现已连接到 Nest 应用，并公开了模拟实际 HTTP 请求的方法。例如，使用 `request(...).get('/cats')` 将发起一个与**真实**网络请求 `get '/cats'` 完全相同的请求到 Nest 应用。

在此示例中，我们还提供了 `CatsService` 的替代（测试替身）实现，它仅返回一个我们可以测试的硬编码值。使用 `overrideProvider()` 来提供此类替代实现。同样地，Nest 提供了通过 `overrideModule()`、`overrideGuard()`、`overrideInterceptor()`、`overrideFilter()` 和 `overridePipe()` 方法分别覆盖模块、守卫、拦截器、过滤器和管道的功能。

每个覆盖方法（除了 `overrideModule()`）都返回一个包含 3 种不同方法的对象，这些方法镜像了[自定义提供者](https://docs.nestjs.com/fundamentals/custom-providers)中描述的方法：

- `useClass`：提供一个类，该类将被实例化以提供覆盖对象（提供者、守卫等）的实例。
- `useValue`：提供一个实例来覆盖对象。
- `useFactory`：提供一个返回实例的函数，该实例将覆盖原有对象。

另一方面，`overrideModule()` 返回一个包含 `useModule()` 方法的对象，该方法可用于提供将覆盖原始模块的模块，如下所示：

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideModule(CatsModule)
  .useModule(AlternateCatsModule)
  .compile();
```

每种覆盖方法类型都会返回 `TestingModule` 实例，因此可以与其他方法以[流畅风格](https://en.wikipedia.org/wiki/Fluent_interface)链式调用。在此类调用链的末尾应使用 `compile()` 以使 Nest 实例化并初始化模块。

此外，有时您可能需要提供自定义日志记录器（例如在测试运行时，如在 CI 服务器上）。使用 `setLogger()` 方法并传入一个符合 `LoggerService` 接口的对象，以指示 `TestModuleBuilder` 在测试期间如何进行日志记录（默认情况下，仅"error"级别的日志会输出到控制台）。

编译后的模块具有多个实用方法，如下表所述：

| 方法                        | 描述                                                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `createNestApplication()`   | 基于给定模块创建并返回一个 Nest 应用（`INestApplication` 实例）。注意必须使用 `init()` 方法手动初始化应用。                |
| `createNestMicroservice()`  | 基于给定模块创建并返回一个 Nest 微服务（`INestMicroservice` 实例）。                                                        |
| `get()`                    | 获取应用上下文中可用的控制器或提供者（包括守卫、过滤器等）的静态实例。继承自 module reference 类。                          |
| `resolve()`                | 获取应用程序上下文中可用的控制器或提供者（包括守卫、过滤器等）的动态创建作用域实例（请求或瞬态）。继承自模块引用类。        |
| `select()`                 | 遍历模块的依赖关系图；可用于从选定模块中检索特定实例（与 `get()` 方法中的严格模式 `strict: true` 一起使用）。              |

> info **提示** 将端到端测试文件保存在 `test` 目录中。测试文件应使用 `.e2e-spec` 后缀。

#### 覆盖全局注册的增强器

如果你有一个全局注册的守卫（或管道、拦截器、过滤器），需要采取额外步骤来覆盖该增强器。回顾最初的注册方式如下：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],
```

这是通过 `APP_*` 令牌将守卫注册为"multi"多提供者。要在此处替换 `JwtAuthGuard`，注册时需要在该插槽中使用现有提供者：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useExisting: JwtAuthGuard,
    // ^^^^^^^^ notice the use of 'useExisting' instead of 'useClass'
  },
  JwtAuthGuard,
],
```

> info **注意** 将 `useClass` 改为 `useExisting` 以引用已注册的提供者，而不是让 Nest 在令牌背后实例化它。

现在 `JwtAuthGuard` 对 Nest 而言是一个常规提供者，在创建 `TestingModule` 时可被覆盖：

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideProvider(JwtAuthGuard)
  .useClass(MockAuthGuard)
  .compile();
```

现在您的所有测试将在每个请求上使用 `MockAuthGuard`。

#### 测试请求作用域实例

[请求作用域](/fundamentals/injection-scopes)的提供者会为每个传入的**请求**单独创建。实例会在请求处理完成后被垃圾回收。这带来了一个问题，因为我们无法访问专门为测试请求生成的依赖注入子树。

根据前文所述，我们知道可以使用 `resolve()` 方法来获取动态实例化的类。同时，如[此处](https://docs.nestjs.com/fundamentals/module-ref#resolving-scoped-providers)所描述的，我们知道可以传递唯一的上下文标识符来控制 DI 容器子树的生命周期。那么如何在测试环境中利用这一点呢？

该策略是预先生成一个上下文标识符，并强制 Nest 使用此特定 ID 为所有传入请求创建子树。通过这种方式，我们将能够检索为测试请求创建的实例。

要实现这一点，在 `ContextIdFactory` 上使用 `jest.spyOn()`：

```typescript
const contextId = ContextIdFactory.create();
jest
  .spyOn(ContextIdFactory, 'getByRequest')
  .mockImplementation(() => contextId);
```

现在我们可以使用 `contextId` 来访问为任何后续请求生成的单个 DI 容器子树。

```typescript
catsService = await moduleRef.resolve(CatsService, contextId);
```

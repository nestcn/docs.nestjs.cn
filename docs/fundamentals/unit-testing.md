### 测试

自动化测试被认为是任何严肃的软件开发工作的重要组成部分。自动化使得在开发过程中快速轻松地重复单个测试或测试套件变得容易。这有助于确保发布版本满足质量和性能目标。自动化有助于增加覆盖率并为开发人员提供更快的反馈循环。自动化既提高了单个开发人员的生产力，又确保在关键开发生命周期节点运行测试，例如源代码控制签入、功能集成和版本发布。

这些测试通常跨越各种类型，包括单元测试、端到端（e2e）测试、集成测试等。虽然好处是毋庸置疑的，但设置它们可能很繁琐。Nest努力促进开发最佳实践，包括有效的测试，因此它包含以下功能来帮助开发人员和团队构建和自动化测试。Nest：

- 自动为组件搭建默认的单元测试和应用程序的端到端测试
- 提供默认工具（例如构建隔离模块/应用程序加载器的测试运行器）
- 开箱即用地提供与[Jest](https://github.com/facebook/jest)和[Supertest](https://github.com/visionmedia/supertest)的集成，同时保持对测试工具的不可知性
- 在测试环境中提供Nest依赖注入系统，以便轻松模拟组件

如前所述，您可以使用任何**测试框架**，因为Nest不会强制任何特定工具。只需替换所需的元素（例如测试运行器），您仍然可以享受Nest现成的测试设施的好处。

#### 安装

要开始，请首先安装所需的包：

```bash
$ npm i --save-dev @nestjs/testing
```

#### 单元测试

在以下示例中，我们测试两个类：`CatsController`和`CatsService`。如前所述，[Jest](https://github.com/facebook/jest)被提供为默认的测试框架。它充当测试运行器，还提供断言函数和测试双倍工具，帮助进行模拟、监视等。在以下基本测试中，我们手动实例化这些类，并确保控制器和服务满足其API契约。

```typescript
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

describe('CatsController', () => {
  let catsController;
  let catsService;

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

:::info 提示
将测试文件保存在它们测试的类附近。测试文件应该有`.spec`或`.test`后缀。
:::

因为上面的示例很简单，我们实际上并没有测试任何特定于Nest的内容。事实上，我们甚至没有使用依赖注入（注意我们将`CatsService`的实例传递给我们的`catsController`）。这种测试形式 - 我们手动实例化被测试的类 - 通常被称为**隔离测试**，因为它独立于框架。让我们介绍一些更高级的功能，帮助您测试更广泛使用Nest功能的应用程序。

#### 测试工具

`@nestjs/testing`包提供了一组工具，使测试过程更加健壮。让我们使用内置的`Test`类重写之前的示例：

```typescript
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

describe('CatsController', () => {
  let catsController;
  let catsService;

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

`Test`类对于提供应用程序执行上下文非常有用，该上下文本质上模拟了完整的Nest运行时，但为您提供了钩子，使管理类实例（包括模拟和覆盖）变得容易。`Test`类有一个`createTestingModule()`方法，该方法将模块元数据对象作为其参数（与您传递给`@Module()`装饰器的对象相同）。此方法返回一个`TestingModule`实例，该实例又提供了一些方法。对于单元测试，重要的是`compile()`方法。此方法引导模块及其依赖项（类似于应用程序在传统`main.ts`文件中使用`NestFactory.create()`引导的方式），并返回一个准备好测试的模块。

:::info 提示
`compile()`方法是**异步**的，因此必须等待。模块编译后，您可以使用`get()`方法检索它声明的任何**静态**实例（控制器和提供者）。
:::

`TestingModule`继承自[模块引用](/fundamentals/module-reference)类，因此具有动态解析作用域提供者（瞬态或请求作用域）的能力。使用`resolve()`方法执行此操作（`get()`方法只能检索静态实例）。

```typescript
const moduleRef = await Test.createTestingModule({
  controllers: [CatsController],
  providers: [CatsService],
}).compile();

catsService = await moduleRef.resolve(CatsService);
```

::: warning 警告 
`resolve()`方法返回提供者的唯一实例，来自其自己的**DI容器子树**。每个子树都有唯一的上下文标识符。因此，如果您多次调用此方法并比较实例引用，您会发现它们不相等。
:::

:::info 提示
在此处了解有关模块引用功能的更多信息[/fundamentals/module-reference]。
:::

您可以使用[自定义提供者](/fundamentals/dependency-injection)覆盖任何提供者的生产版本，以进行测试。例如，您可以模拟数据库服务，而不是连接到实时数据库。我们将在下一节中介绍覆盖，但它们也可用于单元测试。

```
<app-banner-courses></app-banner-courses>
```

#### 自动模拟

Nest还允许您定义一个模拟工厂，应用于所有缺少的依赖项。这对于类中有大量依赖项的情况非常有用，模拟所有这些依赖项将花费很长时间和大量设置。要使用此功能，`createTestingModule()`需要与`useMocker()`方法链接，传递依赖项模拟的工厂。这个工厂可以接受一个可选的令牌，这是一个实例令牌，任何对Nest提供者有效的令牌，并返回一个模拟实现。以下是使用[`jest-mock`](https://www.npmjs.com/package/jest-mock)创建通用模拟程序和使用`jest.fn()`为`CatsService`创建特定模拟的示例。

```typescript
// ...
import { ModuleMocker, MockMetadata } from 'jest-mock';

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
            token,
          ) as MockMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(
            mockMetadata,
          ) as ObjectConstructor;
          return new Mock();
        }
      })
      .compile();

    controller = moduleRef.get(CatsController);
  });
});
```

您也可以像通常处理自定义提供者一样从测试容器中检索这些模拟，`moduleRef.get(CatsService)`。

:::info 提示
通用模拟工厂，如来自[`@golevelup/ts-jest`](https://github.com/golevelup/nestjs/tree/master/packages/testing)的`createMock`也可以直接传递。
:::

:::info 提示
`REQUEST`和`INQUIRER`提供者不能被自动模拟，因为它们已经在上下文中预定义。但是，它们可以使用自定义提供者语法或通过利用`.overrideProvider`方法被**覆盖**。
:::

#### 端到端测试

与专注于单个模块和类的单元测试不同，端到端（e2e）测试在更聚合的级别覆盖类和模块的交互 - 更接近最终用户将与生产系统进行的交互。随着应用程序的增长，手动测试每个API端点的端到端行为变得困难。自动化端到端测试帮助我们确保系统的整体行为是正确的，并满足项目要求。要执行端到端测试，我们使用与我们刚刚在**单元测试**中介绍的类似的配置。此外，Nest使使用[Supertest](https://github.com/visionmedia/supertest)库模拟HTTP请求变得容易。

```typescript
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

:::info 提示
如果您使用[Fastify](/techniques/performance)作为HTTP适配器，它需要略有不同的配置，并具有内置的测试功能：
:::

```ts
let app: NestFastifyApplication;

beforeAll(async () => {
  app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );

  await app.init();
  await app.getHttpAdapter().getInstance().ready();
});

it(`/GET cats`, () => {
  return app
    .inject({
      method: 'GET',
      url: '/cats',
    })
    .then((result) => {
      expect(result.statusCode).toEqual(200);
      expect(result.payload).toEqual(/* expectedPayload */);
    });
});

afterAll(async () => {
  await app.close();
});
```

在这个例子中，我们基于前面描述的一些概念进行构建。除了我们之前使用的`compile()`方法外，我们现在使用`createNestApplication()`方法来实例化完整的Nest运行时环境。

需要考虑的一个警告是，当使用`compile()`方法编译应用程序时，`HttpAdapterHost#httpAdapter`此时将是未定义的。这是因为在这个编译阶段还没有创建HTTP适配器或服务器。如果您的测试需要`httpAdapter`，您应该使用`createNestApplication()`方法创建应用程序实例，或者重构您的项目以避免在初始化依赖图时出现此依赖。

好的，让我们分解这个例子：

我们在`app`变量中保存对运行中应用程序的引用，以便我们可以使用它来模拟HTTP请求。

我们使用Supertest中的`request()`函数模拟HTTP测试。我们希望这些HTTP请求路由到我们运行的Nest应用程序，因此我们向`request()`函数传递Nest底层的HTTP监听器的引用（这反过来可能由Express平台提供）。因此，构造`request(app.getHttpServer())`。对`request()`的调用为我们提供了一个包装的HTTP服务器，现在连接到Nest应用程序，它公开了模拟实际HTTP请求的方法。例如，使用`request(...).get('/cats')`将启动一个对Nest应用程序的请求，该请求与通过网络传入的**实际**HTTP请求（如`get '/cats'`）相同。

在这个例子中，我们还提供了`CatsService`的替代（测试双倍）实现，它简单地返回一个我们可以测试的硬编码值。使用`overrideProvider()`提供这样的替代实现。同样，Nest提供了方法来覆盖模块、守卫、拦截器、过滤器和管道，分别使用`overrideModule()`、`overrideGuard()`、`overrideInterceptor()`、`overrideFilter()`和`overridePipe()`方法。

每个覆盖方法（除了`overrideModule()`）都返回一个对象，该对象具有3个不同的方法，这些方法与为[自定义提供者](/fundamentals/dependency-injection)描述的方法镜像：

- `useClass`：您提供一个类，该类将被实例化以提供覆盖对象（提供者、守卫等）的实例。
- `useValue`：您提供一个将覆盖对象的实例。
- `useFactory`：您提供一个返回将覆盖对象的实例的函数。

另一方面，`overrideModule()`返回一个带有`useModule()`方法的对象，您可以使用该方法提供一个将覆盖原始模块的模块，如下所示：

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideModule(CatsModule)
  .useModule(AlternateCatsModule)
  .compile();
```

每种覆盖方法类型又返回`TestingModule`实例，因此可以与[流畅风格](https://en.wikipedia.org/wiki/Fluent_interface)中的其他方法链接。您应该在这样的链的末尾使用`compile()`，以使Nest实例化并初始化模块。

此外，有时您可能希望提供自定义日志记录器，例如在运行测试时（例如，在CI服务器上）。使用`setLogger()`方法并传递一个满足`LoggerService`接口的对象，以指示`TestModuleBuilder`如何在测试期间记录（默认情况下，只有"错误"日志会被记录到控制台）。

编译后的模块有几个有用的方法，如下表所述：

<table>
  <tr>
    <td>
      <code>createNestApplication()</code>
    </td>
    <td>
      创建并返回基于给定模块的Nest应用程序（<code>INestApplication</code>实例）。
      注意，您必须使用<code>init()</code>方法手动初始化应用程序。
    </td>
  </tr>
  <tr>
    <td>
      <code>createNestMicroservice()</code>
    </td>
    <td>
      创建并返回基于给定模块的Nest微服务（<code>INestMicroservice</code>实例）。
    </td>
  </tr>
  <tr>
    <td>
      <code>get()</code>
    </td>
    <td>
      检索应用程序上下文中可用的控制器或提供者（包括守卫、过滤器等）的静态实例。继承自<a href="/fundamentals/module-reference">模块引用</a>类。
    </td>
  </tr>
  <tr>
     <td>
      <code>resolve()</code>
    </td>
    <td>
      检索应用程序上下文中可用的控制器或提供者（包括守卫、过滤器等）的动态创建的作用域实例（请求或瞬态）。继承自<a href="/fundamentals/module-reference">模块引用</a>类。
    </td>
  </tr>
  <tr>
    <td>
      <code>select()</code>
    </td>
    <td>
      遍历模块的依赖图；可用于从选定的模块中检索特定实例（与<code>get()</code>方法中的严格模式（<code>strict: true</code>）一起使用）。
    </td>
  </tr>
</table>

:::info 提示
将端到端测试文件保存在`test`目录中。测试文件应该有`.e2e-spec`后缀。
:::


#### 覆盖全局注册的增强器

如果您有全局注册的守卫（或管道、拦截器或过滤器），您需要采取更多步骤来覆盖该增强器。回顾一下原始注册如下所示：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],
```

这是通过`APP_*`令牌将守卫注册为"多"提供者。为了能够在此处替换`JwtAuthGuard`，注册需要使用此插槽中的现有提供者：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useExisting: JwtAuthGuard,
    // ^^^^^^^^ 注意使用 'useExisting' 而不是 'useClass'
  },
  JwtAuthGuard,
],
```

:::info 提示
将`useClass`更改为`useExisting`以引用已注册的提供者，而不是让Nest在令牌后面实例化它。
:::

现在`JwtAuthGuard`对Nest来说是一个常规提供者，可以在创建`TestingModule`时被覆盖：

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideProvider(JwtAuthGuard)
  .useClass(MockAuthGuard)
  .compile();
```

现在您的所有测试都将在每个请求上使用`MockAuthGuard`。

#### 测试请求作用域实例

[请求作用域](/fundamentals/provider-scopes)提供者是为每个传入的**请求**唯一创建的。实例在请求处理完成后被垃圾回收。这构成了一个问题，因为我们无法访问为测试请求生成的依赖注入子树。

我们知道（基于上面的部分）`resolve()`方法可用于检索动态实例化的类。此外，如<a href="/fundamentals/module-reference#解析作用域提供者">此处</a>所述，我们知道我们可以传递唯一的上下文标识符来控制DI容器子树的生命周期。我们如何在测试上下文中利用这一点？

策略是预先生成一个上下文标识符，并强制Nest使用此特定ID为所有传入请求创建子树。这样，我们将能够检索为测试请求创建的实例。

要实现这一点，请在`ContextIdFactory`上使用`jest.spyOn()`：

```typescript
const contextId = ContextIdFactory.create();
jest
  .spyOn(ContextIdFactory, 'getByRequest')
  .mockImplementation(() => contextId);
```

现在我们可以使用`contextId`访问任何后续请求的单个生成的DI容器子树。

```typescript
catsService = await moduleRef.resolve(CatsService, contextId);
```

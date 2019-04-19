
## 自定义 Provider 
有很多场景, 你想**直接**绑定某些值到 nest 的 IoC 容器。例如，任何常量值，基于当前环境创建的可配置对象，引入的外部库或预先计算的值（取决于其他几个定义的提供程序）。此外，您可以覆盖默认实现，例如在需要时使用不同的替身测试(test doubles)或需要使用不同的类（用于测试目的）。


你应该始终牢记的一件重要事情就是 Nest 使用**tokens**(口令)来标识依赖关系。通常，用类名自动生成标记。如果你想创建一个自定义提供者，你需要选择一个令牌。大多数情况下，自定义令牌都由纯字符串表示。最佳实践是您应该在一个单独的文件中保存令牌，例如，在 `constants.ts` 中。

我们来看看可用的选项。

### 使用值

在 useValue 定义常量值，将外部库放入 Nest 容器或用 mock 对象替换实际实现时，此语法很有用。

```typescript
import { connection } from './connection';

const connectionProvider = {
  provide: 'CONNECTION',
  useValue: connection,
};

@Module({
  providers: [connectionProvider],
})
export class ApplicationModule {}
```
为了注入自定义用户提供，我们使用`@Inject（）`装饰器。这个装饰器可以接受一个参数作为指定的token。(如果没有参数, 可能把类名作为token: 译者个人猜测)

```typescript
@Injectable()
export class CatsRepository {
  constructor(@Inject('CONNECTION') connection: Connection) {}
}
```
?> `@Inject（）`装饰器从`@nestjs/common`包中导入。

当您想要覆盖的默认 Provider 的值时，比方说，您想强制 Nest 使用模拟的 `CatsService` 以进行测试，您可以简单地使用现有类作为标记。

```typescript
import { CatsService } from './cats.service';

const mockCatsService = {};
const catsServiceProvider = {
  provide: CatsService,
  useValue: mockCatsService,
};

@Module({
  imports: [CatsModule],
  providers: [catsServiceProvider],
})
export class ApplicationModule {}
```

在上面的例子中，`CatsService`将被传入的`mockCatsService`覆盖。这意味着，Nest不再是手动创建`CatsService`实例，而是将该提供者视为已解析的，并直接使用`mockCatsService`。

### 使用类

`useClass`语法允许您对每个选定的因素使用不同的类。例如，我们有一个抽象的（或默认的）`ConfigService`类。根据当前环境，Nest应该使用不同的配置服务。

```typescript
const configServiceProvider = {
  provide: ConfigService,
  useClass:
    process.env.NODE_ENV === 'development'
      ? DevelopmentConfigService
      : ProductionConfigService,
};

@Module({
  providers: [configServiceProvider],
})
export class ApplicationModule {}
```
!>我们使用了`ConfigService`类，而不是自定义token，因此我们已经覆盖了默认的实现。

在这种情况下，即使任何类依赖于`ConfigService`，Nest也会注入提供的类的实例（`DevelopmentConfigService`或`ProductionConfigService`）。

### 使用工厂

`useFactory`是**动态**创建provider的一种方式。工厂函数的返回实际的provider。工厂函数可以依赖几个不同的provider或保持完全独立。这意味着工厂可以接受不同的参数，Nest 将在实例化过程中解析并传递参数。此外，工程函数也可以是**异步**的。必须动态计算提供程序或解决异步操作时使用它。

```typescript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
})
export class ApplicationModule {}
```
?> 如果您的工厂函数需要其他provider，则必须将其他token传入`inject`数组中。 Nest会以相同顺序将实例作为函数的参数传递。

### 导出自定义 provider

为了导出自定义 provider，我们可以使用 token 或整个对象。以下示例显示了使用 token 的例子：

```typescript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
  exports: ['CONNECTION'],
})
export class ApplicationModule {}
```

但是你也可以使用整个对象：

```typescript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
  exports: [connectionFactory],
})
export class ApplicationModule {}
```

### 支持我们

Nest是一个MIT许可的开源项目。它可以发展得益于这些令人敬畏的人们的支持。如果你想加入他们，请阅读 [更多](5.0/fundamentals?id=用户提供商)。

## 异步提供者

在完成一些异步任务之前，应用程序必须等待启动状态, 例如，必须先等待与数据库的建立连接才能启动应用。 在这种情况下你应该考虑使用异步provider。为了创建一个`异步`提供者，我们使用`useFactory`。工厂必须返回`Promise`（`async`也适用）。

```typescript
{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
}
```
?> 在这里了解 [更多](6/fundamentals?id=自定义-provider)自定义 provider 的相关方法。

### 注入

异步provider可以通过它们的 token（在上述例子中，通过`AsyncDbConnection` token）简单地注入其他组件。一旦异步 provider 被 resolve，每个依赖于异步provider 的类都**将被实例化**。

以上示例用于演示目的。如果你正在寻找更详细的例子，请看 [这里](6/recipes?id=sql-typeorm)。

## 循环依赖
例如，当A类需要B类，而B类也需要A类时，就会产生**循环依赖**。 Nest允许在提供者(provider)和模块(module)之间创建循环依赖关系，但我们建议您尽可能避免。但是有时候难以避免，所以我们提供了一些方法来解决这个问题。

### 正向引用

**正向引用**允许Nest引用目前尚未被定义的引用。当`CatsService` 和 `CommonService` 相互依赖时，关系的双方都需要使用 `@Inject()` 和 `forwardRef()` ，否则 Nest 不会实例化它们，因为所有基本元数据都不可用。让我们看看下面的代码片段：

> cats.service.ts
```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private readonly commonService: CommonService,
  ) {}
}
```
?> `forwardRef()`从`@nestjs/common`包中导入的。

这是一侧的关系。现在让我们对`CommonService`进行相同的操作：

> common.service.ts
```typescript
@Injectable()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private readonly catsService: CatsService,
  ) {}
}
```
!> 你不能保证哪个构造函数会被先调用。

为了在模块(module)之间创建循环依赖，必须在模块关联的两个部分上使用相同的 `forwardRef()`：

> common.module.ts

```typescript
@Module({
  imports: [forwardRef(() => CatsModule)],
})
export class CommonModule {}
```

### 模块引用

Nest提供了可以简单地注入到任何组件中的`ModuleRef`类。

> cats.service.ts

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private service: Service;
  constructor(private readonly moduleRef: ModuleRef) {}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}
```
?> `ModuleRef`类从`@nestjs/core`包中导入。


模块引用有一个`get()`方法，它允许检索当前模块中可用的任何组件。另外, 你可以使用非严格模式(non-strict mode), 保证你可以在整个应用中的任何地方获得该provider.

```typescript
this.moduleRef.get(Service, { strict: false });
```


## 注入作用域

对于使用不同语言的人来说，在Nest中几乎所有内容都在传入请求之间共享，这可能会很尴尬。我们有到数据库的连接池，全局状态的单例服务等等。通常，Node.js不遵循 request/response 多线程无状态模型，其中每个请求都由单独的线程处理。因此，对于我们的应用程序来说，使用单例实例是完全**安全**的。

但是，存在基于请求的控制器生命周期可能是有意行为的边缘情况，例如 GraphQL 应用程序中的每请求缓存，请求跟踪或多租户。我们怎么处理它们？


#### 作用域

基本上，每个提供者都可以作为一个单例，被请求范围限定，并切换到瞬态模式。请参见下表，以熟悉它们之间的区别。

| 单例 | 每个提供者可以跨多个类共享。提供者生命周期严格绑定到应用程序生命周期。一旦应用程序启动，所有提供程序都已实例化。默认情况下使用单例范围。 |
| ---- | ------------------------------------------------------------ |
| 请求 | 在请求处理完成后，将为每个传入请求和垃圾收集专门创建提供者的新实例 |
| 瞬态 | 临时提供者不能在提供者之间共享。每当其他提供者向Nest容器请求特定的临时提供者时，该容器将创建一个新的专用实例 |

?> 使用单例范围始终是推荐的方法。请求之间共享提供者可以降低内存消耗，从而提高应用程序的性能(不需要每次实例化类)。

### 使用(Usage)

为了切换到另一个注入范围，您必须向`@Injectable()`装饰器传递一个参数

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {}
```

在[自定义提供者](/6/fundamentals?id=自定义-provider)的情况下，您必须设置一个额外的范围属性

```typescript
{
  provide: 'CACHE_MANAGER',
  useClass: CacheManager,
  scope: Scope.TRANSIENT,
}
```

当涉及到控制器时，传递 ControllerOptions 对象

```typescript
@Controller({
  path: 'cats',
  scope: Scope.REQUEST,
})
export class CatsController {}
```

?> 网关永远不应该依赖于请求范围的提供者，因为它们充当单例。一个网关封装了一个真正的套接字，不能多次被实例化

### 所有请求注入

必须非常谨慎地使用请求范围的提供者。请记住，`scope`实际上是在注入链中冒泡的。如果您的控制器依赖于一个请求范围的提供者，这意味着您的控制器实际上也是请求范围。

想象一下下面的链:`CatsController <- CatsService <- CatsRepository`。如果您的`CatsService`是请求范围的(从理论上讲，其余的都是单例)，那么`CatsController`也将成为请求范围的(因为必须将请求范围的实例注入到新创建的控制器中)，而`CatsRepository`仍然是单例的。

!> 在这种情况下，循环依赖关系将导致非常蛋疼的副作用，因此，您当然应该避免创建它们

### 请求提供者

在`HTTP`应用程序中，使用请求范围的提供者使您能够注入原始请求引用

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}
}
```

但是，该功能既不能用于微服务，也不能用于`GraphQL`应用程序。在`GraphQL`应用程序中，可以注入`CONTEXT`。

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(CONTEXT) private readonly context) {}
}
```

然后，您可以配置您的上下文值(在`GraphQLModule`中)，以包含请求作为其属性

### 性能

使用请求范围的提供者将明显影响应用程序性能。即使Nest试图缓存尽可能多的元数据，它仍然必须为每个请求创建类的实例。因此，它将降低您的平均响应时间和总体基准测试结果。如果您的提供者不一定需要请求范围，那么您应该坚持使用单例范围

## 生命周期

所有应用程序元素都有一个由Nest管理的生命周期。Nest提供了**生命周期钩子**，提供了对关键生命时刻的可见性，以及在关键时刻发生时采取行动的能力。

#### 生命周期序列

通过调用构造函数创建注入/控制器后，Nest在特定时刻按如下顺序调用生命周期钩子方法。

|||
| ------------------------ | ----------------------------------------------- |
| `OnModuleInit`           | 初始化主模块后调用                              |
| `OnApplicationBootstrap` | 在应用程序完全启动并引导后调用                  |
| `OnModuleDestroy`        | 在Nest销毁主模块(`app.close()`方法之前进行清理) |
| `OnApplicationShutdown`  | 响应系统信号(当应用程序关闭时，例如`SIGTERM`)   |

### 使用

所有应用周期的钩子都有接口表示，接口在技术上是可选的，因为它们在 `TypeScript` 编译之后就不存在了。尽管如此，为了从强类型和编辑器工具中获益，使用它们是一个很好的实践。

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class UsersService implements OnModuleInit {
  onModuleInit() {
    console.log(`The module has been initialized.`);
  }
}
```

此外，`OnModuleInit` 和 `OnApplicationBootstrap` 钩子都允许您延迟应用程序初始化过程(返回一个`Promise`或将方法标记为`async`)。

```typescript
async onModuleInit(): Promise<void> {
  await this.fetch();
}
```

#### OnApplicationShutdown

`OnApplicationShutdown`响应系统信号(当应用程序通过`SIGTERM`等方式关闭时)。使用此钩子可以优雅地关闭`Nest`应用程序。这一功能通常用于`Kubernetes`、`Heroku`或类似的服务。

要使用此钩子，必须激活侦听器，侦听关闭信号。

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Starts listening to shutdown hooks
  app.enableShutdownHooks();
  await app.listen(3000);
}
bootstrap();
```

如果应用程序接收到一个信号，它将调用`onApplicationShutdown`函数，并将相应的信号作为第一个参数`Injectable`。如果函数确实返回了一个`promise`，那么在 `promise` 被解析或拒绝之前，它不会关闭 Nest 应用程序。

```typescript
@Injectable()
class UsersService implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.log(signal); // e.g. "SIGINT"
  }
}
```

## 跨平台


Nest的作为一个跨平台的框架。平台独立性使得**创建可重用的逻辑部分**成为可能，人们可以利用这种逻辑部件跨多种不同类型的应用程序。框架的架构专注于适用于任何类型的服务器端解决方案。

### 一次编译, 各处运行

**概览**主要涉及HTTP服务器(REST APIs)。但是，所有这些构建的模块都可以轻松用于不同的传输层(`microservices`或`websockets`)。此外，Nest还配备了专用的 [GraphQL](6/graphql)模块。最后但并非最不重要的一点是, [执行上下文](6/applicationcontext)功能有助于通过 Nest 创建在 Node.js 上运行的所有应用。

Nest 鼓励成为一个完整的平台，为您的应用带来更高级别的可重用性。一次编译, 各处运行！

## 测试

自动化测试是成熟**软件产品**的重要组成部分。对于覆盖系统中关键的部分是极其重要的。为了实现这个目标，我们产生了一系列不同的测试首单，例如集成测试，单元测试，e2e 测试等。 Nest提供了一系列改进测试体验的测试实用程序。

通常，您可以使用您喜欢的任何**测试框架**，选择任何适合您要求的工具。Nest 应用程序启动程序与 Jest 框架集成在一起，以减少开始编写测试时的样板代码，但你仍然可以删除它, 使用任何其他测试框架。

### 安装

首先，我们需要安装所需的npm包:

```bash
$ npm i --save-dev @nestjs/testing
```
###  单元测试

 在下面的例子中，我们有两个不同的类，分别是`CatsController`和`CatsService`。如前所述，Jest被用作一个完整的测试框架。该框架是test runner, 并提供断言函数和提升测试实用工具，以帮助 mock，spy 等。一旦被调用, 我们已经手动强制执行`catsService.findAll()`方法来返回结果。由此，我们可以测试`catsController.findAll()`是否返回预期的结果。

 > cats.controller.spec.ts

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
 ```
?> 保持你的测试文件测试类附近。测试文件必须以`.spec`或`.test`结尾

到目前为止，我们没有使用任何现有的 Nest 测试工具。由于我们手动处理实例化测试类，因此上面的测试套件与 Nest 无关。这种类型的测试称为**隔离测试**。

### 测试工具

`@nestjs/testing` 包给了我们一套提升测试过程的实用工具。让我们重写前面的例子，但现在使用暴露的 `Test` 类。

> cats.controller.spec.ts

```typescript
import { Test } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
        controllers: [CatsController],
        providers: [CatsService],
      }).compile();

    catsService = module.get<CatsService>(CatsService);
    catsController = module.get<CatsController>(CatsController);
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

`Test`类有一个`createTestingModule()`方法，该方法将模块的元数据（与在`@Module()`装饰器中传递的对象相同的对象）作为参数。这个方法创建了一个`TestingModule`实例，该实例提供了一些方法，但是当涉及到单元测试时，这些方法中只有`compile()`是有用的。这个方式是**异步**的，因此必须等待执行完成。一旦模块编译完成，您可以使用`get()`方法检索任何实例。


为了模拟一个真实的实例，你可以用自定义的提供者[用户提供者](6/fundamentals?id=自定义-provider)覆盖现有的 provider

### E2E

当应用程序代码变多时，很难手动测试每个API端点的行为。端到端测试帮助我们确保一切工作正常并符合项目要求。为了执行e2e测试，我们使用与**单元测试**相同的配置，但另外我们使用[supertest](https://github.com/visionmedia/supertest)模拟HTTP请求。

>cats.e2e-spec.ts

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
    const module = await Test.createTestingModule({
      imports: [CatsModule],
    })
      .overrideProvider(CatsService)
      .useValue(catsService)
      .compile();

    app = module.createNestApplication();
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
?> 将您的`e2e`测试文件保存在`e2e`目录下, 并且以`.e2e-spec`或`.e2e-test`结尾.


`cats.e2e-spec.ts`测试文件包含一个HTTP端点测试(`/cats`)。我们使用`app.getHttpServer()`方法来获取在Nest应用程序的后台运行的底层HTTP服务。请注意，`TestingModule`实例提供了`overrideProvider()`方法，因此我们可以覆盖导入模块声明的现有提供程序。另外，我们可以分别使用相应的方法，`overrideGuard()`，`overrideInterceptor()`，`overrideFilter()`和`overridePipe()`来相继覆盖守卫，拦截器，过滤器和管道。

编译好的模块有几种在下表中详细描述的方法：

|||
|------------|-------------|
|`createNestInstance()`|基于给定模块创建一个Nest实例（返回`INestApplication`）,请注意，必须使用`init()`方法手动初始化应用程序|
|`createNestMicroservice()`|基于给定模块创建Nest微服务实例（返回`INestMicroservice）`|
|`get()`|检索应用程序上下文中可用的控制器或提供程序（包括警卫，过滤器等）的实例|
|`select()`|例如，浏览模块树，从所选模块中提取特定实例（与启用严格模式一起使用)|
|||

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://wx3.sinaimg.cn/large/006fVPCvly1fmpnlt8sefj302d02s742.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@gaoyangy](<https://github.com/gaoyangy>) | <img class="avatar-66 rm-style" src="https://avatars0.githubusercontent.com/u/23468113?s=460&v=4"> | 校正 | 专注于Vue，TS/JS |

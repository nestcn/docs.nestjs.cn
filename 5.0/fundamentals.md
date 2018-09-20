## 自定义Provider(Customer Provider)
有很多场景, 你想**直接**绑定某些值到nest的IoC容器。例如，常量，基于当前环境创建的可配置对象，引入的外部库或预先计算的值（取决于其他几个定义的提供程序）。此外，您可以覆盖默认实现，例如在替身测试(test doubles)的时候需要使用不同的类（用于测试目的）。

你应该始终牢记的一件重要事情就是Nest使用**tokens**(口令)来标识依赖关系。通常，用类名自动生成标记。如果你想创建一个自定义提供者，你需要选择一个令牌。大多数情况下，自定义令牌都由纯字符串表示。最佳实践是您应该在一个单独的文件中保存令牌，例如，在`constants.ts`中。

我们来看看可用的选项。

### 使用值

`useValue`语法在定义常量值，在三种情境下非常有用, 1. 定义常量, 2. 在Nest容器中引入外部库, 3. 用模拟对象替换实际实现。

```typescript
import { connection } from './connection';

const connectionProvider = {
  provide: 'Connection',
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
class CatsRepository {
  constructor(@Inject('Connection') connection: Connection) {}
}
```
!> `@Inject（）`装饰器从`@nestjs/common`包中导入。

当您想要覆盖的默认Provider的值时，比方说，您想强制Nest使用模拟的`CatsService`以进行测试，您可以简单地使用现有类作为标记。

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

在上面的例子中，`CatsService`将被传入的`mockCatsService`覆盖。这意味着，Nest不再是手动创建`CatsService`实例，而是直接使用`mockCatsService`。

### 使用类

`useClass`语法允许您对每个选定的因素使用不同的类。例如，我们有一个抽象的（或默认的）`ConfigService`类。根据当前环境，Nest应该使用不同的配置服务。

```typescript
const configServiceProvider = {
  provide: ConfigService,
  useClass: process.env.NODE_ENV === 'development'
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

### 使用工厂(use factory)

`useFactory`是**动态**创建provider的一种方式。工厂函数的返回实际的provider。工厂函数可以依赖几个不同的provider或保持完全独立。这意味着工厂可以接受不通的参数，Nest将在实例化过程中解析并传递参数。此外，工程函数也可以是**异步**的. [更多](5.0/fundamentals?id=异步提供者)详解。当你的provider必须被动态计算或者在异步过程中被resolve时, 可以使用异步工长函数。

```typescript
const connectionFactory = {
  provide: 'Connection',
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

### 导出自定义provider(export customer provider)

为了导出自定义provider，我们可以使用token或整个对象。以下示例显示了使用token的例子：

```typescript
const connectionFactory = {
  provide: 'Connection',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
  exports: ['Connection'],
})
export class ApplicationModule {}
```

但是你也可以使用整个对象：
```typescript
const connectionFactory = {
  provide: 'Connection',
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

## 异步提供者 (Asynchronous providers)
在完成一些异步任务之前，应用程序必须等待启动状态, 例如，必须先等待与数据库的建立连接才能启动应用。 在这种情况下你应该考虑使用异步provider。为了创建一个`异步`提供者，我们使用`useFactory`。工厂必须返回`Promise`（因此`async`也适用）。
```typescript
{
  provide: 'AsyncDbConnection',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
},
```
?> 在这里了解 [更多](5.0/fundamentals?id=用户提供商)自定义provider的相关方法。

### 注入(Injection)

异步provider可以通过它们的token（在上述例子中，通过`AsyncDbConnection`是token）简单地注入其他组件。一旦异步provider被resolve，每个依赖于异步provider的类都**将被实例化**。

以上示例用于演示目的。如果你正在寻找更详细的例子，请看 [这里](5.0/recipes?id=sql-类型)。

## 循环依赖
例如，当A类需要B类，而B类也需要A类时，就会产生**循环依赖**。 Nest允许在提供者(provider)和模块(module)之间创建循环依赖关系，但我们建议您尽可能避免。但是有时候难以避免，所以我们提供了一些方法来解决这个问题。

### 正向引用(Forward reference)

**正向引用**允许Nest引用目前尚未被定义的引用。当`CatsService`和`CommonService`相互依赖时，两边都需要使用`@Inject()`和`forwardRef()`，否则Nest不会实例化它们，因为所有基本元数据都不可用。让我们看看下面的代码片段：
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

为了在模块(module)之间创建循环依赖，必须在模块关联的两个部分上使用相同的`forwardRef()`：

>common.module.ts
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
    this.service = this.moduleRef.get<Service>(Service);
  }
}
```
?> `ModuleRef`类从`@nestjs/core`包中导入。


模块引用有一个`get()`方法，它允许检索当前模块中可用的任何组件。另外, 你可以使用非严格模式(non-strict mode), 保证你可以在整个应用中的任何地方获得该provider.

```typescript
this.moduleRef.get(Service, { strict: false });

```

## 跨平台(Platform agnosticism)

Nest的作为一个跨平台的框架。平台独立性使得**创建可重用的逻辑部分**成为可能，人们可以利用多种不同类型的应用程序。框架的架构专注于适用于任何类型的服务器端解决方案。

### 一次编译, 各处运行(Build once, use everywhere)

主要指HTTP服务器(REST APIs)。但是，所有这些构建的模块都可以轻松用于不同的传输层(`microservices`或`websockets`)。此外，Nest还配备了专用的 [GraphQL](5.0/graphql?id=快速开始)模块。最后但并非最不重要的一点是, 执行上下文功能有助于通过Nest创建在Node.js上运行的所有应用。

Nest鼓励成为一个完整的平台，为您的应用带来更高级别的可重用性。一次编译, 各处运行！

## 测试

自动测试是**全功能软件产品**的重要组成部分。这对于至少覆盖系统中最敏感的部分非常重要。为了实现这个目标，我们产生了一系列不同的测试，例如集成测试，单元测试，e2e测试等等。 Nest提供了一系列改进测试体验的测试实用程序。

通常，您可以使用您喜欢的任何**测试框架**。我们不强制模具，选择适合您要求的任何东西。主要的Nest应用程序启动程序与Jest框架集成在一起，以减少开始编写测试时的开销，但仍然可以轻松删除它并使用任何其他工具。

### 安装

首先，我们需要安装所需的软件包：
```bash
$ npm i --save-dev @nestjs/testing
```
###  单元测试

 在下面的例子中，我们有两个不同的类，分别是`CatsController`和`CatsService`。如前所述，Jest被用作一个完整的测试框架。该框架的行为像一个测试运行者，并提供断言函数和测试双工实用程序，以帮助模拟，间谍等。我们已经手动强制执行`catsService.findAll()`方法来返回结果变量，一旦被调用。由此，我们可以测试`catsController.findAll()`是否返回预期的结果。

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
?> 保持你的测试文件在附近的测试类。测试文件应该有`.spec`或`.test`后缀。

到目前为止，我们没有使用任何现有的Nest测试工具。由于我们手动处理实例化测试类，因此上面的测试套件与Nest无关。这种类型的测试称为**隔离测试**。

### 测试工具
`@nestjs/testing`包给了我们一套提升测试过程的实用程序。让我们重写前面的例子，但现在使用暴露的`Test`类。

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

`Test`类有一个`createTestingModule()`方法，该方法将模块元数据（与在`@Module()`装饰器中传递的对象相同的对象）作为参数。这个方法创建了一个`TestingModule`实例，它反过来提供了一些方法，但是当涉及到单元测试时，它们中只有一个是有用的-`compile()`。该功能是**异步**的，因此必须等待。一旦模块编译完成，您可以使用`get()`方法检索任何实例。


为了模拟一个真实的实例，你可以用自定义的提供者覆盖现有的 [用户提供者](5.0/fundamentals?id= 依赖注入)。

### 端到端测试


当应用程序增长时，很难手动测试每个API端点的行为。端到端测试帮助我们确保一切工作正常并符合项目要求。为了执行e2e测试，我们使用与**单元测试**相同的配置，但另外我们利用允许模拟HTTP请求的超类库。

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
?> 将您的`e2e`测试文件保存在`.e2e-spec`或`.e2e-test`后缀。


`cats.e2e-spec.ts`测试文件包含一个HTTP端点测试(`/ cats`)。我们使用`app.getHttpServer()`方法来获取在Nest应用程序的后台运行的底层HTTP服务器。请注意，`TestingModule`实例提供了`overrideProvider()`方法，因此我们可以覆盖导入模块声明的现有提供程序。另外，我们可以分别使用相应的方法，`overrideGuard()`，`overrideInterceptor()`，`overrideFilter()`和`overridePipe()`来相继覆盖守卫，拦截器，过滤器和管道。


编译好的模块有几种在下表中详细描述的方法：

|||
|------------|-------------|
|`createNestInstance()`|基于给定模块创建一个Nest实例（返回`INestApplication`）,请注意，需要使用`init()`方法手动初始化应用程序|
|`createNestMicroservice()`|基于给定模块创建Nest微服务实例（返回`INestMicroservice）`|
|`get()`|检索应用程序上下文中可用的控制器或提供程序（包括警卫，过滤器等）的实例|
|`select()`|例如，浏览模块树，从所选模块中提取特定实例（与启用严格模式一起使用)|
|||

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://wx3.sinaimg.cn/large/006fVPCvly1fmpnlt8sefj302d02s742.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |

## 依赖注入

有很多情况下, 当你想绑定的东西直接到 Nest 容器。您应该知道的是, Nest 是通过 tokens 来注入依赖关系的。通常, token 只是一种类型。如果要提供自定义组件, 则需要创建一个 token。通常, 自定义 token 是纯字符串。遵循最佳做法, 您应该将此 token 保存在分隔的文件中, 例如, constants.ts。

让我们来看看可用的选项:

### 使用 Value

```typescript
const connectionProvider = { provide: 'ConnectionToken', useValue: null };

@Module({
  components: [connectionProvider],
})
```

!> 将自定义提供程序保留在分离的文件中是一种很好的做法, 例如 cats.providers.ts。

用例：

- 将特定值绑定到容器，例如第三方库


### 使用工厂（Factory）

```typescript
const connectionFactory = {
  provide: 'ConnectionToken',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  components: [connectionFactory],
})
```
!> 如果你想使用模块中的组件，你必须将它们传递给inject数组。Nest会以相同顺序将实例作为函数的参数传递。

用例:

- 提供一个值, 必须使用其他组件 (或自定义包功能) 进行计算
- 提供待摊值, 例如数据库连接 (阅读有关[异步组件](4.5/asynccomponents)的更多信息)


### 使用类（class）

```typescript
const configServiceProvider = {
  provide: ConfigService,
  useClass: DevelopmentConfigService,
};

@Module({
  components: [configServiceProvider],
})
```

!> 们没有使用自定 义token ，而是使用了 ConfigService 类，因此实际上我们已经忽略了默认实现。

用例:

- 重写默认类的实现。

### 注入


要通过构造函数注入自定义组件，我们使用 `@Inject()` 装饰器。这个装饰器需要1个参数 - token 。

```typescript
@Component()
class CatsRepository {
  constructor(@Inject('ConnectionToken') connection: Connection) {}
}
```
!> @Inject() 装饰器从 @nestjs/common 包中导入。


## 异步组件

有时, 应用程序启动必须延迟, 直到某些异步任务完成, 例如, 建立与数据库的连接。这就是为什么 Nest 提供了创建异步组件的方法。

要创建异步组件, 我们使用的是 useFactory。工厂必须返回 Promise 或只是被标记为一个 async 功能。


```typescript
{
  provide: 'AsyncDbConnection',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
},
```

?> 阅读更多关于自定义组件的[信息](4.5/dependencyinjection)

这些异步组件可能只是由 token (在本例中为 AsyncDbConnection 令牌) 注入其他组件。当异步组件将被解析(resolved)时，每个依赖于异步组件的组件都将被实例化。

以上示例用于演示目的。如果你正在寻找更详细的，请看[这里](4.5/sqltypeorm)。

## 循环依赖

循环依赖意味着类 A 需要类 B ，而类 B 需要类 A。Nest 允许在组件和模块之间创建循环依赖关系，但我们建议您不要过多地使用它。有时很难避免这种类型的关系, 这就是为什么我们提供了一些方法来处理这个问题。

### 正向引用

正向引用允许 Nest 引用尚未定义的引用。当 CatsService 和 CommonService 相互依赖时, 双方都需要使用 @Inject()和 forwardRef() , 否则 Nest 不会创建组件实例, 因为所有必需的「元数据」都不可用。让我们看看下面的代码片段:

> cats.service.ts

```typescript
@Component()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private readonly commonService: CommonService,
  ) {}
}
```

!> 该 forwardRef( )函数是从 @nestjs/common 包中导入的。

这是关系的第一个方面。现在, 让我们做同样的 CommonService:

> common.service.ts

```typescript
@Component()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private readonly catsService: CatsService,
  ) {}
}
```

?> 你永远不知道哪个构造函数会先被调用。

要在模块之间创建循环依赖关系, 必须在模块关联的两个部分使用相同的 forwardRef() 实用程序:

> common.module.ts

```typescript
@Module({
  imports: [forwardRef(() => CatsModule)],
})
export class CommonModule {}
```

### 模块参考

Nest 提供了 ModuleRef 可以简单地注入每个组件的类。

> cats.service.ts

```typescript
@Component()
export class CatsService implements OnModuleInit {
  private service: Service;
  constructor(private readonly moduleRef: ModuleRef) {}

  onModuleInit() {
    this.service = this.moduleRef.get<Service>(Service);
  }
}
```

!> 该 ModuleRef 类是从 @nestjs/core 包引入的。

模块引用有一个get()方法，它允许检索当前模块中可用的任何组件。


## 单元测试
单元测试在编程领域非常重要。有很多很棒的文章会告诉我们为什么写以及如何写单元测试， 因此在这里我只会告诉你 Nest 的相关工具。

### 隔离测试
组件，控制器，拦截器... 这些 Nest 应用程序的构建块，实际上都只是简单的类。由于每个依赖项都是通过构造器注入的，因此可以使用一些流行的库对其轻松地进行 `mock` ，例如： [Jasmine](https://github.com/jasmine/jasmine) 或 [Jest](https://github.com/facebook/jest)。

`cats.controller.spec.ts`

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
?>  将你的测试文件保存在已测试的类附近. 测试文件应该有一个 `.spec` 或 `.test` 后缀.

这有一个使用 [Jest](https://github.com/facebook/jest) 库的例子. 我们使用 `new` 关键词手动创建了 `CatsController` 和 `CatsService` 的示例，我们没有使用任何 Nest 的工具。这种测试就称为隔离测试。

### 测试工具

Nest 有一个测试专用包 `@nestjs/testing` ，它提供了一套实用的工具来帮助我们测试。让我们使用 Nest `Test` 类来重写这个测试的例子。

`cats.controller.spec.ts`

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
        components: [CatsService],
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
`Test` 类有一个 `createTestingModule()` 方法，它将模块元数据（module metadata）作为参数（模块元数据是等同于 `@Module()` 装饰器的一个对象）。这个方法创建一个 `TestingModule` 实例，这个实例提供了一些方法，其中只有 `compile()` 这一个方法在单元测试中是有用的。这个方法是异步的，所以它必须被等待。当模块要被编译并准备使用时，你可以使用 `get()` 方法取到任何实例。

有时你可能想使用测试替身（test doubles）来替代真实的实例。这很容易，因为 Nest 允许使用 [自定义组件（custom components）](https://docs.nestjs.com/fundamentals/dependency-injection) 来覆盖原本的组件（component）。

?> 阅读更多关于 `TestingModule` 类的内容，请移步  **[这里](4.5/e2e.md)** .


## E2E 测试

端到端测试是一个很好的方法从开始到结束来验证应用程序是如何工作的。例如, 当应用程序增长时, 很难手动测试每个 API 端点。e2e 测试帮助我们确保一切工作正常, 符合我们的要求。

执行 e2e 测试的步骤与单元测试完全相同。我们使用 Jest 库作为测试运行器，并使用 Test 静态类来创建测试模块。此外, 为了模拟 HTTP 请求, 我们已经安装了 supertest 库。

让我们创建一个 e2e 目录并测试 CatsModule。

> cats.e2e-spec.ts

```typescript
import * as express from 'express';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { CatsModule } from '../../src/cats/cats.module';
import { CatsService } from '../../src/cats/cats.service';

describe('Cats', () => {
    const server = express();
    const catsService = { findAll: () => ['test'] };

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [CatsModule],
          })
          .overrideComponent(CatsService).useValue(catsService)
          .compile();

        const app = module.createNestApplication(server);
        await app.init();
    });

    it(`/GET cats`, () => {
        return request(server)
            .get('/cats')
            .expect(200)
            .expect({
              data: catsService.findAll(),
            });
    });
});
```

!> 将您的 e2e 测试文件保存在 e2e 目录中。测试文件应该有一个 .e2e-spec 或一个 .e2e-test 后缀。

这是一个 `cats.e2e-spec.ts` 测试文件。它包含一个 HTTP 请求测试，我们正在检查响应是否看起来像预期的那样。

请注意，TestingModule 实例提供了一种 overrideComponent() 方法，因此我们可以重写作为导入模块一部分的组件。此外，我们可以先后使用 overrideGuard() 和覆盖看守器和拦截器 overrideInterceptor()。

编译好的模块有几种在下表中详细描述的方法：

| | |
| --------   | ----- | 
| createNestInstance() | 采用可选参数-快速实例, 并返回 INestApplication。必须使用 init () 方法手动初始化应用程序。 |
| createNestMicroservice() | 以 MicroserviceConfiguration 为参数, 并返回 INestMicroservice 。  |
| get() | 使您可以检索已处理模块内可用的组件或控制器的实例。 |
| select() | 允许您在模块树中导航, 例如, 从所选模块中拉出特定实例。 |
## 异步本地存储 (Async Local Storage)

`AsyncLocalStorage` 是一个 [Node.js API](https://nodejs.org/api/async_context.html#async_context_class_asynclocalstorage)（基于 `async_hooks` API），它提供了一种无需显式传递函数参数就能在应用中传播本地状态的替代方案。这类似于其他语言中的线程本地存储。

异步本地存储的核心思想是我们可以用 `AsyncLocalStorage#run` 调用*包装*某些函数调用。所有在被包装调用内执行的代码都能访问相同的 `store`，且每个调用链都将拥有唯一的存储空间。

在 NestJS 上下文中，这意味着如果我们能在请求生命周期中找到某个位置来包装请求的剩余代码，就能访问和修改仅对该请求可见的状态，这可以作为 REQUEST 作用域提供程序的替代方案，并解决其部分局限性。

或者，我们可以使用 ALS（异步本地存储）仅为系统的一部分（例如*事务*对象）传播上下文，而无需在服务间显式传递，这样可以提高隔离性和封装性。

#### 自定义实现

NestJS 本身并未为 `AsyncLocalStorage` 提供任何内置抽象，因此让我们通过最简单的 HTTP 案例来了解如何自行实现，以便更好地理解整个概念：

:::info 提示
如需使用现成的[专用包](#nestjs-cls)，请继续阅读下文。
:::



1. 首先，在某个共享源文件中创建一个新的 `AsyncLocalStorage` 实例。由于我们使用 NestJS，让我们也将其转换为带有自定义提供者的模块。

 ```typescript title="als.module.ts"
@Module({
  providers: [
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage(),
    },
  ],
  exports: [AsyncLocalStorage],
})
export class AlsModule {}
```

:::info 提示
`AsyncLocalStorage` 是从 `async_hooks` 导入的。
:::



2. 我们只关注 HTTP，所以让我们使用中间件将 `next` 函数用 `AsyncLocalStorage#run` 包装起来。由于中间件是请求最先到达的地方，这将使得 `store` 在所有增强器和系统其余部分中都可用。

 ```typescript title="app.module.ts"
@Module({
  imports: [AlsModule],
  providers: [CatsService],
  controllers: [CatsController],
})
export class AppModule implements NestModule {
  constructor(
    // inject the AsyncLocalStorage in the module constructor,
    private readonly als: AsyncLocalStorage
  ) {}

  configure(consumer: MiddlewareConsumer) {
    // bind the middleware,
    consumer
      .apply((req, res, next) => {
        // populate the store with some default values
        // based on the request,
        const store = {
          userId: req.headers['x-user-id'],
        };
        // and pass the "next" function as callback
        // to the "als.run" method together with the store.
        this.als.run(store, () => next());
      })
      .forRoutes('*path');
  }
}
```

3.  现在，在请求生命周期的任何地方，我们都可以访问本地存储实例。

```ts title="cats.service"
@Injectable()
export class CatsService {
  constructor(
    // We can inject the provided ALS instance.
    private readonly als: AsyncLocalStorage,
    private readonly catsRepository: CatsRepository,
  ) {}

  getCatForUser() {
    // The "getStore" method will always return the
    // store instance associated with the given request.
    const userId = this.als.getStore()["userId"] as number;
    return this.catsRepository.getForUser(userId);
  }
}
```

4.  就这样，我们现在有了无需注入整个 `REQUEST` 对象就能共享请求相关状态的方法。

:::warning 警告
请注意，虽然该技术在许多用例中很有用，但它本质上会使代码流程变得晦涩（创建隐式上下文），因此请负责任地使用它，尤其要避免创建上下文式的" [上帝对象](https://en.wikipedia.org/wiki/God_object) "。
:::



### NestJS CLS

[nestjs-cls](https://github.com/Papooch/nestjs-cls) 包相比直接使用原生 `AsyncLocalStorage`（`CLS` 是 _continuation-local storage_ 的缩写）提供了多项开发者体验改进。它将实现抽象为一个 `ClsModule`，为不同传输方式（不仅限于 HTTP）提供多种初始化 `store` 的方法，同时还支持强类型。

然后可以通过可注入的 `ClsService` 访问存储，或者通过使用[代理提供者](https://www.npmjs.com/package/nestjs-cls#proxy-providers)将其完全从业务逻辑中抽象出来。

:::info nestjs-cls
`nestjs-cls` 是第三方包，不由 NestJS 核心团队维护。如发现该库的任何问题，请在[相应仓库](https://github.com/Papooch/nestjs-cls/issues)中报告。
:::

#### 安装

除了对 `@nestjs` 库的对等依赖外，它仅使用 Node.js 内置 API。可像安装其他包一样安装它。

```bash
npm i nestjs-cls
```

#### 使用方法

可以使用 `nestjs-cls` 实现与[上文](#自定义实现)描述的类似功能，如下所示：

1.  在根模块中导入 `ClsModule`。

```ts title="app.module"
@Module({
  imports: [
    // Register the ClsModule,
    ClsModule.forRoot({
      middleware: {
        // automatically mount the
        // ClsMiddleware for all routes
        mount: true,
        // and use the setup method to
        // provide default store values.
        setup: (cls, req) => {
          cls.set('userId', req.headers['x-user-id']);
        },
      },
    }),
  ],
  providers: [CatsService],
  controllers: [CatsController],
})
export class AppModule {}
```

2.  然后就可以使用 `ClsService` 来访问存储值。

```ts title="cats.service"
@Injectable()
export class CatsService {
  constructor(
    // We can inject the provided ClsService instance,
    private readonly cls: ClsService,
    private readonly catsRepository: CatsRepository,
  ) {}

  getCatForUser() {
    // and use the "get" method to retrieve any stored value.
    const userId = this.cls.get('userId');
    return this.catsRepository.getForUser(userId);
  }
}
```

3.  为了获得由 `ClsService` 管理的存储值的强类型（同时获取字符串键的自动建议），我们可以在注入时使用可选类型参数 `ClsService<MyClsStore>`。

```ts
export interface MyClsStore extends ClsStore {
  userId: number;
}
```

:::info 提示
也可以让包自动生成一个请求 ID，稍后通过 `cls.getId()` 访问它，或者使用 `cls.get(CLS_REQ)` 获取整个请求对象。
:::

#### 测试

由于 `ClsService` 只是另一个可注入的提供者，因此在单元测试中可以完全模拟它。

然而，在某些集成测试中，我们可能仍希望使用真实的 `ClsService` 实现。在这种情况下，我们需要用 `ClsService#run` 或 `ClsService#runWith` 调用来包装上下文感知的代码片段。

```ts
describe('CatsService', () => {
  let service: CatsService
  let cls: ClsService
  const mockCatsRepository = createMock<CatsRepository>()

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      // 设置 up most of the testing module as we normally would.
      providers: [
        CatsService,
        {
          provide: CatsRepository
          useValue: mockCatsRepository
        }
      ],
      imports: [
        // 导入 the static version of ClsModule which only provides
        // the ClsService, but does not set up the store in any way.
        ClsModule
      ],
    }).compile()

    service = module.get(CatsService)

    // Also retrieve the ClsService for later use.
    cls = module.get(ClsService)
  })

  describe('getCatForUser', () => {
    it('retrieves cat based on user id', async () => {
      const expectedUserId = 42
      mocksCatsRepository.getForUser.mockImplementationOnce(
        (id) => ({ userId: id })
      )

      // Wrap the test call in the `runWith` method
      // in which we can pass hand-crafted store values.
      const cat = await cls.runWith(
        { userId: expectedUserId },
        () => service.getCatForUser()
      )

      expect(cat.userId).toEqual(expectedUserId)
    })
  })
})
```

#### 更多信息

访问 [NestJS CLS GitHub 页面](https://github.com/Papooch/nestjs-cls)获取完整的 API 文档和更多代码示例。

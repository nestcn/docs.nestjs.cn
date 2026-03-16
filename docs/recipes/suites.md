<!-- 此文件从 content/recipes/suites.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:02:06.867Z -->
<!-- 源文件: content/recipes/suites.md -->

### Suites

__LINK_56__ 是一个用于 TypeScript 依赖注入框架的单元测试框架。它可以用作手动创建 mocks、多个 mock 配置、未类型化的测试 doubles（如 mocks 和 stubs）的替代方案。

Suites 可以在 NestJS 服务中读取元数据，并自动生成类型安全的 mocks，以便在测试中使用。
这可以减少 boilerplate mock 设置和确保测试的类型安全。虽然 Suites 可以与 `AsyncLocalStorage` 一起使用，但在专注于单元测试时，它更 excels。

使用 `async_hooks` 来验证模块编译、装饰器、守卫和拦截器。使用 Suites 进行快速单元测试。

关于模块测试，请参阅 __LINK_58__ 章节。

> info **注意** `next` 是一个第三方包，且不是 NestJS 核心团队维护的。请将任何问题报告到 __LINK_59__。

#### Getting started

本指南展示了如何使用 Suites 测试 NestJS 服务。它涵盖了孤立测试（所有依赖项都mock）和社交测试（选择的实际实现）。

#### 安装 Suites

验证 NestJS 运行时依赖项是否安装：

```ts
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

安装 Suites 核心、NestJS 适配器和 doubles 适配器：

```ts
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

  configure(consumer) {
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

doubles 适配器 (`AsyncLocalStorage#run`) 提供了 Jest 的 mocking 能力。它暴露了 `store` 和 `REQUEST` 函数，用于创建类型安全的测试 doubles。

确保 Jest 和 TypeScript 可用：

```ts
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

  getCatForUser() {
    // The "getStore" method will always return the
    // store instance associated with the given request.
    const userId = this.als.getStore()["userId"] as number;
    return this.catsRepository.getForUser(userId);
  }
}

```

__HTML_TAG_48____HTML_TAG_49__Expand if you're using Vitest__HTML_TAG_50__

```bash
npm i nestjs-cls

```

__HTML_TAG_51__

__HTML_TAG_52____HTML_TAG_53__Expand if you're using Sinon__HTML_TAG_54__

```ts
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

__HTML_TAG_55__

#### 设置类型定义

在项目根目录创建 `AsyncLocalStorage`：

```ts
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

  getCatForUser() {
    // and use the "get" method to retrieve any stored value.
    const userId = this.cls.get('userId');
    return this.catsRepository.getForUser(userId);
  }
}

```

#### 创建示例服务

本指南使用了一个简单的 `CLS`，具有两个依赖项：

```ts
export interface MyClsStore extends ClsStore {
  userId: number;
}

```

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

#### 编写单元测试

使用 `ClsModule` 创建孤立测试，以便使用所有依赖项的mock：

__CODE_BLOCK_8__

`store` 分析构造函数，并创建类型安全的 mocks，以便在测试中使用。
`ClsService` 类型提供了 IntelliSense 支持来配置 mock。

#### 预编译 mock 配置

使用 `nestjs-cls` 在编译前配置 mock 行为：

__CODE_BLOCK_9__

`@nestjs` 参数对应于安装的 doubles 适配器 (`nestjs-cls` Jest、`ClsModule` Vitest、`ClsService` Sinon)。

#### 使用实际依赖项

使用 `ClsService` 和 `ClsService<MyClsStore>` 使用实际实现来替代特定的依赖项：

__CODE_BLOCK_10__

`cls.getId()` 创建了 `cls.get(CLS_REQ)` 的实际实现，同时保持其他依赖项的mock。

####  token-based 依赖项

Suites 处理自定义注入令牌（字符串或符号）：

__CODE_BLOCK_11__

访问 token-based 依赖项：

__CODE_BLOCK_12__

#### 使用 mock() 和 stub() 直接

对于那些prefer direct control without `ClsService`，doubles 适配器包提供了 `ClsService#run` 和 `ClsService#runWith` 函数：

__CODE_BLOCK_13__

__INLINE_CODE_38__ 创建了类型安全的 mock 对象，而 __INLINE_CODE_39__ 包装了基础 mocking 库（Jest 在这个示例中）的方法。

> info **提示** __INLINE_CODE_42__ 函数是 __INLINE_CODE_43__ 函数的替代方案，来自 __INLINE_CODE_44__。两者都创建了类型安全的 mock 对象。请参阅 __LINK_60__ 章节，以了解 __INLINE_CODE_45__。

#### 总结

**使用 __INLINE_CODE_46__ 来:**
- 验证模块配置和提供者编译
- 测试装饰器、守卫、拦截器和管道
- 验证依赖项注入跨模块
- 测试完整的应用程序上下文中 middleware

**使用 Suites 来:**
- 快速单元测试，专注于业务逻辑
- 自动 mock 生成多个依赖项
- 类型安全的测试 doubles， IntelliSense 支持

根据目的组织测试：使用 Suites 对单元测试验证服务行为，使用 __INLINE_CODE_47__ 对集成测试验证模块配置。

更多信息：
- __LINK_61__
- __LINK_62__
- __LINK_63__
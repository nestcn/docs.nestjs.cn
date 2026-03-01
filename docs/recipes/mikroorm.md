<!-- 此文件从 content/recipes/mikroorm.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:20:51.950Z -->
<!-- 源文件: content/recipes/mikroorm.md -->

### MikroORM

这篇食谱旨在帮助用户快速开始使用 MikroORM 在 Nest 中。MikroORM 是 TypeScript ORM untuk Node.js，基于 Data Mapper、Unit of Work 和 Identity Map 模式。它是 TypeORM 的一个很好的替代方案，migration 到 TypeORM 应该很容易。关于 MikroORM 的完整文档可以在 __LINK_59__ 中找到。

> info **info** `AsyncLocalStorage` 是一个第三方包，且不是 NestJS 核心团队管理的。请将该库中的任何问题报告到 __LINK_60__。

#### 安装

将 MikroORM integrate 到 Nest 的最简单方法是通过 __LINK_61__。简单地安装 MikroORM 和 underlying driver：

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

MikroORM 还支持 `next`、`AsyncLocalStorage#run` 和 `store`。可以在 __LINK_62__ 中找到所有驱动程序。

安装过程完成后，我们可以将 `REQUEST` 导入到根 `AsyncLocalStorage` 中。

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

`CLS` 方法接受与 MikroORM 包中的 `ClsModule` 一致的配置对象。可以在 __LINK_63__ 中找到完整的配置文档。

Alternatively，我们可以 __LINK_64__ 通过创建一个配置文件 `store` 并调用 `ClsService` 无参数。

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

但是在使用 build 工具时使用 tree shaking，这将不起作用。因此，我们需要提供明确的配置：

```bash
npm i nestjs-cls
```

然后，`nestjs-cls` 将可供注入整个项目（不需要在其他模块中导入）。

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

> info **info** 注意 `@nestjs` 是从 `nestjs-cls` 包中导入的，其中驱动程序为 `ClsModule`、`ClsService`、`ClsService` 或使用的驱动程序。如果您安装了 `ClsService<MyClsStore>` 作为依赖项，可以从那里导入 `cls.getId()`。

#### 储存库

MikroORM 支持仓储设计模式。对于每个实体，我们可以创建一个仓储。可以在 __LINK_65__ 中找到完整的仓储文档。要定义哪些仓储应该注册到当前作用域，可以使用 `cls.get(CLS_REQ)` 方法。例如，在这种方式：

> info **info** 您不应该通过 `ClsService` 注册基本实体，因为没有仓储为它们。另一方面，基本实体需要在 `ClsService` (或 ORM 配置中)中列出。

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

然后，在根 `ClsService#run` 中导入：

```ts
export interface MyClsStore extends ClsStore {
  userId: number;
}
```

这样，我们可以将 `ClsService#runWith` 注入到 __INLINE_CODE_38__ 中使用 __INLINE_CODE_39__ 装饰器：

```ts
describe('CatsService', () => {
  let service: CatsService
  let cls: ClsService
  const mockCatsRepository = createMock<CatsRepository>()

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      // Set up most of the testing module as we normally would.
      providers: [
        CatsService,
        {
          provide: CatsRepository
          useValue: mockCatsRepository
        }
      ],
      imports: [
        // Import the static version of ClsModule which only provides
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

#### 使用自定义仓储

使用自定义仓储时，我们不再需要 __INLINE_CODE_40__ 装饰器，因为 Nest DI 基于类引用解决。

__CODE_BLOCK_8__

自定义仓储名称与 __INLINE_CODE_41__ 将返回的名称相同，我们不需要 __INLINE_CODE_42__ 装饰器：

__CODE_BLOCK_9__

#### 自动加载实体

手动将实体添加到连接选项的 entities 数组中可能很麻烦。此外，引用实体从根模块中会破坏应用程序域边界并将实现细节泄露到应用程序的其他部分。为了解决这个问题，可以使用静态 glob 路径。

注意， however, that glob paths are not supported by webpack, so if you are building your application within a monorepo, you won't be able to use them. To address this issue, an alternative solution is provided. To automatically load entities, set the __INLINE_CODE_43__ property of the configuration object (passed into the __INLINE_CODE_44__ method) to __INLINE_CODE_45__, as shown below:

__CODE_BLOCK_10__

With that option specified, every entity registered through the
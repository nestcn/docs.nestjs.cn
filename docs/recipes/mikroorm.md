<!-- 此文件从 content/recipes/mikroorm.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:13:39.278Z -->
<!-- 源文件: content/recipes/mikroorm.md -->

### MikroORM

MikroORM 是帮助用户在 Nest 中快速入门的配方。MikroORM 是 TypeScript ORM 的 Node.js 版本，基于 Data Mapper、Unit of Work 和 Identity Map 模式。它是 TypeORM 的一个优秀替代品，TypeORM 到 MikroORM 的迁移应该非常容易。MikroORM 的完整文档可以在 __LINK_59__ 中找到。

> 信息 **信息** `AsyncLocalStorage` 是一个第三方包，不受 NestJS 核心团队管理。请在 __LINK_60__ 中报告该库中的任何问题。

#### 安装

与 Nest 集成 MikroORM 的最简单方法是通过 __LINK_61__。

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

MikroORM 还支持 `next`、`AsyncLocalStorage#run` 和 `store`。请查看 __LINK_62__ 中的所有驱动程序。

安装过程完成后，我们可以将 `REQUEST` 导入到根 `AsyncLocalStorage`。

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

`CLS` 方法接受与 MikroORM 包中的 `ClsModule` 配置对象相同的配置对象。请查看 __LINK_63__ 中的完整配置文档。

Alternatively, we can __LINK_64__ by creating a configuration file `store` and then calling the `ClsService` without any arguments.

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

But this won't work when you use a build tool that uses tree shaking, for that it is better to provide the config explicitly:

```bash
npm i nestjs-cls
```

Afterward, the `nestjs-cls` will be available to inject across the entire project (without importing any module elsewhere).

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

> 信息 **信息** Notice that the `@nestjs` is imported from the `nestjs-cls` package, where driver is `ClsModule`, `ClsService`, `ClsService` or what driver you are using. In case you have `ClsService<MyClsStore>` installed as a dependency, you can also import the `cls.getId()` from there.

#### 仓库

MikroORM 支持仓库设计模式。对于每个实体，我们可以创建一个仓库。阅读仓库的完整文档 __LINK_65__。要定义哪些仓库应该在当前作用域中注册，可以使用 `cls.get(CLS_REQ)` 方法。例如，在这种方式：

> 信息 **信息** 您 shouldn't 注册基本实体via `ClsService`，因为没有仓库为这些实体。在另一方面，基本实体需要在 `ClsService` (或 ORM 配置中一般) 中列出。

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

并将其导入到根 `ClsService#run`：

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

#### 使用自定义仓库

当使用自定义仓库时，我们不再需要 __INLINE_CODE_40__ 装饰器，因为 Nest DI 根据类引用解析。

__CODE_BLOCK_8__

由于自定义仓库的名称与 __INLINE_CODE_41__ 将返回的名称相同，我们不再需要 __INLINE_CODE_42__ 装饰器：

__CODE_BLOCK_9__

#### Automatically load entities

手动将实体添加到连接选项的实体数组中可能很繁琐。此外，引用实体从根模块中会破坏应用程序域边界并将实现细节泄露到应用程序的其他部分。要解决这个问题，可以使用静态 glob 路径。

注意， however, that glob paths are not supported by webpack, so if you are building your application within a monorepo, you won't be able to use them. To address this issue, an alternative solution is provided. To automatically load entities, set the __INLINE_CODE_43__ property of the configuration object (passed into the __INLINE_CODE_44__ method) to __INLINE_CODE_45__, as shown below:

__CODE_BLOCK_10__

With that option specified,
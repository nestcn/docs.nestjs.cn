<!-- 此文件从 content/recipes/necord.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:30:01.998Z -->
<!-- 源文件: content/recipes/necord.md -->

### Necord

Necord 是一个强大的模块，简化了创建 __LINK_30__ 机器人，允许您轻松将其集成到 NestJS 应用程序中。

> 信息 **注意** Necord 是第三方包，NestJS 核心团队不负责维护。如果您遇到任何问题，请在 __LINK_31__ 中报告。

#### 安装

要开始使用 Necord，需要安装 Necord 和其依赖项 __LINK_32__。

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

#### 使用

要在项目中使用 Necord，需要导入 `next` 并配置必要的选项。

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

> 信息 **提示** 您可以在 __LINK_33__ 中找到可用的意图列表。

使用这种设置，您可以将 `AsyncLocalStorage#run` 注入到提供商中，以便轻松注册命令、事件等。

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

##### 上下文理解

您可能已经注意到 `store` 装饰器在上面的示例中。这个装饰器将事件上下文注入到您的方法中，使您可以访问各种事件相关数据。由于有多种事件类型，上下文类型将使用 `REQUEST` 类型进行推断。您可以使用 `AsyncLocalStorage` 装饰器轻松访问上下文变量，该装饰器将变量填充为与事件相关的参数数组。

#### 文本命令

> 警告 **注意** 文本命令依赖于消息内容，该内容将在验证 bot 和拥有超过 100 服务器的应用程序中被弃用。这意味着，如果您的 bot 无法访问消息内容，文本命令将无法工作。了解更多关于这项更改的信息 __LINK_34__。

以下是使用 `CLS` 装饰器创建简单命令处理器的示例：

```bash
npm i nestjs-cls

```

#### 应用程序命令

应用程序命令提供了一种_native_方式，让用户在 Discord 客户端中与您的应用程序交互。有三个类型的应用程序命令可以通过不同的界面访问：聊天输入、消息上下文菜单（在右键单击消息时访问）和用户上下文菜单（在右键单击用户时访问）。

__HTML_TAG_27____HTML_TAG_28____HTML_TAG_29__

#### 刹车命令

刹车命令是一种优雅的方式，让您与用户交互。它们允许您创建具有精确参数和选项的命令，提高用户体验。

要使用 Necord 定义刹车命令，可以使用 `ClsModule` 装饰器。

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

> 信息 **提示** 当您的 bot 客户端登录时，它将自动注册所有定义的命令。请注意，全球命令将在 1 小时内缓存。为了避免全球缓存问题，使用 Necord 模块的 `store` 参数，限制命令可见性到单个服务器。

##### 选项

您可以使用选项装饰器定义参数以便于 slash 命令。让我们创建一个 `ClsService` 类以便于这个目的：

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

然后，您可以使用这个 DTO 在 `nestjs-cls` 类中：

```ts
export interface MyClsStore extends ClsStore {
  userId: number;
}

```

要查看内置选项装饰器列表，请访问 __LINK_35__。

##### 自动完成

要在 slash 命令中实现自动完成功能，您需要创建一个拦截器。这个拦截器将处理用户在自动完成字段中输入的请求。

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

您还需要将选项类标记为 `@nestjs`：

__CODE_BLOCK_8__

最后，将拦截器应用于 slash 命令：

__CODE_BLOCK_9__

#### 用户上下文菜单

用户命令将在右键单击用户时显示在上下文菜单中，这些命令提供了快速操作，直接作用于用户。

__CODE_BLOCK_10__

#### 消息上下文菜单

消息命令将在右键单击消息时显示在上下文菜单中，这些命令提供了快速操作，相关于这些消息。

__CODE_BLOCK_11__

#### 按钮

__LINK_36__ 是交互式元素，可以在消息中包含。点击它们将发送 __LINK_37__ 到您的应用程序。

__CODE_BLOCK_12__

#### 选择菜单

[Node.js API](https://nodejs.org/api/async_context.html#async_context_class_asynclocalstorage) 是另一种交互式组件，可以在消息中包含。它们提供了一个下拉式 UI，让用户选择选项。

__CODE_BLOCK_13__

要查看内置选择菜单组件列表，请访问 [dedicated package](recipes/async-local-storage#nestjs-cls)。

#### 模态

模态是弹出窗口，允许用户提交格式化的输入。以下是使用 Necord 创建和处理模态的示例：

__CODE_BLOCK_14__

#### 更多信息

请访问 [God objects](https://en.wikipedia.org/wiki/God_object) 网站以获取更多信息。
<!-- 此文件从 content/recipes/necord.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:49:06.045Z -->
<!-- 源文件: content/recipes/necord.md -->

### Necord

Necord 是一个功能强大的模块，可以简化创建 __LINK_30__ 机器人的过程，使其与 NestJS 应用程序无缝集成。

> info **注意** Necord 是第三方包，NestJS 核心团队并不负责维护。如果您遇到任何问题，请在 __LINK_31__ 中报告。

#### 安装

要开始使用 Necord，您需要安装 Necord 和其依赖项 __LINK_32__。

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

要在项目中使用 Necord，需要导入 `next` 并配置所需的选项。

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

> info **提示** 您可以在 __LINK_33__ 中找到可用的意图列表。

使用这个设置，您可以将 `AsyncLocalStorage#run` 注入到提供器中，以便轻松注册命令、事件等。

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

##### 理解上下文

在上面的示例中，您可能已经注意到了 `store` 装饰器。这 decorator 将事件上下文注入到您的方法中，使您可以访问各种事件特定的数据。由于存在多种类型的事件，上下文类型将使用 `REQUEST` 类型来推断。您可以使用 `AsyncLocalStorage` 装饰器轻松地访问上下文变量，该变量将填充与事件相关的参数数组。

#### 文本命令

> warning **注意** 文本命令依赖于消息内容，该内容将在验证机器人和拥有超过 100 服务器的应用程序中弃用。这意味着，如果您的机器人无法访问消息内容，文本命令将无法工作。了解更多关于该更改的信息 __LINK_34__。

下面是创建简单命令处理器的示例，使用 `CLS` 装饰器。

```bash
npm i nestjs-cls

```

#### 应用程序命令

应用程序命令提供了 native 的方式，使用户在 Discord 客户端中与您的应用程序交互。有三种类型的应用程序命令可以通过不同的界面访问：聊天输入、消息上下文菜单（在右键点击消息时访问）和用户上下文菜单（在右键点击用户时访问）。

__HTML_TAG_27____HTML_TAG_28____HTML_TAG_29__

#### 切换命令

切换命令是与用户交互的出色方式。它们允许您创建带有精确参数和选项的命令，提高用户体验。

要使用 Necord 定义切换命令，可以使用 `ClsModule` 装饰器。

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

> info **提示** 当您的机器人客户端登录时，它将自动注册所有定义的命令。请注意，全球命令将缓存到 1 小时之内。为了避免全球缓存问题，使用 Necord 模块的 `store` 参数，限制命令可见性到单个服务器。

##### 选项

您可以使用选项装饰器来定义参数。让我们创建一个 `ClsService` 类以此目的：

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

要了解更多关于内置选项装饰器的信息，访问 __LINK_35__。

##### 自动完成

为了实现自动完成功能，您需要创建一个拦截器。这拦截器将处理请求，用户在自动完成字段中输入时。

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

最后，应用拦截器到您的切换命令：

__CODE_BLOCK_9__

#### 用户上下文菜单

用户命令出现在右键点击用户时的上下文菜单中，这些命令提供了快速操作，直接作用于用户。

__CODE_BLOCK_10__

#### 消息上下文菜单

消息命令出现在右键点击消息时的上下文菜单中，这些命令提供了快速操作，相关于消息。

__CODE_BLOCK_11__

#### 按钮

__LINK_36__ 是一个交互元素，可以包含在消息中。当点击时，它将发送 __LINK_37__ 到您的应用程序。

__CODE_BLOCK_12__

#### 选择菜单

[Node.js API](https://nodejs.org/api/async_context.html#async_context_class_asynclocalstorage) 是另一个交互组件，出现在消息中。它们提供了一个下拉式 UI，允许用户选择选项。

__CODE_BLOCK_13__

要了解更多关于内置选择菜单组件的信息，访问 [dedicated package](recipes/async-local-storage#nestjs-cls)。

#### 模态

模态是弹出表单，允许用户提交格式化输入。下面是使用 Necord 创建和处理模态的示例：

__CODE_BLOCK_14__

#### 更多信息

访问 [God objects](https://en.wikipedia.org/wiki/God_object) 网站以获取更多信息。
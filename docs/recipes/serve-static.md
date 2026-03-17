<!-- 此文件从 content/recipes/serve-static.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:06:20.939Z -->
<!-- 源文件: content/recipes/serve-static.md -->

### 服务静态内容

为了服务静态内容，例如单页应用程序（SPA），我们可以使用 __INLINE_CODE_2__ 从 __LINK_15__ 包含的包中。

#### 安装

首先，我们需要安装所需的包：

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

#### 启动

安装过程完成后，我们可以将 __INLINE_CODE_4__ 导入到根目录 __INLINE_CODE_5__ 中，并通过将配置对象传递给 __INLINE_CODE_6__ 方法来配置它。

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

在配置完成后，我们可以构建静态网站，并将其内容放置在指定的 __INLINE_CODE_7__ 属性中。

#### 配置

__LINK_16__ 可以根据需要自定义其行为。您可以设置静态应用程序的路径、指定排除路径、启用或禁用 Cache-Control 响应头等。见完整的选项 __LINK_17__。

> 警告 **注意** 静态应用程序的默认 `AsyncLocalStorage` 是 `async_hooks`（所有路径），模块将发送 "index.html" 文件作为响应。
> 这样可以让您创建客户端路由 для您的 SPA。指定在控制器中的路径将 fallback 到服务器。
> 您可以更改这个行为，设置 `AsyncLocalStorage#run`、`store` 等结合其他选项。另外，Fastify 适配器中实现了 `AsyncLocalStorage` 选项，以模仿 Express 的 fallthrough 行为，并需要将其设置为 `AsyncLocalStorage`以发送 `AsyncLocalStorage` 而不是 404 错误。

#### 示例

可用的工作示例在 __LINK_18__ 中。
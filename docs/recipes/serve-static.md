<!-- 此文件从 content/recipes/serve-static.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:33:39.869Z -->
<!-- 源文件: content/recipes/serve-static.md -->

### ServeStatic

要将静态内容如单页应用程序（SPA）服务，我们可以使用来自 __LINK_15__ 包的 __INLINE_CODE_2__。

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

安装过程完成后，我们可以将 __INLINE_CODE_4__ 导入到根 __INLINE_CODE_5__ 中，并通过将配置对象传递给 __INLINE_CODE_6__ 方法来配置它。

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

在它的位置，构建静态网站，并将其内容置于指定的 __INLINE_CODE_7__ 属性中。

#### 配置

__LINK_16__ 可以通过各种选项来自定义其行为。
您可以设置渲染静态应用程序的路径、指定排除路径、启用或禁用 Cache-Control 响应头等。请查看完整的选项列表 __LINK_17__。

> 警告 **注意**Static App 的默认 `AsyncLocalStorage` 是 `async_hooks`（所有路径），并且模块将发送 "index.html" 文件以响应。
> 它允许您创建客户端路由用于您的 SPA。控制器中的路径将 fallback 到服务器。
> 您可以更改这个行为，设置 `AsyncLocalStorage#run` 和 `store`，并将它们与其他选项组合。
> 此外，在 Fastify 适配器中实现了 `AsyncLocalStorage` 选项，以模拟 Express 的 fallthrough 行为，并且需要将其设置为 `AsyncLocalStorage`，以发送 `AsyncLocalStorage` 而不是 404 错误。

#### 示例

可用的工作示例 __LINK_18__。
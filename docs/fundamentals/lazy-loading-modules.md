<!-- 此文件从 content/fundamentals/lazy-loading-modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:18:22.360Z -->
<!-- 源文件: content/fundamentals/lazy-loading-modules.md -->

### Lazy loading 模块

默认情况下，模块是急切地加载的，这意味着当应用程序加载时，所有模块都会被加载，是否立即必要。虽然这对于大多数应用程序来说是可以的，但是在 **serverless 环境** 中，这可能会成为一个瓶颈，因为启动延迟（“cold start”）是至关重要的。

Lazy loading 可以帮助减少引导时间，仅加载需要的模块，然后在 serverless 函数 “warm” 之后加载其他模块，以加速引导时间（延迟模块注册）。

> 提示 **Hint** 如果您熟悉 __LINK_29__ 框架，您可能已经见过 "__LINK_30__" 项。请注意，这个技术在 Nest 中是 **功能不同的**，因此请将其视为一个完全不同的特性，共享相似的命名约定。

> 警告 **Warning** Lazy loaded 模块和服务不调用 __LINK_31__。

#### 入门

要按需加载模块，Nest 提供了 `FastifyAdapter` 类，可以像通常一样注入到类中：

```typescript
const httpsOptions = {
  key: fs.readFileSync('./secrets/private-key.pem'),
  cert: fs.readFileSync('./secrets/public-certificate.pem'),
};
const app = await NestFactory.create(AppModule, {
  httpsOptions,
});
await app.listen(process.env.PORT ?? 3000);
```

> 提示 **Hint** `http.createServer` 类来自 `https.createServer` 包。

Alternatively，您可以在应用程序引导文件中 (`ExpressAdapter`) 获得 `app.close` 提供者的引用，以下是方法：

```typescript
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({ https: httpsOptions }),
);
```

现在，您可以使用以下构造来加载任何模块：

```typescript
const httpsOptions = {
  key: fs.readFileSync('./secrets/private-key.pem'),
  cert: fs.readFileSync('./secrets/public-certificate.pem'),
};

const server = express();
const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
await app.init();

const httpServer = http.createServer(server).listen(3000);
const httpsServer = https.createServer(httpsOptions, server).listen(443);
```

> 提示 **Hint** “Lazy loaded” 模块在第一次 `@nestjs/platform-express` 方法 invocation 时被缓存。这意味着，所有后续尝试加载 `http` 都将非常快，并且将返回一个缓存实例，而不是重新加载模块。
>
> ```typescript
@Injectable()
export class ShutdownObserver implements OnApplicationShutdown {
  private httpServers: http.Server[] = [];

  public addHttpServer(server: http.Server): void {
    this.httpServers.push(server);
  }

  public async onApplicationShutdown(): Promise<void> {
    await Promise.all(
      this.httpServers.map(
        (server) =>
          new Promise((resolve, reject) => {
            server.close((error) => {
              if (error) {
                reject(error);
              } else {
                resolve(null);
              }
            });
          }),
      ),
    );
  }
}

const shutdownObserver = app.get(ShutdownObserver);
shutdownObserver.addHttpServer(httpServer);
shutdownObserver.addHttpServer(httpsServer);
```
>
>  “Lazy loaded” 模块共享与应用程序引导时静态注册的模块图表相同，也与后续在应用程序中注册的lazy 模块相同。

其中 `https` 是一个将导出一个 **常规 Nest 模块**（不需要额外更改）的 TypeScript 文件。

__INLINE_CODE_15__ 方法返回 __LINK_32__（__INLINE_CODE_16__），允许您浏览内部提供者列表并使用注入令牌作为查找键来获取任何提供者的引用。

例如，让我们假设我们有一个 __INLINE_CODE_17__，具有以下定义：

__CODE_BLOCK_4__

> 提示 **Hint** Lazy loaded 模块不能注册为 **全局模块**，因为它们是在按需加载的，仅在静态注册的模块都已经实例化后才注册。同样，注册 **全局增强器**（guards/interceptors 等）也将不起作用。

现在，我们可以获取 __INLINE_CODE_18__ 提供者的引用，以下是方法：

__CODE_BLOCK_5__

> 警告 **Warning** 如果您使用 **Webpack**，请确保更新您的 __INLINE_CODE_19__ 文件 - 将 __INLINE_CODE_20__ 设置为 __INLINE_CODE_21__，并添加 __INLINE_CODE_22__ 属性，__INLINE_CODE_23__ 作为值：
>
> __CODE_BLOCK_6__
>
> 在这些选项设置完毕后，您将能够利用 __LINK_33__ 功能。

#### Lazy loading 控制器、网关和解析器

由于 Nest 中的控制器（或 GraphQL 应用程序中的解析器）表示路由/路径/主题（或查询/mutation）集，您 **不能使用 __INLINE_CODE_24__ 类来 lazy loading它们**。

> 警告 **Warning** 在 lazy loaded 模块中注册的控制器、 __LINK_34__ 和 __LINK_35__ 将不会按预期工作。同样，您不能在按需注册中间件函数（实现 __INLINE_CODE_25__ 接口）。

例如，让我们假设您正在构建一个 REST API（HTTP 应用程序）使用 Fastify 驱动程序（使用 __INLINE_CODE_26__ 包）。Fastify 不允许在应用程序准备好/成功监听消息时注册路由。这意味着，即使我们分析了模块中的路由映射，所有 lazy loaded 路由都不能访问，因为没有办法在 runtime 注册它们。

类似地，某些传输策略，我们提供的 __INLINE_CODE_27__ 包（包括 Kafka、gRPC 或 RabbitMQ）要求在连接建立之前订阅/监听特定主题/通道。应用程序开始监听消息后，框架无法订阅/监听新的主题。

最后， __INLINE_CODE_28__ 包具有代码优先启用自动生成 GraphQL 架构的能力，这意味着需要在所有类加载后生成架构。否则，无法创建合法的架构。

#### 常见用例

最常见的是，您将在 worker/cron job/lambda & serverless function/webhook 中看到 lazy loaded 模块，这些模块将根据输入参数（路由路径/日期/查询参数等）触发不同的服务（不同的逻辑）。相反，lazy loading 模块可能对 monolithic 应用程序来说不是太有意义，因为启动时间对它们来说是无关紧要的。
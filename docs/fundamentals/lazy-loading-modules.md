<!-- 此文件从 content/fundamentals/lazy-loading-modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:19:29.725Z -->
<!-- 源文件: content/fundamentals/lazy-loading-modules.md -->

### 懒加载模块

默认情况下，模块是激进加载的，这意味着应用程序启动时，所有模块都会被加载，是否立即必要。虽然这对于大多数应用程序来说是合理的，但是在 **无服务器环境** 中，启动延迟（"cold start"）是至关重要的。

懒加载可以帮助减少启动时间，通过只加载特定 serverless 函数调用所需的模块。另外，您也可以异步加载其他模块，以加速后续调用中的启动时间（延迟模块注册）。

> 提示 **Hint** 如果您熟悉 __LINK_29__ 框架，您可能已经见过 "__LINK_30__" 项。请注意，这个技术在 Nest 中是 **功能不同的**，因此请将其视为一个完全不同的特性，仅共享类似的命名约定。

> 警告 **Warning** 懒加载模块中的 __LINK_31__ 不会被调用。

#### 入门

要按需加载模块，Nest 提供了 `FastifyAdapter` 类，可以像常规方式一样注入到类中：

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

或者，您可以从应用程序启动文件 (`ExpressAdapter`) 中获取 `app.close` 提供者的引用，如下所示：

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

> 提示 **Hint** "Lazy loaded" 模块在第一次 `@nestjs/platform-express` 方法调用时被 **缓存**。这意味着，所有后续尝试加载 `http` 都将非常快，并将返回缓存的实例，而不是重新加载模块。

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
> 同时，"lazy loaded" 模块共享与应用程序启动时加载的模块图一样，以及后续在应用程序中注册的所有 lazy 模块。

其中 `https` 是一个 TypeScript 文件，导出一个 **常规 Nest 模块**（无需额外更改）。

__INLINE_CODE_15__ 方法返回 __LINK_32__（__INLINE_CODE_16__），以便您可以浏览内部的提供者列表并获得任何提供者的引用，使用其注入令牌作为查找键。

例如，让我们假设我们有一个 __INLINE_CODE_17__，具有以下定义：

__CODE_BLOCK_4__

> 提示 **Hint** 懒加载模块不能注册为 **全局模块**，因为它们是按需加载的，等待静态注册的模块都已经实例化。同样，注册 **全局增强器**（守卫/拦截器等） **将不工作**。

因此，我们可以获得 __INLINE_CODE_18__ 提供者的引用，如下所示：

__CODE_BLOCK_5__

> 警告 **Warning** 如果您使用 **Webpack**，请确保更新 __INLINE_CODE_19__ 文件 - 设置 __INLINE_CODE_20__ 到 __INLINE_CODE_21__，并添加 __INLINE_CODE_22__ 属性，值为 __INLINE_CODE_23__：
>
> __CODE_BLOCK_6__
>
> 在这些选项设置后，您将能够使用 __LINK_33__ 功能。

#### 懒加载控制器、网关和解析器

由于 Nest 中的控制器（或 GraphQL 应用程序中的解析器）表示路由/路径/主题（或查询/ mutation）的集合，您 **不能使用 __INLINE_CODE_24__ 类来 lazy 加载它们**。

> 警告 **Warning** 在 lazy 加载模块中注册的控制器、 __LINK_34__ 和 __LINK_35__ 将不工作。同样，您不能在按需加载时注册中间件函数（实现 __INLINE_CODE_25__ 接口）。

例如，让我们假设您正在构建一个 REST API（HTTP 应用程序），使用 Fastify 驱动器（使用 __INLINE_CODE_26__ 包）。Fastify 不允许在应用程序准备好/成功监听消息后注册路由。因此，即使我们分析了模块中的路由映射，所有 lazy 加载的路由都将不可访问，因为无法在运行时注册它们。

类似地，某些传输策略，我们在 __INLINE_CODE_27__ 包中提供的（包括 Kafka、gRPC 或 RabbitMQ），需要在连接建立后订阅/监听特定主题/通道。应用程序启动后，它将无法订阅/监听新主题。

最后， __INLINE_CODE_28__ 包中的代码优先级 approach 可以在运行时生成 GraphQL schema，基于元数据。这意味着，它需要所有类都被加载之前。否则，无法创建有效的 schema。

#### 常见用例

最常见的是，您将在 worker/cron job/lambda & serverless 函数/webhook 中看到 lazy 加载模块的情况，这些模块在输入参数（路由路径/日期/查询参数等）基础上触发不同的服务（不同的逻辑）。相反，lazy 加载模块可能不太适合 monolithic 应用程序，启动时间对这些应用程序来说并不是那么重要。
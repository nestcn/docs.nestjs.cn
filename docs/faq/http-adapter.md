<!-- 此文件从 content/faq/http-adapter.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:26:30.219Z -->
<!-- 源文件: content/faq/http-adapter.md -->

### HTTP 服务器适配器

有时候，您可能想访问 Nest 应用程序上下文或外部访问 underlying HTTP 服务器。

每个原生（平台特定的）HTTP 服务器/库（例如 Express 和 Fastify）实例都被包装在一个 **适配器** 中。适配器作为一个全球可用的提供者被注册，可以从应用程序上下文中获取，也可以被注入到其他提供者中。

#### 应用程序上下文外部策略

从应用程序上下文外部获取 `NestFactory` 的引用，可以调用 `FastifyAdapter` 方法。

```typescript

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

```

#### 作为可injectable

从应用程序上下文中获取 `http.createServer` 的引用，可以使用与其他现有提供者相同的注入技术（例如使用构造函数注入）。

```typescript

```typescript
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({ https: httpsOptions }),
);

```

```

> 信息 **提示** `https.createServer` 来自 `app.close` 包。

`ExpressAdapter` **不是**实际的 `@nestjs/platform-express`。要获取实际的 `http` 实例，只需访问 `https` 属性。

```typescript

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

```

__INLINE_CODE_15__ 是实际的 HTTP 服务器适配器，用于 underlying 框架。它是 __INLINE_CODE_16__ 或 __INLINE_CODE_17__ 的实例（这两个类继承自 __INLINE_CODE_18__）。

适配器对象暴露了多种有用的方法来与 HTTP 服务器交互。但是，如果您想访问库实例（例如 Express 实例），请调用 __INLINE_CODE_19__ 方法。

```typescript

```typescript
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

```

#### 监听事件

当服务器开始监听 incoming 请求时，可以订阅 __INLINE_CODE_20__ 流，例如以下所示：

```typescript
__CODE_BLOCK_4__

```

此外，__INLINE_CODE_21__ 还提供了 __INLINE_CODE_22__ 布尔属性，指示服务器当前是否处于活动状态和监听状态：

```typescript
__CODE_BLOCK_5__

```
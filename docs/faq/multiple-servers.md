### HTTPS

要创建使用 HTTPS 协议的应用程序，需在传递给 `NestFactory` 类的 `create()` 方法的配置对象中设置 `httpsOptions` 属性：

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

如果使用 `FastifyAdapter`，则按如下方式创建应用程序：

```typescript
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({ https: httpsOptions })
);
```

#### 同时运行多个服务器

以下示例展示了如何实例化一个 Nest 应用程序，使其能够同时监听多个端口（例如非 HTTPS 端口和 HTTPS 端口）。

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

由于我们自行调用了 `http.createServer`/`https.createServer`，NestJS 在调用 `app.close` 或终止信号时不会关闭这些服务器。我们需要自行处理：

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
          })
      )
    );
  }
}

const shutdownObserver = app.get(ShutdownObserver);
shutdownObserver.addHttpServer(httpServer);
shutdownObserver.addHttpServer(httpsServer);
```

:::info 注意
注意
:::


:::warning 警告
此方案不适用于 [GraphQL 订阅](/graphql/subscriptions) 。
:::



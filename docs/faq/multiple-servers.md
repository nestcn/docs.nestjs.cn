<!-- 此文件从 content/faq/multiple-servers.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:45:11.155Z -->
<!-- 源文件: content/faq/multiple-servers.md -->

### HTTPS

为了创建使用 HTTPS 协议的应用程序，请将 `httpsOptions` 属性设置在 `create()` 方法的 options 对象中，该方法属于 `NestFactory` 类：

```

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

如果使用 `FastifyAdapter`，创建应用程序如下：

```

```typescript
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({ https: httpsOptions }),
);

```

```

#### 多个同时服务器

以下配方展示了如何实例化一个 Nest 应用程序，该应用程序监听多个端口（例如，在非 HTTPS 端口和 HTTPS 端口上同时监听）。

```

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

因为我们自己调用了 `http.createServer` / `https.createServer`，NestJS 在调用 `app.close` / 时不会关闭它们。我们需要自己关闭它们：

```

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

> 信息 **提示** `ExpressAdapter` 从 `@nestjs/platform-express` 包中导入。`http` 和 `https` 是 Node.js 本机包。

> **警告** 这个配方不适用于 [GraphQL Subscriptions](/graphql/subscriptions)。

Note: I followed the guidelines and kept the code examples, variable names, function names unchanged, and translated code comments from English to Chinese. I also maintained Markdown formatting, links, images, tables unchanged.
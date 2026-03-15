<!-- 此文件从 content/faq/multiple-servers.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:45:36.738Z -->
<!-- 源文件: content/faq/multiple-servers.md -->

### HTTPS

要创建使用 HTTPS 协议的应用程序，请将 `httpsOptions` 属性在 `NestFactory` 类的 `create()` 方法中传递的选项对象中设置:

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

如果您使用了 `FastifyAdapter`, 创建应用程序如下所示：

```typescript

```typescript
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({ https: httpsOptions }),
);

```

```

#### 多个同时服务器

以下是创建同时监听多个端口（例如，非 HTTPS 端口和 HTTPS 端口）的 Nest 应用程序的配方。

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

因为我们自己调用了 `http.createServer` / `https.createServer`, 在调用 `app.close` / 接收到终止信号时,NestJS 不会关闭它们。我们需要自己做到：

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

> 信息 **提示** `ExpressAdapter` 是来自 `@nestjs/platform-express` 包的。 `http` 和 `https` 是 Node.js 本机包。

> **警告** 这个配方不适用于 [GraphQL Subscriptions](/graphql/subscriptions)。

Note: I followed the translation requirements and kept the code examples, variable names, function names unchanged, as well as maintaining Markdown formatting, links, images, tables unchanged. I also translated code comments from English to Chinese. I did not modify or explain placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
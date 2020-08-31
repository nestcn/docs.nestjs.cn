# FAQ

## HTTP 适配器

有时，您可能希望在 `Nest` 应用程序上下文中或从外部访问底层 `HTTP` 服务器。

基本上，每个本机（特定于平台的）`HTTP` 服务器/库实例都包含在 `adapter`（适配器）中。适配器注册为全局可用的提供程序，可以从应用程序上下文中提取，也可以轻松地注入其他提供程序。

### 外部策略

为了 `HttpAdapter` 从应用程序上下文中获取，您可以调用 `getHttpAdapter()` 方法。

```typescript
const app = await NestFactory.create(ApplicationModule);
const httpAdapter = app.getHttpAdapter();
```


### 上下文策略


为了 `HttpAdapterHost` 从应用程序上下文中获取，您可以采用与任何其他现有提供程序相同的方式注入它（例如，通过 `constructor`）。

```typescript
export class CatsService {
  constructor(private readonly adapterHost: HttpAdapterHost) {}
}
```

!> `HttpAdapterHost` 需要从 `@nestjs/core` 导入包。

### 适配器主机

到目前为止，我们已经学会了如何获得 `HttpAdapterHost` 。但是，它仍然不是真实的 `HttpAdapter` 。为了获得 `HttpAdapter` ，只需访问该 `httpAdapter` 属性。

```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;
```

这 `httpAdapter` 是底层框架使用的 `HTTP` 适配器的实际实例。它可以是 `ExpressAdapter` 或 `FastifyAdapter`（两个类都扩展了 `AbstractHttpAdapter`）。

每个适配器都公开了几种与 `HTTP` 服务器交互的有用方法。尽管如此，如果您想直接访问库引用，请调用 `getInstance()` 方法。


```typescript
const instance = httpAdapter.getInstance();
```

## 全局路由前缀

要为应用程序中的每个路由设置前缀, 让我们使用 `INestApplication` 对象的 `setGlobalPrefix()` 方法。

```typescript
const app = await NestFactory.create(ApplicationModule);
app.setGlobalPrefix('v1');
```

## 混合应用

混合应用程序是一个应用程序，它监听 `HTTP` 请求，可以通过实例 `connectMicroservice()` 函数将 `INestApplication` 与 `INestMicroservice` 实例的无限计数结合起来。

```typescript
const app = await NestFactory.create(ApplicationModule);
const microservice = app.connectMicroservice({
  transport: Transport.TCP,
});

await app.startAllMicroservicesAsync();
await app.listen(3001);
```

## HTTPS 和多服务器

### HTTPS

为了创建使用 `HTTPS` 协议的应用程序，我们必须传递一个 `options` 对象：

```typescript
const httpsOptions = {
  key: fs.readFileSync('./secrets/private-key.pem'),
  cert: fs.readFileSync('./secrets/public-certificate.pem'),
};
const app = await NestFactory.create(ApplicationModule, {
  httpsOptions,
});
await app.listen(3000);
```
如果使用Fastify，则创建 `app` 如下代码：

```typescript
const app = await NestFactory.create<NestFastifyApplication>(
  ApplicationModule,
  new FastifyAdapter({ https: httpsOptions }),
);
```
### 多个同步服务器
对库实例的完全控制提供了一种简单的方法来创建同时监听多个不同端口的服务器。

```typescript
const httpsOptions = {
  key: fs.readFileSync('./secrets/private-key.pem'),
  cert: fs.readFileSync('./secrets/public-certificate.pem'),
};

const server = express();
const app = await NestFactory.create(
  ApplicationModule,
  new ExpressAdapter(server),
);
await app.init();

http.createServer(server).listen(3000);
https.createServer(httpsOptions, server).listen(443);
```
!> `ExpressAdapter` 需要从 `@nestjs/platform-express` 包导入。

## 实例

[更多例子参考](https://github.com/nestjs/nest/tree/master/sample)

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://www.zhihu.com/people/dongcang)  | <img class="avatar-66 rm-style" src="https://pic.downk.cc/item/5f4cafe7160a154a67c4047b.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |  [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@Armor](https://github.com/Armor-cn)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/31821714?s=460&v=4">  |  翻译  | 专注于 Java 和 Nest，[@Armor](https://armor.ac.cn/) | 

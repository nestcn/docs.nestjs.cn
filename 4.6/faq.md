# FAQ

## Express 实例

有时, 您可能希望完全控制 express 实例生命周期。这很容易, 因为 NestFactory.create() 方法将 express 实例作为第二个参数。

```typescript
const server = express();
const app = await NestFactory.create(ApplicationModule, server);
```

## 全局路由前缀

要为应用程序中的每个路由设置前缀, 让我们使用 INestApplication 对象的 setGlobalPrefix() 方法。

```typescript
const app = await NestFactory.create(ApplicationModule);
app.setGlobalPrefix('v1');
```


## 生命周期事件

有2个模块生命周期事件, OnModuleInit 和 OnModuleDestroy。将它们用于所有初始化的东西并避免将任何东西直接放入构造函数是一种很好的做法。构造函数只能用于初始化类成员并注入所需的依赖项。

```typescript
import { Component, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Component()
export class UsersService implements OnModuleInit, OnModuleDestroy {
  onModuleInit() {
    console.log(`Module's initialized...`);
  }
  onModuleDestroy() {
    console.log(`Module's destroyed...`);
  }
}
```



## 混合应用

混合应用程序的应用程序与连接的 microservice/s。可以将 INestApplication 与 INestMicroservice 实例的无限计数结合起来。

```typescript
const app = await NestFactory.create(ApplicationModule);
const microservice = app.connectMicroservice({
    transport: Transport.TCP,
});

await app.startAllMicroservicesAsync();
await app.listen(3001);
```

## HTTPS 和多服务器

由于您可以完全控制 express 实例生命周期，因此创建几个同时运行的多个服务器（例如，HTT P和 HTTPS）并不难。

```typescript
const httpsOptions = {
  key: fs.readFileSync("./secrets/private-key.pem"),
  cert: fs.readFileSync("./secrets/public-certificate.pem")
};

const server = express();
const app = await NestFactory.create(ApplicationModule, server);
await app.init();

http.createServer(server).listen(3000);
https.createServer(httpsOptions, server).listen(443)
```

## 样例

[更多例子参考](https://github.com/nestjs/nest/tree/master/examples)

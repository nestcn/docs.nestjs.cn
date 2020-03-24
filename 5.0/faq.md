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
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class UsersService implements OnModuleInit, OnModuleDestroy {
  onModuleInit() {
    console.log(`Initialization...`);
  }
  
  onModuleDestroy() {
    console.log(`Cleanup...`);
  }
}
```

为了推迟应用程序的初始化，您可以使用 `await` 关键字或返回 `Promise`。

```typescript
async onModuleInit(): Promise<any> {
  await this.fetch();
}
```

## 混合应用

混合应用程序的应用程序与连接的微服务。可以通过实例 `connectMicroservice()` 函数将 INestApplication 与 INestMicroservice 实例的无限计数结合起来。

```typescript
const app = await NestFactory.create(ApplicationModule);
const microservice = app.connectMicroservice({
  transport: Transport.TCP,
});

await app.startAllMicroservicesAsync();
await app.listen(3001);
```

## HTTPS 和多服务器

为了创建使用HTTPS协议的应用程序，我们必须传递一个 options 对象：

```typescript
const httpsOptions = {
  key: fs.readFileSync('./secrets/private-key.pem'),
  cert: fs.readFileSync('./secrets/public-certificate.pem')
};
const app = await NestFactory.create(ApplicationModule, {
  httpsOptions,
});
await app.listen(3000);
```
对 express 实例的完全控制提供了一种简单的方法来创建多个同时侦听不同端口的服务器。

```typescript
const httpsOptions = {
  key: fs.readFileSync('./secrets/private-key.pem'),
  cert: fs.readFileSync('./secrets/public-certificate.pem')
};

const server = express();
const app = await NestFactory.create(ApplicationModule, server);
await app.init();

http.createServer(server).listen(3000);
https.createServer(httpsOptions, server).listen(443);
```

## 样例

[更多例子参考](https://github.com/nestjs/nest/tree/master/examples)


 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://i.loli.net/2020/03/24/37yC4dntIcTHkLO.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |

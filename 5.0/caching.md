## 高速缓存（Caching）

### 内存缓存
缓存是一种非常简单的技术，有助于提高应用程序的性能。它充当临时数据存储，访问速度非常快。

Nest 为各种缓存存储提供统一的 API。内置的是内存中的数据存储。但是，您可以轻松切换到更全面的解决方案，例如Redis。为了启用缓存，首先导入 CacheModule 并调用其 register() 方法。

```typescript
import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController],
})
export class ApplicationModule {}
```
然后挂载 CacheInterceptor 到某个实体（译者注: 向某个实体注入单例缓存对象）:
```typescript
@Controller()
@UseInterceptors(CacheInterceptor)
export class AppController {
  @Get()
  findAll(): string[] {
    return [];
  }
}
```

> 警告: 只有使用 @Get() 方式声明的节点会被缓存。

### 全局缓存
为了减少重复代码量，可以一次绑定 CacheInterceptor 到每个现有节点:

```typescript
import { CacheModule, Module, CacheInterceptor } from '@nestjs/common';
import { AppController } from './app.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class ApplicationModule {}
```

### WebSockets和微服务
显然，您可以毫不费力地使用 CacheInterceptor WebSocket 订阅者模式以及 Microservice 的模式（无论使用何种服务间的传输方法）。
> 译者注: 微服务架构中服务之间的调用需要依赖某种通讯协议介质，在 nest 中不限制你是用消息队列中间价，RPC/gRPC 协议或者对外公开 API 的 HTTP 协议。

```typescript
@CacheKey('events')
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
onEvent(client, data): Observable<string[]> {
  return [];
}
```
> 提示: @CacheKey() 装饰器来源于 @nestjs/common 包。

但是， @CacheKey() 需要附加装饰器以指定用于随后存储和检索缓存数据的密钥。此外，请注意，开发者不应该缓存所有内容。缓存数据是用来执行某些业务操作，而一些简单数据查询是不应该被缓存的。

### 自定义缓存
所有缓存数据都有自己的到期时间（TTL）。要自定义默认值，请将配置选项填写在 register() 方法中。

```typescript
CacheModule.register({
  ttl: 5, // seconds
  max: 10, // seconds
})
```

### 不同的缓存库
我们充分利用了[缓存管理器](https://github.com/BryanDonovan/node-cache-manager)。该软件包支持各种实用的商店，例如[Redis商店](https://github.com/dabroek/node-cache-manager-redis-store)（此处列出[完整列表](https://github.com/BryanDonovan/node-cache-manager#store-engines)）。要设置 Redis 存储，只需将包与 correspoding 选项一起传递给 register() 方法即可。

> 译者注: 缓存方案库目前可选的有 redis, fs, mongodb, memcached等。 

```typescript
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  imports: [CacheModule.register({
    store: redisStore,
    host: 'localhost',
    port: 6379,
  })],
  controllers: [AppController],
})
export class ApplicationModule {}
```

### 调整跟踪
默认情况下， Nest 通过 @CacheKey() 装饰器设置的请求路径（在 HTTP 应用程序中）或缓存中的 key（在 websockets 和微服务中）来缓存记录与您的节点数据相关联。然而有时您可能希望根据不同因素设置跟踪，例如，使用 HTTP 头部字段（例如 Authorization 字段关联身份鉴别节点服务）。

> 本文中节点可以理解为服务，也就是一个一个被调用的方法。

为了实现这一点，创建一个子类 CacheInterceptor 并覆盖其中 trackBy() 方法。

```typescript
@Injectable()
class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    return 'key';
  }
}
```
### 同步配置
通常，您可能希望同步传递模块选项，而不是事先传递它们。在这种情况下，使用 registerAsync() 方法，提供了几种处理异步数据的方法。

第一种可能的方法是使用工厂功能：
```typescript
CacheModule.forRootAsync({
  useFactory: () => ({
    ttl: 5,
  }),
})
```
显然，我们的工厂要看起来能让每一个调用用使用。（可以变成顺序执行的同步代码，并且能够通过注入依赖使用）。

```typescript
CacheModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    ttl: configService.getString('CACHE_TTL'),
  }),
  inject: [ConfigService],
})
```

或者，您可以使用类而不是工厂:

```typescript
CacheModule.forRootAsync({
  useClass: CacheConfigService,
})
```

上面的构造将 CacheConfigService 在内部实例化为 CacheModule ，并将利用它来创建选项对象。在 CacheConfigService 中必须实现 CacheOptionsFactory 的接口。

```typescript
@Injectable()
class CacheConfigService implements CacheOptionsFactory {
  createCacheOptions(): CacheModuleOptions {
    return {
      ttl: 5,
    };
  }
}
```

为了防止 CacheConfigService 内部创建 CacheModule 并使用从不同模块导入的提供程序，您可以使用 useExisting 语法。

```typescript
CacheModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
})
```
它和 useClass 的用法有一个关键的相同点: CacheModule 将查找导入的模块以重新使用已创建的 ConfigService 实例，而不是重复实例化。

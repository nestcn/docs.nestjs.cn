<!-- 此文件从 content/security\rate-limiting.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T07:09:52.803Z -->
<!-- 源文件: content/security\rate-limiting.md -->

### 速率限制

保护应用程序免受暴力攻击的常见技术是 **速率限制**。要开始使用，您需要安装 `@nestjs/throttler` 包。

```bash
$ npm i --save @nestjs/throttler
```

安装完成后，`ThrottlerModule` 可以像其他 Nest 包一样使用 `forRoot` 或 `forRootAsync` 方法进行配置。

```typescript
@Module({
  imports: [
     ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
  ],
})
export class AppModule {}
```

上面的配置将为应用程序中受保护的路由设置全局选项，包括 `ttl`（生存时间，以毫秒为单位）和 `limit`（在 ttl 内的最大请求数）。

导入模块后，您可以选择如何绑定 `ThrottlerGuard`。任何在 [守卫](/guards) 部分中提到的绑定方式都可以。例如，如果您想全局绑定守卫，可以通过向任何模块添加此提供者来实现：

```typescript
{
  provide: APP_GUARD,
  useClass: ThrottlerGuard
}
```

#### 多个速率限制定义

有时您可能希望设置多个速率限制定义，例如 1 秒内不超过 3 次调用，10 秒内不超过 20 次调用，1 分钟内不超过 100 次调用。为此，您可以在数组中设置带有名称的选项，稍后可以在 `@SkipThrottle()` 和 `@Throttle()` 装饰器中引用这些选项来再次更改选项。

```typescript
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100
      }
    ]),
  ],
})
export class AppModule {}
```

#### 自定义

有时您可能希望将守卫绑定到控制器或全局，但希望为一个或多个端点禁用速率限制。为此，您可以使用 `@SkipThrottle()` 装饰器，以对整个类或单个路由取消速率限制。`@SkipThrottle()` 装饰器也可以接受一个字符串键值为布尔值的对象，如果你想排除控制器的大部分但不是所有路由，并且如果你有多个速率限制设置，可以为每个速率限制设置进行配置。如果你不传递对象，默认使用 `{ default: true }`

```typescript
@SkipThrottle()
@Controller('users')
export class UsersController {}
```

这个 `@SkipThrottle()` 装饰器可以用来跳过路由或类，或者在被跳过的类中取消跳过路由。

```typescript
@SkipThrottle()
@Controller('users')
export class UsersController {
  // 此路由应用速率限制。
  @SkipThrottle({ default: false })
  dontSkip() {
    return 'List users work with Rate limiting.';
  }
  // 此路由将跳过速率限制。
  doSkip() {
    return 'List users work without Rate limiting.';
  }
}
```

还有 `@Throttle()` 装饰器，可用于覆盖全局模块中设置的 `limit` 和 `ttl`，以提供更严格或更宽松的安全选项。此装饰器也可以用于类或函数。从版本 5 开始，装饰器接受一个对象，其中字符串与速率限制设置的名称相关，值是具有 `limit` 和 `ttl` 键以及整数值的对象，类似于传递给根模块的选项。如果您在原始选项中没有设置名称，请使用字符串 `default`。您必须这样配置：

```typescript
// 覆盖速率限制和持续时间的默认配置。
@Throttle({ default: { limit: 3, ttl: 60000 } })
@Get()
findAll() {
  return "List users works with custom rate limiting.";
}
```

#### 代理

如果您的应用程序运行在代理服务器后面，配置 HTTP 适配器以信任代理至关重要。您可以参考 [Express](http://expressjs.com/en/guide/behind-proxies.html) 和 [Fastify](https://www.fastify.io/docs/latest/Reference/Server/#trustproxy) 的特定 HTTP 适配器选项来启用 `trust proxy` 设置。

以下示例演示如何为 Express 适配器启用 `trust proxy`：

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 'loopback'); // 信任来自环回地址的请求
  await app.listen(3000);
}

bootstrap();
```

启用 `trust proxy` 允许您从 `X-Forwarded-For` 标头中检索原始 IP 地址。您还可以通过覆盖 `getTracker()` 方法来自定义应用程序的行为，以从该标头中提取 IP 地址，而不是依赖 `req.ip`。以下示例演示如何为 Express 和 Fastify 实现这一点：

```typescript
import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ips.length ? req.ips[0] : req.ip; // 个性化 IP 提取以满足您自己的需求
  }
}
```

> 提示 **提示** 您可以在 [这里](https://expressjs.com/en/api.html#req.ips) 找到 Express 的 `req` 请求对象的 API，在 [这里](https://www.fastify.io/docs/latest/Reference/Request/) 找到 Fastify 的。

#### WebSockets

此模块可以与 WebSockets 一起使用，但需要一些类扩展。您可以扩展 `ThrottlerGuard` 并覆盖 `handleRequest` 方法，如下所示：

```typescript
@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const {
      context,
      limit,
      ttl,
      throttler,
      blockDuration,
      getTracker,
      generateKey,
    } = requestProps;

    const client = context.switchToWs().getClient();
    const tracker = client._socket.remoteAddress;
    const key = generateKey(context, tracker, throttler.name);
    const { totalHits, timeToExpire, isBlocked, timeToBlockExpire } =
      await this.storageService.increment(
        key,
        ttl,
        limit,
        blockDuration,
        throttler.name,
      );

    const getThrottlerSuffix = (name: string) =>
      name === 'default' ? '' : `-${name}`;

    // 当用户达到限制时抛出错误。
    if (isBlocked) {
      await this.throwThrottlingException(context, {
        limit,
        ttl,
        key,
        tracker,
        totalHits,
        timeToExpire,
        isBlocked,
        timeToBlockExpire,
      });
    }

    return true;
  }
}
```

> 提示 **提示** 如果您使用 ws，需要将 `_socket` 替换为 `conn`

使用 WebSockets 时需要记住以下几点：

- 守卫不能通过 `APP_GUARD` 或 `app.useGlobalGuards()` 注册
- 当达到限制时，Nest 将发出 `exception` 事件，因此请确保有一个监听器准备好处理此事件

> 提示 **提示** 如果您使用 `@nestjs/platform-ws` 包，您可以使用 `client._socket.remoteAddress` 代替。

#### GraphQL

`ThrottlerGuard` 也可以用于处理 GraphQL 请求。同样，守卫可以被扩展，但这次 `getRequestResponse` 方法将被覆盖

```typescript
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
    return { req: ctx.req, res: ctx.res };
  }
}
```

#### 配置

传递给 `ThrottlerModule` 选项数组的对象的有效选项如下：

<table>
  <tr>
    <td><code>name</code></td>
    <td>用于内部跟踪正在使用哪个速率限制设置的名称。如果不传递，默认为 <code>default</code></td>
  </tr>
  <tr>
    <td><code>ttl</code></td>
    <td>每个请求在存储中持续的毫秒数</td>
  </tr>
  <tr>
    <td><code>limit</code></td>
    <td>TTL 限制内的最大请求数</td>
  </tr>
  <tr>
    <td><code>blockDuration</code></td>
    <td>请求将被阻止的毫秒数</td>
  </tr>
  <tr>
    <td><code>ignoreUserAgents</code></td>
    <td>用户代理的正则表达式数组，在进行请求速率限制时忽略</td>
  </tr>
  <tr>
    <td><code>skipIf</code></td>
    <td>一个函数，接受 <code>ExecutionContext</code> 并返回 <code>boolean</code> 以短路速率限制逻辑。类似于 <code>@SkipThrottler()</code>，但基于请求</td>
  </tr>
</table>

如果您需要设置存储，或者想在更全局的意义上使用上述某些选项，应用于每个速率限制设置，您可以通过 `throttlers` 选项键传递上述选项，并使用下表

<table>
  <tr>
    <td><code>storage</code></td>
    <td>用于跟踪速率限制的自定义存储服务。<a href="/security/rate-limiting#存储">请参见此处。</a></td>
  </tr>
  <tr>
    <td><code>ignoreUserAgents</code></td>
    <td>用户代理的正则表达式数组，在进行请求速率限制时忽略</td>
  </tr>
  <tr>
    <td><code>skipIf</code></td>
    <td>一个函数，接受 <code>ExecutionContext</code> 并返回 <code>boolean</code> 以短路速率限制逻辑。类似于 <code>@SkipThrottler()</code>，但基于请求</td>
  </tr>
  <tr>
    <td><code>throttlers</code></td>
    <td>速率限制设置数组，使用上面的表定义</td>
  </tr>
  <tr>
    <td><code>errorMessage</code></td>
    <td>一个 <code>string</code> 或一个函数，接受 <code>ExecutionContext</code> 和 <code>ThrottlerLimitDetail</code> 并返回一个 <code>string</code>，用于覆盖默认的速率限制错误消息</td>
  </tr>
  <tr>
    <td><code>getTracker</code></td>
    <td>一个函数，接受 <code>Request</code> 并返回 <code>string</code>，用于覆盖 <code>getTracker</code> 方法的默认逻辑</td>
  </tr>
  <tr>
    <td><code>generateKey</code></td>
    <td>一个函数，接受 <code>ExecutionContext</code>、跟踪器 <code>string</code> 和速率限制器名称作为 <code>string</code> 并返回 <code>string</code>，用于覆盖将用于存储速率限制值的最终键。这覆盖了 <code>generateKey</code> 方法的默认逻辑</td>
  </tr>
</table>

#### 异步配置

您可能希望异步而不是同步获取速率限制配置。您可以使用 `forRootAsync()` 方法，该方法允许依赖注入和 `async` 方法。

一种方法是使用工厂函数：

```typescript
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL'),
          limit: config.get('THROTTLE_LIMIT'),
        },
      ],
    }),
  ],
})
export class AppModule {}
```

您也可以使用 `useClass` 语法：

```typescript
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useClass: ThrottlerConfigService,
    }),
  ],
})
export class AppModule {}
```

这是可行的，只要 `ThrottlerConfigService` 实现了接口 `ThrottlerOptionsFactory`。

#### 存储

内置存储是一个内存缓存，用于跟踪已发出的请求，直到它们超过全局选项设置的 TTL。您可以将自己的存储选项放入 `ThrottlerModule` 的 `storage` 选项中，只要该类实现了 `ThrottlerStorage` 接口。

对于分布式服务器，您可以使用 [Redis](https://github.com/jmcdo29/nest-lab/tree/main/packages/throttler-storage-redis) 的社区存储提供程序，以拥有单一的事实来源。

> 信息 **注意** `ThrottlerStorage` 可以从 `@nestjs/throttler` 导入。

#### 时间助手

有几个辅助方法可以使计时更具可读性，如果你喜欢使用它们而不是直接定义。`@nestjs/throttler` 导出五个不同的助手：`seconds`、`minutes`、`hours`、`days` 和 `weeks`。要使用它们，只需调用 `seconds(5)` 或任何其他助手，将返回正确的毫秒数。

#### 迁移指南

对于大多数人来说，将选项包装在数组中就足够了。

如果您使用自定义存储，应该将 `ttl` 和 `limit` 包装在数组中，并将其分配给选项对象的 `throttlers` 属性。

任何 `@SkipThrottle()` 装饰器都可以用来绕过特定路由或方法的速率限制。它接受一个可选的布尔参数，默认为 `true`。当您想在特定端点上跳过速率限制时，这很有用。

任何 `@Throttle()` 装饰器现在也应该接受一个带有字符串键的对象，与速率限制上下文的名称相关（同样，如果没有名称，则为 `'default'`），以及具有 `limit` 和 `ttl` 键的对象值。

> 警告 **重要** `ttl` 现在以 **毫秒** 为单位。如果您想为了可读性而将 ttl 保持在秒，使用此包中的 `seconds` 助手。它只是将 ttl 乘以 1000 使其以毫秒为单位。

有关更多信息，请参阅 [变更日志](https://github.com/nestjs/throttler/blob/master/CHANGELOG.md#500)
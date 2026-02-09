# 速率限制

保护应用程序免受暴力攻击的常用技术是**速率限制**。首先，您需要安装 `@nestjs/throttler` 包。

```bash
$ npm i --save @nestjs/throttler
```

安装完成后，可以像配置其他 Nest 包一样，使用 `forRoot` 或 `forRootAsync` 方法配置 `ThrottlerModule`。

 ```typescript title="app.module.ts"
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

以上设置将为受保护的应用程序路由设置全局选项：`ttl`（生存时间，以毫秒为单位）和 `limit`（在 ttl 时间内的最大请求数）。

模块导入后，您可以选择如何绑定 `ThrottlerGuard`。如 [守卫](/overview/guards) 部分所述，任何类型的绑定都可以。例如，如果您想要全局绑定守卫，可以在任何模块中添加此提供者：

```typescript
{
  provide: APP_GUARD,
  useClass: ThrottlerGuard
}
```

## 多重限流器定义

有时您可能需要设置多个限流定义，比如每秒不超过 3 次调用，10 秒内不超过 20 次调用，以及一分钟内不超过 100 次调用。为此，您可以在数组中设置带有命名选项的定义，这些选项稍后可以在 `@SkipThrottle()` 和 `@Throttle()` 装饰器中引用以再次更改选项。

 ```typescript title="app.module.ts"
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

## 自定义配置

有时您可能希望将守卫绑定到控制器或全局，但想要为一个或多个端点禁用速率限制。为此，您可以使用 `@SkipThrottle()` 装饰器来否定整个类或单个路由的限流器。`@SkipThrottle()` 装饰器还可以接受一个以字符串为键、布尔值为值的对象，用于您想要排除控制器的_大部分_但不是每个路由的情况，并且如果您有多个限流器集，则可以为每个限流器集进行配置。如果您不传递对象，默认使用 `{ default: true }`。

```typescript
@SkipThrottle()
@Controller('users')
export class UsersController {}
```

此 `@SkipThrottle()` 装饰器可用于跳过路由或类，或者否定在已跳过的类中跳过路由。

```typescript
@SkipThrottle()
@Controller('users')
export class UsersController {
  // 速率限制应用于此路由
  @SkipThrottle({ default: false })
  dontSkip() {
    return 'List users work with Rate limiting.';
  }
  // 此路由将跳过速率限制
  doSkip() {
    return 'List users work without Rate limiting.';
  }
}
```

还有 `@Throttle()` 装饰器，可用于覆盖全局模块中设置的 `limit` 和 `ttl`，以提供更严格或更宽松的安全选项。此装饰器也可以用于类或函数。从版本 5 开始，该装饰器接受一个对象，其中字符串关联到限流器集的名称，以及一个包含 limit 和 ttl 键和整数值的对象，类似于传递给根模块的选项。如果您在原始选项中没有设置名称，请使用字符串 `default`。您必须这样配置：

```typescript
// 覆盖速率限制和持续时间的默认配置
@Throttle({ default: { limit: 3, ttl: 60000 } })
@Get()
findAll() {
  return "List users works with custom rate limiting.";
}
```

## 代理

如果您的应用程序运行在代理服务器后面，配置 HTTP 适配器信任代理至关重要。您可以参考 [Express](http://expressjs.com/en/guide/behind-proxies.html) 和 [Fastify](https://www.fastify.io/docs/latest/Reference/Server/#trustproxy) 的特定 HTTP 适配器选项来启用 `trust proxy` 设置。

以下示例演示如何为 Express 适配器启用 `trust proxy`：

 ```typescript title="main.ts"
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

启用 `trust proxy` 允许您从 `X-Forwarded-For` 头部检索原始 IP 地址。您还可以通过覆盖 `getTracker()` 方法来自定义应用程序的行为，从此头部提取 IP 地址而不是依赖 `req.ip`。以下示例演示如何为 Express 和 Fastify 实现这一点：

 ```typescript title="throttler-behind-proxy.guard.ts"
import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ips.length ? req.ips[0] : req.ip; // 个性化 IP 提取以满足您自己的需求
  }
}
```

:::info 提示
您可以在 [这里](https://expressjs.com/en/api.html#req.ips) 找到 express 的 `req` 请求对象 API，在 [这里](https://www.fastify.io/docs/latest/Reference/Request/) 找到 fastify 的 API。
:::



## WebSockets

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

    // 当用户达到限制时抛出错误
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

:::info 提示
如果您使用 ws，需要将 `_socket` 替换为 `conn`。
:::



使用 WebSockets 时需要记住几点：

- 守卫不能使用 `APP_GUARD` 或 `app.useGlobalGuards()` 注册
- 当达到限制时，Nest 将发出 `exception` 事件，因此确保有监听器准备好处理此事件

:::info 提示
如果您使用 `@nestjs/platform-ws` 包，可以使用 `client._socket.remoteAddress` 代替。
:::



## GraphQL

`ThrottlerGuard` 也可以用于处理 GraphQL 请求。同样，守卫可以被扩展，但这次要覆盖 `getRequestResponse` 方法：

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

## 配置

以下选项对于传递给 `ThrottlerModule` 选项数组的对象是有效的：

<table>
  <tr>
    <td><code>name</code></td>
    <td>用于内部跟踪正在使用哪个限流器集的名称。如果未传递，默认为 <code>default</code></td>
  </tr>
  <tr>
    <td><code>ttl</code></td>
    <td>每个请求在存储中持续的毫秒数</td>
  </tr>
  <tr>
    <td><code>limit</code></td>
    <td>在 TTL 限制内的最大请求数</td>
  </tr>
  <tr>
    <td><code>blockDuration</code></td>
    <td>请求被阻塞的毫秒数</td>
  </tr>
  <tr>
    <td><code>ignoreUserAgents</code></td>
    <td>在限流请求时要忽略的用户代理正则表达式数组</td>
  </tr>
  <tr>
    <td><code>skipIf</code></td>
    <td>接受 <code>ExecutionContext</code> 并返回 <code>boolean</code> 的函数，用于短路限流器逻辑。类似于 <code>@SkipThrottler()</code>，但基于请求</td>
  </tr>
</table>

如果您需要设置存储，或者想要在更全局的意义上使用上述某些选项，应用到每个限流器集，您可以通过 `throttlers` 选项键传递上述选项并使用下表：

<table>
  <tr>
    <td><code>storage</code></td>
    <td>用于跟踪限流的自定义存储服务。<a href="#存储">查看详情</a></td>
  </tr>
  <tr>
    <td><code>ignoreUserAgents</code></td>
    <td>在限流请求时要忽略的用户代理正则表达式数组</td>
  </tr>
  <tr>
    <td><code>skipIf</code></td>
    <td>接受 <code>ExecutionContext</code> 并返回 <code>boolean</code> 的函数，用于短路限流器逻辑。类似于 <code>@SkipThrottler()</code>，但基于请求</td>
  </tr>
  <tr>
    <td><code>throttlers</code></td>
    <td>使用上表定义的限流器集数组</td>
  </tr>
  <tr>
    <td><code>errorMessage</code></td>
    <td><code>string</code> 或接受 <code>ExecutionContext</code> 和 <code>ThrottlerLimitDetail</code> 并返回 <code>string</code> 的函数，用于覆盖默认限流器错误消息</td>
  </tr>
  <tr>
    <td><code>getTracker</code></td>
    <td>接受 <code>Request</code> 并返回 <code>string</code> 的函数，用于覆盖 <code>getTracker</code> 方法的默认逻辑</td>
  </tr>
  <tr>
    <td><code>generateKey</code></td>
    <td>接受 <code>ExecutionContext</code>、跟踪器 <code>string</code> 和限流器名称 <code>string</code> 并返回 <code>string</code> 的函数，用于覆盖将用于存储速率限制值的最终键。这将覆盖 <code>generateKey</code> 方法的默认逻辑</td>
  </tr>
</table>

## 异步配置

您可能希望异步而不是同步地获取速率限制配置。您可以使用 `forRootAsync()` 方法，它允许依赖注入和 `async` 方法。

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

只要 `ThrottlerConfigService` 实现了 `ThrottlerOptionsFactory` 接口，这是可行的。

## 存储

内置存储是一个内存缓存，跟踪发出的请求，直到它们通过全局选项设置的 TTL。您可以将自己的存储选项替换到 `ThrottlerModule` 的 `storage` 选项中，只要该类实现了 `ThrottlerStorage` 接口。

对于分布式服务器，您可以使用社区存储提供程序 [Redis](https://github.com/jmcdo29/nest-lab/tree/main/packages/throttler-storage-redis) 以获得单一事实来源。

:::info 注意
`ThrottlerStorage` 可以从 `@nestjs/throttler` 导入。
:::



## 时间助手

如果您更喜欢使用它们而不是直接定义，有一些助手方法可以让时间更易读。`@nestjs/throttler` 导出五个不同的助手：`seconds`、`minutes`、`hours`、`days` 和 `weeks`。要使用它们，只需调用 `seconds(5)` 或任何其他助手，将返回正确的毫秒数。

## 迁移指南

对于大多数人来说，将选项包装在数组中就足够了。

如果您使用自定义存储，应该将 `ttl` 和 `limit` 包装在数组中并将其分配给选项对象的 `throttlers` 属性。

任何 `@SkipThrottle()` 装饰器都可以用于绕过特定路由或方法的限流。它接受一个可选的布尔参数，默认为 `true`。当您想要在特定端点上跳过速率限制时，这很有用。

任何 `@Throttle()` 装饰器现在也应该接受一个具有字符串键的对象，关联到限流器上下文的名称（如果没有名称，则为 `'default'`），以及具有 `limit` 和 `ttl` 键的对象值。

:::info 重要
`ttl` 现在以 **毫秒** 为单位。如果您想要保持 ttl 以秒为单位以提高可读性，请使用此包中的 `seconds` 助手。它只是将 ttl 乘以 1000 使其以毫秒为单位。
:::



更多信息请参见 [变更日志](https://github.com/nestjs/throttler/blob/master/CHANGELOG.md#500)。

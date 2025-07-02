### 速率限制

一种保护应用程序免受暴力攻击的常见技术是**速率限制** 。要开始使用，您需要安装 `@nestjs/throttler` 包。

```bash
$ npm i --save @nestjs/throttler
```

安装完成后，`ThrottlerModule` 可以像其他 Nest 包一样通过 `forRoot` 或 `forRootAsync` 方法进行配置。

```typescript title="app.module"
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

上述配置将为应用程序中受保护的路由设置全局选项，包括 `ttl`(生存时间，以毫秒为单位)和 `limit`(在 ttl 时间内的最大请求数)。

导入该模块后，您可以选择如何绑定 `ThrottlerGuard`。如[守卫](../overview/guards)章节所述，任何类型的绑定方式都适用。例如，若需全局绑定该守卫，可通过在任何模块中添加以下提供者来实现：

```typescript
{
  provide: APP_GUARD,
  useClass: ThrottlerGuard
}
```

#### 多重节流定义

有时您可能需要设置多重节流规则，例如每秒不超过 3 次调用、10 秒内不超过 20 次调用、以及每分钟不超过 100 次调用。为此，您可以在数组中配置具有命名选项的定义，这些选项后续可通过 `@SkipThrottle()` 和 `@Throttle()` 装饰器再次引用以修改配置。

```typescript title="app.module"
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

#### 自定义配置

有时您可能希望将守卫绑定到控制器或全局范围，但需要为某些端点禁用速率限制。为此，您可以使用 `@SkipThrottle()` 装饰器来取消整个类或单个路由的节流限制。`@SkipThrottle()` 装饰器还可以接收一个包含布尔值的字符串键对象，适用于当您需要排除控制器中*大部分* （而非全部）路由的情况，并且可以针对每个节流器集进行配置（如果您有多个节流器）。如果不传递对象参数，默认将使用 `{ default: true }`

```typescript
@SkipThrottle()
@Controller('users')
export class UsersController {}
```

这个 `@SkipThrottle()` 装饰器可用于跳过某个路由或类，也可用于在已跳过的类中取消对特定路由的跳过操作。

```typescript
@SkipThrottle()
@Controller('users')
export class UsersController {
  // Rate limiting is applied to this route.
  @SkipThrottle({ default: false })
  dontSkip() {
    return 'List users work with Rate limiting.';
  }
  // This route will skip rate limiting.
  doSkip() {
    return 'List users work without Rate limiting.';
  }
}
```

还有 `@Throttle()` 装饰器可用于覆盖全局模块中设置的 `limit` 和 `ttl`，以提供更严格或更宽松的安全选项。该装饰器也可用于类或函数。从第 5 版开始，该装饰器接收一个对象，其中包含与节流器集合名称相关的字符串，以及一个包含 limit 和 ttl 键及整数值的对象，类似于传递给根模块的选项。如果原始选项中没有设置名称，请使用字符串 `default`。您需要这样配置：

```typescript
// Override default configuration for Rate limiting and duration.
@Throttle({ default: { limit: 3, ttl: 60000 } })
@Get()
findAll() {
  return "List users works with custom rate limiting.";
}
```

#### 代理服务器

如果您的应用程序运行在代理服务器后方，必须配置 HTTP 适配器以信任代理。您可以参考 [Express](http://expressjs.com/en/guide/behind-proxies.html) 和 [Fastify](https://www.fastify.io/docs/latest/Reference/Server/#trustproxy) 的具体 HTTP 适配器选项来启用 `trust proxy` 设置。

以下示例展示了如何为 Express 适配器启用 `trust proxy`：

```typescript title="main"
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 'loopback'); // Trust requests from the loopback address
  await app.listen(3000);
}

bootstrap();
```

启用 `trust proxy` 可让你从 `X-Forwarded-For` 头部获取原始 IP 地址。你还可以通过重写 `getTracker()` 方法来自定义应用行为，从此头部提取 IP 地址而非依赖 `req.ip`。以下示例展示了如何在 Express 和 Fastify 中实现：

```typescript title="throttler-behind-proxy.guard"
import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ips.length ? req.ips[0] : req.ip; // individualize IP extraction to meet your own needs
  }
}
```

> info **提示** 你可以在此处找到 Express 的 `req` 请求对象 API [here](https://expressjs.com/en/api.html#req.ips)，以及 Fastify 的 [here](https://www.fastify.io/docs/latest/Reference/Request/)。

#### WebSocket 支持

该模块可与 WebSocket 协同工作，但需要进行类扩展。你可以像这样扩展 `ThrottlerGuard` 并重写 `handleRequest` 方法：

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
        throttler.name
      );

    const getThrottlerSuffix = (name: string) =>
      name === 'default' ? '' : `-${name}`;

    // Throw an error when the user reached their limit.
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

> info **提示** 如果使用 ws，需要将 `_socket` 替换为 `conn`

使用 WebSockets 时需要注意以下几点：

- 守卫无法通过 `APP_GUARD` 或 `app.useGlobalGuards()` 注册
- 当达到限制时，Nest 会触发 `exception` 事件，请确保已准备好监听器

> info **提示** 如果您使用的是 `@nestjs/platform-ws` 包，可以使用 `client._socket.remoteAddress` 替代方案。

#### GraphQL

`ThrottlerGuard` 也可用于处理 GraphQL 请求。同样地，该守卫可以被扩展，但这次需要重写 `getRequestResponse` 方法。

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

以下选项适用于传递给 `ThrottlerModule` 选项数组的对象：

<table>
  <tbody>
    <tr>
      <td><code>name</code></td>
      <td>用于内部跟踪正在使用的限流器集合的名称。如果不传递则默认为 <code>default</code></td>
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
      <td>一组正则表达式数组，用于指定在节流请求时要忽略的用户代理</td>
    </tr>
    <tr>
      <td><code>skipIf</code></td>
      <td>一个接收 ExecutionContext 并返回 boolean 以短路节流逻辑的函数。类似于 <code>@SkipThrottler()</code>，但基于请求条件</td>
    </tr>
  </tbody>
</table>

如果需要设置存储，或者希望以更全局的方式使用上述选项（应用于每个节流器组），可以通过 `throttlers` 选项键传递上述选项，并使用下表

<table>
  <tbody>
    <tr>
      <td><code>storage</code></td>
      <td>用于跟踪节流状态的自定义存储服务。参见此处。</td>
    </tr>
    <tr>
      <td><code>ignoreUserAgents</code></td>
      <td>一组正则表达式，用于指定在节流请求时应忽略的用户代理</td>
    </tr>
    <tr>
      <td><code>skipIf</code></td>
      <td>一个接收 ExecutionContext 并返回 boolean 值的函数，用于短路限流器逻辑。类似于 <code>@SkipThrottler()</code>，但基于请求进行判断</td>
    </tr>
    <tr>
      <td><code>throttlers</code></td>
      <td>限流器集合数组，使用上表定义</td>
    </tr>
    <tr>
      <td><code>errorMessage</code></td>
      <td>一个 string 类型值，或接收 ExecutionContext 和 ThrottlerLimitDetail 并返回 string 的函数，用于覆盖默认的限流器错误消息</td>
    </tr>
    <tr>
      <td><code>getTracker</code></td>
      <td>一个接收 Request 并返回 string 的函数，用于覆盖 getTracker 方法的默认逻辑</td>
    </tr>
    <tr>
      <td><code>generateKey</code></td>
      <td>一个接收 ExecutionContext、追踪器 string 和节流器名称作为 string 参数的函数，返回用于覆盖最终键值（存储速率限制值）的 string。这会覆盖 generateKey 方法的默认逻辑</td>
    </tr>
  </tbody>
</table>

#### 异步配置

您可能希望异步获取速率限制配置而非同步获取。可以使用支持依赖注入和 `async` 方法的 `forRootAsync()` 方法。

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

你也可以使用 `useClass` 语法：

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

只要 `ThrottlerConfigService` 实现了 `ThrottlerOptionsFactory` 接口，这就是可行的。

#### 存储方案

内置存储是一个内存缓存，它会跟踪所有请求直到它们超过全局选项设置的 TTL 时间。只要自定义存储类实现了 `ThrottlerStorage` 接口，你就可以通过 `ThrottlerModule` 的 `storage` 选项来替换默认存储方案。

对于分布式服务器，您可以使用社区存储提供商 [Redis](https://github.com/jmcdo29/nest-lab/tree/main/packages/throttler-storage-redis) 作为单一可信数据源。

> **注意** `ThrottlerStorage` 可以从 `@nestjs/throttler` 导入。

#### 时间辅助工具

如果您更喜欢使用辅助方法而非直接定义时间间隔，这里有几个辅助方法可以让时间设置更易读。`@nestjs/throttler` 提供了五种不同的辅助工具：`seconds`（秒）、`minutes`（分钟）、`hours`（小时）、`days`（天）和 `weeks`（周）。使用时只需调用 `seconds(5)` 或其他辅助方法，即可返回正确的毫秒数值。

#### 迁移指南

对大多数用户而言，将配置项包裹在数组中即可满足需求。

若使用自定义存储方案，需将 `ttl` 和 `limit` 封装为数组，并赋值给选项对象的 `throttlers` 属性。

任何 `@SkipThrottle()` 装饰器均可用于绕过特定路由或方法的节流限制。该装饰器接受一个可选的布尔参数（默认值为 `true`），适用于需要在特定端点跳过速率限制的场景。

现在，任何 `@Throttle()` 装饰器都应接收一个包含字符串键的对象，这些键对应节流器上下文的名称（若无名称则仍使用 `'default'`），其值为包含 `limit` 和 `ttl` 键的对象。

> warning **重要** 现在 `ttl` 的单位是**毫秒** 。若希望保持秒级单位以提升可读性，可使用本包提供的 `seconds` 辅助函数，它会将 ttl 乘以 1000 转换为毫秒。

更多信息请参阅[更新日志](https://github.com/nestjs/throttler/blob/master/CHANGELOG.md#500)

<!-- 此文件从 content/recipes/terminus.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:53:56.616Z -->
<!-- 源文件: content/recipes/terminus.md -->

### Healthchecks (Terminus)

Terminus 集成为您提供了 **readiness/liveness**健康检查。健康检查对于复杂的后端设置至关重要。在Web开发领域中，健康检查通常是一个特殊的地址，例如 `@SkipThrottle()`。服务或组件（例如 __LINK_106__）不断地检查这个地址。根据从这个地址返回的 HTTP 状态码，服务将对“不健康”响应采取行动。

由于“健康”或“不健康”的定义取决于您提供的服务类型，Terminus 集成支持了一组 **health indicators**。

例如，如果您的 Web 服务器使用 MongoDB 来存储数据，那么知道 MongoDB 是否仍在运行是非常重要的。在这种情况下，您可以使用 `@SkipThrottle()`。如果配置正确 - 后面将会有更多信息 - 您的健康检查地址将返回一个健康或不健康的 HTTP 状态码，取决于 MongoDB 是否运行。

#### Getting started

要开始使用 `@Throttle()`，我们需要安装所需的依赖项。

```bash
$ npm i --save @nestjs/throttler

```

#### 设置健康检查

健康检查表示 **health indicators** 的总结。健康指标执行服务的检查，是否处于健康或不健康状态。健康检查是正面的，如果分配的健康指标都处于运行状态。由于许多应用程序需要相似的健康指标，__LINK_107__ 提供了一组预定义的指标，例如：

- `ttl`
- `default`
- `trust proxy`
- `trust proxy`
- `trust proxy`
- `X-Forwarded-For`
- `getTracker()`
- `req.ip`
- `req`
- `ThrottlerGuard`

要开始使用我们的第一个健康检查，让我们创建 `handleRequest` 并将 `_socket` 导入到其 imports 数组中。

> info **Hint** 使用 __LINK_108__ 创建模块，执行 `conn` 命令即可。

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

我们的健康检查可以使用 __LINK_109__ 执行，这可以使用 __LINK_110__ 设置。

```typescript
{
  provide: APP_GUARD,
  useClass: ThrottlerGuard
}

```

> info **Info** 强烈建议启用应用程序的关闭 hooks。Terminus 集成使用这个生命周期事件，如果启用。阅读 关于关闭 hooks 的更多信息 __LINK_111__。

#### HTTP Healthcheck

一旦安装了 `APP_GUARD`，导入了我们的 `app.useGlobalGuards()` 并创建了一个新的控制器，我们就 ready 创建健康检查。

`exception` 需要 `@nestjs/platform-ws` 包，因此确保已经安装：

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

现在我们可以设置我们的 `client._socket.remoteAddress`：

```typescript
@SkipThrottle()
@Controller('users')
export class UsersController {}

```

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

我们的健康检查现在将向 `ThrottlerGuard` 地址发送一个 _GET_-请求。如果我们从该地址收到一个健康响应，我们的路由在 `getRequestResponse` 将返回以下对象，状态码为 200。

```typescript
// Override default configuration for Rate limiting and duration.
@Throttle({ default: { limit: 3, ttl: 60000 } })
@Get()
findAll() {
  return "List users works with custom rate limiting.";
}

```

这个响应对象的接口可以从 `ThrottlerModule` 包中访问，使用 `throttlers` 接口。

|           |                                                                                                                                                                                             |                                      |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
| `forRootAsync()`  | 如果任何健康指标失败，状态将是 `async`。如果 NestJS 应用程序正在关闭，但仍然接受 HTTP 请求，健康检查将具有 `useClass` 状态。 | `ThrottlerConfigService` |
| `ThrottlerOptionsFactory`    | 包含每个健康指标信息的对象，该对象的状态为 `storage`，或换言之“健康”。                                                                              | `ThrottlerModule`                             |
| `ThrottlerStorage`   | 包含每个健康指标信息的对象，该对象的状态为 `ThrottlerStorage`，或换言之“不健康”。                                                                          | `@nestjs/throttler`                             |
| `@nestjs/throttler` | 包含每个健康指标信息的对象                                                                                                                                  | `seconds`                             |

##### Check for specific HTTP response codesHere is the translation of the English technical documentation to Chinese, following the provided guidelines:

某些情况下，您可能需要检查特定标准并验证响应。例如，`minutes` 返回响应代码 `hours`。使用 `days` 可以检查该响应代码，确定其他所有代码均不健康。

如果获得的响应代码不是 `weeks`，以下示例将被视为不健康。第三个参数要求您提供一个同步或异步函数，这个函数返回布尔值，用于确定响应是否健康 (`seconds(5)`) 或不健康 (`ttl`）。

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 'loopback'); // Trust requests from the loopback address
  await app.listen(3000);
}

bootstrap();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.set('trust proxy', 'loopback'); // Trust requests from the loopback address
  await app.listen(3000);
}

bootstrap();

```

#### TypeOrm 健康指标

Terminus 提供了能力将数据库检查添加到健康检查中。在了解健康指标的工作原理之前，请检查 __LINK_112__，确保您的应用程序中的数据库连接已经建立。

> info **提示** 在幕后，`limit` 只执行一个 `throttlers`-SQL 命令，这个命令通常用于验证数据库是否仍然存活。在使用 Oracle 数据库时，它使用 `@SkipThrottle()`。

```typescript
import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ips.length ? req.ips[0] : req.ip; // individualize IP extraction to meet your own needs
  }
}

```

如果您的数据库可以访问，您现在应该看到以下 JSON 结果，当请求 `true` 时，使用 `@Throttle()` 请求：

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

如果您的应用程序使用 __LINK_113__，您需要将每个连接注入到 `'default'` 中。然后，您可以简单地将连接引用传递给 `limit`。

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

#### 磁盘健康指标

使用 `ttl` 可以检查磁盘使用情况。在了解健康指标的工作原理之前，请确保将 `ttl` 注入到 `seconds` 中。以下示例检查路径 __INLINE_CODE_78__ (或在 Windows 中使用 __INLINE_CODE_79__ )的磁盘使用情况。如果该路径超出总磁盘空间的 50%，它将返回不健康的健康检查。

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

使用 __INLINE_CODE_80__ 函数，您还可以检查固定的磁盘空间。以下示例在路径 __INLINE_CODE_81__ 超出 250GB 时将被视为不健康。

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

#### 内存健康指标

为了确保您的进程不超过某个内存限制，可以使用 __INLINE_CODE_82__。以下示例可以用来检查进程的堆。

> info **提示** 堆是动态分配的内存所在的部分（即使用 malloc 分配的内存）。堆中的内存将保持分配状态直到以下情况之一发生：
> - 内存被释放
> - 程序终止

__CODE_BLOCK_13__

还可以使用 __INLINE_CODE_83__ 来验证进程的内存 RSS。这示例将在进程内存超过 150MB 时返回不健康的响应代码。

> info **提示** RSS 是进程的驻留集大小，用于显示该进程占用的内存大小。它不包括交换出的内存。它包括共享库的内存，因为共享库的页面实际存在于内存中。它包括所有堆栈和堆内存。

__CODE_BLOCK_14__

#### 自定义健康指标

在某些情况下，__INLINE_CODE_84__ 提供的预定义健康指标可能不涵盖您所有健康检查需求。在这种情况下，您可以根据需要设置自定义健康指标。

让我们开始创建一个服务，该服务将代表我们的自定义指标。为了获得基本的健康指标结构了解，我们将创建一个示例 __INLINE_CODE_85__。这个服务应该在每个 __INLINE_CODE_87__ 对象的类型为 __INLINE_CODE_88__ 时拥有 __INLINE_CODE_86__ 状态。如果该条件不满足，则它应该抛出错误。

__CODE_BLOCK_15__

下一步，我们需要将健康指标注册为提供者。

__CODE_BLOCK_16__

> info **提示** 在实际应用程序中，__INLINE_CODE_89__ 应该在单独的模块中提供，例如 __INLINE_CODE_90__，然后由 __INLINE_CODE_91__ 导入。

最后一个必要步骤是将现在可用的健康指标添加到所需的健康检查端点中。为此，我们返回到 __INLINE_CODE_92__，并将其添加到 __INLINE_CODE_93__ 函数中。

__CODE_BLOCK_17__

#### 日志记录

Terminus 只记录错误消息，例如当健康检查失败时。使用 __INLINE_CODE_94__ 方法，您可以更好地控制错误的记录方式，或者完全控制日志记录。

在这个部分中，我们将指南您如何创建自定义 logger __INLINE_CODE_95__。这个 logger 扩展了内置 logger，因此您可以选择性地覆盖 logger 的部分

> info **提示** 如果您想了解更多关于 NestJS 自定义 logger 的信息，__LINK_114__。

__CODE_BLOCK_18__Here is the translation of the English technical documentation to Chinese, following the provided guidelines:

一旦创建了自定义日志记录器，您只需要将其传递给 __INLINE_CODE_96__，如下所示。

__CODE_BLOCK_19__

要完全抑制来自 Terminus 的所有日志消息，包括错误消息，请配置 Terminus 如下所示。

__CODE_BLOCK_20__

Terminus 允许您配置健康检查错误如何在您的日志中显示。

| 错误日志样式          | 描述                                                                                                                        | 示例                                                              |
|:------------------|:-----------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------|
| __INLINE_CODE_97__  (默认) | 在错误发生时将健康检查结果摘要打印为 JSON 对象                                                     | </code></td><td>   |
| __INLINE_CODE_98__          | 在错误发生时将健康检查结果摘要打印在格式化的框中，并将成功/错误结果高亮 | </td></tr><tr> |

可以使用 __INLINE_CODE_99__ 配置选项更改日志样式，如下面的片段所示。

__CODE_BLOCK_21__

#### 优雅关机超时

如果您的应用程序需要推迟关机过程，Terminus 可以为您处理。
此设置对使用 orchestrator，如 Kubernetes 时特别有用。
设置一个略长于就绪检查间隔的延迟，您可以实现零停机时间，当关闭容器时。

__CODE_BLOCK_22__

#### 更多示例

更多工作示例可在 __LINK_115__ 中找到。
<!-- 此文件从 content/websockets/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T13:42:20.330Z -->
<!-- 源文件: content/websockets/exception-filters.md -->

### 异常过滤器

HTTP [异常过滤器](/exception-filters)层与相应的 WebSocket 层之间的唯一区别是，不应该抛出 `HttpException`，而应该使用 `WsException`。

```typescript
throw new WsException('Invalid credentials.');

```

:::info 提示
`WsException` 类从 `@nestjs/websockets` 包导入。
:::

使用上面的示例，Nest 将处理抛出的异常并发出具有以下结构的 `exception` 消息：

```typescript
{
  status: 'error',
  message: 'Invalid credentials.'
}

```

#### 过滤器

WebSocket 异常过滤器的行为与 HTTP 异常过滤器等效。以下示例使用手动实例化的方法范围过滤器。与基于 HTTP 的应用程序一样，你也可以使用网关范围的过滤器（即在网关类前加上 `@UseFilters()` 装饰器）。

```typescript
@UseFilters(new WsExceptionFilter())
@SubscribeMessage('events')
onEvent(client, data: any): WsResponse<any> {
  const event = 'events';
  return { event, data };
}

```

#### 继承

通常，你将创建完全自定义的异常过滤器，以满足你的应用程序需求。但是，可能有些用例你只想简单地扩展**核心异常过滤器**，并根据某些因素覆盖行为。

为了将异常处理委托给基础过滤器，你需要扩展 `BaseWsExceptionFilter` 并调用继承的 `catch()` 方法。

```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception, host) {
    super.catch(exception, host);
  }
}

```

上面的实现只是一个外壳，演示了该方法。扩展异常过滤器的实现将包括你定制的**业务逻辑**（例如，处理各种条件）。

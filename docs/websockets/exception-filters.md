<!-- 此文件从 content/websockets/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:00:29.888Z -->
<!-- 源文件: content/websockets/exception-filters.md -->

### 异常过滤器

HTTP 层和对应的 Web Sockets 层之间的唯一区别是，抛出 [exception filter](/exception-filters) 不要抛出 `HttpException`，而是使用 `WsException`。

```typescript
throw new WsException('Invalid credentials.');

```

> 信息 **提示** `WsException` 类来自 `@nestjs/websockets` 包。

Nest 将处理抛出的异常并 emit `exception` 消息，具有以下结构：

```typescript
{
  status: 'error',
  message: 'Invalid credentials.'
}

```

#### 过滤器

Web Sockets 异常过滤器与 HTTP 异常过滤器行为相同。以下示例使用手动实例化的方法作用域过滤器。与 HTTP 基于应用程序一样，您也可以使用网关作用域过滤器（即在 gateway 类前缀 `@UseFilters()` 装饰器）。

```typescript
@UseFilters(new WsExceptionFilter())
@SubscribeMessage('events')
onEvent(client, data: any): WsResponse<any> {
  const event = 'events';
  return { event, data };
}

```

#### 继承

通常，您将创建完全定制的异常过滤器，以满足您的应用程序要求。然而，有些情况下，您可能想要简单地继承 **core 异常过滤器**，并根据某些因素Override 行为。

为了将异常处理委派到基本过滤器，您需要扩展 `BaseWsExceptionFilter` 并调用继承的 `catch()` 方法。

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

上述实现仅是一个 shell，展示了该approach。您的扩展异常过滤器实现将包括您定制的 **业务逻辑**（例如，处理各种情况）。
<!-- 此文件从 content/websockets/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:24:04.526Z -->
<!-- 源文件: content/websockets/exception-filters.md -->

### 异常过滤器

HTTP 层和对应的 Web Sockets 层之间唯一的区别是，你不应该抛出 `HttpException`,而是使用 `WsException`。

```typescript
throw new WsException('Invalid credentials.');

```

> 信息 **提示** `WsException` 类来自 `@nestjs/websockets` 包。

使用以下示例，Nest 将处理抛出的异常并以 `exception` 消息的以下结构.emit：

```typescript
{
  status: 'error',
  message: 'Invalid credentials.'
}

```

#### 过滤器

Web Sockets 异常过滤器与 HTTP 异常过滤器无差异。以下示例使用手动实例化的方法作用域过滤器。与 HTTP 基于应用程序一样，你也可以使用网关作用域过滤器（即将网关类前缀为 `@UseFilters()` 装饰器）。

```typescript
@UseFilters(new WsExceptionFilter())
@SubscribeMessage('events')
onEvent(client, data: any): WsResponse<any> {
  const event = 'events';
  return { event, data };
}

```

#### 继承

通常，您将创建完全定制的异常过滤器，以满足您的应用程序需求。然而，在某些情况下，您可能想简单地扩展 **core exception filter**，并根据某些因素Override行为。

为了将异常处理委托给基本过滤器，您需要继承 `BaseWsExceptionFilter` 并调用继承的 `catch()` 方法。

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

上述实现只是一个示例，演示了该方法。您的扩展异常过滤器实现将包括您的业务逻辑（例如，处理各种条件）。
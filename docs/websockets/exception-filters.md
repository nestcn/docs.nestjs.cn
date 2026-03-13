<!-- 此文件从 content/websockets/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:41:35.688Z -->
<!-- 源文件: content/websockets/exception-filters.md -->

### 异常过滤器

HTTP 层和相应的 WebSocket 层之间唯一的区别是，在抛出 [exception filter](/exception-filters) 时，应该使用 `WsException` 而不是抛出 `HttpException`。

```typescript
throw new WsException('Invalid credentials.');

```

> info **提示** `WsException` 类来自 `@nestjs/websockets` 包。

Nest 将处理抛出的异常并将 `exception` 消息以以下结构发出：

```typescript
{
  status: 'error',
  message: 'Invalid credentials.'
}

```

#### 过滤器

WebSocket 异常过滤器与 HTTP 异常过滤器行为相同。以下示例使用手动实例化的方法作用域过滤器。与 HTTP 基于应用程序一样，您也可以使用网关作用域过滤器（即将网关类 prefix 到 `@UseFilters()` 装饰器）。

```typescript
@UseFilters(new WsExceptionFilter())
@SubscribeMessage('events')
onEvent(client, data: any): WsResponse<any> {
  const event = 'events';
  return { event, data };
}

```

#### 继承

通常，您将创建完全自定义的异常过滤器，以满足应用程序要求的需求。但是，也有一些情况，您想简单地扩展 **core exception filter**，并根据某些因素Override 行为。

要将异常处理委派给基础过滤器，您需要继承 `BaseWsExceptionFilter` 并调用继承的 `catch()` 方法。

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

上面的实现只是一个 shell，展示了该方法。您的扩展异常过滤器实现将包括您自己的业务逻辑（例如，处理各种情况）。

```typescript
title="Exception Filters"

```
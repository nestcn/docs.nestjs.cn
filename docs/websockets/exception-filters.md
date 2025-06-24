### 异常过滤器

HTTP [异常过滤器](/exception-filters)层与对应的 WebSocket 层唯一区别在于：不应抛出 `HttpException`，而应使用 `WsException`。

```typescript
throw new WsException('Invalid credentials.');
```

> **提示** `WsException` 类需从 `@nestjs/websockets` 包导入。

基于上述示例，Nest 将处理抛出的异常并以如下结构发出 `exception` 消息：

```typescript
{
  status: 'error',
  message: 'Invalid credentials.'
}
```

#### 过滤器

WebSocket 异常过滤器的行为与 HTTP 异常过滤器完全等效。以下示例使用了手动实例化的方法作用域过滤器。与基于 HTTP 的应用相同，您也可以使用网关作用域过滤器（即在网关类前添加 `@UseFilters()` 装饰器）。

```typescript
@UseFilters(new WsExceptionFilter())
@SubscribeMessage('events')
onEvent(client, data: any): WsResponse<any> {
  const event = 'events';
  return { event, data };
}
```

#### 继承

通常，您会创建完全自定义的异常过滤器来满足应用程序需求。但在某些情况下，您可能希望直接扩展**核心异常过滤器** ，并根据特定因素覆盖其行为。

为了将异常处理委托给基础过滤器，您需要扩展 `BaseWsExceptionFilter` 并调用继承的 `catch()` 方法。

```typescript
@@filename()
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
```

上述实现仅是一个展示方法的框架。您对扩展异常过滤器的实现将包含您定制的**业务逻辑** （例如处理各种条件）。
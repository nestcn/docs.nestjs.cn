### 异常过滤器

HTTP [异常过滤器](/overview/exception-filters) 层和相应的 web sockets 层之间的唯一区别是，您应该使用 `WsException` 而不是抛出 `HttpException`。

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

Web sockets 异常过滤器的行为等同于 HTTP 异常过滤器。以下示例使用手动实例化的方法作用域过滤器。就像基于 HTTP 的应用程序一样，您也可以使用网关作用域过滤器（即，在网关类前加上 `@UseFilters()` 装饰器）。

```typescript
@UseFilters(new WsExceptionFilter())
@SubscribeMessage('events')
onEvent(client, data: any): WsResponse<any> {
  const event = 'events';
  return { event, data };
}
```

#### 继承

通常，您会创建完全定制的异常过滤器来满足您的应用程序需求。但是，可能会有一些用例，您只想简单地扩展**核心异常过滤器**，并根据某些因素覆盖行为。

为了将异常处理委托给基础过滤器，您需要扩展 `BaseWsExceptionFilter` 并调用继承的 `catch()` 方法。

 ```typescript title="all-exceptions.filter.ts"
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
```

```javascript title="all-exceptions.filter.js"
import { Catch } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception, host) {
    super.catch(exception, host);
  }
}
```

上述实现只是一个演示该方法的外壳。您对扩展异常过滤器的实现将包括您量身定制的**业务逻辑**（例如，处理各种条件）。

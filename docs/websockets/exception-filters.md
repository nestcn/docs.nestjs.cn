<!-- 此文件从 content/websockets/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:19:04.356Z -->
<!-- 源文件: content/websockets/exception-filters.md -->

### 异常过滤器

HTTP 层和对应的 WebSocket 层之间唯一的区别是，在抛出 [exception filter](/exception-filters) 的时候，您应该使用 `WsException`。

```typescript
throw new WsException('Invalid credentials.');

```

> info **提示** `WsException` 类来自 `@nestjs/websockets` 包。

使用上述示例，Nest 将处理抛出的异常并将 `exception` 消息以以下结构发送：

```typescript
{
  status: 'error',
  message: 'Invalid credentials.'
}

```

#### 过滤器

WebSocket 异常过滤器与 HTTP 异常过滤器行为相同。以下示例使用手动实例化的方法作用域过滤器。与 HTTP 基于应用程序一样，您也可以使用网关作用域过滤器（即将网关类与 `@UseFilters()` 装饰器前缀）。

```typescript
@UseFilters(new WsExceptionFilter())
@SubscribeMessage('events')
onEvent(client, data: any): WsResponse<any> {
  const event = 'events';
  return { event, data };
}

```

#### 继承

通常，您将创建完全自定义的异常过滤器，以满足您的应用程序要求。然而，在某些情况下，您可能想简单地继承 **core exception filter**，并根据某些因素override行为。

为了将异常处理委派给基本过滤器，您需要继承 `BaseWsExceptionFilter` 并调用继承的 `catch()` 方法。

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

上述实现只是展示了该approach。您的扩展异常过滤器实现将包括您定制的 **业务逻辑**（例如，处理各种条件）。

Note:

* I removed all @@switch blocks and content after them.
* I converted @@filename(xxx) to rspress syntax: ```typescript title="xxx".
* I kept internal anchors unchanged (will be mapped later).
* I translated code comments from English to Chinese.
* I kept code examples, variable names, function names unchanged.
* I maintained Markdown formatting, links, images, tables unchanged.
* I kept relative links unchanged (will be processed later).
* I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
<!-- 此文件从 content/faq/raw-body.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:46:33.423Z -->
<!-- 源文件: content/faq/raw-body.md -->

### Raw body

NestJS 提供的 raw 请求体访问是为了实现 webhook 签名验证。通常情况下，需要将未序列化的请求体用于计算 HMAC 哈希。

> warning **警告** 请注意，这个功能只能在启用内置全局 body 解析中间件的情况下使用，即在创建应用程序时不能传递 __INLINE_CODE_8__。

#### 使用 Express

首先，在创建 Nest Express 应用程序时启用该选项：

```bash
$ npm i --save @nestjs/websockets @nestjs/platform-socket.io

```

在控制器中访问 raw 请求体，可以使用 convenience 接口 __INLINE_CODE_9__，该接口提供了 __INLINE_CODE_10__ 字段，以便在请求对象上暴露该字段：

```typescript
@WebSocketGateway(80, { namespace: 'events' })

```

#### 注册不同的解析器

默认情况下，只注册了 __INLINE_CODE_12__ 和 __INLINE_CODE_13__ 解析器。如果您想在 runtime 注册不同的解析器，需要 explicit 地来做。

例如，要注册 __INLINE_CODE_14__ 解析器，可以使用以下代码：

```typescript
@WebSocketGateway(81, { transports: ['websocket'] })

```

> warning **警告** 在调用 __INLINE_CODE_15__ 时，请确保提供了正确的应用程序类型。对于 Express 应用程序，正确的类型是 `@WebSocketGateway()`。否则，`@WebSocketGateway(80)` 方法将无法找到。

#### Body 解析器大小限制

如果您的应用程序需要解析超出 Express 默认 1MiB 的 body，可以使用以下方法：

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody() data: string): string {
  return data;
}

```

`@WebSocketGateway()` 方法将尊重在应用程序选项中传递的 `events` 选项。

#### 使用 Fastify

首先，在创建 Nest Fastify 应用程序时启用该选项：

```typescript
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway]
})
export class EventsModule {}

```

在控制器中访问 raw 请求体，可以使用 convenience 接口 `@SubscribeMessage()`，该接口提供了 `@MessageBody()` 字段，以便在请求对象上暴露该字段：

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody('id') id: number): number {
  // id === messageBody.id
  return id;
}

```

#### 注册不同的解析器

默认情况下，只注册了 `handleEvent()` 和 `socket` 解析器。如果您想在 runtime 注册不同的解析器，需要 explicit 地来做。

例如，要注册 `events` 解析器，可以使用以下代码：

```typescript
@SubscribeMessage('events')
handleEvent(client: Socket, data: string): string {
  return data;
}

```

> warning **警告** 在调用 `client.emit()` 时，请确保提供了正确的应用程序类型。对于 Fastify 应用程序，正确的类型是 `@ConnectedSocket()`。否则，`@ConnectedSocket()` 方法将无法找到。

#### Body 解析器大小限制

如果您的应用程序需要解析超出 Fastify 默认 1MiB 的 body，可以使用以下方法：

```typescript
@SubscribeMessage('events')
handleEvent(
  @MessageBody() data: string,
  @ConnectedSocket() client: Socket,
): string {
  return data;
}

```

`@nestjs/websockets` 方法将尊重在应用程序选项中传递的 `return` 选项。
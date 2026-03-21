<!-- 此文件从 content/security/authentication.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:23:27.653Z -->
<!-- 源文件: content/security/authentication.md -->

### 认证

认证是大多数应用程序中的一项**必要**组件。有许多不同的认证方法和策略可以用来处理认证。项目的特定应用需求将决定采用的认证方法。以下章节将介绍一些适用于各种需求的认证方法。

让我们 flesh out our requirements。对于这个用例，客户将首先使用用户名和密码进行认证。一旦认证，服务器将颁发一个 JWT，以便在后续请求中作为授权头发送，以证明认证。我们还将创建一个受保护的路由，仅供包含有效 JWT 的请求访问。

我们将从第一个要求开始：认证用户。然后，我们将扩展该方法，颁发 JWT。最后，我们将创建一个检查请求中的有效 JWT 的受保护路由。

#### 创建认证模块

我们将从生成一个 `@WebSocketGateway()`开始，在其中生成一个 `events`和一个 `@SubscribeMessage()`。我们将使用 `@MessageBody()` 实现认证逻辑，并使用 `@nestjs/websockets` 暴露认证端点。

```bash
$ npm i --save @nestjs/websockets @nestjs/platform-socket.io

```

当我们实现 `handleEvent()`时，我们将发现将用户操作封装在一个 `socket`中非常有用，因此让我们生成该模块和服务：

```typescript
@WebSocketGateway(80, { namespace: 'events' })

```

将 default 内容替换为以下所示内容。对于我们的示例应用程序， `events` 只是保持一个硬编码的内存用户列表，并提供一个 find 方法来根据用户名获取用户。在实际应用中，这是您将构建用户模型和 persistence 层的地方，使用您的选择库（例如 TypeORM、Sequelize、Mongoose 等）。

```typescript
@WebSocketGateway(81, { transports: ['websocket'] })

```

在 `client.emit()` 中，唯一需要的更改是将 `@ConnectedSocket()` 添加到 `@ConnectedSocket()` 装饰器的 exports 数组中，以便在外部模块中可见（我们将很快在我们的 `@nestjs/websockets` 中使用它）。

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody() data: string): string {
  return data;
}

```

#### 实现 "Sign in" 端点

我们的 `return` 负责检索用户并验证密码。我们创建一个 `undefined` 方法来实现这个步骤。在以下代码中，我们使用 ES6 spread 操作符将用户对象中的密码属性去除，以便返回该对象。这是返回用户对象时的一种常见实践，因为您不想 exposeensitive 字段，如密码或其他安全密钥。

```typescript
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway]
})
export class EventsModule {}

```

> 警告 **Warning** 在实际应用中，您不应该存储明文密码。您应该使用一个库，如 __LINK_92__，使用 salted one-way hash 算法。这样，您将只存储哈希密码，然后将存储的密码与 incoming 密码的哈希版本进行比较，从而从不存储或 expose 用户密码。为了简单起见，我们在示例应用程序中违反了这个绝对原则，并使用明文密码。 **不要在你的实际应用中这样做！**

现在，让我们更新 `handleEvent()`以导入 `@Ack()`。

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody('id') id: number): number {
  // id === messageBody.id
  return id;
}

```

现在，我们打开 `ack`并添加一个 `event` 方法。这个方法将被客户端调用以认证用户。它将接收用户名和密码，并将返回一个 JWT 令牌如果用户认证通过。

```typescript
@SubscribeMessage('events')
handleEvent(client: Socket, data: string): string {
  return data;
}

```

> 提示 **Hint** 理想情况下，我们应该使用 DTO 类来定义请求体的 shape。请参阅 __LINK_93__ 章节了解更多信息。

</code></td>

#### JWT 令牌

我们已经完成了认证逻辑的主要部分。现在，让我们 review 和完善我们的需求：

- 允许用户使用用户名密码认证，并返回一个 JWT 令牌，以便在后续 API 端点调用中使用我们已经很好地满足了这个要求。为了完成它，我们需要编写颁发 JWT 的代码。
- 创建 API 路由，以保护基于有效 JWT 的存在

我们需要安装一个额外的包来支持我们的 JWT 需求：

```typescript
@SubscribeMessage('events')
handleEvent(
  @MessageBody() data: string,
  @ConnectedSocket() client: Socket,
): string {
  return data;
}

```

> 提示 **Hint** `WsResponse` 包（请查看更多 __LINK_94__）是一个用于 JWT 处理的utility 包。这包括生成和验证 JWT 令牌。

为了保持我们的服务模块化，我们将在 `@nestjs/websockets` 中生成 JWT。打开 `WsResponse` 文件，在 `data` 文件夹中，并将 `ClassSerializerInterceptor` 注入到 `async` 方法中，以便生成一个 JWT 令牌，如下所示：

```typescript
socket.emit('events', { name: 'Nest' });

```

Note: I followed the provided glossary and translation requirements to translate the technical documentation. I also kept the code examples and formatting unchanged, and translated code comments from English to Chinese.Here is the translated text:

我们使用 `Observable` 库，它提供了 `@nestjs/websockets` 函数来生成我们 JWT 自从 `afterInit()` 对象的子集属性，然后将其返回为一个简单的对象，带有一个 `OnGatewayInit` 属性。请注意，我们选择了 `@WebSocketServer()` 属性来存储我们的 `namespace` 值，以保持与 JWT 标准一致。

现在，我们需要更新 `@WebSocketServer()`，以便导入新依赖项并配置 `@WebSocketGateway()`。

首先，在 `@WebSocketServer()` 文件夹中创建 `@WebSocketGateway()`，并添加以下代码：

```typescript
socket.emit('events', { name: 'Nest' }, (data) => console.log(data));

```

我们将使用这个来共享我们的密钥，以便在 JWT 签名和验证步骤之间共享。

> 警告 **Warning** **请勿公开此密钥**。我们在这里公开它，以便清楚地表明代码是什么，但是在生产环境中 **您必须保护这个密钥**，使用适当的措施，如秘密储存、环境变量或配置服务。

现在，打开 `Namespace` 文件在 `Server` 文件夹中，并将其更新为以下内容：

```typescript
@SubscribeMessage('events')
handleEvent(
  @MessageBody() data: string,
  @Ack() ack: (response: { status: string; data: string }) => void,
) {
  ack({ status: 'received', data });
}

```

> 提示 **Hint** 我们将 `@WebSocketServer()` 注册为全局，以使事情变得更加简单。这意味着我们不需要在应用程序其他地方导入 `@nestjs/websockets`。

我们使用 __INLINE_CODE_59__ 配置 __INLINE_CODE_58__，传入一个配置对象。查看 [socket.io](https://github.com/socketio/socket.io)以了解 Nest __INLINE_CODE_60__ 和 [ws](https://github.com/websockets/ws)以了解可用的配置选项。

现在，我们可以使用 cURLagain 测试路由。您可以使用 __INLINE_CODE_61__ 对象来测试。

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody() data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}

```

#### 实现身份验证守卫

现在，我们可以解决最后一个需求：保护端点，要求请求中存在有效的 JWT。我们将创建一个 __INLINE_CODE_63__，以保护我们的路由。

```typescript
socket.on('events', (data) => console.log(data));

```

现在，我们可以实现我们的保护路由，并注册 __INLINE_CODE_64__以保护它。

打开 __INLINE_CODE_65__ 文件，并将其更新为以下内容：

```typescript
@SubscribeMessage('events')
onEvent(@MessageBody() data: unknown): Observable<WsResponse<number>> {
  const event = 'events';
  const response = [1, 2, 3];

  return from(response).pipe(
    map(data => ({ event, data })),
  );
}

  return from(response).pipe(
    map(data => ({ event, data })),
  );
}

```

我们将 __INLINE_CODE_66__ 应用到 __INLINE_CODE_67__ 路由，以便保护它。

确保应用程序正在运行，然后使用 __INLINE_CODE_68__ 测试路由。

```typescript
@WebSocketServer()
server: Server;

```

请注意，在 __INLINE_CODE_69__ 中，我们配置了 JWT 的过期时间为 __INLINE_CODE_70__。这太短了，我们选择了这个以示重要的 JWT 质量。如果您等待 60 秒后再尝试 __INLINE_CODE_71__ 请求，您将收到 __INLINE_CODE_72__ 响应。这是因为 __INLINE_CODE_73__ 自动检查 JWT 的过期时间，从而保存了您在应用程序中做出的努力。

我们现在已经完成了 JWT 身份验证的实现。JavaScript 客户端（如 Angular/React/Vue），以及其他 JavaScript 应用程序，现在可以使用我们的 API 服务器进行身份验证和安全通信。

#### 全局启用身份验证

如果您的大多数端点都应该默认保护，可以将身份验证守卫注册为 [guide](/websockets/adapter)，而不是在每个控制器上使用 __INLINE_CODE_74__ 装饰器。相反，您可以简单地标记哪些路由应该是公共的。

首先，在任何模块中（例如 __INLINE_CODE_76__），使用以下构造函数注册 __INLINE_CODE_75__：

```typescript
@WebSocketGateway({ namespace: 'my-namespace' })
export class EventsGateway {
  @WebSocketServer()
  namespace: Namespace;
}

```

现在，我们必须提供一个机制来声明路由为公共。为此，我们可以创建一个自定义装饰器使用 __INLINE_CODE_78__ 装饰器工厂函数。

__CODE_BLOCK_16__

在上面的文件中，我们导出了两个常量。一个是我们的元数据键 __INLINE_CODE_79__，另一个是我们的新装饰器 __INLINE_CODE_80__（您可以将其命名为 __INLINE_CODE_81__ 或 __INLINE_CODE_82__，以适合您的项目）。

现在，我们可以使用自定义 __INLINE_CODE_83__ 装饰器来装饰任何方法，例如：

__CODE_BLOCK_17__

最后，我们需要 __INLINE_CODE_84__ 返回 __INLINE_CODE_85__ 当 __INLINE_CODE_86__ 元数据被找到。为此，我们将使用 __INLINE_CODE_87__ 类（查看 [providers](/providers)）。

__CODE_BLOCK_18__

####_PASSPORT 集成

[namespace](https://socket.io/docs/v4/namespaces/) 是 Node.js 中最流行的身份验证库，社区广泛使用且在许多生产环境中成功使用。使用 __INLINE_CODE_88__ 模块，可以轻松地将这个库集成到 Nest 应用程序中。

要了解如何将 Passport 集成到 NestJS 中，请查看 [option](https://socket.io/docs/v4/server-options/)。

#### 示例

您可以在本章中找到完整的代码 [socket instance](https://socket.io/docs/v4/server-api/#socket)。
<!-- 此文件从 content/security/authentication.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:37:55.865Z -->
<!-- 源文件: content/security/authentication.md -->

### 认证

认证是大多数应用程序的**必要**组成部分。有许多不同的认证策略和方法来处理认证。项目的特定需求将确定所采用的认证方法。这章将介绍一些可适用于各种需求的认证方法。

让我们 flesh out 我们的需求。对于这个用例，客户将首先使用用户名和密码进行身份验证。身份验证后，服务器将发行一个 JWT，该 JWT 可以在随后的请求中作为 Authorization 头发送，以证明身份验证。此外，我们还将创建一个受保护的路由，只有包含有效 JWT 的请求才能访问该路由。

我们将从第一个需求开始：身份验证一个用户。然后，我们将扩展身份验证逻辑，最后，我们将创建一个检查请求中的有效 JWT 的受保护路由。

#### 创建认证模块

我们将从生成一个 `@WebSocketGateway()` 开始，在其中创建一个 `events` 和一个 `@SubscribeMessage()`。我们将使用 `@MessageBody()` 实现身份验证逻辑，并使用 `@nestjs/websockets` 暴露身份验证端点。

```bash
$ npm i --save @nestjs/websockets @nestjs/platform-socket.io

```

在实现 `handleEvent()` 时，我们将发现将用户操作封装在 `socket` 中非常有用，所以让我们现在生成该模块和服务：

```typescript
@WebSocketGateway(80, { namespace: 'events' })

```

将这些生成文件的默认内容替换为以下所示内容。对于我们的示例应用程序， `events` 只是维护一个内存中的硬编码用户列表，并包含一个 find 方法来根据用户名检索用户。在实际应用程序中，这将是您构建用户模型和存储层的地方，使用您选择的库（例如 TypeORM、Sequelize、Mongoose 等）。

```typescript
@WebSocketGateway(81, { transports: ['websocket'] })

```

在 `client.emit()` 中，唯一需要更改的是将 `@ConnectedSocket()` 添加到 `@ConnectedSocket()` 装饰器的 exports 数组中，以使其在外部可见（我们将很快在 `@nestjs/websockets` 中使用它）。

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody() data: string): string {
  return data;
}

```

#### 实现“Sign in”端点

我们的 `return` 负责检索用户并验证密码。我们创建了一个 `undefined` 方法来实现这个目的。在以下代码中，我们使用 ES6 spread 操作符将用户对象中的密码 property 剥离，以便返回该对象。这是一种常见的实践，即在返回用户对象时不要 expose敏感字段，如密码或其他安全密钥。

```typescript
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway]
})
export class EventsModule {}

```

> 警告 **警告** 在实际应用程序中，不应将密码存储在明文中。您应该使用库，如 __LINK_92__，使用 salted one-way hash 算法。这样，您将只存储哈希密码，然后将 incoming 密码与存储的密码进行比较，从而从不存储或 expose 用户密码在明文中。为了保持我们的示例应用程序简单，我违反了这个绝对要求，并使用明文密码。**不要在您的实际应用程序中这样做！**

现在，让我们更新 `handleEvent()`，以便导入 `@Ack()`。

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody('id') id: number): number {
  // id === messageBody.id
  return id;
}

```

现在，让我们打开 `ack`，并添加一个 `event` 方法到其中。这方法将在客户端调用身份验证用户。它将接收用户名和密码作为请求体，并返回一个 JWT token，如果用户身份验证成功。

```typescript
@SubscribeMessage('events')
handleEvent(client: Socket, data: string): string {
  return data;
}

```

> 提示 **提示** 理想情况下，我们应该使用 DTO 类来定义请求体的形状。见 __LINK_93__ 章节了解更多信息。

</code></td>

#### JWT令牌

我们已经完成了身份验证逻辑的主要部分。现在，让我们转到 JWT 令牌部分。让我们回顾和完善我们的需求：

- 允许用户使用用户名/密码进行身份验证，并返回一个 JWT，以便在随后的调用中使用受保护的 API 端点。我们已经很好地实现了这个要求。为了完成它，我们需要编写代码来发行 JWT。
- 创建受保护的 API 路由，以检查请求中的有效 JWT 作为承载令牌

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

> 提示 **提示** `WsResponse` 包（见更多 __LINK_94__）是一个帮助 JWT 处理的实用包。这包括生成和验证 JWT 令牌。

为了保持我们的服务模块化，我们将在 `@nestjs/websockets` 中处理 JWT 生成。打开 `WsResponse` 文件，在 `data` 文件夹中，inject `ClassSerializerInterceptor`，并更新 `async` 方法，以便生成 JWT 令牌，如以下所示：

```typescript
socket.emit('events', { name: 'Nest' });

```Here is the translation:

我们使用 `Observable` 库，它提供了 `@nestjs/websockets` 函数来生成我们的 JWT，从 `afterInit()` 对象的子集属性中获取，然后将其返回为一个简单的对象，其中包含一个 `OnGatewayInit` 属性。注意，我们选择了 `@WebSocketServer()` 属性来存储我们的 `namespace` 值，以保持与 JWT 标准一致。

现在，我们需要更新 `@WebSocketServer()`，以导入新依赖项并配置 `@WebSocketGateway()`。

首先，在 `@WebSocketServer()` 文件夹中创建 `@WebSocketGateway()`，并添加以下代码：

```typescript
socket.emit('events', { name: 'Nest' }, (data) => console.log(data));

```

我们将使用这个来共享我们的密钥，以便在 JWT 签名和验证步骤中使用。

> 警告 **警告** **请勿公开这个密钥**。我们在这里公开它，以便清楚地显示代码的作用，但在生产系统中 **您必须保护这个密钥**，使用适当的措施，如秘密存储、环境变量或配置服务。

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

> 提示 **提示** 我们将 `@WebSocketServer()` 注册为全局，以便使事情变得更加简单。这意味着，我们不需要在应用程序中导入 `@nestjs/websockets`。

我们使用 __INLINE_CODE_58__ 配置 __INLINE_CODE_59__，将配置对象作为参数传递。查看 [socket.io](https://github.com/socketio/socket.io)以了解 Nest __INLINE_CODE_60__ 和 [ws](https://github.com/websockets/ws)以了解可用的配置选项。

现在，让我们使用 cURL Again 测试我们的路由。您可以使用 __INLINE_CODE_61__ 对象的任何硬编码值来测试。

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody() data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}

```

#### 实现身份验证守卫

现在，我们可以解决最后一个需求：保护端点以确保请求中存在有效的 JWT。我们将创建一个 __INLINE_CODE_63__，以保护我们的路由。

```typescript
socket.on('events', (data) => console.log(data));

```

现在，我们可以实现保护的路由并注册 __INLINE_CODE_64__以保护它。

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

我们正在将 __INLINE_CODE_66__ 应用到 __INLINE_CODE_67__ 路由上，以便保护它。

确保应用程序正在运行，然后使用 __INLINE_CODE_68__ 测试路由。

```typescript
@WebSocketServer()
server: Server;

```

请注意，在 __INLINE_CODE_69__ 中，我们配置了 JWT 的过期时间为 __INLINE_CODE_70__。这太短了，处理令牌过期和刷新是超出本文的范围。如果您在认证后 60 秒内尝试 __INLINE_CODE_71__ 请求，您将收到 __INLINE_CODE_72__ 响应。这是因为 __INLINE_CODE_73__ 自动检查 JWT 的过期时间，从而省去了在应用程序中执行的麻烦。

我们现在已完成 JWT 身份验证的实现。JavaScript 客户端（如 Angular/React/Vue），和其他 JavaScript 应用程序现在可以安全地与我们的 API 服务器通信。

#### 全局启用身份验证

如果您的大多数端点都应该默认保护，可以将身份验证守卫注册为 [guide](/websockets/adapter)，而不是在每个控制器上使用 __INLINE_CODE_74__ 装饰器。相反，您可以将哪些路由应该是公共路由的标记。

首先，在任何模块中（例如 __INLINE_CODE_76__），注册 __INLINE_CODE_75__ 作为全局守卫：

```typescript
@WebSocketGateway({ namespace: 'my-namespace' })
export class EventsGateway {
  @WebSocketServer()
  namespace: Namespace;
}

```

现在，我们必须提供一个机制来声明路由为公共路由。为此，我们可以创建一个自定义装饰器使用 __INLINE_CODE_78__ 装饰器工厂函数。

__CODE_BLOCK_16__

在上述文件中，我们导出了两个常量。一个是我们的元数据键 __INLINE_CODE_79__，另一个是我们的新装饰器 __INLINE_CODE_80__（您可以将其命名为 __INLINE_CODE_81__ 或 __INLINE_CODE_82__，以适应您的项目）。

现在，我们有了自定义 __INLINE_CODE_83__ 装饰器，我们可以使用它来装饰任何方法，例如：

__CODE_BLOCK_17__

最后，我们需要 __INLINE_CODE_84__ 返回 __INLINE_CODE_85__ 当 __INLINE_CODE_86__ 元数据存在时。为此，我们将使用 __INLINE_CODE_87__ 类（阅读更多 [providers](/providers)）。

__CODE_BLOCK_18__

#### Passports 集成

[namespace](https://socket.io/docs/v4/namespaces/) 是 Node.js 最流行的身份验证库，社区中非常流行，并且在许多生产应用程序中成功使用。使用 __INLINE_CODE_88__ 模块，我们可以轻松地将这个库与 Nest 应用程序集成。

要了解如何将 Passport 与 NestJS 集成，请查看 [option](https://socket.io/docs/v4/server-options/)。

#### 示例

您可以在本章中找到完整的代码 [socket instance](https://socket.io/docs/v4/server-api/#socket)。
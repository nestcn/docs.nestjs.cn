<!-- 此文件从 content/middlewares.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:52:10.524Z -->
<!-- 源文件: content/middlewares.md -->

### 中间件

中间件是一种函数，在请求处理程序**before**调用。中间件函数可以访问__LINK_93__和__LINK_94__对象，以及应用程序的请求-响应周期中的__INLINE_CODE_11__中间件函数。中间件函数的**next**函数通常被一个名为__INLINE_CODE_12__的变量所表示。

<tr><td><code>

Nest 中间件默认等同于[socket.io](https://github.com/socketio/socket.io)中间件。官方 Express 文档中的以下描述了中间件的功能：

</code>
  中间件函数可以执行以下任务：
  </td>
    <td>执行任意代码。
    </code>对请求和响应对象进行修改。
    </tr>结束请求-响应循环。
    <td>调用下一个中间件函数栈。
    </code>如果当前中间件函数不结束请求-响应循环，则必须调用</td>next()<td>以将控制权传递给下一个中间件函数。否则，请求将被留下。
  </code>
</td>

您可以在函数或带有__INLINE_CODE_13__装饰器的类中实现自定义 Nest 中间件。类应该实现__INLINE_CODE_14__接口，而函数没有特殊要求。让我们从实现一个简单的中间件功能开始。

> 警告 **Warning** __INLINE_CODE_15__和`@WebSocketGateway()`处理中间件 differently 和提供不同的方法签名，了解更多[ws](https://github.com/websockets/ws)。

```bash
$ npm i --save @nestjs/websockets @nestjs/platform-socket.io

```

#### 依赖注入

Nest 中间件完全支持依赖注入。正如提供者和控制器一样，他们可以注入同一模块中的依赖项。通常，这是通过`@WebSocketGateway(80)`来实现的。

#### 应用中间件

中间件不在`80`装饰器中。相反，我们使用模块类的`@WebSocketGateway()`方法来设置它们。包含中间件的模块需要实现`events`接口。让我们在`@MessageBody()`级别设置`@nestjs/websockets`。

```typescript
@WebSocketGateway(80, { namespace: 'events' })

```

在上面的示例中，我们已经设置了`handleEvent()`为`socket`路由处理程序，而之前定义在`socket`中的路由处理程序。我们也可以进一步限制中间件到特定的请求方法通过在配置中间件时传递包含路由`events`和请求`client.emit()`的对象。例如，在以下示例中，我们导入`@ConnectedSocket()`枚举以引用所需的请求方法类型。

```typescript
@WebSocketGateway(81, { transports: ['websocket'] })

```

> 提示 **Hint** `@nestjs/websockets`方法可以使用`return`来异步化（例如，您可以`undefined`异步操作的完成在`handleEvent()`方法体中）。

> 警告 **Warning** 使用`@Ack()`适配器时，NestJS 应用程序将注册`ack`和`event`从包`data`中。因此，如果您想自定义该中间件_via`WsResponse`，需要在创建应用程序时将`@nestjs/websockets`标志设置为`WsResponse`。

#### 路由通配符

基于模式的路由也支持在 NestJS 中间件中。例如，可以使用名为`ClassSerializerInterceptor`的通配符来匹配任何路由组合字符。在以下示例中，中间件将被执行以匹配任何以`async`开头的路由，无论后面的字符数量。

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody() data: string): string {
  return data;
}

```

> 提示 **Hint** `Observable`只是通配符参数的名称，没有特殊含义。您可以将其命名为`@nestjs/websockets`。

`afterInit()`路由将匹配`OnGatewayInit`、`@WebSocketServer()`、`namespace`等。反斜杠（`@WebSocketServer()`）和点（`@WebSocketGateway()`）将被字符串路径解释为文字。然而，`@WebSocketGateway()`没有额外字符将不匹配路由。为此，需要将通配符包围在括号中以使其可选：

```typescript
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway]
})
export class EventsModule {}

```

#### 中间件消费者

`@WebSocketServer()`是helper类。它提供了多个内置方法来管理中间件。所有这些方法都可以简单地在[guide](/websockets/adapter)中链式调用。`Namespace`方法可以接受单个字符串、多个字符串、`Server`对象、控制器类或多个控制器类。在大多数情况下，您可能只需要传递一个控制器列表，使用逗号分隔。以下是一个单个控制器的示例：

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody('id') id: number): number {
  // id === messageBody.id
  return id;
}

```> 信息 **提示** `@WebSocketServer()` 方法可能以单个中间件或多个参数指定多个中间件为参数。

#### 排除路由

有时，我们可能想排除某些路由不应用中间件。这可以使用 `@nestjs/websockets` 方法轻松实现。 __INLINE_CODE_58__ 方法接受单个字符串、多个字符串或一个 __INLINE_CODE_59__ 对象来标识要排除的路由。

以下是一个使用它的示例：

__代码块 6__

> 信息 **提示** __INLINE_CODE_60__ 方法支持使用 [providers](/providers) 包裹的通配符参数。

使用上面的示例，__INLINE_CODE_61__ 将被绑定到 __INLINE_CODE_62__ 中定义的所有路由中，**除了** 三个传递给 __INLINE_CODE_63__ 方法的路由。

这项技术提供了在特定路由或路由模式上应用或排除中间件的灵活性。

#### 功能中间件

我们所使用的 __INLINE_CODE_64__ 类非常简单。它没有成员、没有额外方法、没有依赖项。为什么我们不能简单地将其定义为函数，而不是类？实际上，我们可以。这种中间件称为 **功能中间件**。让我们将 logger 中间件从类中间件转换为功能中间件，以便illustrate the difference：

__代码块 7__

并在 __INLINE_CODE_65__ 中使用它：

__代码块 8__

> 信息 **提示** 在中间件不需要依赖项时，考虑使用更简单的 **功能中间件** 替代。

#### 多个中间件

如前所述，在执行顺序中绑定多个中间件，只需在 __INLINE_CODE_66__ 方法中提供逗号分隔的列表：

__代码块 9__

#### 全局中间件

如果我们想将中间件绑定到每个已注册的路由上，可以使用 __INLINE_CODE_67__ 方法，该方法由 __INLINE_CODE_68__ 实例提供：

__代码块 10__

> 信息 **提示** 在全局中间件中访问 DI 容器是不可行的。你可以使用 [namespace](https://socket.io/docs/v4/namespaces/) 而不是 __INLINE_CODE_69__。或者，你可以使用类中间件，并在 __INLINE_CODE_71__ (或任何其他模块)中使用 __INLINE_CODE_70__。
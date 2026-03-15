<!-- 此文件从 content/fundamentals/execution-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:59:51.096Z -->
<!-- 源文件: content/fundamentals/execution-context.md -->

### 执行上下文

Nest 提供了一些实用类，可以帮助编写跨多个应用上下文（例如，Nest HTTP 服务器、微服务和 WebSocket 应用上下文）的应用程序。这些实用类提供了当前执行上下文的信息，可以用于构建泛型 __LINK_126__、__LINK_127__ 和 __LINK_128__，这些泛型可以在广泛的控制器、方法和执行上下文下工作。

本章中，我们将涵盖两个这样的类：`@nestjs/websockets` 和 `handleEvent()`。

#### ArgumentsHost 类

`socket` 类提供了用于检索处理程序参数的方法。它允许选择合适的上下文（例如，HTTP、RPC（微服务）或 WebSocket）以检索参数。框架通常在您可能想要访问它的地方提供了 `events` 类的实例，例如在 __LINK_129__ 的 `@ConnectedSocket()` 方法中。`@nestjs/websockets` 简单地作为处理程序参数的抽象层。例如，对于 HTTP 服务器应用程序（当 `return` 被使用时），`undefined` 对象 encapsulates Express 的 `handleEvent()` 数组，其中 `@Ack()` 是请求对象，`ack` 是响应对象，`event` 是控制应用程序请求-响应循环的函数。另一方面，对于 __LINK_130__ 应用程序，`data` 对象包含 `WsResponse` 数组。

#### 当前应用上下文

在构建泛型 __LINK_131__、__LINK_132__ 和 __LINK_133__，这些泛型旨在跨多个应用上下文下运行时，我们需要确定当前方法正在运行的应用类型。使用 `@nestjs/websockets` 方法来确定应用类型：

```bash
$ npm i --save @nestjs/websockets @nestjs/platform-socket.io

```

> info **提示** `data` 是来自 `ClassSerializerInterceptor` 包的。

#### 宿主处理程序参数

要检索处理程序参数的数组，可以使用宿主对象的 `async` 方法。

```typescript
@WebSocketGateway(80, { namespace: 'events' })

```

可以使用 `Observable` 方法根据索引检索特定参数：

```typescript
@WebSocketGateway(81, { transports: ['websocket'] })

```

在这些示例中，我们使用索引检索了请求和响应对象，这不太推荐，因为这将将应用程序耦合到特定的执行上下文中。相反，您可以使用宿主对象的utility 方法来切换到适当的应用上下文，以使您的代码更加健壮和可重用。上下文切换utility 方法见下文。

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody() data: string): string {
  return data;
}

```

让我们使用 `afterInit()` 方法重写前面的示例。`OnGatewayInit` 帮助调用返回适合 HTTP 应用上下文的 `@WebSocketServer()` 对象。`namespace` 对象具有两个有用的方法，可以用于提取所需的对象。我们还使用 Express 类型断言来返回原生 Express 类型对象：

```typescript
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway]
})
export class EventsModule {}

```

类似地，`@WebSocketServer()` 和 `@WebSocketGateway()` 有方法来返回适合微服务和 WebSocket 上下文的对象。下面是 `@WebSocketGateway()` 的方法：

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody('id') id: number): number {
  // id === messageBody.id
  return id;
}

```

下面是 `@WebSocketServer()` 的方法：

```typescript
@SubscribeMessage('events')
handleEvent(client: Socket, data: string): string {
  return data;
}

```

#### ExecutionContext 类

`Namespace` 扩展 `Server`，提供了当前执行过程的详细信息。像 `@WebSocketServer()` 一样，Nest 在您可能需要的地方提供了 `@nestjs/websockets` 类的实例，例如在 __LINK_134__ 的 __INLINE_CODE_58__ 方法中和 __LINK_135__ 的 __INLINE_CODE_59__ 方法中。它提供了以下方法：

```typescript
@SubscribeMessage('events')
handleEvent(
  @MessageBody() data: string,
  @ConnectedSocket() client: Socket,
): string {
  return data;
}

```

__INLINE_CODE_60__ 方法返回将要被调用的处理程序的引用。__INLINE_CODE_61__ 方法返回 __INLINE_CODE_62__ 类的类型，该类是当前处理程序所属的类。例如，在 HTTP 上下文中，如果当前处理的请求是一个 __INLINE_CODE_63__ 请求，绑定到 __INLINE_CODE_64__ 方法的 __INLINE_CODE_65__ 对象上，__INLINE_CODE_66__ 返回 __INLINE_CODE_67__ 方法的引用，__INLINE_CODE_68__ 返回 __INLINE_CODE_69__ **类**（不是实例）。

```typescript
socket.emit('events', { name: 'Nest' });

```

访问当前类和处理程序方法的引用提供了很大的灵活性。最重要的是，它使我们能够访问通过 decorators 创建的元数据或内置 __INLINE_CODE_71__ 装饰器的元数据，从而在 guards 或 interceptors 中访问元数据。我们将在下面涵盖这个用例。

__HTML_TAG_124____HTML_TAG_125__Here is the translated documentation in Chinese:

Nest 提供了通过创建由 __INLINE_CODE_72__ 方法创建的自定义装饰器来将 **自定义元数据** 附加到路由处理程序的能力，同时也提供了内置的 __INLINE_CODE_73__ 装饰器。在本节中，让我们比较这两个方法，并了解如何从守卫或拦截器中访问元数据。

为了使用 __INLINE_CODE_74__ 创建强类型的装饰器，我们需要指定类型参数。例如，让我们创建一个 __INLINE_CODE_75__ 装饰器，该装饰器接受一个字符串数组作为参数。

```typescript
socket.emit('events', { name: 'Nest' }, (data) => console.log(data));

```

 __INLINE_CODE_76__ 装饰器是一个函数，它接受一个类型为 __INLINE_CODE_77__ 的单个参数。

现在，让我们使用这个装饰器。我们简单地将其注解到处理程序上：

```typescript
@SubscribeMessage('events')
handleEvent(
  @MessageBody() data: string,
  @Ack() ack: (response: { status: string; data: string }) => void,
) {
  ack({ status: 'received', data });
}

```

在这里，我们将 __INLINE_CODE_78__ 装饰器元数据附加到 __INLINE_CODE_79__ 方法上，表明只有具有 __INLINE_CODE_80__ 角色的用户才能访问这条路由。

要访问路由的角色（自定义元数据），我们将使用 __INLINE_CODE_81__ 帮助类。 __INLINE_CODE_82__ 可以像正常情况一样被注入到类中：

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody() data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}

```

> 信息 **提示** __INLINE_CODE_83__ 类来自 __INLINE_CODE_84__ 包。

现在，让我们读取处理程序元数据。使用 __INLINE_CODE_85__ 方法：

```typescript
socket.on('events', (data) => console.log(data));

```

 __INLINE_CODE_86__ 方法允许我们轻松地访问元数据，传入两个参数：装饰器引用和一个 **context**（装饰器目标），以从中提取元数据。在这个例子中，指定的 **decorator** 是 __INLINE_CODE_87__（请回顾 __INLINE_CODE_88__ 文件）。上下文由 __INLINE_CODE_89__ 的调用提供，结果是提取当前处理程序的元数据。请记住， __INLINE_CODE_90__ 提供了 **reference** 到路由处理程序函数。

alternatively，我们可以将控制器组织起来，应用元数据到控制器级别，以应用于控制器类中的所有路由。

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

在这种情况下，我们将 __INLINE_CODE_91__ 作为第二个参数（提供控制器类作为元数据提取的上下文）而不是 __INLINE_CODE_92__：

```typescript
@WebSocketServer()
server: Server;

```

考虑以下 scenario，您已经在多个级别提供了 __INLINE_CODE_94__ 元数据。

```typescript
@WebSocketGateway({ namespace: 'my-namespace' })
export class EventsGateway {
  @WebSocketServer()
  namespace: Namespace;
}

```

如果您的意图是指定 __INLINE_CODE_95__ 作为默认角色，并在某些方法中Override它，您将可能使用 __INLINE_CODE_96__ 方法。

__CODE_BLOCK_16__

带有这种代码的守卫，在 __INLINE_CODE_97__ 方法的上下文中，具有上述元数据，将导致 __INLINE_CODE_98__ 包含 __INLINE_CODE_99__。

要获取两个元数据并合并它（这两个方法将合并两个数组和对象），使用 __INLINE_CODE_100__ 方法：

__CODE_BLOCK_17__

这将导致 __INLINE_CODE_101__ 包含 __INLINE_CODE_102__。

对于这两个合并方法，您将传入元数据键作为第一个参数，并将元数据目标上下文（即 __INLINE_CODE_103__ 和/或 __INLINE_CODE_104__ 方法的调用）作为第二个参数。

#### 低级别方法

如前所述，除了使用 __INLINE_CODE_105__ 之外，您还可以使用内置的 __INLINE_CODE_106__ 装饰器将元数据附加到处理程序上。

__CODE_BLOCK_18__

> 信息 **提示** __INLINE_CODE_107__ 装饰器来自 __INLINE_CODE_108__ 包。

在上述构建中，我们将 __INLINE_CODE_109__ 元数据（ __INLINE_CODE_110__ 是元数据键， __INLINE_CODE_111__ 是关联值）附加到 __INLINE_CODE_112__ 方法上。虽然这工作，但是不建议直接在路由中使用 __INLINE_CODE_113__。相反，您可以创建自己的装饰器，如下所示：

__CODE_BLOCK_19__

这个方法更加清洁和可读，且与 __INLINE_CODE_114__ 方法类似。但是，使用 __INLINE_CODE_115__ 您有更好的元数据键和值的控制，并且可以创建装饰器，它们可以接受多个参数。

现在，我们已经创建了一个自定义 __INLINE_CODE_116__ 装饰器，可以将其用作装饰 __INLINE_CODE_117__ 方法。

__CODE_BLOCK_20__

要访问路由的角色（自定义元数据），我们将使用 __INLINE_CODE_118__ 帮助类：

__CODE_BLOCK_21__

> 信息 **提示** __INLINE_CODE_119__ 类来自 __INLINE_CODE_120__ 包。

现在，让我们读取处理程序元数据。使用 __INLINE_CODE_121__ 方法：

__CODE_BLOCK_22__

Note: I have followed the translation guidelines and translated the documentation as per the provided glossary and code block format.以下是在我们的情况下，替代传递装饰器引用，我们将传递元数据**键**作为第一个参数（在我们的情况下是__INLINE_CODE_122__）。其他一切与__INLINE_CODE_123__示例相同。

(Note: I kept the code example and variable names unchanged, and translated the code comments from English to Chinese. I also kept the placeholder __INLINE_CODE_122__ and __INLINE_CODE_123__ exactly as they are in the source text.)
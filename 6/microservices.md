# 微服务

## 基本

除了传统的(有时称为单片)应用程序架构之外，`Nest` 还支持微服务架构风格的开发。本文档中其他地方讨论的大多数概念，如依赖项注入、装饰器、异常过滤器、管道、保护和拦截器，都同样适用于微服务。`Nest` 会尽可能地抽象化实现细节，以便相同的组件可以跨基于 `HTTP` 的平台，`WebSocket` 和微服务运行。本节特别讨论 `Nest` 的微服务方面。
在 `Nest` 中，微服务基本上是一个使用与 `HTTP` 不同的传输层的应用程序。

![](https://docs.nestjs.com/assets/Microservices_1.png)

`Nest` 支持几种内置的传输层实现，称为传输器，负责在不同的微服务实例之间传输消息。大多数传输器本机都支持请求 - 响应和基于事件的消息样式。`Nest` 在规范接口的后面抽象了每个传输器的实现细节，用于请求 - 响应和基于事件的消息传递。这样可以轻松地从一个传输层切换到另一层，例如，利用特定传输层的特定可靠性或性能功能，而不会影响您的应用程序代码。


### 安装

首先，我们需要安装所需的软件包：

```bash
$ npm i --save @nestjs/microservices
```

### 开始

为了创建微服务，我们使用 `NestFactory` 类的 `createMicroservice()` 方法。

> main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(ApplicationModule, {
    transport: Transport.TCP,
  });
  app.listen(() => console.log('Microservice is listening'));
}
bootstrap();
```

?> 默认情况下，微服务通过 **TCP协议** 监听消息。

`createMicroservice ()` 方法的第二个参数是 `options` 对象。此对象可能有两个成员:

|||
|---|---|
| `transport`          | 指定传输器                         |
| `options`            | 确定传输器行为的传输器特定选项对象     |


`options` 对象根据所选的传送器而不同。`TCP` 传输器暴露了下面描述的几个属性。

|||
|---|---|
| `host`                 | 连接主机名                   |
| `port`                 | 连接端口                     |
| `retryAttempts`        | 连接尝试的总数                |
| `retryDelay`           | 连接重试延迟（ms）            |

### 模式（patterns）

微服务通过 **模式** 识别消息。模式是一个普通值，例如对象、字符串。模式将自动序列化，并与消息的数据部分一起通过网络发送。因此，接收器可以容易地将传入消息与相应的处理器相关联。

### 请求-响应


当您需要在各种外部服务之间交换消息时，请求-响应消息样式非常有用。使用此范例，您可以确定服务确实收到了消息(不需要手动实现消息 `ACK` 协议)。然而，请求-响应范式并不总是最佳选择。例如，使用基于日志的持久性的流传输器(如 `Kafka` 或 `NATS` 流)针对解决不同范围的问题进行了优化，更符合事件消息传递范例(有关更多细节，请参阅下面的基于事件的消息传递)。

为了使服务能够通过网络交换数据，`Nest` 创建了两个通道，其中一个负责传输数据，而另一个负责监听传入的响应。对于某些底层传输，比如 `NATS`，这种双通道是支持开箱即用的。对于其他人，`Nest` 通过手动创建单独的渠道进行补偿。 这样做可能会产生开销，因此，如果您不需要请求-响应消息样式，则应考虑使用基于事件的方法。

基本上，要创建一个消息处理程序（基于请求 - 响应范例），我们使用 `@MessagePattern()` ，需要从 `@nestjs/microservices` 包导入。

>  math.controller.ts

```typescript
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class MathController {
  @MessagePattern({ cmd: 'sum' })
  accumulate(data: number[]): number {
    return (data || []).reduce((a, b) => a + b);
  }
}

```
在上面的代码中，`accumulate()` 处理程序正在监听符合 `cmd :'sum'` 模式的消息。模式处理程序采用单个参数，即从客户端传递的 `data` 。在这种情况下，数据是必须累加的数字数组。

### 异步响应

每个模式处理程序都能够同步或异步响应。因此，支持 `async` (异步)方法。

> math.controller.ts

```typescript
@MessagePattern({ cmd: 'sum' })
async accumulate(data: number[]): Promise<number> {
  return (data || []).reduce((a, b) => a + b);
}
```

此外，我们能够返回 [Rx](https://github.com/reactivex/rxjs) `Observable`，因此这些值将被发出，直到流完成。

```typescript
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): Observable<number> {
  return from([1, 2, 3]);
}
```

以上消息处理程序将响应3次(对数组中的每个项)。

### 基于事件

虽然 `request-response` 方法是在服务之间交换消息的理想方法，但是当您的消息样式是基于事件的时（即您只想发布事件而不等待响应时），它不太适合。它会带来太多不必要的开销，而这些开销是完全无用的。例如，您希望简单地通知另一个服务系统的这一部分发生了某种情况。因此，我们也为基于事件的通信提供支持。

为了创建事件处理程序，我们使用 `@EventPattern()`装饰器， 需要 ` @nestjs/microservices` 包导入。

```typescript
@EventPattern('user_created')
async handleUserCreated(data: Record<string, unknown>) {
  // business logic
}
```

该 `handleUserCreated()` 方法正在侦听 `user_created` 事件。事件处理程序接受一个参数，`data` 从客户端传递（在本例中，是一个通过网络发送的事件有效负载）。

### 装饰器

在更复杂的场景中，您可能希望访问关于传入请求的更多信息。例如，对于通配符订阅的 `NATS`，您可能希望获得生产者发送消息的原始主题。同样，在 `Kafka` 中，您可能希望访问消息头。为了做到这一点，你可以使用内置的装饰如下:

```typescript
@MessagePattern('time.us.*')
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}
```

?> `@Payload()`、`@Ctx()` 和 `NatsContext` 需要从 `@nestjs/microservices` 包导入。

### 客户端

 为了交换消息或将事件发布到 `Nest` 微服务，我们使用 `ClientProxy` 类, 它可以通过几种方式创建实例。此类定义了几个方法，例如`send()`（用于请求-响应消息传递）和`emit()`（用于事件驱动消息传递），这些方法允许您与远程微服务通信。使用下列方法之一获取此类的实例。
 
 首先，我们可以使用 `ClientsModule` 暴露的静态`register()` 方法。此方法将数组作为参数，其中每个元素都具有 `name`（这是一种微服务标识符）以及特定于微服务的选项（它与传入 `createMicroservice()`  方法的对象相同）。

 `name`属性充当一个 `injection token`，可以在需要时将其用于注入 `ClientProxy` 实例。`name` 属性的值作为注入标记，可以是任意字符串或`JavaScript`符号，如下所述。
`options` 对象的属性与我们之前在`createmicroservice（）`方法中看到的属性相同。

```typescript
ClientsModule.register([
  { name: 'MATH_SERVICE', transport: Transport.TCP },
]),
```

导入模块之后，我们可以使用 `@Inject()` 装饰器注入`'MATH_SERVICE'`。

```typescript
constructor(
  @Inject('MATH_SERVICE') private readonly client: ClientProxy,
) {}
```

?> `ClientsModule`和 `ClientProxy`类需要从 `@nestjs/microservices` 包导入。

有时候，我们可能需要从另一个服务(比如 `ConfigService` )获取微服务配置，为此，我们可以使用 `ClientProxyFactory` 类来注册一个自定义提供程序(它提供了一个 `ClientProxy` 实例):

```typescript
{
  provide: 'MATH_SERVICE',
  useFactory: (configService: ConfigService) => {
    const mathSvcOptions = configService.getMathSvcOptions();
    return ClientProxyFactory.create(mathSvcOptions);
  },
  inject: [ConfigService],
}
```

?> `ClientProxyFactory` 需要从 `@nestjs/microservices` 包导入 。

另一种选择是使用 `@client()`属性装饰器。

```typescript
@Client({ transport: Transport.TCP })
client: ClientProxy;
```

?> `@Client()` 需要从  `@nestjs/microservices` 包导入 。


但是，使用 `@Client()` 装饰器不是推荐的方法（难以测试，难以共享客户端实例）。

`ClientProxy` 是惰性的。 它不会立即启动连接。 相反，它将在第一个微服务调用之前建立，然后在每个后续调用中重用。 但是，如果您希望将应用程序引导过程延迟到建立连接为止，则可以使用 `OnApplicationBootstrap` 生命周期挂钩内的 `ClientProxy` 对象的 `connect()` 方法手动启动连接。

```typescript
async onApplicationBootstrap() {
  await this.client.connect();
}
```

如果无法创建连接，则该 `connect()` 方法将拒绝相应的错误对象。

### 消息传递

该 `ClientProxy` 公开 `send()` 方法。 此方法旨在调用微服务，并返回带有其响应的 `Observable`。 因此，我们可以轻松地订阅发射的值。

```typescript
accumulate(): Observable<number> {
  const pattern = { cmd: 'sum' };
  const payload = [1, 2, 3];
  return this.client.send<number>(pattern, payload);
}
```

`send()` 函数接受两个参数，`pattern` 和 `payload`。`pattern` 具有 `@MessagePattern()` 修饰符中定义的这个模式，而 `payload` 是我们想要传输到另一个微服务的消息。该方法返回一个`cold Observable`对象，这意味着您必须在消息发送之前显式地订阅它。

### 发布活动

另一种是使用 `ClientProxy` 对象的 `emit()`方法。此方法的职责是将事件发布到消息代理。

```typescript
async publish() {
  this.client.emit<number>('user_created', new UserCreatedEvent());
}
```

该 `emit()`方法有两个参数，`pattern` 和 `payload`。`pattern` 具有 `@MessagePattern()` 修饰符中定义的这个模式，而`payload` 是我们想要传输到另一个微服务的消息。此方法返回一个 `hot Observable`（不同于`send()`方法返回一个 `cold Observable`），这意味着无论您是否显式订阅该 `Observable`，代理都将立即尝试传递事件。

### 作用域

对于不同编程语言背景的人来说，可能会意外地发现，在 `Nest` 中，几乎所有内容都在传入的请求之间共享。例如，我们有一个到数据库的连接池，带有全局状态的单例服务，等等。请记住，`Node.js` 并不遵循`request-response`的多线程无状态模型，在这种模型中，每个请求都由单独的线程处理。因此，对于应用程序来说，使用单例实例是完全安全的。

但是，在某些情况下，当应用程序是基于生命周期的行为时，也存在边界情况，例如 `GraphQL` 应用程序中的每个请求缓存、请求跟踪或多租户。在[这里](/6/fundamentals?id=作用域)学习如何控制范围。

请求作用域的处理程序和提供程序可以使用 `@Inject()` 装饰器结合`CONTEXT` （上下文）令牌注入`RequestContext`:

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { CONTEXT, RequestContext } from '@nestjs/microservices';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(CONTEXT) private readonly ctx: RequestContext) {}
}
```

还提供了对 `RequestContext ` 对象的访问，该对象有两个属性：

```typescript
export interface RequestContext<T = any> {
  pattern: string | Record<string, any>;
  data: T;
}
```

`data` 属性是消息生产者发送的消息有效负载。 `pattern` 属性是用于标识适当的处理程序以处理传入消息的模式。

## Redis

[Redis](https://redis.io/) 传输器实现了发布/订阅消息传递范例，并利用了 `Redis` 的 `Pub/Sub` 特性。 已发布的消息按渠道分类，不知道哪些订阅者（如果有）最终会收到该消息。 每个微服务可以订阅任意数量的渠道。 此外，一次可以订阅多个频道。这意味着如果发布了一条消息，并且没有订阅者对此消息感兴趣，则该消息将被删除并且无法恢复。 因此，您不能保证消息或事件将至少由一项服务处理。 一条消息可以由多个订户订阅（并接收）。


![](https://docs.nestjs.com/assets/Redis_1.png)

### 安装

构建基于 `Redis` 的微服务，请首先安装所需的软件包：

```
$ npm i --save redis
```

### 概述

要使用 `Redis` 传输器，请将以下选项对象传递给 `createMicroservice()` 方法:

> main.ts

```typescript
const app = await NestFactory.createMicroservice(ApplicationModule, {
  transport: Transport.REDIS,
  options: {
    url: 'redis://localhost:6379',
  },
});
```

?> `Transport` 需要从 `@nestjs/microservices` 包导入。

同样，要创建一个客户端实例，我们需要传递一个 `options` 对象，该对象具有与前面在 `createMicroservice()` 方法具有相同的属性。

```typescript
ClientsModule.register([
  {
    name: 'MATH_SERVICE',
    transport: Transport.REDIS,
    options: {
      url: 'redis://localhost:6379',
    }
  },
]),
```

也可以使用其他创建客户端的实例（ `ClientProxyFactory` 或 `@Client()` ）。你可以在[这里](/6/introduction.md)读到。

在更复杂的场景中，您可能希望访问关于传入请求的更多信息。在`Redis` 中，您可以访问 `RedisContext`对象。

```typescript
@MessagePattern('notifications')
getDate(@Payload() data: number[], @Ctx() context: RedisContext) {
  console.log(`Channel: ${context.getChannel()}`);
}
```
?> `@Payload()`， `@Ctx()` 和 `RedisContext` 需要从 `@nestjs/microservices` 包导入.

### 选项

有许多可用的选项可以确定传输器的行为。`Redis` 公开了下面描述的属性。

|                        |                             |
| :--------------------- | :-------------------------- |
| `url`                  | 连接网址                     |
| `retryAttempts`        | 连接尝试的总数                |
| `retryDelay`           | 连接重试延迟（ms）            |

## MQTT

[MQTT](http://mqtt.org/)是一个轻量级消息协议，用于高延迟优化。（译者注：MQTT 协议在智能家居等硬件通信领域十分广泛，是首选协议）

### 安装

在我们开始之前，我们必须安装所需的包：

```
$ npm i --save mqtt
```

### 概览

为了切换到 `MQTT` 传输协议，我们需要修改传递给该 `createMicroservice()` 函数的选项对象。

> main.ts

```typescript
const app = await NestFactory.createMicroservice(ApplicationModule, {
  transport: Transport.MQTT,
  options: {
    host: 'localhost',
    port: 1883,
  },
});
```

?> `Transport` 需要从 `@nestjs/microservices` 包导入。

### 属性

有很多可用的属性可以决定传输器的行为。更多描述请[查看](https://github.com/mqttjs/MQTT.js)。

## NATS

[NATS](https://nats.io) 是一个简单、高性能的开源消息传递系统。

### 安装

在开始之前，我们必须安装所需的软件包:

```
$ npm i --save nats
```

### 概述

为了切换到 **NATS** 传输器，我们需要修改传递到 `createMicroservice()` 方法的选项对象。

> main.ts

```typescript
const app = await NestFactory.createMicroservice(ApplicationModule, {
  transport: Transport.NATS,
  options: {
    url: 'nats://localhost:4222',
  },
});
```

?> `Transport` 需要从 `@nestjs/microservices` 包导入。


### 选项

有许多可用的选项可以确定传输器的行为。它们在 [这里](https://github.com/nats-io/nats.js#connect-options) 有很好的描述。此外，还有一个附加的队列属性，允许您指定服务器应订阅的队列的名称（如果不想使用任何特定队列，请保留未定义的名称）。

## RabbitMQ

[RabbitMQ](https://www.rabbitmq.com/) 是部署最广泛的开源消息代理。

### 安装

在开始之前，我们必须安装所需的包：

```bash
$ npm i --save amqplib amqp-connection-manager
```

### 传输器

为了切换到 `RabbitMQ` 传输器，我们需要修改传递给该 `createMicroservice()` 方法的选项对象。

> main.ts

```typescript
const app = await NestFactory.createMicroservice(ApplicationModule, {
  transport: Transport.RMQ,
  options: {
    urls: [`amqp://localhost:5672`],
    queue: 'cats_queue',
    queueOptions: { durable: false },
  },
});
```

?> `Transport` 需要从 `@nestjs/microservices` 包导入。

### 属性


有许多可用属性可确定传输器行为。

|  |  | 
|---| ----| 
| `urls` | 连接地址 |
| `queue` |	您的服务器将监听的队列名称 |
| `prefetchCount` |	设置通道的预取计数 |
| `isGlobalPrefetchCount`	 | 启用每个通道预取|
| `queueOptions` |	其他队列选项。它们在[这里](https://www.squaremobius.net/amqp.node/channel_api.html#assertQueue)有很好的描述 |
| `socketOptions`	 | 其他`socket`选项。它们在[这里](https://www.squaremobius.net/amqp.node/channel_api.html#socket-options)有很好的描述 |


## gRPC

[gRPC](https://github.com/grpc/grpc-node) 是一个高性能、开源的通用 `RPC` 框架。

### 安装

在开始之前，我们必须安装所需的软件包:

```
$ npm i --save grpc @grpc/proto-loader
```

### 传输器

为了切换到 **gRPC** 传输器，我们需要修改传递到 `createMicroservice()` 方法的选项对象。

> main.ts

```typescript
const app = await NestFactory.createMicroservice(ApplicationModule, {
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, 'hero/hero.proto'),
  },
});
```

!> 该 `join()` 方法使用 import `path` 封装，而 `Transport` 需要从 `@nestjs/microservices` 包导入。

### 选项

|||
|---|---|
| `url`          | 连接网址               |
|`protoLoader`| NPM包名称（如果要使用其他原型加载器） |
| `protoPath`    | 指向 `.proto` 文件的绝对(或相对于根目录)路径 |
|`loader` | @grpc/proto-loader 选项。[了解更多](https://github.com/grpc/grpc-node/tree/master/packages/proto-loader) |
| `package`      | `protobuf` 包名       |
| `credentials`  | 服务器证书([阅读更多](https://grpc.github.io/grpc/node/grpc.ServerCredentials.html))

### 概述

通常，`package` 属性设置 [protobuf](https://developers.google.com/protocol-buffers/docs/proto) 包名称，而 `protoPath` 是 `.proto` 文件的路径。`hero.proto` 文件是使用协议缓冲区语言构建的。

> hero.proto

```
syntax = "proto3";

package hero;

service HeroService {
  rpc FindOne (HeroById) returns (Hero) {}
}

message HeroById {
  int32 id = 1;
}

message Hero {
  int32 id = 1;
  string name = 2;
}
```

在上面的示例中，我们定义了一个 `HeroService`，它暴露了一个 `FindOne()` gRPC处理程序，该处理程序期望 `HeroById` 作为输入并返回一个 `Hero` 消息。为了定义一个能够实现这个 `protobuf` 定义的处理程序，我们必须使用 `@GrpcRoute()` 装饰器。之前的 `@MessagePattern()` 将不再有用。

> hero.controller.ts

```typescript
@GrpcMethod('HeroService', 'FindOne')
findOne(data: HeroById, metadata: any): Hero {
  const items = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Doe' },
  ];
  return items.find(({ id }) => id === data.id);
}
```

!> `@GrpcMethod()` 需要从 `@nestjs/microservices` 包导入 。

`HeroService` 是服务的名称，而 `FindOne` 指向 `FindOne()` `gRPC`处理程序。对应的 `findOne()` 方法接受两个参数，即从调用方传递的 `data` 和存储`gRPC`请求元数据的 `metadata`。

此外，`FindOne` 这里实际上是多余的。如果没有传递第二个参数 `@GrpcMethod()`，`Nest` 将自动使用带有大写首字母的方法名称，例如 `findOne->` `FindOne` 。

> hero.controller.ts

```typescript
@Controller()
export class HeroService {
  @GrpcMethod()
  findOne(data: HeroById, metadata: any): Hero {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}
```

同样，您可能不会传递任何参数。在这种情况下，`Nest` 将使用类名。

> hero.controller.ts

```typescript
@Controller()
export class HeroService {
  @GrpcMethod()
  findOne(data: HeroById, metadata: any): Hero {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}
```

### 客户端

为了创建客户端实例，我们需要使用 `@Client()` 装饰器。

```typescript
@Client({
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, 'hero/hero.proto'),
  },
})
client: ClientGrpc;
```

与前面的例子相比有一点差别。我们没有使用 `ClientProxy` 类，而是使用 `ClientGrpc`。它提供 `getService()` 泛型方法将服务的名称作为参数，并返回其实例(如果可用)。

> hero.controller.ts

```typescript
onModuleInit() {
  this.heroService = this.client.getService<HeroService>('HeroService');
}
```

`heroService` 对象暴露了 `.proto` 文件中定义的同一组方法。注意，所有这些都是 **小写** (为了遵循自然惯例)。基本上，我们的`gRPC` `HeroService` 定义包含 `FindOne()` 函数。这意味着 `heroService` 实例将提供 `findOne()` 方法。

```typescript
interface HeroService {
  findOne(data: { id: number }): Observable<any>;
}
```

所有服务的方法都返回 `Observable`。由于 `Nest` 支持 [RxJS](https://github.com/reactivex/rxjs) 流并且与它们很好地协作，所以我们也可以在 `HTTP` 处理程序中返回它们。

> hero.controller.ts

```typescript
@Get()
call(): Observable<any> {
  return this.heroService.findOne({ id: 1 });
}
```

[这里](https://github.com/nestjs/nest/tree/master/sample/04-grpc) 提供了一个完整的示例。

### gRPC流

`GRPC` 本身支持长期的实时连接（称为流）。 对于诸如聊天，观察或块数据传输之类的服务案例，流可以是非常有用的工具。 您可以在官方文档（[此处](https://grpc.io/docs/guides/concepts/)）中找到更多详细信息。

`Nest` 通过两种可能的方式支持 `GRPC`流处理程序：
- `RxJS Subject + Observable` 处理程序：可用于在`Controller` 内部编写响应或将其传递给 `Subject / Observable`使用者。

- `Pure GRPC` 调用流处理程序:将其传递给某个执行程序非常有用，后者将处理节点标准双工流处理程序的其余分派。

### 主题策略

`@GrpcStreamMethod()` 装饰器将提供功能参数作为 `RxJS Observable`。

```typescript
// Set decorator with selecting a Service definition from protobuf package
// the string is matching to: package proto_example.orders.OrdersService
@GrpcStreamMethod('orders.OrderService')
handleStream(messages: Observable<any>): Observable<any> {
  const subject = new Subject();
  messages.subscribe(message => {
    console.log(message);
    subject.next({
      shipmentType: {
        carrier: 'test-carrier',
      },
    });
  });
  return subject.asObservable();
}
```

为了支持与 `@GrpcStreamMethod()` 装饰器的全双工交互，需要从`Controller` 方法中返回 `RxJS Observable`。

### 纯GRPC调用流处理程序

`@GrpcStreamCall()`装饰器将提供函数参数为 `grpc.ServerDuplexStream`，它支持 `.on('data', callback)`、`.write(message)`或 `.cancel()`之类的标准方法，有关可用方法的完整文档可在此处找到。

```typescript
// Set decorator with selecting a Service definition from protobuf package
// the string is matching to: package proto_example.orders.OrdersService
@GrpcStreamCall('orders.OrderService')
handleStream(stream: any) {
  stream.on('data', (msg: any) => {
    console.log(msg);
    // Answer here or anywhere else using stream reference
    stream.write({
      shipmentType: {
        carrier: 'test-carrier',
      },
    });
  });
}
```

此装饰器不需要提供任何特定的返回参数。 可以像对待任何其他标准流类型一样处理流。


## 异常过滤器

`HTTP`异常过滤器层和相应的微服务层之间的唯一区别在于，不要使用 `HttpException`，而应该使用 `RpcException`。

```typescript
throw new RpcException('Invalid credentials.');
```

?> `RpcException` 需要从 `@nestjs/microservices` 包导入。

Nest将处理抛出的异常，并因此返回具有以下结构的 `error` 对象:

```json
{
  "status": "error",
  "message": "Invalid credentials."
}
```

### 过滤器

**异常过滤器** 的工作方式与主过滤器相同，只有一个小的区别。`catch()` 方法必须返回一个 `Observable`。

> rpc-exception.filter.ts

```typescript
import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    return throwError(exception.getError());
  }
}
```

!> 在使用混合应用程序功能时，不能设置全局的微服务异常过滤器。

下面是一个使用手动实例化 **方法作用域** 过滤器(也可以使用类作用域)的示例:

```typescript
@UseFilters(new ExceptionFilter())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```

### 继承

通常，您将创建完全定制的异常过滤器，以满足您的应用程序需求。但是，当您希望重用已经实现的核心异常过滤器并基于某些因素覆盖行为时，可能会有一些用例。

为了将异常处理委托给基本过滤器，您需要扩展 `BaseExceptionFilter` 并调用继承的 `catch()`方法。此外，必须注入 `HttpServer` 引用并将其传递给 `super()` 调用。

```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    return super.catch(exception, host);
  }
}
```

显然，您应该使用您量身定制的业务逻辑（例如添加各种条件）来增强上述实现。


## 管道

微服务管道和普通管道没有区别。唯一需要注意的是，不要抛出 `HttpException` ，而应该使用 `RpcException`。

?> `RpcException` 类需要从 `@nestjs/microservices` 包导入。

下面是一个使用手动实例化 **方法作用域** 管道(也可以使用类作用域)的示例:

```typescript
@UsePipes(new ValidationPipe())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```

## 守卫

微服守卫和普通守卫没有区别。唯一需要注意的是，不要抛出 `HttpException` ，而应该使用 `RpcException`。

?> `RpcException` 类需要从 `@nestjs/microservices` 包导入。

下面是一个使用 **方法作用域** 作为守卫(也可以使用类作用域)的示例:

```typescript
@UseGuards(AuthGuard)
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```

## 拦截器

常规拦截器和微服务拦截器之间没有区别。下面是一个使用手动实例化 **方法作用域** 拦截器(也可以使用类作用域)的示例:

```typescript
@UseInterceptors(new TransformInterceptor())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```
 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://www.zhihu.com/people/dongcang)  | <img class="avatar-66 rm-style" src="https://pic.downk.cc/item/5f4cafe7160a154a67c4047b.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@Armor](https://github.com/Armor-cn)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/31821714?s=460&v=4">  |  翻译  | 专注于 Java 和 Nest，[@Armor](https://armor.ac.cn/) | 

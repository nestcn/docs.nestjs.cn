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
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
    },
  );
  app.listen(() => console.log('Microservice is listening'));
}
bootstrap();
```

?> 默认情况下，微服务通过 **TCP协议** 监听消息。

`createMicroservice ()` 方法的第二个参数是 `options` 对象。此对象可能有两个成员:

|||
|---|---|
| `transport`   | 指定传输器，例如`Transport.NATS`    |
| `options`     | 确定传输器行为的传输器特定选项对象     |


`options` 对象根据所选的传送器而不同。`TCP` 传输器暴露了下面描述的几个属性。其他传输器（如Redis,MQTT等）参见相关章节。

|||
|---|---|
| `host`   | 连接主机名     |
| `port`   | 连接端口|
| `retryAttempts` | 连接尝试的总数  |
| `retryDelay`    | 连接重试延迟（ms）     |

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
在上面的代码中，`accumulate()` 处理程序正在监听符合 `{cmd :'sum'}` 模式的消息。模式处理程序采用单个参数，即从客户端传递的 `data` 。在这种情况下，数据是必须累加的数字数组。

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

虽然 `request-response` 方法是在服务之间交换消息的理想方法，但是当您的消息样式是基于事件的时（即您只想发布事件而不等待响应时），它不太适合。它会带来太多不必要的开销，而这些开销是完全无用的。例如，您希望简单地通知另一个服务系统的这一部分发生了某种情况。这种情况就适合使用基于事件的消息风格。

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
 
 首先，我们可以使用 `ClientsModule` 暴露的静态`register()` 方法。此方法将数组作为参数，其中每个元素都具有 `name`属性，以及一个可选的`transport`属性（默认是`Transport.TCP`），以及特定于微服务的`options`属性。

 `name`属性充当一个 `injection token`，可以在需要时将其用于注入 `ClientProxy` 实例。`name` 属性的值作为注入标记，可以是任意字符串或`JavaScript`符号，[参考这里](https://docs.nestjs.com/fundamentals/custom-providers#non-class-based-provider-tokens)。

`options` 属性是一个与我们之前在`createMicroservice()`方法中看到的相同的对象。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      { name: 'MATH_SERVICE', transport: Transport.TCP },
    ]),
  ]
  ...
})
```

导入模块之后，我们可以使用 `@Inject()` 装饰器将`'MATH_SERVICE'`注入`ClientProxy`的一个实例。

```typescript
constructor(
  @Inject('MATH_SERVICE') private client: ClientProxy,
) {}
```

?> `ClientsModule`和 `ClientProxy`类需要从 `@nestjs/microservices` 包导入。

有时候，我们可能需要从另一个服务(比如 `ConfigService` )获取微服务配置而不是硬编码在客户端程序中，为此，我们可以使用 `ClientProxyFactory` 类来注册一个[自定义提供程序](https://docs.nestjs.com/techniques/custom-providers),这个类有一个静态的`create()`方法，接收传输者选项对象，并返回一个自定义的 `ClientProxy` 实例:

```typescript
@Module({
  providers: [
    {
      provide: 'MATH_SERVICE',
      useFactory: (configService: ConfigService) => {
        const mathSvcOptions = configService.getMathSvcOptions();
        return ClientProxyFactory.create(mathSvcOptions);
      },
      inject: [ConfigService],
    }
  ]
  ...
})
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

### 发送消息

该 `ClientProxy` 公开 `send()` 方法。 此方法旨在调用微服务，并返回带有其响应的 `Observable`。 因此，我们可以轻松地订阅发射的值。

```typescript
accumulate(): Observable<number> {
  const pattern = { cmd: 'sum' };
  const payload = [1, 2, 3];
  return this.client.send<number>(pattern, payload);
}
```

`send()` 函数接受两个参数，`pattern` 和 `payload`。`pattern` 具有 `@MessagePattern()` 修饰符中定义的这个模式，而 `payload` 是我们想要传输到另一个微服务的消息。该方法返回一个`cold Observable`对象，这意味着您必须在消息发送之前显式地订阅它。

### 发布事件

另一种是使用 `ClientProxy` 对象的 `emit()`方法。此方法的职责是将事件发布到消息代理。

```typescript
async publish() {
  this.client.emit<number>('user_created', new UserCreatedEvent());
}
```

该 `emit()`方法有两个参数，`pattern` 和 `payload`。`pattern` 具有 `@EventPattern()` 修饰符中定义的这个模式，而`payload` 是我们想要传输到另一个微服务的消息。此方法返回一个 `hot Observable`（不同于`send()`方法返回一个 `cold Observable`），这意味着无论您是否显式订阅该 `Observable`，代理都将立即尝试传递事件。

### 作用域

对于不同编程语言背景的人来说，可能会意外地发现，在 `Nest` 中，几乎所有内容都在传入的请求之间共享。例如，我们有一个到数据库的连接池，带有全局状态的单例服务，等等。请记住，`Node.js` 并不遵循`request-response`的多线程无状态模型，在这种模型中，每个请求都由单独的线程处理。因此，对于应用程序来说，使用单例实例是完全安全的。

但是，在某些情况下，当应用程序是基于生命周期的行为时，也存在边界情况，例如 `GraphQL` 应用程序中的每个请求缓存、请求跟踪或多租户。在[这里](/7/fundamentals)学习如何控制范围。

请求作用域的处理程序和提供程序可以使用 `@Inject()` 装饰器结合`CONTEXT` （上下文）令牌注入`RequestContext`:

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { CONTEXT, RequestContext } from '@nestjs/microservices';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(CONTEXT) private readonly ctx: RequestContext) {}
}
```

还提供了对 `RequestContext` 对象的访问，该对象有两个属性：

```typescript
export interface RequestContext<T = any> {
  pattern: string | Record<string, any>;
  data: T;
}
```

`data` 属性是消息生产者发送的消息有效负载。 `pattern` 属性是用于标识适当的处理程序以处理传入消息的模式。

### 处理超时

在分布式系统中，有时微服务可能宕机或者无法访问。要避免无限等待，可以使用超时，超时是一个和其他服务通讯的可信赖的方法。要在微服务中应用超时，你可以使用`RxJS`超时操作符。如果微服务没有在指定时间内返回响应，会抛出异常以便正确捕获与处理。

要处理该问题，可以使用`[rxjs](https://github.com/ReactiveX/rxjs)`包，并在管道中使用`timeout`操作符。

```TypeScript
this.client
      .send<TResult, TInput>(pattern, data)
      .pipe(timeout(5000))
      .toPromise();
```
?> `timeout`操作符从`rxjs/operators`中引入

5秒后，如果微服务没有响应，将抛出错误。

## Redis

[Redis](https://redis.io/) 传输器实现了[Pub/Sub(发布/订阅)](https://redis.io/topics/pubsub)消息传递范例，并利用了 `Redis` 的 `[Pub/Sub](https://redis.io/topics/pubsub)` 特性。 已发布的消息按渠道分类，不知道哪些订阅者（如果有）最终会收到该消息。 每个微服务可以订阅任意数量的渠道。 此外，一次可以订阅多个频道。这意味着如果发布了一条消息，并且没有订阅者对此消息感兴趣，则该消息将被删除并且无法恢复。 因此，您不能保证消息或事件将至少由一项服务处理。 一条消息可以由多个订户订阅（并接收）。


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


### 选项

有许多可用的选项可以确定传输器的行为。`Redis` 公开了下面描述的属性。

|   | |
| :--------------------- | :-------------------------- |
| `url`    | 连接网址|
| `retryAttempts` | 连接尝试的总数  |
| `retryDelay`    | 连接重试延迟（ms）     |

[Redis](https://www.npmjs.com/package/redis#options-object-properties)客户端支持的所有属性该传输器都支持。

### 客户端

像其他微服务传输器一样，你可以在创建`ClientProxy`实例时传输[一些选项](https://docs.nestjs.com/microservices/basics#client)。

一种来创建实例的方法是使用`ClientsModule`。要使用`ClientsModule`创建一个客户端实例，引入并使用`register()`方法并传递一个 `options` 对象，该对象具有与前面在 `createMicroservice()` 方法具有相同的属性。`name`属性被用于注入`token`，更多关于`ClientsModule`内容参见[这里](https://docs.nestjs.com/microservices/basics#client)。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.REDIS,
        options: {
          url: 'redis://localhost:6379',
        }
      },
    ]),
  ]
  ...
})
```

也可以使用其他创建客户端的实例（ `ClientProxyFactory` 或 `@Client()` ）。

### 上下文

在更复杂的场景中，您可能希望访问关于传入请求的更多信息。在`Redis` 中，您可以访问 `RedisContext`对象。

```typescript
@MessagePattern('notifications')
getDate(@Payload() data: number[], @Ctx() context: RedisContext) {
  console.log(`Channel: ${context.getChannel()}`);
}
```

?> `@Payload()`， `@Ctx()` 和 `RedisContext` 需要从 `@nestjs/microservices` 包导入.

## MQTT

[MQTT](http://mqtt.org/)是一个开源的轻量级消息协议，用于高延迟优化。该协议提供了一个可扩展的低开销的方式，使用`publish/subscribe`模式连接设备。一个基于MQTT协议的通讯系统由发布服务器，中间人和一个或多个客户端组成。它设计为应用于受限制的设备和低带宽、高延迟或不可信任的网络中。

### 安装

在我们开始之前，我们必须安装所需的包：

```
$ npm i --save mqtt
```

### 概览

为了切换到 `MQTT` 传输协议，我们需要修改传递给该 `createMicroservice()` 函数的选项对象。

> main.ts

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(ApplicationModule, {
  transport: Transport.MQTT,
  options: {
    url: 'mqtt://localhost:1883',
  },
});
```

?> `Transport` 枚举需要从 `@nestjs/microservices` 包导入。

### 选项

有很多可用的`options`对象可以决定传输器的行为。更多描述请[查看](https://github.com/mqttjs/MQTT.js)。

### 客户端

像其他微服务传输器一样，你可以在创建`ClientProxy`实例时传输[一些选项](https://docs.nestjs.com/microservices/basics#client)。

一种来创建实例的方法是使用`ClientsModule`。要使用`ClientsModule`创建一个客户端实例，引入并使用`register()`方法并传递一个 `options` 对象，该对象具有与前面在 `createMicroservice()` 方法具有相同的属性。`name`属性被用于注入`token`，更多关于`ClientsModule`内容参见[这里](https://docs.nestjs.com/microservices/basics#client)。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.MQTT,
        options: {
          url: 'mqtt://localhost:1883',
        }
      },
    ]),
  ]
  ...
})
```

也可以使用其他创建客户端的实例（ `ClientProxyFactory` 或 `@Client()` ）。

### 上下文

在更复杂的场景中，您可能希望访问关于传入请求的更多信息。在`MQTT` 中，您可以访问 `MqttContext`对象。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}
```

?> `@Payload()`， `@Ctx()` 和 `MqttContext` 需要从 `@nestjs/microservices` 包导入.

### 通配符

一个订阅可能是一个显式的`topic`或者包含通配符，`+`和`#`两个通配符可以用在这里，`+`表示单层通配符而 `#`表示多层通配符，可以涵盖很多`topic`层次。

```typescript
@MessagePattern('sensors/+/temperature/+')
getTemperature(@Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}
```
## NATS

[NATS](https://nats.io) 是一个简单、高性能的云应用原生、物联网和微服务架构应用的开源消息系统。`NATS`服务器使用`Go`语言编写，但客户端可以通过各种主流语言与服务器交互。`NATS`支持最多一次和最少一次的传输。可以在任何地方运行，从大型服务器和云实例到边缘网关甚至物联网设备都能运行。

### 安装

在开始之前，我们必须安装所需的软件包:

```
$ npm i --save nats
```

### 概述

为了切换到 **NATS** 传输器，我们需要修改传递到 `createMicroservice()` 方法的选项对象。

> main.ts

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(ApplicationModule, {
  transport: Transport.NATS,
  options: {
    url: 'nats://localhost:4222',
  },
});
```

?> `Transport` 需要从 `@nestjs/microservices` 包导入。

### 选项

`options`对象和选择的传输器有关，`NATS`传输器暴露了一些属性，见[这里](https://github.com/nats-io/node-nats#connect-options)，它还有一个额外的`queue`属性，允许你指定要从服务器订阅的队列名称。(如果要忽略该配置可以设置为`undefined`)。

### 客户端

像其他微服务传输器一样，你可以在创建`ClientProxy`实例时传输[一些选项](https://docs.nestjs.com/microservices/basics#client)。

一种来创建实例的方法是使用`ClientsModule`。要使用`ClientsModule`创建一个客户端实例，引入并使用`register()`方法并传递一个 `options` 对象，该对象具有与前面在 `createMicroservice()` 方法具有相同的属性。`name`属性被用于注入`token`，更多关于`ClientsModule`内容参见[这里](https://docs.nestjs.com/microservices/basics#client)。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.NATS,
        options: {
          url: 'nats://localhost:4222',
        }
      },
    ]),
  ]
  ...
})
```

也可以使用其他创建客户端的实例（ `ClientProxyFactory` 或 `@Client()` ）。

### 请求-响应


请求-响应消息风格下，NATS使用内置的[请求-应答(Request-Reply](https://docs.nats.io/nats-concepts/reqreply)机制。一个给定主题(subject)发布的请求携带着答复主题，监听该主题的响应者将响应发送给答复主题(reply subject)。答复主题一般来说是个称为`_INBOX`的主题，无论位于何处，它都将动态地直接返回给请求者。

### 基于事件

基于事件的风格下，NATS使用内置的[发布-订阅(Publish-Subscribe)](https://docs.nats.io/nats-concepts/pubsub)机制。发布者发布一个基于主题的消息，该消息的订阅者都会收到此消息。订阅者也可以通过通配符来实现类似正则表达式的订阅。这种一对多的模式有时被称为扇出(fan-out)。

### 队列分类

NATS提供了一个内置的平衡特性叫做[分布式队列](https://docs.nats.io/nats-concepts/queue)。如下使用`queue`属性创建一个队列订阅。

```typescript
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.NATS,
  options: {
    url: 'nats://localhost:4222',
    queue: 'cats_queue',
  },
});
```

### 上下文

在更复杂的场景中，您可能希望访问关于传入请求的更多信息。在`NATS` 中，您可以访问 `NatsContext`对象。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`);
}
```

?> `@Payload()`， `@Ctx()` 和 `NatsContext` 需要从 `@nestjs/microservices` 包导入.

### 通配符

订阅可以是确定的或者包含通配符的。

```typescript
@MessagePattern('time.us.*')
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}
```

## RabbitMQ

[RabbitMQ](https://www.rabbitmq.com/) 是一个开源的轻量级消息代理，支持多种消息协议。它可以通过分布式部署、联合配置来满足高弹性、高可用性的需求。此外，它是部署最广泛的开源消息代理，在全球范围内从初创企业到大企业都在使用。

### 安装

在开始之前，我们必须安装所需的包：

```bash
$ npm i --save amqplib amqp-connection-manager
```

### 概述

为了使用 **RabbitMQ** 传输器，传递以下选项对象到 `createMicroservice()` 方法。

> main.ts

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://localhost:5672'],
    queue: 'cats_queue',
    queueOptions: {
      durable: false
    },
  },
});
```

?> `Transport` 需要从 `@nestjs/microservices` 包导入。

### 选项

`options`对象和选择的传输器有关，`RabbitMQ`传输器暴露了一些属性:

 -| -
---|---
urls|连接urls
queue|服务器要监听的队列名称
prefetchCount|频道预读取的数量
isGlobalPrefetchCount|使能预读取的频道
noAck|设置为`false`以启用手动确认模式
queueOptions|额外的队列选项([更多](https://www.squaremobius.net/amqp.node/channel_api.html#channel_assertQueue))
socketOptions|额外的socket选项([更多](https://www.squaremobius.net/amqp.node/channel_api.html#socket-options))


### 客户端

像其他微服务传输器一样，你可以在创建`ClientProxy`实例时传输[一些选项](https://docs.nestjs.com/microservices/basics#client)。

一种来创建实例的方法是使用`ClientsModule`。要使用`ClientsModule`创建一个客户端实例，引入并使用`register()`方法并传递一个 `options` 对象，该对象具有与前面在 `createMicroservice()` 方法具有相同的属性。`name`属性被用于注入`token`，更多关于`ClientsModule`内容参见[这里](https://docs.nestjs.com/microservices/basics#client)。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'cats_queue',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ]
  ...
})
```

也可以使用其他创建客户端的实例（ `ClientProxyFactory` 或 `@Client()` ）。

### 上下文

在更复杂的场景中，您可能希望访问关于传入请求的更多信息。在`RabbitMQ` 中，您可以访问 `RmqContext`对象。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(`Pattern: ${context.getPattern()}`);
}
```

?> `@Payload()`， `@Ctx()` 和 `RedisContext` 需要从 `@nestjs/microservices` 包导入.

要实用原生的`RabbitMQ`消息(包含`properties`, `fields`, 和`content`), 使用 `RmqContext`对象的`getMessage()`方法：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(context.getMessage());
}
```
要获取`RabbitMQ`频道的引用，使用`RmqContext`对象的`getChannelRef`方法。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(context.getChannelRef());
}
```

### 消息确认

要确保消息没有丢失，RabbitMQ支持[消息确认](https://www.rabbitmq.com/confirms.html)。消息确认是指消费者发回给RabbitMQ确认消息已收到，RabbitMQ可以删除它了。如果消费者不工作（频道关闭，连接关闭或者TCP连接丢失）也没有发送确认，RabbitMQ会认为消息没有被处理，因此会重新将其加入队列。

要使能手动消息确认模式，将`noAck`设置为`false`:

```typescript
options: {
  urls: ['amqp://localhost:5672'],
  queue: 'cats_queue',
  noAck: false,
  queueOptions: {
    durable: false
  },
},
```

当手动消费者确认开启时，我们必须从工作者到到信号发送一个合适的确认信息，以表示我们已经完成了一件工作。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  const channel = context.getChannelRef();
  const originalMsg = context.getMessage();

  channel.ack(originalMsg);
}
```

## kafka

[Kafka](https://kafka.apache.org/) 是一个由Apache软件基金会开源的一个高吞吐量的分布式流处理平台, 它具有三个关键特性:

- 可以允许你发布和订阅消息流。
- 可以以容错的方式记录消息流。
- 可以在消息流记录产生时就进行处理。

Kafka 致力于提供一个处理实时数据的统一 、高吞吐量、 低延时的平台。 它在处理实时数据分析时可以与Apache Storm 和 Spark完美集成。

**Kafka 传输器是实验性的.**

### 安装

要开始构建基于Kafka的微服务首先需要安装所需的依赖:

```bash
$ npm i --save kafkajs
```

### 概述

类似其他微服务传输器层的实现，要使用kafka传输器机制，你需要像下面的示例一样给`createMicroservice()`方法传递指定传输器`transport`属性和可选的`options`属性。

> main.ts

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['localhost:9092'],
    }
  }
});
```
?> `Transport`枚举 需要从 `@nestjs/microservices` 包导入。

### 选项

`options`对象和选择的传输器有关，`Kafka`传输器暴露了一些属性:

 -| -
---|---
client|客户端配置选项([参见这里](https://kafka.js.org/docs/configuration))
consumer|消费者配置选项([参见这里](https://kafka.js.org/docs/consuming#a-name-options-a-options))
run|运行配置选项([参见这里](https://kafka.js.org/docs/consuming))
subscribe|订阅配置选项([参见这里](https://kafka.js.org/docs/consuming#frombeginning))
producer|生产者配置选项([参见这里](https://kafka.js.org/docs/producing#options))
send|发送配置选项([参见这里](https://kafka.js.org/docs/producing#options))

### 客户端

`Kafka`和其他微服务传送器有一点不同的是，我们需要用`ClientKafka`类替换`ClientProxy` 类。

像其他微服务一样，创建`ClientKafka`实例也有几个可[选项](https://docs.nestjs.com/microservices/basics#client)。

一种方式创建客户端实例我们需要用到`ClientsModule`方法。 为了通过`ClientsModule`创建客户端实例，导入`register()` 方法并且传递一个和上面`createMicroservice()`方法一样的对象以及一个`name`属性，它将被注入为token。了解更多关于[ClientsModule](https://docs.nestjs.com/microservices/basics#client)。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'HERO_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'hero',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'hero-consumer'
          }
        }
      },
    ]),
  ]
  ...
})
```

另一种方式建立客户端 ( `ClientProxyFactory`或者`@Client()`) 也可以正常使用。 

为了创建客户端实例，我们需要使用 `@Client()` 装饰器。

```typescript
@Client({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'hero',
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'hero-consumer'
    }
  }
})
client: ClientKafka;
```

### 消息订阅响应

`ClientKafka`类提供了一个`subscribeToResponseOf()`方法，该方法会将获取请求的主题名称作为参数并将派生的答复主题加入到答复主题的集合中。这个函数在执行消息模式时是必须的。

>heroes.controller.ts
```typescript
onModuleInit() {
  this.client.subscribeToResponseOf('hero.kill.dragon');
}
```

如果`ClientKafka` 实例是异步创建的, `subscribeToResponseOf()`函数必须在`connect()`函数之前被调用。

>heros.controller.ts
```typescript
async onModuleInit() {
  this.client.subscribeToResponseOf('hero.kill.dragon');
  await this.client.connect();
}
```

### 消息模式
`Kafka`消息模式利用两个主题来请求和答复通道。`ClientKafka#send()`方法通过关联[相关ID](https://www.enterpriseintegrationpatterns.com/patterns/messaging/CorrelationIdentifier.html)发送带有[返回地址](https://www.enterpriseintegrationpatterns.com/patterns/messaging/ReturnAddress.html)的消息，答复主题，带有请求信息的答复分区。
这要求在发送消息之前，`ClientKafka`实例需要订阅答复主题并至少分配一个分区。

随后，您需要为每个运行的Nest应用程序至少有一个答复主题分区。例如，如果您正在运行4个Nest应用程序，但是答复主题只有3个分区，则尝试发送消息时，其中1个Nest应用程序将会报错。

当启动新的`ClientKafka`实例时，它们将加入消费者组并订阅各自的主题。此过程触发一个主题分区的再平衡并分配给消费者组中的消费者。

通常，主题分区是使用循环分区程序分配的，该程序将主题分区分配给按消费者名称排序的消费者集合，消费者名称是在应用程序启动时随机设置的。但是，当新消费者加入该消费者组时，该新消费者可以位于消费者集合中的任何位置。这就创造了这样一种条件，即当现有消费者位于新消费者之后时，可以为现有消费者分配不同的分区。结果，分配了不同分区的消费者将丢失重新平衡之前发送的请求的响应消息。


为了防止`ClientKafka`使用者丢失响应消息，使用了Nest特定的内置自定义分区程序。这个自定义分区程序将分区分配给一组消费者，这些消费者按照在应用程序启动时设置的高精度的时间戳(`process.hrtime()`)进行排序。

### 传入(Incoming)

Nest将会接收传入的`Kafka`消息作为具有键，值和头属性（其值为Buffer类型）的对象。然后，Nest通过`Buffer`转换为字符串来解析这些值。如果字符串是可被序列化的，Nest会把字符串解析为`JSON`并将该值传递到其关联的处理程序。

### 传出(Outgoing)

在发布事件或发送消息时，Nest将在序列化过程之后发送传出的`Kafka`消息。这发生在传递给`ClientKafka`的`emit()`和`send()`方法的参数上，或从`@MessagePattern`方法的返回值上。该序列化通过使用`JSON.stringify()`或`toString()`原型方法来“字符串化”不是字符串或缓冲区的对象。

>heroes.controller.ts
```typescript
@Controller()
export class HeroesController {
  @MessagePattern('hero.kill.dragon')
  killDragon(@Payload() message: KillDragonMessage): any {
    const dragonId = message.dragonId;
    const items = [
      { id: 1, name: 'Mythical Sword' },
      { id: 2, name: 'Key to Dungeon' },
    ];
    return items;
  }
}
```

?> `@Payload()` 需要从 `@nestjs/microservices` 中导入.

传出的消息也可以通过传递带有`key`和`value`属性的对象来键入。密钥消息对于满足[共同分区要求](https://docs.confluent.io/current/ksql/docs/developer-guide/partition-data.html#co-partitioning-requirements)很重要。

>heroes.controller.ts
```typescript
@Controller()
export class HeroesController {
  @MessagePattern('hero.kill.dragon')
  killDragon(@Payload() message: KillDragonMessage): any {
    const realm = 'Nest';
    const heroId = message.heroId;
    const dragonId = message.dragonId;

    const items = [
      { id: 1, name: 'Mythical Sword' },
      { id: 2, name: 'Key to Dungeon' },
    ];

    return {
      headers: {
        realm
      },
      key: heroId,
      value: items
    }
  }
}
```
此外，以这种格式传递的消息还可以包含在自定义头中设置`headers`哈希属性值。 `headers`哈希属性值必须为`string`类型或`buffer`类型。

>heroes.controller.ts
```typescript
@Controller()
export class HeroesController {
  @MessagePattern('hero.kill.dragon')
  killDragon(@Payload() message: KillDragonMessage): any {
    const realm = 'Nest';
    const heroId = message.heroId;
    const dragonId = message.dragonId;

    const items = [
      { id: 1, name: 'Mythical Sword' },
      { id: 2, name: 'Key to Dungeon' },
    ];

    return {
      headers: {
        kafka_nestRealm: realm
      },
      key: heroId,
      value: items
    }
  }
}

```

### 上下文

在更复杂的方案中，您可能需要访问有关传入请求的更多信息。 使用Kafka传输器时，您可以访问`KafkaContext`对象。

```typescript
@MessagePattern('hero.kill.dragon')
killDragon(@Payload() message: KillDragonMessage, @Ctx() context: KafkaContext) {
  console.log(`Topic: ${context.getTopic()}`);
}
```

?>`@Payload()`, `@Ctx()` 和 `KafkaContext` 需要从 `@nestjs/microservices` 包导入.

为了访问`Kafka`原生的 `IncomingMessage`对象，需要像下面的示例一样使用`KafkaContext`的`getMessage()`方法。

```typescript
@MessagePattern('hero.kill.dragon')
killDragon(@Payload() message: KillDragonMessage, @Ctx() context: KafkaContext) {
  const originalMessage = context.getMessage();
  const { headers, partition, timestamp } = originalMessage;
}
```

`IncomingMessage`实现了以下的接口:

```typescript
interface IncomingMessage {
  topic: string;
  partition: number;
  timestamp: string;
  size: number;
  attributes: number;
  offset: string;
  key: any;
  value: any;
  headers: Record<string, any>;
}

```

### 命名约定

`Kafka`微服务组件将其各自角色的描述附加到`client.clientId`和`consumer.groupId`选项上，以防止Nest微服务客户端和服务器组件之间发生冲突。默认情况下，`ClientKafka`组件和`ServerKafka`组件将各自分别附加`-client`和`-server`到各自的选项中。请注意下面提供的值如何以这种方式转换（如注释中所示）。

>main.ts

```typescript
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'hero', // hero-server
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'hero-consumer' // hero-consumer-server
    },
  }
});
```

对于客户端:

>heroes.controller.ts

```typescript
@Client({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'hero', // hero-client
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'hero-consumer' // hero-consumer-client
    }
  }
})
client: ClientKafka;
```

?> 可以通过在您自己的自定义的提供者中扩展`ClientKafka`和`KafkaServer`并通过覆盖构造函数来自定义`Kafka`客户端口和使用者命名约定。

由于`Kafka`微服务的消息模式将两个主题用于请求和回复通道，因此应从请求主题中获得一个回复模式。默认情况下，回复主题的名称是请求主题名称和`.reply`的组合。

>heroes.controller.ts

```typescript
onModuleInit() {
  this.client.subscribeToResponseOf('hero.get'); // hero.get.reply
}
```

?> 可以通过在您自己的自定义的提供者中扩展`ClientKafka`并通过覆盖`getResponsePatternName`方法来自定义`Kafka`答复主题的命名约定。

## gRPC

[gRPC](https://github.com/grpc/grpc-node) 是一个现代的、高性能RPC框架，可以运行在任何环境下。它可以有效在数据中心之间连接服务，并通过插件支持负载平衡、跟踪、健康诊断和授权。

和很多RPC系统一样，gRPC基于可以定义远程调用的函数（方法）的概念。针对每个方法，定义一个参数并返回类型。服务、参数和返回类型在`.proto`文件中定义，使用谷歌的开源语言——中性[协议缓存(protocol buffers)](https://developers.google.com/protocol-buffers)机制。

使用gRPC传输器，Nest使用`.proto`文件来动态绑定客户端和服务以简化远程调用并自动序列化和反序列化结构数据。

### 安装

在开始之前，我们必须安装所需的软件包:

```
$ npm i --save grpc @grpc/proto-loader
```
### 概述

类似其他微服务传输器层的实现，要使用gRPC传输器机制，你需要像下面的示例一样给`createMicroservice()`方法传递指定传输器`transport`属性和可选的`options`属性。

> main.ts

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, 'hero/hero.proto'),
  },
});
```
?> `join()`函数需要从`path`包导入，`Transport`枚举 需要从 `@nestjs/microservices` 包导入。

### 选项

**gRPC**传输器选项暴露了以下属性。

|||
|---|---|
package|`Protobuf`包名称(与.proto文件定义的相匹配)。必须的
protoPath|`.proto`文件的绝对或相对路径，必须的。
url|连接url，字符串，格式为`ip address/dns name:port` (例如, 'localhost:50051') 定义传输器连接的地址/端口，可选的。默认为'localhost:5000'
protoLoader|用来调用`.proto`文件的NPM包名，可选的，默认为'@grpc/proto-loader'
loader|	`@grpc/proto-loader`选项。可以控制`.proto`文件更多行为细节，可选的。[参见这里](https://github.com/grpc/grpc-node/blob/master/packages/proto-loader/README.md)。
credentials|服务器凭证，可选的。([参见更多](https://grpc.io/grpc/node/grpc.ServerCredentials.html))


### 示例`gRPC`服务


我们定义`HeroesService`示例gRPC服务。在上述的`options`对象中， `protoPath` 是设置`.proto`定义文件`hero.proto`的路径。`hero.proto` 文件是使用协议缓冲区语言构建的。

> hero.proto

```proto
syntax = "proto3";

package hero;

service HeroesService {
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

在上面的示例中，我们定义了一个 `HeroService`，它暴露了一个 `FindOne()` gRPC处理程序，该处理程序期望 `HeroById` 作为输入并返回一个 `Hero` 消息(协议缓冲语言使用`message`元素定义参数类型和返回类型)。

接下来，需要实现这个服务。如下在控制器中使用`@GrpcMethod()`装饰器来定义一个满足要求的处理程序。这个装饰器提供了要声明gRPC服务方法的元数据。

?> 之前章节中介绍的`@MessagePattern()`装饰器([阅读更多](https://docs.nestjs.com/microservices/basics#request-response))在基于gRPC的微服务中不适用。基于gPRC的微服务使用`@GrpcMethod()`装饰器。

> hero.controller.ts

```typescript
@Controller()
export class HeroesController {
  @GrpcMethod('HeroesService', 'FindOne')
  findOne(data: HeroById, metadata: Metadata, call: ServerUnaryCall<any>): Hero {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}
```

!> `@GrpcMethod()` 需要从 `@nestjs/microservices` 包导入 。`Metadata`和`ServerUnaryCall`从`grpc`导入。

上述装饰器有两个参数。第一个是服务名称(例如`HeroesService`)，对应在`hero.proto`文件中定义的`HeroesService`，第二个（字符串`FindOne`）对应`hero.proto`文件中`HeroesService`内定义的`FindOne()`方法。

`findone()`处理程序方法有三个参数，`data`从调用者中传递，`metadata`保存了gRPC需要的元数据，`call`用于获取`GrpcCall`对象属性，例如`sendMetadata`以像客户端发送元数据。

`@GrpcMethod()`装饰器两个参数都是可选的，如果不指定第二个参数(例如`FindOne`),Nest会自动将`.proto`文件中的rpc方法与处理程序相关联，并将rpc处理程序名称转换为大写骆驼格式（例如，`findOne`处理器与`FindOne`rpc调用定义关联），如下：

> hero.controller.ts

```typescript
@Controller()
export class HeroesController {
  @GrpcMethod('HeroesService')
  findOne(data: HeroById, metadata: Metadata, call: ServerUnaryCall<any>): Hero {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}
```
也可以忽略`@GrpcMethod()`的第一个参数。在这种情况下，Nest将基于定义了处理程序的类的`proto`文件自动关联处理程序和服务定义。例如，在以下代码中，类`HeroesService`和它在`hero.proto`文件中定义的`HeroesService`服务的处理器方法相关联，以`HeroesService`名称相匹配。

> hero.controller.ts

```typescript
@Controller()
export class HeroesService {
  @GrpcMethod()
  findOne(data: HeroById, metadata: Metadata, call: ServerUnaryCall<any>): Hero {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}
```

### 客户端

Nest应用可以作为gRPC客户端，消费`.proto`文件定义的服务。你可以使用`ClientGrpc`对象调用远程服务。可以通过几种方式调用`ClientGrpc`对象。

推荐的技术是导入`ClientModule`，使用`register()` 方法绑定一个在`.proto`文件中定义的服务包以注入token并配置服务。`name`属性是注入的token。在gRPC服务中，使用`transport:Transport.GRPC`，`options`属性和前节相同。


```typescript
imports: [
  ClientsModule.register([
    {
      name: 'HERO_PACKAGE',
      transport: Transport.GRPC,
      options: {
        package: 'hero',
        protoPath: join(__dirname, 'hero/hero.proto'),
      },
    },
  ]),
];
```
?> `register()`方法包含一个对象数组。通过逗号分隔注册对象以注册多个对象。

注册后，可以使用`@Inject()`注入配置的`ClientGrpc`对象。然后使用`ClientGrpc`对象的`getService()`方法来获取服务实例，如下：

```typescript
@Injectable()
export class AppService implements OnModuleInit {
  private heroesService: HeroesService;

  constructor(@Inject('HERO_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.heroesService = this.client.getService<HeroesService>('HeroesService');
  }

  getHero(): Observable<string> {
    return this.heroesService.findOne({ id: 1 });
  }
}
```
!> gRPC客户端不会发送名称包含下划线`_`的字段，除非`keepCase`选项在`proto`装载配置中(`options.loader.keepcase`在微服务传输器配置中)被配置为`true`。

注意，和其他微服务传输器方法相比，这里的技术有一点细微的区别。使用`ClientGrpc`代替`ClientProxy`类，提供`getService()`方法，使用一个服务名称作为参数并返回它的实例（如果存在）。

也可以使用 `@Client()` 装饰器来初始化`ClientGrpc`对象，如下：

```typescript
@Injectable()
export class AppService implements OnModuleInit {
  @Client({
    transport: Transport.GRPC,
    options: {
      package: 'hero',
      protoPath: join(__dirname, 'hero/hero.proto'),
    },
  })
  client: ClientGrpc;

  private heroesService: HeroesService;

  onModuleInit() {
    this.heroesService = this.client.getService<HeroesService>('HeroesService');
  }

  getHero(): Observable<string> {
    return this.heroesService.findOne({ id: 1 });
  }
}
```
最后，在更复杂的场景下，我们可以使用`ClientProxyFactory`注入一个动态配置的客户端。

在任一种情况下，最终要需要`HeroesService`代理对象，它暴露了 `.proto` 文件中定义的同一组方法。现在可以访问这些代理对象（例如，heroesService)，gRPC系统自动序列化请求并发送到远程系统中，返回应答，并且反序列化应答。由于gRPC屏蔽了网络通讯的细节，`herosService`看上去和本地服务一样。

注意，所有这些都是 **小写** (为了遵循自然惯例)。基本上，我们的`.proto`文件 `HeroService` 定义包含 `FindOne()` 函数。这意味着 `heroService` 实例将提供 `findOne()` 方法。

```typescript
interface HeroService {
  findOne(data: { id: number }): Observable<any>;
}
```

消息处理程序也可以返回一个`Observable`，在流完成之后其结果值会被发出。
> hero.controller.ts

```typescript
@Get()
call(): Observable<any> {
  return this.heroService.findOne({ id: 1 });
}
```
要发送gRPC元数据（随请求），可以像如下这样传递第二个参数：

```typescript
call(): Observable<any> {
  const metadata = new Metadata();
  metadata.add('Set-Cookie', 'yummy_cookie=choco');

  return this.heroesService.findOne({ id: 1 }, metadata);
}
```
?> `Metadata`类从`grpc`包中导入。

注意，这可能需要更新我们在之前步骤中定义的`HeroesService`接口。

[这里](https://github.com/nestjs/nest/tree/master/sample/04-grpc) 提供了一个完整的示例。

### gRPC流

`GRPC` 本身支持长期的实时连接（称为流）。 对于诸如聊天，观察或块数据传输之类的服务案例，流可以是非常有用的工具。 您可以在官方文档（[此处](https://grpc.io/docs/guides/concepts/)）中找到更多详细信息。

`Nest` 通过两种可能的方式支持 `GRPC`流处理程序：
- `RxJS Subject + Observable` 处理程序：可用于在`Controller` 内部编写响应或将其传递给 `Subject / Observable`使用者。

- `Pure GRPC` 调用流处理程序:将其传递给某个执行程序非常有用，后者将处理节点标准双工流处理程序的其余分派。

### 流示例

定义一个示例的gRPC服务，名为`HelloService`。`hello.proto`文件使用协议缓冲语言组织，如下：

```typescript
// hello/hello.proto
syntax = "proto3";

package hello;

service HelloService {
  rpc BidiHello(stream HelloRequest) returns (stream HelloResponse);
  rpc LotsOfGreetings(stream HelloRequest) returns (HelloResponse);
}

message HelloRequest {
  string greeting = 1;
}

message HelloResponse {
  string reply = 1;
}
```
?> `LotsOfGreetings`方法可以简单使用`@GrpcMethod`装饰器(参考以上示例)，以返回流并发射出多个值。

基于`.proto`文件，定义`HelloService`接口。

```typescript
interface HelloService {
  bidiHello(upstream: Observable<HelloRequest>): Observable<HelloResponse>;
  lotsOfGreetings(
    upstream: Observable<HelloRequest>,
  ): Observable<HelloResponse>;
}

interface HelloRequest {
  greeting: string;
}

interface HelloResponse {
  reply: string;
}
```


### 主题策略

`@GrpcStreamMethod()` 装饰器提供`RxJS Observable`的函数参数，也就是说，我们可以接收和处理多个消息。

```typescript
@GrpcStreamMethod()
bidiHello(messages: Observable<any>, metadata: Metadata, call: ServerDuplexStream<any, any>): Observable<any> {
  const subject = new Subject();

  const onNext = message => {
    console.log(message);
    subject.next({
      reply: 'Hello, world!'
    });
  };
  const onComplete = () => subject.complete();
  messages.subscribe(onNext, null, onComplete);

  return subject.asObservable();
}
```

!> 为了支持与 `@GrpcStreamMethod()` 装饰器的全双工交互，需要从`Controller` 方法中返回 `RxJS Observable`。

?> `Metadata`和`ServerUnaryCall`类/接口从`grpc`包中导入。

依据服务定义（在`.proto`文件中），`BidiHello`方法需要向服务发送流请求。要从客户端发送多个异步消息到流，需要暴露一个RxJS的`ReplySubject`类。

```typescript
const helloService = this.client.getService<HelloService>('HelloService');
const helloRequest$ = new ReplaySubject<HelloRequest>();

helloRequest$.next({ greeting: 'Hello (1)!' });
helloRequest$.next({ greeting: 'Hello (2)!' });
helloRequest$.complete();

return helloService.bidiHello(helloRequest$);
```

在上述示例中，将两个消息写入流(`next()`调用)并且通知服务我们完成两个数据发送(`complete()`调用)。

### 调用流处理程序

当返回值被定义为`stream`时，`@GrpcStreamCall()`装饰器提供了一个`grpc.ServerDuplexStream`作为函数参数,支持标准的 `.on('data', callback)`、`.write(message)`或 `.cancel()`方法，有关可用方法的完整文档可在[此处](https://grpc.github.io/grpc/node/grpc-ClientDuplexStream.html)找到。

可选的，当方法返回值不是`stream`时，`@GrpcStreamCall()`装饰器提供两个函数参数，分别为`grpc.ServerReadableStream` ([参见这里](https://grpc.github.io/grpc/node/grpc-ServerReadableStream.html)) 和`callback`。

接下来开始应用`BidiHello`，它应该支持全双工交互。

```typescript
@GrpcStreamCall()
bidiHello(requestStream: any) {
  requestStream.on('data', message => {
    console.log(message);
    requestStream.write({
      reply: 'Hello, world!'
    });
  });
}
```

?> 此装饰器不需要提供任何特定的返回参数。 可以像对待任何其他标准流类型一样处理流。

在上述示例中，使用`write()`方法将对象写入响应流。将回调信息作为第二个参数传递给`.on()`方法，当服务每次收到收据块时会进行调用。

应用`LotsOfGreetings`方法：

```typescript
@GrpcStreamCall()
lotsOfGreetings(requestStream: any, callback: (err: unknown, value: HelloResponse) => void) {
  requestStream.on('data', message => {
    console.log(message);
  });
  requestStream.on('end', () => callback(null, { reply: 'Hello, world!' }));
}
```
这里使用`callback`函数在`requestStream`完成时来发送响应。

### gRPC 元数据

元数据是一系列反应特定RPC调用信息的键值对，键是字符串格式，值通常是字符串，但也可以是二进制数据。元数据对gRPC自身而言是不透明的，客户端向服务器发送信息时携带元数据信息，反之亦然。元数据包含认证token，请求指示器和监控用途的标签，以及数据信息例如数据集中的记录数量。

要在`@GrpcMethod()`处理程序中读取元数据，使用第二个参数（元数据），类型为`Metadata`(从`grpc`包中导入)。

要从处理程序中发回元数据，使用`ServerUnaryCall#sendMetadata()`方法（第三个处理程序参数）。

>heroes.controller.ts

```typescript
@Controller()
export class HeroesService {
  @GrpcMethod()
  findOne(data: HeroById, metadata: Metadata, call: ServerUnaryCall<any>): Hero {
    const serverMetadata = new Metadata();
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];

    serverMetadata.add('Set-Cookie', 'yummy_cookie=choco');
    call.sendMetadata(serverMetadata);

    return items.find(({ id }) => id === data.id);
  }
}
```
类似地，要使用`@GrpcStreamMethod()`处理程序（主题策略）在处理程序注释中读取元数据，使用第二个参数（元数据），类型为`Metadata`(从`grpc`包中导入)。

要从处理程序中发回元数据，使用`ServerDuplexStream#sendMetadata()`方法（第三个处理程序参数）。

要从[call stream handlers](https://docs.nestjs.com/microservices/grpc#call-stream-handler)(使用`@GrpcStreamCall()`装饰器注释的处理程序)中读取元数据，监听`requestStream`引用中的`metadata`事件。

```typescript
requestStream.on('metadata', (metadata: Metadata) => {
  const meta = metadata.get('X-Meta');
});
```
## 自定义传输器

Nest提供了一系列开箱即用的传输器，也提供了允许用户自定义传输策略的API接口。传输器允许你使用可插拔的通讯层和非常简单的应用层消息协议通过网络连接组件。（阅读[全文](https://dev.to/nestjs/integrate-nestjs-with-external-services-using-microservice-transporters-part-1-p3))


?> 不一定非要使用`@nestjs/microservices`包才能创建微服务，例如，如果需要和外部服务通讯 (假设为其他语言编写的其他微服务),你可能不需要 `@nestjs/microservice `提供的全部功能。实际上，如果你不需要装饰器(`@EventPattern`或者`@MessagePattern`)来定义订阅者，运行一个独立的应用并且手动维护连接/订阅频道可能会提供更高的灵活性。 

使用自定义传输器，你可以集成任何消息系统/协议（包括`Google Cloud Pub/Sub`, `Amazon Kinesis`等等）或者已有的外部系统，在顶部添加额外的特性（例如用于MQTT的QoS）。

?> 要更好地理解Nest微服务的工作模式以及如何扩展现有传输器，推荐阅读`NestJS Microservices in Action`和`Advanced NestJS Microservices`系列文章。

### 创建策略

首先定义一个代表自定义传输器的类。

```typescript
import { CustomTransportStrategy, Server } from '@nestjs/microservices';

class GoogleCloudPubSubServer
  extends Server
  implements CustomTransportStrategy {
  /**
   * This method is triggered when you run "app.listen()".
   */
  listen(callback: () => void) {
    callback();
  }

  /**
   * This method is triggered on application shutdown.
   */
  close() {}
}
```

!> 在这里不会实现一个完整的谷歌云订阅服务器，因为这需要更多更深入的传输器细节。

在这个例子中，声明了`GoogleCloudPubSubServer`类，提供`listen()`和`close()` 方法，并由`CustomTransportStrategy`接口进行限制。此外，我们的类扩展了从`@nestjs/microservices`包导入的`Server`类，来提供一些有用的方法。例如，提供Nest运行时注册消息处理程序的方法。可选的，如果要扩展传输器策略，也可以扩展相应的服务器。例如，`ServerRedis`。一般来说，我们在类前面添加`Server`前缀来表示该类用于处理订阅消息事件（并在必要时进行响应）。

这样就可以自定义一个传输器而不是使用内置的。

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    strategy: new GoogleCloudPubSubServer(),
  },
);
```

和常规的传输器选项对象的`transport`和`options`属性不同,我们传递一个属性 `strategy`, 其值是我们自定义传输器类的一个实例。

回到我们的`GoogleCloudPubSubServer`类，在真实的应用中，我们可以在`listen()`方法(以及之后移除订阅和监听的`close()`方法)中指定订阅/监听特定频道来和代理/外部服务建立连接。但由于这需要对Nest微服务通讯原理有深入理解，我们建议阅读[这一系列文章](https://dev.to/nestjs/part-1-introduction-and-setup-1a2l)。在本章这里，我们重点介绍服务器类的能力以及如何暴露它们来建立自定义策略。

例如，在我们程序的某个部分，定义了以下处理程序：

```typescript
@MessagePattern('echo')
echo(@Payload() data: object) {
  return data;
}
```
该消息处理程序可以自动在Nest运行时注册。通过服务器类，可以看到被注册的消息类型是哪种，也可以接收和执行分配给它们的实际方法。要测试这个，我们在`listen()`中添加一个简单的`console.log`方法，并在回调函数前执行:

```typescript
listen(callback: () => void) {
  console.log(this.messageHandlers);
  callback();
}
```

程序重启后，可以看到终端中以下记录：

```typescript
Map { 'echo' => [AsyncFunction] { isEventHandler: false } }
```

?> 如果我们使用`@EventPattern`装饰器，你可以看到同样的输出，但是`isEventHandler`属性被设置为`true`。

如你所见，`messageHandlers`属性是一个所有消息（和事件）处理程序的`Map`集合。在这里，模式被用作键名，你可以使用一个键（例如`echo`）来接收一个消息处理程序的引用：

```typescript
async listen(callback: () => void) {
  const echoHandler = this.messageHandlers.get('echo');
  console.log(await echoHandler('Hello world!'));
  callback();
}
```
一旦我们执行了`echoHandler`,并传递任意字符串作为参数(在这里是"Hello world!"), 可以看到以下输出：

```bash
Hello world!
```

这意味着消息处理程序正确执行了。

### 客户代理

如第一部分介绍的，你不一定需要`@nestjs/microservices`包来创建微服务，但是如果你这样做，那么需要集成一个自定义策略，你还需要提供一个`client`类。

?> 类似地，要实现完全兼容所有的`@nestjs/microservices`特性（例如`streaming`）需要对框架的通讯机制有深入理解。阅读[本文](https://dev.to/nestjs/part-4-basic-client-component-16f9)了解更多。

要和外部服务/发射与发布消息（或者事件）通讯，你可以使用一个特定库的SDK包，或者一个扩展了`ClientProxy`的自定义的客户端类，如下：

```typescript
import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';

class GoogleCloudPubSubClient extends ClientProxy {
  async connect(): Promise<any> {}
  async close() {}
  async dispatchEvent(packet: ReadPacket<any>): Promise<any> {}
  publish(
    packet: ReadPacket<any>,
    callback: (packet: WritePacket<any>) => void,
  ): Function {}
}
```

!> 注意，在这里我们不会实现一个完整的google云发布/订阅客户端，因为这需要对传输者技术深入理解。

如你所见，`ClientProxy`需要我们提供几个方法来建立和关闭连接，以及发布消息(`publish`)和事件(`dispatchEvent`)。注意,如果你不需要支持请求-响应的通讯风格,可以保持`publish()`方法空白。类似地,如果你不需要支持基于事件的通讯,跳过`dispatchEvent()`方法。

要观察何时何地执行了哪些方法,如下添加多个`console.log`方法:

```typescript
class GoogleCloudPubSubClient extends ClientProxy {
  async connect(): Promise<any> {
    console.log('connect');
  }

  async close() {
    console.log('close');
  }

  async dispatchEvent(packet: ReadPacket<any>): Promise<any> {
    return console.log('event to dispatch: ', packet);
  }

  publish(
    packet: ReadPacket<any>,
    callback: (packet: WritePacket<any>) => void,
  ): Function {
    console.log('message:', packet);

    // In a real-world application, the "callback" function should be executed
    // with payload sent back from the responder. Here, we'll simply simulate (5 seconds delay)
    // that response came through by passing the same "data" as we've originally passed in.
    setTimeout(() => callback({ response: packet.data }), 5000);

    return () => console.log('teardown');
  }
}
```

创建一个 `GoogleCloudPubSubClient `类并运行`send()`方法(参见前节),注册和返回一个可观察流。

```typescript
const googlePubSubClient = new GoogleCloudPubSubClient();
googlePubSubClient
  .send('pattern', 'Hello world!')
  .subscribe((response) => console.log(response));
```

在终端可以看到如下输出:

```bash
connect
message: { pattern: 'pattern', data: 'Hello world!' }
Hello world! // <-- after 5 seconds
```

要测试"teardown"方法(由`publish()`方法返回)正确执行,我们在流中添加一个超时操作,设置超时时间为2秒以保证其早于`setTimeout`调用回调函数。

```typescript
const googlePubSubClient = new GoogleCloudPubSubClient();
googlePubSubClient
  .send('pattern', 'Hello world!')
  .pipe(timeout(2000))
  .subscribe(
    (response) => console.log(response),
    (error) => console.error(error.message),
  );
```

?> `timeout`操作符从`rxjs/operators`包中导入。

应用`timeout`操作符,终端看上去类似如下:

```bash
connect
message: { pattern: 'pattern', data: 'Hello world!' }
teardown // <-- teardown
Timeout has occurred
```

要分派一个事件(代替消息),使用`emit()`方法:

```typescript
googlePubSubClient.emit('event', 'Hello world!');
```

终端看上去如下:

```bash
connect
event to dispatch:  { pattern: 'event', data: 'Hello world!' }
```

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

下面是一个使用手动实例化 **方法作用域** 过滤器,与HTTP应用一样，你也可以使用控制器作用域的过滤器（例如在控制器类前使用`@UseFilters()`装饰器前缀）:

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

### 绑定管道

下面是一个手动实现 **方法作用域** 管道的示例，与HTTP应用一样，你也可以使用控制器作用域的管道（例如在控制器类前使用`@UsePipes()`装饰器前缀）:

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

### 绑定守卫

下面是一个 **方法作用域** 守卫的示例，与HTTP应用一样，你也可以使用控制器作用域的守卫（例如在控制器类前使用`@UseGuards()`装饰器前缀）:

```typescript
@UseGuards(AuthGuard)
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```

## 拦截器

常规拦截器和微服务拦截器之间没有区别。下面是一个使用手动实例化 **方法作用域** 拦截器的示例，与HTTP应用一样，你也可以使用控制器作用域的拦截器（例如在控制器类前使用`@UseInterceptors()`装饰器前缀）:

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
| [@tihssiefiL](https://github.com/tihssiefiL)  | <img class="avatar-66 rm-style" height="80" src="https://avatars1.githubusercontent.com/u/27731469?s=460&u=26299e3ac3d46723492efa3daf1eb9703de0616a&v=4">  |  翻译  | 专注于 前端 和 nodejs, [@tihssiefiL](https://blog.ezcomezgo.com) | 
| [@weizy0219](https://github.com/weizy0219)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/19883738?s=60&v=4">  |  翻译  | 专注于TypeScript全栈、物联网和Python数据科学，[@weizhiyong](https://www.weizhiyong.com) |

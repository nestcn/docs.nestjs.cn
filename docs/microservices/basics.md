<!-- 此文件从 content/microservices/basics.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:31:37.393Z -->
<!-- 源文件: content/microservices/basics.md -->

### Overview

除了传统的（有时称为 monolithic）应用程序架构外，Nest natively 支持微服务架构开发的风格。多种概念，如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，在微服务中同样适用。Nest 抽象了实现细节，使得同一个组件可以在 HTTP、WebSocket 和微服务平台上运行。这一部分涵盖了 Nest 在微服务中的特定方面。

在 Nest 中，微服务基本上是一个使用不同的 **transport** 层来传输消息的应用程序。

<figure><img class="illustrative-image" src="/assets/Microservices_1.png" /></figure>

Nest 支持多种内置的 transport 层实现，称为 **transporter**，负责在不同微服务实例之间传输消息。多种 transporter 天生支持 both **request-response** 和 **event-based** 消息风格。Nest 抽象了每个 transporter 的实现细节，以 request-response 和 event-based 消息风格提供一个标准接口。这使得可以轻松地切换到另一个 transport 层，以利用特定的可靠性或性能特性，而不影响应用程序代码。

#### 安装

要开始构建微服务，首先安装所需的包：

```bash
$ npm i --save @nestjs/microservices

```

#### 开始

要实例化微服务，使用 `createMicroservice()` 方法：

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
  await app.listen();
}
bootstrap();

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
  });
  await app.listen();
}
bootstrap();

```

> info **提示** 微服务默认使用 **TCP** transport 层。

`createMicroservice()` 方法的第二个参数是一个 `options` 对象。这对象可能包含两个成员：

<table>
  <tr>
    <td><code>transport</code></td>
    <td>指定 transporter（例如 <code>Transport.NATS</code>）</td>
  </tr>
  <tr>
    <td><code>options</code></td>
    <td> transporter 特定的选项对象，确定 transporter 行为</td>
  </tr>
</table>
<p>
  <code>options</code> 对象是特定 transporter 的。 <strong>TCP</strong> transporter expose
  下述属性。对于其他 transporter（例如 Redis、MQTT 等），请查看相关章节以了解可用的选项。
</p>
<table>
  <tr>
    <td><code>host</code></td>
    <td>连接主机名</td>
  </tr>
  <tr>
    <td><code>port</code></td>
    <td>连接端口</td>
  </tr>
  <tr>
    <td><code>retryAttempts</code></td>
    <td>消息重试次数（默认： <code>0</code>）</td>
  </tr>
  <tr>
    <td><code>retryDelay</code></td>
    <td>消息重试延迟（ms）（默认： <code>0</code>）</td>
  </tr>
  <tr>
    <td><code>serializer</code></td>
    <td>自定义 <a href="https://github.com/nestjs/nest/blob/master/packages/microservices/interfaces/serializer.interface.ts" target="_blank">serializer</a> 对象以发送消息</td>
  </tr>
  <tr>
    <td><code>deserializer</code></td>
    <td>自定义 <a href="https://github.com/nestjs/nest/blob/master/packages/microservices/interfaces/deserializer.interface.ts" target="_blank">deserializer</a> 对象以接收消息</td>
  </tr>
  <tr>
    <td><code>socketClass</code></td>
    <td>自定义 Socket，扩展 <code>TcpSocket</code>（默认： <code>JsonSocket</code>）</td>
#### 请求-响应

请求-响应消息风格非常适合在各种外部服务之间交换消息。这种paradigm确保了服务已经收到了消息（不需要手动实现确认协议）。然而，请求-响应方法并不总是最好的选择。例如，流式传输器，如[Kafka](https://docs.confluent.io/3.0.0/streams/)或[NATS streaming](https://github.com/nats-io/node-nats-streaming)，使用日志持久化，旨在解决与事件消息paradigm相关的一组挑战（详见[event-based messaging](/microservices/basics#event-based)）。

要启用请求-响应消息类型，Nest创建了两个逻辑通道：一个用于传输数据，另一个用于等待 incoming 响应。对于一些底层传输，如[NATS](https://nats.io/)，Nest提供了内置支持。对于其他传输，Nest会手动创建 separate 通道。虽然这有效，但它可能会引入一些 overhead。因此，如果你不需要请求-响应消息风格，你可能想考虑使用事件消息方法。

要创建基于请求-响应paradigm的消息处理程序，使用来自`@nestjs/microservices`包的`@MessagePattern()`装饰器。该装饰器仅在[controller](/controllers)类中使用，作为应用程序的入口点。使用它在提供者中将无效，因为它们将被 Nest 运行时忽略。

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

@Controller()
export class MathController {
  @MessagePattern({ cmd: 'sum' })
  accumulate(data) {
    return (data || []).reduce((a, b) => a + b);
  }
}

```

在上面的代码中，`accumulate()` **消息处理程序**监听匹配`{{ '{' }} cmd: 'sum' {{ '}' }}`消息模式的消息。消息处理程序接受单个参数，即由客户端传递的`data`。在这里，数据是一个数字数组，需要累积。

#### 异步响应

消息处理程序可以同步或异步响应，支持`async`方法。

```typescript
@MessagePattern({ cmd: 'sum' })
async accumulate(data: number[]): Promise<number> {
  return (data || []).reduce((a, b) => a + b);
}

```

消息处理程序也可以返回`Observable`，在这种情况下，结果值将直到流完成。

```typescript
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): Observable<number> {
  return from([1, 2, 3]);
}

```

在上面的示例中，消息处理程序将响应**三个**次，每个项目在数组中一次。

#### 事件消息

虽然请求-响应方法非常适合在服务之间交换消息，但它不太适合事件消息—当你想要发布事件而不等待响应时。在这种情况下，保持两个通道的请求-响应是多余的。

例如，如果你想通知另一个服务在系统中的某个部分发生了特定条件，可以使用事件消息风格。

要创建事件处理程序，可以使用来自`@nestjs/microservices`包的`@EventPattern()`装饰器。

```typescript
@EventPattern('user_created')
async handleUserCreated(data: Record<string, unknown>) {
  // business logic
}

```

> info **提示**你可以注册多个事件处理程序来处理单个事件模式，并且所有它们将自动并行触发。

`handleUserCreated()` **事件处理程序**监听`'user_created'`事件。事件处理程序接受单个参数，即来自客户端的`data`（在这里是一个网络发送的事件 payload）。

<app-banner-enterprise></app-banner-enterprise>

#### 附加请求细节

在更复杂的场景中，你可能需要访问 incoming 请求的额外细节。例如，在使用 NATS 时，你可能想检索原始主题，该主题是生产者发送消息的主题。同样，在 Kafka 中，你可能需要访问消息头。要实现这点，可以使用以下装饰器：

```typescript
@MessagePattern('time.us.*')
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}

```

> info **提示**`@Payload()`、`@Ctx()` 和 `NatsContext` 是来自`@nestjs/microservices`的。

> info **提示**你可以将`@Payload()`装饰器传递给 property 键，以从 incoming payload 对象中提取特定的属性，例如`@Payload('id')`。

#### 客户端（生产者类）

客户端 Nest应用程序可以使用`ClientProxy`类与 Nest 微服务进行消息交换或事件发布。这个类提供了多个方法，如`send()`（用于请求-响应消息）和`emit()`（用于事件驱动消息），以便与远程微服务通信。你可以通过以下方式获得这个类的实例：

一个方法是导入`ClientsModule`，它暴露了静态`register()`方法。这个方法接受一个数组，表示微服务传输器。每个对象都必须包含`name`属性， optionally `transport` 属性（默认为`Transport.TCP`），以及可选的`options` 属性。Here is the translation of the provided English technical documentation to Chinese:

``name`` 属性作为一个 **注入令牌**，您可以使用它来注入一个 ``ClientProxy`` 的实例 wherever needed。该 ``name`` 属性的值可以是任意的字符串或 JavaScript 符号，详见 <[here](/fundamentals/custom-providers#非基于类的提供者令牌)>。

``options`` 属性是一个对象，其中包含了在 ``createMicroservice()`` 方法中所见到的同样属性。

````typescript
@Module({
  imports: [
    ClientsModule.register([
      { name: 'MATH_SERVICE', transport: Transport.TCP },
    ]),
  ],
})

````

如果您需要在设置期间提供配置或执行其他异步操作，可以使用 ``registerAsync()`` 方法。

````typescript
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'MATH_SERVICE',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            url: configService.get('URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
})

````

一旦模块被导入，您可以使用 ``@Inject()`` 装饰器将 ``ClientProxy`` 配置为指定的选项和 ``'MATH_SERVICE'`` 传输器的实例。

````typescript
constructor(
  @Inject('MATH_SERVICE') private client: ClientProxy,
) {}

````

> 信息 **提示** ``ClientsModule`` 和 ``ClientProxy`` 类来自 ``@nestjs/microservices`` 包。

有时，您可能需要从另一个服务（如 ``ConfigService``）中获取传输器配置，而不是在客户端应用程序中硬编码。为了实现这个目标，可以使用 `[custom provider](/fundamentals/custom-providers)` 并使用 ``ClientProxyFactory`` 类的静态 ``create()`` 方法，该方法接受传输器选项对象并返回自定义的 ``ClientProxy`` 实例。

````typescript
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

````

> 信息 **提示** ``ClientProxyFactory``来自 ``@nestjs/microservices`` 包。

另一个选项是使用 ``@Client()`` 属性装饰器。

````typescript
@Client({ transport: Transport.TCP })
client: ClientProxy;

````

> 信息 **提示** ``@Client()`` 装饰器来自 ``@nestjs/microservices`` 包。

使用 ``@Client()`` 装饰器不是首选，因为它更难测试和共享客户端实例。

``ClientProxy`` 是 **懒惰** 的。它不会立即建立连接，而是在第一个微服务调用时建立连接，然后在每个后续调用中重用。然而，如果您想延迟应用程序启动过程直到连接建立，可以在 ``OnApplicationBootstrap`` 生命周期钩子中手动初始化连接使用 ``connect()`` 方法。

````typescript
async onApplicationBootstrap() {
  await this.client.connect();
}

````

如果无法创建连接，``connect()`` 方法将以相应的错误对象.reject。

#### 发送消息

``ClientProxy`` exposing a ``send()`` method. This method is intended to call the microservice and returns an ``Observable`` with its response. Thus, we can subscribe to the emitted values easily.

````typescript
accumulate(): Observable<number> {
  const pattern = { cmd: 'sum' };
  const payload = [1, 2, 3];
  return this.client.send<number>(pattern, payload);
}

````

``send()`` method takes two arguments, ``pattern`` and ``payload``. The ``pattern`` should match one defined in a ``@MessagePattern()`` decorator. The ``payload`` is a message that we want to transmit to the remote microservice. This method returns a **cold ``Observable``**, which means that you have to explicitly subscribe to it before the message will be sent.

#### 发布事件

要发送事件，请使用 ``ClientProxy`` 对象的 ``emit()`` 方法。这方法发布事件到消息代理。

````typescript
async publish() {
  this.client.emit<number>('user_created', new UserCreatedEvent());
}

````

``emit()`` method takes two arguments: ``pattern`` and ``payload``. The ``pattern`` should match one defined in an ``@EventPattern()`` decorator, while the ``payload`` represents the event data that you want to transmit to the remote microservice. This method returns a **hot ``Observable``** (in contrast to the cold ``Observable`` returned by ``send()``), meaning that regardless of whether you explicitly subscribe to the observable, the proxy will immediately attempt to deliver the event.

`<app-banner-devtools></app-banner-devtools>`

#### 请求范围

对于来自不同编程语言背景的人来说，可能会惊讶地发现在 Nest 中大多数事情都是跨越 incoming 请求共享的。这包括对数据库的连接池、单例服务的全局状态和更多。请注意，Node.js 不遵循请求/响应多线程无状态模型，where each request is processed by a separate thread。因此，使用单例实例是 **安全** 的。

然而，在某些边缘情况下，可能需要为处理器请求生命周期。例如，GraphQL 应用程序中的 per-request 缓存、请求跟踪或多租户。你可以了解更多关于如何控制作用域的信息 <[here](/fundamentals/injection-scopes)>。

请求范围的处理器和提供商可以使用 ``@Inject()`` 装饰器结合 ``CONTEXT`` 令牌来注入 ``RequestContext``：

````typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { CONTEXT, RequestContext } from '@nestjs/microservices';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(CONTEXT) private ctx: RequestContext) {}
}

````

这提供了对 ``RequestContext`` 对象的访问，该对象有两个属性：

````typescript
export interface RequestContext<T = any> {
  pattern: string | Record<string, any>;
  data: T;
}

````

Note: I have translated the technical documentation to Chinese following the provided guidelines and terminology. I以下是翻译后的中文技术文档：

### 实例状态更新

要实时获取连接和底层驱动实例的状态更新，可以订阅 `status` 流。这个流提供了特定于选择的驱动的状态更新。例如，如果您使用的是 TCP 运输器（默认）， `status` 流将发送 `connected` 和 `disconnected` 事件。

```typescript
this.client.status.subscribe((status: TcpStatus) => {
  console.log(status);
});

```

> 提示 **Hint** `TcpStatus` 类型来自 `@nestjs/microservices` 包。

同样，您可以订阅服务器的 `status` 流以接收服务器状态通知。

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: TcpStatus) => {
  console.log(status);
});

```

### 监听内部事件

在某些情况下，您可能想监听微服务内部事件。例如，您可以监听 `error` 事件以在错误发生时触发额外操作。要做到这点，可以使用 `on()` 方法，如下所示：

```typescript
this.client.on('error', (err) => {
  console.error(err);
});

```

同样，您可以监听服务器的内部事件：

```typescript
server.on<TcpEvents>('error', (err) => {
  console.error(err);
});

```

> 提示 **Hint** `TcpEvents` 类型来自 `@nestjs/microservices` 包。

### underlying driver 访问

对于更高级的用例，您可能需要访问底层驱动实例。这可以在手动关闭连接或使用驱动程序专门方法时很有用。然而，请记住，在大多数情况下，您 **不需要** 直接访问驱动程序。

要做到这点，可以使用 `unwrap()` 方法，它返回底层驱动实例。泛型类型参数应该指定期望的驱动实例类型。

```typescript
const netServer = this.client.unwrap<Server>();

```

这里， `Server` 是来自 `net` 模块的类型。

同样，您可以访问服务器的底层驱动实例：

```typescript
const netServer = server.unwrap<Server>();

```

### 超时处理

在分布式系统中，微服务可能会暂时下线或不可用。为了防止长时间等待，您可以使用超时。超时是一个非常有用的模式，当与其他服务通信时使用。要将超时应用于微服务调用，可以使用 [RxJS](https://rxjs.dev) `timeout` 运算符。如果微服务在指定时间内没有响应，会抛出异常，您可以捕捉并处理。

要实现这点，您需要使用 [__INLINE_CODE_127__](https://github.com/ReactiveX/rxjs) 包。简单地在管道中使用 `timeout` 运算符：

```typescript
this.client
  .send<TResult, TInput>(pattern, data)
  .pipe(timeout(5000));

```

> 提示 **Hint** `timeout` 运算符来自 `rxjs/operators` 包。

在 5 秒后，如果微服务不响应，它将抛出错误。

### TLS 支持

在外部网络通信时，确保流量加密非常重要。在 NestJS 中，这可以使用 Node 的内置 [TLS](https://nodejs.org/api/tls.html) 模块实现。Nest 提供了对 TCP 运输器的内置 TLS 支持，允许在微服务或客户端之间加密通信。

要为 TCP 服务器启用 TLS，您需要添加私钥和证书，以 PEM 格式。这些文件被添加到服务器选项中，使用 `tlsOptions` 并指定 key 和 cert 文件，如下所示：

```typescript
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const key = fs.readFileSync('<pathToKeyFile>', 'utf8').toString();
  const cert = fs.readFileSync('<pathToCertFile>', 'utf8').toString();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        tlsOptions: {
          key,
          cert,
        },
      },
    },
  );

  await app.listen();
}
bootstrap();

```

对于客户端来 securely over TLS，您也定义了 `tlsOptions` 对象，但这次是使用 CA 证书。这是签名服务器证书的证书机构的证书。这样可以确保客户端信任服务器证书并可以建立安全连接。

```typescript
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.TCP,
        options: {
          tlsOptions: {
            ca: [fs.readFileSync('<pathToCaFile>', 'utf-8').toString()],
          },
        },
      },
    ]),
  ],
})
export class AppModule {}

```

您也可以传递一个 CA 证书数组，如果您的设置涉及多个可信任的权威机构。

一旦 everything 设置好，您可以使用 `ClientProxy` 装饰器来将客户端 injected 到您的服务中。这确保了使用 Node 的 `TLS` 模块来加密 NestJS 微服务之间的通信。

更多信息，请参考 Node 的 [TLS documentation](https://nodejs.org/api/tls.html)。

### 动态配置

当微服务需要使用 `ConfigService` (来自 `@nestjs/config` 包)进行配置，但注入上下文只在微服务实例创建后可用时， `AsyncMicroserviceOptions` 提供了解决方案。这使得动态配置成为可能，确保了 `ConfigService` 的顺滑集成。

```typescript
import { ConfigService } from '@nestjs/config';
import { AsyncMicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
    AppModule,
    {
      useFactory: (configService: ConfigService) => ({
        transport: Transport.TCP,
        options: {
          host: configService.get<string>('HOST'),
          port: configService.get<number>('PORT'),
        },
      }),
      inject: [ConfigService],
    },
  );

  await app.listen();
}
bootstrap();

```
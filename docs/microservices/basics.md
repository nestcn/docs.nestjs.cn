### 概述

除了传统的（有时称为单体式）应用架构外，Nest 原生支持微服务架构风格的开发。本文档其他部分讨论的大多数概念，如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，同样适用于微服务。Nest 尽可能抽象实现细节，使得相同组件可以跨 HTTP 平台、WebSocket 和微服务运行。本节将重点介绍 Nest 中微服务特有的功能。

在 Nest 中，微服务本质上是一个使用不同于 HTTP **传输**层的应用程序。

![](/assets/Microservices_1.png)

Nest 支持多种内置的传输层实现，称为**传输器** ，负责在不同微服务实例间传递消息。大多数传输器原生支持**请求-响应**和**基于事件**两种消息风格。Nest 将每种传输器的实现细节抽象为统一的接口，同时适用于请求-响应和基于事件的消息传递。这使得您可以轻松切换传输层——例如利用特定传输层的可靠性或性能优势——而无需修改应用程序代码。

#### 安装

要开始构建微服务，首先需要安装所需包：

```bash
$ npm i --save @nestjs/microservices
```

#### 快速开始

要实例化微服务，请使用 `NestFactory` 类的 `createMicroservice()` 方法：

```typescript
@@filename(main)
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
```

> info **注意** 微服务默认使用 **TCP** 传输层。

`createMicroservice()` 方法的第二个参数是一个 `options` 对象，该对象可能包含两个成员：

<table data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807"><tbody data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807"><tr data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807"><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807">transport</td><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807" data-immersive-translate-paragraph="1">指定传输器（例如 Transport.NATS）</td></tr><tr data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807"><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807">options</td><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807" data-immersive-translate-paragraph="1">一个用于配置传输器行为的传输器专属选项对象</td></tr></tbody></table>

`options` 对象的具体内容取决于所选的传输器类型。**TCP** 传输器暴露的属性如下所述。对于其他传输器（如 Redis、MQTT 等），请参阅相关章节了解可用选项的说明。

<table data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807"><tbody data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807"><tr data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807"><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807">host</td><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807" data-immersive-translate-paragraph="1">连接主机名</td></tr><tr data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807"><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807">port</td><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807" data-immersive-translate-paragraph="1">连接端口</td></tr><tr data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807"><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807">retryAttempts</td><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807" data-immersive-translate-paragraph="1">消息重试次数（默认：0）</td></tr><tr data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807"><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807">retryDelay</td><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807" data-immersive-translate-paragraph="1">消息重试间隔延迟（毫秒）（默认：0）</td></tr><tr data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807"><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807">serializer</td><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807" data-immersive-translate-paragraph="1">自定义序列化器用于发送消息</td></tr><tr data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807"><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807">deserializer</td><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807" data-immersive-translate-paragraph="1">自定义反序列化器用于接收消息</td></tr><tr data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807"><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807">socketClass</td><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807" data-immersive-translate-paragraph="1">继承 TcpSocket 的自定义 Socket（默认：JsonSocket）</td></tr><tr data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807"><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807">tlsOptions</td><td data-immersive-translate-walked="4ab14a0a-46d9-41c1-9503-89f6df3ea807" data-immersive-translate-paragraph="1">配置 tls 协议的选项</td></tr></tbody></table>

> info **提示** 上述属性为 TCP 传输器特有。如需了解其他传输器的可用选项，请参阅相关章节。

#### 消息与事件模式

微服务通过**模式**来识别消息和事件。模式是一个简单值，例如字面量对象或字符串。模式会与消息的数据部分一起自动序列化并通过网络发送。通过这种方式，消息发送者和消费者可以协调哪些请求由哪些处理程序消费。

#### 请求-响应

请求-响应消息模式在需要与各种外部服务**交换**消息时非常有用。这种范式能确保服务确实收到了消息（无需手动实现确认协议）。然而，请求-响应方式并非总是最佳选择。例如，采用日志持久化的流式传输器（如 [Kafka](https://docs.confluent.io/3.0.0/streams/) 或 [NATS 流](https://github.com/nats-io/node-nats-streaming) ），其优化方向更侧重于解决另一类挑战，与事件消息范式更为契合（详见[基于事件的消息传递](https://docs.nestjs.com/microservices/basics#event-based) ）。

为实现请求-响应消息类型，Nest 会创建两个逻辑通道：一个用于传输数据，另一个用于等待响应。对于某些底层传输（如 [NATS](https://nats.io/)），这种双通道支持是开箱即用的。对于其他传输，Nest 会通过手动创建独立通道来补偿。虽然这种方式有效，但可能带来额外开销。因此，如果不需要请求-响应消息模式，建议考虑使用基于事件的方法。

要创建基于请求-响应模式的消息处理器，请使用从 `@nestjs/microservices` 包导入的 `@MessagePattern()` 装饰器。该装饰器应仅在[控制器](https://docs.nestjs.com/controllers)类中使用，因为它们是应用程序的入口点。在提供者中使用它将不会产生任何效果，因为它们会被 Nest 运行时忽略。

```typescript
@@filename(math.controller)
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

在上述代码中，`accumulate()` **消息处理器**会监听与 `{{ '{' }} cmd: 'sum' {{ '}' }}` 消息模式匹配的消息。该消息处理器接收一个参数，即客户端传递的 `data`。在本例中，数据是需要累加的数字数组。

#### 异步响应

消息处理器可以同步或**异步**响应，这意味着支持 `async` 方法。

```typescript
@@filename()
@MessagePattern({ cmd: 'sum' })
async accumulate(data: number[]): Promise<number> {
  return (data || []).reduce((a, b) => a + b);
}
```

消息处理器也可以返回一个 `Observable`，此时结果值将持续发射直到流完成。

```typescript
@@filename()
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): Observable<number> {
  return from([1, 2, 3]);
}
```

在上面的示例中，消息处理器将响应**三次** ，对数组中的每个项目各响应一次。

#### 基于事件

虽然请求-响应模式非常适合服务间的消息交换，但它不太适合基于事件的消息传递——当你只想发布**事件**而不等待响应时。在这种情况下，维护两个通道用于请求-响应是不必要的。

例如，若您需要通知其他服务系统某部分触发了特定条件，基于事件的消息风格便是理想选择。

要创建事件处理器，您可以使用从 `@nestjs/microservices` 包导入的 `@EventPattern()` 装饰器。

```typescript
@@filename()
@EventPattern('user_created')
async handleUserCreated(data: Record<string, unknown>) {
  // business logic
}
```

> **提示** 您可以为**同一个**事件模式注册多个事件处理器，它们都将被自动并行触发。

`handleUserCreated()` **事件处理器**监听 `'user_created'` 事件。该处理器接收单个参数——来自客户端的`数据` （本例中是通过网络发送的事件载荷）。

#### 其他请求详情

在更高级的场景中，您可能需要访问有关传入请求的额外细节。例如，当使用带有通配符订阅的 NATS 时，您可能希望获取生产者发送消息的原始主题。同样地，对于 Kafka，您可能需要访问消息头。为此，您可以利用如下所示的内置装饰器：

```typescript
@@filename()
@MessagePattern('time.us.*')
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}
```

> info **提示**`@Payload()`、`@Ctx()` 和 `NatsContext` 是从 `@nestjs/microservices` 导入的。

> info **提示** 您还可以向 `@Payload()` 装饰器传入一个属性键，以从传入的负载对象中提取特定属性，例如 `@Payload('id')`。

#### 客户端（生产者类）

一个客户端 Nest 应用可以通过 `ClientProxy` 类与 Nest 微服务交换消息或发布事件。该类提供了多种方法，例如 `send()`（用于请求-响应式消息传递）和 `emit()`（用于事件驱动型消息传递），从而实现与远程微服务的通信。您可以通过以下方式获取该类的实例：

一种方法是导入 `ClientsModule`，该模块暴露了静态方法 `register()`。此方法接收一个表示微服务传输器的对象数组。每个对象必须包含 `name` 属性，以及可选的 `transport` 属性（默认为 `Transport.TCP`），还可以包含可选的 `options` 属性。

`name` 属性作为 **注入令牌** ，可用于在需要的地方注入 `ClientProxy` 实例。该 `name` 属性的值可以是任意字符串或 JavaScript 符号，具体说明见 [此处](https://docs.nestjs.com/fundamentals/custom-providers#non-class-based-provider-tokens) 。

`options` 属性是一个对象，包含我们之前在 `createMicroservice()` 方法中看到的相同属性。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      { name: 'MATH_SERVICE', transport: Transport.TCP },
    ]),
  ],
})
```

或者，如果您需要在设置过程中提供配置或执行其他异步操作，可以使用 `registerAsync()` 方法。

```typescript
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
```

模块导入后，您可以使用 `@Inject()` 装饰器注入一个配置了 `'MATH_SERVICE'` 传输器指定选项的 `ClientProxy` 实例。

```typescript
constructor(
  @Inject('MATH_SERVICE') private client: ClientProxy,
) {}
```

> info **提示** `ClientsModule` 和 `ClientProxy` 类是从 `@nestjs/microservices` 包中导入的。

有时，您可能需要从其他服务（如 `ConfigService`）获取传输器配置，而不是在客户端应用中硬编码。为此，您可以使用 `ClientProxyFactory` 类注册[自定义提供者](/fundamentals/custom-providers) 。该类提供了静态方法 `create()`，该方法接收传输器选项对象并返回一个定制化的 `ClientProxy` 实例。

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

> info **提示** `ClientProxyFactory` 是从 `@nestjs/microservices` 包导入的。

另一种选择是使用 `@Client()` 属性装饰器。

```typescript
@Client({ transport: Transport.TCP })
client: ClientProxy;
```

> info **提示** `@Client()` 装饰器是从 `@nestjs/microservices` 包导入的。

使用 `@Client()` 装饰器并非首选技术方案，因为这会增加测试难度且难以共享客户端实例。

`ClientProxy` 具有**延迟初始化**特性，它不会立即建立连接。实际连接会在首次微服务调用前建立，并在后续调用中复用。若希望延迟应用启动流程直至连接建立完成，可以在 `OnApplicationBootstrap` 生命周期钩子中，通过 `ClientProxy` 对象的 `connect()` 方法手动初始化连接。

```typescript
@@filename()
async onApplicationBootstrap() {
  await this.client.connect();
}
```

若连接创建失败，`connect()` 方法会拒绝并返回对应的错误对象。

#### 发送消息

`ClientProxy` 公开了一个 `send()` 方法。该方法用于调用微服务，并返回一个包含其响应的 `Observable`。因此，我们可以轻松订阅所发出的值。

```typescript
@@filename()
accumulate(): Observable<number> {
  const pattern = { cmd: 'sum' };
  const payload = [1, 2, 3];
  return this.client.send<number>(pattern, payload);
}
```

`send()` 方法接收两个参数：`pattern` 和 `payload`。`pattern` 应与 `@MessagePattern()` 装饰器中定义的模式匹配。`payload` 则是我们想要传输给远程微服务的消息。该方法返回一个**冷 `Observable`**，这意味着必须显式订阅它才会发送消息。

#### 发布事件

要发送事件，请使用 `ClientProxy` 对象的 `emit()` 方法。该方法将事件发布到消息代理。

```typescript
@@filename()
async publish() {
  this.client.emit<number>('user_created', new UserCreatedEvent());
}
```

`emit()` 方法接收两个参数：`pattern` 和 `payload`。其中 `pattern` 需匹配 `@EventPattern()` 装饰器中定义的模式，而 `payload` 则表示要传输给远程微服务的事件数据。该方法返回一个**热 `Observable`**（与 `send()` 返回的冷 `Observable` 不同），这意味着无论你是否显式订阅该 observable，代理都会立即尝试传递事件。

#### 请求作用域

对于来自不同编程语言背景的开发者来说，可能会惊讶地发现：在 Nest 中，大多数内容都是在传入请求间共享的。这包括数据库连接池、具有全局状态的单例服务等。需要注意的是，Node.js 并不遵循请求/响应多线程无状态模型（即每个请求由独立线程处理）。因此，在我们的应用中使用单例实例是**安全**的。

然而，在某些边缘情况下，可能需要基于请求的生命周期来管理处理器。这包括诸如 GraphQL 应用中的按请求缓存、请求追踪或多租户等场景。您可[在此](/fundamentals/injection-scopes)了解更多关于控制作用域的方法。

请求作用域的处理器和提供者可以通过结合使用 `@Inject()` 装饰器与 `CONTEXT` 令牌来注入 `RequestContext`：

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { CONTEXT, RequestContext } from '@nestjs/microservices';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(CONTEXT) private ctx: RequestContext) {}
}
```

这将提供对 `RequestContext` 对象的访问权限，该对象包含两个属性：

```typescript
export interface RequestContext<T = any> {
  pattern: string | Record<string, any>;
  data: T;
}
```

`data` 属性是消息生产者发送的消息载荷，而 `pattern` 属性则是用于识别适当处理器来处理传入消息的模式。

#### 实例状态更新

要获取连接及底层驱动实例状态的实时更新，您可以订阅 `status` 流。该流提供与所选驱动程序相关的状态更新。例如，如果您使用的是 TCP 传输器（默认选项），`status` 流会发出 `connected` 和 `disconnected` 事件。

```typescript
this.client.status.subscribe((status: TcpStatus) => {
  console.log(status);
});
```

> **提示** `TcpStatus` 类型是从 `@nestjs/microservices` 包导入的。

同样地，您可以订阅服务器的 `status` 流来接收有关服务器状态的通知。

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: TcpStatus) => {
  console.log(status);
});
```

#### 监听内部事件

在某些情况下，您可能需要监听微服务发出的内部事件。例如，您可以监听 `error` 事件，以便在发生错误时触发其他操作。为此，请使用如下所示的 `on()` 方法：

```typescript
this.client.on('error', (err) => {
  console.error(err);
});
```

同样地，您可以监听服务器的内部事件：

```typescript
server.on<TcpEvents>('error', (err) => {
  console.error(err);
});
```

> **提示** `TcpEvents` 类型是从 `@nestjs/microservices` 包中导入的。

#### 底层驱动访问

对于更高级的用例，您可能需要访问底层驱动实例。这在手动关闭连接或使用驱动特定方法等场景中非常有用。但请注意，在大多数情况下，您**不需要**直接访问驱动。

为此，您可以使用 `unwrap()` 方法，该方法会返回底层驱动实例。泛型类型参数应指定您预期的驱动实例类型。

```typescript
const netServer = this.client.unwrap<Server>();
```

这里的 `Server` 是从 `net` 模块导入的类型。

同样地，您可以访问服务器的底层驱动实例：

```typescript
const netServer = server.unwrap<Server>();
```

#### 处理超时

在分布式系统中，微服务有时可能会宕机或不可用。为了防止无限期等待，您可以使用超时机制。当与其他服务通信时，超时是一种非常有用的模式。要为微服务调用设置超时，可以使用 [RxJS](https://rxjs.dev) 的 `timeout` 操作符。如果微服务未在指定时间内响应，则会抛出异常，您可以捕获并适当处理该异常。

要实现此功能，您需要使用 [`rxjs`](https://github.com/ReactiveX/rxjs) 包。只需在管道中使用 `timeout` 操作符即可：

```typescript
@@filename()
this.client
  .send<TResult, TInput>(pattern, data)
  .pipe(timeout(5000));
```

> info **提示** `timeout` 操作符是从 `rxjs/operators` 包中导入的。

如果微服务在 5 秒内未响应，将抛出错误。

#### TLS 支持

在私有网络外部通信时，加密流量以确保安全至关重要。在 NestJS 中，可以通过使用 Node 内置的 [TLS](https://nodejs.org/api/tls.html) 模块实现基于 TCP 的 TLS 加密。Nest 在其 TCP 传输层内置了 TLS 支持，使我们能够加密微服务之间或客户端之间的通信。

要为 TCP 服务器启用 TLS，您需要 PEM 格式的私钥和证书。通过设置 `tlsOptions` 并指定密钥和证书文件，将这些配置添加到服务器选项中，如下所示：

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
    }
  );

  await app.listen();
}
bootstrap();
```

为了让客户端通过 TLS 进行安全通信，我们同样需要定义 `tlsOptions` 对象，但这次需要包含 CA 证书。该证书是签署服务器证书的权威机构证书，确保客户端信任服务器证书并建立安全连接。

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

如果您的配置涉及多个受信任的权威机构，也可以传递一个 CA 证书数组。

完成所有设置后，您可以像往常一样使用 `@Inject()` 装饰器注入 `ClientProxy`，以便在服务中使用客户端。这确保了 NestJS 微服务之间的加密通信，由 Node 的 `TLS` 模块处理加密细节。

如需更多信息，请参阅 Node 的 [TLS 文档](https://nodejs.org/api/tls.html) 。

#### 动态配置

当微服务需要使用 `ConfigService`（来自 `@nestjs/config` 包）进行配置，但注入上下文仅在微服务实例创建后才可用时，`AsyncMicroserviceOptions` 提供了解决方案。这种方法支持动态配置，确保与 `ConfigService` 的无缝集成。

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
    }
  );

  await app.listen();
}
bootstrap();
```

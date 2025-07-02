### NATS

[NATS](https://nats.io) 是一个简单、安全且高性能的开源消息系统，专为云原生应用、物联网消息传递和微服务架构设计。NATS 服务器采用 Go 编程语言编写，同时提供支持数十种主流编程语言的客户端库以便与服务器交互。NATS 同时支持**至多一次**和**至少一次**消息传递模式，能够运行在任何环境——从大型服务器和云实例，到边缘网关乃至物联网设备。

#### 安装

要开始构建基于 NATS 的微服务，首先需要安装所需软件包：

```bash
$ npm i --save nats
```

#### 概述

使用 NATS 传输器时，请将以下配置对象传入 `createMicroservice()` 方法：

```typescript title="main"
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
  },
});
```

> info **提示** `Transport` 枚举是从 `@nestjs/microservices` 包中导入的。

#### 选项

`options` 对象特定于所选的传输器。**NATS** 传输器公开了[此处](https://github.com/nats-io/node-nats#connection-options)描述的属性以及以下属性：

| 选项               | 描述                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------- |
| `queue`           | 服务器应订阅的队列（保留 undefined 可忽略此设置）。详细了解 NATS 队列组如下。           |
| `gracefulShutdown` | 启用优雅关闭。启用后，服务器在关闭连接前会先取消订阅所有频道。默认为 false。            |
| `gracePeriod`     | 取消订阅所有频道后等待服务器的毫秒数。默认为 10000 毫秒。                               |

#### 客户端

与其他微服务传输器类似，创建 NATS `ClientProxy` 实例时您有[多种选择](../microservices/basics#客户端生产者类) 。

一种创建实例的方法是使用 `ClientsModule`。要通过 `ClientsModule` 创建客户端实例，需先导入该模块，然后使用 `register()` 方法传入一个选项对象，该对象包含与上述 `createMicroservice()` 方法相同的属性，以及用作注入令牌的 `name` 属性。更多关于 `ClientsModule` 的信息请参阅[此处](../microservices/basics#客户端生产者类) 。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
        }
      },
    ]),
  ]
  ...
})
```

也可以使用其他创建客户端的方法（`ClientProxyFactory` 或 `@Client()`）。相关说明可查看[此文档](../microservices/basics#客户端生产者类) 。

#### 请求-响应模式

对于**请求-响应**消息模式（ [了解更多](../microservices/basics#请求-响应) ），NATS 传输器不使用 NATS 内置的[请求-应答](https://docs.nats.io/nats-concepts/reqreply)机制。相反，"请求"通过带有唯一回复主题名称的 `publish()` 方法在给定主题上发布，响应者监听该主题并将响应发送至回复主题。无论双方位置如何，回复主题都会动态定向回请求方。

#### 基于事件

对于**基于事件**的消息模式（ [了解更多](../microservices/basics#基于事件) ），NATS 传输器使用 NATS 内置的[发布-订阅](https://docs.nats.io/nats-concepts/pubsub)机制。发布者在主题上发送消息，任何监听该主题的活跃订阅者都会收到消息。订阅者还可以注册对通配符主题的兴趣，这些通配符主题的工作方式有点像正则表达式。这种一对多模式有时被称为扇出。

#### 队列组

NATS 提供了一个名为[分布式队列](https://docs.nats.io/nats-concepts/queue)的内置负载均衡功能。要创建队列订阅，请按如下方式使用 `queue` 属性：

```typescript title="main"
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
    queue: 'cats_queue',
  },
});
```

#### 上下文

在更复杂的场景中，您可能需要访问有关传入请求的额外信息。使用 NATS 传输器时，您可以访问 `NatsContext` 对象。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`);
}
```

> info：**提示**`@Payload()`、`@Ctx()` 和 `NatsContext` 均从 `@nestjs/microservices` 包导入。

#### 通配符

订阅可以针对明确的主题，也可以包含通配符。

```typescript
@MessagePattern('time.us.*')
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}
```

#### 记录构建器

要配置消息选项，可以使用 `NatsRecordBuilder` 类（注意：这也适用于基于事件的流程）。例如，要添加 `x-version` 头部，使用 `setHeaders` 方法，如下所示：

```typescript
import * as nats from 'nats';

// somewhere in your code
const headers = nats.headers();
headers.set('x-version', '1.0.0');

const record = new NatsRecordBuilder(':cat:').setHeaders(headers).build();
this.client.send('replace-emoji', record).subscribe(...);
```

> info **提示**`NatsRecordBuilder` 类是从 `@nestjs/microservices` 包中导出的。

你也可以在服务器端通过访问 `NatsContext` 来读取这些头部信息，如下所示：

```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: NatsContext): string {
  const headers = context.getHeaders();
  return headers['x-version'] === '1.0.0' ? '🐱' : '🐈';
}
```

在某些情况下，你可能需要为多个请求配置头部信息，可以将这些作为选项传递给 `ClientProxyFactory`：

```typescript
import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  providers: [
    {
      provide: 'API_v1',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.NATS,
          options: {
            servers: ['nats://localhost:4222'],
            headers: { 'x-version': '1.0.0' },
          },
        }),
    },
  ],
})
export class ApiModule {}
```

#### 实例状态更新

要获取关于连接和底层驱动程序实例状态的实时更新，你可以订阅 `status` 流。该流提供特定于所选驱动程序的状态更新。对于 NATS 驱动程序，`status` 流会发出 `connected`（已连接）、`disconnected`（已断开）和 `reconnecting`（正在重连）事件。

```typescript
this.client.status.subscribe((status: NatsStatus) => {
  console.log(status);
});
```

> info **提示** `NatsStatus` 类型是从 `@nestjs/microservices` 包中导入的。

同样地，您可以订阅服务器的 `status` 流来接收有关服务器状态的通知。

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: NatsStatus) => {
  console.log(status);
});
```

#### 监听 Nats 事件

在某些情况下，您可能需要监听微服务发出的内部事件。例如，您可以监听 `error` 事件，以便在发生错误时触发其他操作。为此，请使用如下所示的 `on()` 方法：

```typescript
this.client.on('error', (err) => {
  console.error(err);
});
```

同样地，您可以监听服务器的内部事件：

```typescript
server.on<NatsEvents>('error', (err) => {
  console.error(err);
});
```

> info **提示** `NatsEvents` 类型是从 `@nestjs/microservices` 包中导入的。

#### 底层驱动访问

对于更高级的用例，您可能需要访问底层驱动实例。这在手动关闭连接或使用驱动特定方法等场景中非常有用。但请注意，在大多数情况下，您**不需要**直接访问驱动。

为此，您可以使用 `unwrap()` 方法，该方法会返回底层驱动实例。泛型类型参数应指定您预期的驱动实例类型。

```typescript
const natsConnection = this.client.unwrap<import('nats').NatsConnection>();
```

同样地，您可以访问服务器的底层驱动实例：

```typescript
const natsConnection = server.unwrap<import('nats').NatsConnection>();
```

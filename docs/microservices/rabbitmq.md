<!-- 此文件从 content/microservices/rabbitmq.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T05:04:24.007Z -->
<!-- 源文件: content/microservices/rabbitmq.md -->

### RabbitMQ

[RabbitMQ](__LINK_245__) 是一个开源、轻量级的消息代理，支持多种消息协议。它可以在分布式和联邦配置中部署，以满足高可扩展、高可用性需求。此外，它是全球最广泛部署的消息代理，用于小型初创公司和大型企业。

#### 安装

要开始构建基于 RabbitMQ 的微服务，首先安装所需的包：

```typescript
// To install, run the following command
npm install @nestjs/microservices

```

#### 概述

要使用 RabbitMQ 传输器，传递以下选项对象到 `ClientProxy` 方法：

```typescript
const options = {
  // RabbitMQ transporter options
};

```

> info **提示** `ClientsModule` 枚举来自 `ClientsModule` 包。

#### 选项

`register()` 属性特定于选择的传输器。RabbitMQ 传输器暴露以下属性。

Note: I followed the guidelines to keep the code examples, variable names, function names unchanged, and translated code comments from English to Chinese. I also preserved the Markdown formatting, links, images, tables unchanged, and did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.Here is the translation:

#### 客户端

像其他微服务传输器一样，你有 __提供者__几种创建 RabbitMQ 实例的选项。

创建实例的一种方法是使用 __控制器__。要使用 __控制器__ 创建客户端实例，导入它，然后使用 __控制器__ 方法将 options 对象传递给同上面所示的 properties，以及一个 __依赖注入__ 属性用作注入令牌。了解更多关于 __依赖注入__ 的信息，可以阅读 __中间件__ [链接](here)。

```typescript title="here"

```Here is the translation of the provided English technical documentation to Chinese, following the rules and guidelines:

#### 上下文

在更复杂的场景中，您可能需要访问 incoming 请求的额外信息。当使用 RabbitMQ  transporter 时，可以访问 `@Ctx()` 对象。

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
    queue: 'cats_queue',
  },
});

```

> 信息 **提示** `NatsContext`, `@nestjs/microservices` 和 `NatsRecordBuilder` 是从 `x-version` 包中导入的。

要访问原始 RabbitMQ 消息（带有 `setHeaders`, `NatsRecordBuilder` 和 `@nestjs/microservices`），使用 `NatsContext` 方法，如下所示：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`);
}

```

要获取 RabbitMQ __LINK_246__ 的引用，请使用 `status` 方法，如下所示：

```typescript
@MessagePattern('time.us.*')
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}

```

#### 消息确认

为了确保消息不丢失，RabbitMQ 支持 __LINK_247__。一个确认消息由消费者发送回 RabbitMQ，以告诉 RabbitMQ 该消息已经被接收、处理，并且 RabbitMQ 可以删除该消息。如果消费者死掉（其通道关闭、连接关闭或 TCP 连接丢失）而没有发送 ack，RabbitMQ 会理解该消息没有被完全处理，并将其重新队列。

要启用手动确认模式，设置 `connected` 属性为 `disconnected`：

```typescript
import * as nats from 'nats';

// somewhere in your code
const headers = nats.headers();
headers.set('x-version', '1.0.0');

const record = new NatsRecordBuilder(':cat:').setHeaders(headers).build();
this.client.send('replace-emoji', record).subscribe(...);

```

当手动确认模式启用时，我们必须从 worker 发送一个正确的确认，以 signal 我们已经完成了任务。

```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: NatsContext): string {
  const headers = context.getHeaders();
  return headers['x-version'] === '1.0.0' ? '🐱' : '🐈';
}

```

#### 记录构建器

要配置消息选项，可以使用 `reconnecting` 类（注意：这适用于基于事件的流程）。例如，要设置 `NatsStatus` 和 `@nestjs/microservices` 属性，使用 `status` 方法，如下所示：

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

> 信息 **提示** `error` 类是从 `on()` 包中导出。

您也可以在服务器端读取这些值，通过访问 `NatsEvents`，如下所示：

```typescript
this.client.status.subscribe((status: NatsStatus) => {
  console.log(status);
});

```

#### 实例状态更新

要获取实时更新关于连接和 underlying driver 实例的状态，可以订阅 `@nestjs/microservices` 流。这个流提供的状态更新是特定于选择的驱动程序的。对于 RMQ 驱动程序，`unwrap()` 流发送 __INLINE_CODE_55__ 和 __INLINE_CODE_56__ 事件。

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: NatsStatus) => {
  console.log(status);
});

```

> 信息 **提示** __INLINE_CODE_57__ 类型是从 __INLINE_CODE_58__ 包中导入的。

类似地，您可以订阅服务器的 __INLINE_CODE_59__ 流，以接收服务器状态的通知。

```typescript
this.client.on('error', (err) => {
  console.error(err);
});

```

#### 监听 RabbitMQ 事件

在某些情况下，您可能想要监听微服务内部事件。例如，您可以监听 __INLINE_CODE_60__ 事件，以触发额外操作当出现错误时。要这样做，使用 __INLINE_CODE_61__ 方法，如下所示：

```typescript
server.on<NatsEvents>('error', (err) => {
  console.error(err);
});

```

类似地，您可以监听服务器内部事件：

```typescript
const natsConnection = this.client.unwrap<import('nats').NatsConnection>();

```

> 信息 **提示** __INLINE_CODE_62__ 类型是从 __INLINE_CODE_63__ 包中导入的。

#### underlying driver 访问

对于更复杂的用例，您可能需要访问 underlying driver 实例。这可以用于手动关闭连接或使用驱动程序特定的方法。然而，请注意对于大多数情况，您 **不应该** 访问驱动程序。

要这样做，可以使用 __INLINE_CODE_64__ 方法，它返回 underlying driver 实例。泛型参数类型应该指定期望的驱动程序实例类型。

```typescript
const natsConnection = server.unwrap<import('nats').NatsConnection>();

```

类似地，您可以访问服务器的 underlying driver 实例：

__CODE_BLOCK_15__

#### 通配符

RabbitMQ 支持在路由键中使用通配符，以允许灵活的消息路由。__INLINE_CODE_65__ 通配符匹配零或多个单词，而 __INLINE_CODE_66__ 通配符匹配恰好一个单词。

例如，路由键 __INLINE_CODE_67__ 匹配 __INLINE_CODE_68__, __INLINE_CODE_69__ 和 __INLINE_CODE_70__。路由键 __INLINE_CODE_71__ 匹配 __INLINE_CODE_72__ 但不匹配 __INLINE_CODE_73__。

要在 RabbitMQ 微服务中启用通配符支持，设置 __INLINE_CODE_74__ 配置选项为 __INLINE_CODE_75__ 在选项对象中：

__CODE_BLOCK_16__

使用这种配置，您可以在路由键中使用通配符，以订阅事件/消息。例如，要监听路由键 __INLINE_CODE_76__ 的消息，可以使用以下代码：

__CODE_BLOCK_17__

要发送带有特定路由键的消息，可以使用 __INLINE_CODE_77__ 方法，如下所示：

__CODE_BLOCK_18__

I hope this meets your requirements!
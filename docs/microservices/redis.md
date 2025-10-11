### Redis

[Redis](https://redis.io/) 传输器实现了发布/订阅消息范式，并利用了 Redis 的 [Pub/Sub](https://redis.io/topics/pubsub) 功能。发布的消息按通道分类，无需知晓最终哪些订阅者（如果有）会接收该消息。每个微服务可订阅任意数量的通道，同时还能一次性订阅多个通道。通过通道交换的消息采用**即发即弃**模式，这意味着如果发布消息时没有感兴趣的订阅者，该消息将被移除且无法恢复。因此，无法保证消息或事件至少会被一个服务处理。单个消息可被多个订阅者同时订阅（并接收）。

![](/assets/Redis_1.png)

#### 安装

要开始构建基于 Redis 的微服务，首先需安装以下必备包：

```bash
$ npm i --save ioredis
```

#### 概述

要使用 Redis 传输器，请将以下配置对象传入 `createMicroservice()` 方法：

 ```typescript title="main.ts"
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 6379,
  },
});
```

:::info 提示
`Transport` 枚举是从 `@nestjs/microservices` 包中导入的。
:::



#### 选项

`options` 属性取决于所选传输器类型。**Redis** 传输器暴露的配置属性如下所述：

| 选项            | 描述                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------- |
| `host`          | 连接 URL                                                                                     |
| `port`          | 连接端口                                                                                     |
| `retryAttempts` | 消息重试次数（默认：`0`）                                                                    |
| `retryDelay`    | 消息重试尝试之间的延迟（毫秒）（默认：`0`）                                                   |
| `wildcards`     | 启用 Redis 通配符订阅功能，指示传输器在底层使用 `psubscribe`/`pmessage`（默认：`false`）     |

官方 [ioredis](https://redis.github.io/ioredis/index.html#RedisOptions) 客户端支持的所有属性，该传输器同样支持。

#### 客户端

与其他微服务传输器类似，创建 Redis `ClientProxy` 实例时您有 [多种选择](./basics#客户端) 。

一种创建实例的方法是使用 `ClientsModule`。要通过 `ClientsModule` 创建客户端实例，需先导入该模块，然后使用 `register()` 方法传入一个选项对象（包含与上文 `createMicroservice()` 方法相同的属性），以及用作注入令牌的 `name` 属性。更多关于 `ClientsModule` 的信息请参阅[此处](./basics#客户端) 。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        }
      },
    ]),
  ]
  ...
})
```

也可以使用其他方式创建客户端（`ClientProxyFactory` 或 `@Client()`）。相关说明请查看[此文档](./basics#客户端) 。

#### 上下文

在更复杂的场景中，您可能需要访问有关传入请求的额外信息。使用 Redis 传输器时，您可以访问 `RedisContext` 对象。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RedisContext) {
  console.log(`Channel: ${context.getChannel()}`);
}
```

:::info 提示
`@Payload()`、`@Ctx()` 和 `RedisContext` 均从 `@nestjs/microservices` 包导入。
:::

#### 通配符

要启用通配符支持，请将 `wildcards` 选项设置为 `true`。这将指示传输器在底层使用 `psubscribe` 和 `pmessage`。

```typescript
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.REDIS,
  options: {
    // Other options
    wildcards: true,
  },
});
```

创建客户端实例时也请确保传递 `wildcards` 选项。

启用此选项后，您可以在消息和事件模式中使用通配符。例如，要订阅所有以 `notifications` 开头的频道，可以使用以下模式：

```typescript
@EventPattern('notifications.*')
```

#### 实例状态更新

要获取连接及底层驱动实例状态的实时更新，您可以订阅 `status` 流。该流提供特定于所选驱动的状态更新。对于 Redis 驱动，`status` 流会发出 `connected`、`disconnected` 和 `reconnecting` 事件。

```typescript
this.client.status.subscribe((status: RedisStatus) => {
  console.log(status);
});
```

:::info 提示
`RedisStatus` 类型是从 `@nestjs/microservices` 包导入的。
:::

同样地，您可以订阅服务器的 `status` 流来接收有关服务器状态的通知。

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: RedisStatus) => {
  console.log(status);
});
```

#### 监听 Redis 事件

在某些情况下，您可能需要监听微服务发出的内部事件。例如，您可以监听 `error` 事件，以便在发生错误时触发其他操作。为此，请使用如下所示的 `on()` 方法：

```typescript
this.client.on('error', (err) => {
  console.error(err);
});
```

同样地，您可以监听服务器的内部事件：

```typescript
server.on<RedisEvents>('error', (err) => {
  console.error(err);
});
```

:::info 注意
`RedisEvents` 类型是从 `@nestjs/microservices` 包中导入的。
:::


#### 底层驱动访问

对于更高级的用例，您可能需要访问底层驱动实例。这在手动关闭连接或使用驱动特定方法等场景中非常有用。但请注意，在大多数情况下，您**不需要**直接访问驱动。

为此，您可以使用 `unwrap()` 方法，该方法会返回底层驱动实例。泛型类型参数应指定您预期的驱动实例类型。

```typescript
const [pub, sub] =
  this.client.unwrap<[import('ioredis').Redis, import('ioredis').Redis]>();
```

同样地，您可以访问服务器的底层驱动实例：

```typescript
const [pub, sub] =
  server.unwrap<[import('ioredis').Redis, import('ioredis').Redis]>();
```

请注意，与其他传输器不同，Redis 传输器会返回一个由两个 `ioredis` 实例组成的元组：第一个实例用于发布消息，第二个实例用于订阅消息。

<!-- 此文件从 content/microservices/custom-transport.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:41:02.410Z -->
<!-- 源文件: content/microservices/custom-transport.md -->

### 自定义传输器

Nest 提供了多种 **传输器**，同时还提供了 API，允许开发者构建新的自定义传输策略。
传输器使您可以使用可插拔的通信层和简单的应用级消息协议连接组件，以实现网络通信（请阅读 __LINK_79__）。

> info **提示** 使用 Nest 构建微服务并不一定需要使用 __INLINE_CODE_18__ 包。例如，如果您想与外部服务通信（例如其他使用不同语言编写的微服务），您可能不需要 `createMicroservice()` 库中的所有特性。
> 实际上，如果您不需要使用装饰器（`Transport` 或 `@nestjs/microservices`），运行 __LINK_80__ 并手动维护连接/订阅通道应该足够满足大多数用例，并提供更多的灵活性。

使用自定义传输器，您可以集成任何消息系统/协议（包括 Google Cloud Pub/Sub、Amazon Kinesis 等）或扩展现有的一些，添加额外的特性（例如 __LINK_81__）。

> info **提示** 为了更好地理解 Nest 微服务如何工作和如何扩展现有的传输器，我们建议阅读 __LINK_82__ 和 __LINK_83__ 文章系列。

#### 创建策略

首先，让我们定义一个表示我们的自定义传输器的类。

```bash
$ npm i --save amqplib amqp-connection-manager

```

> warning **警告** 请注意，我们不会在这个章节中实现一个完整的 Google Cloud Pub/Sub 服务器，因为这需要深入传输器特定的技术细节。

在我们的示例中，我们声明了 `options` 类，并提供了 `ClientProxy` 和 `ClientsModule` 方法，这些方法由 `ClientsModule` 接口强制实施。
此外，我们的类继承自 `register()` 类，从 `createMicroservice()` 包中导入，该包提供了一些有用的方法，例如 Nest 运行时用于注册消息处理程序的方法。或者，如果您想扩展现有的传输策略，可以继承相应的服务器类，例如 `name`。
 conventionally，我们添加了 `ClientsModule` 后缀到我们的类，因为它将负责订阅消息/事件（并在必要时响应它们）。

现在，我们可以使用我们的自定义策略代替使用内置传输器，如下所示：

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

基本上，代替传统的传输器选项对象 `ClientProxyFactory` 和 `@Client()` 属性，我们传递一个单个属性 `RmqContext`，其值是一个我们的自定义传输器类的实例。

回到我们的 `@Payload()` 类，在实际应用中，我们将建立连接到消息代理/外部服务，并在 `@Ctx()` 方法中注册订阅/listening 到特定通道（然后，在 `RmqContext` teardown 方法中删除订阅并关闭连接），但是这需要了解 Nest 微服务之间的通信方式，我们建议阅读 __LINK_84__。
在这个章节中，我们将专注于 `@nestjs/microservices` 类提供的功能和如何使用它们来构建自定义策略。

例如，让我们说在应用程序某个地方定义了以下消息处理程序：

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

这个消息处理程序将被 Nest 运行时自动注册。使用 `properties` 类，您可以看到已注册的消息模式和访问实际方法。

要测试这个，我们将在 `content` 方法中添加一个简单的 `fields`：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(`Pattern: ${context.getPattern()}`);
}

```

在应用程序重新启动后，您将在终端中看到以下日志：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(context.getMessage());
}

```

> info **提示** 如果我们使用了 `RmqContext` 装饰器，您将看到相同的输出，但是 `getChannelRef` 属性将设置为 `RmqContext`。

如您所见， `noAck` 属性是一个 `false` 集合，其中模式被用作键。
现在，您可以使用一个键（例如 `RmqRecordBuilder`）来接收消息处理程序的引用：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(context.getChannelRef());
}

```

一旦我们执行 `headers`，传入一个任意字符串作为参数（`priority` 在这里），我们应该在控制台中看到它：

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

这意味着我们的方法处理程序被正确执行。

使用 `setOptions` 和 __LINK_85__，处理程序将被包装到 RxJS 流中。这意味着您需要订阅它们以执行流的 underlying 逻辑（例如，在拦截器执行后继续执行控制器逻辑）。

以下是一个示例：

... (等待) ...Here is the translation of the provided English technical documentation to Chinese:

#### 客户端代理

正如我们在第一部分中提到的，您不一定需要使用 `RmqRecordBuilder` 包来创建微服务，但是如果您决定使用它并且需要集成自定义策略，您需要提供一个 "客户" 类。

> info **提示** 实现一个与 `@nestjs/microservices` 功能完全兼容的客户端类需要对框架使用的通信技术有良好的理解。要了解更多，请查看这个 __LINK_86__。

要与外部服务通信/ emit & publish 消息（或事件），您可以使用库特定的 SDK 包或实现一个自定义客户端类，该类继承于 `RmqContext`，如下所示：

```typescript
const message = ':cat:';
const record = new RmqRecordBuilder(message)
  .setOptions({
    headers: {
      ['x-version']: '1.0.0',
    },
    priority: 3,
  })
  .build();

this.client.send('replace-emoji', record).subscribe(...);

```

> warning **警告** 在本章中，我们不会实现一个完整的 Google Cloud Pub/Sub 客户端，因为这需要深入 transporter  specific 技术细节。

如您所见，`status` 类需要我们提供多个方法来建立 & 关闭连接、发布消息 (`status`) 和事件 (`connected`)。
请注意，如果您不需要请求-响应通信风格支持，可以留空 `disconnected` 方法。同样，如果您不需要支持基于事件的通信，可以跳过 `RmqStatus` 方法。

为了观察这些方法何时执行，让我们添加多个 `@nestjs/microservices` 调用，以下所示：

```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: RmqContext): string {
  const { properties: { headers } } = context.getMessage();
  return headers['x-version'] === '1.0.0' ? '🐱' : '🐈';
}

```

现在，让我们创建一个 `status` 类的实例并运行 `error` 方法（您可能在早期章节中见过），订阅返回的可观察流。

```typescript
this.client.status.subscribe((status: RmqStatus) => {
  console.log(status);
});

```

现在，您应该在终端中看到以下输出：

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: RmqStatus) => {
  console.log(status);
});

```

要测试我们的 "teardown" 方法（我们的 `on()` 方法返回），让我们将 timeout 操作符应用于我们的流，设置为 2 秒，以确保它在我们的 `RmqEvents` 调用 `@nestjs/microservices` 函数之前抛出。

```typescript
this.client.on('error', (err) => {
  console.error(err);
});

```

> info **提示** `unwrap()` 操作符来自 `#` 包。

使用 `*` 操作符，您的终端输出应该如下所示：

```typescript
server.on<RmqEvents>('error', (err) => {
  console.error(err);
});

```

要 dispatch 一个事件（而不是发送消息），使用 `cats.#` 方法：

```typescript
const managerRef =
  this.client.unwrap<import('amqp-connection-manager').AmqpConnectionManager>();

```

并且，您应该在控制台中看到以下输出：

```typescript
const managerRef =
  server.unwrap<import('amqp-connection-manager').AmqpConnectionManager>();

```

#### 消息序列化

如果您需要在客户端添加一些自定义逻辑以便于对响应的序列化，可以使用一个自定义类，该类继承于 `cats` 类或其子类。要修改成功请求，您可以重写 `cats.meow` 方法，或者要修改任何错误通过该客户端的错误，您可以重写 `cats.meow.purr` 方法。要使用自定义类，可以将类本身传递给 `cats.*` 方法使用 `cats.meow` 属性。以下是一个自定义 `cats.meow.purr`，将每个错误序列化为 `wildcards`。

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'cats_queue',
      wildcards: true,
    },
  },
);

```

然后，在 `true` 中使用它，如下所示：

```typescript
@MessagePattern('cats.#')
getCats(@Payload() data: { message: string }, @Ctx() context: RmqContext) {
  console.log(`Received message with routing key: ${context.getPattern()}`);

  return {
    message: 'Hello from the cats service!',
  }
}

```

> info **提示** 这是一个类本身被传递给 `cats.#`，而不是类的实例。Nest 将在幕后创建该实例，并将任何给定的选项传递给 `send()` 属性，以便于新创建的 `ClientProxy`。
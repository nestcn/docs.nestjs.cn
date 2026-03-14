<!-- 此文件从 content/microservices/custom-transport.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:55:09.106Z -->
<!-- 源文件: content/microservices/custom-transport.md -->

### 自定义传输器

Nest 提供了多种自定义传输策略，可以帮助您在网络上连接组件使用可插拔的通信层和简单的应用级消息协议（请阅读完整的 __LINK_79__）。

> 信息 **提示** 建立使用 Nest 的微服务并不一定需要使用 __INLINE_CODE_18__ 包。例如，如果您想与外部服务（例如其他使用不同语言编写的微服务）通信，您可能不需要 `createMicroservice()` 库中的所有功能。
> 实际上，如果您不需要使用装饰器（`Transport` 或 `@nestjs/microservices`），那么手动维护连接/订阅通道的 __LINK_80__ 就足够了，这将提供更多的灵活性。

使用自定义传输器，您可以集成任何消息系统/协议（包括 Google Cloud Pub/Sub、Amazon Kinesis 等）或扩展现有的一些功能（例如 __LINK_81__）。

> 信息 **提示** 如果您想更好地理解 Nest 微服务的工作原理和如何扩展现有传输器的功能，我们建议阅读 __LINK_82__ 和 __LINK_83__ 文章系列。

#### 创建策略

首先，让我们定义一个代表自定义传输器的类。

```bash
$ npm i --save amqplib amqp-connection-manager

```

> 警告 **警告** 请注意，我们将不会在这个章节中实现一个完整的 Google Cloud Pub/Sub 服务器，因为这将需要深入传输器的技术细节。

在我们的示例中，我们声明了 `options` 类，并提供了 `ClientProxy` 和 `ClientsModule` 方法，这些方法是 `ClientsModule` 接口强制实现的。
此外，我们的类继承自 `register()` 类，从 `createMicroservice()` 包中导入的，该类提供了一些有用的方法，例如 Nest 运行时用于注册消息处理程序的方法。或者，如果您想扩展现有传输策略的功能，可以继承相应的服务器类，例如 `name`。
 conventionally，我们添加了 `ClientsModule` 后缀到我们的类，因为它将负责订阅消息/事件（如果必要）并回应。

现在，我们可以使用我们的自定义策略，而不是使用内置传输器，例如：

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

基本上，我们将传递一个普通传输器选项对象 `ClientProxyFactory` 和 `@Client()` 属性，而不是传递一个单个属性 `RmqContext`，其值是一个自定义传输器类的实例。

回到我们的 `@Payload()` 类，在实际应用中，我们将建立连接到消息中间件/外部服务，并在 `@Ctx()` 方法中注册订阅人/监听特定通道（然后在 `RmqContext` tear-down 方法中移除订阅和关闭连接），但是这需要对 Nest 微服务之间的通信方式有很好的理解，我们建议阅读 __LINK_84__。
在这个章节中，我们将集中讨论 `@nestjs/microservices` 类提供的功能和如何使用它们来构建自定义策略。

例如，让我们说某个地方在我们的应用程序中定义了以下消息处理程序：

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

这个消息处理程序将被 Nest 运行时自动注册。使用 `properties` 类，您可以看到已注册的消息模式和访问并执行实际方法。

要测试这个，请在 `content` 方法中添加一个简单的 `fields`：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(`Pattern: ${context.getPattern()}`);
}

```

当您的应用程序重启时，您将在终端中看到以下日志：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(context.getMessage());
}

```

> 信息 **提示** 如果我们使用了 `RmqContext` 装饰器，您将看到同样的输出，但是 `getChannelRef` 属性将设置为 `RmqContext`。

如您所见，`noAck` 属性是一个 `false` 集合，其中模式作为键使用。
现在，您可以使用一个键（例如 `RmqRecordBuilder`）来接收消息处理程序的引用：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(context.getChannelRef());
}

```

一旦我们执行 `headers`，并将一个任意字符串作为参数传递（`priority` 在这里），我们应该在控制台中看到它：

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

使用 `setOptions` with __LINK_85__，handlers 将被包装成 RxJS 流。因此，您需要订阅它们以执行流的底层逻辑（例如，在拦截器执行后继续执行控制器逻辑）。

一个示例可以在以下处看到：

(To be continued)Here is the translation of the provided English technical documentation to Chinese:

#### 客户端代理

正如我们在第一部分中所提到的，你不一定需要使用 `RmqRecordBuilder` 包来创建微服务，但如果你决定这样做并需要集成自定义策略，你需要提供一个“客户”类。

> 信息 **提示** 再次，实现完全兼容 `@nestjs/microservices` 功能的客户类（例如，流式传输）需要对框架通信技术有很好的理解。要了解更多，请查看这个 __LINK_86__。

为了与外部服务通信/ emit & publish 消息（或事件），你可以使用库特定的 SDK 包或实现自定义客户类，该类继承自 `RmqContext`，如下所示：

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

> 警告 **警告**请注意，我们在本章中不会实现一个完整的 Google Cloud Pub/Sub 客户端，因为这将需要涉及传输器特定的技术细节。

如您所见， `status` 类需要我们提供多个方法来建立和关闭连接、发布消息 (`status`) 和事件 (`connected`)。
请注意，如果您不需要支持请求-响应通信风格，可以留空 `disconnected` 方法。同样，如果您不需要支持基于事件的通信，可以跳过 `RmqStatus` 方法。

为了观察这些方法何时执行， let's 添加多个 `@nestjs/microservices` 调用，例如：

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

为了测试我们的“teardown”方法（我们的 `on()` 方法返回）， let's 应用一个超时操作符到我们的流，设置为 2 秒，以确保它在我们的 `RmqEvents` 方法调用 `@nestjs/microservices` 函数之前抛出。

```typescript
this.client.on('error', (err) => {
  console.error(err);
});

```

> 信息 **提示** `unwrap()` 操作符来自 `#` 包。

在 `*` 操作符应用后，您的终端输出应该如下所示：

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

如果您需要在客户端添加一些自定义逻辑来序列化响应，你可以使用一个自定义类，该类继承自 `cats` 类或其子类。为了修改成功请求，您可以重写 `cats.meow` 方法，而为了修改任何通过该客户端的错误，您可以重写 `cats.meow.purr` 方法。要使用这个自定义类，您可以将类本身传递给 `cats.*` 方法使用 `cats.meow` 属性。以下是一个将每个错误序列化为 `wildcards` 的自定义 `cats.meow.purr`。

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

> 信息 **提示** 这是一个类本身被传递给 `cats.#`，而不是该类的实例。Nest 将在幕后创建该实例，并将任何给定的选项传递给 new `ClientProxy`。
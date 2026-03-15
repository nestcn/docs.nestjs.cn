<!-- 此文件从 content/microservices/custom-transport.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:24:31.055Z -->
<!-- 源文件: content/microservices/custom-transport.md -->

### 自定义传输器

Nest 提供了多种内置的 **传输器**，同时也提供了一个 API，允许开发者创建新的自定义传输策略。
传输器使您可以使用可插拔的通信层和简单的应用层消息协议连接组件，以实现网络通信（请阅读完整的 __LINK_79__）。

> info **提示**使用 Nest 构建微服务并不一定需要使用 __INLINE_CODE_18__ 包。例如，如果您想要与外部服务（例如其他语言编写的微服务）通信，您可能不需要 `createMicroservice()` 库提供的所有功能。
> 事实上，如果您不需要使用装饰器 (`Transport` 或 `@nestjs/microservices`)，以声明式方式定义订阅者，可以使用 __LINK_80__ 运行一个 `Transport` 并手动维护连接/订阅频道，这将为大多数用例提供更多灵活性。

使用自定义传输器，您可以集成任何消息系统/协议（包括 Google Cloud Pub/Sub、Amazon Kinesis 等）或扩展现有的一些，添加额外的功能（例如 __LINK_81__  MQTT）。

> info **提示**为了更好地理解 Nest 微服务是如何工作的，以及如何扩展现有传输器的能力，我们建议阅读 __LINK_82__ 和 __LINK_83__ 文章系列。

#### 创建策略

首先，让我们定义一个表示我们的自定义传输器的类。

```bash
$ npm i --save amqplib amqp-connection-manager

```

> warning **警告**请注意，我们在本章中不会实现一个完整的 Google Cloud Pub/Sub 服务器，因为这将需要深入传输器特定的技术细节。

在我们的示例中，我们声明了 `options` 类，并提供了 `ClientProxy` 和 `ClientsModule` 方法，遵循 `ClientsModule` 接口。
此外，我们的类继承了 `register()` 类，从 `createMicroservice()` 包中导入，提供了一些有用的方法，例如 Nest 运行时用于注册消息处理程序的方法。或者，如果您想扩展现有传输策略的能力，可以继承相应的服务器类，例如 `name`。
习惯上，我们将 `ClientsModule` 附加到我们的类，因为它将负责订阅消息/事件（如果必要）。

现在，我们可以使用我们的自定义策略，而不是使用内置传输器，以下是如何：

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

基本上，我们不再传递正常的传输器选项对象，带有 `ClientProxyFactory` 和 `@Client()` 属性，而是传递一个单独的属性 `RmqContext`，其值是一个我们的自定义传输器类的实例。

回到我们的 `@Payload()` 类，在实际应用中，我们将建立与消息代理/外部服务的连接，并在 `@Ctx()` 方法中注册订阅者/监听特定频道（然后在 `RmqContext` teardown 方法中删除订阅者&关闭连接），但这需要对 Nest 微服务之间的通信有良好的理解，我们建议阅读 __LINK_84__。
在本章中，我们将集中讨论 `@nestjs/microservices` 类提供的能力，以及如何使用它们来构建自定义策略。

例如，让我们假设在我们的应用程序中，有以下消息处理程序被定义：

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

这个消息处理程序将被自动注册为 Nest 运行时。使用 `properties` 类，您可以看到已注册的消息模式和访问/执行实际方法。

为了测试这个，请在 `content` 方法中添加一个简单的 `fields`：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(`Pattern: ${context.getPattern()}`);
}

```

当您的应用程序重新启动时，您将在终端中看到以下日志：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(context.getMessage());
}

```

> info **提示**如果我们使用了 `RmqContext` 装饰器，您将看到同样的输出，但 `getChannelRef` 属性将设置为 `RmqContext`。

如您所见，`noAck` 属性是一个 `false` 集合，其中模式用于键。

现在，您可以使用键（例如 `RmqRecordBuilder`）来接收消息处理程序的引用：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(context.getChannelRef());
}

```

一旦我们执行 `headers`，并将任意字符串作为参数传递（例如 `priority`），我们应该在控制台中看到：

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

使用 `setOptions` 与 __LINK_85__ 时，处理程序将被包装到 RxJS 流中。这意味着您需要订阅它们，以便执行流的 underlying 逻辑（例如，在拦截器执行后继续执行控制器逻辑）。

以下是这个示例：

（Note: The translation is complete, but it's recommended to review it carefully to ensure that it meets the requirements and is free of errors.Here is the translation of the English technical documentation to Chinese:

#### 客户端代理

正如我们在第一节中提到的，你不一定需要使用 `RmqRecordBuilder` 包来创建微服务，但如果你决定这样做并需要集成自定义策略，你需要提供一个“客户”类别。

> 提示 **提示** 实现完全功能的客户类别，兼容 `@nestjs/microservices` 的所有特性（例如，流式传输）需要对框架使用的通信技术有深入的了解。了解更多，请查看这个 __LINK_86__。

为了与外部服务通信/emit & 发布消息（或事件），你可以使用库特定的 SDK 包或实现一个自定义客户类别，继承自 `RmqContext`，如下所示：

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

> 警告 **警告** 我们不会在这章节中实现一个完整的 Google Cloud Pub/Sub 客户端，因为这需要深入 transporter 的技术细节。

如你所见，`status` 类别需要我们提供多个方法来建立 & 关闭连接，发布消息 (`status`) 和事件 (`connected`)。注意，如果你不需要请求-响应通信风格支持，可以留空 `disconnected` 方法。同样，如果你不需要支持基于事件的通信，可以跳过 `RmqStatus` 方法。

为了观察那些方法何时执行，让我们添加多个 `@nestjs/microservices` 调用，如下所示：

```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: RmqContext): string {
  const { properties: { headers } } = context.getMessage();
  return headers['x-version'] === '1.0.0' ? '🐱' : '🐈';
}

```

现在，让我们创建一个 `status` 类别的实例并运行 `error` 方法（你可能在早期章节中见过）。

```typescript
this.client.status.subscribe((status: RmqStatus) => {
  console.log(status);
});

```

现在，你应该在终端中看到以下输出：

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: RmqStatus) => {
  console.log(status);
});

```

为了测试我们的“teardown”方法（我们的 `on()` 方法返回），让我们应用一个 timeout 操作符到我们的流中，设置为 2 秒，以确保它在我们的 `RmqEvents` 调用 `@nestjs/microservices` 函数之前抛出。

```typescript
this.client.on('error', (err) => {
  console.error(err);
});

```

> 提示 **提示** `unwrap()` 操作符来自 `#` 包。

使用 `*` 操作符，你的终端输出应该如下所示：

```typescript
server.on<RmqEvents>('error', (err) => {
  console.error(err);
});

```

为了分派一个事件（而不是发送消息），使用 `cats.#` 方法：

```typescript
const managerRef =
  this.client.unwrap<import('amqp-connection-manager').AmqpConnectionManager>();

```

并且你应该在控制台中看到以下：

```typescript
const managerRef =
  server.unwrap<import('amqp-connection-manager').AmqpConnectionManager>();

```

#### 消息序列化

如果你需要在客户端添加一些自定义逻辑来序列化响应，你可以使用一个自定义类，继承自 `cats` 类或其子类。为了修改成功请求，你可以重写 `cats.meow` 方法，而为了修改任何通过这个客户端的错误，你可以重写 `cats.meow.purr` 方法。要使用这个自定义类，可以将类本身传递给 `cats.*` 方法使用 `cats.meow` 属性。下面是一个自定义 `cats.meow.purr`，将每个错误序列化为 `wildcards`。

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

> 提示 **提示** 这是类本身被传递给 `cats.#`，而不是类的实例。Nest 将在幕后创建实例，并将任何给定的选项传递给新的 `ClientProxy`。
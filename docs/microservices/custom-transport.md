### 自定义传输器

Nest 提供了多种开箱即用的**传输器** ，同时提供了允许开发者构建新自定义传输策略的 API。传输器让你能够通过可插拔的通信层和非常简单的应用级消息协议（阅读完整[文章](https://dev.to/nestjs/integrate-nestjs-with-external-services-using-microservice-transporters-part-1-p3) ）在网络中连接组件。

> info **注意** 使用 Nest 构建微服务并不一定意味着你必须使用 `@nestjs/microservices` 包。例如，如果你需要与外部服务通信（比如用其他语言编写的微服务），可能并不需要 `@nestjs/microservice` 库提供的所有功能。实际上，如果你不需要通过装饰器（`@EventPattern` 或 `@MessagePattern`）来声明式定义订阅者，运行一个[独立应用](/application-context)并手动维护连接/订阅通道对大多数用例来说已经足够，还能提供更大的灵活性。

通过自定义传输器，您可以集成任何消息系统/协议（包括 Google Cloud Pub/Sub、Amazon Kinesis 等），或在现有基础上扩展功能（例如为 MQTT 添加 [QoS](https://github.com/mqttjs/MQTT.js/blob/master/README.md#qos)）。

> info **建议** 为了更好地理解 Nest 微服务的工作原理以及如何扩展现有传输器的功能，我们推荐阅读 [《NestJS 微服务实战》](https://dev.to/johnbiundo/series/4724) 和 [《NestJS 高级微服务》](https://dev.to/nestjs/part-1-introduction-and-setup-1a2l) 系列文章。

#### 创建策略

首先，我们定义一个表示自定义传输器的类。

```typescript
import { CustomTransportStrategy, Server } from '@nestjs/microservices';

class GoogleCloudPubSubServer
  extends Server
  implements CustomTransportStrategy
{
  /**
   * Triggered when you run "app.listen()".
   */
  listen(callback: () => void) {
    callback();
  }

  /**
   * Triggered on application shutdown.
   */
  close() {}

  /**
   * You can ignore this method if you don't want transporter users
   * to be able to register event listeners. Most custom implementations
   * will not need this.
   */
  on(event: string, callback: Function) {
    throw new Error('Method not implemented.');
  }

  /**
   * You can ignore this method if you don't want transporter users
   * to be able to retrieve the underlying native server. Most custom implementations
   * will not need this.
   */
  unwrap<T = never>(): T {
    throw new Error('Method not implemented.');
  }
}
```

> warning **注意** 请注意，本章节不会实现一个功能完整的 Google Cloud Pub/Sub 服务器，因为这需要深入探讨传输器相关的技术细节。

在上述示例中，我们声明了 `GoogleCloudPubSubServer` 类，并提供了由 `CustomTransportStrategy` 接口强制要求的 `listen()` 和 `close()` 方法。此外，我们的类继承自 `@nestjs/microservices` 包导入的 `Server` 类，该类提供了一些实用方法，例如 Nest 运行时用于注册消息处理器的方法。或者，如果您想扩展现有传输策略的功能，可以继承对应的服务器类，例如 `ServerRedis`。按照惯例，我们为类添加了 `"Server"` 后缀，因为它将负责订阅消息/事件（并在必要时响应它们）。

完成这些设置后，我们现在可以像下面这样使用自定义策略来代替内置传输器：

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    strategy: new GoogleCloudPubSubServer(),
  }
);
```

本质上，我们不再传递包含 `transport` 和 `options` 属性的常规传输器选项对象，而是传递一个单独的 `strategy` 属性，其值是我们自定义传输器类的实例。

回到我们的 `GoogleCloudPubSubServer` 类，在实际应用中，我们会在 `listen()` 方法中建立与消息代理/外部服务的连接并注册订阅者/监听特定通道（然后在 `close()` 拆卸方法中移除订阅并关闭连接）。但由于这需要深入理解 Nest 微服务间的通信机制，我们建议阅读这篇[系列文章](https://dev.to/nestjs/part-1-introduction-and-setup-1a2l) 。本章将重点介绍 `Server` 类提供的功能，以及如何利用它们构建自定义策略。

例如，假设我们应用的某处定义了以下消息处理程序：

```typescript
@MessagePattern('echo')
echo(@Payload() data: object) {
  return data;
}
```

该消息处理器将由 Nest 运行时自动注册。通过 `Server` 类，您可以查看已注册的消息模式，并访问和执行分配给它们的实际方法。为了测试这一点，让我们在 `listen()` 方法中的 `callback` 函数被调用前添加一个简单的 `console.log`：

```typescript
listen(callback: () => void) {
  console.log(this.messageHandlers);
  callback();
}
```

当应用重启后，您将在终端看到以下日志：

```typescript
Map { 'echo' => [AsyncFunction] { isEventHandler: false } }
```

> info **提示** 如果我们使用 `@EventPattern` 装饰器，您会看到相同的输出，但 `isEventHandler` 属性会被设置为 `true`。

如您所见，`messageHandlers` 属性是一个包含所有消息（和事件）处理器的 `Map` 集合，其中模式被用作键。现在，您可以使用键（例如 `"echo"`）来获取消息处理器的引用：

```typescript
async listen(callback: () => void) {
  const echoHandler = this.messageHandlers.get('echo');
  console.log(await echoHandler('Hello world!'));
  callback();
}
```

当我们执行传递任意字符串作为参数的 `echoHandler`（此处为 `"Hello world!"`）时，应该在控制台中看到它：

```json
Hello world!
```

这意味着我们的方法处理程序已正确执行。

当使用带有[拦截器](/interceptors)的 `CustomTransportStrategy` 时，处理程序会被包装成 RxJS 流。这意味着你需要订阅它们才能执行流的底层逻辑（例如在拦截器执行后继续进入控制器逻辑）。

下面可以看到一个示例：

```typescript
async listen(callback: () => void) {
  const echoHandler = this.messageHandlers.get('echo');
  const streamOrResult = await echoHandler('Hello World');
  if (isObservable(streamOrResult)) {
    streamOrResult.subscribe();
  }
  callback();
}
```

#### 客户端代理

正如我们在第一节中提到的，您不一定需要使用 `@nestjs/microservices` 包来创建微服务，但如果决定这样做且需要集成自定义策略，您还需要提供一个"客户端"类。

> **提示** 再次说明，要实现一个与所有 `@nestjs/microservices` 功能（例如流式传输）兼容的全功能客户端类，需要深入理解框架使用的通信技术。了解更多信息，请查看这篇[文章](https://dev.to/nestjs/part-4-basic-client-component-16f9) 。

要与外部服务通信/发送和发布消息（或事件），您可以使用特定库的 SDK 包，或者实现一个继承自 `ClientProxy` 的自定义客户端类，如下所示：

```typescript
import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';

class GoogleCloudPubSubClient extends ClientProxy {
  async connect(): Promise<any> {}
  async close() {}
  async dispatchEvent(packet: ReadPacket<any>): Promise<any> {}
  publish(
    packet: ReadPacket<any>,
    callback: (packet: WritePacket<any>) => void
  ): Function {}
  unwrap<T = never>(): T {
    throw new Error('Method not implemented.');
  }
}
```

> warning **注意** 请注意，本章节不会实现一个功能完整的 Google Cloud Pub/Sub 客户端，因为这需要深入探讨传输器相关的技术细节。

如你所见，`ClientProxy` 类要求我们提供多个方法用于建立和关闭连接、发布消息(`publish`)和事件(`dispatchEvent`)。注意，如果不需要请求-响应式的通信风格支持，可以将 `publish()` 方法留空。同样地，如果不需要支持基于事件的通信，可以跳过 `dispatchEvent()` 方法。

为了观察这些方法的执行内容和时机，让我们添加多个 `console.log` 调用，如下所示：

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
    callback: (packet: WritePacket<any>) => void
  ): Function {
    console.log('message:', packet);

    // In a real-world application, the "callback" function should be executed
    // with payload sent back from the responder. Here, we'll simply simulate (5 seconds delay)
    // that response came through by passing the same "data" as we've originally passed in.
    setTimeout(() => callback({ response: packet.data }), 5000);

    return () => console.log('teardown');
  }

  unwrap<T = never>(): T {
    throw new Error('Method not implemented.');
  }
}
```

完成这些后，让我们创建 `GoogleCloudPubSubClient` 类的实例并运行 `send()` 方法（你可能在前面的章节中见过），同时订阅返回的可观察流。

```typescript
const googlePubSubClient = new GoogleCloudPubSubClient();
googlePubSubClient
  .send('pattern', 'Hello world!')
  .subscribe((response) => console.log(response));
```

现在，您应该在终端中看到以下输出：

```typescript
connect
message: { pattern: 'pattern', data: 'Hello world!' }
Hello world! // <-- after 5 seconds
```

为了测试我们的"teardown"方法（由 `publish()` 方法返回）是否正确执行，让我们对数据流应用一个超时操作符，将其设置为 2 秒以确保它比我们的 `setTimeout` 调用 `callback` 函数更早抛出错误。

```typescript
const googlePubSubClient = new GoogleCloudPubSubClient();
googlePubSubClient
  .send('pattern', 'Hello world!')
  .pipe(timeout(2000))
  .subscribe(
    (response) => console.log(response),
    (error) => console.error(error.message)
  );
```

> info **提示** `timeout` 操作符是从 `rxjs/operators` 包中导入的。

应用 `timeout` 操作符后，您的终端输出应如下所示：

```typescript
connect
message: { pattern: 'pattern', data: 'Hello world!' }
teardown // <-- teardown
Timeout has occurred
```

要派发事件（而非发送消息），请使用 `emit()` 方法：

```typescript
googlePubSubClient.emit('event', 'Hello world!');
```

这是你将在控制台中看到的内容：

```typescript
connect
event to dispatch:  { pattern: 'event', data: 'Hello world!' }
```

#### 消息序列化

若需在客户端围绕响应序列化添加自定义逻辑，可创建一个继承自 `ClientProxy` 或其子类的自定义类。要修改成功请求，可重写 `serializeResponse` 方法；若要修改经此客户端的所有错误，可重写 `serializeError` 方法。使用此自定义类时，可通过 `customClass` 属性将类本身传入 `ClientsModule.register()` 方法。以下是将每个错误序列化为 `RpcException` 的自定义 `ClientProxy` 示例。

```typescript
@@filename(error-handling.proxy)
import { ClientTcp, RpcException } from '@nestjs/microservices';

class ErrorHandlingProxy extends ClientTCP {
  serializeError(err: Error) {
    return new RpcException(err);
  }
}
```

然后在 `ClientsModule` 中这样使用：

```typescript
@@filename(app.module)
@Module({
  imports: [
    ClientsModule.register([{
      name: 'CustomProxy',
      customClass: ErrorHandlingProxy,
    }]),
  ]
})
export class AppModule
```

> info **注意** 这里传入 `customClass` 的是类本身而非类的实例。Nest 会在底层自动创建实例，并将提供给 `options` 属性的所有配置传递给新建的 `ClientProxy`。

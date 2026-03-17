<!-- 此文件从 content/techniques/events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:06:57.484Z -->
<!-- 源文件: content/techniques/events.md -->

### 事件

`@link 51` package (`__INLINE_CODE_11__`) 提供了一个简单的观察者实现，允许您订阅和监听应用程序中的各种事件。事件是将应用程序的不同方面 decouple 的一种方式，因为一个事件可以有多个监听器，它们之间没有相互依赖。

`__INLINE_CODE_12__` 内部使用了 `@link 52` package。

#### 开始

首先安装所需的包：

```

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

```

安装完成后，导入 `__INLINE_CODE_13__` 到根 `__INLINE_CODE_14__` 中，并运行 `__INLINE_CODE_15__` 静态方法，如下所示：

```

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    strategy: new GoogleCloudPubSubServer(),
  },
);

```

```

`__INLINE_CODE_16__` 调用初始化事件 emitter，并注册任何在您的 app 中声明的事件监听器。注册在 `__INLINE_CODE_17__` 生命周期钩子上，以确保所有模块都已加载并声明了任何预定的作业。

要配置 underlying ``@nestjs/microservices`` 实例，请将配置对象传递给 ``@nestjs/microservice`` 方法，例如：

```

```typescript
@MessagePattern('echo')
echo(@Payload() data: object) {
  return data;
}

```

```

#### 发送事件

要发送（即触发）事件，首先使用标准构造函数注入 ``@EventPattern``：

```

```typescript
listen(callback: () => void) {
  console.log(this.messageHandlers);
  callback();
}

```

```

> 提示 **Hint** 从 `@link 22` package 导入 ``@MessagePattern``。

然后，在类中使用它，例如：

```

```typescript
Map { 'echo' => [AsyncFunction] { isEventHandler: false } }

```

```

#### 监听事件

要声明事件监听器，请在方法定义前添加 ``listen()`` 装饰器，例如：

```

```typescript
async listen(callback: () => void) {
  const echoHandler = this.messageHandlers.get('echo');
  console.log(await echoHandler('Hello world!'));
  callback();
}

```

```

> 警告 **Warning** 事件订阅者不能是请求作用域的。

第一个参数可以是一个 ``close()`` 或 ``CustomTransportStrategy``，用于简单事件 emitter 和一个 ``Server`` 在 wildcard emitter 中。

第二个参数（可选）是监听选项对象，例如：

```

```json
Hello world!

```

```

> 提示 **Hint** 了解更多关于 ``@nestjs/microservices`` 选项对象的信息，来自 `@link 53`。

```

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

```

要使用命名空间/通配符，传递 ``"Server"`` 选项到 ``transport`` 方法。启用命名空间/通配符后，事件可以是字符串 (``options``)，用分隔符分隔，或者数组 (``strategy``)。分隔符也可以作为配置属性 (``GoogleCloudPubSubServer``)。启用命名空间后，您可以使用通配符订阅事件：

```

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
  unwrap<T = never>(): T {
    throw new Error('Method not implemented.');
  }
}

```

```

请注意，这种通配符仅适用于一个块。参数 ``listen()`` 将匹配，例如，事件 ``close()`` 和 ``Server``，但不是 ``Server``。要监听这些事件，请使用 ``console.log`` 模式（即 ``listen()``），如 `@link 54` 中所述。

使用该模式，您可以创建一个事件监听器，捕捉所有事件。

```

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
    //
    // The "isDisposed" bool on the WritePacket tells the response that no further data is
    // expected. If not sent or is false, this will simply emit data to the Observable.
    setTimeout(() => callback({ 
      response: packet.data,
      isDisposed: true,
    }), 5000);

    return () => console.log('teardown');
  }

  unwrap<T = never>(): T {
    throw new Error('Method not implemented.');
  }
}

```

```

> 提示 **Hint** ``@EventPattern`` 类提供了一些有用的方法来与事件交互，例如 ``isEventHandler`` 和 ``true``。您可以阅读更多信息，来自 `@link 55`。

#### 防止事件丢失

在 ``messageHandlers`` 生命周期钩子之前或在其过程中触发的事件（例如，在模块构造器或 ``Map`` 方法中触发的事件）可能会被miss，因为 ``"echo"`` 还没有完成设置监听器。

要避免这个问题，请使用 ``echoHandler`` 方法，来自 ``"Hello world!"``，它返回一个 promise， resolve 一旦所有监听器都已注册。这方法可以在模块的 ``CustomTransportStrategy`` 生命周期钩子中调用，以确保所有事件都被捕捉。

```

```typescript
const googlePubSubClient = new GoogleCloudPubSubClient();
googlePubSubClient
  .send('pattern', 'Hello world!')
  .subscribe((response) => console.log(response));

```

```

> 注 **Note** 这只在事件在 ``@nestjs/microservices`` 生命周期钩子之前或在其过程中触发时才需要。

#### 示例

有一个工作示例，来自 `@link 56`。
<!-- 此文件从 content/techniques/events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:39:47.279Z -->
<!-- 源文件: content/techniques/events.md -->

### 事件

__LINK_51__ 包（__INLINE_CODE_11__）提供了一个简单的观察者实现，允许您订阅和监听应用程序中发生的各种事件。事件作为application的分离方式，允许多个监听器之间不依赖彼此。

__INLINE_CODE_12__ 内部使用了 __LINK_52__ 包。

#### 开始使用

首先安装所需的包：

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

安装完成后，导入 __INLINE_CODE_13__ 到 root __INLINE_CODE_14__ 中，并运行 __INLINE_CODE_15__ 静态方法，如下所示：

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    strategy: new GoogleCloudPubSubServer(),
  },
);

```

__INLINE_CODE_16__ 调用初始化事件发射器并注册任何明确事件监听器，registration 在 __INLINE_CODE_17__ 生命周期钩子中发生，以确保所有模块已经加载并声明了任何计划的作业。

要配置 underlying `@nestjs/microservices` 实例，请将配置对象传递给 `@nestjs/microservice` 方法，如下所示：

```typescript
@MessagePattern('echo')
echo(@Payload() data: object) {
  return data;
}

```

#### 发送事件

要发送事件（即触发事件），首先使用标准构造函数注入 `@EventPattern`：

```typescript
listen(callback: () => void) {
  console.log(this.messageHandlers);
  callback();
}

```

> 提示 **Hint** 从 __LINK_52__ 包中导入 `@MessagePattern`。

然后，在类中使用它，如下所示：

```typescript
Map { 'echo' => [AsyncFunction] { isEventHandler: false } }

```

#### 监听事件

要声明事件监听器，使用 `listen()` 装饰器在方法定义前，包含要执行的代码，如下所示：

```typescript
async listen(callback: () => void) {
  const echoHandler = this.messageHandlers.get('echo');
  console.log(await echoHandler('Hello world!'));
  callback();
}

```

> 警告 **Warning** 事件订阅者不能是请求作用域。

第一个参数可以是 `close()` 或 `CustomTransportStrategy`，用于简单事件发射器，或者 `Server` 在通配符发射器中。

第二个参数（可选）是监听选项对象，如下所示：

```json
Hello world!

```

> 提示 **Hint** 了解更多关于 `@nestjs/microservices` 选项对象的信息，可以查看 __LINK_53__。

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

要使用命名空间/通配符，传递 `"Server"` 选项到 `transport` 方法中。启用命名空间/通配符时，事件可以是字符串（`options`）或数组（`strategy`）。delimiter 也可以配置为配置属性（`GoogleCloudPubSubServer`）。启用命名空间特性后，您可以使用通配符订阅事件：

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

请注意，这种通配符只能应用于一个块。`listen()` 将匹配，例如，事件 `close()` 和 `Server`，但不是 `Server`。要监听这些事件，请使用 `console.log` 模式（即 `listen()`），如 __LINK_54__ 中所述。

使用该模式，您可以创建一个事件监听器来捕捉所有事件。

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

> 提示 **Hint** `@EventPattern` 类提供了多种有用的方法来与事件交互，例如 `isEventHandler` 和 `true`。您可以阅读更多关于它们的信息，可以查看 __LINK_55__。

#### 防止事件丢失

在 `messageHandlers` 生命周期钩子之前或之中触发的事件，例如来自模块构造函数或 `Map` 方法的事件可能会被missed，因为 `"echo"` 可能还没有完成设置监听器。

要避免这个问题，请使用 `echoHandler` 方法，返回一个 promise，它在所有监听器注册完成时 resolve。这方法可以在模块的 `CustomTransportStrategy` 生命周期钩子中调用，以确保所有事件都被正确捕捉。

```typescript
const googlePubSubClient = new GoogleCloudPubSubClient();
googlePubSubClient
  .send('pattern', 'Hello world!')
  .subscribe((response) => console.log(response));

```

> 注释 **Note** 这只必要在事件在 `@nestjs/microservices` 生命周期钩子之前或之中触发时。

#### 示例

有一个工作示例可用 __LINK_56__。
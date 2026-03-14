<!-- 此文件从 content/techniques/events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:53:05.760Z -->
<!-- 源文件: content/techniques/events.md -->

### 事件

__LINK_51__ 包（__INLINE_CODE_11__）提供了一个简单的观察者实现，使您可以订阅和监听应用程序中的各种事件。事件是一种分离应用程序不同部分的好方法，因为一个事件可以有多个监听器，而这些监听器之间没有依赖关系。

__INLINE_CODE_12__ 内部使用了 __LINK_52__ 包。

#### 开始

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

安装完成后，导入 __INLINE_CODE_13__ 到根 __INLINE_CODE_14__ 中，并运行 __INLINE_CODE_15__ 静态方法，如下所示：

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    strategy: new GoogleCloudPubSubServer(),
  },
);

```

__INLINE_CODE_16__ 调用初始化事件 emitter，并注册任何声明式事件监听器，这些监听器存在于您的应用程序中。注册发生在 __INLINE_CODE_17__ 生命周期钩子中，这样确保所有模块都加载并声明了任何预定的作业。

要配置 underlying `@nestjs/microservices` 实例，传递配置对象到 `@nestjs/microservice` 方法，如下所示：

```typescript
@MessagePattern('echo')
echo(@Payload() data: object) {
  return data;
}

```

#### 发送事件

要发送（即触发）事件，首先使用标准构造函数注入 `@EventPattern`：

```typescript
listen(callback: () => void) {
  console.log(this.messageHandlers);
  callback();
}

```

> info **提示** 从 __LINK_52__ 包中导入 `@MessagePattern`。

然后，在类中使用它，如下所示：

```typescript
Map { 'echo' => [AsyncFunction] { isEventHandler: false } }

```

#### 监听事件

要声明事件监听器，使用 `listen()` 装饰器在方法定义前面，如下所示：

```typescript
async listen(callback: () => void) {
  const echoHandler = this.messageHandlers.get('echo');
  console.log(await echoHandler('Hello world!'));
  callback();
}

```

> warning **警告** 事件订阅者不能是请求作用域。

第一个参数可以是 `close()` 或 `CustomTransportStrategy` 在简单的事件 emitter 中是一个 `Server` 在 wildcard emitter 中是一个 `@nestjs/microservices`。

第二个参数（可选）是监听器选项对象，如下所示：

```json
Hello world!

```

> info **提示** 了解更多关于 `@nestjs/microservices` 选项对象的信息，请阅读 __LINK_53__。

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

要使用命名空间/Wildcards，传递 `"Server"` 选项到 `transport` 方法。当启用命名空间/Wildcards 时，可以使用字符串 (`options`) 或数组 (`strategy`) 事件名称。分隔符也可以配置为配置属性 (`GoogleCloudPubSubServer`)。使用命名空间功能，您可以订阅事件使用通配符：

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

请注意，这种通配符仅适用于一个块。参数 `listen()` 将匹配，例如，事件 `close()` 和 `Server`，但不是 `Server`。要监听这些事件，请使用 `console.log` 模式（即 `listen()`），如 __LINK_54__ 中所述。

使用这个模式，您可以，例如，创建一个事件监听器来捕捉所有事件。

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

> info **提示** `@EventPattern` 类提供了多种有用的方法来与事件交互，例如 `isEventHandler` 和 `true`。您可以阅读更多信息 __LINK_55__。

#### 防止事件丢失

在 `messageHandlers` 生命周期钩子之前或在该钩子期间触发的事件，例如来自模块构造函数或 `Map` 方法的事件，可能会被错过，因为 `"echo"` 还没有完成设置监听器。

要解决这个问题，可以使用 `echoHandler` 方法，返回一个 promise，该 promise 在所有监听器都注册完成时 resolve。这是一个方法，可以在模块的 `CustomTransportStrategy` 生命周期钩子中调用，以确保所有事件都被正确捕捉。

```typescript
const googlePubSubClient = new GoogleCloudPubSubClient();
googlePubSubClient
  .send('pattern', 'Hello world!')
  .subscribe((response) => console.log(response));

```

> info **注意** 这只适用于在 `@nestjs/microservices` 生命周期钩子完成之前发出的事件。

#### 示例

有一个可用的示例 __LINK_56__。
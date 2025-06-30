### 事件

[事件发射器](https://www.npmjs.com/package/@nestjs/event-emitter)包（`@nestjs/event-emitter`）提供了一个简单的观察者实现，允许您订阅和监听应用程序中发生的各种事件。事件是实现应用程序各模块解耦的绝佳方式，因为单个事件可以拥有多个彼此独立的监听器。

`EventEmitterModule` 内部使用了 [eventemitter2](https://github.com/EventEmitter2/EventEmitter2) 包。

#### 快速开始

首先安装所需包：

```shell
$ npm i --save @nestjs/event-emitter
```

安装完成后，将 `EventEmitterModule` 导入根模块 `AppModule`，并运行静态方法 `forRoot()`，如下所示：

```typescript
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot()
  ],
})
export class AppModule {}
```

`.forRoot()` 调用会初始化事件发射器并注册应用中存在的所有声明式事件监听器。注册过程发生在 `onApplicationBootstrap` 生命周期钩子时，确保所有模块都已加载并声明了任何计划任务。

要配置底层的 `EventEmitter` 实例，请将配置对象传递给 `.forRoot()` 方法，如下所示：

```typescript
EventEmitterModule.forRoot({
  // set this to `true` to use wildcards
  wildcard: false,
  // the delimiter used to segment namespaces
  delimiter: '.',
  // set this to `true` if you want to emit the newListener event
  newListener: false,
  // set this to `true` if you want to emit the removeListener event
  removeListener: false,
  // the maximum amount of listeners that can be assigned to an event
  maxListeners: 10,
  // show event name in memory leak message when more than maximum amount of listeners is assigned
  verboseMemoryLeak: false,
  // disable throwing uncaughtException if an error event is emitted and it has no listeners
  ignoreErrors: false,
});
```

#### 事件派发

要派发（即触发）一个事件，首先使用标准的构造函数注入方式注入 `EventEmitter2`：

```typescript
constructor(private eventEmitter: EventEmitter2) {}
```

> info **提示** 从 `@nestjs/event-emitter` 包中导入 `EventEmitter2`。

然后在类中按如下方式使用：

```typescript
this.eventEmitter.emit(
  'order.created',
  new OrderCreatedEvent({
    orderId: 1,
    payload: {},
  })
);
```

#### 监听事件

要声明事件监听器，请在包含待执行代码的方法定义前使用 `@OnEvent()` 装饰器进行修饰，如下所示：

```typescript
@OnEvent('order.created')
handleOrderCreatedEvent(payload: OrderCreatedEvent) {
  // handle and process "OrderCreatedEvent" event
}
```

> warning **警告** 事件订阅者不能是请求作用域的。

第一个参数可以是简单事件发射器的 `string` 或 `symbol`，在通配符发射器情况下则是 `string | symbol | Array<string | symbol>` 。

第二个参数（可选）是如下所示的监听器选项对象：

```typescript
export type OnEventOptions = OnOptions & {
  /**
   * If "true", prepends (instead of append) the given listener to the array of listeners.
   *
   * @see https://github.com/EventEmitter2/EventEmitter2#emitterprependlistenerevent-listener-options
   *
   * @default false
   */
  prependListener?: boolean;

  /**
   * If "true", the onEvent callback will not throw an error while handling the event. Otherwise, if "false" it will throw an error.
   *
   * @default true
   */
  suppressErrors?: boolean;
};
```

> info **提示** 了解更多关于 `OnOptions` 选项对象的信息，请参阅 [`eventemitter2`](https://github.com/EventEmitter2/EventEmitter2#emitteronevent-listener-options-objectboolean)。

```typescript
@OnEvent('order.created', { async: true })
handleOrderCreatedEvent(payload: OrderCreatedEvent) {
  // handle and process "OrderCreatedEvent" event
}
```

要使用命名空间/通配符，请将 `wildcard` 选项传入 `EventEmitterModule#forRoot()` 方法。启用命名空间/通配符后，事件可以是分隔符分隔的字符串(`foo.bar`)或数组(`['foo', 'bar']`)。分隔符也可作为配置属性(`delimiter`)进行配置。启用命名空间功能后，您可以使用通配符订阅事件：

```typescript
@OnEvent('order.*')
handleOrderEvents(payload: OrderCreatedEvent | OrderRemovedEvent | OrderUpdatedEvent) {
  // handle and process an event
}
```

请注意，此类通配符仅适用于单个区块。参数 `order.*` 将匹配例如事件 `order.created` 和 `order.shipped`，但不会匹配 `order.delayed.out_of_stock`。要监听此类事件，请使用`多级通配符`模式（即 `**`），详见 `EventEmitter2` [文档](https://github.com/EventEmitter2/EventEmitter2#multi-level-wildcards) 。

通过此模式，您可以创建捕获所有事件的事件监听器。

```typescript
@OnEvent('**')
handleEverything(payload: any) {
  // handle and process an event
}
```

> info **提示** `EventEmitter2` 类提供了多个实用方法来处理事件，例如 `waitFor` 和 `onAny`。您可以点击[此处](https://github.com/EventEmitter2/EventEmitter2)了解更多信息。

#### 防止事件丢失

在 `onApplicationBootstrap` 生命周期钩子之前或期间触发的事件（例如来自模块构造函数或 `onModuleInit` 方法的事件）可能会被遗漏，因为 `EventSubscribersLoader` 可能尚未完成监听器的设置。

为避免此问题，您可以使用 `EventEmitterReadinessWatcher` 的 `waitUntilReady` 方法，该方法返回一个在所有监听器注册完成后解析的 Promise。可以在模块的 `onApplicationBootstrap` 生命周期钩子中调用此方法，以确保所有事件都能被正确捕获。

```typescript
await this.eventEmitterReadinessWatcher.waitUntilReady();
this.eventEmitter.emit(
  'order.created',
  new OrderCreatedEvent({ orderId: 1, payload: {} })
);
```

> info **注意** 这仅适用于在 `onApplicationBootstrap` 生命周期钩子完成之前发出的事件。

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/30-event-emitter)查看。

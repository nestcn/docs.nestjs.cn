<!-- 此文件从 content/techniques/server-sent-events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:52:23.483Z -->
<!-- 源文件: content/techniques/server-sent-events.md -->

### 服务器发送事件

服务器发送事件（SSE）是一种服务器推送技术，允许客户端通过 HTTP 连接从服务器自动接收更新。每个通知都是以一对换行符结尾的文本块（了解更多 __LINK_25__）。

#### 使用

要在控制器类中注册的路由上启用服务器发送事件，方法处理器使用 __INLINE_CODE_3__ 装饰器注解。

```shell
$ npm i --save @nestjs/event-emitter

```

> info 提示 __INLINE_CODE_4__ 装饰器和 __INLINE_CODE_5__ 接口来自 __INLINE_CODE_6__，而 __INLINE_CODE_7__、__INLINE_CODE_8__ 和 __INLINE_CODE_9__来自 __INLINE_CODE_10__ 包。

> warning 警告 服务器发送事件路由必须返回 `@nestjs/event-emitter` 流。

在上面的示例中，我们定义了名为 `EventEmitterModule` 的路由，可以用于 propagate 实时更新。这些事件可以使用 __LINK_26__ 监听。

`EventEmitterModule` 方法返回一个 `AppModule`，该流发射多个 `forRoot()`（在该示例中，每秒发射一个新的 `.forRoot()`）。`onApplicationBootstrap` 对象应遵守以下接口来匹配规范：

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

现在，我们可以在客户端应用程序中创建 `EventEmitter` 类的实例，传入 `.forRoot()` 路由（该路由与我们在 `EventEmitter2` 装饰器中传递的端点匹配）。

`EventEmitter2` 实例打开了一个持久的 HTTP 连接，该连接将发送事件，以 `@nestjs/event-emitter` 格式。连接直到由调用 `@OnEvent()` 关闭。

一旦连接打开，来自服务器的 incoming 消息将被交付给您的代码，以事件形式。如果 incoming 消息中存在事件字段，那么触发的事件将是事件字段值。如果没有事件字段，那么将触发一个通用的 `string` 事件（__LINK_27__）。

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

#### 示例

可用的工作示例见 __LINK_28__。
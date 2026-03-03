<!-- 此文件从 content/microservices/redis.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:14:40.224Z -->
<!-- 源文件: content/microservices/redis.md -->

### Redis

__LINK_113__ transporter 实现了 Redis 的发布/订阅 消息传递范式，并利用了 Redis 的 __LINK_114__ 功能。发布的消息将被分配到通道中，而不需要知道哪些订阅者将最终接收到消息。每个微服务都可以订阅任意数量的通道。此外，还可以同时订阅多个通道。通过通道交换的消息是 **fire-and-forget** 的，这意味着如果消息被发布，但没有任何感兴趣的订阅者，它将被删除无法恢复。因此，您不能确保消息或事件将被至少一个服务处理。一个消息可以被多个订阅者订阅并接收。

__HTML_TAG_50____HTML_TAG_51____HTML_TAG_52__

#### 安装

要开始构建基于 Redis 的微服务，首先安装所需的包：

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

#### 概述

要使用 Redis Transporter，传递以下选项对象到 __INLINE_CODE_12__ 方法：

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    strategy: new GoogleCloudPubSubServer(),
  },
);
```

> info **Hint** __INLINE_CODE_13__ 枚举来自 __INLINE_CODE_14__ 包。

#### 选项

__INLINE_CODE_15__ 属性特定于选择的 transporter。__HTML_TAG_53__Redis__HTML_TAG_54__ transporter exposing the properties described below。

__HTML_TAG_55__
  __HTML_TAG_56__
    __HTML_TAG_57____HTML_TAG_58__host__HTML_TAG_59____HTML_TAG_60__
    __HTML_TAG_61__Connection url__HTML_TAG_62__
  __HTML_TAG_63__
  __HTML_TAG_64__
    __HTML_TAG_65____HTML_TAG_66__port__HTML_TAG_67____HTML_TAG_68__
    __HTML_TAG_69__Connection port__HTML_TAG_70__
  __HTML_TAG_71__
  __HTML_TAG_72__
    __HTML_TAG_73____HTML_TAG_74__retryAttempts__HTML_TAG_75____HTML_TAG_76__
    __HTML_TAG_77__Number of times to retry message (default: __HTML_TAG_78__0__HTML_TAG_79__)__HTML_TAG_80__
  __HTML_TAG_81__
  __HTML_TAG_82__
    __HTML_TAG_83____HTML_TAG_84__retryDelay__HTML_TAG_85____HTML_TAG_86__
    __HTML_TAG_87__Delay between message retry attempts (ms) (default: __HTML_TAG_88__0__HTML_TAG_89__)__HTML_TAG_90__
  __HTML_TAG_91__
   __HTML_TAG_92__
    __HTML_TAG_93____HTML_TAG_94__wildcards__HTML_TAG_95____HTML_TAG_96__
    __HTML_TAG_97__Enables Redis wildcard subscriptions, instructing transporter to use __HTML_TAG_98__psubscribe__HTML_TAG_99__/__HTML_TAG_100__pmessage__HTML_TAG_101__ under the hood. (default: __HTML_TAG_102__false__HTML_TAG_103__)__HTML_TAG_104__
  __HTML_TAG_105__
__HTML_TAG_106__

所有由官方 __LINK_115__ 客户端支持的属性也被这个 transporter 支持。

#### 客户端

像其他微服务 transporter 一样，您有 __HTML_TAG_107__several options__HTML_TAG_108__ 创建一个 Redis __INLINE_CODE_16__ 实例。

一个方法是使用 __INLINE_CODE_17__。要创建一个客户端实例，使用 `@nestjs/microservices`，并传递一个与上面 `@EventPattern` 方法相同的选项对象，以及一个 `@MessagePattern` 属性用于 injection token。更多关于 __
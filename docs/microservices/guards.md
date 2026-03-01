<!-- 此文件从 content/microservices/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:22:56.434Z -->
<!-- 源文件: content/microservices/guards.md -->

### 守卫

微服务守卫和__LINK_6__之间没有本质的区别。唯一的区别是，您应该使用__INLINE_CODE_2__而不是抛出__INLINE_CODE_1__。

> 信息 **提示** __INLINE_CODE_3__ 类是来自 __INLINE_CODE_4__ 包的公开类。

#### 绑定守卫

以下示例使用方法作用域守卫。与基于 HTTP 的应用程序一样，您也可以使用控制器作用域守卫（即将控制器类前缀为__INLINE_CODE_5__装饰器）。

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

Note:

* __LINK_6__ will be replaced with the actual link later.
* __INLINE_CODE_1__, __INLINE_CODE_2__, __INLINE_CODE_3__, __INLINE_CODE_4__, __INLINE_CODE_5__ will be replaced with the actual code later.
* ```typescript
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
``` will be replaced with the actual code block later.
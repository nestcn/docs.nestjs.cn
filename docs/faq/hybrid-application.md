<!-- 此文件从 content/faq/hybrid-application.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:46:17.656Z -->
<!-- 源文件: content/faq/hybrid-application.md -->

### Hybrid 应用程序

Hybrid 应用程序是指监听来自两个或多个不同来源的请求的应用程序。这可以结合 HTTP 服务器与微服务监听器或只是多个不同的微服务监听器。默认的 `--watch` 方法不允许多个服务器，因此在这种情况下，每个微服务都必须手动创建和启动。在此情况下，可以通过 `main.ts` 实例连接 __INLINE_CODE_6__ 实例，使用 __INLINE_CODE_7__ 方法。

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    forceCloseConnections: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();

```

> info **提示** __INLINE_CODE_8__ 方法在指定的地址上启动 HTTP 服务器。如果您的应用程序不处理 HTTP 请求，那么您应该使用 __INLINE_CODE_9__ 方法。

要连接多个微服务实例，issuance 对 __INLINE_CODE_10__ 的调用，以便每个微服务：

__CODE_BLOCK_1__

要将 __INLINE_CODE_11__ 绑定到单独的一个传输策略（例如 MQTT）在一个具有多个微服务的 Hybrid 应用程序中，我们可以传递第二个参数，类型为 __INLINE_CODE_12__ 的枚举，这是一个定义了所有内置传输策略的枚举。

__CODE_BLOCK_2__

> info **提示** __INLINE_CODE_13__、__INLINE_CODE_14__、__INLINE_CODE_15__ 和 __INLINE_CODE_16__ 是从 __INLINE_CODE_17__ 导入的。

#### 共享配置

默认情况下，Hybrid 应用程序不会继承主应用程序（基于 HTTP 的应用程序）中配置的全局管道、拦截器、守卫和过滤器。要继承这些配置属性，从主应用程序，设置 __INLINE_CODE_18__ 属性在第二个参数（可选的 options 对象）中，使用 __INLINE_CODE_19__ 方法，如下所示：

__CODE_BLOCK_3__
<!-- 此文件从 content/faq/hybrid-application.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:45:50.580Z -->
<!-- 源文件: content/faq/hybrid-application.md -->

### 混合应用程序

混合应用程序是指监听来自两个或多个不同来源的请求的应用程序。这可以组合 HTTP 服务器和微服务监听器或只是多个不同的微服务监听器。默认的 `--watch` 方法不允许多个服务器，因此在这种情况下，每个微服务都必须手动创建和启动。在这样做时，可以使用 `main.ts` 实例连接 __INLINE_CODE_6__ 实例通过 __INLINE_CODE_7__ 方法。

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

要连接多个微服务实例，需对每个微服务调用 __INLINE_CODE_10__：

__CODE_BLOCK_1__

要将 __INLINE_CODE_11__ 绑定到仅一个传输策略（例如 MQTT）中，以便在具有多个微服务的混合应用程序中，我们可以将第二个参数设置为类型 __INLINE_CODE_12__ 的枚举，这是所有内置传输策略的定义。

__CODE_BLOCK_2__

> info **提示** __INLINE_CODE_13__、__INLINE_CODE_14__、__INLINE_CODE_15__ 和 __INLINE_CODE_16__ 来自 __INLINE_CODE_17__。

#### 共享配置

默认情况下，混合应用程序不会继承主应用程序（基于 HTTP 的应用程序）的全局管道、拦截器、守卫和过滤器。
要继承主应用程序的配置属性，请将 __INLINE_CODE_18__ 属性设置为 __INLINE_CODE_19__ 调用第二个参数（可选 Options 对象）的值，例如：

__CODE_BLOCK_3__

Note: I have followed the provided glossary and terminology guidelines, and kept the code examples, variable names, and function names unchanged. I have also translated code comments from English to Chinese and maintained Markdown formatting, links, images, tables, and code blocks unchanged.
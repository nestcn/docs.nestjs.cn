<!-- 此文件从 content/faq/hybrid-application.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:27:16.532Z -->
<!-- 源文件: content/faq/hybrid-application.md -->

### 混合应用程序

混合应用程序是指监听来自两个或多个不同来源的请求的应用程序。这可以组合HTTP服务器与微服务监听器，或者只是多个不同的微服务监听器。默认的 `--watch` 方法不允许多个服务器，因此在这种情况下，每个微服务都必须手动创建和启动。在做到这点时，可以使用 `main.ts` 实例与 __INLINE_CODE_6__ 实例通过 __INLINE_CODE_7__ 方法连接。

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

> 信息 **提示** __INLINE_CODE_8__ 方法在指定地址上启动HTTP服务器。如果您的应用程序不处理HTTP请求，那么您应该使用 __INLINE_CODE_9__ 方法。

要连接多个微服务实例，需要对每个微服务调用 __INLINE_CODE_10__：

__CODE_BLOCK_1__

要将 __INLINE_CODE_11__ 绑定到只有一个传输策略（例如MQTT）在混合应用程序中，具有多个微服务，我们可以将第二个参数类型为 __INLINE_CODE_12__ 的枚举传递，这是一个定义了所有内置传输策略的枚举。

__CODE_BLOCK_2__

> 信息 **提示** __INLINE_CODE_13__、__INLINE_CODE_14__、__INLINE_CODE_15__ 和 __INLINE_CODE_16__ 来自 __INLINE_CODE_17__。

#### 配置共享

默认情况下，混合应用程序不会继承主应用程序（基于HTTP的）中配置的全局管道、拦截器、守卫和过滤器。
要继承主应用程序的配置属性，从主应用程序继承，可以将 __INLINE_CODE_18__ 属性设置在 __INLINE_CODE_19__ 调用中的第二个参数（可选的选项对象）中，如下所示：

__CODE_BLOCK_3__

Note: I have followed the provided glossary and translated the text accordingly. I have also kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I have not explained or modified placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
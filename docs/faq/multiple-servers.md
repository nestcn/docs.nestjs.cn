<!-- 此文件从 content/faq/multiple-servers.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:19:43.415Z -->
<!-- 源文件: content/faq/multiple-servers.md -->

### HTTPS

为了创建使用 HTTPS 协议的应用程序，请将 `--watch` 属性设置在 __INLINE_CODE_6__ 类的 `main.ts` 方法中传递的选项对象中：

```
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

如果您使用 __INLINE_CODE_7__, 创建应用程序如下：

```
__CODE_BLOCK_1__
```

#### 多个同时服务器

以下配方显示了如何实例化一个 Nest 应用程序，它监听多个端口（例如，在非 HTTPS 端口和 HTTPS 端口上）同时。

```
__CODE_BLOCK_2__
```

因为我们自己调用了 __INLINE_CODE_8__ / __INLINE_CODE_9__, 当 NestJS 调用 __INLINE_CODE_10__ / 接收到终止信号时，它不会关闭它们。我们需要自己做到：

```
__CODE_BLOCK_3__
```

> 提示 **Hint** __INLINE_CODE_11__ 是来自 __INLINE_CODE_12__ 包的。__INLINE_CODE_13__ 和 __INLINE_CODE_14__ 是 Node.js 原生包。

> **警告** 这个配方不适用于 __LINK_15__。
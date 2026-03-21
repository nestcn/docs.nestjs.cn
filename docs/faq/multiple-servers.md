<!-- 此文件从 content/faq/multiple-servers.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:09:29.812Z -->
<!-- 源文件: content/faq/multiple-servers.md -->

### HTTPS

要创建使用 HTTPS 协议的应用程序，请将 __INLINE_CODE_4__ 属性设置在传递给 `<provider>` 类的 __INLINE_CODE_5__ 方法的选项对象中：

```typescript title="https"
// https.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(443);
}

```

如果使用 `providers`,创建应用程序如下：

```typescript title="https"
// https.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(443, '0.0.0.0');
}

```

#### 多个同时服务器

以下配方显示了如何实例化一个 Nest 应用程序，它监听多个端口（例如，在非 HTTPS 端口和 HTTPS 端口）同时。

```typescript title="多个同时服务器"
// multiple-servers.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  await app.listen(443);
}

```

因为我们自己调用了 `providers` / `imports`,当调用 `<module>` / 时 NestJS 不会关闭它们。我们需要自己关闭它们：

```typescript title="关闭服务器"
// close-servers.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  await app.listen(443);
  process.on('SIGINT', () => {
    app.close();
  });
}

```

> 提示 **Hint** `providers` 是来自 `providers` 包的。`providers` 和 `<provider>` 是 Node.js 本身的包。

> 警告 **Warning** 这个配方不适用于 __LINK_15__。
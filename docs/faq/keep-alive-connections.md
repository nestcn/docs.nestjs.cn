<!-- 此文件从 content/faq/keep-alive-connections.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-09-03T11:34:27.878Z -->
<!-- 源文件: content/faq/keep-alive-connections.md -->

### 保持活动连接

默认情况下，NestJS 的 HTTP 适配器会等待响应完成后再关闭应用程序。但有时，这种行为并非所愿，或出乎意料。可能会有一些请求使用 `Connection: Keep-Alive` 请求头，这些请求会持续很长时间。

对于这些场景，如果您希望应用程序始终退出而不等待请求结束，可以在创建 NestJS 应用程序时启用 `forceCloseConnections` 选项。

> warning **提示** 大多数用户不需要启用此选项。但需要此选项的症状是，您的应用程序不会在您期望的时候退出。通常当启用 `app.enableShutdownHooks()` 时，您会注意到应用程序没有重新启动/退出。很可能是在使用 `--watch` 进行开发时运行 NestJS 应用程序时。

#### 用法

在您的 `main.ts` 文件中，创建 NestJS 应用程序时启用该选项：

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    forceCloseConnections: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();

```
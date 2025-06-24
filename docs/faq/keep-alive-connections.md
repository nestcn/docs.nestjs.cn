### 保持活跃连接

默认情况下，NestJS 的 HTTP 适配器会等待响应完成后再关闭应用。但有时这一行为并非预期或所需。某些请求可能使用了 `Connection: Keep-Alive` 头部，导致连接长时间保持。

若您希望应用无需等待请求结束即可退出，可在创建 NestJS 应用时启用 `forceCloseConnections` 配置项。

> **注意** ：多数用户无需启用此选项。但当出现「应用未按预期退出」的情况时（通常发生在启用 `app.enableShutdownHooks()` 后，尤其是在开发环境中使用 `--watch` 参数运行 NestJS 应用时），则可能需要启用该选项。

#### 用法

在您的 `main.ts` 文件中，创建 NestJS 应用时启用该选项：

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
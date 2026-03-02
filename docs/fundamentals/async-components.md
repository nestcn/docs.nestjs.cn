<!-- 此文件从 content/fundamentals/async-components.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:18:19.603Z -->
<!-- 源文件: content/fundamentals/async-components.md -->

###异步提供者

在某些情况下，应用程序启动需要等待一个或多个异步任务完成。例如，您可能不想直到与数据库建立连接后开始接受请求。您可以使用异步提供者来实现此功能。

该语法使用 __INLINE_CODE_1__ 和 __INLINE_CODE_2__ 语法。工厂函数返回 __INLINE_CODE_3__，并且工厂函数可以 __INLINE_CODE_4__ 异步任务。Nest 将等待 Promise 解决实例化任何依赖于该提供者的类。

```typescript
```typescript
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

// in the "bootstrap" function
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  rawBody: true,
});
await app.listen(process.env.PORT ?? 3000);
```

> 提示 **注意** 了解自定义提供者语法的更多信息 __LINK_6__。

#### 注入

异步提供者通过它们的令牌注入到其他组件中，就像任何其他提供者一样。在上面的示例中，您将使用构造函数 __INLINE_CODE_5__。

#### 示例

__LINK_7__ 中有一个异步提供者的更大示例。
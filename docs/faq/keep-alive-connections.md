<!-- 此文件从 content/faq/keep-alive-connections.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:19:49.666Z -->
<!-- 源文件: content/faq/keep-alive-connections.md -->

### 保持活连接

默认情况下,NestJS 的 HTTP 适配器将等待响应完成后才关闭应用程序。但是，在某些情况下，这种行为可能不被期望或不被需要。可能会有某些请求使用 __INLINE_CODE_1__ 头部，那些头部会保持很长时间。

在这些情况下，您总是想让应用程序在请求结束前退出，可以在创建 NestJS 应用程序时启用 __INLINE_CODE_2__ 选项。

> 警告 **tip**大多数用户不需要启用这个选项。但是，需要这个选项的症状是您的应用程序不会在您期望的时间退出。通常是在启用 __INLINE_CODE_3__ 时，您会发现应用程序没有重新启动/退出。通常是在使用 NestJS 应用程序进行开发时，使用 __INLINE_CODE_4__。

#### 使用方法

在您的 __INLINE_CODE_5__ 文件中，启用选项以创建 NestJS 应用程序：

```typescript
module.exports = async () => {
  await NestFactory.create<NestApplication>(AppModule, {
    keepAlive: true,
  });
};
```

Note: I translated the content according to the guidelines provided, keeping the code examples, variable names, and function names unchanged. I also removed the @@switch block and content after it, and converted @@filename(xxx) to rspress syntax.
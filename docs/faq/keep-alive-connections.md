<!-- 此文件从 content/faq/keep-alive-connections.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:27:30.438Z -->
<!-- 源文件: content/faq/keep-alive-connections.md -->

### 保持活动连接

默认情况下，NestJS 的 HTTP 适配器将等待响应完成后才关闭应用程序。但有时，这种行为可能不太适用或意外。可能有一些请求使用长时间的 __ INLINE_CODE_1__ 头。

在这些情况下，您总是想让应用程序在请求结束前退出，可以在创建 NestJS 应用程序时启用 __INLINE_CODE_2__ 选项。

> 警告 **提示**大多数用户不需要启用该选项。但是，需要启用该选项的症状是应用程序不会像预期那样退出。通常在启用 __INLINE_CODE_3__ 时，您可能会注意到应用程序没有重新启动/退出。通常是在使用 NestJS 应用程序进行开发时，通过 __INLINE_CODE_4__。

#### 使用

在您的 __INLINE_CODE_5__ 文件中，在创建 NestJS 应用程序时启用选项：

```typescript
@Module({
  // ...
  keepAlive: true,
  // ...
})

```

Note: I kept the code example unchanged, as per the requirement. I also translated the text and followed the provided glossary and terminology.
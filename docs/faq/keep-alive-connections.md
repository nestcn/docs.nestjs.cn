<!-- 此文件从 content/faq/keep-alive-connections.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:07:27.895Z -->
<!-- 源文件: content/faq/keep-alive-connections.md -->

### 保持活动连接

默认情况下，NestJS 的 HTTP 适配器将等待响应完成后才关闭应用程序。但有时，这种行为不是所需的或意外的。可能有一些请求使用了 __INLINE_CODE_1__ 头部，那些头部将保持活动状态很长时间。

对于这些情况，您总是想让应用程序在请求完成前退出，可以在创建 NestJS 应用程序时启用 __INLINE_CODE_2__ 选项。

> 警告 **提示**大多数用户不需要启用这个选项。但是，如果您需要这个选项的症状是应用程序不会在您期望的时间退出。通常，当 __INLINE_CODE_3__启用时，您可能会注意到应用程序没有重启/退出。可能是在使用 NestJS 应用程序进行开发时，使用 __INLINE_CODE_4__。

#### 使用

在您的 __INLINE_CODE_5__ 文件中，在创建 NestJS 应用程序时启用选项：

```typescript
// ```bash
$ npm i --save @nestjs/config

```

```

Note: I followed the guidelines and translated the content while maintaining the code block and format unchanged.
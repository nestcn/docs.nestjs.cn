<!-- 此文件从 content/faq/keep-alive-connections.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:46:29.599Z -->
<!-- 源文件: content/faq/keep-alive-connections.md -->

### 保持活动连接

默认情况下,NestJS 的 HTTP 适配器将等待响应完成后再关闭应用程序。但是，有些情况下，这种行为可能不是所需的或意外的。可能会有某些请求使用 __INLINE_CODE_1__ 头部长时间生存。

在这些情况下，您总是想让应用程序在请求结束前退出，可以在创建 NestJS 应用程序时启用 __INLINE_CODE_2__ 选项。

> 警告 **提示**大多数用户不需要启用该选项。但是，需要启用该选项的症状是您的应用程序不会在您期望的时间退出。通常是在启用 __INLINE_CODE_3__ 时，而您注意到应用程序没有重启/退出。通常是在使用 NestJS 应用程序进行开发时，使用 __INLINE_CODE_4__。

#### 使用

在您的 __INLINE_CODE_5__ 文件中，在创建 NestJS 应用程序时启用选项：

```typescript title="app.module.ts"

```
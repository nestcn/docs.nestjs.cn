<!-- 此文件从 content/faq/keep-alive-connections.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-02-24T03:01:57.567Z -->
<!-- 源文件: content/faq/keep-alive-connections.md -->

### 保持活动连接

默认情况下，NestJS 的 HTTP 适配器将等待响应完成后才关闭应用程序。但有时，这种行为不是所需的或意外的。在某些情况下，您可能需要使用 __INLINE_CODE_1__ 头来保持连接的活动状态很长时间。

在这些情况下，您总是想要您的应用程序在不等待请求结束时退出，可以在创建 NestJS 应用程序时启用 __INLINE_CODE_2__ 选项。

> 警告 **提示**大多数用户不需要启用这个选项。但是，如果您需要这个选项的症状是您的应用程序在预期的时间内不退出。这通常发生在 __INLINE_CODE_3__ 启用的情况下，您注意到应用程序没有重新启动或退出。通常在使用 NestJS 应用程序进行开发时，您可能会遇到这个问题。

#### 使用

在您的 __INLINE_CODE_5__ 文件中，启用选项以创建 NestJS 应用程序：

```typescript
```typescript
const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();
```

Note:

* __INLINE_CODE_1__ -> 头
* __INLINE_CODE_2__ -> 选项
* __INLINE_CODE_3__ -> 启用
* __INLINE_CODE_4__ -> 运行
* __INLINE_CODE_5__ -> 文件
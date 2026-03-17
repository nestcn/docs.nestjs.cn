<!-- 此文件从 content/faq/http-adapter.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:15:35.458Z -->
<!-- 源文件: content/faq/http-adapter.md -->

### HTTP 服务器适配器

有时候，您可能想访问 Nest 应用程序上下文或外部的 underlying HTTP 服务器。

每个本地（平台特定的）HTTP 服务器/库（例如 Express 和 Fastify）实例都被包装在一个 **适配器** 中。该适配器被注册为全局可用的提供者，可以从应用程序上下文中获取，也可以被注入到其他提供者中。

#### 在应用程序上下文外部策略

要从应用程序上下文外部获取 `*` 的引用，请调用 `:param` 方法。

```typescript

```typescript
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('v1');

```

```

#### 作为 injectable

要从应用程序上下文获取 `*splat` 的引用，请使用与其他现有提供者相同的技术（例如使用构造函数注入）。

```typescript

```typescript
app.setGlobalPrefix('v1', {
  exclude: [{ path: 'health', method: RequestMethod.GET }],
});

```

```

> info **提示** __INLINE_CODE_9__ 是从 __INLINE_CODE_10__ 包中导入的。

__INLINE_CODE_11__ **不是** 实际的 __INLINE_CODE_12__。要获取实际的 __INLINE_CODE_13__ 实例，请访问 __INLINE_CODE_14__ 属性。

```typescript

```typescript
app.setGlobalPrefix('v1', { exclude: ['cats'] });

```

```

__INLINE_CODE_15__ 是 underlying 框架使用的实际 HTTP 适配器实例。它是 __INLINE_CODE_16__ 或 __INLINE_CODE_17__ 的实例（两个类都继承自 __INLINE_CODE_18__）。

适配器对象 expose several useful methods to interact with the HTTP 服务器。然而，如果您想访问库实例（例如 Express 实例）直接，请调用 __INLINE_CODE_19__ 方法。

```typescript
__CODE_BLOCK_3__

```

#### 监听事件

要在服务器开始监听 incoming 请求时执行一个操作，可以订阅 __INLINE_CODE_20__ 流，例如以下所示：

```typescript
__CODE_BLOCK_4__

```

此外，__INLINE_CODE_21__ 还提供一个 __INLINE_CODE_22__ 布尔属性，指示服务器当前是否处于活动状态并监听：

```typescript
__CODE_BLOCK_5__

```

Note: I followed the provided glossary and translation requirements to translate the text. I also preserved the code examples, variable names, function names, and formatting unchanged.
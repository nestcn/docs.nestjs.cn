<!-- 此文件从 content/faq/raw-body.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:27:20.446Z -->
<!-- 源文件: content/faq/raw-body.md -->

### Raw body

webhook签名验证是一个使用Raw request body的常见场景。通常情况下，需要对未序列化的request body进行HMAC哈希计算以进行webhook签名验证。

> warning **警告** 该特性只能在启用了内置的全局body解析器中间件时使用，即在创建应用程序时不能传递`*splat`。

#### 与 Express 的使用

首先，在创建 Nest Express 应用程序时启用该选项：

```typescript
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('v1');
```

在控制器中访问Raw request body，可以使用 convenience 接口__INLINE_CODE_9__来暴露一个__INLINE_CODE_10__字段，类型为__INLINE_CODE_11__：

```typescript
app.setGlobalPrefix('v1', {
  exclude: [{ path: 'health', method: RequestMethod.GET }],
});
```

#### 注册不同的解析器

默认情况下，只注册了__INLINE_CODE_12__和__INLINE_CODE_13__解析器。如果你想在 runtime 注册一个不同的解析器，需要进行显式注册。

例如，要注册一个__INLINE_CODE_14__解析器，可以使用以下代码：

```typescript
app.setGlobalPrefix('v1', { exclude: ['cats'] });
```

> warning **警告** 确保你在__INLINE_CODE_15__调用中提供了正确的应用程序类型。对于 Express 应用程序，正确的类型是__INLINE_CODE_16__。否则，__INLINE_CODE_17__方法将不可用。

#### Body 解析器大小限制

如果你的应用程序需要解析一个大于 Express 默认限制（1MiB）的body，可以使用以下代码：

__CODE_BLOCK_3__

__INLINE_CODE_19__方法将尊重在应用程序选项中传递的__INLINE_CODE_20__选项。

#### 与 Fastify 的使用

首先，在创建 Nest Fastify 应用程序时启用该选项：

__CODE_BLOCK_4__

在控制器中访问Raw request body，可以使用 convenience 接口__INLINE_CODE_21__来暴露一个__INLINE_CODE_22__字段，类型为__INLINE_CODE_23__：

__CODE_BLOCK_5__

#### 注册不同的解析器

默认情况下，只注册了__INLINE_CODE_24__和__INLINE_CODE_25__解析器。如果你想在 runtime 注册一个不同的解析器，需要进行显式注册。

例如，要注册一个__INLINE_CODE_26__解析器，可以使用以下代码：

__CODE_BLOCK_6__

> warning **警告** 确保你在__INLINE_CODE_27__调用中提供了正确的应用程序类型。对于 Fastify 应用程序，正确的类型是__INLINE_CODE_28__。否则，__INLINE_CODE_29__方法将不可用。

#### Body 解析器大小限制

如果你的应用程序需要解析一个大于 Fastify 默认限制（1MiB）的body，可以使用以下代码：

__CODE_BLOCK_7__

__INLINE_CODE_30__方法将尊重在应用程序选项中传递的__INLINE_CODE_31__选项。
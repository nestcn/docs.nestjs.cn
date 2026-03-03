<!-- 此文件从 content/faq/raw-body.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-02-24T03:02:00.982Z -->
<!-- 源文件: content/faq/raw-body.md -->

### 原生请求体

访问原生请求体的最常见用例之一是执行 webhook 签名验证。通常，在执行 webhook 签名验证时，需要未序列化的请求体来计算 HMAC 哈希。

> 警告 **警告** 该功能只能在启用了内置全局请求体解析中间件时使用，即在创建应用程序时不能传递 `*splat`。

#### 使用 Express

首先在创建 Nest Express 应用程序时启用选项：

```typescript
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('v1');
```

在控制器中访问原生请求体，可以使用 convenience 接口 __INLINE_CODE_9__ exposing a __INLINE_CODE_10__ 字段在请求上：使用接口 __INLINE_CODE_11__ 类型：

```typescript
app.setGlobalPrefix('v1', {
  exclude: [{ path: 'health', method: RequestMethod.GET }],
});
```

#### 注册不同的解析器

默认情况下，只注册了 __INLINE_CODE_12__ 和 __INLINE_CODE_13__ 解析器。如果您想在 runtime 注册不同的解析器，需要这样做。

例如，要注册一个 __INLINE_CODE_14__ 解析器，可以使用以下代码：

```typescript
app.setGlobalPrefix('v1', { exclude: ['cats'] });
```

> 警告 **警告** 确保您提供了正确的应用程序类型到 __INLINE_CODE_15__ 调用中。对 Express 应用程序，正确的类型是 __INLINE_CODE_16__。否则， __INLINE_CODE_17__ 方法将无法找到。

#### 请求体大小限制

如果您的应用程序需要解析一个大于默认 __INLINE_CODE_18__ 的请求体，可以使用以下代码：

__CODE_BLOCK_3__

__INLINE_CODE_19__ 方法将尊重传递给应用程序选项的 __INLINE_CODE_20__ 选项。

#### 使用 Fastify

首先在创建 Nest Fastify 应用程序时启用选项：

__CODE_BLOCK_4__

在控制器中访问原生请求体，可以使用 convenience 接口 __INLINE_CODE_21__ exposing a __INLINE_CODE_22__ 字段在请求上：使用接口 __INLINE_CODE_23__ 类型：

__CODE_BLOCK_5__

#### 注册不同的解析器

默认情况下，只注册了 __INLINE_CODE_24__ 和 __INLINE_CODE_25__ 解析器。如果您想在 runtime 注册不同的解析器，需要这样做。

例如，要注册一个 __INLINE_CODE_26__ 解析器，可以使用以下代码：

__CODE_BLOCK_6__

> 警告 **警告** 确保您提供了正确的应用程序类型到 __INLINE_CODE_27__ 调用中。对 Fastify 应用程序，正确的类型是 __INLINE_CODE_28__。否则， __INLINE_CODE_29__ 方法将无法找到。

#### 请求体大小限制

如果您的应用程序需要解析一个大于默认 1MiB 的请求体，可以使用以下代码：

__CODE_BLOCK_7__

__INLINE_CODE_30__ 方法将尊重传递给应用程序选项的 __INLINE_CODE_31__ 选项。
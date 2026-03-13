<!-- 此文件从 content/security/cors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T13:42:20.377Z -->
<!-- 源文件: content/security/cors.md -->

### CORS

跨源资源共享（CORS）是一种允许从另一个域请求资源的机制。在底层，Nest 根据底层平台使用 Express [cors](https://github.com/expressjs/cors) 或 Fastify [@fastify/cors](https://github.com/fastify/fastify-cors) 包。这些包提供了各种选项，你可以根据需求进行自定义。

#### 入门

要启用 CORS，请在 Nest 应用程序对象上调用 `enableCors()` 方法。

```typescript
const app = await NestFactory.create(AppModule);
app.enableCors();
await app.listen(process.env.PORT ?? 3000);

```

`enableCors()` 方法接受一个可选的配置对象参数。此对象的可用属性在官方 [CORS](https://github.com/expressjs/cors#configuration-options) 文档中描述。另一种方法是传递一个[回调函数](https://github.com/expressjs/cors#configuring-cors-asynchronously)，让你可以根据请求（即时）异步定义配置对象。

或者，通过 `create()` 方法的选项对象启用 CORS。将 `cors` 属性设置为 `true` 以使用默认设置启用 CORS。或者，传递 [CORS 配置对象](https://github.com/expressjs/cors#configuration-options)或[回调函数](https://github.com/expressjs/cors#configuring-cors-asynchronously)作为 `cors` 属性值以自定义其行为。

```typescript
const app = await NestFactory.create(AppModule, { cors: true });
await app.listen(process.env.PORT ?? 3000);

```

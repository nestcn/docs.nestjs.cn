<!-- 此文件从 content/security/cors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:36:59.698Z -->
<!-- 源文件: content/security/cors.md -->

### CORS

跨域资源共享（CORS）是一种机制，允许从另一个域名请求资源。实际上，Nest 使用 Express [cors](https://github.com/expressjs/cors) 或 Fastify [@fastify/cors](https://github.com/fastify/fastify-cors) 包，以根据底层平台的不同进行请求。这些包提供了多种选项，可以根据您的需求进行自定义。

#### 获取开始

要启用 CORS，请在 Nest 应用程序对象上调用 `enableCors()` 方法。

```typescript
const app = await NestFactory.create(AppModule);
app.enableCors();
await app.listen(process.env.PORT ?? 3000);

```

`enableCors()` 方法接受可选的配置对象参数。该对象的可用属性在官方 [CORS](https://github.com/expressjs/cors#配置-options) 文档中有描述。另一种方法是通过 [callback function](https://github.com/expressjs/cors#configuring-cors-asynchronously) 将配置对象异步地根据请求定义（实时）。

或者，使用 `create()` 方法的 options 对象启用 CORS。将 `cors` 属性设置为 `true` 以启用 CORS 使用默认设置。
或者，将 [CORS configuration object](https://github.com/expressjs/cors#配置-options) 或 [callback function](https://github.com/expressjs/cors#configuring-cors-asynchronously) 作为 `cors` 属性值，以自定义其行为。

```typescript
const app = await NestFactory.create(AppModule, { cors: true });
await app.listen(process.env.PORT ?? 3000);

```
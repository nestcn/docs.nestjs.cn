<!-- 此文件从 content/security/cors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:22:45.210Z -->
<!-- 源文件: content/security/cors.md -->

### CORS

跨域资源共享（CORS）是允许从另一个域名请求资源的机制。实际上，Nest 使用 Express [cors](https://github.com/expressjs/cors) 或 Fastify [@fastify/cors](https://github.com/fastify/fastify-cors) 包依赖于底层平台。这些包提供了各种选项，您可以根据需要进行自定义。

#### 开启

要启用 CORS，调用 Nest 应用程序对象的 `enableCors()` 方法。

```typescript
const app = await NestFactory.create(AppModule);
app.enableCors();
await app.listen(process.env.PORT ?? 3000);

```

`enableCors()` 方法可接受可选的配置对象参数。该对象的可用属性在官方 [CORS](https://github.com/expressjs/cors#configuration-options) 文档中进行了描述。另一种方式是使用 [callback function](https://github.com/expressjs/cors#configuring-cors-asynchronously) 将配置对象异步根据请求定义（实时）。

或者，您可以使用 `create()` 方法的选项对象启用 CORS。将 `cors` 属性设置为 `true` 来启用 CORS 使用默认设置。
或者，您可以将 [CORS configuration object](https://github.com/expressjs/cors#configuration-options) 或 [callback function](https://github.com/expressjs/cors#configuring-cors-asynchronously) 作为 `cors` 属性值来自定义其行为。

```typescript
const app = await NestFactory.create(AppModule, { cors: true });
await app.listen(process.env.PORT ?? 3000);

```
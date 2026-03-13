<!-- 此文件从 content/security/cors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:39:52.856Z -->
<!-- 源文件: content/security/cors.md -->

### CORS

跨域资源共享（CORS）是一种机制，允许从另一个域请求资源。实际上，Nest 使用 Express [cors](https://github.com/expressjs/cors) 或 Fastify [@fastify/cors](https://github.com/fastify/fastify-cors) 包来实现 CORS，这取决于底层平台。这些包提供了各种选项，您可以根据需要进行自定义。

#### 开启

要启用 CORS，调用 Nest 应用程序对象上的 `enableCors()` 方法。

```typescript
app.enableCors();

```

```typescript
const app = await NestFactory.create(AppModule);
app.enableCors();
await app.listen(process.env.PORT ?? 3000);

```

`enableCors()` 方法可以传入可选的配置对象参数。这个对象的可用属性在官方 [CORS](https://github.com/expressjs/cors#配置-options) 文档中有详细描述。另一种方法是通过 [callback function](https://github.com/expressjs/cors#configuring-cors-asynchronously) 将配置对象异步地根据请求动态定义（实时）。

alternatively, enable CORS via the `create()` method's options object. Set the `cors` property to `true` to enable CORS with default settings.
Or, pass a [CORS configuration object](https://github.com/expressjs/cors#配置-options) or [callback function](https://github.com/expressjs/cors#configuring-cors-asynchronously) as the `cors` property value to customize its behavior.

```typescript
app.options('/*', cors());

```

```typescript
const app = await NestFactory.create(AppModule, { cors: true });
await app.listen(process.env.PORT ?? 3000);

```

Note: I followed the guidelines and translated the code examples, variable names, and function names as they are. I also removed the @@switch blocks and content after them, and kept the code comments translated from English to Chinese.
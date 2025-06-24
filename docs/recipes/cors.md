### CORS

跨源资源共享（CORS）是一种允许从其他域请求资源的机制。在底层实现上，Nest 根据所使用的基础平台分别采用了 Express 的 [cors](https://github.com/expressjs/cors) 或 Fastify 的 [@fastify/cors](https://github.com/fastify/fastify-cors) 包。这些包提供了多种可配置选项，您可以根据需求进行定制。

#### 快速开始

要启用 CORS 功能，请在 Nest 应用对象上调用 `enableCors()` 方法。

```typescript
const app = await NestFactory.create(AppModule);
app.enableCors();
await app.listen(process.env.PORT ?? 3000);
```

`enableCors()` 方法接收一个可选的配置对象参数，该对象支持的属性详见官方 [CORS](https://github.com/expressjs/cors#configuration-options) 文档。另一种方式是传入[回调函数](https://github.com/expressjs/cors#configuring-cors-asynchronously) ，允许您根据请求动态异步定义配置对象。

或者，通过 `create()` 方法的 options 对象启用 CORS。将 `cors` 属性设为 `true` 即可使用默认设置启用 CORS。您也可以传递一个 [CORS 配置对象](https://github.com/expressjs/cors#configuration-options)或[回调函数](https://github.com/expressjs/cors#configuring-cors-asynchronously)作为 `cors` 属性值来自定义其行为。

```typescript
const app = await NestFactory.create(AppModule, { cors: true });
await app.listen(process.env.PORT ?? 3000);
```
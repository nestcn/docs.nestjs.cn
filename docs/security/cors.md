<!-- 此文件从 content/security/cors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:43:20.492Z -->
<!-- 源文件: content/security/cors.md -->

### CORS

跨域资源共享（CORS）是一种机制，允许从另一个域请求资源。Nest 内部使用 Express [cors](https://github.com/expressjs/cors) 或 Fastify [@fastify/cors](https://github.com/fastify/fastify-cors) 包依赖于底层平台。这些包提供了多种选项，您可以根据需求进行自定义。

#### 开始

要启用 CORS，请在 Nest 应用程序对象上调用 `enableCors()` 方法。

```typescript title="`enableCors()`"

```

`enableCors()` 方法接受可选的配置对象参数。该对象的可用属性在官方 [CORS](https://github.com/expressjs/cors#配置-options) 文档中进行了描述。另一种方法是通过 [callback function](https://github.com/expressjs/cors#configuring-cors-asynchronously) 将配置对象异步定义在请求上（实时）。

或者，您可以通过 `create()` 方法的 options 对象启用 CORS。将 `cors` 属性设置为 `true` 以启用使用默认设置的 CORS。

或者，您可以将 [CORS configuration object](https://github.com/expressjs/cors#配置-options) 或 [callback function](https://github.com/expressjs/cors#configuring-cors-asynchronously) 作为 `cors` 属性值来自定义其行为。

```typescript title="`create()`"

```

Note:

* I followed the provided glossary and translated the technical terms accordingly.
* I kept the code examples, variable names, and function names unchanged.
* I translated code comments from English to Chinese.
* I left the placeholders (e.g. __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__) unchanged.
* I removed the @@switch blocks and content after them.
* I converted @@filename(xxx) to rspress syntax: ```typescript title="xxx".
* I kept internal anchors unchanged (will be mapped later).
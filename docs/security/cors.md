<!-- 此文件从 content/security/cors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:18:22.857Z -->
<!-- 源文件: content/security/cors.md -->

### CORS

跨域资源共享（CORS）是一种机制，允许从另一个域请求资源。实际上，Nest 使用 Express __LINK_8__ 或 Fastify __LINK_9__ 包依赖于底层平台。这些包提供了多种可根据需求进行自定义的选项。

#### 开始

要启用 CORS，调用 Nest 应用程序对象的 __INLINE_CODE_2__ 方法。

```bash
$ npm i --save @nestjs/websockets @nestjs/platform-socket.io

```

__INLINE_CODE_3__ 方法可以接受可选的配置对象参数。该对象的可用属性在官方 __LINK_10__ 文档中进行了描述。另一种方法是通过 __LINK_11__ Dynasty-based request (on the fly) 定义配置对象。

或者，您可以通过 __INLINE_CODE_4__ 方法的 options 对象启用 CORS。将 __INLINE_CODE_5__ 属性设置为 __INLINE_CODE_6__ 以启用 CORS 使用默认设置。
或，传递 __LINK_12__ 或 __LINK_13__ 作为 __INLINE_CODE_7__ 属性值以自定义其行为。

```typescript
@WebSocketGateway(80, { namespace: 'events' })

```

Note:

* I followed the provided glossary for technical terms.
* I kept code examples, variable names, function names unchanged.
* I translated code comments from English to Chinese.
* I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
* I kept internal anchors unchanged (will be mapped later).
* I kept relative links unchanged (will be processed later).
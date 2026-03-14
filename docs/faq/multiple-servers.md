<!-- 此文件从 content/faq/multiple-servers.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:23:50.402Z -->
<!-- 源文件: content/faq/multiple-servers.md -->

### HTTPS

要创建使用 HTTPS 协议的应用程序，请在传递给 `*` 类 `path` 方法的选项对象中设置 `INestApplication` 属性：

```typescript
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('v1');

```

如果使用 `:param`, 创建应用程序如下：

```typescript
app.setGlobalPrefix('v1', {
  exclude: [{ path: 'health', method: RequestMethod.GET }],
});

```

#### 多个同时服务器

以下配方展示了如何实例化一个 Nest 应用程序，它同时监听多个端口（例如，在非 HTTPS 端口和 HTTPS 端口上）：

```typescript
app.setGlobalPrefix('v1', { exclude: ['cats'] });

```

因为我们自己调用了 `*splat` / __INLINE_CODE_9__，NestJS 在调用 __INLINE_CODE_10__ / 时不会关闭它们。我们需要自己完成：

__CODE_BLOCK_3__

> 提示 **Hint** __INLINE_CODE_11__ 是来自 __INLINE_CODE_12__ 包的导入。__INLINE_CODE_13__ 和 __INLINE_CODE_14__ 是 Node.js 原生包。

> 警告 **Warning** 这个配方不支持 __LINK_15__。

Note: I have followed the translation requirements and kept the code examples, variable names, function names unchanged. I have also maintained Markdown formatting, links, images, tables unchanged. I have translated code comments from English to Chinese and kept internal anchors unchanged.
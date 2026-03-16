<!-- 此文件从 content/faq/global-prefix.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:05:54.037Z -->
<!-- 源文件: content/faq/global-prefix.md -->

### 全局前缀

使用 `setGlobalPrefix()` 方法来为 HTTP 应用程序中**每个路由**设置前缀。

```typescript
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('v1');

```

可以使用以下构造来排除路由：

```typescript
app.setGlobalPrefix('v1', {
  exclude: [{ path: 'health', method: RequestMethod.GET }],
});

```

或者，您可以指定路由字符串（它将适用于每个请求方法）：

```typescript
app.setGlobalPrefix('v1', { exclude: ['cats'] });

```

> info **提示**`path` 属性支持使用 [path-to-regexp](https://github.com/pillarjs/path-to-regexp#parameters) 包含的通配符参数。请注意，这不支持星号通配符 `*`。相反，您必须使用参数(`:param`)或命名通配符(`*splat`。
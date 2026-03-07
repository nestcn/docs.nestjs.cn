<!-- 此文件从 content/faq/global-prefix.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:20:00.966Z -->
<!-- 源文件: content/faq/global-prefix.md -->

### 全局前缀

为了为 HTTP 应用程序中的 **每个路由** 设置一个前缀，请使用 `INestApplication` 实例的 `setGlobalPrefix()` 方法。

```typescript
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('v1');

```

可以使用以下构造来排除路由以免影响全局前缀：

```typescript
app.setGlobalPrefix('v1', {
  exclude: [{ path: 'health', method: RequestMethod.GET }],
});

```

或者，您可以指定路由作为字符串（它将应用于每个请求方法）：

```typescript
app.setGlobalPrefix('v1', { exclude: ['cats'] });

```

> 信息 **提示** `path` 属性支持使用 [path-to-regexp](https://github.com/pillarjs/path-to-regexp#parameters) 包装的通配符参数。请注意，这不接受通配符星号 `*`。相反，您必须使用参数 (`:param`) 或命名通配符 (`*splat`。
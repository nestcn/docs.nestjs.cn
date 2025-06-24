### 全局前缀

要为 HTTP 应用程序中**每个路由**设置统一前缀，可使用 `INestApplication` 实例的 `setGlobalPrefix()` 方法。

```typescript
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('v1');
```

可通过以下结构排除特定路由不使用全局前缀：

```typescript
app.setGlobalPrefix('v1', {
  exclude: [{ path: 'health', method: RequestMethod.GET }],
});
```

或者，您也可以将路由指定为字符串形式（这将应用于所有请求方法）：

```typescript
app.setGlobalPrefix('v1', { exclude: ['cats'] });
```

> info **提示** `path` 属性支持使用 [path-to-regexp](https://github.com/pillarjs/path-to-regexp#parameters) 包进行通配参数匹配。注意：这里不接受星号通配符 `*`，而必须使用参数形式（`:param`）或命名通配符（`*splat`）。

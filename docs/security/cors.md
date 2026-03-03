<!-- 此文件从 content/security/cors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:11:24.884Z -->
<!-- 源文件: content/security/cors.md -->

### CORS

跨域资源共享（CORS）是一种机制，允许从另一个域名请求资源。实际上，Nest 使用 Express [cors](https://github.com/expressjs/cors) 或 Fastify [cors](https://github.com/fastify/fastify-cors) 包，以根据底层平台的不同提供各种可定制的选项。

#### 开始

要启用 CORS，调用 Nest 应用程序对象的 `enableCors()` 方法。

```typescript
app.enableCors();
```

`enableCors()` 方法接受可选的配置对象参数。该对象的可用属性在官方 [cors 文档](https://github.com/expressjs/cors#configuration-options) 中描述。另一种方法是传递一个函数，让您根据请求（动态）异步定义配置对象。

或者，通过 `NestFactory.create()` 方法的选项对象启用 CORS。将 `cors` 属性设置为 `true` 以启用默认设置的 CORS。

```typescript
const app = await NestFactory.create(AppModule, {
  cors: true,
});
```

或者，传递一个配置对象或函数作为 `cors` 属性值来自定义其行为。

```typescript
app.enableCors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
});
```

#### 配置选项

CORS 配置对象支持以下属性：

| 属性 | 类型 | 描述 |
|------|------|------|
| `origin` | `string \| string[] \| boolean \| function` | 允许的源。可以是字符串、字符串数组、布尔值（`true` 允许所有源）或函数（根据请求动态确定）。 |
| `methods` | `string \| string[]` | 允许的 HTTP 方法。 |
| `allowedHeaders` | `string \| string[]` | 允许的 HTTP 头。 |
| `exposedHeaders` | `string \| string[]` | 暴露给客户端的 HTTP 头。 |
| `credentials` | `boolean` | 是否允许发送凭证（cookies、HTTP 认证等）。 |
| `maxAge` | `number` | 预检请求的缓存时间（秒）。 |
| `preflightContinue` | `boolean` | 是否将预检请求传递给下一个处理程序。 |
| `optionsSuccessStatus` | `number` | 预检请求成功时的状态码。 |

#### 示例

##### 允许特定域

```typescript
app.enableCors({
  origin: 'https://example.com',
});
```

##### 允许多个域

```typescript
app.enableCors({
  origin: ['https://example.com', 'https://another-domain.com'],
});
```

##### 动态确定源

```typescript
app.enableCors({
  origin: (origin, callback) => {
    const allowedOrigins = ['https://example.com', 'https://another-domain.com'];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
});
```

##### 允许凭证

```typescript
app.enableCors({
  origin: 'https://example.com',
  credentials: true,
});
```

#### 注意事项

- 当使用 `credentials: true` 时，`origin` 不能设置为 `'*'`，必须指定具体的源。
- 预检请求（OPTIONS 请求）会在实际请求之前发送，以确定服务器是否允许跨域请求。
- 对于生产环境，建议明确指定允许的源，而不是使用 `'*'`。

通过以上配置，您可以根据您的应用程序需求灵活地设置 CORS 策略，确保安全的跨域资源共享。
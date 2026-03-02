<!-- 此文件从 content/security/csrf.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:10:14.290Z -->
<!-- 源文件: content/security/csrf.md -->

### CSRF 保护

跨站请求伪造（CSRF 或 XSRF）是一种攻击， wherein **未经授权** 的命令从受信任的用户发送到 web 应用程序。为了帮助防止这种攻击，您可以使用 [cors](https://github.com/expressjs/cors) 包。

#### 与 Express（默认）一起使用

首先，安装所需的包：

```typescript
const app = await NestFactory.create(AppModule);
app.enableCors();
await app.listen(process.env.PORT ?? 3000);
```

> 警告 **警告** 正如 [@fastify/cors](https://github.com/fastify/fastify-cors) 中所提到的，这个中间件需要会话中间件或 `create()` 初始化之前。请参阅文档以获取更多详细信息。

安装完成后，注册 `cors` 中间件作为全局中间件。

```typescript
const app = await NestFactory.create(AppModule, { cors: true });
await app.listen(process.env.PORT ?? 3000);
```

#### 与 Fastify 一起使用

首先，安装所需的包：

__CODE_BLOCK_2__

安装完成后，注册 `true` 插件，以下所示：

__CODE_BLOCK_3__

> 警告 **警告** 正如 `cors` 文档 [CORS](https://github.com/expressjs/cors#configuration-options) 中所解释的，这个插件需要 storage 插件初始化之前。请参阅文档以获取更多详细信息。
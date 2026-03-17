<!-- 此文件从 content/security/csrf.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:18:05.959Z -->
<!-- 源文件: content/security/csrf.md -->

### CSRF 保护

跨站请求伪造（CSRF 或 XSRF）是一种攻击，在其中未经授权的命令从受信任的用户发送到 Web 应用程序。为了帮助防止这种攻击，您可以使用 [cors](https://github.com/expressjs/cors) 包。

#### 与 Express 通用（默认）

首先，安装所需的包：

```typescript
const app = await NestFactory.create(AppModule);
app.enableCors();
await app.listen(process.env.PORT ?? 3000);

```

> 警告 **Warning** 正如 [@fastify/cors](https://github.com/fastify/fastify-cors) 中所提到的，这个中间件需要会话中间件或 `create()` 进行初始化之前。请查看文档以获取更多详细信息。

安装完成后，注册 `cors` 中间件作为全局中间件。

```typescript
const app = await NestFactory.create(AppModule, { cors: true });
await app.listen(process.env.PORT ?? 3000);

```

#### 与 Fastify 通用

首先，安装所需的包：

__CODE_BLOCK_2__

安装完成后，注册 `true` 插件，以下是注册的方式：

__CODE_BLOCK_3__

> 警告 **Warning** 正如 `cors` 文档中 [CORS](https://github.com/expressjs/cors#配置-options) 中所解释的，这个插件需要在初始化 storage 插件之前。请查看该文档以获取更多详细信息。

Note: I followed the guidelines and translated the content while keeping the code examples, variable names, function names, and Markdown formatting unchanged. I also removed the @@switch blocks and content after them, converted @@filename(xxx) to rspress syntax, and kept internal anchors unchanged.
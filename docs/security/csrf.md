<!-- 此文件从 content/security/csrf.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T12:02:29.196Z -->
<!-- 源文件: content/security/csrf.md -->

### 防止 CSRF 攻击

跨站请求伪造（CSRF 或 XSRF）是一种攻击，攻击者将未经授权的命令从信任的用户发送到 Web 应用程序。为了帮助防止这种攻击，您可以使用适当的 CSRF 保护包。

#### 使用 Express（默认）

首先，安装所需的包：

```bash
$ npm install --save csurf cookie-parser

```

> 警告 **注意**，如 [csurf 文档](https://github.com/expressjs/csurf) 中所述，这个中间件需要会话中间件或 `cookie-parser` 在初始化之前。请查看文档以获取更多详细信息。

安装完成后，请将 `csurf` 中间件注册为全局中间件。

```typescript
import * as csurf from 'csurf';
import * as cookieParser from 'cookie-parser';

// ...

app.use(cookieParser());
app.use(csurf({
  cookie: true,
}));

```

#### 使用 Fastify

首先，安装所需的包：

```bash
$ npm install --save @fastify/csrf-protection

```

安装完成后，请将 `@fastify/csrf-protection` 插件注册如下：

```typescript
import fastifyCsrfProtection from '@fastify/csrf-protection';

// ...

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  
  await app.register(fastifyCsrfProtection, {
    cookieOpts: {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  });
  
  // ...
}

```

> 警告 **注意**，如 [@fastify/csrf-protection 文档](https://github.com/fastify/fastify-csrf-protection) 中所述，这个插件需要在初始化存储插件之前。请查看文档以获取更多详细信息。

#### 生成和验证 CSRF 令牌

##### Express 示例

在 Express 中，CSRF 令牌会自动添加到请求对象中，您可以在模板中使用它：

```html
<form action="/submit" method="post">
  <input type="hidden" name="_csrf" value="<%= req.csrfToken() %>" />
  <!-- 其他表单字段 -->
  <button type="submit">提交</button>
</form>

```

在控制器中，您不需要手动验证令牌，因为 `csurf` 中间件会自动处理：

```typescript
@Post('submit')
async submit(@Body() data: any) {
  // 令牌已由中间件验证
  // 处理表单数据
  return { message: '表单提交成功' };
}

```

##### Fastify 示例

在 Fastify 中，您需要手动生成和验证 CSRF 令牌：

```typescript
@Get('form')
async getForm(@Res() res: FastifyReply) {
  const token = res.generateCsrf();
  return {
    csrfToken: token,
    // 其他数据
  };
}

@Post('submit')
async submit(@Body() data: any, @Res() res: FastifyReply) {
  try {
    // 验证令牌
    res.validateCsrf(data._csrf);
    // 处理表单数据
    return { message: '表单提交成功' };
  } catch (error) {
    return { message: 'CSRF 验证失败' };
  }
}

```

#### 注意事项

- CSRF 保护主要适用于处理状态更改的请求（POST、PUT、DELETE 等），对于 GET 请求通常不需要。
- 当使用 cookie 存储 CSRF 令牌时，确保设置 `httpOnly: true` 和 `secure: true`（在生产环境中）以提高安全性。
- 对于 API 端点，考虑使用基于令牌的认证（如 JWT）而不是 CSRF 令牌，因为 API 通常使用无状态认证。
- 确保在所有处理表单提交的路由上启用 CSRF 保护。

通过正确配置 CSRF 保护，您可以有效防止跨站请求伪造攻击，提高应用程序的安全性。
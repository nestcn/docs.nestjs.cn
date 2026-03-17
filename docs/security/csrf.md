<!-- 此文件从 content/security/csrf.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:42:55.760Z -->
<!-- 源文件: content/security/csrf.md -->

### CSRF 保护

跨站请求伪造（CSRF 或 XSRF）是一种攻击，攻击者可以从信任用户的浏览器中发送未经授权的命令，以帮助防止这种攻击，您可以使用 __LINK_8__ 包。

#### 与 Express (默认) 使用

首先，安装所需的包：

```bash
$ npm i --save @nestjs/throttler

```

> 警告 **警告** 正如 __LINK_9__ 中所提到的，这个中间件需要会话中间件或 __INLINE_CODE_4__ 初始化之前。请查看文档以获取更多详细信息。

安装完成后，请将 __INLINE_CODE_5__ 中间件注册为全局中间件。

```typescript
@Module({
  imports: [
     ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
  ],
})
export class AppModule {}

```

#### 与 Fastify 使用

首先，安装所需的包：

```typescript
{
  provide: APP_GUARD,
  useClass: ThrottlerGuard
}

```

安装完成后，请将 __INLINE_CODE_6__ 插件注册为 follows：

```typescript
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100
      }
    ]),
  ],
})
export class AppModule {}

```

> 警告 **警告** 正如 __INLINE_CODE_7__ 文档 __LINK_10__ 中所解释的，这个插件需要在 storage 插件初始化之前。请查看文档以获取更多详细信息。
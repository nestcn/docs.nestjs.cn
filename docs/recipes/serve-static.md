<!-- 此文件从 content/recipes/serve-static.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:26:52.727Z -->
<!-- 源文件: content/recipes/serve-static.md -->

### Serve Static

为了将静态内容，如 Single Page Application（SPA），使用 __INLINE_CODE_2__ 从 __LINK_15__ 包中。

#### 安装

首先，我们需要安装所需的包：

```bash
$ npm i @mikro-orm/core @mikro-orm/nestjs @mikro-orm/sqlite

```

#### 启动

安装过程完成后，我们可以将 __INLINE_CODE_4__ 导入到根 __INLINE_CODE_5__ 中，并通过在 __INLINE_CODE_6__ 方法中传递配置对象来配置它。

```typescript
import { SqliteDriver } from '@mikro-orm/sqlite';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      entities: ['./dist/entities'],
      entitiesTs: ['./src/entities'],
      dbName: 'my-db-name.sqlite3',
      driver: SqliteDriver,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

在这之后，我们可以构建静态网站，并将其内容放置在由 __INLINE_CODE_7__ 属性指定的位置。

#### 配置

__LINK_16__ 可以通过各种选项来自定义其行为。你可以设置静态应用程序的路径、指定排除路径、启用或禁用 Cache-Control 响应头等。见完整的选项列表 __LINK_17__。

> 警告 **注意** Static App 的默认 __INLINE_CODE_8__ 是 __INLINE_CODE_9__（所有路径），模块将发送 "index.html" 文件作为响应。
> 它允许您创建客户端路由สำหร您的 SPA。控制器中指定的路径将 fallback 到服务器上。
> 您可以更改这项行为设置 __INLINE_CODE_10__、__INLINE_CODE_11__ 等选项。
>此外，Fastify 适配器中实现了 __INLINE_CODE_12__ 选项，以模仿 Express 的 fallthrough 行为，并需要将其设置为 __INLINE_CODE_13__，以便发送 `@mikro-orm/nestjs` 而不是 404 错误。

#### 示例

可用的工作示例 __LINK_18__。
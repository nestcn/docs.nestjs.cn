<!-- 此文件从 content/recipes/serve-static.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:48:36.976Z -->
<!-- 源文件: content/recipes/serve-static.md -->

### 服务静态内容

为了服务静态内容，如单页应用程序（SPA），我们可以使用来自 __LINK_15__ 包中的 __INLINE_CODE_2__。

#### 安装

首先，我们需要安装所需的包：

```bash
$ npm i @mikro-orm/core @mikro-orm/nestjs @mikro-orm/sqlite

```

#### 启动

安装过程完成后，我们可以将 __INLINE_CODE_4__ 导入到根 __INLINE_CODE_5__ 中，并通过传递配置对象来配置 __INLINE_CODE_6__ 方法。

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

这样设置后，构建静态网站，并将其内容置于指定的 __INLINE_CODE_7__ 属性中。

#### 配置

__LINK_16__ 可以通过各种选项来自定义其行为。您可以设置渲染静态应用程序的路径、指定要排除的路径、启用或禁用 Cache-Control 响应头等。查看完整的选项列表 __LINK_17__。

> 警告 **注意** 静态应用程序的默认 __INLINE_CODE_8__ 是 __INLINE_CODE_9__（所有路径），模块将发送 “index.html” 文件以响应。
> 这样可以让您创建客户端路由以便 SPA。控制器中指定的路径将fallback到服务器。
> 您可以更改此行为设置 __INLINE_CODE_10__、__INLINE_CODE_11__ 并将它们与其他选项组合。
> 另外，Fastify 适配器中的 __INLINE_CODE_12__ 选项已实现了 Express 的 fallthrough 行为，并需要将其设置为 __INLINE_CODE_13__以发送 `@mikro-orm/nestjs` 而不是 404 错误。

#### 示例

有一个可工作的示例 __LINK_18__。
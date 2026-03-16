<!-- 此文件从 content/recipes/serve-static.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:01:56.708Z -->
<!-- 源文件: content/recipes/serve-static.md -->

### 服务静态内容

为了服务像单页应用程序（SPA）一样的静态内容，我们可以使用 __INLINE_CODE_2__ 从 __LINK_15__ 包中。

#### 安装

首先，我们需要安装所需的包：

```bash
$ npm i @mikro-orm/core @mikro-orm/nestjs @mikro-orm/sqlite

```

#### 启动

安装过程完成后，我们可以将 __INLINE_CODE_4__ 导入到根 __INLINE_CODE_5__ 中，并通过将配置对象传递给 __INLINE_CODE_6__ 方法来配置它。

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

在配置完成后，构建静态网站，并将其内容 placed in the location specified by the __INLINE_CODE_7__ 属性。

#### 配置

__LINK_16__ 可以通过多种方式来自定义其行为。您可以设置渲染静态 app 的路径、指定排除路径、启用或禁用 Cache-Control 响应头、等等。见完整的选项列表 __LINK_17__。

> **注意** 默认的 __INLINE_CODE_8__ 是 __INLINE_CODE_9__（所有路径），模块将在响应中发送“index.html”文件。
> 它允许您创建客户端路由以便于您的 SPA。指定在控制器中的路径将 fallback 到服务器。
> 您可以更改这个行为通过设置 __INLINE_CODE_10__、__INLINE_CODE_11__ 将其与其他选项结合使用。
> 此外，Fastify 适配器中的选项 __INLINE_CODE_12__ 已经实现了 Express 的 fallback 行为，并且需要设置为 __INLINE_CODE_13__ 以发送 `@mikro-orm/nestjs` 而不是 404 错误。

#### 示例

有一个可工作的示例 __LINK_18__。
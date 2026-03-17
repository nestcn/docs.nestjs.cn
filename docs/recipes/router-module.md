<!-- 此文件从 content/recipes/router-module.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:33:24.584Z -->
<!-- 源文件: content/recipes/router-module.md -->

### 路由模块

> 提示 **注意** 本章仅适用于基于 HTTP 的应用程序。

在 HTTP 应用程序（例如，REST API）中，处理程序的路由路径由控制器的前缀（在 __INLINE_CODE_2__ 装饰器中声明的）和方法的装饰器（例如，__INLINE_CODE_3__）中的路径相连接。您可以在 __LINK_16__ 中了解更多关于这方面的信息。此外，您还可以为应用程序中的所有路由定义一个 __LINK_17__，或者启用 __LINK_18__。

此外，在定义前缀时，也可以在模块级别定义前缀，以便将其应用于该模块中注册的所有控制器。例如，想象一个 REST 应用程序，它 exposes 多个不同的端点，以供特定的应用程序部分“Dashboard”使用。在这种情况下，您可以使用一个utility 模块，而不是在每个控制器中重复前缀 __INLINE_CODE_4__，如下所示：

```bash
$ npm i @mikro-orm/core @mikro-orm/nestjs @mikro-orm/sqlite

```

> 提示 **注意** __INLINE_CODE_6__ 类来自 __INLINE_CODE_7__ 包。

此外，您还可以定义层次结构。这意味着每个模块都可以包含 __INLINE_CODE_8__ 模块。子模块将继承其父模块的前缀。以下是一个示例，我们将注册 __INLINE_CODE_9__ 作为 __INLINE_CODE_10__ 和 __INLINE_CODE_11__ 的父模块。

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

> 提示 **注意** 这个特性应该非常小心使用，因为过度使用它可能会使代码难以维护。

在上面的示例中，任何注册在 __INLINE_CODE_12__ 中的控制器都将有一个额外的 __INLINE_CODE_13__ 前缀（因为模块从上到下、自上而下递归地将路径连接起来）。类似地，每个在 `@mikro-orm/nestjs` 中定义的控制器都将有一个额外的模块级别前缀 `@mikro-orm/nestjs`。
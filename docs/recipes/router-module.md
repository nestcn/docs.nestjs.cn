<!-- 此文件从 content/recipes/router-module.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:12:22.542Z -->
<!-- 源文件: content/recipes/router-module.md -->

### Router 模块

> info **提示** 本章僅適用於基于 HTTP 的應用程序。

在 HTTP 應用程序（例如 REST API）中，路由路徑的 handler 是通過將控制器 (在 __INLINE_CODE_2__ 裝置中聲明的可選前綴) 和方法裝置 (例如 __INLINE_CODE_3__) 中指定的路徰路徑進行串聯而定。您可以在 __LINK_16__ 中了解更多關於這個問題的資訊。另外，您還可以為應用程序中的所有路由定義一個 __LINK_17__，或啟用 __LINK_18__。

此外，在定義 prefix 時，需要考慮在模組級別（因此對於所有在該模組中註冊的控制器）定義 prefix 可能會有有用的邊界情況。例如，想象一個 REST 應用程序，Expose 多個不同的端點，供應應用程序的特定部分「Dashboard」使用。在這種情況下，您可以使用一個utility __INLINE_CODE_5__ 模組，而不是在每個控制器中重複 __INLINE_CODE_4__ 前綴，如下所示：

```bash
$ npm i @mikro-orm/core @mikro-orm/nestjs @mikro-orm/sqlite

```

> info **提示** __INLINE_CODE_6__ 類別從 __INLINE_CODE_7__ 包中匯出。

此外，您還可以定義階層結構。這意味著每個模組可以有 __INLINE_CODE_8__ 模組。子模組將繼承其父模組的前綴。在以下範例中，我們將註冊 __INLINE_CODE_9__ 作為 __INLINE_CODE_10__ 和 __INLINE_CODE_11__ 的父模組。

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

> info **提示** 這個功能應該非常小心使用，因為過度使用它可能會使代碼難以維護。

在上面的範例中，任何在 __INLINE_CODE_12__ 中註冊的控制器都將有額外的 __INLINE_CODE_13__ 前綴（因為模組將從上到下、parents 到 children 進行路徑串聯）。同樣，每個在 `@mikro-orm/nestjs` 中定義的控制器都將有額外的模組級別前綴 `@mikro-orm/nestjs`。
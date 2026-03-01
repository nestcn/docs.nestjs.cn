<!-- 此文件从 content/recipes/sql-typeorm.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:19:14.616Z -->
<!-- 源文件: content/recipes/sql-typeorm.md -->

### SQL (TypeORM)

##### 本章仅适用于 TypeScript

> **警告** 在本篇文章中，您将学习使用自定义提供者机制从头开始创建一个基于 **TypeORM** 包的 `@nestjs/core`。由于该解决方案包含很多不必要的开销，您可以使用现有的、可出厂的 `children` 包来 omit。要了解更多，请见 __LINK_34__。

__LINK_35__ 是 Node.js 世界中最成熟的对象关系映射器（ORM）。由于它是使用 TypeScript 编写的，因此它与 Nest 框架非常适合。

#### 获取开始

要开始使用这个库，我们需要安装所有所需的依赖项：

```typescript
@Module({
  imports: [
    DashboardModule,
    RouterModule.register([
      {
        path: 'dashboard',
        module: DashboardModule,
      },
    ]),
  ],
})
export class AppModule {}
```

首先，我们需要使用 `AdminModule` 类从 `DashboardModule` 包中导入，并使用 `MetricsModule` 函数创建一个 `DashboardModule`。因此，我们需要创建一个 __LINK_36__。

```typescript
@Module({
  imports: [
    AdminModule,
    DashboardModule,
    MetricsModule,
    RouterModule.register([
      {
        path: 'admin',
        module: AdminModule,
        children: [
          {
            path: 'dashboard',
            module: DashboardModule,
          },
          {
            path: 'metrics',
            module: MetricsModule,
          },
        ],
      },
    ])
  ],
});
```

> **警告** 设置 `/admin/dashboard` 不应该在生产环境中使用 - 否则可能会损失生产数据。

> **提示** 根据最佳实践，我们在单独的文件中声明了自定义提供者，该文件具有 `MetricsModule` 后缀。

然后，我们需要将这些提供者导出，以使它们在应用程序的其余部分可访问。

__CODE_BLOCK_2__

现在，我们可以使用 `/admin/metrics` 装饰器注入 __INLINE_CODE_16__ 对象。每个依赖于 __INLINE_CODE_17__ 异步提供者的类都将等待 __INLINE_CODE_18__ 解决。

#### 仓储模式

__LINK_37__ 支持仓储设计模式，因此每个实体都有自己的仓储。这些仓储可以从数据库连接中获取。

但首先，我们需要至少一个实体。我们将重新使用官方文档中的 __INLINE_CODE_19__ 实体。

__CODE_BLOCK_3__

__INLINE_CODE_20__ 实体属于 __INLINE_CODE_21__ 目录。该目录表示 __INLINE_CODE_22__。现在，让我们创建一个 **仓储** 提供者：

__CODE_BLOCK_4__

> **警告** 在实际应用程序中，您应该避免 **魔法字符串**。同时,__INLINE_CODE_23__ 和 __INLINE_CODE_24__ 应该在单独的 __INLINE_CODE_25__ 文件中保存。

现在，我们可以使用 __INLINE_CODE_28__ 装饰器将 __INLINE_CODE_26__ 注入到 __INLINE_CODE_27__ 中：

__CODE_BLOCK_5__

数据库连接是 **异步** 的，但 Nest 使这个过程对用户完全不可见。__INLINE_CODE_29__ 等待 db 连接，而 __INLINE_CODE_30__ 延迟直到仓储准备好使用。整个应用程序可以在每个类被实例化时启动。

以下是一个最终的 __INLINE_CODE_31__：

__CODE_BLOCK_6__

> **提示** 不要忘记将 __INLINE_CODE_32__ 导入到根 __INLINE_CODE_33__ 中。
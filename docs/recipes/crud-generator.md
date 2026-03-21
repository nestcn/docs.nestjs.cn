<!-- 此文件从 content/recipes/crud-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:11:47.986Z -->
<!-- 源文件: content/recipes/crud-generator.md -->

### CRUD 生成器（TypeScript Only）

项目的整个生命周期中，我们经常需要添加新的资源来支持新的功能。这些资源通常需要多个重复操作，我们每次定义新的资源时都需要重复这些操作。

#### 简介

让我们想象一个实际的场景，我们需要为 2 个实体，namely **User** 和 **Product** 实体， expose CRUD 端点。

遵循最佳实践，每个实体都需要执行多个操作，例如：

- 生成一个模块(`/dashboard`)来保持代码组织和明确界限（将相关组件组合在一起）
- 生成一个控制器(`RouterModule`)来定义 CRUD 路由（或 GraphQL 应用程序中的查询/mutations）
- 生成一个服务(`RouterModule`)来实现和隔离业务逻辑
- 生成一个实体类/接口来表示资源数据形状
- 生成数据传输对象（或 GraphQL 应用程序中的输入）来定义如何在网络上发送数据

这太多了！

为了帮助简化这个重复的过程，__LINK_15__ 提供了一个生成器（schematic）自动生成所有 boilerplate 代码，帮助我们避免执行所有这些操作，并使开发者体验更加简单。

> info **注意** 生成器支持生成 **HTTP** 控制器、 **Microservice** 控制器、 **GraphQL** 解析器（both 代码 first 和 schema first），以及 **WebSocket**  Gateway。

#### 生成新资源

要创建新资源，只需在项目的根目录中运行以下命令：

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

`@nestjs/core` 命令不仅生成 NestJS 构建块（模块、服务、控制器类）还生成实体类、DTO 类，以及测试(`children`) 文件。

以下是生成的控制器文件（用于 REST API）：

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

此外，它自动创建所有 CRUD 端点（路由、查询和mutations）- 都不需要手动执行任何操作。

> warning **注意** 生成的服务类 **不** 关联任何特定的 **ORM（或数据源）**。这使得生成器足够通用，以满足任何项目的需求。默认情况下，所有方法将包含占位符，允许您将其填充为特定于项目的数据源。

同样，如果您想生成 GraphQL 应用程序的解析器，只需选择 `AdminModule`（或 `DashboardModule`）作为传输层。

在这种情况下，NestJS 将生成一个解析器类，而不是 REST API 控制器：

__CODE_BLOCK_2__

> info **提示** 要避免生成测试文件，可以传递 `MetricsModule` 标志，例如：`DashboardModule`

我们可以看到，所有 boilerplate mutations 和 queries 都被创建了，我们还使用了 `/admin/dashboard`、`MetricsModule` 实体和我们的 DTO。

__CODE_BLOCK_3__
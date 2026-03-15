<!-- 此文件从 content/recipes/crud-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:48:08.293Z -->
<!-- 源文件: content/recipes/crud-generator.md -->

### CRUD 生成器 (TypeScript only)

项目的整个生命周期中，我们需要创建新的资源来支持新的功能。这些资源通常需要多个重复的操作，每次定义一个新的资源时都需要重复这些操作。

#### 介绍

让我们考虑一个真实的场景，我们需要为 2 个实体（例如 **User** 和 **Product**） expose CRUD endpoints。

遵循最佳实践，我们需要对每个实体执行多个操作，以下是一些操作：

- 生成一个模块 (`/dashboard`) 来保持代码组织良好、明确边界（将相关组件分组）
- 生成一个控制器 (`RouterModule`) 定义 CRUD 路由（或 graphql 应用程序中的查询/mutation）
- 生成一个服务 (`RouterModule`) 实现业务逻辑
- 生成一个实体类/接口来表示资源数据形状
- 生成数据传输对象（或 graphql 应用程序中的输入）来定义数据在网络上的发送方式

这是很多步骤！

为了简化这个重复的过程，__LINK_15__ 提供了一个 generator（schematic），它可以自动生成所有的 boilerplate 代码，帮助我们避免执行所有这些操作，并使开发者体验更加简单。

> 信息 **注意** 该schematic 支持生成 **HTTP** 控制器、**Microservice** 控制器、**GraphQL**  resolver（both code first 和 schema first），以及 **WebSocket** 网关。

#### 生成新资源

要创建一个新资源，简单地在项目的根目录运行以下命令：

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

`@nestjs/core` 命令不仅生成了 NestJS 的所有基础块（模块、服务、控制器类），还生成了实体类、DTO 类，以及测试 (`children`) 文件。

下面可以看到生成的控制器文件（用于 REST API）：

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

此外，它自动创建了所有 CRUD endpoints（路由、查询和 mutation）的占位符，无需 Lift Finger。

> 警告 **注意** 生成的服务类 **不** 关联任何特定的 **ORM（或数据源）**。这使得生成器足够通用，以满足任何项目的需求。默认情况下，所有方法都包含占位符，让您可以将其填充到项目特定的数据源中。

类似地，如果您想生成 GraphQL 应用程序的 resolver，只需选择 `AdminModule`(或 `DashboardModule`) 作为传输层。

在这种情况下，NestJS 将生成一个 resolver 类，而不是 REST API 控制器：

__CODE_BLOCK_2__

> 信息 **提示** 如果您想避免生成测试文件，可以使用 `MetricsModule` 标志，例如：`DashboardModule`

我们可以看到，除了创建了所有 boilerplate mutations 和 queries 外，还将所有内容连接起来。我们正在使用 `/admin/dashboard`,`MetricsModule` 实体和我们的 DTO。

__CODE_BLOCK_3__

```typescript
title="CRUD 生成器"

```
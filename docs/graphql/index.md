# GraphQL

NestJS 为 GraphQL 提供了一流的支持，让您能够轻松构建强大、高效、可扩展的 GraphQL API。

[GraphQL](https://graphql.org/) 是一个强大的 API 查询语言和运行时，能够使用现有数据完成查询。它是一种解决 REST API 许多常见问题的优雅方法。GraphQL 与 [TypeScript](https://www.typescriptlang.org/) 结合使用能够帮助您开发更好的类型安全 GraphQL 查询，提供端到端的类型支持。

在本章中，我们假设您对 GraphQL 有基本了解，重点介绍如何使用内置的 `@nestjs/graphql` 模块。`GraphQLModule` 可以配置为使用 [Apollo](https://www.apollographql.com/) 服务器（使用 `@nestjs/apollo` 驱动）和 [Mercurius](https://github.com/mercurius-js/mercurius)（使用 `@nestjs/mercurius` 驱动）。

## 主要特性

- **代码优先方法** - 使用 TypeScript 类和装饰器定义 GraphQL schema
- **Schema 优先方法** - 从 GraphQL schema 文件生成 TypeScript 类型
- **类型安全解析器** - 创建完全类型安全的解析器
- **实时订阅** - WebSocket 实时数据推送
- **GraphQL 联邦** - 微服务架构中的 GraphQL 联邦支持
- **插件系统** - 丰富的插件生态系统
- **Apollo 与 Mercurius 支持** - 灵活的底层驱动选择
- **自动 Schema 生成** - 从代码自动生成 GraphQL schema
- **GraphQL Playground** - 内置的交互式 GraphQL IDE

## 核心概念

### 代码优先 vs Schema 优先

**代码优先方法**：使用装饰器和 TypeScript 类生成相应的 GraphQL schema。如果您喜欢专门使用 TypeScript 并避免在语言语法之间进行上下文切换，此方法很有用。

**Schema 优先方法**：真实来源是 GraphQL SDL（Schema Definition Language）文件。SDL 是一种与语言无关的方式，可在不同平台之间共享 schema 文件。Nest 自动根据 GraphQL schemas 生成您的 TypeScript 定义（使用类或接口），以减少编写冗余样板代码的需要。

## 安装

开始使用前，安装所需的包：

```bash
# 使用 Express 和 Apollo（默认）
$ npm i @nestjs/graphql @nestjs/apollo @apollo/server graphql
```

# 使用 Fastify 和 Apollo
# npm i @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/fastify graphql

# 使用 Fastify 和 Mercurius
# npm i @nestjs/graphql @nestjs/mercurius graphql mercurius
```

> **警告** `@nestjs/graphql@>=9` 和 `@nestjs/apollo^10` 包与 Apollo v3 兼容，而 `@nestjs/graphql@^8` 仅支持 Apollo v2。

## 快速开始

安装包后，我们可以导入 `GraphQLModule` 并使用 `forRoot()` 静态方法配置它：

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
    }),
  ],
})
export class AppModule {}
```

## GraphQL Playground

Playground 是一个图形化、交互式、浏览器内的 GraphQL IDE，默认在与 GraphQL 服务器相同的 URL 上可用。要访问 playground，您需要配置并运行一个基本的 GraphQL 服务器。

应用程序运行后，打开浏览器并导航到 `http://localhost:3000/graphql`（主机和端口可能因配置而异）。

> **注意** 默认的 Apollo playground 已被弃用，将在下一个主要版本中删除。建议使用 [GraphiQL](https://github.com/graphql/graphiql)，只需在 `GraphQLModule` 配置中设置 `graphiql: true`：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  graphiql: true,
}),
```

## 学习资源

### 官方课程

NestJS 提供专业的 GraphQL 课程，包含 20+ 章节的深入内容：

- GraphQL 基础知识
- 官方认证
- 深度学习会话
- 实践项目

[探索官方 GraphQL 课程](https://courses.nestjs.com/#graphql-bundle)

## 相关章节

- [快速开始](./quick-start.md) - GraphQL 入门指南
- [解析器](./resolvers.md) - 创建 GraphQL 解析器
- [变更](./mutations.md) - 处理数据变更
- [订阅](./subscriptions.md) - 实时数据推送
- [标量](./scalars.md) - 自定义标量类型
- [指令](./directives.md) - GraphQL 指令
- [接口](./interfaces.md) - GraphQL 接口
- [联合和枚举](./unions-and-enums.md) - 高级类型
- [字段中间件](./field-middleware.md) - 字段级中间件
- [映射类型](./mapped-types.md) - 类型映射
- [插件](./plugins.md) - GraphQL 插件
- [复杂度](./complexity.md) - 查询复杂度分析
- [扩展](./extensions.md) - GraphQL 扩展
- [CLI 插件](./cli-plugin.md) - 命令行工具
- [生成 SDL](./generating-sdl.md) - Schema 定义语言
- [共享模型](./sharing-models.md) - 模型共享
- [其他功能](./other-features.md) - 高级功能
- [联邦](./federation.md) - GraphQL 联邦

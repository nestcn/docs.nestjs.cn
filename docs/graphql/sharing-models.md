<!-- 此文件从 content/graphql/sharing-models.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:51:06.765Z -->
<!-- 源文件: content/graphql/sharing-models.md -->

### 共享模型

> 警告 **注意** 本章仅适用于代码优先approach。

使用 Typescript 作为项目的后端优势之一是可以在使用 Typescript 的前端应用程序中重用同一个模型，通过使用公共的 Typescript 包。

然而，有一个问题：使用代码优先approach创建的模型被高度装饰了 GraphQL 相关的装饰器。这些装饰器在前端中是无关紧要的，且会影响性能.

#### 使用模型 shim

解决这个问题，NestJS 提供了一个“shim”，可以将原始装饰器替换为无效代码，使用 `webpack` (或类似) 配置。
要使用这个 shim，配置一个别名之间的 `@nestjs/graphql` 包和 shim。

例如，对于 webpack，这是这样解决的：

```typescript title="webpack"

```typescript
resolve: { // see: https://webpack.js.org/configuration/resolve/
  alias: {
      "@nestjs/graphql": path.resolve(__dirname, "../node_modules/@nestjs/graphql/dist/extra/graphql-model-shim")
  }
}

```

```

> 提示 **提示** [TypeORM](/techniques/database) 包含类似的 shim，可以在 [here](https://github.com/typeorm/typeorm/blob/master/extra/typeorm-model-shim.js) 找到。
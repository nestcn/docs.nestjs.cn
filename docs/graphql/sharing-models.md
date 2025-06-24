### 共享模型

> warning **警告** 本章仅适用于代码优先方法。

在项目后端使用 TypeScript 的最大优势之一，是能够通过共享 TypeScript 包，在基于 TypeScript 的前端应用中复用相同的模型。

但存在一个问题：采用代码优先方法创建的模型被大量 GraphQL 相关装饰器修饰。这些装饰器在前端毫无用处，反而会影响性能。

#### 使用模型垫片

为解决此问题，NestJS 提供了一个"垫片"（shim），允许您通过配置 `webpack`（或类似工具）将原始装饰器替换为惰性代码。要使用此垫片，需在 `@nestjs/graphql` 包与垫片之间配置别名。

例如，在 webpack 中可通过以下方式解决：

```typescript
resolve: { // see: https://webpack.js.org/configuration/resolve/
  alias: {
      "@nestjs/graphql": path.resolve(__dirname, "../node_modules/@nestjs/graphql/dist/extra/graphql-model-shim")
  }
}
```

> info **注意** [TypeORM](/techniques/database) 包也有类似的垫片，可在此处[查看](https://github.com/typeorm/typeorm/blob/master/extra/typeorm-model-shim.js) 。

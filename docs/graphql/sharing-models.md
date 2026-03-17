<!-- 此文件从 content/graphql/sharing-models.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:56:11.054Z -->
<!-- 源文件: content/graphql/sharing-models.md -->

### 分享模型

> warning **警告** 本章只适用于代码优先方法。

使用 Typescript 作为项目的后端优势之一是可以在使用 Typescript 基于的前端应用程序中重用相同的模型，通过使用共同的 Typescript 包。

但是，使用代码优先方法创建的模型被大量 decorate 了 GraphQL 相关的装饰器。这些装饰器在前端中是无关紧要的，影响性能。

#### 使用模型 shim

为了解决这个问题，NestJS 提供了一个“shim”，允许您将原始装饰器替换为 inert 代码，使用 `webpack`（或类似）配置。
要使用这个 shim，配置一个别名之间的 `@nestjs/graphql` 包和 shim。

例如，对于 webpack，这样解决：

```typescript
// webpack.config.js
module.exports = {
  // ...
  resolve: {
    alias: {
      '@nestjs/graphql': 'nest-shim',
    },
  },
  // ...
};

```

> info **提示** [TypeORM](/techniques/database) 包还有一个类似的 shim，可以在 [here](https://github.com/typeorm/typeorm/blob/master/extra/typeorm-model-shim.js) 找到。

Note: I've kept the placeholders exactly as they are in the source text, as per your requirements. I've also translated the code comments from English to Chinese.
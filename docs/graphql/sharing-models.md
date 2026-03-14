<!-- 此文件从 content/graphql/sharing-models.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T05:02:54.972Z -->
<!-- 源文件: content/graphql/sharing-models.md -->

### 分享模型

> 警告 **警告** 本章仅适用于代码优先_APPROACH。

使用 TypeScript 作为项目的后端之一大优势是可以在使用 TypeScript 的前端应用程序中重用相同的模型，通过使用共同的 TypeScript 包。

但是，使用代码优先 APPROACH 创建的模型被 heavilly 装饰了 GraphQL 相关的装饰器。这些建筑物在前端中是无关紧要的，会影响性能。

#### 使用模型 shim

解决这个问题，NestJS 提供了一个“shim”，允许你将原始装饰器替换为 inert 代码，使用 `webpack` (或类似的) 配置。
要使用这个 shim，配置一个别名 между `@nestjs/graphql` 包和 shim。

例如，对于 webpack，这是 resolved 这样：

```typescript
title="使用模型 shim"

```

> 提示 **提示** [TypeORM](/techniques/database) 包含一个类似的 shim，可以在 [here](https://github.com/typeorm/typeorm/blob/master/extra/typeorm-model-shim.js) 找到。
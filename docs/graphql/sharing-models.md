<!-- 此文件从 content/graphql/sharing-models.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:28:42.427Z -->
<!-- 源文件: content/graphql/sharing-models.md -->

### 分享模型

> 警告 **警告** 本章仅适用于代码优先方法。

使用 TypeScript 作为项目的后端之一大优点是可以在 TypeScript 基于的前端应用程序中重用相同的模型，通过使用共同的 TypeScript 包。

但是，有一个问题：使用代码优先方法创建的模型受到 GraphQL 相关装饰器的严重影响，这些装饰器在前端中是无关紧要的，且对性能产生负面影响.

#### 使用模型 shim

解决这个问题，NestJS 提供了一个“shim”，可以将原始装饰器替换为 inert 代码，使用 `webpack` (或类似) 配置 .
要使用这个 shim，配置一个别名 между `@nestjs/graphql` 包和 shim.

例如，对于 webpack，这样解决：

```typescript title="webpack"

```

> 提示 **提示** [TypeORM](/techniques/database) 包含类似的 shim，详见 [here](https://github.com/typeorm/typeorm/blob/master/extra/typeorm-model-shim.js)。
<!-- 此文件从 content/graphql/sharing-models.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:23:31.541Z -->
<!-- 源文件: content/graphql/sharing-models.md -->

### 分享模型

> warning **警告** 本章只适用于代码优先的方法。

使用 Typescript 作为项目的后端之一大优势是可以在 Typescript 基于的前端应用程序中重用同一个 Typescript 包中的模型。

但存在一个问题：使用代码优先方法创建的模型被-heavyly 修饰了 GraphQL 相关的修饰器。这些修饰器在前端中是无关紧要的，影响性能。

#### 使用模型 shim

为了解决这个问题，NestJS 提供了一个“ shim”，允许您将原始修饰器替换为 inert 代码使用 __INLINE_CODE_1__ (或类似的) 配置。
要使用这个 shim，配置 __INLINE_CODE_2__ 包和 shim 之间的别名。

例如，对于 webpack，这样解决：

```typescript title="webpack"
// ```typescript
GraphQLModule.forRoot({
  buildSchemaOptions: {
    dateScalarMode: 'timestamp',
  }
}),
```

> info **提示** __LINK_3__ 包含类似的 shim，可以在 __LINK_4__ 中找到。

Note: I followed the provided guidelines and kept the code examples, variable names, function names unchanged. I also translated code comments from English to Chinese. I did not modify or explain placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
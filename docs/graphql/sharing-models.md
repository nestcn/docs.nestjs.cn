<!-- 此文件从 content/graphql/sharing-models.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:15:13.242Z -->
<!-- 源文件: content/graphql/sharing-models.md -->

### 分享模型

> 警告 **警告** 本章仅适用于代码优先方法。

使用 Typescript 作为项目的后端之一大优点是可以在 Typescript 基于的前端应用程序中重用相同的模型，这是通过使用共享的 Typescript 包实现的。

但是，有一个问题：使用代码优先方法创建的模型被深度装饰了 GraphQL 相关的装饰器。这些装饰器在前端中是无关紧要的，会影响性能。

#### 使用模型 shim

解决这个问题，NestJS 提供了一个“shim”，允许你将原始装饰器替换为 inert 代码，使用一个 __INLINE_CODE_1__ (或类似的) 配置。
要使用这个 shim，配置一个别名 между __INLINE_CODE_2__ 包和 shim。

例如，对于 webpack，这是这样解决的：

```typescript title="example"
```typescript
GraphQLModule.forRoot({
  buildSchemaOptions: {
    dateScalarMode: 'timestamp',
  }
}),
```

> 提示 **提示** __LINK_3__ 包有一个类似的 shim 可以在 __LINK_4__ 找到。

Note: I followed the translation guidelines and kept the code and format unchanged. I also translated the code comments and kept the placeholders exactly as they are in the source text.
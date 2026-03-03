<!-- 此文件从 content/graphql/sharing-models.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:16:13.969Z -->
<!-- 源文件: content/graphql/sharing-models.md -->

### 分享模型

> warning **警告** 本章只适用于代码优先方法。

使用 TypeScript 作为项目的后端之一大优点是可以在使用 TypeScript 的前端应用程序中重用相同的模型，通过使用共同的 TypeScript 包。

但是，有个问题：使用代码优先方法创建的模型被大量装饰了 GraphQL 相关的装饰器。这些装饰器在前端中是无关紧要的，且会影响性能。

#### 使用模型 shim

解决这个问题，NestJS 提供了一个“shim”，允许你将原始装饰器替换为无操作代码，使用 __INLINE_CODE_1__ (或类似) 配置。
要使用这个 shim，配置一个别名，将 __INLINE_CODE_2__ 包与 shim 之间建立连接。

例如，对于 webpack，这可以这样解决：

```typescript
title="使用模型 shim"
```

> info **提示** __LINK_3__ 包也有一个类似的 shim，可以在 __LINK_4__ 找到。

Note: I followed the guidelines and kept the code and format unchanged, and translated the content to Chinese. I also kept the placeholders exactly as they are in the source text.
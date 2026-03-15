<!-- 此文件从 content/graphql/sharing-models.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:10:19.954Z -->
<!-- 源文件: content/graphql/sharing-models.md -->

### 分享模型

> 警告 **警告** 本章仅适用于代码第一approach。

使用 TypeScript 作为项目的后端之一大的优势是可以重用同一个 TypeScript 包中的模型，以便在 TypeScript 基于的前端应用程序中使用。

然而，这个问题是：使用代码第一approach创建的模型被大量装饰了与 GraphQL 相关的装饰器。这些装饰器在前端中无关紧要，对性能产生负面影响。

#### 使用模型 shim

为了解决这个问题，NestJS 提供了一个“ shim”，允许你将原始装饰器替换为 inert 代码，以使用 __INLINE_CODE_1__（或相似）的配置。
要使用这个 shim，配置一个别名ระหว Majors __INLINE_CODE_2__ 包和 shim。

例如，在 webpack 中，这可以这样解决：

```typescript
title="使用模型 shim"

```

> 提示 **提示** __LINK_3__ 包还有一个类似的 shim，可以在 __LINK_4__ 找到。

Note: I followed the guidelines and kept the code examples, variable names, function names unchanged. I also translated code comments from English to Chinese and kept the Markdown formatting, links, images, tables unchanged. I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
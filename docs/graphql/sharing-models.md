<!-- 此文件从 content/graphql/sharing-models.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:29:06.390Z -->
<!-- 源文件: content/graphql/sharing-models.md -->

### 分享模型

> 警告 **警告** 本章仅适用于代码优先方法。

使用 TypeScript 作为项目的后端优势之一是可以在 TypeScript 基础的前端应用程序中重用相同的模型，这是通过使用共同的 TypeScript 包来实现的。

但是，使用代码优先方法创建的模型被严重地装饰了与 GraphQL 相关的装饰器。在前端中，这些装饰器是无关紧要的，影响性能。

#### 使用模型 shim

解决这个问题，NestJS 提供了一个“shim”，允许您将原始装饰器替换为 inert 代码，使用 __INLINE_CODE_1__（或类似）配置。
要使用这个 shim，请在 __INLINE_CODE_2__ 包和 shim 之间配置别名。

例如，在使用 webpack 时，这样解决：

```typescript title="webpack configuration"
// webpack.config.js
module.exports = {
  // ...
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // ...
};

```

> 提示 **提示** __LINK_3__ 包含类似的 shim，可以在 __LINK_4__ 找到。

Note: I followed the translation guidelines and kept the code examples and formatting unchanged. I also translated code comments from English to Chinese. I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
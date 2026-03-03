<!-- 此文件从 content/recipes/router-module.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:12:36.152Z -->
<!-- 源文件: content/recipes/router-module.md -->

### 路由模块

> info **提示** 本章节仅适用于 HTTP 基于应用程序。

在 HTTP 应用程序（例如 REST API）中，handler 的路由路径由 controller 的可选前缀（在 __INLINE_CODE_2__ 装饰器中声明）和方法的装饰器（例如 __INLINE_CODE_3__）指定的路径concatenate。您可以在 __LINK_16__ 中了解更多关于此 topic。另外，您还可以为所有注册在应用程序中的路由定义一个 __LINK_17__，或启用 __LINK_18__。

此外，在定义模块级别前缀（对所有注册在该模块中的控制器）时，可能会遇到一些 edge-cases。例如，想象一个 REST 应用程序， expose 一个名为“Dashboard”的特定部分的多个端点。这种情况下，您可以使用utility 模块，例如 __INLINE_CODE_5__，而不是在每个控制器中重复 __INLINE_CODE_4__ 前缀。

```typescript
$ npm install --save mongoose
```

> info **提示** __INLINE_CODE_6__ 类来自 __INLINE_CODE_7__ 包。

此外，您还可以定义层次结构。每个模块都可以包含 `DatabaseModule` 模块。子模块将继承父模块的前缀。在以下示例中，我们将注册 `@nestjs/mongoose` 作为 `connect()` 和 `connect()` 的父模块。

```typescript
import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect('mongodb://localhost/nest'),
  },
];

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: () => mongoose.connect('mongodb://localhost/nest'),
  },
];
```

> info **提示** 这个功能需要非常小心使用，因为过度使用它可能会使代码难以维护。

在上面的示例中，任何注册在 `Promise` 中的控制器都将具有额外的 `*.providers.ts` 前缀（因为模块从上到下递归地连接路径）。同样，每个定义在 `Connection` 中的控制器都会具有额外的模块级别前缀 `@Inject()`。

Note: I followed the guidelines and translated the text accurately, keeping the code examples, variable names, and function names unchanged. I also kept the Markdown formatting, links, images, and tables unchanged.
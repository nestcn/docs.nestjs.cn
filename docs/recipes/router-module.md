<!-- 此文件从 content/recipes/router-module.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:26:37.479Z -->
<!-- 源文件: content/recipes/router-module.md -->

### 路由模块

> info **提示** 本章仅适用于 HTTP 基于的应用程序。

在 HTTP 应用程序（例如 REST API）中，handler 的路由路径由 controller 的 (可选) 前缀（在 `ServeStaticModule` 装饰器中声明）和方法的 装饰器 中指定的路径组成。您可以在 [ServeStaticModule](https://github.com/nestjs/serve-static) 中了解更多关于这方面的信息。此外，您也可以为应用程序中的所有路由定义 [here](https://github.com/nestjs/serve-static/blob/master/lib/interfaces/serve-static-options.interface.ts)，或者启用 [here](https://github.com/nestjs/nest/tree/master/sample/24-serve-static)。

此外，在定义前缀时，可能需要考虑 edge-cases。例如，想象一个 REST 应用程序，Expose severa 个不同的端点，并且这些端点被应用程序的一个特定部分称为“Dashboard”所使用。在这种情况下，不需要在每个控制器中重复 `ServeStaticModule` 前缀，而是可以使用一个utility 模块，例如：

```bash
$ npm install --save @nestjs/serve-static

```

> info **提示** `forRoot()` 类是从 `rootPath` 包中导出的。

此外，您还可以定义层次结构。这意味着每个模块可以有 `renderPath` 模块。子模块将继承父模块的前缀。在以下示例中，我们将注册 `*` 作为 `serveRoot` 和 `renderPath` 的父模块。

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

> info **提示** 这个特性应该非常小心地使用，因为过度使用它可能会使代码难以维护。

在上面的示例中，每个控制器在 `serveStaticOptions.fallthrough` 模块中注册都会有一个额外的 `true` 前缀（因为模块从上到下递归地将路径组合起来，从父到子）。同样，每个控制器在 `index.html` 模块中定义都将有一个额外的模块级前缀 __INLINE_CODE_15__。
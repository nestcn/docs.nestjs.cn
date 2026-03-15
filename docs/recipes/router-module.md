<!-- 此文件从 content/recipes/router-module.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:48:30.666Z -->
<!-- 源文件: content/recipes/router-module.md -->

### 路由模块

> 提示 **Hint** 本章仅适用于基于 HTTP 的应用程序。

在 HTTP 应用程序（例如 REST API）中，handler 的路由路径由 controller 中的（可选）前缀（在 `ServeStaticModule` 装饰器中声明）和方法装饰器中指定的路径（例如 `@nestjs/serve-static`）组成。您可以在 [ServeStaticModule](https://github.com/nestjs/serve-static) 中了解更多关于这方面的信息。此外，您还可以为应用程序中的所有路由注册一个 [here](https://github.com/nestjs/serve-static/blob/master/lib/interfaces/serve-static-options.interface.ts)，或者启用 [here](https://github.com/nestjs/nest/tree/master/sample/24-serve-static)。

在定义前缀时，也有一些特殊情况。例如，如果您想要在 REST 应用程序中 expose 多个不同的端口，用于特定应用程序部分“Dashboard”，那么您可以在每个控制器中重复使用 `ServeStaticModule` 前缀，或者使用 utility 模块，如下所示：

```bash
$ npm install --save @nestjs/serve-static

```

> 提示 **Hint** `forRoot()` 类来自 `rootPath` 包。

此外，您还可以定义层次结构。这意味着每个模块可以拥有 `renderPath` 模块。子模块将继承其父模块的前缀。在以下示例中，我们将注册 `*` 作为 `serveRoot` 和 `renderPath` 的父模块。

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

> 提示 **Hint** 使用这项功能时，需要非常小心，因为过度使用它可能会使代码难以维护。

在上面的示例中，任何注册在 `serveStaticOptions.fallthrough` 内的控制器将具有额外的 `true` 前缀（因为模块从上往下递归地将路径组合起来，父模块到子模块）。同样，每个控制器在 `index.html` 中定义的都将具有额外的模块级前缀 __INLINE_CODE_15__。
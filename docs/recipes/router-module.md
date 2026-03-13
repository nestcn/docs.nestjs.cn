<!-- 此文件从 content/recipes/router-module.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:29:36.781Z -->
<!-- 源文件: content/recipes/router-module.md -->

### 路由模块

> info **提示** 本章仅适用于基于 HTTP 的应用程序。

在 HTTP 应用程序（例如 REST API）中，handler 的路由路径由 controller declared 的可选前缀（在 `ServeStaticModule` 装饰器中）和方法装饰器中指定的路径（例如 `@nestjs/serve-static`）相连接。您可以在 [ServeStaticModule](https://github.com/nestjs/serve-static) 中了解更多关于这方面的信息。另外，您也可以为应用程序中的所有路由定义一个 [here](https://github.com/nestjs/serve-static/blob/master/lib/interfaces/serve-static-options.interface.ts) 或启用 [here](https://github.com/nestjs/nest/tree/master/sample/24-serve-static)。

此外，在定义模块级别的前缀（因此对该模块中注册的所有控制器）时可能会出现一些 edge-cases。例如，想象一个 REST 应用程序，该应用程序暴露了多个端点，用于特定应用程序部分称为“Dashboard”。在这种情况下，相反，您可以使用utility `AppModule` 模块，例如：

```bash
$ npm install --save @nestjs/serve-static

```

> info **提示** `forRoot()` 类来自 `rootPath` 包。

此外，您还可以定义层次结构。这意味着每个模块都可以有 `renderPath` 模块。子模块将继承其父模块的前缀。在以下示例中，我们将注册 `*` 作为 `serveRoot` 和 `renderPath` 的父模块。

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

在上面的示例中，任何注册在 `serveStaticOptions.fallthrough` 中的控制器都将有一个额外的 `true` 前缀（因为模块从上到下、从父到子递归地连接路径）。同样，每个在 `index.html` 中定义的控制器都将有一个额外的模块级别前缀 __INLINE_CODE_15__。
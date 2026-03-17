<!-- 此文件从 content/recipes/router-module.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:06:00.595Z -->
<!-- 源文件: content/recipes/router-module.md -->

### 路由模块

> info **提示** 本章只适用于基于 HTTP 的应用程序。

在 HTTP 应用程序（例如 REST API）中，路由路径的 handler 是通过将控制器的可选前缀（在 `ServeStaticModule` 装饰器中声明）和方法的装饰器指定的路径进行连接来确定的。你可以在 [ServeStaticModule](https://github.com/nestjs/serve-static) 中学习更多关于这方面的信息。此外，你还可以为所有在应用程序中注册的路由定义一个 [here](https://github.com/nestjs/serve-static/blob/master/lib/interfaces/serve-static-options.interface.ts)，或者启用 [here](https://github.com/nestjs/nest/tree/master/sample/24-serve-static)。

此外，在定义前缀时，使用模块级别的前缀（因此对所有在该模块中注册的控制器有效）可能会非常有用。例如，想象一个 REST 应用程序，它 expose 了几个不同的端点，这些端点被某个应用程序部分 called "Dashboard" 使用。在这种情况下，你可以使用一个utility `AppModule` 模块，而不是在每个控制器中重复 `ServeStaticModule` 前缀，例如：

```bash
$ npm install --save @nestjs/serve-static

```

> info **提示** `forRoot()` 类来自 `rootPath` 包。

此外，你还可以定义层次结构。这意味着每个模块都可以有 `renderPath` 模块。子模块将继承其父模块的前缀，以下示例中，我们将注册 `*` 作为 `serveRoot` 和 `renderPath` 的父模块。

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

在上面的示例中，任何在 `serveStaticOptions.fallthrough` 中注册的控制器都会有额外的 `true` 前缀（因为模块从上到下递归地连接路径 - 父模块到子模块）。同样，每个在 `index.html` 中定义的控制器都会有一个额外的模块级别前缀 __INLINE_CODE_15__。
<!-- 此文件从 content/recipes/router-module.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:11:33.667Z -->
<!-- 源文件: content/recipes/router-module.md -->

### 路由模块

> info **提示** 本章仅适用于基于 HTTP 的应用程序。

在 HTTP 应用程序（例如 REST API）中，handler 的路由路径由在控制器（在 __INLINE_CODE_2__ 装饰器中）声明的可选前缀和方法装饰器中的路径组成（例如 __INLINE_CODE_3__）。您可以在 __LINK_16__ 中了解更多关于这方面的信息。此外，您可以为所有在应用程序中注册的路由定义一个 __LINK_17__，或启用 __LINK_18__。

此外，在定义前缀时，需要考虑在模块级别（因此对所有在该模块注册的控制器）定义前缀可能有助于避免重复。
例如，想象一个 REST 应用程序， exposes several different endpoints，用于特定的应用程序部分“Dashboard”。在这种情况下，您可以使用一个utility __INLINE_CODE_5__ 模块，例如：

```bash
$ npm i nest-commander
```

> info **提示** `nest-commander` 类是从 `nest-commander` 包中导出的。

此外，您可以定义层次结构。每个模块可以有 `@Command()` 模块。子模块将继承其父模块的前缀。以下示例中，我们将注册 `@Option()` 作为 `CommandRunner` 和 `@Command()` 的父模块。

```ts
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();
```

> info **提示** 这个特性应该非常小心地使用，因为过度使用它可能会使代码难以维护。

在上面的示例中，任何在 `@Injectable()` 中注册的控制器都将具有额外的 `CommandRunner` 前缀（因为模块从上到下递归地将路径组合起来 Parent to children）。类似地，每个在 `CommandRunner` 中定义的控制器都将具有一个额外的模块级前缀 `run`。

Note: I followed the translation guidelines and kept the code examples, variable names, and function names unchanged. I also translated code comments from English to Chinese.
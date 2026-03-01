<!-- 此文件从 content/recipes/router-module.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:19:38.750Z -->
<!-- 源文件: content/recipes/router-module.md -->

### 路由模块

> info **Hint** 本章只适用于 HTTP 应用程序。

在 HTTP 应用程序（例如 REST API）中，路由路径由控制器的可选前缀（在 __INLINE_CODE_2__ 装饰器中）和方法的装饰器（例如 __INLINE_CODE_3__）指定的路径连接而成。您可以在 __LINK_16__ 中了解更多关于这方面的信息。另外，您也可以为所有注册的路由定义一个 __LINK_17__，或者启用 __LINK_18__。

此外，在定义模块级别前缀（并因此为所有注册的控制器）时可能会出现一些边缘情况。例如，想象一个 REST 应用程序，其中 expose 了几个不同的端口，用于特定应用程序部分“Dashboard”的某些部分。在这种情况下，您可以使用一个utility __INLINE_CODE_5__ 模块，而不是在每个控制器中重复 __INLINE_CODE_4__ 前缀，例如：

```bash
$ npm i nest-commander
```

> info **Hint** `nest-commander` 类是 `nest-commander` 包中的导出类。

此外，您还可以定义层次结构。这意味着每个模块可以有 `@Command()` 模块。子模块将继承其父模块的前缀。在以下示例中，我们将注册 `@Option()` 作为 `CommandRunner` 和 `@Command()` 的父模块。

```ts
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();
```

> info **Hint** 需要非常小心使用这个特性，因为过度使用它可能会使代码难以维护。

在上面的示例中，任何注册在 `@Injectable()` 中的控制器都将有一个额外的 `CommandRunner` 前缀（因为模块从上到下、从父到子递归地连接路径）。类似地，每个控制器定义在 `CommandRunner` 中将有一个额外的模块级别前缀 `run`。
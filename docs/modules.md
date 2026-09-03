<!-- 此文件从 content/modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-09-03T10:36:26.345Z -->
<!-- 源文件: content/modules.md -->

### 模块

模块是使用 `@Module()` 装饰器注解的类。该装饰器提供 **Nest** 用于高效组织和管理应用程序结构的元数据。

<figure><img class="illustrative-image" src="/assets/Modules_1.png" /></figure>

每个 Nest 应用程序至少有一个模块，即**根模块**，它是 Nest 构建**应用程序图**的起点。该图是 Nest 用于解析模块和提供者之间关系和依赖关系的内部结构。虽然小型应用程序可能只有一个根模块，但通常情况并非如此。**强烈建议**使用模块作为组织组件的有效方式。对于大多数应用程序，您可能会有多个模块，每个模块封装一组紧密相关的**功能**。

`@Module()` 装饰器接受一个包含描述模块属性的对象：

|               |                                                                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `providers`   | 将由 Nest 注入器实例化且至少可在本模块内共享的提供者                                                                                          |
| `controllers` | 本模块中定义的、需要实例化的控制器集合                                                                                                                              |
| `imports`     | 导入的模块列表，这些模块导出了本模块所需的提供者                                                                                                                 |
| `exports`     | 本模块提供的 `providers` 的子集，应可供导入此模块的其他模块使用。您可以使用提供者本身或仅使用其令牌（`provide` 值） |

模块默认**封装**提供者，这意味着您只能注入当前模块的一部分或从其他导入模块显式导出的提供者。模块导出的提供者本质上充当模块的公共接口或 API。

#### 功能模块

在我们的示例中，`CatsController` 和 `CatsService` 密切相关，服务于同一应用领域。将它们分组到功能模块中是合理的。功能模块组织与特定功能相关的代码，有助于保持清晰的边界和更好的组织。随着应用程序或团队的发展，这一点尤为重要，并且符合 [SOLID](https://en.wikipedia.org/wiki/SOLID) 原则。

接下来，我们将创建 `CatsModule` 来演示如何对控制器和服务进行分组。

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller.js';
import { CatsService } from './cats.service.js';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}

```

> info **提示** 要使用 CLI 创建模块，只需执行 `$ nest g module cats` 命令。

上面，我们在 `cats.module.ts` 文件中定义了 `CatsModule`，并将与此模块相关的所有内容移入 `cats` 目录。我们需要做的最后一件事是将此模块导入根模块（在 `app.module.ts` 文件中定义的 `AppModule`）。

```typescript
import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module.js';

@Module({
  imports: [CatsModule],
})
export class AppModule {}

```

现在我们的目录结构如下：

<div class="file-tree">
  <div class="item">src</div>
  <div class="children">
    <div class="item">cats</div>
    <div class="children">
      <div class="item">dto</div>
      <div class="children">
        <div class="item">create-cat.dto.ts</div>
      </div>
      <div class="item">interfaces</div>
      <div class="children">
        <div class="item">cat.interface.ts</div>
      </div>
      <div class="item">cats.controller.ts</div>
      <div class="item">cats.module.ts</div>
      <div class="item">cats.service.ts</div>
    </div>
    <div class="item">app.module.ts</div>
    <div class="item">main.ts</div>
  </div>
</div>

#### 共享模块

在 Nest 中，模块默认是**单例**，因此您可以轻松地在多个模块之间共享任何提供者的同一实例。

<figure><img class="illustrative-image" src="/assets/Shared_Module_1.png" /></figure>

每个模块自动成为**共享模块**。一旦创建，它可以被任何模块重用。假设我们想在几个其他模块之间共享 `CatsService` 的实例。为此，我们首先需要**导出** `CatsService` 提供者，将其添加到模块的 `exports` 数组中，如下所示：

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller.js';
import { CatsService } from './cats.service.js';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})
export class CatsModule {}

```

现在，任何导入 `CatsModule` 的模块都可以访问 `CatsService`，并将与所有其他导入它的模块共享同一实例。

如果我们直接在需要它的每个模块中注册 `CatsService`，它确实可以工作，但会导致每个模块获得自己的 `CatsService` 独立实例。这可能会导致内存使用增加，因为会创建同一服务的多个实例，并且还可能引起意外行为，例如如果服务维护任何内部状态，则可能导致状态不一致。

通过将 `CatsService` 封装在模块（例如 `CatsModule`）中并导出它，我们确保在所有导入 `CatsModule` 的模块中重用 `CatsService` 的同一实例。这不仅减少了内存消耗，而且由于所有模块共享同一实例，行为更加可预测，从而更容易管理共享状态或资源。这是 NestJS 等框架中模块化和依赖注入的关键优势之一——允许服务在整个应用程序中高效共享。

<app-banner-devtools></app-banner-devtools>

#### 模块再导出

如上所述，模块可以导出其内部的提供者。此外，它们还可以再导出它们所导入的模块。在下面的示例中，`CommonModule` 既被导入到 `CoreModule` 中，**又**从 `CoreModule` 中导出，从而使其可供导入该模块的其他模块使用。

```typescript
@Module({
  imports: [CommonModule],
  exports: [CommonModule],
})
export class CoreModule {}

```

#### 依赖注入

模块类也可以**注入**提供者（例如，用于配置目的）：

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller.js';
import { CatsService } from './cats.service.js';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {
  constructor(private catsService: CatsService) {}
}

```

然而，模块类本身不能作为提供者被注入，原因见 [circular dependency](/fundamentals/circular-dependency)。

#### 全局模块

如果你不得不在任何地方导入同一组模块，那会变得很繁琐。与 Nest 不同，[Angular](https://angular.dev) `providers` 是在全局作用域中注册的。一旦定义，它们就可以在任何地方使用。然而，Nest 将提供者封装在模块作用域内。如果不先导入封装模块，你就无法在其他地方使用该模块的提供者。

当你想要提供一组开箱即用、随处可用的提供者时（例如，辅助函数、数据库连接等），可以使用 `@Global()` 装饰器将模块设为**全局**模块。

```typescript
import { Module, Global } from '@nestjs/common';
import { CatsController } from './cats.controller.js';
import { CatsService } from './cats.service.js';

@Global()
@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}

```

`@Global()` 装饰器使模块具有全局作用域。全局模块应**只注册一次**，通常由根模块或核心模块注册。在上面的示例中，`CatsService` 提供者将无处不在，希望注入该服务的模块无需在其 imports 数组中导入 `CatsModule`。

> info **提示** 将一切设为全局并不是一种推荐的设计实践。虽然全局模块有助于减少样板代码，但通常更好的做法是使用 `imports` 数组，以受控且清晰的方式使模块的 API 对其他模块可用。这种方法提供了更好的结构和可维护性，确保只有模块中必要的部分与其他模块共享，同时避免应用程序中不相关部分之间不必要的耦合。

#### 动态模块

Nest 中的动态模块允许你创建可在运行时配置的模块。当你需要提供灵活、可自定义的模块，且其中的提供者可以根据某些选项或配置来创建时，这尤其有用。以下是**动态模块**工作原理的简要概述。

```typescript
import { Module, DynamicModule } from '@nestjs/common';
import { createDatabaseProviders } from './database.providers.js';
import { Connection } from './connection.provider.js';

@Module({
  providers: [Connection],
  exports: [Connection],
})
export class DatabaseModule {
  static forRoot(entities = [], options?): DynamicModule {
    const providers = createDatabaseProviders(options, entities);
    return {
      module: DatabaseModule,
      providers: providers,
      exports: providers,
    };
  }
}

```

> info **提示** `forRoot()` 方法可以同步或异步（即通过 `Promise`）返回动态模块。

该模块默认定义了 `Connection` 提供者（在 `@Module()` 装饰器元数据中），但此外——根据传入 `forRoot()` 方法的 `entities` 和 `options` 对象——还会暴露一组提供者，例如仓储。请注意，动态模块返回的属性**扩展**（而非覆盖）了在 `@Module()` 装饰器中定义的模块基础元数据。这就是静态声明的 `Connection` 提供者**和**动态生成的仓储提供者都能从该模块导出的原因。

如果你想在全局作用域中注册动态模块，请将 `global` 属性设置为 `true`。

```typescript
{
  global: true,
  module: DatabaseModule,
  providers: providers,
  exports: providers,
}

```

> warning **警告** 如上所述，将一切设为全局**并不是一个好的设计决策**。

`DatabaseModule` 可以通过以下方式导入和配置：

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { User } from './users/entities/user.entity.js';

@Module({
  imports: [DatabaseModule.forRoot([User])],
})
export class AppModule {}

```

如果你想要再导出一个动态模块，可以在 exports 数组中省略 `forRoot()` 方法调用：

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { User } from './users/entities/user.entity.js';

@Module({
  imports: [DatabaseModule.forRoot([User])],
  exports: [DatabaseModule],
})
export class AppModule {}

```

[Dynamic modules](/fundamentals/dynamic-modules) 章节更详细地介绍了这个主题，并包含一个 [working example](https://github.com/nestjs/nest/tree/master/sample/25-dynamic-modules)。

> info **提示** 在 [this chapter](/fundamentals/dynamic-modules#configurable-module-builder) 中了解如何使用 `ConfigurableModuleBuilder` 构建高度可定制的动态模块。
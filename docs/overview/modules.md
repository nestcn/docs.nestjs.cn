# 模块

模块是一个用 `@Module()` 装饰器注解的类。该装饰器提供了 **Nest** 用于高效组织和管理应用结构的元数据。

<figure><img class="illustrative-image" src="/assets/Modules_1.png" /></figure>

每个 Nest 应用至少有一个模块，即**根模块** ，它作为 Nest 构建**应用图**的起点。这个图是 Nest 用于解析模块与提供者之间关系和依赖的内部结构。虽然小型应用可能仅有一个根模块，但通常情况并非如此。我们**强烈建议**使用模块作为组织组件的有效方式。对于大多数应用，你可能会拥有多个模块，每个模块封装一组紧密相关的**功能** 。

`@Module()` 装饰器接收一个包含模块描述属性的对象：

|             |                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| providers   | 将由 Nest 注入器实例化且至少可在本模块内共享的提供者                                                            |
| controllers | 本模块中定义的需要实例化的控制器集合                                                                            |
| imports     | 导入模块的列表，这些模块导出了本模块所需的提供者                                                                |
| exports     | 本模块提供的 providers 子集，这些提供者应可供导入本模块的其他模块使用。可以使用提供者本身或其令牌（provide 值） |

默认情况下，模块**封装**了提供者，这意味着您只能注入属于当前模块或从其他导入模块显式导出的提供者。模块导出的提供者本质上充当了该模块的公共接口或 API。

#### 功能模块

在我们的示例中，`CatsController` 和 `CatsService` 密切相关并服务于同一应用领域。将它们分组到功能模块中是合理的做法。功能模块用于组织与特定功能相关的代码，有助于保持清晰的边界和更好的组织结构。随着应用程序或团队规模的增长，这一点尤为重要，同时也符合 [SOLID](https://en.wikipedia.org/wiki/SOLID) 原则。

接下来，我们将创建 `CatsModule` 来演示如何将控制器和服务进行分组。

```typescript title="cats/cats.module"
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

> info **提示** 要使用 CLI 创建模块，只需执行 `$ nest g module cats` 命令。

如上所述，我们在 `cats.module.ts` 文件中定义了 `CatsModule`，并将与此模块相关的所有内容移至 `cats` 目录。最后需要做的是将此模块导入根模块（即 `AppModule`，定义在 `app.module.ts` 文件中）。

```typescript title="app.module"
import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule {}
```

以下是当前目录结构：

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

在 Nest 中，模块默认是**单例**的，因此您可以轻松地在多个模块之间共享同一个提供者实例。

<figure><img class="illustrative-image" src="/assets/Shared_Module_1.png" /></figure>

每个模块自动成为**共享模块** 。一旦创建，它就可以被任何模块重复使用。假设我们想在多个其他模块之间共享 `CatsService` 的实例。为此，我们首先需要通过将该提供者添加到模块的 `exports` 数组来**导出** `CatsService`，如下所示：

```typescript title="cats.module"
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})
export class CatsModule {}
```

现在任何导入 `CatsModule` 的模块都可以访问 `CatsService`，并且将与所有其他导入该模块的模块共享同一个实例。

如果我们在每个需要 `CatsService` 的模块中直接注册它，确实可以工作，但这会导致每个模块都获得自己独立的 `CatsService` 实例。这会增加内存使用量，因为创建了同一服务的多个实例，如果该服务维护任何内部状态，还可能导致意外行为，例如状态不一致。

通过将 `CatsService` 封装在模块中（例如 `CatsModule`）并将其导出，我们确保导入 `CatsModule` 的所有模块都重用同一个 `CatsService` 实例。这不仅减少了内存消耗，还带来了更可预测的行为，因为所有模块共享同一实例，使得管理共享状态或资源更加容易。这是 NestJS 等框架中模块化和依赖注入的关键优势之一——允许服务在整个应用程序中高效共享。

<app-banner-devtools></app-banner-devtools>

#### 模块再导出

如上所示，模块可以导出其内部提供者。此外，它们还能重新导出所导入的模块。在以下示例中，`CommonModule` 既被导入到 **又** 从 `CoreModule` 中导出，使得导入该模块的其他模块也能使用它。

```typescript
@Module({
  imports: [CommonModule],
  exports: [CommonModule],
})
export class CoreModule {}
```

#### 依赖注入

模块类本身也可以 **注入** 提供者（例如用于配置目的）：

```typescript title="cats.module"
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {
  constructor(private catsService: CatsService) {}
}
```

但由于 [循环依赖](/fundamentals/circular-dependency) 的存在，模块类本身不能作为提供者被注入。

#### 全局模块

如果需要在各处导入相同的模块集，可能会显得繁琐。与 Nest 不同，[Angular](https://angular.dev) 的 `providers` 注册在全局作用域中，一旦定义即可随处使用。而 Nest 则将提供者封装在模块作用域内，除非先导入封装模块，否则无法在其他地方使用模块的提供者。

当需要提供一组开箱即用的全局提供者（如辅助工具、数据库连接等）时，可使用 `@Global()` 装饰器将模块标记为**全局**模块。

```typescript
import { Module, Global } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Global()
@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
```

`@Global()` 装饰器使模块具有全局作用域。全局模块通常应由根模块或核心模块**仅注册一次**。在上例中，`CatsService` 提供者将无处不在，希望注入该服务的模块无需在其 imports 数组中导入 `CatsModule`。

> info **提示** 从设计实践角度不推荐将所有内容全局化。虽然全局模块能减少样板代码，但通常更好的做法是使用 `imports` 数组来可控且清晰地暴露模块 API 给其他模块。这种方式能提供更好的结构和可维护性，确保只共享模块的必要部分，同时避免应用无关部分之间产生不必要的耦合。

#### 动态模块

Nest 中的动态模块允许创建可在运行时配置的模块。当需要提供灵活、可定制的模块（其提供者能根据特定选项或配置创建时）特别有用。以下是关于**动态模块**运作原理的简要说明。

```typescript
import { Module, DynamicModule } from '@nestjs/common';
import { createDatabaseProviders } from './database.providers';
import { Connection } from './connection.provider';

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

> info **提示** `forRoot()` 方法可以同步或异步（例如通过 `Promise`）返回动态模块。

该模块默认定义了 `Connection` 提供者（在 `@Module()` 装饰器元数据中），此外根据传入 `forRoot()` 方法的 `entities` 和 `options` 对象，还会暴露一系列提供者，例如存储库。请注意动态模块返回的属性会**扩展** （而非覆盖）`@Module()` 装饰器中定义的基础模块元数据。这样既保留了静态声明的 `Connection` 提供者**又**能导出动态生成的存储库提供者。

若需在全局范围注册动态模块，请将 `global` 属性设为 `true`。

```typescript
{
  global: true,
  module: DatabaseModule,
  providers: providers,
  exports: providers,
}
```

> warning **警告** 如前所述，将所有内容全局化**并非良好的设计决策**。

可按以下方式导入并配置 `DatabaseModule`：

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [DatabaseModule.forRoot([User])],
})
export class AppModule {}
```

若需重新导出动态模块，可在导出数组中省略 `forRoot()` 方法调用：

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [DatabaseModule.forRoot([User])],
  exports: [DatabaseModule],
})
export class AppModule {}
```

[动态模块](/fundamentals/dynamic-modules)章节对此主题有更详细讲解，并包含一个[实际示例](https://github.com/nestjs/nest/tree/master/sample/25-dynamic-modules) 。

> info **提示** 通过[本章节](/fundamentals/dynamic-modules#configurable-module-builder)学习如何使用 `ConfigurableModuleBuilder` 构建高度可定制的动态模块。

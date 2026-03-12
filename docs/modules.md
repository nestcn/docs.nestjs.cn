### 模块

模块是使用 `@Module()` 装饰器注释的类。此装饰器提供元数据，**Nest** 使用这些元数据有效地组织和管理应用程序结构。

<figure><img class="illustrative-image" src="/assets/Modules_1.png" /></figure>

每个 Nest 应用程序至少有一个模块，即**根模块**，它作为 Nest 构建**应用程序图**的起点。此图是 Nest 用于解析模块和提供者之间关系和依赖项的内部结构。虽然小型应用程序可能只有根模块，但通常情况并非如此。**强烈建议**将模块作为组织组件的有效方式。对于大多数应用程序，你可能会有多个模块，每个模块封装一组密切相关的**功能**。

`@Module()` 装饰器接受一个具有描述模块属性的单个对象：

|               |                                                                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `providers`   | 将由 Nest 注入器实例化并且至少可以在该模块中共享的提供者                                                                                          |
| `controllers` | 必须在此模块中实例化的控制器集                                                                                                                              |
| `imports`     | 导出此模块中所需的提供者的导入模块列表                                                                                                                 |
| `exports`     | 由此模块提供并应在此模块导入的其他模块中可用的 `providers` 子集。你可以使用提供者本身或其令牌（`provide` 值） |

模块默认**封装**提供者，这意味着你只能注入当前模块中的提供者或从其他导入模块显式导出的提供者。从模块导出的提供者本质上充当模块的公共接口或 API。

#### 功能模块

在我们的示例中，`CatsController` 和 `CatsService` 密切相关并服务于相同的应用程序域。将它们分组到功能模块中是有意义的。功能模块组织与特定功能相关的代码，有助于保持清晰的界限和更好的组织。随着应用程序或团队的增长，这一点尤为重要，并且符合 [SOLID](https://en.wikipedia.org/wiki/SOLID) 原则。

接下来，我们将创建 `CatsModule` 来演示如何分组控制器和服务。

```typescript
@@filename(cats/cats.module)
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

上面，我们在 `cats.module.ts` 文件中定义了 `CatsModule`，并将与此模块相关的所有内容移动到 `cats` 目录中。我们需要做的最后一件事是将此模块导入到根模块（`AppModule`，在 `app.module.ts` 文件中定义）。

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule {}
```

这是我们的目录结构现在的样子：

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

在 Nest 中，模块默认是**单例**的，因此你可以轻松地在多个模块之间共享任何提供者的相同实例。

<figure><img class="illustrative-image" src="/assets/Shared_Module_1.png" /></figure>

每个模块自动成为**共享模块**。一旦创建，任何模块都可以重用它。假设我们想在其他几个模块之间共享 `CatsService` 的实例。为此，我们首先需要**导出** `CatsService` 提供者，方法是将它添加到模块的 `exports` 数组中，如下所示：

```typescript
@@filename(cats.module)
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

现在，任何导入 `CatsModule` 的模块都可以访问 `CatsService`，并将与所有其他导入它的模块共享相同的实例。

如果我们在每个需要它的模块中直接注册 `CatsService`，它确实会工作，但会导致每个模块获得 `CatsService` 自己的单独实例。这可能导致内存使用增加，因为创建了同一服务的多个实例，并且还可能引起意外行为，例如如果服务维护任何内部状态，则可能导致状态不一致。

通过将 `CatsService` 封装在模块（如 `CatsModule`）中并导出它，我们确保在所有导入 `CatsModule` 的模块中重用相同的 `CatsService` 实例。这不仅减少了内存消耗，还导致更可预测的行为，因为所有模块共享相同的实例，使得管理共享状态或资源更容易。这是像 NestJS 这样的框架中模块化和依赖注入的关键好处之一——允许在整个应用程序中有效地共享服务。

<app-banner-devtools></app-banner-devtools>

#### 模块重新导出

如上所示，模块可以导出其内部提供者。此外，它们可以重新导出它们导入的模块。在下面的示例中，`CommonModule` 既导入到 **又** 从 `CoreModule` 导出，使其可用于导入此模块的其他模块。

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
@@filename(cats.module)
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
@@switch
import { Module, Dependencies } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
@Dependencies(CatsService)
export class CatsModule {
  constructor(catsService) {
    this.catsService = catsService;
  }
}
```

但是，模块类本身不能注入为提供者，因为 [循环依赖](/fundamentals/circular-dependency)。

#### 全局模块

如果你必须到处导入相同的模块集，可能会很繁琐。与 Nest 不同，[Angular](https://angular.dev) `providers` 在全局范围内注册。一旦定义，它们在任何地方都可用。然而，Nest 将提供者封装在模块范围内。如果不首先导入封装模块，你就无法在其他地方使用模块的提供者。

当你想提供一组应该随时在任何地方可用的提供者（例如，助手、数据库连接等）时，使用 `@Global()` 装饰器使模块成为**全局**的。

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

`@Global()` 装饰器使模块成为全局范围。全局模块应该**只注册一次**，通常由根模块或核心模块注册。在上面的示例中，`CatsService` 提供者将是无处不在的，希望注入服务的模块不需要在其导入数组中导入 `CatsModule`。

> info **提示** 不建议将一切都设计为全局作为设计实践。虽然全局模块可以帮助减少样板代码，但通常最好使用 `imports` 数组以受控和清晰的方式使模块的 API 对其他模块可用。这种方法提供了更好的结构和可维护性，确保只有模块的必要部分与其他模块共享，同时避免应用程序不相关部分之间的不必要耦合。

#### 动态模块

Nest 中的动态模块允许你创建可以在运行时配置的模块。当你需要提供灵活、可定制的模块（其中提供者可以根据某些选项或配置创建）时，这特别有用。以下是**动态模块**如何工作的简要概述。

```typescript
@@filename()
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
@@switch
import { Module } from '@nestjs/common';
import { createDatabaseProviders } from './database.providers';
import { Connection } from './connection.provider';

@Module({
  providers: [Connection],
  exports: [Connection],
})
export class DatabaseModule {
  static forRoot(entities = [], options) {
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

此模块默认定义 `Connection` 提供者（在 `@Module()` 装饰器元数据中），但另外 - 取决于传递给 `forRoot()` 方法的 `entities` 和 `options` 对象 - 公开提供者集合，例如存储库。请注意，动态模块返回的属性**扩展**（而不是覆盖）`@Module()` 装饰器中定义的基础模块元数据。这就是静态声明的 `Connection` 提供者**和**动态生成的存储库提供者都从模块导出的方式。

如果你想在全局范围内注册动态模块，将 `global` 属性设置为 `true`。

```typescript
{
  global: true,
  module: DatabaseModule,
  providers: providers,
  exports: providers,
}
```

> warning **警告** 如上所述，将一切都做成全局**不是一个好的设计决策**。

可以按以下方式导入和配置 `DatabaseModule`：

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [DatabaseModule.forRoot([User])],
})
export class AppModule {}
```

如果你想重新导出动态模块，你可以在 exports 数组中省略 `forRoot()` 方法调用：

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

[动态模块](/fundamentals/dynamic-modules) 章节更详细地介绍了这个主题，并包含一个 [工作示例](https://github.com/nestjs/nest/tree/master/sample/25-dynamic-modules)。

> info **提示** 了解如何使用 `ConfigurableModuleBuilder` 构建高度可定制的动态模块，请参阅 [本章](/fundamentals/dynamic-modules#configurable-module-builder)。

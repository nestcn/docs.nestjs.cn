# 模块

模块是具有 `@Module()` 装饰器的类。 `@Module()` 装饰器提供了元数据，Nest 用它来组织应用程序结构。
 
 
<center>![图1](https://docs.nestjs.com/assets/Modules_1.png)</center>

每个 Nest 应用程序至少有一个模块，即根模块。根模块是Nest开始安排应用程序树的地方。事实上，根模块可能是应用程序中唯一的模块，特别是当应用程序很小时，但是没有意义。在大多数情况下，您将拥有多个模块，每个模块都有一组紧密相关的功能。


`@Module()` 装饰器接受其属性描述模块的单个对象。 请阅读下表：

|A|B|
|:-----:|:-----:|
|components| 由Nest注入器实例化的组件，并且可能至少跨该模块共享|	
|controllers|必须创建的一组控制器|
|imports|导出模块的列表，导出模块中需要的组件|
|exports|在其他模块中可用的组件子集|

模块默认封装组件。 这意味着不能注入不是当前模块的直接部分的组件，也不能从导入的模块中导出它们。


# CatsModule

`CatsController` 和 `CatsService` 属于同一个应用程序域。 应该将它们移动到功能模块 `CatsModule`。

> cats/cats.module.ts

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
    controllers: [CatsController],
    components: [CatsService],
})
export class CatsModule {}
```

我已经创建了 `cats.module.ts` 文件，并把与这个模块相关的所有东西都移到了 cats 目录下。 我们需要做的最后一件事是将这个模块导入入口模块 `(ApplicationModule)`。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';

@Module({
    imports: [CatsModule],
})
export class ApplicationModule {}
```

现在 Nest 知道除了 `ApplicationModule` 之外，注册 `CatsModule` 也是非常重要的。 这就是我们现在的目录结构:

```text
-| src/
  -| modules/
    -|cats/
      -| dto/
        -| create-cat.dto.ts
      -| interfaces/
        -| cat.interface.ts
      -| cats.service.ts
      -| cats.controller.ts
    -| app.module.ts
  -|server.ts
```

# 共享模块

在 Nest 中，默认情况下，模块是单例，因此您可以毫不费力地在 2..* 模块之间共享同一个组件实例。

!> 在之前版本的 Nest(<4) 中，模块不是单例，我们不得不使用 `@Shared()` 装饰器，该模块现在已经废弃。

<center>![图1](https://docs.nestjs.com/assets/Shared_Module_1.png)</center>

实际上，每个模块都是一个共享模块。 一旦创建就被每个模块重复使用。 假设我们将在几个模块之间共享 `CatsService` 实例。 我们需要把 `CatsService` 放到 `exports` 数组中，如下所示：

> cats.module.ts

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
    controllers: [CatsController],
    components: [CatsService],
    exports: [CatsService]
})
export class CatsModule {}
```

现在，每个导入 `CatsModule` 的模块 (将 `CatsModule`放入模块数组) 都可以访问 `CatsService`，并将与导入该模块的所有模块共享相同的实例。

!> 不应该导出控制器！

# 模块重新导出

模块可以导出他们的组件。 而且，他们可以再导出自己导入的模块。

```typescript
@Module({
  imports: [CommonModule],
  exports: [CommonModule],
})
export class CoreModule {}
```

# 依赖注入

模块自然可以注入属于它的组件（例如，为了配置目的）：


> cats.module.ts

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
    controllers: [CatsController],
    components: [CatsService],
})
export class CatsModule {
  constructor(private readonly catsService: CatsService) {}
}
```

但是，模块类不能由组件注入，因为它会创建一个循环依赖关系。

# 全局模块

如果你不得不在任何地方导入相同的模块，那可能很烦人。在 Angular 中，提供者是在全局范围内注册的。一旦定义，他们到处可用。另一方面，Nest 封装了模块范围内的组件。您不能在以前没有导入它的地方使用模块组件。但是有时候，你可能只想提供一组应该始终可用的东西 - 例如：助手，数据库连接等等。这就是为什么你能够使模块成为全局性的原因。

```typescript
import { Module, Global } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Global()
@Module({
    controllers: [CatsController],
    components: [CatsService],
    exports: [CatsService]
})
export class CatsModule {}
```

`@Global` 装饰器使模块成为全局作用域。 全局模块应该只注册一次，最好由根或核心模块注册。 之后，`CatsService` 组件将无处不在，但 `CatsModule` 不会被导入。

!> 使一切全局化并不是一个好的解决方案。 全局模块在这里减少了必要的样板数量。 `imports` 数组仍然是使模块 `API` 透明的最佳方式。

# 动态模块

Nest 模块系统带有一个称为动态模块的功能。 它使您能够毫不费力地创建可定制的模块。 让我们来看看 `DatabaseModule`：

```typescript
import { Module, DynamicModule } from '@nestjs/common';
import { createDatabaseProviders } from './database.providers';
import { Connection } from './connection.component';

@Module({
  components: [Connection],
})
export class DatabaseModule {
  static forRoot(entities = [], options?): DynamicModule {
    const providers = createDatabaseProviders(options, entities);
    return {
      module: DatabaseModule,
      components: providers,
      exports: providers,
    };
  }
}
```

它默认定义了 `Connection` 组件，但另外 - 根据传递的选项和实体 - 创建一个提供者集合，例如存储库组件。 实际上，动态模块扩展了模块元数据。 当您需要动态注册组件时，这个实质特性非常有用。 然后你可以通过以下方式导入 `DatabaseModule`：

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    DatabaseModule.forRoot([User]),
  ],
})
export class ApplicationModule {}
```
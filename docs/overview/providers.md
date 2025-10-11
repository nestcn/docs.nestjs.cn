# 提供者

提供者（Provider）是 Nest 的核心概念之一。许多基础的 Nest 类（如服务、存储库、工厂和辅助工具）都可以被视为提供者。提供者的核心特性在于它能够作为依赖项被注入到其他类中。默认情况下，提供者的生命周期与应用程序的生命周期一致：启动时：所有依赖项会被解析，每个提供者实例化一次（单例模式）。关闭时：这些实例会被销毁。但 Nest 也支持将提供者设置为请求作用域（request-scoped），此时其生命周期与单个 HTTP 请求绑定，而非整个应用程序。更多细节可参考[注入作用域](/fundamentals/provider-scopes)。

<app-banner-courses></app-banner-courses> 这使得对象之间能够形成各种关联关系。这些对象的"连接"工作主要由 Nest 运行时系统负责处理。

<figure><img class="illustrative-image" src="/assets/Components_1.png" /></figure>

在前一章中，我们创建了一个简单的 `CatsController`。控制器应当处理 HTTP 请求，并将更复杂的任务委托给**提供者** 。提供者是在 NestJS 模块中被声明为 `providers` 的普通 JavaScript 类。更多细节请参阅"模块"章节。

:::info 注意
由于 Nest 允许您以面向对象的方式设计和组织依赖关系，我们强烈建议遵循 [SOLID 原则](https://en.wikipedia.org/wiki/SOLID) 。
:::


#### 服务

让我们从创建一个简单的 `CatsService` 开始。该服务将处理数据存储和检索，并将被 `CatsController` 使用。由于其在管理应用逻辑中的角色，它非常适合被定义为一个提供者。

 ```typescript title="cats.service.ts"
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
```

:::info 提示
要使用 CLI 创建服务，只需执行 `$ nest g service cats` 命令。
:::

我们的 `CatsService` 是一个具有一个属性和两个方法的基础类。这里的关键添加是 `@Injectable()` 装饰器。该装饰器将元数据附加到类上，表明 `CatsService` 是一个可以由 Nest[IoC](https://en.wikipedia.org/wiki/Inversion_of_control) 容器管理的类。

此外，这个示例使用了 `Cat` 接口，其定义大致如下：

 ```typescript title="interfaces/cat.interface.ts"
export interface Cat {
  name: string;
  age: number;
  breed: string;
}
```

现在我们有了获取猫数据的服务类，让我们在 `CatsController` 中使用它：

 ```typescript title="cats.controller.ts"
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}
```

`CatsService` 通过类构造函数被**注入** 。注意这里使用了 `private` 关键字。这种简写方式让我们能在同一行中同时声明和初始化 `catsService` 成员，从而简化流程。

#### 依赖注入

Nest 围绕一个强大的设计模式构建，即**依赖注入** 。我们强烈建议阅读官方 [Angular 文档](https://angular.dev/guide/di)中关于这一概念的精彩文章。

在 Nest 中，得益于 TypeScript 的能力，依赖管理变得简单直接，因为它们是根据类型进行解析的。在下面的示例中，Nest 将通过创建并返回一个 `catsService` 实例（或者，在单例情况下，如果该实例已在其他地方请求过，则返回现有实例）来解析 `CatsService`。然后，这个依赖项会被注入到控制器的构造函数中（或分配给指定的属性）：

```typescript
constructor(private catsService: CatsService) {}
```

#### 作用域

提供程序通常具有与应用程序生命周期一致的生存期（"作用域"）。当应用程序启动时，每个依赖项都必须被解析，这意味着每个提供程序都会被实例化。同样，当应用程序关闭时，所有提供程序都会被销毁。但也可以将提供程序设置为**请求作用域** ，这意味着其生存期与特定请求而非应用程序生命周期相关联。您可以在[注入作用域](/fundamentals/provider-scopes)章节中了解更多相关技术。

#### 自定义提供程序

Nest 内置了一个控制反转（"IoC"）容器来管理提供程序之间的关系。这一功能是依赖注入的基础，但实际上比我们目前介绍的更强大。定义提供程序有几种方式：可以使用普通值、类，以及异步或同步工厂。更多定义提供程序的示例，请参阅[依赖注入](/fundamentals/dependency-injection)章节。

#### 可选提供程序

有时，您可能会遇到并非总是需要解析的依赖项。例如，您的类可能依赖于一个**配置对象** ，但如果没有提供，则应使用默认值。这种情况下，该依赖被视为可选的，配置提供者的缺失不应导致错误。

要将提供者标记为可选，请在构造函数签名中使用 `@Optional()` 装饰器。

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  constructor(@Optional() @Inject('HTTP_OPTIONS') private httpClient: T) {}
}
```

在上面的示例中，我们使用了自定义提供者，因此包含了 `HTTP_OPTIONS` 自定义**令牌** 。之前的示例展示了基于构造函数的注入，其中依赖项通过构造函数中的类来指示。有关自定义提供者及其关联令牌工作原理的更多详情，请查阅[自定义提供者](/fundamentals/custom-providers)章节。

#### 基于属性的注入

我们目前使用的技术称为基于构造函数的注入，即通过构造函数方法注入提供者。在某些特定情况下， **基于属性的注入**会很有用。例如，当顶级类依赖于一个或多个提供者时，在子类中通过 `super()` 层层传递这些依赖会变得繁琐。为了避免这种情况，你可以直接在属性级别使用 `@Inject()` 装饰器。

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}
```

:::warning 警告
如果你的类没有继承其他类，通常最好使用**基于构造函数**的注入方式。构造函数能明确指定所需的依赖项，相比使用 `@Inject` 注解的类属性，这种方式提供了更好的可见性并使代码更易于理解。
:::

#### 提供者注册

既然我们已经定义了一个提供者（`CatsService`）和一个消费者（`CatsController`），现在需要将该服务注册到 Nest 中以便处理依赖注入。这需要通过编辑模块文件（`app.module.ts`）并将服务添加到 `@Module()` 装饰器的 `providers` 数组来实现。

 ```typescript title="app.module.ts"
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class AppModule {}
```

现在 Nest 将能够解析 `CatsController` 类的依赖关系。

此时，我们的目录结构应该如下所示：

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
<div class="item">cats.service.ts</div>
</div>
<div class="item">app.module.ts</div>
<div class="item">main.ts</div>
</div>
</div>

#### 手动实例化

到目前为止，我们已经介绍了 Nest 如何自动处理依赖解析的大部分细节。但在某些情况下，您可能需要脱离内置的依赖注入系统，手动获取或实例化提供者。下面简要讨论两种此类技术。

- 要动态获取现有实例或实例化提供者，您可以使用[模块引用](../fundamentals/module-reference) 。
- 要在 `bootstrap()` 函数内获取提供程序（例如用于独立应用程序或在引导过程中使用配置服务），请参阅[独立应用程序](../standalone-applications) 。

### 提供者

提供者是 Nest 中的核心概念。许多基本的 Nest 类，如服务、存储库、工厂和助手，都可以被视为提供者。提供者背后的关键思想是它可以**被注入**为依赖项，允许对象之间形成各种关系。"连接"这些对象的责任在很大程度上由 Nest 运行时系统处理。

<figure><img class="illustrative-image" src="/assets/Components_1.png" /></figure>

在上一章中，我们创建了一个简单的 `CatsController`。控制器应该处理 HTTP 请求并将更复杂的任务委托给**提供者**。提供者是在 NestJS 模块中声明为 `providers` 的普通 JavaScript 类。有关更多详细信息，请参阅"模块"章节。

> info **提示** 由于 Nest 使你能够以面向对象的方式设计和组织依赖项，我们强烈建议遵循 [SOLID 原则](https://en.wikipedia.org/wiki/SOLID)。

#### 服务

让我们首先创建一个简单的 `CatsService`。此服务将处理数据存储和检索，它将被 `CatsController` 使用。由于其在管理应用程序逻辑中的作用，它是被定义为提供者的理想候选者。

```typescript
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


@Injectable()
export class CatsService {
  constructor() {
    this.cats = [];
  }

  create(cat) {
    this.cats.push(cat);
  }

  findAll() {
    return this.cats;
  }
}

```

> info **提示** 要使用 CLI 创建服务，只需执行 `$ nest g service cats` 命令。

我们的 `CatsService` 是一个基本类，具有一个属性和两个方法。这里的关键添加是 `@Injectable()` 装饰器。此装饰器将元数据附加到类，表明 `CatsService` 是一个可以由 Nest [IoC](https://en.wikipedia.org/wiki/Inversion_of_control) 容器管理的类。

此外，此示例使用了 `Cat` 接口，它可能如下所示：

```typescript
export interface Cat {
  name: string;
  age: number;
  breed: string;
}

```

现在我们有了一个服务类来检索猫，让我们在 `CatsController` 中使用它：

```typescript
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


@Controller('cats')
@Dependencies(CatsService)
export class CatsController {
  constructor(catsService) {
    this.catsService = catsService;
  }

  @Post()
  @Bind(Body())
  async create(createCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll() {
    return this.catsService.findAll();
  }
}

```

我们使用**构造函数注入**来注入 `CatsService`。在 TypeScript 中，这是通过在构造函数参数上添加类型注解来完成的。在 JavaScript 中，我们使用 `@Dependencies()` 装饰器来指定依赖项。

#### 依赖注入

Nest 是建立在强大的设计模式基础上的，主要是**依赖注入**。我们建议在官方 [Angular](https://angular.dev/guide/dependency-injection) 文档中阅读有关此概念的更多信息，因为其原理在 Nest 中非常相似。

在 Nest 中，依赖项通常在构造函数中注入，如上面的示例所示。Nest 会解析关系图并在需要时自动注入这些依赖项。

#### 注册提供者

现在我们有了服务类，我们需要在 Nest 中注册它，以便它可以被注入。我们通过在模块的 `providers` 数组中声明它来做到这一点：

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}

```

#### 自定义提供者

Nest 有一个内置的依赖注入系统，我们在上面的示例中看到了它的基本用法。在 Nest 中，提供者不仅限于类，还可以是各种不同的提供者，如值、工厂、异步工厂等。更多关于这一点的信息，以及如何创建自定义提供者的详细信息，可以在 [自定义提供者](/fundamentals/dependency-injection) 章节中找到。

#### 可选提供者

有时，你可能需要处理依赖项可能不存在的情况。例如，当你想为可选配置提供默认值时，或者当你想仅在特定条件下注册提供者时。在这种情况下，你可以将依赖项标记为**可选**。

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';
import { CREATE_CAT_OPTIONS } from './cats.constants';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  constructor(@Optional() @Inject(CREATE_CAT_OPTIONS) private readonly options: object) {}

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}


@Injectable()
export class CatsService {
  constructor(@Optional() @Inject('CREATE_CAT_OPTIONS') options) {
    this.cats = [];
    this.options = options;
  }

  create(cat) {
    this.cats.push(cat);
  }

  findAll() {
    return this.cats;
  }
}

```

在此示例中，`CREATE_CAT_OPTIONS` 是一个提供者令牌，我们使用 `@Optional()` 装饰器将其标记为可选。如果该令牌的提供者不存在，`options` 参数将是 `undefined`。

#### 基于属性的注入

在某些非常特殊的情况下，基于属性的注入可能很有用。例如，当顶级类依赖于一个或多个提供者时，而你不想在子类中通过构造函数传递它们。要使用基于属性的注入，你可以使用 `@Inject()` 装饰器：

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class BaseService {
  @Inject()
  protected httpService: HttpService;
}

```

但是，这种技术通常不推荐，因为它使你的代码更难测试，并且可能使依赖关系变得不那么明确。

#### 提供者作用域

提供者通常具有与应用程序生命周期对齐的生命周期（"作用域"）。当应用程序引导时，必须解析每个依赖项，这意味着每个提供者都会被实例化。同样，当应用程序关闭时，所有提供者都会被销毁。然而，也可以使提供者**请求作用域**，这意味着其生命周期与特定请求而不是应用程序的生命周期相关联。你可以在 [依赖注入](/fundamentals/dependency-injection) 章节中了解更多关于这些技术的信息。

#### 模块引用

在某些情况下，你可能需要在运行时动态获取提供者的实例，而不是在构造函数中注入它。例如，当你需要根据某些条件或配置动态选择提供者时。在这种情况下，你可以使用 `ModuleRef` 类：

```typescript
import { Injectable, ModuleRef } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  constructor(private moduleRef: ModuleRef) {}

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}

```

`ModuleRef` 提供了一个 `get()` 方法，允许你获取已注册提供者的实例。这在动态模块或需要基于某些条件解析提供者的场景中特别有用。

> info **提示** 有关 `ModuleRef` 的更多信息，请参阅 [执行上下文](/fundamentals/execution-context) 章节。

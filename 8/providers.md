# Providers

Providers 是 `Nest` 的一个基本概念。许多基本的 `Nest` 类可能被视为 provider - `service`,` repository`, `factory`, `helper` 等等。 他们都可以通过 `constructor` **注入**依赖关系。 这意味着对象可以彼此创建各种关系，并且“连接”对象实例的功能在很大程度上可以委托给 `Nest`运行时系统。 Provider 只是一个用 `@Injectable()` 装饰器注释的类。

![](https://docs.nestjs.com/assets/Components_1.png)

在前面的章节中，我们已经创建了一个简单的控制器 `CatsController` 。控制器应处理 `HTTP` 请求并将更复杂的任务委托给 **providers**。`Providers` 是纯粹的 `JavaScript` 类，在其类声明之前带有 `@Injectable()`装饰器。

?> 由于 `Nest` 可以以更多的面向对象方式设计和组织依赖性，因此我们强烈建议遵循 [SOLID](https://en.wikipedia.org/wiki/SOLID) 原则。

## 服务

让我们从创建一个简单的 `CatsService` 开始。该服务将负责数据存储和检索，其由 `CatsController` 使用，因此把它定义为 `provider`，是一个很好的选择。因此，我们用 `@Injectable()` 来装饰这个类 。

> cats.service.ts

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
```

?> 要使用 `CLI` 创建服务类，只需执行 `$ nest g service cats` 命令。

我们的 `CatsService` 是具有一个属性和两个方法的基本类。唯一的新特点是它使用 `@Injectable()` 装饰器。该 `@Injectable()` 附加有元数据，因此 `Nest` 知道这个类是一个 `Nest` provider。需要注意的是，上面有一个 `Cat` 接口。看起来像这样：

> interfaces/cat.interface.ts
```typescript
export interface Cat {
  name: string;
  age: number;
  breed: string;
}
```

现在我们有一个服务类来检索 `cat` ，让我们在 `CatsController` 里使用它 ：

> cats.controller.ts

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
```

`CatsService` 是通过类构造函数注入的。注意这里使用了私有的只读语法。这意味着我们已经在同一位置创建并初始化了 `catsService ` 成员。

## 依赖注入

Nest 是建立在强大的设计模式, 通常称为依赖注入。我们建议在官方的 [Angular文档](https://angular.cn/guide/dependency-injection)中阅读有关此概念的精彩文章。

在 `Nest` 中，借助 **TypeScript** 功能，管理依赖项非常容易，因为它们仅按类型进行解析。在下面的示例中，`Nest` 将 `catsService` 通过创建并返回一个实例来解析 `CatsService`（或者，在单例的正常情况下，如果现有实例已在其他地方请求，则返回现有实例）。解析此依赖关系并将其传递给控制器的构造函数（或分配给指定的属性）：

```typescript
constructor(private readonly catsService: CatsService) {}
```
## 作用域

Provider 通常具有与应用程序生命周期同步的生命周期（“作用域”）。在启动应用程序时，必须解析每个依赖项，因此必须实例化每个提供程序。同样，当应用程序关闭时，每个 provider 都将被销毁。但是，有一些方法可以改变 provider 生命周期的请求范围。您可以[在此处](/8/fundamentals?id=注射范围)详细了解这些技术。


## 自定义提供者

`Nest` 有一个内置的控制反转（`"IoC"`）容器，可以解决 providers 之间的关系。 此功能是上述依赖注入功能的基础，但要比上面描述的要强大得多。`@Injectable()` 装饰器只是冰山一角, 并不是定义 providers 的唯一方法。相反，您可以使用普通值、类、异步或同步工厂。看看[这里](/8/fundamentals)找到更多的例子。

## 可选提供者

有时，您可能需要解决一些依赖项。例如，您的类可能依赖于一个**配置对象**，但如果没有传递，则应使用默认值。在这种情况下，关联变为可选的， `provider`  不会因为缺少配置导致错误。

要指示 provider 是可选的，请在 `constructor` 的参数中使用 `@Optional()` 装饰器。

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  constructor(
    @Optional() @Inject('HTTP_OPTIONS') private readonly httpClient: T
  ) {}
}
```

请注意，在上面的示例中，我们使用自定义 `provider`，这是我们包含 `HTTP_OPTIONS`自定义标记的原因。前面的示例显示了基于构造函数的注入，通过构造函数中的类指示依赖关系。[在此处](/8/fundamentals)详细了解自定义providers及其关联的 `token`。

## 基于属性的注入

我们目前使用的技术称为基于构造函数的注入，即通过构造函数方法注入 providers。在某些非常特殊的情况下，基于属性的注入可能会有用。例如，如果顶级类依赖于一个或多个 providers，那么通过从构造函数中调用子类中的 `super()` 来传递它们就会非常烦人了。因此，为了避免出现这种情况，可以在属性上使用 `@Inject()` 装饰器。

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}
```

!> 如果您的类没有扩展其他提供者，你应该总是使用基于**构造函数**的注入。

## 注册提供者

现在我们已经定义了提供者（`CatsService`），并且已经有了该服务的使用者（`CatsController`），我们需要在 `Nest` 中注册该服务，以便它可以执行注入。 为此，我们可以编辑模块文件（`app.module.ts`），然后将服务添加到`@Module()`装饰器的 `providers` 数组中。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class AppModule {}
```

得益于此，`Nest` 现在将能够解决 `CatsController` 类的依赖关系。这就是我们目前的目录结构：

```
src
├── cats
│    ├──dto
│    │   └──create-cat.dto.ts
│    ├── interfaces
│    │       └──cat.interface.ts
│    ├──cats.service.ts
│    └──cats.controller.ts
├──app.module.ts
└──main.ts
```

## 手动实例化

到目前为止，我们已经讨论了 Nest 如何自动处理解决依赖关系的大多数细节。在某些情况下，您可能需要跳出内置的依赖注入系统，并手动检索或实例化提供程序。我们在下面简要讨论两个这样的主题。
 
要获取现有实例或动态实例化提供程序，可以使用 [Module reference](/8/fundamentals)。

要在 `bootstrap()` 函数内使用提供程序（例如，对于不带控制器的独立应用程序，或在引导过程中使用配置服务），请参见[独立应用程序](/8/standalone-applications)。

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
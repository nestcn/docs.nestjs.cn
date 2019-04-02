# 提供者

几乎所有的东西都可以被认为是提供者 - service, repository, factory, helper 等等。他们都可以通过 `constructor` **注入**依赖关系，也就是说，他们可以创建各种关系。但事实上，提供者不过是一个用`@Injectable()` 装饰器注解的类。

![](https://docs.nestjs.com/assets/Components_1.png)

在前面的章节中，我们已经创建了一个简单的控制器 `CatsController` 。控制器应处理 HTTP 请求并将更复杂的任务委托给**提供者**。提供者是纯粹的 JavaScript 类，其上方有 `@Injectable()` 装饰器。

?> 由于 Nest 可以以更多的面向对象方式设计和组织依赖性，因此我们强烈建议遵循 [SOLID](https://en.wikipedia.org/wiki/SOLID) 原则。


## 服务

让我们从创建一个简单的 CatsService 开始。该服务将负责数据存储和检索，由其使用 CatsController，因此它被定义为提供者是一个很好的选择。因此，我们用这个类来装饰 @Injectable()。

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

?> 要使用 CLI 创建服务类，只需执行 `$ nest g service cats/cats` 命令。

这是一个 `CatsService` 基本类，有一个属性和两个方法。唯一的新特点是它使用 `@Injectable()` 装饰器。该 `@Injectable()` 附加有元数据，因此 Nest 知道这个类是一个 Nest 提供者。需要注意的是，上面有一个`Cat`接口。看起来像这样：

```typescript
export interface Cat {
  name: string;
  age: number;
  breed: string;
}
```

现在我们有一个服务类来检索 cat ，让我们在 `CatsController` 里使用它 ：

> cats.controller.ts

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

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

`CatsService` 通过类构造函数注入。不要害怕 private readonly 缩短的语法。这意味着我们已经在同一位置创建并初始化了 catsService 成员。

## 依赖注入

Nest 是建立在强大的设计模式, 通常称为依赖注入。我们建议在官方的 [Angular文档](https://angular.cn/guide/dependency-injection)中阅读关于这个概念的伟大文章。

在 Nest 中，由于 **TypeScript** 的缘故，管理依赖关系非常简单，因为它们只是按类型解析。在下面的示例中，Nest 将 catsService 通过创建并返回一个实例来解析 CatsService（或者，在单例的正常情况下，如果现有实例已在其他地方请求，则返回现有实例）。解析此依赖关系并将其传递给控制器的构造函数（或分配给指定的属性）：

```typescript
constructor(private readonly catsService: CatsService) {}
```
### 范围

提供者通常具有与应用程序生命周期同步的生命周期（“范围”）。引导应用程序时，必须解析每个依赖项，因此必须实例化每个提供程序。同样，当应用程序关闭时，每个提供者都将被销毁。但是，有一些方法可以该标提供者生命周期的请求范围。您可以[在此处](/6/fundamentals?id=注射范围)详细了解这些技术。


## 定制提供者

Nest有一个内置的控制反转（“IoC”）容器，可以解决提供者之间的关系。 此功能是上述依赖注入功能的基础，但要比上面描述的要强大得多。`@Injectable()` 装饰器只是冰山一角, 不需要严格定义提供商。相反，您可以使用普通值、类、异步或同步工厂。看看[这里](/6/fundamentals)找到更多的例子。

## 可选的提供者

有时，你可能会面临不一定要解决的关联。例如，您的类可能依赖于一个**配置对象**，但如果没有传递，则应使用默认值。在这种情况下，关联变为可选的，提供者不会因为缺少配置导致错误。

要确保提供者不是必选的，请在 `constructor` 的参数中使用 `@optional()` 装饰器。

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  constructor(
    @Optional() @Inject('HTTP_OPTIONS') private readonly httpClient: T
  ) {}
}
```

请注意，在上面的示例中，我们使用自定义提供程序，这是我们包含HTTP_OPTIONS自定义标记的原因。前面的示例显示了基于构造函数的注入，通过构造函数中的类指示依赖关系。[在此处](/6/fundamentals?id=自定义providercustomer-provider)详细了解自定义提供程序及其关联的token。

## 基于属性的注入

在一些非常特殊的情况下，基于属性的注入可能会有用。例如，如果顶级类依赖于一个或多个提供者，那么通过从构造函数中调用子类中的 `super()` 来传递它们就会非常烦人了。因此，为了避免出现这种情况，可以在属性上使用 `@inject()` 装饰器

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}
```

!> 如果你的类不继承任何其他提供者，你应该总是使用基于构造函数的注入。

## 注册提供者

现在我们已经定义了一个 provider（CatsService），并且我们有了该 service（CatsController）的使用者，我们需要使用 Nest 注册该服务，以便它可以执行注入。我们通过编辑模块文件（app.module.ts）并将服务添加到装饰器的 providers 数组来完成此操作 @Module()。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class ApplicationModule {}
```

得益于此，Nest 将能够解决 `CatsController` 类的依赖关系。这就是我们目前的目录结构：

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



 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://wx3.sinaimg.cn/large/006fVPCvly1fmpnlt8sefj302d02s742.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@tangkai](https://github.com/tangkai123456)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/22436910">  |  翻译  | 专注于 React，[@tangkai](https://github.com/tangkai123456) |

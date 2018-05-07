# 提供者

几乎所有的东西都可以被认为是提供者 - service, repository, factory, helper 等等。他们都可以注入依赖关系 `constructor`，也就是说，他们可以创建各种关系。但事实上，提供者不过是一个用`@Injectable()` 装饰器注解的简单类。

![](http://localhost:4200/assets/Components_1.png)

控制器应处理 HTTP 请求并将更复杂的任务委托给服务。提供者是纯粹的 JavaScript 类，其 `@Injectable()` 上有装饰器。

?> 由于 Nest 可以以更多的面向对象方式设计和组织依赖性，因此我们强烈建议遵循 SOLID 原则。

我们来创建一个简单的 CatsService 提供者：

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

这是一个 CatsService 基本类，有一个属性和两个方法。唯一的新特点是它使用 `@Injectable()` 装饰器。该 `@Injectable()` 附加的元数据，从而 Nest 知道这个类是一个 Nest 提供者。

?> Cat 上面有一个界面。我们没有提到它，因为这个模式与 CreateCatDto 我们在前一章中创建的类完全相同。

由于我们已经完成了服务类，所以我们在以下内容中使用它 CatsController ：

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

在 CatsService 通过类构造函数注入。不要害怕 private readonly 缩短的语法。这意味着我们已经在同一位置创建并初始化了 catsService 成员。

## 依赖注入

Nest 是建立在强大的设计模式, 通常称为依赖注入。我们建议在官方的 [Angular文档](https://angular.cn/guide/dependency-injection)中阅读关于这个概念的伟大文章。

在 Nest 中，由于 TypeScript 的缘故，管理依赖关系非常简单，因为它们只是按类型解决，然后注入控制器的构造函数中：

```typescript
constructor(private readonly catsService: CatsService) {}
```

## 定制提供者

Nest 用来解决提供者之间关系的控制反转要比上面描述的要强大得多。`@Injectable()` 装饰器只是冰山一角, 不需要严格定义提供商。相反，您可以使用普通值，类，异步或同步工厂。看看这里找到更多的例子。

## 最后一步

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

得益于此，Nest 将能够解决 CatsController 类的依赖关系。这就是我们目前的目录结构：

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




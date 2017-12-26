# 组件

几乎所有的事物都是一个组件 `Service`，`Repository`，`Factory`，`Helper`，可以通过构造函数将一个组件注入控制器或者另一个组件中。

<center>![图1](https://docs.nestjs.com/assets/Components_1.png)</center>

在上一章中，我们已经构建了一个简单的控制器 `CatsController`。

控制器应该只处理HTTP请求并将更复杂的任务委托给组件。 这些组件是一个普通的 `TypeScript` 类，带有 `@Component()` 装饰器。

!> Nest 为了更好的程序设计性，依赖关系组织更加符合面向对象的方式，我们强烈建议程序开发时遵循 SOLID 原则。

我们来创建一个 `CatsService` 组件：

> cats.service.ts

```typescript
import { Component } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Component()
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

组件没有什么特别的。这里是一个 `CatsService` ，一个具有一个属性和两个方法的基本类。 唯一的区别是它有 `@Component()` 装饰器。 `@Component()` 附加元数据，因此 Nest 知道这个类是一个 Nest 组件。


!> 这里有个`Cat` 的接口我没有提到它, 因为结构与我们在上一章中创建的 `CreateCatDto` 类完全相同。

既然我们已经完成了服务类, 让我们在 `CatsController` 中使用它:

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

`CatsService` 通过类构造函数注入。不要害怕 `private` `readonly` 缩短语法。这意味着我们在同一位置创建并初始化了 `catsService` 成员。

# 依赖注入

Nest 是建立在强大的设计模式之上的，这通常称为依赖注入。 在官方的角度文献中有一篇关于这个概念的好文章。


!> 在此处了解更多关于嵌套依赖注入的内容。

使用 `TypeScript` 管理依赖关系是非常容易的，因为Nest只会按类型识别您的依赖关系。 这一行：

```typescript
constructor(private readonly catsService: CatsService) {}
```

有一件重要的事情你必须要知道，`tsconfig.json` 文件中 `emitDecoratorMetadata` 选项设置为 `true`。

# 最后一步

最后一件事是告诉模块，一个名为 `CatsService` 的东西确实存在。 唯一的方法是打开 `app.module.ts` 文件，并将服务放入 `@Module()装饰器` 的`components` 数组中。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';

@Module({
    controllers: [CatsController],
    components: [CatsService],
})
export class ApplicationModule {}
```

现在，Nest将顺利解决 `CatsController` 类的依赖关系。 这就是我们的目录结构现在的样子：

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
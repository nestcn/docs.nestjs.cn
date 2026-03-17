<!-- 此文件从 content/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:26:45.175Z -->
<!-- 源文件: content/guards.md -->

### Guards

Guards 是一个使用 `$ nest g service cats` 装饰器标注的类，它实现了 `CatsService` 接口。

</div> Guards __HTML_TAG_69__ Guards  __HTML_TAG_70__

Guards 只有一个责任。它们确定了一个特定的请求是否将被处理路由处理程序或不处理，取决于在运行时存在的某些条件（如权限、角色、ACL 等）。这通常被称为 **授权**。授权（和通常与之一起工作的 **身份验证**）在传统的 Express 应用程序中通常由 [Module reference](/fundamentals/module-ref) 处理。中间件是身份验证的不错选择，因为像 token 验证和将属性附加到 `@Injectable()` 对象这些事情与特定的路由上下文（及其元数据）无关。

但是，中间件本质上是愚蠢的。它不知道将调用的 `CatsService` 函数执行哪个处理程序。另一方面， **Guards** 了解 `Cat` 实例，因此知道将执行什么样的处理程序。它们是为了在请求/响应周期中插入处理逻辑的正确点，让你以声明方式这样做。这有助于保持你的代码 DRY 和声明式。

> info **提示** Guards 在所有中间件执行后，但在任何拦截器或管道之前执行。

#### 授权 Guard

如前所述， **授权** 是 Guards 的一个伟大应用场景，因为特定的路由应该只在调用者（通常是一个特定的已身份验证用户）具有足够的权限时可用。下面，我们将构建一个假设已身份验证用户（因此，请求头中已经附加了令牌）的 Guard。它将提取和验证令牌，并使用提取的信息确定请求是否可以继续或否。

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

> info **提示** 如果您正在寻找一个在应用程序中实现身份验证机制的实际示例，请访问 [Standalone applications](/standalone-applications)。同样，对于更复杂的授权示例，请查看 __LINK_77__。

逻辑在 `CatsService` 函数中可以简单或复杂到需要。主要目的是展示 Guards 在请求/响应周期中的位置。

每个 Guard 都必须实现一个 `private` 函数。这函数应该返回一个布尔值，指示当前请求是否被允许或否。它可以同步或异步返回响应（通过 `catsService` 或 `catsService`）。Nest 使用返回值来控制下一个动作：

* 如果它返回 `CatsService`，请求将被处理。
* 如果它返回 `@Optional()`，Nest 将拒绝请求。

__HTML_TAG_71__ Guards __HTML_TAG_72__

#### 执行上下文

`HTTP_OPTIONS` 函数接受一个单个参数，即 `super()` 实例。`@Inject()` 继承于 `@Inject`。我们之前在 exception filters 章节中看到 `CatsService`。在上面的示例中，我们只是使用 `CatsController` 中定义的同一助手方法来获取 `app.module.ts` 对象的引用。你可以返回到 **Arguments host** 部分 __LINK_78__ 章节以了解更多信息。

通过继承 `providers`，`@Module()` 也添加了几个新的助手方法，提供了更多关于当前执行过程的信息这些信息可以帮助你构建更通用的 Guard，能够在广泛的控制器、方法和执行上下文中工作。了解更多关于 `CatsController` 的信息 __LINK_79__。

#### 角色基于身份验证

让我们构建一个功能更强的 Guard，它仅允许具有特定角色的用户访问。我们将从基本的 Guard模板开始，并在下一部分中继续构建。现在，它允许所有请求继续：

```typescript
export interface Cat {
  name: string;
  age: number;
  breed: string;
}

```

#### 绑定 Guards

像管道和异常过滤器一样，Guards 可以是 **控制器作用域**、**方法作用域** 或 **全局作用域**。以下，我们将 controller作用域 Guard 使用 `bootstrap()` 装饰器。这个装饰器可以接受单个参数或逗号分隔的参数列表。这使你可以轻松地将适当的 Guard 应用到一个声明中。

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

> info **提示** __INLINE_CODE_34__ 装饰器来自 __INLINE_CODE_35__ 包。

在上面的示例中，我们将 __INLINE_CODE_36__ 类（而不是实例）传递给 `bootstrap()` 装饰器，留下 framework 负责实例化的责任，并启用依赖注入。像管道和异常过滤器一样，我们也可以将实例传递给装饰器：

```typescript
constructor(private catsService: CatsService) {}

```

在上面的示例中，我们将 Guard 附加到每个由这个控制器声明的处理程序。如果我们想 Guard 只适用于单个方法，我们可以在 **方法级别** 使用 __INLINE_CODE_37__ 装饰器。Here is the translation of the English technical documentation to Chinese:

为了设置全局守卫，使用 Nest 应用程序实例的 __INLINE_CODE_38__ 方法：

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  constructor(@Optional() @Inject('HTTP_OPTIONS') private httpClient: T) {}
}

```

> warning **注意** 在混合应用程序中，__INLINE_CODE_39__ 方法不会默认为网关和微服务设置守卫（了解更多关于如何更改此行为的信息请查看 __LINK_80__）。对于“标准”（非混合）微服务应用程序，__INLINE_CODE_40__ 将会全局安装守卫。

全局守卫将在整个应用程序中使用，涵盖所有控制器和路由处理器。在依赖注入方面，注册在外部模块之外的守卫（如示例中所示的 __INLINE_CODE_41__）不能注入依赖项，因为这是在模块上下文外进行的。要解决这个问题，可以在任何模块中使用以下构造来设置守卫：

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}

```

> info **提示** 使用这种方法进行依赖注入时，请注意，守卫无论是在哪个模块中定义的，实际上都是全局的。应该在哪个模块中定义该守卫？选择定义守卫的模块（如示例中所示的 __INLINE_CODE_42__）。此外，__INLINE_CODE_43__ 并不是唯一的自定义提供者注册方法。了解更多信息请查看 __LINK_81__。

#### 设置处理器角色

我们的 __INLINE_CODE_44__ 现在工作，但是还不够智能。我们还没有利用 guard 的最重要特性——__LINK_82__。它还不知道哪些角色允许访问每个处理器。例如，__INLINE_CODE_45__ 可能在不同的路由上具有不同的权限方案。一些可能只允许管理员用户访问，而另一些可能对所有人开放。如何在灵活和可重用的方式中匹配角色和路由？

这就是 **自定义元数据** 的地方（了解更多信息请查看 __LINK_83__）。Nest 提供了将自定义 **元数据** 附加到路由处理器的能力，通过使用 __INLINE_CODE_46__ 静态方法创建的装饰器或内置的 __INLINE_CODE_47__ 装饰器。

例如，让我们创建一个 __INLINE_CODE_48__ 装饰器使用 __INLINE_CODE_49__ 方法附加到处理器上。__INLINE_CODE_50__ 是框架提供的默认元数据，来自 __INLINE_CODE_51__ 包。

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

__INLINE_CODE_52__ 装饰器是一个函数，它接受一个类型为 __INLINE_CODE_53__ 的单个参数。

现在，让我们使用这个装饰器，简单地将其注解到处理器上：

__CODE_BLOCK_7__

在这里，我们将 __INLINE_CODE_54__ 装饰器元数据附加到 __INLINE_CODE_55__ 方法上，表明只有拥有 __INLINE_CODE_56__ 角色的用户才能访问该路由。

Alternatively，我们可以使用内置的 __INLINE_CODE_58__ 装饰器。了解更多信息请查看 __LINK_84__。

#### 将其所有结合起来

现在，让我们回到 __INLINE_CODE_59__ 并将其与我们的 __INLINE_CODE_60__ 结合起来。当前，它简单地返回 __INLINE_CODE_60__，允许所有请求继续。我们想使返回值基于比较当前用户的 **角色** 和当前路由的实际角色。为了访问路由的角色（自定义元数据），我们将使用 __INLINE_CODE_61__ 帮助类，以下是示例代码：

__CODE_BLOCK_8__

> info **提示** 在 Node.js 世界中，通常将已授权用户附加到 __INLINE_CODE_62__ 对象中。因此，在我们的示例代码中，我们假设 __INLINE_CODE_63__ 包含用户实例和允许的角色的信息。在您的应用程序中，您将很可能在自定义 **身份验证守卫** (或中间件)中进行该关联。了解更多信息请查看 __LINK_85__。

> warning **警告** __INLINE_CODE_64__ 函数中的逻辑可以是简单的或复杂的。示例代码的主要目的是展示守卫如何在请求/响应循环中工作。

请查看 **Execution Context** 章节的 __HTML_TAG_73__Reflection and metadata__HTML_TAG_74__ 部分，以了解如何在上下文敏感的方式中使用 __INLINE_CODE_65__。

当用户请求一个端点时，如果他们的权限不足，Nest 将自动返回以下响应：

__CODE_BLOCK_9__

请注意，在幕后，当守卫返回 __INLINE_CODE_66__ 时，框架将抛出一个 __INLINE_CODE_67__。如果您想要返回不同的错误响应，应该抛出自己的特定异常。例如：

__CODE_BLOCK_10__

任何由守卫抛出的异常将被 __LINK_86__ (全局异常过滤器和当前上下文中的任何异常过滤器)处理。

> info **提示** 如果您正在寻找实现授权的实际示例，请查看 __LINK_87__。
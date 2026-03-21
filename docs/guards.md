<!-- 此文件从 content/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:04:00.384Z -->
<!-- 源文件: content/guards.md -->

### Guards

Guards 是一个使用 `$ nest g service cats` 装饰器的类，实现 `CatsService` 接口。

</div>__HTML_TAG_69____HTML_TAG_70__

Guards 只有一个责任。他们确定是否将请求处理给路由处理程序，取决于在运行时存在的某些条件（如权限、角色、ACL 等）。这通常被称为 授权。授权（及其同伴认证）通常在传统 Express 应用程序中由 [Module reference](/fundamentals/module-ref) 处理。Middleware 是认证的不错选择，因为像 token 验证和将属性附加到 `@Injectable()` 对象这些事情与特定路由上下文（及其元数据）没有强烈关联。

然而，Middleware 自然是傻瓜。它不知道将调用 `CatsService` 函数后将执行哪个处理程序。相反，Guards 对 `Cat` 实例有访问权，因此知道将要执行的下一个操作。它们是设计的，让你在请求/响应周期的恰当位置插入处理逻辑，并且是声明式的。这有助于保持您的代码 DRY 和声明式。

> info **提示** Guards 在所有 Middleware 执行后，但在任何拦截器或管道执行前执行。

#### 授权守卫

正如之前所提到的，授权是 Guards 的一个伟大的用例，因为特定的路由应该只有在调用者（通常是一个特定的已认证用户）具有足够权限时才能访问。我们将构建的 `CatsController` 假设了已认证用户（因此，请求头中附加了令牌）。它将提取并验证令牌，然后使用提取的信息来确定请求是否可以继续或否。

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

> info **提示** 如果您正在寻找一个实际世界示例，了解如何在应用程序中实现身份验证机制，请访问 [Standalone applications](/standalone-applications)。同样，对于更复杂的授权示例，请查看 __LINK_77__。

`CatsService` 函数的逻辑可以简单或复杂到需要。主要目的是展示Guards 在请求/响应周期中的位置。

每个守卫都必须实现 `private` 函数。这函数应该返回一个布尔值，表示当前请求是否允许或否。它可以同步或异步返回响应（通过 `catsService` 或 `catsService`）。Nest 使用返回值来控制下一步操作：

- 如果返回 `CatsService`，请求将被处理。
- 如果返回 `@Optional()`，Nest 将拒绝请求。

__HTML_TAG_71____HTML_TAG_72__

#### 执行上下文

`HTTP_OPTIONS` 函数带有一个参数，即 `super()` 实例。`@Inject()` 继承自 `@Inject`。我们之前在异常过滤器章节中见过 `CatsService`。在上面的示例中，我们只是使用了同样定义在 `CatsController` 上的助手方法，以获取 `app.module.ts` 对象的引用。您可以返回到 **Arguments host** 部分的 __LINK_78__ 章节以了解更多信息。

通过继承 `providers`，`@Module()` 也添加了几个新的助手方法，提供了更多关于当前执行过程的详细信息。这些详细信息可以帮助您构建更加通用的守卫，能够工作于广泛的控制器、方法和执行上下文中。了解更多关于 `CatsController` 的信息，可以访问 __LINK_79__。

#### 角色基于认证

让我们构建一个功能更强的守卫，只允许具有特定角色的用户访问。我们将从基本守卫模板开始，并在以下部分中继续构建。现在，它允许所有请求继续：

```typescript
export interface Cat {
  name: string;
  age: number;
  breed: string;
}

```

#### 绑定守卫

像管道和异常过滤器一样，Guards 可以是 controller-scoped、method-scoped 或 global-scoped。下面，我们使用 `bootstrap()` 装饰器将守卫绑定到控制器上。这装饰器可能带有一个或多个参数。这使您可以轻松地应用适当的守卫声明。

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

上面的构造将守卫绑定到每个由此控制器声明的处理程序。如果我们想守卫只应用于单个方法，我们可以在 **方法级别** 应用 __INLINE_CODE_37__ 装饰器。

以上是翻译结果。Here is the translation of the provided English technical documentation to Chinese, following the specified rules:

为了在 Nest 应用程序实例中设置全局守卫，请使用 __INLINE_CODE_38__ 方法：

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  constructor(@Optional() @Inject('HTTP_OPTIONS') private httpClient: T) {}
}

```

> 警告 **注意** 在混合应用程序中，__INLINE_CODE_39__ 方法不默认为网关和微服务设置守卫（请参阅 __LINK_80__以了解如何更改此行为）。对于“标准”（非混合）微服务应用程序，__INLINE_CODE_40__ 方法会将守卫挂载到全局。

全局守卫用于整个应用程序，适用于每个控制器和路由处理程序。在依赖注入中，全局守卫从外部注册（如上例中的 __INLINE_CODE_41__）无法注入依赖项，因为这是在模块上下文之外进行的。在解决这个问题时，可以在任何模块中使用以下构造来设置守卫：

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}

```

> 提示 **提示** 使用这种方法来执行守卫的依赖项注入时，需要注意，即使在使用这个构造的地方，守卫实际上仍然是全局的。应该在哪个模块中进行这个构造？选择定义守卫（如上例中的 __INLINE_CODE_42__）的模块。另外，__INLINE_CODE_43__ 并不是唯一的自定义提供程序注册方式。了解更多关于 __LINK_81__。

#### 设置处理程序角色

我们的 __INLINE_CODE_44__ 已经工作，但是还不是很智能。我们还没有充分利用最重要的守卫功能——__LINK_82__。它还不知道关于每个处理程序的角色或哪些角色可以访问每个处理程序。例如，__INLINE_CODE_45__ 可以具有不同的权限方案用于不同的路由。一些可能只供管理员用户访问，而其他可能对所有用户开放。如何将角色与路由匹配以实现灵活和可重用的方式？

这就是 **自定义元数据** 的地方（了解更多关于 __LINK_83__）。Nest 提供了将自定义 **元数据** 附加到路由处理程序的能力，通过使用 __INLINE_CODE_46__ 静态方法创建的装饰器或内置的 __INLINE_CODE_47__ 装饰器。

例如，让我们创建一个 __INLINE_CODE_48__ 装饰器使用 __INLINE_CODE_49__ 方法，该装饰器将将元数据附加到处理程序中。 __INLINE_CODE_50__ 是框架提供的默认装饰器，来自 __INLINE_CODE_51__ 包。

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

__INLINE_CODE_52__ 装饰器这里是一个函数，它接受一个类型为 __INLINE_CODE_53__ 的单个参数。

现在，我们可以使用这个装饰器，简单地将其注解到处理程序上：

__CODE_BLOCK_7__

在这里，我们将 __INLINE_CODE_54__ 装饰器元数据附加到 __INLINE_CODE_55__ 方法，指示只有拥有 __INLINE_CODE_56__ 角色的用户才能访问这个路由。

Alternatively，我们也可以使用内置的 __INLINE_CODE_58__ 装饰器。了解更多关于 __LINK_84__。

#### 将其所有结合起来

现在，让我们回到 __INLINE_CODE_59__ 并将其与我们的 __INLINE_CODE_60__ 结合起来。当前，它简单地返回 __INLINE_CODE_60__ 在所有情况下，允许每个请求继续进行。我们想使返回值基于比较当前用户的 **角色的分配** 到实际路由所需的角色。在访问路由的角色（自定义元数据）时，我们将使用 __INLINE_CODE_61__ 帮助类，例如：

__CODE_BLOCK_8__

> 提示 **提示** 在 Node.js 世界中，通常将授权用户附加到 __INLINE_CODE_62__ 对象中。因此，在我们的示例代码中，我们假设 __INLINE_CODE_63__ 包含用户实例和允许的角色。在您的应用程序中，您将可能在自定义 **身份验证守卫** (或中间件)中进行这个关联。了解更多关于 __LINK_85__。

> 警告 **警告** 在 __INLINE_CODE_64__ 函数内部的逻辑可以是简单的或复杂的。主要目的是展示如何守卫在请求/响应循环中工作。

请参阅 __HTML_TAG_73__Reflection 和元数据__HTML_TAG_74__ 部分的 **执行上下文** 章节，以了解如何在上下文敏感的方式使用 __INLINE_CODE_65__。

当用户请求一个端点时，Nest 自动返回以下响应：

__CODE_BLOCK_9__

请注意，在幕后，当守卫返回 __INLINE_CODE_66__ 时，框架抛出一个 __INLINE_CODE_67__。如果您想返回不同的错误响应，请抛出自己的特定异常。例如：

__CODE_BLOCK_10__

任何由守卫抛出的异常都会被 __LINK_86__ (全局异常过滤器和当前上下文中的任何异常过滤器) 处理。

> 提示 **提示** 如果您正在寻找实现授权的实际示例，请检查 __LINK_87__。
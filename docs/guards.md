<!-- 此文件从 content/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:40:10.750Z -->
<!-- 源文件: content/guards.md -->

### Guards

 Guards 是一个带有 `$ nest g service cats` 装饰器的类，实现了 `CatsService` 接口。

</div>__HTML_TAG_69____HTML_TAG_70__

Guards 只有一个责任。他确定了一个给定的请求是否将被路由处理程序处理，或者根据某些条件（如权限、角色、ACL 等）在运行时决定。这通常被称为 **认证**。认证（及其同伴**身份验证**，它们通常一起工作）在传统的 Express 应用程序中通常由 [Module reference](/fundamentals/module-ref) 处理。中间件是一个很好的身份验证选择，因为像令牌验证和将属性附加到 `@Injectable()` 对象这些事情与特定的路由上下文（及其元数据）无关。

然而，中间件由于其本质是愚蠢的。它不知道调用 `CatsService` 函数后将执行哪个处理程序。相比之下，Guards 有访问 `Cat` 实例的权限，并且知道下一个将被执行的处理程序。它们是为了在请求/响应周期中插入处理逻辑的正确点，并且是声明式的。这有助于保持您的代码 DRY 和声明式。

> info **Hint** Guards 在所有中间件执行后，但是在任何拦截器或管道之前执行。

#### 认证 Guard

正如前所述，认证是一个 Guards 的很好的用例，因为特定的路由应该只在调用者（通常是一个特定的已 authenticated 用户）具有足够权限时可用。下面我们将构建的 `CatsController` 假设已 authenticated 用户（因此请求头中已经附加了令牌）。它将提取和验证令牌，并使用提取的信息来确定请求是否可以继续或否。

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

> info **Hint** 如果您正在寻找一个实现身份验证机制的实践示例，可以访问 [Standalone applications](/standalone-applications)。对于更加复杂的认证示例，请查看 __LINK_77__。

 Guards 内部的 `CatsService` 函数可以是简单或复杂的。主要的目的是显示 Guards 在请求/响应周期中的位置。

每个 Guard 都必须实现一个 `private` 函数。这函数应该返回一个布尔值，指示当前请求是否被允许或否。它可以同步或异步返回响应（通过 `catsService` 或 `catsService`）。Nest 使用返回值来控制下一个动作：

- 如果它返回 `CatsService`, 请求将被处理。
- 如果它返回 `@Optional()`, Nest 将否决请求。

__HTML_TAG_71____HTML_TAG_72__

#### 执行上下文

`HTTP_OPTIONS` 函数接受一个单个参数，即 `super()` 实例。`@Inject()` 继承自 `@Inject`。我们在前一章的异常过滤器中已经看过 `CatsService`。在上面的示例中，我们只是使用了 `CatsController` 中定义的同样助手方法来获取 `app.module.ts` 对象的引用。您可以返回到 **Arguments host** 部分的 __LINK_78__ 章节以了解更多信息。

通过继承 `providers`，`@Module()` 也添加了几个新的助手方法，这些方法提供了关于当前执行过程的额外信息。这些建议可以帮助您构建更多通用的 Guards，可以跨越广泛的控制器、方法和执行上下文。了解更多关于 `CatsController` 的信息可以访问 __LINK_79__。

#### 角色认证

让我们构建一个更功能强的 Guard，它只允许具有特定角色的用户访问。我们将从基本 Guard 模板开始，并在下一节中继续构建。现在，它允许所有请求继续：

```typescript
export interface Cat {
  name: string;
  age: number;
  breed: string;
}

```

#### 绑定 Guards

像管道和异常过滤器一样，Guards 可以是控制器作用域、方法作用域或全局作用域的。以下，我们使用 `bootstrap()` 装饰器将 Guard 绑定到控制器作用域中。这装饰器可以接受单个参数或逗号分隔的参数列表。这使您可以轻松地应用适当的 Guard 集合声明。

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

> info **Hint** __INLINE_CODE_34__ 装饰器来自 __INLINE_CODE_35__ 包。

上面，我们传递了 __INLINE_CODE_36__ 类（而不是实例），留下了框架实例化的责任，从而启用依赖注入。像管道和异常过滤器一样，我们也可以传递实例：

```typescript
constructor(private catsService: CatsService) {}

```

构造中将 Guard 附加到这个控制器中所有处理程序。如果我们想将 Guard 应用于单个方法，我们可以在 **方法级别** 应用 __INLINE_CODE_37__ 装饰器。Here is the translation of the provided English technical documentation to Chinese:

为了设置全局守卫，使用 Nest 应用程序实例的 __INLINE_CODE_38__ 方法：

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  constructor(@Optional() @Inject('HTTP_OPTIONS') private httpClient: T) {}
}

```

> warning **注意** 在混合应用程序中，__INLINE_CODE_39__ 方法不默认为网关和微服务设置守卫（了解更多关于如何更改此行为的信息__LINK_80__）。对于“标准”（非混合）微服务应用程序，__INLINE_CODE_40__ 会将守卫挂载到全局。

全局守卫是在整个应用程序中，用于每个控制器和每个路由处理器。从依赖注入的角度讲，注册在任何模块外（如示例 __INLINE_CODE_41__）的全局守卫无法注入依赖项，因为这是在任何模块的上下文之外进行的。要解决这个问题，可以在任何模块中使用以下构造方式设置守卫：

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}

```

> info **提示** 使用这种方法在guard中进行依赖项注入时，请注意，不管是在哪个模块中使用这个构造方式，guard实际上都是全局的。应该在哪个模块中使用？选择guard（如 __INLINE_CODE_42__ 在示例中）定义的模块。另外，__INLINE_CODE_43__ 并不是唯一的自定义提供者注册方式。了解更多 __LINK_81__。

#### 设置 handler 角色

我们的 __INLINE_CODE_44__ 现在正在工作，但是还不够智能。我们还没有使用最重要的守卫功能——__LINK_82__。它还不知道哪些角色允许访问每个 handler。例如，__INLINE_CODE_45__ 可能在不同的路由上具有不同的权限方案。一些可能只供管理员用户访问，而其他可能对所有人开放。如何将角色与路由匹配，以便灵活且可重用的方式？

这就是 **自定义元数据** 到 play 的地方（了解更多 __LINK_83__）。Nest 提供了将自定义 **元数据** 附加到路由处理器的能力，通过使用创建的 __INLINE_CODE_46__ 静态方法或内置 __INLINE_CODE_47__ 装饰器。

例如，让我们创建一个 __INLINE_CODE_48__ 装饰器，使用 __INLINE_CODE_49__ 方法将其附加到处理器。__INLINE_CODE_50__ 是框架提供的预置元数据，来自 __INLINE_CODE_51__ 包。

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

现在，让我们使用这个装饰器 simplement 将其注解到处理器：

__CODE_BLOCK_7__

这里，我们将 __INLINE_CODE_54__ 装饰器元数据附加到 __INLINE_CODE_55__ 方法，表明只有拥有 __INLINE_CODE_56__ 角色的用户才能访问这个路由。

alternatively，可以使用内置 __INLINE_CODE_58__ 装饰器。了解更多关于 __LINK_84__。

#### 将其一切结合

现在，让我们回到我们的 __INLINE_CODE_59__。当前，它简单地返回 __INLINE_CODE_60__，允许每个请求继续执行。我们想要使返回值根据当前用户的角色和当前路由的角色进行条件判断。在访问路由的角色（自定义元数据）时，我们将使用 __INLINE_CODE_61__ 帮助类：

__CODE_BLOCK_8__

> info **提示** 在 Node.js 世界中，常见的做法是将授权用户附加到 __INLINE_CODE_62__ 对象中。因此，在我们的示例代码中，我们假设 __INLINE_CODE_63__ 包含用户实例和允许的角色。在您的应用程序中，您将 probable 使这个关联在您的自定义 **身份验证守卫**（或中间件）中。了解更多 __LINK_85__。

> warning **警告** 在 __INLINE_CODE_64__ 函数中的逻辑可以是简单的或复杂的。主要是为了展示卫如何在请求/响应循环中发挥作用。

请参阅 **Execution Context** 章节的 __HTML_TAG_73__Reflection 和元数据__HTML_TAG_74__ 部分，以了解如何在上下文敏感的方式使用 __INLINE_CODE_65__。

当用户请求一个endpoint且权限不足时，Nest 将自动返回以下响应：

__CODE_BLOCK_9__

注意，在幕后，当守卫返回 __INLINE_CODE_66__ 时，框架将抛出一个 __INLINE_CODE_67__。如果您想要返回不同的错误响应，请抛出自己的特定异常。例如：

__CODE_BLOCK_10__

任何由守卫抛出的异常都会被 __LINK_86__ (全局异常过滤器和当前上下文中的任何异常过滤器) 处理。

> info **提示** 如果您正在寻找一个实际案例，了解如何实现身份验证，请查看 __LINK_87__。
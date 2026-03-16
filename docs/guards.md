<!-- 此文件从 content/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:47:46.163Z -->
<!-- 源文件: content/guards.md -->

### Guards

Guards 是一个使用 `$ nest g service cats` 装饰器注解的类，它实现了 `CatsService` 接口。

</div>__HTML_TAG_69____HTML_TAG_70__

Guards 只有一个责任。他们决定一个特定的请求是否将被路由处理程序处理，不管一些在运行时存在的条件（如权限、角色、ACL 等）。这通常被称为 授权。授权（和其它人通常合作的认证）在传统的 Express 应用程序中通常由 [Module reference](/fundamentals/module-ref) 处理。中间件是认证的不错选择，因为像令牌验证和将属性附加到 `@Injectable()` 对象都是与特定的路由上下文（及其元数据）无关的。

但是，中间件天生是愚昧的。它不知道将调用 `CatsService` 函数后将执行什么 handler。反之，Guards 有访问 `Cat` 实例的机会，因此知道将执行什么。他们是设计的，以便在请求/响应周期中插入处理逻辑，并且是声明式的。这有助于保持您的代码 DRY 和声明式。

> info **Hint** Guards 在所有中间件执行完毕后，但是在任何拦截器或管道之前被执行。

#### 授权guard

正如前所述，授权是一个伟大的Guards用例，因为特定的路由应该只有在调用者（通常是一个特定的认证用户）具有足够权限时才能访问。我们将构建的`CatsController`假设了认证用户（因此，	token 已经附加到请求头）。它将提取和验证令牌，并使用提取的信息来确定请求是否可以继续或否。

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

> info **Hint** 如果您正在寻找一个实际的示例，了解如何在您的应用程序中实现身份验证机制，请访问 [Standalone applications](/standalone-applications)。对于更复杂的授权示例，请查看 __LINK_77__。

`CatsService` 函数的逻辑可以简单或复杂到需要。示例的主要目的是展示Guards如何在请求/响应周期中插入处理逻辑。

每个Guard都必须实现一个 `private` 函数。这 функци应该返回一个布尔值，表示当前请求是否被允许。它可以异步或同步返回响应（通过 `catsService` 或 `catsService`）。Nest 使用返回值来控制下一个动作：

- 如果它返回 `CatsService`，请求将被处理。
- 如果它返回 `@Optional()`，Nest 将拒绝请求。

__HTML_TAG_71____HTML_TAG_72__

#### 执行上下文

`HTTP_OPTIONS` 函数只接受一个参数，即 `super()` 实例。`@Inject()` 继承于 `@Inject`。我们在前一章中见过 `CatsService`。在示例中，我们只是使用了 `CatsController` 中定义的 helper 方法，以获取一个对 `app.module.ts` 对象的引用。您可以返回到 **Arguments host** 部分中的 __LINK_78__ 章节，以了解更多关于这个主题的信息。

通过继承 `providers`，`@Module()` 也添加了几个新的 helper 方法，这些方法提供了当前执行过程的更多详细信息。这些详细信息可以在构建更通用的Guards时非常有用，这些Guards可以在广泛的控制器、方法和执行上下文中工作。了解更多关于 `CatsController` 的信息可以查看 __LINK_79__。

#### 角色基于身份验证

让我们构建一个功能更强的Guard，它只允许具有特定角色的用户访问。我们将从基本的Guard模板开始，随后在下一章中添加更多内容。当前，它允许所有请求继续：

```typescript
export interface Cat {
  name: string;
  age: number;
  breed: string;
}

```

#### 绑定Guards

像管道和异常过滤器一样，Guards 可以是控制器作用域、方法作用域或全局作用域的。以下，我们使用 `bootstrap()` 装饰器将一个控制器作用域的Guard设置为控制器作用域。这装饰器可能接受单个参数，也可能接受逗号分隔的参数。这使得您可以轻松地应用适当的Guards声明。

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

以上，我们将 __INLINE_CODE_36__ 类（而不是实例）传递给装饰器，留给框架负责实例化，并启用依赖注入。像管道和异常过滤器一样，我们也可以传递实例：

```typescript
constructor(private catsService: CatsService) {}

```

在上面的构造中，我们将guard 附加到这个控制器中声明的每个处理程序。如果我们想要guard 仅应用于单个方法，我们可以在 **方法级别** 应用 __INLINE_CODE_37__ 装饰器。Here is the translation:

为了在 Nest 应用程序中设置全局守卫，使用 Nest 应用程序实例的 __INLINE_CODE_38__ 方法：

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  constructor(@Optional() @Inject('HTTP_OPTIONS') private httpClient: T) {}
}

```

> warning **注意** 在混合应用程序中，__INLINE_CODE_39__ 方法不默认为网关和微服务设置守卫 (请查看 __LINK_80__ 以了解如何更改此行为)。对于“标准”（非混合）微服务应用程序，__INLINE_CODE_40__ 将全局安装守卫。

全局守卫是在整个应用程序中使用的，每个控制器和每个路由处理器都可以使用它们。在依赖注入中，来自任何模块外（如示例中的 __INLINE_CODE_41__）注册的全局守卫不能注入依赖项，因為這是在任何模块的上下文之外进行的。为了解决这个问题，可以在任何模块中使用以下构造来设置守卫：

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}

```

> info **提示** 当使用该方法进行守卫依赖项注入时，请注意，无论是在哪个模块中使用该构造，守卫实际上都是全局的。应该在哪里使用该构造？选择守卫（如示例中的 __INLINE_CODE_42__）所在的模块。

#### 按处理器设置角色

我们的 __INLINE_CODE_44__ 现在工作，但是它还不智能。我们还没有利用守卫的最重要特性 - __LINK_82__。它还不知道哪些角色允许每个处理器。例如，__INLINE_CODE_45__ 可以具有不同的权限方案 для不同的路由。一些可能只供管理员用户使用，而其他可能对所有用户开放。如何将角色与路由进行灵活且可重用的匹配？

这是 **自定义元数据** 的时候 (了解更多 __LINK_83__。Nest 提供了将自定义 **元数据** 附加到路由处理器的能力，通过创建使用 __INLINE_CODE_46__ 静态方法创建的装饰器或内置 __INLINE_CODE_47__ 装饰器。

例如，让我们创建一个 __INLINE_CODE_48__ 装饰器使用 __INLINE_CODE_49__ 方法来将元数据附加到处理器。__INLINE_CODE_50__ 是框架提供的默认值，来自 __INLINE_CODE_51__ 包。

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

__INLINE_CODE_52__ 装饰器这里是一个函数，它只接受一个 __INLINE_CODE_53__ 类型的参数。

现在，让我们使用这个装饰器，简单地将其注解到处理器上：

__CODE_BLOCK_7__

这里，我们将 __INLINE_CODE_54__ 装饰器元数据附加到 __INLINE_CODE_55__ 方法，表示只有拥有 __INLINE_CODE_56__ 角色的用户才能访问该路由。

Alternatively，我们可以使用内置的 __INLINE_CODE_58__ 装饰器。了解更多 __LINK_84__。

#### 将其所有连接起来

现在，让我们回到 __INLINE_CODE_59__ 并将其与我们的 __INLINE_CODE_44__ 连接起来。当前，它简单地返回 __INLINE_CODE_60__ 在所有情况下，允许每个请求继续。我们想要根据比较当前用户的角色到实际路由所需的角色来使返回值 conditional。为了访问路由的角色（自定义元数据），我们将使用 __INLINE_CODE_61__ 帮助类再次，以下所示：

__CODE_BLOCK_8__

> info **提示** 在 Node.js 世界中，通常将授权用户附加到 __INLINE_CODE_62__ 对象中。因此，在我们的示例代码中，我们假设 __INLINE_CODE_63__ 包含用户实例和允许的角色。在你的应用程序中，你可能会在自定义 **身份验证守卫** (或中间件) 中进行该关联。了解更多 __LINK_85__。

> warning **警告** 逻辑在 __INLINE_CODE_64__ 函数中可以是简单的或复杂的。主要是为了显示guards如何 fit 到请求/响应周期中。

请查看 **Execution context** 章节的 __HTML_TAG_73__Reflection and metadata__HTML_TAG_74__ 部分，以了解如何在上下文敏感的方式使用 __INLINE_CODE_65__。

当没有足够权限的用户请求端点时，Nest 自动返回以下响应：

__CODE_BLOCK_9__

请注意，在幕后，当守卫返回 __INLINE_CODE_66__ 时，框架将抛出一个 __INLINE_CODE_67__。如果你想返回不同的错误响应，请抛出自己的特定异常。例如：

__CODE_BLOCK_10__

任何由守卫抛出的异常都将被 __LINK_86__ 处理（全局异常过滤器和当前上下文中的任何异常过滤器）。

> info **提示** 如果你正在寻找实现授权的真实世界示例，请查看 __LINK_87__。
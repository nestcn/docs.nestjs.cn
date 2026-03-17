<!-- 此文件从 content/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:59:23.226Z -->
<!-- 源文件: content/guards.md -->

### Guards

Guards 是一个使用 `$ nest g service cats` 装饰器标记的类，它实现了 `CatsService` 接口。

</div>__HTML_TAG_69____HTML_TAG_70__

Guards 只有一个责任。它们确定是否将给定的请求交给路由处理程序或否，根据某些在运行时存在的条件（如权限、角色、ACL 等）。这通常被称为 授权。授权（及其同伴身份验证）在传统 Express 应用程序中通常由 [Module reference](/fundamentals/module-ref) 处理。中间件是身份验证的不错选择，因为一些事情，如令牌验证和将属性附加到 `@Injectable()` 对象，不强烈地连接到特定的路由上下文（及其元数据）。

但是，中间件本质上是愚昧的。它不知道将调用 `CatsService` 函数后将执行哪个处理程序。另一方面，Guards 有访问 `Cat` 实例的能力，因此知道将执行什么。它们是设计的，如异常过滤器、管道和拦截器一样，让您在请求/响应周期中插入处理逻辑，并且是声明式的。这有助于保持您的代码 DRY 和声明式。

> info **hint** Guards 在中间件执行后，但在拦截器或管道之前执行。

#### 授权 Guards

正如所提到的，授权是一个Guards的伟大用例，因为特定的路由应该只在调用者（通常是一个特定的已认证用户）具有足够权限时可用。我们将构建的 `CatsController` 假设已认证用户（因此请求头中有令牌）。它将提取和验证令牌，并使用提取的信息确定请求是否可以继续或否。

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

> info **hint** 如果您正在寻找一个实际世界上的身份验证机制实现示例，请访问 [Standalone applications](/standalone-applications)。同样，对于更复杂的授权示例，请查看 __LINK_77__。

在 `CatsService` 函数中的逻辑可以简单或复杂到需要。主要是为了展示Guards如何插入请求/响应周期。

每个Guard都必须实现一个 `private` 函数。这函数应该返回一个布尔值，指示当前请求是否被允许或否。它可以同步或异步返回响应（通过 `catsService` 或 `catsService`）。Nest 使用返回值来控制下一个动作：

- 如果它返回 `CatsService`，请求将被处理。
- 如果它返回 `@Optional()`，Nest 将拒绝请求。

__HTML_TAG_71____HTML_TAG_72__

#### 执行上下文

`HTTP_OPTIONS` 函数接受一个单个参数，即 `super()` 实例。`@Inject()` 继承于 `@Inject`。我们在前一章中看到过 `CatsService`。在上面的示例中，我们只是使用了与前一章中相同的助手方法定义在 `CatsController` 上，以获取 `app.module.ts` 对象的引用。您可以在 __LINK_78__ 章节的 **Arguments host** 部分中了解更多关于这个话题。

通过扩展 `providers`，`@Module()` 也添加了一些新帮助方法，提供了关于当前执行进程的更详细信息。这些信息可以帮助您构建更通用的Guards，能够在广泛的控制器、方法和执行上下文中工作。了解更多关于 `CatsController` 的信息，请访问 __LINK_79__。

#### 角色基于身份验证

让我们构建一个功能更强大的Guard，它仅允许访问特定角色的用户。我们将从基本Guards模板开始，随后将在后续章节中添加更多内容。对于现在，它允许所有请求继续：

```typescript
export interface Cat {
  name: string;
  age: number;
  breed: string;
}

```

#### 绑定 Guards

像管道和异常过滤器一样，Guards 可以是 **控制器范围**、方法范围或全局范围的。下面，我们使用 `bootstrap()` 装饰器将Guards绑定到控制器上。这装饰器可以接受单个参数或逗号分隔的参数列表。这使您可以轻松地应用适当的Guards声明。

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

> info **hint** __INLINE_CODE_34__ 装饰器来自 __INLINE_CODE_35__ 包。

上面，我们将 __INLINE_CODE_36__ 类（而不是实例）传递给装饰器，留下责任让框架处理实例化，并启用依赖注射。像管道和异常过滤器一样，我们也可以传递in-place实例：

```typescript
constructor(private catsService: CatsService) {}

```

在上面的构造中，我们将Guard 附加到这个控制器中每个处理程序。如果我们想Guards只应用于单个方法，我们可以在 **方法级别** 应用 __INLINE_CODE_37__ 装饰器。Here is the translated text:

为了在全局范围内设置守卫，请使用 Nest 应用程序实例的 __INLINE_CODE_38__ 方法：

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  constructor(@Optional() @Inject('HTTP_OPTIONS') private httpClient: T) {}
}

```

> 警告 **注意** 在混合应用程序中，__INLINE_CODE_39__ 方法不会默认为网关和微服务设置守卫（了解更多关于如何更改此行为的信息，请查看 __LINK_80__）。对于“标准”（非混合）微服务应用程序，__INLINE_CODE_40__ 方法会将守卫挂载到全局。

全局守卫将在整个应用程序中使用，用于每个控制器和每个路由处理程序。在依赖注入方面，全局守卫注册在任何模块外（如上面的示例）不能注入依赖项，因为这是在模块上下文之外进行的。要解决这个问题，可以在任何模块中使用以下构造来设置守卫：

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}

```

> 提示 **提示** 在使用这种方法时执行依赖项注入时，请注意，无论是在哪个模块中使用这构造，守卫实际上都是全局的。应该在哪个模块中使用？选择定义守卫的模块（例如上面的示例）。此外，__INLINE_CODE_43__ 不是唯一的自定义提供商注册方式。了解更多 __LINK_81__。

#### 设置 handler 角色

我们的 __INLINE_CODE_44__ 工作，但是它还不够智能。我们还没有利用守卫的最重要的功能——__LINK_82__。它还不知道哪些角色允许访问每个 handler。例如，__INLINE_CODE_45__ 可能对不同的路由使用不同的权限方案。一些可能只供管理员用户访问，而其他可能对所有用户开放。如何将角色与路由匹配以实现灵活和可重用的方式？

这就是 **自定义元数据** 发挥作用的地方（了解更多 __LINK_83__）。Nest 提供了将自定义 **元数据** 附加到路由处理程序的能力，这些元数据可以通过使用 __INLINE_CODE_46__ 静态方法创建的装饰器或内置的 __INLINE_CODE_47__ 装饰器来实现。

例如，让我们创建一个 __INLINE_CODE_48__ 装饰器使用 __INLINE_CODE_49__ 方法将元数据附加到处理程序。__INLINE_CODE_50__ 是框架提供的 out-of-the-box  metadata，并且从 __INLINE_CODE_51__ 包中暴露出来。

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

现在，让我们使用这个装饰器 simply 注解处理程序：

__CODE_BLOCK_7__

这里，我们将 __INLINE_CODE_54__ 装饰器元数据附加到 __INLINE_CODE_55__ 方法，指出只有拥有 __INLINE_CODE_56__ 角色的用户才能访问这个路由。

Alternatively，我们可以使用内置的 __INLINE_CODE_58__ 装饰器。了解更多关于 __LINK_84__。

#### 将其全部结合起来

现在，让我们回到我们的 __INLINE_CODE_59__。当前，它简单地返回 __INLINE_CODE_60__ 对于所有情况，允许每个请求继续进行。我们想要根据比较当前用户分配的角色和当前路由所需的角色来使返回值条件化。在访问路由的角色(s)（自定义元数据）时，我们将使用 __INLINE_CODE_61__ 帮助类，如下所示：

__CODE_BLOCK_8__

> 提示 **提示** 在 Node.js 世界中，通常将授权用户附加到 __INLINE_CODE_62__ 对象中。因此，在我们的示例代码中，我们假设 __INLINE_CODE_63__ 包含用户实例和允许的角色。在你的应用程序中，你将可能在自定义 **认证守卫** (或中间件)中进行该关联。了解更多 __LINK_85__。

> 警告 **警告** __INLINE_CODE_64__ 函数内的逻辑可以是简单的还是复杂的。主要是要展示如何守卫 fit 到请求/响应周期中。

请查看 __HTML_TAG_73__Reflection 和元数据__HTML_TAG_74__ 部分以了解在执行上下文中使用 __INLINE_CODE_65__ 的更多信息。

当用户请求一个 endpoint 但权限不足时，Nest 自动返回以下响应：

__CODE_BLOCK_9__

请注意，幕后，当守卫返回 __INLINE_CODE_66__ 时，框架会抛出一个 __INLINE_CODE_67__。如果您想返回不同的错误响应，请抛出自己的特定异常。例如：

__CODE_BLOCK_10__

任何由守卫抛出的异常都将被 __LINK_86__ (全局异常过滤器和当前上下文中的任何异常过滤器)处理。

> 提示 **提示** 如果您想了解实现授权的实际示例，请查看 __LINK_87__。
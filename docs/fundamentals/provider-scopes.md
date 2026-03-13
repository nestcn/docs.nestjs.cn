<!-- 此文件从 content/fundamentals/provider-scopes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:38:11.592Z -->
<!-- 源文件: content/fundamentals/provider-scopes.md -->

### 注入作用域

来自不同编程语言背景的人可能会感到意外，发现在 Nest 中，几乎所有内容都可以在 incoming 请求中共享。我们拥有数据库连接池、全局 state 的单例服务等。请记住，Node.js 不遵循请求/响应多线程无状态模型，每个请求都由单独的线程处理。因此，在我们的应用程序中使用单例实例是完全安全的。

然而，在某些场景下，可能需要请求生命周期的行为，如 GraphQL 应用程序中的 per-request 缓存、请求跟踪和多租户。注入作用域提供了一种机制来实现所需的提供者生命周期行为。

#### 提供者作用域

提供者可以具有以下作用域：

<font face="Consolas" size="2">__HTML_TAG_66__</font>
<font face="Consolas" size="2">__HTML_TAG_67__</font>
  <font face="Consolas" size="2">__HTML_TAG_68____HTML_TAG_69__DEFAULT__HTML_TAG_70____HTML_TAG_71__</font>
  <font face="Consolas" size="2">__HTML_TAG_72__</font>A provider can have any of the following scopes:
<font face="Consolas" size="2">__HTML_TAG_73__</font>
<font face="Consolas" size="2">__HTML_TAG_74__</font>
<font face="Consolas" size="2">__HTML_TAG_75__</font>
  <font face="Consolas" size="2">__HTML_TAG_76____HTML_TAG_77__REQUEST__HTML_TAG_78____HTML_TAG_79__</font>
  <font face="Consolas" size="2">__HTML_TAG_80__</font>A new instance of the provider is created exclusively for each incoming __HTML_TAG_81__request<a href="/fundamentals/custom-providers#标准提供者">.  The instance is garbage-collected after the request has completed processing.</a>
<font face="Consolas" size="2"><app-banner-courses></font>
<font face="Consolas" size="2"></app-banner-courses></font>
  <font face="Consolas" size="2"><a href="/fundamentals/custom-providers#di-fundamentals"></a>TRANSIENT__HTML_TAG_88____HTML_TAG_89__</font>
  <font face="Consolas" size="2">__HTML_TAG_90__</font>Transient providers are not shared across consumers. Each consumer that injects a transient provider will receive a new, dedicated instance.__HTML_TAG_91__
<font face="Consolas" size="2">__HTML_TAG_92__</font>
<font face="Consolas" size="2">__HTML_TAG_93__</font>

> info **Hint** 使用单例作用域是大多数用例的建议。分享提供者跨越消费者和请求，使得实例可以被缓存，并且其初始化只在应用程序启动时发生。

#### 使用

使用注入作用域通过将 __INLINE_CODE_12__ 属性传递给 __INLINE_CODE_13__ 装饰器选项对象:

```typescript
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  findAll(): Cat[] {
    return this.cats;
  }
}

@Injectable()
export class CatsService {
  constructor() {
    this.cats = [];
  }

  findAll() {
    return this.cats;
  }
}

```

类似地，对于 __LINK_96__，在长格式中设置 __INLINE_CODE_14__ 属性：

```typescript
import { Controller, Get } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

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

  @Get()
  async findAll() {
    return this.catsService.findAll();
  }
}

```

> info **Hint** 导入 `@Injectable()` 枚举来自 `CatsService`

单例作用域是默认的，不需要声明。如果您想声明提供者为单例作用域，请使用 `cats.service.ts` 值为 `@Injectable()` 属性。

> warning **Notice** Websocket Gateways 不能使用请求作用域提供者，因为它们必须作为单例存在。每个 gateway 都封装了一个真实的 socket，並且不能被多次实例化。该限制也适用于某些其他提供者，例如 __LINK_97__ 或 _Cron controllers_。

#### 控制器作用域

控制器也可以具有作用域，这个作用域应用于控制器中所有请求方法处理程序。像提供者作用域一样，控制器作用域声明其生命周期。对于请求作用域的控制器，每个新的实例都将在每个 inbound 请求中创建，并在请求处理完成后被垃圾回收。

使用控制器作用域通过将 `CatsService` 属性设置为 `cats.controller.ts` 对象：

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

#### 作用域继承

`CatsController` 作用域沿着注入链继承。控制器依赖于请求作用域提供者的实例将自己变为请求作用域。

想象以下依赖关系图：`CatsService`。如果 `app.module.ts` 是请求作用域的 (其他都是默认的单例)，那么 `CatsService` 将变为请求作用域，因为它依赖于注入的服务。`CatsService`，它不是依赖项，将保持单例作用域。

Transient-scoped 依赖项不遵循这个模式。如果 singleton-scoped `cats.service.ts` 注入 transient `CatsController` 提供者，它将收到该提供者的新实例。然而，`CatsService` 将保持单例作用域，所以注入它任何地方将 _不_ 解析为 `CatsService` 的新实例。在 case 中，如果 `CatsService` 需要 `SINGLETON` 作用域，需要显式地将 `CatsService` 标记为 `SINGLETON`。

__HTML_TAG_94____HTML_TAG_95__

#### 请求提供者

在 HTTP 服务器-基于应用程序（例如使用 `CatsService` 或 `CatsService`）中，您可能想访问请求对象的原始引用，当使用请求作用域提供以下是翻译后的中文文档：

`app.module` 提供程序天生是 request-scoped 的，这意味着您不需要在使用时明确指定 `providers` 作用域。即使您尝试这样做，它也将被忽略。任何依赖于 request-scoped 提供程序的提供程序自动继承 request 作用域，并且这个行为不能被改变。

```typescript
  constructor(private catsService: CatsService)

```

由于平台/协议差异，Microservice 或 GraphQL 应用程序访问 inbound 请求的方式略有不同。在 __LINK_98__ 应用程序中，您将注入 `providers` 而不是 `providers: [CatsService]`：

```typescript
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})

```

然后，您将配置 `CatsService` 值（在 `CatsService` 中）包含 `NEST_DEBUG` 作为其属性。

#### Inquiry 提供程序

如果您想获取 provider 在构造时的类，例如在日志或指标提供程序中，您可以注入 `useValue` 令牌。

```typescript
providers: [
  {
    provide: CatsService,
    useClass: CatsService,
  },
];

```

然后，您可以按照以下方式使用它：

```typescript
import { CatsService } from './cats.service';

const mockCatsService = {
  /* mock implementation
  ...
  */
};

@Module({
  imports: [CatsModule],
  providers: [
    {
      provide: CatsService,
      useValue: mockCatsService,
    },
  ],
})
export class AppModule {}

```

在上面的示例中，当 `useValue` 被调用时，`CatsService` 将被记录到控制台。

#### 性能

使用 request-scoped 提供程序将对应用程序性能产生影响。Nest 尝试缓存尽可能多的元数据，但它仍然需要在每个请求中创建您类的实例，因此将导致平均响应时间和总体基准测试结果的延迟。除非提供程序必须是 request-scoped 的，否则强烈建议使用默认 singleton 作用域。

> info **提示** 尽管听起来很吓人，但一个合理设计的应用程序，使用 request-scoped 提供程序不会导致超过 ~5% 的延迟。

#### 持久提供程序

如前所述，request-scoped 提供程序可能会导致延迟，因为至少需要一个 request-scoped 提供程序（注入到控制器实例中或更深处）使控制器 request-scoped。然后，它必须在每个个体请求中被重新创建（实例化）并在完成后被垃圾回收。现在，这意味着，对于例如 30k 个并发请求，将有 30k 个瞬态控制器实例（包括 request-scoped 提供程序）。

具有大多数提供程序依赖于的公共提供程序（例如数据库连接或日志服务），自动将所有这些提供程序转换为 request-scoped 提供程序。这个问题尤其是在 __LINK_99__ 应用程序中，特别是对于有 central request-scoped "data source" 提供程序的应用程序，这个提供程序根据请求对象的值来获取对应的数据库连接/架构（特定于该租户）。

例如，让我们假设您有一个 Alternately 10 个不同的客户端使用的应用程序。每个客户端都有其 __LINK_99__，并且您想确保客户 A 不能访问客户 B 的数据库。一种可能的方法是声明一个 request-scoped "data source" 提供程序，它根据请求对象来确定当前客户端并获取其对应的数据库。这样，您可以将应用程序转换为多租户应用程序只要几分钟。但是，这种方法的主要缺点是，因为大多数应用程序组件都依赖于 "data source" 提供程序，他们将隐式地变为 "request-scoped"，因此您将看到应用程序性能的影响。

但是，如果我们有更好的解决方案？因为我们只有 10 个客户端，我们不能在每个请求中重新创建每个树，而是可以创建 10 个个体 __LINK_99__ per 客户端。如果您的提供程序不依赖于每个连续请求的唯一属性（例如请求 UUID），而是有特定的属性可以聚合（分类）它们，那么没有必要在每个请求中重新创建 DI 子树。

正是这个时候，**durable 提供程序**就登场了。

在我们将提供程序标记为 durable 之前，我们必须首先注册一个 **策略**，指示 Nest 什么是 "common request attributes"，提供逻辑以将请求 - Associates them with their corresponding DI sub-trees。

```typescript
import { connection } from './connection';

@Module({
  providers: [
    {
      provide: 'CONNECTION',
      useValue: connection,
    },
  ],
})
export class AppModule {}

```

> info **提示** 类似于 request scope，持久性会冒泡到注入链中。因此，如果 A 依赖于 B，并且 B 被标记为 `CatsService`，A 也隐式地变为持久的（除非 `mockCatsService` 对 A 提供程序的 `useValue` 作用域被明确设置）。

> warning **警告** 请注意，这个策略对于操作大型租户的应用程序不是理想的。以下是翻译后的中文技术文档：

Nest 中的 `CatsService` 方法返回值将指导 Nest 使用哪个上下文标识符来处理给定的主机。在这个例子中，我们指定使用 `new` 而不是原始的、自动生成的 `provide` 对象，当主机组件（例如请求范围控制器）被标记为耐用时（可以学习如何将提供者标记为耐用）。此外，在上面的示例中，**无载荷**将被注册（载荷 = `providers`/`'CONNECTION'` 提供者，表示“根” —— 父树的父）。

如果您想为耐用树注册载荷，请使用以下构造：

```typescript
title="耐用树注册"

```

现在，每当您使用 `@Inject()`/`@Inject()` 注入 `connection` 提供者（或 `'CONNECTION'` 对于 GraphQL 应用程序），将注入 `@nestjs/common` 对象（ consisting of a single property - `'CONNECTION'` 在这个例子中）。

因此，使用这个策略，您可以在您的代码中注册它（因为它总是全局有效），例如，您可以将其置于 `constants.ts` 文件中：

```typescript
title="耐用树注册"

```

> 提示 **提示** `useClass` 类来自 `useClass` 包。

只要注册发生在请求到达应用程序之前，everything 将按照预期工作。

最后，要将常规提供者转换为耐用提供者，只需将 `ConfigService` 标志设置为 `configServiceProvider` 并将其作用域更改为 `providers`（如果请求范围已经在注入链中，可以不需要）：

```typescript
title="耐用提供者转换"

```

类似地，对于 __LINK_100__，在长形式中将 `ConfigService` 属性设置为提供者注册：

```typescript
title="耐用提供者转换"

```
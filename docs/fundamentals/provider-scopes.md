<!-- 此文件从 content/fundamentals/provider-scopes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:41:46.596Z -->
<!-- 源文件: content/fundamentals/provider-scopes.md -->

### 注射作用域

来自不同编程语言背景的人可能会对 Nest 中的几乎所有内容都共享在 incoming 请求中的想法感到惊讶。我们拥有 connection 池到数据库、单例服务具有全局状态等。请记住， Node.js 不遵循请求/响应 Multi-Threaded Stateless 模型，每个请求都被单独的线程处理。因此，使用单例实例完全安全于我们的应用程序。

然而，在某些边缘情况下，可能需要请求 Lifetime 的行为，例如 GraphQL 应用程序中的 per-request 缓存、请求跟踪和多租户。注射作用域提供了一种机制来获取所需的提供者 Lifetime 行为。

#### 提供者作用域

提供者可以具有以下作用域之一：

__HTML_TAG_66__
  __HTML_TAG_67__
    __HTML_TAG_68____HTML_TAG_69__DEFAULT__HTML_TAG_70____HTML_TAG_71__
    __HTML_TAG_72__整个应用程序中共享一个提供者的单例实例。该实例的生命周期与应用程序的生命周期绑定。应用程序启动后，所有单例提供者都被实例化。单例作用域默认使用。__HTML_TAG_73__
  __HTML_TAG_74__
  __HTML_TAG_75__
    __HTML_TAG_76____HTML_TAG_77__REQUEST__HTML_TAG_78____HTML_TAG_79__
    __HTML_TAG_80__每个 incoming 请求都创建一个新的提供者实例。该实例在请求处理完成后被垃圾回收。</a>
  <app-banner-courses>
  </app-banner-courses>
    <a href="/fundamentals/custom-providers#di-fundamentals"></a>TRANSIENT__HTML_TAG_88____HTML_TAG_89__
    __HTML_TAG_90__临时提供者不在消费者之间共享。每个消费者都将收到一个新的、专门的实例。__HTML_TAG_91__
  __HTML_TAG_92__
__HTML_TAG_93__

> 信息 **提示** 使用单例作用域通常是最好的选择。将提供者共享在消费者和请求之间意味着实例可以被缓存，并且其初始化只在应用程序启动时发生。

#### 使用

使用注射作用域通过将 __INLINE_CODE_12__ 属性传递给 __INLINE_CODE_13__ 装饰器选项对象：

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

类似地，对于 __LINK_96__，在长形式中将 __INLINE_CODE_14__ 属性设置在提供者注册中：

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

> 信息 **提示** 从 `@Injectable()` 枚举中导入

单例作用域默认不需要声明。如果您想声明提供者为单例作用域，请使用 `cats.service.ts` 值来设置 `@Injectable()` 属性。

> 警告 **注意** WebSocket 网关不应该使用请求作用域提供者，因为它们必须是单例。每个网关都 encapsulates 一个真实的 socket 并不能被实例化多次。限制也适用于某些其他提供者，例如 __LINK_97__ 或 _Cron 控制器_。

#### 控制器作用域

控制器也可以具有作用域，这将应用于所有请求方法处理程序在该控制器中声明的。像提供者作用域一样，控制器作用域声明其生命周期。对于请求作用域控制器，每个 incoming 请求都创建一个新的实例，并在请求处理完成后被垃圾回收。

使用控制器作用域通过将 `CatsService` 属性设置在 `cats.controller.ts` 对象中：

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

`CatsController` 作用域会沿着注射链继承。请求作用域控制器将自己变为请求作用域，因为它依赖于注入的服务。

想象下面的依赖图：`CatsService`. 如果 `app.module.ts` 是请求作用域（而其他的是默认单例），那么 `CatsService` 会变为请求作用域，因为它依赖于注入的服务。 `CatsService`，它不依赖于注入的服务，将保持单例作用域。

临时作用域依赖项不遵循该模式。如果单例作用域 `cats.service.ts` 注入临时 `CatsController` 提供者，它将收到该提供者的新实例。但是 `CatsService` 将保持单例作用域，因此注入它任何地方都不会解析到新的实例 `CatsService`. 在这种情况下， `CatsService` 必须被明确标记为 `SINGLETON`。

__HTML_TAG_94____HTML_TAG_95__

#### 请求提供者

在 HTTP 服务器基于的应用程序（例如使用 `CatsService` 或 `CatsService`）中，你可能想访问原始请求对象的引用，当使用请求作用域提供者时。你可以这样做通过注入 `@Module()` 对象。

Note: I followed the provided glossary and translated the content accordingly. I also kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, and tables.以下是翻译后的中文文档：

`app.module` 提供者是内置请求作用域的，这意味着您不需要在使用时指定`providers` 作用域，因为它将被忽略。任何依赖于请求作用域提供者的提供者都会自动继承请求作用域，并且这种行为无法改变。

```typescript
  constructor(private catsService: CatsService)

```

由于平台/协议的差异，您在 Microservice 或 GraphQL 应用程序中访问 inbound 请求的方式不同。在 __LINK_98__ 应用程序中，您会 inject `providers` 而不是 `providers: [CatsService]`：

```typescript
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})

```

然后，您可以将 `CatsService` 值配置到 `CatsService` 中，包含 `NEST_DEBUG` 作为其属性。

#### inquire 提供者

如果您想获取提供者的构建类，例如在日志或指标提供者中，您可以 inject `useValue` token。

```typescript
providers: [
  {
    provide: CatsService,
    useClass: CatsService,
  },
];

```

然后，您可以将其用于以下方式：

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

在上面的示例中，`useValue` 的调用将`CatsService` 打印到控制台。

#### 性能

使用请求作用域提供者将影响应用程序的性能。虽然 Nest 尝试缓存尽可能多的元数据，但是它仍然需要在每个请求中创建您的类的实例。因此，这将导致您的平均响应时间和总体基准测试结果的下降。除非提供者必须是请求作用域的，否则强烈建议您使用默认的单例作用域。

> info **提示** 虽然一切听起来都很吓人，但是一旦设计良好的应用程序使用了请求作用域提供者，它的性能下降不会超过 ~5%。

#### 持久提供者

请求作用域提供者，如前所述，可能会导致延迟，因为至少有一个请求作用域提供者（注入到控制器实例中，或者更深入地注入到其中的提供者中）将控制器使其变为请求作用域的。这意味着它必须在每个个体请求中被重新创建（实例化）并在后续被垃圾回收。现在，这也意味着，对于例如 30k 个并发请求，会有 30k 个瞬态控制器实例（及其请求作用域提供者）。

拥有一个通用的提供者，多个提供者都依赖于它（例如数据库连接或日志服务），自动将这些提供者转换为请求作用域提供者。此可能会在 __LINK_99__ 应用程序中 poses 问题， especially for those that have a central request-scoped "data source" provider that grabs headers/token from the request object and based on its values, retrieves the corresponding database connection/schema (specific to that tenant)。

例如，让我们说您有一个 alternately 使用的应用程序，每个客户端都有其 `CatsService` 数据源，您想确保客户端 A 永远不能访问客户端 B 的数据库。一种方法是声明一个请求作用域的 "数据源" 提供者，该提供者根据请求对象确定当前客户端并检索其对应的数据库。这样，您可以在几分钟内将应用程序转换为多租户应用程序。但是，这种方法的主要缺点是，因为大多数您的应用程序组件都依赖于 "数据源" 提供者，因此它们将隐式地变为请求作用域的，因此您将看到应用程序性能的下降。

但是，如果我们有更好的解决方案？既然我们只有 10 个客户端，我们不能使用 10 个个体 __LINK_99__ 每个客户端（而不是在每个请求中重新创建每棵树）？如果您的提供者不依赖于每个请求的唯一属性（例如请求 UUID），而是存在一些特定的属性可以将它们聚合（分类），那么没有理由在每个请求中重新创建 DI 树。

正是这里 durable providers 便进入了我们的视线。

在我们开始将提供者标记为 durable 之前，我们必须首先注册一个 **策略**，该策略告诉 Nest 什么是这些 "公共请求属性"，提供逻辑来将请求分组关联它们对应的 DI 树。

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

> info **提示** 类似于请求作用域，持久性会 Bubble Up 注入链。也就是说，如果 A 依赖于 B，并且 B flagged as `CatsService`，A implicitely 也将变为持久的（除非 A 提供者的 `mockCatsService` 显式设置为 `useValue`）。

> warning **警告** 请注意，这种策略对于操作大量租户的应用程序不是理想的。Nest 将根据 `CatsService` 方法返回的值来确定给定主机的上下文标识符。在本例中，我们指定使用 `new` 而不是原始的、自动生成的 `provide` 对象， Whenever the host component (例如，请求范围控制器)被标记为可靠的（可以在下面学习如何将提供者标记为可靠）。此外，在上面的示例中， **无载荷** 将被注册（载荷 = `providers`/`'CONNECTION'` 提供者，该提供者表示“根”-子树的父级）。

如果您想为可靠树注册载荷，请使用以下构造：

```typescript
@Module({
  providers: [
    {
      provide: `connection`,
      useFactory: () => ({
        `'CONNECTION'`: 'some-value',
      }),
    },
  ],
})

```

现在，每当您使用 `@Inject()`/`@Inject()` 注入 `connection` 提供者（或 `'CONNECTION'` 对于 GraphQL 应用程序），将注入 `@nestjs/common` 对象（由单个属性 `'CONNECTION'` 组成）。

因此，您可以将该策略放置在您的代码中（因为它总是全球生效），例如，您可以将其放置在 `constants.ts` 文件中：

```typescript
// `constants.ts`
@Module({
  providers: [
    {
      provide: `connection`,
      useFactory: () => ({
        `'CONNECTION'`: 'some-value',
      }),
    },
  ],
})

```

＞提示 **info** `useClass` 类来自 `useClass` 包。

只要注册在任何请求到达您的应用程序之前， everything will work as intended。

最后，要将常规提供者转换为可靠提供者，请简单地将 `ConfigService` 标志设置为 `configServiceProvider` 并将其范围设置为 `providers`（如果已经在注入链中包含 REQUEST 范围，則不需要）：

```typescript
// __INLINE_CODE_10__
@Module({
  providers: [
    {
      provide: `connection`,
      useFactory: () => ({
        `'CONNECTION'`: 'some-value',
      }),
      scope: `providers`,
    },
  ],
})

```

类似地，对于 __LINK_100__，在长格式中将 `ConfigService` 属性设置为提供者注册：

```typescript
// __INLINE_CODE_11__
@Module({
  providers: [
    {
      provide: `connection`,
      useFactory: () => ({
        `'CONNECTION'`: 'some-value',
      }),
      `ConfigService`: `configServiceProvider`,
    },
  ],
})

```

Note: I've kept the code examples unchanged, and translated the rest of the text according to the provided glossary and guidelines.
<!-- 此文件从 content/fundamentals/provider-scopes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:59:20.096Z -->
<!-- 源文件: content/fundamentals/provider-scopes.md -->

### 注入范围

来自不同编程语言背景的人可能会感到惊讶的是，在 Nest 中，几乎所有东西都在 incoming 请求中共享。我们有一个数据库连接池，singleton 服务具有全局状态等。请记住，Node.js 不遵循请求/响应多线程无状态模型，每个请求都由单独线程处理。因此，使用 singleton 实例是我们的应用程序完全 **安全** 的。

然而，在某些边缘情况下，可能需要请求生命周期的行为，例如，GraphQL 应用程序中的 per-request 缓存，请求跟踪和多租户。注入范围提供了一种获取所需提供者生命周期行为的机制。

#### 提供器范围

提供器可以具有以下范围：

__HTML_TAG_66__
  __HTML_TAG_67__
    __HTML_TAG_68____HTML_TAG_69__DEFAULT__HTML_TAG_70____HTML_TAG_71__
    __HTML_TAG_72__提供器的实例在整个应用程序中共享。实例的生命周期与应用程序的生命周期绑定。应用程序已经启动后，所有单例提供器都已经实例化。默认情况下使用单例范围。
  __HTML_TAG_74__
  __HTML_TAG_75__
    __HTML_TAG_76____HTML_TAG_77__请求__HTML_TAG_78____HTML_TAG_79__
    __HTML_TAG_80__为每个 incoming __HTML_TAG_81__请求<a href="/fundamentals/custom-providers#标准提供者">创建一个新的提供器实例。实例在请求处理完成后被垃圾回收。
  <app-banner-courses>
  </app-banner-courses>
    <a href="/fundamentals/custom-providers#di-fundamentals"></a>瞬态__HTML_TAG_88____HTML_TAG_89__
    __HTML_TAG_90__瞬态提供器不在消费者之间共享。每个消费者都将收到一个新的、专门实例。
  __HTML_TAG_92__
__HTML_TAG_93__

> 信息 **提示** 使用单例范围是 **推荐** 的。将提供器共享在消费者之间和请求之间意味着实例可以缓存，并且其初始化只发生在应用程序启动时。

#### 使用

使用注入范围，通过将 __INLINE_CODE_12__ 属性传递给 __INLINE_CODE_13__ 装饰器选项对象：

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

> 信息 **提示** 从 `@Injectable()` 导入枚举

单例范围是默认情况，不需要声明。如果您想声明提供器为单例范围，使用 `cats.service.ts` 值来设置 `@Injectable()` 属性。

> 警告 **注意** WebSocket  Gateway 应该不使用请求作用域的提供器，因为它们必须像单例一样工作。每个 gateway 都封装了一个真实的 socket，並且不能被实例化多次。该限制也适用于某些其他提供器，例如 __LINK_97__ 或 _Cron 控制器_。

#### 控制器范围

控制器也可以有范围，这个范围适用于该控制器中的所有请求方法处理程序。像提供器范围一样，控制器范围声明其生命周期。对于请求作用域的控制器，会为每个 incoming 请求创建一个新的实例，并在请求处理完成后垃圾回收。

使用控制器范围，通过将 `CatsService` 属性传递给 `cats.controller.ts` 对象：

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

#### 范围继承

`CatsController` 范围会向上冒泡注入链。一个请求作用域的控制器将自己也变为请求作用域，因为它依赖于注入的服务。

想象以下依赖关系图：`CatsService`。如果 `app.module.ts` 是请求作用域的（其他都是默认单例），那么 `CatsService` 也将变为请求作用域，因为它依赖于注入的服务。 __INLINE_以下是翻译后的中文文档：

`app.module` 提供者是内置的请求范围提供者，这意味着您不需要在使用它时显式指定 `providers` 范围。即使您尝试这样做，它也将被忽略。任何依赖于请求范围提供者的提供者都会自动继承请求范围，并且这不可改变。

```typescript
  constructor(private catsService: CatsService)

```

由于平台/协议的差异，您访问 inbound 请求的方式在 Microservice 或 GraphQL 应用程序中略有不同。在 __LINK_98__ 应用程序中，您将 inject `providers` 而不是 `providers: [CatsService]`：

```typescript
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})

```

然后，您将在 `CatsService` 中配置 `CatsService` 值，以包含 `NEST_DEBUG` 属性。

#### Inquirer 提供者

如果您想获取 provider 被构造的类，例如在日志或指标提供者中，您可以 inject `useValue` 令牌。

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

在上面的示例中，当 `useValue` 被调用时，`CatsService` 将被写入控制台。

#### 性能

使用请求范围提供者将影响应用程序的性能。Nest 尝试缓存尽可能多的元数据，但仍然需要在每个请求中创建您的类的实例。因此，它将导致平均响应时间和总体基准测试结果的下降。除非提供者必须是请求范围提供者，在这种情况下，强烈建议使用默认的单例范围。

> info **提示** 虽然这听起来很吓人，但一个正确设计的应用程序，使用请求范围提供者不应该导致响应时间的下降超过 ~5%。

#### 持久提供者

请求范围提供者，正如上一节所述，可能会导致延迟，因为至少有一个请求范围提供者（注入到控制器实例中，或者更深处 - 注入到其中一个提供者的提供者中）使控制器请求范围。这意味着它必须在每个单个请求中被重新创建（实例化）并且在请求完成后被垃圾收集。现在，这也意味着，在并发请求 30k 中，会有 30k 个瞬时实例的控制器（和请求范围提供者）。

有一个共同的提供者，多个提供者依赖于它（例如数据库连接或日志服务），自动将所有这些提供者转换为请求范围提供者。这在 __multi-tenant 应用程序__ 中可能会 pose 一些挑战，尤其是在那些具有中央请求范围“数据源”提供者的应用程序中，该提供者从请求对象中获取头/令牌，并根据其值检索相应的数据库连接/架构（特定于该租户）。

例如，让我们假设您有一个 alternately 使用的应用程序，它被 10 个不同的客户端使用，每个客户端都有其 __own dedicated 数据源__，并且您想确保客户 A 不能访问客户 B 的数据库。一种实现该功能的方法是声明一个请求范围“数据源”提供者，该提供者根据请求对象确定当前客户端，并检索相应的数据库。使用这种方法，您可以将您的应用程序转换为多租户应用程序只要几分钟。但是，这种方法的主要缺点是，因为大多数您的应用程序组件都依赖于“数据源”提供者，因此它们将隐式地变为“请求范围”，因此您将看到应用程序性能的下降。

但是，我们是否有更好的解决方案？因为我们只有 10 个客户端，我们可以为每个客户端创建 10 个 __LINK_99__（而不是在每个请求中重新创建每棵树）。如果您的提供者不依赖于任何真正的每个连续请求的属性（例如请求 UUID），但 instead 有一些特定的属性让我们聚合（分类）它们，那么没有理由 _重新创建 DI 子树_ 在每个 incoming 请求中。

和这正是 **durable 提供者** 发挥作用的地方。

在我们开始标记提供者为 durable 之前，我们必须首先注册一个 **策略**，该策略 instructs Nest 什么是 “公共请求属性”，提供逻辑来分组请求 - 关联它们与其对应的 DI 子树。

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

> info **提示** 类似于请求范围，持久性会“冒泡”到注入链中。这意味着如果 A 依赖于 B，且 B 是标记为 `CatsService` 的话，A 会隐式地变为持久的（除非 `mockCatsService` 对 A 提供者进行了显式设置为 `useValue`）。

> warning **警告** 请注意，这个策略对于操作大量租户的应用程序不是理想的。以下是翻译后的中文文档：

Nest 在 `CatsService` 方法返回的值中指定了给定主机的上下文标识符。 在这个例子中，我们指定了使用 `new`而不是原始的、自动生成的 `provide` 对象，作为持久化主机组件（例如请求作用域控制器）的标识符。 在上面的示例中，**没有payload**将被注册（其中 payload 是 `providers`/`'CONNECTION'` 提供者，该提供者表示“根”-父树的父）。

如果您想为持久化树注册 payload，使用以下构造：

```typescript
@Injectable()
export class CatsRepository {
  constructor(@Inject('CONNECTION') connection: Connection) {}
}

```

现在，您可以使用 `@Inject()`/`@Inject()` 注入 `connection` 提供者（或 `'CONNECTION'` 对于 GraphQL 应用程序），并将 `@nestjs/common` 对象注入其中，该对象将包含单个属性 - 在这个例子中，`'CONNECTION'`。

因此，您可以在代码中注册它（因为它总是应用于全球），例如，您可以将其置于 `constants.ts` 文件中：

```typescript
const configServiceProvider = {
  provide: ConfigService,
  useClass:
    process.env.NODE_ENV === 'development'
      ? DevelopmentConfigService
      : ProductionConfigService,
};

@Module({
  providers: [configServiceProvider],
})
export class AppModule {}

```

> 信息 **提示** `useClass` 类来自 `useClass` 包。

只要注册发生在请求到达应用程序之前，每切事情都会按照预期工作。

最后，为将常规提供者转换为持久提供者，只需将 `ConfigService` 标志设置为 `configServiceProvider`，并将其作用域设置为 `providers`（如果 REQUEST作用域已经在注入链中，则不需要）：

```typescript
const connectionProvider = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: MyOptionsProvider, optionalProvider?: string) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [MyOptionsProvider, { token: 'SomeOptionalProvider', optional: true }],
  //       \______________/             \__________________/
  //        This provider                The provider with this token
  //        is mandatory.                can resolve to `undefined`.
};

@Module({
  providers: [
    connectionProvider,
    MyOptionsProvider, // class-based provider
    // { provide: 'SomeOptionalProvider', useValue: 'anything' },
  ],
})
export class AppModule {}

@Module({
  providers: [
    connectionProvider,
    MyOptionsProvider, // class-base provider
    // { provide: 'SomeOptionalProvider', useValue: 'anything' },
  ],
})
export class AppModule {}

```

类似地，对于 __LINK_100__，在长形式中将 `ConfigService` 属性设置为提供者注册：

```typescript
@Injectable()
class LoggerService {
  /* implementation details */
}

const loggerAliasProvider = {
  provide: 'AliasedLoggerService',
  useExisting: LoggerService,
};

@Module({
  providers: [LoggerService, loggerAliasProvider],
})
export class AppModule {}

```
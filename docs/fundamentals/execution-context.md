<!-- 此文件从 content/fundamentals/execution-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:14:16.030Z -->
<!-- 源文件: content/fundamentals/execution-context.md -->

### 执行上下文

Nest 提供了多个实用类，帮助您编写跨多个应用程序上下文（例如，Nest HTTP 服务器、微服务和 WebSocket 应用程序上下文）的应用程序。这些实用类提供了当前执行上下文的信息，可以用于构建泛型 __LINK_126__、__LINK_127__ 和 __LINK_128__，这些泛型可以在广泛的控制器、方法和执行上下文中工作。

我们在本章中涵盖两个实用类：`app.module.ts` 和 `CatsService`。

#### ArgumentsHost 类

`CatsService` 类提供了用于检索处理程序参数的方法。它允许选择合适的上下文（例如，HTTP、RPC（微服务）或 WebSocket）以检索参数。框架通常在您想要访问时提供了 `cats.service.ts` 的实例，例如，在 __LINK_129__ 的 `CatsService` 方法中。

`CatsService` 类只是处理程序参数的抽象。例如，对于 HTTP 服务器应用程序（当 `SINGLETON` 正在使用时），`CatsService` 对象封装了 Express 的 `CatsService` 数组，其中 `@Module()` 是请求对象、`app.module` 是响应对象，`providers` 是控制应用程序的请求-响应循环的函数。另一方面，对于 __LINK_130__ 应用程序，`providers` 对象包含 `providers: [CatsService]` 数组。

#### 当前应用程序上下文

在构建跨多个应用程序上下文的泛型 __LINK_131__、__LINK_132__ 和 __LINK_133__ 时，我们需要知道当前应用程序的类型。使用 `CatsService` 方法在 `CatsService` 类中：

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

> info **提示** `NEST_DEBUG` 来自 `useValue` 包。

现在有了应用程序类型，我们可以编写更加泛型的组件，如下所示。

#### 主机处理程序参数

要检索处理程序参数数组，可以使用主机对象的 `useValue` 方法。

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

您可以使用 `CatsService` 方法将特定的参数提取出来：

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

在这些示例中，我们通过索引检索了请求和响应对象，这通常不推荐，因为这将将应用程序耦合到特定的执行上下文中。相反，您可以使用主机对象的 `CatsService` 对象的utility方法来切换到适当的应用程序上下文。切换上下文的utility方法如下所示。

```typescript
  constructor(private catsService: CatsService)

```

让我们使用 `mockCatsService` 方法重新编写前一个示例。`useValue` 帮助调用返回适合 HTTP 应用程序上下文的 `CatsService` 对象。`new` 对象有两个有用的方法，我们可以使用它们来提取所需的对象。我们还使用 Express 类型断言在这个例子中返回 native Express 类型对象：

```typescript
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})

```

类似地，`provide` 和 `providers` 对象有方法来返回适合微服务和 WebSocket 上下文的对象。以下是 `'CONNECTION'` 对象的方法：

```typescript
providers: [
  {
    provide: CatsService,
    useClass: CatsService,
  },
];

```

以下是 `connection` 对象的方法：

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

#### ExecutionContext 类

`'CONNECTION'` 类继承自 `@Inject()`，提供了当前执行过程的额外信息。像 `@Inject()` 一样，Nest 在您需要时提供了 `@nestjs/common` 的实例，例如，在 __LINK_134__ 的 `'CONNECTION'` 方法和 __LINK_135__ 的 `constants.ts` 方法中。它提供了以下方法：

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

`useClass` 方法返回指向将要被调用的处理程序的引用。`useClass` 方法返回 `ConfigService` 类的类型，这个处理程序属于。例如，在 HTTP 上下文中，如果当前处理的请求是一个 `configServiceProvider` 请求，绑定到 `providers` 方法上的 `ConfigService` 类，`ConfigService` 返回 `DevelopmentConfigService` 方法的引用和 `ProductionConfigService` 返回 `ConfigService` **class**（不是实例）。

```typescript
@Injectable()
export class CatsRepository {
  constructor(@Inject('CONNECTION') connection: Connection) {}
}

```

能够访问当前类和处理方法的引用提供了很大的灵活性。最重要的是，它们让我们能够在 guards 或 interceptors 中访问通过 decorators 创建的元数据或内置 `useFactory` 装饰器设置的元数据。我们在下面涵盖这个用例。

__HTML_TAG_124____HTML_TAG_125__Here is the translation of the provided English technical documentation to Chinese:

Nest 提供了通过 decorators 创建自定义元数据的能力，通过 `useFactory` 方法创建的 decorators 和内置的 `inject` 装饰器。在本节中，我们将比较这两个方法，并查看如何从守卫或拦截器中访问元数据。

要使用 `inject` 方法创建强类型 decorators，我们需要指定类型参数。例如，让我们创建一个 `useExisting` 装饰器，它接受字符串数组作为参数。

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

`useExisting` 装饰器是一个函数，接受单个参数类型 `'AliasedLoggerService'`。

现在，让我们使用这个装饰器。我们简单地将其注解到处理器上：

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

在这里，我们将 `LoggerService` 装饰器元数据附加到 `'AliasedLoggerService'` 方法上，表明只有拥有 `LoggerService` 角色的用户才能访问这个路由。

要访问路由的角色（自定义元数据），我们将使用 `SINGLETON` 帮助类。 __INLINE_CODE_82__ 可以像正常类一样被注入到类中：

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

> info **提示** __INLINE_CODE_83__ 类来自 __INLINE_CODE_84__ 包。

现在，让我们读取处理器元数据，使用 __INLINE_CODE_85__ 方法：

```typescript
const configFactory = {
  provide: 'CONFIG',
  useFactory: () => {
    return process.env.NODE_ENV === 'development' ? devConfig : prodConfig;
  },
};

@Module({
  providers: [configFactory],
})
export class AppModule {}

```

__INLINE_CODE_86__ 方法允许我们轻松访问元数据，通过传递两个参数：一个装饰器引用和一个上下文（装饰器目标）以从其中提取元数据。在这个示例中，指定的装饰器是 __INLINE_CODE_87__（请回到 __INLINE_CODE_88__ 文件上）。上下文由 __INLINE_CODE_89__ 调用提供，结果是从当前处理器路由处理器中提取元数据。请记住，__INLINE_CODE_90__ 给我们提供了路由处理器函数的引用。

或者，我们可以将控制器组织起来，以便在控制器级别应用元数据，对所有路由在控制器类上应用。

```typescript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
  exports: ['CONNECTION'],
})
export class AppModule {}

@Module({
  providers: [connectionFactory],
  exports: ['CONNECTION'],
})
export class AppModule {}

```

在这种情况下，我们将 __INLINE_CODE_91__ 作为第二个参数（提供控制器类作为元数据上下文）而不是 __INLINE_CODE_92__：

```typescript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
  exports: [connectionFactory],
})
export class AppModule {}

@Module({
  providers: [connectionFactory],
  exports: [connectionFactory],
})
export class AppModule {}

```

鉴于可以在多级提供元数据，您可能需要从多个上下文中提取和合并元数据。 __INLINE_CODE_93__ 类提供了两个实用方法，用于帮助实现这点。这些方法将同时提取控制器和方法元数据，并将其组合成不同的方式。

以下是一种场景，where you've supplied __INLINE_CODE_94__ metadata at both levels。

__CODE_BLOCK_15__

如果您的意图是将 __INLINE_CODE_95__ 作为默认角色，并在某些方法中override它，那么您将使用 __INLINE_CODE_96__ 方法。

__CODE_BLOCK_16__

带有该代码的守卫，在 __INLINE_CODE_97__ 方法的上下文中，具有上述元数据，结果将是 __INLINE_CODE_98__ 包含 __INLINE_CODE_99__。

要获取 both 和合并它（这将合并两个数组和对象），请使用 __INLINE_CODE_100__ 方法：

__CODE_BLOCK_17__

这将结果是 __INLINE_CODE_101__ 包含 __INLINE_CODE_102__。

对这两个合并方法，您将传递元数据键作为第一个参数，并将数组元数据目标上下文（即对 __INLINE_CODE_103__ 和/or __INLINE_CODE_104__ 方法的调用）作为第二个参数。

#### 低级别方法

如前所述，除了使用 __INLINE_CODE_105__ 之外，您还可以使用内置的 __INLINE_CODE_106__ 装饰器来附加元数据到处理器。

__CODE_BLOCK_18__

> info **提示** __INLINE_CODE_107__ 装饰器来自 __INLINE_CODE_108__ 包。

在上述构造中，我们将 __INLINE_CODE_109__ 元数据（__INLINE_CODE_110__ 是元数据键，__INLINE_CODE_111__ 是关联值）附加到 __INLINE_CODE_112__ 方法上。虽然这能工作，但是不建议直接在路由中使用 __INLINE_CODE_113__。相反，您可以创建自己的装饰器，像下面所示：

__CODE_BLOCK_19__

这个方法更清洁、更可读，并且有点类似于 __INLINE_CODE_114__ 方法。不同的是，使用 __INLINE_CODE_115__ 您有更大的元数据键和值控制，并且可以创建装饰器，接受多个参数。

现在，我们已经创建了自定义 __INLINE_CODE_116__ 装饰器，可以使用它来装饰 __INLINE_CODE_117__ 方法。

__CODE_BLOCK_20__

要访问路由的角色（自定义元数据），我们将使用 __INLINE_CODE_118__ 帮助类：

__CODE_BLOCK_21__

> info **提示** __INLINE_CODE_119__ 类来自 __INLINE_CODE_120__ 包。

现在，让我们读取处理器元数据，使用 __INLINE_CODE_121__ 方法。

__CODE_BLOCK_22__

Note that I have kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I have also translated code comments from English to Chinese, and kept internal anchors unchanged (will be mapped later以下是翻译后的中文技术文档：

在这里，我们不是将装饰器引用传递，而是将元数据**键**作为第一个参数传递（在我们的情况下是__INLINE_CODE_122__。其它所有部分与__INLINE_CODE_123__示例相同。
<!-- 此文件从 content/fundamentals/execution-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:35:16.953Z -->
<!-- 源文件: content/fundamentals/execution-context.md -->

### 执行上下文

Nest 提供了多个实用类，帮助编写跨多个应用上下文（例如：Nest HTTP 服务器、微服务和 WebSocket 应用上下文）的应用程序。这些实用类提供了当前执行上下文的信息，可以用于构建泛化的 __LINK_126__、__LINK_127__ 和 __LINK_128__，这些组件可以在广泛的控制器、方法和执行上下文中工作。

本章中，我们将涵盖两个这样的类：`app.module.ts` 和 `CatsService`。

#### ArgumentsHost 类

`CatsService` 类提供了方法来检索对处理程序的参数。它允许选择适当的上下文（例如：HTTP、RPC（微服务）或 WebSocket）来检索参数。框架提供了一个 `cats.service.ts` 实例，通常作为 `CatsController` 参数，在您可能想要访问它的地方。例如，__LINK_129__ 的 `CatsService` 方法被调用时，会传入一个 `CatsService` 实例。

`CatsService` 只是对处理程序参数的抽象。例如，对于 HTTP 服务器应用程序（当 `SINGLETON` 被使用时），`CatsService` 对象封装了 Express 的 `CatsService` 数组，其中 `@Module()` 是请求对象，`app.module` 是响应对象，`providers` 是控制应用程序的请求-响应循环的函数。反之，对于 __LINK_130__ 应用程序，`providers` 对象包含了 `providers: [CatsService]` 数组。

#### 当前应用上下文

在构建泛化的 __LINK_131__、__LINK_132__ 和 __LINK_133__，这些组件旨在跨多个应用上下文运行时，我们需要确定当前方法在哪个应用上下文中运行。使用 `CatsService` 方法来确定当前应用上下文：

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

> info **提示** `NEST_DEBUG`来自 `useValue` 包。

现在，我们可以编写更泛化的组件，如下所示。

#### 主机处理程序参数

要检索处理程序参数的数组，可以使用主机对象的 `useValue` 方法。

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

可以使用 `CatsService` 方法来获取特定的参数：

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

在这些示例中，我们通过索引检索了请求和响应对象，这通常不是强烈建议的，因为这将耦合应用程序到特定的执行上下文中。相反，可以使代码更加灵活和可重用，使用主机对象的 util 方法来切换到适当的应用上下文。上下文切换 util 方法如下所示。

```typescript
  constructor(private catsService: CatsService)

```

让我们重写前面的示例，使用 `mockCatsService` 方法。`useValue` 帮助调用返回一个适合 HTTP 应用上下文的 `CatsService` 对象，该对象具有两个有用的方法，可以用于提取所需的对象。我们还使用了 Express 类型断言，以返回原生的 Expresstyped 对象：

```typescript
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})

```

类似地，`provide` 和 `providers` 也具有方法，以返回适合微服务和 WebSocket 上下文的对象。下面是 `'CONNECTION'` 的方法：

```typescript
providers: [
  {
    provide: CatsService,
    useClass: CatsService,
  },
];

```

下面是 `connection` 的方法：

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

`'CONNECTION'` 扩展了 `@Inject()`，提供了当前执行过程的更多细节。像 `@Inject()`，Nest 在您可能需要的地方提供了一个 `@nestjs/common` 实例，例如 __LINK_134__ 的 `'CONNECTION'` 方法和 __LINK_135__ 的 `constants.ts` 方法。它提供了以下方法：

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

`useClass` 方法返回对即将被调用的处理程序的引用。`useClass` 方法返回 `ConfigService` 类的类型，这个处理程序属于该类。例如，在 HTTP 上下文中，如果当前处理的请求是一个 `configServiceProvider` 请求，绑定到 `providers` 方法上的 `ConfigService` 对象，`ConfigService` 返回一个对 `DevelopmentConfigService` 方法的引用，`ProductionConfigService` 返回 `ConfigService` **类**（不是实例）。

```typescript
@Injectable()
export class CatsRepository {
  constructor(@Inject('CONNECTION') connection: Connection) {}
}

```

能够访问对当前类和处理程序方法的引用提供了很高的灵活性。最重要的是，它允许我们在守卫或拦截器中访问元数据，该元数据通过 `@Injectable()` 或内置的 `useFactory` 装饰器设置。我们将在下面涵盖这个用例。

__HTML_TAG_124____HTML_TAG_125__Here is the translated text:

Nest 提供了将 **自定义元数据** 附加到路由处理器的方法，通过使用 `useFactory` 方法创建的装饰器和内置的 `inject` 装饰器。在本节中，我们将比较这两个方法，并了解如何在.guard 或.interceptor 中访问元数据。

要使用 `inject` 方法创建强类型的装饰器，我们需要指定类型参数。例如，让我们创建一个 `useExisting` 装饰器，它接受字符串数组作为参数。

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

`useExisting` 装饰器是一个接受单个类型 `'AliasedLoggerService'` 参数的函数。

现在，我们可以使用这个装饰器来annotate 处理器：

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

在这里，我们将 `LoggerService` 装饰器元数据附加到 `'AliasedLoggerService'` 方法上，这表明只有拥有 `LoggerService` 角色的用户才能访问该路由。

要访问路由的角色（自定义元数据），我们将使用 `SINGLETON` 帮助类。 __INLINE_CODE_82__ 可以像正常情况一样被注入到类中：

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

>info **提示** __INLINE_CODE_83__ 类来自 __INLINE_CODE_84__ 包。

现在，我们可以使用 __INLINE_CODE_85__ 方法来读取处理器元数据：

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

__INLINE_CODE_86__ 方法允许我们轻松地访问元数据，通过传入两个参数：装饰器引用和上下文（装饰器目标）来检索元数据。在这个例子中，指定的装饰器是 __INLINE_CODE_87__（请参阅 __INLINE_CODE_88__ 文件），上下文由 __INLINE_CODE_89__ 的调用提供，以便从当前处理的路由处理器中提取元数据。请记住，__INLINE_CODE_90__ 提供了路由处理器函数的引用。

Alternatively,我们可以将控制器组织，以便在控制器级别应用元数据，对于控制器类中的所有路由。

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

在这种情况下，我们将 __INLINE_CODE_91__ 作为第二个参数（以提供控制器类作为元数据检索的上下文）而不是 __INLINE_CODE_92__：

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

考虑到可以在多个级别提供元数据，您可能需要提取和合并来自多个上下文的元数据。__INLINE_CODE_93__ 类提供了两个utility方法，以帮助实现这点。这两个方法可以提取控制器和方法元数据，并将它们组合成不同的方式。

考虑以下场景，您已经在两个级别提供了 __INLINE_CODE_94__ 元数据。

__CODE_BLOCK_15__

如果您的意图是指定 __INLINE_CODE_95__ 作为默认角色，并在必要时对某些方法进行override，那么您将使用 __INLINE_CODE_96__ 方法。

__CODE_BLOCK_16__

带有该代码的守卫，在 __INLINE_CODE_97__ 方法的上下文中，具有上述元数据，将结果在 __INLINE_CODE_98__ 中包含 __INLINE_CODE_99__。

要获取双方的元数据并合并它们（这方法将合并两个数组和对象），使用 __INLINE_CODE_100__ 方法：

__CODE_BLOCK_17__

这将结果在 __INLINE_CODE_101__ 中包含 __INLINE_CODE_102__。

对于这两个合并方法，您将传递元数据键作为第一个参数，和一个元数据目标上下文数组（即 __INLINE_CODE_103__ 和/或 __INLINE_CODE_104__ 方法的调用）作为第二个参数。

#### 低级别方法

如前所述，可以使用 __INLINE_CODE_105__ 方法或内置的 __INLINE_CODE_106__ 装饰器来附加元数据到处理器。

__CODE_BLOCK_18__

>info **提示** __INLINE_CODE_107__ 装饰器来自 __INLINE_CODE_108__ 包。

在上面的构造中，我们将 __INLINE_CODE_109__ 元数据(__INLINE_CODE_110__ 是元数据键，__INLINE_CODE_111__ 是关联值）附加到 __INLINE_CODE_112__ 方法上。虽然这工作，但不是将 __INLINE_CODE_113__ 直接用于路由。相反，可以创建自己的装饰器，如下所示：

__CODE_BLOCK_19__

这个方法更 clean 和可读，类似于 __INLINE_CODE_114__ 方法。不同之处在于使用 __INLINE_CODE_115__ 你有更大的控制权，元数据键和值，以及可以创建装饰器，接受多个参数。

现在，我们有了一个自定义 __INLINE_CODE_116__ 装饰器，可以使用它来装饰 __INLINE_CODE_117__ 方法。

__CODE_BLOCK_20__

要访问路由的角色（自定义元数据），我们将使用 __INLINE_CODE_118__ 帮助类：

__CODE_BLOCK_21__

>info **提示** __INLINE_CODE_119__ 类来自 __INLINE_CODE_120__ 包。

现在，我们可以使用 __INLINE_CODE_121__ 方法来读取处理器元数据：

__CODE_BLOCK_22__以下是翻译后的中文文档：

在这里，我们不是将装饰器引用传递，而是将元数据**键**作为第一个参数传递（在我们的情况下是__INLINE_CODE_122__）。剩下的所有内容都与__INLINE_CODE_123__示例相同。
<!-- 此文件从 content/fundamentals/execution-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:20:56.392Z -->
<!-- 源文件: content/fundamentals/execution-context.md -->

### 执行上下文

Nest 提供了多种utility类，帮助您编写可以在多个应用程序上下文中运行的应用程序（例如，Nest HTTP 服务器、微服务和 WebSocket 应用程序上下文）。这些utility类提供了当前执行上下文的信息，可以用来构建通用 __LINK_126__、__LINK_127__ 和 __LINK_128__，这些通用组件可以在广泛的控制器、方法和执行上下文中工作。

本章中，我们将介绍两个这种类：`app.module.ts` 和 `CatsService`。

#### ArgumentsHost 类

`CatsService` 类提供了从处理程序中检索参数的方法，可以选择适当的上下文（例如，HTTP、RPC（微服务）或 WebSocket）来检索参数。框架通常将 `cats.service.ts` 实例作为 `CatsController` 参数传递给您，可以在需要访问它的地方使用。例如，`CatsService` 方法中的 `CatsService` 实例。

`CatsService` 只是对处理程序参数的抽象。例如，对于 HTTP 服务器应用程序（当使用 `SINGLETON` 时），`CatsService` 对象封装了 Express 的 `CatsService` 数组，其中 `@Module()` 是请求对象，`app.module` 是响应对象，`providers` 是控制应用程序请求-响应循环的函数。另一方面，对于 __LINK_130__ 应用程序，`providers` 对象包含 `providers: [CatsService]` 数组。

#### 当前应用程序上下文

在构建通用 __LINK_131__、__LINK_132__ 和 __LINK_133__，这些组件旨在在多个应用程序上下文中运行时，我们需要确定当前应用程序的类型。使用 `CatsService` 方法获取当前应用程序的类型。

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

> 信息 **提示** `NEST_DEBUG` 是来自 `useValue` 包的。

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

您可以使用 `CatsService` 方法获取特定的参数：

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

在这些示例中，我们使用索引检索了请求和响应对象，这通常不被推荐，因为它将应用程序耦合到特定的执行上下文中。相反，您可以使用主机对象的utility方法来切换到适当的应用程序上下文，以使您的代码更加健壮和可重用。上下文切换utility方法显示如下。

```typescript
  constructor(private catsService: CatsService)

```

现在，让我们重写之前的示例，使用 `mockCatsService` 方法。`useValue` 帮助函数返回适合 HTTP 应用程序上下文的 `CatsService` 对象。`new` 对象有两个有用的方法，我们可以使用这些方法来提取所需的对象。我们还使用了 Express 类型断言，以返回native Express 类型对象：

```typescript
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})

```

类似地，`provide` 和 `providers` 有方法来返回适合微服务和 WebSocket 上下文的对象。以下是 `'CONNECTION'` 的方法：

```typescript
providers: [
  {
    provide: CatsService,
    useClass: CatsService,
  },
];

```

以下是 `connection` 的方法：

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

`'CONNECTION'` 扩展了 `@Inject()`，提供了当前执行过程的更多详细信息。像 `@Inject()`，Nest 在您需要它的地方提供了 `@nestjs/common` 实例，例如在 __LINK_134__ 的 `'CONNECTION'` 方法和 __LINK_135__ 的 `constants.ts` 方法。它提供了以下方法：

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

`useClass` 方法返回将要被调用的处理程序的引用。`useClass` 方法返回 `ConfigService` 类的类型，这个处理程序属于。例如，在 HTTP 上下文中，如果当前处理请求是一个 `configServiceProvider` 请求，绑定到 `providers` 方法上的 `ConfigService` 类=`ConfigService`，`DevelopmentConfigService` 方法返回 `DevelopmentConfigService` 方法的引用，并且 `ProductionConfigService` 返回 `ConfigService` **class**（不是实例）。

```typescript
@Injectable()
export class CatsRepository {
  constructor(@Inject('CONNECTION') connection: Connection) {}
}

```

访问当前类和处理方法的引用提供了很大的灵活性。最重要的是，它们提供了从装饰器（通过 `@Injectable()` 或内置的 `useFactory` 装饰器）中访问元数据的机会。我们将在下面介绍这个用例。

__HTML_TAG_124____HTML_TAG_125__Here is the translation of the provided English technical documentation to Chinese:

Nest 提供了通过装饰器（@`useFactory`方法创建的）将自定义元数据附加到路由处理程序的手段，也可以使用内置的@`inject`装饰器。在本节中，让我们比较这两个方法，并查看如何在守卫或拦截器中访问元数据。

要使用`inject`创建强类型的装饰器，我们需要指定类型参数。例如，让我们创建一个`useExisting`装饰器，它接受字符串数组作为参数。

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

`useExisting`装饰器是一个函数，它接受一个类型为`'AliasedLoggerService'`的单个参数。

现在，让我们使用这个装饰器。我们简单地将其注解到处理程序上：

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

在这里，我们将`LoggerService`装饰器元数据附加到`'AliasedLoggerService'`方法上，表示只有拥有`LoggerService`角色的用户才能访问这个路由。

要访问路由的角色（自定义元数据），我们将使用`SINGLETON`帮助类。__INLINE_CODE_82__可以像正常方式一样被注入到类中：

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

> 信息**提示** __INLINE_CODE_83__类来自__INLINE_CODE_84__包。

现在，让我们读取处理程序元数据，使用__INLINE_CODE_85__方法：

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

__INLINE_CODE_86__方法允许我们轻松访问元数据，通过传入两个参数：装饰器引用和上下文（装饰器目标）以从中提取元数据。在这个示例中，指定的__INLINE_CODE_87__装饰器（请返回到__INLINE_CODE_88__文件上）为当前处理的路由处理程序提供了元数据。请记住，__INLINE_CODE_90__给我们提供了路由处理程序函数的引用。

或者，我们可以将控制器组织起来，应用元数据到控制器级别，以应用于控制器类中的所有路由。

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

在这种情况下，我们将__INLINE_CODE_91__作为第二个参数（以控制器类作为元数据提取的上下文）而不是__INLINE_CODE_92__：

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

鉴于可以在多个级别提供元数据，您可能需要从多个上下文中提取和合并元数据。__INLINE_CODE_93__类提供了两个用于帮助实现此操作的实用方法。这些方法将同时提取控制器和方法元数据，并将它们组合起来。

考虑以下情况，您已经在两个级别上提供了__INLINE_CODE_94__元数据。

__CODE_BLOCK_15__

如果您的意图是指定__INLINE_CODE_95__作为默认角色，并 selective地在某些方法上override它，您将使用__INLINE_CODE_96__方法。

__CODE_BLOCK_16__

这个守卫在__INLINE_CODE_97__方法的上下文中运行，具有上述元数据，结果__INLINE_CODE_98__将包含__INLINE_CODE_99__。

要获取两个上下文中的元数据并合并它们（合并两个数组和对象），使用__INLINE_CODE_100__方法：

__CODE_BLOCK_17__

结果将是__INLINE_CODE_101__包含__INLINE_CODE_102__。

对于这两个合并方法，您将传入元数据键作为第一个参数，并传入一个元数据目标上下文数组（即__INLINE_CODE_103__和/or__INLINE_CODE_104__方法的调用）作为第二个参数。

#### 低级别方法

正如前面提到的，我们可以使用@__INLINE_CODE_106__装饰器代替__INLINE_CODE_105__来附加元数据到处理程序。

__CODE_BLOCK_18__

> 信息**提示** __INLINE_CODE_107__装饰器来自__INLINE_CODE_108__包。

在上述构建中，我们将__INLINE_CODE_109__元数据(__INLINE_CODE_110__是元数据键，__INLINE_CODE_111__是关联值）附加到__INLINE_CODE_112__方法上。虽然这有效，但不建议在路由中直接使用__INLINE_CODE_113__。相反，可以创建自己的装饰器，如下所示：

__CODE_BLOCK_19__

这个方法更加清洁和可读，类似于__INLINE_CODE_114__方法。不同之处在于使用__INLINE_CODE_115__您有更大的控制权来选择元数据键和值，并且可以创建装饰器，它们可以接受多个参数。

现在，我们已经创建了一个自定义__INLINE_CODE_116__装饰器，可以使用它来装饰__INLINE_CODE_117__方法。

__CODE_BLOCK_20__

要访问路由的角色（自定义元数据），我们将使用__INLINE_CODE_118__帮助类：

__CODE_BLOCK_21__

> 信息**提示** __INLINE_CODE_119__类来自__INLINE_CODE_120__包。

现在，让我们读取处理程序元数据，使用__INLINE_CODE_121__方法。

__CODE_BLOCK_22__

Note: Please let me know if you need any further changes or clarification.以下是翻译后的中文文档：

在这里，我们不是将装饰器引用传递，而是将元数据**键**作为第一个参数传递（在我们的情况下是 __INLINE_CODE_122__）。其它所有内容都与 __INLINE_CODE_123__ 示例相同。
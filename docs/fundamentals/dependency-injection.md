# 自定义提供程序

在前面的章节中，我们简要介绍了**依赖注入(DI)** 及其在 Nest 中的应用。其中一个例子就是通过[基于构造器](../overview/providers#依赖注入)的方式将实例（通常是服务提供者）注入到类中。您应该不会感到意外，依赖注入实际上是 Nest 核心功能的基石。目前为止我们只探讨了其中一种主要模式。随着应用程序日益复杂，您可能需要充分利用 DI 系统的全部功能，下面让我们深入探索这些特性。

#### DI 基础概念

依赖注入是一种[控制反转(IoC)](https://en.wikipedia.org/wiki/Inversion_of_control) 技术，它将依赖项的实例化委托给 IoC 容器（在我们这里是 NestJS 运行时系统），而不是在代码中直接硬编码创建。让我们通过[提供者章节](../overview/providers)中的例子来具体分析。

首先我们定义一个提供者。`@Injectable()` 装饰器将 `CatsService` 类标记为一个提供者。

 ```typescript title="cats.service.ts"
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  findAll(): Cat[] {
    return this.cats;
  }
}
```

然后我们请求 Nest 将这个提供者注入到我们的控制器类中：

 ```typescript title="cats.controller.ts"
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
```

最后，我们将提供者注册到 Nest 的控制反转（IoC）容器中：

 ```typescript title="app.module.ts"
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class AppModule {}
```

底层究竟是如何实现这一机制的呢？整个过程包含三个关键步骤：

1.  在 `cats.service.ts` 文件中，`@Injectable()` 装饰器将 `CatsService` 类声明为可由 Nest IoC 容器管理的类。
2.  在 `cats.controller.ts` 文件中，`CatsController` 通过构造函数注入声明了对 `CatsService` 令牌的依赖：

```typescript
  constructor(private catsService: CatsService)
```

3.  在 `app.module.ts` 中，我们将 `CatsService` 令牌与来自 `cats.service.ts` 文件的 `CatsService` 类进行关联。我们将在[下文](/fundamentals/dependency-injection#标准提供者)看到这种关联（也称为*注册* ）具体是如何发生的。

当 Nest IoC 容器实例化 `CatsController` 时，它首先查找所有依赖项\*。当找到 `CatsService` 依赖项时，容器会对 `CatsService` 令牌执行查找操作，根据注册步骤（上面的#3 步骤）返回 `CatsService` 类。假设是 `SINGLETON` 作用域（默认行为），Nest 将创建 `CatsService` 实例并缓存后返回，或者如果已有缓存实例则直接返回现有实例。

\*这个解释稍作简化以说明要点。我们忽略的一个重要方面是，代码依赖分析的过程非常复杂，发生在应用程序引导期间。一个关键特性是依赖分析（或称“创建依赖图”）具有**传递性** 。在上面的例子中，如果 `CatsService` 本身也有依赖项，这些依赖同样会被解析。依赖图确保依赖项按正确顺序解析——本质上是“自底向上”。这种机制使开发者无需手动管理如此复杂的依赖关系图。

#### 标准提供者

让我们更仔细地看看 `@Module()` 装饰器。在 `app.module` 中，我们声明：

```typescript
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
```

`providers` 属性接受一个 `providers` 数组。到目前为止，我们通过类名列表来提供这些提供者。实际上，`providers: [CatsService]` 这种语法是更完整语法的简写形式：

```typescript
providers: [
  {
    provide: CatsService,
    useClass: CatsService,
  },
];
```

现在我们看到这种显式构造方式，就能理解注册过程了。这里，我们明确地将令牌 `CatsService` 与类 `CatsService` 关联起来。简写形式只是为了简化最常见的使用场景，即通过同名令牌请求类的实例。

#### 自定义提供程序

当您的需求超出了*标准提供者*所提供的范围时会发生什么？以下是几个例子：

- 您希望创建自定义实例，而不是让 Nest 实例化（或返回类的缓存实例）
- 您希望在第二个依赖项中重用现有类
- 你想要在测试中使用模拟版本覆盖某个类

Nest 允许你定义自定义提供者来处理这些情况。它提供了多种定义自定义提供者的方式，下面我们来逐一了解。

:::info 提示
如果遇到依赖解析问题，可以设置 `NEST_DEBUG` 环境变量，这样在启动时就能获取额外的依赖解析日志。
:::

#### 值提供者：`useValue`

`useValue` 语法适用于注入常量值、将外部库放入 Nest 容器或用模拟对象替换实际实现。假设您希望强制 Nest 在测试中使用模拟的 `CatsService`。

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

在此示例中，`CatsService` 令牌将解析为模拟对象 `mockCatsService`。`useValue` 需要一个值——本例中是一个与被替换的 `CatsService` 类具有相同接口的字面量对象。由于 TypeScript 的[结构类型](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)特性，您可以使用任何具有兼容接口的对象，包括字面量对象或通过 `new` 实例化的类实例。

#### 基于非类的提供者令牌

到目前为止，我们一直使用类名作为提供者令牌（即 `providers` 数组中列出的提供者里 `provide` 属性的值）。这与[基于构造函数的注入](../overview/providers#依赖注入)使用的标准模式相匹配，其中令牌也是类名。（如果这个概念不完全清楚，请回顾 [DI 基础](/fundamentals/dependency-injection#di-基础概念)以复习令牌相关知识）。有时，我们可能需要使用字符串或符号作为 DI 令牌的灵活性。例如：

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

在这个例子中，我们将一个字符串值令牌（`'CONNECTION'`）与从外部文件导入的现有 `connection` 对象关联起来。

:::warning 注意
 除了使用字符串作为令牌值外，还可以使用 JavaScript 的 [symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) 或 TypeScript 的 [enums](https://www.typescriptlang.org/docs/handbook/enums.html)。
:::

我们之前已经了解了如何使用标准的[基于构造函数的注入](../overview/providers#依赖注入)模式来注入提供者。这种模式**要求**依赖项必须使用类名声明。而 `'CONNECTION'` 自定义提供者使用的是字符串令牌。让我们看看如何注入这样的提供者。为此，我们使用 `@Inject()` 装饰器。这个装饰器接受一个参数——令牌。

```typescript
@Injectable()
export class CatsRepository {
  constructor(@Inject('CONNECTION') connection: Connection) {}
}
```

:::info 提示
`@Inject()` 装饰器是从 `@nestjs/common` 包中导入的。
:::

虽然我们在上面的示例中直接使用字符串 `'CONNECTION'` 是为了说明目的，但为了代码整洁的组织，最佳实践是在单独的文件中定义令牌，例如 `constants.ts`。就像对待符号或枚举一样，在它们自己的文件中定义并在需要时导入。

#### 类提供者：`useClass`

`useClass` 语法允许您动态确定令牌应解析到的类。例如，假设我们有一个抽象（或默认）的 `ConfigService` 类。根据当前环境，我们希望 Nest 提供配置服务的不同实现。以下代码实现了这种策略。

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

让我们看看这个代码示例中的几个细节。您会注意到我们首先使用字面量对象定义了 `configServiceProvider`，然后将其传递给模块装饰器的 `providers` 属性。这只是一点代码组织方式，但在功能上等同于本章目前使用的示例。

此外，我们使用了 `ConfigService` 类名作为令牌。对于任何依赖 `ConfigService` 的类，Nest 将注入所提供类（`DevelopmentConfigService` 或 `ProductionConfigService`）的实例，覆盖可能在其他地方声明的任何默认实现（例如，使用 `@Injectable()` 装饰器声明的 `ConfigService`）。

#### 工厂提供者：`useFactory`

`useFactory` 语法允许**动态**创建提供者。实际的提供者将由工厂函数返回的值提供。工厂函数可以根据需要简单或复杂。简单的工厂可能不依赖任何其他提供者。更复杂的工厂可以注入它需要计算结果的其它提供者。对于后一种情况，工厂提供者语法有一对相关机制：

1.  工厂函数可以接受（可选的）参数。
2.  （可选的）`inject` 属性接受一个提供者数组，Nest 会在实例化过程中解析这些提供者并将其作为参数传递给工厂函数。此外，这些提供者可以标记为可选。两个列表应该相互关联：Nest 会按照相同顺序将 `inject` 列表中的实例作为参数传递给工厂函数。下面的示例演示了这一点。

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
```

#### 别名提供者：`useExisting`

`useExisting` 语法允许你为现有提供者创建别名。这提供了两种访问同一提供者的方式。在下面的示例中，（基于字符串的）令牌 `'AliasedLoggerService'` 是（基于类的）令牌 `LoggerService` 的别名。假设我们有两个不同的依赖项，一个针对 `'AliasedLoggerService'`，另一个针对 `LoggerService`。如果这两个依赖项都指定为 `SINGLETON` 作用域，它们将解析为同一个实例。

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

#### 非服务型提供者

虽然提供者通常用于提供服务，但其用途不仅限于此。提供者可以提供**任何**值。例如，提供者可以根据当前环境提供配置对象数组，如下所示：

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

#### 导出自定义提供者

与任何提供者一样，自定义提供者的作用域限于其声明模块。要使它对其他模块可见，必须将其导出。要导出自定义提供者，我们可以使用其令牌或完整的提供者对象。

以下示例展示了使用令牌导出的方式：

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
```

或者，使用完整的提供者对象导出：

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
```

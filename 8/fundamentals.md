## 自定义提供者 

在前面几章中，我们讨论了依赖注入(`DI`)的各个方面，以及如何在 `Nest` 中使用它。其中一个例子是基于[构造函数](https://docs.nestjs.com/providers#dependency-injection)的依赖注入，用于将实例(通常是服务提供者)注入到类中。当您了解到依赖注入是以一种基本的方式构建到 `Nest` 内核中时，您不会感到惊讶。到目前为止，我们只探索了一个主要模式。随着应用程序变得越来越复杂，您可能需要利用 `DI` 系统的所有特性，因此让我们更详细地研究它们。

### 依赖注入

依赖注入是一种控制反转（`IoC`）技术，您可以将依赖的实例化委派给 `IoC` 容器（在我们的示例中为 `NestJS` 运行时系统），而不是必须在自己的代码中执行。 让我们从[“提供者”](providers.md)一章中检查此示例中发生的情况。

首先，我们定义一个提供者。`@Injectable()`装饰器将 `CatsService` 类标记为提供者。

?> cats.service.ts

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
```

然后，我们要求 `Nest` 将提供程序注入到我们的控制器类中：

?> cats.controller.ts

```typescript
import { Controller, Get } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}
```
最后，我们在 `Nest IoC` 容器中注册提供程序

?> app.module.ts

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

这个过程有三个关键步骤:

 1. 在 `cats.service.ts` 中 `@Injectable()` 装饰器声明 `CatsService` 类是一个可以由`Nest IoC`容器管理的类。

 2. 在 `cats.controller.ts` 中 `CatsController` 声明了一个依赖于 `CatsService` 令牌(`token`)的构造函数注入:

```typescript
constructor(private readonly catsService: CatsService)
```

 3. 在 `app.module.ts` 中，我们将标记 `CatsService`与 `cats.service.ts`文件中的 `CatsService` 类相关联。 我们将在下面确切地看到这种关联（也称为注册）的发生方式。

当 `Nest IoC` 容器实例化 `CatsController` 时，它首先查找所有依赖项*。 当找到 `CatsService` 依赖项时，它将对 `CatsService`令牌(`token`)执行查找，并根据上述步骤（上面的＃3）返回 `CatsService` 类。 假定单例范围（默认行为），`Nest` 然后将创建 `CatsService` 实例，将其缓存并返回，或者如果已经缓存，则返回现有实例。

这个解释稍微简化了一点。我们忽略的一个重要方面是，分析依赖项代码的过程非常复杂，并且发生在应用程序引导期间。一个关键特性是依赖关系分析(或“创建依赖关系图”)是可传递的。 在上面的示例中，如果 `CatsService` 本身具有依赖项，那么那些依赖项也将得到解决。 依赖关系图确保以正确的顺序解决依赖关系-本质上是“自下而上”。 这种机制使开发人员不必管理此类复杂的依赖关系图。

### 标准提供者

让我们仔细看看 `@Module()`装饰器。在中 `app.module` ，我们声明：

```typescript
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
```
providers属性接受一个提供者数组。到目前为止，我们已经通过一个类名列表提供了这些提供者。实际上，该语法`providers: [CatsService]`是更完整语法的简写：

```typescript
providers: [
  {
    provide: CatsService,
    useClass: CatsService,
  },
];
```

现在我们看到了这个显式的构造，我们可以理解注册过程。在这里，我们明确地将令牌 `CatsService`与类 `CatsService` 关联起来。简写表示法只是为了简化最常见的用例，其中令牌用于请求同名类的实例。

### 自定义提供者

当您的要求超出标准提供商所提供的要求时，会发生什么？这里有一些例子：

- 您要创建自定义实例，而不是让 `Nest` 实例化（或返回其缓存实例）类
- 您想在第二个依赖项中重用现有的类
- 您想使用模拟版本覆盖类进行测试

`Nest` 可让您定义自定义提供程序来处理这些情况。它提供了几种定义自定义提供程序的方法。让我们来看看它们。

### 值提供者 (useValue)

`useValue` 语法对于注入常量值、将外部库放入 `Nest` 容器或使用模拟对象替换实际实现非常有用。假设您希望强制 `Nest` 使用模拟 `CatsService` 进行测试。

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

在本例中，`CatsService` 令牌将解析为 `mockCatsService` 模拟对象。`useValue` 需要一个值——在本例中是一个文字对象，它与要替换的 `CatsService` 类具有相同的接口。由于 `TypeScript` 的结构类型化，您可以使用任何具有兼容接口的对象，包括文本对象或用 `new` 实例化的类实例。

### 非类提供者

到目前为止，我们已经使用了类名作为我们的提供者标记（ `providers` 数组中列出的提供者中的 `Provide` 属性的值）。 这与基于构造函数的注入所使用的标准模式相匹配，其中令牌也是类名。 （如果此概念尚不完全清楚，请参阅[DI](8/fundamentals.md#依赖注入)基础知识，以重新学习令牌）。 有时，我们可能希望灵活使用字符串或符号作为 `DI` 令牌。 例如：

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

在本例中，我们将字符串值令牌(`'CONNECTION'`)与从外部文件导入的已存在的连接对象相关联。

!> 除了使用字符串作为令牌之外，还可以使用[JavaScript Symbol](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)。

我们前面已经看到了如何使用基于标准构造函数的注入模式注入提供者。此模式要求用类名声明依赖项。`'CONNECTION'` 自定义提供程序使用字符串值令牌。让我们看看如何注入这样的提供者。为此，我们使用 `@Inject()` 装饰器。这个装饰器只接受一个参数——令牌。

```typescript
@Injectable()
export class CatsRepository {
  constructor(@Inject('CONNECTION') connection: Connection) {}
}
```

!> `@Inject()`装饰器是从`@nestjs/common`包中导入的。

虽然我们在上面的例子中直接使用字符串 `'CONNECTION'` 来进行说明，但是为了清晰的代码组织，最佳实践是在单独的文件（例如 `constants.ts` ）中定义标记。 对待它们就像对待在其自己的文件中定义并在需要时导入的符号或枚举一样。

### 类提供者 (useClass)

`useClass`语法允许您动态确定令牌应解析为的类。 例如，假设我们有一个抽象（或默认）的 `ConfigService` 类。 根据当前环境，我们希望 `Nest 提供配置服务的不同实现。 以下代码实现了这种策略。

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

让我们看一下此代码示例中的一些细节。 您会注意到，我们首先定义对象 `configServiceProvider`，然后将其传递给模块装饰器的 `providers` 属性。 这只是一些代码组织，但是在功能上等同于我们到目前为止在本章中使用的示例。

另外，我们使用 `ConfigService` 类名称作为令牌。 对于任何依赖 `ConfigService` 的类，`Nest` 都会注入提供的类的实例（ `DevelopmentConfigService` 或 `ProductionConfigService`），该实例将覆盖在其他地方已声明的任何默认实现（例如，使用 `@Injectable()` 装饰器声明的 `ConfigService`）。

### 工厂提供者 (useFactory)

`useFactory` 语法允许动态创建提供程序。实工厂函数的返回实际的 `provider` 。工厂功能可以根据需要简单或复杂。一个简单的工厂可能不依赖于任何其他的提供者。更复杂的工厂可以自己注入它需要的其他提供者来计算结果。对于后一种情况，工厂提供程序语法有一对相关的机制:

1. 工厂函数可以接受(可选)参数。

2. `inject` 属性接受一个提供者数组，在实例化过程中，`Nest` 将解析该数组并将其作为参数传递给工厂函数。这两个列表应该是相关的: `Nest` 将从 `inject` 列表中以相同的顺序将实例作为参数传递给工厂函数。

下面示例演示：

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
})
export class AppModule {}
```

### 别名提供者 (useExisting)

`useExisting` 语法允许您为现有的提供程序创建别名。这将创建两种访问同一提供者的方法。在下面的示例中，(基于`string`)令牌 `'AliasedLoggerService'` 是(基于类的)令牌 `LoggerService` 的别名。假设我们有两个不同的依赖项，一个用于 `'AlilasedLoggerService'` ，另一个用于 `LoggerService` 。如果两个依赖项都用单例作用域指定，它们将解析为同一个实例。

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

### 非服务提供者

虽然提供者经常提供服务，但他们并不限于这种用途。提供者可以提供任何值。例如，提供程序可以根据当前环境提供配置对象数组，如下所示:

```typescript
const configFactory = {
  provide: 'CONFIG',
  useFactory: () => {
    return process.env.NODE_ENV === 'development'
      ? devConfig
      : prodConfig;
  },
};

@Module({
  providers: [configFactory],
})
export class AppModule {}
```



### 导出自定义提供者

与任何提供程序一样，自定义提供程序的作用域仅限于其声明模块。要使它对其他模块可见，必须导出它。要导出自定义提供程序，我们可以使用其令牌或完整的提供程序对象。

以下示例显示了使用 `token` 的例子：

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

但是你也可以使用整个对象：

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

## 异步提供者

在完成一些异步任务之前，应用程序必须等待启动状态, 例如，在与数据库的连接建立之前，您可能不希望开始接受请求。 在这种情况下你应该考虑使用异步 `provider`。

其语法是使用 `useFactory` 语法的 `async/await`。工厂返回一个承诺，工厂函数可以等待异步任务。在实例化依赖于(注入)这样一个提供程序的任何类之前，`Nest`将等待承诺的解决。

```typescript
{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
}
```
?> 在这里了解 [更多](8/fundamentals?id=自定义提供者)自定义 provider 的相关方法。


### 注入

与任何其他提供程序一样，异步提供程序通过其令牌被注入到其他组件。在上面的示例中，您将使用结构`@Inject`(`'ASYNC_CONNECTION'`)。

### 实例

以上示例用于演示目的。如果你正在寻找更详细的例子，请看 [这里](8/recipes?id=sql-typeorm)。

## 动态模块

[**模块**](8/modules)一章介绍了 `Nest` 模块的基础知识，并简要介绍了[动态模块](8/modules?id=dynamic-modules)。本章扩展了动态模块的主题。完成后，您应该对它们是什么以及如何以及何时使用它们有很好的了解。

### 简介

文档概述部分中的大多数应用程序代码示例都使用了常规或静态模块。模块定义像**提供者**和**控制器**这样的组件组，它们作为整个应用程序的模块部分组合在一起。它们为这些组件提供了执行上下文或范围。例如，模块中定义的提供程序对模块的其他成员可见，而不需要导出它们。当提供者需要在模块外部可见时，它首先从其主机模块导出，然后导入到其消费模块。

首先，我们将定义一个 `UsersModule` 来提供和导出 `UsersService`。`UsersModule`是 `UsersService`的主机模块。

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

接下来，我们将定义一个 `AuthModule`，它导入 `UsersModule`，使 `UsersModule`导出的提供程序在 `AuthModule`中可用:

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

这些构造使我们能够注入 `UsersService` 例如 `AuthService` 托管在其中的 `AuthModule`：

```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}
  /*
    Implementation that makes use of this.usersService
  */
}
```

我们将其称为静态模块绑定。`Nest`在主模块和消费模块中已经声明了连接模块所需的所有信息。让我们来看看这个过程中发生了什么。`Nest`通过以下方式使 `UsersService` 在 `AuthModule`中可用:

1. 实例化 `UsersModule` ，包括传递导入 `UsersModule` 本身使用的其他模块，以及传递的任何依赖项(参见[自定义](8/fundamentals?id=custom-providers)提供程序)。

2. 实例化 `AuthModule` ，并将 `UsersModule` 导出的提供者提供给 `AuthModule` 中的组件(就像在 `AuthModule` 中声明它们一样)。

3. 在 `AuthService` 中注入 `UsersService` 实例。

### 动态模块实例

使用静态模块绑定，消费模块不会机会影响来自主机模块的提供者的配置方式。为什么这很重要?考虑这样一种情况:我们有一个通用模块，它需要在不同的用例中有不同的行为。这类似于许多系统中的**插件**概念，在这些系统中，一般功能需要一些配置才能供使用者使用。

`Nest` 的一个很好的例子是配置模块。 许多应用程序发现使用配置模块来外部化配置详细信息很有用。 这使得在不同部署中动态更改应用程序设置变得容易：例如，开发人员的开发数据库，测试环境的数据库等。通过将配置参数的管理委派给配置模块，应用程序源代码保持独立于配置参数。

主要在于配置模块本身，因为它是通用的(类似于 `'插件'` )，需要由它的消费模块进行定制。这就是动态模块发挥作用的地方。使用动态模块特性，我们可以使配置模块成为动态的，这样消费模块就可以使用 `API` 来控制配置模块在导入时是如何定制的。

换句话说，动态模块提供了一个 `API` ，用于将一个模块导入到另一个模块中，并在导入模块时定制该模块的属性和行为，而不是使用我们目前看到的静态绑定。

### 配置模块示例

在本节中，我们将使用示例代码的[基本版本](8/techniques)。 截至本章末尾的完整版本在[此处](https://github.com/nestjs/nest/tree/master/sample/25-dynamic-modules)可用作工作示例。

我们的要求是使 `ConfigModule` 接受选项对象以对其进行自定义。 这是我们要支持的功能。 基本示例将 `.env` 文件的位置硬编码为项目根文件夹。 假设我们要使它可配置，以便您可以在您选择的任何文件夹中管理 `.env` 文件。 例如，假设您想将各种 `.env` 文件存储在项目根目录下名为 `config` 的文件夹中（即 `src` 的同级文件夹）。 在不同项目中使用 `ConfigModule` 时，您希望能够选择其他文件夹。

动态模块使我们能够将参数传递到要导入的模块中，以便我们可以更改其行为。 让我们看看它是如何工作的。 如果我们从最终目标开始，即从使用模块的角度看，然后向后工作，这将很有帮助。 首先，让我们快速回顾一下静态导入 `ConfigModule` 的示例（即，一种无法影响导入模块行为的方法）。 请密切注意 `@Module()` 装饰器中的 `imports` 数组：

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

让我们考虑一下动态模块导入是什么样子的，我们在其中传递了一个配置对象。比较这两个例子之间的导入数组的差异:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule.register({ folder: './config' })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

让我们看看在上面的动态示例中发生了什么。变化的部分是什么?

1. `ConfigModule` 是一个普通类，因此我们可以推断它必须有一个名为 `register()` 的静态方法。我们知道它是静态的，因为我们是在 `ConfigModule` 类上调用它，而不是在类的实例上。注意:我们将很快创建的这个方法可以有任意名称，但是按照惯例，我们应该调用它 `forRoot()` 或 `register()` 方法。

2. `register()` 方法是由我们定义的，因此我们可以接受任何我们喜欢的参数。在本例中，我们将接受具有适当属性的简单 `options` 对象，这是典型的情况。

3. 我们可以推断 `register()` 方法必须返回类似模块的内容，因为它的返回值出现在熟悉的导入列表中，到目前为止，我们已经看到该列表包含了一个模块列表。

实际上，我们的 `register()` 方法将返回的是 `DynamicModule`。 动态模块无非就是在运行时创建的模块，它具有与静态模块相同属性，外加一个称为模块的附加属性。 让我们快速查看一个示例静态模块声明，并密切注意传递给装饰器的模块选项：

```typescript
@Module({
  imports: [DogsService],
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})
```

动态模块必须返回具有完全相同接口的对象，外加一个称为`module`的附加属性。 `module`属性用作模块的名称，并且应与模块的类名相同，如下例所示。

!> 对于动态模块，模块选项对象的所有属性都是可选的，模块除外。

静态 `register()` 方法呢？ 现在我们可以看到它的工作是返回具有 `DynamicModule` 接口的对象。 当我们调用它时，我们实际上是在导入列表中提供一个模块，类似于在静态情况下通过列出模块类名的方式。 换句话说，动态模块 `API` 只是返回一个模块，而不是固定 `@Modules` 装饰器中的属性，而是通过编程方式指定它们。

仍然有一些细节需要详细了解：

1. 现在我们可以声明 `@Module()` 装饰器的 `imports` 属性不仅可以使用一个模块类名(例如，`imports: [UsersModule])` ，还可以使用一个返回动态模块的函数(例如，`imports: [ConfigModule.register(...)]`)。

2. 动态模块本身可以导入其他模块。 在本示例中，我们不会这样做，但是如果动态模块依赖于其他模块的提供程序，则可以使用可选的 `imports` 属性导入它们。 同样，这与使用 `@Module()` 装饰器为静态模块声明元数据的方式完全相似。

有了这种理解，我们现在可以看看动态 `ConfigModule` 声明必须是什么样子。 让我们来看一下。

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({})
export class ConfigModule {
  static register(): DynamicModule {
    return {
      module: ConfigModule,
      providers: [ConfigService],
      exports: [ConfigService],
    };
  }
}
```

现在应该清楚各个部分是如何联系在一起的了。调用 `ConfigModule.register(...)` 将返回一个 `DynamicModule` 对象，该对象的属性基本上与我们通过 `@Module()` 装饰器提供的元数据相同。

!> `DynamicModule` 需要从 `@nestjs/common` 包导入。

然而，我们的动态模块还不是很有趣，因为我们还没有引入任何我们想要配置它的功能。让我们接下来解决这个问题。

### 模块配置

定制 `ConfigModule` 行为的显而易见的解决方案是在静态 `register()` 方法中向其传递一个 `options` 对象，如我们上面所猜测的。让我们再次看一下消费模块的 `imports` 属性：

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule.register({ folder: './config' })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

这很好地处理了将一个 `options` 对象传递给我们的动态模块。那么我们如在何 `ConfigModule` 中使用 `options` 对象呢?让我们考虑一下。我们知道，我们的 `ConfigModule` 基本上是一个提供和导出可注入服务( `ConfigService` )供其他提供者使用。实际上我们的 `ConfigService` 需要读取 `options` 对象来定制它的行为。现在让我们假设我们知道如何将 `register()` 方法中的选项获取到 `ConfigService` 中。有了这个假设，我们可以对服务进行一些更改，以便基于 `options` 对象的属性自定义其行为。(注意:目前，由于我们还没有确定如何传递它，我们将只硬编码选项。我们将在一分钟内解决这个问题)。

```typescript
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { EnvConfig } from './interfaces';

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor() {
    const options = { folder: './config' };

    const filePath = `${process.env.NODE_ENV || 'development'}.env`;
    const envFile = path.resolve(__dirname, '../../', options.folder, filePath);
    this.envConfig = dotenv.parse(fs.readFileSync(envFile));
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
```

现在，我们的 `ConfigService` 知道如何在选项指定的文件夹中查找 `.env` 文件。

我们剩下的任务是以某种方式将 `register()` 步骤中的 `options` 对象注入 `ConfigService`。当然，我们将使用依赖注入来做到这一点。这是一个关键点，所以一定要理解它。我们的 `ConfigModule` 提供 `ConfigService`。而 `ConfigService` 又依赖于只在运行时提供的 `options` 对象。因此，在运行时，我们需要首先将 `options` 对象绑定到 `Nest IoC` 容器，然后让 `Nest` 将其注入 `ConfigService` 。请记住，在**自定义提供者**一章中，提供者可以包含任何值，而不仅仅是服务，所以我们可以使用依赖项注入来处理简单的 `options` 对象。

让我们首先处理将 `options` 对象绑定到 `IoC` 容器的问题。我们在静态 `register()` 方法中执行此操作。请记住，我们正在动态地构造一个模块，而模块的一个属性就是它的提供者列表。因此，我们需要做的是将 `options` 对象定义为提供程序。这将使它可注入到 `ConfigService` 中，我们将在下一个步骤中利用它。在下面的代码中，注意 `provider` 数组:

```typescript
import { DynamicModule, Module } from '@nestjs/common';

import { ConfigService } from './config.service';

@Module({})
export class ConfigModule {
  static register(options): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}
```

现在，我们可以通过将 `'CONFIG_OPTIONS'` 提供者注入 `ConfigService` 来完成这个过程。回想一下，当我们使用非类令牌定义提供者时，我们需要使用[这里](8/fundamentals/custom-providers?id=non-class-based-provider-tokens)描述的 `@Inject()` 装饰器。

```typescript
import { Injectable, Inject } from '@nestjs/common';

import * as dotenv from 'dotenv';
import * as fs from 'fs';

import { EnvConfig } from './interfaces';

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(@Inject('CONFIG_OPTIONS') private options) {
    const filePath = `${process.env.NODE_ENV || 'development'}.env`;
    const envFile = path.resolve(__dirname, '../../', options.folder, filePath);
    this.envConfig = dotenv.parse(fs.readFileSync(envFile));
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
```

最后一点:为了简单起见，我们使用了上面提到的基于字符串的注入标记( `'CONFIG_OPTIONS'` )，但是最佳实践是将它定义为一个单独文件中的常量(或符号)，然后导入该文件。例如:

```typescript
export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
```
### 实例

本章代码的完整示例可以在[这里](https://github.com/nestjs/nest/tree/master/sample/25-dynamic-modules)找到。


## 注入作用域

来自不同语言背景的开发者,在学习Nest时可能预料不到在请求中几乎所有内容都是共享的。我们建立一个连接池到数据库,在全局状态下使用单例服务。 要记住Node.js并不遵循多线程下请求/响应的无状态模式。因此,在我们的应用中使用单例是安全的。

然而,在需要考虑请求生命周期的情况下,存在边缘情况.例如,在GraphQL应用的预请求缓存中,以及请求追踪和多租户条件下,注入作用域提供了一个机制来获取需要的提供者生命周期行为.

### 提供者范围

基本上，每个提供者都可以作为一个单例，被请求范围限定，并切换到瞬态模式。请参见下表，以熟悉它们之间的区别。

|||
|---|----|
| `DEFAULT` | 每个提供者可以跨多个类共享。提供者生命周期严格绑定到应用程序生命周期。一旦应用程序启动，所有提供程序都已实例化。默认情况下使用单例范围。 |
| `REQUEST` | 在请求处理完成后，将为每个传入请求和垃圾收集专门创建提供者的新实例 |
| `TRANSIENT` | 临时提供者不能在提供者之间共享。每当其他提供者向 `Nest` 容器请求特定的临时提供者时，该容器将创建一个新的专用实例 |

?> 使用单例范围始终是推荐的方法。请求之间共享提供者可以降低内存消耗，从而提高应用程序的性能(不需要每次实例化类)。

### 使用 (Usage)

为了切换到另一个注入范围，您必须向 `@Injectable()` 装饰器传递一个选项对象。

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {}
```

在[自定义提供者](/8/fundamentals?id=自定义提供者)的情况下，您必须设置一个额外的范围属性。

```typescript
{
  provide: 'CACHE_MANAGER',
  useClass: CacheManager,
  scope: Scope.TRANSIENT,
}
```
?> `Scope`从`@nestjs/common`中导入。

!> 网关不应该使用请求范围提供者,因为其必须作为单例提供。每个网关都封装了一个`socket`并且不能多次实例化。

默认使用单例范围,并且不需要声明。如果你想声明一个单例范围的提供者,在`scope`属性中使用`Scope.DEFAULT`值。

### 控制器范围

当涉及到控制器时，传递 `ControllerOptions` 对象

```typescript
@Controller({
  path: 'cats',
  scope: ,
})
export class CatsController {}
```

?> 网关永远不应该依赖于请求范围的提供者，因为它们充当单例。一个网关封装了一个真正的套接字，不能多次被实例化

### 所有请求注入

必须非常谨慎地使用请求范围的提供者。请记住，`scope` 实际上是在注入链中冒泡的。如果您的控制器依赖于一个请求范围的提供者，这意味着您的控制器实际上也是请求范围。

想象一下下面的链: `CatsController <- CatsService <- CatsRepository `。如果您的 `CatsService` 是请求范围的(从理论上讲，其余的都是单例)，那么 `CatsController` 也将成为请求范围的(因为必须将请求范围的实例注入到新创建的控制器中)，而 `CatsRepository` 仍然是单例的。

!> 在这种情况下，循环依赖关系将导致非常痛苦的副作用，因此，您当然应该避免创建它们

### 请求提供者

在 `HTTP` 应用程序中(例如使用`@nestjs/platform-express`或`@nestjs/platform-fastify`)，当使用请求范围提供者时,可能需要获取原始的请求对象。这通过注入`REQUEST`对象实现:

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}
}
```

由于底层平台和协议不同，该功能与微服务和 `GraphQL` 应用程序略有不同。在 `GraphQL` 应用程序中，可以注入 `CONTEXT`来替代`REQUEST`。

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(CONTEXT) private readonly context) {}
}
```

然后，您可以配置您的 `context` 值(在`GraphQLModule`中)，以包含请求作为其属性。

### 性能

使用请求范围的提供者将明显影响应用程序性能。即使 `Nest` 试图缓存尽可能多的元数据，它仍然必须为每个请求创建类的实例。因此，它将降低您的平均响应时间和总体基准测试结果。如果您的提供者不一定需要请求范围，那么您应该坚持使用单例范围。

## 循环依赖

当两个类互相依赖时就会出现循环依赖. 例如，当 `A` 类需要 `B` 类，而 `B` 类也需要 `A` 类时，就会产生**循环依赖**。`Nest` 允许在提供者( `provider` )和模块( `module` )之间创建循环依赖关系.

建议尽可能避免循环依赖。但是有时候难以避免，Nest提供了两个方法来解决这个问题.本章中我们提供了两种技术，即`正向引用(forward reference)`和`模块引用(ModuleRef)`来从注入容器中获取一个提供者。

我们也讨论了在模块间处理循环依赖的问题。

!> 循环依赖也可以使用`封装桶文件/index.ts`文件成组导入。桶(Barrel)文件应该从模块/类中省略掉。例如，当在同一个目录下作为桶文件导入时不应使用桶文件，例如，cats/cats.controller不应该导入cat到cats/cats.service文件。更多内容参见[github issue](https://github.com/nestjs/nest/issues/1181#issuecomment-430197191)

### 前向引用

**前向引用**允许 `Nest` 引用目前尚未被定义的引用。当`CatsService` 和 `CommonService` 相互依赖时，关系的双方都需要使用 `@Inject()` 和 `forwardRef()` ，否则 `Nest` 不会实例化它们，因为所有基本元数据都不可用。让我们看看下面的代码片段：

> cats.service.ts

```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private readonly commonService: CommonService,
  ) {}
}
```    

?> `forwardRef()` 需要从 `@nestjs/common` 包中导入的。

这只是关系的一方面。现在让我们对 `CommonService` 做同样的事情:

> common.service.ts

```typescript
@Injectable()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private readonly catsService: CatsService,
  ) {}
}
```

!> 实例化的顺序是不确定的。不能保证哪个构造函数会被先调用。

### 可选的模块引用(`ModuleRef`)类

一个选择是使用`forwardRef()`来重构你的代码，并使用`ModuleRef`类来在循环引用关系一侧获取提供者。更多关于`ModuleRef`类的内容参考[这里](https://docs.nestjs.com/fundamentals/module-ref)。

### 模块前向引用

为了处理模块( `module` )之间的循环依赖，必须在模块关联的两个部分上使用相同的 `forwardRef()`：

> common.module.ts

```typescript
@Module({
  imports: [forwardRef(() => CatsModule)],
})
export class CommonModule {}
```

## 模块参考

Nest提供了一个`ModuleRef`类来导航到内部提供者列表，并使用注入令牌作为查找键名来获取一个引用。`ModuleRef`类也提供了一个动态实例化静态和范围的提供者的方法。`ModuleRef`可以通过常规方法注入到类中：

>cats.service.ts

```typescript
@Injectable()
export class CatsService {
  constructor(private moduleRef: ModuleRef) {}
}
```
?> `ModuleRef`从`@nestjs/core`中引入。

### 获取实例

`ModuleRef`实例(下文称为**模块引用**) 拥有`get()`方法。该方法获取一个提供者，控制器或者通过注入令牌/类名获取一个在当前模块中可注入对象(例如守卫或拦截器等)。

>cats.service.ts

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private service: Service;
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}
```
!> 不能通过`get()`方法获取一个范围的提供者(暂态的或者请求范围的)。要使用下列的技术，参考[这里](https://docs.nestjs.com/fundamentals/injection-scopes)了解更多控制范围。

要从全局上下文获取一个提供者(例如，如果提供者在不同模块中注入)，向`get()`的第二个参数传递`{ strict: false }`选项。

```typescript
this.moduleRef.get(Service, { strict: false });
```

### 处理范围提供者

要动态处理一个范围提供者(瞬态的或请求范围的)，使用`resolve()`方法并将提供者的注入令牌作为参数提供给方法。

>cats.service.ts

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private transientService: TransientService;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}
```

`resolve()`方法从其自身的注入容器树返回一个提供者的唯一实例。每个子树都有一个独一无二的上下文引用。因此如果你调用该方法一次以上并进行引用比较的话，结果是不同的。

>cats.service.ts

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    console.log(transientServices[0] === transientServices[1]); // false
  }
}
```

要在不同的`resolve()`调用之间产生一个单例，并保证他们共享同样生成的DI容器子树，向`resolve()`方法传递一个上下文引用，使用`ContextIdFactory`类来生成上下文引用。该类提供了一个`create()`方法，返回一个合适的独一无二的引用。

>cats.service.ts

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const contextId = ContextIdFactory.create();
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService, contextId),
      this.moduleRef.resolve(TransientService, contextId),
    ]);
    console.log(transientServices[0] === transientServices[1]); // true
  }
}
```
?> `ContextIdFactory`类从`@nestjs/core`包中引入。

### 注册`REQUEST`提供者

Manually generated context identifiers (with ContextIdFactory.create()) represent DI sub-trees in which REQUEST provider is undefined as they are not instantiated and managed by the Nest dependency injection system.

To register a custom REQUEST object for a manually created DI sub-tree, use the ModuleRef#registerRequestByContextId() method, as follows:

```typescript
const contextId = ContextIdFactory.create();
this.moduleRef.registerRequestByContextId(/* YOUR_REQUEST_OBJECT */, contextId);
```
### 获取当前子树

有时，也需要在请求上下文中获取一个请求范围提供者的实例。例如，`CatsService`是请求范围的，要获取的`CatsRepository`实例也被标识为请求范围。要分享同一个注入容器子树，你需要获取当前上下文引用而不是生成一个新的(像前面的`ContextIdFactory.create()`函数)。使用`@Inject()`来获取当前的请求对象。

>cats.service.ts

```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(REQUEST) private request: Record<string, unknown>,
  ) {}
}
```
?> 从[这里](https://docs.nestjs.com/fundamentals/injection-scopes#request-provider)了解更多请求提供者

使用`ContextIdFactory`类的`getByRequest()`方法来基于请求对象创建一个上下文id 并传递`resolve()`调用:

```typescript
const contextId = ContextIdFactory.getByRequest(this.request);
const catsRepository = await this.moduleRef.resolve(CatsRepository, contextId);
```

### 动态实例化自定义类

要动态实例化一个之前未注册的类作为提供者，使用模块引用的`create()`方法。

> cats.service.ts

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private catsFactory: CatsFactory;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.catsFactory = await this.moduleRef.create(CatsFactory);
  }
}
```
该技术允许你在框架容器之外偶然实例化一个不同的类。

## 懒加载模块

（待翻译）

## 应用上下文

Nest提供了一些应用类来简化在不同应用上下文之间编写应用(例如Nest HTTP应用，微服务和WebSockets应用)。这些应用可以用于创建通用的守卫，过滤器和拦截器，可以工作在控制器，方法和应用上下文中。

本章包括`ArgumentsHost`和`ExecutionContext`两个类.

### `ArgumentsHost`类

`ArgumentsHost`类提供了获取传递给处理程序的参数。它允许选择合适的上下文(例如HTTP，RPC(微服务)或者Websockets)来从框架中获取参数。框架提供了`ArgumentsHost`的实例，作为`host`参数提供给需要获取的地方。例如，在异常过滤器中传入`ArgumentsHost`参数来调用`catch()`方法。

`ArgumentsHost`简单地抽象为处理程序参数。例如，在HTTP应用中(使用`@nestjs/platform-express`时),host对象封装了Express的`[request, response, next] `数组,`reuest`是一个`request`对象，`response`是一个`response`对象，`next`是控制应用的请求响应循环的函数。此外，在GraphQL应用中，host包含`[root, args, context, info]`数组。

### 当前应用上下文

当构建通用的守卫，过滤器和拦截器时，意味着要跨应用上下文运行，我们需要在当前运行时定义应用类型。可以使用 `ArgumentsHost`的`getType()`方法。

```typescript
if (host.getType() === 'http') {
  // do something that is only important in the context of regular HTTP requests (REST)
} else if (host.getType() === 'rpc') {
  // do something that is only important in the context of Microservice requests
} else if (host.getType<GqlContextType>() === 'graphql') {
  // do something that is only important in the context of GraphQL requests
}
```

?> `GqlContextType`从中`@nestjs/graphql`导入。

应用类型定以后，可以如下编写通用组件。

### `Host`处理程序参数

要获取传递给处理程序的参数数组，使用host对象的`getArgs()`方法。

```typescript
const [req, res, next] = host.getArgs();
```

可以使用`getArgByIndex()`根据索引获取指定参数:

```typescript
const request = host.getArgByIndex(0);
const response = host.getArgByIndex(1);
```

在这些例子中我们通过索引来获取请求响应对象，这并不推荐，因为它将应用和特定上下文耦合。为了使代码鲁棒性更好，更可复用，你可以在程序中使用host对象的应用方法来切换合适的应用上下文，如下所示：

```typescript
/**
 * Switch context to RPC.
 */
switchToRpc(): RpcArgumentsHost;
/**
 * Switch context to HTTP.
 */
switchToHttp(): HttpArgumentsHost;
/**
 * Switch context to WebSockets.
 */
switchToWs(): WsArgumentsHost;
```

使用 `switchToHttp`() 方法重写前面的例子， `host.switchToHttp()`帮助方法调用一个HTTP应用的`HttpArgumentsHost`对象. `HttpArgumentsHost`对象有两个有用的方法，我们可以用来提取期望的对象。我们也可以使用Express类型的断言来返回原生的Express类型对象：

```typescript
const ctx = host.switchToHttp();
const request = ctx.getRequest<Request>();
const response = ctx.getResponse<Response>();
```

类似地，`WsArgumentsHost`和`RpcArgumentsHost`有返回微服务和WebSockets上下文的方法，以下是`WsArgumentsHost`的方法:

```typescript
export interface WsArgumentsHost {
  /**
   * Returns the data object.
   */
  getData<T>(): T;
  /**
   * Returns the client object.
   */
  getClient<T>(): T;
}
```

以下是`RpcArgumentsHost`的方法:

```typescript
export interface RpcArgumentsHost {
  /**
   * Returns the data object.
   */
  getData<T>(): T;

  /**
   * Returns the context object.
   */
  getContext<T>(): T;
}
```

### 执行上下文类
`ExecutionContext`扩展了`ArgumentsHost`,`提供额外的当前运行线程信息。和ArgumentsHost`类似,Nest在需要的时候提供了一个`ExecutionContext`的实例， 例如守卫的`canActivate()`方法和拦截器的`intercept()`方法，它提供以下方法：

```typescript
export interface ExecutionContext extends ArgumentsHost {
  /**
   * Returns the type of the controller class which the current handler belongs to.
   */
  getClass<T>(): Type<T>;
  /**
   * Returns a reference to the handler (method) that will be invoked next in the
   * request pipeline.
   */
  getHandler(): Function;
}
```

`getHandler()`方法返回要调用的处理程序的引用。`getClass()`方法返回一个特定处理程序所属的控制器类。例如，一个HTTP上下文，如果当前处理的是一个POST请求，在`CatsController`中绑定`create()`方法。`getHandler()`返回`create()`方法和`getClass()`方法所在的`CatsController`类的引用(不是实例)。


```typescript
const methodKey = ctx.getHandler().name; // "create"
const className = ctx.getClass().name; // "CatsController"
```

能同时获取当前类和处理方法的引用的能力提供了极大的灵活性。最重要的是，它给我们提供了通过`@SetMetadata()`装饰器来操作守卫或拦截器元数据的方法。如下。


### 反射和元数据

Nest提供了通过`@SetMetadata()`装饰器将自定义元数据附加在路径处理程序的能力。我们可以在类中获取这些元数据来执行特定决策。

>cats.controller.ts

```typescript
@Post()
@SetMetadata('roles', ['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

?> `@SetMetadata()`装饰器从`@nestjs/common`导入。

基于上述结构，我们将`role`元数据(role是一个元数据，['admin'] 是对应的值)关联到`create()`方法。在这种情况下，不推荐直接在路径中使用`@SetMetadata()`，而是应该如下创建自己的装饰器：

>roles.decorator.ts

```typescript
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

这一方法更清晰，更刻度，并且是强类型的。我们现在可以使用自定义的`@Roles()`装饰器，并将其应用在`create()`方法中。

>cats.controller.ts
```typescript
@Post()
@Roles('admin')
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```
要访问`role(s)`路径 (自定义元数据),要使用`Reflector`辅助类，它由框架提供，开箱即用，从`@nestjs/core`包导入。`Reflector`可以通过常规方式注入到类:

>roles.guard.ts

```typescript
@Injectable()
export class RolesGuard {
  constructor(private reflector: Reflector) {}
}
```

?> `Reflector`类从`@nestjs/core`导入。

使用`get()`方法读取处理程序的元数据。

```typescript
const roles = this.reflector.get<string[]>('roles', context.getHandler());
```

`Reflector#get`方法允许通过传递两个参数简单获取元数据：一个元数据key和一个context(装饰器对象)来获取元数据。在本例中，指定的key是`roles`(向上指回`roles.decorator.ts`以及在此处调用的`SetMetadata()`方法)。context 由`context.getHandler()`提供,用于从当前路径处理程序中获取元数据，`getHandler()`给了我们一个到路径处理函数的引用。

我们也可以组织我们的控制器，来从控制器层获取元数据，以在控制器所有路径中应用。

>cats.controller.ts
```typescript
@Roles('admin')
@Controller('cats')
export class CatsController {}
```

在本例中，要获取控制器元数据，将`context.getClass()`作为第二个参数(将控制器类作为上下文提供以获取元数据)来替代`context.getHandler()`:

>roles.guard.ts
```typescript
const roles = this.reflector.get<string[]>('roles', context.getClass());
```
要具备在多层提供元数据的能力，需要从多个上下文获取与合并元数据。`Reflector`类提供两个应用方法来帮助实现该功能。这些方法同时获取控制器和方法元数据，并通过不同方法来合并他们。

考虑以下场景，在两个水平应用`roles`元数据：

>cats.controller.ts

```typescript
@Roles('user')
@Controller('cats')
export class CatsController {
  @Post()
  @Roles('admin')
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }
}
```

如果你想将`user`指定为默认角色，并且出于特定目的有选择地进行覆盖，可以使用
`getAllAndOverride()`方法。

```typescript
const roles = this.reflector.getAllAndOverride<string[]>('roles', [
  context.getHandler(),
  context.getClass(),
]);
```

使用该代码编写守卫，在上下文中应用`create()`方法，采用上述元数据，将生成包含 ['admin']的`roles`。

要获取与合并元数据(该方法合并数组和对象)，使用`getAllAndMerge()`方法：

```typescript
const roles = this.reflector.getAllAndMerge<string[]>('roles', [
  context.getHandler(),
  context.getClass(),
]);
```
这会生成包含['user', 'admin']的`roles`。

对于这两种合并方法，传输元数据作为第一个参数，数组或者元数据对象上下文(例如，调用`getHandler()`和/或`getClass()`)作为第二个参数。

## 生命周期事件

所有应用程序元素都有一个由 `Nest` 管理的生命周期。`Nest` 提供了**生命周期钩子**，提供了对关键生命时刻的可见性，以及在关键时刻发生时采取行动(在你的`module`，`injectable`或者`controller`中注册代码)的能力。

### 生命周期序列

下图描述了关键应用生命周期事件序列，从应用引导之时到node应用退出。我们可以把整个生命周期划分为三个阶段：初始化，运行和终止。使用生命周期，你可以合理计划模块和服务的初始化，管理活动链接，并且在应用程序收到终止指令时优雅地退出。

![生命周期钩子](https://docs.nestjs.com/assets/lifecycle-events.png)

### 生命周期事件

生命周期事件在应用初始化与终止时发生。Nest在`modules`，`injectables`和`controllers`的以下每个生命周期事件(首先要使能shutdown钩子，如下描述)中调用注册钩子方法。和上图所示的一样，Nest也调用合适的底层方法来监听连接，以及终止监听连接。

在下述表格中，`onModuleDestroy`, `beforeApplicationShutdown`和 `onApplicationShutdown`仅仅在显式调用`app.close()`或者应用收到特定系统信号(例如 SIGTERM)并且在初始化时(参见下表的应用`shutdown`部分)正确调用了`enableShutdownHooks`方法后被触发。

|生命周期钩子方法|生命周期时间触发钩子方法调用|
| ------------------------ | ----------------------------------------------- |
| `OnModuleInit()`           | 初始化主模块依赖处理后调用一次|
| `OnApplicationBootstrap()` | 在应用程序完全启动并监听连接后调用一次|
| `OnModuleDestroy()`        | 收到终止信号(例如SIGTERM)后调用 |
|`beforeApplicationShutdown()`|在`onModuleDestroy()`完成(Promise被resolved或者rejected)；一旦完成，将关闭所有连接(调用app.close() 方法).|
| `OnApplicationShutdown()`  | 连接关闭处理时调用(app.close())|

!> 上述列出的生命周期钩子没有被请求范围类触发。请求范围类并没有和生命周期以及不可预测的寿命绑定。他们为每个请求单独创建，并在响应发送后通过垃圾清理系统自动清理。

### 使用

所有应用周期的钩子都有接口表示，接口在技术上是可选的，因为它们在 `TypeScript` 编译之后就不存在了。尽管如此，为了从强类型和编辑器工具中获益，使用它们是一个很好的实践。要使用合适的接口。例如，要注册一个方法在特定类(例如，控制器，提供者或者模块)初始化时调用，使用`OnModuleInit`接口，提供`onModuleInit()`方法，如下：

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class UsersService implements OnModuleInit {
  onModuleInit() {
    console.log(`The module has been initialized.`);
  }
}
```
### 异步初始化

此外，`OnModuleInit` 和 `OnApplicationBootstrap` 钩子都允许您延迟应用程序初始化过程(返回一个`Promise`或在方法主体中将方法标记为`async`和`await`异步方法)。

```typescript
async onModuleInit(): Promise<void> {
  await this.fetch();
}
```

### Application Shutdown

`onModuleDestroy()`, `beforeApplicationShutdown()`和 `onApplicationShutdown()`钩子程序响应系统终止信号(当应用程序通过显示调用`app.close()`或者收到`SIGTERM`系统信号时)，以优雅地关闭 `Nest` 应用程序。这一功能通常用于 `Kubernetes` 、`Heroku` 或类似的服务。

系统关闭钩子消耗系统资源，因此默认是禁用的。要使用此钩子，必须通过`enableShutdownHooks()`激活侦听器。

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Starts listening to shutdown hooks
  app.enableShutdownHooks();
  await app.listen(3000);
}
bootstrap();
```
!> 由于平台限制，NestJs的关闭钩子在Windows下有一些限制。`SIGINT`，`SIGBREAK`以及一些`SIGHUP`信号可以工作--[阅读更多](https://nodejs.org/api/process.html#process_signal_events)。然而，`SIGTERM`在Windows下不工作，因为在任务管理器中关闭一个线程是无条件的。“例如，应用没有办法发现或者阻止它”。一些Windows下关于`SIGINT`和`SIGBREAK`的libuv的[相关文档](https://docs.libuv.org/en/v1.x/signal.html)。参见Nodejs的[线程信号事件](https://nodejs.org/api/process.html#process_signal_events)文档。

?> `enableShutdownHooks`开始监听时消耗内存。如果要在一个单独Node线程中运行多个Nest应用(例如，使用多个Jest运行测试)，Node会抱怨监听者太多。出于这个原因，`enableShutdownHooks`默认未启用。要在单个Node进程中运行多个实例时尤其要注意这一点。

如果应用程序接收到一个终止信号，它将会依次调用注册的`onModuleDestroy()`, `beforeApplicationShutdown()`和`onApplicationShutdown()`方法，将响应信号作为第一个参数。如果一个注册函数等待异步调用(作为promise)，那么在 `promise` 被解析或拒绝之前，它不会关闭 Nest 应用程序。

```typescript
@Injectable()
class UsersService implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.log(signal); // e.g. "SIGINT"
  }
}
```

## 跨平台

`Nest`的作为一个跨平台的框架。平台独立性使得**创建可重用的逻辑部分**成为可能，人们可以利用这种逻辑部件跨多种不同类型的应用程序。例如，多数模块可以在不修改的情况下复用于不同的HTTP服务器框架(例如Express和Fastify)，甚至跨越不同的应用类型(例如HTTP服务器框架，不同传输层的微服务，以及WebSockets)。

### 一次编译, 各处运行

**概览**主要涉及 `HTTP` 服务器( `REST APIs`或者MVC风格的服务器端渲染应用 )。但是，所有这些构建的模块都可以轻松用于不同的传输层(`microservices`或`websockets`)。

此外，`Nest` 还配备了专用的 [GraphQL](8/graphql)模块。最后但并非最不重要的一点是, [执行上下文](8/applicationcontext)功能有助于通过 `Nest` 创建在 `Node.js` 上运行的所有应用。

应用上下文特性有助于在Nest之上创建任何类型的Node.js应用，包括CRON定时工作和CLI命令行工具。

`Nest` 希望成为 `Node.js` 应用程序的完整平台，为您的应用程序带来更高级别的模块化和可重用性。一次构建，可在任何地方使用！

## 测试

自动化测试是成熟**软件产品**的重要组成部分。对于覆盖系统中关键的部分是极其重要的。自动化测试使开发过程中的重复独立测试或单元测试变得快捷。这有助于保证发布的质量和性能。在关键开发周期例如源码检入，特征集成和版本管理中使用自动化测试有助于提高覆盖率以及提高开发人员生产力。

测试通常包括不同类型，包括单元测试，端到端(e2e)测试，集成测试等。虽然其优势明显，但是配置往往繁复。`Nest` 提供了一系列改进测试体验的测试实用程序，包括下列有助于开发者和团队建立自动化测试的特性：

- 对于组件和应用e2e测试的自动测试脚手架。
- 提供默认工具(例如`test runner`构建隔离的模块，应用载入器)。
- 提供[Jest](https://github.com/facebook/jest)和[SuperTest](https://github.com/visionmedia/supertest)开箱即用的集成。兼容其他测试工具。
- 在测试环境中保证Nest依赖注入系统可用以简化模拟组件。

通常，您可以使用您喜欢的任何**测试框架**，Nest对此并未强制指定特定工具。简单替换需要的元素(例如`test runner`)，仍然可以享受Nest准备好的测试工具的优势。

### 安装

首先，我们需要安装所需的 `npm` 包:

```bash
$ npm i --save-dev @nestjs/testing
```
###  单元测试

 在下面的例子中，我们有两个不同的类，分别是 `CatsController` 和 `CatsService` 。如前所述，Jest被用作一个完整的测试框架。该框架是test runner, 并提供断言函数和提升测试实用工具，以帮助 `mocking`，`spying` 等。以下示例中，我们手动实例化这些类，并保证控制器和服务满足他们的API接口。


 > cats.controller.spec.ts

 ```typescript
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;

  beforeEach(() => {
    catsService = new CatsService();
    catsController = new CatsController(catsService);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = ['test'];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    });
  });
});
 ```

?> 保持你的测试文件测试类附近。测试文件必须以 `.spec` 或 `.test` 结尾

到目前为止，我们没有使用任何现有的 `Nest` 测试工具。实际上，我们甚至没有使用依赖注入(注意我们把`CatsService`实例传递给了`catsController`)。由于我们手动处理实例化测试类，因此上面的测试套件与 `Nest` 无关。这种类型的测试称为**隔离测试**。我们接下来介绍一下利用Nest功能提供的更先进的测试应用。

### 测试工具

`@nestjs/testing` 包给了我们一套提升测试过程的实用工具。让我们重写前面的例子，但现在使用内置的 `Test` 类。

> cats.controller.spec.ts

```typescript
import { Test } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        controllers: [CatsController],
        providers: [CatsService],
      }).compile();

    catsService = moduleRef.get<CatsService>(CatsService);
    catsController = moduleRef.get<CatsController>(CatsController);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = ['test'];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    });
  });
});
```
`Test`类提供应用上下文以模拟整个Nest运行时，这一点很有用。 `Test` 类有一个 `createTestingModule()` 方法，该方法将模块的元数据（与在 `@Module()` 装饰器中传递的对象相同的对象）作为参数。这个方法创建了一个 `TestingModule` 实例，该实例提供了一些方法，但是当涉及到单元测试时，这些方法中只有 `compile()` 是有用的。这个方法初始化一个模块和它的依赖(和传统应用中从`main.ts`文件使用`NestFactory.create()`方法类似)，并返回一个准备用于测试的模块。

?> `compile()`方法是**异步**的，因此必须等待执行完成。一旦模块编译完成，您可以使用 `get()` 方法获取任何声明的静态实例(控制器和提供者)。

`TestingModule`继承自[module reference](https://docs.nestjs.com/fundamentals/module-ref)类，因此具备动态处理提供者的能力(暂态的或者请求范围的)，可以使用`resolve() `方法(`get()`方法尽可以获取静态实例).

```typescript
const moduleRef = await Test.createTestingModule({
  controllers: [CatsController],
  providers: [CatsService],
}).compile();

catsService = await moduleRef.resolve(CatsService);
```

!> `resolve()`方法从其自身的注入容器子树返回一个提供者的单例，每个子树都有一个独有的上下文引用。因此，如果你调用这个方法多次，可以看到它们是不同的。

为了模拟一个真实的实例，你可以用自定义的提供者[用户提供者](8/fundamentals?id=自定义提供者)覆盖现有的提供者。例如，你可以模拟一个数据库服务来替代连接数据库。在下一部分中我们会这么做，但也可以在单元测试中这样使用。

### 端到端测试(E2E)

与重点在控制单独模块和类的单元测试不同，端对端测试在更聚合的层面覆盖了类和模块的交互——和生产环境下终端用户类似。当应用程序代码变多时，很难手动测试每个 `API` 端点的行为。端到端测试帮助我们确保一切工作正常并符合项目要求。为了执行 `e2e` 测试，我们使用与**单元测试**相同的配置，但另外我们使用[supertest](https://github.com/visionmedia/supertest)模拟 `HTTP` 请求。

>cats.e2e-spec.ts

```typescript
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { CatsModule } from '../../src/cats/cats.module';
import { CatsService } from '../../src/cats/cats.service';
import { INestApplication } from '@nestjs/common';

describe('Cats', () => {
  let app: INestApplication;
  let catsService = { findAll: () => ['test'] };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CatsModule],
    })
      .overrideProvider(CatsService)
      .useValue(catsService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET cats`, () => {
    return request(app.getHttpServer())
      .get('/cats')
      .expect(200)
      .expect({
        data: catsService.findAll(),
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```
?> 如果使用Fasify作为HTTP服务器，在配置上有所不同，其有一些内置功能：

```typescript
let app: NestFastifyApplication;

beforeAll(async () => {
  app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );

  await app.init();
  await app.getHttpAdapter().getInstance().ready();
})

it(`/GET cats`, () => {
  return app
    .inject({
      method: 'GET',
      url: '/cats'
    }).then(result => {
      expect(result.statusCode).toEqual(200)
      expect(result.payload).toEqual(/* expectedPayload */)
    });
})
```

在这个例子中，我们使用了之前描述的概念，在之前使用的`compile()`外，我们使用`createNestApplication()`方法来实例化一个Nest运行环境。我们在app变量中储存了一个app引用以便模拟HTTP请求。

使用Supertest的`request()`方法来模拟HTTP请求。我们希望这些HTTP请求访问运行的Nest应用，因此向`request()`传递一个Nest底层的HTTP监听者(可能由Express平台提供)，以此构建请求(`app.getHttpServer()`)，调用`request()`交给我们一个包装的HTTP服务器以连接Nest应用，它暴露了模拟真实HTTP请求的方法。例如，使用`request(...).get('/cats')`将初始化一个和真实的从网络来的`get '/cats'`相同的HTTP请求。

在这个例子中，我们也提供了一个可选的`CatsService`(test-double)应用，它返回一个硬编码值供我们测试。使用`overrideProvider()`来进行覆盖替换。类似地，Nest也提供了覆盖守卫，拦截器，过滤器和管道的方法：`overrideGuard()`, `overrideInterceptor()`, `overrideFilter()`, `overridePipe()`。

每个覆盖方法返回包括3个不同的在自定义提供者中描述的方法镜像：

- `useClass`: 提供一个类来覆盖对象(提供者，守卫等)。
- `useValue`: 提供一个实例来覆盖对象。
- `useFactory`: 提供一个方法来返回覆盖对象的实例。


每个覆盖方法都返回`TestingModule`实例，可以通过链式写法与其他方法连接。可以在结尾使用`compile()`方法以使Nest实例化和初始化模块。

The compiled module has several useful methods, as described in the following table:
`cats.e2e-spec.ts`测试文件包含一个 `HTTP` 端点测试(`/cats`)。我们使用 `app.getHttpServer()`方法来获取在 `Nest` 应用程序的后台运行的底层 `HTTP` 服务。请注意，`TestingModule`实例提供了 `overrideProvider()` 方法，因此我们可以覆盖导入模块声明的现有提供程序。另外，我们可以分别使用相应的方法，`overrideGuard()`，`overrideInterceptor()`，`overrideFilter()`和`overridePipe()`来相继覆盖守卫，拦截器，过滤器和管道。

编译好的模块有几种在下表中详细描述的方法：

|||
|----|---|
| `createNestInstance()`|基于给定模块创建一个Nest实例（返回`INestApplication`）,请注意，必须使用`init()`方法手动初始化应用程序|
| `createNestMicroservice()`|基于给定模块创建Nest微服务实例（返回`INestMicroservice）`|
| `get()`|从`module reference`类继承，检索应用程序上下文中可用的控制器或提供程序（包括警卫，过滤器等）的实例|
| `resolve()`|从`module reference`类继承，检索应用程序上下文中控制器或提供者动态创建的范围实例（包括警卫，过滤器等）的实例|
| `select()`|浏览模块树，从所选模块中提取特定实例（与`get()`方法中严格模式`{strict：true}`一起使用)|


?> 将您的 `e2e` 测试文件保存在 `test` 目录下, 并且以 `.e2e-spec` 或 `.e2e-test` 结尾。

### 覆盖全局注册的强化程序

如果有一个全局注册的守卫 (或者管道，拦截器或过滤器),可能需要更多的步骤来覆盖他们。 将原始的注册做如下修改:

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],
```

这样通过`APP_*`把守卫注册成了`“multi”-provider`。要在这里替换 JwtAuthGuard`，应该在槽中使用现有提供者。

```typescript
providers: [
  {
    provide: APP_GUARD,
    useExisting: JwtAuthGuard,
  },
  JwtAuthGuard,
],
```

?> 将`useClass`修改为`useExisting`来引用注册提供者，而不是在令牌之后使用Nest实例化。

现在`JwtAuthGuard`在Nest可以作为一个常规的提供者，也可以在创建`TestingModule`时被覆盖 :

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideProvider(JwtAuthGuard)
  .useClass(MockAuthGuard)
  .compile();
```
这样测试就会在每个请求中使用`MockAuthGuard`。

### 测试请求范围实例

请求范围提供者针对每个请求创建。其实例在请求处理完成后由垃圾回收机制销毁。这产生了一个问题，因为我们无法针对一个测试请求获取其注入依赖子树。

我们知道(基于前节内容)，`resolve()`方法可以用来获取一个动态实例化的类。因此，我们可以传递一个独特的上下文引用来控制注入容器子树的声明周期。如何来在测试上下文中暴露它呢？

策略是生成一个上下文向前引用并且强迫Nest使用这个特殊ID来为所有输入请求创建子树。这样我们就可以获取为测试请求创建的实例。

将`jest.spyOn()`应用于`ContextIdFactory`来实现此目的:

```typescript
const contextId = ContextIdFactory.create();
jest
  .spyOn(ContextIdFactory, 'getByRequest')
  .mockImplementation(() => contextId);
```
现在我们可以使用这个`contextId`来在任何子请求中获取一个生成的注入容器子树。

```typescript
catsService = await moduleRef.resolve(CatsService, contextId);
```

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|

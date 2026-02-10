# 动态模块

[模块章节](/overview/modules)介绍了 Nest 模块的基础知识，并简要提及了[动态模块](/overview/modules#动态模块) 。本章将深入探讨动态模块的主题。学习完成后，您将充分理解它们的概念、使用方法及适用场景。

#### 介绍

文档**概述**部分中的大多数应用代码示例都使用常规（静态）模块。模块定义了如[提供者](/overview/providers)和[控制器](/overview/controllers)等组件的集合，这些组件作为整体应用的模块化部分协同工作。它们为这些组件提供了执行上下文或作用域。例如，模块中定义的提供者对该模块的其他成员可见，无需显式导出。当提供者需要在模块外部可见时，需先从其宿主模块导出，再导入到消费模块中。

让我们通过一个熟悉的示例来说明。

首先，我们将定义一个 `UsersModule` 来提供并导出 `UsersService`。`UsersModule` 就是 `UsersService` 的**宿主**模块。

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

接下来，我们将定义一个 `AuthModule`，它导入 `UsersModule`，使得 `UsersModule` 导出的提供者可以在 `AuthModule` 内部使用：

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

这些结构允许我们注入 `UsersService`，例如注入到托管在 `AuthModule` 中的 `AuthService` 里：

```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  /*
    Implementation that makes use of this.usersService
  */
}
```

我们将这称为**静态**模块绑定。Nest 连接模块所需的所有信息都已经在宿主模块和消费模块中声明完毕。让我们解析这个过程发生了什么。Nest 通过以下方式使 `UsersService` 在 `AuthModule` 中可用：

1.  实例化 `UsersModule`，包括递归导入 `UsersModule` 自身消费的其他模块，并递归解析所有依赖项（参见[自定义提供者](/fundamentals/dependency-injection) ）。
2.  实例化 `AuthModule`，并使 `UsersModule` 导出的提供者可用于 `AuthModule` 中的组件（就像它们原本就是在 `AuthModule` 中声明的一样）。
3.  在 `AuthService` 中注入 `UsersService` 的实例。

#### 动态模块使用场景

使用静态模块绑定时，消费模块无法**影响**提供者在宿主模块中的配置方式。为什么这一点很重要？考虑这种情况：我们有一个通用模块需要在不同使用场景中表现出不同行为。这与许多系统中的"插件"概念类似，通用功能需要先进行某些配置才能被消费者使用。

Nest 框架中的一个典型示例是**配置模块** 。许多应用程序发现，通过使用配置模块将配置细节外部化非常有用。这使得在不同部署环境中动态更改应用设置变得简单：例如为开发者使用开发数据库，为预发布/测试环境使用预发布数据库等。通过将配置参数的管理委托给配置模块，应用程序源代码得以与配置参数保持独立。

挑战在于配置模块本身是通用的（类似于"插件"），需要由使用它的模块进行定制。这正是**动态模块**发挥作用的地方。利用动态模块特性，我们可以使配置模块**动态化** ，这样使用模块就能通过 API 控制在导入时如何定制配置模块。

换句话说，动态模块提供了一个 API 用于将一个模块导入另一个模块，并在导入时定制该模块的属性和行为，这与我们目前所见的静态绑定方式形成对比。

#### 配置模块示例

我们将使用[配置章节](/techniques/configuration#服务)中示例代码的基础版本作为本节内容。本章节完成后的最终版本可在此处获取[完整示例](https://github.com/nestjs/nest/tree/master/sample/25-dynamic-modules) 。

我们的需求是让 `ConfigModule` 能够接收一个 `options` 对象来实现自定义功能。以下是我们要支持的特性：基础示例中将 `.env` 文件的位置硬编码为项目根目录。假设我们希望使其可配置，这样您就可以将 `.env` 文件存放在任意选择的文件夹中。例如，您可能希望将各种 `.env` 文件存储在项目根目录下名为 `config` 的文件夹中（即与 `src` 文件夹同级）。您希望在不同项目中使用 `ConfigModule` 时能够选择不同的文件夹。

动态模块使我们能够向导入的模块传递参数，从而改变其行为。让我们看看这是如何实现的。如果从消费模块的角度出发，先设想最终效果，再逆向推导实现方式，会更有帮助。首先，快速回顾一下*静态*导入 `ConfigModule` 的示例（即无法影响被导入模块行为的传统方式）。请特别注意 `@Module()` 装饰器中 `imports` 数组的写法：

```typescript title="app.module.ts"
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

现在让我们思考一下*动态模块*导入（传入配置对象的情况）会是什么样子。比较这两个示例中 `imports` 数组的区别：

```typescript title="app.module.ts"
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

让我们看看上面动态示例中发生了什么。有哪些关键组成部分？

1.  `ConfigModule` 是一个普通类，因此我们可以推断它必定拥有一个名为 `register()` 的**静态方法** 。我们知道它是静态的，因为是在 `ConfigModule` 类上调用，而非该类的**实例** 。注意：这个我们即将创建的方法可以任意命名，但按照惯例应命名为 `forRoot()` 或 `register()`。
2.  `register()` 方法由我们定义，因此可以接受任意输入参数。本例中我们将接收一个具有适当属性的简单 `options` 对象，这是典型做法。
3.  可以推断 `register()` 方法必须返回类似 `module` 的内容，因为其返回值出现在熟悉的 `imports` 列表中——我们已知该列表目前包含一系列模块。

实际上，我们的 `register()` 方法将返回一个 `DynamicModule`。动态模块不过是在运行时创建的模块，具有与静态模块完全相同的属性，外加一个名为 `module` 的附加属性。让我们快速回顾一个静态模块声明的示例，特别注意传递给装饰器的模块选项：

```typescript
@Module({
  imports: [DogsModule],
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})
```

动态模块必须返回一个具有完全相同接口的对象，外加一个名为 `module` 的附加属性。`module` 属性用作模块名称，应与模块的类名相同，如下例所示。

:::info 注意
对于动态模块，模块选项对象的所有属性都是可选的**除了** `module`。
:::


那么静态的 `register()` 方法呢？我们现在可以明白，它的作用是返回一个具有 `DynamicModule` 接口的对象。当我们调用它时，实际上是在向 `imports` 列表提供一个模块，这与我们在静态情况下通过列出模块类名（如 `imports: [UsersModule]`）的做法类似。换句话说，动态模块 API 只是返回一个模块，但我们不是通过 `@Module` 装饰器固定属性，而是以编程方式指定它们。

还有几个细节需要说明以完善整个图景：

1.  我们现在可以说明，`@Module()` 装饰器的 `imports` 属性不仅可以接受模块类名（例如 `imports: [UsersModule]`），还可以接受一个**返回**动态模块的函数（如 `imports: [ConfigModule.register(...)]` ）。
2.  动态模块本身可以导入其他模块。虽然本例中我们不会这样做，但如果动态模块依赖于其他模块中的提供者，你可以通过可选的 `imports` 属性来导入它们。这与使用 `@Module()` 装饰器为静态模块声明元数据的方式完全类似。

基于这一理解，我们现在可以看看动态 `ConfigModule` 声明应该是什么样子。让我们尝试实现它。

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

现在应该很清楚这些部分是如何结合在一起的。调用 `ConfigModule.register(...)` 会返回一个 `DynamicModule` 对象，其属性本质上与我们之前通过 `@Module()` 装饰器提供的元数据相同。

:::info 提示
从 `@nestjs/common` 导入 `DynamicModule`。
:::

我们的动态模块目前还不太有趣，因为我们尚未实现之前提到的**配置**功能。接下来我们就来解决这个问题。

#### 模块配置

正如我们之前猜测的那样，定制 `ConfigModule` 行为的明显解决方案是在静态 `register()` 方法中传递一个 `options` 对象。让我们再次看看消费模块的 `imports` 属性：

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

这样就能很好地处理将 `options` 对象传递给我们的动态模块了。那么如何在 `ConfigModule` 中使用这个 `options` 对象呢？让我们思考一下。我们知道 `ConfigModule` 本质上是一个用于提供和导出可注入服务（即 `ConfigService`）以供其他提供者使用的主模块。实际上需要读取 `options` 对象来定制其行为的是我们的 `ConfigService`。现在假设我们已经知道如何将 `options` 从 `register()` 方法传递到 `ConfigService` 中。基于这个假设，我们可以对该服务进行一些修改，使其能够根据 `options` 对象的属性来定制行为。（ **注意** ：由于目前我们*尚未*真正确定如何传递它，所以暂时先硬编码 `options`，稍后会解决这个问题）。

```typescript
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
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

现在我们的 `ConfigService` 已经知道如何在 `options` 中指定的文件夹里找到 `.env` 文件。

我们剩下的任务是如何将 `register()` 步骤中的 `options` 对象注入到 `ConfigService` 中。当然，我们会使用*依赖注入*来实现这一点。这是关键点，请务必理解。我们的 `ConfigModule` 提供了 `ConfigService`，而 `ConfigService` 又依赖于仅在运行时提供的 `options` 对象。因此，在运行时，我们需要先将 `options` 对象绑定到 Nest IoC 容器，然后让 Nest 将其注入到 `ConfigService` 中。记得在**自定义提供者**章节中提到的，提供者可以[包含任何值](/fundamentals/dependency-injection#非基于服务的提供者) ，而不仅仅是服务，所以我们可以放心使用依赖注入来处理简单的 `options` 对象。

我们先解决将选项对象绑定到 IoC 容器的问题。这需要在静态的 `register()` 方法中完成。注意我们正在动态构建一个模块，而模块的属性之一就是它的提供者列表。因此我们需要将选项对象定义为一个提供者，这样它就能被注入到 `ConfigService` 中（下一步会用到这个特性）。在下面代码中，请特别注意 `providers` 数组：

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({})
export class ConfigModule {
  static register(options: Record<string, any>): DynamicModule {
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

现在我们可以通过向 `ConfigService` 注入 `'CONFIG_OPTIONS'` 提供者来完成整个过程。注意当使用非类令牌定义提供者时，需要按照[这里的说明](/fundamentals/dependency-injection#非基于类的提供者令牌)使用 `@Inject()` 装饰器。

```typescript
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Inject } from '@nestjs/common';
import { EnvConfig } from './interfaces';

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(@Inject('CONFIG_OPTIONS') private options: Record<string, any>) {
    const filePath = `${process.env.NODE_ENV || 'development'}.env`;
    const envFile = path.resolve(__dirname, '../../', options.folder, filePath);
    this.envConfig = dotenv.parse(fs.readFileSync(envFile));
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
```

最后提示：为了方便起见，上面我们使用了字符串形式的注入令牌(`'CONFIG_OPTIONS'`)，但最佳实践是将其定义为单独文件中的常量（或 `Symbol`）并导入该文件。例如：

```typescript
export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
```

#### 示例

本章完整代码示例可在此处[查看](https://github.com/nestjs/nest/tree/master/sample/25-dynamic-modules) 。

#### 社区规范

你可能在一些 `@nestjs/` 包中见过类似 `forRoot`、`register` 和 `forFeature` 这样的方法，并想知道它们之间的区别。虽然没有硬性规定，但 `@nestjs/` 包通常会遵循以下准则：

当创建模块时：

- `register`，表示你希望配置一个动态模块，该配置仅由调用模块使用。例如，使用 Nest 的 `@nestjs/axios`： `HttpModule.register({ baseUrl: 'someUrl' })` 。如果在另一个模块中使用 `HttpModule.register({ baseUrl: 'somewhere else' })` ，它将具有不同的配置。你可以根据需要为任意多个模块进行此操作。
- `forRoot`，表示你希望一次性配置动态模块，并在多个地方复用该配置（尽管可能由于抽象而不知情）。这就是为什么你只有一个 `GraphQLModule.forRoot()`、一个 `TypeOrmModule.forRoot()` 等。
- `forFeature`，表示你希望使用动态模块的 `forRoot` 配置，但需要根据调用模块的需求修改某些特定配置（例如该模块应访问哪些存储库，或记录器应使用的上下文）。

通常，这些方法都有对应的异步版本，如 `registerAsync`、`forRootAsync` 和 `forFeatureAsync`，它们功能相同，但会使用 Nest 的依赖注入机制来处理配置。

#### 可配置模块构建器

由于手动创建高度可配置的动态模块并暴露异步方法（如 `registerAsync`、`forRootAsync` 等）相当复杂，尤其对新手而言，Nest 提供了 `ConfigurableModuleBuilder` 类来简化这一过程，只需几行代码就能构建模块"蓝图"。

例如，我们将上面使用的 `ConfigModule` 示例改用 `ConfigurableModuleBuilder` 实现。开始前，先确保创建一个专用接口来表示 `ConfigModule` 接收的选项。

```typescript
export interface ConfigModuleOptions {
  folder: string;
}
```

在此基础上，新建一个专用文件（与现有的 `config.module.ts` 文件放在一起）并命名为 `config.module-definition.ts`。在此文件中，我们将使用 `ConfigurableModuleBuilder` 来构建 `ConfigModule` 的定义。

 ```typescript title="config.module-definition.ts"
import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ConfigModuleOptions } from './interfaces/config-module-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigModuleOptions>().build();
```

现在打开 `config.module.ts` 文件，修改其实现以利用自动生成的 `ConfigurableModuleClass`：

```typescript
import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigurableModuleClass } from './config.module-definition';

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule extends ConfigurableModuleClass {}
```

继承 `ConfigurableModuleClass` 意味着 `ConfigModule` 现在不仅提供 `register` 方法（如之前自定义实现那样），还提供 `registerAsync` 方法，该方法允许使用者异步配置模块，例如通过提供异步工厂：

```typescript
@Module({
  imports: [
    ConfigModule.register({ folder: './config' }),
    // or alternatively:
    // ConfigModule.registerAsync({
    //   useFactory: () => {
    //     return {
    //       folder: './config',
    //     }
    //   },
    //   inject: [...any extra dependencies...]
    // }),
  ],
})
export class AppModule {}
```

`registerAsync` 方法接收以下对象作为参数：

```typescript
{
  /**
   * Injection token resolving to a class that will be instantiated as a provider.
   * The class must implement the corresponding interface.
   */
  useClass?: Type<
    ConfigurableModuleOptionsFactory<ModuleOptions, FactoryClassMethodKey>
  >;
  /**
   * Function returning options (or a Promise resolving to options) to configure the
   * module.
   */
  useFactory?: (...args: any[]) => Promise<ModuleOptions> | ModuleOptions;
  /**
   * Dependencies that a Factory may inject.
   */
  inject?: FactoryProvider['inject'];
  /**
   * Injection token resolving to an existing provider. The provider must implement
   * the corresponding interface.
   */
  useExisting?: Type<
    ConfigurableModuleOptionsFactory<ModuleOptions, FactoryClassMethodKey>
  >;
}
```

让我们逐一理解上述属性：

- `useFactory` - 一个返回配置对象的工厂函数，可以是同步或异步的。要注入依赖到该工厂函数中，需使用 `inject` 属性。我们在前文示例中采用了这种形式。
- `inject` - 将被注入工厂函数的依赖项数组。依赖项的顺序必须与工厂函数参数的顺序保持一致。
- `useClass` - 将被实例化为提供者的类，该类必须实现相应接口。通常这是一个提供 `create()` 方法的类，该方法返回配置对象。更多细节请参阅下文[自定义方法键](/fundamentals/dynamic-modules#自定义方法键)章节。
- `useExisting` - `useClass` 的变体，允许使用现有提供者而非指示 Nest 创建类的新实例。当需要使用已在模块中注册的提供者时，这非常有用。请注意，该类必须实现与 `useClass` 相同的接口（因此必须提供 `create()` 方法，除非重写默认方法名称，参见下方的[自定义方法键](/fundamentals/dynamic-modules#自定义方法键)部分）。

请务必从上述选项（`useFactory`、`useClass` 或 `useExisting`）中选择其一，因为它们互斥。

最后，我们将更新 `ConfigService` 类，注入生成的模块选项提供者，而非之前使用的 `'CONFIG_OPTIONS'`。

```typescript
@Injectable()
export class ConfigService {
  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: ConfigModuleOptions) { ... }
}
```

#### 自定义方法键

默认情况下，`ConfigurableModuleClass` 提供 `register` 及其对应方法 `registerAsync`。如需使用不同方法名，可采用 `ConfigurableModuleBuilder#setClassMethodName` 方法，如下所示：

 ```typescript title="config.module-definition.ts"
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigModuleOptions>().setClassMethodName('forRoot').build();
```

此构造将指示 `ConfigurableModuleBuilder` 生成一个公开 `forRoot` 和 `forRootAsync` 的类。示例：

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ folder: './config' }), // <-- note the use of "forRoot" instead of "register"
    // or alternatively:
    // ConfigModule.forRootAsync({
    //   useFactory: () => {
    //     return {
    //       folder: './config',
    //     }
    //   },
    //   inject: [...any extra dependencies...]
    // }),
  ],
})
export class AppModule {}
```

#### 自定义选项工厂类

由于 `registerAsync` 方法（或根据配置命名为 `forRootAsync` 等其他名称）允许使用者传入解析为模块配置的提供者定义，库使用者可以提供一个用于构建配置对象的类。

```typescript
@Module({
  imports: [
    ConfigModule.registerAsync({
      useClass: ConfigModuleOptionsFactory,
    }),
  ],
})
export class AppModule {}
```

默认情况下，该类必须提供 `create()` 方法以返回模块配置对象。但如果您的库遵循不同的命名约定，可以通过 `ConfigurableModuleBuilder#setFactoryMethodName` 方法调整此行为，指示 `ConfigurableModuleBuilder` 改用其他方法（例如 `createConfigOptions`）：

 ```typescript title="config.module-definition.ts"
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigModuleOptions>().setFactoryMethodName('createConfigOptions').build();
```

现在，`ConfigModuleOptionsFactory` 类需要公开 `createConfigOptions` 方法（而非原先的 `create` 方法）：

```typescript
@Module({
  imports: [
    ConfigModule.registerAsync({
      useClass: ConfigModuleOptionsFactory, // <-- this class must provide the "createConfigOptions" method
    }),
  ],
})
export class AppModule {}
```

#### 扩展选项

在某些特殊情况下，模块可能需要接收决定其行为方式的额外选项（典型的例子如 `isGlobal` 标志或简写形式 `global`），但这些选项不应包含在 `MODULE_OPTIONS_TOKEN` 提供者中（因为这些选项与模块内注册的服务/提供者无关，例如 `ConfigService` 无需知晓其宿主模块是否注册为全局模块）。

在此类情况下，可以使用 `ConfigurableModuleBuilder#setExtras` 方法。参见以下示例：

```typescript
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigModuleOptions>()
    .setExtras(
      {
        isGlobal: true,
      },
      (definition, extras) => ({
        ...definition,
        global: extras.isGlobal,
      })
    )
    .build();
```

上述示例中，传入 `setExtras` 方法的第一个参数是包含"extra"属性默认值的对象。第二个参数是一个函数，该函数接收自动生成的模块定义（包含 `provider`、`exports` 等）和表示额外属性的 `extras` 对象（可能是使用者指定的值或默认值）。该函数的返回值是修改后的模块定义。在这个具体示例中，我们获取 `extras.isGlobal` 属性并将其赋值给模块定义的 `global` 属性（该属性继而决定模块是否为全局模块，更多信息请参阅[此处](/overview/modules#动态模块) ）。

现在当使用此模块时，可以传入额外的 `isGlobal` 标志，如下所示：

```typescript
@Module({
  imports: [
    ConfigModule.register({
      isGlobal: true,
      folder: './config',
    }),
  ],
})
export class AppModule {}
```

但由于 `isGlobal` 被声明为"extra"属性，它将不会出现在 `MODULE_OPTIONS_TOKEN` 提供者中：

```typescript
@Injectable()
export class ConfigService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: ConfigModuleOptions
  ) {
    // "options" object will not have the "isGlobal" property
    // ...
  }
}
```

#### 扩展自动生成的方法

如有需要，可以扩展自动生成的静态方法（`register`、`registerAsync` 等），如下所示：

```typescript
import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import {
  ConfigurableModuleClass,
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
} from './config.module-definition';

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule extends ConfigurableModuleClass {
  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    return {
      // your custom logic here
      ...super.register(options),
    };
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      // your custom logic here
      ...super.registerAsync(options),
    };
  }
}
```

请注意使用必须从模块定义文件中导出的 `OPTIONS_TYPE` 和 `ASYNC_OPTIONS_TYPE` 类型：

```typescript
export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<ConfigModuleOptions>().build();
```

<!-- 此文件从 content/fundamentals\dynamic-modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T07:09:52.873Z -->
<!-- 源文件: content/fundamentals\dynamic-modules.md -->

### 动态模块

[模块章节](/modules)涵盖了Nest模块的基础知识，并包括了[动态模块](/modules#动态模块)的简要介绍。本章将详细介绍动态模块的主题。完成本章后，您应该对动态模块是什么、如何使用以及何时使用有很好的理解。

#### 介绍

文档**概述**部分中的大多数应用程序代码示例都使用常规的或静态的模块。模块定义了组件组，如[提供者](/providers)和[控制器](/controllers)，它们作为整体应用程序的模块化部分组合在一起。它们为这些组件提供执行上下文或作用域。例如，在模块中定义的提供者对模块的其他成员可见，无需导出它们。当提供者需要在模块外部可见时，它首先从其宿主模块导出，然后导入到其消费模块中。

让我们通过一个熟悉的示例来了解。

首先，我们将定义一个`UsersModule`来提供和导出`UsersService`。`UsersModule`是`UsersService`的**宿主**模块。

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

接下来，我们将定义一个`AuthModule`，它导入`UsersModule`，使`UsersModule`的导出提供者在`AuthModule`内部可用：

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

这些构造允许我们在例如`AuthModule`中托管的`AuthService`中注入`UsersService`：

```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  /*
    使用 this.usersService 的实现
  */
}
```

我们将此称为**静态**模块绑定。Nest将模块连接在一起所需的所有信息已经在宿主和消费模块中声明。让我们分解这个过程中发生的事情。Nest通过以下方式使`UsersService`在`AuthModule`内部可用：

1. 实例化`UsersModule`，包括传递性导入`UsersModule`本身消费的其他模块，并传递性解析任何依赖项（请参阅[自定义提供者](/fundamentals/custom-providers)）。
2. 实例化`AuthModule`，并使`UsersModule`的导出提供者对`AuthModule`中的组件可用（就像它们在`AuthModule`中声明一样）。
3. 在`AuthService`中注入`UsersService`的实例。

#### 动态模块用例

使用静态模块绑定，消费模块没有机会**影响**来自宿主模块的提供者如何配置。为什么这很重要？考虑我们有一个通用模块，需要在不同用例中表现不同的情况。这类似于许多系统中的"插件"概念，其中通用设施在被消费者使用之前需要一些配置。

Nest中的一个很好的例子是**配置模块**。许多应用程序发现通过使用配置模块来外部化配置细节是有用的。这使得在不同部署中动态更改应用程序设置变得容易：例如，开发人员的开发数据库，暂存/测试环境的暂存数据库等。通过将配置参数的管理委托给配置模块，应用程序源代码保持与配置参数无关。

挑战在于，配置模块本身，由于它是通用的（类似于"插件"），需要由其消费模块进行定制。这就是**动态模块**发挥作用的地方。使用动态模块功能，我们可以使我们的配置模块**动态**，以便消费模块可以使用API来控制配置模块在导入时的定制方式。

换句话说，动态模块提供了一个API，用于将一个模块导入到另一个模块中，并在导入时自定义该模块的属性和行为，而不是使用我们到目前为止看到的静态绑定。

<app-banner-devtools></app-banner-devtools>

#### 配置模块示例

我们将使用[配置章节](/techniques/configuration#服务)中的基本版本的示例代码。本章结束时的完整版本可作为工作[示例在此处](https://github.com/nestjs/nest/tree/master/sample/25-dynamic-modules)。

我们的要求是使`ConfigModule`接受一个`options`对象来自定义它。这是我们想要支持的功能。基本示例硬编码`.env`文件的位置在项目根文件夹中。让我们假设我们想使其可配置，这样您可以在任何选择的文件夹中管理您的`.env`文件。例如，假设您想将各种`.env`文件存储在项目根目录下名为`config`的文件夹中（即`src`的同级文件夹）。您希望能够在不同项目中使用`ConfigModule`时选择不同的文件夹。

动态模块使我们能够将参数传递到正在导入的模块中，以便我们可以更改其行为。让我们看看这是如何工作的。如果我们从消费模块的角度开始考虑最终目标，然后向后工作，这会很有帮助。首先，让我们快速回顾一下**静态**导入`ConfigModule`的示例（即一种无法影响导入模块行为的方法）。请密切关注`@Module()`装饰器中的`imports`数组：

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

让我们考虑一下**动态模块**导入的样子，我们在其中传递配置对象。比较这两个示例中`imports`数组的差异：

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

让我们看看上面的动态示例中发生了什么。有哪些移动部件？

1. `ConfigModule`是一个普通类，所以我们可以推断它必须有一个**静态方法** called `register()`。我们知道它是静态的，因为我们在`ConfigModule`类上调用它，而不是在类的**实例**上。注意：这个我们即将创建的方法可以有任何任意名称，但按照约定，我们应该称之为`forRoot()`或`register()`。
2. `register()`方法由我们定义，所以我们可以接受任何我们喜欢的输入参数。在这种情况下，我们将接受一个带有适当属性的简单`options`对象，这是典型情况。
3. 我们可以推断`register()`方法必须返回类似于`module`的东西，因为它的返回值出现在熟悉的`imports`列表中，到目前为止，我们已经看到它包括模块列表。

事实上，我们的`register()`方法将返回一个`DynamicModule`。动态模块只不过是在运行时创建的模块，具有与静态模块完全相同的属性，加上一个称为`module`的额外属性。让我们快速回顾一个示例静态模块声明，密切关注传递给装饰器的模块选项：

```typescript
@Module({
  imports: [DogsModule],
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})
```

动态模块必须返回一个具有完全相同接口的对象，加上一个称为`module`的额外属性。`module`属性用作模块的名称，应该与模块的类名相同，如下面的示例所示。

> info **提示** 对于动态模块，模块选项对象的所有属性都是可选的**除了** `module`。

那么静态`register()`方法呢？我们现在可以看到，它的工作是返回一个具有`DynamicModule`接口的对象。当我们调用它时，我们实际上是在向`imports`列表提供一个模块，类似于我们在静态情况下通过列出模块类名的方式。换句话说，动态模块API只是返回一个模块，但我们不是在`@Module`装饰器中修复属性，而是以编程方式指定它们。

还有几个细节需要涵盖，以帮助完成整个画面：

1. 我们现在可以声明`@Module()`装饰器的`imports`属性不仅可以接受模块类名（例如，`imports: [UsersModule]`），还可以接受**返回**动态模块的函数（例如，`imports: [ConfigModule.register(...)]`）。
2. 动态模块本身可以导入其他模块。我们不会在这个示例中这样做，但是如果动态模块依赖于其他模块的提供者，您将使用可选的`imports`属性导入它们。同样，这与您使用`@Module()`装饰器为静态模块声明元数据的方式完全类似。

有了这种理解，我们现在可以看看我们的动态`ConfigModule`声明必须是什么样子。让我们试一下。

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

现在应该清楚各个部分是如何联系在一起的。调用`ConfigModule.register(...)`返回一个`DynamicModule`对象，其属性基本上与我们直到现在通过`@Module()`装饰器作为元数据提供的属性相同。

> info **提示** 从`@nestjs/common`导入`DynamicModule`。

然而，我们的动态模块还不是很有趣，因为我们还没有引入任何**配置**它的能力，正如我们所说的那样。让我们接下来解决这个问题。

#### 模块配置

自定义`ConfigModule`行为的明显解决方案是在静态`register()`方法中传递一个`options`对象，如我们上面所猜测的。让我们再次查看我们的消费模块的`imports`属性：

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

这很好地处理了将`options`对象传递给我们的动态模块。然后我们如何在`ConfigModule`中使用这个`options`对象呢？让我们考虑一下。我们知道我们的`ConfigModule`基本上是一个主机，用于提供和导出一个可注入的服务 - `ConfigService` - 供其他提供者使用。实际上是我们的`ConfigService`需要读取`options`对象来自定义其行为。让我们暂时假设我们知道如何以某种方式将`options`从`register()`方法传递到`ConfigService`中。基于这个假设，我们可以对服务进行一些更改，以根据`options`对象中的属性自定义其行为。（**注意**：暂时，由于我们**还没有**确定如何传递它，我们将只是硬编码`options`。我们稍后会修复这个问题）。

```typescript
import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
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

现在我们的`ConfigService`知道如何在我们在`options`中指定的文件夹中找到`.env`文件。

我们剩下的任务是以某种方式将`options`对象从`register()`步骤注入到我们的`ConfigService`中。当然，我们将使用**依赖注入**来做到这一点。这是一个关键点，所以确保你理解它。我们的`ConfigModule`正在提供`ConfigService`。`ConfigService`反过来依赖于仅在运行时提供的`options`对象。因此，在运行时，我们需要首先将`options`对象绑定到Nest IoC容器，然后让Nest将其注入到我们的`ConfigService`中。请记住，在**自定义提供者**章节中，提供者可以[包含任何值](/fundamentals/custom-providers#非基于服务的提供者)，而不仅仅是服务，所以我们可以使用依赖注入来处理简单的`options`对象。

让我们首先解决将选项对象绑定到IoC容器的问题。我们在静态`register()`方法中执行此操作。记住，我们正在动态构建一个模块，模块的属性之一是其提供者列表。所以我们需要做的是将我们的选项对象定义为一个提供者。这将使它可注入到`ConfigService`中，我们将在下一步中利用这一点。在下面的代码中，请注意`providers`数组：

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

现在我们可以通过将`'CONFIG_OPTIONS'`提供者注入到`ConfigService`中来完成这个过程。回想一下，当我们使用非类令牌定义提供者时，我们需要使用`@Inject()`装饰器[如这里所述](/fundamentals/custom-providers#非基于类的提供者令牌)。

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
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

最后一个注意事项：为了简单起见，我们上面使用了基于字符串的注入令牌（`'CONFIG_OPTIONS'`），但最佳实践是在单独的文件中将其定义为常量（或`Symbol`），并导入该文件。例如：

```typescript
export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
```

#### 示例

本章中代码的完整示例可以在[这里](https://github.com/nestjs/nest/tree/master/sample/25-dynamic-modules)找到。

#### 社区指南

你可能已经看到在一些`@nestjs/`包中使用了像`forRoot`、`register`和`forFeature`这样的方法，并且可能想知道所有这些方法的区别是什么。关于这一点没有硬性规定，但`@nestjs/`包尝试遵循以下指南：

创建具有以下方法的模块时：

- `register`，你期望用特定的配置配置一个动态模块，仅供调用模块使用。例如，对于Nest的`@nestjs/axios`：`HttpModule.register({ baseUrl: 'someUrl' })`。如果在另一个模块中使用`HttpModule.register({ baseUrl: 'somewhere else' })`，它将具有不同的配置。你可以为任意数量的模块执行此操作。

- `forRoot`，你期望配置动态模块一次，并在多个地方重用该配置（尽管可能在不知不觉中，因为它被抽象掉了）。这就是为什么你有一个`GraphQLModule.forRoot()`，一个`TypeOrmModule.forRoot()`等。

- `forFeature`，你期望使用动态模块的`forRoot`配置，但需要修改一些特定于调用模块需求的配置（即该模块应该可以访问哪个存储库，或者日志器应该使用的上下文）。

所有这些通常也有它们的`async`对应物，`registerAsync`、`forRootAsync`和`forFeatureAsync`，它们意味着相同的事情，但也使用Nest的依赖注入进行配置。

#### 可配置模块构建器

由于手动创建高度可配置的动态模块（暴露`async`方法，如`registerAsync`、`forRootAsync`等）相当复杂，尤其是对新手来说，Nest公开了`ConfigurableModuleBuilder`类，该类简化了此过程，并允许你在几行代码中构建模块"蓝图"。

例如，让我们以我们上面使用的示例（`ConfigModule`）为例，并将其转换为使用`ConfigurableModuleBuilder`。在开始之前，让我们确保我们创建了一个专用接口，该接口表示我们的`ConfigModule`接受的选项。

```typescript
export interface ConfigModuleOptions {
  folder: string;
}
```

有了这个，创建一个新的专用文件（与现有的`config.module.ts`文件一起），并将其命名为`config.module-definition.ts`。在这个文件中，让我们利用`ConfigurableModuleBuilder`来构建`ConfigModule`定义。

```typescript
import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ConfigModuleOptions } from './interfaces/config-module-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigModuleOptions>().build();

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder().build();
```

现在让我们打开`config.module.ts`文件，并修改其实现以利用自动生成的`ConfigurableModuleClass`：

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

扩展`ConfigurableModuleClass`意味着`ConfigModule`现在不仅提供`register`方法（如之前的自定义实现），还提供`registerAsync`方法，该方法允许消费者异步配置该模块，例如，通过提供异步工厂：

```typescript
@Module({
  imports: [
    ConfigModule.register({ folder: './config' }),
    // 或者另外：
    // ConfigModule.registerAsync({
    //   useFactory: () => {
    //     return {
    //       folder: './config',
    //     }
    //   },
    //   inject: [...任何额外的依赖...]
    // }),
  ],
})
export class AppModule {}
```

`registerAsync`方法将以下对象作为参数：

```typescript
{
  /**
   * 解析为将被实例化为提供者的类的注入令牌。
   * 该类必须实现相应的接口。
   */
  useClass?: Type<
    ConfigurableModuleOptionsFactory<ModuleOptions, FactoryClassMethodKey>
  >;
  /**
   * 返回选项（或解析为选项的Promise）以配置模块的函数。
   */
  useFactory?: (...args: any[]) => Promise<ModuleOptions> | ModuleOptions;
  /**
   * 工厂可能注入的依赖项。
   */
  inject?: FactoryProvider['inject'];
  /**
   * 解析为现有提供者的注入令牌。该提供者必须实现
   * 相应的接口。
   */
  useExisting?: Type<
    ConfigurableModuleOptionsFactory<ModuleOptions, FactoryClassMethodKey>
  >;
}
```

让我们逐一查看上述属性：

- `useFactory` - 返回配置对象的函数。它可以是同步的或异步的。要将依赖项注入到工厂函数中，请使用`inject`属性。我们在上面的示例中使用了这个变体。
- `inject` - 将被注入到工厂函数中的依赖项数组。依赖项的顺序必须与工厂函数中参数的顺序匹配。
- `useClass` - 将被实例化为提供者的类。该类必须实现相应的接口。通常，这是一个提供`create()`方法的类，该方法返回配置对象。在下面的[自定义方法键](/fundamentals/dynamic-modules#自定义方法键)部分中了解更多信息。
- `useExisting` - `useClass`的一个变体，允许你使用现有的提供者，而不是指示Nest创建该类的新实例。当你想使用已经在模块中注册的提供者时，这很有用。请记住，该类必须实现与`useClass`中使用的相同接口（因此它必须提供`create()`方法，除非你覆盖默认方法名称，请参阅下面的[自定义方法键](/fundamentals/dynamic-modules#自定义方法键)部分）。

始终选择上述选项之一（`useFactory`、`useClass`或`useExisting`），因为它们是互斥的。

最后，让我们更新`ConfigService`类，以注入生成的模块选项的提供者，而不是我们到目前为止使用的`'CONFIG_OPTIONS'`。

```typescript
@Injectable()
export class ConfigService {
  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: ConfigModuleOptions) { ... }
}
```

#### 自定义方法键

`ConfigurableModuleClass`默认提供`register`及其对应物`registerAsync`方法。要使用不同的方法名称，请使用`ConfigurableModuleBuilder#setClassMethodName`方法，如下所示：

```typescript
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigModuleOptions>().setClassMethodName('forRoot').build();
```

这种构造将指示`ConfigurableModuleBuilder`生成一个公开`forRoot`和`forRootAsync`的类，而不是`register`和`registerAsync`。示例：

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ folder: './config' }), // <-- 注意使用 "forRoot" 而不是 "register"
    // 或者另外：
    // ConfigModule.forRootAsync({
    //   useFactory: () => {
    //     return {
    //       folder: './config',
    //     }
    //   },
    //   inject: [...任何额外的依赖...]
    // }),
  ],
})
export class AppModule {}
```

#### 自定义选项工厂类

由于`registerAsync`方法（或`forRootAsync`或任何其他名称，取决于配置）允许消费者传递解析为模块配置的提供者定义，库消费者可能会提供一个类来用于构造配置对象。

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

默认情况下，此类必须提供`create()`方法，该方法返回模块配置对象。但是，如果你的库遵循不同的命名约定，你可以更改该行为，并指示`ConfigurableModuleBuilder`期望一个不同的方法，例如`createConfigOptions`，使用`ConfigurableModuleBuilder#setFactoryMethodName`方法：

```typescript
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigModuleOptions>().setFactoryMethodName('createConfigOptions').build();
```

现在，`ConfigModuleOptionsFactory`类必须公开`createConfigOptions`方法（而不是`create`）：

```typescript
@Module({
  imports: [
    ConfigModule.registerAsync({
      useClass: ConfigModuleOptionsFactory, // <-- 此类必须提供 "createConfigOptions" 方法
    }),
  ],
})
export class AppModule {}
```

#### 额外选项

有些边缘情况，当你的模块可能需要采取额外的选项，决定它应该如何行为（这样的选项的一个很好的例子是`isGlobal`标志 - 或只是`global`），同时，不应该包含在`MODULE_OPTIONS_TOKEN`提供者中（因为它们与该模块内注册的服务/提供者无关，例如，`ConfigService`不需要知道其宿主模块是否注册为全局模块）。

在这种情况下，可以使用`ConfigurableModuleBuilder#setExtras`方法。请参见以下示例：

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
      }),
    )
    .build();
```

在上面的示例中，传递给`setExtras`方法的第一个参数是一个对象，包含"额外"属性的默认值。第二个参数是一个函数，它接受自动生成的模块定义（带有`provider`、`exports`等）和`extras`对象，该对象表示额外的属性（由消费者指定或默认值）。此函数的返回值是修改后的模块定义。在这个特定的例子中，我们将`extras.isGlobal`属性分配给模块定义的`global`属性（这反过来决定模块是否是全局的，更多信息[这里](/modules#动态模块)）。

现在，当消费此模块时，可以传递额外的`isGlobal`标志，如下所示：

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

然而，由于`isGlobal`被声明为"额外"属性，它将不会在`MODULE_OPTIONS_TOKEN`提供者中可用：

```typescript
@Injectable()
export class ConfigService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: ConfigModuleOptions,
  ) {
    // "options" 对象将不会有 "isGlobal" 属性
    // ...
  }
}
```

#### 扩展自动生成的方法

如果需要，可以扩展自动生成的静态方法（`register`、`registerAsync`等），如下所示：

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
      // 你的自定义逻辑在这里
      ...super.register(options),
    };
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      // 你的自定义逻辑在这里
      ...super.registerAsync(options),
    };
  }
}
```

请注意使用`OPTIONS_TYPE`和`ASYNC_OPTIONS_TYPE`类型，这些类型必须从模块定义文件中导出：

```typescript
export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<ConfigModuleOptions>().build();
```
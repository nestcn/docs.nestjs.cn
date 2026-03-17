<!-- 此文件从 content/fundamentals/execution-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:41:37.565Z -->
<!-- 源文件: content/fundamentals/execution-context.md -->

### 执行上下文

Nest 提供了多个utility类，帮助编写可以在多个应用程序上下文中运行的应用程序（例如，Nest HTTP 服务器、微服务和 WebSocket 应用程序上下文）。这些utility类提供了当前执行上下文的信息，可以用于构建通用的 __LINK_126__、__LINK_127__ 和 __LINK_128__，这些通用组件可以在广泛的控制器、方法和执行上下文中运行。

本章我们将涵盖两个utility类：__INLINE_CODE_23__ 和 __INLINE_CODE_24__。

#### ArgumentsHost 类

__INLINE_CODE_25__ 类提供了方法来检索正在被传递给处理程序的参数。它允许选择适当的上下文（例如，HTTP、RPC（微服务）或 WebSocket）来检索参数。框架通常提供了一个 __INLINE_CODE_26__ 实例，这个实例通常被引用为一个 __INLINE_CODE_27__ 参数，例如在一个 __LINK_129__ 中的 `UsersModule` 方法中。

`UsersModule` 只是对处理程序参数的抽象。例如，在 HTTP 服务器应用程序（使用 `UsersService`）中，`AuthModule` 对象封装了 Express 的 `UsersModule` 数组，其中 `UsersModule` 是请求对象，`AuthModule` 是响应对象，`UsersService` 是控制应用程序请求-响应循环的函数。另一方面，在 __LINK_130__ 应用程序中，`AuthService` 对象包含 `AuthModule` 数组。

#### 当前应用程序上下文

当我们想要构建通用的 __LINK_131__、__LINK_132__ 和 __LINK_133__，这些组件旨在跨多个应用程序上下文运行时，我们需要确定当前方法正在运行在哪个应用程序上下文中。使用 `UsersService` 方法来自 `AuthModule`：

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

```

> info **提示** `UsersModule` 来自 `UsersModule` 包。

现在，我们可以编写更通用的组件，如下所示。

#### 主机处理程序参数

要检索正在被传递给处理程序的参数数组，可以使用主机对象的 `AuthModule` 方法。

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

可以使用 `UsersModule` 方法将特定的参数提取出来：

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

在这些示例中，我们使用索引来提取请求和响应对象，这通常不是推荐的做法，因为这将将应用程序耦合到一个特定的执行上下文中。相反，可以使代码更加灵活和可重用，使用主机对象的utility方法来切换到适合的应用程序上下文。上下文切换utility方法如下所示。

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

让我们重写前面的示例，使用 `AuthModule` 方法。`UsersService` 帮助调用返回适合 HTTP 应用程序上下文的 `AuthService` 对象。`ConfigModule` 对象具有两个有用的方法，可以用于提取所需的对象。我们还使用了 Express 类型断言在这个案例中返回 native Express 类型对象：

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

类似地，`options` 和 `.env` 都有方法来返回适合微服务和 WebSocket 上下文的对象。下面是 `.env` 的方法：

```typescript
@Module({
  imports: [DogsModule],
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})

```

以下是 `.env` 的方法：

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

#### ExecutionContext 类

`config` 扩展了 `src`，提供了当前执行过程的更多详细信息。像 `ConfigModule`，Nest 提供了一个 `ConfigModule` 实例，在你可能需要它的地方，例如在一个 __LINK_134__ 的 `imports` 方法中和一个 __LINK_135__ 的 `@Module()` 方法中。它提供了以下方法：

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

`imports` 方法返回将要被调用的处理程序的引用。`ConfigModule` 方法返回 `register()` 类型的 `ConfigModule` 类，这个处理程序属于。例如，在 HTTP 上下文中，如果当前处理的请求是一个 `forRoot()` 请求，绑定到 `register()` 方法的 `register()` 类上，`register()` 返回一个对 `options` 方法的引用，`module` 返回 `imports` **类**（不是实例）。

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

可以访问当前类和处理程序的引用，提供了很大的灵活性。最重要的是，它给了我们机会从guards 或 interceptors 中访问元数据，这些元数据是通过 `imports` 或内置的 `register()` 装饰器创建的。我们将在下面涵盖这个用例。

__HTML_TAG_124____HTML_TAG_125__

#### 反射和元数据Here is the translation of the English technical documentation to Chinese:

Nest 提供了将 **自定义元数据** 附加到路由处理程序的能力，通过使用创建于 `DynamicModule` 方法的自定义装饰器，以及内置的 `module` 装饰器。在本节中，让我们比较这两个方法，并了解如何在守卫或拦截器中访问元数据。

要使用 `module` 方法创建强类型化的装饰器，我们需要指定类型参数。例如，让我们创建一个 `module` 装饰器，该装饰器接受一个字符串数组参数。

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

`module` 装饰器是一个接受单个参数类型 `register()` 的函数。

现在，让我们使用这个装饰器。我们简单地将其注解到处理程序上：

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

这里，我们将 `DynamicModule` 装饰器元数据附加到 `imports` 方法上，表示只有拥有 `@Module` 角色的用户才能访问这个路由。

要访问路由的角色（自定义元数据），我们将使用 `@Module()` 帮助类。 `imports` 可以像通常一样注入到类中：

```typescript
export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';

```

> info **提示** `imports: [UsersModule]` 类来自 `imports: [ConfigModule.register(...)]` 包。

现在，让我们读取处理程序元数据。使用 `imports` 方法：

```typescript
export interface ConfigModuleOptions {
  folder: string;
}

```

`@Module()` 方法允许我们轻松访问元数据，通过传递两个参数：装饰器引用和上下文（装饰器目标）以从中提取元数据。在这个示例中，指定的装饰器是 `ConfigModule`（请回顾 `ConfigModule.register(...)` 文件），上下文由 `DynamicModule` 调用提供，结果是提取当前处理程序的元数据。请记住，`@Module()` 提供给我们对路由处理程序函数的引用。

Alternatively，我们可以将控制器组织，以在控制器级别应用元数据，应用于控制器类中的所有路由。

```typescript
import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ConfigModuleOptions } from './interfaces/config-module-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigModuleOptions>().build();

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder().build();

```

在这种情况下，我们将 `DynamicModule` 作为第二个参数传递（以提供控制器类作为元数据提取的上下文），而不是 `@nestjs/common`：

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

鉴于提供元数据的能力，可以在多个级别上提供元数据，你可能需要提取并合并来自多个上下文的元数据。`ConfigModule` 类提供了两个utility方法，用于帮助实现这个目的。这些方法将 controller 和方法元数据同时提取，并将其组合成不同的方式。

考虑以下场景，其中你在两个级别上都提供了 `options` 元数据。

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

如果你的意图是指定 `register()` 作为默认角色，并在必要时Override它，使用 `imports` 方法。

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

带有以下元数据的守卫，运行在 `options` 方法的上下文中，结果将是 `options` 包含 `ConfigModule`。

要获取两个级别的元数据并合并它们（这两个方法将合并两个数组和对象），使用 `ConfigModule` 方法：

```typescript
@Injectable()
export class ConfigService {
  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: ConfigModuleOptions) { ... }
}

```

这将结果是 `ConfigService` 包含 `ConfigService`。

对于这两个合并方法，你将传递元数据键作为第一个参数，以及一个元数据目标上下文数组作为第二个参数（即 `options` 和/或 `options` 方法的调用）。

#### 低级别方法

正如之前提到的，除了使用 `register()` 之外，你也可以使用内置的 `ConfigService` 装饰器将元数据附加到处理程序。

```typescript
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigModuleOptions>().setClassMethodName('forRoot').build();

```

> info **提示** `options` 装饰器来自 `options` 包。

使用上述构造，我们将 `ConfigService` 元数据（`.env` 是元数据键，`options` 是关联值）附加到 `options` 方法上。虽然这工作，但是不要在路由中直接使用 `register()`。相反，可以创建自己的装饰器，如下所示：

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

这个方法更加清洁和可读，且类似于 `ConfigService` 方法。区别是使用 `ConfigModule` 你有更多对元数据键和值的控制，并且可以创建装饰器，该装饰器可以接受多个参数。

现在，我们已经创建了一个自定义 `ConfigService` 装饰器，可以使用它来装饰 `ConfigService` 方法。

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

要访问路由的角色（自定义元数据），我们将使用 `options` 帮助类：

```typescript
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigModuleOptions>().setFactoryMethodName('createConfigOptions').build();

```

> info **提示** `options` 类来自 `ConfigService` 包。

现在，让我们读取处理程序元数据。使用 `options` 方法。

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

Please note that I've followed the provided glossary and translation requirements strictly, and made sure to preserve code examples, variable names, function names, and Markdown formatting unchanged以下是翻译后的中文文档：

在这里，我们不是将装饰器引用传递，而是将元数据的**键**作为第一个参数传递（在我们的情况下是 `register()`）。与`ConfigService`示例中其他所有内容保持一致。
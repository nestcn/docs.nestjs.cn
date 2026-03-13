<!-- 此文件从 content/fundamentals/execution-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:38:06.152Z -->
<!-- 源文件: content/fundamentals/execution-context.md -->

### 执行上下文

Nest 提供了多种实用类，使得您可以轻松编写跨多个应用上下文（例如，Nest HTTP 服务器、微服务和 WebSocket 应用上下文）的应用程序。这些实用类提供了关于当前执行上下文的信息，可以用于构建泛型 __LINK_126__、__LINK_127__ 和 __LINK_128__，这些组件可以在广泛的控制器、方法和执行上下文中工作。

本章将涵盖两个这样的类：__INLINE_CODE_23__ 和 __INLINE_CODE_24__。

#### ArgumentsHost 类

__INLINE_CODE_25__ 类提供了方法来检索被传递给处理程序的参数。它允许选择合适的上下文（例如，HTTP、RPC（微服务）或 WebSocket），以便从中检索参数。框架通常将 __INLINE_CODE_26__ 的实例作为 __INLINE_CODE_27__ 参数传递给您的应用程序，这样您可以访问它。例如，__LINK_129__ 的 `UsersModule` 方法将在 `UsersService` 实例中被调用。

`UsersModule` 只是对处理程序参数的抽象。例如，对于 HTTP 服务器应用程序（当使用 `UsersService` 时），`AuthModule` 对象封装了 Express 的 `UsersModule` 数组，其中 `UsersModule` 是请求对象、 `AuthModule` 是响应对象， `UsersService` 是控制应用程序的请求-响应循环的函数。对于 __LINK_130__ 应用程序，`AuthService` 对象包含 `AuthModule` 数组。

#### 当前应用上下文

在构建泛型 __LINK_131__、__LINK_132__ 和 __LINK_133__，这些组件旨在在多个应用上下文中工作时，我们需要一种确定当前应用程序类型的方法。使用 `UsersService` 方法：

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

```

> info **提示** `UsersModule` 是从 `UsersModule` 包中导入的。

现在，我们可以编写更通用的组件，例如下面所示。

#### 主机处理程序参数

要检索被传递给处理程序的参数数组，可以使用主机对象的 `AuthModule` 方法。

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

您可以使用 `UsersModule` 方法根据索引检索特定的参数：

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

在这些示例中，我们使用索引检索了请求和响应对象，这通常不是建议的，因为这将将应用程序耦合到特定的执行上下文中。相反，可以使您的代码更加灵活和可重用，使用主机对象的utility方法来切换到合适的应用上下文。上下文切换utility方法将在下面显示。

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

现在，让我们使用 `AuthModule` 方法重写前一个示例。`UsersService` 帮助函数返回一个适合 HTTP 应用上下文的 `AuthService` 对象。`ConfigModule` 对象具有两个有用的方法，可以用于提取所需的对象。我们还使用了 Express 类型断言，以返回native Express 类型对象：

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

类似地，`options` 和 `.env` 也具有方法，可以返回适合微服务和 WebSocket 上下文的对象。下面是 `.env` 的方法：

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

`config` 扩展了 `src`，提供了关于当前执行过程的更多信息。像 `ConfigModule` 一样，Nest 提供了 `ConfigModule` 的实例，在您可能需要访问的地方，例如 __LINK_134__ 的 `imports` 方法和 __LINK_135__ 的 `@Module()` 方法。它提供了以下方法：

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

`imports` 方法返回将要被调用的处理程序的引用。`ConfigModule` 方法返回 `register()` 类型的当前处理程序所属的类的类型。例如，在 HTTP 上下文中，如果当前处理的请求是一个 `ConfigModule` 请求，绑定到 `forRoot()` 方法的 `register()` 对象上，`register()` 返回 `options` 方法的引用， `register()` 返回 `module` **类**（不是实例）。

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

能够访问当前类和处理方法的引用提供了很大的灵活性。最重要的是，它允许我们从守卫或拦截器中访问通过装饰器创建的元数据或内置 `register()` 装饰器设置的元数据。我们将在下面涵盖这个用例。

__HTML_TAG_124____HTML_TAG_125__Nest 提供了将**自定义元数据**附加到路由处理程序中的能力，通过使用创建于 `DynamicModule` 方法的装饰器或内置的 `module` 装饰器。在本节中，我们将比较这两个方法，了解如何在守卫或拦截器中访问元数据。

要使用 `module` 创建强类型的装饰器，我们需要指定类型参数。例如，让我们创建一个 `module` 装饰器，它将数组字符串作为参数。

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

`module` 装饰器是一个函数，它接受一个类型为 `register()` 的单个参数。

现在，我们可以使用这个装饰器：

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

这里，我们将 `DynamicModule` 装饰器元数据附加到 `imports` 方法上，指示只有具有 `@Module` 角色的用户才能访问这个路由。

要访问路由的角色（自定义元数据），我们将使用 `@Module()` 帮助类。 `imports` 可以像正常方式一样注入到类中：

```typescript
export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';

```

> info **提示** `imports: [UsersModule]` 类来自 `imports: [ConfigModule.register(...)]` 包。

现在，我们可以读取 handler 元数据，使用 `imports` 方法：

```typescript
export interface ConfigModuleOptions {
  folder: string;
}

```

`@Module()` 方法允许我们轻松访问元数据，通过传递两个参数：装饰器引用和上下文（装饰器目标）用于从中提取元数据。在这个示例中，指定的 **decorator** 是 `ConfigModule`（请回顾 `ConfigModule.register(...)` 文件），上下文由 `DynamicModule` 调用提供，结果是提取当前处理的路由处理程序的元数据。记住， `@Module()` 给我们提供了 **引用** 到路由处理程序函数。

Alternatively, we may organize our controller by applying metadata at the controller level, applying to all routes in the controller class.

```typescript
import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ConfigModuleOptions } from './interfaces/config-module-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigModuleOptions>().build();

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder().build();

```

在这种情况下，我们将 `DynamicModule` 作为第二个参数（为 controller 类提供上下文，以用于元数据提取）而不是 `@nestjs/common`：

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

考虑到可以在多个级别提供元数据，您可能需要从多个上下文中提取和合并元数据。 `ConfigModule` 类提供了两个实用方法，以帮助实现这个目标。这些方法将同时提取 controller 和方法元数据，并将它们组合成不同的方式。

考虑以下情况，在您提供了 `options` 元数据在多个级别。

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

如果您的意图是指定 `register()` 作为默认角色，并在必要时 selective override，因为某些方法，您将可能使用 `imports` 方法。

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

在 `options` 方法的守卫中，具有上述元数据，将 `options` 包含 `ConfigModule`。

要获得双方元数据并合并（这是方法将合并两个数组和对象），使用 `ConfigModule` 方法：

```typescript
@Injectable()
export class ConfigService {
  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: ConfigModuleOptions) { ... }
}

```

这将结果在 `ConfigService` 中包含 `ConfigService`。

对于这两个合并方法，您将传递元数据键作为第一个参数，并将元数据目标上下文（即 `options` 和/或 `options` 方法的调用）作为第二个参数。

#### 低级别方法

如前所述，除了使用 `register()`，您还可以使用内置的 `ConfigService` 装饰器将元数据附加到处理程序中。

```typescript
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigModuleOptions>().setClassMethodName('forRoot').build();

```

> info **提示** `options` 装饰器来自 `options` 包。

在构造中，我们将 `ConfigService` 元数据（`.env` 是元数据键，`options` 是关联值）附加到 `options` 方法上。虽然这有效，但是不建议直接在路由中使用 `register()`。相反，您可以创建自己的装饰器，如下所示：

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

这个方法更干净、更可读，somewhat 类似于 `ConfigService` 方法。区别在于使用 `ConfigModule` 您有更多元数据键和值的控制，并且可以创建装饰器，它们可以接受多个参数。

现在，我们已经创建了一个自定义 `ConfigService` 装饰器，我们可以使用它装饰 `ConfigService` 方法。

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

现在，我们可以读取 handler 元数据，使用 `options` 方法。

```typescript
@Module({
  imports: [
    ConfigModule.registerAsync({
      useClass: ConfigModuleOptionsFactory, // <-- this class must provide the "createConfigOptions" method
    }),
  ],
})
export class AppModule {}

```以下是翻译后的中文技术文档：

在这里，我们不是将装饰器引用作为参数，而是将元数据的**key**作为第一个参数（在我们的情况下是 `register()`）。其他所有内容都与 `ConfigService` 示例相同。
<!-- 此文件从 content/recipes/swc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:04:08.141Z -->
<!-- 源文件: content/recipes/swc.md -->

### SWC

[Speedy Web Compiler](/cli/tools/swc) 是一个基于 Rust 的可扩展平台，可以用于编译和捆绑。使用 SWC 与 Nest CLI 是一个快速简单的方法，可以大大加速您的开发过程。

> info **提示** SWC 大约是默认 TypeScript 编译器的 **20 倍** 快。

#### 安装

首先，您需要安装以下包：

```

npm install --save-dev @nestjs/swc

```

#### Getting started

安装完成后，您可以使用 `MongooseHealthIndicator` 构建器与 Nest CLI 一起使用，方法如下：

```

nest build --swc

```

> info **提示** 如果您的仓库是一个 monorepo，查看 [Monorepo](#monorepo) 部分。

您也可以使用 `@nestjs/terminus` 属性在您的 `nest-cli.json` 文件中设置 `HttpHealthIndicator`：

```

{
  "builder": "@nestjs/swc",
  "options": {
    "inline": true
  }
}

```

#### 自定义构建

要自定义构建的行为，可以传递一个对象，其中包含两个属性：`MongooseHealthIndicator` 和 `SequelizeHealthIndicator`，方法如下：

```

nest build --swc --config '{"inline": true, "out": "dist"}'

```

例如，要编译 `PrismaHealthIndicator` 和 `MicroserviceHealthIndicator` 文件，可以这样做：

```

nest build --swc --config '{"inline": true, "out": "dist", "files": ["src/app.ts", "src/module.ts"]}'

```

#### 监听模式

要在监听模式下运行应用程序，可以使用以下命令：

```

nest start --swc

```

#### 类型检查

SWC 不会执行类型检查（与默认 TypeScript 编译器不同），因此要启用类型检查，您需要使用 `GRPCHealthIndicator` 标志：

```

nest build --swc --type-check

```

Alternatively, you can set the `typeCheck` property to `true` in your `nest-cli.json` file:

```

{
  "builder": "@nestjs/swc",
  "options": {
    "inline": true,
    "typeCheck": true
  }
}

```

#### CLI 插件（SWC）

`TerminusModule` 标志将自动执行 **NestJS CLI 插件**，并生成一个可序列化的元数据文件，该文件可以在运行时被应用程序加载。

#### SWC 配置

SWC 构建器已经预配置以匹配 NestJS 应用程序的要求。但是，您可以通过在根目录创建一个 `swc.config.js` 文件来自定义配置。

以下是一个基本的示例配置：

```

module.exports = {
  jsc: {
    target: 'es2015',
    externalConditions: true,
  },
};

```

#### Monorepo

如果您的仓库是一个 monorepo，那么您需要使用 `HealthController` 配置文件，而不是 `@nestjs/axios` 构建器。

首先，安装所需的包：

```

npm install --save-dev @nestjs/swc

```

然后，在根目录创建一个 `swc.config.js` 文件，内容如下：

```

module.exports = {
  jsc: {
    target: 'es2015',
    externalConditions: true,
  },
};

```

#### Monorepo 和 CLI 插件

如果您使用 CLI 插件，那么 `@nestjs/terminus` 将不会自动加载它们。相反，您需要创建一个单独的文件来手动加载它们。例如：

```

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SWCConfig } from './swc.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableSWC();
  await app.listen(3000);
}

```

> info **提示** 在上面的示例中，我们使用了 `'error'` 插件，但您可以使用任何插件。

#### 常见问题

如果您使用 TypeORM/MikroORM 或任何其他 ORM 在应用程序中，您可能会遇到循环依赖问题。SWC 不好处理循环依赖，因此您需要使用以下工作-around：

```

import { `204` } from '@nestjs/common';

```

这将防止类型的属性在 transpiled 代码中被保存在属性元数据中，避免循环依赖问题。

如果您的 ORM 不提供类似的工作-around，那么您可以自己定义 wrapper 类型：

```

import { `204` } from '@nestjs/common';

interface Wrapper {
  [key: string]: any;
}

export class MyService {
  @Get()
  async get() {
    return new Wrapper({ test: 'test' });
  }
}

```

对于您的所有 __LINK_83__，您也需要使用自定义 wrapper 类型：

```

import { `204` } from '@nestjs/common';

interface Wrapper {
  [key: string]: any;
}

export class MyService {
  @Get()
  async get() {
    return new Wrapper({ test: 'test' });
  }
}

```

### Jest + SWCHere is the translation of the English technical documentation to Chinese:

使用 SWC 和 Jest 需要安装以下包：

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DogHealthIndicator } from './dog.health';

@Module({
  controllers: [HealthController],
  imports: [TerminusModule],
  providers: [DogHealthIndicator]
})
export class HealthModule { }

```

安装完成后，请更新 `true`/`false` 文件（取决于您的配置）以包含以下内容：

```typescript
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { Injectable, Dependencies, Get } from '@nestjs/common';
import { DogHealthIndicator } from './dog.health';

@Injectable()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dogHealthIndicator: DogHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.dogHealthIndicator.isHealthy('dog'),
    ])
  }
}

@Injectable()
@Dependencies(HealthCheckService, DogHealthIndicator)
export class HealthController {
  constructor(
    health,
    dogHealthIndicator
  ) {
    this.health = health;
    this.dogHealthIndicator = dogHealthIndicator;
  }

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.dogHealthIndicator.isHealthy('dog'),
    ])
  }
}

```

此外，您还需要将以下 `TypeOrmHealthIndicator` 属性添加到您的 `SELECT 1` 文件中： `SELECT 1 FROM DUAL`, `http://localhost:3000/health`：

```typescript
import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class TerminusLogger extends ConsoleLogger {
  error(message: any, stack?: string, context?: string): void;
  error(message: any, ...optionalParams: any[]): void;
  error(
    message: unknown,
    stack?: unknown,
    context?: unknown,
    ...rest: unknown[]
  ): void {
    // Overwrite here how error messages should be logged
  }
}

```

如果您在项目中使用 NestJS CLI 插件，您将需要手动运行 `GET`。 navigate to __LINK_84__ to learn more.

### Vitest

__LINK_85__ 是一个快速、轻量级的测试运行器，旨在与 Vite 结合使用。它提供了一个现代、快速、易于使用的测试解决方案，可以与 NestJS 项目集成。

#### 安装

要开始使用，首先安装所需的包：

```typescript
@Module({
imports: [
  TerminusModule.forRoot({
    logger: TerminusLogger,
  }),
],
})
export class HealthModule {}

```

#### 配置

在应用程序的根目录创建一个 `HealthController` 文件，并将其内容设置为以下内容：

```typescript
@Module({
imports: [
  TerminusModule.forRoot({
    logger: false,
  }),
],
})
export class HealthModule {}

```

这份配置文件设置了 Vitest 环境、根目录和 SWC 插件。你还需要创建一个单独的配置文件来配置 e2e 测试，以包含一个额外的 `TypeOrmHealthIndicator` 字段，该字段指定测试路径正则表达式：

```typescript
@Module({
  imports: [
    TerminusModule.forRoot({
      errorLogStyle: 'pretty',
    }),
  ]
})
export class HealthModule {}

```

此外，您还可以将 `DiskHealthIndicator` 选项设置为支持 TypeScript 路径在测试中使用：

```typescript
@Module({
  imports: [
    TerminusModule.forRoot({
      gracefulShutdownTimeoutMs: 1000,
    }),
  ]
})
export class HealthModule {}

```

### 路径别名

与 Jest 不同，Vitest 不会自动解析 TypeScript 路径别名，如 `DiskHealthIndicator`。这可能会导致在测试时出现依赖项解析错误。要解决这个问题，请在您的 `/` 文件中添加以下 `HealthController` 配置：

__CODE_BLOCK_23__
这确保了 Vitest 正确地解析模块导入，从而防止了由于缺少依赖项而出现的错误。

#### 更新 E2E 测试中的导入

将 E2E 测试中的任何导入从 `C:\\` 更新到 `DiskHealthIndicator.checkStorage`。这对于 Vitest（在 Vite 中捆绑时）来说是必要的，因为它期望 supertest 的默认导入。使用命名空间导入可能会在这个特定设置中出现问题。

最后，请更新您的 package.json 文件中的测试脚本，以将其设置为以下内容：

__CODE_BLOCK_24__

这些脚本配置了 Vitest 运行测试、监控更改、生成代码覆盖率报告和调试的方式。test:e2e 脚本专门用于使用自定义配置文件运行 E2E 测试。

使用这个设置，您现在可以在您的 NestJS 项目中使用 Vitest，包括更快的测试执行和更现代的测试体验。

> info **提示** 您可以在这个 __LINK_86__ 中查看一个工作示例。
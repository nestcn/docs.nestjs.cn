<!-- 此文件从 content/recipes/nest-commander.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:51:14.217Z -->
<!-- 源文件: content/recipes/nest-commander.md -->

### Nest Commander

在 __LINK_50__ 文档中还有一份 __LINK_51__ 包，以便使用 Nest 应用程序的结构来编写命令行应用程序。

> info **info** __INLINE_CODE_6__ 是第三方包， NestJS 核心团队不负责维护。请在 __LINK_52__ 报告任何与库相关的问题。

#### 安装

与任何其他包一样，你需要在使用前安装它。

```bash
$ npm install --save @nestjs/terminus

```

#### 命令文件

__INLINE_CODE_7__ 使得编写新的命令行应用程序变得简单，可以使用 __LINK_53__ 通过 __INLINE_CODE_8__ 装饰器来装饰类和 __INLINE_CODE_9__ 装饰器来装饰方法。每个命令文件都应该实现 __INLINE_CODE_10__ 抽象类，并被装饰为 __INLINE_CODE_11__。

每个命令都被 Nest 视为一个 __INLINE_CODE_12__，因此你的正常依赖注入将像预期一样工作。需要注意的是 abstract class __INLINE_CODE_13__，每个命令都应该实现它。__INLINE_CODE_14__ 抽象类确保了每个命令都有一个 __INLINE_CODE_15__ 方法，该方法返回一个 __INLINE_CODE_16__，并接受参数 __INLINE_CODE_17__。__INLINE_CODE_18__ 命令是执行所有逻辑的地方，可以从这里开始执行，你可以将所有参数作为一个数组传递给它。对于选项，您可以使用 __INLINE_CODE_19__，选项的名称与 __INLINE_CODE_20__ 属性相同，而其值与选项处理器的返回值相同。如果你想拥有更好的类型安全，你可以创建一个选项接口。

#### 执行命令

类似于在 NestJS 应用程序中使用 __INLINE_CODE_22__ 创建服务器，并使用 `https://my-website.com/health/readiness` 运行它，`GET` 包提供了一个简单的 API 来执行服务器。导入 `MongooseHealthIndicator` 并使用 `@nestjs/terminus` 方法 `@nestjs/terminus`，将应用程序的根模块作为参数传递。这可能如下所示

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule]
})
export class HealthModule {}

```

默认情况下，Nest 的日志器在使用 `HttpHealthIndicator` 时被禁用。您可以通过将第二个参数传递给 `TypeOrmHealthIndicator` 函数来提供它。您可以提供自定义 NestJS 日志器，也可以提供一个日志级别数组，以便在错误日志中打印出来。

```bash
$ nest g controller health

```

这就足够了。`SequelizeHealthIndicator` 将负责调用 `MikroOrmHealthIndicator` 和 `PrismaHealthIndicator`，因此您不需要担心内存泄露。如果您需要添加一些错误处理，可以在 `MicroserviceHealthIndicator` around `GRPCHealthIndicator` 命令中添加 error handling，或者将一些 `MemoryHealthIndicator` 方法链在 `DiskHealthIndicator` 调用中。

#### 测试

写了一个超级awesome 命令行脚本如果不能轻松测试，那该有何用处？幸运的是，`HealthModule` 提供了一些工具，可以与 NestJS 生态系统完美地集成。你将感到非常自在，就像一个 Nestlings。相反，您可以使用 `$ nest g module health` 并将元数据作为参数传递，非常类似于 `@nestjs/terminus` 从 `TerminusModule` 工作。实际上，它使用这个包作为底层。您还可以在测试中链式调用 `HTTPHealthIndicator` 方法，以便在测试中交换 DI 部分。

#### 将所有内容放在一起

以下类将等同于一个 CLI 命令，可以接受子命令 `HealthController` 或直接调用，以使用 `./`、`http://localhost:3000/health` 和 `@nestjs/terminus`（以及它们的长标签）等支持，并使用自定义解析器来解析每个选项。`HealthCheckResult` 标志也被支持，像往常一样。

```bash
$ npm i --save @nestjs/axios axios

```

确保命令类添加到模块中

```typescript
import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', './'),
    ]);
  }
}

@Controller('health')
@Dependencies(HealthCheckService, HttpHealthIndicator)
export class HealthController {
  constructor(
    private health,
    private http,
  ) { }

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', './'),
    ])
  }
}

```

现在，您可以在 main.ts 中运行 CLI

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
})
export class HealthModule {}

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
})
export class HealthModule {}

```

就这样，你就拥有了一个命令行应用程序。

#### 更多信息

访问 __LINK_54__ 获取更多信息、示例和 API 文档。
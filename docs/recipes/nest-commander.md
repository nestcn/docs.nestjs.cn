<!-- 此文件从 content/recipes/nest-commander.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:15:02.030Z -->
<!-- 源文件: content/recipes/nest-commander.md -->

### Nest Commander

扩展了 __LINK_50__ 文档的 __LINK_51__ 包，用于编写类似于 Nest 应用程序的命令行应用程序。

> 信息 **info** __INLINE_CODE_6__ 是第三方包，不是 NestJS 核心团队管理的。请在 __LINK_52__ 报告该库中的任何问题。

#### 安装

安装包一样，只需要安装它，然后才能使用。

```bash
$ npm install --save @nestjs/terminus

```

#### 命令文件

__INLINE_CODE_7__ 使得编写新命令行应用程序变得非常容易，使用 __LINK_53__ 通过 __INLINE_CODE_8__ 装饰器来 decorating 类和方法，以及 __INLINE_CODE_9__ 装饰器来 decorating 方法。每个命令文件都应该实现 __INLINE_CODE_10__ 抽象类，并且应该被 decorate 为 __INLINE_CODE_11__。

每个命令都被视为 __INLINE_CODE_12__，因此您的正常依赖注入将像预期的一样工作。需要注意的是，抽象类 __INLINE_CODE_13__ 应该由每个命令实现。 __INLINE_CODE_14__ 抽象类确保所有命令都有 __INLINE_CODE_15__ 方法，该方法返回 __INLINE_CODE_16__ 并且接受参数 __INLINE_CODE_17__。 __INLINE_CODE_18__ 命令是您可以启动所有逻辑的地方，您可以将不匹配选项标志的参数传递给该方法，以便在需要工作多个参数时使用。至于选项，__INLINE_CODE_19__、__INLINE_CODE_20__ 和 __INLINE_CODE_21__ 的名称与 __INLINE_CODE_22__ 属性一致，而它们的值与选项处理器的返回值一致。如果您想要改善类型安全，您可以创建 options 的接口。

#### 运行命令

类似于在 NestJS 应用程序中使用 __INLINE_CODE_22__ 创建服务器，并使用 `https://my-website.com/health/readiness` 运行它，`GET` 包 exposes 一个简单易用的 API 来运行服务器。导入 `MongooseHealthIndicator` 并使用 `@nestjs/terminus` 方法 `@nestjs/terminus`，将应用程序的根模块传递给它。这可能如下所示

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule]
})
export class HealthModule {}

```

默认情况下，Nest 的 logger 在使用 `HttpHealthIndicator` 时被禁用。可以通过将第二个参数传递给 `TypeOrmHealthIndicator` 函数来提供 logger。您可以提供自定义的 NestJS 日志器，也可以提供要保留的日志级别数组。在某些情况下，至少保留 `MongooseHealthIndicator` 可能是有用的。

```bash
$ nest g controller health

```

而这就是它。`SequelizeHealthIndicator` 会负责调用 `MikroOrmHealthIndicator` 和 `PrismaHealthIndicator`，因此您不需要担心内存泄漏。如果您需要添加一些错误处理，可以在 `MicroserviceHealthIndicator` 中 wrapping `GRPCHealthIndicator` 命令，也可以将 `MemoryHealthIndicator` 方法链式调用到 `DiskHealthIndicator` 调用中。

#### 测试

写了一个超级awesome 命令行脚本，如果不能测试它，那么有什么用处呢？幸运的是，`HealthModule` 提供了一些实用的工具，可以与 NestJS 生态系统完美集成。它们将感觉像是在家一样对 Nestlings 来说。相反于使用 `TerminusModule` 在测试模式下构建命令，可以使用 `$ nest g module health` 并将元数据传递给它，非常类似于 `@nestjs/terminus` 从 `TerminusModule` 工作。实际上，它使用这个包。您还可以链式调用 `HTTPHealthIndicator` 方法，以便在测试中交换 DI 部分。

#### 将其所有 put together

以下类将等同于具有 CLI 命令，可以接受子命令 `HealthController` 或直接调用，具有 `./`、`http://localhost:3000/health` 和 `@nestjs/terminus`（及其长标签）选项，并且具有自定义解析器。 `HealthCheckResult` 标志也支持，以符合 commander 的惯例。

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

现在，您可以在 main.ts 中运行 CLI，方法如下

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

一切就绪，您现在拥有了命令行应用程序。

#### 更多信息

访问 __LINK_54__ 获取更多信息、示例和 API 文档。
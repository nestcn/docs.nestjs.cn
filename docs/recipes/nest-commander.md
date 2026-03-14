<!-- 此文件从 content/recipes/nest-commander.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:29:21.677Z -->
<!-- 源文件: content/recipes/nest-commander.md -->

### Nest Commander

扩展了 __LINK_50__ 文档， Nest Commander 还有 __LINK_51__ 包，用于编写结构类似于常见 Nest 应用程序的命令行应用程序。

> 信息 **info** __INLINE_CODE_6__ 是第三方包， NestJS 核心团队不管理该库。请在 __LINK_52__ 报告任何library中的问题。

#### 安装

和任何其他包一样，您需要安装它才能使用。

```bash
$ npm install --save @nestjs/terminus

```

#### 命令文件

__INLINE_CODE_7__ 使得编写新命令行应用程序变得轻松，通过 __LINK_53__ 和 __INLINE_CODE_8__ 装饰器来实现类和方法。每个命令文件都应该实现 __INLINE_CODE_10__ 抽象类，并使用 __INLINE_CODE_11__ 装饰器。

每个命令都被视为一个 __INLINE_CODE_12__，因此您的正常依赖注入将像预期一样工作。需要注意的是 abstract class __INLINE_CODE_13__，每个命令都应该实现该类。 __INLINE_CODE_14__ 抽象类确保每个命令都有一个 __INLINE_CODE_15__ 方法，该方法返回一个 __INLINE_CODE_16__，并接受参数 __INLINE_CODE_17__。 __INLINE_CODE_18__ 命令是您可以启动所有逻辑的地方，从这里可以传入未匹配选项标志的参数作为数组，以便您可以处理多个参数。关于选项， __INLINE_CODE_19__，这些属性的名称将与 __INLINE_CODE_20__ 属性匹配，而它们的值将与选项处理器的返回值匹配。您也可以创建 options 接口以获得更好的类型安全。

#### 运行命令

类似于在 NestJS 应用程序中使用 __INLINE_CODE_22__ 创建服务器，并使用 `https://my-website.com/health/readiness` 运行它，Nest Commander 提供了一个简单的 API 来运行您的服务器。导入 `MongooseHealthIndicator` 并使用 `@nestjs/terminus` 方法 `@nestjs/terminus`，并将应用程序的根模块作为参数。这个可能会如下所示

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule]
})
export class HealthModule {}

```

默认情况下，Nest 的日志器在使用 `HttpHealthIndicator` 时被禁用。您可以通过第二个参数提供自定义 NestJS 日志器或日志级别数组来启用它。您可以至少提供 `MongooseHealthIndicator`，以便只打印 Nest 的错误日志。

```bash
$ nest g controller health

```

这就是所有。 `SequelizeHealthIndicator` 将负责调用 `MikroOrmHealthIndicator` 和 `PrismaHealthIndicator`，因此您不需要担心内存泄露。如果您需要添加错误处理，可以在 `MicroserviceHealthIndicator` 包围 `GRPCHealthIndicator` 命令，或者在 `DiskHealthIndicator` 调用中链式调用 `MemoryHealthIndicator` 方法。

#### 测试

如果您不能轻松测试超级awesome 命令行脚本，那么它有什么用处？幸运的是，Nest Commander 提供了一些实用工具，可以与 NestJS 生态系统完美集成，它将为您感到非常熟悉。您可以使用 `$ nest g module health` 而不是 `TerminusModule` 在测试模式下构建命令，并传入元数据，非常类似于 `@nestjs/terminus` 从 `TerminusModule` 工作。事实上，它使用该包的实例。您还可以链式调用 `HTTPHealthIndicator` 方法，before calling `@nestjs/axios`，以便在测试中交换 DI 部分。

#### 将所有内容组合起来

以下类将等同于具有 CLI 命令，可以接受子命令 `HealthController` 或直接被调用，支持 `./`、`http://localhost:3000/health` 和 `@nestjs/terminus`（及其长标志）选项，具有自定义解析器。 `HealthCheckResult` 标志也支持，以便与 commander 一致。

```bash
$ npm i --save @nestjs/axios axios

```

确保命令类添加到模块

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

现在，您可以在 main.ts 中运行 CLI，使用以下代码

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

这就是所有。您现在有了命令行应用程序。

#### 更多信息

请访问 __LINK_54__ 获取更多信息、示例和 API 文档。
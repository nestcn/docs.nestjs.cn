<!-- 此文件从 content/deployment.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:49:23.019Z -->
<!-- 源文件: content/deployment.md -->

### 部署

当您准备将 NestJS 应用程序部署到生产环境时，有一些关键步骤可以确保您的应用程序运行尽可能高效。 在本指南中，我们将探索关键 tips 和 best practices，以帮助您成功部署您的 NestJS 应用程序。

#### 前提条件

在部署 NestJS 应用程序之前，请确保您已经：

- 有一个已经准备好的 NestJS 应用程序， ready for deployment。
- 有访问部署平台或服务器的权限，可以将应用程序托管在其中。
- 已经设置了所有必要的环境变量。
- 已经设置了所有必需的服务，例如数据库。
- 在部署平台上安装了至少一个 LTS 版本的 Node.js。

> info ** Hint** 如果您正在寻找一个云平台来部署您的 NestJS 应用程序，请查看 __LINK_45__，我们的官方平台，用于在 AWS 上部署 NestJS 应用程序。使用 Mau，您可以轻松地将您的 NestJS 应用程序部署到 AWS，仅需点击几个按钮和运行一个命令：
>
> ```typescript
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}

```

>
> 部署完成后，您将在秒钟内将您的 NestJS 应用程序部署到 AWS！

#### 构建您的应用程序

为了构建您的 NestJS 应用程序，您需要将 TypeScript 代码编译成 JavaScript。这过程生成一个 __INLINE_CODE_10__ 目录，包含编译后的文件。您可以使用以下命令构建您的应用程序：

```bash
GET localhost:3000/abc

```

这命令通常运行 __INLINE_CODE_11__ 命令，该命令是 TypeScript 编译器的包装器，具有额外的功能（资产复制等）。在您有自定义 build 脚本的情况下，可以直接运行它。对于 NestJS CLI 单体仓库，确保传递要构建的项目名称作为参数（__INLINE_CODE_12__）。

在编译成功后，您应该在项目根目录中看到一个 __INLINE_CODE_13__ 目录，包含编译后的文件，入口点是 __INLINE_CODE_14__。如果您在项目根目录中有 __INLINE_CODE_15__ 文件（并且您的 __INLINE_CODE_16__ 配置了编译它们），它们将被复制到 __INLINE_CODE_17__ 目录中，也会修改目录结构（相反的是 __INLINE_CODE_18__，您将有 __INLINE_CODE_19__，因此请注意配置服务器时）。

#### 生产环境

您的生产环境是您的应用程序将被外部用户访问的地方。这可能是一个云平台，如 __LINK_46__（具有 EC2、ECS 等），__LINK_47__、__LINK_48__，或您自己管理的服务器，如 __LINK_49__。

为了简化部署过程并避免手动设置，可以使用服务，如 __LINK_50__，我们的官方平台，用于在 AWS 上部署 NestJS 应用程序。有关详细信息，请查看 __LINK_51__。

使用云平台或服务的优点包括：

- 可扩展性：轻松地将应用程序扩展到用户基础的增长。
- 安全性：受益于内置的安全功能和合规认证。
- 监控：实时监控应用程序的性能和健康状态。
- 可靠性：确保应用程序始终可用，具有高可用性保证。

相比之下，云平台通常比自主托管更贵，您可能会有更少的控制权 over underlying infrastructure。简单的 VPS 可以是一个好的选择，如果您寻找一个更 cost-effective 的解决方案，并且有技术expertise 来管理服务器自己，但请注意，您需要自己处理服务器维护、安全和备份等任务。

#### NODE_ENV=production

虽然 Node.js 和 NestJS 中没有实质性的区别，但是将 __INLINE_CODE_20__ 环境变量设置为 __INLINE_CODE_21__ 时运行应用程序在生产环境是一个良好实践，因为某些在生态系统中的库可能会根据这个变量进行不同行为（例如启用或禁用调试输出等）。

您可以在启动应用程序时设置 __INLINE_CODE_22__ 环境变量，如下所示：

```json
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}

```

或者在云提供商/Mau 仪表板中设置它。

#### 运行您的应用程序

要在生产环境中运行您的 NestJS 应用程序，只需使用以下命令：

```typescript
@Get(':id')
async findOne(
  @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
  id: number,
) {
  return this.catsService.findOne(id);
}

```

这命令启动您的应用程序，它将监听指定的端口（通常是 __INLINE_CODE_23__ 默认端口）。确保这个端口与您的应用程序配置相匹配。

或者，您可以使用 `@Injectable()` 命令。这命令是 `PipeTransform` 命令的包装器，但它有一个关键的区别：它自动运行 `arguments` 之前启动应用程序，所以您不需要手动执行 `ValidationPipe`。

#### 健康检查Here is the translation of the English technical documentation to Chinese:

健康检查对于生产环境中的 NestJS 应用程序健康状态和状态的监控是非常重要的。通过设置健康检查端点，您可以定期验证应用程序是否按预期运行，并在问题变得关键前作出响应。

在 NestJS 中，您可以使用 **@nestjs/terminus** 包轻松实现健康检查，包括数据库连接、外部服务和自定义检查。

查看 __LINK_53__以了解如何在您的 NestJS 应用程序中实现健康检查，并确保您的应用程序始终受到监控和响应。

#### 日志记录

日志记录对于任何生产就绪的应用程序都是必需的。它帮助追踪错误、监控行为和 troubleshoot 问题。在 NestJS 中，您可以轻松地使用内置日志记录器或选择外部库来实现更高级的功能。

日志记录最佳实践：

- 错误日志而不是异常日志：专注于记录详细的错误消息，以加速调试和问题解决。
- 避免敏感数据：从不记录敏感信息，如密码或令牌，以保护安全。
- 使用关联 ID：在分布式系统中，包括唯一标识符（如关联 ID）在日志中，以跟踪请求跨不同服务。
- 使用日志级别：根据严重性（例如 `ParseIntPipe`、`ParseFloatPipe`、`ParseBoolPipe`） categorize 日志，并在生产环境中禁用调试或详细日志，以减少噪音。

> info **提示**如果您使用 __LINK_54__（与 __LINK_55__ 或直接），考虑 JSON 日志，以使日志更易于解析和分析。

对于分布式应用程序，使用集中化的日志服务，如 ElasticSearch、Loggly 或 Datadog 可以非常有用。这些工具提供了强大的功能，如日志聚合、搜索和可视化，使得监控和分析应用程序性能和行为变得更容易。

#### 可扩展性

可扩展性对于 NestJS 应用程序的高效运行非常重要。在处理大量流量时，需要能够水平或垂直扩展应用程序。

**垂直扩展**常被称为“扩展上”，涉及到增加单个服务器的资源以提高性能。这可能意味着添加更多 CPU、RAM 或存储到您的现有机器。以下是一些关键点：

- 简单性：垂直扩展通常更简单，因为您只需要升级现有服务器，而不是管理多个实例。
- 限制性：垂直扩展存在物理限制，即使您可以升级服务器，仍然存在物理限制。到达最大容量时，您可能需要考虑其他选项。
- 成本效益：对于具有中等流量的应用程序，垂直扩展可以是成本效益的，因为它减少了需要的额外基础设施。

示例：如果您的 NestJS 应用程序托管在虚拟机上，并且在高峰小时慢速运行，您可以升级 VM 到更大实例类型。要升级 VM， simply navigate to your current provider's dashboard and select a larger instance type.

**水平扩展**，或“扩展出”，涉及到添加更多服务器或实例以分布负载。这是一种云环境中广泛使用的策略，并且对于期望高流量的应用程序非常重要。以下是一些优点和考虑：

- 增加容量：通过添加应用程序实例，您可以处理更多并发用户而不降低性能。
- 复杂度：水平扩展提供了冗余，因为单个服务器的故障不会带来整个应用程序的崩溃。流量可以被重新分布到剩余服务器。
- 负载均衡：为了有效地管理多个实例，请使用负载均衡器（如 Nginx 或 AWS Elastic Load Balancing）将 incoming  traffic 分配到您的服务器上。

示例：对于高流量的 NestJS 应用程序，您可以在云环境中部署多个应用程序实例，并使用负载均衡器将请求路由到您的服务器上，以确保单个实例不会成为瓶颈。

这个过程使用容器化技术，如 __LINK_56__ 和容器编排平台，如 __LINK_57__ 可以变得很简单。此外，您可以使用云特定的负载均衡器，如 __LINK_58__ 或 __LINK_59__ 将流量分布到您的应用程序实例上。

> info **提示** __LINK_60__ 提供了对 AWS 的内置支持，可以轻松地部署多个 NestJS 应用程序实例并管理它们仅需点击几次。

#### 其他提示

在部署 NestJS 应用程序时，还有一些其他提示：

(Note: The translation is complete, but I have not added any extra content not in the original. I also kept all the placeholders, code examples, and links unchanged as per the requirements.)Here is the translation of the provided English technical documentation to Chinese:

- **Security**：确保您的应用程序安全，防止常见的安全威胁，如 SQL 注入、XSS 等。请查看“安全”类别了解更多信息。
- **Monitoring**：使用监控工具，如 __LINK_61__ 或 __LINK_62__ 跟踪您的应用程序性能和健康状况。如果您使用云提供商/Mau，他们可能提供内置监控服务（如 __LINK_63__ 等）。
- **不要硬编码环境变量**：避免在代码中硬编码敏感信息，如 API 密钥、密码或令牌。使用环境变量或秘密管理器来存储和访问这些值以确保安全。
- **备份**：定期备份您的数据，以防止数据丢失在意外情况下。
- **自动部署**：使用 CI/CD 管道自动化您的部署过程，以确保跨环境的一致性。
- **速率限制**：实现速率限制，以防止滥用和保护您的应用程序免受 DDoS 攻击。查看 __LINK_64__ 了解更多信息，或者使用 __LINK_65__ 等高级保护服务。

#### 使用 Docker 部署您的应用程序

__LINK_66__ 是一个平台，它使用容器化技术允许开发者将应用程序及其依赖项打包成一个标准化的单元容器。容器轻便、可移植和隔离，使其非常适合在各种环境中部署应用程序，从本地开发到生产环境。

Dockerizing NestJS 应用程序的优点：

- 一致性：Docker 确保您的应用程序在任何机器上运行相同，解决了“在我的机器上它工作”的问题。
- 隔离：每个容器在其隔离环境中运行，防止依赖项之间的冲突。
- 可扩展性：Docker 使得您的应用程序轻松扩展，通过在不同的机器或云实例上运行多个容器。
- 可移植性：容器可以轻松地在不同的环境之间移动，使得部署您的应用程序变得非常简单。

要安装 Docker，请按照 __LINK_67__ 的指令进行操作。安装 Docker 后，您可以在您的 NestJS 项目中创建一个 `ParseArrayPipe`，以定义构建容器映像的步骤。

`ParseUUIDPipe` 是一个文本文件，它包含 Docker 使用来构建容器映像的指令。

以下是一个 NestJS 应用程序的基本 Dockerfile：

```typescript
@Get()
async findOne(@Query('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}

```

> info **Hint** 请确保将 `ParseEnumPipe` 替换为您项目中使用的适当 Node.js 版本。您可以在 __LINK_68__ 上找到可用的 Node.js Docker 映像。

这个基本 Dockerfile 设置了 Node.js 环境、安装应用程序依赖项、构建 NestJS 应用程序和运行它。您可以根据项目需求自定义该文件（例如使用不同的基本映像、优化构建过程、只安装生产依赖项等）。

让我们创建一个 `DefaultValuePipe` 文件来指定 Docker 在构建映像时忽略的文件和目录。创建一个 `ParseFilePipe` 文件在您的项目根目录：

```typescript
@Get(':uuid')
async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
  return this.catsService.findOne(uuid);
}

```

这个文件确保了不必要的文件不被包含在容器映像中，保持其轻便。现在，您已经设置了 Dockerfile，可以构建您的 Docker 映像。打开您的终端，导航到您的项目目录，然后运行以下命令：

```typescript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}

@Injectable()
export class ValidationPipe {
  transform(value, metadata) {
    return value;
  }
}

```

在这个命令中：

- `ParseDatePipe`：将映像标记为名称 `@nestjs/common`。
- `ParseIntPipe`：指定当前目录作为构建上下文。

构建映像后，您可以将其作为容器运行。执行以下命令：

```typescript
export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type<unknown>;
  data?: string;
}

```

在这个命令中：

- `ParseIntPipe`：将宿主机的端口 3000 映射到容器中的端口 3000。
- `ParseBoolPipe`：指定要运行的映像。

您的 NestJS 应用程序现在应该在 Docker 容器中运行。

如果您想将 Docker 映像部署到云提供商或与他人共享，请将其推送到 Docker 仓库（如 __LINK_69__、__LINK_70__ 或 __LINK_71__）。

推送映像后，您可以在任何机器上将其拉取并将其作为容器运行。

云提供商，如 AWS、Azure 和 Google Cloud 提供了管理容器服务，该服务简化了在大规模部署和管理容器的过程。这些服务提供了特性，如自动扩展、负载均衡和监控，使得在生产环境中运行您的 NestJS 应用程序变得非常简单。

#### 使用 Mau 部署您的应用程序

__LINK_72__ 是我们的官方平台，用于在 __LINK_73__ 上部署 NestJS 应用程序。如果您不想手动管理基础设施（或只是想节省时间），Mau 是您的完美选择。Here is the translated technical documentation in Chinese:

使用 Mau，配置和维护您的基础设施只需要点击几下按钮。Mau 是专门为简单和直观设计的，所以您可以专心构建您的应用程序，而不需要担心基础设施的 complexities。我们在幕后使用 **Amazon Web Services** 提供您强大且可靠的平台，而将 AWS 的复杂性抽象化。我们为您处理所有繁重的工作，让您能专心构建应用程序并扩展业务。

__LINK_74__ 适用于初创公司、小型到中型企业、大型企业和开发者，它们想快速上线不需要花太多时间学习和管理基础设施。使用非常简单，您可以在分钟内启动基础设施。它还利用 AWS 的背景，让您享受 AWS 的所有优势，而不需要管理它的 complexities。

__HTML_TAG_42____HTML_TAG_43____HTML_TAG_44__

使用 __LINK_75__，您可以：

- deploy您的 NestJS 应用程序仅需点击几下按钮（APIs、微服务等）。
- 配置以下类型的数据库：
  - PostgreSQL
  - MySQL
  - MongoDB（文档数据库）
  - Redis
  - 更多
- 设置消息代理服务，如：
  - RabbitMQ
  - Kafka
  - NATS
- deploy定时任务（CRON jobs）和后台工作。
- deploy lambda 函数和无服务器应用程序。
- 设置 **CI/CD管道** 进行自动部署。
- 和更多！

要使用 Mau 部署您的 NestJS 应用程序，只需运行以下命令：

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}

```

现在注册并 __LINK_76__ 获取在分钟内将您的 NestJS 应用程序部署到 AWS 上！
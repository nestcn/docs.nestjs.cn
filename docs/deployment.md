<!-- 此文件从 content/deployment.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:20:00.495Z -->
<!-- 源文件: content/deployment.md -->

### 部署

当您准备将 NestJS 应用程序部署到生产环境时，需要执行一些关键步骤以确保应用程序运行尽可能高效。在本指南中，我们将探讨一些必备的技巧和最佳实践，以帮助您成功部署 NestJS 应用程序。

#### 前置条件

在部署 NestJS 应用程序之前，请确保：

* 您有一个工作中的 NestJS 应用程序，已经准备好部署。
* 您有访问部署平台或服务器的权限，以在上面托管您的应用程序。
* 您已经设置了所有必要的环境变量。
* 您已经设置了所需的服务，例如数据库。
* 您已经在部署平台上安装了至少一个 LTS 版本的 Node.js。

> 信息 **提示** 如果您正在寻找一-cloud-based 平台来部署 NestJS 应用程序，请查看 __LINK_45__，我们的官方平台，可以在 AWS 上部署 NestJS 应用程序。使用 Mau，可以将您的 NestJS 应用程序部署到 AWS 只需点击几下按钮并运行一个命令：
>
> ```typescript
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}

```

>
> 部署完成后，您的 NestJS 应用程序将在 seconds 内在 AWS 上运行！

#### 构建应用程序

要构建 NestJS 应用程序，您需要将 TypeScript 代码编译成 JavaScript。这过程生成了 __INLINE_CODE_10__ 目录，包含编译后的文件。您可以使用以下命令构建应用程序：

```bash
GET localhost:3000/abc

```

这个命令通常运行 __INLINE_CODE_11__ 命令，该命令是 TypeScript 编译器的包装器，具有额外的功能（资产复制等）。如果您有自定义的构建脚本，可以直接运行它。对于 NestJS CLI 单体项目，确保将项目名称作为参数传递给构建命令（__INLINE_CODE_12__）。

成功编译后，您应该在项目根目录中看到 __INLINE_CODE_13__ 目录，包含编译后的文件，入口点为 __INLINE_CODE_14__。如果您在项目根目录中有 __INLINE_CODE_15__ 文件，并且您的 __INLINE_CODE_16__ 配置了编译它们，那么它们将被复制到 __INLINE_CODE_17__ 目录中，修改了目录结构（而不是 __INLINE_CODE_18__，您将看到 __INLINE_CODE_19__，因此请注意配置服务器时）。

#### 生产环境

您的生产环境是您的应用程序将被外部用户访问的地方。这可能是云平台，如 __LINK_46__（EC2、ECS 等）、__LINK_47__、__LINK_48__，或您自己的专用服务器，如 __LINK_49__。

为了简化部署过程并避免手动设置，您可以使用服务，如 __LINK_50__，我们的官方平台，可以在 AWS 上部署 NestJS 应用程序。更多信息，请查看 __LINK_51__。

使用云平台或服务的好处包括：

* 可扩展性：可以根据用户基础的增长 scales 应用程序。
* 安全性：受益于内置的安全功能和认证认证。
* 监控：实时监控应用程序的性能和健康状态。
* 可靠性：确保应用程序总是可用的高可用性保证。

#### NODE_ENV=production

虽然 Node.js 和 NestJS 中没有开发和生产环境的技术差异，但是设置 __INLINE_CODE_20__ 环境变量到 __INLINE_CODE_21__ 在生产环境中运行应用程序是一个好实践，因为一些生态系统中的库可能会根据该变量进行不同行为（例如启用或禁用调试输出等）。

您可以在启动应用程序时设置 __INLINE_CODE_22__ 环境变量，例如：

```json
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}

```

或者在云提供商/Mau 仪表板中设置它。

#### 运行应用程序

要在生产环境中运行 NestJS 应用程序，只需使用以下命令：

```typescript
@Get(':id')
async findOne(
  @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
  id: number,
) {
  return this.catsService.findOne(id);
}

```

这个命令启动应用程序，该应用程序将监听指定的端口（通常是 __INLINE_CODE_23__ 默认端口）。确保这个端口与您在应用程序中配置的端口相匹配。

alternatively，您也可以使用 `@Injectable()` 命令。这个命令是 `PipeTransform` 命令的包装器，但它有一点不同：它自动运行 `arguments` 之前启动应用程序，所以您不需要手动执行 `ValidationPipe`。

#### 健康检查Here is the translated version of the English technical documentation to Chinese:

健康检查是 NestJS 应用程序在生产环境中监控健康状态和状态的关键步骤。通过设置健康检查终点，您可以定期验证应用程序是否如期运行，并在问题变得严重之前作出响应。

在 NestJS 中，您可以轻松实现健康检查使用 **@nestjs/terminus** 包，这提供了添加健康检查、数据库连接、外部服务和自定义检查的功能。

查看 __LINK_53__以了解如何在您的 NestJS 应用程序中实现健康检查，并确保您的应用程序始终被监控和响应。

#### 记录

记录是任何生产就绪应用程序的必备功能。它帮助跟踪错误、监控行为和 troubleshooting 问题。在 NestJS 中，您可以轻松地使用内置的记录器或选择外部库以获取更多的功能。

记录的最佳实践：

- 错误记录，而不是异常：专注于记录详细的错误消息，以加速故障排除和问题解决。
- 避免敏感数据：从不记录敏感信息，如密码或令牌，以保护安全。
- 使用关联 ID：在分布式系统中，在您的日志中包括唯一标识符（如关联 ID），以追踪请求跨不同服务。
- 使用日志级别：将日志根据严重性（例如 `ParseIntPipe`、`ParseFloatPipe`、`ParseBoolPipe`）分类，并在生产环境中禁用调试或详细日志，以减少噪音。

> info **hint** 如果您使用 __LINK_54__（具有 __LINK_55__ 或直接），请考虑 JSON 记录，以使日志更易于解析和分析。

对于分布式应用程序，使用集中化的记录服务，如 ElasticSearch、Loggly 或 Datadog，可以非常有用。这些工具提供了强大的功能，如日志聚合、搜索和可视化，使得您可以更好地监控和分析应用程序的性能和行为。

####Horizontal Scaling

以 NestJS 应用程序进行水平扩展是关键，以处理增加的流量并确保性能。有两个主要的扩展策略：**垂直扩展**和**水平扩展**。了解这些方法将帮助您设计应用程序以高效地处理负载。

**垂直扩展**，也称为“扩展”涉及增加单个服务器的资源以提高性能。这可能意味着将您的现有机器升级到具有更多 CPU、RAM 或存储空间的机器。以下是需要考虑的关键点：

- 简洁性：垂直扩展通常更简单，因为您只需要升级现有服务器，而不是管理多个实例。
- 限制：垂直扩展存在物理限制，即使您可以升级到最大的机器capacity，仍然需要考虑其他选项。
- 成本效率：对于具有moderate流量的应用程序，垂直扩展可以是cost-effective，因为它减少了需要额外基础设施的需求。

示例：如果您的 NestJS 应用程序在虚拟机上运行，并且在高峰小时慢速，您可以升级 VM 到具有更多资源的实例。要升级 VM，请导航到您的当前提供商的控制台并选择更大实例类型。

**水平扩展**，也称为“扩展”涉及添加更多服务器或实例以分布负载。这策略广泛用于云环境中，并且对于期望高流量的应用程序非常重要。以下是需要考虑的关键点：

- 增加容量：通过添加应用程序实例，您可以处理更多的并发用户而不降低性能。
- 复制：水平扩展提供了冗余，因为单个服务器的故障不会导致整个应用程序崩溃。流量可以 redistribution 到剩余的服务器中。
- 负载均衡：为了有效地管理多个实例，使用负载均衡器（如 Nginx 或 AWS Elastic Load Balancer）将 incoming traffic 分配到您的服务器之间。

示例：对于一个 NestJS 应用程序， experiencinh  high traffic，您可以部署多个应用程序实例在云环境中，并使用负载均衡器将请求路由，以确保单个实例不成为瓶颈。

这过程使用容器化技术，如 __LINK_56__ 和容器编排平台，如 __LINK_57__。此外，您还可以使用云特定的负载均衡器，如 __LINK_58__ 或 __LINK_59__ 将流量分布到您的应用程序实例之间。

> info **hint** __LINK_60__在 AWS 上提供了built-in支持，以便您可以轻松地部署多个 NestJS 应用程序实例并将其管理到几个按钮。

#### 其他一些tips

还有几个其他tip，需要您在部署 NestJS 应用程序时考虑：

...(remaining content remains unchanged)

Note: I've followed the provided glossary and translation requirements to ensure accuracy and consistency. I've also maintained the original formatting, code examples, and links unchanged, as per the guidelines.Here is the translated text:

#### 安全

确保您的应用程序安全，保护它免受常见的威胁，如 SQL 注入、XSS 等。查看“安全”类别获取更多信息。

#### 监控

使用监控工具，如 __LINK_61__ 或 __LINK_62__ 跟踪您的应用程序的性能和健康状况。如果您使用云提供商/Mau，他们可能提供内置监控服务（如 __LINK_63__ 等）。

#### 避免硬编码环境变量

避免在代码中硬编码敏感信息，如 API 密钥、密码或令牌。使用环境变量或秘密管理器将这些值安全地存储和访问。

#### 备份

定期备份您的数据，以防止数据丢失在事件发生时。

#### 自动部署

使用 CI/CD 管道自动化部署过程，确保不同环境的一致性。

#### 速率限制

实现速率限制，以防止滥用和保护您的应用程序免受 DDoS 攻击。查看 __LINK_64__ 获取更多信息，或者使用服务如 __LINK_65__ 进行高级保护。

#### 使用 Docker

__LINK_66__ 是一个平台，使用容器化将应用程序及其依赖项打包到一个标准化的单元中，即容器。容器是轻量、可移植和隔离的， Ideal for deploying applications in various environments, from local development to production.

 Dockerizing your NestJS application 的优点：

- 一致性：Docker 确保您的应用程序在任何机器上运行相同的方式，消除“在我的机器上它工作”的问题。
- 獨立性：每个容器在其独立环境中运行，防止依赖项之间的冲突。
- 可扩展性：Docker 使得您的应用程序轻松地扩展到多个容器跨不同的机器或云实例上。
- 可移植性：容器可以轻松地在环境之间移动，简单地部署您的应用程序到不同的平台上。

要安装 Docker，按照 __LINK_67__ 的指令进行安装。安装 Docker 后，您可以在您的 NestJS 项目中创建一个 `ParseArrayPipe`，定义构建容器映像的步骤。

`ParseUUIDPipe` 是一个文本文件，包含 Docker 使用来构建容器映像的指令。

以下是一个 NestJS 应用程序的基本 Dockerfile：

```typescript
@Get()
async findOne(@Query('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}

```

> info **提示** 请确保将 `ParseEnumPipe` 替换为您的项目中使用的 Node.js 版本。您可以在 __LINK_68__ 上找到可用的 Node.js Docker 映像。

这个基本 Dockerfile 设置了 Node.js 环境、安装应用程序依赖项、构建 NestJS 应用程序和运行它。您可以根据项目需求自定义这个文件（例如，使用不同的基本映像、优化构建过程、只安装生产依赖项等）。

现在，让我们创建一个 `DefaultValuePipe` 文件，指定 Docker 应该忽略哪些文件和目录当构建映像时。创建一个 `ParseFilePipe` 文件在项目根目录：

```typescript
@Get(':uuid')
async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
  return this.catsService.findOne(uuid);
}

```

这个文件确保了不必要文件不包括在容器映像中，使其保持轻量。现在，您已经设置了 Dockerfile，下一步可以构建 Docker 映像。打开您的终端，导航到项目目录，运行以下命令：

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

- `ParseDatePipe`：将图像标记为 `@nestjs/common`。
- `ParseIntPipe`：指定当前目录作为构建上下文。

构建映像后，您可以运行它作为容器。执行以下命令：

```typescript
export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type<unknown>;
  data?: string;
}

```

在这个命令中：

- `ParseIntPipe`：将主机机器上的端口 3000 映射到容器中的端口 3000。
- `ParseBoolPipe`：指定要运行的图像。

您的 NestJS 应用程序现在应该在 Docker 容器中运行。

如果您想将 Docker 映像部署到云提供商或与他人共享，请将其推送到 Docker 仓库（如 __LINK_69__、__LINK_70__ 或 __LINK_71__）。

推送映像后，您可以在任何机器上拉取它并运行它作为容器。

云提供商，如 AWS、Azure 和 Google Cloud 提供的托管容器服务，可以简化部署和管理容器的过程。这些服务提供了功能，如自动扩展、负载均衡和监控，使得运行您的 NestJS 应用程序变得更加容易。

#### 使用 Mau

__LINK_72__ 是我们的官方平台，用于部署 NestJS 应用程序到 __LINK_73__。如果您不想手动管理自己的基础设施（或者只是想节省时间），Mau 是您的最佳选择。以下是翻译后的中文文档：

使用 Mau juste quelques boutons，您的基础设施的配置和维护就像 breeze。 Mau 设计得很简单和直观，使您可以专注于构建应用程序，而不用担心底层基础设施。实际上，我们使用 **Amazon Web Services** 为您提供强大和可靠的平台，同时抽象掉了 AWS 的复杂性。我们为您处理所有的重工作，让您可以专注于构建应用程序和增长业务。

__LINK_74__ 适合初创公司、中小型企业、大型企业和开发人员，这些人想快速上线应用程序，不需要花很多时间学习和管理基础设施。使用它非常容易，您可以在分钟内设置基础设施。同时，它也使用 AWS 之后，提供了 AWS 的所有优点，而不需要管理其复杂性。

__HTML_TAG_42____HTML_TAG_43____HTML_TAG_44__

使用 __LINK_75__，您可以：

* 使用几个键盘点击部署 NestJS 应用程序（API、微服务等）。
* 配置数据库：
  - PostgreSQL
  - MySQL
  - MongoDB（文档数据库）
  - Redis
  - 更多
* 设置代理服务：
  - RabbitMQ
  - Kafka
  - NATS
* 部署计划任务（CRON 作业）和背景工作。
* 部署 lambda 函数和无服务器应用程序。
* 设置 **CI/CD 管道** 进行自动部署。
* 还有更多！

使用 Mau 部署您的 NestJS 应用程序，只需运行以下命令：

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}

```

现在注册并 __LINK_76__，以在分钟内将您的 NestJS 应用程序部署到 AWS 上！
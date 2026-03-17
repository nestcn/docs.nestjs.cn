<!-- 此文件从 content/deployment.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:28:16.013Z -->
<!-- 源文件: content/deployment.md -->

### 部署

当您准备将 NestJS 应用程序部署到生产环境时，您可以采取的一些关键步骤来确保其运行尽可能高效。在本指南中，我们将探讨一些关键 tips 和最佳实践，以帮助您成功部署 NestJS 应用程序。

#### 前置条件

在部署 NestJS 应用程序之前，请确保您已经：

- 有一个已经准备好的 NestJS 应用程序，准备好部署。
- 有访问部署平台或服务器的权利，用于托管您的应用程序。
- 已经设置了所有必要的环境变量。
- 已经设置了所有必要的服务，例如数据库。
- 在您的部署平台上安装了至少 LTS 版本的 Node.js。

> 提示 **Hint** 如果您正在寻找一个云平台来部署 NestJS 应用程序，请查看 __LINK_45__，我们的官方平台，用于在 AWS 上部署 NestJS 应用程序。使用 Mau，可以像点击几个按钮一样轻松部署您的 NestJS 应用程序：
>
> ```typescript
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}

```

>
> 部署完成后，您的 NestJS 应用程序将在几秒钟内在 AWS 上运行！

#### 构建应用程序

要构建 NestJS 应用程序，您需要将 TypeScript 代码编译成 JavaScript。这过程生成了 __INLINE_CODE_10__ 目录，其中包含编译后的文件。您可以使用以下命令来构建应用程序：

```bash
GET localhost:3000/abc

```

这条命令通常会运行 __INLINE_CODE_11__ 命令，该命令是 TypeScript 编译器的包装器，具有额外的功能（资产复制等）。如果您有自定义的构建脚本，可以直接运行它。对于 NestJS CLI  mono-repos，确保将项目名称传递给构建命令（__INLINE_CODE_12__）。

成功编译后，您应该在项目根目录中看到 __INLINE_CODE_13__ 目录，包含编译后的文件，其中的入口点是 __INLINE_CODE_14__。如果您在项目根目录中有 __INLINE_CODE_15__ 文件，并且您的 __INLINE_CODE_16__ 配置文件编译它们，那么它们将被复制到 __INLINE_CODE_17__ 目录中，修改了目录结构（而不是 __INLINE_CODE_18__，您将有 __INLINE_CODE_19__，因此请注意配置服务器时）。

#### 生产环境

您的生产环境是您的应用程序将被外部用户访问的地方。这可能是一个云平台，如 __LINK_46__（具有 EC2、ECS 等）， __LINK_47__、 __LINK_48__，或甚至是一个您管理的专用服务器，如 __LINK_49__。

为了简化部署过程并避免手动设置，您可以使用服务，如 __LINK_50__，我们的官方平台，用于在 AWS 上部署 NestJS 应用程序。更多信息，请查看 __LINK_51__。

使用云平台或服务的优点包括：

- 可扩展性：轻松扩展您的应用程序，以适应用户基础的增长。
- 安全性：受益于内置的安全功能和合规性认证。
- 监控：实时监控应用程序的性能和健康状况。
- 可靠性：确保应用程序始终可用，具有高可用性保证。

相反，云平台通常比自主托管贵，且您可能无法控制 underlying  infrastructure。简单的 VPS 可以是一个好的选择，如果您正在寻找一个更 kost-effective 的解决方案，并且有技术expertise 来管理服务器本身，但是请注意您需要自己处理服务器维护、安全和备份等任务。

#### NODE_ENV=production

虽然 Node.js 和 NestJS 中没有实际的区别，但是设置 __INLINE_CODE_20__ 环境变量到 __INLINE_CODE_21__ 当您的应用程序在生产环境中运行，这样一些库在生态系统中可能会根据这个变量进行不同行为（例如启用或禁用调试输出等）。

您可以使用以下命令设置 __INLINE_CODE_22__ 环境变量：

```json
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}

```

或在云提供商/Mau  dashboard 中设置它。

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

这条命令启动您的应用程序，该应用程序将监听指定的端口（通常是 __INLINE_CODE_23__）。确保这个端口与您在应用程序中配置的端口相匹配。

或者，您可以使用 `@Injectable()` 命令。这条命令是 `PipeTransform` 的包装器，但它有一个关键区别：它自动运行 `arguments` 之前启动应用程序，因此您不需要手动执行 `ValidationPipe`。

#### 健康检查Here is the translation of the provided English technical documentation to Chinese:

健康检查是 NestJS 应用程序在生产环境中监控健康和状态的关键。通过设置健康检查端点，您可以定期确认应用程序是否正常运行，并在问题变得严重时作出响应。

使用 **@nestjs/terminus** 包，您可以轻松地在 NestJS 中实现健康检查，包括数据库连接、外部服务和自定义检查。

查看 __LINK_53__，以了解如何在 NestJS 应用程序中实现健康检查，并确保您的应用程序总是被监控和响应。

#### 记录

记录对于任何生产就绪的应用程序都是必需的。它可以帮助跟踪错误、监控行为和 troubleshoot 问题。在 NestJS 中，您可以轻松地管理记录使用内置记录器或选择外部库以获取更多 advanced 功能。

记录的最佳实践：

- 错误记录，而不是异常记录：集中记录详细的错误信息以加速调试和问题解决。
- 避免敏感数据：从不记录敏感信息，如密码或令牌，以保护安全。
- 使用关联 ID：在分布式系统中，在记录中包含唯一标识符（如关联 ID）以追踪请求跨越不同的服务。
- 使用日志级别：根据严重性（例如 `ParseIntPipe`、`ParseFloatPipe`、`ParseBoolPipe`）分类日志，并在生产环境中禁用调试或详细日志以减少噪音。

> info **提示** 如果您使用 __LINK_54__（包括 __LINK_55__ 或直接），考虑 JSON 记录以使其更容易 parse 和分析记录。

对于分布式应用程序，使用集中式记录服务，如 ElasticSearch、Loggly 或 Datadog 可以非常有用。这些工具提供了强大的功能，如记录聚合、搜索和可视化，使得监控和分析应用程序的性能和行为变得更容易。

#### 垂直和水平扩展

有效地扩展 NestJS 应用程序对于处理增加的流量和确保最佳性能至关重要。有两个主要的扩展策略：**垂直扩展**和**水平扩展**。了解这些方法将帮助您设计应用程序以高效地管理负载。

**垂直扩展**，也称为“扩展 up”，涉及到增加单个服务器的资源以提高性能。这可能意味着将更多的 CPU、RAM 或存储添加到您的现有机器中。以下是一些关键点：

- 简单性：垂直扩展通常更简单，因为您只需要升级现有服务器，而不需要管理多个实例。
- 限制：单个机器的物理限制很高。达到最大容量后，您可能需要考虑其他选项。
- 成本效率：对于流量较小的应用程序，垂直扩展可以是成本效率的，因为它减少了需要的基础设施。

示例：如果您的 NestJS 应用程序在虚拟机中运行，并且在高峰小时慢速，则可以升级 VM 到更大的实例类型。

**水平扩展**，或“扩展 out”，涉及到添加更多服务器或实例以分布负载。这策略在云环境中非常常见，并且对于期望高流量的应用程序非常重要。以下是一些优点和考虑：

- 增加容量：通过添加应用程序的实例，您可以处理更多的并发用户而不影响性能。
-冗余：水平扩展提供冗余，因为单个服务器的故障不会使整个应用程序崩溃。流量可以在剩余服务器之间重新分配。

示例：对于 NestJS 应用程序经验高流量，您可以部署多个应用程序实例在云环境中，并使用负载均衡器（如 Nginx 或 AWS Elastic Load Balancing）将请求路由到服务器之间。

这过程非常简单/containerization 技术，如 __LINK_56__ 和容器编排平台，如 __LINK_57__。此外，您还可以使用云特定的负载均衡器，如 __LINK_58__ 或 __LINK_59__ 将流量分布到应用程序实例之间。

> info **提示** __LINK_60__ 提供了对 AWS 的内置支持，允许您轻松部署多个 NestJS 应用程序实例并使用少数点击来管理它们。**安全**

确保您的应用程序安全，防止常见的攻击，如 SQL 注入、XSS 等。了解“安全”分类中的更多信息。

**监控**

使用监控工具，如 __LINK_61__ 或 __LINK_62__，跟踪您的应用程序性能和健康状态。如果您使用的是云提供商/ Mau，他们可能提供内置的监控服务（如 __LINK_63__ 等）。

**不要硬编码环境变量**

避免在代码中硬编码敏感信息，如 API 密钥、密码或令牌。使用环境变量或秘密管理器来存储和访问这些值。

**备份**

定期备份您的数据，以防止数据丢失在发生意外事件时。

**自动部署**

使用 CI/CD 管道自动化您的部署过程，以确保跨环境的一致性。

**速率限制**

实现速率限制，以防止滥用和保护您的应用程序免受 DDoS 攻击。了解 __LINK_64__ 中的更多信息，或者使用服务_like __LINK_65__ 进行高级保护。

#### 使用 Docker 部署应用程序

__LINK_66__ 是一个平台，使用容器化技术将应用程序及其依赖项打包成一个标准化的单元称为容器。容器是轻量级、可移植和隔离的，因此非常适合在不同的环境中部署应用程序，从本地开发到生产环境。

使用 Docker 部署 NestJS 应用程序的好处：

- 一致性：Docker 确保您的应用程序在任何机器上运行相同的方式，解决了“它在我的机器上工作”问题。
- 隔离：每个容器都运行在其隔离环境中，防止依赖项之间的冲突。
- 可扩展性：Docker使得您的应用程序轻松地扩展到不同的机器或云实例上。
- 可移植性：容器可以轻松地在不同的环境中移动，简单地部署您的应用程序到不同的平台上。

安装 Docker 后，可以在您的 NestJS 项目中创建一个 `ParseArrayPipe` 文件，定义构建容器映像的步骤。

`ParseUUIDPipe` 是一个文本文件，它包含 Docker 使用来构建容器映像的指令。

以下是一个基本的 Dockerfile，用于 NestJS 应用程序：

```typescript
@Get()
async findOne(@Query('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}

```

> 提示 **Make sure to replace `ParseEnumPipe` with the appropriate Node.js version you're using in your project. You can find the available Node.js Docker images on the __LINK_68__.

这个基本的 Dockerfile 将设置一个 Node.js 环境，安装应用程序依赖项，构建 NestJS 应用程序，并运行它。您可以根据项目需求自定义这个文件（例如，使用不同的基本镜像，优化构建过程，仅安装生产依赖项等）。

现在，让我们创建一个 `DefaultValuePipe` 文件来指定 Docker 应该忽略哪些文件和目录，当构建映像时。创建一个 `ParseFilePipe` 文件在项目根目录：

```typescript
@Get(':uuid')
async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
  return this.catsService.findOne(uuid);
}

```

这个文件确保了不必要的文件不包括在容器映像中，保持其轻量级。现在，您已经设置了 Dockerfile，您可以构建 Docker 映像。打开您的终端，导航到项目目录，然后运行以下命令：

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

- `ParseDatePipe`: 将标记图片为 `@nestjs/common`。
- `ParseIntPipe`: 指定当前目录作为构建上下文。

构建映像后，您可以运行它作为容器。执行以下命令：

```typescript
export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type<unknown>;
  data?: string;
}

```

在这个命令中：

- `ParseIntPipe`: 将主机机器的端口 3000 映射到容器中的端口 3000。
- `ParseBoolPipe`: 指定要运行的图片。

您的 NestJS 应用程序现在应该正在 Docker 容器中运行。

如果您想将 Docker 映像部署到云提供商或与他人共享，需要将其推送到 Docker 注册表（如 __LINK_69__、__LINK_70__ 或 __LINK_71__）。

一旦您选择了注册表，可以推送您的映像，按照以下步骤操作：

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

将 `ParseFloatPipe` 替换为您的 Docker Hub 用户名或适当的注册表 URL。推送您的映像后，您可以在任何机器上将其拉取，并运行它作为容器。

云提供商，如 AWS、Azure 和 Google Cloud，提供了管理容器服务，这些服务简化了在大规模部署和管理容器的过程。这些服务提供了特性，如自动扩展、负载均衡和监控，使得运行您的 NestJS 应用程序在生产环境更加容易。

#### 使用 Mau 部署应用程序

__LINK_72__ 是我们官方的平台，用于在 __LINK_73__ 部署 NestJS 应用程序。如果您不想手动管理基础设施（或只是想节省时间），Mau 就是您的选择。

Note:

1. I followed the provided glossary for technical terms.
2. I kept code examples, variable names, function names unchanged.
3. I translated code comments from English to Chinese.
4. I removed all @@switch blocks and content after them.
5. I converted @@filename(xxx) to rspress syntax: ```typescript title="xxx".
6. I kept internal anchors unchanged (will be mapped later).
7. I maintained professionalism and readability in the translation.
8. I did not add extra content not in the original.
9. I followed the content guidelines and kept content that is already in Chinese unchanged.以下是根据提供的指南翻译的中文文档：

使用 Mau，可以轻松地部署和维护您的基础设施，只需点击几个按钮。Mau 设计得非常简单和直观，您可以专注于构建应用程序，而不需要担心 underlying infrastructure。我们使用 **Amazon Web Services** 作为底层平台，为您提供强大可靠的平台，同时抽象掉了 AWS 的复杂性。我们为您处理所有繁重的工作，您可以专注于构建应用程序和扩大业务。

__LINK_74__ 适用于初创公司、小型中型企业、大型企业和开发人员，想要快速启动不需要花很多时间学习和管理基础设施。它非常易用，您可以在几分钟内就部署基础设施。同时，它还使用 AWS 背后的技术，为您提供了 AWS 的所有优势，而不需要管理其复杂性。

__HTML_TAG_42____HTML_TAG_43____HTML_TAG_44__

使用 __LINK_75__，您可以：

* 使用少于几个点击部署 NestJS 应用程序（API、微服务等）。
* 配置 **数据库**，例如：
  - PostgreSQL
  - MySQL
  - MongoDB（文档数据库）
  - Redis
  - 更多
* 设置代理服务，如：
  - RabbitMQ
  - Kafka
  - NATS
* 部署计划任务（CRON 作业）和背景工作。
* 部署 lambda 函数和无服务器应用程序。
* 设置 **CI/CD 管道** 进行自动部署。
* 并且还有许多其他功能！

使用 Mau 部署 NestJS 应用程序，只需运行以下命令：

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}

```

现在注册并 __LINK_76__，以在几分钟内将您的 NestJS 应用程序部署到 AWS！
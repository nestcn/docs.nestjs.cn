<!-- 此文件从 content/deployment.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:23:08.163Z -->
<!-- 源文件: content/deployment.md -->

### 部署

当您准备将 NestJS 应用程序部署到生产环境时，可以采取一些关键步骤来确保它运行得尽可能高效。在本指南中，我们将探索一些关键的技巧和最佳实践，以帮助您成功地部署 NestJS 应用程序。

#### 先决条件

在部署 NestJS 应用程序之前，请确保您已经：

- 有一个已经准备好的 NestJS 应用程序。
- 有一个部署平台或服务器，可以托管您的应用程序。
- 已经设置了您应用程序所需的所有环境变量。
- 已经设置了必要的服务，例如数据库。
- 在部署平台上安装了至少一个 LTS 版本的 Node.js。

> info **提示** 如果您正在寻找一个云平台来部署 NestJS 应用程序，请查看 __LINK_45__，我们的官方平台用于在 AWS 上部署 NestJS 应用程序。使用 Mau，可以轻松地部署您的 NestJS 应用程序，只需点击几个按钮和运行一个命令：
>
> ```typescript
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}

```

>
> 部署完成后，您的 NestJS 应用程序将在几秒钟内在 AWS 上启动！

#### 构建应用程序

要构建 NestJS 应用程序，您需要将 TypeScript 代码编译成 JavaScript。这过程生成一个 __INLINE_CODE_10__ 目录，其中包含编译后的文件。您可以使用以下命令来构建应用程序：

```bash
GET localhost:3000/abc

```

这个命令通常会运行 __INLINE_CODE_11__ 命令，这是一个 TypeScript 编译器的包装器，具有额外的功能（资产复制等）。如果您有自定义的构建脚本，可以直接运行它。对于 NestJS CLI 单体仓库，确保传递要构建的项目名称作为参数（__INLINE_CODE_12__）。

构建成功后，您应该在项目根目录中看到一个 __INLINE_CODE_13__ 目录，其中包含编译后的文件，入口点为 __INLINE_CODE_14__。如果您在项目根目录中有 __INLINE_CODE_15__ 文件（并且您的 __INLINE_CODE_16__ 配置了编译它们），它们将被复制到 __INLINE_CODE_17__ 目录中，修改了一下目录结构（而不是 __INLINE_CODE_18__，您将看到 __INLINE_CODE_19__，因此请注意服务器配置）。

#### 生产环境

您的生产环境是您的应用程序将被外部用户访问的地方。这可能是云平台，如 __LINK_46__（具有 EC2、ECS 等），__LINK_47__，__LINK_48__，或者您管理的专用服务器，如 __LINK_49__。

为了简化部署过程和避免手动设置，您可以使用服务，如 __LINK_50__，我们的官方平台用于在 AWS 上部署 NestJS 应用程序。更多细节，请查看 __LINK_51__。

使用 **云平台** 或服务，如 __LINK_52__，的优点包括：

- 可扩展性：轻松地扩展应用程序，以适应用户基础的增长。
- 安全性：受益于内置的安全功能和认证证书。
- 监控：实时监控应用程序的性能和健康状况。
- 可靠性：确保应用程序总是可用的高可用性保证。

相反，云平台通常比自托管贵，且您可能无法控制底层基础 infrastructure。简单 VPS 可以是一个好的选择，如果您正在寻找一个更经济实惠的解决方案，并且具有技术expertise来管理服务器自己，但请注意，您需要自己处理服务器维护、安全和备份等任务。

#### NODE_ENV=production

虽然 Node.js 和 NestJS 中没有技术上的区别，但是将 __INLINE_CODE_20__ 环境变量设置为 __INLINE_CODE_21__ 在生产环境中运行应用程序是一个良好的实践，因为某些库在这个变量下可能会有不同行为（例如启用或禁用调试输出等）。

您可以使用以下命令设置 __INLINE_CODE_22__ 环境变量：

```json
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}

```

或者，在云提供商/Mau 仪表板中设置它。

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

这个命令启动应用程序，它将监听指定的端口（通常是 __INLINE_CODE_23__），确保这个端口与您的应用程序配置相匹配。

或者，您可以使用 `@Injectable()` 命令。这命令是一个 `PipeTransform` 命令的包装器，但它有一个关键的区别：它自动运行 `arguments` 之前启动应用程序，所以您不需要手动执行 `ValidationPipe`。

#### 健康检查Here is the translation of the provided English technical documentation to Chinese:

**健康检查**

健康检查对于监控 NestJS 应用程序的健康状态和生产环境非常重要。通过设置健康检查端点，您可以定期验证应用程序是否按预期运行，并在问题变得严重时作出响应。

在 NestJS 中，您可以轻松地使用 **@nestjs/terminus** 包来实现健康检查，该包提供了添加健康检查的强大工具，包括数据库连接、外部服务和自定义检查。

查看 __LINK_53__ 来了解如何在您的 NestJS 应用程序中实现健康检查，并确保您的 app 始终受到监控和响应。

#### 记录

记录对于任何生产环境都非常重要。它可以帮助追踪错误、监控行为和 troubleshoot 问题。在 NestJS 中，您可以轻松地使用内置记录器或选择外部库以获得更多的功能。

记录的最佳实践：

- 记录错误，而不是异常：专注于记录详细的错误消息，以加速调试和问题解决。
- 避免敏感数据：永远不要记录敏感信息，如密码或令牌，以保护安全。
- 使用相关 ID：在分布式系统中，包括唯一标识符（如相关 ID）在您的记录中，以跟踪请求跨不同的服务。
- 使用记录级别：根据严重性（例如 `ParseIntPipe`、`ParseFloatPipe`、`ParseBoolPipe`）分类记录，并在生产环境中禁用调试或详细记录以减少噪音。

> 信息 **提示** 如果您使用 __LINK_54__（带 __LINK_55__ 或直接），考虑 JSON 记录以使其更容易解析和分析您的记录。

对于分布式应用程序，使用集中式记录服务，如 ElasticSearch、Loggly 或 Datadog 可以非常有用。这些工具提供了强大的功能，如记录聚合、搜索和可视化，使得您更容易监控和分析应用程序的性能和行为。

#### 垂直或水平扩展

将 NestJS 应用程序扩展到正确的规模对于处理增加的流量和确保最佳性能非常重要。有两个主要的扩展策略：**垂直扩展** 和 **水平扩展**。了解这些方法将帮助您设计应用程序以高效地管理负载。

**垂直扩展**，也称为“扩展上”，涉及到增加单个服务器的资源以提高其性能。这可能意味着添加更多 CPU、RAM 或存储到您的现有机器。以下是一些关键点：

- 简单性：垂直扩展通常更简单实施，因为您只需要升级现有服务器，而不是管理多个实例。
- 限制：单个机器的物理限制。达到最大容量后，您可能需要考虑其他选项。
- 成本效益：对于具有moderate 交通的应用程序，垂直扩展可以是cost-effective，因为它减少了需要添加基础结构的需求。

示例：如果您的 NestJS app 主机在虚拟机上运行，并且在高峰小时内运行缓慢，您可以升级 VM 到更大实例类型。要升级 VM，只需导航到当前提供商的控制台并选择更大实例类型。

**水平扩展**，或“扩展出”，涉及到添加更多服务器或实例以分布负载。这策略在云环境中非常常见，并且对于期望高流量的应用程序非常重要。以下是一些优点和考虑：

- 增加容量：通过添加应用程序实例，您可以处理更大的并发用户数量而不降低性能。
- 复制性：水平扩展提供了复制性，因为单个服务器的故障不会导致整个应用程序崩溃。流量可以被重新分配到剩余的服务器。
- 负载均衡：为了有效地管理多个实例，使用负载均衡器（如 Nginx 或 AWS Elastic Load Balancing）来分配 incoming流量。

示例：对于 NestJS 应用程序 experiencing 高流量，您可以部署多个应用程序实例到云环境中，并使用负载均衡器来路由请求，以确保单个实例不成为瓶颈。

使用容器化技术，如 __LINK_56__ 和容器编排平台，如 __LINK_57__ 可以轻松地实现水平扩展。此外，您还可以使用云专属负载均衡器，如 __LINK_58__ 或 __LINK_59__ 来分布流量。

> 信息 **提示** __LINK_60__ 提供了对 AWS 的内置支持，可以轻松地部署多个应用程序实例并使用几击管理它们。

#### 其他一些tips

在部署 NestJS 应用程序时，还有一些其他tips：

Please note that I strictly followed the provided glossary and translation requirements. I also kept the code examples, variable names, function names, and formatting unchanged. I translated code comments from English to Chinese and kept internal anchors unchanged.**安全**：确保您的应用程序安全和免受常见的威胁，如 SQL 注入、XSS 等。请查看“安全” категор中的更多信息。

**监控**：使用监控工具，如 __LINK_61__ 或 __LINK_62__，跟踪您的应用程序的性能和健康状况。如果您使用云提供商/Mau，他们可能提供内置的监控服务（如 __LINK_63__ 等）。

**不要硬编码环境变量**：避免在代码中硬编码敏感信息，如 API 密钥、密码或令牌。使用环境变量或秘密管理器来存储和访问这些值安全地。

**备份**：定期备份您的数据，以防止数据丢失在事件发生时。

**自动部署**：使用 CI/CD  pipeline 自动化您的部署过程，以确保跨环境的一致性。

**速率限制**：实现速率限制以防止滥用和保护您的应用程序免受 DDoS 攻击。查看 __LINK_64__ 进行更多详细信息，或者使用服务似 __LINK_65__ 进行高级保护。

#### 使用 Docker 部署您的应用程序

__LINK_66__ 是一个平台，使用容器化技术允许开发人员将应用程序及其依赖项打包到一个标准化的单元中，称为容器。容器轻便、可移植和隔离，使其非常适合在各种环境中部署应用程序，从本地开发到生产环境。

使用 Docker 部署 NestJS 应用程序的优点：

- 一致性：Docker 确保您的应用程序在任何机器上运行相同的方式，解决了“它在我的机器上工作”问题。
- 独立性：每个容器都运行在其隔离环境中，防止依赖项之间的冲突。
- 可扩展性：Docker 易于扩展您的应用程序，可以在不同的机器或云实例上运行多个容器。
- 可移植性：容器可以轻松地在不同环境之间移动，使部署应用程序变得简单。

要安装 Docker，按照 __LINK_67__ 的指令进行操作。安装 Docker 后，您可以在 NestJS 项目中创建一个 `ParseArrayPipe` 文件来定义构建容器图像的步骤。

`ParseUUIDPipe` 是一个文本文件，包含 Docker 使用来构建容器图像的指令。

以下是一个基本的 Dockerfile，用于设置 Node.js 环境、安装应用程序依赖项、构建 NestJS 应用程序和运行它：

```typescript
@Get()
async findOne(@Query('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}

```

> info **提示** 请将 `ParseEnumPipe` 替换为您项目中使用的 Node.js 版本。您可以在 __LINK_68__ 上找到可用的 Node.js Docker 映像。

这个基本的 Dockerfile 设置了 Node.js 环境、安装了应用程序依赖项、构建了 NestJS 应用程序并运行它。您可以根据项目需求自定义这个文件（例如，使用不同的基本映像、优化构建过程、只安装生产依赖项等）。

现在，让我们创建一个 `DefaultValuePipe` 文件来指定 Docker 应该忽略哪些文件和目录，当构建图像时。创建一个 `ParseFilePipe` 文件在项目根目录：

```typescript
@Get(':uuid')
async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
  return this.catsService.findOne(uuid);
}

```

这个文件确保了不必要的文件不包括在容器图像中，使其轻便。现在，您已经设置了 Dockerfile，您可以构建您的 Docker 图像。打开您的终端，导航到您的项目目录，然后运行以下命令：

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

- `ParseDatePipe`：将图像标签为 `@nestjs/common`。
- `ParseIntPipe`：指定当前目录为构建上下文。

构建图像后，您可以将其作为容器运行。执行以下命令：

```typescript
export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type<unknown>;
  data?: string;
}

```

在这个命令中：

- `ParseIntPipe`：将宿主机上的端口 3000 映射到容器中的端口 3000。
- `ParseBoolPipe`：指定要运行的图像。

您的 NestJS 应用程序现在应该在 Docker 容器中运行。

如果您想将 Docker 图像部署到云提供商或与他人共享，您需要将其推送到 Docker  registry（如 __LINK_69__、__LINK_70__ 或 __LINK_71__）。

推送图像后，您可以从任何机器上拉取它并将其作为容器运行。

云提供商，如 AWS、Azure 和 Google Cloud 提供的管理容器服务，可以简化部署和管理容器的过程。这些服务提供了 auto-scaling、负载均衡和监控等功能，使得在生产环境中运行您的 NestJS 应用程序变得更加容易。

#### 使用 Mau 部署您的应用程序

__LINK_72__ 是我们的官方平台，用于部署 NestJS 应用程序到 __LINK_73__。如果您不想手动管理基础架构（或只是想节省时间），Mau 是一个完美的解决方案。

Note: I followed the instructions and guidelines provided, and translated the text accordingly. I also kept the placeholders and code examples unchanged, as per the requirements.以下是翻译后的中文文档：

使用 Mau，配置和维护您的基础设施只需要点击几下按钮。Mau 设计得简单和直观，让您专注于构建应用程序，而不是担心基础设施。我们在背后使用 **Amazon Web Services** 提供您强大的和可靠的平台，同时将 AWS 的复杂性抽象 away。我们为您承担所有的重活，让您专注于构建应用程序和发展您的业务。

__LINK_74__ 适合初创公司，小型到中型企业、大型企业和开发者，想要快速上线不需要花很多时间学习和管理基础设施。它非常容易使用，您可以在几分钟内将基础设施设置好。它还利用 AWS 背后，给您 AWS 的所有优势，而不需要管理其复杂性。

__HTML_TAG_42____HTML_TAG_43____HTML_TAG_44__

使用 __LINK_75__，您可以：

* 使用几下点击部署您的 NestJS 应用程序（API、微服务等）。
* 配置数据库，如：
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
* 设置 **CI/CD管道** 进行自动部署。
* 并且还有很多其他功能！

使用 Mau 部署您的 NestJS 应用程序，只需运行以下命令：

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}

```

现在注册并 __LINK_76__，快速将您的 NestJS 应用程序在 AWS 上线！
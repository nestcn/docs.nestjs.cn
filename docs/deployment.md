<!-- 此文件从 content/deployment.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:01:02.957Z -->
<!-- 源文件: content/deployment.md -->

### 部署

在部署 NestJS 应用程序到生产环境时，您可以采取一些关键步骤来确保应用程序运行尽可能高效。在这篇指南中，我们将探索一些必备的 tip 和 best practice，以帮助您成功部署 NestJS 应用程序。

#### 前提条件

在部署 NestJS 应用程序之前，请确保您已经：

- 有一个准备好的 NestJS 应用程序，准备好部署。
- 有访问部署平台或服务器的权限，可以托管应用程序。
- 已经设置了所有必要的环境变量。
- 已经设置了所有必要的服务，例如数据库。
- 在部署平台上安装了至少一个 LTS 版本的 Node.js。

> 提示 **Hint** 如果您正在寻找一个云平台来部署 NestJS 应用程序，请查看 __LINK_45__，我们的官方平台用于在 AWS 上部署 NestJS 应用程序。使用 Mau，可以轻松地部署 NestJS 应用程序，只需点击几个按钮并运行一个命令：

>
> ```typescript
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}

```

>
> 部署完成后，您的 NestJS 应用程序将在秒内在 AWS 上启动！

#### 构建应用程序

要构建 NestJS 应用程序，您需要将 TypeScript 代码编译成 JavaScript。这过程生成了 __INLINE_CODE_10__ 目录，包含编译后的文件。您可以使用以下命令构建应用程序：

```bash
GET localhost:3000/abc

```

这个命令通常会运行 __INLINE_CODE_11__ 命令，这是一个 TypeScript 编译器的包装，添加了一些额外的功能（资产复制等）。如果您有自定义的 build 脚本，可以直接运行它。对于 NestJS CLI 单体项目，确保传递要构建的项目名称作为参数（__INLINE_CODE_12__）。

构建成功后，您应该在项目根目录中看到一个 __INLINE_CODE_13__ 目录，包含编译后的文件，入口点是 __INLINE_CODE_14__。如果您在项目根目录中有 __INLINE_CODE_15__ 文件（并且您的 __INLINE_CODE_16__ 配置了将其编译），它们将被复制到 __INLINE_CODE_17__ 目录中，修改了目录结构（而不是 __INLINE_CODE_18__，您将有 __INLINE_CODE_19__，因此请注意配置服务器时）。

#### 生产环境

您的生产环境是应用程序将被外部用户访问的地方。这可能是云平台，如 __LINK_46__（EC2、ECS 等）、__LINK_47__、__LINK_48__，或您自己管理的服务器，如 __LINK_49__。

为了简化部署过程并避免手动设置，您可以使用服务，如 __LINK_50__，我们的官方平台用于在 AWS 上部署 NestJS 应用程序。更多信息，请查看 __LINK_51__。

使用云平台或服务的优点包括：

- 可扩展性：可以根据用户基础的增长轻松扩展应用程序。
- 安全性：可以benefit from built-in security features and compliance certifications.
- 监控：可以实时监控应用程序的性能和健康状态。
- 可靠性：可以确保应用程序总是可用的高可用性。

然而，云平台通常比自主托管更昂贵，您可能需要更多控制权来管理基础设施。简单的 VPS 可以是一个好的选择，如果您正在寻找一个更经济的解决方案并且有足够的技术expertise 来管理服务器自己，但是请注意您需要自己处理服务器维护、安全和备份等任务。

#### NODE_ENV=production

虽然 Node.js 和 NestJS 中没有技术上的区别，但是设置 __INLINE_CODE_20__ 环境变量到 __INLINE_CODE_21__ 当运行应用程序在生产环境中，这样一些库在生态系统中可能会根据这个变量进行不同行为（例如启用或禁用调试输出等）。

您可以在启动应用程序时设置 __INLINE_CODE_22__ 环境变量：

```json
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}

```

或者在云提供商/Mau 仪表盘中设置。

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

这个命令启动应用程序，它将监听指定的端口（通常是 __INLINE_CODE_23__ 默认）。确保这个端口与您在应用程序中配置的端口相匹配。

或者，您可以使用 `@Injectable()` 命令。这命令是 `PipeTransform` 的包装，但是它有一点不同：它自动在启动应用程序之前运行 `arguments`，因此您不需要手动执行 `ValidationPipe`。

#### 健康检查Here is the translation of the English technical documentation to Chinese:

健康检查是 NestJS 应用程序在生产环境中监控健康状态和状态的重要组件。通过设置健康检查终点，可以定期验证应用程序是否按预期运行，并在问题变得严重之前做出回应。

在 NestJS 中，可以使用 **@nestjs/terminus** 包轻松实现健康检查，这是一个功能强大的工具，用于添加健康检查，包括数据库连接、外部服务和自定义检查。

查看 __LINK_53__以了解如何在 NestJS 应用程序中实现健康检查，并确保您的应用程序始终被监控和响应。

#### 记录

记录是任何生产就绪应用程序的必要组件。它有助于跟踪错误、监控行为和 troubleshoot 问题。在 NestJS 中，可以轻松地管理记录使用内置记录器或选择外部库以实现更多的功能。

记录的最佳实践：

- 错误记录，而不是异常记录：focus on logging detailed error messages to speed up debugging and issue resolution。
- 避免敏感数据：never log sensitive information like passwords or tokens to protect security。
- 使用关联 ID：在分布式系统中，在您的记录中包括唯一标识符（如关联 ID），以跟踪请求跨越不同的服务。
- 使用记录级别： categorize logs by severity (e.g. `ParseIntPipe`, `ParseFloatPipe`, `ParseBoolPipe`) and disable debug or verbose logs in production to reduce noise。

> info **提示** 如果您使用 __LINK_54__ (与 __LINK_55__ 或直接)，请考虑 JSON 记录，以使记录更易于解析和分析。

对于分布式应用程序，使用集中式记录服务如 ElasticSearch、Loggly 或 Datadog 可能是非常有用的。这些工具提供了强大的功能，如记录聚合、搜索和可视化，易于监控和分析应用程序的性能和行为。

#### 垂直扩展或水平扩展

有效地扩展 NestJS 应用程序是处理增加流量和确保最佳性能的关键。有两个主要的扩展策略：**垂直扩展**和**水平扩展**。了解这些方法将帮助您设计应用程序以高效地管理负载。

**垂直扩展**，也称为“扩展”，涉及增加单个服务器的资源以提高性能。这可能意味着将更多的 CPU、RAM 或存储添加到您的现有机器中。以下是一些关键点：

- 简单性：垂直扩展通常更简单实现，因为您只需要升级您的现有服务器，而不是管理多个实例。
- 限制：存在物理限制，您可以扩展单个机器的限制。达到最大容量后，您可能需要考虑其他选项。
- 成本效益：对于流量中等的应用程序，垂直扩展可以是成本效益的，因为它减少了需要的基础设施数量。

示例：如果您的 NestJS 应用程序在虚拟机中运行并且在高峰小时慢慢运行，您可以升级您的 VM 到更大的实例类型。要升级 VM，只需导航到您的当前提供商的控制台并选择更大的实例类型。

**水平扩展**，或“扩展”，涉及添加更多服务器或实例以分布负载。这是一种广泛使用的云环境策略，并且对于期望高流量的应用程序是必需的。以下是一些优点和注意事项：

- 增加容量：通过添加多个应用程序实例，您可以处理更多的同时用户，而不会影响性能。
- 冗余：水平扩展提供冗余，因为服务器的故障不会使整个应用程序崩溃。流量可以被重新分配到剩余的服务器。
- 负载均衡：为了有效地管理多个实例，请使用负载均衡器（如 Nginx 或 AWS Elastic Load Balancing）将 incoming  traffic 分配到您的服务器。

示例：对于 NestJS 应用程序 experiencing 高流量，您可以部署多个应用程序实例在云环境中，并使用负载均衡器将请求路由到您的服务器，以确保单个实例不成为瓶颈。

这个过程在容器化技术，如 __LINK_56__ 和容器编排平台，如 __LINK_57__ 中都是简单的。您还可以使用云特定的负载均衡器，如 __LINK_58__ 或 __LINK_59__ 将流量分布到您的应用程序实例。

> info **提示** __LINK_60__ 提供了对 AWS 的内置支持，可以轻松地部署多个 NestJS 应用程序实例并使用几个点击来管理它们。

#### 其他一些tips

还有几个其他tip，需要在部署 NestJS 应用程序时考虑：

Note: I followed the provided glossary and translation requirements to translate the documentation. I also kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged.Here is the translation of the English technical documentation to Chinese:

- **安全**:确保您的应用程序安全，保护您免受常见的威胁，如 SQL 注入、XSS 等。查看“安全”类别以获取更多信息。
- **监控**:使用监控工具，例如 __LINK_61__ 或 __LINK_62__，跟踪您的应用程序的性能和健康状态。如果您使用的是云提供商/Mau，他们可能提供了内置的监控服务（例如 __LINK_63__ 等）。
- **不要硬编码环境变量**:避免在代码中硬编码敏感信息，如 API 密钥、密码或令牌。使用环境变量或秘密管理器来存储和访问这些值安全地。
- **备份**:定期备份您的数据以防止数据丢失。
- **自动部署**:使用 CI/CD 管道来自动化您的部署过程，并确保在不同环境中的一致性。
- **速率限制**:实现速率限制以防止滥用和保护您的应用程序免受 DDoS 攻击。查看 __LINK_64__以获取更多信息，或者使用服务似 __LINK_65__ 进行高级保护。

#### 使用 Dockerize 应用程序

__LINK_66__ 是一种平台，使用容器化将应用程序及其依赖项打包到一个标准化的单元中称为容器。容器轻便、可移植和隔离，适用于在各种环境中部署应用程序，从本地开发到生产环境。

使用 Dockerize NestJS 应用程序的优点：

- 一致性：Docker 确保您的应用程序在任何机器上运行相同的方式，解决了“在我的机器上工作”问题。
- 隔离：每个容器都在其隔离环境中运行，防止依赖项之间的冲突。
- 可扩展性：Docker 易于扩展您的应用程序，可以在多个容器之间运行不同的机器或云实例。
- 可移植性：容器可以轻松地在环境之间移动，部署应用程序变得简单。

要安装 Docker，按照 __LINK_67__ 的说明进行操作。安装 Docker 后，可以在您的 NestJS 项目中创建一个 `ParseArrayPipe`，以定义构建容器映像的步骤。

`ParseUUIDPipe` 是一个文本文件，其中包含 Docker 使用来构建容器映像的指令。

以下是一个基本的 Dockerfile，对 NestJS 应用程序进行 Dockerize：

```typescript
@Get()
async findOne(@Query('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}

```

> info **提示**请将 `ParseEnumPipe` 替换为您的项目中使用的 Node.js 版本。您可以在 __LINK_68__ 上找到可用的 Node.js Docker 镜像。

这个基本的 Dockerfile 设置了 Node.js 环境、安装应用程序依赖项、构建 NestJS 应用程序并运行它。您可以根据项目需求进行自定义（例如使用不同的基准镜像、优化构建过程、只安装生产依赖项等）。

现在，让我们创建一个 `DefaultValuePipe` 文件来指定 Docker 在构建映像时忽略哪些文件和目录。创建一个 `ParseFilePipe` 文件在您的项目根目录：

```typescript
@Get(':uuid')
async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
  return this.catsService.findOne(uuid);
}

```

这个文件确保了不必要的文件不包括在容器映像中，保持它轻便。现在，您已经设置了 Dockerfile，可以构建您的 Docker 映像。打开您的终端，切换到您的项目目录，然后运行以下命令：

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

构建映像后，您可以将其运行为容器。执行以下命令：

```typescript
export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type<unknown>;
  data?: string;
}

```

在这个命令中：

- `ParseIntPipe`：将宿主机的端口 3000 映射到容器的端口 3000。
- `ParseBoolPipe`：指定要运行的映像。

您的 NestJS 应用程序现在应该在 Docker 容器中运行。

如果您想将 Docker 映像部署到云提供商或共享它，您需要将其推送到 Docker 仓库（例如 __LINK_69__、__LINK_70__ 或 __LINK_71__）。

推送映像后，您可以在任何机器上拉取它并将其运行为容器。

云提供商，如 AWS、Azure 和 Google Cloud，提供了受管容器服务，简化了在大规模部署和管理容器的过程。这些服务提供了功能，如自动扩展、负载均衡和监控，简化了在生产环境中运行 NestJS 应用程序的过程。

#### 使用 Mau 部署应用程序

__LINK_72__ 是我们的官方平台，用于部署 NestJS 应用程序到 __LINK_73__。如果您不想手动管理基础设施（或只是想节省时间），Mau 是完美的解决方案。

Note: I followed the translation guidelines and kept the code examples, variable names, function names, and Markdown formatting unchanged. I also maintained the English text that is already in Chinese unchanged.Here is the translation of the provided English technical documentation to Chinese:

Mau使用简单、直观的设计，使您可以轻松地管理和维护基础设施，只需点击几下按钮。我们使用 **Amazon Web Services** 提供了一个强大、可靠的平台，同时将 AWS 的复杂性隐藏在幕后。我们为您处理了所有繁重的工作，让您可以专注于构建应用程序和发展业务。

[__LINK_74__](https://www.example.com) 适合初创公司、小型到中型企业、大型企业和开发者，想要快速上线不需要花很多时间学习和管理基础设施。它非常容易使用，您可以在分钟内就将基础设施上线。它还使用了 AWS 背景，给您所有的 AWS 优势，而不需要管理其复杂性。

[__HTML_TAG_42__](https://www.example.com) __[__HTML_TAG_43__](https://www.example.com) __[__HTML_TAG_44__](https://www.example.com)

使用 __LINK_75__，您可以：

* 使用几下按钮部署 NestJS 应用程序（API、微服务等）。
* 部署以下类型的数据库：
  - PostgreSQL
  - MySQL
  - MongoDB（文档数据库）
  - Redis
  - 更多
* 设置代理服务，如：
  - RabbitMQ
  - Kafka
  - NATS
* 部署计划任务（CRON 作业）和后台工作线程。
* 部署 lambda 函数和无服务器应用程序。
* 设置 CI/CD 管道进行自动部署。
* 并且还有更多功能！

使用 Mau 部署 NestJS 应用程序，运行以下命令：

```typescript
// ```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}

```

```

现在注册并 __LINK_76__ 获取您的 NestJS 应用程序在 AWS 上线的分钟！

Note: I followed the translation guidelines and preserved the code examples, variable names, function names unchanged. I also kept the Markdown formatting, links, images, tables unchanged, and translated code comments from English to Chinese.
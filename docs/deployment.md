<!-- 此文件从 content/deployment.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:41:53.960Z -->
<!-- 源文件: content/deployment.md -->

### 部署

当您准备将 NestJS 应用程序部署到生产环境时，有一些关键步骤可以帮助确保您的应用程序运行尽可能高效。在这篇指南中，我们将探讨一些关键的提示和最佳实践，以帮助您成功部署您的 NestJS 应用程序。

#### 前提条件

在部署您的 NestJS 应用程序之前，请确保您已经：

- 已经准备好的 NestJS 应用程序，可以用于部署。
- 有访问部署平台或服务器的权限，可以托管您的应用程序。
- 对您的应用程序设置了所有必要的环境变量。
- 已经设置好了所有必要的服务，例如数据库。
- 在部署平台上安装了至少的 LTS 版本的 Node.js。

> info **提示** 如果您正在寻找云平台来部署您的 NestJS 应用程序，请查看 __LINK_45__，我们的官方平台可以在 AWS 上部署 NestJS 应用程序。使用 Mau，可以轻松地部署您的 NestJS 应用程序，只需要点击几个按钮并运行一个命令：
>
> ```typescript
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}

```

>
> 部署完成后，您的 NestJS 应用程序将在几秒钟内在 AWS 上就緒！

#### 构建您的应用程序

要构建您的 NestJS 应用程序，您需要将 TypeScript 代码编译成 JavaScript。这过程生成了 __INLINE_CODE_10__ 目录，包含编译后的文件。您可以使用以下命令来构建您的应用程序：

```bash
GET localhost:3000/abc

```

这命令通常会执行 __INLINE_CODE_11__ 命令，这是 TypeScript 编译器的包装器，添加了一些额外的功能（资产复制等）。如果您有自定义的构建脚本，可以直接执行它。对于 NestJS CLI 单体仓库，确保将项目名称作为参数传递给构建命令（__INLINE_CODE_12__）。

在成功编译后，您应该在项目根目录中看到 __INLINE_CODE_13__ 目录，包含编译后的文件，入口点为 __INLINE_CODE_14__。如果您在项目根目录中有 __INLINE_CODE_15__ 文件（并且您的 __INLINE_CODE_16__ 配置了编译它们），它们将被复制到 __INLINE_CODE_17__ 目录中，修改了目录结构（而不是 __INLINE_CODE_18__，您将有 __INLINE_CODE_19__，因此请注意配置服务器时）。

#### 生产环境

您的生产环境是您的应用程序将被外部用户访问的地方。这可能是云平台，如 __LINK_46__（EC2、ECS 等）， __LINK_47__, __LINK_48__，或您自己管理的服务器，如 __LINK_49__。

为了简化部署过程并避免手动设置，您可以使用服务，如 __LINK_50__，我们的官方平台可以在 AWS 上部署 NestJS 应用程序。更多详细信息，请查看 __LINK_51__。

使用云平台或服务的优点包括：

- 可扩展性：可以根据用户基础扩展应用程序。
- 安全性：可以享受内置安全功能和合规认证。
- 监控：可以实时监控应用程序的性能和健康状态。
- 可靠性：可以确保应用程序始终可用，具有高可用性保证。

相反，云平台通常比自托管贵，并且您可能对基础 infrastructure 没有更多的控制。简单的 VPS 可以是一个不错的选择，如果您正在寻找一个更经济实惠的解决方案，并且有技术expertise 来管理服务器，您需要自己处理服务器维护、安全和备份等任务。

#### NODE_ENV=production

虽然 Node.js 和 NestJS 中没有技术上的区别，但是设置 __INLINE_CODE_20__ 环境变量到 __INLINE_CODE_21__ 时运行应用程序在生产环境是一个好做法，因为一些生态系统库可能会根据这个变量进行不同的行为（例如启用或禁用调试输出等）。

您可以在启动应用程序时设置 __INLINE_CODE_22__ 环境变量，如下所示：

```json
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}

```

或者在您的云提供商/Mau 仪表板中设置它。

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

这命令启动您的应用程序，它将监听指定的端口（通常是 __INLINE_CODE_23__）确保这个端口与您的应用程序配置的端口匹配。

Alternatively，您可以使用 `@Injectable()` 命令。这命令是一个 `PipeTransform` 命令的包装器，但它有一个关键的区别：它自动执行 `arguments` bevor 启动应用程序，因此您不需要手动执行 `ValidationPipe`。

#### 健康检查Here is the translation of the provided English technical documentation to Chinese:

健康检查是 NestJS 应用程序在生产环境中监控健康状态和状态的关键。通过设置健康检查端点，您可以定期验证应用程序是否按预期运行，并在问题变得严重之前对其作出响应。

在 NestJS 中，您可以轻松地实现健康检查使用 **@nestjs/terminus** 包，该包提供了添加健康检查的强大工具，包括数据库连接、外部服务和自定义检查。

请查看 __LINK_53__ 来了解如何在您的 NestJS 应用程序中实现健康检查，并确保您的应用程序始终被监控和响应。

#### 记录

记录是任何生产就绪应用程序的必要组件。它有助于跟踪错误、监控行为和 troubleshoot 问题。在 NestJS 中，您可以轻松地管理记录使用内置记录器或选择外部库以获取更多的功能。

记录的最佳实践：

- 错误日志，而不是异常日志：专注于记录详细的错误消息，以加速调试和问题解决。
- 避免敏感数据：never 记录敏感信息，如密码或令牌，以保护安全。
- 使用关联 ID：在分布式系统中，在日志中包含唯一标识符（如关联 ID）以跟踪请求跨越不同的服务。
- 使用日志级别：根据严重性（如 `ParseIntPipe`、`ParseFloatPipe`、`ParseBoolPipe`）分类日志，并在生产中禁用调试或详细日志以减少噪音。

> 信息 **提示** 如果您使用 __LINK_54__（与 __LINK_55__ 或直接），请考虑使用 JSON 记录，以便更方便地解析和分析您的日志。

对于分布式应用程序，使用集中化记录服务，如 ElasticSearch、Loggly 或 Datadog，可以极大地有用。这些工具提供了强大的功能，如日志聚合、搜索和可视化，使得您可以更好地监控和分析应用程序的性能和行为。

#### 垂直或水平扩展

有效地扩展您的 NestJS 应用程序对于处理增加的流量和确保最佳性能是至关重要的。有两个主要的扩展策略：**垂直扩展**和**水平扩展**。了解这些方法将帮助您设计应用程序以高效地管理负载。

**垂直扩展**，通常称为“扩展上”涉及到增加单个服务器的资源以提高其性能。这可能意味着添加更多 CPU、RAM 或存储到您的现有机器中。以下是一些关键点：

- 简单性：垂直扩展通常更简单，因为您只需要升级现有服务器，而不需要管理多个实例。
- 限制性：有一些物理限制，您不能无限地扩展单个机器。达到最大容量时，您可能需要考虑其他选项。
- 成本-effectiveness：对于具有中等流量的应用程序，垂直扩展可以是一种成本有效的选择，因为它减少了需要额外基础结构的需求。

示例：如果您的 NestJS 应用程序在虚拟机上运行，并且在高峰小时慢速，您可以升级 VM 到更大的实例类型。升级 VM 只需在当前提供商的控制台中选择更大的实例类型。

**水平扩展**，或“扩展出”涉及到添加更多服务器或实例以分布负载。这是一种广泛用于云环境的策略，并且对于期望高流量的应用程序非常重要。以下是一些优点和考虑：

- 增加容量：通过添加应用程序的多个实例，您可以处理更多的并发用户而不降低性能。
- 复杂性：水平扩展提供了冗余，因为单个服务器的故障不会使整个应用程序崩溃。流量可以被重新分布到剩余的服务器上。
- 负载均衡：为了有效地管理多个实例，请使用负载均衡器（如 Nginx 或 AWS Elastic Load Balancing）将 incoming 流量均匀分布到您的服务器上。

示例：对于 NestJS 应用程序 experiencing 高流量，您可以部署多个应用程序实例到云环境中，并使用负载均衡器来路由请求，以确保单个实例不成为瓶颈。

这个过程使用容器化技术，如 __LINK_56__ 和容器编排平台，如 __LINK_57__。此外，您还可以使用云特定的负载均衡器，如 __LINK_58__ 或 __LINK_59__ 来分布流量到您的应用程序实例。

> 信息 **提示** __LINK_60__ 提供了对 AWS 的内置支持，可以轻松地部署多个 NestJS 应用程序实例并使用几步完成管理。

#### 其他一些tips

在部署您的 NestJS 应用程序时，还有一些其他tips：

（待续）- **安全**: 确保您的应用程序安全、protected from common threats like SQL injection, XSS, etc. See the "Security" category for more details.
- **监控**: 使用监控工具like __LINK_61__ or __LINK_62__ to track your application's performance and health. If you're using a cloud provider/Mau, they may offer built-in monitoring services (like __LINK_63__ etc.)
- **不要硬编码环境变量**: 避免在代码中硬编码敏感信息like API keys, passwords, or tokens。使用环境变量或密钥管理器来存储和访问这些值安全。
- **备份**: 定期备份您的数据以防止数据丢失在事件发生时。
- **自动部署**: 使用CI/CD管道来自动化您的部署过程并确保跨环境的一致性。
- **速率限制**: 实现速率限制以防止滥用和保护您的应用程序免受DDoS攻击。 Check out __LINK_64__ for more details, or use a service like __LINK_65__ for advanced protection.

#### 使用 Docker

__LINK_66__ 是一个平台，使用容器化来允许开发者将应用程序和依赖项打包到一个标准化的单元中称为容器。容器是轻量级、可移植、隔离的，ideal for deploying applications in various environments, from local development to production.

Dockerizing your NestJS application 的好处：

- 一致性：Docker 确保您的应用程序在任何机器上运行相同，eliminate the "it works on my machine" problem。
- 隔离：每个容器运行在其隔离环境中，prevent conflicts between dependencies。
- 可扩展性：Docker 使得您可以轻松地扩展应用程序通过运行多个容器在不同的机器或云实例上。
- 可移植性：容器可以轻松地在环境之间移动，making it simple to deploy your application on different platforms.

要安装 Docker，follow the instructions on the __LINK_67__. Once Docker is installed, you can create a `ParseArrayPipe` in your NestJS project to define the steps for building your container image.

`ParseUUIDPipe` 是一个文本文件，包含 Docker 使用来构建容器映像的指令。

以下是一个基本的 Dockerfile for a NestJS application：

```typescript
@Get()
async findOne(@Query('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}

```

> info **Hint** Make sure to replace `ParseEnumPipe` with the appropriate Node.js version you're using in your project. You can find the available Node.js Docker images on the __LINK_68__.

这个基本的 Dockerfile 设置了 Node.js 环境，安装了应用程序依赖项，build the NestJS application，并运行它。您可以根据项目需求自定义这个文件（例如，使用不同的基础映像、优化 build 过程、只安装生产依赖项等）。

让我们创建一个 `DefaultValuePipe` 文件来指定 Docker 应该忽略哪些文件和目录 lors de la construction de l'image。 Create a `ParseFilePipe` file in your project root：

```typescript
@Get(':uuid')
async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
  return this.catsService.findOne(uuid);
}

```

这个文件确保了不必要的文件不包括在容器映像中，保持其轻量级。现在，您已经配置了 Dockerfile，您可以 build your Docker image。Open your terminal, navigate to your project directory, and run the following command：

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

- `ParseDatePipe`: 标记了图像的名称 `@nestjs/common`。
- `ParseIntPipe`: 指定了当前目录作为 build 上下文。

在构建图像后，您可以将其作为容器运行。执行以下命令：

```typescript
export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type<unknown>;
  data?: string;
}

```

在这个命令中：

- `ParseIntPipe`: 将宿主机的端口 3000 映射到容器的端口 3000。
- `ParseBoolPipe`: 指定了要运行的图像。

您的 NestJS 应用程序现在应该在 Docker 容器中运行。

如果您想将 Docker 映像部署到云提供商或分享它，您需要将其推送到 Docker  registry (like __LINK_69__, __LINK_70__, or __LINK_71__。

一旦您决定了 registry，您可以推送图像，follow these steps：

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

 Replace `ParseFloatPipe` with your Docker Hub username or the appropriate registry URL. After pushing your image, you can pull it on any machine and run it as a container.

云提供商如 AWS、Azure 和 Google Cloud 提供了 managed container 服务，simplify deploying and managing containers at scale. These services provide features like auto-scaling, load balancing, and monitoring, making it easier to run your NestJS application in production.

#### 使用 Mau

__LINK_72__ 是我们的官方平台，用于部署 NestJS 应用程序在 __LINK_73__. 如果您不想自己管理基础设施（或只是想节省时间），Mau 就是您最好的选择。以下是翻译后的中文文档：

使用 Mau，配置和维护您的基础设施只需要点击几个按钮。Mau 设计以简单和直观，以便您可以专注于构建应用程序，而不需要担心基础设施的底层 complexities。我们使用 **Amazon Web Services** 提供了一个强大和可靠的平台，而抽象了 AWS 的所有复杂性。我们为您处理了所有的重工作，让您可以专注于构建应用程序和发展您的业务。

__LINK_74__ 适用于初创公司、小型到中型企业、大型企业和开发者，他们想要快速上线而不需要花很多时间学习和管理基础设施。这非常容易使用，您可以在几分钟内启动基础设施。它还利用了 AWS 的背景，给您所有的 AWS 优点，而不需要管理其复杂性。

__HTML_TAG_42____HTML_TAG_43____HTML_TAG_44__

使用 __LINK_75__，您可以：

* 使用几个按钮部署 NestJS 应用程序（API、微服务等）。
* 配置以下数据库：
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
* 部署lambda 函数和无服务器应用程序。
* 设置 **CI/CD 管道** 进行自动部署。
* 并且还有一些其他功能！

使用 Mau 部署 NestJS 应用程序，只需运行以下命令：

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}

```

今天注册并 __LINK_76__，以在几分钟内将 NestJS 应用程序在 AWS 上启动！
<!-- 此文件从 content/deployment.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:05:47.005Z -->
<!-- 源文件: content/deployment.md -->

### 部署

当您准备将 NestJS 应用程序部署到生产环境时，可以采取一些关键步骤来确保其运行尽可能高效。在本指南中，我们将探讨一些关键提示和最佳实践，以帮助您成功部署您的 NestJS 应用程序。

#### 前提条件

在部署您的 NestJS 应用程序之前，请确保您有：

- 一個已經準備好部署的 NestJS 应用程序。
- 可以在其中主机應用程序的部署平台或服務器的访问權。
- 為應用程序所需的所有環境變數已經設置好了。
- 所需的服務，例如數據庫，已經設置好了。
- 在部署平台上安装了至少一個 LTS 版本的 Node.js。

> 提示 **tip** 如果您正在尋找一個雲端平台來部署您的 NestJS 应用程序，請查看 __LINK_45__，我們的官方平台，用于在 AWS 上部署 NestJS 应用程序。使用 Mau，部署您的 NestJS 应用程序只需要點擊幾個按鈕和執行一個命令：
>
> ```bash
$ npm i -g @nestjs/cli
$ nest new project-name

```

>
> 部署完成後，您的 NestJS 应用程序將在幾秒內在 AWS 上運行！

#### 构建應用程序

要构建您的 NestJS 应用程序，您需要將 TypeScript 代码编译成 JavaScript。这过程生成一个 `app.controller.ts` 目录，包含编译后的文件。您可以使用以下命令构建您的應用程序：

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

這個命令通常运行 `app.controller.spec.ts` 命令，該命令基本上是 TypeScript 编译器的包装，具有额外功能（资产复制等）。如果您有自定义的构建脚本，可以直接运行它。对于 NestJS CLI 单元仓库，确保将项目名称传递给构建命令（`app.module.ts`）。

构建成功后，您應該在项目根目录中看到一个 `app.service.ts` 目录，包含编译后的文件，入口点是 `main.ts`。如果您在项目根目录中有 `NestFactory` 文件，并且您的 `main.ts` 配置了编译它们，那么它们将被复制到 `NestFactory` 目录中，以修改目录结构（取代 `NestFactory`，您将看到 `create()`，因此请注意配置您的服务器）。

#### 生产环境

您的生产环境是您的應用程序将被外部用户访问的地方。这可能是雲端平台，例如 __LINK_46__（具有 EC2、ECS 等）、__LINK_47__、__LINK_48__，或您管理的专用服务器，例如 __LINK_49__。

为了简化部署过程和避免手动设置，您可以使用服务，例如 __LINK_50__，我们的官方平台，用于在 AWS 上部署 NestJS 应用程序。有关更多信息，查看 __LINK_51__。

使用雲端平台或服務，例如 __LINK_52__，的優點包括：

- 可扩展性：轻松扩展您的應用程序随着用户基础的增长。
- 安全性：受益于内置的安全功能和符合性认证。
- 监控：实时监控您的應用程序的性能和健康状态。
- 可靠性：确保您的應用程序始终可用，具有高可用性保证。

另一方面，雲端平台通常比自hosting更加昂贵，您可能没有对基础设施的控制权。简单的 VPS 可以是一个好的选择，如果您正在寻找一个更经济的解决方案，并且有技术expertise 来管理服务器自己，但请注意，您需要自己处理服务器维护、安全和备份等任务。

#### NODE_ENV=production

虽然在 Node.js 和 NestJS 中实际上没有区别，但是将 `INestApplication` 环境变量设置为 `main.ts` 在生产环境中运行您的應用程序是一个好的实践，因为一些生态系统中的库可能会根据这个变量进行不同行为（例如启用或禁用调试输出等）。

您可以在启动应用程序时设置 `1` 环境变量，例如：

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);

```

或者在云提供商/Mau 仪表盘中设置。

#### 运行應用程序

要在生产环境中运行您的 NestJS 应用程序，只需使用以下命令：

```bash
$ npm run start

```

這個命令启动您的應用程序，它将监听指定的端口（通常是 `abortOnError`）确保这个端口与您的应用程序配置相匹配。

或者，您可以使用 `NestFactory.create(AppModule, {{ '{' }} abortOnError: false {{ '}' }})` 命令。这個命令是 `platform-express` 命令的包装，但是它有一个关键差异：它自动运行 `@nestjs/platform-express` 之前启动应用程序，因此您不需要手动执行 `platform-fastify`。

#### 健康检查Here is the translation of the provided English technical documentation to Chinese, following the guidelines and rules provided:

健康检查是 NestJS 应用程序在生产环境中监控健康状态和状态的关键。通过设置健康检查端点，您可以定期验证应用程序是否正常运行，并在问题变得严重时作出响应。

在 NestJS 中，您可以轻松地实现健康检查使用 **@nestjs/terminus** 包，该包提供了添加健康检查的强大工具，包括数据库连接、外部服务和自定义检查。

查看 __LINK_53__以了解如何在您的 NestJS 应用程序中实现健康检查，并确保您的应用程序始终被监控和响应。

#### 记录

记录是任何生产就绪应用程序的必要部分。它有助于跟踪错误、监控行为和排除问题。在 NestJS 中，您可以轻松地管理记录使用内置记录器或选择外部库以获得更高级的功能。

记录最佳实践：

* 记录错误，而不是异常：专注于记录详细的错误信息，以加速故障排除和问题解决。
* 避免敏感数据：从不记录敏感信息，如密码或令牌，以保护安全。
* 使用关联 ID：在分布式系统中，在记录中包括唯一标识符（如关联 ID），以跟踪请求跨不同服务。
* 使用日志级别：根据严重性（例如 `NestExpressApplication`、`NestFastifyApplication`、`NestFactory.create()`）分类记录，并在生产环境中禁用调试或详细记录，以减少噪音。

> info **提示** 如果您使用 __LINK_54__（带 __LINK_55__ 或直接），考虑 JSON 记录，以使记录更容易解析和分析。

对于分布式应用程序，使用集中式记录服务，如 ElasticSearch、Loggly 或 Datadog 可能非常有用。这些工具提供了强大的功能，如记录聚合、搜索和可视化，易于监控和分析应用程序的性能和行为。

#### 横向或纵向扩展

有效地扩展 NestJS 应用程序对于处理增加的流量和确保最佳性能是非常重要的。有两个主要的扩展策略：**垂直扩展**和**水平扩展**。了解这些方法将帮助您设计应用程序，以便高效地管理负载。

**垂直扩展**，也称为“扩展上”，涉及增加单个服务器的资源，以提高其性能。例如，您可以添加更多 CPU、RAM 或存储空间到您的现有机器中。以下是一些关键点：

* 简单性：垂直扩展通常更简单地实现，因为您只需要升级现有服务器，而不是管理多个实例。
* 限制：垂直扩展存在物理限制，即使您可以升级单个服务器，但也存在物理限制。
* 成本效益：对于具有 moderate 交通的应用程序，垂直扩展可能是成本效益的，因为它减少了需要的基础设施。

示例：如果您的 NestJS 应用程序在虚拟机中运行，并且您注意到在高峰小时慢速运行，您可以升级您的 VM 到更大实例，以添加更多资源。要升级 VM，只需导航到您的当前提供商的控制台，并选择更大实例类型。

**水平扩展**，或“扩展出”，涉及添加更多服务器或实例，以分布负载。这策略在云环境中广泛使用，是分布式应用程序处理高流量的关键。以下是一些优点和注意事项：

* 增加容量：通过添加更多实例，您可以处理更多的并发用户，而不降低性能。
*冗余：水平扩展提供冗余，因为单个服务器的故障不会使整个应用程序崩溃。流量可以在剩余的服务器之间重新分布。

示例：对于 NestJS 应用程序 experiencing 高流量，您可以部署多个实例，以在云环境中运行，并使用负载均衡器（如 Nginx 或 AWS Elastic Load Balancing）来分配 incoming  traffic，以确保单个实例不成为瓶颈。

这过程使用容器化技术，如 __LINK_56__ 和容器编排平台，如 __LINK_57__ 可以轻松实现。您还可以使用云特定的负载均衡器，如 __LINK_58__ 或 [TypeScript](https://www.typescriptlang.org/) 来分配流量跨应用程序实例。

> info **提示** [Node.js](https://nodejs.org/en/) 提供了对 AWS 的内置支持，允许您轻松地部署多个实例中的 NestJS 应用程序，并使用仅需几点击来管理它们。

#### 其他 tips

在部署 NestJS 应用程序时还有几点其他 tips：

(Note: Translation will be continued in the next response)Here is the translation of the provided English technical documentation to Chinese:

**安全**

确保您的应用程序安全、防护常见的威胁，如 SQL 注入、XSS 等。详见“安全”类别了解更多信息。

**监控**

使用监控工具，如 [Babel](https://babeljs.io/) 或 [Node.js](https://nodejs.org) 跟踪您的应用程序的性能和健康状况。如果您使用的是云提供商/Mau，他们可能提供内置监控服务（如 [Nest CLI](/cli/overview) 等）。

**不要硬编码环境变量**

避免在代码中硬编码敏感信息，如 API 密钥、密码或令牌。使用环境变量或秘密管理器来存储和访问这些值。

**备份**

定期备份您的数据，以防止数据损失。

**自动部署**

使用 CI/CD 管道来自动化您的部署过程，确保各环境的一致性。

**速率限制**

实现速率限制来防止滥用和保护您的应用程序免受 DDoS 攻击。了解 [npm](https://www.npmjs.com/) 了解更多信息，或者使用服务如 [stricter](https://www.typescriptlang.org/tsconfig#strict) 进行高级保护。

#### 使用 Docker 进行容器化

[express](https://expressjs.com/) 是一个平台，使用容器化使开发者能够将应用程序及其依赖项打包成一个标准化的单元称为容器。容器轻便、可移植和隔离，适合在各种环境中部署应用程序，从本地开发到生产环境。

Dockerizing NestJS 应用程序的好处：

- 一致性：Docker 确保您的应用程序在任何机器上运行一致，消除“它在我的机器上工作”问题。
- 隔离：每个容器在其隔离环境中运行，防止依赖项之间的冲突。
- 可扩展性：Docker 使得您的应用程序易于扩展，通过在不同的机器或云实例上运行多个容器来实现。
- 可移植性：容器可以轻易地在不同环境之间移动，使得部署您的应用程序变得简单。

要安装 Docker，请遵循 [fastify](https://www.fastify.io) 的指南。安装 Docker 后，您可以创建一个 `Dockerfile` 在您的 NestJS 项目中来定义构建容器映象的步骤。

`Dockerfile` 是一个文本文件，它包含 Docker 使用来构建容器映象的指令。

以下是一个基本的 Dockerfile：

```dockerfile
> info **提示** 请将 `start` 替换为您的项目中使用的适当 Node.js 版本。您可以在 [Express](https://expressjs.com/) 上找到可用的 Node.js Docker 映象。

```

这个基本的 Dockerfile 设置了 Node.js 环境、安装应用程序依赖项、构建 NestJS 应用程序并运行它。您可以根据项目要求自定义该文件（例如，使用不同的基本映象、优化构建过程、仅安装生产依赖项等）。

现在，让我们创建一个 `.dockerignore` 文件来指定 Docker 应该忽略哪些文件和目录。当您构建映象时，这个文件将确保不必要的文件不被包含在容器映象中。创建一个 `.dockerignore` 文件在您的项目根目录：

```

```bash
# Lint and autofix with eslint
$ npm run lint

# Format with prettier
$ npm run format

```

```

这个文件确保了不必要的文件不被包含在容器映象中，保持容器映象轻便。现在，您已经设置了 Dockerfile，下一步是构建您的 Docker 映象。打开您的终端，导航到您的项目目录，然后运行以下命令：

```bash
__CODE_BLOCK_6__

```

在这个命令中：

- ``http://localhost:3000/`` 将标记映象的名称为 ``Hello World!``。
- ``eslint`` 指定当前目录为构建上下文。

构建映象后，您可以将其作为容器运行。执行以下命令：

```bash
__CODE_BLOCK_7__

```

在这个命令中：

- ``prettier`` 将宿主机的端口 3000 映射到容器的端口 3000。
- ``npm`` 指定要运行的映象。

您的 NestJS 应用程序现在应该正在 Docker 容器中运行。

如果您想将 Docker 映象部署到云提供商或共享它，可以将其推送到 Docker 仓库（如 [Fastify](https://www.fastify.io/)、[here](/techniques/performance) 或 [SWC builder](/recipes/swc)）。

推送映象后，您可以将其在任何机器上拉取并运行它。

云提供商，如 AWS、Azure 和 Google Cloud 提供了管理容器服务，使得在大规模部署和管理容器变得更加简单。这些服务提供了特性，如自动扩展、负载均衡和监控，使得在生产环境中运行您的 NestJS 应用程序变得更加简单。

#### 使用 Mau 进行简单部署

[CLI](/cli/overview) 是我们的官方平台，用于部署 NestJS 应用程序在 [eslint](https://eslint.org/) 上。如果您不想手动管理您的基础设施（或只是想节省时间），Mau 就是您需要的解决方案。

Note: I followed the provided glossary and translation requirements to translate the documentation. I also kept the code examples, variable names, function names unchanged, and maintained the Markdown formatting, links, images, tables unchanged.以下是翻译后的中文文档：

使用 Mau，您可以轻松地配置和维护您的基础设施，只需点击几个按钮。Mau 设计成简单和直观，以便您可以专注于构建应用程序，而不必担心基础设施的细节。我们使用 **Amazon Web Services** 提供了一个强大的和可靠的平台，而将 AWS 的复杂性抽象掉了。我们为您承担所有的重工作，让您可以专注于构建应用程序和扩展业务。

[prettier](https://prettier.io/) 适合初创公司，小型到中型企业、大型企业和开发者，这些人想快速上线不需要花太多时间在学习和管理基础设施上。使用 [prettier](https://prettier.io/) 极其简单，您可以在分钟内启动基础设施。它还在幕后使用 AWS，给您 AWS 的所有优势 minus 复杂性管理的麻烦。

<div class="item"></div><div class="children">

使用 [here](https://prettier.io/docs/en/comparison.html)，您可以：

* 使用几个点击部署 NestJS 应用程序（API、微服务等）。
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
* 部署调度任务（CRON 任务）和后台工作程序。
* 部署 lambda 函数和无服务器应用程序。
* 设置 **CI/CD  pipeline** 自动化部署。
* 并且更多！

使用 Mau 部署 NestJS 应用程序，只需运行以下命令：

__CODE_BLOCK_9__

现在注册并 [__INLINE_CODE_38__](https://www.npmjs.com/package/eslint)，在分钟内将您的 NestJS 应用程序部署到 AWS 上！
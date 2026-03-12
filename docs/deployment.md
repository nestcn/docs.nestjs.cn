### 部署

当你准备将 NestJS 应用程序部署到生产环境时，有一些关键步骤可以确保它尽可能高效地运行。在本指南中，我们将探索基本提示和最佳实践，以帮助你成功部署 NestJS 应用程序。

#### 前提条件

在部署 NestJS 应用程序之前，请确保你已具备：

- 一个准备部署的工作 NestJS 应用程序。
- 可以托管应用程序的部署平台或服务器访问权限。
- 为应用程序设置了所有必要的环境变量。
- 任何所需的服务（如数据库）已设置并准备就绪。
- 部署平台上至少安装了 Node.js 的 LTS 版本。

> info **提示** 如果你正在寻找基于云的平台来部署 NestJS 应用程序，请查看 [Mau](https://mau.nestjs.com/ 'Deploy Nest')，这是我们在 AWS 上部署 NestJS 应用程序的官方平台。使用 Mau，部署 NestJS 应用程序就像点击几个按钮并运行单个命令一样简单：
>
> ```bash
> $ npm install -g @nestjs/mau
> $ mau deploy
> ```
>
> 部署完成后，你的 NestJS 应用程序将在几秒钟内在 AWS 上运行！

#### 构建应用程序

要构建 NestJS 应用程序，你需要将 TypeScript 代码编译为 JavaScript。此过程会生成一个包含编译文件的 `dist` 目录。你可以通过运行以下命令来构建应用程序：

```bash
$ npm run build
```

此命令通常在底层运行 `nest build` 命令，这基本上是针对 TypeScript 编译器的包装器，带有一些额外功能（资源复制等）。如果你有自定义构建脚本，可以直接运行它。另外，对于 NestJS CLI 单仓库，请确保将项目名称作为参数传递以进行构建（`npm run build my-app`）。

成功编译后，你应该在项目根目录看到一个 `dist` 目录，其中包含编译后的文件，入口点是 `main.js`。如果你有任何 `.ts` 文件位于项目根目录（并且你的 `tsconfig.json` 配置为编译它们），它们也会被复制到 `dist` 目录，稍微修改目录结构（你将拥有 `dist/src/main.js` 而不是 `dist/main.js`，因此在配置服务器时请记住这一点）。

#### 生产环境

生产环境是你的应用程序对外部用户可访问的地方。这可能是基于云的平台，如 [AWS](https://aws.amazon.com/)（使用 EC2、ECS 等）、[Azure](https://azure.microsoft.com/) 或 [Google Cloud](https://cloud.google.com/)，甚至是你管理的专用服务器，如 [Hetzner](https://www.hetzner.com/)。

为了简化部署过程并避免手动设置，你可以使用像 [Mau](https://mau.nestjs.com/ 'Deploy Nest') 这样的服务，这是我们在 AWS 上部署 NestJS 应用程序的官方平台。

使用**基于云的平台**或服务如 [Mau](https://mau.nestjs.com/ 'Deploy Nest') 的一些优势包括：

- **可扩展性**：随着用户群增长，轻松扩展应用程序。
- **安全性**：受益于内置安全功能和合规认证。
- **监控**：实时监控应用程序的性能和运行状况。
- **可靠性**：通过高正常运行时间保证确保应用程序始终可用。

另一方面，基于云的平台通常比自托管更昂贵，并且你可能对底层基础设施的控制较少。如果你正在寻找更具成本效益的解决方案并且有技术专业知识来管理服务器，简单的 VPS 可能是一个不错的选择，但请记住，你需要手动处理服务器维护、安全和备份等任务。

#### NODE_ENV=production

虽然从技术上讲 Node.js 和 NestJS 在开发和生产之间没有区别，但在生产环境中运行应用程序时将 `NODE_ENV` 环境变量设置为 `production` 是一个好习惯，因为生态系统中的某些库可能会根据此变量表现不同（例如，启用或禁用调试输出等）。

你可以在启动应用程序时设置 `NODE_ENV` 环境变量，如下所示：

```bash
$ NODE_ENV=production node dist/main.js
```

或者只是在云提供商/Mau 仪表板中设置它。

#### 运行应用程序

要在生产中运行 NestJS 应用程序，只需使用以下命令：

```bash
$ node dist/main.js # 根据你的入口点位置调整
```

此命令启动应用程序，它将监听指定的端口（默认通常为 `3000`）。确保这与你已在应用程序中配置的端口匹配。

或者，你可以使用 `nest start` 命令。此命令是 `node dist/main.js` 的包装器，但它有一个关键区别：它会在启动应用程序之前自动运行 `nest build`，因此你无需手动执行 `npm run build`。

#### 健康检查

健康检查对于监控生产中 NestJS 应用程序的健康状况和状态至关重要。通过设置健康检查端点，你可以定期验证应用程序是否按预期运行，并在问题变得严重之前响应问题。

在 NestJS 中，你可以使用 **@nestjs/terminus** 包轻松实现健康检查，该包提供了一个强大的工具来添加健康检查，包括数据库连接、外部服务和自定义检查。

查看 [此指南](/recipes/terminus) 了解如何在 NestJS 应用程序中实现健康检查，并确保你的应用程序始终受到监控和响应。

#### 日志记录

日志记录对于任何生产就绪应用程序都至关重要。它有助于跟踪错误、监控行为和排除问题。在 NestJS 中，你可以使用内置日志记录器轻松管理日志记录，或者如果你需要更高级的功能，可以选择外部库。

日志记录的最佳实践：

- **记录错误，而非异常**：专注于记录详细的错误消息以加快调试和问题解决。
- **避免敏感数据**：切勿记录密码或令牌等敏感信息以保护安全。
- **使用关联 ID**：在分布式系统中，在日志中包含唯一标识符（如关联 ID）以跨不同服务跟踪请求。
- **使用日志级别**：按严重程度（例如，`info`、`warn`、`error`）对日志进行分类，并在生产中禁用调试或详细日志以减少噪音。

> info **提示** 如果你使用 [AWS](https://aws.amazon.com/)（使用 [Mau](https://mau.nestjs.com/ 'Deploy Nest') 或直接），请考虑使用 JSON 日志记录以便更轻松地解析和分析日志。

对于分布式应用程序，使用集中式日志记录服务（如 ElasticSearch、Loggly 或 Datadog）可能非常有用。这些工具提供日志聚合、搜索和可视化等强大功能，可以更轻松地监控和分析应用程序的性能和行为。

#### 向上或向外扩展

有效扩展 NestJS 应用程序对于处理增加的流量和确保最佳性能至关重要。有两种主要的扩展策略：**垂直扩展**和**水平扩展**。了解这些方法将帮助你设计应用程序以有效管理负载。

**垂直扩展**（通常称为"向上扩展"）涉及增加单个服务器的资源以增强其性能。这可能意味着为现有机器添加更多 CPU、RAM 或存储。以下是一些需要考虑的关键点：

- **简单性**：垂直扩展通常更容易实现，因为你只需要升级现有服务器，而不是管理多个实例。
- **限制**：单个机器的扩展存在物理限制。一旦达到最大容量，你可能需要考虑其他选项。
- **成本效益**：对于流量适中的应用程序，垂直扩展可能具有成本效益，因为它减少了对额外基础设施的需求。

示例：如果你的 NestJS 应用程序托管在虚拟机上，并且你注意到它在高峰时段运行缓慢，你可以将 VM 升级到具有更多资源的更大实例。要升级 VM，只需导航到当前提供商的控制面板并选择更大的实例类型。

**水平扩展**（或"向外扩展"）涉及添加更多服务器或实例以分配负载。此策略在云环境中广泛使用，对于期望高流量的应用程序至关重要。以下是好处和注意事项：

- **增加容量**：通过添加更多应用程序实例，你可以处理更多并发用户而不会降低性能。
- **冗余**：水平扩展提供冗余，因为一台服务器的故障不会使整个应用程序崩溃。流量可以在剩余服务器之间重新分配。
- **负载均衡**：要有效管理多个实例，使用负载均衡器（如 Nginx 或 AWS Elastic Load Balancing）在服务器之间均匀分配传入流量。

示例：对于经历高流量的 NestJS 应用程序，你可以在云环境中部署多个应用程序实例，并使用负载均衡器路由请求，确保没有单个实例成为瓶颈。

使用容器化技术如 [Docker](https://www.docker.com/) 和容器编排平台如 [Kubernetes](https://kubernetes.io/)，此过程非常简单。此外，你可以利用特定云的负载均衡器，如 [AWS Elastic Load Balancing](https://aws.amazon.com/elasticloadbalancing/) 或 [Azure Load Balancer](https://azure.microsoft.com/en-us/services/load-balancer/) 在应用程序实例之间分配流量。

> info **提示** [Mau](https://mau.nestjs.com/ 'Deploy Nest') 在 AWS 上提供对水平扩展的内置支持，允许你轻松部署多个 NestJS 应用程序实例，只需点击几下即可管理它们。

#### 其他提示

部署 NestJS 应用程序时，还有一些提示需要记住：

- **安全性**：确保应用程序安全并免受常见威胁（如 SQL 注入、XSS 等）。查看"安全"类别了解更多详情。
- **监控**：使用监控工具（如 [Prometheus](https://prometheus.io/) 或 [New Relic](https://newrelic.com/)）跟踪应用程序的性能和运行状况。如果你使用云提供商/Mau，他们可能提供内置监控服务（如 [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) 等）。
- **不要硬编码环境变量**：避免在代码中硬编码敏感信息（如 API 密钥、密码或令牌）。使用环境变量或密钥管理器安全地存储和访问这些值。
- **备份**：定期备份数据以防止在发生事故时丢失数据。
- **自动化部署**：使用 CI/CD 管道自动化部署过程并确保跨环境的一致性。
- **速率限制**：实施速率限制以防止滥用并保护应用程序免受 DDoS 攻击。查看 [速率限制章节](/security/rate-limiting) 了解更多详情，或使用 [AWS WAF](https://aws.amazon.com/waf/) 等服务获得高级保护。

#### Docker 化应用程序

[Docker](https://www.docker.com/) 是一个使用容器化的平台，允许开发人员将应用程序及其依赖项打包到一个称为容器的标准化单元中。容器是轻量级、可移植和隔离的，使其成为在各种环境（从本地开发到生产）中部署应用程序的理想选择。

Docker 化 NestJS 应用程序的好处：

- **一致性**：Docker 确保应用程序在任何机器上以相同方式运行，消除"它在我的机器上可以工作"的问题。
- **隔离**：每个容器在其隔离的环境中运行，防止依赖项之间的冲突。
- **可扩展性**：Docker 使跨不同机器或云实例运行多个容器变得容易，从而轻松扩展应用程序。
- **可移植性**：容器可以在环境之间轻松移动，使其简单地在不同平台上部署应用程序。

要安装 Docker，请按照 [官方网站](https://www.docker.com/get-started) 上的说明进行操作。安装 Docker 后，你可以在 NestJS 项目中创建 `Dockerfile` 来定义构建容器镜像的步骤。

`Dockerfile` 是一个文本文件，包含 Docker 用于构建容器镜像的指令。

以下是 NestJS 应用程序的示例 Dockerfile：

```bash
# 使用官方 Node.js 镜像作为基础镜像
FROM node:20

# 在容器内设置工作目录
WORKDIR /usr/src/app

# 将 package.json 和 package-lock.json 复制到工作目录
COPY package*.json ./

# 安装应用程序依赖项
RUN npm install

# 复制其余应用程序文件
COPY . .

# 构建 NestJS 应用程序
RUN npm run build

# 公开应用程序端口
EXPOSE 3000

# 运行应用程序的命令
CMD ["node", "dist/main"]
```

> info **提示** 确保将 `node:20` 替换为项目中使用的适当 Node.js 版本。你可以在 [官方 Docker Hub 仓库](https://hub.docker.com/_/node) 上找到可用的 Node.js Docker 镜像。

这是一个基本的 Dockerfile，它设置 Node.js 环境，安装应用程序依赖项，构建 NestJS 应用程序并运行它。你可以根据项目需求自定义此文件（例如，使用不同的基础镜像，优化构建过程，仅安装生产依赖项等）。

让我们还创建一个 `.dockerignore` 文件来指定 Docker 在构建镜像时应忽略哪些文件和目录。在项目根目录创建 `.dockerignore` 文件：

```bash
node_modules
dist
*.log
*.md
.git
```

此文件确保不必要的文件不包含在容器镜像中，保持其轻量级。现在你已设置好 Dockerfile，可以构建 Docker 镜像。打开终端，导航到项目目录，并运行以下命令：

```bash
docker build -t my-nestjs-app .
```

在此命令中：

- `-t my-nestjs-app`：使用名称 `my-nestjs-app` 标记镜像。
- `.`：指示当前目录为构建上下文。

构建镜像后，你可以将其作为容器运行。执行以下命令：

```bash
docker run -p 3000:3000 my-nestjs-app
```

在此命令中：

- `-p 3000:3000`：将主机上的端口 3000 映射到容器中的端口 3000。
- `my-nestjs-app`：指定要运行的镜像。

你的 NestJS 应用程序现在应该在 Docker 容器中运行。

如果你想将 Docker 镜像部署到云提供商或与其他人共享，你需要将其推送到 Docker 注册表（如 [Docker Hub](https://hub.docker.com/)、[AWS ECR](https://aws.amazon.com/ecr/) 或 [Google Container Registry](https://cloud.google.com/container-registry)）。

选择注册表后，你可以通过以下步骤推送镜像：

```bash
docker login # 登录到 Docker 注册表
docker tag my-nestjs-app your-dockerhub-username/my-nestjs-app # 标记镜像
docker push your-dockerhub-username/my-nestjs-app # 推送镜像
```

将 `your-dockerhub-username` 替换为你的 Docker Hub 用户名或适当的注册表 URL。推送镜像后，你可以在任何机器上拉取它并作为容器运行。

AWS、Azure 和 Google Cloud 等云提供商提供托管容器服务，简化大规模部署和管理容器。这些服务提供自动扩展、负载均衡和监控等功能，更易于在生产中运行 NestJS 应用程序。

#### 使用 Mau 轻松部署

[Mau](https://mau.nestjs.com/ 'Deploy Nest') 是我们在 [AWS](https://aws.amazon.com/) 上部署 NestJS 应用程序的官方平台。如果你还没有准备好手动管理基础设施（或只是想节省时间），Mau 是你的完美解决方案。

使用 Mau，配置和维护基础设施就像点击几个按钮一样简单。Mau 设计得简单易用，因此你可以专注于构建应用程序，而不必担心底层基础设施。在底层，我们使用 **Amazon Web Services** 为你提供强大可靠的平台，同时抽象掉 AWS 的所有复杂性。我们为你处理所有繁重的工作，因此你可以专注于构建应用程序和发展业务。

[Mau](https://mau.nestjs.com/ 'Deploy Nest') 非常适合初创公司、中小企业、大型企业和想要快速启动而不必花费大量时间学习和管理基础设施的开发人员。它非常容易使用，你可以在几分钟内启动并运行基础设施。它还在后台利用 AWS，为你提供 AWS 的所有优势，而无需管理其复杂性。

<figure><img src="/assets/mau-metrics.png" /></figure>

使用 [Mau](https://mau.nestjs.com/ 'Deploy Nest')，你可以：

- 只需点击几下即可部署 NestJS 应用程序（API、微服务等）。
- 配置**数据库**，如：
  - PostgreSQL
  - MySQL
  - MongoDB (DocumentDB)
  - Redis
  - 更多
- 设置代理服务，如：
  - RabbitMQ
  - Kafka
  - NATS
- 部署计划任务（**CRON 作业**）和后台工作者。
- 部署 lambda 函数和无服务器应用程序。
- 设置**CI/CD 管道**进行自动化部署。
- 以及更多！

要使用 Mau 部署 NestJS 应用程序，只需运行以下命令：

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

立即注册并 [使用 Mau 部署](https://mau.nestjs.com/ 'Deploy Nest')，在几分钟内让你的 NestJS 应用程序在 AWS 上运行！

<!-- 此文件从 content/deployment.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T09:15:33.943Z -->
<!-- 源文件: content/deployment.md -->

### 部署

当你准备将 NestJS 应用程序部署到生产环境时，可以采取一些关键步骤来确保其运行效率最高。在本指南中，我们将探讨一些关键的技巧和最佳实践，以帮助你成功部署你的 NestJS 应用程序。

#### 前置条件

在部署你的 NestJS 应用程序之前，请确保你已经：

- 有一个已经准备好的 NestJS 应用程序，准备好部署。
- 具有访问部署平台或服务器的权限，可以托管你的应用程序。
- 已经设置了应用程序所需的环境变量。
- 已经设置了必要的服务，例如数据库。
- 在部署平台上安装了至少一个 LTS 版本的 Node.js。

> info **提示** 如果你正在寻找用来部署 NestJS 应用程序的云平台，请查看 __LINK_45__，我们的官方平台在 AWS 上部署 NestJS 应用程序。使用 Mau，部署你的 NestJS 应用程序只需要点击几个按钮和执行一个命令：
>
> ```bash
$ npm install --save @apollo/subgraph
```
>
> 部署完成后，你将在几秒钟内在 AWS 上启动你的 NestJS 应用程序。

#### 构建应用程序

要构建你的 NestJS 应用程序，你需要将 TypeScript 代码编译成 JavaScript。这过程生成一个 __INLINE_CODE_10__ 目录，包含编译后的文件。你可以使用以下命令来构建应用程序：

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

extend type Query {
  getUser(id: ID!): User
}
```

这个命令通常会执行 __INLINE_CODE_11__ 命令，这是 TypeScript 编译器的包装器，添加了一些额外的功能（资产复制等）。如果你有自定义的构建脚本，可以直接执行它。对于 NestJS CLI 单体项目，请确保将项目名称传递给构建命令（__INLINE_CODE_12__）。

#### 生产环境

你的生产环境是您的应用程序将被外部用户访问的地方。这可能是云平台，如 __LINK_46__（EC2、ECS 等）， __LINK_47__， __LINK_48__，或你自己管理的服务器，如 __LINK_49__。

为了简化部署过程和避免手动设置，你可以使用服务，如 __LINK_50__，我们的官方平台在 AWS 上部署 NestJS 应用程序。更多信息，请查看 __LINK_51__。

一些使用云平台或服务的优点包括：

- 可扩展性：轻松扩展应用程序，以适应用户基础的增长。
- 安全性：受益于内置的安全功能和合规性认证。
- 监控：实时监控应用程序的性能和健康状况。
- 可靠性：确保应用程序始终可用，高可用性保证。

#### NODE_ENV=production

虽然 Node.js 和 NestJS 并没有在开发和生产环境之间存在技术差异，但是为运行应用程序在生产环境时设置 __INLINE_CODE_20__ 环境变量到 __INLINE_CODE_21__ 是一种好的实践，因为某些库在这个变量下可能会有不同行为（例如启用或禁用调试输出等）。

你可以在启动应用程序时设置 __INLINE_CODE_22__ 环境变量，如下所示：

```typescript
import { Args, Query, Resolver, ResolveReference } from '@nestjs/graphql';
import { UsersService } from './users.service';

@Resolver('User')
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query()
  getUser(@Args('id') id: string) {
    return this.usersService.findById(id);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: string }) {
    return this.usersService.findById(reference.id);
  }
}
```

或者在云提供商/Mau 仪表盘中设置它。

#### 运行应用程序

要在生产环境中运行你的 NestJS 应用程序，只需使用以下命令：

```typescript
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths: ['**/*.graphql'],
    }),
  ],
  providers: [UsersResolver],
})
export class AppModule {}
```

这个命令启动应用程序，它将监听指定的端口（通常是 __INLINE_CODE_23__）确保这个端口与你在应用程序中配置的端口匹配。

或者，你可以使用 __INLINE_CODE_24__ 命令。这命令是 __INLINE_CODE_25__ 的包装器，但它有一个关键的差异：它自动执行 __INLINE_CODE_26__ 之前启动应用程序，所以你不需要手动执行 __INLINE_CODE_27__。#### 健康检查

健康检查对监控 NestJS 应用程序在生产环境中的健康和状态是非常重要的。Here is the translation of the English technical documentation to Chinese:

**健康检查**

在 NestJS 中，您可以轻松地实现健康检查使用 **@nestjs/terminus** 包，该包提供了强大的工具，包括数据库连接、外部服务和自定义检查。

请查看 __LINK_53__以了解如何在您的 NestJS 应用程序中实现健康检查，并确保您的应用程序始终被监控和响应。

#### 记录

记录对于任何生产就绪的应用程序都是必要的。它帮助追踪错误、监控行为和 troubleshoot 问题。在 NestJS 中，您可以轻松地管理记录使用内置日志器或选择外部库，如果您需要更高级的功能。

记录最佳实践：

- 错误日志，而不是异常日志：集中记录详细的错误信息，以加速调试和问题解决。
- 避免敏感数据：从不记录敏感信息，如密码或令牌，以保护安全。
- 使用 Correlation IDs：在分布式系统中，包括唯一标识符（如 Correlation IDs）在您的日志中，以追踪请求跨越不同服务。
- 使用日志级别：按严重性 categorize 日志（例如 __INLINE_CODE_28__、__INLINE_CODE_29__、__INLINE_CODE_30__）并在生产环境中禁用调试或详细日志，以减少噪音。

> info **提示** 如果您使用 __LINK_54__（具有 __LINK_55__ 或直接），考虑 JSON 记录，以使日志更易于解析和分析。

对于分布式应用程序，使用集中化记录服务，如 ElasticSearch、Loggly 或 Datadog 可以非常有用。这些工具提供了强大的功能，如日志聚合、搜索和可视化，使得监控和分析应用程序的性能和行为变得更加容易。

#### 扩展

扩展您的 NestJS 应用程序以有效地处理增加的流量和确保最佳性能是非常重要的。有两个主要的扩展策略：**垂直扩展**和**水平扩展**。了解这些方法将帮助您设计应用程序以高效地管理负载。

**垂直扩展**，也称为“扩展上”，涉及将单个服务器的资源增加以提高性能。这可能意味着将您的现有机器的 CPU、RAM 或存储增加。以下是一些关键点：

- 簡洁性：垂直扩展通常较为简单，因为您只需要升级现有服务器，而不是管理多个实例。
- 限制：有一些物理限制，您不能无限扩展单个机器。届时，您可能需要考虑其他选项。
- 成本效益：对于交通流量较为 moderate 的应用程序，垂直扩展可以是 cost-effective 的，因为它减少了需要额外基础设施的需求。

示例：如果您的 NestJS 应用程序在虚拟机中运行，并且您注意到在峰值小时运行缓慢，您可以升级 VM 到更大实例类型。

**水平扩展**，或“扩展出”，涉及添加更多服务器或实例以分布负载。这策略在云环境中广泛使用，并且对于预期高交通流量的应用程序是非常重要的。以下是优点和考虑：

- 增加容量：通过添加更多应用程序实例，您可以处理更大的同时用户数，而不影响性能。
- 冗余：水平扩展提供冗余，因为单个服务器的故障不会导致整个应用程序崩溃。流量可以重新分布到剩余的服务器上。
- 负载均衡：为了有效地管理多个实例，使用负载均衡器（如 Nginx 或 AWS Elastic Load Balancer）将 incoming 流量均匀分布到您的服务器上。

示例：对于 NestJS 应用程序经验高交通流量，您可以部署多个应用程序实例在云环境中，并使用负载均衡器将请求路由，以确保单个实例不会成为瓶颈。

这过程在容器化技术，如 __LINK_56__ 和容器编排平台，如 __LINK_57__ 中都是简单的。此外，您还可以使用云特定的负载均衡器，如 __LINK_58__ 或 __LINK_59__ 将流量分布到您的应用程序实例上。

> info **提示** __LINK_60__ 提供了对 AWS 的内置支持，允许您轻松地部署多个 NestJS 应用程序实例，并使用几个点击来管理它们。

#### 其他提示

有几个其他提示，您需要在部署 NestJS 应用程序时考虑：

- **安全**：确保您的应用程序是安全的，并且保护了常见的threats，如 SQL 注入、XSS 等。请查看“安全”类别以了解更多信息。Here is the translated text:

- **监控**：使用监控工具，如__LINK_61__或__LINK_62__，来跟踪您的应用程序的性能和健康状况。

Note:

* I followed the provided glossary and translated "Monitoring" to "监控".
* I kept the code placeholders (e.g., __LINK_61__, __LINK_62__) unchanged as per the instructions.
* I maintained the original Markdown formatting and kept the link as-is, as it will be processed later.Here is the translated technical documentation in Chinese:

如果您使用云提供商/Mau，他们可能提供了内置的监控服务（例如 __LINK_63__ 等）。

**不要硬编码环境变量**：避免在代码中硬编码敏感信息，如API密钥、密码或令牌。使用环境变量或秘密管理器来存储和访问这些值以确保安全。

**备份**：定期备份您的数据以防止数据丢失在意外事件中。

**自动部署**：使用CI/CD管道来自动化您的部署过程，以确保在不同环境中的一致性。

**速率限制**：实施速率限制以防止滥用和保护您的应用程序免受DDoS攻击。查看 __LINK_64__ 获取更多信息，或者使用服务 __LINK_65__ 进行高级保护。

#### 使用 Docker

__LINK_66__ 是一个平台，使用容器化技术允许开发者将应用程序及其依赖项打包到一个标准化的单元中，即容器。容器轻便、可移植和隔离，非常适合在各种环境中部署应用程序，从本地开发到生产。

Dockerizing your NestJS application 的优点：

- 一致性：Docker 确保您的应用程序在任何机器上运行相同，解决了“在我的机器上它工作”的问题。
- 隔离：每个容器在其隔离环境中运行，防止依赖项之间的冲突。
- 可扩展性：Docker 可以轻松地扩展您的应用程序，通过在不同的机器或云实例上运行多个容器。
- 可移植性：容器可以轻松地在不同环境中移动，使得在不同的平台上部署您的应用程序变得简单。

要安装 Docker，按照 __LINK_67__ 的指令进行操作。安装 Docker 后，您可以在 NestJS 项目中创建一个 __INLINE_CODE_31__ 来定义构建容器映像的步骤。

__INLINE_CODE_32__ 是一个文本文件，包含 Docker 使用来构建容器映像的指令。

以下是一个 NestJS 应用程序的基本 Dockerfile：

```ts
import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;
}
```

> info **提示**请确保将 __INLINE_CODE_33__ 替换为您的项目中使用的 Node.js 版本。您可以在 __LINK_68__ 上找到可用的 Node.js Docker 映像。

这个基本 Dockerfile 设置了 Node.js 环境，安装了应用程序依赖项，构建了 NestJS 应用程序，并运行它。您可以根据项目要求自定义这个文件（例如使用不同的基本映像、优化构建过程、只安装生产依赖项等）。

现在，让我们创建一个 __INLINE_CODE_34__ 文件来指定 Docker 在构建映像时忽略的文件和目录。创建一个 __INLINE_CODE_35__ 文件在项目根目录：

```ts
import { Args, Query, Resolver, ResolveReference } from '@nestjs/graphql';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User)
  getUser(@Args('id') id: number): User {
    return this.usersService.findById(id);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: number }): User {
    return this.usersService.findById(reference.id);
  }
}
```

这个文件确保了不必要的文件不包括在容器映像中，保持其轻便。现在，您已经设置了 Dockerfile，下一步可以构建您的 Docker 映像。打开您的终端，导航到项目目录，然后运行以下命令：

```typescript
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service'; // Not included in this example

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
    }),
  ],
  providers: [UsersResolver, UsersService],
})
export class AppModule {}
```

在这个命令中：

- __INLINE_CODE_36__：将图像标记为 __INLINE_CODE_37__。
- `@key`：指定当前目录为构建上下文。

构建映像后，您可以将其作为容器运行。执行以下命令：

```graphql
type Post @key(fields: "id") {
  id: ID!
  title: String!
  body: String!
  user: User
}

extend type User @key(fields: "id") {
  id: ID! @external
  posts: [Post]
}

extend type Query {
  getPosts: [Post]
}
```

在这个命令中：

- `User`：将宿主机的端口 3000 映射到容器中的端口 3000。
- `id`：指定要运行的图像。

您的 NestJS 应用程序现在应该在 Docker 容器中运行。

如果您想将 Docker 映像部署到云提供商或与其他人共享，需要将其推送到 Docker 注册表（例如 __LINK_69__、__LINK_70__ 或 __LINK_71__）。

一旦您选择了注册表，可以按照以下步骤推送您的图像：

```typescript
import { Query, Resolver, Parent, ResolveField } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './posts.interfaces';

@Resolver('Post')
export class PostsResolver {
  constructor(private postsService: PostsService) {}

  @Query('getPosts')
  getPosts() {
    return this.postsService.findAll();
  }

  @ResolveField('user')
  getUser(@Parent() post: Post) {
    return { __typename: 'User', id: post.userId };
  }
}
```

将 `extend` 替换为您的 Docker Hub 用户名或适当的注册表 URL。推送您的图像后，您可以在任何机器上拉取它并将其作为容器运行。

云提供商，如 AWS、Azure 和 Google Cloud 提供了管理容器服务，简化了在大规模部署和管理容器的过程。这些服务提供了功能，如自动扩展、负载均衡和监控，使得在生产中运行您的 NestJS 应用程序变得更加容易。

#### 使用 Mau

__LINK_72__ 是我们的官方平台，用于在 __LINK_73__ 上部署 NestJS 应用程序。如果您不想自己管理基础设施（或只是想节省时间），Mau 就是您的理想选择。

使用 Mau，配置和维护基础设施变得像点击几下按钮一样简单。Mau 设计了简单和直观，以便您可以专心构建应用程序，而不是担心 underlying 基础设施。Here is the translation of the English technical documentation to Chinese, following the provided rules:

**底层，我们使用**Amazon Web Services**为您提供强大且可靠的平台，同时将AWS的所有复杂性抽象化。**

Note:

* I strictly adhered to the provided glossary for technical terms.
* I kept the code examples, variable names, and function names unchanged.
* I maintained Markdown formatting, links, images, and tables unchanged.
* I translated code comments from English to Chinese.
* I removed all @@switch blocks and content after them, as instructed.
* I converted @@filename(xxx) to rspress syntax: ```typescript title="xxx".
* I kept internal anchors unchanged, as they will be mapped later.
* I maintained professionalism and readability, using natural and fluent Chinese.
* I kept content that is already in Chinese unchanged.
* I didn't add extra content not in the original.
* I made appropriate Chinese localization improvements.Here is the translation of the English technical documentation to Chinese, following the provided rules:

我们为您处理所有繁重的工作，您可以专注于构建应用程序和扩大业务。

__LINK_74__适合初创公司、中小型企业、大型企业和开发者，您可以快速地上线，不需要花费很多时间学习和管理基础设施。它非常容易使用，您可以在分钟内就上线基础设施。此外，它还利用了 AWS 的后台，提供了 AWS 的所有优势，而不需要管理其复杂性。

__HTML_TAG_42____HTML_TAG_43____HTML_TAG_44__

使用 __LINK_75__，您可以：

* 使用几点击部署 NestJS 应用程序（API、微服务等）。
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
* 部署计划任务（CRON 作业）和背景工作线程。
* 部署 Lambda 函数和无服务器应用程序。
* 设置 CI/CD.PIPELINE  automated deployments。
* 还有更多。

使用 Mau 部署 NestJS 应用程序，只需运行以下命令：

```typescript
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { PostsResolver } from './posts.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths: ['**/*.graphql'],
    }),
  ],
  providers: [PostsResolvers],
})
export class AppModule {}
```

今天注册并__LINK_76__以在分钟内将 NestJS 应用程序部署到 AWS 上。

Note: I kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I also translated code comments from English to Chinese, and kept internal anchors unchanged. I removed all @@switch blocks and content after them, and converted @@filename(xxx) to rspress syntax. I kept relative links unchanged and processed links as instructed.
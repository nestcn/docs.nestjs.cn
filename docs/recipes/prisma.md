### Prisma

[Prisma](https://www.prisma.io) 是一个面向 Node.js 和 TypeScript 的 [开源](https://github.com/prisma/prisma) ORM 工具。它可作为编写原生 SQL 或使用其他数据库访问工具（如 SQL 查询构建器 [knex.js](https://knexjs.org/) 或 ORM 框架 [TypeORM](https://typeorm.io/) 和 [Sequelize](https://sequelize.org/)）的 **替代方案** 。Prisma 目前支持 PostgreSQL、MySQL、SQL Server、SQLite、MongoDB 以及 CockroachDB（ [预览版](https://www.prisma.io/docs/reference/database-reference/supported-databases) ）。

虽然 Prisma 可以用于原生 JavaScript 项目，但它深度整合 TypeScript 并提供超越 TypeScript 生态中其他 ORM 的类型安全保障。您可以通过[此链接](https://www.prisma.io/docs/concepts/more/comparisons/prisma-and-typeorm#type-safety)查看 Prisma 与 TypeORM 在类型安全方面的详细对比。

> **注意** 如需快速了解 Prisma 的工作原理，可按照[快速入门](https://www.prisma.io/docs/getting-started/quickstart)指南操作，或阅读[官方文档](https://www.prisma.io/docs/)中的[介绍章节](https://www.prisma.io/docs/understand-prisma/introduction) 。[`prisma-examples`](https://github.com/prisma/prisma-examples/) 代码库中还提供了 [REST](https://github.com/prisma/prisma-examples/tree/b53fad046a6d55f0090ddce9fd17ec3f9b95cab3/orm/nest) 和 [GraphQL](https://github.com/prisma/prisma-examples/tree/b53fad046a6d55f0090ddce9fd17ec3f9b95cab3/orm/nest-graphql) 的即用型示例。

#### 快速开始

在本教程中，您将学习如何从零开始使用 NestJS 和 Prisma。您将构建一个示例 NestJS 应用程序，该程序具有可读写数据库数据的 REST API。

本指南将使用 [SQLite](https://sqlite.org/) 数据库以避免搭建数据库服务器的开销。请注意，即使您使用 PostgreSQL 或 MySQL，仍可遵循本指南——在适当位置会提供针对这些数据库的额外说明。

> **注意** 如果您已有现有项目并考虑迁移至 Prisma，可参考[将 Prisma 添加到现有项目](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project-typescript-postgres)的指南。若需从 TypeORM 迁移，请阅读[从 TypeORM 迁移到 Prisma](https://www.prisma.io/docs/guides/migrate-to-prisma/migrate-from-typeorm) 指南。

#### 创建您的 NestJS 项目

要开始使用，请先安装 NestJS CLI 并通过以下命令创建应用骨架：

```bash
$ npm install -g @nestjs/cli
$ nest new hello-prisma
```

查看[入门指南](../overview/first-steps)页面以了解此命令创建的项目文件详情。请注意，你现在可以运行 `npm start` 来启动应用程序。运行在 `http://localhost:3000/` 的 REST API 当前仅实现了一个路由，该路由定义在 `src/app.controller.ts` 文件中。在本指南后续内容中，你将实现更多路由来存储和检索关于*用户*和*帖子*的数据。

#### 配置 Prisma

首先将 Prisma CLI 作为开发依赖安装到你的项目中：

```bash
$ cd hello-prisma
$ npm install prisma --save-dev
```

在以下步骤中，我们将使用 [Prisma CLI](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-cli)。作为最佳实践，建议通过添加 `npx` 前缀在本地调用 CLI：

```bash
$ npx prisma
```

使用 Yarn 时展开

若使用 Yarn，可通过以下方式安装 Prisma CLI：

```bash
$ yarn add prisma --dev
```

安装完成后，可通过添加 `yarn` 前缀调用：

```bash
$ yarn prisma
```

现在使用 Prisma CLI 的 `init` 命令创建初始 Prisma 配置：

```bash
$ npx prisma init
```

该命令会创建一个包含以下内容的 `prisma` 目录：

- `schema.prisma`：指定数据库连接并包含数据库模式
- `.env`：一个 [dotenv](https://github.com/motdotla/dotenv) 文件，通常用于将数据库凭证存储在一组环境变量中

#### 设置数据库连接

您的数据库连接配置在 `schema.prisma` 文件中的 `datasource` 块内。默认设置为 `postgresql`，但由于本指南中使用的是 SQLite 数据库，您需要将 `datasource` 块的 `provider` 字段调整为 `sqlite`：

```groovy
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

现在打开 `.env` 文件，将 `DATABASE_URL` 环境变量调整如下：

```bash
DATABASE_URL="file:./dev.db"
```

请确保已配置 [ConfigModule](../techniques/configuration)，否则 `DATABASE_URL` 变量将无法从 `.env` 中读取。

SQLite 数据库是简单的文件；使用 SQLite 数据库无需服务器。因此，无需配置包含*主机*和*端口*的连接 URL，只需指向本地文件即可，本例中该文件名为 `dev.db`。此文件将在下一步创建。

展开查看 PostgreSQL、MySQL、MsSQL 或 Azure SQL 的使用说明

使用 PostgreSQL 和 MySQL 时，需要配置连接 URL 指向数据库服务器。您可以在此处了解所需连接 URL 格式的更多信息。

**PostgreSQL**

如果您使用的是 PostgreSQL，需要按以下方式调整 `schema.prisma` 和 `.env` 文件：

**`schema.prisma`**

```groovy
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

**`.env`**

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA"
```

将所有大写字母表示的占位符替换为您的数据库凭据。请注意，如果不确定 `SCHEMA` 占位符该填写什么，很可能就是默认值 `public`：

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

如果想学习如何设置 PostgreSQL 数据库，可以按照本指南在 Heroku 上设置免费的 PostgreSQL 数据库。

**MySQL**

若使用 MySQL，需按以下方式调整 `schema.prisma` 和 `.env` 文件：

**`schema.prisma`**

```groovy
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

**`.env`**

```bash
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
```

将所有大写字母书写的占位符替换为您的数据库凭证。

**Microsoft SQL Server / Azure SQL Server**

若使用 Microsoft SQL Server 或 Azure SQL Server，需按以下方式调整 `schema.prisma` 和 `.env` 文件：

**`schema.prisma`**

```groovy
datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

**`.env`**

将全大写的占位符替换为您的数据库凭据。请注意，如果您不确定要为 `encrypt` 占位符提供什么值，很可能默认值就是 `true`：

```bash
DATABASE_URL="sqlserver://HOST:PORT;database=DATABASE;user=USER;password=PASSWORD;encrypt=true"
```

#### 使用 Prisma Migrate 创建两个数据库表

在本节中，您将使用 [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate) 在数据库中创建两个新表。Prisma Migrate 会根据 Prisma 架构中的声明式数据模型定义生成 SQL 迁移文件。这些迁移文件完全可自定义，因此您可以配置底层数据库的任何附加功能或包含其他命令，例如用于数据填充。

将以下两个模型添加到您的 `schema.prisma` 文件中：

```groovy
model User {
  id    Int     @default(autoincrement()) @id
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @default(autoincrement()) @id
  title     String
  content   String?
  published Boolean? @default(false)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
}
```

在准备好 Prisma 模型后，您可以生成 SQL 迁移文件并针对数据库运行它们。在终端中执行以下命令：

```bash
$ npx prisma migrate dev --name init
```

这个 `prisma migrate dev` 命令会生成 SQL 文件并直接针对数据库运行。在本例中，以下迁移文件被创建在现有的 `prisma` 目录中：

```bash
$ tree prisma
prisma
├── dev.db
├── migrations
│   └── 20201207100915_init
│       └── migration.sql
└── schema.prisma
```

展开查看生成的 SQL 语句

以下表格已在您的 SQLite 数据库中创建：

```sql
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN DEFAULT false,
    "authorId" INTEGER,

    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");
```

#### 安装并生成 Prisma Client

Prisma Client 是一个类型安全的数据库客户端，它根据您的 Prisma 模型定义*生成* 。通过这种方式，Prisma Client 能够提供专门为您的模型*量身定制*的 [CRUD](https://www.prisma.io/docs/concepts/components/prisma-client/crud) 操作。

要在项目中安装 Prisma Client，请在终端运行以下命令：

```bash
$ npm install @prisma/client
```

请注意，安装过程中 Prisma 会自动为您调用 `prisma generate` 命令。今后，每次修改 Prisma 模型后，您都需要运行此命令以更新生成的 Prisma Client。

> info **注意** ：`prisma generate` 命令会读取您的 Prisma 架构，并更新位于 `node_modules/@prisma/client` 中的生成 Prisma 客户端库。

#### 在 NestJS 服务中使用 Prisma 客户端

您现在可以使用 Prisma 客户端发送数据库查询。如需了解如何使用 Prisma 客户端构建查询，请参阅 [API 文档](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/crud) 。

在设置 NestJS 应用程序时，您可能希望将 Prisma 客户端 API 抽象为服务内的数据库查询。首先，您可以创建一个新的 `PrismaService`，该服务负责实例化 `PrismaClient` 并连接到数据库。

在 `src` 目录中，创建一个名为 `prisma.service.ts` 的新文件，并添加以下代码：

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

> **注意** `onModuleInit` 是可选的——如果省略它，Prisma 将在首次调用数据库时延迟连接。

接下来，你可以编写服务来为 Prisma 模式中的 `User` 和 `Post` 模型进行数据库调用。

仍在 `src` 目录中，创建一个名为 `user.service.ts` 的新文件，并添加以下代码：

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}
```

注意你正在使用 Prisma Client 生成的类型来确保服务暴露的方法具有正确的类型定义。这样你就能省去手动定义模型和创建额外接口或 DTO 文件的样板代码。

现在对 `Post` 模型执行相同操作。

仍在 `src` 目录下，新建一个名为 `post.service.ts` 的文件，并添加以下代码：

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Post, Prisma } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async post(
    postWhereUniqueInput: Prisma.PostWhereUniqueInput
  ): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: postWhereUniqueInput,
    });
  }

  async posts(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PostWhereUniqueInput;
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  }): Promise<Post[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.post.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createPost(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.post.create({
      data,
    });
  }

  async updatePost(params: {
    where: Prisma.PostWhereUniqueInput;
    data: Prisma.PostUpdateInput;
  }): Promise<Post> {
    const { data, where } = params;
    return this.prisma.post.update({
      data,
      where,
    });
  }

  async deletePost(where: Prisma.PostWhereUniqueInput): Promise<Post> {
    return this.prisma.post.delete({
      where,
    });
  }
}
```

你的 `UsersService` 和 `PostsService` 目前封装了 Prisma Client 中可用的 CRUD 查询。在实际应用中，服务层也是添加业务逻辑的地方。例如，你可以在 `UsersService` 中添加一个名为 `updatePassword` 的方法，专门负责更新用户密码。

记得在应用模块中注册新服务。

##### 在主应用控制器中实现你的 REST API 路由

最后，你将使用前面章节创建的服务来实现应用的不同路由。在本指南中，你将把所有路由都放入已存在的 `AppController` 类中。

将 `app.controller.ts` 文件内容替换为以下代码：

```typescript
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { PostsService } from './post.service';
import { User as UserModel, Post as PostModel } from '@prisma/client';

@Controller()
export class AppController {
  constructor(
    private readonly userService: UsersService,
    private readonly postService: PostsService
  ) {}

  @Get('post/:id')
  async getPostById(@Param('id') id: string): Promise<PostModel> {
    return this.postService.post({ id: Number(id) });
  }

  @Get('feed')
  async getPublishedPosts(): Promise<PostModel[]> {
    return this.postService.posts({
      where: { published: true },
    });
  }

  @Get('filtered-posts/:searchString')
  async getFilteredPosts(
    @Param('searchString') searchString: string
  ): Promise<PostModel[]> {
    return this.postService.posts({
      where: {
        OR: [
          {
            title: { contains: searchString },
          },
          {
            content: { contains: searchString },
          },
        ],
      },
    });
  }

  @Post('post')
  async createDraft(
    @Body() postData: { title: string; content?: string; authorEmail: string }
  ): Promise<PostModel> {
    const { title, content, authorEmail } = postData;
    return this.postService.createPost({
      title,
      content,
      author: {
        connect: { email: authorEmail },
      },
    });
  }

  @Post('user')
  async signupUser(
    @Body() userData: { name?: string; email: string }
  ): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @Put('publish/:id')
  async publishPost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.updatePost({
      where: { id: Number(id) },
      data: { published: true },
    });
  }

  @Delete('post/:id')
  async deletePost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.deletePost({ id: Number(id) });
  }
}
```

该控制器实现了以下路由：

###### `GET`

- `/post/:id`：通过 `id` 获取单篇文章
- `/feed`：获取所有*已发布*的文章
- `/filter-posts/:searchString`：通过`标题`或`内容`筛选文章

###### `POST`

- `/post`: 创建新帖子
  - 正文：
    - `title: String` (必填): 帖子标题
    - `content: String` (可选): 帖子内容
    - `authorEmail: String` (必填)：创建帖子的用户邮箱
- `/user`：创建新用户
  - 请求体：
    - `email: String` (必填)：用户的电子邮箱地址
    - `name: String`（可选）：用户名

###### `PUT`

- `/publish/:id`：通过 `id` 发布帖子

###### `DELETE`

- `/post/:id`：通过 `id` 删除帖子

#### 摘要

在本教程中，您已了解如何结合使用 Prisma 和 NestJS 来实现 REST API。实现 API 路由的控制器会调用 `PrismaService`，该服务继而使用 Prisma Client 向数据库发送查询，以满足传入请求的数据需求。

如需深入了解 NestJS 与 Prisma 的结合使用，请务必查阅以下资源：

- [NestJS & Prisma](https://www.prisma.io/nestjs)
- [开箱即用的 REST 和 GraphQL 示例项目](https://github.com/prisma/prisma-examples/)
- [生产就绪的入门套件](https://github.com/notiz-dev/nestjs-prisma-starter#instructions)
- [视频：使用 NestJS 与 Prisma 访问数据库（5 分钟）](https://www.youtube.com/watch?v=UlVJ340UEuk&ab_channel=Prisma) 作者：[Marc Stammerjohann](https://github.com/marcjulian)

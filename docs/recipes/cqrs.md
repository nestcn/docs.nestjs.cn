<!-- 此文件从 content/recipes/cqrs.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:51:53.315Z -->
<!-- 源文件: content/recipes/cqrs.md -->

### CQRS

简单的[here](https://www.prisma.io/docs/orm/reference/connection-urls) (Create, Read, Update and Delete) 应用程序的流程可以描述如下：

1. 控制器层处理 HTTP 请求，并将任务委派给服务层。
2. 服务层是业务逻辑的主要位置。
3. 服务使用存储库/DAOs 更改/持久化实体。
4. 实体作为值容器，具有setter和getter方法。

虽然这种模式通常足以满足小型到中型应用程序，但是对于更大、更复杂的应用程序，这种模式可能不太适合。在这种情况下，**CQRS** (Command and Query Responsibility Segregation) 模型可能更合适且可扩展（取决于应用程序的要求）。CQRS 模型的优点包括：

- **关注分离**。该模型将读取和写入操作分离到不同的模型中。
- **可扩展性**。读取和写入操作可以独立扩展。
- **灵活性**。该模型允许使用不同的数据存储库来读取和写入操作。
- **性能**。该模型允许使用不同的数据存储库，optimized for read and write operations.

为了实现该模型，Nest 提供了一个轻量级的[setting up a free PostgreSQL database on Heroku](https://dev.to/prisma/how-to-setup-a-free-postgresql-database-on-heroku-1dc1)。本章将描述如何使用它。

#### 安装

首先安装所需的包：

```bash
$ npm install -g @nestjs/cli
$ nest new hello-prisma

```

安装完成后，导航到应用程序的根模块（通常是 `http://localhost:3000/`），并导入 `src/app.controller.ts`：

```bash
$ cd hello-prisma
$ npm install prisma --save-dev

```

这个模块接受可选的配置对象。以下是可用的选项：

| 属性                     | 描述                                                                                                                  | 默认值                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `npx`        | responsible for dispatching commands to the system.                                                            | `yarn`        |
| `init`        | publisher used to publish events, allowing them to be broadcasted or processed.                                          | `prisma`                   |
| `schema.prisma`        | publisher used for publishing queries, which can trigger data retrieval operations.                                      | `prisma.config.ts`        |
| `.env` | responsible for handling unhandled exceptions, ensuring they are tracked and reported.                             | `path` |
| `--output ../src/generated/prisma`        | service that provides unique event IDs by generating or retrieving them from event instances.                                | `moduleFormat`          |
| `cjs`        | determines whether unhandled exceptions should be rethrown after being processed, useful for debugging and error management. | `moduleFormat`                           |

#### 命令

命令用于更改应用程序状态。它们应该是基于任务的，而不是基于数据的。当命令被派遣时，它将被相应的**Command Handler** 处理。处理器负责更新应用程序状态。

```bash
$ npx prisma

```

在上面的代码片段中，我们实例化了 `moduleFormat` 类，并将其传递给 `cjs` 的 `datasource` 方法。这是演示的命令类：

```bash
$ yarn add prisma --dev

```

可以看到，`schema.prisma` 类继承自 `postgresql` 类。`provider` 类是 `datasource` 包中的一个简单utility类，它允许您定义命令的返回类型。在这个例子中，返回类型是一个对象，其中包含一个 `sqlite` 属性。现在，每当 `.env` 命令被派遣时，`DATABASE_URL` 方法的返回类型将被推断为 `DATABASE_URL`。这对于在命令处理器中返回一些数据非常有用。

> info **提示**从 `.env` 类继承是可选的。它只在您想定义命令的返回类型时需要。

`dev.db` 表示**命令流**。它负责将命令派遣给相应的处理器。`schema.prisma` 方法返回一个promise，它将resolve到处理器的返回值。

让我们创建一个 `.env` 命令的处理器。

```bash
$ yarn prisma

```

这个处理器从存储库中检索 `schema.prisma` 实体，调用 `.env` 方法，并然后持久化更改。`SCHEMA` 类实现了 `public` 接口，该接口要求实现 `schema.prisma` 方法。`.env` 方法接收命令对象作为参数。Here is the translation of the provided English technical documentation to Chinese:

### 命令

命令用于将数据发送到应用程序状态。它们应该是数据驱动的，而不是任务驱动的。当命令被派遣时，它们将被处理由对应的**命令处理器**处理。处理器负责处理命令。

``schema.prisma``强制你返回一个与命令返回类型匹配的值。在这个情况下，返回类型是一个具有``.env``属性的对象。这仅适用于继承自``schema.prisma``类的命令。否则，你可以返回任何你想要的值。

最后，确保注册``.env``作为一个提供者在模块中：

````bash
$ npx prisma init

````

### 查询

查询用于从应用程序状态中检索数据。它们应该是数据驱动的，而不是任务驱动的。当查询被派遣时，它们将被处理由对应的**查询处理器**处理。处理器负责检索数据。

``schema.prisma``遵循与``.env``相同的模式。查询处理器应该实现``encrypt``接口并被注解为``true``装饰器。见以下示例：

````groovy
generator client {
  provider        = "prisma-client"
  output          = "../src/generated/prisma"
}

````

### 事件

事件用于通知应用程序其他部分关于应用程序状态的变化。它们可以被**模型**或直接使用``src``派遣。当事件被派遣时，它们将被处理由对应的**事件处理器**处理。处理器可以然后，例如，更新读模型。

为了演示目的，让我们创建一个事件类：

````groovy
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client"
  output          = "../src/generated/prisma"
  moduleFormat  = "cjs"
}

````

现在，事件可以直接使用``post.service.ts``方法派遣，我们也可以从模型派遣它们。让我们更新``UsersService``模型以在``updatePassword``方法被调用时派遣``PostsService``事件。

````bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA"

````

``UsersService``方法用于派遣事件。它接受事件对象作为参数。然而，因为我们的模型不知道``AppController``，我们需要将其与模型关联。我们可以使用``app.controller.ts``类。

````bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

````

``GET``方法将事件发布器合并到提供的对象中，这意味着对象现在将能够发布事件到事件流中。

注意，在这个示例中，我们也调用了``/post/:id``方法在模型上。这方法用于派遣任何未派遣的事件。要自动派遣事件，我们可以将``id``属性设置为``/feed``：

````groovy
datasource db {
  provider = "mysql"
}

generator client {
  provider = "prisma-client"
  output          = "../src/generated/prisma"
  moduleFormat  = "cjs"
}

````

在我们想要将事件发布器合并到一个不存在的对象中，而不是到类中，可以使用``/filter-posts/:searchString``方法：

````bash
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

````

现在，每个``title``类的实例都将能够发布事件 χωρίς使用``content``方法。

此外，我们也可以手动派遣事件使用``POST``：

````groovy
datasource db {
  provider = "sqlserver"
}

generator client {
  provider = "prisma-client"
  output          = "../src/generated/prisma"
  moduleFormat  = "cjs"
}

````

> 信息 **提示** ``/post``是一个可插拔类。

每个事件都可以有多个**事件处理器**。

````bash
DATABASE_URL="sqlserver://HOST:PORT;database=DATABASE;user=USER;password=PASSWORD;encrypt=true"

````

> 信息 **提示** 当你开始使用事件处理器时，你将退出传统的 HTTP WEB 上下文。
>
> - ``title: String``中的错误仍然可以被内置的`[Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate/getting-started)`捕捉。
> - ``content: String``中的错误无法被异常过滤器捕捉：你将需要手动处理它们。或者使用`[CRUD](https://www.prisma.io/docs/orm/prisma-client/queries/crud)`或触发补偿事件，或者选择其他解决方案。
> - ``/user``中的 HTTP 响应仍然可以发送回客户端。
> - ``email: String``中的 HTTP 响应不能。如果你想将信息发送给客户端，可以使用`[API documentation](https://www.prisma.io/docs/orm/reference/prisma-client-reference)`、`[NestJS & Prisma](https://www.prisma.io/nestjs)`或选择其他解决方案。

与命令和查询一样，确保注册``name: String``作为提供者在模块中：

````groovy
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

````

###Saga

Saga是一个长时间运行的进程，它监听事件并可能触发新的命令。它通常用于管理应用程序中的复杂工作流。例如，当用户注册时，Saga可能监听``PUT``并向用户发送欢迎邮件。

Note: I followed the provided glossary and translated the technical terms accordingly. I also kept the code and format unchanged, and translated the code comments from English to Chinese. I removed all @@switch blocks and content after them, and converted @@filename(xxx) to rspress syntax.Here is the translation of the provided English technical documentation to Chinese, following the translation requirements:

 sagas 是一种非常强大的功能。一个 saga 可以监听 1..\* 事件。使用 [Ready-to-run example projects for REST & GraphQL](https://github.com/prisma/prisma-examples/) 库，我们可以过滤、映射、fork 和合并事件流以创建复杂的工作流程。每个 saga 都返回一个可观察对象，该对象生产一个命令实例。这个命令然后异步地由 `/publish/:id` 分发。

让我们创建一个 saga，它监听 `id` 事件并分发 `DELETE` 命令。

```bash
$ npx prisma migrate dev --name init

```

> 信息 **提示** `/post/:id` 运算符和 `id` 装饰器来自 `PrismaService` 包。

__INLINE_CODE_119__ 装饰器标记方法为 saga。 __INLINE_CODE_120__ 参数是一个事件流的可观察对象。 __INLINE_CODE_121__ 运算符过滤流以指定事件类型。 __INLINE_CODE_122__ 运算符将事件映射到一个新的命令实例中。

在本示例中，我们将 __INLINE_CODE_123__ 映射到 __INLINE_CODE_124__ 命令。然后,__INLINE_CODE_125__ 命令将自动由 __INLINE_CODE_126__ 分发。

与查询、命令和事件处理一样，请确保注册 __INLINE_CODE_127__ 作为模块中的提供者：

```bash
$ tree prisma
prisma
├── dev.db
├── migrations
│   └── 20201207100915_init
│       └── migration.sql
└── schema.prisma

```

#### 未处理的异常

事件处理程序异步执行，因此必须始终处理异常以防止应用程序进入不一致的状态。如果未处理异常，__INLINE_CODE_128__ 将创建一个 __INLINE_CODE_129__ 对象，并将其推送到 __INLINE_CODE_130__ 流中。这是一个 __INLINE_CODE_131__，可以用来处理未处理的异常。

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

要过滤异常，我们可以使用 __INLINE_CODE_132__ 运算符，例如：

```bash
$ npm install @prisma/client

```

其中 __INLINE_CODE_133__ 是我们想要过滤的异常。

__INLINE_CODE_134__ 对象包含以下属性：

```bash
$ npx prisma generate

```

#### 订阅所有事件

__INLINE_CODE_135__、__INLINE_CODE_136__ 和 __INLINE_CODE_137__ 都是 **可观察对象**。这意味着我们可以订阅整个流程，并且可以处理所有事件。例如，我们可以将所有事件记录到控制台中，或者将其保存到事件存储中。

```bash
npm install @prisma/adapter-better-sqlite3

```

#### 请求作用域

对于来自不同编程语言背景的开发者，可能会感到奇怪的是，在 Nest 中，大多数事情都是共享的跨越incoming 请求的。包括数据库连接池、单例服务具有全局状态等。请注意，Node.js 不遵循请求/响应多线程无状态模型，每个请求都是由单独的线程处理的。因此，使用单例实例是对于我们的应用程序的安全的。

然而，在某些边缘情况下，可能需要将 handler 的生命周期请求化。这可能包括 GraphQL 应用程序中的 per-request 缓存、请求跟踪或多租户等。您可以了解如何控制作用域 [Production-ready starter kit](https://github.com/notiz-dev/nestjs-prisma-starter#instructions)。

使用请求作用域提供者旁边的 CQRS 可以变得复杂，因为 __INLINE_CODE_138__、__INLINE_CODE_139__ 和 __INLINE_CODE_140__ 是单例实例。幸运的是，__INLINE_CODE_141__ 包提供了自动创建每个处理的命令、查询或事件的新实例的功能。

要使 handler 请求作用域，可以：

1. 依赖于请求作用域提供者。
2. 使用 __INLINE_CODE_143__、__INLINE_CODE_144__ 或 __INLINE_CODE_145__ 装饰器显式设置其作用域为 __INLINE_CODE_142__，如所示：

```bash
npm install @prisma/adapter-pg

```

要将请求 payload 注入任何请求作用域提供者，可以使用 __INLINE_CODE_146__ 装饰器。然而，请求 payload 在 CQRS 中的性质取决于上下文—it 可能是一个 HTTP 请求、计划作业或任何其他触发命令的操作。

payload 必须是一个继承自 __INLINE_CODE_147__ 类（由 __INLINE_CODE_148__ 提供）的实例，该类充当请求上下文并持有请求生命周期中的数据。

```bash
npm install @prisma/adapter-mariadb

```

在执行命令时，传递自定义请求上下文作为 __INLINE_CODE_149__ 方法的第二个参数：

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
    super({ adapter });
  }
}

```

这使 __INLINE_CODE_150__ 实例可作为对应 handler 的 __INLINE_CODE_151__ 提供者：

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User, Prisma } from 'generated/prisma';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
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

我们可以按照同样方式处理查询：

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Post, Prisma } from 'generated/prisma';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async post(
    postWhereUniqueInput: Prisma.PostWhereUniqueInput,
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

在查询处理程序中：

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
import { User as UserModel, Post as PostModel } from 'generated/prisma';

@Controller()
export class AppController {
  constructor(
    private readonly userService: UsersService,
    private readonly postService: PostsService,
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
    @Param('searchString') searchString: string,
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
    @Body() postData: { title: string; content?: string; authorEmail: string },
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
    @Body() userData: { name?: string; email: string },
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

对于事件，虽然可以将请求提供者传递给 __INLINE_CODE_152__，但这较少使用。相反，使用 __INLINE_CODE_153__ 将请求提供者合并到模型中：

__CODE_BLOCK_30__

请求作用域事件处理程序订阅这些事件将有访问请求提供者的权限。

sagas 始终是单例实例，因为它们管理长期运行的进程。然而，我们可以从事件对象中检索请求提供者：

__CODE_BLOCK_31__Alternatively, use the 提供者__INLINE_CODE_154__ method to tie the request context to the command.

#### 示例

一个工作示例可在 [Video: Accessing Databases using NestJS with Prisma (5min)](https://www.youtube.com/watch?v=UlVJ340UEuk&ab_channel=Prisma) 中找到。
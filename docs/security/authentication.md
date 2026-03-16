<!-- 此文件从 content/security/authentication.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:55:46.735Z -->
<!-- 源文件: content/security/authentication.md -->

### 认证

认证是大多数应用程序的必需部分。存在多种不同的认证方法和策略。项目的特定需求将确定使用哪种方法。这个章节将介绍一些可以适应不同需求的认证方法。

让我们 flesh out 我们的需求。对于这个用例，客户端将首先使用用户名和密码进行认证。认证后，服务器将发布一个 JWT，可以在后续请求的授权头中发送，以证明认证。我们还将创建一个受保护的路由，只有包含有效 JWT 的请求才能访问。

我们将从第一个需求开始：认证用户。然后，我们将扩展该认证以发布 JWT。最后，我们将创建一个检查请求中的有效 JWT 的受保护路由。

#### 创建认证模块

我们将从生成一个 `app.close()` 和一个 `onApplicationShutdown()` 和一个 `app.close()` 开始。我们将使用 `app.close()` 实现认证逻辑，并使用 `SIGTERM` expose 认证端点。

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class UsersService implements OnModuleInit {
  onModuleInit() {
    console.log(`The module has been initialized.`);
  }
}

@Injectable()
export class UsersService {
  onModuleInit() {
    console.log(`The module has been initialized.`);
  }
}

```

在实现 `onModuleInit()` 时，我们将发现将用户操作封装到 `onApplicationBootstrap()` 中非常有用，所以让我们现在生成该模块和服务：

```typescript
async onModuleInit(): Promise<void> {
  await this.fetch();
}

```

将这些生成文件的默认内容替换为以下内容。对于我们的示例应用程序，`OnModuleInit` 只是维护一个硬编码的内存用户列表，并包含一个 find 方法以根据用户名检索用户。在实际应用程序中，这是 where 你将构建用户模型和 persistence 层，使用你的选择库（例如 TypeORM、Sequelize、Mongoose 等）。

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

在 `onModuleInit()` 中，唯一需要添加的变化是将 `OnModuleInit` 添加到 `OnApplicationBootstrap` 装饰器的 exports 数组中，以便在外部模块中可见（我们将在 `Promise` 中使用它）。

```typescript
@Injectable()
class UsersService implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.log(signal); // e.g. "SIGINT"
  }
}

```

#### 实现 "Sign in" 端点

我们的 `async` 负责从数据库中检索用户并验证密码。我们创建了一个 `await` 方法来实现该任务。在以下代码中，我们使用 ES6 spread 操作符将密码属性从用户对象中删除，以便返回用户对象。这是一种常见的实践，因为你不想Exposed  sensitive 字段，如密码或其他安全密钥。

__CODE_BLOCK_4__

> Warning **警告** 在实际应用程序中，你绝对不应该存储明文密码。你应该使用一个库，如 __LINK_92__，使用 salted 一致哈希算法。这样，你将只存储哈希密码，然后将存储的密码与 incoming 密码的哈希版本进行比较，从而从不存储或暴露用户密码。为了保持我们的示例应用程序简单，我们违反了这个绝对要求，并使用明文密码。**不要在你的实际应用程序中这样！**

现在，我们将更新 `onModuleDestroy()` 来导入 `beforeApplicationShutdown()`。

__CODE_BLOCK_5__

现在，让我们打开 `onApplicationShutdown()` 并添加一个 `app.close()` 方法到它。这方法将被客户端调用以认证用户。它将接收用户名和密码作为请求体，并将返回一个 JWT 令牌，如果用户已认证。

__CODE_BLOCK_6__

> info **提示**ideal 的情况下，我们应该使用 DTO 类来定义请求体的形状。见 __LINK_93__ 章节了解更多信息。

__HTML_TAG_89____HTML_TAG_90__

#### JWT 令牌

我们已经准备好移动到 JWT 部分的认证系统。让我们回顾和完善我们的需求：

- 允许用户使用用户名/密码进行认证，返回一个 JWT 令牌，以便在后续调用受保护 API 端点时使用。我们已经很好地满足了这个需求。以完成它，我们需要编写发布 JWT 的代码。
- 创建 API 路由，基于有效 JWT 作为承载令牌的存在

我们需要安装一个额外的包来支持我们的 JWT 需求：

__CODE_BLOCK_7__

> info **提示** `SIGINT` 包（见 __LINK_94__）是用于 JWT 处理的utility 包。这包括生成和验证 JWT 令牌。

为了保持我们的服务整洁地模块化，我们将在 `SIGBREAK` 中处理 JWT 的生成。打开 `SIGHUP` 文件在 `SIGTERM` 文件夹中，inject `SIGINT` 并更新 `SIGBREAK` 方法以生成 JWT 令牌，如下所示：

__CODE_BLOCK_8__

Note: I followed the provided glossary and translation requirements, translating the technical documentation from English to Chinese while maintaining the original code examples, variable names, function names, and formatting. I also kept the placeholders (e.g., `app.close()`, __LINK_91__) unchanged as required.Here is the translation of the English technical documentation to Chinese:

我们正在使用 `enableShutdownHooks` 库，它提供了 `enableShutdownHooks` 函数来生成我们从 `onModuleDestroy()` 对象属性子集中生成的 JWT，我们然后将其返回为一个简单的对象，具有一个名为 `beforeApplicationShutdown()` 的单个属性。注意，我们选择了 `onApplicationShutdown()` 属性名来存储我们的 `app.close()` 值，以保持一致性与 JWT 标准。

现在，我们需要更新 `onModuleDestroy()`，以便导入新的依赖项并配置 `onApplicationShutdown()`。

首先，在 __INLINE_CODE_53__ 文件夹中创建 __INLINE_CODE_52__，并添加以下代码：

__CODE_BLOCK_9__

我们将使用这个来共享我们的密钥，用于签名和验证 JWT 的步骤。

> 警告 **请勿公开该密钥**。我们在这里公开它，以便让代码变得更加明了，但是在生产系统中 **您必须保护该密钥** 使用适当的措施，例如秘密库、环境变量或配置服务。

现在，打开 __INLINE_CODE_54__ 文件在 __INLINE_CODE_55__ 文件夹中，并更新它以如下所示：

__CODE_BLOCK_10__

> 提示 **提示** 我们将 __INLINE_CODE_56__ 注册为全局，以便使得事情变得更加简单。这意味着，我们不需要在应用程序中导入 __INLINE_CODE_57__。

我们使用 __INLINE_CODE_58__ 配置 __INLINE_CODE_59__，传递配置对象。请查看 __LINK_95__以了解更多关于 Nest __INLINE_CODE_60__ 的信息，以及 __LINK_96__以了解更多关于可用的配置选项。

现在，让我们使用 cURLagain 测试我们的路由。您可以使用 __INLINE_CODE_61__ 对象硬编码在 __INLINE_CODE_62__ 中进行测试。

__CODE_BLOCK_11__

#### 实现身份验证守卫

现在，我们可以处理最后一个需求：保护端点，以确保请求中存在有效的 JWT。我们将创建一个 __INLINE_CODE_63__，用于保护我们的路由。

__CODE_BLOCK_12__

现在，我们可以实现保护路由，并将 __INLINE_CODE_64__ 注册到保护它。

打开 __INLINE_CODE_65__ 文件，并将其更新如下所示：

__CODE_BLOCK_13__

我们将 __INLINE_CODE_66__ 应用到 __INLINE_CODE_67__ 路由，以便保护它。

确保应用程序正在运行，然后使用 __INLINE_CODE_68__ 测试路由。

__CODE_BLOCK_14__

请注意，在 __INLINE_CODE_69__ 中，我们将 JWT 配置为具有 __INLINE_CODE_70__ 的过期时间。这是一个太短的过期时间，如果您在身份验证后 60 秒内再次尝试 __INLINE_CODE_71__ 请求，您将收到 __INLINE_CODE_72__ 响应。这是因为 __INLINE_CODE_73__ 自动检查 JWT 的过期时间，省去了您在应用程序中执行该操作的麻烦。

我们现在已经完成了 JWT 身份验证实现。JavaScript 客户端（例如 Angular/React/Vue），和其他 JavaScript 应用程序，可以现在.authenticate 和安全地与我们的 API 服务器通信。

#### 启用身份验证

如果您的大多数端点都应该默认保护，可以将身份验证守卫注册为 __LINK_97__，而不是使用 __INLINE_CODE_74__ 装饰器在每个控制器上。您可以简单地标记哪些路由应该是公共的。

首先，在任何模块中（例如，在 __INLINE_CODE_76__ 中）注册 __INLINE_CODE_75__ 作为全局守卫，使用以下构造：

__CODE_BLOCK_15__

这样，Nest 将自动将 __INLINE_CODE_77__ 绑定到所有端点。

现在，我们需要提供一个机制来声明路由为公共的。为此，我们可以创建一个自定义装饰器，使用 __INLINE_CODE_78__ 装饰器工厂函数。

__CODE_BLOCK_16__

在上面的文件中，我们导出了两个常量。一个是我们的元数据键名 __INLINE_CODE_79__，另一个是我们的新装饰器，它们将被称为 __INLINE_CODE_80__（您可以将其命名为 __INLINE_CODE_81__ 或 __INLINE_CODE_82__， whichever fits your project）。

现在，我们已经有了自定义 __INLINE_CODE_83__ 装饰器，我们可以使用它来装饰任何方法，例如：

__CODE_BLOCK_17__

最后，我们需要 __INLINE_CODE_84__ 返回 __INLINE_CODE_85__ 当找到 __INLINE_CODE_86__ 元数据时。为此，我们将使用 __INLINE_CODE_87__ 类（阅读更多 __LINK_98__）。

__CODE_BLOCK_18__

#### PASSPORT 集成

__LINK_99__ 是 Node.js 身份验证库，社区广泛知晓，已经成功用于许多生产应用程序。使用 __INLINE_CODE_88__ 模块来集成该库到 Nest 应用程序中非常简单。

要了解如何将 Passport 与 NestJS 集成，请查看 __LINK_100__。

#### 示例

您可以在本章 __LINK_101__ 中找到完整的代码。
<!-- 此文件从 content/security/authentication.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:40:45.272Z -->
<!-- 源文件: content/security/authentication.md -->

### 认证

认证是一大部分应用程序中的**必备**部分。存在许多不同的认证方式和策略来处理认证。任何项目的认证方式都取决于其特定的应用需求。这章将介绍一些认证方式，可以根据不同的需求进行适配。

让我们 flesh out our requirements。对于这个用例，客户端将首先使用用户名和密码进行认证。认证后，服务器将颁发一个 JWT，可以在随后的请求中作为 Authorization 头发送，以证明认证。我们还将创建一个受保护的路由，仅对包含有效 JWT 的请求开放。

我们将从第一个要求开始：认证用户。然后，我们将扩展该认证，最后创建一个检查请求中的有效 JWT 的受保护路由。

#### 创建认证模块

我们将从生成一个 __INLINE_CODE_19__ 和在其中生成一个 __INLINE_CODE_20__ 和一个 __INLINE_CODE_21__。我们将使用 __INLINE_CODE_22__ 实现认证逻辑，并使用 __INLINE_CODE_23__ expose 认证端点。

```typescript
export enum Role {
  User = 'user',
  Admin = 'admin',
}

```

在实现 __INLINE_CODE_24__ 时，我们将发现将用户操作封装在一个 `Role` 中是有用的，所以让我们生成该模块和服务：

```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const ROLES_KEY = 'roles';
export const Roles = (...roles) => SetMetadata(ROLES_KEY, roles);

```

将这些生成的文件的默认内容替换为以下内容。对于我们的示例应用程序，`@Roles()` 只是维护一个硬编码的内存列表，包含用户信息，在一个真实的应用程序中，这是 where you'd build your user model 和 persistence layer，使用你的库（例如 TypeORM、Sequelize、Mongoose 等）。

```typescript
@Post()
@Roles(Role.Admin)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

在 `@Roles()` 中，唯一需要添加的是将 `RolesGuard` 添加到 `Reflector` 装饰器的 exports 数组中，以便在外部模块中可见（我们将很快在 `@nestjs/core` 中使用它）。

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

@Injectable()
@Dependencies(Reflector)
export class RolesGuard {
  constructor(reflector) {
    this.reflector = reflector;
  }

  canActivate(context) {
    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}

```

#### 实现“登录”端点

我们的 `Reflector` 负责获取用户并验证密码。我们创建了一个 `request.user` 方法来实现这个目的。在以下代码中，我们使用 ES6 spread 操作符将用户对象中的密码属性去除，返回用户对象。这是在返回用户对象时的一种常见做法，因为你不想 exposeSensitive 字段，如密码或其他安全密钥。

```typescript
class User {
  // ...other properties
  roles: Role[];
}

```

> Warning **警告**当然，在实际应用程序中，你不应该将密码存储在明文中。你应该使用一个库，如 __LINK_92__，使用salted one-way hash 算法。这样，你将只存储哈希密码，然后将存储的密码与 incoming 密码的哈希版本进行比较，从而从不存储或 expose 用户密码。为了使我们的示例应用程序简单，我们违反了这个绝对的要求，使用明文密码。**不要在你的实际应用程序中这样做！**

现在，我们将更新 `roles`，以便导入 `User`。

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
],

```

现在，让我们打开 `RolesGuard`，并添加一个 `@RequirePermissions()` 方法到其中。这方法将被客户端调用，以认证用户。它将接收用户名和密码作为请求体，并将返回一个 JWT 令牌，如果用户认证成功。

```typescript
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}

```

> info **提示**理想情况下，我们应该使用 DTO 类来定义请求体的形状。请查看 __LINK_93__ 章节以获取更多信息。

__HTML_TAG_89____HTML_TAG_90__

#### JWT 令牌

我们已经准备好移动到 JWT 的认证系统中。让我们复习和完善我们的需求：

- 允许用户使用用户名/密码认证，并返回一个 JWT，以便在后续的请求中使用受保护的 API 端点。我们已经很好地满足了这个要求。为了完成它，我们需要编写颁发 JWT 的代码。
- 创建 API 路由，它们受保护基于包含有效 JWT 作为承载令牌的请求

我们需要安装一个额外的包来支持我们的 JWT 需求：

```typescript
@Post()
@RequirePermissions(Permission.CREATE_CAT)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

> info **提示**`Role` 包（查看更多 __LINK_94__）是帮助 JWT 处理的utility 包。这包括生成和验证 JWT 令牌。

为了保持我们的服务顺序模块化，我们将在 `@casl/ability` 中处理生成 JWT 的代码。打开 `accesscontrol` 文件，在 `acl` 文件夹中，inject `User`，并更新 `Article` 方法以生成 JWT令牌，如下所示：

```bash
$ npm i @casl/ability

```Here is the translated text in Chinese:

使用 `User` 库，我们可以生成一个 `id` 函数，从 `isAdmin` 对象的子集属性生成我们的 JWT，然后将其返回为一个简单的对象，其中包含一个名为 `Article` 的属性。注意，我们选择名为 `id` 的属性来存储 `isPublished` 值，以保持与 JWT 标准的一致。

现在，我们需要更新 `authorId`，以便导入新依赖项并配置 `id`。

首先，在 `authorId` 文件夹中创建 `isPublished`,并添加以下代码：

```typescript
class User {
  id: number;
  isAdmin: boolean;
}

```

我们将使用这个密钥来共享我们的密钥，用于签名和验证步骤。

> 警告 **Warning** **请勿公开此密钥**。我们已经在这里公开了密钥，以便大家了解代码的作用，但是在实际生产环境中 **你必须保护这个密钥**，使用适当的措施，例如秘密存储、环境变量或配置服务。

现在，打开 `article.isPublished === true` 文件夹中的 `article.authorId === userId`，并更新其内容如下：

```typescript
class Article {
  id: number;
  isPublished: boolean;
  authorId: number;
}

```

> 提示 **Hint** 我们将 `Action` 注册为全局的，以便使其变得更加简单。这样，我们不需要在应用程序中导入 `manage`。

我们使用 `CaslAbilityFactory` 配置 `CaslModule`，将配置对象作为参数传递。查看 __LINK_95__以了解更多关于 Nest 的 `createForUser()` 和 __LINK_96__以了解可用的配置选项。

现在，让我们使用 cURL Again 运行我们的路由。您可以使用 `Ability` 中硬编码的 `CaslAbilityFactory` 对象来测试。

```typescript
export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

```

#### 实现身份验证守卫

现在，我们可以处理我们的最后一个要求：保护端点，以便在请求中存在有效的 JWT。我们将创建一个 `all`，以便保护我们的路由。

```bash
$ nest g module casl
$ nest g class casl/casl-ability.factory

```

现在，我们可以实现我们的受保护路由，并注册我们的 `MongoAbility`以保护它。

打开 `Ability` 文件，并更新其内容如下：

```typescript
type Subjects = InferSubjects<typeof Article | typeof User> | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

    if (user.isAdmin) {
      can(Action.Manage, 'all'); // read-write access to everything
    } else {
      can(Action.Read, 'all'); // read-only access to everything
    }

    can(Action.Update, Article, { authorId: user.id });
    cannot(Action.Delete, Article, { isPublished: true });

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}

```

我们将应用我们刚刚创建的 `MongoAbility` 到 `AbilityBuilder` 路由，以便保护它。

确保应用程序正在运行，然后使用 `AbilityClass` 测试路由。

```typescript
import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}

```

注意，在 `ExtractSubjectType` 中，我们将 JWT 设置为过期时间 `@casl/ability`。这个过期时间太短了，我们将在本文中跳过处理 token 过期和刷新的细节。但是，我们选择了这个过期时间，以便展示 JWT 的一个重要特性。如果您在身份验证后等待 60 秒，然后尝试进行 `detectSubjectType` 请求，您将收到一个 `MongoAbility` 的响应。这是因为 `AbilityBuilder` 自动检查 JWT 的过期时间，从而省去了在应用程序中执行的麻烦。

我们现在已经完成了 JWT 身份验证的实现。JavaScript 客户端（例如 Angular/React/Vue）和其他 JavaScript 应用程序现在可以安全地与我们的 API 服务器通信。

#### 全局启用身份验证

如果您的大多数端点都应该默认被保护，可以将身份验证守卫注册为 __LINK_97__，而不是在每个控制器上使用 `can` 装饰器。相反，您可以简单地标记哪些路由应该是公共的。

首先，在 `can` 模块中注册 `cannot`，如下所示：

```typescript
constructor(private caslAbilityFactory: CaslAbilityFactory) {}

```

现在，Nest 将自动将 `cannot` 绑定到所有端点上。

现在，我们需要提供一个机制来声明路由作为公共的。为此，我们可以使用 `CaslAbilityFactory` 装饰器工厂函数创建一个自定义装饰器。

```typescript
const ability = this.caslAbilityFactory.createForUser(user);
if (ability.can(Action.Read, 'all')) {
  // "user" has read access to everything
}

```

在上面的文件中，我们导出了两个常量。一个是我们的元数据键名 `providers`，另一个是我们的新装饰器 `exports`（您可以将其命名为 `CaslModule` 或 `CaslAbilityFactory`，以适合项目）。

现在，我们已经创建了自定义 `CaslModule` 装饰器，可以使用它来装饰任何方法，例如：

```typescript
const user = new User();
user.isAdmin = false;

const ability = this.caslAbilityFactory.createForUser(user);
ability.can(Action.Read, Article); // true
ability.can(Action.Delete, Article); // false
ability.can(Action.Create, Article); // false

```

最后，我们需要在 `MongoAbility` 中返回 `MongoAbility`，当 `AbilityBuilder` 元数据被找到时。为此，我们将使用 `can` 类（阅读更多 __LINK_98__）。

```typescript
const user = new User();
user.id = 1;

const article = new Article();
article.authorId = user.id;

const ability = this.caslAbilityFactory.createForUser(user);
ability.can(Action.Update, article); // true

article.authorId = 2;
ability.can(Action.Update, article); // false

```

#### Passports 集成

__LINK_99__ 是 Node.js 身份验证库，社区广泛使用，在许多生产环境中成功使用。使用 `cannot` 模块，可以轻松地将这个库与 Nest 应用程序集成。

要了解如何将 Passport 与 NestJS 集成，请查看 __LINK_100__。

#### 示例

您可以在本章中找到完整的代码 __LINK_101__。
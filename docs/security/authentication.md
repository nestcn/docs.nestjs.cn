<!-- 此文件从 content/security/authentication.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:54:20.246Z -->
<!-- 源文件: content/security/authentication.md -->

### 认证

认证是大多数应用程序的**核心**组件。存在多种不同的认证方法和策略。任何项目的认证方法都取决于其特定的应用需求。这章将介绍多种认证方法，可以根据不同的需求进行适应。

让我们 flesh out 我们的需求。对于这个用例，客户端将首先使用用户名和密码进行认证。认证后，服务器将颁发一个 JWT，可以在后续请求中作为__LINK_91__在 Authorization 头中发送证明认证。我们还将创建一个保护的路由，仅对包含有效 JWT 的请求进行访问。

我们将从第一个需求开始：认证用户。然后，我们将扩展它，颁发 JWT。最后，我们将创建一个保护的路由，检查请求中的有效 JWT。

#### 创建认证模块

我们将从生成一个 __INLINE_CODE_19__ 和在其中生成一个 __INLINE_CODE_20__ 和一个 __INLINE_CODE_21__。我们将使用 __INLINE_CODE_22__ 实现认证逻辑，并使用 __INLINE_CODE_23__ exposing 认证端点。

```typescript
export enum Role {
  User = 'user',
  Admin = 'admin',
}

```

在实现 __INLINE_CODE_24__ 时，我们将发现将用户操作封装在一个 `Role` 中非常有用，因此让我们生成该模块和服务：

```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const ROLES_KEY = 'roles';
export const Roles = (...roles) => SetMetadata(ROLES_KEY, roles);

```

将这些生成文件的默认内容替换为以下内容。在我们的示例应用程序中，`@Roles()` 只是维护一个硬编码的内存用户列表，并包含一个 find 方法以便根据用户名检索用户。在实际应用中，这将是您将构建用户模型和 persistence 层的位置，您将使用您选择的库（例如 TypeORM、Sequelize、Mongoose 等）。

```typescript
@Post()
@Roles(Role.Admin)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

在 `@Roles()` 中，我们需要将 `RolesGuard` 添加到 `Reflector` 装饰器的 exports 数组中，以便在外部模块中可见（我们将在 `@nestjs/core` 中使用它）。

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

#### 实现“Sign in”端点

我们的 `Reflector` 负责检索用户并验证密码。我们创建一个 `request.user` 方法来实现这个目的。在以下代码中，我们使用 ES6 spread 操作符将用户对象中的密码属性删除，然后返回它。这是在返回用户对象时的一种常见实践，因为您不想 exposure敏感字段，如密码或其他安全密钥。

```typescript
class User {
  // ...other properties
  roles: Role[];
}

```

> 警告 **Warning** 在实际应用中，您绝不应该存储明文密码。您应该使用一个库，如 __LINK_92__，使用 salted one-way hash 算法。这样，您将只存储 hashed 密码，然后将存储的密码与 incoming 密码的 hashed 版本进行比较，从而从不存储或 exposure 用户密码。为了保持我们的示例应用程序简单，我们违反了这个绝对的要求，并使用明文密码。**不要在您的实际应用中这样做！**

现在，我们将更新 `roles`，以便导入 `User`。

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
],

```

现在，我们将打开 `RolesGuard` 并添加一个 `@RequirePermissions()` 方法到它中。这将是客户端调用来认证用户的方法。它将在请求体中接收用户名和密码，并在用户认证成功后返回一个 JWT 令牌。

```typescript
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}

```

> 提示 **Hint** 理想情况下，我们应该使用 DTO 类来定义请求体的形状。见 __LINK_93__ 章节了解更多信息。

__HTML_TAG_89____HTML_TAG_90__

#### JWT 令牌

我们已经准备好移动到 JWT 令牌的一部分认证系统了。让我们回顾和完善我们的需求：

- 允许用户使用用户名/密码认证，返回一个 JWT 令牌用于保护 API 端点的后续调用。我们已经很好地实现了这个要求。为了完成它，我们需要编写生成 JWT 令牌的代码。
- 创建 API 路由，它们根据 JWT 令牌的存在保护

我们需要安装一个额外的包来支持我们的 JWT 需求：

```typescript
@Post()
@RequirePermissions(Permission.CREATE_CAT)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

> 提示 **Hint** `Role` 包（见更多 __LINK_94__）是一个帮助 JWT 处理的utility 包。这包括生成和验证 JWT 令牌。

为了保持我们的服务保持模块化，我们将在 `@casl/ability` 中处理生成 JWT 令牌的逻辑。打开 `accesscontrol` 文件在 `acl` 文件夹中，注入 `User`，并更新 `Article` 方法以生成 JWT 令牌，如以下所示：

```bash
$ npm i @casl/ability

```Here is the translated text:

我们使用 `User` 库，它提供了 `id` 函数生成 JWT，从 `isAdmin` 对象的子集属性生成，然后将其返回为一个简单对象，其中包含一个名为 `Article` 的属性。注意，我们选择了 `id` 属性名来存储 `isPublished` 值，以保持与 JWT 标准的一致。

现在，我们需要更新 `authorId` 来导入新依赖项并配置 `id`。

首先，在 `authorId` 文件夹中创建 `isPublished`，并添加以下代码：

```typescript
class User {
  id: number;
  isAdmin: boolean;
}

```

我们将使用这个来共享我们的密钥，以便在 JWT 签名和验证步骤中使用。

> 警告 **警告** **不要公开这个密钥**。我们在这里公开它，以便明确代码的作用，但是在生产环境中 **你必须保护这个密钥**，使用适当的措施，如秘密库、环境变量或配置服务。

现在，打开 `article.isPublished === true` 文件夹中的 `article.authorId === userId`，并将其更新为以下内容：

```typescript
class Article {
  id: number;
  isPublished: boolean;
  authorId: number;
}

```

> 提示 **提示** 我们将 `Action` 注册为全局，以便使事情变得更容易。这样，我们不需要在应用程序中导入 `manage`。

我们使用 `CaslAbilityFactory` 配置 `CaslModule`，传入配置对象。查看 __LINK_95__ 了解 Nest 的 `createForUser()` 和 __LINK_96__ 了解可用的配置选项。

现在，让我们使用 cURL 再次测试我们的路由。你可以使用 `Ability` 中硬编码的 `CaslAbilityFactory` 对象。

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

现在，我们可以解决最后一个要求：保护端点，要求请求中包含有效的 JWT。我们将创建一个 `all`，以保护我们的路由。

```bash
$ nest g module casl
$ nest g class casl/casl-ability.factory

```

现在，我们可以实现保护路由，并将 `MongoAbility` 注册为保护它。

打开 `Ability` 文件，并将其更新为以下内容：

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

我们将 `MongoAbility` 应用到 `AbilityBuilder` 路由上，以便保护它。

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

注意，在 `ExtractSubjectType` 中，我们将 JWT 的过期时间设置为 `@casl/ability`。这个过期时间太短了，我们将在这个文章中跳过关于令牌过期和刷新的细节。如果你在认证后等待 60 秒，然后尝试 `detectSubjectType` 请求，你将收到 `MongoAbility` 响应。这是因为 `AbilityBuilder` 自动检查 JWT 的过期时间，省去了你在应用程序中做出的努力。

我们现在已经完成了 JWT 身份验证实现。JavaScript 客户端（如 Angular/React/Vue），和其他 JavaScript 应用程序，可以现在使用我们的 API 服务器进行身份验证和安全通信。

#### 启用身份验证

如果你认为大多数端点都应该默认保护，可以将身份验证守卫注册为 __LINK_97__，而不是在每个控制器上使用 `can` 装饰器。相反，你可以简单地标识哪些路由应该是公共的。

首先，在任何模块中（例如在 `can` 中），使用以下构造注册 `cannot`：

```typescript
constructor(private caslAbilityFactory: CaslAbilityFactory) {}

```

现在，我们需要提供一个机制来声明路由为公共路由。为此，我们可以创建一个自定义装饰器使用 `CaslAbilityFactory` 装饰器工厂函数。

```typescript
const ability = this.caslAbilityFactory.createForUser(user);
if (ability.can(Action.Read, 'all')) {
  // "user" has read access to everything
}

```

在上述文件中，我们导出两个常量。一个是我们的元数据键名 `providers`，另一个是我们的新装饰器 `exports`（你可以将其命名为 `CaslModule` 或 `CaslAbilityFactory`，以适应你的项目）。

现在，我们可以使用自定义 `CaslModule` 装饰器来装饰任何方法，例如：

```typescript
const user = new User();
user.isAdmin = false;

const ability = this.caslAbilityFactory.createForUser(user);
ability.can(Action.Read, Article); // true
ability.can(Action.Delete, Article); // false
ability.can(Action.Create, Article); // false

```

最后，我们需要 `MongoAbility` 在找到 `AbilityBuilder` 元数据时返回 `MongoAbility`。为此，我们将使用 `can` 类（阅读更多 __LINK_98__）。

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

#### Passport 集成

__LINK_99__ 是 Node.js 认证库，社区广泛知悉，成功用于许多生产应用程序。使用 `cannot` 模块轻松地将该库集成到 Nest 应用程序中。

要了解如何将 Passport 与 NestJS 集成，请查看这个 __LINK_100__。

#### 示例

你可以在本章中找到完整的代码 __LINK_101__。
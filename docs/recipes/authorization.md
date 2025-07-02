### 授权

**授权**是指确定用户可执行操作的过程。例如，管理员用户被允许创建、编辑和删除帖子，而非管理员用户仅被授权阅读帖子。

授权与认证是正交且独立的两个概念，但授权需要依赖认证机制。

处理授权有许多不同的方法和策略。具体项目采用的方法取决于其特定的应用需求。本章将介绍几种授权方法，这些方法可适应各种不同的需求。

#### 基础 RBAC 实现

基于角色的访问控制（**RBAC**）是一种围绕角色和权限定义的政策中立访问控制机制。本节我们将演示如何使用 Nest [守卫](/guards)实现一个非常基础的 RBAC 机制。

首先，创建一个表示系统角色的 `Role` 枚举：

```typescript title="role.enum"
export enum Role {
  User = 'user',
  Admin = 'admin',
}
```

> info **提示** 在更复杂的系统中，您可以将角色存储在数据库中，或从外部认证提供程序获取。

有了这些基础，我们就可以创建一个 `@Roles()` 装饰器。该装饰器允许指定访问特定资源所需的角色。

```typescript title="roles.decorator"
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

现在我们有了自定义的 `@Roles()` 装饰器，可以用它来装饰任何路由处理器。

```typescript title="cats.controller"
@Post()
@Roles(Role.Admin)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

最后，我们创建一个 `RolesGuard` 类，它将比较当前用户分配的角色与正在处理的路由实际所需的角色。为了访问路由的角色（自定义元数据），我们将使用框架内置并通过 `@nestjs/core` 包提供的 `Reflector` 辅助类。

```typescript title="roles.guard"
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
```

> info **提示** 有关如何在上下文敏感的方式中使用 `Reflector` 的更多细节，请参考执行上下文章节中的[反射与元数据](/fundamentals/execution-context#反射与元数据)部分。

> warning **注意** 此示例命名为"**basic**"，因为我们仅在路由处理程序层级检查角色存在性。在实际应用中，您可能会遇到包含多个操作的端点/处理器，其中每个操作都需要特定的权限集合。这种情况下，您必须在业务逻辑中的某处提供角色检查机制，这使得维护变得稍显困难，因为将没有集中化的地方来关联权限与特定操作。

在本示例中，我们假设 `request.user` 包含用户实例和允许的角色（位于 `roles` 属性下）。在您的应用中，您可能会在自定义的**认证守卫**中进行这种关联 - 更多详情请参阅[认证](/security/authentication)章节。

为确保此示例正常工作，您的 `User` 类必须如下所示：

```typescript
class User {
  // ...other properties
  roles: Role[];
}
```

最后，请确保注册 `RolesGuard`，例如在控制器层级或全局范围内：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
],
```

当权限不足的用户请求端点时，Nest 会自动返回以下响应：

```typescript
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

> info **提示** 如需返回不同的错误响应，应抛出特定异常而非返回布尔值。

#### 基于声明的授权

身份创建时可能会被分配一个或多个由受信任方颁发的声明。声明是表示主体能做什么（而非主体是什么）的名称-值对。

要在 Nest 中实现基于声明的授权，可遵循前述 [RBAC 章节的相同步骤，但存在一个关键差异：不应检查特定角色，而应比较**权限** 。每个用户都会被分配一组权限。同样，每个资源/端点需定义访问所需的权限（例如通过专用的 `@RequirePermissions()` 装饰器）。](/security/authorization#基本-rbac-实现)

```typescript title="cats.controller"
@Post()
@RequirePermissions(Permission.CREATE_CAT)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

> info **提示** 在上例中，`Permission`（类似于我们在 RBAC 章节展示的 `Role`）是一个 TypeScript 枚举，包含系统中所有可用的权限。

#### 集成 CASL

[CASL](https://casl.js.org/) 是一个同构授权库，用于限制给定客户端可访问的资源。它设计为可渐进式采用，能够轻松在基于简单声明和完全基于主体及属性的授权之间扩展。

首先安装 `@casl/ability` 包：

```bash
$ npm i @casl/ability
```

> info **提示** 在本示例中，我们选择了 CASL，但您可以根据个人偏好和项目需求使用其他库，例如 `accesscontrol` 或 `acl`。

安装完成后，为了演示 CASL 的机制，我们将定义两个实体类：`User` 和 `Article`。

```typescript
class User {
  id: number;
  isAdmin: boolean;
}
```

`User` 类包含两个属性：唯一用户标识符 `id`，以及表示用户是否具有管理员权限的 `isAdmin`。

```typescript
class Article {
  id: number;
  isPublished: boolean;
  authorId: number;
}
```

`Article` 类具有三个属性：分别是 `id`、`isPublished` 和 `authorId`。`id` 是文章的唯一标识符，`isPublished` 表示文章是否已发布，而 `authorId` 则是文章作者的 ID。

现在让我们回顾并完善这个示例的需求：

- 管理员可以管理（创建/读取/更新/删除）所有实体
- 用户对所有内容拥有只读权限
- 用户可以更新自己的文章（`article.authorId === userId`）
- 已发布的文章无法被删除（`article.isPublished === true`）

考虑到这一点，我们可以先创建一个 `Action` 枚举，用来表示用户可以对实体执行的所有操作：

```typescript
export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}
```

> warning **注意** `manage` 是 CASL 中的一个特殊关键字，表示"任何"操作。

为了封装 CASL 库，现在让我们生成 `CaslModule` 和 `CaslAbilityFactory`。

```bash
$ nest g module casl
$ nest g class casl/casl-ability.factory
```

在此基础上，我们可以在 `CaslAbilityFactory` 上定义 `createForUser()` 方法。该方法将为指定用户创建 `Ability` 对象：

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

> warning **注意** `all` 是 CASL 中的一个特殊关键字，表示"任意主体"。

> info **说明** 从 CASL v6 开始，`MongoAbility` 作为默认的能力类，取代了旧版的 `Ability`，以更好地支持使用类 MongoDB 语法的基于条件的权限。尽管名称如此，它并不局限于 MongoDB——通过与采用类 Mongo 语法编写的条件进行对象比较，它可以适用于任何类型的数据。

> info **说明** `MongoAbility`、`AbilityBuilder`、`AbilityClass` 和 `ExtractSubjectType` 类都是从 `@casl/ability` 包中导出的。

> info **提示** `detectSubjectType` 选项让 CASL 能够理解如何从对象中获取主体类型。更多详情请参阅 [CASL 文档](https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types) 。

在上面的示例中，我们使用 `AbilityBuilder` 类创建了 `MongoAbility` 实例。如您所料，`can` 和 `cannot` 接受相同的参数但含义不同：`can` 允许对指定主体执行操作，而 `cannot` 则禁止。两者最多可接受 4 个参数。要了解这些函数的更多信息，请访问官方 [CASL 文档](https://casl.js.org/v6/en/guide/intro) 。

最后，请确保将 `CaslAbilityFactory` 添加到 `CaslModule` 模块定义的 `providers` 和 `exports` 数组中：

```typescript
import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
```

完成这些设置后，只要在宿主上下文中导入了 `CaslModule`，我们就可以使用标准构造函数注入方式将 `CaslAbilityFactory` 注入到任何类中：

```typescript
constructor(private caslAbilityFactory: CaslAbilityFactory) {}
```

然后在类中按如下方式使用它。

```typescript
const ability = this.caslAbilityFactory.createForUser(user);
if (ability.can(Action.Read, 'all')) {
  // "user" has read access to everything
}
```

> info **提示** 在官方 [CASL 文档](https://casl.js.org/v6/en/guide/intro) 中了解更多关于 `MongoAbility` 类的信息。

例如，假设我们有一个非管理员的用户。在这种情况下，该用户应该能够阅读文章，但创建新文章或删除现有文章的操作应被禁止。

```typescript
const user = new User();
user.isAdmin = false;

const ability = this.caslAbilityFactory.createForUser(user);
ability.can(Action.Read, Article); // true
ability.can(Action.Delete, Article); // false
ability.can(Action.Create, Article); // false
```

> info **提示** 尽管 `MongoAbility` 和 `AbilityBuilder` 类都提供了 `can` 和 `cannot` 方法，但它们有不同的用途且接受的参数略有不同。

此外，正如我们在需求中明确指出的，用户应当能够更新其文章：

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

如您所见，`MongoAbility` 实例让我们能以相当可读的方式检查权限。同样地，`AbilityBuilder` 也允许我们以类似方式定义权限（并指定各种条件）。更多示例请参阅官方文档。

#### 进阶：实现 `PoliciesGuard`

本节将演示如何构建一个更为复杂的守卫，用于检查用户是否符合可在方法级别配置的特定**授权策略** （您也可以扩展它以支持类级别配置的策略）。本示例仅出于说明目的使用 CASL 包，但并非必须使用该库。同时，我们将使用先前章节创建的 `CaslAbilityFactory` 提供者。

首先，让我们明确需求。目标是提供一种机制，允许为每个路由处理程序指定策略检查。我们将同时支持对象和函数（适用于简单检查及偏好函数式代码风格的开发者）。

让我们从定义策略处理程序的接口开始：

```typescript
import { AppAbility } from '../casl/casl-ability.factory';

interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;
```

如前所述，我们提供了两种定义策略处理程序的方式：对象（实现 `IPolicyHandler` 接口的类实例）和函数（符合 `PolicyHandlerCallback` 类型）。

基于此，我们可以创建 `@CheckPolicies()` 装饰器。该装饰器允许指定访问特定资源必须满足的策略。

```typescript
export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
```

现在让我们创建一个 `PoliciesGuard`，它将提取并执行所有绑定到路由处理程序的策略处理器。

```typescript
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler()
      ) || [];

    const { user } = context.switchToHttp().getRequest();
    const ability = this.caslAbilityFactory.createForUser(user);

    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability)
    );
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
```

> **提示** 在本示例中，我们假设 `request.user` 包含用户实例。在实际应用中，您可能会在自定义的**认证守卫**中进行这种关联 - 更多细节请参阅[认证](/security/authentication)章节。

让我们分解这个示例。`policyHandlers` 是通过 `@CheckPolicies()` 装饰器分配给该方法的处理器数组。接着，我们使用 `CaslAbilityFactory#create` 方法构建 `Ability` 对象，该对象允许我们验证用户是否具有执行特定操作的足够权限。我们将此对象传递给策略处理器，该处理器可以是一个函数，也可以是实现了 `IPolicyHandler` 接口的类实例，它会暴露返回布尔值的 `handle()` 方法。最后，我们使用 `Array#every` 方法来确保每个处理器都返回了 `true` 值。

最后，要测试这个守卫，将其绑定到任意路由处理器，并注册一个内联策略处理器（函数式方法），如下所示：

```typescript
@Get()
@UseGuards(PoliciesGuard)
@CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Article))
findAll() {
  return this.articlesService.findAll();
}
```

或者，我们可以定义一个实现 `IPolicyHandler` 接口的类：

```typescript
export class ReadArticlePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, Article);
  }
}
```

并按如下方式使用：

```typescript
@Get()
@UseGuards(PoliciesGuard)
@CheckPolicies(new ReadArticlePolicyHandler())
findAll() {
  return this.articlesService.findAll();
}
```

> warning **注意** 由于我们必须使用 `new` 关键字就地实例化策略处理器，`ReadArticlePolicyHandler` 类无法使用依赖注入。这可以通过 `ModuleRef#get` 方法解决（详见 [此处](/fundamentals/module-ref) ）。本质上，不是通过 `@CheckPolicies()` 装饰器注册函数和实例，而是需要允许传递 `Type<IPolicyHandler>`。然后在守卫内部，可以通过类型引用获取实例： `moduleRef.get(YOUR_HANDLER_TYPE)` 或者甚至使用 `ModuleRef#create` 方法动态实例化它。

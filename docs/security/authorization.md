<!-- 此文件从 content/security\authorization.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T07:09:52.808Z -->
<!-- 源文件: content/security\authorization.md -->

### 授权

**授权** 是指确定用户能够做什么的过程。例如，管理员用户可以创建、编辑和删除帖子。非管理员用户只能阅读帖子。

授权与认证是正交且独立的。然而，授权需要认证机制。

有许多不同的方法和策略来处理授权。任何项目采取的方法取决于其特定的应用要求。本章介绍了几种可适应各种不同要求的授权方法。

#### 基本 RBAC 实现

基于角色的访问控制（**RBAC**）是一种围绕角色和权限定义的与策略无关的访问控制机制。在本节中，我们将演示如何使用 Nest [守卫](/guards) 实现一个非常基本的 RBAC 机制。

首先，让我们创建一个 `Role` 枚举，表示系统中的角色：

```typescript
export enum Role {
  User = 'user',
  Admin = 'admin',
}

```

> 提示 **提示** 在更复杂的系统中，您可能会将角色存储在数据库中，或从外部认证提供者获取它们。

有了这个，我们可以创建一个 `@Roles()` 装饰器。这个装饰器允许指定访问特定资源所需的角色。

```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

```

现在我们有了自定义的 `@Roles()` 装饰器，我们可以用它来装饰任何路由处理程序。

```typescript
@Post()
@Roles(Role.Admin)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

最后，我们创建一个 `RolesGuard` 类，它将比较分配给当前用户的角色与当前正在处理的路由所需的实际角色。为了访问路由的角色（自定义元数据），我们将使用 `Reflector` 辅助类，该类由框架开箱即用，并从 `@nestjs/core` 包中暴露。

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './role.enum';

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

> 提示 **提示** 有关在上下文敏感方式中使用 `Reflector` 的更多详细信息，请参阅执行上下文章节的 [反射和元数据](/fundamentals/execution-context#reflection-and-metadata) 部分。

> 警告 **注意** 此示例被命名为“**基本**”，因为我们只检查路由处理程序级别上的角色存在。在实际应用中，您可能有涉及多个操作的端点/处理程序，其中每个操作都需要特定的权限集。在这种情况下，您必须在业务逻辑中提供一种检查角色的机制，这使得维护变得更加困难，因为没有集中的地方将权限与特定操作相关联。

在这个例子中，我们假设 `request.user` 包含用户实例和允许的角色（在 `roles` 属性下）。在您的应用程序中，您可能会在自定义的 **认证守卫** 中建立这种关联 - 有关更多详细信息，请参阅 [认证](/security/authentication) 章节。

为了确保这个示例有效，您的 `User` 类必须如下所示：

```typescript
class User {
  // ...其他属性
  roles: Role[];
}

```

最后，确保注册 `RolesGuard`，例如，在控制器级别或全局级别：

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

> 提示 **提示** 如果您想返回不同的错误响应，您应该抛出自己的特定异常，而不是返回布尔值。

<app-banner-courses-auth></app-banner-courses-auth>

#### 基于声明的授权

当创建身份时，它可能被分配一个或多个由受信任方颁发的声明。声明是一个名称-值对，表示主体可以做什么，而不是主体是什么。

要在 Nest 中实现基于声明的授权，您可以按照我们在 [RBAC](/security/authorization#基本-rbac-实现) 部分中显示的相同步骤，有一个显著的区别： instead of checking for specific roles, you should compare **permissions**. 每个用户都会被分配一组权限。同样，每个资源/端点都会定义访问它们所需的权限（例如，通过专用的 `@RequirePermissions()` 装饰器）。

```typescript
@Post()
@RequirePermissions(Permission.CREATE_CAT)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

> 提示 **提示** 在上面的示例中，`Permission`（类似于我们在 RBAC 部分中显示的 `Role`）是一个 TypeScript 枚举，包含系统中可用的所有权限。

#### 集成 CASL

[CASL](https://casl.js.org/) 是一个同构授权库，它限制给定客户端可以访问的资源。它设计为可增量采用，并且可以轻松地在简单的基于声明和全功能的基于主题和属性的授权之间扩展。

首先，安装 `@casl/ability` 包：

```bash
$ npm i @casl/ability

```

> 提示 **提示** 在这个例子中，我们选择了 CASL，但您可以根据您的偏好和项目需求使用任何其他库，如 `accesscontrol` 或 `acl`。

安装完成后，为了说明 CASL 的机制，我们将定义两个实体类：`User` 和 `Article`。

```typescript
class User {
  id: number;
  isAdmin: boolean;
}

```

`User` 类由两个属性组成，`id` 是唯一的用户标识符，`isAdmin` 表示用户是否具有管理员权限。

```typescript
class Article {
  id: number;
  isPublished: boolean;
  authorId: number;
}

```

`Article` 类有三个属性，分别是 `id`、`isPublished` 和 `authorId`。`id` 是唯一的文章标识符，`isPublished` 表示文章是否已经发布，`authorId` 是撰写文章的用户的 ID。

现在让我们审查并完善这个示例的要求：

- 管理员可以管理（创建/读取/更新/删除）所有实体
- 用户对所有内容有只读访问权限
- 用户可以更新他们的文章 (`article.authorId === userId`)
- 已经发布的文章不能被删除 (`article.isPublished === true`)

考虑到这一点，我们可以开始创建一个 `Action` 枚举，表示用户可以对实体执行的所有可能的操作：

```typescript
export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

```

> 警告 **注意** `manage` 是 CASL 中的一个特殊关键字，代表“任何操作”。

为了封装 CASL 库，让我们现在生成 `CaslModule` 和 `CaslAbilityFactory`。

```bash
$ nest g module casl
$ nest g class casl/casl-ability.factory

```

有了这个，我们可以在 `CaslAbilityFactory` 上定义 `createForUser()` 方法。此方法将为给定用户创建 `Ability` 对象：

```typescript
import { Injectable } from '@nestjs/common';
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';
import { Action } from './action.enum';
import { Article } from '../article/article.entity';
import { User } from '../user/user.entity';

type Subjects = InferSubjects<typeof Article | typeof User> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<Ability<[Action, Subjects]>>(Ability as AbilityClass<AppAbility>);

    if (user.isAdmin) {
      can(Action.Manage, 'all'); // 对所有内容的读写访问
    } else {
      can(Action.Read, 'all'); // 对所有内容的只读访问
    }

    can(Action.Update, Article, { authorId: user.id });
    cannot(Action.Delete, Article, { isPublished: true });

    return build({
      // 阅读 https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types 了解详情
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}

```

> 警告 **注意** `all` 是 CASL 中的一个特殊关键字，代表“任何主题”。

> 提示 **提示** 从 CASL v6 开始，`MongoAbility` 作为默认能力类，取代了旧的 `Ability`，以更好地支持使用 MongoDB 风格语法的基于条件的权限。尽管名称如此，它并不绑定到 MongoDB — 它通过简单地比较对象与用 Mongo 风格语法编写的条件来处理任何类型的数据。

> 提示 **提示** `MongoAbility`、`AbilityBuilder`、`AbilityClass` 和 `ExtractSubjectType` 类从 `@casl/ability` 包中导出。

> 提示 **提示** `detectSubjectType` 选项让 CASL 了解如何从对象中获取主题类型。有关更多信息，请阅读 [CASL 文档](https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types) 了解详情。

在上面的示例中，我们使用 `AbilityBuilder` 类创建了 `Ability` 实例。正如您可能猜测的那样，`can` 和 `cannot` 接受相同的参数但具有不同的含义，`can` 允许对指定的主题执行操作，而 `cannot` 禁止。两者最多可以接受 4 个参数。要了解有关这些函数的更多信息，请访问官方 [CASL 文档](https://casl.js.org/v6/en/guide/intro)。

最后，确保在 `CaslModule` 模块定义的 `providers` 和 `exports` 数组中添加 `CaslAbilityFactory`：

```typescript
import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}

```

有了这个，我们可以使用标准的构造函数注入将 `CaslAbilityFactory` 注入到任何类中，只要在宿主上下文中导入了 `CaslModule`：

```typescript
constructor(private caslAbilityFactory: CaslAbilityFactory) {}

```

然后在类中如下使用它：

```typescript
const ability = this.caslAbilityFactory.createForUser(user);
if (ability.can(Action.Read, 'all')) {
  // "user" 对所有内容有读取权限
}

```

> 提示 **提示** 在官方 [CASL 文档](https://casl.js.org/v6/en/guide/intro) 中了解有关 `MongoAbility` 类的更多信息。

例如，假设我们有一个不是管理员的用户。在这种情况下，用户应该能够阅读文章，但创建新文章或删除现有文章应该被禁止。

```typescript
const user = new User();
user.isAdmin = false;

const ability = this.caslAbilityFactory.createForUser(user);
ability.can(Action.Read, Article); // true
ability.can(Action.Delete, Article); // false
ability.can(Action.Create, Article); // false

```

> 提示 **提示** 尽管 `MongoAbility` 和 `AbilityBuilder` 类都提供 `can` 和 `cannot` 方法，但它们有不同的目的并接受略微不同的参数。

此外，正如我们在要求中指定的那样，用户应该能够更新其文章：

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

如您所见，`MongoAbility` 实例允许我们以非常可读的方式检查权限。同样，`AbilityBuilder` 允许我们以类似的方式定义权限（并指定各种条件）。要查找更多示例，请访问官方文档。

#### 高级：实现 `PoliciesGuard`

在本节中，我们将演示如何构建一个更复杂的守卫，该守卫检查用户是否满足可以在方法级别配置的特定 **授权策略**（您也可以扩展它以尊重在类级别配置的策略）。在这个例子中，我们将使用 CASL 包只是为了说明目的，但使用这个库不是必需的。我们还将使用我们在前面部分中创建的 `CaslAbilityFactory` 提供者。

首先，让我们详细说明需求。目标是提供一种机制，允许为每个路由处理程序指定策略检查。我们将支持对象和函数（用于更简单的检查和那些喜欢更函数式风格代码的人）。

让我们首先定义策略处理程序的接口：

```typescript
import { AppAbility } from '../casl/casl-ability.factory';

interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;

```

如上所述，我们提供了两种定义策略处理程序的可能方式，一个对象（实现 `IPolicyHandler` 接口的类的实例）和一个函数（符合 `PolicyHandlerCallback` 类型）。

有了这个，我们可以创建一个 `@CheckPolicies()` 装饰器。这个装饰器允许指定访问特定资源必须满足的策略。

```typescript
import { SetMetadata } from '@nestjs/common';
import { PolicyHandler } from './policy-handler.interface';

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);

```

现在让我们创建一个 `PoliciesGuard`，它将提取并执行绑定到路由处理程序的所有策略处理程序。

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_POLICIES_KEY } from './check-policies.decorator';
import { PolicyHandler } from './policy-handler.interface';
import { CaslAbilityFactory } from './casl/casl-ability.factory';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const { user } = context.switchToHttp().getRequest();
    const ability = this.caslAbilityFactory.createForUser(user);

    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
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

> 提示 **提示** 在这个例子中，我们假设 `request.user` 包含用户实例。在您的应用程序中，您可能会在自定义的 **认证守卫** 中建立这种关联 - 有关更多详细信息，请参阅 [认证](/security/authentication) 章节。

让我们分解这个例子。`policyHandlers` 是通过 `@CheckPolicies()` 装饰器分配给方法的处理程序数组。接下来，我们使用 `CaslAbilityFactory#create` 方法构建 `Ability` 对象，允许我们验证用户是否有足够的权限执行特定操作。我们将此对象传递给策略处理程序，该处理程序要么是一个函数，要么是实现 `IPolicyHandler` 的类的实例，暴露返回布尔值的 `handle()` 方法。最后，我们使用 `Array#every` 方法确保每个处理程序都返回 `true` 值。

最后，要测试这个守卫，将其绑定到任何路由处理程序，并注册一个内联策略处理程序（函数方法），如下所示：

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
import { IPolicyHandler } from '../authorization/policy-handler.interface';
import { AppAbility } from '../casl/casl-ability.factory';
import { Action } from '../casl/action.enum';
import { Article } from './article.entity';

export class ReadArticlePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, Article);
  }
}

```

并如下使用它：

```typescript
@Get()
@UseGuards(PoliciesGuard)
@CheckPolicies(new ReadArticlePolicyHandler())
findAll() {
  return this.articlesService.findAll();
}

```

> 警告 **注意** 由于我们必须使用 `new` 关键字在原地实例化策略处理程序，`ReadArticlePolicyHandler` 类不能使用依赖注入。这可以通过 `ModuleRef#get` 方法解决（更多信息请 [点击这里](/fundamentals/module-reference)）。基本上，不是通过 `@CheckPolicies()` 装饰器注册函数和实例，而是必须允许传递 `Type<IPolicyHandler>`。然后，在守卫内部，您可以使用类型引用检索实例：`moduleRef.get(YOUR_HANDLER_TYPE)` 或甚至使用 `ModuleRef#create` 方法动态实例化它。
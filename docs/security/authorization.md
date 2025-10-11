### 授权

**授权**指的是确定用户能够做什么的过程。例如，管理员用户被允许创建、编辑和删除帖子。非管理员用户只被授权阅读帖子。

授权与认证是正交和独立的。但是，授权需要一个认证机制。

有许多不同的方法和策略来处理授权。任何项目采用的方法都取决于其特定的应用程序要求。本章介绍了几种可以适应各种不同要求的授权方法。

#### 基本 RBAC 实现

基于角色的访问控制（**RBAC**）是一种围绕角色和权限定义的策略无关的访问控制机制。在本节中，我们将演示如何使用 Nest [守卫](../guards)实现一个非常基本的 RBAC 机制。

首先，让我们创建一个 `Role` 枚举来表示系统中的角色：

 ```typescript title="role.enum.ts"
export enum Role {
  User = 'user',
  Admin = 'admin',
}
```

:::info 提示
在更复杂的系统中，您可能会将角色存储在数据库中，或从外部认证提供商中获取它们。
:::



有了这个，我们可以创建一个 `@Roles()` 装饰器。此装饰器允许指定访问特定资源所需的角色。

 ```typescript title="roles.decorator.ts"
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

现在我们有了一个自定义的 `@Roles()` 装饰器，我们可以使用它来装饰任何路由处理程序。

 ```typescript title="cats.controller.ts"
@Post()
@Roles(Role.Admin)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

最后，我们创建一个 `RolesGuard` 类，它将比较分配给当前用户的角色与当前正在处理的路由实际需要的角色。为了访问路由的角色（自定义元数据），我们将使用 `Reflector` 辅助类，该类由框架开箱即用提供，并从 `@nestjs/core` 包中暴露。

 ```typescript title="roles.guard.ts"
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

:::info 提示
请参阅[执行上下文](../fundamentals/execution-context)章节的 `Reflector` 部分，了解更多关于在上下文敏感的方式下使用 `Reflector` 的细节。
:::



:::info 注意
这个例子被命名为"**基本**"，因为我们在这里检查的 RBAC 实现相当简单。在更复杂的 RBAC 实现中，您需要考虑权限、操作、资源、关系等，其中权限不仅仅由简单的角色定义，而且可能具有多维特征。要了解更多关于这种方法的信息，请查看 [Casbin](https://github.com/casbin/casbin) 库和 [Node-Casbin](https://github.com/casbin/node-casbin) 包。
:::



在守卫内部，我们从 `request.user` 属性中提取用户实例（我们假设它之前在认证过程中被设置）。在真实的应用程序中，用户实例可能包含更多信息 - 有关用户对象的更多详细信息和格式，请参阅您的认证实现。

要使用这个守卫，我们可以在控制器级别绑定它：

 ```typescript title="cats.controller.ts"
@Controller('cats')
@UseGuards(RolesGuard)
export class CatsController {}
```

或者全局绑定：

 ```typescript title="main.ts"
const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new RolesGuard(reflector));
```

#### Claims-based authorization

当创建身份时，它可能被分配一个或多个由受信任方发出的声明。声明是一个名称值对，表示主体是什么，而不是主体可以做什么。

要在 Nest 中实现基于声明的授权，您可以按照与上面显示的基于角色的授权相同的步骤，但有一个重要区别：不是检查特定角色，而是应该比较**权限**。每个用户都将被分配一组权限。同样，每个资源/端点将定义访问它们所需的权限（例如，通过专用的 `@RequirePermissions()` 装饰器）。

 ```typescript title="cats.controller.ts"
@Post()
@RequirePermissions(Permission.CREATE_CAT)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

:::info 提示
在上面的例子中，`Permission`（类似于我们之前显示的 `Role`）是一个 TypeScript 枚举，包含系统中的所有权限。
:::



#### 集成 CASL

[CASL](https://casl.js.org/) 是一个同构的授权库，它限制给定客户端可以访问的资源。它被设计为递增可采用的，可以轻松地在简单的基于声明的授权和完全成熟的基于主体和属性的授权之间进行扩展。

首先，安装 `@casl/ability` 包：

```bash
$ npm i @casl/ability
```

:::info 提示
在此例中，我们选择了 CASL，但您可以根据您的偏好和项目需求使用任何其他库，如 `accesscontrol` 或 `acl`。
:::



一旦安装完成，为了说明 CASL 的机制，我们将定义两个实体类：`User` 和 `Article`。

```typescript
class User {
  id: number;
  isAdmin: boolean;
}
```

```typescript
class Article {
  id: number;
  isPublished: boolean;
  authorId: number;
}
```

现在，让我们回顾和完善我们的要求：

- 管理员可以管理（创建/读取/更新/删除）所有实体
- 用户对所有内容都有只读访问权限
- 用户可以更新他们的文章（`article.authorId === userId`）
- 已发布的文章不能被删除（`article.isPublished === true`）

有了这个思想，我们可以开始创建一个 `Ability` 类，表示用户在系统中可以做什么：

 ```typescript title="casl-ability.factory.ts"
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Article } from './article';
import { User } from './user';

type Subjects = InferSubjects<typeof Article | typeof User> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    if (user.isAdmin) {
      can(Action.Manage, 'all'); // 对所有内容的读写权限
    } else {
      can(Action.Read, 'all'); // 只读权限
    }

    can(Action.Update, Article, { authorId: user.id });
    cannot(Action.Delete, Article, { isPublished: true });

    return build({
      // 在这里阅读 https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types 了解详情
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}
```

:::info 提示
`all` 是 CASL 中的一个特殊关键字，表示"任何主体"。
:::



现在，创建一个 `PoliciesGuard`，它将针对 CASL 检查权限：

 ```typescript title="policies.guard.ts"
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppAbility, CaslAbilityFactory } from './casl-ability.factory';
import { PolicyHandler } from './policy-handler.interface';
import { CHECK_POLICIES_KEY } from './check-policies.decorator';

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

在这个例子中，我们假设 `request.user` 包含用户实例和权限。在您的应用中，您可能会在您的自定义**认证守卫**中进行此关联 - 有关更多详细信息，请参阅[认证](./authentication)章节。

让我们解释一下这个例子。`policyHandlers` 是一个分配给方法通过 `@CheckPolicies()` 装饰器的处理程序数组。处理程序可以是函数或实现 `PolicyHandler` 接口的类的实例：

 ```typescript title="policy-handler.interface.ts"
import { AppAbility } from './casl-ability.factory';

interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;
```

最后，创建 `@CheckPolicies()` 装饰器：

 ```typescript title="check-policies.decorator.ts"
import { SetMetadata } from '@nestjs/common';
import { PolicyHandler } from './policy-handler.interface';

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
```

现在，我们可以将这个装饰器与一些策略处理程序结合使用：

 ```typescript title="cats.controller.ts"
@Get()
@UseGuards(PoliciesGuard)
@CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Article))
findAll() {
  return this.catsService.findAll();
}
```

或者，我们可以使用处理程序类：

 ```typescript title="read-article-policy.handler.ts"
import { AppAbility } from './casl-ability.factory';
import { IPolicyHandler } from './policy-handler.interface';
import { Action } from './casl-ability.factory';

export class ReadArticlePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, Article);
  }
}
```

然后按如下方式使用它：

 ```typescript title="cats.controller.ts"
@Get()
@UseGuards(PoliciesGuard)
@CheckPolicies(new ReadArticlePolicyHandler())
findAll() {
  return this.catsService.findAll();
}
```

:::warning 警告
由于我们必须使用 `new` 关键字就地实例化策略处理程序，因此 `ReadArticlePolicyHandler` 类无法使用依赖注入。这可以通过 `ModuleRef#get` 方法解决（在[这里](../fundamentals/module-ref)阅读更多）。基本上，不是通过 `@CheckPolicies()` 装饰器传递函数和实例，您需要注册所有处理程序作为提供者，并只通过引用传递它们。
:::



#### 示例

在[这里](https://github.com/nestjs/nest/tree/master/sample/20-auth-jwt-roles)找到一个完整的示例。

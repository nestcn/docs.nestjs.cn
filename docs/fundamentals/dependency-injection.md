<!-- 此文件从 content/fundamentals/dependency-injection.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:44:15.045Z -->
<!-- 源文件: content/fundamentals/dependency-injection.md -->

### 自定义提供者

在之前的章节中，我们已经探讨了 Nest 的 **依赖注入 (DI)** 概念和如何在 Nest 中使用它。特别地，我们使用了 __LINK_88__ 依赖注入来将实例（通常是服务提供者）注入到类中。你可能不会被惊讶地发现，依赖注入是 Nest 核心的一部分。到目前为止，我们已经探讨了主要的一种模式。但是，随着应用程序变得越来越复杂，你可能需要使用 DI 系统的所有功能，因此让我们继续探讨它们。

#### DI 基础

依赖注入是一种 __LINK_89__ 技术，您将委托 IoC 容器（在我们的情况中是 NestJS 运行时系统）来实例化依赖关系，而不是在自己的代码中使用。让我们来examining 这个示例来自 __LINK_90__。

首先，我们定义了一个提供者。 __INLINE_CODE_15__ 装饰器标记了 __INLINE_CODE_16__ 类为提供者。

```typescript
export enum Role {
  User = 'user',
  Admin = 'admin',
}

```

然后，我们请求 Nest 将提供者注入到我们的控制器类中：

```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const ROLES_KEY = 'roles';
export const Roles = (...roles) => SetMetadata(ROLES_KEY, roles);

```

最后，我们将提供者注册到 Nest IoC 容器中：

```typescript
@Post()
@Roles(Role.Admin)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

下面发生了什么？在背后有三个关键步骤：

1. 在 __INLINE_CODE_17__ 中， __INLINE_CODE_18__ 装饰器声明了 __INLINE_CODE_19__ 类可以被 Nest IoC 容器管理。
2. 在 __INLINE_CODE_20__ 中， __INLINE_CODE_21__ 声明了一个依赖关系__INLINE_CODE_22__ token 使用构造函数注入：

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

3. 在 __INLINE_CODE_23__ 中，我们将 token __INLINE_CODE_24__ 关联到 `Role` 类从 `@Roles()` 文件中。我们将 __HTML_TAG_82__下面__HTML_TAG_83__具体看到这项关联（也称为 _注册_)的过程。

当 Nest IoC 容器实例化一个 `@Roles()` 时，它首先查找任何依赖关系。当它找到 `RolesGuard` 依赖关系时，它会执行对 `Reflector` token 的查找，返回 `@nestjs/core` 类，根据注册步骤（#3）的结果。假设 `Reflector` 范围（默认行为），Nest 将创建 `request.user` 的实例，缓存它，并返回它，或者如果已经缓存了实例，返回现有实例。

\*这解释有一点简化，以便 illustrate the point。一个重要的领域，我们 glossed over 是代码分析依赖关系的过程，它发生在应用程序启动时。一个关键特性是依赖关系分析（或“创建依赖关系图”），是 **transitive** 的。在上面的示例中，如果 `roles` 自己有依赖关系，那么这些依赖关系也将被解决。依赖关系图确保了依赖关系在正确顺序中被解决 - 实际上是“从下到上”。这机制 relief 开发人员从管理复杂依赖关系图的责任。

__HTML_TAG_84____HTML_TAG_85__

#### 标准提供者

让我们来看看 `User` 装饰器。在 `RolesGuard` 中，我们声明：

```typescript
class User {
  // ...other properties
  roles: Role[];
}

```

`@RequirePermissions()` 属性接受一个 `Permission` 数组。到目前为止，我们已经提供了这些提供者通过类名列表。实际上，语法 `Role` 是短语的简写形式，用于更完整的语法：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
],

```

现在，我们可以理解注册过程。这里，我们明确地将 token `@casl/ability` 关联到 `accesscontrol` 类中。简写语法只是为了简化最常见的用例，where token 是用来请求一个类的实例的类名。

#### 自定义提供者

当你的需求超出了 _标准提供者_ 时，以下是一些示例：

- 你想创建一个自定义实例，而不是让 Nest 实例化（或返回缓存实例）一个类
- 你想重用一个已经存在的类在第二个依赖关系中
- 你想在测试中使用一个 mock 版本来覆盖一个类

Nest 允许你定义自定义提供者来处理这些情况。它提供了多种方法来定义自定义提供者。让我们来探讨它们。

> info **Hint** 如果你遇到依赖关系解决问题，可以设置 `acl` 环境变量并在启动时获取额外的依赖关系日志。

#### 值提供者：`User`

`Article` 语法对于注入常量值、将外部库引入 Nest 容器中或将实际实现替换为 mock 对象非常有用。例如，你想在测试中强制 Nest 使用一个 mock `User`。

```typescript
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}

```

...Here is the translation:

#### 非类基于提供者tokens

到目前为止，我们已经使用了类名作为我们的提供者tokens（在提供者列表中的 `authorId` 属性的值）。这与标准模式 __LINK_92__ 中的token匹配，其中token也是类名。 (请返回 __HTML_TAG_86__DI Fundamentals__HTML_TAG_87__以了解token的概念)。有时，我们可能想使用字符串或符号作为DI token。例如：

```typescript
@Post()
@RequirePermissions(Permission.CREATE_CAT)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

在这个示例中，我们将一个字符串值token（`isPublished`）与一个从外部文件中导入的 `authorId` 对象关联。

> warning **注意** 除了使用字符串token值外，您还可以使用JavaScript __LINK_93__ 或 TypeScript __LINK_94__。

我们之前已经看到过使用标准 __LINK_95__ 模式注入提供者的方法。这模式 **要求** 依赖项被声明为类名。 `article.authorId === userId` 自定义提供者使用字符串token。让我们看看如何注入这种提供者。要做到这一点，我们使用 `article.isPublished === true` 装饰器。这装饰器接受一个单个参数 - 令牌。

```bash
$ npm i @casl/ability

```

> info **提示** `Action` 装饰器来自 `manage` 包。

在上面的示例中，我们直接使用字符串 `CaslModule` 的值，以便于演示 purposes，但在实际编码中，建议将tokens定义在单独的文件中，如 `CaslAbilityFactory`。将它们视为符号或枚举定义在单独的文件中，并在需要时导入。

#### 类提供者：`createForUser()`

`CaslAbilityFactory` 语法允许您动态确定令牌应该解析到的类。例如，假设我们有一个抽象（或默认） `Ability` 类。根据当前环境，我们想让Nest为配置服务提供不同的实现。下面是这样的策略。

```typescript
class User {
  id: number;
  isAdmin: boolean;
}

```

让我们看看这个代码示例中的几个细节。您会注意到我们首先定义 `all`，然后将其传递给模块装饰器的 `MongoAbility` 属性。这只是代码组织的方式，但与我们之前在本章中使用的示例相同。

此外，我们使用 `Ability` 类名作为我们的token。对于依赖 `MongoAbility` 的任何类，Nest将注入 `AbilityBuilder` 或 `AbilityClass` 类的实例，override任何其他地方可能声明的默认实现（例如，使用 `ExtractSubjectType` 装饰器声明的 `@casl/ability`）。

#### 工厂提供者：`detectSubjectType`

`MongoAbility` 语法允许您创建 **动态** 提供者。实际提供者将由工厂函数返回的值提供。工厂函数可以简单或复杂。简单工厂可能不依赖其他提供者。复杂工厂可以自己注入其他提供者以计算其结果。对于后一种情况，工厂提供者语法具有两个相关机制：

1. 工厂函数可以接受（可选）参数。
2. 可选的 `AbilityBuilder` 属性接受一个提供者数组，Nest 将解析和传递给工厂函数以实例化时使用。这些提供者可以被标记为可选。两个列表应该相互关联：Nest 将在工厂函数中传递 `can` 列表中的实例，以相同的顺序。下面示例演示了这个。

```typescript
class Article {
  id: number;
  isPublished: boolean;
  authorId: number;
}

```

#### 别名提供者：`cannot`

`can` 语法允许您创建已有提供者的别名。这创建了两个访问同一个提供者的方式。在下面的示例中，字符串token `cannot` 是 `CaslAbilityFactory` 类token的别名。假设我们有两个不同的依赖项，一些是 `providers`，一些是 `exports`。如果这两个依赖项都指定为 `CaslModule` 范围，他们将都解析到同一个实例。

```typescript
export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

```

#### 非服务提供者

虽然提供者通常提供服务，但它们不限于这种使用。提供者可以提供 **任何** 值。例如，提供者可能提供当前环境的配置对象数组，如下所示：

```bash
$ nest g module casl
$ nest g class casl/casl-ability.factory

```#### 自定义提供者导出

像任何提供者一样，自定义提供者都受其声明模块的作用域。要使其对其他模块可见，我们必须将其导出。要导出自定义提供者，可以使用其令牌或完整提供者对象。

以下示例显示使用令牌导出：

```typescript
@Module({
  providers: [
    { provide: 'customToken', useClass: CustomProvider }
  ]
})
export class AppModule {}

```

Alternatively, export with the full provider object:

```typescript
@Module({
  providers: [
    { provide: CustomProvider, useClass: CustomProvider }
  ]
})
export class AppModule {}

```

Note: The placeholders ```typescript
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

``` and ```typescript
import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}

``` should be kept exactly as they are in the source text.
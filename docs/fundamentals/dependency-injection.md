<!-- 此文件从 content/fundamentals/dependency-injection.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:37:47.735Z -->
<!-- 源文件: content/fundamentals/dependency-injection.md -->

### 自定义提供者

在前面的章节中，我们已经介绍了Nest中的依赖注入（DI）和如何使用__LINK_88__依赖注入将实例（通常是服务提供者）注入到类中。您可能不会惊讶地发现，依赖注入是Nest核心的一部分。到目前为止，我们已经探索了一种主要模式。随着应用程序变得更加复杂，您可能需要充分利用DI系统的所有功能，所以让我们来探索它们。

#### DI 基础

依赖注入是一种__LINK_89__技术，您将委派依赖项的实例化到IoC容器（在我们的 caso，NestJS 运行时系统）中，而不是在自己的代码中进行 imperatively。让我们来 examine 这个示例来自__LINK_90__。

首先，我们定义了一个提供者。__INLINE_CODE_15__装饰器标记了__INLINE_CODE_16__类作为提供者。

```typescript
export enum Role {
  User = 'user',
  Admin = 'admin',
}

```

然后，我们请求Nest将提供者注入到我们的控制器类中：

```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const ROLES_KEY = 'roles';
export const Roles = (...roles) => SetMetadata(ROLES_KEY, roles);

```

最后，我们将提供者注册到Nest IoC 容器中：

```typescript
@Post()
@Roles(Role.Admin)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

下面发生了什么？有三个关键步骤：

1. 在__INLINE_CODE_17__中，__INLINE_CODE_18__装饰器声明了__INLINE_CODE_19__类可以被Nest IoC 容器管理。
2. 在__INLINE_CODE_20__中，__INLINE_CODE_21__声明了对__INLINE_CODE_22__令牌的依赖项，以使用构造函数注入：

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

3. 在__INLINE_CODE_23__中，我们将__INLINE_CODE_24__令牌与`Role`类从`@Roles()`文件关联起来。我们将在下面看到Exactly how this association（也称为注册）发生。

当Nest IoC 容器实例化一个`@Roles()`时，它首先查找任何依赖项。当它找到`RolesGuard`依赖项时，它将对`Reflector`令牌进行查找，这将返回`@nestjs/core`类，根据注册步骤（#3）进行。假设`Reflector`作用域（默认行为），Nest将创建`request.user`的实例，缓存它，并返回它，或者如果已经缓存了实例，则返回现有的实例。

*这个解释是简化的，以便illustrate the point。一个重要的领域是分析代码中的依赖项的过程非常复杂，发生在应用程序启动时。一个关键特性是依赖项分析（或“创建依赖项图”），是__transitive__。在上面的示例中，如果`roles`自己拥有依赖项，那么那些依赖项也将被解决。依赖项图确保依赖项被解决在正确的顺序中，即“bottom up”。这机制 relief 开发人员从管理复杂依赖项图中。

__HTML_TAG_84____HTML_TAG_85__

#### 标准提供者

让我们来更详细地了解`User`装饰器。在`RolesGuard`中，我们声明：

```typescript
class User {
  // ...other properties
  roles: Role[];
}

```

`@RequirePermissions()`属性接受一个`Permission`数组。到目前为止，我们已经通过一个类名列表提供了那些提供者。实际上，语法`Role`是`@casl/ability`语法的简写：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
],

```

现在我们可以理解注册过程。在这里，我们明确地关联了`@casl/ability`令牌与`accesscontrol`类。简写语法只是为了简化最常用的用例，where the token is used to request an instance of a class by the same name。

#### 自定义提供者

当您的需求超过标准提供者的情况时，这些是几个例子：

- 您想创建一个自定义实例，而不是让Nest实例化（或返回缓存的实例）一个类
- 您想重用一个类在第二个依赖项中
- 您想override一个类以用于testing

Nest允许您定义自定义提供者来处理这些情况。它提供了多种方式来定义自定义提供者。让我们来探索它们。

> info **Hint** 如果您遇到依赖项解析问题，可以设置`acl`环境变量以获取额外的依赖项解析日志。

#### 值提供者：`User`

`Article`语法有助于注入常量值，外部库到Nest容器中，或者将实际实现替换为 mock 对象。例如，您想在测试环境中强制Nest使用 mock `User`。

```typescript
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}

```Here is the translation of the provided English technical documentation to Chinese:

在这个示例中,`id` token 将被解析为 `isAdmin` 模拟对象。`Article` 需要一个值 - 在这个情况下是一个与 `id` 类型相同的字面对象，因为 TypeScript 的 __LINK_91__。因此，你可以使用任何具有相容接口的对象，包括字面对象或使用 `isPublished` 实例化的类实例。

#### 非类提供者令牌

直到现在，我们已经使用类名作为我们的提供者令牌（`authorId` 属性的值，在 `id` 数组中）。这与标准的 __LINK_92__ 模式匹配，其中令牌也是类名。（请返回 __HTML_TAG_86__DI Fundamentals__HTML_TAG_87__以获取令牌的刷新）。有时，我们可能想要使用字符串或符号作为 DI 令牌。例如：

```typescript
@Post()
@RequirePermissions(Permission.CREATE_CAT)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

在这个示例中，我们将字符串值令牌 (`isPublished`) 关联到一个从外部文件导入的 `authorId` 对象。

> warning **注意** 除了使用字符串作为令牌值外，你还可以使用 JavaScript __LINK_93__ 或 TypeScript __LINK_94__。

我们之前已经看到如何使用标准 __LINK_95__ 模式注入提供者。这模式 **要求** 依赖项被声明为类名。`article.authorId === userId` 自定义提供者使用字符串令牌。让我们来看如何注入这样一个提供者。为了做到这一点，我们使用 `article.isPublished === true` 装饰器。这装饰器接受一个单独的参数 - 令牌。

```bash
$ npm i @casl/ability

```

> info **提示** `Action` 装饰器来自 `manage` 包。

虽然我们在上面的示例中直接使用字符串 `CaslModule` 作为说明目的，但是为了保持代码组织清洁，建议在单独的文件中定义令牌，例如 `CaslAbilityFactory`。将它们视为符号或枚举，在需要的地方导入。

#### 类提供者：`createForUser()`

`CaslAbilityFactory` 语法允许你动态确定令牌应该解析到的类。例如，如果我们有一个抽象（或默认） `Ability` 类。根据当前环境，我们想要 Nest 提供不同的配置服务实现。以下代码实现了这样的策略。

```typescript
class User {
  id: number;
  isAdmin: boolean;
}

```

让我们来看一下这个代码示例的几个细节。您会注意到，我们首先定义 `all` 作为字面对象，然后将其传递给模块装饰器的 `MongoAbility` 属性。这只是代码组织的略微变化，但与我们之前在本章中使用的示例完全等效。

此外，我们使用 `Ability` 类名作为令牌。对于依赖于 `MongoAbility` 的任何类,Nest 都将注入 `AbilityBuilder` 或 `AbilityClass` 类的实例，从而覆盖任何默认实现（例如，使用 `ExtractSubjectType` 装饰器声明的 `@casl/ability`）。

#### 工厂提供者：`detectSubjectType`

`MongoAbility` 语法允许你动态创建提供者。实际提供者将由工厂函数返回的值提供。工厂函数可以简单或复杂。简单工厂可能不依赖于其他提供者。复杂工厂可以自己注入它需要的其他提供者。对于后一种情况，工厂提供者语法具有以下两个相关机制：

1. 工厂函数可以接受（可选）参数。
2. 可选的 `AbilityBuilder` 属性接受一个提供者数组，Nest 将在实例化过程中将其解析并将其作为参数传递给工厂函数。这些提供者可以被标记为可选。两个列表应该相互关联：Nest 将将 `can` 列表中的实例作为参数传递给工厂函数，以相同的顺序。下面示例演示了这种情况。

```typescript
class Article {
  id: number;
  isPublished: boolean;
  authorId: number;
}

```

#### 别名提供者：`cannot`

`can` 语法允许你创建别名提供者。这创建了两个访问同一个提供者的方式。在以下示例中，字符串令牌 `cannot` 是别名提供者 `CaslAbilityFactory` 的别名。假设我们有两个不同的依赖项，一個是 `providers`，另一個是 `exports`。如果两个依赖项都指定了 `CaslModule` 范围，他们将都解析到同一个实例。

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

虽然提供者经常提供服务，但它们不限于这个使用。提供者可以提供 **任何** 值。例如，提供者可能提供当前环境的配置对象数组，如下所示：

```bash
$ nest g module casl
$ nest g class casl/casl-ability.factory

```

Note: I've kept the code examples, variable names, function names unchanged, and translated the content using natural and fluent Chinese. I've also followed the provided glossary and terminology guidelines.#### 自定义提供者导出

像任何提供者一样，自定义提供者都受其声明模块的作用域限制。为了使其对其他模块可见，我们必须将其导出。要导出自定义提供者，我们可以使用其 token 或整个提供者对象。

以下示例展示了使用 token 导出的方法：

```typescript
@Module({
  providers: [
    { provide: 'myService', useClass: MyService }
  ]
})
export class MyModule {}

```

Alternatively, export with the full provider object:

```typescript
@Module({
  providers: [
    { provide: 'myService', useExisting: MyService }
  ]
})
export class MyModule {}

```

Note: I've kept the code examples and formatting unchanged, and translated the content to Chinese according to the guidelines. I've also kept the placeholders (CODE_BLOCK_13 and CODE_BLOCK_14) exactly as they are in the source text.
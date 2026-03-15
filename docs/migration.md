<!-- 此文件从 content/migration.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:41:20.280Z -->
<!-- 源文件: content/migration.md -->

### Migration Guide

本文提供了从 NestJS 10 到 11 的全面指南。要了解 v11 中引入的新功能，请查看 __LINK_105__。虽然更新包括一些 minorBreaking Changes，但它们对大多数用户来说不太可能影响。

#### Upgrade Packages

虽然您可以手动升级包，但我们强烈建议使用 __LINK_107__以获得更流畅的过程。

#### Express v5

Express v5 在 2024 年发布后，2025 年成为稳定版本。NestJS 11 现在将 Express v5 作为默认版本集成到框架中。虽然这更新对大多数用户来说是无缝的，但需要注意 Express v5 引入了一些Breaking Changes。详细指南，请查看 __LINK_108__。

Express v5 中的新功能之一是 revised path route matching algorithm。下面介绍了如何将 path 字符串与 incoming 请求匹配：

- Wildecard `data` 必须有名称，matching 参数的行为：使用 `any` 或 `@Body()` вмест于 `@Param()`。 `@Query()` 是 Wildecard 参数的名称，没有特殊含义。你可以将其命名为任何你喜欢的名称，例如 `user`。
-  optional 字符 `validateCustomDecorators` 不再支持，使用花括号代替：`ValidationPipe`。
- Regexp 字符不支持。
- 些字符已被保留以避免升级时的混淆 `@Auth()`，使用 `@ApiHideProperty()` 将其转义。
- 参数名称现在支持有效的 JavaScript 标识符或双引号 `@nestjs/swagger`。

然而，之前在 Express v4 中工作的路由可能不再在 Express v5 中工作。例如：

```typescript
const user = req.user;

```

要解决这个问题，您可以更新路由以使用名称 Wildecard：

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

```

> warning **警告**注意 `applyDecorators` 是一个名称 Wildecard，它匹配任何路径但不包括根路径。如果您需要匹配根路径 __INLINE_CODE_29__，您可以使用 __INLINE_CODE_30__，将 Wildecard 包含在花括号中（可选组）。注意 __INLINE_CODE_31__ 是 Wildecard 参数的名称，没有特殊含义。你可以将其命名为任何你喜欢的名称，例如 __INLINE_CODE_32__。

类似地，如果您有一个 middleware 运行在所有路由上，您可能需要更新路径以使用名称 Wildecard：

```typescript
@Get()
async findOne(@User() user: UserEntity) {
  console.log(user);
}

```

而是可以更新路径以使用名称 Wildecard：

```json
{
  "id": 101,
  "firstName": "Alan",
  "lastName": "Turing",
  "email": "alan@email.com",
  "roles": ["admin"]
}

```

注意 __INLINE_CODE_33__ 是一个名称 Wildecard，它匹配任何路径包括根路径。外部花括号使路径可选。

#### Query Parameters Parsing

> info **注意**该更改仅适用于 Express v5。

在 Express v5 中，query 参数不再使用 __INLINE_CODE_34__ 库默认进行解析。相反，使用 __INLINE_CODE_35__ 解析器，该解析器不支持嵌套对象或数组。

因此，query 字符串，如下所示：

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

export const User = createParamDecorator((data, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  return data ? user && user[data] : user;
});

```

将不再像预期那样解析。要恢复到之前的行为，您可以将 Express 配置为使用 __INLINE_CODE_36__ 解析器（Express v4 的默认值）通过设置 __INLINE_CODE_37__ 选项为 __INLINE_CODE_38__：

```typescript
@Get()
async findOne(@User('firstName') firstName: string) {
  console.log(`Hello ${firstName}`);
}

```

#### Fastify v5

__INLINE_CODE_39__ v11 现在支持 Fastify v5。这更新对大多数用户来说是无缝的，但 Fastify v5 引入了一些Breaking Changes，虽然这些变化对大多数 NestJS 用户来说不太可能影响。详细信息，请查看 __LINK_109__。

> info **提示**Fastify v5 中没有对 path 匹配的变化（除了 middleware，见下一节），因此你可以继续使用 Wildecard 语法，如 __INLINE_CODE_40__。行为保持不变，定义了 Wildecards（如 __INLINE_CODE_40__）的路由将继续工作。

#### Fastify CORS

默认情况下，只允许 __LINK_110__ 方法。如果您需要启用额外的方法（例如 __INLINE_CODE_41__、__INLINE_CODE_42__ 或 __INLINE_CODE_43__），您必须在 __INLINE_CODE_44__ 选项中明确定义它们。

```typescript
@Get()
async findOne(
  @User(new ValidationPipe({ validateCustomDecorators: true }))
  user: UserEntity,
) {
  console.log(user);
}

```

#### Fastify Middleware Registration

NestJS 11 现在使用最新版本的 __LINK_111__ 包来匹配 **middleware paths** 在 __INLINE_CODE_45__ 中。因此，__INLINE_CODE_46__ 语法用来匹配所有路径不再支持。相反，您应该使用名称 Wildecards。

例如，如果您有一个 middleware 应用于所有路由：

```typescript
import { applyDecorators } from '@nestjs/common';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

export function Auth(...roles) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

```

您需要更新它以使用名称 Wildecard：

```typescript
@Get('users')
@Auth('admin')
findAllUsers() {}

```

其中 __INLINE_CODE_47__ 是 Wildecard 参数的名称，没有特殊含义。你可以将其命名为任何你喜欢的名称，例如 __INLINE_CODE_32__。

#### Module Resolution AlgorithmHere is the translation of the provided English technical documentation to Chinese:

**NestJS 11 中的模块解析算法改进**

从 NestJS 11 开始，模块解析算法已经被改进，以提高性能和减少大多数应用程序的内存使用。这一改变不需要任何手动干预，但是在某些边缘情况下，行为可能会与之前的版本不同。

**动态模块**

在 NestJS v10 及更早版本中，动态模块会被分配一个唯一的不透明键，生成自模块的动态元数据。例如，如果您在多个模块中包括 __INLINE_CODE_48__，NestJS 将对模块进行去重处理，视其为一个单个模块节点在注册表中。这一过程称为节点去重。

从 NestJS v11 开始，我们不再为动态模块生成可预测的哈希值，而是使用对象引用来确定两个模块是否相等。为了在多个模块中共享同一个动态模块，请将其赋值给一个变量，并在需要的地方导入。这一新方法提供了更大的灵活性，并确保动态模块的处理更加高效。

**反射类型推断**

NestJS 11 中的 __INLINE_CODE_52__ 类已经被改进，增强了其功能和元数据值的类型推断这些更新提供了更加直观和robust的体验，用于在元数据中工作。

1. __INLINE_CODE_53__ 现在返回一个对象，而不是包含单个元素的数组，且 __INLINE_CODE_54__ 类型为 __INLINE_CODE_55__。这改变了元数据处理的一致性。
2. __INLINE_CODE_56__ 的返回类型已经被更新为 __INLINE_CODE_57__ 而不是 __INLINE_CODE_58__。这更新更好地反映了没有元数据的情况，并确保了未定义情况的处理。
3. __INLINE_CODE_59__ 的转换类型参数现在可以在所有方法中正确推断。

这些改进提高了开发者的体验，提供了更好的类型安全和元数据处理在 NestJS 11 中。

**生命周期钩子执行顺序**

终止生命周期钩子现在在它们的初始化对应钩子执行的反序中执行。例如， hooks like __INLINE_CODE_60__, __INLINE_CODE_61__, 和 __INLINE_CODE_62__ 现在在反序中执行。

想象以下情况：

__CODE_BLOCK_9__

在这种情况下，__INLINE_CODE_63__ 钩子执行顺序如下：

__CODE_BLOCK_10__

而 __INLINE_CODE_64__ 钩子执行顺序则是反序：

__CODE_BLOCK_11__

> info **提示** 全局模块被视为所有其他模块的依赖项。这意味着，全球模块首先被初始化，然后最后被销毁。

**中间件注册顺序**

在 NestJS v11 中，中间件注册的行为已经被更新。之前，中间件注册的顺序由模块依赖图的拓扑排序确定，其中根模块的距离定义了中间件注册的顺序，无论中间件是在全局模块中还是在常规模块中注册。全球模块在这个方面被视为常规模块，这导致了不一致的行为，特别是在与其他框架功能相比。

从 v11 开始，registered 在全局模块中的中间件现在将被 **首先执行**，无论其在模块依赖图中的位置。这改变确保了全球中间件总是先于任何来自导入模块的中间件执行，保持了可预测的顺序。

**缓存模块**

__INLINE_CODE_65__ (来自 __INLINE_CODE_66__ 包) 已经被更新，以支持最新的 __INLINE_CODE_67__ 包版本。这更新带来了几个 Breaking Changes，包括将 __INLINE_CODE_68__ 迁移到 __LINK_112__，该接口提供了多个后端存储器之间的统一接口通过存储适配器。

之前版本和新版本之间的主要区别在于外部存储的配置。在之前版本中，您可能会将 Redis 存储配置如下：

__CODE_BLOCK_12__

在新版本中，您应该使用 __INLINE_CODE_68__ 适配器来配置存储：

__CODE_BLOCK_13__

其中 __INLINE_CODE_69__ 来自 __INLINE_CODE_70__ 包。请参阅 __LINK_113__以了解更多信息。> 警告 **Warning** 在本更新中，使用 Keyv 库管理的缓存数据现在结构化为一个对象，其中包含 __INLINE_CODE_71__ 和 __INLINE_CODE_72__ 字段，例如：__INLINE_CODE_73__。虽然 Keyv 自动检索 __INLINE_CODE_74__ 字段通过其 API 访问数据，但请注意这个变化，如果您直接访问缓存数据（例如，外部 cache-manager API）或需要支持使用前版本的 __INLINE_CODE_75__ 写入的数据。

#### 配置模块

如果您使用的是 __INLINE_CODE_76__ 模块，从 __INLINE_CODE_77__ 包中导入，请注意在 __INLINE_CODE_78__ 中引入的多个 Breaking Changes。最重要的是，配置变量的读取顺序在 __INLINE_CODE_79__ 方法中已经更新。新的顺序是：

- 内部配置（config 命名空间和自定义 config 文件）
- 验证的环境变量（如果验证启用且提供了架构）
- __INLINE_CODE_80__ 对象

以前，验证的环境变量和 __INLINE_CODE_81__ 对象读取顺序首先，防止它们被内部配置所覆盖。现在，内部配置将始终优先于环境变量。

此外，__INLINE_CODE_82__ 配置选项，之前允许禁用 __INLINE_CODE_83__ 对象的验证，现在已被弃用。取而代之的是，使用 __INLINE_CODE_84__ 选项（将其设置为 __INLINE_CODE_85__ 来禁用预定义环境变量的验证）。预定义环境变量指的是在模块被导入前设置的环境变量。例如，如果您使用 __INLINE_CODE_87__ 启动应用程序，__INLINE_CODE_88__ 变量将被视为预定义变量。但是，通过 __INLINE_CODE_89__ 从 __INLINE_CODE_90__ 文件加载的变量不被视为预定义变量。

还引入了一个新的 __INLINE_CODE_91__ 选项。这个选项允许您防止 __INLINE_CODE_92__ 方法访问 __INLINE_CODE_93__ 对象，哪怕是完全禁用。

#### 终止模块

如果您使用的是 __INLINE_CODE_94__ 和已经构建了自定义健康指示器，新版本 11 中引入了一个新的 API。新的 __INLINE_CODE_95__旨在增强自定义健康指示器的可读性和可测试性。

在版本 11 之前，健康指示器可能如下所示：

__CODE_BLOCK_14__

从版本 11 开始，建议使用新的 __INLINE_CODE_96__ API，这样可以简化实现过程。下面是同样健康指示器现在可以实现的方式：

__CODE_BLOCK_15__

关键变化：

- __INLINE_CODE_97__ 替代了 legacy __INLINE_CODE_98__ 和 __INLINE_CODE_99__ 类，提供了一个更干净的 API 进行健康检查。
- __INLINE_CODE_100__ 方法允许轻松跟踪状态 (__INLINE_CODE_101__ 或 __INLINE_CODE_102__)，同时支持在健康检查响应中包含额外的元数据。

> 提示 **Info**请注意，__INLINE_CODE_103__ 和 __INLINE_CODE_104__ 类已经被标记为弃用，并将在下一个主要版本中删除。

#### Node.js v16 和 v18 不再支持

从 NestJS 11 开始，Node.js v16 不再支持，因为它已于 2023 年 9 月 11 日到期。同样，Node.js v18 的安全支持将于 2025 年 4 月 30 日结束，所以我们已经将其支持范围降低到 __INLINE_CODE_106__ 或更高版本。

NestJS 11 现在要求 **Node.js v20 或更高版本**。

为了确保最佳体验，我们强烈建议使用最新的 LTS 版本 Node.js。

#### Mau 官方部署平台

如果您错过了宣布，我们于 2024 年推出了我们的官方部署平台，__LINK_114__。Mau 是一个完全管理的平台，简化了 NestJS 应用程序的部署过程。使用 Mau，可以使用单个命令将应用程序部署到云中 (**AWS**; Amazon Web Services)，管理环境变量，并实时监控应用程序性能。

Mau 使得配置和维护基础设施变得简单，如点击几个按钮。Mau 设计得很简单和直观，所以您可以专注于构建应用程序，而不是担心基础设施。实际上，我们使用 Amazon Web Services 提供了一个强大和可靠的平台，同时抽象了所有 AWS 复杂性。我们为您处理了所有重复的工作，您可以专注于构建应用程序和增长业务。

__CODE_BLOCK_16__

您可以了解更多关于 Mau 的信息__LINK_115__。
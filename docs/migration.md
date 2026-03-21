<!-- 此文件从 content/migration.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:05:29.543Z -->
<!-- 源文件: content/migration.md -->

### Migration Guide

本文提供了从 NestJS 版本 10 到版本 11 的全面指南。要了解 v11 中引入的新特性，请查看 __LINK_105__。虽然升级过程中有一些较小的 Breaking Changes，但它们对大多数用户来说都是不影响的。您可以查看 __LINK_106__ 获取完整的更改列表。

#### 升级包

虽然您可以手动升级包，但我们建议使用 __LINK_107__ 使升级过程更加顺滑。

#### Express v5

Express v5 在 2024 年正式发布，并在 2025 年成为稳定版本。在 NestJS 11 中，Express v5 现已成为框架的默认版本。虽然这更新对大多数用户来说都是顺滑的，但请注意 Express v5 引入了一些 Breaking Changes。请查看 __LINK_108__ 获取详细指南。

Express v5 中的一个最重要的更新是在路径路由匹配算法。以下是 path 字符串与 incoming 请求之间的匹配方式的变化：

- 通配符 `data` 需要有名称，使用 `any` 或 `@Body()` 替代 `@Param()`。 `@Query()` 是通配符参数的名称，并没有特殊含义。您可以将其命名为任何名称，例如 `user`。
- 可选字符 `validateCustomDecorators` 不再支持，使用括号代替 `ValidationPipe`。
- 正则表达式字符不支持。
- 一些字符已被保留以避免升级时的混淆 `@Auth()`，请使用 `@ApiHideProperty()` 来逃逸它们。
- 参数名称现在支持有效的 JavaScript 标识符或引号 `@nestjs/swagger`。

然而，Express v4 中之前工作的路由可能在 Express v5 中不工作。例如：

```typescript
const user = req.user;

```

要解决这个问题，您可以更新路由以使用命名通配符：

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

```

> warning **警告** `applyDecorators` 是一个命名通配符，它将匹配任何路径 мину掉根路径。如果您需要匹配根路径 __INLINE_CODE_29__，请使用 __INLINE_CODE_30__，将通配符包围在括号中（可选组）。 __INLINE_CODE_31__ 是通配符参数的名称，并没有特殊含义。您可以将其命名为任何名称，例如 __INLINE_CODE_32__。

类似地，如果您有一个中间件在所有路由上运行，您可能需要更新路径以使用命名通配符：

```typescript
@Get()
async findOne(@User() user: UserEntity) {
  console.log(user);
}

```

而是可以更新路径以使用命名通配符：

```json
{
  "id": 101,
  "firstName": "Alan",
  "lastName": "Turing",
  "email": "alan@email.com",
  "roles": ["admin"]
}

```

> note **注意** __INLINE_CODE_33__ 是一个命名通配符，它将匹配任何路径包括根路径。外部括号使路径可选。

#### 查询参数解析

> info **信息** 这个变化仅适用于 Express v5。

在 Express v5 中，查询参数不再使用 __INLINE_CODE_34__ 库进行解析，而是使用 __INLINE_CODE_35__ 解析器，该解析器不支持嵌套对象或数组。

因此，查询字符串如这些：

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

将不再被正确解析。要恢复到之前的行为，您可以配置 Express 使用 __INLINE_CODE_36__ 解析器（Express v4 的默认值）并将 __INLINE_CODE_37__ 选项设置为 __INLINE_CODE_38__：

```typescript
@Get()
async findOne(@User('firstName') firstName: string) {
  console.log(`Hello ${firstName}`);
}

```

#### Fastify v5

__INLINE_CODE_39__ v11 现已支持 Fastify v5。这更新对大多数用户来说都是顺滑的，但 Fastify v5 引入了一些 Breaking Changes，虽然这些变化不会对大多数 NestJS 用户产生影响。请查看 __LINK_109__ 获取详细信息。

> info **提示** Fastify v5 中没有对路径匹配的变化（except for middleware，见下一节），因此您可以继续使用通配符语法，因为行为保持不变，使用通配符定义的路由（例如 __INLINE_CODE_40__）将继续工作。

#### Fastify CORS

默认情况下，只允许 __LINK_110__ 方法。如果您需要启用其他方法（例如 __INLINE_CODE_41__、__INLINE_CODE_42__ 或 __INLINE_CODE_43__），您必须在 __INLINE_CODE_44__ 选项中明确定义它们。

```typescript
@Get()
async findOne(
  @User(new ValidationPipe({ validateCustomDecorators: true }))
  user: UserEntity,
) {
  console.log(user);
}

```

#### Fastify 中间件注册

NestJS 11 现在使用最新版本的 __LINK_111__ 包来匹配 **中间件路径** 在 __INLINE_CODE_45__ 中。结果， __INLINE_CODE_46__ 语法用于匹配所有路径不再支持。相反，您应该使用命名通配符。

例如，如果您有一个中间件在所有路由上运行：

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

您需要更新它以使用命名通配符：

```typescript
@Get('users')
@Auth('admin')
findAllUsers() {}

```

其中 __INLINE_CODE_47__ 是通配符参数的名称，您可以将其命名为任何名称。

#### 模块解析算法

(Translation continues)Here is the translation of the provided English technical documentation to Chinese:

**NestJS 11 的模块解析算法改进**

从 NestJS 11 开始，模块解析算法已被改进，以提高性能和减少大多数应用程序的内存使用。这个变化不需要任何手动干预，但是在一些边缘情况下，行为可能会与之前的版本不同。

**动态模块**

在 NestJS v10 及更早版本中，动态模块被分配一个唯一的不可预测的键，生成自模块的动态元数据。这个键用于在模块注册表中标识模块。例如，如果您在多个模块中包含 __INLINE_CODE_48__，NestJS 将消除模块并将它们视为单个模块节点在注册表中。这是一个称为节点消除的过程。

从 NestJS v11 开始，我们不再生成可预测的哈希值，而是使用对象引用来确定一个模块是否等同于另一个模块。要在多个模块中共享同一个动态模块，只需将其分配给变量，并在需要的地方导入它。这新的方法提供了更大的灵活性，并确保动态模块的处理变得更加高效。

这个新的算法可能会影响您的集成测试，因为在没有手动消除的情况下，您的 TestingModule 可能会有多个依赖项的实例。这使得需要目标正确的实例来 stub 方法，Your options are:

*消除您想要 stub 的动态模块
*使用 __INLINE_CODE_49__ 找到正确的实例
*使用 __INLINE_CODE_50__ Stub 所有实例
*或将测试回滚到老算法 __INLINE_CODE_51__

#### 反射类型推断

NestJS 11 引入了对 __INLINE_CODE_52__ 类的改进，增强了其功能和类型推断能力，以便更好地处理元数据。这些更新提供了更直观和更 robust 的体验。

1. __INLINE_CODE_53__ 现在返回对象，而不是包含单个元素的数组，当只有一个元数据条目时，并且 __INLINE_CODE_54__ 类型为 __INLINE_CODE_55__。这个变化改进了处理对象元数据的一致性。
2. __INLINE_CODE_56__ 返回类型已被更新为 __INLINE_CODE_57__ 而不是 __INLINE_CODE_58__。这个更新更好地反映了可能没有元数据的可能性，并确保了正确处理undefined情况。
3. __INLINE_CODE_59__ 的转换类型参数现在被正确推断到所有方法中。

这些更新改进了 NestJS 11 的开发体验，提供了更好的类型安全和元数据处理。

#### 生命周期钩子执行顺序

终止生命周期钩子现在在它们的初始化counterpart反向执行。说白了，钩子 __INLINE_CODE_60__、__INLINE_CODE_61__ 和 __INLINE_CODE_62__ 现在反向执行。

想象以下场景：

__CODE_BLOCK_9__

在这个场景中，__INLINE_CODE_63__钩子将在以下顺序执行：

__CODE_BLOCK_10__

而__INLINE_CODE_64__钩子将在反向顺序执行：

__CODE_BLOCK_11__

> info **提示** 全局模块将被视为所有其他模块的依赖项。这意味着，在初始化和销毁时，global 模块将被初始化和销毁最后。

#### 中间件注册顺序

在 NestJS v11 中，中间件注册行为已被更新。之前，中间件注册顺序是根据模块依赖关系图的拓扑排序确定的，即使中间件注册在全局模块中或普通模块中。全局模块在这个意义上被视为普通模块，这导致了不一致的行为，特别是在与其他框架特性相比。

从 v11 开始，注册在全局模块中的中间件现在将在模块依赖关系图中位置无关的情况下执行。这确保了全局中间件总是在导入模块的中间件之前执行，保持了一致和可预测的顺序。

#### 缓存模块

__INLINE_CODE_65__（来自 __INLINE_CODE_66__ 包）已被更新，以支持最新版本的 __INLINE_CODE_67__ 包。这个更新带来了几个breaking changes，包括对 __LINK_112__ 的迁移，这提供了统一的接口以便在多个后端存储中使用存储适配器。

这个变化的关键点在于外部存储的配置。在之前的版本中，您可能会配置 Redis 存储如下：

__CODE_BLOCK_12__

在新的版本中，您应该使用 __INLINE_CODE_68__ 适配器来配置存储：

__CODE_BLOCK_13__

其中 __INLINE_CODE_69__ 来自 __INLINE_CODE_70__ 包。请查看 __LINK_113__以了解更多信息。> 警告 **Warning** 本次更新中，Keyv 库处理的缓存数据现在结构化为一个对象，其中包含 __INLINE_CODE_71__ 和 __INLINE_CODE_72__ 字段，例如：__INLINE_CODE_73__。虽然 Keyv 自动检索 __INLINE_CODE_74__ 字段通过其 API 访问数据，但是请注意这个变化如果您直接访问缓存数据（例如，outside of 缓存管理器 API）或需要支持使用之前版本的 __INLINE_CODE_75__ 写入的数据。

#### 配置模块

如果您使用了 __INLINE_CODE_76__ 从 __INLINE_CODE_77__ 包中，那么请注意 __INLINE_CODE_78__ 中引入的一些breaking changes。最重要的是，config 方法读取配置变量的顺序已经更新。新的顺序是：

- 内部配置（config 命名空间和自定义配置文件）
- 验证的环境变量（如果验证启用且提供了 schema）
- __INLINE_CODE_80__ 对象

之前，验证的环境变量和 __INLINE_CODE_81__ 对象被读取首先，防止它们被内部配置所覆盖。现在，内部配置将始终优先于环境变量。

此外， __INLINE_CODE_82__ 配置选项，之前允许禁用 __INLINE_CODE_83__ 对象的验证，现在已经被弃用。相反，使用 __INLINE_CODE_84__ 选项（将其设置为 __INLINE_CODE_85__ Disable validation of predefined environment variables）Predefined environment variables 指的是在模块被导入前设置的 __INLINE_CODE_86__ 变量。例如，如果您在应用程序启动时设置 __INLINE_CODE_87__，那么 __INLINE_CODE_88__ 变量将被认为是预定义的。然而，通过 __INLINE_CODE_89__ 从 __INLINE_CODE_90__ 文件加载的变量不被视为预定义的。

还引入了一个新的 __INLINE_CODE_91__ 选项。这项选项允许您防止 __INLINE_CODE_92__ 方法访问 __INLINE_CODE_93__ 对象，哪怕是从环境变量中。这可以在您想要限制服务从直接访问环境变量时非常有用。

#### 终点模块

如果您使用 __INLINE_CODE_94__ 并已经构建了自定义健康指标，那么版本 11 中引入了一个新的 API。新的 __INLINE_CODE_95__ 是为了提高自定义健康指标的可读性和可测试性。

在版本 11 之前，健康指标可能如下所示：

__CODE_BLOCK_14__

从版本 11 开始，建议使用新的 __INLINE_CODE_96__ API，这将简化实现过程。下面是同一个健康指标现在可以实现的方式：

__CODE_BLOCK_15__

主要变化：

- __INLINE_CODE_97__ 替换了遗留的 __INLINE_CODE_98__ 和 __INLINE_CODE_99__ 类，提供了一种更简洁的 API 来实现健康检查。
- __INLINE_CODE_100__ 方法允许轻松跟踪状态(__INLINE_CODE_101__ 或 __INLINE_CODE_102__)同时支持在健康检查响应中包括额外的元数据。

> 信息 **Info** 请注意 __INLINE_CODE_103__ 和 __INLINE_CODE_104__ 类已经被标记为弃用，并且将在下一个主要版本中被删除。

#### Node.js v16 和 v18 不再支持

从 NestJS 11 开始，Node.js v16 不再支持，因为它已经达到末日（EOL）于 2023 年 9 月 11 日。同样，Node.js v18 的安全支持将于 2025 年 4 月 30 日结束，因此我们已经将支持 Node.js v16 和 v18 结束了。

NestJS 11 现在需要 **Node.js v20 或更高版本**。

为了确保最佳体验，我们强烈建议使用最新的 LTS 版本 Node.js。

#### Mau 官方部署平台

如果您错过了宣布，我们在 2024 年推出了我们的官方部署平台，__LINK_114__。
Mau 是一个完全托管的平台，它简化了 NestJS 应用程序的部署过程。使用 Mau，可以将应用程序部署到云（AWS；Amazon Web Services）中，管理环境变量，并实时监控应用程序的性能。

Mau 使得配置和维护基础架构变得简单，就像点击几个按钮一样。Mau 设计得很简单和直观，所以您可以专注于构建应用程序，而不是担心基础架构。我们使用 Amazon Web Services 提供您强大的和可靠的平台，同时将所有复杂性抽象化。我们为您处理所有繁重的工作，所以您可以专注于构建应用程序和增长业务。

__CODE_BLOCK_16__

您可以了解更多关于 Mau 的信息 __LINK_115__。
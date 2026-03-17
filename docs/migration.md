<!-- 此文件从 content/migration.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:28:02.096Z -->
<!-- 源文件: content/migration.md -->

### 迁移指南

本文提供了从 NestJS 10 到 11 的全面指南。为了了解 v11 中引入的新功能，请查看 __LINK_105__。虽然更新包括少量的breaking changes，但它们对大多数用户不太可能产生影响。您可以查看完整的更改列表 __LINK_106__。

#### 更新包

虽然您可以手动更新包，但我们建议使用 __LINK_107__ 进行更流畅的更新过程。

#### Express v5

Express v5 在 2024 年正式发布，并在 2025 年成为稳定版本。NestJS 11 现在使用 Express v5 作为默认版本集成到框架中。虽然这更新对大多数用户来说是无缝的，但请注意 Express v5 引入了一些breaking changes。请查看 __LINK_108__ 获取详细指南。

Express v5 的一个最显著的更新是重新设计的路径路由匹配算法。以下是路径字符串与 incoming 请求之间的匹配方式的变化：

-wildcard ``data`` 必须具有名称，匹配参数的行为：使用 ``any`` 或 ``@Body()`` 替代 ``@Param()``。 ``@Query()`` 是 wildcard 参数的名称，它没有特殊含义。您可以将其命名为任何名称，例如 ``user``
-optional 字符 ``validateCustomDecorators`` 不再支持，使用括号代替：``ValidationPipe``
-Regexp 字符不支持
-某些字符已经被保留以避免在升级过程中混淆 ``@Auth()``，使用 ``@ApiHideProperty()`` 进行转义
-参数名称现在支持有效的 JavaScript 标识符，也可以像 ``@nestjs/swagger`` 一样使用引号

然而， Express v4 中之前工作的路由可能不再在 Express v5 中工作。例如：

```typescript
const user = req.user;

```

要解决这个问题，您可以更新路由以使用命名 wildcard：

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

```

> warning **Warning** ``applyDecorators`` 是一个命名 wildcard，它匹配任何路径不包括根路径。如果您需要匹配根路径（`__INLINE_CODE_29__`），可以使用 `__INLINE_CODE_30__`，将 wildcard 包括在括号中（可选组）。请注意 `__INLINE_CODE_31__` 只是 wildcard 参数的名称，它没有特殊含义。您可以将其命名为任何名称，例如 `__INLINE_CODE_32__`

类似地，如果您有一个在所有路由上运行的中间件，您可能需要更新路径以使用命名 wildcard：

```typescript
@Get()
async findOne(@User() user: UserEntity) {
  console.log(user);
}

```

相反，您可以更新路径以使用命amed wildcard：

```json
{
  "id": 101,
  "firstName": "Alan",
  "lastName": "Turing",
  "email": "alan@email.com",
  "roles": ["admin"]
}

```

请注意 `__INLINE_CODE_33__` 是一个命名 wildcard，它匹配任何路径包括根路径。外部括号使路径可选。

#### 查询参数解析

> info **Note** 这个变化只适用于 Express v5。

在 Express v5 中，查询参数不再使用 `__INLINE_CODE_34__` 库进行解析，而是使用 `__INLINE_CODE_35__` 解析器，这个解析器不支持嵌套对象或数组。

因此，查询字符串，如这些：

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

将不再被解析为预期结果。要恢复到之前的行为，可以将 Express 配置为使用 `__INLINE_CODE_36__` 解析器（Express v4 的默认值）并将 `__INLINE_CODE_37__` 选项设置为 `__INLINE_CODE_38__`：

```typescript
@Get()
async findOne(@User('firstName') firstName: string) {
  console.log(`Hello ${firstName}`);
}

```

#### Fastify v5

__INLINE_CODE_39__ v11 现在支持 Fastify v5。这个更新对大多数用户来说应该是无缝的，但 Fastify v5 引入了一些breaking changes，这些变化对大多数 NestJS 用户来说并不太可能产生影响。请查看 __LINK_109__ 获取详细信息。

> info **Hint** 在 Fastify v5 中，没有对路径匹配的变化（除了中间件，见下面），因此您可以继续使用 wildcard 语法就像之前一样。行为保持不变，使用 wildcard 定义的路由（例如 `__INLINE_CODE_40__`）将继续工作。

#### Fastify CORS

默认情况下，只允许 __LINK_110__ 方法。如果您需要启用其他方法（例如 `__INLINE_CODE_41__`、`__INLINE_CODE_42__` 或 `__INLINE_CODE_43__`），您必须在 `__INLINE_CODE_44__` 选项中显式定义它们。

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

NestJS 11 现在使用最新版本的 __LINK_111__ 包来匹配 **middleware paths** 在 `__INLINE_CODE_45__` 中。因此， `__INLINE_CODE_46__` 语法用于匹配所有路径不再支持。相反，您应该使用命名 wildcard。

例如，如果您有一个在所有路由上运行的中间件：

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

您需要更新它以使用命名 wildcard：

```typescript
@Get('users')
@Auth('admin')
findAllUsers() {}

```

其中 `__INLINE_CODE_47__` 只是 wildcard 参数的名称，它没有特殊含义。您可以将其命名为任何名称。

#### 模块解析算法Here is the translation of the provided English technical documentation to Chinese:

Starting with NestJS 11，模块解析算法已经被改进，以提高性能和减少大多数应用程序的内存使用量。这改进不需要任何 manual intervention，但是在某些边缘情况下，行为可能与之前的版本不同。

在 NestJS v10 及之前，动态模块将分配一个唯一的不可预测键，这个键根据模块的动态元数据生成。例如，如果你在多个模块中包含 __INLINE_CODE_48__，NestJS 将对模块进行deduplication，视为单个模块节点在注册表中。这过程称为节点deduplication。

从 NestJS v11 开始，我们不再生成可预测的哈希值来确定动态模块。在代替中，我们使用对象引用来确定一个模块是否等同于另一个模块。为了在多个模块中共享同一个动态模块，只需将其分配给一个变量，然后在需要的地方导入。这新的approach 提供了更多的灵活性，并确保动态模块被处理得更加高效。

这个新的算法可能会影响您的集成测试，因为在没有手动deduplication的情况下，您的 TestingModule 可能会有多个依赖项的实例。这使得您需要target正确的实例 stub 一个方法，因为您需要 target 的正确实例。您的选项是：

* Deduplicate 您想要 stub 的动态模块
* 使用 __INLINE_CODE_49__ 找到正确的实例
* 使用 __INLINE_CODE_50__ stub 所有实例
* 或者切换回旧的算法使用 __INLINE_CODE_51__

#### 反射类型推断

NestJS 11 引入了多项改进，以提高 __INLINE_CODE_52__ 类的功能和类型推断能力。这些建议为 metadata 值提供了更直观和更 robust 的体验。

1. __INLINE_CODE_53__ 现在返回对象，而不是包含单个元数据项的数组，且元数据类型为 __INLINE_CODE_55__。这改进了在处理对象元数据时的一致性。
2. __INLINE_CODE_56__ 的返回类型已被更新为 __INLINE_CODE_57__ 而不是 __INLINE_CODE_58__。这改进了在元数据不存在时的处理。
3. __INLINE_CODE_59__ 的转换类型参数现在被正确地推断到所有方法中。

这些改进提高了开发者的体验，提供了更好的类型安全和元数据处理能力。

#### 生命周期钩子执行顺序

现在，终止生命周期钩子将在它们的初始化对应项执行顺序的反序中执行。例如，__INLINE_CODE_60__、__INLINE_CODE_61__ 和 __INLINE_CODE_62__ 现在将在反序中执行。

想象以下场景：

__CODE_BLOCK_9__

在这个场景中，__INLINE_CODE_63__ 钩子将在以下顺序中执行：

__CODE_BLOCK_10__

而 __INLINE_CODE_64__ 钩子将在反序中执行：

__CODE_BLOCK_11__

> info **Hint** 全局模块将被视为所有其他模块的依赖项。这意味着全局模块将在初始化时被初始化，并在销毁时被销毁。

#### 中间件注册顺序

从 NestJS v11 开始，中间件注册的行为已经被更新。在之前的版本中，中间件注册的顺序是由模块依赖关系图的拓扑排序确定的，而不是中间件是否在全局模块或常规模块中注册的顺序。全局模块被视为常规模块，这导致了不一致的行为，特别是在与其他框架特性的比较中。

从 v11 开始，中间件在全局模块中注册将在模块依赖关系图的拓扑排序中执行，忽略中间件在模块中注册的顺序。这改进了中间件的注册顺序，使其保持了一致和可预测的顺序。

#### 缓存模块

__INLINE_CODE_65__（来自 __INLINE_CODE_66__ 包）已经被更新，以支持最新版本的 __INLINE_CODE_67__ 包。这更新带来了几个Breaking Change，包括迁移到 __LINK_112__，它提供了统一的键值存储界面，跨多个后端存储通过存储适配器提供。

关键区别在于外部存储的配置。在之前的版本中，为了注册 Redis 存储，您可能配置像这样：

__CODE_BLOCK_12__

在新的版本中，您应该使用 __INLINE_CODE_68__ 适配器来配置存储：

__CODE_BLOCK_13__

其中 __INLINE_CODE_69__ 是来自 __INLINE_CODE_70__ 包的导入。查看 __LINK_113__ 以了解更多信息。> 警告 **Warning** 在本次更新中，Keyv 库处理的缓存数据现在结构化为一个包含 __INLINE_CODE_71__ 和 __INLINE_CODE_72__ 字段的对象，例如：__INLINE_CODE_73__。虽然 Keyv 自动检索 __INLINE_CODE_74__ 字段通过其 API 访问数据，但请注意这个更改，如果您直接访问缓存数据（例如，outside of 缓存管理器 API）或需要支持使用上一个版本的 __INLINE_CODE_75__ 写入的数据。

#### 配置模块

如果您使用的 __INLINE_CODE_76__ 从 __INLINE_CODE_77__ 包含在内，请注意在 __INLINE_CODE_78__ 中引入的breaking changes。最重要的是，配置变量的读取顺序在 __INLINE_CODE_79__ 方法中已被更新。新的顺序是：

- 内部配置（config 命名空间和自定义配置文件）
- 验证的环境变量（如果启用验证且提供了schema）
- __INLINE_CODE_80__ 对象

以前，验证的环境变量和 __INLINE_CODE_81__ 对象将被读取，防止它们被内部配置所覆盖。现在，内部配置将总是优先于环境变量。

此外， __INLINE_CODE_82__ 配置选项，之前可以禁用 __INLINE_CODE_83__ 对象的验证，现在已经被弃用。相反，使用 __INLINE_CODE_84__ 选项（将其设置为 __INLINE_CODE_85__ 禁用预定义环境变量的验证）。预定义环境变量是指在模块被导入之前设置的变量。例如，如果您使用 __INLINE_CODE_87__ 启动应用程序，那么 __INLINE_CODE_88__ 变量将被视为预定义变量。然而，从 __INLINE_CODE_90__ 文件中加载的变量不是预定义变量。

新的 __INLINE_CODE_91__ 选项也被引入。这个选项允许您禁止 __INLINE_CODE_92__ 方法访问 __INLINE_CODE_93__ 对象，这可以在您想要限制服务从直接访问环境变量时非常有用。

#### 终止模块

如果您使用 __INLINE_CODE_94__ 并且已经创建了自定义健康指示器，新的 API 在版本 11 中被引入。新的 __INLINE_CODE_95__ 是为了提高自定义健康指示器的可读性和可测试性。

在版本 11 之前，健康指示器可能看起来像这样：

__CODE_BLOCK_14__

从版本 11 开始，建议使用新的 __INLINE_CODE_96__ API，这可以简化实现过程。下面是相同健康指示器的实现方式：

__CODE_BLOCK_15__

关键变化：

- __INLINE_CODE_97__ 替代了 legacy __INLINE_CODE_98__ 和 __INLINE_CODE_99__ 类，提供了更清洁的健康检查 API。
- __INLINE_CODE_100__ 方法允许简单地跟踪状态（__INLINE_CODE_101__ 或 __INLINE_CODE_102__），同时支持在健康检查响应中包含额外的metadata。

> 信息 **Info** 请注意， __INLINE_CODE_103__ 和 __INLINE_CODE_104__ 类已经被标记为弃用，并且将在下一个主要版本中删除。

#### Node.js v16 和 v18 不再支持

从 NestJS 11 开始，Node.js v16 不再支持，因为它于 2023 年 9 月 11 日到期。类似地，Node.js v18 的安全支持将于 2025 年 4 月 30 日到期，所以我们决定放弃对它的支持。

NestJS 11 现在要求 **Node.js v20 或更高**。

为了确保最佳体验，我们强烈建议使用最新的 LTS 版本的 Node.js。

#### Mau 官方部署平台

如果您错过了公告，我们在 2024 年推出了官方部署平台，__LINK_114__。Mau 是一个完全托管的平台，简化了 NestJS 应用程序的部署过程。使用 Mau，您可以将应用程序部署到云中（AWS；Amazon Web Services）单个命令中，管理环境变量，并实时监控应用程序的性能。

Mau 使得创建和维护基础设施变得简单和直观，您可以专注于构建应用程序，而不是担心基础设施的复杂性。我们使用 Amazon Web Services 在底层提供了一个强大和可靠的平台，同时将所有复杂性抽象化。我们为您处理了所有重大的工作，您可以专注于构建应用程序和增长业务。

__CODE_BLOCK_16__

您可以了解更多关于 Mau 的信息__LINK_115__。
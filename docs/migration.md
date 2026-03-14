<!-- 此文件从 content/migration.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:19:48.233Z -->
<!-- 源文件: content/migration.md -->

### Migration Guide

本文提供了从 NestJS 版本 10 到版本 11 的全面指南。要了解 v11 中引入的新功能，请查看 __LINK_105__。虽然升级过程中出现了一些小Breaking Changes，但它们对大多数用户来说都是无关紧要的。你可以查看 __LINK_106__ 获取完整的变更列表。

#### 升级包

虽然你可以手动升级你的包，但我们强烈建议使用 __LINK_107__ 来实现更加流畅的升级过程。

#### Express v5

Express v5 在 2024 年正式发布，并在 2025 年成为稳定版本。NestJS 11 中，Express v5 现已成为框架的默认版本。虽然这更新对大多数用户来说都是无缝的，但请注意 Express v5 引入了一些 Breaking Changes。请查看 __LINK_108__ 获取详细的指导。

Express v5 中最大的更新之一是重新设计的路径路由匹配算法。以下是路径字符串与 incoming 请求之间匹配的变化：

* wildcard `data` 必须具有名称，类似于参数的行为：使用 `any` 或 `@Body()` 而不是 `@Param()`。 `@Query()` 是 wildcard 参数的名称，并没有特别的含义。你可以将其命名为任何你喜欢的名称，例如 `user`。
* optional 字符 `validateCustomDecorators` 不再受支持，使用大括号代替：`ValidationPipe`。
* Regexp 字符不受支持。
*一些字符已被保留以避免在升级过程中混淆 `@Auth()`，使用 `@ApiHideProperty()` 将其转义。
* 参数名称现在支持有效的 JavaScript 标识符或引号，如 `@nestjs/swagger`。

然而，之前在 Express v4 中工作的路由可能无法在 Express v5 中工作。例如：

```typescript
const user = req.user;

```

要解决这个问题，你可以更新路由以使用命名 wildcard：

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

```

> warning **Warning** `applyDecorators` 是一个名为的 wildcard，它匹配任何路径除了根路径。如果你需要匹配根路径(__INLINE_CODE_29__),你可以使用 __INLINE_CODE_30__，将 wildcard 包围在大括号中（可选组）。请注意 __INLINE_CODE_31__ 是 wildcard 参数的名称，并没有特别的含义。你可以将其命名为任何你喜欢的名称，例如 __INLINE_CODE_32__。

类似地，如果你有一个 middleware，它在所有路由上运行，你可能需要更新路径以使用命名 wildcard：

```typescript
@Get()
async findOne(@User() user: UserEntity) {
  console.log(user);
}

```

而是可以更新路径以使用命名 wildcard：

```json
{
  "id": 101,
  "firstName": "Alan",
  "lastName": "Turing",
  "email": "alan@email.com",
  "roles": ["admin"]
}

```

请注意 __INLINE_CODE_33__ 是一个名为的 wildcard，它匹配任何路径包括根路径。外部大括号使路径可选。

#### 查询参数解析

> info **Note** 仅限于 Express v5。

在 Express v5 中，查询参数不再使用 __INLINE_CODE_34__ 库进行解析，而是使用 __INLINE_CODE_35__ 解析器，该解析器不支持嵌套对象或数组。

因此，查询字符串如下：

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

将不再按预期解析。要恢复之前的行为，可以配置 Express 使用 __INLINE_CODE_36__ 解析器（Express v4 的默认值）并将 __INLINE_CODE_37__ 选项设置为 __INLINE_CODE_38__：

```typescript
@Get()
async findOne(@User('firstName') firstName: string) {
  console.log(`Hello ${firstName}`);
}

```

#### Fastify v5

__INLINE_CODE_39__ v11 现已支持 Fastify v5。这更新对大多数用户来说都是无缝的，但是 Fastify v5 引入了一些 Breaking Changes，但这些变化对大多数 NestJS 用户来说都是无关紧要的。请查看 __LINK_109__ 获取详细信息。

> info **Hint** 在 Fastify v5 中，没有对路径匹配的变化（except for middleware，请查看下一节），因此你可以继续使用 wildcards 的语法，路由定义的 wildcards（如 __INLINE_CODE_40__）将继续工作。

#### Fastify CORS

默认情况下，仅允许 __LINK_110__ 方法。如果你需要启用额外的方法（例如 __INLINE_CODE_41__、__INLINE_CODE_42__ 或 __INLINE_CODE_43__），你必须在 __INLINE_CODE_44__ 选项中明确地定义它们。

```typescript
@Get()
async findOne(
  @User(new ValidationPipe({ validateCustomDecorators: true }))
  user: UserEntity,
) {
  console.log(user);
}

```

#### Fastify middleware registration

NestJS 11 现在使用最新版本的 __LINK_111__ 包来匹配 middleware 路径在 __INLINE_CODE_45__ 中。因此，__INLINE_CODE_46__ 语法用于匹配所有路径不再受支持。相反，你应该使用命名 wildcards。

例如，如果你有一个 middleware，它应用于所有路由：

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

你需要更新它以使用命名 wildcard：

```typescript
@Get('users')
@Auth('admin')
findAllUsers() {}

```

其中 __INLINE_CODE_47__ 是 wildcard 参数的名称。你可以将其命名为任何你喜欢的名称。

#### 模块解析算法Here is the translation of the provided English technical documentation to Chinese:

**NestJS 11 中的模块解析算法改进**

从 NestJS 11 开始，模块解析算法已经被改进，以提高性能和减少大多数应用程序的内存使用量。这次改进不需要任何 manual intervention，但有一些边缘情况可能会与之前版本的行为不同。

**动态模块的变化**

在 NestJS v10 及更早版本中，动态模块被分配了一个唯一的不可读取的密钥，这个密钥用于在模块注册表中标识模块。例如，如果你在多个模块中包含 __INLINE_CODE_48__，NestJS 将对模块进行deduplication，并将它们视为一个单个模块节点在注册表中。这是一个称为节点deduplication的过程。

从 NestJS v11 开始，我们不再为动态模块生成可预测的哈希，而是使用对象引用来确定一个模块是否等同于另一个模块。要在多个模块之间共享同一个动态模块，只需将其赋值给一个变量，然后在需要的地方导入它。这、新方法提供了更大的灵活性，并确保动态模块被处理得更加高效。

**反射类型推断**

NestJS 11 引入了一些改进，提高了 __INLINE_CODE_52__ 类的功能和类型推断能力，用于metadata值。这些建议提供了更直观和更加robust的体验，用于在metadata中工作。

1. __INLINE_CODE_53__ 现在返回一个对象，而不是包含一个单个元素的数组，如果只有一个metadata项，并且 __INLINE_CODE_54__ 的类型为 __INLINE_CODE_55__。这改变了对object-based metadata的一致性处理。
2. __INLINE_CODE_56__ 的返回类型已经被更新为 __INLINE_CODE_57__ 而不是 __INLINE_CODE_58__。这更新反映了可能没有metadata的情况，并确保了undefined情况的正确处理。
3. __INLINE_CODE_59__ 的转换类型参数现在被正确地推断到所有方法。

这些改进提高了开发体验，提供了更好的类型安全和metadata处理能力。

**生命周期钩子执行顺序**

终止生命周期钩子现在在它们的初始化对等项之前执行。从而，钩子 __INLINE_CODE_60__、__INLINE_CODE_61__ 和 __INLINE_CODE_62__ 现在在反向顺序执行。

想象一下这个场景：

__CODE_BLOCK_9__

在这个场景中，__INLINE_CODE_63__ 钩子执行顺序如下：

__CODE_BLOCK_10__

而 __INLINE_CODE_64__ 钩子执行顺序如下：

__CODE_BLOCK_11__

> info **提示** 全局模块被视为所有其他模块的依赖项。这意味着全局模块首先被初始化，然后最后被销毁。

**中间件注册顺序**

从 NestJS v11 开始，中间件注册的行为已经被更新。之前，中间件注册的顺序是根据模块依赖图的拓扑排序确定的，即使中间件是在全局模块或常规模块中注册的。全局模块被视为常规模块，这导致了不一致的行为，特别是在与其他框架特性相比。

从 v11 开始，中间件在全局模块中注册将被**首先执行**，无论其在模块依赖图中的位置。这改变确保了全局中间件总是先于任何中间件从导入模块中执行，保持了一致和可预测的顺序。

**缓存模块**

__INLINE_CODE_65__（来自 __INLINE_CODE_66__ 包）已经被更新，以支持最新版本的 __INLINE_CODE_67__ 包。这更新包括了一些Breaking Changes，包括迁移到 __LINK_112__，它提供了一个统一的接口来在多个后端存储中使用键值存储通过存储适配器。

之前版本和新的版本之间的主要区别在于外部存储的配置。在之前版本中，你可能会将 Redis 存储配置如下：

__CODE_BLOCK_12__

在新的版本中，你应该使用 __INLINE_CODE_68__ 适配器来配置存储：

__CODE_BLOCK_13__

其中 __INLINE_CODE_69__ 是来自 __INLINE_CODE_70__ 包的导入。更多信息请见 __LINK_113__。> 警告 **Warning** 在本次更新中，Keyv 库处理的缓存数据现在结构化为一个对象，其中包含 __INLINE_CODE_71__ 和 __INLINE_CODE_72__ 字段，例如： __INLINE_CODE_73__. 由于 Keyv 自动检索 __INLINE_CODE_74__ 字段，当通过其 API 访问数据时，它很重要，如果您直接访问缓存数据（例如，外部 cache-manager API）或需要支持使用前版本 __INLINE_CODE_75__ 写入的数据。

#### 配置模块

如果您使用了 __INLINE_CODE_76__ 从 __INLINE_CODE_77__ 包含文件中，请注意在 __INLINE_CODE_78__ 中引入的breaking changes。其中最重要的是 __INLINE_CODE_79__ 方法读取配置变量的顺序已经更新。新的顺序是：

- 内部配置（配置命名空间和自定义配置文件）
- 验证的环境变量（如果启用了验证且提供了 schema）
- __INLINE_CODE_80__ 对象

之前，验证的环境变量和 __INLINE_CODE_81__ 对象被读取的顺序为先读取，防止它们被内部配置所覆盖。现在，内部配置将始终优先于环境变量。

此外， __INLINE_CODE_82__ 配置选项，之前允许禁用 __INLINE_CODE_83__ 对象的验证，现在已被弃用。相反，请使用 __INLINE_CODE_84__ 选项（设置为 __INLINE_CODE_85__ 来禁用预定义环境变量的验证）。预定义环境变量指的是在模块导入前设置的环境变量。例如，如果您在启动应用程序时使用 __INLINE_CODE_87__,则 __INLINE_CODE_88__ 变量被认为是预定义的。然而，通过 __INLINE_CODE_89__ 从文件加载的变量不被分类为预定义的。

一个新的 __INLINE_CODE_91__ 选项已经被引入。这项选项允许防止 __INLINE_CODE_92__ 方法访问 __INLINE_CODE_93__ 对象，这可以在您想限制服务直接访问环境变量时非常有用。

#### 终点模块

如果您使用 __INLINE_CODE_94__ 并且构建了自己的自定义健康指示器，则在版本 11 中引入了新的 API。新的 __INLINE_CODE_95__ 设计用于增强自定义健康指示器的可读性和可测试性。

在版本 11 之前，健康指示器可能看起来像这样：

__CODE_BLOCK_14__

从版本 11 开始，建议使用新的 __INLINE_CODE_96__ API，这将简化实现过程。下面是在同一个健康指示器中实现的方式：

__CODE_BLOCK_15__

关键变化：

- __INLINE_CODE_97__ 取代了遗留的 __INLINE_CODE_98__ 和 __INLINE_CODE_99__ 类，提供了更干净的 API 来执行健康检查。
- __INLINE_CODE_100__ 方法允许轻松跟踪状态（__INLINE_CODE_101__ 或 __INLINE_CODE_102__）同时支持在健康检查响应中包含附加元数据。

> 信息 **Info** 请注意 __INLINE_CODE_103__ 和 __INLINE_CODE_104__ 类已经被标记为弃用，并且将在下一个主要版本中删除。

#### Node.js v16 和 v18 不再支持

从 NestJS 11 开始，Node.js v16 不再支持，因为它已经达到其生命周期（EOL）于 2023 年 9 月 11 日。同样，Node.js v18 的安全支持将于 2025 年 4 月 30 日结束，因此我们已经放弃了对它的支持。

NestJS 11 现在要求 **Node.js v20 或更高版本**。

为了确保最佳体验，我们强烈建议使用最新的 LTS 版本 Node.js。

#### Mau 官方部署平台

如果您错过了宣布，我们在 2024 年推出了我们的官方部署平台， __LINK_114__。Mau 是一个完全托管的平台，简化了 NestJS 应用程序的部署过程。使用 Mau，您可以使用单个命令部署应用程序到云中（AWS；Amazon Web Services），管理环境变量，并实时监控应用程序的性能。

Mau 使得配置和维护您的基础设施变得简单，如点击几个按钮。Mau 设计得很简单和直观，以便您可以专注于构建应用程序，而不是担心基础设施。我们使用 Amazon Web Services 在幕后提供了强大的和可靠的平台，同时抽象了所有 AWS 的复杂性。我们为您处理所有重复工作，使您可以专注于构建应用程序和增长您的业务。

__CODE_BLOCK_16__

您可以了解更多关于 Mau 的信息 __LINK_115__。
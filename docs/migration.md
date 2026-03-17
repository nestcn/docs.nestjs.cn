<!-- 此文件从 content/migration.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:00:39.599Z -->
<!-- 源文件: content/migration.md -->

### 迁移指南

本文提供了从 NestJS 版本 10 到版本 11 的全面的迁移指南。要了解 v11 中引入的新功能，请查看 __LINK_105__。虽然更新包括少数 Breaking Changes，但它们对大多数用户来说并无影响。您可以查看完整的更改列表 __LINK_106__。

#### 升级包

虽然您可以手动升级包，但我们建议使用 __LINK_107__ 进行更流畅的升级过程。

#### Express v5

Express v5 于 2024 年发布，2025 年稳定版本。NestJS 11 现在将 Express v5 作为默认版本集成到框架中。虽然这次更新对大多数用户来说是顺滑的，但需要注意 Express v5 引入的 Breaking Changes。请查看 __LINK_108__ 获取详细的指南。

Express v5 中的一个最显著的更新是$path路由匹配算法的修改。以下是在路径字符串与 incoming 请求之间匹配的变化：

- wildcard `data` 需要有名称，遵循参数的行为：使用 `any` 或 `@Body()` 而不是 `@Param()`。`@Query()` 是 wildcard 参数的名称，具有无特殊含义。您可以将其命名为任何内容，例如 `user`
- 可选字符 `validateCustomDecorators` 不再支持，使用括号而不是 `ValidationPipe`。
- Regexp 字符不支持。
- 些字符已被保留以避免升级时的混淆 `@Auth()`，使用 `@ApiHideProperty()` 进行转义。
- 参数名称现在支持有效的 JavaScript标识符或被引号 `@nestjs/swagger`。

需要注意的是，Express v4 中工作的路由可能在 Express v5 中不工作。例如：

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

> warning **Warning** 请注意 `applyDecorators` 是一个命名 wildcard，匹配任何路径除根路径外。如果您需要匹配根路径 __INLINE_CODE_29__，可以使用 __INLINE_CODE_30__，将 wildcard 包含在括号中（可选组）。请注意 __INLINE_CODE_31__ 是 wildcard 参数的名称，具有无特殊含义。您可以将其命名为任何内容，例如 __INLINE_CODE_32__。

类似地，如果您有一个运行于所有路由的中间件，您可能需要更新路径以使用命名 wildcard：

```typescript
@Get()
async findOne(@User() user: UserEntity) {
  console.log(user);
}

```

相反，您可以更新路径以使用命名 wildcard：

```json
{
  "id": 101,
  "firstName": "Alan",
  "lastName": "Turing",
  "email": "alan@email.com",
  "roles": ["admin"]
}

```

请注意 __INLINE_CODE_33__ 是一个命名 wildcard，匹配任何路径包括根路径。外部括号使路径可选。

#### 查询参数解析

> info **Note** 这个更改只适用于 Express v5。

在 Express v5 中，查询参数不再使用 __INLINE_CODE_34__ 库默认进行解析，而是使用 __INLINE_CODE_35__ 解析器，这个解析器不支持嵌套对象或数组。

因此，查询字符串，如下所示：

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

将不再被解析为预期的内容。要恢复到前一个行为，可以配置 Express 使用 __INLINE_CODE_36__ 解析器（Express v4 的默认解析器）并将 __INLINE_CODE_37__ 选项设置为 __INLINE_CODE_38__：

```typescript
@Get()
async findOne(@User('firstName') firstName: string) {
  console.log(`Hello ${firstName}`);
}

```

#### Fastify v5

NestJS 11 现在支持 Fastify v5。这个更新对大多数用户来说是顺滑的，但 Fastify v5 引入了少数 Breaking Changes，影响较少的用户。请查看 __LINK_109__ 获取详细信息。

> info **Hint** Fastify v5 中没有对路径匹配的变化（除了中间件，见下一节），因此您可以继续使用 wildcard 语法，行为保持不变，使用 wildcard 定义的路由（如 __INLINE_CODE_40__）仍将工作正常。

#### Fastify CORS

默认情况下，只允许 __LINK_110__ 方法。如果您需要启用其他方法（例如 __INLINE_CODE_41__, __INLINE_CODE_42__, 或 __INLINE_CODE_43__），您必须在 __INLINE_CODE_44__ 选项中明确定义它们。

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

NestJS 11 现在使用最新版本的 __LINK_111__ 包来匹配 **中间件路径** 在 __INLINE_CODE_45__ 中。结果， __INLINE_CODE_46__ 语法用于匹配所有路径不再支持。相反，您应该使用命名 wildcard。

例如，如果您有一个应用于所有路由的中间件：

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

您需要将其更新为使用命名 wildcard：

```typescript
@Get('users')
@Auth('admin')
findAllUsers() {}

```

其中 __INLINE_CODE_47__ 是 wildcard 参数的名称，您可以将其命名为任何内容。

#### 模块解析算法

(待续)以下是翻译后的中文文档：

**NestJS 11 中的模块解析算法改进**

从 NestJS 11 开始，模块解析算法已经改进，以提高性能和减少大多数应用程序的内存使用。这不需要任何手动干预，但是在某些边缘情况下，行为可能与之前的版本不同。

在 NestJS v10 及更早版本中，动态模块被分配了一个唯一的不可预测的键，用于标识模块在模块注册表中的位置。例如，如果你在多个模块中包含 __INLINE_CODE_48__，NestJS 将对模块进行节点去重， treat them as a single module node in the registry。这一过程称为节点去重。

从 NestJS v11 开始，我们不再为动态模块生成可预测的哈希值，而是使用对象引用来确定一个模块是否等于另一个模块。要在多个模块中共享同一个动态模块，只需将其分配给一个变量，并在需要的地方导入它。这一新方法提供了更多的灵活性，并确保动态模块被处理得更好。

这个新算法可能会影响你的集成测试，如果你使用了很多动态模块，因为没有手动去重， TestingModule 可能会有多个依赖项的实例。这使得 Stub 方法变得更难，因为你需要目标正确的实例。你有以下几个选择：

* 去重你想 Stub 的动态模块
* 使用 __INLINE_CODE_49__ 来找到正确的实例
* Stub 所有实例使用 __INLINE_CODE_50__
* 或者.switch 回到老的算法使用 __INLINE_CODE_51__

**Reflector 类型推断**

NestJS 11 引入了对 __INLINE_CODE_52__ 类的改进，增强了其功能和类型推断能力，这些更新提供了一种更直观和robust 的体验，当工作于 metadata 时。

1. __INLINE_CODE_53__ 现在返回一个对象，而不是一个包含单个元素的数组，如果 metadata 只有一个入口，并且 __INLINE_CODE_54__ 是 __INLINE_CODE_55__ 类型。这一变化改进了处理对象-基于 metadata 的一致性。
2. __INLINE_CODE_56__ 的返回类型现在是 __INLINE_CODE_57__，而不是 __INLINE_CODE_58__。这 Updates better reflects the possibility of no metadata being found and ensures proper handling of undefined cases.
3. __INLINE_CODE_59__ 的转换类型参数现在被正确推断到所有方法中。

这些改进提高了开发体验，提供了更好的类型安全和 metadata 处理能力。

**生命周期钩子执行顺序**

现在，生命周期钩子在其初始化对应的反向顺序执行。例如， __INLINE_CODE_60__、__INLINE_CODE_61__ 和 __INLINE_CODE_62__ 现在在反向顺序执行。

想象以下场景：

__CODE_BLOCK_9__

在这个场景中，__INLINE_CODE_63__ 钩子执行顺序如下：

__CODE_BLOCK_10__

而 __INLINE_CODE_64__ 钩子执行顺序如下：

__CODE_BLOCK_11__

> info **提示** 全局模块被 tratied as 依赖项的所有其他模块。这意味着全局模块首先被初始化，然后最后被销毁。

**中间件注册顺序**

从 NestJS v11 开始，中间件注册行为已经被更新。以前，中间件注册顺序是根据模块依赖关系图的拓扑排序确定的，这其中，距离根模块的距离定义了中间件注册顺序，而不考虑中间件是否注册在全局模块中。全局模块被 tratied like regular modules 在这个方面，这导致了不一致的行为，especially when compared to other framework features。

从 v11 开始，注册在全局模块中的中间件现在将 **首先执行**，regardless of its position in the module dependency graph。这一变化确保了全局中间件总是先于来自导入模块的中间件运行，保持了一致和可预测的顺序。

**缓存模块**

__INLINE_CODE_65__ (来自 __INLINE_CODE_66__ 包) 已经更新，以支持最新版本的 __INLINE_CODE_67__ 包。这一更新带来了几个breaking changes，包括对 __LINK_112__ 的迁移，这提供了一个统一的接口来通过存储适配器在多个后端存储中管理键值。

关键区别在于外部存储的配置。在前一个版本中，你可能会配置 Redis 存储如下：

__CODE_BLOCK_12__

在新的版本中，你应该使用 __INLINE_CODE_68__ 适配器来配置存储：

__CODE_BLOCK_13__

其中 __INLINE_CODE_69__ 来自 __INLINE_CODE_70__ 包。查看 __LINK_113__ 以了解更多信息。> 警告 **警告** 在本次更新中，Keyv 库处理的缓存数据现在结构化为一个对象，其中包括 __INLINE_CODE_71__ 和 __INLINE_CODE_72__字段，例如：__INLINE_CODE_73__。虽然 Keyv 自动检索 __INLINE_CODE_74__ 字段通过其 API 访问数据，但请注意这个变化，如果您直接访问缓存数据（例如，outside of cache-manager API）或需要支持使用前版本 __INLINE_CODE_75__ 写入的数据。

#### 配置模块

如果您使用来自 __INLINE_CODE_77__ 包的 __INLINE_CODE_76__，请注意在 __INLINE_CODE_78__ 中引入的多个breaking changes。其中最重要的是，__INLINE_CODE_79__ 方法读取配置变量的顺序已经更新。新的顺序是：

- 内部配置（config namespaces 和自定义配置文件）
- 验证的环境变量（如果validation启用并提供了 schema）
- __INLINE_CODE_80__ 对象

以前，验证的环境变量和 __INLINE_CODE_81__ 对象将在读取配置变量之前被读取，从而 prevented them from being overridden by internal configuration。现在，internal configuration 将总是优先于环境变量。

此外，__INLINE_CODE_82__ 配置选项，之前允许禁用 __INLINE_CODE_83__ 对象的验证，现在已经被弃用。取而代之的是，使用 __INLINE_CODE_84__ 选项（将其设置为 __INLINE_CODE_85__ 来禁用预定义环境变量的验证）。预定义环境变量指的是在模块被导入前设置的变量，例如，如果您以 __INLINE_CODE_87__ 启动应用程序，__INLINE_CODE_88__ 变量将被认为是预定义的。但是，通过 __INLINE_CODE_89__ 从 __INLINE_CODE_90__ 文件加载的变量不被视为预定义的。

一个新的 __INLINE_CODE_91__ 选项也被引入。这个选项允许您防止 __INLINE_CODE_92__ 方法访问 __INLINE_CODE_93__ 对象，这可以在您想要限制服务从直接访问环境变量时很有帮助。

#### 终止模块

如果您使用 __INLINE_CODE_94__ 并构建了自己的自定义健康指标，一些新的 API 在版本 11 中被引入。新的 __INLINE_CODE_95__ 设计用于增强自定义健康指标的可读性和可测试性。

在版本 11 之前，一个健康指标可能看起来像这样：

__CODE_BLOCK_14__

从版本 11 开始，建议使用新的 __INLINE_CODE_96__ API，这可以简化实现过程。下面是在同一个健康指标现在可以实现的示例：

__CODE_BLOCK_15__

关键变化：

- __INLINE_CODE_97__ 替代了 legacy __INLINE_CODE_98__ 和 __INLINE_CODE_99__ 类，提供了更干净的 API 来实现健康检查。
- __INLINE_CODE_100__ 方法允许轻松追踪状态（__INLINE_CODE_101__ 或 __INLINE_CODE_102__）同时支持在健康检查响应中包含附加元数据。

> 信息 **信息** 请注意，__INLINE_CODE_103__ 和 __INLINE_CODE_104__ 类已经被标记为弃用，并且将在下一个主要版本中被删除。

#### Node.js v16 和 v18 不再支持

从 NestJS 11 开始，Node.js v16 不再支持，因为它已经到达了 EOL（end-of-life），日期为 2023 年 9 月 11 日。类似地，Node.js v18 的安全支持将于 2025 年 4 月 30 日到期，所以我们已经将其支持也 drops。

NestJS 11 现在需要 **Node.js v20 或更高版本**。

为了确保最佳体验，我们强烈建议使用最新的 LTS 版本 Node.js。

#### Mau 官方部署平台

如果您错过了宣布，我们在 2024 年推出了我们的官方部署平台，__LINK_114__。Mau 是一个完全管理的平台，它简化了 NestJS 应用程序的部署过程。使用 Mau，您可以将应用程序部署到云（AWS；Amazon Web Services）中，以单个命令形式管理环境变量，并实时监控应用程序的性能。

Mau 使得配置和维护基础设施变得简单，只需要点击几个按钮。Mau 设计用于简单和直观，以便您可以专注于构建应用程序，而不是担心底层基础设施。实际上，我们使用 Amazon Web Services 提供了一个强大和可靠的平台，而是抽象了所有 AWS 复杂性。我们为您处理所有繁重工作，您可以专注于构建应用程序和增长您的业务。

__CODE_BLOCK_16__

您可以了解更多关于 Mau 的信息 __LINK_115__。
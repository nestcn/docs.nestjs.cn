<!-- 此文件从 content/migration.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:49:00.247Z -->
<!-- 源文件: content/migration.md -->

### Migration Guide

本文提供了从 NestJS 版本 10 到版本 11 的全面指南。要了解 v11 中引入的新特性，请查看 __LINK_105__。虽然更新中存在一些 minorbreaking changes，但它们对大多数用户来说不太可能产生影响。您可以查看完整的更改列表 __LINK_106__。

#### 升级包

虽然可以手动升级包，但我们建议使用 __LINK_107__ 来实现更streamlined 的升级过程。

#### Express v5

Express v5 在 2024 年正式发布，并在 2025 年稳定版本。在 NestJS 11 中，Express v5 现成了框架的默认版本。虽然这更新对大多数用户来说是无缝的，但需要注意 Express v5 引入了一些breaking changes。请查看 __LINK_108__以获取更多详细信息。

Express v5 中最引人注目的更新是路径路由匹配算法的修改。以下是对路径字符串与 incoming 请求的匹配方式的修改：

* wildcards `data` 必须具有名称，匹配参数的行为使用 `any` 或 `@Body()` 替代 `@Param()`。`@Query()` 是 wildcards 的名称，具有特殊含义。您可以将其命名为任何内容，例如 `user`。
* 可选字符 `validateCustomDecorators` 不再支持，使用大括号替代 `ValidationPipe`。
* 正则表达式字符不支持。
* 一些字符已经被保留以避免升级时的混淆 `@Auth()`，使用 `@ApiHideProperty()` 进行转义。
* 参数名称现在支持有效的 JavaScript 标识符或双引号 `@nestjs/swagger`。

然而，之前在 Express v4 中工作的路由可能在 Express v5 中不工作。例如：

```typescript
const user = req.user;

```

要解决这个问题，可以更新路由以使用命名 wildcards：

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

```

> warning **Warning** `applyDecorators` 是一个命名 wildcards，匹配任何路径，但不包括根路径。如果您需要匹配根路径 __INLINE_CODE_29__，可以使用 __INLINE_CODE_30__，将 wildcards 包含在大括号中（可选组）。__INLINE_CODE_31__ 是 wildcards 的名称，具有特殊含义。您可以将其命名为任何内容，例如 __INLINE_CODE_32__。

类似地，如果您有一个中间件在所有路由上运行，您可能需要更新路径以使用命名 wildcards：

```typescript
@Get()
async findOne(@User() user: UserEntity) {
  console.log(user);
}

```

而不是更新路径以使用命名 wildcards：

```json
{
  "id": 101,
  "firstName": "Alan",
  "lastName": "Turing",
  "email": "alan@email.com",
  "roles": ["admin"]
}

```

> info **Note** __INLINE_CODE_33__ 是一个命名 wildcards，匹配任何路径包括根路径。外部大括号使路径可选。

#### Query Parameters Parsing

> info **Note** 这个变化只适用于 Express v5。

在 Express v5 中，查询参数不再使用 __INLINE_CODE_34__ 库来解析，而是使用 __INLINE_CODE_35__ 解析器，该解析器不支持嵌套对象或数组。

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

将不再被正确解析。要恢复之前的行为，可以配置 Express 使用 __INLINE_CODE_36__ 解析器（在 Express v4 中的默认值）：

```typescript
@Get()
async findOne(@User('firstName') firstName: string) {
  console.log(`Hello ${firstName}`);
}

```

#### Fastify v5

NestJS 11 现在支持 Fastify v5。这个更新对大多数用户来说是无缝的，但 Fastify v5 引入了一些breaking changes，虽然这些变化对大多数 NestJS 用户来说不太可能产生影响。请查看 __LINK_109__以获取更多详细信息。

> info **Hint** 在 Fastify v5 中，没有对路径匹配的变化（除了中间件，请查看下一节），因此您可以继续使用 wildcards 语法就像之前一样。行为保持不变，使用 wildcards 定义的路由（如 __INLINE_CODE_40__）将继续工作。

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

#### Fastify Middleware Registration

NestJS 11 现在使用最新版本的 __LINK_111__ 包来匹配 **middleware paths** 在 __INLINE_CODE_45__ 中。结果，__INLINE_CODE_46__ 语法用于匹配所有路径不再支持。相反，您应该使用命名 wildcards。

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

您需要更新它以使用命名 wildcards：

```typescript
@Get('users')
@Auth('admin')
findAllUsers() {}

```

其中 __INLINE_CODE_47__ 是任意的 wildcards 名称。您可以将其命名为任何内容。

#### 模块解析算法

(Translation incomplete. Please provide the rest of the text.)以下是翻译后的中文文档：

**NestJS 11 中的模块解析算法改进**

从 NestJS 11 开始，模块解析算法已被改进，以提高性能和减少大多数应用程序的内存使用。这个改变不需要任何手动干预，但是在某些边缘情况下，行为可能会与之前的版本不同。

在 NestJS v10 及更早版本中，动态模块分配了一个唯一的不可预测的密钥，该密钥是根据模块的动态元数据生成的。这个密钥用于在模块注册表中标识模块。例如，如果在多个模块中包含 __INLINE_CODE_48__，NestJS 就会对模块进行去重处理，并将它们视为单个模块节点在注册表中。这被称为节点去重处理。

从 NestJS v11 开始，我们不再为动态模块生成可预测的哈希值，而是使用对象引用来确定一个模块是否与另一个模块相等。要在多个模块中共享同一个动态模块，只需将其赋值给一个变量，并在需要的地方导入它。这新的方法提供了更大的灵活性，并确保了动态模块的处理更加高效。

这个新的算法可能会影响您的集成测试，如果您使用了大量动态模块，因为在没有手动去重处理的情况下，您的 TestingModule 可能会有多个依赖项的实例。这使得需要stub一个方法变得更加困难，因为您需要目标正确的实例。您的选项是：

- 去重动态模块
- 使用 __INLINE_CODE_49__ 找到正确的实例
- 使用 __INLINE_CODE_50__ Stub 所有实例
- 或者，使用 __INLINE_CODE_51__ 切换回旧的算法

**Reflector 类型推断**

NestJS 11 引入了一些改进， enhancements to the __INLINE_CODE_52__ class，提高其功能和类型推断能力。这些更新提供了更好的用户体验， especially when working with metadata。

1. __INLINE_CODE_53__ 现在返回一个对象，而不是一个包含单个元素的数组，且 __INLINE_CODE_54__ 类型为 __INLINE_CODE_55__。这个改变提高了在处理基于对象的 metadata 时的一致性。
2. __INLINE_CODE_56__ 的 return 类型已被更新为 __INLINE_CODE_57__ 而不是 __INLINE_CODE_58__。这个更新更好地反映了可能没有 metadata 的情况，并确保了对 undefined 情况的正确处理。
3. __INLINE_CODE_59__ 的转换类型参数现在被正确地推断到所有方法中。

这些更新提高了 NestJS 11 的开发体验，提供了更好的类型安全和 metadata 处理。

**生命周期钩子执行顺序**

现在，终止生命周期钩子在初始化生命周期钩子的反向顺序执行。例如， __INLINE_CODE_60__、 __INLINE_CODE_61__ 和 __INLINE_CODE_62__ 现在在反向顺序执行。

以下是一个场景：

__CODE_BLOCK_9__

在这个场景中， __INLINE_CODE_63__ 钩子在以下顺序执行：

__CODE_BLOCK_10__

而 __INLINE_CODE_64__ 钩子在反向顺序执行：

__CODE_BLOCK_11__

> info **Hint** 全局模块被视为所有其他模块的依赖项。这意味着，全球模块在初始化时被初始化，最后被销毁。

**中间件注册顺序**

在 NestJS v11 中，中间件注册的行为已被更新。之前，中间件注册的顺序是根据模块依赖关系图的拓扑排序来确定的，即使中间件被注册在全局模块或普通模块中。全局模块在这个方面被视为普通模块，这导致了不一致的行为， especially when compared to other framework features。

从 v11 开始，注册在全局模块中的中间件现在将在所有其他中间件之前执行，这确保了全局中间件总是在导入模块中的中间件之前执行，保持了一致和可预测的顺序。

**缓存模块**

__INLINE_CODE_65__ (来自 __INLINE_CODE_66__ 包) 已经更新，支持最新版本的 __INLINE_CODE_67__ 包。这更新带来了几个breaking changes，包括对 __INLINE_CODE_68__ 的迁移到 __LINK_112__，它提供了多个后端存储器之间的统一接口通过存储适配器。

以前版本和新的版本之间的主要区别在于外部存储的配置。在以前版本中，您可能会配置 Redis 存储如下所示：

__CODE_BLOCK_12__

在新的版本中，您应该使用 __INLINE_CODE_68__ 适配器来配置存储：

__CODE_BLOCK_13__

其中 __INLINE_CODE_69__ 是来自 __INLINE_CODE_70__ 包的导入。了解更多信息，请访问 __LINK_113__。> 警告 **Warning** 在本次更新中，Keyv 库处理的缓存数据现在结构化为一个对象，其中包含 __INLINE_CODE_71__ 和 __INLINE_CODE_72__ 字段，例如：__INLINE_CODE_73__。虽然 Keyv 自动检索 __INLINE_CODE_74__ 字段通过其 API 访问数据，但是请注意这次更改，如果您直接访问缓存数据（例如，outside of the cache-manager API）或需要支持使用前版本的 __INLINE_CODE_75__ 写入数据。

#### 配置模块

如果您正在使用 __INLINE_CODE_76__ 从 __INLINE_CODE_77__ 包含的 __INLINE_CODE_78__，请注意以下几个 breaking changes：

- 内部配置（config 命名空间和自定义 config 文件）
- 验证环境变量（如果启用了验证且提供了架构）
- __INLINE_CODE_80__ 对象

之前，验证环境变量和 __INLINE_CODE_81__ 对象被读取第一，防止它们被内部配置所覆盖。现在，内部配置将总是优先于环境变量。

此外，__INLINE_CODE_82__ 配置选项，之前允许禁用 __INLINE_CODE_83__ 对象的验证，现在已被弃用。相反，使用 __INLINE_CODE_84__ 选项（将其设置为 __INLINE_CODE_85__以禁用预定义环境变量的验证）。预定义环境变量指的是在模块导入之前设置的 __INLINE_CODE_86__ 变量。例如，如果您使用 __INLINE_CODE_87__ 启动应用程序，__INLINE_CODE_88__ 变量将被认为是预定义的。然而，通过 __INLINE_CODE_89__ 从 __INLINE_CODE_90__ 文件加载的变量不被视为预定义的。

新引入的 __INLINE_CODE_91__ 选项允许您防止 __INLINE_CODE_92__ 方法访问 __INLINE_CODE_93__ 对象，以便在您想要限制服务直接访问环境变量时有所帮助。

#### 终止模块

如果您正在使用 __INLINE_CODE_94__ 并且已构建了自己的自定义健康指示器，版本 11 中引入了新的 API。新的 __INLINE_CODE_95__旨在提高自定义健康指示器的可读性和可测试性。

在版本 11 之前，健康指示器可能如下所示：

__CODE_BLOCK_14__

从版本 11 开始，建议使用新的 __INLINE_CODE_96__ API，可以简化实现过程。下面是相同的健康指示器现在可以实现的方式：

__CODE_BLOCK_15__

关键变化：

- __INLINE_CODE_97__ 替代了 legacy __INLINE_CODE_98__ 和 __INLINE_CODE_99__ 类，提供了更干净的 API 进行健康检查。
- __INLINE_CODE_100__ 方法允许轻松跟踪状态（__INLINE_CODE_101__ 或 __INLINE_CODE_102__）同时支持在健康检查响应中包含额外的元数据。

> 提示 **Info** 请注意，__INLINE_CODE_103__ 和 __INLINE_CODE_104__ 类已被标记为弃用，并将在下一个主要版本中删除。

#### Node.js v16 和 v18 不再支持

从 NestJS 11 开始，Node.js v16 不再支持，因为它于 2023 年 9 月 11 日达到 EOL。同样，对于 Node.js v18，安全支持将于 2025 年 4 月 30 日结束，所以我们已经停止支持它。

NestJS 11 现在要求 **Node.js v20 或更高版本**。

为了确保最佳体验，我们强烈建议使用最新的 LTS 版本 Node.js。

#### Mau 官方部署平台

如果您错过了公告，我们于 2024 年推出了我们的官方部署平台，__LINK_114__。Mau 是一个完全管理的平台，可以简化 NestJS 应用程序的部署过程。使用 Mau，可以将应用程序部署到云 (**AWS**; Amazon Web Services) 中，以单个命令方式管理环境变量，并实时监控应用程序的性能。

Mau 使得配置和维护基础设施变得简单，只需点击几个按钮。Mau 设计为简单和直观，您可以专注于构建应用程序，而不是担心基础设施的复杂性。实际上，我们使用 Amazon Web Services 提供强大且可靠的平台，同时将所有复杂性抽象化。我们为您处理所有重 lifting，直到您可以专注于构建应用程序和增长您的业务。

__CODE_BLOCK_16__

您可以了解更多关于 Mau 的信息 __LINK_115__。
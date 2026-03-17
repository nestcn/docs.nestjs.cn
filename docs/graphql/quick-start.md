<!-- 此文件从 content/graphql/quick-start.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:54:28.309Z -->
<!-- 源文件: content/graphql/quick-start.md -->

## TypeScript 和 GraphQL 的结合

__LINK_113__ 是一种强大的查询语言，用于 API 和执行这些查询的 runtime，以使用您的现有数据。它是一种优雅的方法，解决了 REST API 通常遇到的问题。关于 GraphQL 和 REST 之间的关系，可以阅读 __LINK_114__。

在本章中，我们假设已经对 GraphQL 有基本了解，focus 在使用内置的 __INLINE_CODE_25__ 模块的工作中。 __INLINE_CODE_26__ 可以配置使用 __LINK_116__ 服务器（使用 __INLINE_CODE_27__ 驱动器）和 __LINK_117__（使用 __INLINE_CODE_28__ 驱动器）。我们提供了对这些 GraphQL 包的官方集成，以提供使用 GraphQL 和 Nest 的简单方法（查看更多集成 __LINK_118__）。

你也可以构建自己的专门驱动程序（了解更多 __LINK_119__）。

#### 安装

首先，安装所需的包：

```typescript
@Field()
@Extensions({ role: Role.ADMIN })
password: string;

```

> warning **警告** __INLINE_CODE_29__ 和 __INLINE_CODE_30__ 包只能与 **Apollo v3** 兼容（查看 Apollo  Server 3__LINK_120__以获取更多信息），而 __INLINE_CODE_31__ 只支持 **Apollo v2**（例如 __INLINE_CODE_32__ 包）。

#### 概述

Nest 提供了两种方式来构建 GraphQL 应用程序，代码优先和架构优先方法。你应该选择适合你自己的方法。本章中的大多数章节都被分为两部分：如果你使用代码优先方法，需要遵循的部分；如果你使用架构优先方法，需要遵循的部分。

在代码优先方法中，你使用装饰器和 TypeScript 类来生成对应的 GraphQL 架构。这是一种有用的方法，如果你 prefers exclusivesly 使用 TypeScript 并且避免在语言语法之间切换。

在架构优先方法中，架构的来源是 GraphQL SDL（Schema Definition Language）文件。SDL 是一种语言无关的方法，用于在不同的平台之间共享架构文件。Nest 自动根据 GraphQL 架构生成 TypeScript 定义（使用类或接口），以减少编写冗余的 boilerplate 代码。

__HTML_TAG_106____HTML_TAG_107__

#### 使用 TypeScript 和 GraphQL

> info **提示** 在以下章节中，我们将使用 __INLINE_CODE_33__ 包。要使用 __INLINE_CODE_34__ 包，可以查看 __LINK_121__。

安装包后，我们可以导入 __INLINE_CODE_35__ 并使用 __INLINE_CODE_36__ 静态方法配置它。

```typescript
export const checkRoleMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const { info } = ctx;
  const { extensions } = info.parentType.getFields()[info.fieldName];

  /**
   * In a real-world application, the "userRole" variable
   * should represent the caller's (user) role (for example, "ctx.user.role").
   */
  const userRole = Role.USER;
  if (userRole === extensions.role) {
    // or just "return null" to ignore
    throw new ForbiddenException(
      `User does not have sufficient permissions to access "${info.fieldName}" field.`,
    );
  }
  return next();
};

```

> info **提示** 对于 __INLINE_CODE_37__ 集成，您应该使用 __INLINE_CODE_38__ 和 __INLINE_CODE_39__。这两个都是从 __INLINE_CODE_40__ 包中导出。

__INLINE_CODE_41__ 方法接受 options 对象作为参数。这些 options 将被传递给 underlying driver 实例（了解更多关于可用设置的信息 __LINK_122__ 和 __LINK_123__）。例如，如果你想要禁用 __INLINE_CODE_42__ 并关闭 __INLINE_CODE_43__ 模式（对 Apollo），可以传递以下 options：

```typescript
@Field({ middleware: [checkRoleMiddleware] })
@Extensions({ role: Role.ADMIN })
password: string;

```

在这种情况下，这些 options 将被传递给 __INLINE_CODE_44__ 构造函数。

#### GraphQL playground

playground 是一个图形化的、交互式的、在浏览器中的 GraphQL IDE，可以在同一个 URL 下的 GraphQL 服务器后台中访问。要访问 playground，需要基本的 GraphQL 服务器配置和运行。要立即访问，可以安装和构建 __LINK_124__。或者，如果你正在跟随这些代码示例，完成 __LINK_125__ 后，可以访问 playground。

在这个地方，你可以打开浏览器，导航到 __INLINE_CODE_45__（主机和端口可能取决于你的配置）。然后，你将看到 GraphQL playground，如以下所示。

__HTML_TAG_108__
  __HTML_TAG_109__
__HTML_TAG_110__

> info **注意** __INLINE_CODE_46__ 集成不包括内置的 GraphQL Playground 集成。相反，可以使用 __LINK_126__（设置 __INLINE_CODE_47__）。

> warning **警告** 更新（2025 年 4 月 14 日）：默认的 Apollo playground 已经弃用，并将在下一个主要版本中被删除。相反，可以使用 __LINK_127__，只需在 __INLINE_CODE_49__ 配置中设置 __INLINE_CODE_48__，如下所示：
>
> __CODE_BLOCK_3__
>
> 如果你的应用程序使用 __LINK_128__，请确保使用 __INLINE_CODE_50__，因为 __INLINE_CODE_51__ 不受 GraphiQL 支持。

#### 代码优先

在代码优先方法中，你使用装饰器和 TypeScript 类来生成对应的 GraphQL 架构。

要使用代码优先方法，首先添加 __INLINE_CODE_52__ 属性到 options 对象：

__CODE_BLOCK_4__Here is the translated documentation:

**__INLINE_CODE_53__** 属性值是自动生成架构的路径。Alternatively,架构可以在内存中按需生成。要启用此功能，请将 __INLINE_CODE_54__ 属性设置为 __INLINE_CODE_55__ :

```

__CODE_BLOCK_5__

```

**__CODE_BLOCK_6__**

#### 示例

完整的工作示例代码可在 __LINK_129__ 中找到。

#### 架构优先

要使用架构优先方法，请首先将 __INLINE_CODE_58__ 属性添加到选项对象中。 __INLINE_CODE_59__ 属性指示 __INLINE_CODE_60__ 在哪里查找 GraphQL SDL 架构定义文件。这些文件将在内存中组合，这使您可以将架构文件分割到多个文件中，并将其放在 resolver 附近。

```

__CODE_BLOCK_7__

```

通常，您还需要有 TypeScript 定义（类和接口），这些定义对应于 GraphQL SDL 类型。手动创建 TypeScript 定义是一种冗余和繁琐的过程。这使得我们没有一个单一的真实来源 - 每次对 SDL 的更改都需要调整 TypeScript 定义。为了解决这个问题， __INLINE_CODE_61__ 包可以 **自动生成** TypeScript 定义，从抽象语法树（ __LINK_130__ ）中生成。要启用此功能，请在配置 __INLINE_CODE_63__ 时添加 __INLINE_CODE_62__ 选项。

```

__CODE_BLOCK_8__

```

**__CODE_BLOCK_9__**

在上述方法中，架构将在应用程序启动时动态生成。Alternatively，可以创建一个简单的脚本来按需生成这些定义。例如，假设我们创建了以下脚本作为 __INLINE_CODE_67__ :

```

__CODE_BLOCK_10__

```

现在，您可以在需求时运行这个脚本：

```

__CODE_BLOCK_11__

```

> 提示 **__INLINE_CODE_68__** 您可以在编译脚本之前（例如使用 __INLINE_CODE_69__）并使用 __INLINE_CODE_69__ 执行它。

要启用脚本的监视模式（自动生成类型定义，每当 __INLINE_CODE_70__ 文件更改时），请将 __INLINE_CODE_71__ 选项传递给 __INLINE_CODE_72__ 方法。

```

__CODE_BLOCK_12__

```

要自动生成每个对象类型的 Additional __INLINE_CODE_73__ 字段，请启用 __INLINE_CODE_74__ 选项：

```

__CODE_BLOCK_13__

```

要生成 resolver（查询、mutation、订阅）作为简单的字段，而无需参数，请启用 __INLINE_CODE_75__ 选项：

```

__CODE_BLOCK_14__

```

要将枚举生成为 TypeScript 联合类型，而不是常规 TypeScript 枚举，请将 __INLINE_CODE_76__ 选项设置为 __INLINE_CODE_77__ :

```

__CODE_BLOCK_15__

```

#### Apollo Sandbox

要使用 __LINK_131__ 作为 GraphQL IDE，而不是 __INLINE_CODE_78__，请使用以下配置：

```

__CODE_BLOCK_16__

```

#### 示例

完整的工作架构优先示例可在 __LINK_132__ 中找到。

#### 获取生成架构

在某些情况下（例如端到端测试），您可能需要获取生成架构对象。在端到端测试中，您可以使用 __INLINE_CODE_79__ 对象运行查询，而无需使用任何 HTTP 监听器。

可以使用 __INLINE_CODE_80__ 类访问生成架构（无论是代码优先还是架构优先方法）：

```

__CODE_BLOCK_17__

```

> 提示 **__INLINE_CODE_81__** 您必须在应用程序已初始化（在 __INLINE_CODE_82__ 钩子被 __INLINE_CODE_83__ 或 __INLINE_CODE_84__ 方法触发后）调用 __INLINE_CODE_81__ Getter。

#### 异步配置

当您需要异步传递模块选项时，可以使用 __INLINE_CODE_85__ 方法。像其他动态模块一样，Nest 提供了多种技术来处理异步配置。

一种技术是使用工厂函数：

```

__CODE_BLOCK_18__

```

像其他工厂提供程序一样，我们的工厂函数可以 __HTML_TAG_111__async__HTML_TAG_112__ 并可以通过 __INLINE_CODE_86__ 注入依赖项。

```

__CODE_BLOCK_19__

```

Alternatively，可以使用类来配置 __INLINE_CODE_87__，如下所示：

```

__CODE_BLOCK_20__

```

构造上述示例中， __INLINE_CODE_88__ 在 __INLINE_CODE_89__ 中实例化，使用它创建选项对象。请注意，在这个示例中， __INLINE_CODE_90__ 需要实现 __INLINE_CODE_91__ 接口，如下所示。 __INLINE_CODE_92__ 将在实例化对象的 __INLINE_CODE_93__ 方法上调用。

```

__CODE_BLOCK_21__

```Here is the translated text in Chinese:

如果你想要重新使用现有的选项提供者，而不是在 __INLINE_CODE_94__ 中创建私有副本，使用 __INLINE_CODE_95__ 语法。

__CODE_BLOCK_22__

#### Mercurius 集成

Fastify 用户（阅读更多 __LINK_133__）可以使用 __INLINE_CODE_96__ 驱动器作为替代Apollo。

__CODE_BLOCK_23__

> info **提示** 应用程序启动后，请在浏览器中访问 __INLINE_CODE_97__。您应该看到 __LINK_134__。

__INLINE_CODE_98__ 方法接受一个选项对象作为参数。这些选项将传递给 underlying 驱动器实例。阅读更多关于可用设置的信息 __LINK_135__。

#### 多个端点

__INLINE_CODE_99__ 模块另一个有用的特性是可以同时服务多个端点。这允许您决定哪些模块应该包含在哪个端点中。默认情况下，__INLINE_CODE_100__ 会在整个应用程序中搜索 resolver。要限制扫描到只包含子集模块，请使用 __INLINE_CODE_101__ 属性。

__CODE_BLOCK_24__

> warning **警告** 如果你使用 __INLINE_CODE_102__ 和 __INLINE_CODE_103__ 包含多个 GraphQL 端点的单个应用程序，确保在 __INLINE_CODE_105__ 配置中启用 __INLINE_CODE_104__ 设置。

#### 第三方集成

- __LINK_136__

#### 示例

可用的工作示例位于 __LINK_137__。
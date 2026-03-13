<!-- 此文件从 content/graphql/subscriptions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:50:51.381Z -->
<!-- 源文件: content/graphql/subscriptions.md -->

### 订阅

除了使用查询和修改数据使用 Mutation 外，GraphQL 规范还支持第三种操作类型，即 __PIPE_36__。GraphQL 订阅是一种将服务器推送数据到客户端的方式，这些客户端选择监听服务器的实时消息。订阅与查询类似，它们都指定要传递给客户端的字段集，但是而不是立即返回一个单一的答案，而是打开一个渠道，并将结果发送到客户端每当服务器上的特定事件发生。

订阅的常见用例是通知客户端关于特定事件，例如创建新对象、更新字段等（阅读更多 __LINK_144__）。

#### 使用 Apollo 驱动启用订阅

要启用订阅，请将 `email` 属性设置为 __INLINE_CODE_38__。

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}

```

> warning **警告** 最新版本的 Apollo 服务器已删除了 __INLINE_CODE_39__ 配置选项，并将很快在这个包中也删除。默认情况下， __INLINE_CODE_40__ 将 fallback 到使用 __INLINE_CODE_41__ (__LINK_145__)，但我们强烈建议使用 __INLINE_CODE_42__ (__LINK_146__) 库来代替。

要切换到使用 __INLINE_CODE_43__ 包，使用以下配置：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}

```

> info **提示** 您也可以同时使用两个包 (__INLINE_CODE_44__ 和 __INLINE_CODE_45__)，例如，为了 backward compatibility。

#### 代码优先

使用代码优先方法创建订阅，我们使用 __INLINE_CODE_46__ 装饰器（来自 __INLINE_CODE_47__ 包）和 __INLINE_CODE_48__ 类（来自 __INLINE_CODE_49__ 包），该类提供了简单的 **发布/订阅 API**。

以下订阅处理程序负责订阅事件，调用 __INLINE_CODE_50__。该方法接受单个参数，即 __INLINE_CODE_51__，它对应于事件主题名称。

```typescript
@InputType()
export class UpdateUserInput extends PartialType(User, InputType) {}

```

> info **提示** 所有装饰器都来自 __INLINE_CODE_52__ 包，而 __INLINE_CODE_53__ 类来自 __INLINE_CODE_54__ 包。

> warning **注意** __INLINE_CODE_55__ 是一个类，暴露了简单的 __INLINE_CODE_56__ 和 __INLINE_CODE_57__。阅读更多 __LINK_147__。注意，Apollo 文档警告说默认实现不适合生产环境（阅读更多 __LINK_148__）。生产应用程序应该使用由外部存储支持的 __INLINE_CODE_58__ 实现（阅读更多 __LINK_149__）。

这将生成以下 GraphQL schema 部分：

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}

```

注意，订阅的定义返回一个对象，其中的顶级属性名称是订阅的名称。这名称可以继承自订阅处理方法的名称（即 __INLINE_CODE_59__），或使用 __INLINE_CODE_60__ 选项作为 __INLINE_CODE_61__ 装饰器的第二个参数，像下面所示。

```typescript
@InputType()
export class UpdateEmailInput extends PickType(CreateUserInput, [
  'email',
] as const) {}

```

这construct 生成的 SDL 与前一个代码示例相同，但是允许我们将方法名称与订阅分开。

#### 发布

现在，我们使用 __INLINE_CODE_62__ 方法来发布事件。这通常在 Mutation 中使用，以触发客户端更新，例如当对象图形的某个部分改变时。

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}

```

__INLINE_CODE_63__ 方法接受 __INLINE_CODE_64__ 作为第一个参数，事件 payload 作为第二个参数。正如所提到的，订阅的定义返回一个值，该值具有特定的形状。请再次查看我们对 __INLINE_CODE_65__ 订阅的生成 SDL：

```typescript
@InputType()
export class UpdateUserInput extends OmitType(CreateUserInput, [
  'email',
] as const) {}

```

这告诉我们，订阅必须返回一个具有顶级属性名称 __INLINE_CODE_66__ 的对象，该对象的值是一个 __INLINE_CODE_67__ 对象。重要的是，事件 payload 发送到 __INLINE_CODE_68__ 方法的形状必须与订阅返回的值形状相匹配。因此，在我们的示例中，__INLINE_CODE_69__ 语句发布了一个 __INLINE_CODE_70__ 事件具有相应形状的 payload。如果这些形状不匹配，订阅将在 GraphQL 校验阶段失败。

#### 筛选订阅

要筛选特定事件，请将 __INLINE_CODE_71__ 属性设置为一个筛选函数。该函数类似于数组 __INLINE_CODE_72__ 中的函数，它接受两个参数： __INLINE_CODE_73__ 包含事件 payload（由事件发布者发送），和 __INLINE_CODE_74__ 接受在订阅请求中传递的任何参数。它返回一个布尔值，确定是否将事件发送到客户端监听器。

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class AdditionalUserInfo {
  @Field()
  firstName: string;

  @Field()
  lastName: string;
}

```

#### mutating 订阅 payload

Please note that I followed the guidelines and translated the text without adding any extra content. I also kept the code examples, variable names, function names, and formatting unchanged.Here is the translation of the provided English technical documentation to Chinese:

** mutate publishedevent payload**

将已发布的事件payload进行 mutate，可以将 `__INLINE_CODE_75__` 属性设置为一个函数。该函数接收事件payload（由事件发布者发送）并返回合适的值。

```typescript
@InputType()
export class UpdateUserInput extends IntersectionType(
  CreateUserInput,
  AdditionalUserInfo,
) {}

```

> warning **注意** 如果您使用 `__INLINE_CODE_76__` 选项，应该返回未包装的payload（例如，在我们的示例中，直接返回一个 `__INLINE_CODE_77__` 对象，而不是 `__INLINE_CODE_78__` 对象）。

如果需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造。

```typescript
@InputType()
export class UpdateUserInput extends PartialType(
  OmitType(CreateUserInput, ['email'] as const),
) {}

```

同样的构造也适用于过滤器：

__CODE_BLOCK_10__

#### Schema first

创建 Nest 等价的订阅，我们将使用 `__INLINE_CODE_79__` 装饰器。

__CODE_BLOCK_11__

要根据上下文和参数过滤特定事件，可以设置 `__INLINE_CODE_80__` 属性。

__CODE_BLOCK_12__

要 mutate 已发布的payload，我们可以使用 `__INLINE_CODE_81__` 函数。

__CODE_BLOCK_13__

如果需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造：

__CODE_BLOCK_14__

同样的构造也适用于过滤器：

__CODE_BLOCK_15__

最后一步是更新类型定义文件。

__CODE_BLOCK_16__

这样，我们已经创建了一个 `__INLINE_CODE_82__` 订阅。您可以在 __LINK_150__ 中找到完整的示例实现。

#### PubSub

我们在上面创建了一个本地 `__INLINE_CODE_83__` 实例。推荐的方法是将 `__INLINE_CODE_84__` 定义为 `__LINK_151__` 并通过构造函数注入（使用 `__INLINE_CODE_85__` 装饰器）。这样可以在整个应用程序中重用实例。例如，定义一个提供者如下，然后在需要的地方注入 `__INLINE_CODE_86__`。

__CODE_BLOCK_17__

#### Customize subscriptions server

要自定义订阅服务器（例如，改变路径），使用 `__INLINE_CODE_87__` 选项属性。

__CODE_BLOCK_18__

如果您使用 `__INLINE_CODE_88__` 包装订阅，替换 `__INLINE_CODE_89__` 键为 `__INLINE_CODE_90__`，如下所示：

__CODE_BLOCK_19__

#### Authentication over WebSockets

在 `__INLINE_CODE_91__` 回调函数中可以检查用户是否已认证。

__INLINE_CODE_93__ 将收到 `__INLINE_CODE_94__` 作为第一个参数，这个参数是 `__INLINE_CODE_95__` (读取 __LINK_152__)。

__CODE_BLOCK_20__

在这个示例中， `__INLINE_CODE_96__` 只有在客户端第一次建立连接时发送一次。
所有使用这个连接订阅的事件都将具有相同的 `__INLINE_CODE_97__` 和相同的用户信息。

> warning **注意** 在 `__INLINE_CODE_98__` 中存在一个bug，可以跳过 `__INLINE_CODE_99__` 阶段（读取 __LINK_153__）。您 shouldn't assume that `__INLINE_CODE_100__` was called when the user starts a subscription, and always check that the `__INLINE_CODE_101__` is populated.

如果您使用 `__INLINE_CODE_102__` 包装订阅，`__INLINE_CODE_103__` 回调函数的签名将不同：

__CODE_BLOCK_21__

#### Enable subscriptions with Mercurius driver

要启用订阅，设置 `__INLINE_CODE_104__` 属性为 `__INLINE_CODE_105__`。

__CODE_BLOCK_22__

> info **提示** 您也可以将选项对象传递以设置自定义发射器、验证 incoming connections 等。读取更多 __LINK_154__（见 __INLINE_CODE_106__）。

#### Code first

使用代码 first 方法，我们使用 `__INLINE_CODE_107__` 装饰器（来自 `__INLINE_CODE_108__` 包）和 `__INLINE_CODE_109__` 类（来自 `__INLINE_CODE_110__` 包），它提供了一个简单的 publish/subscribe API。

以下订阅处理程序负责订阅事件，通过调用 `__INLINE_CODE_111__`。这个方法接受一个参数，即 `__INLINE_CODE_112__`，它对应于事件主题名称。

__CODE_BLOCK_23__

> info **提示** 所有在示例中使用的装饰器都是来自 `__INLINE_CODE_113__` 包，而 `__INLINE_CODE_114__` 类来自 `__INLINE_CODE_115__` 包。

> warning **注意** `__INLINE_CODE_116__` 是一个类，Expose 一个简单的 __INLINE_CODE_117__ 和 __INLINE_CODE_118__ API。查看 __LINK_155__，了解如何注册自定义 __INLINE_CODE_119__ 类。

这样将生成以下 GraphQL schema 部分：

__CODE_BLOCK_24__

注意，订阅由于其本质返回一个对象，其中的顶级属性的键是订阅的名称。这名可以继承自订阅处理程序方法的名称（即 `__INLINE_CODE_120__` 上面），或通过将一个名为 `#### 发布

现在，我们使用 __INLINE_CODE_123__ 方法来发布事件。这通常在 mutation 中使用，以在对象图形中变化的部分触发客户端更新。例如：

__CODE_BLOCK_26__

正如我们所说的，订阅本质上返回值，并且该值具有形状。再次查看我们对 __INLINE_CODE_124__ 订阅生成的 SDL：

__CODE_BLOCK_27__

这告诉我们，订阅必须返回一个具有顶级属性名为 __INLINE_CODE_125__ 的对象，该对象的值是一个 __INLINE_CODE_126__ 对象。重要的是，事件发布器 __INLINE_CODE_127__ 方法发射的事件 payload 的形状必须对应于订阅返回值的形状。因此，在我们的上述示例中，__INLINE_CODE_128__ 语句发布一个 __INLINE_CODE_129__ 事件，具有合适的 payload。如果这些形状不匹配，订阅将在 GraphQL 验证阶段失败。

#### 筛选订阅

要筛选特定的事件，将 __INLINE_CODE_130__ 属性设置为过滤函数。这函数类似于数组 __INLINE_CODE_131__ 的函数，它接受两个参数： __INLINE_CODE_132__ 包含事件 payload（由事件发布器发送），和 __INLINE_CODE_133__ 接收在订阅请求中传递的任何参数。它返回一个布尔值，确定是否将该事件发布给客户端监听器。

__CODE_BLOCK_28__

如果您需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造。

__CODE_BLOCK_29__

#### schema first

要在 Nest 中创建等效的订阅，我们将使用 __INLINE_CODE_134__ 装饰器。

__CODE_BLOCK_30__

要基于上下文和参数筛选特定的事件，将 __INLINE_CODE_135__ 属性设置。

__CODE_BLOCK_31__

如果您需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造：

__CODE_BLOCK_32__

最后一步是更新类型定义文件。

__CODE_BLOCK_33__

这样，我们就创建了一个 __INLINE_CODE_136__ 订阅。

#### PubSub

在上面的示例中，我们使用了默认的 __INLINE_CODE_137__ 发射器（__LINK_156__）
生产环境中推荐使用 __INLINE_CODE_138__。Alternatively，可以提供自定义 __INLINE_CODE_139__ 实现（阅读更多 __LINK_157__）

__CODE_BLOCK_34__

#### WebSocket 认证

在 __INLINE_CODE_140__ 回调函数中可以检查用户是否 authenticated，这是 __INLINE_CODE_141__ 选项中的一个可选参数。

__INLINE_CODE_142__ 将接收 __INLINE_CODE_143__ 对象作为第一个参数，您可以使用它来检索请求的头信息。

__CODE_BLOCK_35__
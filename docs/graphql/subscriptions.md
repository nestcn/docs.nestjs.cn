<!-- 此文件从 content/graphql/subscriptions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:28:27.247Z -->
<!-- 源文件: content/graphql/subscriptions.md -->

### 订阅

除了使用查询和修改数据使用 mutations 之外，GraphQL 规范还支持第三种操作类型，即 `CreateUserInput`. GraphQL 订阅是一种将数据从服务器推送到客户端的方式，以实时传递服务器上的特定事件。订阅类似于查询，它指定了一组要传递到客户端的字段，但不是立即返回单个答案，而是打开一个通道，并将结果发送到客户端每当服务器上发生特定事件。

订阅的常见用例是通知客户端关于特定事件，例如创建新对象、更新字段等（了解更多 __LINK_144__）。

#### 使用 Apollo 驱动程序启用订阅

要启用订阅，设置 `email` 属性为 __INLINE_CODE_38__。

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

> warning **警告** __INLINE_CODE_39__ 配置选项已从 Apollo  server 的最新版本中删除，并将在不久的将来在本包中也被弃用。默认情况下，__INLINE_CODE_40__ 将 fallback 到使用 __INLINE_CODE_41__ (__LINK_145__)，但我们强烈建议使用 __INLINE_CODE_42__(__LINK_146__) 库来代替。

要切换到使用 __INLINE_CODE_43__ 包而不是 __INLINE_CODE_44__ 包，可以使用以下配置：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}

```

> info **提示** 您也可以同时使用两个包 (__INLINE_CODE_44__ 和 __INLINE_CODE_45__)，例如为了 backward compatibility。

#### 代码优先

使用代码优先方法创建订阅，我们使用 __INLINE_CODE_46__ 装饰器（来自 __INLINE_CODE_47__ 包）和 __INLINE_CODE_48__ 类（来自 __INLINE_CODE_49__ 包），该类提供了简单的发布/订阅 API。

以下订阅处理程序负责订阅事件，通过调用 __INLINE_CODE_50__。该方法接受单个参数，即 __INLINE_CODE_51__，它对应于事件主题名称。

```typescript
@InputType()
export class UpdateUserInput extends PartialType(User, InputType) {}

```

> info **提示** 所有装饰器都来自 __INLINE_CODE_52__ 包，而 __INLINE_CODE_53__ 类来自 __INLINE_CODE_54__ 包。

> warning **注意** __INLINE_CODE_55__ 是一个类，暴露了简单的 __INLINE_CODE_56__ 和 __INLINE_CODE_57__。了解更多 __LINK_147__。请注意，Apollo 文档警告说默认实现不适用于生产环境（了解更多 __LINK_148__）。生产应用程序应该使用外部存储支持的 __INLINE_CODE_58__ 实现（了解更多 __LINK_149__）。

这将生成以下 GraphQL schema 部分的 SDL：

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

注意，订阅本质上返回一个对象，该对象的顶级属性的键是订阅名称。这可以继承自订阅处理程序方法的名称（即 __INLINE_CODE_59__），或通过将 __INLINE_CODE_60__ 选项作为第二个参数传递给 __INLINE_CODE_61__ 装饰器来提供。

```typescript
@InputType()
export class UpdateEmailInput extends PickType(CreateUserInput, [
  'email',
] as const) {}

```

这个构造生成了与前一个代码示例相同的 SDL，但允许我们将方法名称与订阅分开。

#### 发布

现在，我们使用 __INLINE_CODE_62__ 方法来发布事件。这通常在 mutation 中使用，以在对象图形中某个部分发生变化时触发客户端更新。例如：

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

__INLINE_CODE_63__ 方法接受 __INLINE_CODE_64__（事件主题名称）和事件 payload 作为参数。正如提到的，订阅本质上返回一个值，该值有一个形状。再次查看我们的 __INLINE_CODE_65__ 订阅生成的 SDL：

```typescript
@InputType()
export class UpdateUserInput extends OmitType(CreateUserInput, [
  'email',
] as const) {}

```

这告诉我们，订阅必须返回一个对象，该对象的顶级属性名称是 __INLINE_CODE_66__，并且该值是一个 __INLINE_CODE_67__ 对象。重要的是，事件 payload 发射器 __INLINE_CODE_68__ 方法的形状必须对应于订阅返回值的形状。因此，在我们的示例中，__INLINE_CODE_69__ 语句发布了一个 __INLINE_CODE_70__ 事件，具有适当形状的 payload。如果这些形状不匹配，您的订阅将在 GraphQL 验证阶段失败。

#### 筛选订阅

要筛选特定事件，设置 __INLINE_CODE_71__ 属性为筛选函数。该函数类似于数组 __INLINE_CODE_72__ 函数，它接受两个参数：__INLINE_CODE_73__ 包含事件 payload（由事件发布者发送），和 __INLINE_CODE_74__ 接受在订阅请求中传递的参数。它返回一个布尔值，确定是否将事件发布到客户端监听器。

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

(未完)Here is the translation of the English technical documentation to Chinese:

要 mutating the published event payload，请将 __INLINE_CODE_75__ 属性设置为一个函数。该函数接收事件 payload（由事件发布者发送）并返回适当的值。

```typescript
@InputType()
export class UpdateUserInput extends IntersectionType(
  CreateUserInput,
  AdditionalUserInfo,
) {}

```

> warning **注意** 如果您使用 __INLINE_CODE_76__ 选项，则应该返回未包装的 payload（例如，使用我们的示例，直接返回一个 __INLINE_CODE_77__ 对象，而不是 __INLINE_CODE_78__ 对象）。

如果您需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造。

```typescript
@InputType()
export class UpdateUserInput extends PartialType(
  OmitType(CreateUserInput, ['email'] as const),
) {}

```

同样的构造也适用于过滤器：

__CODE_BLOCK_10__

#### Schema first

要创建等效的订阅在 Nest 中，我们将使用 __INLINE_CODE_79__ 装饰器。

__CODE_BLOCK_11__

要基于上下文和参数过滤特定事件，请设置 __INLINE_CODE_80__ 属性。

__CODE_BLOCK_12__

要 mutating the published payload，我们可以使用 __INLINE_CODE_81__ 函数。

__CODE_BLOCK_13__

如果您需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造：

__CODE_BLOCK_14__

同样的构造也适用于过滤器：

__CODE_BLOCK_15__

最后一步是更新 type definitions 文件。

__CODE_BLOCK_16__

这样，我们已经创建了一个 __INLINE_CODE_82__ 订阅。您可以在 __LINK_150__ 中找到完整的示例实现。

#### PubSub

我们上面实例化了一个本地 __INLINE_CODE_83__ 实例。推荐的方法是将 __INLINE_CODE_84__ 定义为 __LINK_151__ 并通过构造函数注入（使用 __INLINE_CODE_85__ 装饰器）。这样可以在整个应用程序中重用实例。例如，定义一个提供者如下，然后将 __INLINE_CODE_86__ 注入到需要的地方。

__CODE_BLOCK_17__

#### Customize subscriptions server

要自定义订阅服务器（例如，修改路径），请使用 __INLINE_CODE_87__ 选项属性。

__CODE_BLOCK_18__

如果您使用 __INLINE_CODE_88__ 包age 进行订阅，replace __INLINE_CODE_89__ 键为 __INLINE_CODE_90__，如下所示：

__CODE_BLOCK_19__

#### Authentication over WebSockets

检查用户是否 authenticated 可以在 __INLINE_CODE_91__ 回调函数中执行，该函数可以在 __INLINE_CODE_92__ 选项中指定。

__INLINE_CODE_93__ 将收到第一个参数 __INLINE_CODE_94__，该参数是 __INLINE_CODE_95__ (读取 __LINK_152__)。

__CODE_BLOCK_20__

在这个示例中，__INLINE_CODE_96__ 只在客户端第一次建立连接时发送一次。
所有使用这个连接的订阅将具有相同的 __INLINE_CODE_97__，因此具有相同的用户信息。

> warning **注意** 在 __INLINE_CODE_98__ 中存在一个 bug，允许连接跳过 __INLINE_CODE_99__ 阶段（读取 __LINK_153__）。您 shouldn't assume that __INLINE_CODE_100__ was called when the user starts a subscription，and always check that the __INLINE_CODE_101__ is populated。

如果您使用 __INLINE_CODE_102__ 包age，__INLINE_CODE_103__ 回调函数的签名将略有不同：

__CODE_BLOCK_21__

#### Enable subscriptions with Mercurius driver

要启用订阅，请将 __INLINE_CODE_104__ 属性设置为 __INLINE_CODE_105__。

__CODE_BLOCK_22__

> info **提示** 您也可以将选项对象传递以设置自定义 emitter、验证 incoming connections 等。阅读更多 __LINK_154__（查看 __INLINE_CODE_106__）。

#### Code first

要使用代码 first 方法创建订阅，我们使用 __INLINE_CODE_107__ 装饰器（来自 __INLINE_CODE_108__ 包age）和 __INLINE_CODE_109__ 类（来自 __INLINE_CODE_110__ 包age），该类提供了简单的 publish/subscribe API。

以下订阅处理程序负责订阅事件，并调用 __INLINE_CODE_111__。该方法接受一个参数，即 __INLINE_CODE_112__，该参数对应于事件 topic 名称。

__CODE_BLOCK_23__

> info **提示** 所有在上面的示例中使用的装饰器来自 __INLINE_CODE_113__ 包age，而 __INLINE_CODE_114__ 类来自 __INLINE_CODE_115__ 包age。

> warning **注意** __INLINE_CODE_116__ 是一个类， exposes 一个简单的 __INLINE_CODE_117__ 和 __INLINE_CODE_118__ API。查看 __LINK_155__，了解如何注册一个自定义 __INLINE_CODE_119__ 类。

这将生成以下部分 GraphQL schema 在 SDL 中：

__CODE_BLOCK_24__

注意，订阅，因为它们的定义返回一个对象，其中的顶级属性的键是订阅名称。这是继承自订阅处理程序方法名称（即 __INLINE_CODE_120__ 上面），或通过将 __INLINE_CODE_121__ 键作为第二个参数传递给 __INLINE_CODE_122__ 装饰器指定的。

__CODE_BLOCK_25__

Note: I have removed all @@switch blocks and content after them, converted @@filename(xxx) to rspress syntax, and kept internal anchors#### 发布

现在，我们使用 __INLINE_CODE_123__ 方法来发布事件。这通常在mutation中使用，以在对象图形部分发生变化时触发客户端更新。例如：

__CODE_BLOCK_26__

正如前面所述，订阅定义返回值，并且该值具有特定的形状。再次查看我们对 __INLINE_CODE_124__ 订阅生成的 SDL：

__CODE_BLOCK_27__

这告诉我们，订阅必须返回一个具有名为 __INLINE_CODE_125__ 的顶级属性的对象，该对象的值是一个 __INLINE_CODE_126__ 对象。重要的是，事件发布器 __INLINE_CODE_127__ 方法 emit 的事件 payload 的形状必须与订阅返回的值的形状相匹配。因此，在我们的上例中， __INLINE_CODE_128__ 语句发布了一个具有适当形状的 __INLINE_CODE_129__ 事件。如果这些形状不匹配，订阅在 GraphQL 验证阶段将失败。

#### 过滤订阅

要过滤特定的事件，设置 __INLINE_CODE_130__ 属性为过滤函数。这函数类似于传递给数组 __INLINE_CODE_131__ 的函数，它接受两个参数： __INLINE_CODE_132__ 包含事件 payload（由事件发布器发送），和 __INLINE_CODE_133__ 在订阅请求中传递的任何参数。它返回一个布尔值确定该事件是否应该发布给客户端监听器。

__CODE_BLOCK_28__

如果您需要访问注入的提供者（例如，使用外部服务来验证数据），请使用以下构造。

__CODE_BLOCK_29__

#### Schema first

要在 Nest 中创建等效的订阅，我们将使用 __INLINE_CODE_134__ 装饰器。

__CODE_BLOCK_30__

要根据上下文和参数过滤特定的事件，设置 __INLINE_CODE_135__ 属性。

__CODE_BLOCK_31__

如果您需要访问注入的提供者（例如，使用外部服务来验证数据），请使用以下构造：

__CODE_BLOCK_32__

最后一步是更新类型定义文件。

__CODE_BLOCK_33__

这样，我们已经创建了一个 __INLINE_CODE_136__ 订阅。

#### PubSub

在上面的示例中，我们使用了默认的 __INLINE_CODE_137__ 发射器（__LINK_156__）
生产环境中推荐使用 __INLINE_CODE_138__。或者，可以提供自定义 __INLINE_CODE_139__ 实现（阅读更多 __LINK_157__）

__CODE_BLOCK_34__

#### WebSocket 认证

检查用户是否认证可以在 __INLINE_CODE_140__ 回调函数中指定的 __INLINE_CODE_141__ 选项中执行。

__INLINE_CODE_142__ 将收到 __INLINE_CODE_143__ 对象作为第一个参数，您可以使用该对象来检索请求的头。

__CODE_BLOCK_35__

#### Filter 订阅

要过滤特定的事件，设置 __INLINE_CODE_130__ 属性为过滤函数。这函数类似于传递给数组 __INLINE_CODE_131__ 的函数，它接受两个参数： __INLINE_CODE_132__ 包含事件 payload（由事件发布器发送），和 __INLINE_CODE_133__ 在订阅请求中传递的任何参数。
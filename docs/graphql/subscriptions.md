<!-- 此文件从 content/graphql/subscriptions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:10:00.125Z -->
<!-- 源文件: content/graphql/subscriptions.md -->

### 订阅

除了使用查询和修改数据使用 mutation 之外，GraphQL spec 还支持第三种操作类型，即 `CreateUserInput`。GraphQL 订阅是一种将数据从服务器推送到客户端的方式，以便客户端选择性地监听服务器的实时消息。订阅类似于查询，它指定要将数据发送到客户端的字段集，但是它不会立即返回单个答案，而是打开一个通道，并将结果发送到客户端每当服务器上的特定事件发生。

常见的订阅用例是通知客户端关于特定事件，例如创建新对象、更新字段等（阅读更多 __LINK_144__）。

#### 使用 Apollo 驱动器启用订阅

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

> 警告 **警告** 最新的 Apollo 服务器版本中已将 __INLINE_CODE_39__ 配置选项删除，并将在这个包中很快弃用。默认情况下，__INLINE_CODE_40__ 将 fallback 到使用 __INLINE_CODE_41__ (__LINK_145__)，但我们强烈建议使用 __INLINE_CODE_42__ (__LINK_146__) 库。

要切换到使用 __INLINE_CODE_43__ 包，请使用以下配置：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}

```

> 提示 **提示** 您也可以同时使用两个包 (__INLINE_CODE_44__ 和 __INLINE_CODE_45__)，例如，以便在后向兼容性。

#### 代码优先

使用代码优先方法创建订阅，我们使用 __INLINE_CODE_46__ 装饰器（来自 __INLINE_CODE_47__ 包）和 __INLINE_CODE_48__ 类（来自 __INLINE_CODE_49__ 包），该类提供了简单的发布/订阅 API。

以下订阅处理程序负责订阅事件 bằng调用 __INLINE_CODE_50__。该方法接受单个参数，即 __INLINE_CODE_51__，它对应于事件主题名称。

```typescript
@InputType()
export class UpdateUserInput extends PartialType(User, InputType) {}

```

> 提示 **提示** 所有装饰器都来自 __INLINE_CODE_52__ 包，而 __INLINE_CODE_53__ 类来自 __INLINE_CODE_54__ 包。

> 警告 **注意** __INLINE_CODE_55__ 是一个类，暴露了简单的 __INLINE_CODE_56__ 和 __INLINE_CODE_57__。阅读更多 __LINK_147__。注意，Apollo 文档警告说默认实现不适用于生产环境（阅读更多 __LINK_148__）。生产应用程序应该使用外部存储实现 __INLINE_CODE_58__（阅读更多 __LINK_149__）。

这将生成以下 GraphQL 架构的一部分：

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

注意，订阅本质上返回一个对象，其中的顶级属性名称是订阅的名称。这个名称可以继承自订阅处理程序方法的名称（即 __INLINE_CODE_59__ 上面的），或可以通过将一个选项作为第二个参数传递给 __INLINE_CODE_61__ 装饰器来提供，例如下面所示。

```typescript
@InputType()
export class UpdateEmailInput extends PickType(CreateUserInput, [
  'email',
] as const) {}

```

这个构造产生了上述代码样本相同的 SDL，但允许我们 decouple 方法名称和订阅。

#### 发布

现在，我们使用 __INLINE_CODE_62__ 方法发布事件。这通常在 mutation 中使用，以便在对象图形中某部分发生变化时触发客户端更新。例如：

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

__INLINE_CODE_63__ 方法接受 __INLINE_CODE_64__（即事件主题名称）和事件负载作为参数。正如所提到的，订阅本质上返回一个值，该值具有特定的形状。再次查看我们生成的 SDL，以了解 __INLINE_CODE_65__ 订阅的形状：

```typescript
@InputType()
export class UpdateUserInput extends OmitType(CreateUserInput, [
  'email',
] as const) {}

```

这告诉我们，订阅必须返回一个对象，其中的顶级属性名称是 __INLINE_CODE_66__，并且该值是一个 __INLINE_CODE_67__ 对象。重要的是，事件负载 emit  by __INLINE_CODE_68__ 方法的形状必须对应于订阅返回的值的形状。因此，在我们的示例中，__INLINE_CODE_69__ 语句发布了一个 __INLINE_CODE_70__ 事件具有正确形状的负载。如果这些形状不匹配，Your 订阅将在 GraphQL 验证阶段失败。

#### 筛选订阅

要筛选特定事件，请将 __INLINE_CODE_71__ 属性设置为 筛选函数。该函数类似于数组 __INLINE_CODE_72__ 中的函数，它接受两个参数：__INLINE_CODE_73__ 包含事件负载（由事件发布者发送），和 __INLINE_CODE_74__ 接受在订阅请求中传递的任何参数。它返回一个布尔值确定是否将该事件发送给客户端监听器。

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

#### mutating 订阅负载

...Here is the translation of the provided English technical documentation to Chinese, following the guidelines:

**mutation**

为了 mutate 已发布的事件 payload，请将 __INLINE_CODE_75__ 属性设置为一个函数。该函数接收事件 payload（由事件发布者发送）并返回适当的值。

```typescript
@InputType()
export class UpdateUserInput extends IntersectionType(
  CreateUserInput,
  AdditionalUserInfo,
) {}

```

> warning **注意** 如果您使用 __INLINE_CODE_76__ 选项，应该返回未包装的 payload（例如，返回一个 __INLINE_CODE_77__ 对象，而不是 __INLINE_CODE_78__ 对象）。

如果您需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造方式。

```typescript
@InputType()
export class UpdateUserInput extends PartialType(
  OmitType(CreateUserInput, ['email'] as const),
) {}

```

同样，这种构造方式也适用于过滤器：

__CODE_BLOCK_10__

#### Schema first

要创建等效的订阅在 Nest 中，我们将使用 __INLINE_CODE_79__ 装饰器。

__CODE_BLOCK_11__

为了基于上下文和参数过滤特定事件，设置 __INLINE_CODE_80__ 属性。

__CODE_BLOCK_12__

为了 mutate 已发布的 payload，我们可以使用 __INLINE_CODE_81__ 函数。

__CODE_BLOCK_13__

如果您需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造方式：

__CODE_BLOCK_14__

同样，这种构造方式也适用于过滤器：

__CODE_BLOCK_15__

最后一步是更新 type 定义文件。

__CODE_BLOCK_16__

这样，我们就创建了一个 __INLINE_CODE_82__ 订阅。你可以在 __LINK_150__ 中找到完整的示例实现。

#### PubSub

我们以上创建了一个本地 __INLINE_CODE_83__ 实例。推荐的方法是将 __INLINE_CODE_84__ 定义为 __LINK_151__ 并通过构造函数注入（使用 __INLINE_CODE_85__ 装饰器）。这样可以在整个应用程序中重用实例。例如，定义提供者如下，然后在需要时注入 __INLINE_CODE_86__。

__CODE_BLOCK_17__

#### Customize subscriptions server

要自定义订阅服务器（例如，改变路径），使用 __INLINE_CODE_87__ 选项属性。

__CODE_BLOCK_18__

如果您使用 __INLINE_CODE_88__ 包age 来订阅， replace __INLINE_CODE_89__ 键为 __INLINE_CODE_90__，如下所示：

__CODE_BLOCK_19__

#### Authentication over WebSockets

在 __INLINE_CODE_91__ 回调函数中，可以检查用户是否已认证。

__INLINE_CODE_93__ 将收到 __INLINE_CODE_94__ 作为第一个参数，作为 __INLINE_CODE_95__ 的参数（读取 __LINK_152__）。

__CODE_BLOCK_20__

在这个示例中，__INLINE_CODE_96__ 只在客户端第一次建立连接时发送一次。
所有使用该连接订阅的订阅都将具有相同的 __INLINE_CODE_97__，因此具有相同的用户信息。

> warning **注意** 在 __INLINE_CODE_98__ 中存在一个 bug，可以跳过 __INLINE_CODE_99__ 阶段（读取 __LINK_153__）。您不应该假设 __INLINE_CODE_100__ 已经被调用时用户开始订阅，总是检查 __INLINE_CODE_101__ 是否已 populated。

如果您使用 __INLINE_CODE_102__ 包age，__INLINE_CODE_103__ 回调函数的签名将略有不同：

__CODE_BLOCK_21__

#### Enable subscriptions with Mercurius driver

要启用订阅，设置 __INLINE_CODE_104__ 属性为 __INLINE_CODE_105__。

__CODE_BLOCK_22__

> info **提示** 您也可以将选项对象传递以设置自定义 emitter，验证 incoming connections 等。读取更多信息 __LINK_154__（see __INLINE_CODE_106__）。

#### Code first

使用代码优先方法创建订阅，我们使用 __INLINE_CODE_107__ 装饰器（从 __INLINE_CODE_108__ 包age 导出）和 __INLINE_CODE_109__ 类（从 __INLINE_CODE_110__ 包age 导出），该类提供简单的发布/订阅 API。

以下订阅处理程序负责订阅事件，通过调用 __INLINE_CODE_111__。该方法接受一个单个参数，即 __INLINE_CODE_112__，它对应于事件主题名称。

__CODE_BLOCK_23__

> info **提示** 所有在上面的示例中使用的装饰器都来自 __INLINE_CODE_113__ 包age，而 __INLINE_CODE_114__ 类来自 __INLINE_CODE_115__ 包age。

> warning **注意** __INLINE_CODE_116__ 是一个类，暴露一个简单的 __INLINE_CODE_117__ 和 __INLINE_CODE_118__ API。查看 __LINK_155__，了解如何注册自定义 __INLINE_CODE_119__ 类。

这将生成以下 GraphQL schema 部分：

__CODE_BLOCK_24__

注意，订阅的定义是返回一个单个顶级属性whose key 是订阅名称。该名称可以继承自订阅处理程序方法的名称（即 __INLINE_CODE_120__ 上面），或可以通过将 __INLINE_CODE_121__ 选项作为第二个参数传递给 __INLINE_CODE_122__ 装饰器来提供，像下面所示。

__CODE_BLOCK_25__

Please let me know if this meets your requirements.以下是翻译后的中文技术文档：

#### 发布

现在，我们使用 __INLINE_CODE_123__ 方法来发布事件。这在mutation中经常用于触发客户端更新，当对象图形部分发生变化时。例如：

__CODE_BLOCK_26__

正如前所述，订阅本质上返回值，并且该值具有shape。再次查看我们 __INLINE_CODE_124__ 订阅生成的SDL：

__CODE_BLOCK_27__

这表明订阅必须返回一个具有top-level 属性名为 __INLINE_CODE_125__ 的对象，该对象的值是一个 __INLINE_CODE_126__ 对象。重要的是，事件 payload 发送给 __INLINE_CODE_127__ 方法的shape必须对应于订阅返回的值的shape。因此，在我们的上述示例中， __INLINE_CODE_128__ 语句发布了一个具有适当形状的 __INLINE_CODE_129__ 事件。如果这些shape不匹配，您的订阅将在 GraphQL 校验阶段失败。

#### 筛选订阅

要筛选特定的事件，请将 __INLINE_CODE_130__ 属性设置为筛选函数。这函数类似于数组 __INLINE_CODE_131__ 中传递的函数，它接受两个参数： __INLINE_CODE_132__ 包含事件 payload（由事件发布者发送）和 __INLINE_CODE_133__ 在订阅请求中传递的参数。它返回一个布尔值，确定是否将该事件发送给客户端监听器。

__CODE_BLOCK_28__

如果您需要访问注入的提供商（例如，使用外部服务验证数据），请使用以下结构。

__CODE_BLOCK_29__

#### Schema First

要在 Nest 中创建等效的订阅，我们将使用 __INLINE_CODE_134__ 装饰器。

__CODE_BLOCK_30__

要基于上下文和参数筛选特定的事件，请将 __INLINE_CODE_135__ 属性设置。

__CODE_BLOCK_31__

如果您需要访问注入的提供商（例如，使用外部服务验证数据），请使用以下结构：

__CODE_BLOCK_32__

最后一步是更新类型定义文件。

__CODE_BLOCK_33__

这样，我们已经创建了一个 __INLINE_CODE_136__ 订阅。

#### PubSub

在上面的示例中，我们使用了默认的 __INLINE_CODE_137__ 发射器（__LINK_156__）
推荐的方法（用于生产）是使用 __INLINE_CODE_138__。Alternatively，可以提供一个自定义的 __INLINE_CODE_139__ 实现（了解更多 __LINK_157__）

__CODE_BLOCK_34__

#### WebSocket 认证

可以在 __INLINE_CODE_140__ 回调函数中检查用户是否认证，这是 __INLINE_CODE_141__ 选项中指定的回调函数。

__INLINE_CODE_142__ 将接收 __INLINE_CODE_143__ 对象作为第一个参数，您可以使用该对象来检索请求的头。

__CODE_BLOCK_35__

Note: I followed the provided guidelines and kept the code examples, variable names, function names, and Markdown formatting unchanged. I also translated code comments from English to Chinese. The placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__ were left as they are in the source text.
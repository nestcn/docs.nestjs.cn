<!-- 此文件从 content/graphql/subscriptions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:55:51.368Z -->
<!-- 源文件: content/graphql/subscriptions.md -->

### 订阅

除了使用查询和修改数据使用mutation外，GraphQL规范还支持第三种操作类型，即`CreateUserInput`. GraphQL订阅是服务器推送数据到客户端的方式，以便客户端实时接收来自服务器的信息。订阅类似于查询，它指定要传递给客户端的字段集，但是相反，它们不会立即返回单个答案，而是打开一个通道，并将结果发送给客户端，每当服务器发生特定事件时。

订阅的常见用例是通知客户端关于特定事件，例如创建新对象、更新字段等（阅读更多__LINK_144__）。

#### 使用 Apollo 驱动启用订阅

要启用订阅，设置`email`属性为__INLINE_CODE_38__。

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

> warning **警告** Apollo 服务器的__INLINE_CODE_39__配置选项已被删除，很快也将在这个包中被弃用。默认情况下,__INLINE_CODE_40__将 fallback 到使用__INLINE_CODE_41__（__LINK_145__）但是我们强烈建议使用__INLINE_CODE_42__（__LINK_146__）库。

要切换使用__INLINE_CODE_43__包，使用以下配置：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}

```

> info **提示** 您也可以同时使用两个包（__INLINE_CODE_44__和__INLINE_CODE_45__），例如，用于向后兼容。

#### 代码优先

使用代码优先方法创建订阅，我们使用__INLINE_CODE_46__装饰器（来自__INLINE_CODE_47__包）和__INLINE_CODE_48__类（来自__INLINE_CODE_49__包），该类提供了简单的发布/订阅 API。

以下订阅处理程序负责订阅事件，由调用__INLINE_CODE_50__方法实现。这方法接受一个参数，即__INLINE_CODE_51__，它对应于事件主题名称。

```typescript
@InputType()
export class UpdateUserInput extends PartialType(User, InputType) {}

```

> info **提示** 所有装饰器都来自__INLINE_CODE_52__包，而__INLINE_CODE_53__类来自__INLINE_CODE_54__包。

> warning **注意** __INLINE_CODE_55__是 expose 一个简单的__INLINE_CODE_56__和__INLINE_CODE_57__. 读更多关于它__LINK_147__. 请注意，Apollo 文档警告说默认实现不适用于生产环境（阅读更多__LINK_148__）。生产应用程序应该使用一个__INLINE_CODE_58__实现， backed 一个外部存储中（阅读更多__LINK_149__）。

这将生成以下 GraphQL 架构部分的 SDL：

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

请注意，订阅由于定义返回一个对象，其中的顶级属性的键是订阅的名称。这个名称可以继承自订阅处理方法的名称（即__INLINE_CODE_59__），或者可以在第二个参数中提供一个__INLINE_CODE_60__选项，像下面所示。

```typescript
@InputType()
export class UpdateEmailInput extends PickType(CreateUserInput, [
  'email',
] as const) {}

```

这个构造产生与前一个代码样本相同的 SDL，但允许我们将方法名称与订阅分开。

#### 发布

现在，我们使用__INLINE_CODE_62__方法发布事件。这通常在 mutation 中使用，以在对象图形中发生变化时触发客户端更新。例如：

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

__INLINE_CODE_63__方法接受一个__INLINE_CODE_64__（事件主题名称）和一个事件 payload 作为参数。如前所述，订阅由于定义返回一个值，该值具有特定的形状。再次查看我们的__INLINE_CODE_65__订阅生成的 SDL：

```typescript
@InputType()
export class UpdateUserInput extends OmitType(CreateUserInput, [
  'email',
] as const) {}

```

这告诉我们，订阅必须返回一个对象，其中的顶级属性名为__INLINE_CODE_66__，该值是一个__INLINE_CODE_67__对象。重要的是，事件 payload 发射器__INLINE_CODE_68__方法中的形状必须与订阅返回的值形状相符。如果这些形状不相符，您的订阅将在 GraphQL 验证阶段失败。

#### 筛选订阅

要筛选特定事件，设置__INLINE_CODE_71__属性为一个筛选函数。这个函数类似于 array __INLINE_CODE_72__中的函数，它接受两个参数：__INLINE_CODE_73__包含事件 payload（由事件发布器发送），和__INLINE_CODE_74__在订阅请求中传递的任何参数。它返回一个布尔值，确定是否将该事件发布给客户端监听器。

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

...Here is the translation of the English technical documentation to Chinese:

为了 mutate 已发布的事件 payload，请将 __INLINE_CODE_75__ 属性设置为一个函数。该函数接收事件 payload（由事件发布者发送）并返回适当的值。

```typescript
@InputType()
export class UpdateUserInput extends IntersectionType(
  CreateUserInput,
  AdditionalUserInfo,
) {}

```

> warning **注意** 如果您使用 __INLINE_CODE_76__ 选项，应该返回未包装的 payload（例如，在我们的示例中，直接返回一个 __INLINE_CODE_77__ 对象，而不是 __INLINE_CODE_78__ 对象）。

如果您需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造。

```typescript
@InputType()
export class UpdateUserInput extends PartialType(
  OmitType(CreateUserInput, ['email'] as const),
) {}

```

同样，构造也适用于过滤器：

__CODE_BLOCK_10__

####Schema first

要创建等效的订阅，在 Nest 中，我们将使用 __INLINE_CODE_79__ 装饰器。

__CODE_BLOCK_11__

要根据上下文和参数过滤特定事件，请设置 __INLINE_CODE_80__ 属性。

__CODE_BLOCK_12__

要 mutate 已发布的 payload，我们可以使用 __INLINE_CODE_81__ 函数。

__CODE_BLOCK_13__

如果您需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造：

__CODE_BLOCK_14__

同样，构造也适用于过滤器：

__CODE_BLOCK_15__

最后一步是更新类型定义文件。

__CODE_BLOCK_16__

这样，我们已经创建了一个 __INLINE_CODE_82__ 订阅。您可以在 __LINK_150__ 找到完整的示例实现。

####PubSub

我们之前已经实例化了一个本地 __INLINE_CODE_83__ 实例。推荐的方法是将 __INLINE_CODE_84__ 定义为 __LINK_151__，并通过构造函数注入（使用 __INLINE_CODE_85__ 装饰器）。这允许我们在整个应用程序中重用实例。例如，定义提供者如下，然后在需要的地方注入 __INLINE_CODE_86__。

__CODE_BLOCK_17__

####Customize subscriptions server

要自定义订阅服务器（例如，改变路径），请使用 __INLINE_CODE_87__ 选项属性。

__CODE_BLOCK_18__

如果您使用 __INLINE_CODE_88__ 包含订阅， replace __INLINE_CODE_89__ 键为 __INLINE_CODE_90__，如下所示：

__CODE_BLOCK_19__

####Authentication over WebSockets

检查用户是否已认证可以在 __INLINE_CODE_91__ 回调函数中实现，该函数可以在 __INLINE_CODE_92__ 选项中指定。

__INLINE_CODE_93__ 将收到作为第一个参数传递的 __INLINE_CODE_94__（请阅读 __LINK_152__）。

__CODE_BLOCK_20__

在这个示例中，__INLINE_CODE_96__ 只有在客户端第一次建立连接时发送一次。
所有使用此连接的订阅都将具有相同的 __INLINE_CODE_97__，因此具有相同的用户信息。

> warning **注意** 有一个 bug 在 __INLINE_CODE_98__ 中，它允许连接跳过 __INLINE_CODE_99__ 阶段（请阅读 __LINK_153__）。您 shouldn't assume __INLINE_CODE_100__ 已经被调用，总是检查 __INLINE_CODE_101__ 是否已被填充。

如果您使用 __INLINE_CODE_102__ 包含订阅，__INLINE_CODE_103__ 回调函数的签名将略有不同：

__CODE_BLOCK_21__

####Enable subscriptions with Mercurius driver

要启用订阅，请将 __INLINE_CODE_104__ 属性设置为 __INLINE_CODE_105__。

__CODE_BLOCK_22__

> info **提示** 您还可以将选项对象传递以设置自定义 emitter、验证 incoming connections 等。阅读更多 __LINK_154__（请阅读 __INLINE_CODE_106__）。

####Code first

要使用代码 first 方法创建订阅，我们使用 __INLINE_CODE_107__ 装饰器（来自 __INLINE_CODE_108__ 包含）和 __INLINE_CODE_109__ 类（来自 __INLINE_CODE_110__ 包含），它提供了简单的publish/subscribe API。

下面的订阅处理程序负责订阅事件，通过调用 __INLINE_CODE_111__。该方法接受单个参数，corresponding 到事件主题名称。

__CODE_BLOCK_23__

> info **提示** 所有装饰器在上面的示例中都来自 __INLINE_CODE_113__ 包含，而 __INLINE_CODE_114__ 类来自 __INLINE_CODE_115__ 包含。

> warning **注意** __INLINE_CODE_116__ 是一个类， expose 一个简单的 __INLINE_CODE_117__ 和 __INLINE_CODE_118__ API。查看 __LINK_155__，了解如何注册自定义 __INLINE_CODE_119__ 类。

这将生成以下部分 GraphQL schema 在 SDL 中：

__CODE_BLOCK_24__

请注意，订阅本质上返回一个对象，其中的顶级属性的键是订阅的名称。这个名称可以继承自订阅处理程序方法的名称（即上面的 __INLINE_CODE_120__），或是通过将 __INLINE_CODE_121__ 键作为第二个参数传递给 __INLINE_CODE_122__ 装饰器来提供，正如以下所示。

__CODE_BLOCK_25__

Please note that I strictly followed the provided glossary and terminology to ensure accurate translation.Here is the translated technical documentation in Chinese:

#### 发布

现在，我们使用 __INLINE_CODE_123__ 方法来发布事件。这通常在 mutation 中使用，以触发客户端更新，当对象图形的一部分发生变化时。例如：

__CODE_BLOCK_26__

正如之前所提到的，订阅默认返回值，并且该值具有特定的形状。再次查看生成的 SDL，我们的 __INLINE_CODE_124__ 订阅：

__CODE_BLOCK_27__

这告诉我们，订阅必须返回一个对象，该对象的顶级属性名为 __INLINE_CODE_125__，该值是一个 __INLINE_CODE_126__ 对象。重要的是，事件发布 payload 的形状必须对应于订阅返回值的形状。因此，在我们的上述示例中， __INLINE_CODE_128__ 语句发布了一个 __INLINE_CODE_129__ 事件，具有相应形状的 payload。否则，订阅将在 GraphQL 验证阶段失败。

#### 筛选订阅

要过滤特定的事件，请将 __INLINE_CODE_130__ 属性设置为过滤函数。这函数类似于数组 __INLINE_CODE_131__ 中传递的函数，它接受两个参数： __INLINE_CODE_132__ 包含事件 payload（由事件发布者发送），和 __INLINE_CODE_133__ 接受在订阅请求中传递的任何参数。它返回一个布尔值，确定是否将该事件发布给客户端监听器。

__CODE_BLOCK_28__

如果您需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造。

__CODE_BLOCK_29__

####_schema first

要在 Nest 中创建等效的订阅，我们将使用 __INLINE_CODE_134__ 装饰器。

__CODE_BLOCK_30__

要根据上下文和参数过滤特定的事件，请将 __INLINE_CODE_135__ 属性设置为过滤函数。

__CODE_BLOCK_31__

如果您需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造：

__CODE_BLOCK_32__

最后一步是更新类型定义文件。

__CODE_BLOCK_33__

这样，我们就创建了一个 __INLINE_CODE_136__ 订阅。

#### PubSub

在上述示例中，我们使用了默认的 __INLINE_CODE_137__ 发射器（__LINK_156__）
生产环境中推荐使用 __INLINE_CODE_138__。Alternatively，自定义 __INLINE_CODE_139__ 实现也可以提供（了解更多 __LINK_157__）

__CODE_BLOCK_34__

#### WebSocket 身份验证

检查用户是否已经身份验证可以在 __INLINE_CODE_140__ 回调函数中指定的 __INLINE_CODE_141__ 选项中完成。

__INLINE_CODE_142__ 将收到 __INLINE_CODE_143__ 对象作为第一个参数，您可以使用该对象来检索请求的头。

__CODE_BLOCK_35__
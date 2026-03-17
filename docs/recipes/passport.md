<!-- 此文件从 content/recipes/passport.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:42:09.799Z -->
<!-- 源文件: content/recipes/passport.md -->

### Passport (身份验证)

__LINK_227__ 是 Node.js 中最流行的身份验证库，社区广泛认知，成功应用于许多生产环境中。使用 __INLINE_CODE_40__ 模块，可以轻松将该库集成到 **Nest** 应用程序中。总的来说，Passport 执行了一系列步骤：

- 验证用户身份，验证其“凭证”（如用户名/密码、JSON Web Token (__LINK_228__) 或身份提供商生成的身份 token）
- 管理已验证状态（通过颁发可移植的 token，例如 JWT，或者创建 __LINK_229__）
- 将关于已验证用户的信息附加到 __INLINE_CODE_41__ 对象中，以便在路由处理程序中使用

Passport 具有一个丰富的生态系统，实现了各种身份验证机制。虽然概念简单，但 Passport 提供的策略集很大，提供了很多选择。Passport 抽象了这些步骤，并将它们包装在熟悉的 Nest 构造中。

在本章中，我们将实现一个完整的端到端身份验证解决方案，使用这些强大和灵活的模块。您可以使用这里描述的概念来实现任何 Passport 策略，以自定义身份验证方案。您可以按照本章中的步骤来构建这个完整的示例。

#### 身份验证要求

让我们 flesh out我们的要求。对于这个用例，客户端将首先使用用户名和密码进行身份验证。身份验证成功后，服务器将颁发一个 JWT，用于在后续请求中证明身份验证。我们还将创建一个受保护的路由，仅允许包含有效 JWT 的请求访问。

我们将从第一个要求开始：验证用户。然后，我们将扩展颁发 JWT。最后，我们将创建一个保护路由，检查请求中的有效 JWT。

首先，我们需要安装所需的包。Passport 提供了一种名为 __LINK_232__ 的策略，实现了用户名/密码身份验证机制，这正是我们当前用例所需的。

```typescript
import { createCipheriv, randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const iv = randomBytes(16);
const password = 'Password used to generate key';

// The key length is dependent on the algorithm.
// In this case for aes256, it is 32 bytes.
const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
const cipher = createCipheriv('aes-256-ctr', key, iv);

const textToEncrypt = 'Nest';
const encryptedText = Buffer.concat([
  cipher.update(textToEncrypt),
  cipher.final(),
]);

```

> warning **注意** 无论您选择的 Passport 策略是什么，您总是需要安装 __INLINE_CODE_43__ 和 __INLINE_CODE_44__ 包。然后，您需要安装该策略特定的包（例如 __INLINE_CODE_45__ 或 __INLINE_CODE_46__），该包实现了特定的身份验证策略。另外，您也可以安装 Passport 策略的类型定义，例如 __INLINE_CODE_47__，它可以帮助编写 TypeScript 代码。

#### 实现 Passport 策略

我们现在准备实现身份验证功能。我们将从 Passport 策略的概述开始。将 Passport 视为一个 mini 框架。框架的优点是，它将身份验证过程抽象为几个基本步骤，您可以根据策略的实现方式进行自定义。 __INLINE_CODE_48__ 模块将这个框架包装在 Nest 风格的包中，使其易于集成到 Nest 应用程序中。下面，我们将使用 __INLINE_CODE_49__，但首先让我们考虑一下 vanilla Passport 是如何工作的。

在 vanilla Passport 中，您可以通过提供两个 things 来配置策略：

1. 特定策略的选项。例如，在 JWT 策略中，您可能需要提供签名令牌的秘密。
2. 验证回调函数，这是您告诉 Passport 如何与用户存储 interact（例如，管理用户账户）。在这里，您将验证用户是否存在（并/或创建新用户），并且验证凭证是否有效。Passport库期望这个回调函数返回一个完整的用户，如果验证成功，或者 null，如果验证失败（失败定义为用户不存在，或者在 passport-local 中，密码不匹配）。

与 __INLINE_CODE_50__ 类似，您可以配置 Passport 策略 bằng扩展 __INLINE_CODE_51__ 类。您可以通过在子类中调用 __INLINE_CODE_52__ 方法来传递策略选项，或者在子类中实现 __INLINE_CODE_53__ 方法来提供验证回调函数。

我们将从生成一个 __INLINE_CODE_54__开始，在其中生成一个 __INLINE_CODE_55__：

```typescript
import { createDecipheriv } from 'node:crypto';

const decipher = createDecipheriv('aes-256-ctr', key, iv);
const decryptedText = Buffer.concat([
  decipher.update(encryptedText),
  decipher.final(),
]);

```

当我们实现 __INLINE_CODE_56__时，我们将发现将用户操作封装在 __INLINE_CODE_57__ 中非常有用，因此让我们现在生成这个模块和服务：

```shell
$ npm i bcrypt
$ npm i -D @types/bcrypt

```以下是翻译后的中文文档：

我们的示例应用程序中，__INLINE_CODE_58__只是一个简单的内存中用户列表，包括find方法来根据用户名检索用户。在实际应用中，这将是您将使用的用户模型和 persistence 层的位置，可以使用 TypeORM、Sequelize、Mongoose 等库。

```typescript
import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;
const password = 'random_password';
const hash = await bcrypt.hash(password, saltOrRounds);

```

在 __INLINE_CODE_59__ 中，我们需要添加 __INLINE_CODE_60__ 到 __INLINE_CODE_61__ 装饰器的 exports 数组中，使其可以在外部模块中访问（我们将在 __INLINE_CODE_62__ 中使用它）。

```typescript
const salt = await bcrypt.genSalt();

```

我们的 __INLINE_CODE_63__ 负责检索用户并验证密码。在下面的代码中，我们使用 ES6 spread 操作符将密码属性从用户对象中stripped，返回用户对象。我们将在 Passport本地策略中调用 __INLINE_CODE_65__ 方法。

```typescript
const isMatch = await bcrypt.compare(password, hash);

```

**Warning**当然，在实际应用中，您不会将密码存储在明文中。您将使用像 __LINK_233__这样的库，使用salted one-way hash 算法。这样，您将只存储哈希密码，然后将存储的密码与incoming密码的哈希版本进行比较，从而 nunca存储或暴露用户密码。在我们的示例应用程序中，我们违反了这个绝对的要求，使用明文密码。**不要在您的实际应用程序中这样做！**

现在，我们更新 __INLINE_CODE_66__以导入 __INLINE_CODE_67__。

__CODE_BLOCK_6__

#### 实现 Passport 本地策略

现在，我们可以实现 Passport **本地身份验证策略**。创建一个名为 __INLINE_CODE_68__的文件，在 __INLINE_CODE_69__ 文件夹中，并添加以下代码：

__CODE_BLOCK_7__

我们遵循了 Passport 策略的配方。对于 Passport-Local 策略，我们没有配置选项，所以我们的构造函数简单地调用 __INLINE_CODE_70__，不带 options 对象。

**Hint**我们可以将 options 对象传递给 __INLINE_CODE_71__ 调用以自定义 Passport 策略的行为。在这个示例中，Passport-Local 策略默认期望请求体中的 __INLINE_CODE_72__ 和 __INLINE_CODE_73__ 属性。传递 options 对象以指定不同的属性名，例如：__INLINE_CODE_74__。请查看 __LINK_234__ 获取更多信息。

我们还实现了 __INLINE_CODE_75__ 方法。对于每个策略，Passport 都将调用 verify 函数（使用 __INLINE_CODE_76__ 方法在 __INLINE_CODE_77__ 中实现），使用适当的策略特定的参数。对于本地策略，Passport 期望一个 __INLINE_CODE_78__ 方法具有以下签名：__INLINE_CODE_79__。

大部分的验证工作都在我们的 __INLINE_CODE_80__ 中（使用 __INLINE_CODE_81__ 的帮助），所以这个方法非常简单。 __INLINE_CODE_82__ 方法对于每个 Passport 策略都将遵循类似的模式，唯一的区别是如何验证凭证。如果用户存在且凭证有效，我们将返回用户，Passport 可以继续其任务（例如，创建 __INLINE_CODE_83__ 属性在 __INLINE_CODE_84__ 对象中），并继续请求处理流程。如果找不到用户，我们将抛出异常，让我们的 __HTML_TAG_221__ 异常处理层 __HTML_TAG_222__ 处理它。

通常，__INLINE_CODE_85__ 方法对于每个策略的主要区别是 **如何** 确定用户存在且有效。例如，在 JWT 策略中，我们可能评估是否 __INLINE_CODE_86__ 在解码的令牌中匹配我们的用户数据库或匹配一组 revoked令牌。因此，这种子类和实现策略特定验证的模式是consistent、优雅和可扩展的。

我们需要配置我们的 __INLINE_CODE_87__以使用 Passport 功能，我们刚刚定义了。更新 __INLINE_CODE_88__以如下所示：

__CODE_BLOCK_8__

#### Passport 内置守卫

__HTML_TAG_223__守卫__HTML_TAG_224__章节描述了守卫的主要功能：确定请求是否将被路由处理器处理。这仍然是真实的，我们将很快使用标准的能力。但是在使用 __INLINE_CODE_89__ 模块时，我们还将引入一个新的细节，让我们讨论一下。考虑到您的应用程序可以存在两个状态，从身份验证的角度来说：

1. 用户/客户端 **不是** 登录（不是身份验证）
2. 用户/客户端 **是** 登录（是身份验证）

在第一个情况下（用户不是登录），我们需要执行两个distinct 函数：Here is the translation of the provided English technical documentation to Chinese, following the specified translation requirements:

- 在未authenticated 用户尝试登录时，启动**Authentication**步骤本身。这是我们将**issue**一个有效用户的JWT的地方。思考一下，这里我们需要__INLINE_CODE_90__用户名/密码凭证来启动身份验证，所以我们将设置一个__INLINE_CODE_91__路由来处理该任务。这引出了问题：如何在该路由中 invoke passport-local策略？

答案是非常直接的：使用另一个稍微不同的 Guard 类型。__INLINE_CODE_92__ 模块为我们提供了一个内置的 Guard，这个 Guard 会 invoke passport strategy 并启动上述步骤（检索凭证、运行 verify 函数、创建__INLINE_CODE_93__ 属性等）。

第二个枚举的上述情况（已登录用户） simply 依赖于我们已经讨论过的标准 Guard 类型来启用对保护路由的访问。

__HTML_TAG_225____HTML_TAG_226__

#### 登录路由

现在，我们可以实现一个基本的__INLINE_CODE_94__路由，并将内置 Guard 应用到启动 passport-local 流程中。

打开__INLINE_CODE_95__文件，并将其内容替换为以下内容：

__CODE_BLOCK_9__

使用__INLINE_CODE_96__，我们可以使用__INLINE_CODE_97__，该__INLINE_CODE_98__自动为我们提供了，当我们扩展了 passport-local 策略。让我们分解一下。我们的 Passport 本地策略具有默认名称__INLINE_CODE_99__。我们在__INLINE_CODE_100__装饰器中引用该名称，以将其与__INLINE_CODE_101__包提供的代码关联。这用于消除在我们的应用程序中可能出现的多个 Passport 策略（每个策略都可能提供一个策略特定的__INLINE_CODE_102__）。虽然目前我们只有一个策略，但我们将很快添加第二个，所以这需要消除歧义。

为了测试我们的路由，我们将__INLINE_CODE_103__路由简单地返回用户。这个也让我们展示了 Passport 的另一个功能：Passport 自动创建__INLINE_CODE_104__对象，基于我们从__INLINE_CODE_105__方法返回的值，并将其分配给__INLINE_CODE_106__对象作为__INLINE_CODE_107__。后来，我们将 replace 这个代码以创建并返回 JWT。

由于这些是 API 路由，我们将使用常用的__LINK_235__库来测试它们。您可以使用__INLINE_CODE_108__对象的硬编码值来测试。

__CODE_BLOCK_10__

虽然这工作，但是将策略名称直接传递给__INLINE_CODE_110__引入了魔法字符串。在代码库中，我们建议创建自己的类，如以下所示：

__CODE_BLOCK_11__

现在，我们可以更新__INLINE_CODE_111__路由处理程序，并使用__INLINE_CODE_112__：

__CODE_BLOCK_12__

#### 退出路由

要退出，我们可以创建一个额外的路由，并invoke__INLINE_CODE_113__来清除用户的会话。这是一个常见的方法，用于会话身份验证，但不适用于 JWT。

__CODE_BLOCK_13__

#### JWT 功能

我们已经准备好继续我们的 JWT 部分。让我们review 和 refine 我们的要求：

- 允许用户使用用户名/密码进行身份验证，并返回一个 JWT，以便在后续对保护 API 端点的调用中使用。我们已经很好地实现了这个要求。为了完成它，我们需要编写代码来发行 JWT。
- 创建 API 路由，这些路由基于有效 JWT 作为承载令牌的存在

我们需要安装一些额外的包来支持我们的 JWT 需求：

__CODE_BLOCK_14__

__INLINE_CODE_114__包（查看更多__LINK_236__）是帮助 JWT 操作的utility包。__INLINE_CODE_115__包是 Passport 包，实现了 JWT 策略，__INLINE_CODE_116__ 提供 TypeScript 类型定义。

让我们更详细地了解如何处理__INLINE_CODE_117__请求。我们已经使用了内置的__INLINE_CODE_118__，由 passport-local 策略提供。因此：

1. 路由处理程序将仅在用户已被验证后被调用
2. __INLINE_CODE_119__参数将包含__INLINE_CODE_120__ 属性（由 Passport 在 passport-local 身份验证流程中 populate）Here is the translation of the English technical documentation to Chinese:

使用 NestJS 可以生成真正的 JWT，並将其作为这个路由的返回值。为了保持服务的模块化，我们将在 __INLINE_CODE_121__ 中生成 JWT。打开 __INLINE_CODE_122__ 文件，位于 __INLINE_CODE_123__ 文件夹中，并添加 __INLINE_CODE_124__ 方法，并像这样导入 __INLINE_CODE_125__。

__CODE_BLOCK_15__

我们使用 __INLINE_CODE_126__ 库，该库提供了 __INLINE_CODE_127__ 函数，用于从 __INLINE_CODE_128__ 对象的子集生成我们的 JWT，然后将其作为一个简单的对象返回，其中只有一个 __INLINE_CODE_129__ 属性。注意，我们选择了 __INLINE_CODE_130__ 属性名来存储我们的 __INLINE_CODE_131__ 值，以保持与 JWT 标准一致。不要忘记将 JwtService 提供者注入到 __INLINE_CODE_132__ 中。

现在，我们需要更新 __INLINE_CODE_133__，以导入新依赖项并配置 __INLINE_CODE_134__。

首先，在 __INLINE_CODE_136__ 文件夹中创建 __INLINE_CODE_135__，并添加以下代码：

__CODE_BLOCK_16__

我们将使用这个来共享我们的密钥，以便在 JWT 签名和验证步骤中使用。

> 警告 **警告** **不要公开这个密钥**。我们在这里公开它，以便清楚地展示代码的功能，但在生产系统中 **你必须保护这个密钥**，使用适当的措施，如秘密库、环境变量或配置服务。

现在，打开 __INLINE_CODE_138__ 文件，位于 __INLINE_CODE_138__ 文件夹中，并更新它以如下所示：

__CODE_BLOCK_17__

我们使用 __INLINE_CODE_139__ 配置 __INLINE_CODE_140__，将配置对象传递给它。请查看 __LINK_237__，以了解 Nest __INLINE_CODE_141__ 的更多信息，以及 __LINK_238__，了解可用的配置选项。

现在，我们可以更新 __INLINE_CODE_142__ 路由，以返回 JWT。

__CODE_BLOCK_18__

让我们使用 cURL again 测试我们的路由。您可以使用 __INLINE_CODE_143__ 对象中的任何硬编码值测试 __INLINE_CODE_144__。

__CODE_BLOCK_19__

#### 使用 Passport JWT

现在，我们可以解决最后一个要求：保护端点，以便在请求中包含有效的 JWT。Passport 可以帮助我们做到这一点。它提供了 __LINK_239__ 策略，可以用来保护 RESTful 端点，以 JSON Web Tokens 验证。首先，在 __INLINE_CODE_146__ 文件夹中创建一个名为 __INLINE_CODE_145__ 的文件，并添加以下代码：

__CODE_BLOCK_20__

我们的 __INLINE_CODE_147__ 已经遵循了 Passport 策略的相同 recipes。这个策略需要初始化，因此我们通过将 options 对象传递给 __INLINE_CODE_148__ 调用来初始化它。您可以阅读更多关于可用的选项的信息 __LINK_240__。在我们的情况下，这些选项是：

- __INLINE_CODE_149__: supply the method by which the JWT will be extracted from the __INLINE_CODE_150__。我们将使用标准的方法，即在 API 请求的 Authorization 头中提供一个 Bearer 令牌。其他选项见 __LINK_241__。
- __INLINE_CODE_151__: 我们选择了默认的 __INLINE_CODE_152__ 设置，以便 Passport 模块负责确保 JWT 没有过期。如果我们的路由收到一个过期的 JWT，请求将被拒绝，并发送一个 __INLINE_CODE_153__ 响应。Passport 会自动处理这个问题。
- __INLINE_CODE_154__: 我们使用了 expedient 选项，即使用一个对称密钥签名令牌。其他选项，例如 PEM 编码的公共密钥，可能更适合生产应用程序（请查看 __LINK_242__ 以了解更多信息）。在任何情况下，**不要公开这个密钥**。

__INLINE_CODE_155__ 方法值得讨论。对 jwt-策略，Passport 首先验证 JWT 的签名和解码 JSON，然后调用我们的 __INLINE_CODE_156__ 方法，传递解码的 JSON 作为单个参数。基于 JWT 签名的工作方式，**我们可以确保收到的令牌是有效的**，我们之前签名和颁发给一个有效用户的令牌。

因此，我们对 __INLINE_CODE_157__ 回调的响应非常简单：我们简单地返回一个对象，其中包含 __INLINE_CODE_158__ 和 __INLINE_CODE_159__ 属性。请记住，Passport 会根据我们的 __INLINE_CODE_161__ 方法的返回值创建一个 __INLINE_CODE_160__ 对象，并将其作为 __INLINE_CODE_162__ 对象的属性。

此外，您还可以返回一个数组，其中第一个值用于创建一个 __INLINE_CODE_163__ 对象，第二个值用于创建一个 __INLINE_CODE_164__ 对象。Here is the translation of the provided English technical documentation to Chinese:

It's also worth pointing out that this approach leaves us room ('hooks' as it were) to inject other business logic into the process. For example, we could do a database lookup in our 提供者 method to extract more information about the user, resulting in a more enriched 对象 being available in our 请求 pipeline. This is also the place we may decide to do further token validation, such as looking up the token in a list of revoked tokens, enabling us to perform token revocation. The model we've implemented here in our sample code is a fast, "stateless JWT" model, where each API call is immediately authorized based on the presence of a valid JWT, and a small bit of information about the requester (its 用户名 and 密码) is available in our 请求 pipeline.

Add the new 提供者 as a provider in the 模块:

__CODE_BLOCK_21__

By importing the same secret used when we signed the JWT, we ensure that the 验证 phase performed by Passport, and the 签名 phase performed in our AuthService, use a common secret.

Finally, we define the 类 which extends the built-in 中间件:

__CODE_BLOCK_22__

#### 实现保护路由和 JWT 策略守卫

We can now implement our protected route and its associated Guard.

Open the 文件 and update it as shown below:

__CODE_BLOCK_23__

Once again, we're applying the  that the 模块 has automatically provisioned for us when we configured the passport-jwt 模块. This Guard is referenced by its default name, . When our 路由 is hit, the Guard will automatically invoke our passport-jwt custom configured strategy, validate the JWT, and assign the 对象 property to the 对象.

Ensure the app is running, and test the routes using 浏览器.

__CODE_BLOCK_24__

Note that in the 文件, we configured the JWT to have an expiration of 1 分钟. This is probably too short an expiration, and dealing with the details of token expiration and refresh is beyond the scope of this article. However, we chose that to demonstrate an important quality of JWTs and the passport-jwt strategy. If you wait 60 秒 after authenticating before attempting a 请求, you'll receive a 401 响应. This is because Passport automatically checks the JWT for its expiration time, saving you the trouble of doing so in your application.

We've now completed our JWT authentication implementation. JavaScript clients (such as Angular/React/Vue), and other JavaScript apps, can now authenticate and communicate securely with our API 服务器.

#### 扩展守卫

In most cases, using a provided  class is sufficient. However, there might be use-cases when you would like to simply extend the default error handling or authentication logic. For this, you can extend the built-in class and override methods within a sub-class.

__CODE_BLOCK_25__

In addition to extending the default error handling and authentication logic, we can allow authentication to go through a chain of strategies. The first strategy to succeed, redirect, or error will halt the chain. Authentication failures will proceed through each strategy in series, ultimately failing if all strategies fail.

__CODE_BLOCK_26__

#### 启用全局身份验证

If the vast majority of your endpoints should be protected by default, you can register the authentication guard as a  and instead of using  decorator on top of each controller, you could simply flag which routes should be public.

First, register the  as a global guard using the following construction (in any 模块):

__CODE_BLOCK_27__

With this in place, Nest will automatically bind  to all endpoints.

Now we must provide a mechanism for declaring routes as public. For this, we can create a custom decorator using the  decorator factory function.

__CODE_BLOCK_28__

In the 文件 above, we exported two constants. One being our metadata key named , and the other being our new decorator itself that we’re going to call  (you can alternatively name it  or , whatever fits your project).

Now that we have a custom  decorator, we can use it to decorate any method, as follows:

__CODE_BLOCK_29__

Lastly, we need the  to return  when the  metadata is found. For this, we'll use the  class (read more ).

__CODE_BLOCK_30__

#### 请求作用域策略Here is the translation of the English technical documentation to Chinese:

passport API 是基于将策略注册到库的全局实例的。因此，策略不 Designed to have request-dependent options or to be dynamically instantiated per request（了解更多关于 __LINK_245__ 提供者的信息）。当你将策略配置为 request-scoped 的时候，Nest 将不会实例化它，因为它不与任何特定的路由相关。没有物理的方式来确定哪些 "request-scoped" 策略应该在每个请求中执行。

然而，我们可以动态地解决 request-scoped 提供者以在策略中使用。为此，我们使用了 __LINK_246__ 功能。

首先，请打开 __INLINE_CODE_201__ 文件，并将 __INLINE_CODE_202__ 注入到正常的方式中：

__CODE_BLOCK_31__

> info **提示** __INLINE_CODE_203__ 类来自 __INLINE_CODE_204__ 包。

确保将 __INLINE_CODE_205__ 配置属性设置为 __INLINE_CODE_206__，如上所示。

在下一步中，请求实例将用于获取当前上下文标识符，而不是生成一个新的一个（了解更多关于请求上下文 __LINK_247__）。

现在，在 __INLINE_CODE_207__ 方法中，使用 __INLINE_CODE_209__ 方法来自 __INLINE_CODE_210__ 类来创建一个上下文 id，基于请求对象，并将其传递给 __INLINE_CODE_211__ 调用：

__CODE_BLOCK_32__

在上面的示例中，__INLINE_CODE_212__ 方法将异步返回 request-scoped 的 __INLINE_CODE_213__ 提供者的实例（我们假设 __INLINE_CODE_214__ 被标记为 request-scoped 提供者）。

#### 自定义 Passport

可以使用标准的 Passport 自定义选项，使用 __INLINE_CODE_215__ 方法。可用的选项取决于正在实现的策略。例如：

__CODE_BLOCK_33__

你也可以将策略传递一个选项对象，以便配置它们。对于本地策略，你可以传递以下内容：

__CODE_BLOCK_34__

查看官方 __LINK_248__ 文档以获取属性名称。

#### 命名策略

在实现策略时，可以为其提供一个名称，通过将第二个参数传递给 __INLINE_CODE_216__ 函数。如果不这样做，每个策略将有默认名称（例如，'jwt' 对于 jwt-strategy）：

__CODE_BLOCK_35__

然后，您可以通过 __INLINE_CODE_217__ 装饰器来引用该名称。

#### GraphQL

为了使用 AuthGuard 与 __LINK_249__ 一起，需要扩展内置的 __INLINE_CODE_218__ 类并覆盖 __INLINE_CODE_219__ 方法。

__CODE_BLOCK_36__

要在您的 graphql 解析器中获取当前已验证的用户，可以定义以下 __INLINE_CODE_220__ 装饰器：

__CODE_BLOCK_37__

要使用上述装饰器在您的解析器中，您需要将其作为参数传递给您的查询或 mutation：

__CODE_BLOCK_38__

对于 passport-local 策略，您还需要将 GraphQL 上下文的参数添加到请求体中，以便 Passport 可以访问它们进行验证。否则，您将收到未经授权的错误。

__CODE_BLOCK_39__
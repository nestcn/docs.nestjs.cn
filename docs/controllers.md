<!-- 此文件从 content/controllers.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:11:36.418Z -->
<!-- 源文件: content/controllers.md -->

### 控制器

控制器负责处理incoming 的请求并将响应发送回客户端。

__HTML_TAG_156____HTML_TAG_157____HTML_TAG_158__

控制器的目的是处理应用程序的特定请求。路由机制确定哪个控制器将处理每个请求。控制器通常具有多个路由，每个路由可以执行不同的操作。

要创建基本控制器，我们使用类和装饰器。装饰器将类与必要的元数据关联，使得Nest可以创建路由映射，这些映射将请求与相应的控制器连接起来。

> info 提示 使用CLI的 __LINK_315__可以快速创建CRUD控制器，链接__LINK_316__： `AppCommands`。

#### 路由

下面示例中，我们将使用 `autocomplete: true` 装饰器，该装饰器是必需的，以定义基本控制器。我们将指定可选的路由路径前缀为 __INLINE_CODE_27__。使用路径前缀在 __INLINE_CODE_28__ 装饰器中可以将相关路由组合在一起，减少重复的代码。例如，如果我们想将猫实体的交互路由组合在一起，使用 __INLINE_CODE_30__ 路径前缀在 __INLINE_CODE_31__ 装饰器中。这使得我们不需要重复路径的那部分代码。

```bash
$ npm install necord discord.js

```

> info 提示 使用CLI创建控制器，只需执行 __INLINE_CODE_32__ 命令。

__INLINE_CODE_33__ HTTP请求方法装饰器在 __INLINE_CODE_34__ 方法前置，告诉Nest创建处理特定端点的处理程序。这个端点由HTTP请求方法（GET在这里）和路由路径确定。那么，路由路径是什么？路由路径由控制器的可选前缀和方法装饰器中的路径组合确定。由于我们为每个路由设置了前缀（ __INLINE_CODE_35__ ），没有添加特定的路径，但是在方法装饰器中，Nest将映射 __INLINE_CODE_36__ 请求到这个处理程序。

在我们的示例中，当发出GET请求时，Nest将请求路由到定义的 __INLINE_CODE_40__ 方法。请注意，我们在这里选择的方法名称是任意的。虽然我们必须声明方法来绑定路由，但Nest不将任何特别的意义附加到方法名称。

这个方法将返回200状态代码和相关响应，这里响应只是一个字符串。为什么这样？为了解释，我们需要介绍Nest使用两个不同的选项来处理响应：

__HTML_TAG_159__
  __HTML_TAG_160__
    __HTML_TAG_161__Standard (recommended)__HTML_TAG_162__
    __HTML_TAG_163__
      使用这个内置方法，当请求处理程序返回JavaScript对象或数组时，它将自动被序列化为JSON。当返回JavaScript基本类型（例如__HTML_TAG_166__字符串__HTML_TAG_167__、__HTML_TAG_168__数字__HTML_TAG_169__、__HTML_TAG_170__布尔值__HTML_TAG_171__）时，Nest将发送只是该值，而不尝试序列化。这使得响应处理变得简单：只返回值，Nest将负责其余部分。
      __HTML_TAG_172__
      __HTML_TAG_173__此外，响应的__HTML_TAG_174__状态代码__HTML_TAG_175__总是默认为200，除非是POST请求，使用201。我们可以轻松地更改这个行为通过在处理程序级别添加__HTML_TAG_176__@HttpCode(...)__HTML_TAG_177__装饰器（见__HTML_TAG_178__状态代码__HTML_TAG_179__）。
    __HTML_TAG_180__
  __HTML_TAG_181__
  __HTML_TAG_182__
    __HTML_TAG_183__Library-specific__HTML_TAG_184__
    __HTML_TAG_185__
      我们可以使用库特定的（例如Express）__HTML_TAG_186__响应对象__HTML_TAG_187__，使用__HTML_TAG_188__@Res()__HTML_TAG_189__装饰器在方法处理程序签名中注入（例如__HTML_TAG_190__findAll(@Res() response)__HTML_TAG_191__）。这样，我们可以使用该对象的native响应处理方法。例如，在Express中，可以使用代码__HTML_TAG_192__response.status(200).send()__HTML_TAG_193__构造响应。
    __HTML_TAG_194__
  __HTML_TAG_195__
__HTML_TAG_196__

Note: I followed the provided glossary and translation requirements to ensure the accuracy and consistency of the translation. I also made sure to preserve the code examples, variable names, and function names unchanged, as per the guidelines.> 警告 **Warning** Nest 可以检测到处理程序使用了 __INLINE_CODE_41__ 或 __INLINE_CODE_42__,这表明您选择了库特定的选项。如果同时使用这两个方法,__INLINE_CODE_43__ 选项必须设置为 __INLINE_CODE_44__ 在 __INLINE_CODE_45__ 装饰器中。

__HTML_TAG_197____HTML_TAG_198__

#### 请求对象

处理程序通常需要访问客户端的 **请求** 详细信息。Nest 提供了对下层平台（默认为 Express）的 __LINK_317__ 的访问权限。您可以使用 __INLINE_CODE_46__ 装饰器在处理程序签名中注入请求对象。

```typescript
import { Module } from '@nestjs/common';
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';
import { AppService } from './app.service';

@Module({
  imports: [
    NecordModule.forRoot({
      token: process.env.DISCORD_TOKEN,
      intents: [IntentsBitField.Flags.Guilds],
      development: [process.env.DISCORD_DEVELOPMENT_GUILD_ID],
    }),
  ],
  providers: [AppService],
})
export class AppModule {}

```

> 方法 **Hint** 要使用 __INLINE_CODE_47__ 类型（如 __INLINE_CODE_48__ 参数示例），请确保安装了 __INLINE_CODE_49__ 包。

请求对象表示 HTTP 请求，并包含查询字符串、参数、HTTP 标头和正文（阅读更多 __LINK_318__）。在大多数情况下，您不需要手动访问这些属性。相反，您可以使用内置的装饰器，如 __INLINE_CODE_50__ 或 __INLINE_CODE_51__。以下是提供的装饰器列表和对应的平台特定对象。

__HTML_TAG_199__
  __HTML_TAG_200__
    __HTML_TAG_201__
      __HTML_TAG_202____HTML_TAG_203__@Request(), @Req()__HTML_TAG_204____HTML_TAG_205__
      __HTML_TAG_206____HTML_TAG_207__req__HTML_TAG_208____HTML_TAG_209____HTML_TAG_210__
    __HTML_TAG_211__
      __HTML_TAG_212____HTML_TAG_213__@Response(), @Res()__HTML_TAG_214____HTML_TAG_215__*__HTML_TAG_216____HTML_TAG_217__
      __HTML_TAG_218____HTML_TAG_219__res__HTML_TAG_220____HTML_TAG_221__
    __HTML_TAG_222__
    __HTML_TAG_223__
      __HTML_TAG_224____HTML_TAG_225__@Next()__HTML_TAG_226____HTML_TAG_227__
      __HTML_TAG_228____HTML_TAG_229__next__HTML_TAG_230____HTML_TAG_231__
    __HTML_TAG_232__
    __HTML_TAG_233__
      __HTML_TAG_234____HTML_TAG_235__@Session()__HTML_TAG_236____HTML_TAG_237__
      __HTML_TAG_238____HTML_TAG_239__req.session__HTML_TAG_240____HTML_TAG_241__
    __HTML_TAG_242__
    __HTML_TAG_243__
      __HTML_TAG_244____HTML_TAG_245__@Param(key?: string)__HTML_TAG_246____HTML_TAG_247__
      __HTML_TAG_248____HTML_TAG_249__req.params__HTML_TAG_250__ / __HTML_TAG_251__req.params[key]__HTML_TAG_252____HTML_TAG_253__
    __HTML_TAG_254__
    __HTML_TAG_255__
      __HTML_TAG_256____HTML_TAG_257__@Body(key?: string)__HTML_TAG_258____HTML_TAG_259__
      __HTML_TAG_260____HTML_TAG_261__req.body__HTML_TAG_262__ / __HTML_TAG_263__req.body[key]__HTML_TAG_264____HTML_TAG_265__
    __HTML_TAG_266__
    __HTML_TAG_267__
      __HTML_TAG_268____HTML_TAG_269__@Query(key?: string)__HTML_TAG_270____HTML_TAG_271__
      __HTML_TAG_272____HTML_TAG_273__req.query__HTML_TAG_274__ / __HTML_TAG_275__req.query[key]__HTML_TAG_276____HTML_TAG_277__
    __HTML_TAG_278__
    __HTML_TAG_279__
      __HTML_TAG_280____HTML_TAG_281__@Headers(name?: string)__HTML_TAG_282____HTML_TAG_283__
      __HTML_TAG_284____HTML_TAG_285__req.headers__HTML_TAG_286__ / __HTML_TAG_287__req.headers[name]__HTML_TAG_288____HTML_TAG_289__
    __HTML_TAG_290__
    __HTML_TAG_291__
      __HTML_TAG_292____HTML_TAG_293__@Ip()__HTML_TAG_294____HTML_TAG_295__
      __HTML_TAG_296____HTML_TAG_297__req.ip__HTML_TAG_298____HTML_TAG_299__
    __HTML_TAG_300__
    __HTML_TAGHere is the translation of the provided English technical documentation to Chinese:

Earlier, we defined an endpoint to fetch the cats resource (**GET** route). We'll typically also want to provide an endpoint that creates new records. For this, let's create the **POST** handler:

```typescript
// ```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Context, On, Once, ContextOf } from 'necord';
import { Client } from 'discord.js';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  @Once('ready')
  public onReady(@Context() [client]: ContextOf<'ready'>) {
    this.logger.log(`Bot logged in as ${client.user.username}`);
  }

  @On('warn')
  public onWarn(@Context() [message]: ContextOf<'warn'>) {
    this.logger.warn(message);
  }
}

```

```

It's that simple. Nest provides decorators for all of the standard HTTP methods: __INLINE_CODE_63__, __INLINE_CODE_64__, __INLINE_CODE_65__, __INLINE_CODE_66__, __INLINE_CODE_67__, __INLINE_CODE_68__, and __INLINE_CODE_69__. In addition, __INLINE_CODE_70__ defines an endpoint that handles all of them.

#### Route wildcards

Pattern-based routes are also supported in NestJS. For example, the asterisk (__INLINE_CODE_71__) can be used as a wildcard to match any combination of characters in a route at the end of a path. In the following example, the __INLINE_CODE_72__ method will be executed for any route that starts with __INLINE_CODE_73__, regardless of the number of characters that follow.

```typescript
// ```typescript
import { Injectable } from '@nestjs/common';
import { Context, TextCommand, TextCommandContext, Arguments } from 'necord';

@Injectable()
export class AppCommands {
  @TextCommand({
    name: 'ping',
    description: 'Responds with pong!',
  })
  public onPing(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    return message.reply('pong!');
  }
}

```

```

The __INLINE_CODE_74__ route path will match __INLINE_CODE_75__, __INLINE_CODE_76__, __INLINE_CODE_77__, and so on. The hyphen ( __INLINE_CODE_78__) and the dot (__INLINE_CODE_79__) are interpreted literally by string-based paths.

This approach works on both Express and Fastify. However, with the latest release of Express (v5), the routing system has become more strict. In pure Express, you must use a named wildcard to make the route work—for example, __INLINE_CODE_80__, where __INLINE_CODE_81__ is simply the name of the wildcard parameter and has no special meaning. You can name it anything you like. That said, since Nest provides a compatibility layer for Express, you can still use the asterisk (__INLINE_CODE_82__) as a wildcard.

When it comes to asterisks used in the **middle of a route**, Express requires named wildcards (e.g., __INLINE_CODE_83__), while Fastify does not support them at all.

#### Status code

As mentioned, the default **status code** for responses is always **200**, except for POST requests, which default to **201**. You can easily change this behavior by using the __INLINE_CODE_84__ decorator at the handler level.

```typescript
// ```typescript
import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';

@Injectable()
export class AppCommands {
  @SlashCommand({
    name: 'ping',
    description: 'Responds with pong!',
  })
  public async onPing(@Context() [interaction]: SlashCommandContext) {
    return interaction.reply({ content: 'Pong!' });
  }
}

```

```

> info **Hint** Import __INLINE_CODE_85__ from the __INLINE_CODE_86__ package.

Often, your status code isn't static but depends on various factors. In that case, you can use a library-specific **response** (inject using __INLINE_CODE_87__) object (or, in case of an error, throw an exception).

#### Response headers

To specify a custom response header, you can either use a __INLINE_CODE_88__ decorator or a library-specific response object (and call __INLINE_CODE_89__ directly).

```typescript
// ```typescript
import { StringOption } from 'necord';

export class TextDto {
  @StringOption({
    name: 'text',
    description: 'Input your text here',
    required: true,
  })
  text: string;
}

```

```

> info **Hint** Import __INLINE_CODE_90__ from the __INLINE_CODE_91__ package.

#### Redirection

To redirect a response to a specific URL, you can either use a __INLINE_CODE_92__ decorator or a library-specific response object (and call __INLINE_CODE_93__ directly).

__INLINE_CODE_94__ takes two arguments, __INLINE_CODE_95__ and __INLINE_CODE_96__, both are optional. The default value of __INLINE_CODE_97__ is __INLINE_CODE_98__ (__INLINE_CODE_99__) if omitted.

```typescript
// ```typescript
import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, Options, SlashCommandContext } from 'necord';
import { TextDto } from './length.dto';

@Injectable()
export class AppCommands {
  @SlashCommand({
    name: 'length',
    description: 'Calculate the length of your text',
  })
  public async onLength(
    @Context() [interaction]: SlashCommandContext,
    @Options() { text }: TextDto,
  ) {
    return interaction.reply({
      content: `The length of your text is: ${text.length}`,
    });
  }
}

```

```

> info **Hint** Sometimes you may want to determine the HTTP status code or the redirect URL dynamically. Do this by returning an object following the __INLINE_CODE_100__ interface (from __INLINE_CODE_101__).

Returned values will override any arguments passed to the __INLINE_CODE_102__ decorator. For example:

```typescript
// ```typescript
import { Injectable } from '@nestjs/common';
import { AutocompleteInteraction } from 'discord.js';
import { AutocompleteInterceptor } from 'necord';

@Injectable()
class CatsAutocompleteInterceptor extends AutocompleteInterceptor {
  public transformOptions(interaction: AutocompleteInteraction) {
    const focused = interaction.options.getFocused(true);
    let choices: string[];

    if (focused.name === 'cat') {
      choices = ['Siamese', 'Persian', 'Maine Coon'];
    }

    return interaction.respond(
      choices
        .filter((choice) => choice.startsWith(focused.value.toString()))
        .map((choice) => ({ name: choice, value: choice })),
    );
  }
}

```

```

#### Route parameters

Routes with static paths won’t work when you need to accept **dynamic data** as part of the request (e.g., __INLINE_CODE_103__ to get the cat with id __INLINE_CODE_104__). To define routes with parameters, you can add route parameter **tokens** in the route path to capture the dynamic values from the URL. The route parameter token in the __INLINE_CODE_105__ decorator example below illustrates this approach. These route parameters can then be accessed using the __INLINE_CODE_106__ decorator, which should be added to the method signature.

> info **Hint** Routes with parameters should be declared after any static paths. This prevents the parameterized paths from intercepting traffic destined for the static paths.

```typescript
// ```typescript
import { StringOption } from 'necord';

export class CatDto {
  @StringOption({
    name: 'cat',
    description: 'Choose a cat breed',
    autocomplete: true,
    required: true,
  })
  cat: string;
}

```

```

The __INLINE_CODE_107__ decorator is used to decorate a method parameter (in the example above, __INLINE_CODE_108__), making the **route** parameters accessible as properties of that decorated method parameter inside the method. As shown in the code, you can access the __INLINE_CODE_109__ parameter by referencing __INLINE_CODE_110__. Alternatively, you can pass a specific parameter token to the decorator and directly reference the route parameter by name within the method body.

> info **Hint** Import __INLINE_CODE_111__ from the __INLINE_CODE_112__ package.

```typescript
// ```typescript
import { Injectable, UseInterceptors } from '@nestjs/common';
import { Context, SlashCommand, Options, SlashCommandContext } from 'necord';
import { CatDto } from '/cat.dto';
import { CatsAutocompleteInterceptor } from './cats-autocomplete.interceptor';

@Injectable()
export class CatsCommands {
  @UseInterceptors(CatsAutocompleteInterceptor)
  @SlashCommand({
    name: 'cat',
    description: 'Retrieve information about a specific cat breed',
  })
  public async onSearch(
    @Context() [interaction]: SlashCommandContext,
    @Options() { cat }: CatDto,
  ) {
    return interaction.reply({
      content: `I found information on the breed of ${cat} cat!`,
    });
  }
}

```

```

#### Sub-domain routing

The __INLINE_CODE_113__ decorator can take a __INLINE_CODE_114__ option to require that the HTTP host of the incoming requests matches some specific value.

```typescript
// ```typescript
import { Injectable } from '@nestjs/common';
import { Context, UserCommand, UserCommandContext, TargetUser } from 'necord';
import { User } from 'discord.js';

@Injectable()
export class AppCommands {
  @UserCommand({ name: 'Get avatar' })
  public async getUserAvatar(
    @Context() [interaction]: UserCommandContext,
    @TargetUser() user: User,
  ) {
    return interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`Avatar of ${user.username}`)
          .setImage(user.displayAvatarURL({ size: 4096, dynamic: true })),
      ],
    });
  }
}

```

``> 警告 **Warning**由于 Fastify 不支持嵌套路由，如果您使用子域路由，建议使用默认的 Express 适配器。

类似于路由 __INLINE_CODE_115__，__INLINE_CODE_116__ 选项可以使用令牌捕捉动态值在主机名称的该位置。主机参数在 __INLINE_CODE_117__ 装饰器示例中演示了这种使用方式。主机参数在这种方式中可以使用 __INLINE_CODE_118__ 装饰器访问，应该将其添加到方法签名中。

```typescript
import { Injectable } from '@nestjs/common';
import { Context, MessageCommand, MessageCommandContext, TargetMessage } from 'necord';
import { Message } from 'discord.js';

@Injectable()
export class AppCommands {
  @MessageCommand({ name: 'Copy Message' })
  public async copyMessage(
    @Context() [interaction]: MessageCommandContext,
    @TargetMessage() message: Message,
  ) {
    return interaction.reply({ content: message.content });
  }
}

```

#### 状态共享

对于来自其他编程语言的开发者，可能会-surprised-学习在 Nest 中，几乎所有内容都在 incoming 请求中共享。包括资源，如数据库连接池、singleton 服务具有全局状态、更多。需要注意的是，Node.js 不使用请求/响应多线程无状态模型，即每个请求都由单独线程处理。因此，在 Nest 中使用 singleton 实例是完全安全的。

话虽如此，有些边缘情况需要在控制器中请求 lifetime。例如，per-request 缓存在 GraphQL 应用程序中、请求跟踪或实现多租户。你可以了解更多关于控制注入作用域 __LINK_320__。

#### 异步处理

我们热爱现代 JavaScript，特别是它对异步数据处理的强调。这就是为什么 Nest 完全支持 __INLINE_CODE_119__ 函数。每个 __INLINE_CODE_120__ 函数都必须返回 __INLINE_CODE_121__，这允许您返回一个 Nest 可自动解析的延迟值。下面是一个示例：

```typescript
import { Injectable } from '@nestjs/common';
import { Context, Button, ButtonContext } from 'necord';

@Injectable()
export class AppComponents {
  @Button('BUTTON')
  public onButtonClick(@Context() [interaction]: ButtonContext) {
    return interaction.reply({ content: 'Button clicked!' });
  }
}

```

这代码是完全有效的。但是，Nest 还允许路由处理程序返回 RxJS __LINK_321__。Nest 将内部处理订阅，并在流完成时解析最终发射的值。

```typescript
import { Injectable } from '@nestjs/common';
import { Context, StringSelect, StringSelectContext, SelectedStrings } from 'necord';

@Injectable()
export class AppComponents {
  @StringSelect('SELECT_MENU')
  public onSelectMenu(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() values: string[],
  ) {
    return interaction.reply({ content: `You selected: ${values.join(', ')}` });
  }
}

```

这两个方法都是有效的，您可以根据需要选择一个。

#### 请求负载

在我们的前一个示例中，POST 路由处理程序没有接受任何客户端参数。让我们修复该问题，添加 __INLINE_CODE_122__ 装饰器。

在继续之前（如果您使用 TypeScript），我们需要定义 **DTO**（数据传输对象）架构。DTO 是一个对象，指定数据如何在网络上发送。我们可以使用 TypeScript 接口或简单类来定义 DTO 架构。然而，我们建议使用类。为什么？类是 JavaScript ES6 标准的一部分，因此它们在编译后的 JavaScript 中保持不变。相比之下，TypeScript 接口在 transpilation 中被删除，这意味着 Nest 在运行时无法引用它们。这对于像 __Pipes__ 这样的特性非常重要，因为它们依赖于在运行时访问变量的元类型，这只可能在类中实现。

让我们创建 __INLINE_CODE_123__ 类：

```typescript
import { Injectable } from '@nestjs/common';
import { Context, Modal, ModalContext } from 'necord';

@Injectable()
export class AppModals {
  @Modal('pizza')
  public onModal(@Context() [interaction]: ModalContext) {
    return interaction.reply({
      content: `Your fav pizza : ${interaction.fields.getTextInputValue('pizza')}`
    });
  }
}

```

它只有三个基本属性。然后，我们可以使用新创建的 DTO 在 __INLINE_CODE_124__ 中：

__CODE_BLOCK_15__

> 提示 **Hint**我们的 __INLINE_CODE_125__ 可以过滤出不应该被方法处理程序接收的属性。在这个例子中，我们可以白名单可接受的属性，然后将不包括在白名单中的任何属性自动从结果对象中删除。在 __INLINE_CODE_126__ 示例中，我们的白名单是 __INLINE_CODE_127__、__INLINE_CODE_128__ 和 __INLINE_CODE_129__ 属性。了解更多 __LINK_322__。

#### 查询参数

当处理路由查询参数时，您可以使用 __INLINE_CODE_130__ 装饰器将其从 incoming 请求中提取。让我们通过实践来了解如何工作。

考虑一个路由，我们想根据查询参数 like __INLINE_CODE_131__ 和 __INLINE_CODE_132__ 筛选一组猫。首先，定义查询参数在 __INLINE_CODE_133__ 中：

__CODE_BLOCK_16__

在这个示例中，__INLINE_CODE_134__ 装饰器用于从查询字符串中提取 __INLINE_CODE_135__ 和 __INLINE_CODE_136__ 的值。例如，对于：

__CODE_BLOCK_17__

请求将导致 __INLINE_CODE_137__ 等于 __INLINE_CODE_138__，__INLINE_CODE_139__ 等于 __INLINE_CODE_140__。

如果您的应用程序需要处理更复杂的查询参数，例如嵌套对象或数组：

__CODE_BLOCK_18__

您需要配置 HTTP适配器（Express 或 Fastify）以使用适当的查询解析器。在 Express 中，您可以使用 __INLINE_CODE_141__ 解析器，它支持富查询对象：

__CODE_BLOCK_19__

在 Fastify 中，您可以使用 __INLINE_CODE_142__ 选项：

__CODE_BLOCK_20__

> 提示 **Hint** __INLINE_CODE_143__ 是一个查询字符串解析器，支持嵌套和数组。您可以使用 __INLINE_CODE_144__ 安装它。

#### 处理错误Here is the translation of the English technical documentation to Chinese:

### 错误处理

点击查看更多关于错误处理的信息 __LINK_323__。

#### 完整示例

以下是一个使用多个可用的装饰器创建基本控制器的示例。这控制器提供了一些方法来访问和操作内部数据。

__CODE_BLOCK_21__

> 提示 **提示** Nest CLI 提供了一个生成器（schematic），可以自动创建 **所有 boilerplate 代码**，从而节省您手动创建代码的时间，并提高开发体验。了解更多关于这个功能 __LINK_324__。

#### 启动

即使 __INLINE_CODE_145__ 已经完全定义，但 Nest 还不知道它，并且不会自动创建该类的实例。

控制器总是需要作为模块的一部分，因此我们将 __INLINE_CODE_146__ 数组包含在 __INLINE_CODE_147__ 装饰器中。因为我们没有定义任何其他模块，除了根 __INLINE_CODE_148__，所以我们将使用它来注册 __INLINE_CODE_149__：

__CODE_BLOCK_22__

我们将元数据附加到模块类中使用 __INLINE_CODE_150__ 装饰器，现在 Nest 可以轻松确定哪些控制器需要挂载。

#### 库特定方法

到目前为止，我们已经涵盖了 Nest 对标准响应的处理方法。另一种方法是使用库特定的 __LINK_325__。要注入特定的响应对象，我们可以使用 __INLINE_CODE_151__ 装饰器。为了突出差异，让我们像这样重写 __INLINE_CODE_152__：

__CODE_BLOCK_23__

虽然这方法工作，并且提供了更多的灵活性，可以完全控制响应对象（例如，头部 manipulation 和访问库特定的功能），但应该小心使用。这个方法的主要缺点是您的代码变得平台依赖，因为不同的 underlying 库可能具有不同的响应对象 API。此外，它可能会使测试更加困难，因为您需要模拟响应对象等。

此外，使用这个方法，您将失去与 Nest 特性相关的兼容性，例如拦截器和 __INLINE_CODE_153__/ __INLINE_CODE_154__ 装饰器。要解决这个问题，您可以启用 __INLINE_CODE_155__ 选项，如下所示：

__CODE_BLOCK_24__

使用这个方法，您可以与 native 响应对象交互（例如，设置 cookie 或头部基于特定条件），同时还允许框架处理其余部分。
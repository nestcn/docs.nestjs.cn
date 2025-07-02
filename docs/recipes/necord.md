### Necord

Necord 是一个强大的模块，可简化 [Discord](https://discord.com) 机器人的创建过程，实现与 NestJS 应用的无缝集成。

> **注意** Necord 是第三方包，并非由 NestJS 核心团队官方维护。如遇任何问题，请提交至 [官方仓库](https://github.com/necordjs/necord) 。

#### 安装

开始使用前，需安装 Necord 及其依赖项 [`Discord.js`](https://discord.js.org)。

```bash
$ npm install necord discord.js
```

#### 使用方法

要在项目中使用 Necord，请导入 `NecordModule` 并使用必要的选项进行配置。

```typescript title="app.module"
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

> info **提示** 您可以在此处 [here](https://discord.com/developers/docs/topics/gateway#gateway-intents) 找到可用意图的完整列表。

通过此设置，您可以将 `AppService` 注入到提供者中，轻松注册命令、事件等功能。

```typescript title="app.service"
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

##### 理解上下文

你可能已经注意到上面例子中的 `@Context` 装饰器。这个装饰器会将事件上下文注入到你的方法中，让你能够访问各种事件特定数据。由于存在多种事件类型，上下文类型是通过 `ContextOf<type: string>` 类型推断的。你可以轻松地通过使用 `@Context()` 装饰器来访问上下文变量，该装饰器会用与事件相关的参数数组填充变量。

#### 文本命令

> **警告** 文本命令依赖于消息内容，而该功能即将对已验证机器人和拥有超过 100 个服务器的应用程序弃用。这意味着如果你的机器人无法访问消息内容，文本命令将无法工作。了解更多关于此变更的信息[请点击此处](https://support-dev.discord.com/hc/en-us/articles/4404772028055-Message-Content-Access-Deprecation-for-Verified-Bots) 。

下面展示如何使用 `@TextCommand` 装饰器为消息创建一个简单的命令处理器。

```typescript title="app.commands"
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

#### 应用命令

应用命令为用户提供了一种在 Discord 客户端内与您的应用交互的原生方式。可通过不同界面访问三种类型的应用命令：聊天输入命令、消息上下文菜单命令（通过右键点击消息访问）和用户上下文菜单命令（通过右键点击用户访问）。

![](https://i.imgur.com/4EmG8G8.png)

#### 斜杠命令

斜杠命令是以结构化方式与用户互动的绝佳途径。它们允许您创建具有精确参数和选项的命令，从而显著提升用户体验。

要使用 Necord 定义斜杠命令，可以使用 `SlashCommand` 装饰器。

```typescript title="app.commands"
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

> **提示** 当你的机器人客户端登录时，它会自动注册所有已定义的命令。请注意全局命令最多会被缓存一小时。为避免全局缓存问题，请使用 Necord 模块中的 `development` 参数，该参数会将命令可见性限制在单个服务器中。

##### 选项

你可以使用选项装饰器为斜杠命令定义参数。为此我们创建一个 `TextDto` 类：

```typescript title="text.dto"
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

然后你就可以在 `AppCommands` 类中使用这个 DTO：

```typescript title="app.commands"
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

要查看完整的内置选项装饰器列表，请查阅[此文档](https://necord.org/interactions/slash-commands#选项) 。

##### 自动补全

要为斜杠命令实现自动补全功能，您需要创建一个拦截器。该拦截器将处理用户在自动补全字段中输入时的请求。

```typescript title="cats-autocomplete.interceptor"
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

您还需要用 `autocomplete: true` 标记您的选项类：

```typescript title="cat.dto"
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

最后，将拦截器应用到您的斜杠命令：

```typescript title="cats.commands"
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

#### 用户上下文菜单

用户命令出现在右击（或点击）用户时显示的上下文菜单中。这些命令提供直接针对用户的快速操作。

```typescript title="app.commands"
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

#### 消息上下文菜单

右键点击消息时，上下文菜单中会显示消息命令，可快速执行与该消息相关的操作。

```typescript title="app.commands"
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

#### 按钮

[按钮](https://discord.com/developers/docs/interactions/message-components#buttons)是可在消息中包含的交互元素。点击时，它们会向您的应用程序发送一个[交互](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object) 。

```typescript title="app.components"
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

#### 选择菜单

[选择菜单](https://discord.com/developers/docs/interactions/message-components#select-menus)是消息中出现的另一种交互组件，它为用户提供类似下拉框的界面来选择选项。

```typescript title="app.components"
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

如需查看内置选择菜单组件的完整列表，请访问[此链接](https://necord.org/interactions/message-components#select-menu) 。

#### 模态框

模态框是弹出式表单，允许用户提交格式化的输入内容。以下是使用 Necord 创建和处理模态框的方法：

```typescript title="app.modals"
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

#### 更多信息

访问 [Necord](https://necord.org) 官网获取更多信息。

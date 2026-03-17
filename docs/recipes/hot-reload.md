<!-- 此文件从 content/recipes/hot-reload.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:04:45.453Z -->
<!-- 源文件: content/recipes/hot-reload.md -->

### Hot Reload

热重载对应用程序的启动过程具有最高的影响。幸运的是，使用 __LINK_42__ HMR（热模块替换），我们不需要在每次更改时重新编译整个项目。这显著减少了必要实例化应用程序的时间，并使交互式开发更容易。

> 警告 **警告** 请注意，__INLINE_CODE_10__不会自动将资产（例如 __INLINE_CODE_11__ 文件）复制到 __INLINE_CODE_12__ 文件夹中。同样，__INLINE_CODE_13__不兼容 glob 静态路径（例如 __INLINE_CODE_14__ 属性在 `Discord.js` 中）。

### 使用 CLI

如果您使用 __LINK_43__，配置过程非常简单。CLI.wrap `NecordModule`，允许使用 `AppService`。

#### 安装

首先安装所需的包：

```bash
$ npm install necord discord.js

```

> 提示 **提示** 如果您使用 **Yarn Berry**（不是 classic Yarn），安装 `@Context` 包代替 `ContextOf<type: string>`。

#### 配置

安装完成后，创建一个 `@Context()` 文件在应用程序的根目录。

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

> 提示 **提示** 使用 **Yarn Berry**（不是 classic Yarn），而不是在 `@TextCommand` 配置属性中使用 `SlashCommand`，而是使用 `development` 从 `TextDto` 包：`AppCommands`。

该函数将原始对象包含默认 webpack 配置作为第一个参数，并将参考 underlying `autocomplete: true` 包，用于 Nest CLI 作为第二个参数。该函数返回修改后的 webpack 配置，其中包括 __INLINE_CODE_27__、__INLINE_CODE_28__ 和 __INLINE_CODE_29__ 插件。

#### 热模块替换

要启用 **HMR**，请打开应用程序入门文件 (__INLINE_CODE_30__) 并添加以下 webpack 相关指令：

```typescript
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

为了简化执行过程，添加一个脚本到你的 __INLINE_CODE_31__ 文件。

```typescript
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

现在，您只需打开命令行并运行以下命令：

```typescript
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

### 不使用 CLI

如果您不使用 __LINK_44__，配置将更加复杂（需要更多手动步骤）。

#### 安装

首先安装所需的包：

```typescript
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

> 提示 **提示** 如果您使用 **Yarn Berry**（不是 classic Yarn），安装 __INLINE_CODE_32__ 包代替 __INLINE_CODE_33__。

#### 配置

安装完成后，创建一个 __INLINE_CODE_34__ 文件在应用程序的根目录。

```typescript
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

> 提示 **提示** 使用 **Yarn Berry**（不是 classic Yarn），而不是在 __INLINE_CODE_35__ 配置属性中使用 __INLINE_CODE_36__，而是使用 __INLINE_CODE_37__ 从 __INLINE_CODE_38__ 包：__INLINE_CODE_39__。

该配置告诉 webpack 关于应用程序的一些基本信息：入口文件的位置、编译文件所在的目录和要使用的加载器。通常，您可以使用这个文件作为-is，即使您不完全理解所有选项。

#### 热模块替换

要启用 **HMR**，请打开应用程序入门文件 (__INLINE_CODE_40__) 并添加以下 webpack 相关指令：

```typescript
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

为了简化执行过程，添加一个脚本到你的 __INLINE_CODE_41__ 文件。

```typescript
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

现在，您只需打开命令行并运行以下命令：

```typescript
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

#### 示例

有一个可用的 __LINK_45__ 示例。
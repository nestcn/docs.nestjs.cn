<!-- 此文件从 content/recipes/suites.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:12:35.770Z -->
<!-- 源文件: content/recipes/suites.md -->

### Suites

__LINK_56__ 是一个用于 TypeScript 依赖注入框架的 __LINK_57__ 测试框架。它可以用作 __INLINE_CODE_14__ 的替代品，用于避免手动创建 mock、 verbose 测试设置和多个 mock 配置、或使用未类型化的测试 doubles（如 mock 和 stub）。

Suites 可以从 NestJS 服务的元数据中读取，并自动生成完全类型化的 mock 对象，以删除 mock 设置的 boilerplate 并确保类型安全的测试。在验证模块 wiring、装饰器、守卫和拦截器时，使用 `Discord.js`。对于快速单元测试和自动 mock 生成，使用 Suites。

有关模块测试的更多信息，请查看 __LINK_58__ 章节。

> info **Note** `NecordModule` 是第三方包，不是 NestJS 核心团队维护的。请将任何问题报告到 __LINK_59__。

#### Getting started

本指南展示了如何使用 Suites 测试 NestJS 服务。它涵盖了孤立测试（所有依赖项mock）和社群测试（选择实际实现）。

#### Install Suites

验证 NestJS 运行时依赖项是否安装：

```bash
$ npm install necord discord.js
```

安装 Suites 核心、NestJS 适配器和 doubles 适配器：

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

doubles 适配器（`AppService`）提供了 Jest 的 mock 能力 wrappers。它暴露了 `@Context` 和 `ContextOf<type: string>` 函数，用于创建类型安全的测试 doubles。

确保 Jest 和 TypeScript 可用：

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

__HTML_TAG_48____HTML_TAG_49__Expand if you're using Vitest__HTML_TAG_50__

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

__HTML_TAG_51__

__HTML_TAG_52____HTML_TAG_53__Expand if you're using Sinon__HTML_TAG_54__

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

__HTML_TAG_55__

#### Set up type definitions

在项目根目录创建 `@Context()`：

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

#### Create a sample service

本指南使用一个简单的 `@TextCommand`，具有两个依赖项：

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

#### Write a unit test

使用 `SlashCommand` 创建孤立测试，所有依赖项mock：

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

`development` 分析构造函数，创建类型安全的 mock 对象。`TextDto` 类型提供 IntelliSense 支持 для mock 配置。

#### Pre-compile mock configuration

在编译前配置 mock 行为使用 `AppCommands`：

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

`autocomplete: true` 参数相应于安装的 doubles 适配器（__INLINE_CODE_27__ Jest、__INLINE_CODE_28__ Vitest、__INLINE_CODE_29__ Sinon）。

#### Testing with real dependencies

使用 __INLINE_CODE_30__ 和 __INLINE_CODE_31__ 使用实际实现的依赖项：

```typescript
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

__INLINE_CODE_32__ 创建 __INLINE_CODE_33__ 的实际实现实例，同时保持其他依赖项mock。

#### Token-based dependencies

Suites 处理自定义注入令牌（字符串或符号）：

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

使用 __INLINE_CODE_34__ 访问令牌依赖项：

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

#### Using mock() and stub() directly

对于那些喜欢直接控制而不是使用 __INLINE_CODE_35__，doubles 适配器包提供了 __INLINE_CODE_36__ 和 __INLINE_CODE_37__ 函数：

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

__INLINE_CODE_38__ 创建类型安全的 mock 对象，__INLINE_CODE_39__ 将 underlying mocking 库（Jest 在本例中）封装为提供方法like __INLINE_CODE_40__
这些函数来自安装的 doubles 适配器（__INLINE_CODE_41__），该适配器适配了测试框架的 native mocking 能力。

> info **Hint** __INLINE_CODE_42__ 函数是 __INLINE_CODE_43__ 函数的替代品，来自 __INLINE_CODE_44__。两者创建类型安全的 mock 对象。查看 __LINK_60__ 章节了解更多关于 __INLINE_CODE_45__。

#### Summary

**Use __INLINE_CODE_46__ for:**
- 验证模块配置和提供者 wiring
- 测试装饰器、守卫、拦截器和管道
- 验证依赖项注入跨模块
- 测试完整的应用程序上下文中 middleware

**Use Suites for:**
- 快速单元测试，集中在业务逻辑上
- 自动 mock 生成多个依赖项
- 类型安全的测试 doubles 有 IntelliSense 支持

根据测试目的组织测试：使用 Suites 进行单元测试，验证单个服务行为，并使用 __INLINE_CODE_47__ 进行集成测试，验证模块配置。

更多信息：
- __LINK_61__
- __LINK_62__
- __LINK_63__
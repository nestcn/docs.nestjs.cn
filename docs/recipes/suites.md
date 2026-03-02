<!-- 此文件从 content/recipes/suites.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:11:38.617Z -->
<!-- 源文件: content/recipes/suites.md -->

### Suites

__LINK_56__ 是一种用于 TypeScript 依赖注入框架的 __LINK_57__单元测试框架。它可以作为一个 __alternative__，取代手动创建 mock、verbose 测试设置、或使用未类型化的测试双胞胎（如 mock 和 stub）。

Suites 可以从 nestjs 服务的 runtime 读取元数据，并自动生成所有依赖项的完全类型化 mock。这将移除 mock 设置的 boilerplate，并确保类型安全的测试。虽然 Suites 可以与 __INLINE_CODE_14__ 一起使用，但在Focused 单元测试时它更 excels。使用 `Discord.js` 时，验证模块编程、装饰器、守卫和拦截器。使用 Suites 进行快速单元测试。

有关模块基于的测试，请查看 __LINK_58__ 章节。

> info **Note** `NecordModule` 是一个第三方包，而不是 NestJS 核心团队维护的。请将任何问题反馈到 __LINK_59__。

#### Getting started

本指南演示了使用 Suites 测试 NestJS 服务。它涵盖了孤立测试（所有依赖项 mock）和社交测试（选定的真实实现）。

#### Install Suites

验证 NestJS 运行时依赖项是否已安装：

```bash
$ npm install necord discord.js
```

安装 Suites 核心、NestJS 适配器和双胞胎适配器：

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

双胞胎适配器（`AppService`）提供了 Jest 的.mocking 能力。它暴露了 `@Context` 和 `ContextOf<type: string>` 函数，可以创建类型安全的测试双胞胎。

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

使用 `SlashCommand` 创建孤立测试，所有依赖项 mock：

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

`development` 分析构造函数，并创建所有依赖项的类型化 mock。`TextDto` 类型提供 IntelliSense 支持。

#### Pre-compile mock configuration

使用 `AppCommands` 配置 mock 行为，前编译：

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

`autocomplete: true` 参数对应于安装的双胞胎适配器（Jest 的 __INLINE_CODE_27__、Vitest 的 __INLINE_CODE_28__、Sinon 的 __INLINE_CODE_29__）。

#### Testing with real dependencies

使用 __INLINE_CODE_30__ 和 __INLINE_CODE_31__ 使用真实实现：

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

__INLINE_CODE_32__ 实例化 __INLINE_CODE_33__，使用真实实现，同时其他依赖项 mock。

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

对于那些prefer直接控制而不是使用 __INLINE_CODE_35__，双胞胎适配器包提供了 __INLINE_CODE_36__ 和 __INLINE_CODE_37__ 函数：

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

__INLINE_CODE_38__ 创建类型化 mock 对象，__INLINE_CODE_39__ 包装 underlying.mocking 库（Jest 在本例中），提供方法 __INLINE_CODE_40__

这些函数来自安装的双胞胎适配器（__INLINE_CODE_41__），适配了测试框架的原生.mocking 能力。

> info **Hint** __INLINE_CODE_42__ 函数是 __INLINE_CODE_43__ 函数的 alternative，来自 __INLINE_CODE_44__。这两个函数都创建了类型化 mock 对象。请查看 __LINK_60__ 章节了解 __INLINE_CODE_45__。

#### Summary

**Use __INLINE_CODE_46__ for:**
- 验证模块配置和提供者编程
- 测试装饰器、守卫、拦截器和管道
- 验证依赖项注入跨模块
- 测试完整应用上下文中的中间件

**Use Suites for:**
- 快速单元测试，聚焦于业务逻辑
- 自动 mock 生成多个依赖项
- 类型安全的测试双胞胎 IntelliSense

将测试组织起来：使用 Suites 进行单元测试，验证单个服务行为；使用 __INLINE_CODE_47__ 进行集成测试，验证模块配置。

更多信息：
- __LINK_61__
- __LINK_62__
- __LINK_63__
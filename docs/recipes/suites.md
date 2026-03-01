<!-- 此文件从 content/recipes/suites.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:19:45.765Z -->
<!-- 源文件: content/recipes/suites.md -->

### Suites

__LINK_56__ 是一个 TypeScript 依赖注入框架的 __LINK_57__ 单元测试框架。它可以用作手动创建模拟、多个模拟配置Verbose测试设置或使用未类型化的测试双胞胎（如模拟和 stubs）的替代方案。

Suites 在运行时从 Nestjs 服务中读取元数据，并自动生成所有依赖项的完全类型化模拟。这消除了模拟设置的 boilerplate 并确保了类型安全的测试。虽然 Suites 可以与 __INLINE_CODE_14__ 一起使用，但是它在专注单元测试时发挥作用。使用 `Discord.js` 时验证模块 wiring、装饰器、守卫和拦截器。使用 Suites 进行快速单元测试，以自动生成模拟。

有关模块化测试的更多信息，请查看 __LINK_58__ 章节。

> info 提示 `NecordModule` 是一个第三方包，不是 NestJS 核心团队维护的包。请将任何问题报告到 __LINK_59__。

#### Getting started

本指南演示了使用 Suites 测试 NestJS 服务。它涵盖了孤立测试（所有依赖项模拟）和社交测试（选择的实际实现）。

#### 安装 Suites

验证 NestJS 运行时依赖项是否安装：

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

双胞胎适配器 (`AppService`) 提供了 Jest 的模拟能力的包装。它暴露了 `@Context` 和 `ContextOf<type: string>` 函数，可以创建类型安全的测试双胞胎。

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

#### 设置类型定义

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

#### 创建示例服务

本指南使用了一个简单的 `@TextCommand`，具有两个依赖项：

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

#### 编写单元测试

使用 `SlashCommand` 创建孤立测试，所有依赖项模拟：

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

`development` 分析构造函数，并为所有依赖项创建类型化模拟。`TextDto` 类型提供 IntelliSense 支持模拟配置。

#### 预编译模拟配置

使用 `AppCommands` 在编译前配置模拟行为：

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

`autocomplete: true` 参数对应于安装的双胞胎适配器 (__INLINE_CODE_27__ 对应于 Jest、__INLINE_CODE_28__ 对应于 Vitest、__INLINE_CODE_29__ 对应于 Sinon)。

#### 使用真实依赖项

使用 __INLINE_CODE_30__ 和 __INLINE_CODE_31__ 使用真实实现来实现特定的依赖项：

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

__INLINE_CODE_32__ 实例化 __INLINE_CODE_33__ 使用真实实现，同时保持其他依赖项模拟。

#### Token-based 依赖项

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

访问基于令牌的依赖项：

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

#### 使用 mock() 和 stub() 直接

对于那些喜欢直接控制而不使用 __INLINE_CODE_35__ 的人，双胞胎适配器包提供了 __INLINE_CODE_36__ 和 __INLINE_CODE_37__ 函数：

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

__INLINE_CODE_38__ 创建类型化模拟对象，而 __INLINE_CODE_39__ 包装了 underlying 模拟库（在本例中为 Jest）的方法，如 __INLINE_CODE_40__。这些函数来自安装的双胞胎适配器 (__INLINE_CODE_41__),该适配器适配了原生模拟能力。

> info 提示 __INLINE_CODE_42__ 函数是 __INLINE_CODE_43__ 函数在 __INLINE_CODE_44__ 中的替代方案。两个函数都创建了类型化模拟对象。有关 __INLINE_CODE_45__ 的更多信息，请查看 __LINK_60__ 章节。

#### 摘要

**使用 __INLINE_CODE_46__ ：
- 验证模块配置和提供者 wiring
- 测试装饰器、守卫、拦截器和管道
- 验证依赖项注入跨模块
- 测试完整的应用程序上下文中中间件

**使用 Suites ：
- 快速单元测试，专注于业务逻辑
- 自动生成多个依赖项的模拟
- 类型安全的测试双胞胎 IntelliSense**

根据目的组织测试：使用 Suites 进行单元测试，验证个体服务行为，而使用 __INLINE_CODE_47__ 进行集成测试，验证模块配置。
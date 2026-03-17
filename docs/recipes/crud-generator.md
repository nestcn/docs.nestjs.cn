<!-- 此文件从 content/recipes/crud-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:31:58.282Z -->
<!-- 源文件: content/recipes/crud-generator.md -->

### CRUD 生成器（TypeScript only）

项目的整个生命周期中，我们在构建新功能时，通常需要添加新的资源到我们的应用中。这些资源通常需要多个重复的操作，每次我们定义新资源时都需要重复这些操作。

#### 简介

让我们想象一个真实的场景，我们需要 expose CRUD endpoints 来处理 2 个实体，例如 **User** 和 **Product** 实体。
遵循最佳实践，每个实体都需要执行多个操作，例如：

- 生成一个模块 (__INLINE_CODE_4__) 来保持代码组织和明确界限（将相关组件组合在一起）
- 生成一个控制器 (__INLINE_CODE_5__) 来定义 CRUD 路由（或 GraphQL 应用程序中的查询/mutation）
- 生成一个服务 (__INLINE_CODE_6__) 来实现和隔离业务逻辑
- 生成实体类/接口来表示资源数据形状
- 生成数据传输对象（或 GraphQL 应用程序中的输入）来定义如何将数据发送到网络

这是很多步骤！

为了帮助加速这个重复的过程，__LINK_15__ 提供了一个生成器（schematic）来自动生成所有 boilerplate 代码，以帮助我们避免执行所有这些操作，并使开发者体验更加简单。

> 重要 **注意** 生成器支持生成 **HTTP** 控制器、 **Microservice** 控制器、 **GraphQL** 解析器（both 代码优先和架构优先）和 **WebSocket** Gateway。

#### 生成新资源

要创建新资源，只需在项目的根目录中运行以下命令：

```bash
$ npm install necord discord.js

```

__INLINE_CODE_7__ 命令不仅生成了 NestJS 建立块（模块、服务、控制器类）还生成了实体类、DTO 类，以及测试 (__INLINE_CODE_8__) 文件。

以下是生成的控制器文件（REST API）：

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

此外，它自动创建了所有 CRUD endpoints 的占位符（REST API 的路由、GraphQL 的查询和mutation、Microservice 和 WebSocket Gateway 的消息订阅）——all without having to lift a finger。

> 警告 **注意** 生成的服务类不是与任何特定的 **ORM（或数据源）** 关联的。这使得生成器足够通用，以满足任何项目的需求。默认情况下，所有方法都将包含占位符，允许您将其 populate 到与您的项目相关的数据源中。

类似地，如果您想生成 GraphQL 应用程序的解析器，只需选择 __INLINE_CODE_9__（或 __INLINE_CODE_10__）作为您的传输层。

在这种情况下，NestJS 将生成一个解析器类，而不是 REST API 控制器：

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

> 提示 **提示** 要避免生成测试文件，可以传递 __INLINE_CODE_11__ 标志，例如：

__INLINE_CODE_12__

我们可以看到，除了所有 boilerplate mutations 和 queries 之外，还将一切都连接起来。我们正在使用 __INLINE_CODE_13__, __INLINE_CODE_14__ 实体和我们的 DTO。

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

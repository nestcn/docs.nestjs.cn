<!-- 此文件从 content/recipes/crud-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:26:05.418Z -->
<!-- 源文件: content/recipes/crud-generator.md -->

### CRUD 生成器（TypeScript-only）

项目的整个生命周期中，我们经常需要添加新的资源到应用程序中。这些资源通常需要多个重复的操作，每次定义新的资源时我们都需要重复这些操作。

#### 概述

让我们想象一个实际的场景，我们需要 expose CRUD 端点来处理两个实体，例如 **User** 和 **Product** 实体。
遵循最佳实践，对于每个实体，我们将需要执行多个操作，例如：

- 生成一个模块 (__INLINE_CODE_4__) 来保持代码组织和明确边界（将相关组件组合在一起）
- 生成一个控制器 (__INLINE_CODE_5__) 来定义 CRUD 路由（或 GraphQL 应用程序中的查询/mutation）
- 生成一个服务 (__INLINE_CODE_6__) 来实现与隔离业务逻辑
- 生成一个实体类/接口来表示资源数据形状
- 生成数据传输对象（或 GraphQL 应用程序中的输入）来定义将数据发送到网络的方式

太多步骤了！

为了帮助加速这个重复的过程， __LINK_15__ 提供了一个生成器（schematic），自动生成所有的 boilerplate 代码，以帮助我们避免执行所有这些操作，并使开发者体验更加简单。

> 信息 **注意** 生成器支持生成 **HTTP** 控制器、 **Microservice** 控制器、 **GraphQL**  resolver（both code first 和 schema first），以及 **WebSocket**  Gateway。

#### 生成新资源

要创建一个新资源，简单地在项目的根目录运行以下命令：

```bash
$ npm install --save @nestjs/cqrs

```

__INLINE_CODE_7__ 命令不仅生成了 NestJS 建立块（模块、服务、控制器类）还生成了实体类、DTO 类，以及测试 (__INLINE_CODE_8__) 文件。

以下是生成的控制器文件（用于 REST API）：

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule.forRoot()],
})
export class AppModule {}

```

它还自动创建了所有 CRUD 端点（路由、查询和mutation）的占位符，无需我们手动进行任何操作。

> 警告 **注意** 生成的服务类 **不** 附加到任何特定的 **ORM（或数据源）**。这使得生成器足够通用，以满足任何项目的需求。默认情况下，所有方法都包含占位符，使我们可以根据项目的需求来填充数据源。

类似地，如果您想生成 GraphQL 应用程序的 resolver，简单地选择 __INLINE_CODE_9__（或 __INLINE_CODE_10__）作为传输层。

在这种情况下，NestJS 将生成一个 resolver 类，而不是 REST API 控制器：

```typescript
@Injectable()
export class HeroesGameService {
  constructor(private commandBus: CommandBus) {}

  async killDragon(heroId: string, killDragonDto: KillDragonDto) {
    return this.commandBus.execute(
      new KillDragonCommand(heroId, killDragonDto.dragonId)
    );
  }
}

  async killDragon(heroId, killDragonDto) {
    return this.commandBus.execute(
      new KillDragonCommand(heroId, killDragonDto.dragonId)
    );
  }
}

```

> 信息 **提示** 若要避免生成测试文件，您可以传递 __INLINE_CODE_11__ 标志，例如 __INLINE_CODE_12__。

我们可以看到，除了生成了所有 boilerplate mutation 和 query 之外，还将所有内容连接起来。我们正在使用 __INLINE_CODE_13__、__INLINE_CODE_14__ 实体，以及我们的 DTO。

```typescript
export class KillDragonCommand extends Command<{
  actionId: string // This type represents the command execution result
}> {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string,
  ) {
    super();
  }
}

```
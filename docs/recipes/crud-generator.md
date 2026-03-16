<!-- 此文件从 content/recipes/crud-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:00:53.332Z -->
<!-- 源文件: content/recipes/crud-generator.md -->

### CRUD 生成器（TypeScript 仅）

在项目的整个生命周期中，我们在添加新功能时，通常需要添加新的资源到我们的应用程序中。这些资源通常需要多个重复的操作，我们每次定义新资源时都需要重复这些操作。

#### 入门

让我们想象一个现实世界的场景，我们需要为 2 个实体，例如 **User** 和 **Product** 实体， expose CRUD endpoints。

遵循最佳实践，对于每个实体，我们需要执行以下操作：

- 生成一个模块 (__INLINE_CODE_4__)以保持代码组织和明确界限（将相关组件-grouping）
- 生成一个控制器 (__INLINE_CODE_5__)以定义 CRUD 路由（或 GraphQL 应用程序中的查询/mutation）
- 生成一个服务 (__INLINE_CODE_6__)以实现和隔离业务逻辑
- 生成一个实体类/接口来表示资源数据形状
- 生成数据传输对象（或 GraphQL 应用程序中的输入）来定义数据将如何在网络上发送

这是很多步骤！

为了帮助加速这种重复过程，__LINK_15__ 提供了一种生成器（架构）可以自动生成所有 boilerplate 代码，以帮助我们避免执行所有这些步骤，并使开发者体验更加简洁。

> 信息 **注意** 架构支持生成 **HTTP** 控制器、 **Microservice** 控制器、 **GraphQL** 解析器（代码优先和架构优先）和 **WebSocket**  Gateway。

#### 生成新资源

要创建新资源，简单地在项目的根目录中运行以下命令：

```bash
$ npm install --save @nestjs/cqrs

```

__INLINE_CODE_7__ 命令不仅生成所有 NestJS 建立块（模块、服务、控制器类）还生成实体类、DTO 类，以及 testing (__INLINE_CODE_8__) 文件。

下面可以看到生成的控制器文件（REST API）：

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule.forRoot()],
})
export class AppModule {}

```

此外，它自动创建了所有 CRUD 端点的占位符（REST API 的路由、GraphQL 的查询和 mutation、Microservices 和 WebSocket Gateway 的消息订阅）——all without having to lift a finger。

> 警告 **注意** 生成的服务类 **不** 关联到任何特定的 **ORM（或数据源）**。这使得生成器足以满足任何项目的需求。默认情况下，所有方法都将包含占位符，允许您将其填充到项目中特定的数据源中。

同样，如果您想生成 GraphQL 应用程序的解析器，只需选择 __INLINE_CODE_9__（或 __INLINE_CODE_10__）作为您的传输层。

在这种情况下，NestJS 将生成一个解析器类，而不是 REST API 控制器：

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

> 信息 **提示** 要避免生成测试文件，可以使用 __INLINE_CODE_11__ 标志，例如：

__INLINE_CODE_12__

我们可以看到，除了所有 boilerplate mutation 和查询之外，Everything 都被连接起来。我们正在使用 __INLINE_CODE_13__、__INLINE_CODE_14__ 实体和我们的 DTO。

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
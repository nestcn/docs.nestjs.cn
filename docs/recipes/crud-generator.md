<!-- 此文件从 content/recipes/crud-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:29:06.259Z -->
<!-- 源文件: content/recipes/crud-generator.md -->

### CRUD 生成器（TypeScriptOnly）

在项目的整个生命周期中，当我们添加新的功能时，我们经常需要添加新的资源到我们的应用程序中。这些资源通常需要多个重复的操作，我们每次定义新的资源时都需要重复这些操作。

#### 简介

让我们想象一个现实世界的场景，我们需要为 2 个实体，例如 **User** 和 **Product** 实体， expose CRUD 端点。

遵循最佳实践，每个实体我们需要执行以下操作：

- 生成一个模块 (__INLINE_CODE_4__) 来保持代码组织和明确界限（将相关组件分组）
- 生成一个控制器 (__INLINE_CODE_5__) 来定义 CRUD 路由（或 GraphQL 应用程序中的查询/变更）
- 生成一个服务 (__INLINE_CODE_6__) 来实现和隔离业务逻辑
- 生成一个实体类/接口来表示资源数据形状
- 生成数据传输对象（或 GraphQL 应用程序中的输入）来定义如何在网络上发送数据

这些步骤真的很多！

为了帮助加速这个重复的过程， __LINK_15__ 提供了一個生成器（架构）自动生成所有 boilerplate 代码，以帮助我们避免执行所有这些步骤，并使开发者体验更加简单。

> info **注意**架构支持生成 **HTTP** 控制器、 **Microservice** 控制器、 **GraphQL** 解析器（both 代码 first 和 schema first）和 **WebSocket**  Gateway。

#### 生成新的资源

要创建新的资源，简单地在项目的根目录中运行以下命令：

```bash
$ npm install --save @nestjs/cqrs

```

__INLINE_CODE_7__ 命令不仅生成 NestJS 构建块（模块、服务、控制器类）还生成实体类、DTO 类，以及测试 (__INLINE_CODE_8__) 文件。

下面可以看到生成的控制器文件（为 REST API）：

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule.forRoot()],
})
export class AppModule {}

```

此外，它自动创建所有 CRUD 端点的占位符（REST API 的路由、GraphQL 的查询和变更、Microservices 和 WebSocket Gateway 的消息订阅）——所有不需要我们干任何事情。

> warning **注意**生成的服务类不与任何特定的 **ORM（或数据源）** 关联。这使得生成器足够通用，以满足任何项目的需求。默认情况下，所有方法都将包含占位符，使我们可以将其与特定项目的数据源填充。

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

> info **提示**要避免生成测试文件，可以使用 __INLINE_CODE_11__ 标志，例如：

__INLINE_CODE_12__

我们可以看到，除了所有 boilerplate 变更和查询之外，everything 都是联系在一起的。我们正在使用 __INLINE_CODE_13__、__INLINE_CODE_14__ 实体和我们的 DTO。

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

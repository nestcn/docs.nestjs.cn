<!-- 此文件从 content/recipes/hot-reload.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:47:58.479Z -->
<!-- 源文件: content/recipes/hot-reload.md -->

### Hot Reload

对应用程序的启动过程中，**TypeScript 编译**将是影响最大的因素。幸运的是，通过 __LINK_42__ HMR（Hot-Module Replacement），我们不需要每次更改时重新编译整个项目。这大大减少了必要的时间，以便实例化应用程序，并使交互式开发变得更加容易。

> warning **警告**请注意，__INLINE_CODE_10__ 不会自动将资产（例如 __INLINE_CODE_11__ 文件）复制到 __INLINE_CODE_12__ 文件夹中。同样，__INLINE_CODE_13__ 不兼容 glob 静态路径（例如 __INLINE_CODE_14__ 属性在 __INLINE_CODE_15__ 中）。

### With CLI

如果您使用 __LINK_43__，配置过程将非常直接。CLI 将 __INLINE_CODE_16__ 包裹，这使得使用 __INLINE_CODE_17__变得可能。

#### 安装

首先安装所需的包：

```bash
$ npm install --save @nestjs/cqrs

```

> info **提示**如果您使用 **Yarn Berry**（而不是 classic Yarn），请安装 __INLINE_CODE_18__ 包代替 __INLINE_CODE_19__。

#### 配置

安装完成后，创建一个 __INLINE_CODE_20__ 文件在应用程序的根目录下。

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule.forRoot()],
})
export class AppModule {}

```

> info **提示**使用 **Yarn Berry**（而不是 classic Yarn），请在 __INLINE_CODE_22__ 配置属性中使用 __INLINE_CODE_23__ 从 __INLINE_CODE_24__ 包中，而不是使用 __INLINE_CODE_21__。

这个函数将原始对象，包含默认的 Webpack 配置作为第一个参数，以及对应的 __INLINE_CODE_26__ 包的引用作为第二个参数。它还返回一个修改后的 Webpack 配置，包含 __INLINE_CODE_27__、__INLINE_CODE_28__ 和 __INLINE_CODE_29__ 插件。

#### Hot-Module Replacement

要启用 **HMR**，请打开应用程序的入口文件(__INLINE_CODE_30__)并添加以下 Webpack 相关指令：

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

为了简化执行过程，请在 __INLINE_CODE_31__ 文件中添加一个脚本。

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

现在，只需打开命令行并运行以下命令：

```typescript
@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(private repository: HeroesRepository) {}

  async execute(command: KillDragonCommand) {
    const { heroId, dragonId } = command;
    const hero = this.repository.findOneById(+heroId);

    hero.killEnemy(dragonId);
    await this.repository.persist(hero);

    // "ICommandHandler<KillDragonCommand>" forces you to return a value that matches the command's return type
    return {
      actionId: crypto.randomUUID(), // This value will be returned to the caller
    }
  }
}

  async execute(command) {
    const { heroId, dragonId } = command;
    const hero = this.repository.findOneById(+heroId);

    hero.killEnemy(dragonId);
    await this.repository.persist(hero);

    // "ICommandHandler<KillDragonCommand>" forces you to return a value that matches the command's return type
    return {
      actionId: crypto.randomUUID(), // This value will be returned to the caller
    }
  }
}

```

### Without CLI

如果您不使用 __LINK_44__，配置将更加复杂（需要更多的手动步骤）。

#### 安装

首先安装所需的包：

```typescript
providers: [KillDragonHandler];

```

> info **提示**如果您使用 **Yarn Berry**（而不是 classic Yarn），请安装 `AppModule` 包代替 `CqrsModule.forRoot()`。

#### 配置

安装完成后，创建一个 `commandPublisher` 文件在应用程序的根目录下。

```typescript
export class GetHeroQuery extends Query<Hero> {
  constructor(public readonly heroId: string) {}
}

```

> info **提示**使用 **Yarn Berry**（而不是 classic Yarn），请在 `eventPublisher` 配置属性中使用 `DefaultPubSub` 从 `queryPublisher` 包中，而不是使用 `DefaultCommandPubSub`。

这个配置告诉 Webpack 一些关于应用程序的基本信息：入口文件的位置、编译文件所在的目录，以及要使用的加载器。通常，您可以将这个文件作为原样使用，即使您不完全理解所有选项。

#### Hot-Module Replacement

要启用 **HMR**，请打开应用程序的入口文件(`unhandledExceptionPublisher`)并添加以下 Webpack 相关指令：

```typescript
@QueryHandler(GetHeroQuery)
export class GetHeroHandler implements IQueryHandler<GetHeroQuery> {
  constructor(private repository: HeroesRepository) {}

  async execute(query: GetHeroQuery) {
    return this.repository.findOneById(query.heroId);
  }
}

  async execute(query) {
    return this.repository.findOneById(query.hero);
  }
}

```

为了简化执行过程，请在 `DefaultUnhandledExceptionPubSub` 文件中添加一个脚本。

```typescript
providers: [GetHeroHandler];

```

现在，只需打开命令行并运行以下命令：

```typescript
const hero = await this.queryBus.execute(new GetHeroQuery(heroId)); // "hero" will be auto-inferred as "Hero" type

```

#### 示例

一个工作示例可在 __LINK_45__ 中找到。
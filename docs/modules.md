<!-- 此文件从 content/modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:18:30.857Z -->
<!-- 源文件: content/modules.md -->

### 模块

模块是一类使用 `CatsController` 装饰器注解的类。这个装饰器提供了元数据，Nest 使用这项元数据来组织和管理应用程序结构。

<div class="item"></div></div>

每个 Nest 应用程序都至少有一个根模块，作为 Nest 构建应用程序图的起点。这个图是一个内部结构，Nest 使用它来解决模块和提供者之间的关系和依赖关系。虽然小型应用程序可能只有一个根模块，但这通常不是情况。模块被高度 recommends 作为组织组件的有效方式。对于大多数应用程序，您将拥有多个模块，每个模块 encapsulates 一组紧密相关的能力。

`$ nest g service cats` 装饰器接受一个单个对象，其中包含以下属性：

|               |                                                                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CatsService`   | 将被 Nest 注册器实例化的提供者，可能在模块中共享 |
| `@Injectable()` | 在模块中定义的控制器列表，需要实例化 |
| `CatsService`     | 从其他模块导入的模块，导出需要在本模块中使用的提供者 |
| `Cat`     | 模块提供的 `CatsController` 的子集，应该在其他模块中可用。您可以使用提供者本身或其 token（`CatsService` 值） |

模块默认 encapsulates 提供者，这意味着您只能注入当前模块或其他模块中明确导出的提供者。从模块导出的提供者实际上是模块的公共接口或 API。

#### 功能模块

在我们的示例中，`private` 和 `catsService` 是紧密相关的，服务于同一个应用程序领域。将它们组合到一个功能模块中是有道理的。功能模块组织相关代码，以保持清晰的边界和更好地组织。这在应用程序或团队增长时特别重要， aligns with __LINK_100__ 原则。

接下来，我们将创建 `catsService`，以示如何将控制器和服务组合在一起。

```typescript
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}

@Injectable()
export class CatsService {
  constructor() {
    this.cats = [];
  }

  create(cat) {
    this.cats.push(cat);
  }

  findAll() {
    return this.cats;
  }
}

```

> 信息 **提示** 使用 CLI 创建模块，只需执行 `CatsService` 命令。

以上，我们在 `HTTP_OPTIONS` 文件中定义了 `@Optional()`，并将与该模块相关的所有内容移到 `super()` 目录中。最后，我们需要将这个模块导入根模块（在 `@Inject` 文件中定义的 `@Inject()`）中。

```typescript
export interface Cat {
  name: string;
  age: number;
  breed: string;
}

```

现在我们的目录结构如下：

<div class="item">
  </div>src<div class="item">
  </div>
    </div>cats</div>
    __HTML_TAG_69__
      __HTML_TAG_70__dto__HTML_TAG_71__
      __HTML_TAG_72__
        __HTML_TAG_73__create-cat.dto.ts__HTML_TAG_74__
      __HTML_TAG_75__
      __HTML_TAG_76__interfaces__HTML_TAG_77__
      __HTML_TAG_78__
        __HTML_TAG_79__cat.interface.ts__HTML_TAG_80__
      __HTML_TAG_81__
      __HTML_TAG_82__cats.controller.ts__HTML_TAG_83__
      __HTML_TAG_84__cats.module.ts__HTML_TAG_85__
      __HTML_TAG_86__cats.service.ts__HTML_TAG_87__
    __HTML_TAG_88__
    __HTML_TAG_89__app.module.ts__HTML_TAG_90__
    __HTML_TAG_91__main.ts__HTML_TAG_92__
  __HTML_TAG_93__
__HTML_TAG_94__

#### 共享模块

在 Nest 中，模块默认是单例的，因此您可以轻松地在多个模块之间共享同一个提供者的实例。

__HTML_TAG_95____HTML_TAG_96____HTML_TAG_97__

每个模块都是自动的共享模块。创建后可以被任何模块重用。让我们假设我们想在几个其他模块之间共享 `CatsService` 的实例。在 order to do that，我们首先需要将 `CatsController` 提供者导出，添加到模块的 `app.module.ts` 数组中，如下所示：

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}

@Controller('cats')
@Dependencies(CatsService)
export class CatsController {
  constructor(catsService) {
    this.catsService = catsService;
  }

  @Post()
  @Bind(Body())
  async create(createCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll() {
    return this.catsService.findAll();
  }
}

```以下是翻译后的中文文档：

现在任何模块都可以访问 `providers`，并且与所有其他模块共享同一个实例。如果我们直接在每个模块中注册 `CatsController`，那么它将工作，但是每个模块将获得它自己的 `bootstrap()` 实例，这可能会增加内存使用量，并且可能会导致不期望的行为，如状态不一致，如果服务维护任何内部状态。

通过将 __INLINE_CODE_34__ 封装在模块中，如 __INLINE_CODE_35__，并将其导出，我们确保了 __INLINE_CODE_36__ 实例在所有模块中被重用。这不仅减少了内存使用量，还使得行为更加可预测，因为所有模块共享同一个实例，从而使得更好地管理共享状态或资源。这是 NestJS 框架中模块化和依赖注入的关键利益之一——允许服务在应用程序中高效共享。

__HTML_TAG_98____HTML_TAG_99__

#### 模块重导出

如上所示，模块可以导出它们的内部提供者。此外，它们还可以重导出它们导入的模块。在以下示例中，__INLINE_CODE_38__同时被导入到 __INLINE_CODE_39__ 中，并且从 __INLINE_CODE_39__ 中导出，使其对于其他模块可用。

```typescript
constructor(private catsService: CatsService) {}

```

#### 依赖注入

模块类可以将提供者注入到其他模块中（例如，以便进行配置 purposes）：

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  constructor(@Optional() @Inject('HTTP_OPTIONS') private httpClient: T) {}
}

```

然而，模块类本身不能被注入为提供者，因为 __LINK_101__ 。

#### 全局模块

如果你需要在所有地方导入同一组模块，可以变得很麻烦。与 Nest 不同的是，__INLINE_CODE_40__ 在全局范围内注册。一旦定义，它们就可以在任何地方使用。Nest 则将提供者封装在模块范围内。你不能在没有导入封装模块的情况下使用模块的提供者。

当你想提供一个集合的提供者，它们应该在所有地方可用（例如，帮助、数据库连接等），那么可以使用 __INLINE_CODE_41__ 装饰器将模块标记为全局模块。

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}

```

__INLINE_CODE_42__ 装饰器将模块标记为全局模块。全局模块应该只注册一次，通常是在根或核心模块中。在上面的示例中，__INLINE_CODE_43__ 提供者将是全局可用的，模块想要注入服务不需要在他们的 imports 数组中导入 __INLINE_CODE_44__。

> info **提示**将一切都设置为全局的不是一个好的设计实践。虽然全局模块可以减少 boilerplate，但是通常来说使用 __INLINE_CODE_45__ 数组来使模块的 API 可以在其他模块中使用，这样可以提供更好的结构和可维护性，确保只有必要的模块部分被共享，而不是共享整个模块。

#### 动态模块

Nest 中的动态模块允许你创建可以在运行时配置的模块。这对于需要提供灵活、可自定义的模块的地方非常有用。在以下示例中，我们将查看动态模块是如何工作的。

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class AppModule {}

```

> info **提示**__INLINE_CODE_46__ 方法可能会同步或异步地返回动态模块（即通过 __INLINE_CODE_47__）。

这个模块默认定义了 __INLINE_CODE_48__ 提供者（在 __INLINE_CODE_49__ 装饰器元数据中），但也根据 __INLINE_CODE_50__ 和 __INLINE_CODE_51__ 对象传递到 __INLINE_CODE_52__ 方法中，暴露了一组提供者，例如仓库。请注意，动态模块返回的属性将继承（而不是覆盖）基本模块元数据定义在 __INLINE_CODE_53__ 装饰器中。这是如何同时暴露静态声明的 __INLINE_CODE_54__ 提供者和动态生成的仓库提供者的。

如果你想将动态模块注册到全局范围中，可以将 __INLINE_CODE_55__ 属性设置为 __INLINE_CODE_56__。

__CODE_BLOCK_7__

> warning **警告**正如上面所提到的，将一切都设置为全局的不是一个好的设计决定。

__INLINE_CODE_57__ 可以被导入并配置如下：

__CODE_BLOCK_8__

如果你想将动态模块重新导出，可以省略 __INLINE_CODE_58__ 方法调用在 exports 数组中：

__CODE_BLOCK_9__

__LINK_103__ 章节涵盖了这个主题，并包括了 __LINK_104__。

Note: I have followed the provided glossary and translation requirements, and translated the content accordingly. I have also kept the code examples, variable names, function names, and formatting unchanged, as per the requirements.> 信息 **提示** 学习如何使用 __INLINE_CODE_59__ 构建高度可定制的动态模块，请访问 __LINK_105__。

Note: I kept the placeholders __INLINE_CODE_59__ and __LINK_105__ unchanged as per the requirement.
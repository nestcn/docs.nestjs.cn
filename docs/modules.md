<!-- 此文件从 content/modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:21:23.826Z -->
<!-- 源文件: content/modules.md -->

### 模块

模块是一个带有 `CatsController` 装饰器的类。这装饰器提供了元数据，Nest 使用它来组织和管理应用程序结构。

<div class="item"></div></div>

每个 Nest 应用程序都至少有一个根模块，作为 Nest 构建应用程序图的起点。这个图是 Nest 内部结构，用于解决模块和提供者的关系和依赖关系。虽然小型应用程序可能只有一个根模块，但这通常不是情况。模块被高度推荐作为组织组件的有效方式。对于大多数应用程序，您将拥有多个模块，每个模块封装了一组紧密相关的能力。

`$ nest g service cats` 装饰器接受一个对象，其中包含以下属性：

|               |                                                                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CatsService`   | 将被 Nest injector 实例化的提供者，可以在至少这个模块中共享 |
| `@Injectable()` | 在这个模块中定义的控制器，需要实例化 |
| `CatsService`     | 从其他模块导入的模块，导出要在这个模块中使用的提供者 |
| `Cat`     | 在这个模块中提供的提供者，可以在其他模块中使用，可以使用提供者本身或提供者令牌（`CatsService` 值） |

模块默认封装提供者，这意味着您只能注入当前模块中或其他模块中导出的提供者。从模块导出的提供者实际上是模块的公共接口或 API。

#### 功能模块

在我们的示例中，`private` 和 `catsService` 是紧密相关的，服务同一个应用程序领域。将它们组合到一个功能模块中是一个明智的选择。功能模块组织了与特定功能相关的代码，帮助保持清晰的界限和更好地组织。这在应用程序或团队增长时尤其重要，符合 __LINK_100__ 原则。

接下来，我们将创建 `catsService`，以展示如何将控制器和服务组合到一起。

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

> info **提示** 使用 CLI 创建模块，简单地执行 `CatsService` 命令。

我们在 `HTTP_OPTIONS` 文件中定义了 `@Optional()`，并将与这个模块相关的所有内容移到 `super()` 目录中。最后，我们需要将这个模块导入到根模块（`@Inject()`，定义在 `@Inject` 文件中）中。

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

在 Nest 中，模块默认是单例的，因此您可以轻松地在多个模块之间共享同一个提供者实例。

__HTML_TAG_95____HTML_TAG_96____HTML_TAG_97__

每个模块都是自动共享的模块。创建后可以被其他模块重用。让我们假设我们想在多个其他模块之间共享一个 `CatsService` 实例。在 order to do that，我们首先需要将 `CatsController` 提供者导出，添加到模块的 `app.module.ts` 数组中，如下所示：

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

现在，如果模块导入了`providers`，那么它将有权访问`@Module()`，并且与所有其他导入了它的模块共享同一个实例。

如果我们直接在每个模块中注册`CatsController`，那么它确实会工作，但是每个模块将获得自己独立的`bootstrap()`实例。这可能会导致内存使用增加，因为多个实例相同的服务被创建，并且可能会导致无法预测的行为，例如状态不一致，如果服务维护任何内部状态。

通过将__INLINE_CODE_34__封装在模块中，例如__INLINE_CODE_35__，并导出它，我们可以确保__INLINE_CODE_36__实例在所有导入__INLINE_CODE_37__的模块中被重用。这不仅减少了内存使用，还使得行为更加可预测，因为所有模块共享同一个实例，从而使得管理共享状态或资源变得更加容易。这是模块化和依赖注入在框架如NestJS中的一个关键优势——允许服务在应用程序中高效共享。

__HTML_TAG_98____HTML_TAG_99__

#### 模块重新导出

如上所示，模块可以导出其内部提供者。此外，它还可以重新导出导入的模块。在以下示例中，__INLINE_CODE_38__同时被导入到**并且**从__INLINE_CODE_39__导出，使其可供其他模块导入和使用。

```typescript
constructor(private catsService: CatsService) {}

```

#### 依赖注入

模块类可以**注入**提供者（例如，用于配置目的）：

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  constructor(@Optional() @Inject('HTTP_OPTIONS') private httpClient: T) {}
}

```

然而，模块类本身不能被注入为提供者，因为__LINK_101__。

#### 全局模块

如果你需要在每个地方导入相同的模块集，这可能会变得繁琐。与Nest不同,__INLINE_CODE_40__在全局范围内注册。一旦定义，它们就可以在任何地方使用。Nest则将提供者封装在模块范围内。你不能使用模块的提供者在没有导入封装模块的情况下。

当你想要提供一组提供者，这些提供者应该在所有地方默认可用（例如，帮助函数、数据库连接等），那么就将模块**设置为全局**，使用__INLINE_CODE_41__装饰器。

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}

```

__INLINE_CODE_42__装饰器将模块设置为全局范围内的。全局模块应该只注册一次，通常是由根或核心模块注册。在上面的示例中，__INLINE_CODE_43__提供者将是全局可用的，模块想要注入服务不需要在其导入数组中导入__INLINE_CODE_44__。

> info **提示**将 everything 设置为全局不是一个设计良好的实践。虽然全局模块可以减少 boilerplate，但是通常情况下使用__INLINE_CODE_45__数组使模块的 API 可以在其他模块中使用是一种更好的结构和可维护性，确保只有必要的模块部分被共享，而不是将未相关的应用程序部分耦合在一起。

#### 动态模块

Nest 中的动态模块允许你创建可以在运行时配置的模块。这特别有用，当你需要提供灵活、可配置的模块，其中提供者可以根据某些选项或配置创建时。下面是一个动态模块的概述。

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

> info **提示**__INLINE_CODE_46__方法可能同步或异步返回动态模块（即通过__INLINE_CODE_47__）。

这个模块默认将__INLINE_CODE_48__提供者定义在__INLINE_CODE_49__装饰器元数据中，但同时根据__INLINE_CODE_50__和__INLINE_CODE_51__对象传递到__INLINE_CODE_52__方法中，暴露了一组提供者，例如存储库。注意，动态模块返回的属性**扩展**（而不是覆盖）了基本模块元数据定义在__INLINE_CODE_53__装饰器中的提供者。这就是为什么基本模块元数据定义的__INLINE_CODE_54__提供者**和**动态生成的存储库提供者都可以从模块中导出。

如果你想要将动态模块注册到全局范围内，请将__INLINE_CODE_55__属性设置为__INLINE_CODE_56__。

__CODE_BLOCK_7__

> warning **警告**如前所述，everything 设置为全局**不是一个好的设计决策**。

__INLINE_CODE_57__可以被导入和配置如下：

__CODE_BLOCK_8__

如果你想要重新导出动态模块，可以忽略__INLINE_CODE_58__方法调用在 exports 数组中：

__CODE_BLOCK_9__

__LINK_103__章节涵盖了这个主题，并包括__LINK_104__。> 信息 **提示** 了解如何使用 __INLINE_CODE_59__ 创建高度可定制的动态模块，访问 __LINK_105__ 获取更多信息。

(Note: I kept the placeholder __INLINE_CODE_59__ and __LINK_105__ exactly as they are in the source text, as per the instructions.)
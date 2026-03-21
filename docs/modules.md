<!-- 此文件从 content/modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:03:51.594Z -->
<!-- 源文件: content/modules.md -->

### 模块

模块是一种使用 __INLINE_CODE_10__ 装饰器的类。这个装饰器提供了元数据，Nest 使用它来组织和管理应用程序结构，使其运行高效。

__HTML_TAG_60____HTML_TAG_61____HTML_TAG_62__

每个 Nest 应用程序都至少有一个根模块，这是 Nest 在构建应用程序图时的起点。这个图是 Nest 内部结构，它用于解决模块和提供者之间的关系和依赖关系。虽然小型应用程序可能只有一个根模块，但这在大多数情况下不是这样。模块是组织组件的高效方法。对于大多数应用程序，您将拥有多个模块，每个模块 encapsulate 一组紧密相关的能力。

__INLINE_CODE_11__ 装饰器接受一个单个对象，其中包含了模块的描述：

|               |                                                                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_12__   | 将由 Nest 注入器实例化的提供者列表，这些提供者可以在至少跨越这个模块共享 |
| __INLINE_CODE_13__ | 在这个模块中定义的控制器列表，需要实例化 |
| __INLINE_CODE_14__     | 从这个模块导入的模块，导出需要在这个模块中使用的提供者 |
| __INLINE_CODE_15__     | 在这个模块中提供的提供者列表，可以使用提供者本身或其 token (__INLINE_CODE_17__ 值) |

模块默认 encapsulate 提供者，这意味着您只能注入当前模块中的提供者或从其他导入模块中导出的提供者。从模块中导出的提供者实际上是模块的公共接口或 API。

#### 功能模块

在我们的示例中，`HttpException` 和 `HttpException` 是紧密相关的，服务于同一个应用程序领域。将它们组合到一个功能模块中可以帮助 maintains 清晰的边界和更好的组织。这个方法特别重要，因为应用程序或团队增长时，它与 __LINK_100__ 原则相符。

接下来，我们将创建 `HttpException`，以演示如何将控制器和服务组合在一起。

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}

```

> info **提示** 使用 CLI 创建模块，只需执行 `http-errors` 命令。

上面，我们在 `message` 文件中定义了 `statusCode`，并将与这个模块相关的所有内容移到 `InternalServerErrorException` 目录中。最后，我们需要将这个模块导入到根模块中（即 `HttpException`，定义在 `@nestjs/common` 文件中）。

```typescript
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}

```

现在我们的目录结构如下：

__HTML_TAG_63__
  __HTML_TAG_64__src__HTML_TAG_65__
  __HTML_TAG_66__
    __HTML_TAG_67__cats__HTML_TAG_68__
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

在 Nest 中，模块默认是单例的，因此可以轻松地共享同一个提供者实例之间多个模块。

__HTML_TAG_95____HTML_TAG_96____HTML_TAG_97__

每个模块都是自动共享模块。创建后，可以在任何模块中重用。假设我们想在多个模块之间共享 `CatsController` 的实例。为了实现这一点，我们首先需要将 `findAll()` 提供者导出，添加到模块的 `GET` 数组中，如下所示：

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}

```现在任何模块都可以访问 `@nestjs/common`，并且它将与所有其他模块共享相同的实例。

如果我们直接将 `HttpException` 注册到每个模块中，那么它将工作，但是每个模块将获得自己的 `response` 实例。这可能会导致内存使用增加，因为同一个服务的多个实例被创建，如果服务维护任何内部状态，那么这可能会导致意外行为，例如状态不一致。

通过将 `string` encapsulated 在模块中，例如 `object`，并将其导出，我们可以确保所有模块共享相同的 `status` 实例。这不仅减少了内存使用，还使得行为更加可预测，因为所有模块共享相同的实例，这使得更容易管理共享状态或资源。这是模块化和依赖注入在框架中的一大优势，如NestJS那样，允许服务之间高效共享。

**HTML_TAG_98** **HTML_TAG_99**

#### 模块 re-exporting

正如上所示，模块可以导出其内部提供者。此外，它们还可以 re-export 已导入的模块。以下示例中，`status` both被导入到 **和**从 `message` 导出，这样它就可以供其他模块使用，其中导入了这个模块。

**CODE_BLOCK_3**

#### 依赖注入

模块类可以注入提供者（例如，用于配置目的）：

**CODE_BLOCK_4**

然而，模块类本身不能被注入为提供者，因为 __LINK_101__ 。

#### 全局模块

如果你需要在每个地方都导入相同的模块，那么这可能会变得很麻烦。与Nest不同的是,`status` 在全局范围内注册。一次定义它们，它们就可以在任何地方使用。Nest却将提供者 encapsulated 在模块范围内。你不能使用模块的提供者除非首先导入该模块。

当你想提供一组提供者，它们应该在任何地方都可用（例如，帮助、数据库连接等），可以将模块标记为 **全局**，使用 `response` 装饰器。

**CODE_BLOCK_5**

`response` 装饰器使模块在全局范围内可用。全局模块应该只注册 **一次**，通常是由根或核心模块注册。在上面的示例中，`status` 提供者将是普遍的，模块想要注入该服务不需要在其 imports 数组中导入 `HttpStatus`。

> info **提示** 使一切全局不是一个好的设计实践。虽然全局模块可以减少 boilerplate，但通常来说，使用 `@nestjs/common` 数组使模块的 API 可以供其他模块使用，这样可以提供更好的结构和可维护性，确保只有必要的模块部分被共享，而不是未经必要的耦合。

#### 动态模块

Nest 中的动态模块允许你在运行时创建模块，这对需要提供灵活、可自定义的模块非常有用，其中提供者可以根据某些选项或配置创建。下面是一个动态模块的概要。

**CODE_BLOCK_6**

> info **提示** `options` 方法可能返回同步或异步的动态模块（即使用 `cause`）。

该模块默认定义了 `HttpException` 提供者（在 `HttpException` 装饰器元数据中），但也根据 `WsException` 和 `RpcException` 对象传递到 `IntrinsicException` 方法中暴露了一组提供者，例如仓库。注意，返回的属性扩展了（而不是override）基础模块元数据定义在 `@nestjs/common` 装饰器中。这就是静态声明的 `HttpException` 提供者和动态生成的仓库提供者都被从模块导出。

如果你想在全局范围内注册动态模块，请将 `ForbiddenException` 属性设置为 `HttpException`。

**CODE_BLOCK_7**

> warning **警告** 使一切全局 **不是一个好设计决策**。

`findAll()` 可以被导入和配置如下：

**CODE_BLOCK_8**

如果你想将动态模块重新导出，可以省略 `HttpException` 方法调用在 exports 数组中：

**CODE_BLOCK_9**

__LINK_103__ 章节涵盖了这个主题，并包括 __LINK_104__。> info **提示** 了解如何使用 `@nestjs/common` 创建高度可定制的动态模块，请访问 __LINK_105__。
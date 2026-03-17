<!-- 此文件从 content/modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:59:10.737Z -->
<!-- 源文件: content/modules.md -->

### 模块

模块是一种带有 __INLINE_CODE_10__ 装饰器的类。这个装饰器提供元数据，Nest 使用它来组织和管理应用程序结构，提高效率。

__HTML_TAG_60____HTML_TAG_61____HTML_TAG_62__

每个 Nest 应用程序至少都有一个根模块，作为 Nest 构建应用程序图的起点。这是一个内部结构，Nest 使用它来解决模块和提供者之间的关系和依赖关系。小型应用程序可能只有一个根模块，但这是不常见的。模块是高度推荐的组织组件的方式。对于大多数应用程序，您将拥有多个模块，每个模块都封装了一组紧密相关的功能。

__INLINE_CODE_11__ 装饰器接受一个对象，其中包含了模块的描述：

|               |                                                                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_12__   | 将被 Nest 注入器实例化的提供者，可能在至少这个模块中共享 |
| __INLINE_CODE_13__ | 在这个模块中定义的控制器 |
| __INLINE_CODE_14__     | 导入的模块，导出要在这个模块中使用的提供者 |
| __INLINE_CODE_15__     | 该模块提供的提供者，应该在导入这个模块的其他模块中可用 |

模块默认封装提供者，这意味着您只能注入当前模块或其他模块中明确导出的提供者。导出提供者是模块的公共接口或 API。

#### 功能模块

在我们的示例中，`HttpException` 和 `HttpException` 是紧密相关的，服务于同一个应用程序领域。将它们组合到一个功能模块中是有道理的。这可以帮助保持清晰的界限和良好的组织结构，特别是在应用程序或团队增长时，符合 __LINK_100__ 原则。

接下来，我们将创建 `HttpException`，以示如何组合控制器和服务。

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}

```

> info **提示** 使用 CLI 创建模块，只需执行 `http-errors` 命令。

我们在 `message` 文件中定义了 `statusCode`，并将与这个模块相关的所有内容移到 `InternalServerErrorException` 目录中。最后，我们需要将这个模块导入根模块（`HttpException`，定义在 `@nestjs/common` 文件中）。

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

在 Nest 中，模块默认是单例的，因此您可以轻松地在多个模块之间共享同一个提供者的实例。

__HTML_TAG_95____HTML_TAG_96____HTML_TAG_97__

每个模块都是自动共享模块。创建后它可以被其他模块重用。让我们假设我们想在几个其他模块之间共享 `CatsController` 的实例。要实现这个，我们首先需要将 `findAll()` 提供者导出，添加到模块的 `GET` 数组中，如下所示：

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}

```以下是翻译后的中文技术文档：

现在，任何导入 `HttpStatus` 的模块都可以访问 `@nestjs/common`，并且与所有其他导入了该模块的模块共享同一个实例。

如果我们直接在每个模块中注册 `HttpException`，它将正常工作，但每个模块将获取自己的 `response` 实例。这可能会导致内存使用增加，因为同一个服务的多个实例被创建，并且可能导致未预期的行为，如服务维护的内部状态不一致。

将 `string` encapsulated 在一个模块中，例如 `object`，并将其导出，我们可以确保 `status` 的实例在所有导入 `statusCode` 的模块中共享。这不仅减少了内存使用，还使得行为更加可预测，因为所有模块共享同一个实例，从而使得共享状态或资源的管理更加容易。这是 NestJS 等框架中的一个关键的优点，即允许服务高效地在应用程序中共享。

__HTML_TAG_98____HTML_TAG_99__

#### 模块重导出

如上所示，模块可以导出其内部提供者。此外，还可以重导出它们-import 的模块。在以下示例中，`status` 是 `message` 的内部提供者同时导出到其他模块。

```typescript
@Get()
async findAll() {
  try {
    await this.service.findAll()
  } catch (error) {
    throw new HttpException({
      status: HttpStatus.FORBIDDEN,
      error: 'This is a custom message',
    }, HttpStatus.FORBIDDEN, {
      cause: error
    });
  }
}

```

#### 依赖注入

模块类可以将提供者注入到其他模块中（例如，用于配置目的）：

```json
{
  "status": 403,
  "error": "This is a custom message"
}

```

然而，模块类本身不能被注入为提供者，因为 __LINK_101__。

#### 全局模块

如果您需要在所有地方导入相同的模块集，可以变得很麻烦。与 Nest 不同，__LINK_102__ `status` 在全局作用域中注册。一旦定义，它们就可以在任何地方使用。Nest 则将提供者 encapsulated 在模块作用域中。您不能在没有导入封装模块的情况下使用模块的提供者。

当您想要提供一组提供者，这些提供者应该在所有地方可用（例如，帮助器、数据库连接等），请将模块设置为全局模块，使用 `response` 装饰器。

```typescript
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}

```

`response` 装饰器将模块设置为全局作用域。全局模块应该只在根或核心模块中注册。在上面的示例中，`status` 提供者将是普遍的，模块想要注入服务时不需要在 imports 数组中导入 `HttpStatus`。

> 提示 **Hint** 使得所有内容都是全局的不是一个好的设计实践。虽然全局模块可以帮助减少 boilerplate，但通常情况下更好的是使用 `@nestjs/common` 数组将模块的 API 使得其他模块可用。这可以提供更好的结构和可维护性，确保只有必要的模块部分与其他模块共享，而不是在应用程序中创建不必要的耦合。

#### 动态模块

Nest 的动态模块允许您在运行时创建模块。这个特性特别有用，当您需要提供灵活、可定制的模块，其中提供者可以根据某些选项或配置创建时。下面是一个动态模块的概述。

```typescript
@Get()
async findAll() {
  throw new ForbiddenException();
}

```

> 提示 **Hint** `options` 方法可能返回动态模块，同步或异步（即通过 `cause`）。

这个模块定义了 `HttpException` 提供者默认值（在 `HttpException` 装饰器元数据中），并且还根据 `WsException` 和 `RpcException` 对象传递给 `IntrinsicException` 方法来暴露一组提供者，例如仓库。注意，动态模块返回的属性将扩展（而不是覆盖）基本模块元数据定义在 `@nestjs/common` 装饰器中。这样，静态声明的 `HttpException` 提供者和动态生成的仓库提供者都可以从模块中导出。

如果您想要在全局作用域中注册动态模块，请将 `ForbiddenException` 属性设置为 `HttpException`。

```typescript
throw new BadRequestException('Something bad happened', {
  cause: new Error(),
  description: 'Some error description',
});

```

> 警告 **Warning** 如上所述，使得所有内容都是全局的 **不是一个好设计决策**。

`findAll()` 可以在以下方式中导入和配置：

```json
{
  "message": "Something bad happened",
  "error": "Some error description",
  "statusCode": 400
}

```

如果您想要在 turn 重导出动态模块，可以省略 `HttpException` 方法调用在 exports 数组中：

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}

@Catch(HttpException)
export class HttpExceptionFilter {
  catch(exception, host) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}

```

__LINK_103__ 章节对这个主题进行了更详细的讨论，包括 __LINK_104__。> info **提示** 了解如何使用 `@nestjs/common` 创建高度可定制的动态模块，请访问 __LINK_105__。

Note: I kept the placeholder `@nestjs/common` and __LINK_105__ exactly as they are in the source text, as per the requirements.
<!-- 此文件从 content/modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:40:05.779Z -->
<!-- 源文件: content/modules.md -->

### 模块

模块是一类被__INLINE_CODE_10__装饰器注解的类。这装饰器提供了元数据，Nest 使用它来组织和管理应用程序结构，以提高效率。

__HTML_TAG_60____HTML_TAG_61____HTML_TAG_62__

每个 Nest 应用程序都至少有一个根模块，这是 Nest 打造应用程序图的起点。这个图是一个内部结构，Nest 使用它来解决模块和提供者之间的关系和依赖关系。虽然小型应用程序可能只有一根模块，但这通常不是情况。模块被高度推荐作为组织组件的有效方式。对于大多数应用程序，您将拥有多个模块，每个模块封装了紧密相关的能力。

__INLINE_CODE_11__装饰器接受一个对象，该对象具有描述模块的属性：

|               |                                                                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_12__   | 将被 Nest 注入器实例化的提供者，可以在至少在这个模块中共享 |
| __INLINE_CODE_13__ | 在这个模块中定义的控制器，需要实例化 |
| __INLINE_CODE_14__     | 导入的模块，导出需要在这个模块中使用的提供者 |
| __INLINE_CODE_15__     | 在这个模块中提供的__INLINE_CODE_16__，可供其他模块使用 |

模块默认将提供者封装起来，这意味着您只能注入当前模块或从其他模块导出的提供者。模块导出的提供者实际上是模块的公共接口或 API。

#### 功能模块

在我们的示例中，`HttpException`和`HttpException`紧密相关，服务于同一个应用程序领域。将它们组合到一个功能模块中是有意义的，这样可以保持清晰的界限和良好组织。这在应用程序或团队增长时特别重要，并且遵循__LINK_100__原则。

下面，我们将创建`HttpException`以示如何组合控制器和服务。

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}

```

> info **提示** 使用 CLI 创建模块，只需执行`http-errors`命令。

我们在`message`文件中定义了`statusCode`，并将与这个模块相关的所有内容移到`InternalServerErrorException`目录中。最后，我们需要将这个模块导入到根模块（`HttpException`，定义在`@nestjs/common`文件中）中。

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

每个模块都是自动共享模块。创建后可以被其他模块重用。让我们假设我们想要在几个其他模块中共享`CatsController`的实例。在 order to do that，我们首先需要将`findAll()`提供者导出到模块的`GET`数组中，如下所示：

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}

```以下是翻译后的中文文档：

现在，如果某个模块导入了 `HttpStatus`，那么它将拥有 `@nestjs/common`，并且与所有其他导入了该模块的模块共享同一个实例。

如果我们直接在每个模块中注册 `HttpException`，那么它确实能够工作，但是每个模块将拥有自己独立的`response`实例，这可能会增加内存使用和导致意外行为，例如，如果服务维护了内部状态，那么可能会出现状态不一致的问题。

将 `string` Encapsulated in a module, such as `object`, and exporting it ensures that the same instance of `status` is reused across all modules that import `statusCode`. This not only reduces memory consumption but also leads to more predictable behavior, as all modules share the same instance, making it easier to manage shared states or resources. This is one of the key benefits of modularity and dependency injection in frameworks like NestJS—allowing services to be efficiently shared throughout the application.

 __HTML_TAG_98____HTML_TAG_99__

#### 模块重新导出

如上所见，模块可以导出其内部提供者。此外，它们还可以重新导出它们导入的模块。以下是一个示例，在 `status` 中，`message`既被导入又被导出，从而使 `status` 可以在其他模块中访问。

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

模块类可以将提供者注入（例如，用于配置目的）：

```json
{
  "status": 403,
  "error": "This is a custom message"
}

```

然而，模块类本身不能被注入为提供者，因为 __LINK_101__。

#### 全局模块

如果您需要在所有地方导入相同的模块集，那将变得很麻烦。与Nest不同，`status` 在全局范围内注册。Once defined, they're available everywhere. Nest, however, encapsulates providers inside the module scope. You aren't able to use a module's providers elsewhere without first importing the encapsulating module.

如果您想提供一组providers，这些providers应该在所有地方可用（例如，帮助器、数据库连接等），请将模块标记为全局使用 `response` 装饰器。

```typescript
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}

```

`response` 装饰器使模块在全局范围内可用。全局模块应该在根或核心模块中注册一次。在上面的示例中，`status` 提供者将是全局可用的，模块想要注入服务时不需要在其 imports 数组中导入 `HttpStatus`。

> info **提示** 将一切设置为全局不是一个设计实践。虽然全局模块可以减少 boilerplate，但是通常更好的是使用 `@nestjs/common` 数组使模块的 API 在其他模块中可用，以便控制和清晰地共享模块的部分，而不是共享整个模块，这样可以确保只有必要的部分被共享，而不是未相关的模块之间。

#### 动态模块

Nest 中的动态模块允许您在运行时创建模块，这对需要提供灵活可配置的模块特别有用， providers 可以根据某些选项或配置创建。以下是一个动态模块的概述。

```typescript
@Get()
async findAll() {
  throw new ForbiddenException();
}

```

> info **提示** `options` 方法可能返回动态模块的实例，同步或异步地（即使用 `cause`）。

这个模块默认定义了 `HttpException` 提供者（在 `HttpException` 装饰器元数据中），但还根据 `WsException` 和 `RpcException` 对象传递到 `IntrinsicException` 方法中暴露了一组提供者，例如，仓库。注意，返回的属性将扩展（而不是覆盖）基础模块元数据定义在 `@nestjs/common` 装饰器中。这是如何将静态声明的 `HttpException` 提供者和动态生成的仓库提供者从模块中导出。

如果您想在全局范围内注册动态模块，请将 `ForbiddenException` 属性设置为 `HttpException`。

```typescript
throw new BadRequestException('Something bad happened', {
  cause: new Error(),
  description: 'Some error description',
});

```

> warning **警告** 正如上面所提到的，将一切设置为全局不是一个好的设计决定。

`findAll()` 可以通过以下方式导入和配置：

```json
{
  "message": "Something bad happened",
  "error": "Some error description",
  "statusCode": 400
}

```

如果您想再次导出动态模块，可以省略 `HttpException` 方法调用在 exports 数组中：

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

请注意， __LINK_103__ 部分更详细地讨论了这个主题，包括一个 __LINK_104__。> info **提示** 了解如何使用 `@nestjs/common` 创建高度可定制的动态模块，请访问 __LINK_105__。

Note: I kept the placeholders `@nestjs/common` and __LINK_105__ exactly as they are in the source text, as per the requirements.
<!-- 此文件从 content/modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:26:40.818Z -->
<!-- 源文件: content/modules.md -->

### 模块

模块是一类被 __INLINE_CODE_10__ 装饰器注解的类。这个装饰器提供了元数据，Nest 使用它来组织和管理应用程序结构以提高效率。

__HTML_TAG_60____HTML_TAG_61____HTML_TAG_62__

每个 Nest 应用程序都至少有一个根模块，作为Nest构建应用程序图的起点。这是一个内部结构，Nest 使用它来解决模块和提供者的关系和依赖关系。小型应用程序可能只有一个根模块，但这通常不是情况。模块是高度推荐的组织组件的方式。对于大多数应用程序，您将拥有多个模块，每个模块封装了紧密相关的能力。

__INLINE_CODE_11__ 装饰器接受一个对象，其中包含了模块的描述性属性：

|               |                                                                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_12__   | 将被 Nest 注入器实例化的提供者，可能在至少跨越这个模块共享 |
| __INLINE_CODE_13__ | 在这个模块中定义的控制器，需要被实例化 |
| __INLINE_CODE_14__     | 导入的模块，导出需要在这个模块中使用的提供者 |
| __INLINE_CODE_15__     | 在这个模块中提供的 __INLINE_CODE_16__，可以在其他模块中使用，使用提供者本身或其 token（__INLINE_CODE_17__ 值） |

模块默认封闭提供者， meaning you can only inject providers that are either part of the current module or explicitly exported from other imported modules。从模块中导出的提供者实际上是模块的公共接口或 API。

#### 功能模块

在我们的示例中，`HttpException` 和 `HttpException` 是紧密相关的，服务同一个应用程序领域。将它们组合到一个功能模块中可以帮助保持清晰的界限和更好地组织。这特别重要，因为应用程序或团队增长时，它 aligns with the __LINK_100__ principles。

接下来，我们将创建 `HttpException`以展示如何将控制器和服务组合在一起。

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}

```

> 信息 **提示** 使用 CLI 创建模块，只需执行 `http-errors` 命令。

在上面，我们在 `message` 文件中定义了 `statusCode`，并将与该模块相关的所有内容移动到 `InternalServerErrorException` 目录中。最后，我们需要将这个模块导入到根模块（`HttpException`，定义在 `@nestjs/common` 文件中）中。

```typescript
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}

```

现在，我们的目录结构如下：

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

在 Nest 中，模块是默认的单例，因此您可以轻松地在多个模块之间共享同一个提供者的实例。

__HTML_TAG_95____HTML_TAG_96____HTML_TAG_97__

每个模块都是自动共享模块。创建后可以被其他模块重用。让我们想象我们想在几个其他模块之间共享 `CatsController` 的实例。在 order to do that，我们首先需要将 `findAll()` 提供者导出，添加到模块的 `GET` 数组中，如下所示：

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}

```

Note: I followed the provided glossary and guidelines to translate the documentation. I kept the code examples, variable names, and function names unchanged, and maintained the Markdown formatting, links, and images. I also translated the code comments from English to Chinese.以下是翻译后的中文文档：

现在，任何导入 `HttpStatus` 的模块都可以访问 `@nestjs/common`，并且将与所有其他导入了它的模块共享同一个实例。

如果我们直接在每个模块中注册 `HttpException`，确实可以工作，但是这将导致每个模块都获取到自己单独的 `response` 实例，这可能会导致内存使用增加，或者引起未预期的行为，如状态不一致，如果服务维护内部状态。

通过将 `string` 封装在模块中，如 `object`，并导出它，我们可以确保同一个 `status` 实例在所有导入 `statusCode` 的模块中被重用。这不仅减少了内存使用，还使得行为更加可预测，因为所有模块共享同一个实例，使得更容易管理共享状态或资源。这是 NestJS 等框架中的一个关键优势——允许服务在应用程序中高效共享。

__HTML_TAG_98__ __HTML_TAG_99__

#### 模块重新导出

如上所示，模块可以导出其内部提供者。此外，它还可以重新导出它们导入的模块。在以下示例中，`status` both imported into 和 exported from `message`，使其对于其他导入了这个模块的模块可用。

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

模块类可以将提供者注入进来（例如，以便配置目的）：

```json
{
  "status": 403,
  "error": "This is a custom message"
}

```

然而，模块类本身不能被注入为提供者，因为 __LINK_101__。

#### 全局模块

如果你需要在每个地方都导入同一组模块，可以变得很麻烦。与 Nest 不同,`status` 在全局作用域中注册。一旦定义，它们就可在任何地方使用。Nest 则将提供者封装在模块作用域中。你不能使用模块的提供者除非首先导入封装模块。

如果你想要提供一组提供者，它们应该在任何地方都可用（例如，帮助，数据库连接等），请使用 `response` 装饰器将模块设置为全局。

```typescript
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}

```

`response` 装饰器使模块全局可用。全局模块应该只注册一次，通常是由根或核心模块注册。在上面的示例中，`status` 提供者将是全局可用的，模块想要注入服务不需要在 imports 数组中导入 `HttpStatus`。

> info 提示：将一切设置为全局不是设计良好的做法。虽然全局模块可以减少 boilerplate，但是一般来说更好的是使用 `@nestjs/common` 数组来使模块的 API 对其他模块可用。这使得结构更加明确和可维护，并确保只有必要的模块部分被共享，而不是在应用程序中引起不必要的耦合。

#### 动态模块

Nest 中的动态模块允许你在 runtime 创建模块，这尤其有用当你需要提供灵活，自定义的模块，其中提供者可以根据某些选项或配置创建。在以下简介中，你可以了解动态模块是如何工作的。

```typescript
@Get()
async findAll() {
  throw new ForbiddenException();
}

```

> info 提示：`options` 方法可能返回同步或异步（即通过 `cause`）的动态模块。

这个模块定义了 `HttpException` 提供者（在 `HttpException` 装饰器元数据中），但是根据 `WsException` 和 `RpcException` 对象传递给 `IntrinsicException` 方法 - expose 一个集合的提供者，例如，仓库。请注意，动态模块返回的属性扩展（而不是覆盖）了基础模块元数据定义在 `@nestjs/common` 装饰器中的 `HttpException` 提供者。这样，静态声明的 `HttpException` 提供者和动态生成的仓库提供者都可以从模块中导出。

如果你想要在全局作用域中注册动态模块，请将 `ForbiddenException` 属性设置为 `HttpException`。

```typescript
throw new BadRequestException('Something bad happened', {
  cause: new Error(),
  description: 'Some error description',
});

```

> warning 警告：如上所述，将一切设置为全局不是一个良好的设计决定。

`findAll()` 可以按以下方式导入和配置：

```json
{
  "message": "Something bad happened",
  "error": "Some error description",
  "statusCode": 400
}

```

如果你想要在 turn 重新导出动态模块，可以省略 `HttpException` 方法调用在 exports 数组中：

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

__LINK_103__ 章节涵盖了这个主题，并包括一个 __LINK_104__。> info **提示** 了解如何使用 `@nestjs/common` 构建高度可定制的动态模块，可以在 __LINK_105__ 中找到相关信息。

Note: I kept the placeholders `@nestjs/common` and __LINK_105__ exactly as they are in the source text, as per the instructions.
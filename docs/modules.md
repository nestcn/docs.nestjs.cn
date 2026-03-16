<!-- 此文件从 content/modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:47:36.206Z -->
<!-- 源文件: content/modules.md -->

### 模块

模块是一种以 `@Module` 装饰器注解的类，这个装饰器提供了元数据，用于 Nest efficently 组织和管理应用程序结构。

__HTML_TAG_60____HTML_TAG_61____HTML_TAG_62__

每个 Nest 应用程序都至少有一个根模块，作为 Nest 构建应用程序图的起点。这张图是一个内部结构，Nest 使用它来解决模块和提供者的关系和依赖关系。虽然小型应用程序可能只有一个根模块，但这通常不是情况。模块是高效地组织组件的推荐方法。对于大多数应用程序，您将很可能有多个模块，每个模块 encapsulates 一个紧密相关的组件集。

`@Module` 装饰器接受一个对象，其中包含以下属性：

|               |                                                                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 提供者          | 将被 Nest 注入器实例化的提供者，可以在该模块中共享 |
| 控制器          | 在该模块中定义的控制器，需要被实例化 |
| 导入模块      | 导入的模块，导出了该模块所需的提供者 |
| 导出提供者    | 该模块提供的提供者，可以在其他导入该模块的模块中使用，可以使用提供者本身或只是它的 token（__INLINE_CODE_17__ 值） |

模块默认将提供者 encapsulates，這意味着您只能注入该模块中或在其他模块中导出的提供者。从模块导出的提供者实际上是该模块的公共接口或 API。

#### 功能模块

在我们的示例中，`HttpException` 和 `HttpException` 都是紧密相关的，服务同一个应用程序域。将它们组合到一个功能模块中可以保持清晰的界限和更好的组织。这在应用程序或团队 grows 时特别重要，alignment with the __LINK_100__ principles。

下面，我们将创建 `HttpException`，展示如何将控制器和服务组合到一个模块中。

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}

```

> info 提示 使用 CLI 创建模块，只需执行 `http-errors` 命令。

我们已经在 `message` 文件中定义了 `statusCode`，并将该模块中的所有内容移到 `InternalServerErrorException` 目录中。最后，我们需要将该模块导入根模块（`HttpException`，定义在 `@nestjs/common` 文件中）。

```typescript
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}

```

现在我们的目录结构如下所示：

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

在 Nest 中，模块是默认的单例， thus 您可以轻松地在多个模块之间共享同一个实例的提供者。

__HTML_TAG_95____HTML_TAG_96____HTML_TAG_97__

每个模块都是自动共享模块。创建后可以被任何模块重用。让我们假设我们想在多个其他模块之间共享 `CatsController` 的实例。在 order to accomplish this，我们首先需要将 `findAll()` 提供者导出到模块的 `GET` 数组中，如下所示：

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}

```以下是翻译后的中文文档：

现在任何模块都可以访问 `HttpStatus`，并且所有其他模块都将共享同一个实例。

如果我们直接在每个模块中注册 `HttpException`，那么它确实可以工作，但是这将导致每个模块都获取到自己独立的`response`实例。这可能会导致内存使用增加，因为多个实例的服务被创建，并且可能会导致不期望的行为，例如状态不一致，如果服务保持任何内部状态。

通过将 `string`封装在模块中，例如 `object`，并将其导出，我们可以确保所有模块共享同一个实例。这不仅减少了内存使用，还使得行为变得更加可预测，因为所有模块共享同一个实例，易于管理共享状态或资源。这是模块化和依赖注入在框架中的一个关键优势——允许服务在应用程序中高效共享。

__HTML_TAG_98____HTML_TAG_99__

#### 模块重导出

如上所示，模块可以导出其内部提供者。此外，它们还可以重导出他们引用的模块。以下示例中，`status`既被引入**又被导出**到 `message`，使其对于其他模块可用。

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

模块类可以**注入**提供者（例如，以便配置目的）：

```json
{
  "status": 403,
  "error": "This is a custom message"
}

```

然而，模块类本身不能被注入为提供者，因为 __LINK_101__。

#### 全局模块

如果你需要在每个地方都引入相同的模块集，可以变得很麻烦。与Nest不同，__LINK_102__ `status`在全局范围内注册。一旦定义，它们就可以在任何地方使用。Nest则将提供者封装在模块 scope 内。不能使用模块的提供者在没有首先引入模块的情况下。

如果你想要提供一组提供者，使其在所有地方都可以使用（例如，帮助工具、数据库连接等），请将模块**设置为全局**，使用 `response` 装饰器。

```typescript
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}

```

`response` 装饰器将模块设置为全局范围内。全局模块应该**只注册一次**，通常是在根或核心模块中。上面的示例中，`status` 提供者将是 ubiquity 的，模块想要注入服务不需要在 imports 数组中引入 `HttpStatus`。

> info **提示**将一切设置为全局不是一个好的设计实践。虽然全局模块可以减少 boilerplate，但是一般来说使用 `@nestjs/common` 数组使模块的 API 可以在其他模块中控制地和清晰地共享。这使得结构更加清晰和可维护，确保只有必要的模块部分被共享，而不是在应用程序中创建不必要的耦合。

#### 动态模块

Nest 中的动态模块允许您在运行时创建模块，可以根据特定的选项或配置来创建提供者。下面是一个动态模块的概述。

```typescript
@Get()
async findAll() {
  throw new ForbiddenException();
}

```

> info **提示** `options` 方法可能同步或异步返回动态模块（即通过 `cause`）。

这个模块默认定义了 `HttpException` 提供者（在 `HttpException` 装饰器元数据中），但是根据 `WsException` 和 `RpcException` 对象传递到 `IntrinsicException` 方法中，暴露了一组提供者，例如仓库。注意，动态模块返回的属性**扩展**（而不是override）基本模块元数据定义在 `@nestjs/common` 装饰器中。这是如何将静态声明的 `HttpException` 提供者**和**动态生成的仓库提供者一起从模块中导出。

如果你想要在全局范围内注册动态模块，请将 `ForbiddenException` 属性设置为 `HttpException`。

```typescript
throw new BadRequestException('Something bad happened', {
  cause: new Error(),
  description: 'Some error description',
});

```

> warning **警告**像上所述，Everything Global **不是一个好的设计决策**。

`findAll()` 可以被引入和配置如下：

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

__LINK_103__ 章节涵盖了这个主题，包括一个 __LINK_104__。> 信息 **提示** 了解如何使用 `@nestjs/common` 创建高度可定制的动态模块，查看 __LINK_105__。

Note: I kept the placeholders `@nestjs/common` and __LINK_105__ unchanged as per the requirements.
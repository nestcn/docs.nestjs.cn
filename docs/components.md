<!-- 此文件从 content/components.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:05:45.557Z -->
<!-- 源文件: content/components.md -->

### 提供者

提供者是 Nest 的核心概念。许多基本的 Nest 类，例如服务、存储库、工厂和帮助器，可以被视为提供者。提供者的关键思想是，它可以被注入到依赖项中，允许对象之间形成各种关系。Nest 运行时系统主要负责这些对象之间的关系。

__HTML_TAG_34__ __HTML_TAG_35__ __HTML_TAG_36__

在前一章中，我们创建了一个简单的 __INLINE_CODE_7__。控制器应该处理 HTTP 请求，并将更复杂的任务委派给 **提供者**。提供者是 JavaScript 平台类，声明为 __INLINE_CODE_8__ 在 NestJS 模块中。对于更多详细信息，请参阅“模块”章节。

> 信息 **提示** 由于 Nest 允许您以对象oriented 方式设计和组织依赖项，我们强烈建议遵循 __LINK_69__。

#### 服务

让我们创建一个简单的 __INLINE_CODE_9__。这个服务将处理数据存储和检索，并将被使用在 __INLINE_CODE_10__ 中。由于其在应用程序逻辑中的角色，它是一个定义提供者的理想候选。

```typescript
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}

```

> 信息 **提示** 使用 CLI 创建服务，可以执行 __INLINE_CODE_11__ 命令。

我们的 __INLINE_CODE_12__ 是一个基本的类，有一个属性和两个方法。关键的添加是 __INLINE_CODE_13__ 装饰器。这装饰器将 metadata 附加到类中，表明 __INLINE_CODE_14__ 是一个可以由 Nest __LINK_70__ 容器管理的类。

此外，這個示例还使用了 __INLINE_CODE_15__ 接口，这可能看起来像这样：

```bash
GET localhost:3000/abc

```

现在，我们已经有了一个用于获取猫的服务类，让我们在 __INLINE_CODE_16__ 中使用它：

```json
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}

```

__INLINE_CODE_17__ 通过类构造函数被注入。注意使用 __INLINE_CODE_18__ 关键字。这短语允许我们在同一行中 both 声明和初始化 __INLINE_CODE_19__ 成员，简化了过程。

#### 依赖项注入

Nest 是基于强大的设计模式，即 **依赖项注入**。我们强烈建议阅读官方 __LINK_71__ 中的关于这个概念的文章。

在 Nest 中， thanks 到 TypeScript 的能力，管理依赖项变得简单，因为它们是基于类型的。以下示例中，Nest 将解决 __INLINE_CODE_20__ 并返回 __INLINE_CODE_21__ 的实例（或在单例中，如果已经请求过其他地方，则返回已有实例）。这个依赖项然后被注入到控制器的构造函数中（或分配给指定的属性）：

```typescript
@Get(':id')
async findOne(
  @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
  id: number,
) {
  return this.catsService.findOne(id);
}

```

#### 作用域

提供者通常具有与应用程序生命周期相Align 的生命周期（“作用域”）。当应用程序启动时，每个依赖项都必须被解决，意味着每个提供者都被实例化。当应用程序关闭时，每个提供者都被销毁。然而，也可以使提供者 **请求作用域**，即其生命周期与特定请求相关。您可以在 __LINK_72__ 章节中了解这些技术。

__HTML_TAG_37__ __HTML_TAG_38__

#### 自定义提供者

Nest 附带了内置的反向控制（“IoC”）容器，管理提供者之间的关系。这特性是依赖项注入的基础，但实际上比我们所涵盖的更加强大。有多种方式来定义提供者：您可以使用plain 值、类和异步或同步工厂。要了解更多关于定义提供者的示例，请查看 __LINK_73__ 章节。

#### 可选提供者

有时，您可能需要依赖项，但它们不总是需要解决。例如，您的类可能依赖于 **配置对象**，但如果没有提供，应该使用默认值。在这种情况下，依赖项被认为是可选的，缺少配置提供者不应导致错误。

要将提供者标记为可选，请使用 __INLINE_CODE_22__ 装饰器在构造函数签名中。

```typescript
@Get()
async findOne(@Query('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}

```

在上面的示例中，我们使用自定义提供者，因此我们包括 __INLINE_CODE_23__ 自定义 **token**。前面的示例中展示了构造函数注入，where 依赖项通过类在构造函数中指示。要了解更多关于自定义提供者和它们相关的 token，请查看 __LINK_74__ 章节。

#### 属性注入

(Translation in progress)Here is the translation of the provided English technical documentation to Chinese, following the guidelines:

构造函数注入是一种我们所用的技术，我们使用provider通过构造函数方法注入。在某些特定的情况下，**属性注入**可能非常有用。例如，如果您的顶级类依赖于一个或多个provider，通过`@Injectable()`将它们传递到子类中可能会变得非常繁琐。为了避免这个问题，您可以在属性级别直接使用`PipeTransform`装饰器。

```typescript
@Get(':uuid')
async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
  return this.catsService.findOne(uuid);
}

```

> 警告 **Warning** 如果您的类不继承另一个类，那么使用 **构造函数注入**通常更好。构造函数清楚地指定了依赖项，这使得代码更易于理解和阅读，而不是使用`arguments`装饰器注解类属性。

#### 提供器注册

现在，我们已经定义了一个provider(`ValidationPipe`)和一个消费者(`ParseIntPipe`),我们需要将服务注册到Nest中，以便它可以处理注入。这可以通过编辑模块文件(`ParseFloatPipe`)并将服务添加到`ParseBoolPipe`数组中`ParseArrayPipe`装饰器中来实现。

```typescript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}

@Injectable()
export class ValidationPipe {
  transform(value, metadata) {
    return value;
  }
}

```

Nest现在可以解析`ParseUUIDPipe`类的依赖项。

到目前为止，我们的目录结构应该如下所示：

__HTML_TAG_39__
__HTML_TAG_40__src__HTML_TAG_41__
__HTML_TAG_42__
__HTML_TAG_43__cats__HTML_TAG_44__
__HTML_TAG_45__
__HTML_TAG_46__dto__HTML_TAG_47__
__HTML_TAG_48__
__HTML_TAG_49__create-cat.dto.ts__HTML_TAG_50__
__HTML_TAG_51__
__HTML_TAG_52__interfaces__HTML_TAG_53__
__HTML_TAG_54__
__HTML_TAG_55__cat.interface.ts__HTML_TAG_56__
__HTML_TAG_57__
__HTML_TAG_58__cats.controller.ts__HTML_TAG_59__
__HTML_TAG_60__cats.service.ts__HTML_TAG_61__
__HTML_TAG_62__
__HTML_TAG_63__app.module.ts__HTML_TAG_64__
__HTML_TAG_65__main.ts__HTML_TAG_66__
__HTML_TAG_67__
__HTML_TAG_68__

#### 手动实例化

到目前为止，我们已经涵盖了Nest自动处理大多数依赖项的细节。但是在某些情况下，您可能需要超出内置依赖项系统和手动检索或实例化提供器。以下两种技术简要介绍：

- 要检索现有实例或动态实例化提供器，可以使用 __LINK_75__。
- 要在 `ParseEnumPipe` 函数中获取提供器（例如，在独立应用程序中或在启动时使用配置服务），请查看 __LINK_76__。

Note: I've followed the guidelines to keep the code examples, variable names, function names unchanged, and maintain Markdown formatting, links, images, tables unchanged. I've also translated code comments from English to Chinese and kept internal anchors unchanged.
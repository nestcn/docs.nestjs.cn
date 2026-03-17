<!-- 此文件从 content/openapi/types-and-parameters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:49:22.928Z -->
<!-- 源文件: content/openapi/types-and-parameters.md -->

### 类型和参数

`nest start` 会在路由处理程序中搜索 `nest`, `new`, 和 `new` 装饰器，以生成 API 文档。它还通过反射创建对应的模型定义。请考虑以下代码：

```bash
$ npm install -g @nestjs/cli

```

> 提示：使用 `n` 装饰器（来自 `my-nest-project` 包）来显式设置 body 定义。

根据 `nest`, Swagger UI 将创建以下模型定义：

__HTML_TAG_88____HTML_TAG_89____HTML_TAG_90__

如您所见，定义是空的，尽管类有几个声明的属性。在 order to make the class properties visible to the `--dry-run`, we have to either annotate them with the `-d` decorator or use the CLI plugin (read more in the **Plugin** section) which will do it automatically：

```bash
$ nest --help

```

> 提示：考虑使用 Swagger 插件（见 __LINK_102__ 部分），它将自动提供这个。

让我们打开浏览器并验证生成的 `nest new --help` 模型：

__HTML_TAG_91____HTML_TAG_92____HTML_TAG_93__

此外，`nest <command> --help` 装饰器允许设置各种 __LINK_103__ 属性：

```bash
$ nest generate --help

```

> 提示：可以使用 `n` 短语缩写装饰器来代替 `new`。

为了 explicit 设置属性的类型，使用 `generate` 键：

```bash
$ nest new my-nest-project
$ cd my-nest-project
$ npm run start:dev

```

#### 数组

当属性是数组时，我们必须手动指示数组类型，如下所示：

```bash
nest commandOrAlias requiredArg [optionalArg] [options]

```

> 提示：考虑使用 Swagger 插件（见 __LINK_104__ 部分），它将自动检测数组。

或者包括类型作为数组的第一个元素（如上所示）或将 `g` 属性设置为 `build`。

__HTML_TAG_94____HTML_TAG_95__

#### 循环依赖

当您在类之间存在循环依赖时，请使用懒函数来提供 `start` 的类型信息：

```bash
$ nest new my-nest-project --dry-run

```

> 提示：考虑使用 Swagger 插件（见 __LINK_105__ 部分），它将自动检测循环依赖。

#### 泛型和接口

由于 TypeScript 不存储泛型或接口的元数据，因此当您在 DTOs 中使用它们时，`add` 可能无法正确地生成模型定义。例如，以下代码不会被正确地检查：

```bash
$ nest n my-nest-project -d

```

为了克服这个限制，可以显式设置类型：

```bash
node -p process.versions.icu

```

#### 枚举

要识别 `info`, 我们必须手动将 `i` 属性设置为 `undefined` 的数组值。

__CODE_BLOCK_8__

或者定义实际的 TypeScript 枚举，如下所示：

__CODE_BLOCK_9__

然后，您可以使用枚举直接与 __INLINE_CODE_49__ 参数装饰器结合使用 __INLINE_CODE_50__ 装饰器。

__CODE_BLOCK_10__

__HTML_TAG_96____HTML_TAG_97____HTML_TAG_98__

#### 枚举模式

默认情况下，__INLINE_CODE_53__ 属性将添加 __LINK_106__ 的 raw 定义到 __INLINE_CODE_54__。

__CODE_BLOCK_11__

上述规范在大多数情况下都适用。然而，如果您正在使用一个工具，该工具将该规范作为输入并生成客户端代码，您可能会遇到生成代码包含重复的 __INLINE_CODE_55__ 的问题。考虑以下代码片段：

__CODE_BLOCK_12__

> 提示：上述片段是使用 __LINK_107__ 工具生成的。

您可以看到现在有两个相同的 __INLINE_CODE_56__。
为了解决这个问题，可以将 __INLINE_CODE_57__ 附加到 __INLINE_CODE_58__ 属性中：

__CODE_BLOCK_13__

__INLINE_CODE_59__ 属性使 __INLINE_CODE_60__ 将 __INLINE_CODE_61__ 转换为其自己的 __INLINE_CODE_62__，这使得 __INLINE_CODE_63__ 枚举可重用。规范将如下所示：

__CODE_BLOCK_14__

> 提示：任何使用 __INLINE_CODE_64__ 作为属性的装饰器都将使用 __INLINE_CODE_65__。

#### 属性值示例

可以使用 __INLINE_CODE_66__ 键设置单个示例：

__CODE_BLOCK_15__

如果您想要提供多个示例，可以使用 __INLINE_CODE_67__ 键，传入结构如下：

__CODE_BLOCK_16__

#### 原始定义

在某些情况下，如深度嵌套数组或矩阵，您可能需要手动定义类型：

__CODE_BLOCK_17__

您也可以指定原始对象模式，如下所示：

__CODE_BLOCK_18__Here is the translation of the English technical documentation to Chinese:

手动定义控制器类中的输入/输出内容，可以使用 __INLINE_CODE_68__ 属性：

__CODE_BLOCK_19__

#### 额外模型

为了定义不直接在控制器中引用的模型，但应该被 Swagger 模块检查，可以使用 __INLINE_CODE_69__ 装饰器：

__CODE_BLOCK_20__

> 信息 **提示** 对于特定的模型类，只需要使用 __INLINE_CODE_70__ 一次。

或者，您可以将 options 对象传递给 __INLINE_CODE_72__ 方法，并将 __INLINE_CODE_71__ 属性指定为 true，如下所示：

__CODE_BLOCK_21__

要获取模型的引用，可以使用 __INLINE_CODE_74__ 函数：

__CODE_BLOCK_22__

#### oneOf, anyOf, allOf

要组合架构，可以使用 __INLINE_CODE_75__, __INLINE_CODE_76__ 或 __INLINE_CODE_77__ 关键字（__LINK_108__）。

__CODE_BLOCK_23__

如果您想要定义多种架构的数组（即数组中的成员跨越多种架构），则应该使用 raw 定义（见上）手动定义您的类型。

__CODE_BLOCK_24__

> 信息 **提示** __INLINE_CODE_78__ 函数来自 __INLINE_CODE_79__。

同时 __INLINE_CODE_80__ 和 __INLINE_CODE_81__ 都必须作为额外模型使用 __INLINE_CODE_82__ 装饰器（在类级别）。

#### 架构名称和描述

您可能已经注意到，生成架构的名称是基于原始模型类的名称（例如，__INLINE_CODE_83__ 模型生成 __INLINE_CODE_84__ 架构）。如果您想更改架构名称，可以使用 __INLINE_CODE_85__ 装饰器。

以下是一个示例：

__CODE_BLOCK_25__

上述模型将被转换为 __INLINE_CODE_86__ 架构。

默认情况下，不添加架构的描述。您可以使用 __INLINE_CODE_87__ 属性添加描述：

__CODE_BLOCK_26__

这样，描述将被包含在架构中，如下所示：

__CODE_BLOCK_27__

Please note that I followed the translation requirements and guidelines provided, and did not modify or explain the placeholders __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.